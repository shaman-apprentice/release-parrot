---
mode: 'agent'
description: 'Initial setup
tools: ['search', 'fetch', 'edit']
---

I am the author of an open source library. I want to automate the process of updating the changelog and version number. The version numbers are based on https://semver.org/. The changelog is roughly based on https://keepachangelog.com/en/1.1.0.

I want to write a JavaScript library, which does the following:

- It should read the changelog.md file. The path to the file can be passed in a parameter object and defaults to "./CHANGELOG.md".
- If the changelog does not include a `## [unreleased]`-section, it should throw an error.
- If the changelog `## [unreleased]`-section contains no items, it should throw an error.
- If the `## [unreleased]` section contains a `WIP 🏗️`-section it should throw an error.
- Otherwise it should update the `## [unreleased]`-section to make it the next release. The new release number should be calculated by semantic versioning according to its unreleased entries. It should also update the version number in the package.json.

Validate my requirements and write the README.md of this project.