import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const mode = process.argv[2];
const allowedModes = ["--dry-run", "--publish"];

if (process.argv.length !== 3 || !allowedModes.includes(mode)) {
  throw new Error("Use npm run release:check or npm run publish:lib.");
}

const publish = mode === "--publish";
const envFile = join(root, ".env");

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const tag = process.env.NPM_TAG || "latest";
const access = process.env.NPM_ACCESS || "public";
const registry =
  process.env.NPM_REGISTRY || "https://registry.npmjs.org";
const registryUrl = new URL(registry);
const registryHost = registryUrl.host;

if (!["public", "restricted"].includes(access)) {
  throw new Error("NPM_ACCESS must be public or restricted.");
}

if (!/^[a-z][a-z0-9._-]*$/i.test(tag)) {
  throw new Error(
    "NPM_TAG must be a valid distribution tag, such as latest or next.",
  );
}

const isGitHubPackages = registryHost === "npm.pkg.github.com";
const isNpmRegistry = registryHost === "registry.npmjs.org";

if (!isGitHubPackages && !isNpmRegistry) {
  throw new Error(
    `Unsupported registry: ${registry}. Use GitHub Packages or npmjs.org.`,
  );
}

function run(args, env = process.env, cwd = root) {
  const result = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    args,
    {
      cwd,
      env,
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `npm ${args.join(" ")} failed. Release stopped.`,
    );
  }
}

function readPackage(packageDirectory) {
  const packagePath = join(root, packageDirectory);
  const packageJsonPath = join(packagePath, "package.json");

  if (!existsSync(packageJsonPath)) {
    throw new Error(`Package not found: ${packageDirectory}`);
  }

  return {
    directory: packageDirectory,
    path: packagePath,
    manifest: JSON.parse(readFileSync(packageJsonPath, "utf8")),
  };
}

function discoverPackages() {
  const packagesRoot = join(root, "packages");

  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `packages/${entry.name}`)
    .filter((directory) =>
      existsSync(join(root, directory, "package.json")),
    )
    .map(readPackage)
    .filter(({ manifest }) => !manifest.private);
}

function validatePackage(pkg) {
  console.log(
    `\nValidating ${pkg.manifest.name}@${pkg.manifest.version} (${pkg.directory})`,
  );

  run([
    "run",
    "typecheck",
    "--workspace",
    pkg.manifest.name,
    "--if-present",
  ]);
  run([
    "run",
    "test",
    "--workspace",
    pkg.manifest.name,
    "--if-present",
  ]);
  run([
    "run",
    "build",
    "--workspace",
    pkg.manifest.name,
    "--if-present",
  ]);
  run([
    "pack",
    "--workspace",
    pkg.manifest.name,
    "--dry-run",
  ]);
}

if (!publish) {
  const selectedDirectory = process.env.PACKAGE_DIRECTORY;
  const packages = selectedDirectory
    ? [readPackage(selectedDirectory)]
    : discoverPackages();

  if (packages.length === 0) {
    throw new Error("No publishable packages were found under packages/*.");
  }

  for (const pkg of packages) {
    validatePackage(pkg);
  }

  console.log(
    `\nRelease checks passed for ${packages.length} package(s). Nothing was published.`,
  );
  process.exit(0);
}

const packageDirectory = process.env.PACKAGE_DIRECTORY;

if (!packageDirectory) {
  throw new Error(
    "PACKAGE_DIRECTORY is required for publishing, for example packages/css-expand-collapse.",
  );
}

const pkg = readPackage(packageDirectory);
validatePackage(pkg);

const authToken = isGitHubPackages
  ? process.env._GITHUB_TOKEN || process.env.NODE_AUTH_TOKEN
  : process.env._NPM_TOKEN || process.env.NODE_AUTH_TOKEN;

if (!authToken?.trim()) {
  throw new Error(
    isGitHubPackages
      ? "Set _GITHUB_TOKEN before publishing to GitHub Packages."
      : "Set _NPM_TOKEN before staging a release on npmjs.org.",
  );
}

const configDir = mkdtempSync(
  join(tmpdir(), "workspace-package-npm-"),
);
const configFile = join(configDir, "npmrc");

try {
  writeFileSync(
    configFile,
    [
      `registry=${registry}`,
      `@moyarich:registry=${registry}`,
      `//${registryHost}/:_authToken=\${NODE_AUTH_TOKEN}`,
      "",
    ].join("\n"),
    { mode: 0o600 },
  );

  const env = {
    ...process.env,
    NODE_AUTH_TOKEN: authToken,
    npm_config_userconfig: configFile,
  };

  if (isGitHubPackages) {
    run(
      [
        "publish",
        "--workspace",
        pkg.manifest.name,
        "--access",
        access,
        "--tag",
        tag,
      ],
      env,
    );
  } else {
    run(
      ["stage", "publish", "--access", access, "--tag", tag],
      env,
      pkg.path,
    );

    console.log(
      `Staged ${pkg.manifest.name}@${pkg.manifest.version} on npmjs.org. Approve the staged release with 2FA before it becomes public.`,
    );
  }
} finally {
  rmSync(configDir, { recursive: true, force: true });
}
