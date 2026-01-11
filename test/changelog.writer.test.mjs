// @ts-check
import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readChangelog } from '../src/changelog.reader.mjs';
import { updateChangelog } from '../src/changelog.writer.mjs';
import { getSandboxDir } from './support/sandbox.mjs';
import { DefaultOptionValues } from '../src/options.mjs';

describe('changelog.writer', () => {
  it('promotes unreleased section to new release and adds empty unreleased section', async (t) => {
    mock.timers.enable({ apis: ['Date'], now: new Date('2000-01-30T00:02:02Z') });
    t.after(() => {
      mock.timers.reset();
    });
    
    const sandboxDir = await getSandboxDir(t);
    const changelogPath = join(sandboxDir, 'CHANGELOG.md');
    await writeFile(changelogPath, `# Changelog

This changelog is roughly based on [Keep a Changelog](http://keepachangelog.com/).

## [unreleased] (Breaking 🐱 | Feat 🚀 | Fixed 🐞)

### Feat
- Add release workflow
- Improve CLI output

### Fixed
- Resolve path resolution bug
`);

    const { startLine } = await readChangelog(changelogPath, DefaultOptionValues);
    const previousVersion = { major: 1, minor: 0, patch: 0 };
    const version = { major: 1, minor: 1, patch: 0 };

    await updateChangelog(changelogPath, startLine, version, previousVersion);

    const updated = await readFile(changelogPath, 'utf8');

    assert.equal(updated, `# Changelog

This changelog is roughly based on [Keep a Changelog](http://keepachangelog.com/).

## [unreleased] (Breaking 🐱 | Feat 🚀 | Fixed 🐞)

## [1.1.0] - 2000-01-30

### Feat
- Add release workflow
- Improve CLI output

### Fixed
- Resolve path resolution bug
`);
  });

  it('uses custom release header template', async (t) => {
    mock.timers.enable({ apis: ['Date'], now: new Date('2000-01-30T00:02:02Z') });
    t.after(() => {
      mock.timers.reset();
    });
    
    const sandboxDir = await getSandboxDir(t);
    const changelogPath = join(sandboxDir, 'CHANGELOG.md');
    await writeFile(changelogPath, `# Changelog

## [unreleased]

### Feat
- New feature
`);

    const { startLine } = await readChangelog(changelogPath, DefaultOptionValues);
    const previousVersion = { major: 1, minor: 0, patch: 5 };
    const nextVersion = { major: 1, minor: 1, patch: 0 };
    const template = '## [{{nextVersion}}] - Released from {{previousVersion}}';

    await updateChangelog(changelogPath, startLine, nextVersion, previousVersion, template);

    const updated = await readFile(changelogPath, 'utf8');

    assert.equal(updated, `# Changelog

## [unreleased]

## [1.1.0] - Released from 1.0.5

### Feat
- New feature
`);
  });
});
