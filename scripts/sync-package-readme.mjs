#!/usr/bin/env node
import { copyFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = join(root, "README.md");

const program = new Command()
  .name("sync-package-readme")
  .description("Sync the repository README into a publishable package.")
  .requiredOption(
    "--package-directory <path>",
    "relative path to the publishable package directory",
  )
  .option(
    "--clean",
    "remove the generated package README instead of copying it",
  )
  .showHelpAfterError()
  .addHelpText(
    "after",
    `
Examples:
  node scripts/sync-package-readme.mjs --package-directory=packages/my-package
  node scripts/sync-package-readme.mjs --package-directory=packages/my-package --clean
`,
  )
  .parse();

const {
  packageDirectory,
  clean,
} = program.opts();

if (!packageDirectory.startsWith("packages/")) {
  program.error(
    `Package directory must be under packages/: ${packageDirectory}`,
  );
}

const packagePath = join(root, packageDirectory);
const target = join(packagePath, "README.md");

if (!existsSync(packagePath)) {
  program.error(`Package directory not found: ${packageDirectory}`);
}

if (clean) {
  rmSync(target, { force: true });
  console.log(`Removed generated ${packageDirectory}/README.md`);
  process.exit(0);
}

if (!existsSync(source)) {
  program.error(`Source README not found: ${source}`);
}

copyFileSync(source, target);
console.log(`Synced README.md -> ${packageDirectory}/README.md`);
