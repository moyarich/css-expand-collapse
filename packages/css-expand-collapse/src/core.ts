import {
  collectCustomProperties,
  isCustomProperty,
  mergeCustomProperties,
  type CustomPropertyMap,
} from "./custom-properties.js";
import { createRegistry, SHORTHAND_PROPERTIES, SHORTHAND_MODULES as BUILTIN_MODULES, type ShorthandModule, type ShorthandModuleMap, type DeclarationMap } from "./registry/index.js";
import {
  createShorthandCollapseContext,
  createShorthandExpandContext,
  shorthandCollapseContext,
  shorthandExpandContext,
} from "./registry/context.js";

export type { DeclarationMap, LonghandMap } from "./registry/index.js";

import { validateProperty } from "./validation/validateProperty.js";
import { describeExpansionFailure, type TransformDiagnostic } from "./transform-diagnostics.js";

export interface TransformOptions {
  /** Receives diagnostics for attempted but skipped transformations. */
  onDiagnostic?: (diagnostic: TransformDiagnostic) => void;
  /**
   * Known custom properties available to var() references while validating whether
   * a shorthand can be safely expanded or collapsed. Authored var() references are
   * preserved in transformed output; resolved values are used only for grammar checks.
   */
  customProperties?: CustomPropertyMap;
  /**
   * Controls whether omitted registered longhands may use module-owned initial values.
   * Object-level collapse APIs use initial values by default; pass false to require a
   * complete declaration map. Stylesheet/declaration-text collapse remains conservative
   * unless "initial" is explicitly requested.
   */
  fillMissingLonghands?: false | "initial";
}

/**
 * Shared result shape for shorthand expansion and collapse operations.
 *
 * The declarations field always represents the longhand declarations described
 * by the shorthand operation.
 */
export interface ShorthandResult {
  property: string;
  value: string;
  declarations: DeclarationMap;
}

/** Result returned when a shorthand value is expanded into longhands. */
export type ExpandShorthandResult = ShorthandResult;

/** Result returned when longhands are collapsed into a shorthand. */
export interface CollapseShorthandResult extends ShorthandResult {
  /** Input longhands that were present and consumed by the collapse operation. */
  consumed: string[];
}

const GLOBAL_VALUES = new Set([
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
]);
const normalizeProperty = (property: string) => property.trim().toLowerCase();
const normalizeDeclarationProperty = (property: string) => {
  const trimmed = property.trim();
  return isCustomProperty(trimmed) ? trimmed : trimmed.toLowerCase();
};

export function createCssTransformer() {
  let registry = createRegistry();
  let modules: ShorthandModuleMap = registry.SHORTHAND_MODULES;

  function registerShorthand(property: string, module: ShorthandModule, options: { override?: boolean } = {}): void {
    const name = normalizeProperty(property);
    if (!/^-?[a-z][a-z0-9-]*$/.test(name)) throw new Error("Invalid shorthand property: " + property);
    if (Object.hasOwn(modules, name) && !options.override) throw new Error("Shorthand already registered: " + name);
    registry = createRegistry({ ...modules, [name]: module });
    modules = registry.SHORTHAND_MODULES;
  }

  function unregisterShorthand(property: string): boolean {
    const name = normalizeProperty(property);
    if (!Object.hasOwn(modules, name)) return false;
    const next = { ...modules };
    if (Object.hasOwn(BUILTIN_MODULES, name)) next[name] = BUILTIN_MODULES[name]!;
    else delete next[name];
    registry = createRegistry(next);
    modules = registry.SHORTHAND_MODULES;
    return true;
  }

  function isShorthand(property: string): boolean {
    return registry.SHORTHAND_SET.has(normalizeProperty(property));
  }

  function isLonghand(property: string): boolean {
    return registry.LONGHAND_TO_SHORTHANDS.has(normalizeProperty(property));
  }

  function getLonghands(shorthand: string): string[] {
    return [
      ...(registry.SHORTHAND_MODULES[normalizeProperty(shorthand)]?.longhands.keys() ??
        []),
    ];
  }

  function getShorthands(longhand: string): string[] {
    return [...(registry.LONGHAND_TO_SHORTHANDS.get(normalizeProperty(longhand)) ?? [])];
  }

  function supportsTransform(property: string): boolean {
    return supportsExpand(property) && supportsCollapse(property);
  }

  function supportsExpand(property: string): boolean {
    return typeof registry.SHORTHAND_DEFINITIONS[normalizeProperty(property)]?.expand === "function";
  }

  function supportsCollapse(property: string): boolean {
    return typeof registry.SHORTHAND_DEFINITIONS[normalizeProperty(property)]?.collapse === "function";
  }

  /**
   * Expands a shorthand value into its registered longhand declarations.
   *
   * The returned property is normalized, value is the trimmed shorthand value
   * that was expanded, and declarations contains the represented longhands.
   */
  function expandShorthand(
    property: string,
    value: string,
    options?: Pick<TransformOptions, "customProperties" | "onDiagnostic">,
  ): ExpandShorthandResult | null {
    const shorthand = normalizeProperty(property);
    const definition = registry.SHORTHAND_DEFINITIONS[shorthand];
    const reportFailure = () => {
      if (options?.onDiagnostic) {
        options.onDiagnostic(describeExpansionFailure(
          shorthand, value, Boolean(definition?.expand), options.customProperties,
        ));
      }
      return null;
    };
    if (!definition?.expand) return reportFailure();

    const normalizedValue = value.trim();
    if (!normalizedValue) return reportFailure();

    const expandContext = options?.customProperties
      ? createShorthandExpandContext(options.customProperties)
      : shorthandExpandContext;
    const declarations = GLOBAL_VALUES.has(normalizedValue)
      ? Object.fromEntries(
          [...definition.longhands.keys()].map((longhand) => [
            longhand,
            normalizedValue,
          ]),
        )
      : definition.expand(normalizedValue, expandContext);

    if (!declarations) return reportFailure();

    return {
      property: shorthand,
      value: normalizedValue,
      declarations,
    };
  }

  /**
   * Expands every supported shorthand in a declaration object.
   *
   * Entries are processed in object iteration order so later shorthand or
   * longhand declarations override earlier represented longhands.
   * Unsupported or invalid shorthand declarations are preserved unchanged.
   */
  function expandShorthands(
    declarations: DeclarationMap,
    options?: Pick<TransformOptions, "customProperties" | "onDiagnostic">,
  ): DeclarationMap {
    const output: DeclarationMap = {};
    const customProperties = mergeCustomProperties(
      options?.customProperties,
      collectCustomProperties(declarations),
    );

    for (const [rawProperty, value] of Object.entries(declarations)) {
      const property = normalizeDeclarationProperty(rawProperty);
      const expanded = expandShorthand(property, value, {
        customProperties,
        onDiagnostic: isShorthand(property) ? options?.onDiagnostic : undefined,
      });

      if (!expanded) {
        output[property] = value;
        continue;
      }

      for (const [longhand, longhandValue] of Object.entries(
        expanded.declarations,
      )) {
        output[longhand] = longhandValue;
      }
    }

    return output;
  }

  /**
   * Collapses registered longhands into one shorthand value.
   *
   * declarations in the result is the complete represented longhand set,
   * including module-owned initial values when missing values are filled.
   * consumed contains only longhands that were present in the input.
   */
  function collapseToShorthand(
    shorthandProperty: string,
    declarations: DeclarationMap,
    options?: TransformOptions,
  ): CollapseShorthandResult | null {
    const property = normalizeProperty(shorthandProperty);
    const definition = registry.SHORTHAND_DEFINITIONS[property];
    if (!definition?.collapse) {
      options?.onDiagnostic?.({ code: "unsupported-transform", severity: "info", property,
        message: "Shorthand transformation is not supported." });
      return null;
    }
    const customProperties = mergeCustomProperties(
      options?.customProperties,
      collectCustomProperties(declarations),
    );
    const collapseContext =
      customProperties && Object.keys(customProperties).length
        ? createShorthandCollapseContext(customProperties)
        : shorthandCollapseContext;
    const normalized = Object.fromEntries(
      Object.entries(declarations).map(([key, value]) => [
        normalizeDeclarationProperty(key),
        value.trim(),
      ]),
    );
    const consumed = [...definition.longhands.keys()].filter((longhand) =>
      Object.hasOwn(normalized, longhand),
    );
    const reportCollapseFailure = (reason: TransformDiagnostic["reason"] = "incompatible-values") => {
      options?.onDiagnostic?.({ code: "collapse-not-safe", severity: "info", property, reason,
        message: "Candidate longhands could not be collapsed safely." });
      return null;
    };
    if (!consumed.length) return reportCollapseFailure("missing-longhands");
    if (options?.fillMissingLonghands === false && consumed.length !== definition.longhands.size) {
      return reportCollapseFailure("missing-longhands");
    }

    // Validate each authored longhand before considering the shorthand as a whole.
    // A custom property can be valid for the shorthand grammar while still resolving
    // to a value that is invalid for an individual longhand (for example,
    // margin-top: var(--space) when --space is "8px 16px").
    for (const longhand of consumed) {
      const longhandValue = normalized[longhand]!;
      if (
        !GLOBAL_VALUES.has(longhandValue) &&
        !collapseContext.matchProperty(longhand, longhandValue)
      ) {
        if (options?.onDiagnostic) {
          const diagnostic = validateProperty(longhand, longhandValue, { customProperties }).diagnostics[0];
          if (diagnostic && diagnostic.code !== "unsupported-context") {
            options.onDiagnostic({ ...diagnostic, code: diagnostic.code });
            return null;
          }
        }
        return reportCollapseFailure();
      }
    }

    const completed = { ...normalized };
    if (options?.fillMissingLonghands !== false) {
      for (const [longhand, initialValue] of definition.longhands) {
        if (!Object.hasOwn(completed, longhand))
          completed[longhand] = initialValue;
      }
    }

    const concrete = [...definition.longhands.keys()].map(
      (longhand) => completed[longhand],
    );
    const first = concrete[0];
    const value =
      first &&
      concrete.every((entry) => entry === first) &&
      GLOBAL_VALUES.has(first)
        ? first
        : definition.collapse(completed, collapseContext);
    if (!value) return reportCollapseFailure();
    if (
      !GLOBAL_VALUES.has(value) &&
      !collapseContext.matchProperty(property, value)
    ) {
      return reportCollapseFailure();
    }

    return {
      property,
      value,
      declarations: Object.fromEntries(
        [...definition.longhands.keys()].map((longhand) => [
          longhand,
          completed[longhand]!,
        ]),
      ),
      consumed,
    };
  }

  function findCollapsibleShorthands(
    declarations: DeclarationMap,
    options?: TransformOptions,
  ): CollapseShorthandResult[] {
    return Object.entries(registry.SHORTHAND_DEFINITIONS)
      .sort(([, a], [, b]) => b.longhands.size - a.longhands.size)
      .filter(([, definition]) => definition.collapse && [...definition.longhands.keys()].some((longhand) =>
        Object.keys(declarations).some((key) => normalizeDeclarationProperty(key) === longhand),
      ))
      .map(([shorthand]) => collapseToShorthand(shorthand, declarations, options))
      .filter((result): result is CollapseShorthandResult => Boolean(result));
  }

  /**
   * Collapses every compatible longhand group in a declaration object.
   *
   * This is the declaration-map counterpart to expandShorthands().
   */
  function collapseLonghands(
    declarations: DeclarationMap,
    options?: TransformOptions,
  ): DeclarationMap {
    const output: DeclarationMap = Object.fromEntries(
      Object.entries(declarations).map(([property, value]) => [
        normalizeDeclarationProperty(property),
        value,
      ]),
    );
    const scopedOptions: TransformOptions = {
      ...options,
      customProperties: mergeCustomProperties(
        options?.customProperties,
        collectCustomProperties(output),
      ),
    };
    const consumed = new Set<string>();

    for (const result of findCollapsibleShorthands(output, scopedOptions)) {
      if (result.property === "background-position" && Object.hasOwn(output, "background")) continue;
      if (result.property === "background" && Object.keys(output).some((property) => /^background-position-(?:x|y|block|inline)$/.test(property))) continue;
      if (result.consumed.some((property) => consumed.has(property))) continue;
      if (!result.consumed.every((property) => Object.hasOwn(output, property)))
        continue;
      for (const property of result.consumed) {
        delete output[property];
        consumed.add(property);
      }
      output[result.property] = result.value;
    }
    return output;
  }

  return { registerShorthand, unregisterShorthand, isShorthand, isLonghand, getLonghands, getShorthands, supportsTransform, supportsExpand, supportsCollapse, expandShorthand, expandShorthands, collapseToShorthand, findCollapsibleShorthands, collapseLonghands, expand: expandShorthands, collapse: collapseLonghands };
}

export type CssTransformer = ReturnType<typeof createCssTransformer>;

const defaultTransformer = createCssTransformer();
export const { isShorthand, isLonghand, getLonghands, getShorthands, supportsTransform, supportsExpand, supportsCollapse, expandShorthand, expandShorthands, collapseToShorthand, findCollapsibleShorthands, collapseLonghands } = defaultTransformer;
export { SHORTHAND_PROPERTIES };
