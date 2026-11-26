import { spawnSync } from "node:child_process";
import { cpus, platform, release, arch } from "node:os";
import { fileURLToPath } from "node:url";

const worker = fileURLToPath(new URL("./profile-worker.mjs", import.meta.url));
const workloads = ["repeated", "unique", "layered", "variables", "collapse-property", "expand-map", "collapse-map", "expand-fragment", "collapse-fragment", "invalid", "unsupported", "expand-sheet", "collapse-sheet"];
const iterations = Number(process.env.BENCH_ITERATIONS ?? 1000);
const samples = Number(process.env.BENCH_SAMPLES ?? 5);
if (!Number.isSafeInteger(samples) || samples < 1 || samples > 30) {
  throw new Error("BENCH_SAMPLES must be an integer from 1 to 30.");
}
if (!Number.isSafeInteger(iterations) || iterations < 1 || iterations > 1_000_000) {
  throw new Error("BENCH_ITERATIONS must be an integer from 1 to 1000000.");
}
const report = {
  environment: {
    node: process.version, platform: platform(), release: release(), arch: arch(),
    cpu: cpus()[0]?.model, logicalCpus: cpus().length,
    revision: process.env.GITHUB_SHA ?? null,
  },
  iterations, samples, results: [],
};
for (const workload of workloads) {
  for (const mode of ["cold", "warm"]) {
    for (let sample = 0; sample < samples; sample++) {
      const child = spawnSync(process.execPath, ["--expose-gc", worker, mode, workload, String(iterations)], {
        encoding: "utf8", timeout: 300_000,
      });
      if (child.error || child.status !== 0) {
        throw new Error("Profiling failed for " + workload + "/" + mode + ": " +
          (child.error?.message ?? child.stderr ?? child.signal));
      }
      report.results.push({ sample: sample + 1, ...JSON.parse(child.stdout.trim()) });
    }
  }
}
console.log(JSON.stringify(report, null, 2));
