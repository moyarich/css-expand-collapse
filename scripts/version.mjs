import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

function readOption(name) {
  const prefix = `--${name}=`;
  const matches = process.argv.slice(2).filter((arg) => arg.startsWith(prefix));

  if (matches.length > 1) {
    throw new Error(`Option --${name} may only be specified once.`);
  }

  return matches[0]?.slice(prefix.length);
}

const packageSelector = readOption("package");
const versionSpec = readOption("version");
const supportedOptions = new Set(["--package=", "--version="]);

for (const arg of process.argv.slice(2)) {
  if (![...supportedOptions].some((prefix) => arg.startsWith(prefix))) {
    throw new Error(
      `Unknown argument: ${arg}. Use --package=<name> and --version=<version-spec>.`,
    );
  }
}

if (!packageSelector || !versionSpec) {
  throw new Error(
    "Usage: npm run release -- --package=<package-directory-name> --version=<version|major|minor|patch|premajor|preminor|prepatch|prerelease>",
  );
}

if (!/^[a-z0-9][a-z0-9._-]*$/i.test(packageSelector)) {
  throw new Error(
    "Package selector must be a package directory name under packages/, such as css-expand-collapse.",
  );
}

const packageDirectory = join("packages", packageSelector);
const packagePath = join(root, packageDirectory);
const packageJsonPath = join(packagePath, "package.json");

if (!existsSync(packageJsonPath)) {
  throw new Error(`Package not found: ${packageDirectory}`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
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

const dirty = run("git", ["status", "--porcelain"], { capture: true });

if (dirty) {
  throw new Error(
    "Working tree must be clean before creating a package release.",
  );
}

const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const packageName = pkg.name;

if (!packageName) {
  throw new Error(`${packageDirectory}/package.json is missing a package name.`);
}

run("npm", [
  "version",
  versionSpec,
  "--workspace",
  packageName,
  "--git-tag-version=false",
]);

const updatedPkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const version = updatedPkg.version;
const tagName = `${basename(packageDirectory)}@${version}`;

run("git", ["add", join(packageDirectory, "package.json"), "package-lock.json"]);
run("git", ["commit", "-m", `release: ${tagName}`]);
run("git", ["tag", tagName]);

console.log("");
console.log(`Created release ${tagName}`);
console.log("Push the release commit and tag with:");
console.log("  git push --follow-tags");
