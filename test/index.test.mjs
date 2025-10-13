// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { bumpRelease, str2Version, version2Str } from '../src/index.mjs';
import { getSandboxDir } from './support/sandbox.mjs';

/** @typedef {import('../src/options.mjs').Options["values"]} OptionValues */

describe('bumpRelease', () => {
  it('promotes unreleased changes into a new release entry', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    const pathToChangelog = join(sandboxDir, 'CHANGELOG.md');
    const pathToPackageJson = join(sandboxDir, 'package.json');

    await writeFile(pathToPackageJson, `${JSON.stringify({ name: 'example', version: '1.2.3' }, null, 2)}\n`);
    await writeFile(pathToChangelog, `# Changelog

## [unreleased]

### Breaking
- drop support for legacy browsers

### Feat
- introduce shiny feature flag

### Fixed
- patch memory leak in worker

## [1.2.3] - 2025-01-01
`);

  const { previousVersion, nextVersion } = await bumpRelease({ pathToChangelog, pathToPackageJson });

    const updatedPackageJson = JSON.parse(await readFile(pathToPackageJson, 'utf8'));
    const updatedChangelog = await readFile(pathToChangelog, 'utf8');

  assert.equal(updatedPackageJson.version, '2.0.0');
  assert.equal(version2Str(previousVersion), '1.2.3');
  assert.equal(version2Str(nextVersion), '2.0.0');
    assert.match(updatedChangelog, /## \[unreleased\]\n\n## \[2\.0\.0\] - \d{4}-\d{2}-\d{2}\n\n### Breaking/);
    assert.ok(
      updatedChangelog.indexOf('## [2.0.0]') < updatedChangelog.indexOf('## [1.2.3]'),
      'new release should precede previous releases'
    );
  });

  it('respects custom headings when promoting a release', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    const changelogPath = join(sandboxDir, 'CHANGELOG.md');
    const packageJsonPath = join(sandboxDir, 'package.json');

    await writeFile(packageJsonPath, `${JSON.stringify({ name: 'example', version: '3.4.5' }, null, 2)}\n`);
    await writeFile(changelogPath, `# Changelog

## Upcoming

#### Breaking Changes
- update API contract

#### Features
- add experimental endpoint

#### Fixes
- resolve timeout issue

## [3.4.5] - 2025-03-01
`);

    const options = {
      pathToChangelog: changelogPath,
      pathToPackageJson: packageJsonPath,
      unreleasedHeading: '## Upcoming',
      breakingHeading: '#### Breaking Changes',
      featHeading: '#### Features',
      fixedHeading: '#### Fixes',
    };

  const { previousVersion, nextVersion } = await bumpRelease(options);

    const updatedPackageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const updatedChangelog = await readFile(changelogPath, 'utf8');

  assert.equal(updatedPackageJson.version, '4.0.0');
  assert.equal(version2Str(previousVersion), '3.4.5');
  assert.equal(version2Str(nextVersion), '4.0.0');
    assert.match(updatedChangelog, /## Upcoming\n\n## \[4\.0\.0\] - \d{4}-\d{2}-\d{2}\n/);
    assert.match(updatedChangelog, /#### Breaking Changes\n- update API contract/);
  });

  it('uses nextVersion option as the next version verbatim', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    const changelogPath = join(sandboxDir, 'CHANGELOG.md');
    const packageJsonPath = join(sandboxDir, 'package.json');

    await writeFile(packageJsonPath, `${JSON.stringify({ name: 'example', version: '1.2.3' }, null, 2)}\n`);
    await writeFile(changelogPath, `# Changelog

## [unreleased]

### Feat
- add something neat
`);

    /** @type {Partial<OptionValues>} */
    const options = {
      pathToChangelog: changelogPath,
      pathToPackageJson: packageJsonPath,
      nextVersion: '1.3.0-alpha.1',
    };

  const { previousVersion, nextVersion } = await bumpRelease(options);

    const updatedPackageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const updatedChangelog = await readFile(changelogPath, 'utf8');

  assert.equal(updatedPackageJson.version, '1.3.0-alpha.1');
  assert.match(updatedChangelog, /## \[1\.3\.0-alpha\.1\] -/);
  assert.equal(version2Str(previousVersion), '1.2.3');
  assert.equal(version2Str(nextVersion), '1.3.0-alpha.1');
  });

  it('exposes version helpers for consumers', () => {
    const parsed = str2Version('2.1.3-beta.4');
    assert.equal(version2Str(parsed), '2.1.3-beta.4');
  });
});
