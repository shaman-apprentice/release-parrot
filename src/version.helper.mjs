// @ts-check
import { InvalidCurrentVersion } from './errors.mjs';

/** @typedef {{ major: number, minor: number, patch: number, prerelease?: string }} VersionNumber */

/**
 * @param {VersionNumber} currentVersion
 * @param {import('./changelog.reader.mjs').ReleaseSummary} releaseSummary
 * @returns {VersionNumber}
 */
export function calculateVersionByReleaseSummary(currentVersion, releaseSummary) {
  if (currentVersion.prerelease)
    return { major: currentVersion.major, minor: currentVersion.minor, patch: currentVersion.patch };

  if (releaseSummary.unreleasedTotals.breaking > 0)
    return { major: currentVersion.major + 1, minor: 0, patch: 0 };

  if (releaseSummary.unreleasedTotals.feat > 0)
    return { major: currentVersion.major, minor: currentVersion.minor + 1, patch: 0 };

  return { major: currentVersion.major, minor: currentVersion.minor, patch: currentVersion.patch + 1 };
}


/** @param {VersionNumber} version */
export function version2Str(version) {
  const base = `${version.major}.${version.minor}.${version.patch}`;
  return version.prerelease ? `${base}-${version.prerelease}` : base;
}

/** @param {string} version */
export function str2Version(version) {
  const semverMatch = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-.]+))?$/.exec(version);
  if (semverMatch === null)
    throw new InvalidCurrentVersion(version);

  const [, majorStr, minorStr, patchStr, prerelease] = semverMatch;

  return {
    major: Number.parseInt(majorStr, 10),
    minor: Number.parseInt(minorStr, 10),
    patch: Number.parseInt(patchStr, 10),
    prerelease: prerelease,
  };
}

/**
 * @param {VersionNumber} a
 * @param {VersionNumber} b
 * @returns {-1 | 0 | 1}
 */
export function compareVersionNumbers(a, b) {
  if (a.major !== b.major)
    return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor)
    return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch)
    return a.patch < b.patch ? -1 : 1;

  const aPreLabel = a.prerelease;
  const bPreLabel = b.prerelease;

  const aHasPre = typeof aPreLabel === 'string';
  const bHasPre = typeof bPreLabel === 'string';

  if (!aHasPre && !bHasPre)
    return 0;
  if (!aHasPre)
    return 1;
  if (!bHasPre)
    return -1;

  const aIdentifiers = aPreLabel.split('.');
  const bIdentifiers = bPreLabel.split('.');
  const length = Math.max(aIdentifiers.length, bIdentifiers.length);

  for (let i = 0; i < length; i += 1) {
    const aId = aIdentifiers[i];
    const bId = bIdentifiers[i];

    if (aId === undefined)
      return -1;
    if (bId === undefined)
      return 1;

    const aIsNumeric = /^\d+$/.test(aId);
    const bIsNumeric = /^\d+$/.test(bId);

    if (aIsNumeric && bIsNumeric) {
      const aNum = Number(aId);
      const bNum = Number(bId);
      if (aNum < bNum)
        return -1;
      if (aNum > bNum)
        return 1;
      continue;
    }

    if (aIsNumeric)
      return -1;
    if (bIsNumeric)
      return 1;

    if (aId < bId)
      return -1;
    if (aId > bId)
      return 1;
  }

  return 0;
}
