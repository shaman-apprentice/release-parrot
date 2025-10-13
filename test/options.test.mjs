// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DefaultOptionValues, resolveOptionValues } from '../src/options.mjs';

describe('resolveOptionValues', () => {
  it('falls back to defaults when options are missing', () => {
    const result = resolveOptionValues(undefined);

    assert.deepEqual(result, DefaultOptionValues);
  });

  it('overrides defaults with provided values', () => {
    const result = resolveOptionValues({
      pathToChangelog: 'custom.md',
    });

    assert.equal(result.pathToChangelog, 'custom.md');
    assert.equal(result.pathToPackageJson, DefaultOptionValues.pathToPackageJson);
  });
});
