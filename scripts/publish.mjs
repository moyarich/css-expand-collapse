import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
if (existsSync(envFile)) process.loadEnvFile(envFile);

const pkg = JSON.parse(
  readFileSync(join(root, "packages/css-expand-collapse/package.json"), "utf8"),
);
const tag = process.env.NPM_TAG || "latest";
const access = process.env.NPM_ACCESS || "public";

if (!["public", "restricted"].includes(access)) {
  throw new Error("NPM_ACCESS must be public or restricted.");
}

if (!/^[a-z][a-z0-9._-]*$/i.test(tag)) {
  throw new Error("NPM_TAG must be a valid distribution tag, such as latest or next.");
}

if (publish && !process.env.NPM_TOKEN?.trim()) {
  throw new Error("Set NPM_TOKEN before publishing.");
}

function run(args, env = process.env) {
  const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", args, {
    cwd: root,
    env,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`npm ${args.join(" ")} failed. Release stopped.`);
  }
}

run(["run", "typecheck"]);
run(["test"]);
run(["run", "build:lib"]);

if (!publish) {
  run(["pack", "--workspace", pkg.name, "--dry-run"]);
  console.log("Release checks passed. Nothing was published.");
} else {
  const configDir = mkdtempSync(join(tmpdir(), "css-expand-collapse-npm-"));
  const configFile = join(configDir, "npmrc");

  try {
    writeFileSync(
      configFile,
      "registry=https://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n",
      { mode: 0o600 },
    );

    run(
      ["publish", "--workspace", pkg.name, "--access", access, "--tag", tag],
      {
        ...process.env,
        npm_config_userconfig: configFile,
      },
    );
  } finally {
    rmSync(configDir, { recursive: true, force: true });
  }
}
