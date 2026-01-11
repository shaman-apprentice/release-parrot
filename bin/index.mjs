#!/usr/bin/env node
// @ts-check

import { parseArgs } from "node:util";
import { OptionsDefinition } from "../src/options.mjs";
import { bumpRelease } from "../src/index.mjs";
import { version2Str } from "../src/version.helper.mjs";
import { ReleaseParrotError } from "../src/errors.mjs";

const { values: options } = parseArgs(OptionsDefinition);

if (options.help) {
  printHelp();
  process.exit(0);
} else {
  try {
    const bump = await bumpRelease(options);
    console.log(`Successfully prepared ${version2Str(bump.nextVersion)} - (updated ${options.pathToChangelog} and ${options.pathToPackageJson})`);
  } catch (error) {
    if (error instanceof ReleaseParrotError) {
      console.error(error.message);
      process.exit(1);
    }

    if (error instanceof Error) {
      console.error(error.stack ?? error.message);
    } else {
      console.error(String(error));
    }

    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Usage: release-parrot [options]

Options:
  -h, --help         Show this help message
  -p, --pathToPackageJson <path>
                     Path to package.json (default: package.json)
  -c, --pathToChangelog <path>
                     Path to changelog (default: CHANGELOG.md)
      --nextVersion <version>
                     Override calculated version with provided value
      --unreleasedHeading <heading>
                     Start of heading to search for, that marks the unreleased section (default: ## [unreleased])
      --breakingHeading <heading>
                     Start of heading to search for, that marks breaking changes (default: ### Breaking)
      --featHeading <heading>
                     Start of heading to search for, that marks new features (default: ### Feat)
      --fixedHeading <heading>
                     Start of heading to search for, that marks fixes (default: ### Fixed)
      --wipHeading <heading>
                     Start of heading to search for, that marks WIP entries (default: ### WIP)
      --releaseHeaderTemplate <template>
                     Optional template for release header with {{previousVersion}} and {{nextVersion}} placeholders. Defaults to "## [{{nextVersion}}] - YYYY-MM-DD"
`);
}