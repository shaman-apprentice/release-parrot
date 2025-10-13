// @ts-check
import { readFile, writeFile } from 'node:fs/promises';
import { version2Str } from './version.helper.mjs';

/**
 * Promotes the unreleased section to a released entry and reinstates a fresh unreleased section.
 * @param {string} filePath absolute or relative path to the changelog file
 * @param {number} unreleasedHeaderIndex start index (0-based) of the unreleased section header
 * @param {import('./version.helper.mjs').VersionNumber} nextVersion semantic version to promote to
 * @returns {Promise<void>}
 */
export async function updateChangelog(filePath, unreleasedHeaderIndex, nextVersion) {
  const changelogContent = await readFile(filePath, 'utf8');
  const lineSeparator = changelogContent.includes('\r\n') ? '\r\n' : '\n';
  const lines = changelogContent.split(/\r?\n/);

  const unreleasedHeader = lines[unreleasedHeaderIndex];
  if (unreleasedHeader === undefined)
    throw new RangeError('Invalid start line provided for changelog rewrite');

  const updatedLines = [
    ...lines.slice(0, unreleasedHeaderIndex),
    unreleasedHeader,
    '',
    `## [${version2Str(nextVersion)}] - ${new Date().toISOString().slice(0, 10)}`,
    ...lines.slice(unreleasedHeaderIndex + 1),
  ];

  const updatedContent = updatedLines.join(lineSeparator);
  await writeFile(filePath, updatedContent, 'utf8');
}
