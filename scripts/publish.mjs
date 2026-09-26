#!/usr/bin/env node
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
import { Command } from "commander";

const root = fileURLToPath(new URL("../", import.meta.url));

const program = new Command()
  .name("publish")
  .description("Validate or publish workspace packages.")
  .option(
    "--dry-run",
    "validate package(s) and preview package contents without publishing",
  )
  .option(
    "--publish",
    "publish using PACKAGE_DIRECTORY and the configured publish target",
  )
  .showHelpAfterError()
  .addHelpText(
    "after",
    `
Environment:
  PACKAGE_DIRECTORY  Package directory, for example packages/css-expand-collapse
  PUBLISH_TARGET     github, npm, or both
  NPM_REGISTRY       Explicit registry alternative to PUBLISH_TARGET
  NPM_TAG            Distribution tag (default: latest)
  NPM_ACCESS         public or restricted (default: public)
  _GITHUB_TOKEN      GitHub Packages credential
  _NPM_TOKEN         npmjs.org credential

Examples:
  npm run release:check
  npm run publish:lib
`,
  )
  .parse();

const { dryRun, publish } = program.opts();

if (dryRun && publish) {
  program.error("Options --dry-run and --publish cannot be used together.");
}

if (!dryRun && !publish) {
  program.error("Specify either --dry-run or --publish.");
}

const envFile = join(root, ".env");

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const tag = process.env.NPM_TAG || "latest";
const access = process.env.NPM_ACCESS || "public";
const publishTarget = process.env.PUBLISH_TARGET;
const explicitRegistry = process.env.NPM_REGISTRY;

if (!["public", "restricted"].includes(access)) {
  program.error("NPM_ACCESS must be public or restricted.");
}

if (!/^[a-z][a-z0-9._-]*$/i.test(tag)) {
  program.error(
    "NPM_TAG must be a valid distribution tag, such as latest or next.",
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
    program.error(`Package not found: ${packageDirectory}`);
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

if (dryRun) {
  const selectedDirectory = process.env.PACKAGE_DIRECTORY;
  const packages = selectedDirectory
    ? [readPackage(selectedDirectory)]
    : discoverPackages();

  if (packages.length === 0) {
    program.error("No publishable packages were found under packages/*.");
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
  program.error(
    "PACKAGE_DIRECTORY is required for publishing, for example packages/css-expand-collapse.",
  );
}

const pkg = readPackage(packageDirectory);
validatePackage(pkg);

function publishToRegistry(target) {
  const registry =
    target === "github"
      ? "https://npm.pkg.github.com"
      : "https://registry.npmjs.org";
  const registryHost = new URL(registry).host;
  const authToken =
    target === "github"
      ? process.env._GITHUB_TOKEN || process.env.NODE_AUTH_TOKEN
      : process.env._NPM_TOKEN || process.env.NODE_AUTH_TOKEN;

  if (!authToken?.trim()) {
    program.error(
      target === "github"
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
      NPM_REGISTRY: registry,
      npm_config_userconfig: configFile,
    };

    if (target === "github") {
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
      return;
    }

    run(
      ["stage", "publish", "--access", access, "--tag", tag],
      env,
      pkg.path,
    );

    console.log(
      `Staged ${pkg.manifest.name}@${pkg.manifest.version} on npmjs.org. Approve the staged release with 2FA before it becomes public.`,
    );
  } finally {
    rmSync(configDir, { recursive: true, force: true });
  }
}

let targets;

if (publishTarget) {
  switch (publishTarget) {
    case "github":
      targets = ["github"];
      break;
    case "npm":
      targets = ["npm"];
      break;
    case "both":
      targets = ["github", "npm"];
      break;
    default:
      program.error("PUBLISH_TARGET must be github, npm, or both.");
  }
} else if (explicitRegistry) {
  const registryHost = new URL(explicitRegistry).host;

  switch (registryHost) {
    case "npm.pkg.github.com":
      targets = ["github"];
      break;
    case "registry.npmjs.org":
      targets = ["npm"];
      break;
    default:
      program.error(
        `Unsupported registry: ${explicitRegistry}. Use GitHub Packages or npmjs.org.`,
      );
  }
} else {
  program.error(
    "Set PUBLISH_TARGET to github, npm, or both, or set NPM_REGISTRY.",
  );
}

for (const target of targets) {
  publishToRegistry(target);
}
