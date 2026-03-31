/*
 * commands/build.ts
 *
 * bvx build [path]
 *
 * Bundles the extension into a .bvx archive (zip-based).
 * Output: dist/<extension-id>.bvx
 *
 * Steps:
 *   1. Validate structure + manifest
 *   2. Collect all files not in .blackvideoignore
 *   3. Create zip archive → dist/<id>.bvx
 *   4. Print bundle summary
 */

import path         from 'path';
import fs           from 'fs';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import chalk        from 'chalk';
import ora          from 'ora';

import { log }                 from '../utils/logger.js';
import { exists, readJson, ensureDir } from '../utils/fs.js';
import { validateManifest, validateStructure } from '../validators/manifest.validator.js';
import type { ExtensionManifest } from '../validators/manifest.validator.js';

// ─────────────────────────────────────────────────────────────
//  Parse .blackvideoignore
// ─────────────────────────────────────────────────────────────

function parseIgnore(root: string): RegExp[] {
  const ignorePath = path.join(root, '.blackvideoignore');
  if (!fs.existsSync(ignorePath)) return [];
  const lines = fs.readFileSync(ignorePath, 'utf-8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  return lines.map(pattern => {
    const escaped = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\//g, '\\/');
    return new RegExp(`^${escaped}`, 'i');
  });
}

function collectFiles(root: string, ignorePatterns: RegExp[]): string[] {
  const results: string[] = [];

  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel  = path.relative(root, full);
      const skip = ignorePatterns.some(r => r.test(rel) || r.test(entry.name));
      if (skip) continue;
      if (entry.isDirectory()) walk(full);
      else results.push(rel);
    }
  };

  walk(root);
  return results;
}

// ─────────────────────────────────────────────────────────────
//  Command
// ─────────────────────────────────────────────────────────────

export async function cmdBuild(targetPath?: string): Promise<void> {
  const root = path.resolve(process.cwd(), targetPath ?? '.');

  log.blank();
  log.title('Building extension');
  log.info(`Source: ${chalk.cyan(root)}`);
  log.blank();

  // ── Validate first ───────────────────────────────────────

  const structResult = validateStructure(root);
  if (!structResult.valid) {
    log.error(`Structure validation failed. Run ${chalk.cyan('bvx validate')} for details.`);
    process.exit(1);
  }

  const manifest = await readJson<Partial<ExtensionManifest>>(path.join(root, 'manifest.json'));
  const { valid, errors, warnings } = validateManifest(manifest);

  if (!valid) {
    errors.forEach(e => log.error(e));
    log.error('Manifest validation failed. Fix errors before building.');
    process.exit(1);
  }
  warnings.forEach(w => log.warn(w));

  const extId = manifest.id!;

  // ── Collect files ────────────────────────────────────────

  const spinner = ora({ text: 'Collecting files…', spinner: 'dots', color: 'cyan' }).start();
  const ignorePatterns = parseIgnore(root);
  const files = collectFiles(root, ignorePatterns);
  spinner.text = `Bundling ${files.length} files…`;

  // ── Build dist dir ───────────────────────────────────────

  const distDir = path.join(root, 'dist');
  await ensureDir(distDir);
  const outPath = path.join(distDir, `${extId}.bvx`);

  // ── Create zip (using Node built-ins via fflate-style approach) ──
  // We write a simple manifest-based bundle (JSON + file map) as .bvx
  // A full zip implementation requires fflate or archiver — we reference
  // archiver here and note it as a peerDependency.

  try {
    // Dynamic import so build doesn't fail if archiver is not installed
    // Old: const archiver = await import('archiver').then(m => m.default).catch(() => null);
    const archiver = await import('archiver').then((m: any) => m.default as any).catch(() => null);

    if (!archiver) {
      // Fallback: write a .bvx.json listing (not a real zip — for CI/testing)
      const bundle = {
        id:       extId,
        version:  manifest.version,
        files,
        builtAt:  new Date().toISOString(),
      };
      const jsonOut = path.join(distDir, `${extId}.bvx.json`);
      fs.writeFileSync(jsonOut, JSON.stringify(bundle, null, 2));
      spinner.succeed(chalk.yellow(`Bundle manifest written (install "archiver" for real .bvx zip)`));
      log.info(`Output: ${chalk.cyan(jsonOut)}`);
    } else {
      const output  = createWriteStream(outPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(output);

      for (const rel of files) {
        archive.file(path.join(root, rel), { name: rel });
      }

      await archive.finalize();
      spinner.succeed(chalk.green(`Bundle created: ${chalk.bold(`${extId}.bvx`)}`));
      log.info(`Output: ${chalk.cyan(outPath)}`);
      log.info(`Files:  ${chalk.white(files.length.toString())}`);
    }
  } catch (err) {
    spinner.fail('Build failed');
    log.error(String(err));
    process.exit(1);
  }

  log.blank();
  log.success(`${manifest.displayName ?? extId} built successfully`);
  log.blank();
}
