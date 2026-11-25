# Transformation benchmarks

From the repository root:

```sh
npm ci
npm run bench --workspace @moyarich/css-expand-collapse
```

The suite measures warmed-up runtime and throughput for repeated and rotating
property inputs, declaration maps, fragments, and a 40-rule stylesheet. It
also includes custom-property resolution, invalid/unsupported input, and layered
values. Inputs are prepared outside measured callbacks.

Record Node and OS versions, CPU, dependency lockfile revision, and Vitest
output when comparing results. Run multiple times on the same machine.
Measure first-call latency in a fresh process separately; the Vitest warm-up
suite does not represent cold-start latency. Measure peak and retained memory
in isolated processes before deciding whether a bounded cache is worthwhile.

No cache is introduced by this change. Benchmarks are opt-in and do not impose
timing thresholds on CI. Baseline measurements are still pending.

## Cold-start and memory profile

Build and run the isolated process profiler from the root:

```sh
npm run bench:profile --workspace @moyarich/css-expand-collapse
```

For machine-readable output without npm build logs:

```sh
npm run build:lib
BENCH_ITERATIONS=1000 BENCH_SAMPLES=5 node packages/css-expand-collapse/bench/profile.mjs > performance-profile.json
```

The opt-in Library performance profile GitHub Actions workflow also uploads the
JSON report. Each sample uses a fresh Node process with explicit garbage
collection enabled. Cold measurements distinguish module import from first
transformation. Warm measurements exclude warm-up, memory sampling and forced
GC from the reported operation time. The report includes throughput, sampled
heap/RSS peaks, process high-water RSS, retained memory after GC, and environment
metadata. Sampled peaks are lower bounds, not exact allocation peaks; RSS
includes Node and dependency overhead. Negative retained deltas are possible.

Compare repeated and unique workloads on the same machine across multiple
samples. These results are observational, not CI pass/fail thresholds. A cache
is deliberately deferred until measured gains outweigh memory and correctness
costs. No baseline result is claimed until the profiler has actually run.
