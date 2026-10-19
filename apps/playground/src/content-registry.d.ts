declare module "virtual:content-registry" {
  export const registry: {
    Docs: readonly { key: string; label: string; title?: string; description?: string; order: number; pageFile: string; Component: import("react").ComponentType; tableOfContents: import("../../../examples/types").TocEntry[] }[];
    APIPlayground: readonly import("../../../examples/APIPlayground").FunctionExample[];
    CSSConverter: readonly import("../../../examples/CSSConverter").CSSConverterExample[];
  };
}
