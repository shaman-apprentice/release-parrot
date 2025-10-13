// @ts-check
import { readFile } from 'node:fs/promises';
import { CouldNotReadPackageJson, InvalidCurrentVersion } from './errors.mjs';
import { str2Version } from './version.helper.mjs';

/**
 * Read package.json and return its contents while validating the version field.
 * @param {string} filePath
 * @returns {Promise<{ content: string, version: import('./version.helper.mjs').VersionNumber }>}
 */
export async function readPackageJson(filePath) {
  let content;
  let parsed;
  try {
    content = await readFile(filePath, 'utf8');
    parsed = JSON.parse(content);
  } catch {
    throw new CouldNotReadPackageJson(filePath);
  }

  if (typeof parsed.version !== "string")
    throw new InvalidCurrentVersion(String(parsed.version));

  return { content, version: str2Version(parsed.version) };
}
