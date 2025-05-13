// SDK Analysis Tool
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Configuration
const config = {
    srcDir: path.resolve(__dirname, '../../src'),
    outputFile: path.resolve(__dirname, 'sdk-analysis.json'),
    debug: true
};

// Helper to log debug messages
const debug = (...args) => {
    if (config.debug) {
        console.log('[Analysis]', ...args);
    }
};

// Helper to get JSDoc comments
function getJSDocComments(node, sourceFile) {
    const jsDoc = node.jsDoc;
    if (!jsDoc) return '';
    return jsDoc.map(doc => doc.getText(sourceFile)).join('\n');
}

// Helper to get method category based on name and documentation
function categorizeMethod(name, documentation) {
    const categories = {
        auth: ['login', 'logout', 'verify', 'token', 'torus', 'auth'],
        vault: ['vault', 'create', 'update', 'delete', 'get'],
        transaction: ['sign', 'send', 'broadcast', 'psbt', 'transaction', 'tx'],
        balance: ['balance', 'amount', 'total'],
        utility: ['util', 'helper', 'format', 'convert'],
        encryption: ['encrypt', 'decrypt', 'key', 'cipher']
    };

    name = name.toLowerCase();
    documentation = documentation.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => name.includes(keyword) || documentation.includes(keyword))) {
            return category;
        }
    }

    return 'other';
}

// Helper to extract type information
function getTypeInfo(node, sourceFile) {
    if (ts.isTypeReferenceNode(node)) {
        return {
            name: node.typeName.getText(sourceFile),
            typeArguments: node.typeArguments 
                ? node.typeArguments.map(arg => getTypeInfo(arg, sourceFile))
                : []
        };
    } else if (ts.isUnionTypeNode(node)) {
        return {
            type: 'union',
            types: node.types.map(type => getTypeInfo(type, sourceFile))
        };
    } else if (ts.isArrayTypeNode(node)) {
        return {
            type: 'array',
            elementType: getTypeInfo(node.elementType, sourceFile)
        };
    } else {
        return node.getText(sourceFile);
    }
}

// Parse a TypeScript file and extract method information
function analyzeFile(filePath) {
    debug('Analyzing file:', filePath);
    
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const sourceFile = ts.createSourceFile(
            filePath,
            fileContent,
            ts.ScriptTarget.Latest,
            true
        );

        const analysis = {
            methods: [],
            interfaces: [],
            types: [],
            relationships: []
        };
        
        function visit(node) {
            // Track parent class/interface for relationship mapping
            let currentParent = null;
            
            if (ts.isClassDeclaration(node)) {
                currentParent = {
                    type: 'class',
                    name: node.name ? node.name.getText(sourceFile) : '<anonymous>',
                    heritage: node.heritageClauses?.map(h => h.getText(sourceFile)) || []
                };
            } else if (ts.isInterfaceDeclaration(node)) {
                const interfaceInfo = {
                    name: node.name.getText(sourceFile),
                    heritage: node.heritageClauses?.map(h => h.getText(sourceFile)) || [],
                    methods: [],
                    properties: []
                };

                // Extract interface methods and properties
                node.members.forEach(member => {
                    if (ts.isMethodSignature(member)) {
                        interfaceInfo.methods.push({
                            name: member.name.getText(sourceFile),
                            parameters: member.parameters.map(p => ({
                                name: p.name.getText(sourceFile),
                                type: p.type ? getTypeInfo(p.type, sourceFile) : 'any'
                            })),
                            returnType: member.type ? getTypeInfo(member.type, sourceFile) : 'any',
                            documentation: getJSDocComments(member, sourceFile)
                        });
                    } else if (ts.isPropertySignature(member)) {
                        interfaceInfo.properties.push({
                            name: member.name.getText(sourceFile),
                            type: member.type ? getTypeInfo(member.type, sourceFile) : 'any',
                            documentation: getJSDocComments(member, sourceFile)
                        });
                    }
                });

                analysis.interfaces.push(interfaceInfo);
            } else if (ts.isTypeAliasDeclaration(node)) {
                analysis.types.push({
                    name: node.name.getText(sourceFile),
                    type: getTypeInfo(node.type, sourceFile),
                    documentation: getJSDocComments(node, sourceFile)
                });
            }

            // Handle methods and functions
            if (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) {
                const documentation = getJSDocComments(node, sourceFile);
                const name = node.name ? node.name.getText(sourceFile) : '<anonymous>';
                
                const methodInfo = {
                    name,
                    parameters: node.parameters.map(p => ({
                        name: p.name.getText(sourceFile),
                        type: p.type ? getTypeInfo(p.type, sourceFile) : 'any',
                        optional: p.questionToken ? true : false,
                        defaultValue: p.initializer ? p.initializer.getText(sourceFile) : undefined
                    })),
                    returnType: node.type ? getTypeInfo(node.type, sourceFile) : 'any',
                    documentation,
                    category: categorizeMethod(name, documentation),
                    async: node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false,
                    visibility: node.modifiers?.find(m => 
                        m.kind === ts.SyntaxKind.PublicKeyword || 
                        m.kind === ts.SyntaxKind.PrivateKeyword || 
                        m.kind === ts.SyntaxKind.ProtectedKeyword
                    )?.getText(sourceFile) || 'public'
                };

                // Add relationship if method belongs to a class/interface
                if (currentParent) {
                    analysis.relationships.push({
                        type: 'member',
                        from: currentParent.name,
                        to: name
                    });
                }

                analysis.methods.push(methodInfo);
            }

            ts.forEachChild(node, visit);
        }

        visit(sourceFile);
        return analysis;
    } catch (error) {
        debug('Error analyzing file:', filePath, error);
        return {
            methods: [],
            interfaces: [],
            types: [],
            relationships: []
        };
    }
}

// Main analysis function
async function analyzeSDK() {
    debug('Starting SDK analysis...');
    
    const results = {
        timestamp: new Date().toISOString(),
        files: [],
        stats: {
            totalFiles: 0,
            totalMethods: 0,
            totalInterfaces: 0,
            totalTypes: 0,
            methodsByCategory: {},
            errors: []
        }
    };

    // Recursively find all TypeScript files
    function findTypeScriptFiles(dir) {
        try {
            const files = fs.readdirSync(dir);
            const tsFiles = [];
            
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    tsFiles.push(...findTypeScriptFiles(fullPath));
                } else if (file.endsWith('.ts')) {
                    tsFiles.push(fullPath);
                }
            }
            
            return tsFiles;
        } catch (error) {
            debug('Error finding TypeScript files:', error);
            results.stats.errors.push({
                type: 'file_search',
                message: error.message,
                path: dir
            });
            return [];
        }
    }

    try {
        const files = findTypeScriptFiles(config.srcDir);
        results.stats.totalFiles = files.length;
        debug(`Found ${files.length} TypeScript files`);
        
        if (files.length === 0) {
            throw new Error('No TypeScript files found in source directory');
        }

        for (const file of files) {
            const analysis = analyzeFile(file);
            const relativePath = path.relative(config.srcDir, file);
            
            results.files.push({
                file: relativePath,
                ...analysis
            });

            // Update statistics
            results.stats.totalMethods += analysis.methods.length;
            results.stats.totalInterfaces += analysis.interfaces.length;
            results.stats.totalTypes += analysis.types.length;

            // Update method categories
            analysis.methods.forEach(method => {
                results.stats.methodsByCategory[method.category] = 
                    (results.stats.methodsByCategory[method.category] || 0) + 1;
            });
        }

        if (results.stats.totalMethods === 0) {
            throw new Error('No methods found in any TypeScript files');
        }

        // Write results to file
        fs.writeFileSync(
            config.outputFile,
            JSON.stringify(results, null, 2)
        );
        
        debug('Analysis complete:', results.stats);
        return results;
        
    } catch (error) {
        debug('Analysis failed:', error);
        throw error;
    }
}

// Export for use in the dev toolbox
module.exports = {
    analyzeSDK,
    config
};

// Run analysis if called directly
if (require.main === module) {
    analyzeSDK().catch(console.error);
}
