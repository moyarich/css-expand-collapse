# Changelog

Notable user-facing changes to `@moyarich/css-expand-collapse` are documented here.

## Unreleased

### Added

- Recognize `line-clamp`, `-webkit-line-clamp`, `text-spacing`, `background-repeat` `timeline-trigger`, `timeline-trigger-activation-range`, `timeline-trigger-active-range` and `event-trigger` in shorthand metadata without rewriting their values. Transformation support remains disabled for these properties.

### Fixed

- Preserve animation shorthand range reset semantics during expansion and collapse.

## 0.1.2

### Fixed

- Improved TypeScript compatibility for CommonJS consumers by providing separate declarations for CommonJS and ES modules.

### Improved

- Clarified the supported Node.js runtime (22.22.0 or newer).

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

## 0.1.0

Initial published package release.

### Added

- Expand supported CSS shorthand declarations into compatible longhand declarations.
- Collapse compatible longhand declarations back into shorthands.
- Validate transformations with `css-tree` to preserve CSS semantics.
- ESM and CommonJS builds with TypeScript declarations.
- Browser-compatible package exports with the package marked side-effect free.
