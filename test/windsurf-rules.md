# Emblem Vault SDK Test Migration Windsurf Rules

## Migration Principles
- **Backward Compatibility**: Maintain backward compatibility with existing code
- **Deprecation Before Removal**: Mark functions/features as deprecated before removing them
- **Incremental Migration**: Migrate tests one at a time to ensure stability
- **Dual Testing Frameworks**: Support both Jest and Mocha/Chai during transition
- **Consistent Test Coverage**: Ensure the same level of test coverage in the new framework

## Directory Structure
- `/test`: New Mocha/Chai tests location
  - `/fixtures`: Test fixtures (JSON, mock data)
  - `/unit`: Unit tests for individual components
  - `/integration`: Integration tests for combined functionality
  - `/helpers`: Test helper functions and utilities
- `/tests`: Legacy Jest tests (to be deprecated gradually)

## Test File Naming Conventions
- Unit tests: `*.spec.ts` 
- Integration tests: `*.integration.spec.ts`
- Fixture files: Descriptive names matching the data they represent

## Migration Process
1. **Phase 1**: Set up Mocha/Chai infrastructure
   - Create configuration files
   - Set up test helpers
   - Establish test patterns

2. **Phase 2**: Migrate core tests
   - Start with foundational SDK tests
   - Move to feature-specific tests
   - Ensure all fixtures are properly migrated

3. **Phase 3**: Deprecation of Jest tests
   - Update package.json to support both frameworks
   - Add deprecation notices to Jest test files
   - Document migration timeline

4. **Phase 4**: Complete transition
   - Remove Jest dependencies when appropriate
   - Update documentation
   - Clean up legacy code

## Coding Standards
- Use TypeScript for all test files
- Follow existing code style and formatting
- Add comprehensive comments explaining test purpose
- Use descriptive test names that explain what is being tested
- Group related tests in describe blocks

## Test Structure Guidelines
- Each test file should focus on a specific component or feature
- Use before/beforeEach for setup and after/afterEach for cleanup
- Mock external dependencies when appropriate
- Use fixtures for consistent test data
- Include both positive and negative test cases

## Documentation Requirements
- Document any changes to the API or behavior
- Update README with new test instructions
- Add migration notes for contributors
- Document any known issues or limitations

## Commit Message Format
- `test: Migrate [test name] to Mocha/Chai`
- `chore: Update test configuration for Mocha/Chai`
- `docs: Update test documentation`
- `refactor: Improve test structure for [component]`
