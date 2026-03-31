/*
 * commands/validate.ts
 *
 * bvx validate [path]
 *
 * Validates:
 *   1. Directory structure — all required files present
 *   2. manifest.json schema — all fields valid
 *   3. Permission scopes — against allowed whitelist
 *   4. Blocked permission combinations
 */

import path   from 'path';
import chalk  from 'chalk';
import ora    from 'ora';

import { log }                                     from '../utils/logger.js';
import { readJson, exists }                        from '../utils/fs.js';
import { validateManifest, validateStructure }     from '../validators/manifest.validator.js';
import type { ExtensionManifest }                  from '../validators/manifest.validator.js';

export async function cmdValidate(targetPath?: string): Promise<void> {
  const root = path.resolve(process.cwd(), targetPath ?? '.');

  log.blank();
  log.title(`Validating extension`);
  log.info(`Path: ${chalk.cyan(root)}`);
  log.blank();

  // ── Check root exists ────────────────────────────────────

  if (!(await exists(root))) {
    log.error(`Directory not found: ${root}`);
    process.exit(1);
  }

  // ── Structure check ──────────────────────────────────────

  const spinner = ora({ text: 'Checking directory structure…', spinner: 'dots', color: 'cyan' }).start();
  const structResult = validateStructure(root);
  spinner.stop();

  log.title('Directory Structure');
  structResult.present.forEach(f => log.success(f));
  structResult.missing.forEach(f => log.error(`MISSING: ${f}`));

  if (!structResult.valid) {
    log.blank();
    log.error(`Structure check failed — ${structResult.missing.length} required file(s) missing`);
    // Continue to manifest check anyway
  } else {
    log.blank();
    log.success('Structure check passed');
  }

  // ── Manifest check ───────────────────────────────────────

  const manifestPath = path.join(root, 'manifest.json');
  if (!(await exists(manifestPath))) {
    log.blank();
    log.error('manifest.json not found — cannot continue validation');
    process.exit(1);
  }

  let manifest: Partial<ExtensionManifest>;
  try {
    manifest = await readJson<Partial<ExtensionManifest>>(manifestPath);
  } catch {
    log.error('manifest.json is not valid JSON');
    process.exit(1);
  }

  log.blank();
  log.title('Manifest Validation');

  const { valid, errors, warnings } = validateManifest(manifest);

  if (warnings.length) {
    warnings.forEach(w => log.warn(w));
    log.blank();
  }

  if (errors.length) {
    errors.forEach(e => log.error(e));
    log.blank();
    log.error(`Manifest validation failed — ${errors.length} error(s)`);
    process.exit(1);
  }

  log.success('Manifest is valid');
  log.blank();
  log.divider();

  if (!structResult.valid) {
    log.warn('Extension has structural issues. Fix missing files before publishing.');
    process.exit(1);
  }

  log.success(`Extension "${manifest.displayName ?? manifest.id}" passed all checks`);
  log.blank();
}
