# Performance Test Report — DemoQA Book Store API

**Project:** PerformanceTest_MiaSayidaFatma  
**Tool:** Grafana k6  
**System under test:** `https://demoqa.com` (public demonstration application)  
**Evidence:** Six JSON summaries and six k6 Web Dashboard HTML exports included in the uploaded project archive.  
**Report basis:** Values below are extracted from the supplied `results/*.json` files; no tests were rerun to produce this document.

## 1. Objective and scope

Evaluate baseline latency, behavior under 10/50/100 virtual users, stress at 100 virtual users, and 30-minute soak stability for the Book Store API. The measured workflow is Login → Generate Token → Browse Books → Select Book → Cleanup Collection → Add Book. Cleanup runs **before** Add Book, and deletes all books in the test account collection; use only disposable accounts.

## 2. Workload configuration

| Scenario | Load | Configuration | Executor |
|---|---|---|---|
| Baseline | 1 VU | 5 iterations | Per-VU iterations |
| Load Test 10 | 10 VUs | 30s up / 2m hold / 30s down | Ramping VUs |
| Load Test 50 | 50 VUs | 2m up / 3m hold / 1m down | Ramping VUs |
| Load Test 100 | 100 VUs | 3m up / 5m hold / 1m down | Ramping VUs |
| Stress Test | 100 VUs | 1m up / 2m hold / 1m down | Ramping VUs |
| Soak Test | 20 VUs | 30m constant | Constant VUs |

Ramp-up stages were selected to gradually introduce concurrent VUs and observe latency/error changes. Baseline repeats the complete flow five times with one VU. Stress reaches 100 VUs within 60 seconds; soak uses 20 VUs (20% of the 100-VU peak) for 30 minutes. Ramping/constant-VU tests are duration-based, so the number of completed iterations depends on response times and request failures.

## 3. Acceptance thresholds

- `http_req_duration`: p95 < 3,000 ms.
- `http_req_failed`: rate < 5%.
- `checks`: rate > 95%.

All three must pass for a scenario to be labeled PASS. The JSON `thresholds` flags are k6 **breach indicators** (`true` means threshold breached), not PASS indicators.

## 4. Results summary

| Scenario | VUs | p95 | Avg RT | HTTP failures | Checks passed | Throughput | Completed iterations | Result |
|---|---|---|---|---|---|---|---|---|
| Baseline | 1 VU | 1.63s | 0.70s | 0.00% | 100.00% | 0.37 req/s | 5 | PASS |
| Load Test 10 | 10 VUs | 4.10s | 1.13s | 0.00% | 100.00% | 2.70 req/s | 85 | FAIL |
| Load Test 50 | 50 VUs | 29.34s | 12.96s | 0.10% | 97.96% | 2.56 req/s | 150 | FAIL |
| Load Test 100 | 100 VUs | 49.66s | 23.14s | 67.18% | 28.00% | 1.74 req/s | 893 | FAIL |
| Stress Test | 100 VUs | 50.96s | 11.51s | 53.41% | 42.82% | 5.83 req/s | 475 | FAIL |
| Soak Test | 20 VUs | 11.66s | 7.71s | 1.16% | 98.82% | 1.46 req/s | 544 | FAIL |

*RT = HTTP request response time; throughput = HTTP requests per second, not completed end-to-end transactions per second. Values are rounded for presentation.*

## 5. Scenario details

### Baseline

- Executor: Per-VU iterations; configuration: 5 iterations.
- Requests: 30; completed iterations: 5; throughput: 0.37 requests/second.
- Average response time: 0.70s; p95: 1.63s.
- HTTP failure rate: 0.00%; check success rate: 100.00%.
- Threshold outcome: **PASS**.
- Evidence: [`results/baseline.json`](results/baseline.json) and [`results/baseline-report.html`](results/baseline-report.html).

### Load Test 10

- Executor: Ramping VUs; configuration: 30s up / 2m hold / 30s down.
- Requests: 510; completed iterations: 85; throughput: 2.70 requests/second.
- Average response time: 1.13s; p95: 4.10s.
- HTTP failure rate: 0.00%; check success rate: 100.00%.
- Threshold outcome: **FAIL**.
- Evidence: [`results/load10.json`](results/load10.json) and [`results/load10-report.html`](results/load10-report.html).

### Load Test 50

- Executor: Ramping VUs; configuration: 2m up / 3m hold / 1m down.
- Requests: 964; completed iterations: 150; throughput: 2.56 requests/second.
- Average response time: 12.96s; p95: 29.34s.
- HTTP failure rate: 0.10%; check success rate: 97.96%.
- Threshold outcome: **FAIL**.
- Evidence: [`results/load50.json`](results/load50.json) and [`results/load50-report.html`](results/load50-report.html).

### Load Test 100

- Executor: Ramping VUs; configuration: 3m up / 5m hold / 1m down.
- Requests: 2514; completed iterations: 893; throughput: 1.74 requests/second.
- Average response time: 23.14s; p95: 49.66s.
- HTTP failure rate: 67.18%; check success rate: 28.00%.
- Threshold outcome: **FAIL**.
- Evidence: [`results/load100.json`](results/load100.json) and [`results/load100-report.html`](results/load100-report.html).

### Stress Test

- Executor: Ramping VUs; configuration: 1m up / 2m hold / 1m down.
- Requests: 1524; completed iterations: 475; throughput: 5.83 requests/second.
- Average response time: 11.51s; p95: 50.96s.
- HTTP failure rate: 53.41%; check success rate: 42.82%.
- Threshold outcome: **FAIL**.
- Evidence: [`results/stress.json`](results/stress.json) and [`results/stress-report.html`](results/stress-report.html).

### Soak Test

- Executor: Constant VUs; configuration: 30m constant.
- Requests: 3274; completed iterations: 544; throughput: 1.46 requests/second.
- Average response time: 7.71s; p95: 11.66s.
- HTTP failure rate: 1.16%; check success rate: 98.82%.
- Threshold outcome: **FAIL**.
- Evidence: [`results/soak.json`](results/soak.json) and [`results/soak-report.html`](results/soak-report.html).

## 6. Findings and interpretation

1. **Baseline:** The supplied run meets all three thresholds. This confirms the test flow works at low concurrency in that run, not production readiness.
2. **Load 10:** Compare the 10-VU result with baseline for initial scaling behavior. A PASS here does not imply higher concurrency will pass.
3. **Load 50 and 100:** The supplied results show substantially higher p95 latency and/or unsuccessful checks. The service or its dependencies did not maintain the selected service-level thresholds during these runs. Failed checks can include application-response validation, not just HTTP transport errors.
4. **Stress:** The 60-second ramp to 100 VUs breaches the thresholds; the result is evidence of significant degradation under the tested conditions, **not** a proven maximum capacity or a precise saturation point.
5. **Soak:** Sustained 20-VU behavior should be judged by latency and failure trends as well as the aggregate summary. The provided JSON alone does not prove a memory leak. Server memory/CPU telemetry and time-series evidence would be needed.
6. **Limitations:** DemoQA is a public shared demo system. Results can be affected by other traffic, rate limiting, connectivity, service instability, and client-side execution constraints. Root cause cannot be determined from these client-side metrics alone.

## 7. Correlation and functional checks

- CSV provides distinct user credentials by `exec.vu.idInTest`.
- Login response provides `userId`; script may fall back to the CSV `userId` if Login does not return one.
- GenerateToken response provides `token`; requests use `Authorization: Bearer <token>`.
- Browse Books response supplies a dynamic ISBN, reused for Select Book and Add Book. CSV fallback is only used when `ALLOW_FALLBACK_ISBN=true`.
- `check()` validates HTTP status, token/userId presence, Browse ISBN availability, Select ISBN match, cleanup 204, Add 201, and returned ISBN match.
- `group()` and request `step` tags distinguish logical steps. `sleep(1–3 seconds)` simulates think time.
- The baseline console log shared during review shows five `Source=API` ISBN selections and 65/65 successful checks; this additional run is not necessarily the same run as the archived baseline JSON.

**Important:** k6 `group()` is a logical grouping mechanism, not identical to a JMeter Transaction Controller. This project is a **k6 implementation**, not a JMeter `.jmx` deliverable.

## 8. Recommendations

- Investigate latency spikes, 5xx responses, and failed token/login checks using server-side logs and infrastructure metrics on an authorized test environment.
- Compare per-step trends (`step=login`, `token`, `browse`, `select`, `cleanup`, `add`) to locate bottlenecks; aggregate request p95 does not isolate one endpoint.
- Verify full end-to-end success per iteration with an explicit final E2E check or counter if an exact transaction success rate is required; early `return` statements can end iterations without marking the entire iteration as failed.
- Avoid further high-load testing of the public demo environment without explicit authorization and coordination.
- For leak investigation, collect memory/CPU metrics and a time-series profile during an authorized long-duration soak.

## 9. Reproducibility and evidence

See [README.md](README.md) for commands, dataset setup, and repository safety. The archived HTML dashboard and JSON summary for each scenario are linked in Section 5. **Do not commit `data/users.csv`**, credentials, or authentication tokens.
