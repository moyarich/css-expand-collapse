import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import "../../styles.css";
import "./APIPlayground.css";
import { Console } from "./Console";

const NESTED_ENTERPRISE = {
  enterpriseName: "TechNova Global",
  hqLocation: "San Francisco",
  divisions: [
    {
      divisionId: "DIV-01",
      divisionName: "Digital Innovation",
      departments: {
        engineering: {
          departmentHead: "Sarah Jenkins",
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
  component: Console,
  decorators: [
    (Story) => (
      <div className="api-playground" style={{ maxWidth: 960, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
  },
  tags: ["test"],
} satisfies Meta<typeof Console>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    output: {
      logs: [],
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
      logs: [
        {
          method: "log",
          data: ["result", NESTED_ENTERPRISE],
        },
      ],
      error: "",
    },
    onClear: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("log")).toBeInTheDocument();
    await expect(canvas.getByText("result")).toBeInTheDocument();

    const clearButton = canvas.getByRole("button", { name: "Clear" });
    await expect(clearButton).toBeEnabled();

    await userEvent.click(clearButton);
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  },
};
