// @ts-check
import { readFile, writeFile } from 'node:fs/promises';
import { version2Str } from './version.helper.mjs';

/**
 * Promotes the unreleased section to a released entry and reinstates a fresh unreleased section.
 * @param {string} filePath absolute or relative path to the changelog file
 * @param {number} unreleasedHeaderIndex start index (0-based) of the unreleased section header
 * @param {import('./version.helper.mjs').VersionNumber} nextVersion semantic version to promote to
 * @param {import('./version.helper.mjs').VersionNumber} previousVersion previous semantic version
 * @param {string} [releaseHeaderTemplate] optional template for release header with {{previousVersion}} and {{nextVersion}} placeholders. Defaults to "## [{{nextVersion}}] - YYYY-MM-DD"
 * @returns {Promise<void>}
 */
export async function updateChangelog(filePath, unreleasedHeaderIndex, nextVersion, previousVersion, releaseHeaderTemplate) {
  const changelogContent = await readFile(filePath, 'utf8');
  const lineSeparator = changelogContent.includes('\r\n') ? '\r\n' : '\n';
  const lines = changelogContent.split(/\r?\n/);

  const unreleasedHeader = lines[unreleasedHeaderIndex];
  if (unreleasedHeader === undefined)
    throw new RangeError('Invalid start line provided for changelog rewrite');

  let releaseHeader = releaseHeaderTemplate
    ? releaseHeaderTemplate
      .replace(/\{\{previousVersion\}\}/g, version2Str(previousVersion))
      .replace(/\{\{nextVersion\}\}/g, version2Str(nextVersion))
    : `## [${version2Str(nextVersion)}] - ${new Date().toISOString().slice(0, 10)}`;

  const updatedLines = [
    ...lines.slice(0, unreleasedHeaderIndex),
    unreleasedHeader,
    '',
    releaseHeader,
    ...lines.slice(unreleasedHeaderIndex + 1),
  ];

  const updatedContent = updatedLines.join(lineSeparator);
  await writeFile(filePath, updatedContent, 'utf8');
}
