/*
 * index.ts
 *
 * BlackVideo Extension Engine — CLI entry point.
 * Wires Commander.js with all sub-commands.
 *
 * Aliases registered in package.json bin:
 *   blackvideo-ext | bv-ext | bvx
 */

import { Command }      from 'commander';
import { createRequire } from 'module';

import { printBanner, printCompact } from './utils/banner.js';
import { cmdInit }     from './commands/init.js';
import { cmdValidate } from './commands/validate.js';
import { cmdBuild }    from './commands/build.js';
import { cmdDev }      from './commands/dev.js';
import { cmdPublish }  from './commands/publish.js';
import { cmdUpgrade }  from './commands/upgrade.js';
import { cmdInfo }     from './commands/info.js';

const require = createRequire(import.meta.url);
const pkg     = require('../package.json') as { version: string };

// ─────────────────────────────────────────────────────────────
//  Root program
// ─────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('bvx')
  .description('BlackVideo Extension Engine — official scaffolding CLI')
  .version(pkg.version, '-v, --version', 'Output the current version')
  .addHelpText('beforeAll', () => { printBanner(); return ''; });

// ─────────────────────────────────────────────────────────────
//  bvx init [name]
// ─────────────────────────────────────────────────────────────

program
  .command('init [name]')
  .description('Scaffold a new BlackVideo extension project')
  .action(async (name?: string) => {
    printBanner();
    await cmdInit(name);
  });

// ─────────────────────────────────────────────────────────────
//  bvx validate [path]
// ─────────────────────────────────────────────────────────────

program
  .command('validate [path]')
  .description('Validate extension structure and manifest')
  .action(async (targetPath?: string) => {
    printCompact();
    await cmdValidate(targetPath);
  });

// ─────────────────────────────────────────────────────────────
//  bvx build [path]
// ─────────────────────────────────────────────────────────────

program
  .command('build [path]')
  .description('Build extension into a .bvx bundle')
  .action(async (targetPath?: string) => {
    printCompact();
    await cmdBuild(targetPath);
  });

// ─────────────────────────────────────────────────────────────
//  bvx dev [path]
// ─────────────────────────────────────────────────────────────

program
  .command('dev [path]')
  .description('Start development mode with file watcher')
  .action(async (targetPath?: string) => {
    printCompact();
    await cmdDev(targetPath);
  });

// ─────────────────────────────────────────────────────────────
//  bvx publish [path]
// ─────────────────────────────────────────────────────────────

program
  .command('publish [path]')
  .description('Validate, build, and publish to BlackVideo Marketplace')
  .action(async (targetPath?: string) => {
    printCompact();
    await cmdPublish(targetPath);
  });

// ─────────────────────────────────────────────────────────────
//  bvx upgrade
// ─────────────────────────────────────────────────────────────

program
  .command('upgrade')
  .description('Check for updates to the extension engine')
  .action(async () => {
    printCompact();
    await cmdUpgrade();
  });

// ─────────────────────────────────────────────────────────────
//  bvx info
// ─────────────────────────────────────────────────────────────

program
  .command('info')
  .description('Show environment diagnostics')
  .action(async () => {
    printCompact();
    await cmdInfo();
  });

// ─────────────────────────────────────────────────────────────
//  Default: show banner + help when no command given
// ─────────────────────────────────────────────────────────────

program.action(() => {
  printBanner();
  program.help();
});

// ─────────────────────────────────────────────────────────────
//  Parse
// ─────────────────────────────────────────────────────────────

program.parseAsync(process.argv);
