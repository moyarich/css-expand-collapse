import type { ValidationLocation } from "./validation/types.js";

export interface TransformDiagnostic {
  code: "unsupported-transform" | "unsafe-or-invalid-value" | "collapse-not-safe" | "invalid-syntax";
  severity: "info" | "warning" | "error";
  message: string;
  property?: string;
  value?: string;
  location?: ValidationLocation;
}
