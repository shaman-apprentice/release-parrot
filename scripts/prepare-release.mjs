// @ts-check
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import { bumpRelease, version2Str } from "../src/index.mjs";

const execFileAsync = promisify(execFile);

const {
  previousVersion,
  nextVersion,
  indexOfNextVersionHeaderInChangelog
} = await bumpRelease();
const nextTag = version2Tag(nextVersion);
console.log(`Bumped version for ${nextTag}`);

const previousTag = version2Tag(previousVersion);
if (await doesTagExist(previousTag)) {
  const linkToDiffs = `https://github.com/shaman-apprentice/release-parrot/compare/${previousTag}...${nextTag}`;
  const changelogContent = await readFile("CHANGELOG.md", 'utf8');
  const lineSeparator = changelogContent.includes('\r\n') ? '\r\n' : '\n';
  const changelogLines = changelogContent.split(lineSeparator);
  const changelogWithLinkToDiff = [
    ...changelogLines.slice(0, indexOfNextVersionHeaderInChangelog),
    `${changelogLines[indexOfNextVersionHeaderInChangelog]} [compare](${linkToDiffs})`,
    ...changelogLines.slice(indexOfNextVersionHeaderInChangelog + 1),
  ].join(lineSeparator);
  await writeFile("CHANGELOG.md", changelogWithLinkToDiff, "utf8");
  console.log("Added diff link to CHANGELOG header");
}

await execFileAsync("git", ["commit", "CHANGELOG.md", "package.json", "-m", `chore(release): bump ${nextTag}`]);
await execFileAsync("git", ["push"]);
console.log("Committed and pushed CHANGELOG.md and package.json");

await execFileAsync("git", ["tag", "-a", nextTag, "-m", `chore(release): ${nextTag}`]);
await execFileAsync("git", ["push", "origin", "tag", nextTag]);
console.log(`Created tag ${nextTag} and pushed it`);

console.log(`All set up. You are ready to publish ${nextTag}`);

/** @param {string} tag */
async function doesTagExist(tag) {
  try {
    await execFileAsync("git", ["rev-parse", "--verify", `refs/tags/${tag}`]);
    return true;
  } catch (_error) {
    try {
      await execFileAsync("git", ["ls-remote", "--exit-code", "--tags", "origin", tag]);
      return true;
    } catch {
      return false;
    }
  }
}

/** @param {import("../src/version.helper.mjs").VersionNumber} version */
function version2Tag(version) {
  return `v${version2Str(version)}`;
}
