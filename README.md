# css-expand-collapse

A monorepo for expanding CSS shorthands into longhands and safely collapsing longhands back into shorthands.

## Playground

Live playground: https://moyarich.github.io/css-expand-collapse/

The playground is deployed from `apps/playground` with GitHub Actions and uses the production base path `/css-expand-collapse/` for GitHub Pages.

## Workspaces

- [`packages/css-expand-collapse`](./packages/css-expand-collapse) — publishable `@moyarich/css-expand-collapse` package.
- [`apps/playground`](./apps/playground) — React + Vite playground for trying expand/collapse transforms against real CSS.

## Development

```bash
npm install
npm run dev
```

The playground opens the library source directly during development, so you do not need to build the package first.

## Commands

```bash
npm run dev              # Start the playground
npm test                 # Run library tests
npm run typecheck        # Typecheck all workspaces
npm run build            # Build library + playground
npm run build:lib        # Build only the npm package
npm run build:playground # Build only the playground
npm run pack:lib         # Preview the npm package contents
```

## Package usage

See [`packages/css-expand-collapse/README.md`](./packages/css-expand-collapse/README.md) for the complete API and examples, including raw CSS, declaration blocks, shorthand/longhand helpers, and `getComputedStyle()` integration.
