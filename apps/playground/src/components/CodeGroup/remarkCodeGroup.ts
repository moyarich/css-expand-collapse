import type { Root, RootContent, Paragraph, Code } from "mdast";

function marker(node: RootContent): string | undefined {
  if (node.type !== "paragraph") return;
  const paragraph = node as Paragraph;
  if (paragraph.children.length !== 1 || paragraph.children[0].type !== "text")
    return;
  return paragraph.children[0].value.trim();
}

function tab(code: Code, index: number): RootContent {
  const label =
    code.meta?.match(/\[([^\]]+)\]/)?.[1] ??
    code.lang ??
    `Example ${index + 1}`;
  return {
    type: "mdxJsxFlowElement",
    name: "CodeTab",
    attributes: [{ type: "mdxJsxAttribute", name: "label", value: label }],
    children: [
      { ...code, meta: code.meta?.replace(/\[[^\]]+\]/, "").trim() || null },
    ],
  } as RootContent;
}

/** Turn VitePress-style containers into portable CodeGroup / CodeTab components. */
export default function remarkCodeGroup() {
  return (tree: Root) => {
    function transform(children: RootContent[]) {
      for (let index = 0; index < children.length; index += 1) {
        const node = children[index];
        if (marker(node) === "::: code-group") {
          const end = children.findIndex(
            (candidate, candidateIndex) =>
              candidateIndex > index && marker(candidate) === ":::",
          );
          if (end === -1) throw new Error("Unclosed ::: code-group container");
          const content = children.slice(index + 1, end);
          if (!content.length || content.some((child) => child.type !== "code"))
            throw new Error(
              "A ::: code-group must contain fenced code blocks only",
            );
          children.splice(index, end - index + 1, {
            type: "mdxJsxFlowElement",
            name: "CodeGroup",
            attributes: [],
            children: content.map((child, tabIndex) =>
              tab(child as Code, tabIndex),
            ),
          } as RootContent);
        } else if ("children" in node) {
          transform(node.children as RootContent[]);
        }
      }
    }
    transform(tree.children);
  };
}
