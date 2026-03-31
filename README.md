![Visitors](https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2FBlackBlazent%2Fblackvideo-extensions-engine&label=BlackVideo%20Extensions%20Engine%3AVisitor&labelColor=%23000000&countColor=%2337d67a&style=flat&labelStyle=lower)

# blackvideo-extension-engine

**Official CLI scaffolding engine for BlackVideo extensions**

> Create, validate, build, and publish extensions for the [BlackVideo](https://github.com/BlackBlazent/BlackVideo) media ecosystem — the same way VS Code developers use `yo code`.

---

## Installation

```bash
# npm (global)
npm install -g blackvideo-extension-engine

# pnpm (global)
pnpm add -g blackvideo-extension-engine
```

After installing you get **three aliases** pointing to the same CLI:

```bash
blackvideo-ext   # full name
bv-ext           # short form
bvx              # shortest — use this one
```

---

## Quick Start

```bash
bvx init my-video-ocr
cd my-video-ocr
bvx dev
```

---

## Commands

| Command              | Alias     | Description                                |
|---------------------|-----------|--------------------------------------------|
| `bvx init [name]`   | —         | Scaffold a new extension project           |
| `bvx validate`      | —         | Validate structure + manifest              |
| `bvx build`         | —         | Bundle into `.bvx` package                 |
| `bvx dev`           | —         | File watcher with live validation          |
| `bvx publish`       | —         | Validate, build, and publish               |
| `bvx upgrade`       | —         | Check for CLI engine updates               |
| `bvx info`          | —         | Environment diagnostics                    |

---

## `bvx init`

Interactive prompt that collects:

- Extension id (kebab-case, npm-compatible)
- Display name
- Description
- Author
- Version
- Extension type: `extension | plugin | theme | addon | dev-tool | subtitle`
- License model: `free | trial | subscription | enterprise | internal`
- Playback hooks (VideoTheaterStage integration)
- UI support (container card, navigation, bottomSpace)
- CLI support (cli.extension.runner.ts)
- Output directory

### Generated structure

```
my-video-ocr/
├─ cli/
│   └─ cli.extension.runner.ts        ← only if cliSupport: true
├─ config/
│   ├─ @settings.config.ts
│   ├─ extension.active.handler.ts
│   ├─ extension.deactivate.handler.ts
│   ├─ extension.install.handler.ts
│   ├─ extension.uninstall.handler.ts
│   └─ services.config.ts
├─ src/
│   ├─ assets/
│   ├─ components/
│   │   ├─ ui/
│   │   │   ├─ navigation.tsx
│   │   │   └─ bottomSpace.tsx
│   │   └─ extension.container.card.tsx
│   ├─ utils/
│   └─ scripts/
├─ .blackvideoignore
├─ cgmanifest.json
├─ extension-configuration.json
├─ icon.png
├─ index.ts
├─ manifest.json
├─ package.json
└─ package.nls.json
```

---

## `bvx validate`

Runs three checks:

1. **Directory structure** — all required files present
2. **Manifest schema** — all fields valid and correctly typed
3. **Permission scopes** — against the allowed whitelist; blocked combinations rejected

```bash
bvx validate              # validate current directory
bvx validate ./my-ext     # validate a specific path
```

---

## `bvx build`

Bundles the extension into a `.bvx` archive (zip format).

```bash
bvx build
# Output: dist/my-video-ocr.bvx
```

Requires `archiver` as an optional dependency for real zip output:
```bash
npm install archiver
```

---

## `bvx dev`

Watches the extension directory and re-validates on every file change.

```bash
bvx dev
bvx dev ./my-ext
```

---

## `bvx publish`

Validates, builds, generates a SHA-256 checksum, and writes `dist/publish.json`.

Until the BlackVideo Marketplace server is live, use manual GitHub release publishing:

1. Run `bvx publish`
2. Go to `https://github.com/BlackBlazent/blackvideo-extensions`
3. Create a release tagged `v1.0.0`
4. Upload `dist/my-ext.bvx` and `dist/publish.json`

---

## Extension Manifest Schema

```json
{
  "id":            "my-video-ocr",
  "name":          "my-video-ocr",
  "displayName":   "My Video OCR",
  "description":   "Optical character recognition for video frames",
  "version":       "1.0.0",
  "author":        "Your Name",
  "authorClass":   "your-name",
  "type":          "extension",
  "license":       "free",
  "icon":          "icon.png",
  "entry":         "index.ts",
  "uiEntry":       "src/components/extension.container.card",
  "permissions":   [
    {
      "scope":  "playback.read",
      "reason": "Reads current video frame for OCR analysis"
    }
  ],
  "playbackHooks": true,
  "uiSupport":     true,
  "cliSupport":    false
}
```

### Allowed permission scopes

| Scope               | Description                        |
|--------------------|------------------------------------|
| `playback.read`    | Read playback state                |
| `playback.control` | Control playback (play/pause/seek) |
| `frame.capture`    | Capture video frames               |
| `overlay.render`   | Render overlays on the video       |
| `subtitle.read`    | Read subtitle tracks               |
| `subtitle.write`   | Write subtitle tracks              |
| `metadata.read`    | Read video metadata                |
| `metadata.write`   | Write/update video metadata        |
| `audio.analyze`    | Analyze audio stream               |
| `timeline.read`    | Read timeline data                 |
| `timeline.seek`    | Seek on the timeline               |
| `filesystem.read`  | Read files (own dir only)          |
| `network.fetch`    | Outbound fetch                     |
| `store.read`       | Read from Tauri store              |
| `store.write`      | Write to Tauri store               |
| `ipc.emit`         | Emit one-way IPC events            |

### Blocked combinations

- `filesystem.read` + `network.fetch` — prevents data exfiltration
- `ipc.emit` + `store.write` — prevents silent persistence via IPC

---

## In-App Integration

This CLI is the counterpart to the **BlackVideo in-app extension system**:

```
blackvideo-extension-engine (this package)
         ↓  generates
extension scaffold  →  placed in /AppRegistry/extensions/<id>/
         ↓  loaded by
extension.registry.server.ts
         ↓  verified by
extension.server.verified.ts  (same rules as this CLI validator)
         ↓  rendered by
extension.modalFrame.ui.tsx
```

The `manifest.json` schema, allowed permission scopes, and blocked combinations are **identical** between this CLI and `extension.server.verified.ts` in the BlackVideo app. Any extension that passes `bvx validate` will pass in-app verification.

---

## Publishing to npm Registry

### 1. Create an npm account

```bash
npm login
# Enter username, password, email
```

### 2. Check the package name is available

```bash
npm search blackvideo-extension-engine
```

### 3. Set up the repository

```bash
git init
git remote add origin https://github.com/BlackBlazent/blackvideo-extensions-engine.git
git add .
git commit -m "feat: initial release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

### 4. Build before publishing

```bash
npm run build
```

### 5. Dry run (verify what gets published)

```bash
npm publish --dry-run
```

Check that only the `bin/`, `dist/`, `README.md`, and `LICENSE` files are included.

### 6. Publish

```bash
npm publish --access public
```

### 7. Verify

```bash
npm info blackvideo-extension-engine
```

### 8. Subsequent releases

```bash
# Bump version
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# Build + publish
npm run build
npm publish --access public
```

### Scoped package (optional)

If you want to publish under the `@blackblazent` scope:

```bash
# Change name in package.json to:
# "name": "@blackblazent/blackvideo-extension-engine"

npm publish --access public
# Install:
npm install -g @blackblazent/blackvideo-extension-engine
```

---

## Repository

- **Engine:** https://github.com/BlackBlazent/blackvideo-extensions-engine
- **Extensions:** https://github.com/BlackBlazent/blackvideo-extensions
- **BlackVideo App:** https://github.com/BlackBlazent/BlackVideo

---

## Requirements

| Tool       | Version  |
|-----------|----------|
| Node.js   | >= 18.x  |
| npm / pnpm| any      |
| TypeScript| >= 5.x   |
| BlackVideo| >= 1.0.0 |

---

## License

MIT © BlackBlazent
