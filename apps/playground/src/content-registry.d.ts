declare module "virtual:content-registry" {
  export const pages: readonly {
    collection: string;
    kind: "docs" | "api" | "converter";
    path: string;
    key: string;
    label: string;
    description?: string;
    navigation?: "visible" | "hidden" | "disabled";
    group?: string;
    mode?: string;
    order?: number;
    pageFile: string;
    Component: import("react").ComponentType;
    tableOfContents: import("../../../examples/types").TocEntry[];
  }[];
  export const registry: {
    Docs: readonly {
      key: string;
      label: string;
      title?: string;
      description?: string;
      order: number;
      pageFile: string;
      Component: import("react").ComponentType;
      tableOfContents: import("../../../examples/types").TocEntry[];
    }[];
    APIPlayground: readonly import("../../../examples/APIPlayground").FunctionExample[];
    CSSConverter: readonly import("../../../examples/CSSConverter").CSSConverterExample[];
  };
}
