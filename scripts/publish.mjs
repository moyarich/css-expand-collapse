import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
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

const packageDirectory = process.env.PACKAGE_DIRECTORY;

if (!packageDirectory) {
  throw new Error(
    "PACKAGE_DIRECTORY is required, for example packages/css-expand-collapse.",
  );
}
const packagePath = join(root, packageDirectory);
const pkg = JSON.parse(
  readFileSync(join(packagePath, "package.json"), "utf8"),
);

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

const authToken = isGitHubPackages
  ? process.env._GITHUB_TOKEN || process.env.NODE_AUTH_TOKEN
  : process.env._NPM_TOKEN || process.env.NODE_AUTH_TOKEN;

if (publish && !authToken?.trim()) {
  throw new Error(
    isGitHubPackages
      ? "Set _GITHUB_TOKEN before publishing to GitHub Packages."
      : "Set _NPM_TOKEN before staging a release on npmjs.org.",
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

run(["run", "typecheck", "--workspace", pkg.name, "--if-present"]);
run(["run", "test", "--workspace", pkg.name, "--if-present"]);
run(["run", "build", "--workspace", pkg.name, "--if-present"]);

if (!publish) {
  run(["pack", "--workspace", pkg.name, "--dry-run"]);
  console.log("Release checks passed. Nothing was published.");
} else {
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
        "always-auth=true",
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
          pkg.name,
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
        packagePath,
      );

      console.log(
        `Staged ${pkg.name}@${pkg.version} on npmjs.org. Approve the staged release with 2FA before it becomes public.`,
      );
    }
  } finally {
    rmSync(configDir, { recursive: true, force: true });
  }
}
