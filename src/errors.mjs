export class ReleaseParrotError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class CouldNotReadChangelog extends ReleaseParrotError {
  /** @param {string} filePath */
  constructor(filePath) {
    super(`Could not read changelog at ${filePath}`);
  }
}

export class NoUnreleasedSection extends ReleaseParrotError {
  constructor() {
    super('Unreleased section is missing in changelog');
  }
}

export class UnreleasedSectionIsEmpty extends ReleaseParrotError {
  constructor() {
    super('Unreleased section is empty');
  }
}

export class WIPIsPresent extends ReleaseParrotError {
  constructor() {
    super('Unreleased section includes WIP');
  }
}

export class DuplicatedSection extends ReleaseParrotError {
  /** @param {string} sectionName */
  constructor(sectionName) {
    super(`Unreleased section includes duplicated ${sectionName} section`);
  }
}

export class CouldNotReadPackageJson extends ReleaseParrotError {
  /** @param {string} filePath */
  constructor(filePath) {
    super(`Could not read package.json at ${filePath}`);
  }
}

export class InvalidPackageBump extends ReleaseParrotError {
  /**
   * @param {string} currentVersion
   * @param {string} derivedVersion
   */
  constructor(currentVersion, derivedVersion) {
    super(`package.json current version is ${currentVersion}. Derived version ${derivedVersion} must be higher`);
  }
}

export class InvalidCurrentVersion extends ReleaseParrotError {
  /** @param {string} version */
  constructor(version) {
    super(`Version "${version}" is not a valid semantic version`);
  }
}