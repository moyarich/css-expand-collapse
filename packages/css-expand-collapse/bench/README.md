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
