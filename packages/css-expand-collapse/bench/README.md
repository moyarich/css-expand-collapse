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
timing thresholds on CI. See the verified observational baseline below.

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
costs. The measured baseline below records a successful profiler run.

The profiler also covers map and fragment expansion/collapse, invalid values and unsupported shorthands. Benchmark-related pull requests run a small observational profile (100 iterations, three processes per mode and workload) and publish raw JSON in the job log and artifact. Manual runs retain configurable iterations and sample counts. No timing threshold or caching is introduced.

## Verified observational baseline

[CI profile, job 139671577585](https://github.com/moyarich/css-expand-collapse/actions/runs/45748883502/job/139671577585), revision `b2dd840c39ac27055ae9a7b34bcec7adf723bb00` (PR merge commit). Node v24.22.3, Linux 7.0.0-1020-azure x64, AMD EPYC 9V74, four logical CPUs. Three independent processes per mode/workload, 100 warm iterations per sample. Values below are medians; RSS is whole-process high-water memory, not allocation attributable solely to a transformation.

| Workload | Cold import (ms) | First call (ms) | Warm ops/s | Retained heap delta (bytes) | Peak RSS (MiB) |
| --- | ---: | ---: | ---: | ---: | ---: |
| repeated | 64.18 | 1.70 | 37609 | 46120 | 71.3 |
| unique | 65.49 | 1.69 | 36469 | 38696 | 70.2 |
| layered | 64.43 | 6.44 | 3959 | 2704 | 84.4 |
| variables | 61.96 | 1.98 | 32710 | 28928 | 70.6 |
| collapse-property | 60.86 | 2.09 | 23813 | 42232 | 71.3 |
| expand-map | 60.24 | 6.68 | 3674 | 24080 | 87.9 |
| collapse-map | 62.92 | 2.81 | 7927 | 19368 | 71.8 |
| expand-fragment | 63.08 | 10.15 | 2439 | 2728 | 86.8 |
| collapse-fragment | 62.87 | 5.10 | 6504 | 41936 | 77.2 |
| invalid | 64.13 | 1.92 | 35135 | 14560 | 68.5 |
| unsupported | 64.97 | 0.07 | 3746862 | 1280 | 67.6 |
| expand-sheet | 63.45 | 43.95 | 91 | 3696 | 235.6 |
| collapse-sheet | 64.31 | 44.16 | 106 | -8720 | 239.0 |

Repeated shorthand throughput was about 3.1% above unique inputs without caching; this is not a measurement of cache speedup. Retained heap deltas are small relative to process RSS and include runtime noise. Stylesheet operations have higher peak RSS and substantially lower throughput than single declarations. Defer caching: there is no demonstrated cache benefit, and cache key completeness, custom-property case sensitivity, bounded retention and mutable result isolation would add complexity. Since no cache was introduced, no cached/uncached parity claim is made. Future optimization proposals should compare an actual bounded implementation against this uncached baseline on the same environment with larger samples. These observations are not CI thresholds.
