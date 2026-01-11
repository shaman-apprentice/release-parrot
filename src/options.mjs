// @ts-check

// Don't forget to update help string in /bin/index.mjs and in README.md when changing options.
/** @satisfies {import('node:util').ParseArgsConfig} */ 
export const OptionsDefinition = {
  options: {
    help: { type: "boolean", short: "h", default: false },
    pathToChangelog: { type: "string",  short: "c", default: "CHANGELOG.md" },
    pathToPackageJson: { type: "string", short: "p", default: "package.json" },
    nextVersion: { type: "string" },
    unreleasedHeading: { type: "string", default: "## [unreleased]" },
    breakingHeading: { type: "string", default: "### Breaking" },
    featHeading: { type: "string", default: "### Feat" },
    fixedHeading: { type: "string", default: "### Fixed" },
    wipHeading: { type: "string", default: "### WIP" },
    releaseHeaderTemplate: { type: "string" },
  },
  strict: true,
};

/** @typedef {ReturnType<typeof import('node:util').parseArgs<typeof OptionsDefinition>>} Options */

export const DefaultOptionValues = /** @type {Options["values"]} */ (
  Object.fromEntries(
    Object.entries(OptionsDefinition.options).map(([option, config]) => [option, 'default' in config ? config.default : undefined])
  )
);

/**
 * Merge provided option values with defaults from {@link OptionsDefinition}.
 * @param {Partial<Options["values"]>} [values]
 * @returns {Options["values"]}
 */
export function resolveOptionValues(values) {
  const providedValues = values ?? {};
  return { ...DefaultOptionValues, ...providedValues };
}