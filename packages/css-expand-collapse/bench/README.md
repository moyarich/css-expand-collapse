# Transformation performance

The following measurements provide an indication of the library's runtime and memory use for individual CSS properties, declaration maps, fragments and stylesheets. Your results will depend on your environment and workload. See [benchmark methodology](CONTRIBUTING.md) to reproduce the measurements.

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

Repeated shorthand throughput was about 3.1% above unique inputs without caching; this is not a measurement of cache speedup. Retained heap deltas include runtime noise. Stylesheet operations have higher peak RSS and lower throughput than single declarations. These measurements are observational, not performance guarantees or CI thresholds.
