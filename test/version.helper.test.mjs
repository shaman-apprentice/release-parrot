// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateVersionByReleaseSummary, compareVersionNumbers, str2Version, version2Str } from '../src/version.helper.mjs';
import { InvalidCurrentVersion } from '../src/errors.mjs';

/** @typedef {import('../src/changelog.reader.mjs').ReleaseSummary} ReleaseSummary */

describe('version.helper', () => {
  it('returns a major bump when breaking changes exist', () => {
    const summary = {
      startLine: 0,
      endLine: 0,
      unreleasedTotals: { breaking: 1, feat: 1, fixed: 1 },
    };
    const currentVersion = { major: 1, minor: 2, patch: 3 };

    assert.deepEqual(
      calculateVersionByReleaseSummary(currentVersion, summary),
      { major: 2, minor: 0, patch: 0 },
    );
  });

  it('returns a minor bump when features exist without breaking changes', () => {
    const summary = {
      startLine: 0,
      endLine: 0,
      unreleasedTotals: { breaking: 0, feat: 3, fixed: 1 },
    };
    const currentVersion = { major: 1, minor: 2, patch: 3 };

    assert.deepEqual(
      calculateVersionByReleaseSummary(currentVersion, summary),
      { major: 1, minor: 3, patch: 0 },
    );
  });

  it('returns a patch bump when only fixes exist', () => {
    const summary = {
      startLine: 0,
      endLine: 0,
      unreleasedTotals: { breaking: 0, feat: 0, fixed: 5 },
    };
    const currentVersion = { major: 1, minor: 2, patch: 3 };

    assert.deepEqual(
      calculateVersionByReleaseSummary(currentVersion, summary),
      { major: 1, minor: 2, patch: 4 },
    );
  });

  it('parses a valid version string', () => {
    const version = str2Version('1.2.3');

    assert.deepEqual(version, { major: 1, minor: 2, patch: 3, prerelease: undefined });
  });

  it('throws for invalid version strings', () => {
    assert.throws(() => str2Version('1.2'), InvalidCurrentVersion);
    assert.throws(() => str2Version('01.2.3'), InvalidCurrentVersion);
  });

  it('marks versions ending with a hyphen as prerelease', () => {
    const version = str2Version('1.2.3-beta');

    assert.deepEqual(version, { major: 1, minor: 2, patch: 3, prerelease: 'beta' });
  });

  it('compares version numbers in semver order', () => {
    const base = { major: 1, minor: 2, patch: 3 };
    const higherPatch = { major: 1, minor: 2, patch: 4 };
    const higherMajor = { major: 2, minor: 2, patch: 4 };
    const lowerMinor = { major: 1, minor: 1, patch: 9 };
    const prerelease = { major: 1, minor: 2, patch: 3, prerelease: 'alpha.1' };

    assert.equal(compareVersionNumbers(base, higherPatch), -1);
    assert.equal(compareVersionNumbers(base, lowerMinor), 1);
    assert.equal(compareVersionNumbers(base, higherMajor), -1);
    assert.equal(compareVersionNumbers(base, { ...base }), 0);
    assert.equal(compareVersionNumbers(prerelease, base), -1);
  });

  it('compares versions when numeric identifiers have multiple digits', () => {
    const base = { major: 1, minor: 2, patch: 3 };
    const higher = { major: 1, minor: 10, patch: 4 };
    const preBase = { major: 1, minor: 2, patch: 3, prerelease: 'alpha.2' };
    const preHigher = { major: 1, minor: 2, patch: 3, prerelease: 'alpha.10' };

    assert.equal(compareVersionNumbers(base, higher), -1);
    assert.equal(compareVersionNumbers(preBase, preHigher), -1);
  })

  it('converts prerelease versions back to strings', () => {
    const version = { major: 1, minor: 2, patch: 3, prerelease: 'alpha.1' };

    assert.equal(version2Str(version), '1.2.3-alpha.1');
  });

  it('orders prerelease identifiers according to semver precedence', () => {
    const alpha1 = str2Version('1.2.3-alpha.1');
    const alpha2 = str2Version('1.2.3-alpha.2');
    const release = str2Version('1.2.3');

    assert.equal(compareVersionNumbers(alpha1, alpha2), -1);
    assert.equal(compareVersionNumbers(release, alpha2), 1);
  });
});
