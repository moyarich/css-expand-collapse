import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeGroup, CodeTab } from "../src/components/CodeGroup";
import { CodeBlock } from "../src/components/CodeBlock";

const meta = {
  title: "Components/CodeGroup",
  component: CodeGroup,
  args: { children: null },
  parameters: { layout: "padded" },
} satisfies Meta<typeof CodeGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReactUsage: Story = {
  render: () => (
    <CodeGroup>
      <CodeTab label="npm">
        <CodeBlock>
          <code>npm install @moyarich/css-expand-collapse</code>
        </CodeBlock>
      </CodeTab>
      <CodeTab label="pnpm">
        <CodeBlock>
          <code>pnpm add @moyarich/css-expand-collapse</code>
        </CodeBlock>
      </CodeTab>
      <CodeTab label="yarn">
        <CodeBlock>
          <code>yarn add @moyarich/css-expand-collapse</code>
        </CodeBlock>
      </CodeTab>
      <CodeTab label="bun">
        <CodeBlock>
          <code>bun add @moyarich/css-expand-collapse</code>
        </CodeBlock>
      </CodeTab>
    </CodeGroup>
  ),
};
