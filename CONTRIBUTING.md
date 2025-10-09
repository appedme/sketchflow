# Contributing to SketchFlow

First off, thank you for considering contributing to SketchFlow! It's people like you that make SketchFlow such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs** if possible
- **Include your environment details** (OS, browser, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Follow the TypeScript/React styleguides
- Include thoughtfully-worded, well-structured tests
- Document new code
- End all files with a newline

## Development Process

### Setup Development Environment

1. Fork the repo and clone your fork
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in the values
4. Run database migrations: `npm run db:push`
5. Start the dev server: `npm run dev`

### Making Changes

1. Create a new branch: `git checkout -b feature/my-new-feature`
2. Make your changes
3. Test your changes thoroughly
4. Run linting: `npm run lint`
5. Commit your changes using conventional commits:
   ```
   feat: add new feature
   fix: fix bug in component
   docs: update documentation
   style: format code
   refactor: refactor component
   test: add tests
   chore: update dependencies
   ```

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use functional components with hooks
- Write meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused
- Use server components when possible

### Component Guidelines

- **Canvas Components**: Place in `src/components/canvas/`
- **Editor Components**: Place in `src/components/editor/`
- **Workspace Components**: Place in `src/components/workspace/`
- **Shared UI Components**: Place in `src/components/ui/`

### Database Changes

- Create migrations for schema changes
- Test migrations locally before committing
- Document schema changes in comments

### Testing

- Write unit tests for utilities
- Write integration tests for critical flows
- Test on multiple browsers
- Test responsive design on mobile

## Project Structure

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/             # Utilities and configurations
├── hooks/           # Custom React hooks
└── styles/          # Global styles
```

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Please structure your commit messages as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests
- `chore`: Changes to build process or auxiliary tools

## Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your changes will be included in the next release

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project website (coming soon)

## Questions?

Feel free to:

- Open an issue for questions
- Join our Discord (coming soon)
- Email us at support@sketchflow.space

Thank you for contributing to SketchFlow! 🎉
