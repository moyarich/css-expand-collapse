declare module "virtual:content-registry" {
  export const registry: {
    APIPlayground: readonly import("../../../examples/APIPlayground").FunctionExample[];
    CSSConverter: readonly import("../../../examples/CSSConverter").CSSConverterExample[];
  };
}
