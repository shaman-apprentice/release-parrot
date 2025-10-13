// @ts-check
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { updatePackageVersion } from '../src/package-json.writer.mjs';
import { InvalidPackageBump } from '../src/errors.mjs';
import { getSandboxDir } from './support/sandbox.mjs';
import { readPackageJson } from '../src/package-json.reader.mjs';
import { str2Version } from '../src/version.helper.mjs';

describe('package-json.writer', () => {
  it('updates version while keeping other fields intact', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    const packageJsonPath = join(sandboxDir, 'package.json');
    const originalContent = `{
  "name": "demo",
  "version": "1.2.3",
  "license": "MIT"
}
`;
    await writeFile(packageJsonPath, originalContent);

    const parsedContent = await readPackageJson(packageJsonPath);
    await updatePackageVersion(packageJsonPath, parsedContent, str2Version('1.2.4'));

    const updatedContent = await readFile(packageJsonPath, 'utf8');
    assert.equal(JSON.parse(updatedContent).version, '1.2.4');
    assert.equal(
      updatedContent,
      originalContent.replace('"version": "1.2.3"', '"version": "1.2.4"'),
    );
  });

  it('throws when the new version is not greater than current version', async (t) => {
    const sandboxDir = await getSandboxDir(t);
    const packageJsonPath = join(sandboxDir, 'package.json');
    await writeFile(packageJsonPath, '{ "name": "demo", "version": "1.2.3" }');

    const parsedContent = await readPackageJson(packageJsonPath);
    await assert.rejects(
      () => updatePackageVersion(packageJsonPath, parsedContent, str2Version('1.2.3')),
      InvalidPackageBump,
    );
  });
});
