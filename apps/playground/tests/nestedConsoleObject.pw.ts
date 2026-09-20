import { expect, test } from "@playwright/test";

const SOURCE = `
const result = {
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
                  budget: 1250000,
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
                              isHealthy: true
                            },
                            {
                              serviceName: "billing-engine",
                              runtime: "Go 1.21",
                              isHealthy: true
                            }
                          ]
                        }
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      }
    }
  ]
};

console.log(result);
`;

async function replaceEditorSource(page: import("@playwright/test").Page) {
  const editor = page.getByRole("textbox", {
    name: "TypeScript API playground",
  });

  await expect(editor).toBeVisible();
  await editor.click();

  const selectAll = process.platform === "darwin" ? "Meta+A" : "Control+A";
  const runShortcut = process.platform === "darwin" ? "Meta+Enter" : "Control+Enter";

  await page.keyboard.press(selectAll);
  await page.keyboard.insertText(SOURCE);
  await page.keyboard.press(runShortcut);
}

async function expandObject(
  page: import("@playwright/test").Page,
  propertyKey?: string,
) {
  const summary = propertyKey
    ? page.locator(`summary[data-console-object-key="${propertyKey}"]`)
    : page.locator(
        '.console-object-shell[data-depth="0"] > .console-object > summary',
      );

  await expect(summary).toBeVisible();
  await summary.click();
}

test.describe("nested console objects", () => {
  test("deep object stays readable and copy actions do not overlap", async ({
    page,
  }) => {
    await page.goto("/#/api/expand-shorthand");
    await replaceEditorSource(page);

    await expect(page.locator(".console-object-shell[data-depth='0']")).toBeVisible();

    await expandObject(page);
    await expandObject(page, "divisions");
    await expandObject(page, "0");
    await expandObject(page, "departments");
    await expandObject(page, "engineering");
    await expandObject(page, "teams");
    await expandObject(page, "0");
    await expandObject(page, "projects");
    await expandObject(page, "quantumCloud");
    await expandObject(page, "repositories");
    await expandObject(page, "0");
    await expandObject(page, "deploymentPipelines");
    await expandObject(page, "productionEnv");
    await expandObject(page, "microservices");

    const departmentHeadRow = page.locator(
      '[data-console-property-key="departmentHead"]',
    );
    const departmentHeadValue = departmentHeadRow.locator(".console-string");

    await expect(departmentHeadValue).toHaveText('"Sarah Jenkins"');

    const valueBox = await departmentHeadValue.boundingBox();
    expect(valueBox).not.toBeNull();
    expect(valueBox!.width).toBeGreaterThan(80);
    expect(valueBox!.height).toBeLessThan(40);

    const engineeringSummary = page.locator(
      'summary[data-console-object-key="engineering"]',
    );
    const engineeringObject = engineeringSummary.locator("..");
    const engineeringCopy = engineeringObject.locator(
      ":scope > .console-object-copy-button",
    );

    const departmentsSummary = page.locator(
      'summary[data-console-object-key="departments"]',
    );
    const departmentsObject = departmentsSummary.locator("..");
    const departmentsCopy = departmentsObject.locator(
      ":scope > .console-object-copy-button",
    );

    await engineeringSummary.hover();
    await expect(engineeringCopy).toHaveCSS("opacity", "1");
    await expect(departmentsCopy).toHaveCSS("opacity", "0");

    const engineeringPreview = engineeringSummary.locator(
      ".console-object-preview",
    );
    const previewBox = await engineeringPreview.boundingBox();
    const copyBox = await engineeringCopy.boundingBox();

    expect(previewBox).not.toBeNull();
    expect(copyBox).not.toBeNull();
    expect(previewBox!.x + previewBox!.width).toBeLessThanOrEqual(copyBox!.x + 1);

    const consoleSurface = page.locator(".console-surface");
    const surfaceMetrics = await consoleSurface.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));

    expect(surfaceMetrics.scrollWidth).toBeLessThanOrEqual(
      surfaceMetrics.clientWidth + 40,
    );

    await expect(
      page.locator('summary[data-console-object-key="microservices"]'),
    ).toBeVisible();
    await expect(page.getByText('"auth-gateway"')).toBeVisible();
    await expect(page.getByText('"billing-engine"')).toBeVisible();
  });
});
