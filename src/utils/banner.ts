/*
 * banner.ts
 * BlackVideo ASCII art banner with gradient colour.
 * Displayed at the start of every CLI session.
 */

import figlet   from 'figlet';
import gradient from 'gradient-string';
import chalk    from 'chalk';

// ─────────────────────────────────────────────────────────────
//  Gradient palette  — deep navy → electric blue → cyan
// ─────────────────────────────────────────────────────────────
const bvGradient = gradient([
  { color: '#0a0a1a', pos: 0   },
  { color: '#1a1aff', pos: 0.4 },
  { color: '#00c8ff', pos: 0.7 },
  { color: '#ffffff', pos: 1   },
]);

// ─────────────────────────────────────────────────────────────
//  Large ASCII art (figlet: "Big" font)
// ─────────────────────────────────────────────────────────────
const BV_FIGLET = figlet.textSync('BlackVideo', {
  font:             'Big',
  horizontalLayout: 'default',
  verticalLayout:   'default',
});

// ─────────────────────────────────────────────────────────────
//  Sub-title row
// ─────────────────────────────────────────────────────────────
const SUBTITLE = [
  chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'),
  chalk.bold.white('  Extension Engine') +
    chalk.dim('  ·  ') +
    chalk.cyan('blackvideo-extension-engine') +
    chalk.dim('  ·  ') +
    chalk.dim('v1.0.0'),
  chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'),
].join('\n');

const QUICK_HINT = [
  '',
  chalk.dim('  Commands: ') +
    chalk.cyan('init') + chalk.dim('  ·  ') +
    chalk.cyan('validate') + chalk.dim('  ·  ') +
    chalk.cyan('build') + chalk.dim('  ·  ') +
    chalk.cyan('dev') + chalk.dim('  ·  ') +
    chalk.cyan('publish') + chalk.dim('  ·  ') +
    chalk.cyan('info'),
  chalk.dim('  Aliases:  ') +
    chalk.yellow('blackvideo-ext') + chalk.dim('  ·  ') +
    chalk.yellow('bv-ext') + chalk.dim('  ·  ') +
    chalk.yellow('bvx'),
  '',
].join('\n');

// ─────────────────────────────────────────────────────────────
//  Export
// ─────────────────────────────────────────────────────────────

export function printBanner(): void {
  console.log('\n' + bvGradient(BV_FIGLET));
  console.log(SUBTITLE);
  console.log(QUICK_HINT);
}

/** Compact one-liner for sub-commands that don't need the full banner */
export function printCompact(): void {
  console.log(
    '\n' +
    chalk.bold.cyan('⬛ BlackVideo') +
    chalk.dim(' Extension Engine  ') +
    chalk.dim('·  ') +
    chalk.yellow('bvx') +
    '\n'
  );
}
