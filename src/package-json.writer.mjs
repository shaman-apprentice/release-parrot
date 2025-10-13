// @ts-check
import { writeFile } from 'node:fs/promises';
import { InvalidPackageBump } from './errors.mjs';
import { compareVersionNumbers, version2Str } from './version.helper.mjs';

/**
 * Update package.json with the provided version while keeping other fields intact.
 * @param {string} filePath
 * @param {{content: string, version: import('./version.helper.mjs').VersionNumber }} parsedContent
 * @param {import('./version.helper.mjs').VersionNumber} nextVersion
 */
export async function updatePackageVersion(filePath, parsedContent, nextVersion) {
  if (compareVersionNumbers(nextVersion, parsedContent.version) <= 0)
    throw new InvalidPackageBump(
      version2Str(parsedContent.version),
      version2Str(nextVersion)
    );

  const updatedContent = parsedContent.content.replace(
    /"version"(\s*:\s*)"([^"]+)"/,
    `"version"$1"${version2Str(nextVersion)}"`
  );
  await writeFile(filePath, updatedContent, 'utf8');
}
