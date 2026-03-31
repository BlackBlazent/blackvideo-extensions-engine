/*
 * commands/init.ts
 *
 * bvx init [extension-name]
 *
 * Interactively scaffolds a new BlackVideo extension project.
 */

import path          from 'path';
import { prompt }    from 'enquirer';
import ora           from 'ora';
import chalk         from 'chalk';
import { existsSync } from 'fs';

import { log }               from '../utils/logger.js';
import { scaffoldExtension } from '../generators/scaffold.js';
import { validateManifest }  from '../validators/manifest.validator.js';
import type { TemplateContext } from '../generators/templates.js';
import type { ExtensionType, LicenseModel } from '../validators/manifest.validator.js';

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function toKebab(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

function toDisplayName(id: string): string {
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function toAuthorClass(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─────────────────────────────────────────────────────────────
//  Command
// ─────────────────────────────────────────────────────────────

export async function cmdInit(nameArg?: string): Promise<void> {
  log.blank();
  log.title('Create a new BlackVideo Extension');

  // ── Step 1: id ───────────────────────────────────────────

  const { id } = await prompt<{ id: string }>({
    type:     'input',
    name:     'id',
    message:  'Extension id (kebab-case, npm-compatible)',
    initial:  nameArg ? toKebab(nameArg) : '',
    validate: (v: string) => {
      if (!v.trim()) return 'Extension id is required';
      if (!/^[a-z0-9-]+$/.test(v)) return 'Use only lowercase letters, numbers, and hyphens';
      return true;
    },
  });

  // ── Step 2: displayName ──────────────────────────────────

  const { displayName } = await prompt<{ displayName: string }>({
    type:    'input',
    name:    'displayName',
    message: 'Display name',
    initial: toDisplayName(id),
  });

  // ── Step 3: description ──────────────────────────────────

  const { description } = await prompt<{ description: string }>({
    type:     'input',
    name:     'description',
    message:  'Short description',
    validate: (v: string) => v.trim().length >= 10 || 'Must be at least 10 characters',
  });

  // ── Step 4: author ───────────────────────────────────────

  const { author } = await prompt<{ author: string }>({
    type:     'input',
    name:     'author',
    message:  'Author name',
    validate: (v: string) => !!v.trim() || 'Author is required',
  });

  // ── Step 5: version ──────────────────────────────────────

  const { version } = await prompt<{ version: string }>({
    type:     'input',
    name:     'version',
    message:  'Version',
    initial:  '1.0.0',
    validate: (v: string) => /^\d+\.\d+\.\d+/.test(v) || 'Must be semver (e.g. 1.0.0)',
  });

  // ── Step 6: type ─────────────────────────────────────────

  const { type } = await prompt<{ type: ExtensionType }>({
    type:    'select',
    name:    'type',
    message: 'Extension type',
    choices: [
      { name: 'extension', message: 'Extension      — General-purpose enhancement'  },
      { name: 'plugin',    message: 'Plugin         — Deep playback integration'    },
      { name: 'theme',     message: 'Theme          — Visual customisation'         },
      { name: 'addon',     message: 'Add-on         — Lightweight feature addition' },
      { name: 'dev-tool',  message: 'Dev Tool       — Developer utility'            },
      { name: 'subtitle',  message: 'Subtitle       — Caption / subtitle engine'    },
    ],
  } as any);

  // ── Step 7: license ──────────────────────────────────────

  const { license } = await prompt<{ license: LicenseModel }>({
    type:    'select',
    name:    'license',
    message: 'License model',
    choices: [
      { name: 'free',         message: 'Free           — Open to all users'        },
      { name: 'trial',        message: 'Trial          — Limited-time free access' },
      { name: 'subscription', message: 'Subscription   — Recurring payment'        },
      { name: 'enterprise',   message: 'Enterprise     — B2B licensing'            },
      { name: 'internal',     message: 'Internal       — Private / in-house use'   },
    ],
  } as any);

  // ── Step 8: feature toggles ──────────────────────────────

  const { playbackHooks } = await prompt<{ playbackHooks: boolean }>({
    type:    'confirm',
    name:    'playbackHooks',
    message: 'Enable playback hooks? (VideoTheaterStage integration)',
    initial: true,
  } as any);

  const { uiSupport } = await prompt<{ uiSupport: boolean }>({
    type:    'confirm',
    name:    'uiSupport',
    message: 'Enable UI support? (container card, navigation, bottomSpace)',
    initial: true,
  } as any);

  const { cliSupport } = await prompt<{ cliSupport: boolean }>({
    type:    'confirm',
    name:    'cliSupport',
    message: 'Enable CLI support? (cli.extension.runner.ts)',
    initial: false,
  } as any);

  // ── Step 9: output directory ─────────────────────────────

  const { outputDir } = await prompt<{ outputDir: string }>({
    type:    'input',
    name:    'outputDir',
    message: 'Output directory',
    initial: `./${id}`,
  });

  const absOutput = path.resolve(process.cwd(), outputDir);

  if (existsSync(absOutput)) {
    const { overwrite } = await prompt<{ overwrite: boolean }>({
      type:    'confirm',
      name:    'overwrite',
      message: `Directory "${outputDir}" already exists. Overwrite?`,
      initial: false,
    } as any);
    if (!overwrite) {
      log.warn('Aborted — directory already exists.');
      process.exit(0);
    }
  }

  // ── Build context ────────────────────────────────────────

  const ctx: TemplateContext = {
    id,
    displayName,
    description,
    author,
    authorClass:   toAuthorClass(author),
    version,
    type,
    license,
    playbackHooks,
    uiSupport,
    cliSupport,
  };

  // ── Validate before writing ──────────────────────────────

  const result = validateManifest(ctx as any);
  if (!result.valid) {
    log.blank();
    log.error('Manifest validation failed:');
    result.errors.forEach(e => log.error(`  ${e}`));
    process.exit(1);
  }
  result.warnings.forEach(w => log.warn(w));

  // ── Scaffold ─────────────────────────────────────────────

  log.blank();
  const spinner = ora({
    text:    chalk.cyan(`Scaffolding ${chalk.bold(displayName)}…`),
    spinner: 'dots',
    color:   'cyan',
  }).start();

  try {
    await scaffoldExtension(absOutput, ctx);
    spinner.succeed(chalk.green('Extension scaffolded successfully!'));
  } catch (err) {
    spinner.fail(chalk.red('Scaffold failed'));
    log.error(String(err));
    process.exit(1);
  }

  // ── Done ─────────────────────────────────────────────────

  log.blank();
  log.divider();
  log.success(`${chalk.bold(displayName)} created at ${chalk.cyan(outputDir)}`);
  log.blank();
  log.step('Next steps:');
  console.log(chalk.dim(`\n  cd ${outputDir}`));
  console.log(chalk.dim(`  bvx dev          # start development mode`));
  console.log(chalk.dim(`  bvx validate     # validate your manifest`));
  console.log(chalk.dim(`  bvx build        # bundle into .bvx`));
  console.log(chalk.dim(`  bvx publish      # publish to marketplace\n`));
  log.divider();
  log.blank();
}