# Developer Guide

This document contains repository setup, workspace commands, architecture notes, and the workflow for extending CSS shorthand support. The repository-root [`README.md`](../README.md) is the single canonical source for the package README and all user-facing installation/API documentation.

## Repository structure

```text
css-expand-collapse/
├── apps/
│   └── playground/                  # React + Vite playground
├── docs/
│   └── README-dev.md                # repository/developer documentation
├── packages/
│   └── css-expand-collapse/         # publishable npm package
├── README.md                        # canonical package README / single source of truth
└── package.json                     # workspace scripts
```

The two workspaces are:

- `packages/css-expand-collapse` — publishable `@moyarich/css-expand-collapse` package.
- `apps/playground` — React + Vite playground for exercising the package against real CSS.

The playground consumes package source directly during development, so the library does not need to be built before starting it.


## Package README source of truth

[`README.md`](../README.md) at the repository root is the **single source of truth** for the published package README.

Never maintain or commit `packages/css-expand-collapse/README.md` separately. That file is generated only for npm packaging and is ignored by Git.

During `npm pack` and `npm publish`, the package lifecycle temporarily creates the package-root README:

```text
README.md
  -> packages/css-expand-collapse/README.md
```

The lifecycle is defined in `packages/css-expand-collapse/package.json`:

- `prepack` runs `scripts/sync-package-readme.mjs`, which copies the root `README.md` to `packages/css-expand-collapse/README.md`, then builds the package.
- npm automatically includes a package-root `README.md` in the generated tarball.
- `postpack` runs the same script with `--clean` and removes the generated package README.

To change package documentation, edit only the repository-root `README.md`.

## Repository setup

```bash
npm ci
npm run dev
```

## Workspace commands

```bash
npm run dev               # Start the playground
npm run generate:registry # Regenerate shorthand registry barrel
npm test                  # Run library tests
npm run typecheck         # Typecheck all workspaces
npm run build             # Build library + playground
npm run build:lib         # Build only the npm package
npm run build:playground  # Build only the playground
npm run pack:lib          # Preview npm package contents
```

The package also exposes `check:registry`; package `test`, `typecheck`, and `build` run that freshness check automatically.

## Package versioning and registry releases

Packages under `packages/*` are versioned independently. Release tags include the package directory name so multiple packages can use different versions without ambiguous `v1.2.3` tags.

The root package exposes the release script both through npm and as the `workspace-release` bin.

### Interactive release

With `fzf` installed, the shortest command starts the complete interactive flow:

```bash
workspace-release
```

The CLI:

1. discovers publishable packages under `packages/*`;
2. lets you select the workspace with `fzf`;
3. reads its current `package.json` version;
4. calculates every supported next version with `semver.inc()`;
5. lets you select the release type with `fzf`;
6. shows the release plan;
7. asks for confirmation before any mutation.

If the package is already known, skip the first chooser:

```bash
workspace-release css-expand-collapse
```

### Explicit release

Explicit commands stay non-interactive and are suitable for scripts and CI:

```bash
workspace-release css-expand-collapse=patch
workspace-release css-expand-collapse=minor
workspace-release css-expand-collapse=1.0.0
```

The npm-script equivalent is:

```bash
npm run release -- css-expand-collapse=patch
```

The older explicit options remain supported:

```bash
npm run release -- --package=css-expand-collapse --version=patch
```

### Dry run

A release dry run calculates the target version before npm changes any files:

```bash
workspace-release css-expand-collapse=minor --dry-run
```

For example, if the current version is `0.1.0`, the plan reports `0.1.0 → 0.2.0`. Dry-run mode does not call `npm version`, update `package.json` or `package-lock.json`, create a commit, or create a tag.

A dirty working tree is reported as a note during a dry run. A real release still requires a clean working tree.

### Explain SemVer choices

Use `--explain` to inspect the calculated choices without changing anything:

```bash
workspace-release css-expand-collapse --explain
```

When `fzf` is available, the choices are browsable interactively. Without `fzf`, explain mode prints the choices instead.

Supported increments are:

```text
patch
minor
major
prepatch
preminor
premajor
prerelease
```

An explicit SemVer version such as `2.0.0` is also accepted. Use `--preid=beta` or `--preid=rc` when a prerelease identifier is needed.

### Release mutation

After the version has been selected, a real release runs npm's workspace-aware version command with Git tagging disabled:

```bash
npm version <calculated-version> --workspace <npm-package-name> --git-tag-version=false
```

The CLI then creates one release commit and a package-qualified tag:

```text
css-expand-collapse@0.1.1
css-color-parser@1.3.1
```

Push the release commit and tag with:

```bash
git push --follow-tags
```

The publish workflow listens for `*@*` tags. For a tag such as `css-expand-collapse@0.1.1`, it derives:

```text
PACKAGE_DIRECTORY=packages/css-expand-collapse
version=0.1.1
```

The workflow verifies that the directory exists and that the tag version exactly matches that package's `package.json` before publishing to GitHub Packages.

The workflow can also be started manually. Manual runs accept:

- `action` — `publish` to keep the existing package version, or `release` to create a new version commit and package-qualified tag;
- `package` — the directory name under `packages/`, such as `css-expand-collapse`;
- `version` — required only for `release`; accepts a SemVer version or npm version keyword such as `patch`, `minor`, or `major`;
- `registry` — `github`, `npm`, or `both`;
- `tag` — the npm distribution tag, such as `latest` or `next`.

A manual `publish` does not modify `package.json` or create a Git tag; it publishes the version already present in the package. A manual `release` runs the release CLI, pushes the resulting release commit and `package@version` tag back to the selected branch, then publishes that released version.

GitHub Packages uses `npm publish`. npmjs.org uses `npm stage publish`, executed from the selected package directory because `npm stage` is not workspace-aware.

### Release environment variables

Local publishing uses an explicit package directory and registry-specific credential names:

```dotenv
PACKAGE_DIRECTORY=packages/css-expand-collapse
_GITHUB_TOKEN=...
_NPM_TOKEN=...
```

Optional release configuration:

```dotenv
NPM_REGISTRY=https://npm.pkg.github.com
NPM_TAG=latest
NPM_ACCESS=public
```

The release script maps the selected registry credential to `NODE_AUTH_TOKEN` only for the npm child process.

To validate a selected package without publishing:

```bash
PACKAGE_DIRECTORY=packages/css-expand-collapse npm run release:check
```

For npm staged publishing:

```bash
cd packages/css-expand-collapse
npm stage publish --access public --tag latest
npm stage list @moyarich/css-expand-collapse
npm stage view <stage-id>
npm stage approve <stage-id>
```

## Playground deployment

The playground lives in `apps/playground` and is deployed to GitHub Pages by GitHub Actions.

```text
https://moyarich.github.io/css-expand-collapse/
```

The Vite production base path is `/css-expand-collapse/` for the Pages build.

## Runtime architecture

Transformation logic must be runtime-neutral. Do not use `document`, detached elements, or mutable `CSSStyleDeclaration` objects to parse or serialize a shorthand. The same implementation must work in:

```text
Node.js
Chrome extension service workers
Chrome extension content scripts
browser pages
workers
CLI processes
```

CSSTree provides CSS grammar matching. The package owns shorthand-specific semantics such as omitted-value defaults, component assignment, slash groups, comma-separated layers, and safe serialization.

The source layout is intentionally divided by responsibility:

```text
src/
├── core.ts                 # public transformation orchestration
├── css.ts                  # stylesheet/cascade orchestration
└── registry/
    ├── index.ts            # lookup tables derived from modules
    ├── module.ts           # common shorthand contract
    ├── context.ts          # CSSTree matching + value splitting
    ├── expanders.ts        # reusable expand factories
    ├── collapsers.ts       # reusable collapse factories
    ├── helpers.ts          # longhand-map helpers
    ├── families/           # reusable behavior for related CSS property families
    └── shorthands/         # one implementation per shorthand
```

`core.ts` does not contain property-family parsing or collapse strategy switches. It normalizes input, resolves the module, handles shared global-value/initial-fill behavior, and delegates to that module.

`css.ts` owns stylesheet-level behavior: source order, `!important`, declaration consumption, overlapping shorthands, AST replacement, and cascade-safe removal. Those concerns do not belong in individual shorthand files.

## Shorthand module architecture

Each CSS shorthand lives in its own file under:

```text
packages/css-expand-collapse/src/registry/shorthands/
```

The **filename is the CSS property name**:

```text
margin.ts               -> margin
text-decoration.ts      -> text-decoration
background.ts           -> background
-webkit-text-stroke.ts  -> -webkit-text-stroke
```

Every module satisfies the same contract:

```ts
export interface ShorthandModule {
  readonly longhands: LonghandMap;
  readonly expand: ShorthandExpander;
  readonly collapse: ShorthandCollapser;
  readonly equivalentLonghandValues?: ReadonlyMap<string, LonghandValueEquivalence>;
  readonly safeToDropWhenFullyShadowed?: boolean;
}
```

`LonghandMap` is the single source of truth for both constituent property names and CSS initial values:

```ts
export type LonghandMap = ReadonlyMap<string, string>;
```

The property name is intentionally not repeated inside the object. The generated registry derives it from the filename.

There is no executable `strategy` field and no central strategy switch. A shorthand module owns both transformation directions.

`all.ts` still satisfies the interface, but its longhand set is empty, so it is recognized by `isShorthand()` while remaining non-transformable.

## Shared transformation context

`registry/context.ts` owns CSSTree matching and top-level value splitting.

```ts
export const shorthandExpandContext = {
  matchProperty,
  splitWhitespace,
  splitSlash,
};

export const shorthandCollapseContext = {
  matchProperty,
};
```

`matchProperty()` delegates to CSSTree's lexer and should be used as the grammar authority instead of maintaining duplicate keyword tables where possible.

Top-level splitting preserves commas, slashes, CSS whitespace, strings, brackets, and functions correctly rather than using naive `String.split()` calls. The scanner compares named Unicode code-point constants instead of repeatedly allocating one-character strings or using a JavaScript whitespace regex whose definition is broader than CSS whitespace.

## Simple shorthand implementations

Simple grammars should compose reusable helpers from `registry/expanders.ts` and `registry/collapsers.ts`.

```ts
// registry/shorthands/margin.ts
import { collapseQuad } from "../collapsers.js";
import { expandQuad } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["margin-top", "0"],
  ["margin-right", "0"],
  ["margin-bottom", "0"],
  ["margin-left", "0"],
] as const);

const expand = expandQuad(longhands);
const collapse = collapseQuad(longhands);

export default {
  longhands,
  expand,
  collapse,
} satisfies ShorthandModule;
```

Reusable collapse factories currently include:

```text
collapseQuad
collapsePair
collapseTriple
collapseComponents
collapseSlashPair
```

The inverse expansion factories live in `expanders.ts`. Reusable behavior tied to a specific CSS property family, such as logical border axes, lives under `registry/families/` instead of the generic factory files.

## Property-specific implementations

When a shorthand has special ordering, ambiguity, reset behavior, layer alignment, or serialization rules, keep those semantics inside its own module.

For example, `flex.ts` owns `none` and `auto` collapse semantics; `text-decoration.ts` owns omission of its default style/color/thickness components; and `border.ts` owns the requirement that all four side triples agree before producing `border`.

A property-specific module should validate the shorthand candidate with CSSTree before returning it:

```ts
const collapse: ShorthandCollapser = (declarations, context) => {
  const candidate = buildCandidate(declarations);
  return context.matchProperty("example", candidate)
    ? candidate
    : null;
};
```

Collapse should be conservative. If an equivalent shorthand cannot be reconstructed without guessing, return `null` and leave the longhands unchanged.

## Longhand value equivalence

A shorthand may expose `equivalentLonghandValues` for alternate browser serializations that are semantically equivalent to its canonical longhand values. Keep those rules with the owning property module; `css.ts` consumes the derived registry lookup without hard-coding property names.

## Cascade safety metadata

`safeToDropWhenFullyShadowed` is metadata only; it never chooses expansion/collapse code.

Most simple modules can omit it. Set it to `false` when the shorthand has reset or cascade effects beyond the registered longhands. `css.ts` uses this to decide whether an earlier shorthand can be removed after a complete later longhand set is collapsed.

For example, complex reset shorthands such as `background` remain conservative, while a shorthand whose registered longhands completely describe its effect can be safely replaced.

## Adding a shorthand

1. Add `packages/css-expand-collapse/src/registry/shorthands/<property>.ts`.
2. Declare one `LonghandMap` that pairs every registered longhand with its CSS initial value.
3. Implement `expand` and `collapse` in that module.
4. Reuse factories from `expanders.ts` and `collapsers.ts` when appropriate.
5. Keep property-specific parsing and serialization in the module itself.
6. Use `context.matchProperty(...)` to validate CSS grammar.
7. Set `safeToDropWhenFullyShadowed: false` only when the registered longhands are not the complete cascade/reset effect.
8. Run `npm run generate:registry`.
9. Add expansion, collapse, and round-trip tests.

Adding a new shorthand should not require editing `core.ts`.

## Generated registry

`packages/css-expand-collapse/src/registry/shorthands/index.ts` is generated by:

```bash
npm run generate:registry
```

Do not edit that file by hand. The generated map is typed as `Record<string, ShorthandModule>`, so a module that does not satisfy the common contract fails typecheck.

The registry derives:

```text
SHORTHAND_MODULES
SHORTHAND_PROPERTIES
SHORTHAND_DEFINITIONS
SHORTHAND_SET
LONGHAND_TO_SHORTHANDS
LONGHAND_VALUE_EQUIVALENCE
```

`SHORTHAND_DEFINITIONS` contains modules with non-empty longhand sets. This is how transformability is determined; there is no strategy discriminator.

## Testing expectations

For each shorthand, add tests that cover the forms its grammar supports. When both directions are supported, include round-trip checks where practical.

Important areas include:

- omitted/default shorthand components;
- one-, two-, three-, and four-value families;
- slash-separated grammar;
- comma-separated layers;
- global values such as `inherit` and `initial`;
- `!important` and source-order behavior at the stylesheet layer;
- computed/export CSS containing a shorthand followed by its resolved longhands;
- values containing functions, strings, commas, or slashes;
- `fillMissingLonghands: "initial"` behavior.

Before publishing or merging a structural change, run:

```bash
npm test
npm run typecheck
npm run build
```
