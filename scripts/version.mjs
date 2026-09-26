import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = fileURLToPath(new URL("../", import.meta.url));

const RELEASE_USAGE = `Usage:
  npm run release -- --package=<package> --version=<version>

Options:
  --package=<package>  Package directory name under packages/
  --version=<version> SemVer version or npm version keyword
                      (major, minor, patch, premajor, preminor, prepatch, prerelease)
  --help              Show this help

Examples:
  npm run release -- --package=css-expand-collapse --version=patch
  npm run release -- --package=css-expand-collapse --version=minor
  npm run release -- --package=css-expand-collapse --version=1.0.0
`;

const {
  values: {
    package: packageSelector,
    version: versionSpec,
    help,
  },
} = parseArgs({
  options: {
    package: {
      type: "string",
    },
    version: {
      type: "string",
    },
    help: {
      type: "boolean",
      short: "h",
    },
  },
  strict: true,
  allowPositionals: false,
});

if (help) {
  console.log(RELEASE_USAGE);
  process.exit(0);
}

if (!packageSelector || !versionSpec) {
  throw new Error(
    RELEASE_USAGE,
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
