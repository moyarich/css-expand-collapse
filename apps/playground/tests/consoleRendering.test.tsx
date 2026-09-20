import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ConsolePanel, type RunOutput } from "../src/components/Console/ConsolePanel";

function renderConsole(output: RunOutput) {
  return renderToStaticMarkup(
    <ConsolePanel output={output} onClear={() => undefined} />,
  );
}

describe("ConsolePanel rendering", () => {
  it("renders primitive console values", () => {
    const html = renderConsole({
      error: "",
      messages: [
        {
          method: "log",
          data: ["text", 2, true, null, undefined],
          depth: 0,
        },
      ],
    });

    expect(html).toContain("&quot;text&quot;");
    expect(html).toContain(">2<");
    expect(html).toContain(">true<");
    expect(html).toContain(">null<");
    expect(html).toContain(">undefined<");
  });

  it("renders object and array inspectors", () => {
    const html = renderConsole({
      error: "",
      messages: [
        {
          method: "log",
          data: [{ margin: "10px" }, [1, 2, 3]],
          depth: 0,
        },
      ],
    });

    expect(html).toContain("Object");
    expect(html).toContain("margin");
    expect(html).toContain("Array(3)");
    expect(html.match(/aria-label="Copy object"/g)?.length).toBe(2);
  });

  it("honors console.dir expansion depth", () => {
    const html = renderConsole({
      error: "",
      messages: [
        {
          method: "dir",
          data: [{ outer: { inner: { value: 1 } } }],
          depth: 0,
          expandLevel: 2,
        },
      ],
    });

    expect(html.match(/<details[^>]* open=""/g)?.length).toBe(2);
    expect(html).toContain("outer");
    expect(html).toContain("inner");
  });

  it("renders primitive console.table rows with a Value column", () => {
    const html = renderConsole({
      error: "",
      messages: [
        {
          method: "table",
          data: [[3, 23, 34, 21]],
          depth: 0,
        },
      ],
    });

    expect(html).toContain("(index)");
    expect(html).toContain(">Value<");
    expect(html).toContain(">0<");
    expect(html).toContain(">3<");
    expect(html).toContain(">23<");
    expect(html).toContain(">34<");
    expect(html).toContain(">21<");
  });

  it("renders object rows and respects requested table columns", () => {
    const html = renderConsole({
      error: "",
      messages: [
        {
          method: "table",
          data: [[
            { name: "margin", value: "10px" },
            { name: "padding", value: "8px" },
          ]],
          depth: 0,
          columns: ["name"],
        },
      ],
    });

    expect(html).toContain(">name<");
    expect(html).not.toContain(">value<");
    expect(html).toContain("&quot;margin&quot;");
    expect(html).toContain("&quot;padding&quot;");
  });

  it("renders warn, error, and assert message paths", () => {
    const html = renderConsole({
      error: "",
      messages: [
        { method: "warn", data: ["warning"], depth: 0 },
        { method: "error", data: ["error"], depth: 0 },
        { method: "assert", data: ["assertion"], depth: 0 },
      ],
    });

    expect(html).toContain('data-method="warn"');
    expect(html).toContain('data-method="error"');
    expect(html).toContain('data-method="assert"');
  });

  it("renders grouped messages with depth indentation", () => {
    const html = renderConsole({
      error: "",
      messages: [
        { method: "group", data: ["outer"], depth: 0 },
        { method: "log", data: ["inside"], depth: 1 },
      ],
    });

    expect(html).toContain('data-method="group"');
    expect(html).toContain("padding-left:30px");
    expect(html).toContain("&quot;inside&quot;");
  });

  it("appends runtime errors as console errors", () => {
    const html = renderConsole({
      error: "Error: boom",
      messages: [{ method: "log", data: ["before"], depth: 0 }],
    });

    expect(html).toContain("&quot;before&quot;");
    expect(html).toContain('data-method="error"');
    expect(html).toContain("&quot;Error: boom&quot;");
  });
});
