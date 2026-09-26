import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

const root = fileURLToPath(new URL("../", import.meta.url));

const program = new Command()
  .name("release")
  .description("Version and tag a publishable workspace package.")
  .requiredOption(
    "--package <package>",
    "package directory name under packages/",
  )
  .requiredOption(
    "--version <version>",
    "SemVer version or npm version keyword",
  )
  .showHelpAfterError()
  .addHelpText(
    "after",
    `
Examples:
  npm run release -- --package=css-expand-collapse --version=patch
  npm run release -- --package=css-expand-collapse --version=minor
  npm run release -- --package=css-expand-collapse --version=1.0.0
`,
  )
  .parse();

const {
  package: packageSelector,
  version: versionSpec,
} = program.opts();

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

const dirty = run("git", ["status", "--porcelain"], { capture: true });

if (dirty) {
  program.error(
    "Working tree must be clean before creating a package release.",
  );
}

const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const packageName = pkg.name;

if (!packageName) {
  program.error(
    `${packageDirectory}/package.json is missing a package name.`,
  );
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
