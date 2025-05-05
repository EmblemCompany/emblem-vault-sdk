class SDKExplorer {
    constructor() {
        this.sdk = null;
        this.methods = null;
        this.selectedMethod = null;
        this.resultHistory = [];
        this.maxResults = 10; // Keep only last 10 results
        this.setupEventListeners();
        this.setupResourceMonitor();
    }

    setupEventListeners() {
        document.getElementById('connectSDK').addEventListener('click', () => this.initializeSDK());
        document.getElementById('methodSearch').addEventListener('input', (e) => this.filterMethods(e.target.value));
        document.getElementById('executeMethod').addEventListener('click', () => this.executeSelectedMethod());
        document.getElementById('copyResult').addEventListener('click', () => this.copyResult());
        document.getElementById('clearResults').addEventListener('click', () => this.clearResults());
    }

    setupResourceMonitor() {
        this.resourceStats = document.createElement('div');
        this.resourceStats.className = 'fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg text-sm font-mono';
        document.body.appendChild(this.resourceStats);
        
        // Update stats every 2 seconds
        setInterval(() => this.updateResourceStats(), 2000);
    }

    updateResourceStats() {
        const formatMemory = (bytes) => {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        };

        if (window.performance && window.performance.memory) {
            const memory = window.performance.memory;
            this.resourceStats.innerHTML = `
                <div class="space-y-1">
                    <div>Used JS Heap: ${formatMemory(memory.usedJSHeapSize)}</div>
                    <div>Total JS Heap: ${formatMemory(memory.totalJSHeapSize)}</div>
                    <div>Results Cache: ${this.resultHistory.length}/${this.maxResults}</div>
                </div>
            `;
        }
    }

    async initializeSDK() {
        const apiKey = document.getElementById('apiKey').value;
        if (!apiKey) {
            this.showError('API Key is required');
            return;
        }

        try {
            // Initialize SDK with API key
            this.sdk = new EmblemVaultSDK(apiKey);

            // Extract methods from SDK
            this.methods = this.extractMethods(this.sdk);
            this.renderMethodList(this.methods);

            document.getElementById('connectSDK').classList.add('bg-green-500');
            document.getElementById('connectSDK').textContent = 'Connected';
        } catch (error) {
            this.showError(`Failed to initialize SDK: ${error.message}`);
        }
    }

    extractMethods(sdk) {
        const methods = [];
        const prototype = Object.getPrototypeOf(sdk);
        const methodNames = Object.getOwnPropertyNames(prototype)
            .filter(name => {
                const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
                return typeof descriptor.value === 'function' && name !== 'constructor';
            });

        for (const name of methodNames) {
            const method = prototype[name];
            const funcStr = method.toString();
            const jsDocComment = this.extractJSDocComment(funcStr);
            const params = this.extractParameters(method);
            const returnType = this.extractReturnType(funcStr, jsDocComment);
            const description = this.extractMethodDescription(jsDocComment);
            
            methods.push({
                name,
                async: method.constructor.name === 'AsyncFunction',
                parameters: params,
                returnType,
                description,
                category: this.categorizeMethod(name)
            });
        }

        return this.groupMethodsByCategory(methods);
    }

    extractReturnType(funcStr, jsDocComment) {
        // Try to get return type from JSDoc
        const returnMatch = jsDocComment.match(/@returns?\s+{([^}]+)}/);
        if (returnMatch) {
            return returnMatch[1].trim();
        }

        // Try to get return type from TypeScript annotation
        const returnTypeMatch = funcStr.match(/\):\s*([^{=\n]+)/);
        if (returnTypeMatch) {
            return returnTypeMatch[1].trim();
        }

        return 'any';
    }

    extractMethodDescription(jsDocComment) {
        // Remove @param, @returns and other tags
        const description = jsDocComment
            .split('\n')
            .filter(line => !line.trim().startsWith('@'))
            .join('\n')
            .trim();
        return description;
    }

    extractParameters(method) {
        const funcStr = method.toString();
        const paramStr = funcStr.slice(funcStr.indexOf('(') + 1, funcStr.indexOf(')'));
        
        // Extract JSDoc comment if available
        const jsDocComment = this.extractJSDocComment(funcStr);
        const paramDocs = this.parseParamDocs(jsDocComment);
        
        return paramStr.split(',')
            .map(param => param.trim())
            .filter(param => param)
            .map(param => {
                const [fullName, defaultValue] = param.split('=').map(p => p.trim());
                const [name, typeAnnotation] = fullName.split(':').map(p => p.trim());
                const optional = param.includes('=') || name.includes('?');
                const cleanName = name.replace('?', '');
                
                // Get parameter type from TypeScript annotation or JSDoc
                const type = typeAnnotation || 
                           (paramDocs[cleanName] && paramDocs[cleanName].type) || 
                           'any';
                
                // Get parameter description from JSDoc
                const description = paramDocs[cleanName] ? 
                                  paramDocs[cleanName].description : 
                                  '';
                
                return {
                    name: cleanName,
                    type,
                    optional,
                    defaultValue: defaultValue || null,
                    description
                };
            });
    }

    extractJSDocComment(funcStr) {
        const jsDocRegex = /\/\*\*\s*([\s\S]*?)\s*\*\//;
        const match = funcStr.match(jsDocRegex);
        return match ? match[1] : '';
    }

    parseParamDocs(jsDocComment) {
        const paramDocs = {};
        const paramRegex = /@param\s+{([^}]+)}\s+(\w+)\s+(.+)/g;
        let match;
        
        while ((match = paramRegex.exec(jsDocComment)) !== null) {
            const [_, type, name, description] = match;
            paramDocs[name] = {
                type: type.trim(),
                description: description.trim()
            };
        }
        
        return paramDocs;
    }

    categorizeMethod(name) {
        const categories = {
            auth: ['login', 'authenticate', 'token'],
            vault: ['vault', 'create', 'update', 'delete'],
            transaction: ['send', 'transfer', 'sign', 'broadcast'],
            query: ['get', 'list', 'find', 'search'],
            balance: ['balance', 'check'],
            utility: ['util', 'convert', 'format']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => name.toLowerCase().includes(keyword))) {
                return category;
            }
        }

        return 'other';
    }

    groupMethodsByCategory(methods) {
        return methods.reduce((grouped, method) => {
            if (!grouped[method.category]) {
                grouped[method.category] = [];
            }
            grouped[method.category].push(method);
            return grouped;
        }, {});
    }

    generateCodeExample(method) {
        const params = method.parameters.map(p => {
            if (p.type.toLowerCase().includes('string')) {
                return `'example-${p.name}'`;
            } else if (p.type.toLowerCase().includes('number')) {
                return '123';
            } else if (p.type.toLowerCase().includes('boolean')) {
                return 'false';
            } else if (p.type.toLowerCase().includes('array')) {
                return '[]';
            } else if (p.type.toLowerCase().includes('object')) {
                return '{}';
            } else if (p.defaultValue) {
                return p.defaultValue;
            }
            return 'null';
        });

        const asyncPrefix = method.async ? 'await ' : '';
        const codeExample = `// Initialize SDK
const sdk = new EmblemVaultSDK('your-api-key');

// Call method
${method.async ? 'async function example() {' : ''}
${asyncPrefix}sdk.${method.name}(${params.join(', ')});
${method.async ? '}' : ''}`;

        return codeExample;
    }

    renderMethodList(methods) {
        const methodList = document.getElementById('methodList');
        methodList.innerHTML = '';

        Object.entries(methods).forEach(([category, categoryMethods]) => {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'mb-6';
            
            categoryEl.innerHTML = `
                <h3 class="text-lg font-semibold mb-2 text-gray-700 capitalize">${category}</h3>
                <div class="space-y-2">
                    ${categoryMethods.map(method => `
                        <div class="method-card p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100" 
                             data-method='${JSON.stringify(method)}'>
                            <div class="flex items-center justify-between">
                                <span class="font-medium text-gray-800">${method.name}</span>
                                ${method.async ? '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">async</span>' : ''}
                            </div>
                            <div class="text-sm text-gray-600 mt-1">
                                ${method.parameters.length} parameter${method.parameters.length === 1 ? '' : 's'}
                            </div>
                            <div class="text-sm text-purple-600 mt-1">Returns: ${method.returnType}</div>
                            <div class="text-sm text-gray-600 mt-1">${method.description}</div>
                        </div>
                    `).join('')}
                </div>
            `;

            methodList.appendChild(categoryEl);
        });

        // Add click handlers
        methodList.querySelectorAll('.method-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectMethod(JSON.parse(card.dataset.method));
            });
        });
    }

    filterMethods(searchTerm) {
        if (!this.methods) return;

        const filtered = {};
        searchTerm = searchTerm.toLowerCase();

        Object.entries(this.methods).forEach(([category, methods]) => {
            const matchingMethods = methods.filter(method => 
                method.name.toLowerCase().includes(searchTerm) ||
                method.parameters.some(param => param.name.toLowerCase().includes(searchTerm))
            );

            if (matchingMethods.length > 0) {
                filtered[category] = matchingMethods;
            }
        });

        this.renderMethodList(filtered);
    }

    selectMethod(method) {
        this.selectedMethod = method;
        
        // Update UI to show selected method
        document.querySelectorAll('.method-card').forEach(card => {
            const cardMethod = JSON.parse(card.dataset.method);
            if (cardMethod.name === method.name) {
                card.classList.add('ring-2', 'ring-blue-500');
            } else {
                card.classList.remove('ring-2', 'ring-blue-500');
            }
        });

        this.renderParameterForm(method);
        document.getElementById('executeMethod').disabled = false;
    }

    renderParameterForm(method) {
        const form = document.getElementById('parameterForm');
        form.innerHTML = `
            <div class="mb-4">
                <h3 class="font-medium text-gray-800 mb-2">${method.name}</h3>
                ${method.description ? `
                    <p class="text-sm text-gray-600 mb-4">${method.description}</p>
                ` : ''}
                <div class="text-sm text-purple-600 mb-4">Returns: ${method.returnType}</div>
            </div>
            ${method.parameters.map(param => `
                <div class="space-y-1 mb-4">
                    <label class="block text-sm font-medium text-gray-700">
                        ${param.name}
                        ${param.optional ? '<span class="text-gray-400">(optional)</span>' : ''}
                        <span class="text-xs text-blue-600 ml-1">${param.type}</span>
                        ${param.name === 'web3' && '<span class="text-green-600 ml-1">(using window.web3)</span>'}
                    </label>
                    ${param.description ? `
                        <p class="text-xs text-gray-500 mb-1">${param.description}</p>
                    ` : ''}
                    ${param.name === 'web3' ? `
                        <input type="text" 
                               name="${param.name}"
                               class="w-full p-2 border rounded param-input bg-gray-100"
                               placeholder="Using window.web3"
                               disabled
                        />
                    ` : `
                        <input type="text" 
                               name="${param.name}"
                               class="w-full p-2 border rounded param-input"
                               placeholder="${param.defaultValue || this.getTypePlaceholder(param.type)}"
                               ${param.optional ? '' : 'required'}
                        />
                    `}
                </div>
            `).join('')}
            <div class="mt-6">
                <div class="text-sm font-medium text-gray-700 mb-2">Example Usage:</div>
                <pre><code class="language-javascript">${this.generateCodeExample(method)}</code></pre>
            </div>
        `;
        
        // Highlight code examples
        Prism.highlightAll();
    }

    getTypePlaceholder(type) {
        type = type.toLowerCase();
        if (type.includes('string')) return 'Enter text...';
        if (type.includes('number')) return 'Enter number...';
        if (type.includes('boolean')) return 'true or false';
        if (type.includes('array')) return '[]';
        if (type.includes('object')) return '{}';
        return '';
    }

    async executeSelectedMethod() {
        if (!this.selectedMethod || !this.sdk) return;

        // Special case for loadWeb3
        if (this.selectedMethod.name === 'loadWeb3') {
            try {
                const web3 = await this.sdk.loadWeb3();
                window.web3 = web3; // Attach web3 globally
                this.showResult('Web3 initialized and attached to window.web3');
            } catch (error) {
                this.showError(error.message);
            }
            return;
        }

        // Handle all other methods normally
        try {
            const form = document.getElementById('parameterForm');
            const inputs = form.querySelectorAll('.param-input');
            const params = Array.from(inputs).map((input, index) => {
                const paramInfo = this.selectedMethod.parameters[index];
                
                // If parameter is named web3 and we have window.web3, use that
                if (paramInfo.name === 'web3' && window.web3) {
                    return window.web3;
                }

                const value = input.value;
                try {
                    return value ? JSON.parse(value) : undefined;
                } catch (e) {
                    return value;
                }
            }).filter(p => p !== undefined);

            const result = await this.sdk[this.selectedMethod.name](...params);
            this.showResult(result);
        } catch (error) {
            this.showError(error.message);
        }
    }

    showResult(result) {
        // Add to history and maintain max size
        this.resultHistory.push(result);
        if (this.resultHistory.length > this.maxResults) {
            this.resultHistory.shift(); // Remove oldest result
        }

        const resultPanel = document.getElementById('resultPanel');
        try {
            // Clear previous content
            while (resultPanel.firstChild) {
                resultPanel.firstChild.remove();
            }

            // Format and display new result
            const formattedResult = typeof result === 'object' ? 
                JSON.stringify(result, null, 2) : 
                String(result);

            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.className = 'language-javascript';
            code.textContent = formattedResult;
            pre.appendChild(code);
            resultPanel.appendChild(pre);

            // Highlight new code
            Prism.highlightElement(code);
        } catch (error) {
            console.error('Error displaying result:', error);
            resultPanel.textContent = String(result);
        }
    }

    clearResults() {
        // Clear result history to free memory
        this.resultHistory = [];
        const resultPanel = document.getElementById('resultPanel');
        resultPanel.innerHTML = '<div class="text-gray-500">Execute a method to see results</div>';
    }

    copyResult() {
        const resultPanel = document.getElementById('resultPanel');
        const code = resultPanel.querySelector('code');
        
        if (code) {
            navigator.clipboard.writeText(code.textContent)
                .then(() => {
                    const copyBtn = document.getElementById('copyResult');
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy Result';
                    }, 2000);
                })
                .catch(err => this.showError('Failed to copy: ' + err.message));
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        const container = document.querySelector('.container');
        container.insertBefore(errorDiv, container.firstChild);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize the explorer when the page loads
window.addEventListener('DOMContentLoaded', () => {
    window.sdkExplorer = new SDKExplorer();
});
