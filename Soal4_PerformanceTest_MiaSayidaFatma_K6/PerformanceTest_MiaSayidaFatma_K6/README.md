# DemoQA Book Store — Performance Testing with k6

Performance testing project for the DemoQA Book Store API using **Grafana k6**. Includes six workloads: baseline, load 10, load 50, load 100, stress, and soak.

> **Submission note:** The original assignment requests an Apache JMeter `.jmx` file. This repository implements the workflow in **k6 JavaScript** instead; it is not a `.jmx` file. Confirm that a k6-based submission is accepted.

## Test flow

1. `POST /Account/v1/Login` — authenticate and extract `userId`.
2. `POST /Account/v1/GenerateToken` — extract bearer token.
3. `GET /BookStore/v1/Books` — browse and dynamically select ISBN.
4. `GET /BookStore/v1/Book?ISBN=...` — verify selected book.
5. `DELETE /BookStore/v1/Books?UserId=...` — clear the disposable test account collection.
6. `POST /BookStore/v1/Books` — add book and assert HTTP 201 and matching ISBN.

**Warning:** The cleanup endpoint removes the **entire** book collection for the selected account. Use only dedicated disposable test accounts.

## Repository layout

```text
performance.js              # Workload scenarios and end-to-end API checks
registerUsers.js            # Utility for provisioning test accounts
testLogin.js                # Login verification utility
data/books.csv              # Optional ISBN fallback dataset
data/users.example.csv      # Example account CSV format
data/users.csv              # Real credentials — gitignored, DO NOT COMMIT
results/*.json              # k6 JSON summary exports
results/*-report.html       # k6 Web Dashboard HTML exports
README.md                   # Project setup and execution
PERFORMANCE_TEST_REPORT.md  # Measured results and analysis
.gitignore
```

## Prerequisites

- Install [Grafana k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).
- Have permission to load-test the chosen target environment. DemoQA is a **public shared demo**, so do not run high-concurrency workloads against it without authorization.
- Use a terminal from the project root. The commands below work in Git Bash on Windows.

## Test data

Create `data/users.csv` locally following `data/users.example.csv`. Supply enough **unique accounts** for the highest active VU ID (100 accounts for the configured peak). Passwords must follow the application's policy: at least 8 characters with uppercase, lowercase, digits, and special characters. Do not commit real usernames/passwords or tokens. The script assigns an account using `exec.vu.idInTest - 1`.

`data/books.csv` is optional fallback data; the normal path obtains ISBNs from the Browse Books API response. Keep `ALLOW_FALLBACK_ISBN` unset to verify API-sourced ISBNs.

## Scenarios

| Scenario | Executor | VUs | Ramp-up / duration |
|---|---|---|---|
| `baseline` | `per-vu-iterations` | 1 | 5 iterations; max 5m |
| `load10` | `ramping-vus` | 10 | 30s up, 2m hold, 30s down |
| `load50` | `ramping-vus` | 50 | 2m up, 3m hold, 1m down |
| `load100` | `ramping-vus` | 100 | 3m up, 5m hold, 1m down |
| `stress` | `ramping-vus` | 100 | 60s up, 2m hold, 60s down |
| `soak` | `constant-vus` | 20 | 30m sustained |

Baseline checks functional correctness and initial latency. Load tests increase concurrency to observe scaling and failures. Stress ramps to 100 VUs in one minute to expose degradation. Soak maintains 20% of peak load for 30 minutes to examine stability; diagnosing a memory leak additionally requires server telemetry.

## Run a low-load validation

```bash
k6 run -e SCENARIO=baseline performance.js
```

To save a JSON summary and HTML dashboard:

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=results/baseline-report.html k6 run -e SCENARIO=baseline --summary-export=results/baseline.json performance.js
```

## Other workloads — authorized test environments only

The script requires `AUTHORIZED_LOAD=true` for non-baseline scenarios. Run these only against an environment where you have explicit load-testing permission; set `BASE_URL` to that environment.

```bash
# Examples; replace URL with an explicitly authorized test environment.
BASE_URL=https://your-authorized-test-host.example K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=results/load10-report.html k6 run -e BASE_URL=https://your-authorized-test-host.example -e SCENARIO=load10 -e AUTHORIZED_LOAD=true --summary-export=results/load10.json performance.js

# Select a different scenario: load50, load100, stress, or soak.
# For soak, the default duration is 30m; optional override: -e SOAK_DURATION=30m
```

For additional scenarios, replace `load10` in the command and filenames with `load50`, `load100`, `stress`, or `soak`. Avoid executing 50/100-VU runs on the public DemoQA host.

## Metrics and assertions

Thresholds in `performance.js`:

```javascript
http_req_duration: ['p(95)<3000'],
http_req_failed: ['rate<0.05'],
checks: ['rate>0.95']
```

The script uses `SharedArray` for account data, `response.json()` for correlation, `Authorization: Bearer ...` for authenticated requests, `group()` and request `step` tags for workflow grouping, `sleep(1–3s)` for think time, and `check()` for functional assertions. HTTP request throughput is **not** the same as completed end-to-end flows per second.

## Results

See [Performance Test Report](PERFORMANCE_TEST_REPORT.md) for the measured results, pass/fail classification, interpretation, and limitations. The `results/` folder contains six JSON summaries and six HTML dashboard reports in the supplied archive.

## GitHub safety and publishing

The supplied `.gitignore` excludes `data/users.csv` and all `results/*` files. If you want to publish evidence, explicitly add **sanitized** report files after checking they contain no secrets or personal data, and adjust `.gitignore` accordingly. Do not commit `data/users.csv`, tokens, or any private credentials. Never force-add the credentials file.
