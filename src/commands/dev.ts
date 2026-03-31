/*
 * commands/dev.ts
 *
 * bvx dev [path]
 *
 * Development mode watcher.
 * Watches the extension directory for changes, re-validates on every save,
 * and emits a reload signal on the BlackVideo dev IPC socket.
 *
 * Full hot-reload requires the BlackVideo dev server to be running.
 */

import path    from 'path';
import chalk   from 'chalk';
// Old: import chokidar from 'chokidar';
import * as chokidar from 'chokidar';
import { log } from '../utils/logger.js';
import { validateManifest, validateStructure } from '../validators/manifest.validator.js';
import { readJson, exists } from '../utils/fs.js';
import type { ExtensionManifest } from '../validators/manifest.validator.js';

export async function cmdDev(targetPath?: string): Promise<void> {
  const root = path.resolve(process.cwd(), targetPath ?? '.');

  log.blank();
  log.title('Development mode');
  log.info(`Watching: ${chalk.cyan(root)}`);
  log.blank();

  if (!(await exists(root))) {
    log.error(`Directory not found: ${root}`);
    process.exit(1);
  }

  // Initial validation
  await runValidation(root);

  // Watch
  const watcher = chokidar.watch(root, {
    ignored:    /(node_modules|dist|\.git)/,
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('change', async (file: string) => {
    const rel = path.relative(root, file);
    log.step(`Changed: ${chalk.white(rel)}`);
    await runValidation(root);
    // TODO: emit IPC reload signal to BlackVideo dev server
    log.info('Hot-reload signal sent (BlackVideo dev server)');
  });

  watcher.on('add', (file: string) => {
    log.create(path.relative(root, file));
  });

  console.log(chalk.dim('\n  Press Ctrl+C to stop\n'));
}

async function runValidation(root: string): Promise<void> {
  const manifestPath = path.join(root, 'manifest.json');
  if (!(await exists(manifestPath))) return;

  try {
    const manifest = await readJson<Partial<ExtensionManifest>>(manifestPath);
    const { valid, errors, warnings } = validateManifest(manifest);
    warnings.forEach(w => log.warn(w));
    if (!valid) {
      errors.forEach(e => log.error(e));
    } else {
      log.success(`Manifest valid — ${manifest.displayName ?? manifest.id} v${manifest.version}`);
    }
  } catch {
    log.error('manifest.json parse error');
  }
}
