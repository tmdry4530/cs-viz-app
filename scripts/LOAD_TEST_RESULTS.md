# Load Test Results

## Test Configuration

| Parameter | Value |
|-----------|-------|
| Base URL | `http://localhost:3000` |
| Date | YYYY-MM-DD |
| Environment | Development / Staging / Production |
| Node.js Version | vXX.X.X |
| Database | PostgreSQL (local / remote) |

## Scenarios

### 1. Feed GET (50 concurrent)
- **Endpoint**: `GET /api/community?page=N&limit=10&sort=recent`
- **Total Requests**: 100
- **Concurrency**: 50

| Metric | Value |
|--------|-------|
| Success Rate | __%  |
| Avg Latency | __ms |
| P95 Latency | __ms |
| P99 Latency | __ms |
| Min Latency | __ms |
| Max Latency | __ms |
| RPS | __ |

### 2. Share GET (30 concurrent)
- **Endpoint**: `GET /api/share/:slug`
- **Total Requests**: 60
- **Concurrency**: 30

| Metric | Value |
|--------|-------|
| Success Rate | __%  |
| Avg Latency | __ms |
| P95 Latency | __ms |
| P99 Latency | __ms |
| Min Latency | __ms |
| Max Latency | __ms |
| RPS | __ |

### 3. Comments POST (10 concurrent)
- **Endpoint**: `POST /api/comments`
- **Total Requests**: 20
- **Concurrency**: 10

| Metric | Value |
|--------|-------|
| Success Rate | __%  |
| Avg Latency | __ms |
| P95 Latency | __ms |
| P99 Latency | __ms |
| Min Latency | __ms |
| Max Latency | __ms |
| RPS | __ |

### 4. Search GET (20 concurrent)
- **Endpoint**: `GET /api/search?q=QUERY`
- **Total Requests**: 40
- **Concurrency**: 20

| Metric | Value |
|--------|-------|
| Success Rate | __%  |
| Avg Latency | __ms |
| P95 Latency | __ms |
| P99 Latency | __ms |
| Min Latency | __ms |
| Max Latency | __ms |
| RPS | __ |

## Rate Limit Tests

| Endpoint | Total Reqs | 429 Responses | 429 Rate | Policy |
|----------|-----------|---------------|----------|--------|
| `GET /api/community` | 70 | __ | __% | 60/60s |
| `POST /api/comments` | 15 | __ | __% | 10/60s |

### Rate Limit Policy Reference

| Limiter | Limit | Window |
|---------|-------|--------|
| API (general) | 60 req | 60s |
| Login | 5 req | 60s |
| Comment | 10 req | 60s |
| Report | 3 req | 300s |
| Share | 10 req | 60s |

## Summary

| Metric | Value |
|--------|-------|
| Total Requests | __ |
| Overall Success Rate | __% |
| Total Duration | __ms |

## Notes

- Replace `__` values with actual results from running: `npx tsx scripts/load-test.ts`
- For JSON output: `npx tsx scripts/load-test.ts --json`
- For custom base URL: `npx tsx scripts/load-test.ts --base-url https://staging.example.com`

## Observations

_Add observations about performance bottlenecks, unexpected failures, or areas for optimization here._
