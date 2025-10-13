// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readPackageJson } from '../src/package-json.reader.mjs';
import { CouldNotReadPackageJson } from '../src/errors.mjs';
import { getSandboxDir } from './support/sandbox.mjs';
import { str2Version } from '../src/version.helper.mjs';

describe('package-json.reader', () => {
  it('returns parsed content and version', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    const packageJsonPath = join(sandboxDir, 'package.json');
    const originalContent = `{
  "name": "demo",
  "version": "1.2.3",
  "license": "MIT"
}
`;
    await writeFile(packageJsonPath, originalContent);

    const result = await readPackageJson(packageJsonPath);

    assert.equal(result.content, originalContent);
    assert.deepEqual(result.version, str2Version('1.2.3'));
  });

  it('throws when file cannot be read', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    await assert.rejects(
      () => readPackageJson(join(sandboxDir, 'package.json')),
      CouldNotReadPackageJson,
    );
  });
});
