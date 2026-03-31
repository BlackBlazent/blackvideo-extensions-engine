# blackvideo-extension-engine

CLI tool for scaffolding, validating, building, and publishing BlackVideo extensions.

## Installation

Install globally using npm or pnpm:

```bash
npm install -g blackvideo-extension-engine
# or
pnpm add -g blackvideo-extension-engine
````

Available command aliases:

```bash
blackvideo-ext
bv-ext
bvx
```

## Quick Start

```bash
bvx init my-extension
cd my-extension
bvx dev
```

## Commands

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `bvx init`     | Scaffold a new extension                 |
| `bvx validate` | Validate structure and manifest          |
| `bvx build`    | Build extension into `.bvx` package      |
| `bvx dev`      | Watch files and validate on changes      |
| `bvx publish`  | Validate, build, and prepare for release |
| `bvx upgrade`  | Check for CLI updates                    |
| `bvx info`     | Show environment diagnostics             |

## Creating an Extension

```bash
bvx init my-extension
```

The CLI will prompt for:

* Extension ID
* Name and description
* Author and version
* Extension type
* License model
* Optional features (UI, CLI, playback hooks)

## Validate

```bash
bvx validate
bvx validate ./my-extension
```

Checks:

* Project structure
* Manifest schema
* Permission rules

## Build

```bash
bvx build
```

Output:

```
dist/<extension>.bvx
```

Optional dependency for zip support:

```bash
npm install archiver
```

## Development Mode

```bash
bvx dev
```

Watches files and re-validates on changes.

## Publish (Manual Flow)

```bash
bvx publish
```

Generates:

* `.bvx` package
* `publish.json` (metadata + checksum)

Upload both files to your release repository.

## Extension Manifest (Example)

```json
{
  "id": "my-extension",
  "name": "my-extension",
  "displayName": "My Extension",
  "description": "Example extension",
  "version": "1.0.0",
  "author": "Your Name",
  "type": "extension",
  "license": "free",
  "entry": "index.ts",
  "permissions": []
}
```

## Requirements

* Node.js >= 18
* npm or pnpm

## License

MIT
