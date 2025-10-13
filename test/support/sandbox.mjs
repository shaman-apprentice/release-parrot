// @ts-check
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Reserve a sandbox directory for the given test context and ensure cleanup.
 * @param {import('node:test').TestContext} t
 * @returns {Promise<string>}
 */
export async function getSandboxDir(t) {
  const sandboxDir = await mkdtemp(join(tmpdir(), 'release-parrot-'));
  t.after(async () => {
    await rm(sandboxDir, { recursive: true, force: true });
  });
  return sandboxDir;
}
