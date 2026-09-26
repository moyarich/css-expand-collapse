#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import semver from "semver";

const root = fileURLToPath(new URL("../", import.meta.url));
const releaseTypes = [
  "patch",
  "minor",
  "major",
  "prepatch",
  "preminor",
  "premajor",
  "prerelease",
];

const program = new Command()
  .name("workspace-release")
  .description("Preview, version, commit, and tag a publishable workspace package.")
  .argument("[release]", "package name or package=version")
  .option("--package <package>", "package directory name under packages/")
  .option("--version <version>", "SemVer version or npm version keyword")
  .option("--preid <identifier>", "prerelease identifier, such as beta or rc")
  .option("--dry-run", "show the release result without changing files or git state")
  .option("--explain", "show the available version choices without changing anything")
  .showHelpAfterError()
  .addHelpText(
    "after",
    `
Examples:
  workspace-release css-expand-collapse=patch
  workspace-release css-expand-collapse=minor --dry-run
  workspace-release css-expand-collapse --explain
  npm run release -- css-expand-collapse=1.0.0
  npm run release -- --package=css-expand-collapse --version=patch
`,
  )
  .parse();

const [releaseArg] = program.args;
const options = program.opts();

function parseReleaseArgument(value) {
  if (!value) {
    return {};
  }

  if (value.includes("=")) {
    const index = value.indexOf("=");
    return {
      packageSelector: value.slice(0, index),
      versionSpec: value.slice(index + 1),
    };
  }

  return { packageSelector: value };
}

const parsed = parseReleaseArgument(releaseArg);
const packageSelector = options.package ?? parsed.packageSelector;
const versionSpec = options.version ?? parsed.versionSpec;

if (!packageSelector) {
  program.error(
    "Specify a package, for example workspace-release css-expand-collapse=patch.",
  );
}

if (!/^[a-z0-9][a-z0-9._-]*$/i.test(packageSelector)) {
  program.error(
    "Package selector must be a package directory name under packages/, such as css-expand-collapse.",
  );
}

const packageDirectory = join("packages", packageSelector);
const packagePath = join(root, packageDirectory);
const packageJsonPath = join(packagePath, "package.json");

if (!existsSync(packageJsonPath)) {
  program.error(`Package not found: ${packageDirectory}`);
}

function run(command, args, options = {}) {
  const executable =
    command === "npm" && process.platform === "win32"
      ? "npm.cmd"
      : command;

  const result = spawnSync(executable, args, {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    if (options.capture && result.stderr) {
      process.stderr.write(result.stderr);
    }

    throw new Error(
      `${command} ${args.join(" ")} failed. Release stopped.`,
    );
  }

  return options.capture ? result.stdout.trim() : "";
}

const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const packageName = pkg.name;
const currentVersion = pkg.version;

if (!packageName) {
  program.error(
    `${packageDirectory}/package.json is missing a package name.`,
  );
}

if (!semver.valid(currentVersion)) {
  program.error(
    `${packageDirectory}/package.json has an invalid version: ${currentVersion}`,
  );
}

function resolveVersion(spec) {
  if (semver.valid(spec)) {
    return spec;
  }

  if (!releaseTypes.includes(spec)) {
    program.error(
      `Invalid version: ${spec}. Use ${releaseTypes.join(", ")}, or an explicit SemVer version.`,
    );
  }

  const nextVersion = semver.inc(currentVersion, spec, options.preid);

  if (!nextVersion) {
    program.error(
      `Could not calculate ${spec} from ${currentVersion}.`,
    );
  }

  return nextVersion;
}

function versionChoices() {
  return releaseTypes.map((type) => ({
    type,
    version: semver.inc(currentVersion, type, options.preid),
  }));
}

function printChoices() {
  console.log(`${packageName}`);
  console.log(`Current version: ${currentVersion}`);
  console.log("");
  console.log("Available version changes:");

  for (const { type, version } of versionChoices()) {
    console.log(`  ${type.padEnd(12)} → ${version ?? "not available"}`);
  }

  console.log("");
  console.log("You may also provide an explicit SemVer version, such as 2.0.0.");
}

if (options.explain) {
  printChoices();
  process.exit(0);
}

if (!versionSpec) {
  printChoices();
  program.error(
    "Choose a version and run the command again, or use --explain.",
  );
}

const nextVersion = resolveVersion(versionSpec);
const tagName = `${basename(packageDirectory)}@${nextVersion}`;
const dirty = run("git", ["status", "--porcelain"], { capture: true });

function printPlan() {
  console.log("");
  console.log("Release plan");
  console.log("");
  console.log(`Package:   ${packageName}`);
  console.log(`Current:   ${currentVersion}`);
  console.log(`Requested: ${versionSpec}`);
  console.log(`Next:      ${nextVersion}`);
  console.log(`Tag:       ${tagName}`);
}

if (options.dryRun) {
  printPlan();
  console.log("");
  console.log("Dry run — no changes made.");
  console.log("Would:");
  console.log("  - update package.json and package-lock.json");
  console.log("  - create the release commit");
  console.log("  - create the package-qualified git tag");

  if (dirty) {
    console.log("");
    console.log(
      "Note: the working tree is currently dirty; a real release would stop before making changes.",
    );
  }

  process.exit(0);
}

if (dirty) {
  program.error(
    "Working tree must be clean before creating a package release.",
  );
}

printPlan();

run("npm", [
  "version",
  nextVersion,
  "--workspace",
  packageName,
  "--git-tag-version=false",
]);

run("git", [
  "add",
  join(packageDirectory, "package.json"),
  "package-lock.json",
]);
run("git", ["commit", "-m", `release: ${tagName}`]);
run("git", ["tag", tagName]);

console.log("");
console.log(`Created release ${tagName}`);
console.log("Push the release commit and tag with:");
console.log("  git push --follow-tags");
