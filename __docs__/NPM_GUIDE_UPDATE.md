# How to Fix, Republish, and Update — blackvideo-extension-engine

---

## Step 1 — Fix the import in `src/commands/init.ts`

Open `src/commands/init.ts` and change line 9:

```ts
// ❌ REMOVE (causes CommonJS named export error):
import { prompt } from 'enquirer';

// ✅ REPLACE WITH:
import pkg from 'enquirer';
const { prompt } = pkg;
```

---

## Step 2 — Rebuild

```bash
pnpm run build
```

Expected output: no errors, `dist/` folder regenerated.

---

## Step 3 — Bump the version

You must bump the version before publishing a new release to npm.
npm will reject a publish if the version already exists.

```bash
# Patch bump: 1.0.0 → 1.0.1  (for bug fixes like this one)
npm version patch

# Minor bump: 1.0.0 → 1.1.0  (for new features)
npm version minor

# Major bump: 1.0.0 → 2.0.0  (for breaking changes)
npm version major
```

This command automatically:
- Updates `version` in `package.json`
- Creates a git commit
- Creates a git tag (e.g. `v1.0.1`)

---

## Step 4 — Publish to npm

```bash
npm publish --access public
```

Verify it went live:

```bash
npm info blackvideo-extension-engine
# Should show version: 1.0.1
```

---

## Step 5 — Push git tag to GitHub

```bash
git push origin main --tags
```

---

## How to update your globally installed version

### Option A — pnpm (what you used to install)

```bash
pnpm add -g blackvideo-extension-engine@latest
```

Or pin to a specific version:

```bash
pnpm add -g blackvideo-extension-engine@1.0.1
```

### Option B — npm

```bash
npm install -g blackvideo-extension-engine@latest
```

### Verify the update worked

```bash
bvx --version
# Should print: 1.0.1
```

---

## Quick reference — full republish workflow

```bash
# 1. Fix the code
# 2. Rebuild
pnpm run build

# 3. Bump version (patch for bug fixes)
npm version patch

# 4. Publish
npm publish --access public

# 5. Push to GitHub
git push origin main --tags

# 6. Update your global install
pnpm add -g blackvideo-extension-engine@latest

# 7. Confirm
bvx --version
```

---

## Troubleshooting

**"You cannot publish over the previously published versions"**
→ You forgot to bump the version. Run `npm version patch` first.

**"403 Forbidden"**
→ You're not logged in. Run `npm login` then retry.

**Old version still runs after update**
→ pnpm caches aggressively. Force a fresh install:
```bash
pnpm remove -g blackvideo-extension-engine
pnpm add -g blackvideo-extension-engine@latest
```

**"dist/ not found" or stale build**
→ The `prepublishOnly` script in `package.json` runs `npm run build` automatically
before every publish. If it still fails, run `pnpm run build` manually first.