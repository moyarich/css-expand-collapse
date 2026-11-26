import { performance } from "node:perf_hooks";

const [mode, workload, rawIterations] = process.argv.slice(2);
const iterations = Number(rawIterations);
if (!Number.isSafeInteger(iterations) || iterations < 1 || iterations > 1_000_000) {
  throw new Error("Expected an iteration count between 1 and 1000000.");
}
const snapshot = () => {
  const { rss, heapUsed, external, arrayBuffers } = process.memoryUsage();
  return { rss, heapUsed, external, arrayBuffers };
};
global.gc?.();
const beforeImport = snapshot();
const importStarted = performance.now();
const css = await import("../dist/index.js");
const importMs = performance.now() - importStarted;
const afterImport = snapshot();
const repeated = "8px 16px";
const layered = "linear-gradient(red, blue) center / cover, white";
const fragment = "margin:8px 16px;padding:4px;background:" + layered;
const sheet = Array.from({ length: 40 }, (_, index) =>
  ".item-" + index + "{" + fragment + ";margin-top:" + index + "px}",
).join("\n");
const margin = {
  "margin-top": "8px", "margin-right": "16px",
  "margin-bottom": "8px", "margin-left": "16px",
};
const declarations = { margin: repeated, padding: "4px", background: layered };
const operations = {
  "repeated": () => css.expandShorthand("margin", repeated),
  "unique": (index) => css.expandShorthand("margin", index + "px " + (index + 1) + "px"),
  "layered": () => css.expandShorthand("background", layered),
  "variables": () => css.expandShorthand("margin", "var(--space)", {
    customProperties: { "--space": "8px" },
  }),
  "collapse-property": () => css.collapseToShorthand("margin", margin),
  "expand-map": () => css.expandShorthands(declarations),
  "collapse-map": () => css.collapseLonghands(margin),
  "expand-fragment": () => css.expandDeclarations(fragment),
  "collapse-fragment": () => css.collapseDeclarations("margin-top:8px;margin-right:16px;margin-bottom:8px;margin-left:16px"),
  "invalid": () => css.expandShorthand("margin", "potato"),
  "unsupported": () => css.expandShorthand("all", "initial"),
  "expand-sheet": () => css.expandCss(sheet),
  "collapse-sheet": () => css.collapseCss(sheet),
};
if (!Object.hasOwn(operations, workload)) throw new Error("Unknown workload: " + workload);
const run = operations[workload];
function measureFirstCall() {
  const started = performance.now();
  const result = run(0);
  const elapsed = performance.now() - started;
  const expectsNull = workload === "invalid" || workload === "unsupported";
  if (expectsNull ? result !== null : result == null) {
    throw new Error("Unexpected workload result: " + workload);
  }
  return elapsed;
}
const firstCallMs = measureFirstCall();
global.gc?.();
const baseline = snapshot();
let peakSampled = baseline;
let elapsedMs = 0;
let sampleCount = 0;
if (mode === "warm") {
  // Warm-up is outside measured execution and retained-heap baseline.
  for (let index = 0; index < Math.min(iterations, 100); index++) run(index);
  global.gc?.();
  const warmed = snapshot();
  Object.assign(baseline, warmed);
  peakSampled = { ...warmed };
  const batchSize = Math.min(iterations, 100);
  for (let start = 0; start < iterations; start += batchSize) {
    const limit = Math.min(iterations, start + batchSize);
    const started = performance.now();
    for (let index = start; index < limit; index++) run(index);
    elapsedMs += performance.now() - started;
    const current = snapshot();
    for (const key of Object.keys(current)) {
      peakSampled[key] = Math.max(peakSampled[key], current[key]);
    }
    sampleCount++;
  }
} else if (mode !== "cold") {
  throw new Error("Unknown profiling mode: " + mode);
}
const beforeGc = snapshot();
global.gc?.();
const retained = snapshot();
const retainedDelta = Object.fromEntries(Object.keys(retained).map(
  (key) => [key, retained[key] - baseline[key]],
));
console.log(JSON.stringify({
  mode, workload, iterations: mode === "warm" ? iterations : 1,
  importMs, firstCallMs, elapsedMs,
  operationsPerSecond: mode === "warm" && elapsedMs > 0 ? iterations * 1000 / elapsedMs : null,
  gcAvailable: typeof global.gc === "function",
  memoryBytes: { beforeImport, afterImport, baseline, peakSampled, beforeGc, retained, retainedDelta },
  sampleCount,
  processMaxRssBytes: process.resourceUsage().maxRSS * 1024,
}));
