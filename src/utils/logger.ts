/*
 * logger.ts
 * Consistent log helpers used across all commands.
 */

import chalk from 'chalk';

const PREFIX = {
  info:    chalk.bold.cyan('  ℹ'),
  success: chalk.bold.green('  ✔'),
  warn:    chalk.bold.yellow('  ⚠'),
  error:   chalk.bold.red('  ✖'),
  step:    chalk.bold.blue('  →'),
  create:  chalk.bold.green('  +'),
  skip:    chalk.dim('  ~'),
  title:   chalk.bold.white('  ◆'),
};

export const log = {
  info:    (msg: string) => console.log(`${PREFIX.info}  ${chalk.white(msg)}`),
  success: (msg: string) => console.log(`${PREFIX.success}  ${chalk.green(msg)}`),
  warn:    (msg: string) => console.log(`${PREFIX.warn}  ${chalk.yellow(msg)}`),
  error:   (msg: string) => console.error(`${PREFIX.error}  ${chalk.red(msg)}`),
  step:    (msg: string) => console.log(`${PREFIX.step}  ${chalk.cyan(msg)}`),
  create:  (file: string) => console.log(`${PREFIX.create}  ${chalk.dim('created  ')}${chalk.white(file)}`),
  skip:    (file: string) => console.log(`${PREFIX.skip}  ${chalk.dim('skipped  ')}${chalk.dim(file)}`),
  title:   (msg: string) => console.log(`\n${PREFIX.title}  ${chalk.bold.white(msg)}\n`),
  blank:   ()            => console.log(''),
  divider: ()            => console.log(chalk.dim('  ' + '─'.repeat(54))),
};
