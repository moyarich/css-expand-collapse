#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { stdin as input, stdout as output } from "node:process";
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

const releaseDescriptions = {
  patch: "Bug-fix release",
  minor: "Backward-compatible feature release",
  major: "Breaking-change release",
  prepatch: "Prerelease for the next patch",
  preminor: "Prerelease for the next minor",
  premajor: "Prerelease for the next major",
  prerelease: "Advance the current prerelease",
};

const program = new Command()
  .name("workspace-release")
  .description("Preview, version, commit, and tag a publishable workspace package.")
  .argument("[release]", "package name or package=version")
  .option("--package <package>", "package directory name under packages/")
  .option("--version <version>", "SemVer version or npm version keyword")
  .option("--preid <identifier>", "prerelease identifier, such as beta or rc")
  .option("--dry-run", "show the release result without changing files or git state")
  .option(
    "--explain",
    "browse the available version choices without changing anything",
  )
  .showHelpAfterError()
  .addHelpText(
    "after",
    `
Examples:
  workspace-release
  workspace-release css-expand-collapse
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

function hasFzf() {
  const result = spawnSync("fzf", ["--version"], {
    cwd: root,
    encoding: "utf8",
    stdio: "ignore",
  });

  return result.status === 0;
}

function chooseWithFzf(lines, prompt) {
  const result = spawnSync(
    "fzf",
    [
      `--prompt=${prompt}`,
      "--height=40%",
      "--layout=reverse",
      "--border",
      "--no-multi",
    ],
    {
      cwd: root,
      encoding: "utf8",
      input: `${lines.join("\n")}\n`,
      stdio: ["pipe", "pipe", "inherit"],
    },
  );

  if (result.status === 130 || result.status === 1) {
    process.exit(0);
  }

  if (result.error || result.status !== 0) {
    throw result.error ?? new Error("fzf selection failed.");
  }

  return result.stdout.trim();
}

function readPackage(packageSelector) {
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

  const manifest = JSON.parse(readFileSync(packageJsonPath, "utf8"));

  if (!manifest.name) {
    program.error(
      `${packageDirectory}/package.json is missing a package name.`,
    );
  }

  if (!semver.valid(manifest.version)) {
    program.error(
      `${packageDirectory}/package.json has an invalid version: ${manifest.version}`,
    );
  }

  return {
    selector: packageSelector,
    directory: packageDirectory,
    jsonPath: packageJsonPath,
    manifest,
  };
}

function discoverPackages() {
  const packagesRoot = join(root, "packages");

  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((selector) => existsSync(join(packagesRoot, selector, "package.json")))
    .map(readPackage)
    .filter(({ manifest }) => !manifest.private);
}

function choosePackage() {
  if (!hasFzf()) {
    program.error(
      "fzf is required for interactive package selection. Install fzf or pass a package explicitly.",
    );
  }

  const packages = discoverPackages();

  if (packages.length === 0) {
    program.error("No publishable packages were found under packages/*.");
  }

  const byLine = new Map(
    packages.map((pkg) => [
      `${pkg.selector}\t${pkg.manifest.version}\t${pkg.manifest.name}`,
      pkg,
    ]),
  );

  const line = chooseWithFzf([...byLine.keys()], "Select package: ");
  return byLine.get(line);
}

const parsed = parseReleaseArgument(releaseArg);
let packageSelector = options.package ?? parsed.packageSelector;
let versionSpec = options.version ?? parsed.versionSpec;
let usedInteractiveSelection = false;

let pkg;

if (packageSelector) {
  pkg = readPackage(packageSelector);
} else {
  pkg = choosePackage();
  packageSelector = pkg.selector;
  usedInteractiveSelection = true;
}

const packageName = pkg.manifest.name;
const currentVersion = pkg.manifest.version;

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
    description: releaseDescriptions[type],
  }));
}

function printChoices() {
  console.log(packageName);
  console.log(`Current version: ${currentVersion}`);
  console.log("");
  console.log("Available version changes:");

  for (const { type, version, description } of versionChoices()) {
    console.log(
      `  ${type.padEnd(12)} → ${String(version ?? "not available").padEnd(16)} ${description}`,
    );
  }

  console.log("");
  console.log("You may also provide an explicit SemVer version, such as 2.0.0.");
}

function chooseVersion() {
  const choices = versionChoices();

  if (!hasFzf()) {
    printChoices();

    if (options.explain) {
      process.exit(0);
    }

    program.error(
      "fzf is required for interactive version selection. Install fzf or pass package=version explicitly.",
    );
  }

  const byLine = new Map(
    choices.map((choice) => [
      `${choice.type}\t${choice.version ?? "not available"}\t${choice.description}`,
      choice,
    ]),
  );

  const line = chooseWithFzf([...byLine.keys()], "Select version: ");
  return byLine.get(line);
}

if (!versionSpec) {
  const choice = chooseVersion();
  versionSpec = choice.type;
  usedInteractiveSelection = true;
}

const nextVersion = resolveVersion(versionSpec);
const tagName = `${basename(pkg.directory)}@${nextVersion}`;
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

if (options.explain) {
  printPlan();
  console.log("");
  console.log(releaseDescriptions[versionSpec] ?? "Explicit SemVer release.");
  console.log("Explain mode — no changes made.");
  process.exit(0);
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

if (usedInteractiveSelection) {
  if (!input.isTTY || !output.isTTY) {
    program.error(
      "Interactive release confirmation requires a TTY. Pass package=version for non-interactive use.",
    );
  }

  const readline = createInterface({ input, output });
  const answer = (await readline.question("\nContinue? [y/N] ")).trim().toLowerCase();
  readline.close();

  if (answer !== "y" && answer !== "yes") {
    console.log("Release cancelled.");
    process.exit(0);
  }
}

run("npm", [
  "version",
  nextVersion,
  "--workspace",
  packageName,
  "--git-tag-version=false",
]);

run("git", [
  "add",
  join(pkg.directory, "package.json"),
  "package-lock.json",
]);
run("git", ["commit", "-m", `release: ${tagName}`]);
run("git", ["tag", tagName]);

console.log("");
console.log(`Created release ${tagName}`);
console.log("Push the release commit and tag with:");
console.log("  git push --follow-tags");
