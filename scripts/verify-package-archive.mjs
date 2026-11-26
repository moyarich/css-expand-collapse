import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const selector = process.argv[2] ?? "css-expand-collapse";
if (!/^[a-z0-9][a-z0-9._-]*$/i.test(selector)) {
  throw new Error("Expected a package directory name under packages/.");
}
const directory = join(root, "packages", selector);
const expected = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
const temp = mkdtempSync(join(tmpdir(), "workspace-package-pack-"));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  execFileSync(npm, [
    "pack", "--workspace", expected.name, "--pack-destination", temp,
    "--foreground-scripts",
  ], { cwd: root, stdio: "inherit" });
  const archives = readdirSync(temp).filter((name) => name.endsWith(".tgz"));
  assert(archives.length === 1, "Expected exactly one library archive.");
  const archive = join(temp, archives[0]);
  const names = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" })
    .trim().split(/\r?\n/);
  const entries = new Set(names);
  const read = (name) => execFileSync("tar", ["-xOf", archive, "package/" + name], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  const required = [
    "package.json", "README.md", "CHANGELOG.md", "LICENSE",
    "dist/index.js", "dist/index.cjs", "dist/index.d.ts", "dist/index.d.cts",
  ];
  for (const name of required) {
    assert(entries.has("package/" + name), "Missing archive entry: " + name);
    assert(read(name).trim().length > 0, "Empty archive entry: " + name);
  }
  for (const name of names) {
    assert(
      /^package\/(?:package\.json|README\.md|CHANGELOG\.md|LICENSE|dist\/[^/]+)$/.test(name),
      "Unexpected archive entry: " + name,
    );
    assert(!name.includes("..") && !/\.(?:env|pem|key)(?:\.|$)/i.test(name), "Unsafe archive entry: " + name);
  }
  const manifest = JSON.parse(read("package.json"));
  assert(manifest.name === expected.name && manifest.version === expected.version, "Archive identity/version mismatch.");
  assert(!manifest.private, "Library archive must not be private.");
  function checkTarget(target) {
    if (typeof target === "string") {
      assert(target.startsWith("./") && entries.has("package/" + target.slice(2)), "Missing export target: " + target);
    } else if (target && typeof target === "object") {
      for (const value of Object.values(target)) checkTarget(value);
    }
  }
  for (const key of ["main", "module", "browser", "types", "exports"]) {
    assert(manifest[key], "Missing package entry field: " + key);
    checkTarget(manifest[key]);
  }
  for (const name of names) {
    assert(!name.endsWith(".map"), "Unexpected build source map: " + name);
  }
  console.log("Library archive size: " + statSync(archive).size + " bytes");
  console.log("Verified library archive: " + manifest.name + "@" + manifest.version);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
