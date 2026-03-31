/*
 * fs.ts
 * Safe file-system helpers built on top of fs-extra.
 */

import fse    from 'fs-extra';
import path   from 'path';
import { log } from './logger.js';

/** Write a file, creating parent directories automatically. Logs the creation. */
export async function writeFile(
  filePath: string,
  content:  string,
  silent = false
): Promise<void> {
  await fse.outputFile(filePath, content, 'utf-8');
  if (!silent) log.create(path.relative(process.cwd(), filePath));
}

/** Create an empty directory (no-op if it already exists). */
export async function ensureDir(dirPath: string): Promise<void> {
  await fse.ensureDir(dirPath);
}

/** Check whether a path exists. */
export async function exists(p: string): Promise<boolean> {
  return fse.pathExists(p);
}

/** Read a file as UTF-8 string. */
export async function readFile(filePath: string): Promise<string> {
  return fse.readFile(filePath, 'utf-8');
}

/** Read a JSON file. */
export async function readJson<T = unknown>(filePath: string): Promise<T> {
  return fse.readJson(filePath) as Promise<T>;
}

/** Write a JSON file with 2-space indent. */
export async function writeJson(filePath: string, data: unknown, silent = false): Promise<void> {
  await fse.outputJson(filePath, data, { spaces: 2 });
  if (!silent) log.create(path.relative(process.cwd(), filePath));
}
