import { copyFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptsDir, "..");
const source = resolve(repoRoot, "README.md");
const target = resolve(repoRoot, "packages/css-expand-collapse/README.md");

if (process.argv.includes("--clean")) {
  await rm(target, { force: true });
  console.log("Removed generated packages/css-expand-collapse/README.md");
} else {
  await copyFile(source, target);
  console.log("Synced README.md -> packages/css-expand-collapse/README.md");
}
