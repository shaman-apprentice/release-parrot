// @ts-check
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { CouldNotReadChangelog, DuplicatedSection, NoUnreleasedSection, ReleaseParrotError, UnreleasedSectionIsEmpty, WIPIsPresent } from './errors.mjs';

/** @typedef {Record<'unreleasedHeading' | 'breakingHeading' | 'featHeading' | 'fixedHeading' | 'wipHeading', string>} Headers */
/** @typedef {{ startLine: number, unreleasedTotals: Record<'breaking' | 'feat' | 'fixed', number> }} ReleaseSummary */

/**
 * @param {string} filePath absolute or relative path to the changelog file
 * @param {Headers} options
 * @returns {Promise<ReleaseSummary>} summary of unreleased section
 */
export async function readChangelog(filePath, options) {
  const stream = createReadStream(filePath, { encoding: 'utf8' });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  let i = -1;
  let startLine;
  /** @type {'introduction' | 'unreleased' | keyof ReleaseSummary["unreleasedTotals"]} */
  let currentCategory = "introduction";

  /** @type {ReleaseSummary["unreleasedTotals"]} */
  const unreleasedTotals = {
    breaking: 0,
    feat: 0,
    fixed: 0,
  };

  try {
    for await (const line of rl) {
      i += 1;
      if (currentCategory === "introduction") {
        if (line.startsWith(options.unreleasedHeading)) {
          currentCategory = "unreleased";
          startLine = i;
        }
        continue;
      }

      if (line.startsWith("## [")) {
        break; // next release is reached, so we don't need to read on
      } else if (line.startsWith(options.wipHeading)) {
        throw new WIPIsPresent();
      } else if (line.startsWith(options.breakingHeading)) {
        if (unreleasedTotals.breaking > 0)
          throw new DuplicatedSection(options.breakingHeading);

        currentCategory = "breaking";
      } else if (line.startsWith(options.featHeading)) {
        if (unreleasedTotals.feat > 0)
          throw new DuplicatedSection(options.featHeading);

        currentCategory = "feat";
      } else if (line.startsWith(options.fixedHeading)) {
        if (unreleasedTotals.fixed > 0)
          throw new DuplicatedSection(options.fixedHeading);

        currentCategory = "fixed";
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        if (currentCategory === "unreleased")
          continue;

        unreleasedTotals[currentCategory] += 1;
        continue;
      }
    }

    if (startLine === undefined)
      throw new NoUnreleasedSection();
    if (unreleasedTotals.breaking === 0 && unreleasedTotals.feat === 0 && unreleasedTotals.fixed === 0)
      throw new UnreleasedSectionIsEmpty();

    return { startLine, unreleasedTotals };
  } catch (error) {
    if (error instanceof ReleaseParrotError)
      throw error;
    throw new CouldNotReadChangelog(filePath);
  } finally {
    rl.close();
    if (!stream.destroyed) {
      stream.destroy();
    }
  }
}
