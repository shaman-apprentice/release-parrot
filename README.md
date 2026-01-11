# release-parrot 🦜

Automate changelog and package.json version bumps for Node.js libraries. `release-parrot` reads an existing changelog, promotes its unreleased section to the next semantic version and updates version of package.json accordingly.

See [Behaviour details](#Behaviour-details) for more details. See the [CHANGELOG.md](./CHANGELOG.md) of this project for an example changelog.

## Usage

See [options](#Configuration-options) for all available options.

```sh
npx -p @shaman-apprentice/release-parrot release-parrot 
```

```js
import { bumpRelease } from "@shaman-apprentice/release-parrot";

await bumpRelease(); // accepts same options as the cli command and returns new calculated version
```

### Version helper utilities

This library exposes internally used semantic version helpers. They are useful when you need to parse a version string and convert it back after making adjustments:

```js
import { str2Version, version2Str } from "@shaman-apprentice/release-parrot";

const parsed = str2Version("2.1.3-beta.4"); // { major: 2, minor: 1, patch: 3, prerelease: "beta.4" }
const serialized = version2Str(parsed); // "2.1.3-beta.4"
```

## Configuration options


All of these flags map one-to-one to the `bumpRelease` options when you consume the library from JavaScript.

| Flag | Description | Default |
| --- | --- | --- |
| `-h`, `--help` | Print the CLI help and exit. | `false` |
| `-c`, `--pathToChangelog <path>` | Path to the changelog file that holds the `## [unreleased]` section. | `CHANGELOG.md` |
| `-p`, `--pathToPackageJson <path>` | Path to the `package.json` file that should be bumped alongside the changelog. | `package.json` |
| `--nextVersion <version>` | Explicitly set the version to use instead of deriving it from the changelog entries and current version in package.json. Accepts any valid semver string. | _(unused)_ |
| `--unreleasedHeading <heading>` | Override the heading text that marks the start of the unreleased section. Useful when your changelog uses different phrasing. | `## [unreleased]` |
| `--breakingHeading <heading>` | Heading that lists breaking changes. | `### Breaking` |
| `--featHeading <heading>` | Heading that lists new features. | `### Feat` |
| `--fixedHeading <heading>` | Heading that lists fixes. | `### Fixed` |
| `--wipHeading <heading>` | Heading that marks work-in-progress entries. Presence of this section aborts the release. | `### WIP` |
| `--releaseHeaderTemplate <template>` | Template for the release header with `{{previousVersion}}` and `{{nextVersion}}` placeholders. When provided, it replaces the default `## [version] - date` format. | `'## [{{nextVersion}}] - YYYY-MM-DD'` |


## Behaviour details

1. Reads the changelog and throws `CouldNotReadChangelog` if the file cannot be read
2. Validates the *unreleased*-section:
   - Throws `NoUnreleasedSection` if the section is missing
   - Throws `UnreleasedSectionIsEmpty` if the section is empty
   - Throws `WIPIsPresent` if the section still contains a *WIP*-subsection
3. Reads the current version from package.json
   - Throws `CouldNotReadPackageJson` if the file cannot be read
   - Throws `InvalidCurrentVersion` if the version string is not valid semver
4. Derives the next version number using [semver rules](https://semver.org/):
   - If `nextVersion` is provided it is used verbatim
   - Breaking changes bump the major version
   - Features bump the minor version unless the major was already bumped
   - Fixes-only releases bump the patch version
5. Throws `InvalidPackageBump` if the derived version would be lower than the current one
6. Rewrites the *unreleased* section as the newest release entry, adding the version number and current date
7. Updates *package.json* to the same version
8. Inserts a fresh, empty `## [unreleased]` section at the top of the changelog

All errors extend `ReleaseParrotError` and are exported from this library.

## Versioning

`release-parrot` adheres to [semver](https://semver.org/). Generated changelog entries follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The library uses itself for promoting next releases 🦜
