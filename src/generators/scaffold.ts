/*
 * scaffold.ts
 *
 * Orchestrates file generation for a new extension.
 * Takes a TemplateContext and writes every file in the
 * standard BlackVideo extension structure.
 */

import path from 'path';
import { writeFile, writeJson, ensureDir } from '../utils/fs.js';
import { log } from '../utils/logger.js';
import type { TemplateContext } from './templates.js';
import {
  tManifest, tPackageJson, tPackageNls, tExtensionConfig,
  tCgManifest, tBlackvideoIgnore, tIndex,
  tSettingsConfig, tServicesConfig,
  tInstallHandler, tActiveHandler, tDeactivateHandler, tUninstallHandler,
  tCliRunner, tContainerCard, tNavigation, tBottomSpace,
} from './templates.js';

export async function scaffoldExtension(
  outputDir: string,
  ctx: TemplateContext
): Promise<void> {
  const p = (...parts: string[]) => path.join(outputDir, ...parts);

  // ── Directories ────────────────────────────────────────────
  log.title('Creating directories');
  const dirs = [
    'config',
    'src/assets',
    'src/components/ui',
    'src/utils',
    'src/scripts',
    ...(ctx.cliSupport ? ['cli'] : []),
  ];
  for (const dir of dirs) {
    await ensureDir(p(dir));
  }

  // ── Root files ─────────────────────────────────────────────
  log.title('Generating root files');
  await writeFile(p('manifest.json'),                tManifest(ctx));
  await writeFile(p('package.json'),                 tPackageJson(ctx));
  await writeFile(p('package.nls.json'),             tPackageNls(ctx));
  await writeFile(p('extension-configuration.json'), tExtensionConfig(ctx));
  await writeFile(p('cgmanifest.json'),              tCgManifest(ctx));
  await writeFile(p('.blackvideoignore'),             tBlackvideoIgnore());
  await writeFile(p('index.ts'),                     tIndex(ctx));

  // Placeholder icon (1×1 transparent PNG — developer replaces with real icon)
  const PLACEHOLDER_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const { createWriteStream } = await import('fs');
  const iconOut = p('icon.png');
  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(iconOut);
    ws.write(PLACEHOLDER_PNG);
    ws.end();
    ws.on('finish', resolve);
    ws.on('error', reject);
  });
  log.create(path.relative(process.cwd(), iconOut));

  // ── Config files ───────────────────────────────────────────
  log.title('Generating config files');
  await writeFile(p('config/@settings.config.ts'),             tSettingsConfig(ctx));
  await writeFile(p('config/services.config.ts'),              tServicesConfig(ctx));
  await writeFile(p('config/extension.install.handler.ts'),    tInstallHandler(ctx));
  await writeFile(p('config/extension.active.handler.ts'),     tActiveHandler(ctx));
  await writeFile(p('config/extension.deactivate.handler.ts'), tDeactivateHandler(ctx));
  await writeFile(p('config/extension.uninstall.handler.ts'),  tUninstallHandler(ctx));

  // ── CLI ────────────────────────────────────────────────────
  if (ctx.cliSupport) {
    log.title('Generating CLI runner');
    await writeFile(p('cli/cli.extension.runner.ts'), tCliRunner(ctx));
  }

  // ── UI components ──────────────────────────────────────────
  log.title('Generating UI components');
  await writeFile(p('src/components/extension.container.card.tsx'), tContainerCard(ctx));
  await writeFile(p('src/components/ui/navigation.tsx'),             tNavigation(ctx));
  await writeFile(p('src/components/ui/bottomSpace.tsx'),            tBottomSpace(ctx));

  // ── .gitkeep placeholders for empty dirs ───────────────────
  for (const empty of ['src/assets', 'src/utils', 'src/scripts']) {
    await writeFile(p(empty, '.gitkeep'), '', true);
  }
}
