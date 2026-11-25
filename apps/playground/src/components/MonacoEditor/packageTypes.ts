export const CSS_EXPAND_COLLAPSE_TYPES = `
declare module "@moyarich/css-expand-collapse" {
  export type DeclarationMap = Record<string, string>;
  export type LonghandMap = ReadonlyMap<string, string>;

  export type CustomPropertyMap = Record<string, string>;

  export interface TransformOptions {
    customProperties?: CustomPropertyMap;
    fillMissingLonghands?: false | "initial";
  }

  export interface ShorthandResult {
    property: string;
    value: string;
    declarations: DeclarationMap;
  }

  export type ExpandShorthandResult = ShorthandResult;

  export interface CollapseShorthandResult extends ShorthandResult {
    consumed: string[];
  }

  export type TransformMode = "expand" | "collapse";

  export interface TransformCssOptions extends TransformOptions {
    mode: TransformMode;
  }

  export interface ReadonlyStyleDeclaration {
    readonly length: number;
    item(index: number): string;
    getPropertyValue(property: string): string;
  }

  export const SHORTHAND_PROPERTIES: readonly string[];

  export function isShorthand(property: string): boolean;
  export function isLonghand(property: string): boolean;
  export function getLonghands(shorthand: string): string[];
  export function getShorthands(longhand: string): string[];
  export function supportsTransform(property: string): boolean;
  export function splitTopLevelWhitespace(value: string): string[];

  export function expandShorthand(
    property: string,
    value: string,
  ): ExpandShorthandResult | null;

  export function expandShorthands(
    declarations: DeclarationMap,
  ): DeclarationMap;

  export function collapseToShorthand(
    shorthand: string,
    declarations: DeclarationMap,
    options?: TransformOptions,
  ): CollapseShorthandResult | null;

  export function findCollapsibleShorthands(
    declarations: DeclarationMap,
    options?: TransformOptions,
  ): CollapseShorthandResult[];

  export function collapseLonghands(
    declarations: DeclarationMap,
    options?: TransformOptions,
  ): DeclarationMap;

  export function transformCss(css: string, options: TransformCssOptions): string;
  export function expandCss(css: string): string;
  export function collapseCss(css: string, options?: TransformOptions): string;
  export function expandDeclarations(declarations: string): string;
  export function collapseDeclarations(declarations: string, options?: TransformOptions): string;

  export function styleToDeclarations(
    style: ReadonlyStyleDeclaration,
    properties?: Iterable<string>,
  ): DeclarationMap;
  export function getStyleLonghands(
    style: ReadonlyStyleDeclaration,
    shorthand: string,
  ): DeclarationMap;
  export function collapseStyleDeclaration(
    style: ReadonlyStyleDeclaration,
    shorthand: string,
    options?: TransformOptions,
  ): CollapseShorthandResult | null;
  export function collapseStyleDeclarations(
    style: ReadonlyStyleDeclaration,
    shorthands?: Iterable<string>,
    options?: TransformOptions,
  ): CollapseShorthandResult[];

  export interface ValidationOptions {
    /** Known case-sensitive variable values. Missing variables remain indeterminate. */
    customProperties?: CustomPropertyMap;
  }
  
  export interface ValidationPosition {
    /** One-based line and column; zero-based UTF-16 offset. */
    line: number;
    column: number;
    offset: number;
  }
  
  export interface ValidationLocation {
    start: ValidationPosition;
    end: ValidationPosition;
  }
  
  export type ValidationDiagnosticCode =
    | "invalid-syntax"
    | "invalid-property-value"
    | "unknown-property"
    | "unresolved-value"
    | "unsupported-context";
  
  export interface ValidationDiagnostic {
    code: ValidationDiagnosticCode;
    severity: "error" | "warning" | "info";
    message: string;
    property?: string;
    value?: string;
    location?: ValidationLocation;
  }
  
  export interface ValidationResult {
    /** False for errors, null for indeterminate checks, true otherwise. */
    valid: boolean | null;
    diagnostics: ValidationDiagnostic[];
  }

  export function validateProperty(property: string, value: string, options?: ValidationOptions): ValidationResult;
  export function validateDeclarations(source: string, options?: ValidationOptions): ValidationResult;
  export function validateCss(source: string, options?: ValidationOptions): ValidationResult;
}
`;
