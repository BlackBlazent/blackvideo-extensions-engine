/*
 * commands/upgrade.ts
 *
 * bvx upgrade
 *
 * Checks for a newer version of blackvideo-extension-engine on npm
 * and prints upgrade instructions.
 */

import chalk from 'chalk';
import ora   from 'ora';
import semver from 'semver';
import { createRequire } from 'module';
import { log } from '../utils/logger.js';

const require = createRequire(import.meta.url);

export async function cmdUpgrade(): Promise<void> {
  log.blank();
  log.title('Check for engine updates');

  const pkg         = require('../../package.json') as { version: string; name: string };
  const currentVer  = pkg.version;
  const pkgName     = pkg.name;

  const spinner = ora({ text: `Checking npm for latest ${pkgName}…`, spinner: 'dots', color: 'cyan' }).start();

  try {
    const res  = await fetch(`https://registry.npmjs.org/${pkgName}/latest`);
    const data = await res.json() as { version: string };
    const latestVer = data.version;

    spinner.stop();

    if (semver.gt(latestVer, currentVer)) {
      log.warn(`New version available: ${chalk.green(latestVer)} (current: ${chalk.dim(currentVer)})`);
      log.blank();
      log.step('Upgrade command:');
      console.log(chalk.cyan(`\n  npm install -g ${pkgName}@latest`));
      console.log(chalk.dim(`  # or`));
      console.log(chalk.cyan(`  pnpm add -g ${pkgName}@latest\n`));
    } else {
      log.success(`You are on the latest version: ${chalk.green(currentVer)}`);
    }
  } catch {
    spinner.fail('Could not reach npm registry');
    log.warn('Check your network connection and try again.');
  }

  log.blank();
}
