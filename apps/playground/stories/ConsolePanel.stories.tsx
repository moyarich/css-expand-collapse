import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import "../src/styles.css";
import "../src/components/APIPlayground/APIPlayground.css";
import { ConsolePanel } from "../src/components/Console/ConsolePanel";

const NESTED_ENTERPRISE = {
  enterpriseName: "TechNova Global",
  hqLocation: "San Francisco",
  divisions: [
    {
      divisionId: "DIV-01",
      divisionName: "Digital Products Innovation Division",
      departments: {
        engineering: {
          departmentHeadBudgetManagement: "Sarah Jenkins",
          teams: [
            {
              teamName: "Core Platform",
              scrumMaster: "Alex Rivera",
              projects: {
                quantumCloud: {
                  status: "Active",
                  budget: 1_250_000,
                  repositories: [
                    {
                      repoName: "nova-cloud-core",
                      mainBranch: "main",
                      deploymentPipelines: {
                        productionEnv: {
                          provider: "AWS",
                          region: "us-west-2",
                          microservices: [
                            {
                              serviceName: "auth-gateway",
                              runtime: "Node.js v20",
                              isHealthy: true,
                            },
                            {
                              serviceName: "billing-engine",
                              runtime: "Go 1.21",
                              isHealthy: true,
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  ],
};

const meta = {
  title: "API Playground/Console",
  component: ConsolePanel,
  decorators: [
    (Story) => (
      <div
        className="api-playground"
        style={{ maxWidth: 960, margin: "0 auto" }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
  },
  tags: ["test"],
} satisfies Meta<typeof ConsolePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    output: {
      messages: [],
      error: "",
    },
    onClear: fn(),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("Run the code to see console output."),
    ).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Clear" })).toBeDisabled();
  },
};

export const NestedObject: Story = {
  args: {
    output: {
      messages: [
        {
          method: "log",
          data: [NESTED_ENTERPRISE],
          depth: 0,
        },
      ],
      error: "",
    },
    onClear: fn(),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("log")).toBeInTheDocument();
    await expect(canvas.getByText("Object")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Clear" })).toBeEnabled();
    await expect(
      canvas.getByRole("button", { name: "Copy object" }),
    ).toBeInTheDocument();
  },
};
