# Changelog

Notable user-facing changes to `@moyarich/css-expand-collapse` are documented here.

## Unreleased

### Customize CSS transformations

Create independent transformers that can use custom shorthand rules without changing the library's default behavior. Existing standalone functions remain available.

```ts
import { createCssTransformer } from "@moyarich/css-expand-collapse";

const css = createCssTransformer();
css.expandCss(".card { margin: 8px 16px; }");
```

- Install, inspect and remove named plugins, including plugins with declared dependencies.
- Register custom shorthand definitions, extend existing rules or reuse built-in handlers with `getShorthandModule()`. Explicit permission is required to replace existing behavior.
- Use the same configuration for CSS source, declaration objects, style declarations, layered values, validation and source maps.
- Discover which properties can be expanded or collapsed independently. Invalid or conflicting registrations are rejected without changing the active configuration.

### Recognize more CSS shorthands

The library identifies the component properties of the following shorthands without automatically rewriting them: `background-repeat`, `line-clamp`, `-webkit-line-clamp`, `text-spacing`, `timeline-trigger`, `timeline-trigger-activation-range`, `timeline-trigger-active-range` and `event-trigger`.

Their default transformations remain disabled where native equivalence has not been established. The optional `@moyarich/css-experimental-shorthands` package provides explicitly enabled experimental transformations.

### Preserve animation behavior

Expansion and collapse preserve animation range resets. The default transformer does not emit the draft-defined `animation-trigger` reset, because tested Chromium behavior preserves earlier triggers. Consumers who deliberately want the draft reset can enable the companion's `animationTriggerPlugin`. No runtime browser detection is performed.

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
