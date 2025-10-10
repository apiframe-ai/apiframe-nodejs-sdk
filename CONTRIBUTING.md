# Contributing to Apiframe Node.js SDK

Thank you for your interest in contributing to the Apiframe Node.js SDK! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/apiframe-nodejs-sdk.git`
3. Install dependencies: `npm install`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites
- Node.js >= 14.0.0
- npm or yarn
- TypeScript knowledge

### Installation
```bash
npm install
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Project Structure

```
apiframe-nodejs-sdk/
├── src/
│   ├── core/           # Core HTTP client
│   ├── services/       # API service modules
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions and errors
│   └── index.ts        # Main export file
├── examples/           # Usage examples
├── dist/              # Compiled JavaScript (generated)
└── tests/             # Test files
```

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Maintain strict type safety
- Export all relevant types
- Document complex types with JSDoc comments

### Code Style
- Follow existing code style
- Use ESLint for linting
- Use 2 spaces for indentation
- Use meaningful variable and function names

### Documentation
- Document all public APIs with JSDoc comments
- Include parameter descriptions and return types
- Provide usage examples for complex features
- Update README.md when adding new features

## Making Changes

### Adding a New Service

1. Create a new service file in `src/services/`
2. Define types in `src/types/index.ts`
3. Export the service from `src/index.ts`
4. Add documentation to README.md
5. Create an example in `examples/`

Example structure:
```typescript
// src/services/new-service.ts
import { HttpClient } from '../core/http-client';
import { NewServiceParams, TaskResponse } from '../types';

export class NewService {
  constructor(private httpClient: HttpClient) {}

  async generate(params: NewServiceParams): Promise<TaskResponse> {
    return this.httpClient.post<TaskResponse>('/new-service/generate', params);
  }
}
```

### Adding New Types

Add type definitions to `src/types/index.ts`:

```typescript
export interface NewServiceParams {
  prompt: string;
  // ... other parameters
}
```

### Error Handling

Use custom error classes from `src/utils/errors.ts`:

```typescript
import { ValidationError } from '../utils/errors';

if (!params.prompt) {
  throw new ValidationError('Prompt is required');
}
```

## Commit Guidelines

### Commit Message Format
```
type(scope): subject

body

footer
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(midjourney): add reroll functionality

Added reroll method to regenerate images with the same prompt.

Closes #123
```

## Testing

### Writing Tests
- Write tests for all new features
- Maintain high test coverage
- Use descriptive test names
- Mock external API calls

Example test:
```typescript
describe('Midjourney', () => {
  it('should create an imagine task', async () => {
    const client = new Apiframe({ apiKey: 'test_key' });
    const task = await client.midjourney.imagine({
      prompt: 'test'
    });
    expect(task).toHaveProperty('id');
  });
});
```

## Pull Request Process

1. Update documentation for any new features
2. Add tests for new functionality
3. Ensure all tests pass: `npm test`
4. Ensure code lints: `npm run lint`
5. Build successfully: `npm run build`
6. Update CHANGELOG.md with your changes
7. Create a pull request with a clear description

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Code lints successfully
- [ ] All tests pass
```

## Code Review

All submissions require review. We'll review your code for:
- Functionality
- Code quality
- Test coverage
- Documentation
- Adherence to project standards

## Questions?

If you have questions, please:
1. Check existing documentation
2. Search existing issues
3. Create a new issue with the "question" label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

