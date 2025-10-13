// @ts-check
import { readChangelog } from './changelog.reader.mjs';
import { updateChangelog } from './changelog.writer.mjs';
import { resolveOptionValues } from './options.mjs';
import { readPackageJson } from './package-json.reader.mjs';
import { updatePackageVersion } from './package-json.writer.mjs';
import { calculateVersionByReleaseSummary, str2Version } from './version.helper.mjs';

/**
 * @param {Partial<import('./options.mjs').Options["values"]>} [partialOptions]
 * @returns {Promise<{
 *   previousVersion: import('./version.helper.mjs').VersionNumber,
 *   nextVersion: import('./version.helper.mjs').VersionNumber,
 *   indexOfNextVersionHeaderInChangelog: number,
 * }>}
 */
export async function bumpRelease(partialOptions) {
  const options = resolveOptionValues(partialOptions);

  const [releaseSummary, parsedPackageJson] = await Promise.all([
    readChangelog(options.pathToChangelog, options),
    readPackageJson(options.pathToPackageJson),
  ]);

  const previousVersion = parsedPackageJson.version;
  const nextVersion = options.nextVersion
    ? str2Version(options.nextVersion)
    : calculateVersionByReleaseSummary(parsedPackageJson.version, releaseSummary);
  await Promise.all([
    updateChangelog(options.pathToChangelog, releaseSummary.startLine, nextVersion),
    updatePackageVersion(options.pathToPackageJson, parsedPackageJson, nextVersion),
  ]);

  return {
    previousVersion,
    nextVersion,
    indexOfNextVersionHeaderInChangelog: releaseSummary.startLine + 2,
  };
}

export { str2Version, version2Str } from './version.helper.mjs';
export * from './errors.mjs';
