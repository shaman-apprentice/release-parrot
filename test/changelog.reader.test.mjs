// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readChangelog } from '../src/changelog.reader.mjs';
import { CouldNotReadChangelog, NoUnreleasedSection } from '../src/errors.mjs';
import { getSandboxDir } from './support/sandbox.mjs';
import { DefaultOptionValues } from '../src/options.mjs';

describe('changelog.reader', () => {
  it('throws `CouldNotOpenChangelog` when changelog is missing', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    const changelogPath = join(sandboxDir, 'CHANGELOG.md');
    await assert.rejects(() => readChangelog(changelogPath, DefaultOptionValues), CouldNotReadChangelog);
  });

  it('throws `NoUnreleasedSection` when changelog lacks unreleased section', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    const changelogPath = join(sandboxDir, 'CHANGELOG.md');
    await writeFile(changelogPath,`
# Changelog

# Changelog\n\n## [1.0.0] - 2025-10-15\n\n- Initial release.
`
    );

    await assert.rejects(() => readChangelog(changelogPath, DefaultOptionValues), NoUnreleasedSection);
  });

  it('throws `DuplicatedSection` when the same section appears twice', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    const changelogPath = join(sandboxDir, 'CHANGELOG.md');
    await writeFile(changelogPath,`
# Changelog

## [unreleased]

### Feat
- Add automatic release prep

### Feat
- Add duplicate section

`);

    await assert.rejects(
      () => readChangelog(changelogPath, DefaultOptionValues),
      /** @param {Error} error */
      (error) => {
        assert.equal(error.name, 'DuplicatedSection');
        return true;
      }
    );
  });

  it('returns unreleased summary until next release', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    const changelogPath = join(sandboxDir, 'CHANGELOG.md');
    await writeFile(changelogPath,`
# Changelog

## [unreleased]

### Breaking
- Drop Node 16 support

### Feat
- Add release workflow
- Improve CLI output

### Fixed
- Resolve path resolution bug

## [1.0.0] - 2025-10-01
- Initial release
`
    );

    const result = await readChangelog(changelogPath, DefaultOptionValues);

    assert.deepEqual(result, {
      startLine: 3,
      unreleasedTotals: { breaking: 1, feat: 2, fixed: 1 },
    });
  });

  it('supports custom headings via options', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    const changelogPath = join(sandboxDir, 'CHANGELOG.md');
    await writeFile(changelogPath,`
# Changelog

## [Keep working for all this to come true]

### Upsi
- Drop Node 16 support

### Hell yeah
- Add release workflow

### Let's pretend that never happened
- Resolve path resolution bug

## [1.0.0] - 2025-10-01
- Initial release
`
    );

    const result = await readChangelog(changelogPath, {
      unreleasedHeading: "## [Keep working for all this to come true]",
      breakingHeading: "### Upsi",
      featHeading: "### Hell yeah",
      fixedHeading: "### Let's pretend that never happened",
      wipHeading: "yolo",
    });

    assert.deepEqual(result, {
      startLine: 3,
      unreleasedTotals: { breaking: 1, feat: 1, fixed: 1 },
    });
  });
});
