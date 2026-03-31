/*
 * commands/info.ts
 *
 * bvx info
 *
 * Displays environment diagnostics: Node, engine version, OS, BlackVideo SDK.
 */

import os    from 'os';
import chalk from 'chalk';
import { log } from '../utils/logger.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export async function cmdInfo(): Promise<void> {
  log.blank();
  log.title('Environment diagnostics');

  const enginePkg  = require('../../package.json') as { version: string; name: string };
  const nodeVer    = process.version;
  const platform   = `${os.type()} ${os.release()} (${os.arch()})`;
  const cwd        = process.cwd();

  const row = (label: string, value: string) =>
    console.log(
      `  ${chalk.dim(label.padEnd(22))} ${chalk.white(value)}`
    );

  row('Engine:',         `${enginePkg.name} v${enginePkg.version}`);
  row('Node.js:',        nodeVer);
  row('Platform:',       platform);
  row('Working dir:',    cwd);
  row('Aliases:',        'blackvideo-ext  ·  bv-ext  ·  bvx');
  row('Repository:',     'https://github.com/BlackBlazent/blackvideo-extensions-engine');
  row('Marketplace:',    'https://marketplace.blackvideo.app (coming soon)');
  row('Extension docs:', 'https://github.com/BlackBlazent/blackvideo-extensions');

  log.blank();
}
