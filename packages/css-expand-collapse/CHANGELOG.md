# Changelog

All notable changes to `@moyarich/css-expand-collapse` are documented here.

## 0.1.1

### Added

- Added scoped CSS custom-property resolution for shorthand expansion and collapse.
- Resolves known `var(--name)` values for grammar validation while preserving authored `var()` references in transformed CSS.
- Supports nested variables, fallbacks, cycle protection, case-sensitive custom-property names, local rule variables, and unconditional top-level `:root`, `html`, `:host`, and `html:root` variables.
- Added multi-component custom-property handling so values such as `--space: 8px 16px` are not incorrectly expanded or collapsed.
- Added coverage for compound background variables and `background-color` participation in background collapse.

### Changed

- Local custom-property values take precedence over root-scoped values when validating shorthand transformations.
- Simplified parser/scanner internals and removed compatibility-only API/shim paths while keeping the package API focused.

### Tests

- Added regression coverage for scoped variables, nested resolution, fallbacks, cycles, case sensitivity, expansion, collapse, and multi-component values.

## 0.1.0

Initial published package release.

### Added

- Expand supported CSS shorthand declarations into compatible longhand declarations.
- Collapse compatible longhand declarations back into shorthands.
- Validate transformations with `css-tree` to preserve CSS semantics.
- ESM and CommonJS builds with TypeScript declarations.
- Browser-compatible package exports with the package marked side-effect free.
