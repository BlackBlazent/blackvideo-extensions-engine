/*
 * commands/publish.ts
 *
 * bvx publish [path]
 *
 * Prepares and publishes a .bvx bundle to the BlackVideo Marketplace.
 *
 * Steps:
 *   1. validate structure + manifest
 *   2. build .bvx if not already built
 *   3. generate checksum (sha256)
 *   4. POST to marketplace API (endpoint TBD — server phase)
 *
 * Until the marketplace server is live, this command:
 *   - Validates and builds
 *   - Writes a publish-ready manifest to dist/publish.json
 *   - Prints instructions for manual GitHub release
 */

import path   from 'path';
import fs     from 'fs';
import crypto from 'crypto';
import chalk  from 'chalk';
import ora    from 'ora';

import { log }                 from '../utils/logger.js';
import { exists, readJson, writeJson } from '../utils/fs.js';
import { validateManifest, validateStructure } from '../validators/manifest.validator.js';
import { cmdBuild }            from '../commands/build.js';
import type { ExtensionManifest } from '../validators/manifest.validator.js';

export async function cmdPublish(targetPath?: string): Promise<void> {
  const root = path.resolve(process.cwd(), targetPath ?? '.');

  log.blank();
  log.title('Publish extension');
  log.blank();

  // Validate
  const structResult = validateStructure(root);
  if (!structResult.valid) {
    log.error(`Structure validation failed. Run ${chalk.cyan('bvx validate')} for details.`);
    process.exit(1);
  }

  const manifest = await readJson<Partial<ExtensionManifest>>(path.join(root, 'manifest.json'));
  const { valid, errors } = validateManifest(manifest);
  if (!valid) { errors.forEach(e => log.error(e)); process.exit(1); }

  const extId  = manifest.id!;
  const bvxPath = path.join(root, 'dist', `${extId}.bvx`);

  // Build if .bvx doesn't exist
  if (!fs.existsSync(bvxPath)) {
    log.step('Building .bvx bundle first…');
    await cmdBuild(targetPath);
  }

  // Checksum
  const spinner = ora({ text: 'Generating checksum…', spinner: 'dots' }).start();
  let checksum = '';
  if (fs.existsSync(bvxPath)) {
    const buf = fs.readFileSync(bvxPath);
    checksum  = crypto.createHash('sha256').update(buf).digest('hex');
    spinner.succeed(`SHA-256: ${chalk.cyan(checksum.slice(0, 16))}…`);
  } else {
    spinner.warn('No .bvx file found — checksum skipped');
  }

  // Write publish manifest
  const publishManifest = {
    id:          extId,
    displayName: manifest.displayName,
    version:     manifest.version,
    author:      manifest.author,
    type:        manifest.type,
    license:     manifest.license,
    checksum,
    bvxFile:     `${extId}.bvx`,
    publishedAt: new Date().toISOString(),
    marketplace: {
      endpoint: 'https://marketplace.blackvideo.app/api/publish',
      status:   'pending — marketplace server not yet live',
    },
  };

  const publishPath = path.join(root, 'dist', 'publish.json');
  await writeJson(publishPath, publishManifest);

  log.blank();
  log.divider();
  log.success(`Publish package ready: ${chalk.cyan('dist/publish.json')}`);
  log.blank();
  log.title('Manual publish steps (until marketplace is live)');
  console.log(chalk.dim(`
  1. Go to:  https://github.com/BlackBlazent/blackvideo-extensions
  2. Create a release tagged: v${manifest.version}
  3. Upload:  dist/${extId}.bvx
  4. Upload:  dist/publish.json
  5. The BlackVideo in-app loader will discover it via the registry.
  `));
  log.divider();
  log.blank();
}
