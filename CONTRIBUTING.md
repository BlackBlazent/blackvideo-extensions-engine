# Contributing to BlackVideo Extension Engine

Thank you for your interest in contributing to **blackvideo-extension-engine**! This document outlines the recommended workflow for contributing code, extensions, bug fixes, or improvements.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Reporting Issues](#reporting-issues)
3. [Development Workflow](#development-workflow)
4. [CLI Commands for Contributors](#cli-commands-for-contributors)
5. [Testing & Validation](#testing--validation)
6. [Pull Requests](#pull-requests)
7. [Code Style](#code-style)
8. [License](#license)

---

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/BlackBlazent/blackvideo-extensions-engine.git
cd blackvideo-extensions-engine
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Build the project**

```bash
npm run build
```

4. Optionally, run the CLI in watch mode for active development:

```bash
npm run dev
```

---

## Reporting Issues

If you encounter a bug or have a feature request:

* Go to the [Issues tab](https://github.com/BlackBlazent/blackvideo-extensions-engine/issues)
* Create a new issue with:

  * Clear description of the problem
  * Steps to reproduce
  * Expected vs actual behavior
  * Screenshots or code snippets if applicable

---

## Development Workflow

To contribute code:

1. **Create a branch** for your feature or fix:

```bash
git checkout -b feature/my-new-feature
```

2. Make changes in the source files (`src/` and `cli/`)
3. Run validation and tests locally before submitting:

```bash
bvx validate
npm test
```

4. Commit your changes with clear messages:

```bash
git add .
git commit -m "Add feature X to support Y"
```

5. Push your branch and open a Pull Request against `main`:

```bash
git push origin feature/my-new-feature
```

---

## CLI Commands for Contributors

Contributors should familiarize themselves with the CLI commands:

| Command        | Purpose                                      |
| -------------- | -------------------------------------------- |
| `bvx init`     | Scaffold a new extension project for testing |
| `bvx validate` | Validate project structure and manifest      |
| `bvx build`    | Bundle your extension into a `.bvx` file     |
| `bvx dev`      | Watch for changes and auto-validate          |

> **Tip:** Run `bvx validate` frequently to ensure compatibility with in-app verification.

---

## Testing & Validation

* **Validate an extension or project:**

```bash
bvx validate
bvx validate ./my-test-extension
```

* **Run automated tests**:

```bash
npm test
```

All contributions **must pass validation** and **tests** before being merged.

---

## Pull Requests

When submitting a pull request:

1. Ensure your branch is up-to-date with `main`.
2. Provide a **clear description** of changes.
3. Link relevant issues (if any).
4. Confirm that:

   * Code is linted
   * Tests pass
   * CLI validation passes

GitHub Actions may run additional checks automatically.

---

## Code Style

* TypeScript code must follow existing project conventions.
* Use `eslint` for linting:

```bash
npm run lint
```

* Maintain the directory structure:

```
cli/
config/
src/
├─ assets/
├─ components/
├─ utils/
└─ scripts/
```

* Manifest and permission schemas should adhere to `manifest.json` structure.

---

## License

By contributing, you agree that your contributions will be licensed under the **MIT License** of this repository.

---
