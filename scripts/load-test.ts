/**
 * Load Test Runner for CS Viz App
 *
 * Usage: npx tsx scripts/load-test.ts [--base-url http://localhost:3000] [--json]
 *
 * Scenarios:
 *   - Feed GET (50 concurrent)
 *   - Share GET (30 concurrent)
 *   - Comments POST (10 concurrent)
 *   - Search GET (20 concurrent)
 *   - Rate Limit (sequential burst to trigger 429s)
 */

// ─── Types ──────────────────────────────────────────────────

type RequestResult = {
  status: number
  latency: number // ms
  success: boolean
  error?: string
}

type ScenarioMetrics = {
  name: string
  concurrency: number
  totalRequests: number
  successCount: number
  failCount: number
  successRate: number
  latency: {
    min: number
    max: number
    avg: number
    p95: number
    p99: number
  }
  rps: number
  durationMs: number
}

type RateLimitMetrics = {
  endpoint: string
  totalRequests: number
  accepted: number // 2xx/4xx (non-429)
  rateLimited: number // 429 responses
  rateLimitRate: number // percentage of 429s
  policyLimit: number
  policyWindowSeconds: number
}

type LoadTestResults = {
  baseUrl: string
  timestamp: string
  scenarios: ScenarioMetrics[]
  rateLimitTests: RateLimitMetrics[]
  summary: {
    totalRequests: number
    totalSuccess: number
    totalFail: number
    overallSuccessRate: number
    totalDurationMs: number
  }
}

// ─── Helpers ────────────────────────────────────────────────

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

function calculateMetrics(
  name: string,
  concurrency: number,
  results: RequestResult[],
  durationMs: number
): ScenarioMetrics {
  const latencies = results.map((r) => r.latency).sort((a, b) => a - b)
  const successCount = results.filter((r) => r.success).length

  return {
    name,
    concurrency,
    totalRequests: results.length,
    successCount,
    failCount: results.length - successCount,
    successRate:
      results.length > 0
        ? Math.round((successCount / results.length) * 10000) / 100
        : 0,
    latency: {
      min: latencies.length > 0 ? latencies[0] : 0,
      max: latencies.length > 0 ? latencies[latencies.length - 1] : 0,
      avg:
        latencies.length > 0
          ? Math.round(
              latencies.reduce((a, b) => a + b, 0) / latencies.length
            )
          : 0,
      p95: percentile(latencies, 95),
      p99: percentile(latencies, 99),
    },
    rps:
      durationMs > 0
        ? Math.round((results.length / (durationMs / 1000)) * 100) / 100
        : 0,
    durationMs,
  }
}

async function makeRequest(
  url: string,
  options?: RequestInit
): Promise<RequestResult> {
  const start = performance.now()
  try {
    const res = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30000),
    })
    const latency = Math.round(performance.now() - start)
    return {
      status: res.status,
      latency,
      success: res.status >= 200 && res.status < 400,
    }
  } catch (err) {
    const latency = Math.round(performance.now() - start)
    return {
      status: 0,
      latency,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function runConcurrent(
  concurrency: number,
  totalRequests: number,
  requestFn: () => Promise<RequestResult>
): Promise<{ results: RequestResult[]; durationMs: number }> {
  const results: RequestResult[] = []
  let completed = 0
  const start = performance.now()

  // Run in waves of `concurrency` size
  while (completed < totalRequests) {
    const batchSize = Math.min(concurrency, totalRequests - completed)
    const batch = Array.from({ length: batchSize }, () => requestFn())
    const batchResults = await Promise.all(batch)
    results.push(...batchResults)
    completed += batchSize
  }

  const durationMs = Math.round(performance.now() - start)
  return { results, durationMs }
}

// ─── Scenarios ──────────────────────────────────────────────

async function scenarioFeedGet(baseUrl: string): Promise<ScenarioMetrics> {
  const concurrency = 50
  const totalRequests = 100

  const { results, durationMs } = await runConcurrent(
    concurrency,
    totalRequests,
    () => {
      const page = Math.floor(Math.random() * 5) + 1
      return makeRequest(
        `${baseUrl}/api/community?page=${page}&limit=10&sort=recent`
      )
    }
  )

  return calculateMetrics("Feed GET", concurrency, results, durationMs)
}

async function scenarioShareGet(baseUrl: string): Promise<ScenarioMetrics> {
  const concurrency = 30
  const totalRequests = 60

  const slugs = ["test-slug-1", "test-slug-2", "test-slug-3"]

  const { results, durationMs } = await runConcurrent(
    concurrency,
    totalRequests,
    () => {
      const slug = slugs[Math.floor(Math.random() * slugs.length)]
      return makeRequest(`${baseUrl}/api/share/${slug}`)
    }
  )

  return calculateMetrics("Share GET", concurrency, results, durationMs)
}

async function scenarioCommentsPost(
  baseUrl: string
): Promise<ScenarioMetrics> {
  const concurrency = 10
  const totalRequests = 20

  const { results, durationMs } = await runConcurrent(
    concurrency,
    totalRequests,
    () => {
      return makeRequest(`${baseUrl}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Load test comment ${Date.now()}`,
          postId: "test-post-id",
        }),
      })
    }
  )

  return calculateMetrics("Comments POST", concurrency, results, durationMs)
}

async function scenarioSearchGet(baseUrl: string): Promise<ScenarioMetrics> {
  const concurrency = 20
  const totalRequests = 40

  const queries = ["HTTP", "git", "concurrency", "network", "thread"]

  const { results, durationMs } = await runConcurrent(
    concurrency,
    totalRequests,
    () => {
      const q = queries[Math.floor(Math.random() * queries.length)]
      return makeRequest(`${baseUrl}/api/search?q=${encodeURIComponent(q)}`)
    }
  )

  return calculateMetrics("Search GET", concurrency, results, durationMs)
}

// ─── Rate Limit Tests ───────────────────────────────────────

async function testRateLimit(
  baseUrl: string,
  endpoint: string,
  method: string,
  totalRequests: number,
  policyLimit: number,
  policyWindowSeconds: number,
  body?: object
): Promise<RateLimitMetrics> {
  const results: RequestResult[] = []

  // Send requests sequentially to accurately test rate limiting
  for (let i = 0; i < totalRequests; i++) {
    const result = await makeRequest(`${baseUrl}${endpoint}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    results.push(result)
  }

  const rateLimited = results.filter((r) => r.status === 429).length
  const accepted = results.filter((r) => r.status !== 429).length

  return {
    endpoint,
    totalRequests,
    accepted,
    rateLimited,
    rateLimitRate:
      totalRequests > 0
        ? Math.round((rateLimited / totalRequests) * 10000) / 100
        : 0,
    policyLimit,
    policyWindowSeconds,
  }
}

async function runRateLimitTests(
  baseUrl: string
): Promise<RateLimitMetrics[]> {
  const tests: RateLimitMetrics[] = []

  // API general rate limit: 60 req/60s
  tests.push(
    await testRateLimit(
      baseUrl,
      "/api/community?page=1&limit=5",
      "GET",
      70, // exceed the 60 limit
      60,
      60
    )
  )

  // Comment rate limit: 10 req/60s
  tests.push(
    await testRateLimit(
      baseUrl,
      "/api/comments",
      "POST",
      15, // exceed the 10 limit
      10,
      60,
      { content: "Rate limit test", postId: "test-id" }
    )
  )

  return tests
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const baseUrlIndex = args.indexOf("--base-url")
  const baseUrl =
    baseUrlIndex !== -1 && args[baseUrlIndex + 1]
      ? args[baseUrlIndex + 1]
      : "http://localhost:3000"
  const jsonOutput = args.includes("--json")

  if (!jsonOutput) {
    console.log("=" .repeat(60))
    console.log("  CS Viz App - Load Test Runner")
    console.log("=" .repeat(60))
    console.log(`  Base URL: ${baseUrl}`)
    console.log(`  Started:  ${new Date().toISOString()}`)
    console.log("")
  }

  // Check if server is reachable
  try {
    await fetch(baseUrl, { signal: AbortSignal.timeout(5000) })
  } catch {
    if (!jsonOutput) {
      console.error(`Error: Cannot connect to ${baseUrl}`)
      console.error("Make sure the server is running: npm run dev")
    }
    process.exit(1)
  }

  const scenarios: ScenarioMetrics[] = []

  // Run scenarios sequentially to avoid interference
  const scenarioFns = [
    { name: "Feed GET", fn: scenarioFeedGet },
    { name: "Share GET", fn: scenarioShareGet },
    { name: "Comments POST", fn: scenarioCommentsPost },
    { name: "Search GET", fn: scenarioSearchGet },
  ]

  for (const { name, fn } of scenarioFns) {
    if (!jsonOutput) {
      process.stdout.write(`  Running: ${name}...`)
    }
    const metrics = await fn(baseUrl)
    scenarios.push(metrics)
    if (!jsonOutput) {
      console.log(` done (${metrics.durationMs}ms)`)
    }
  }

  // Run rate limit tests
  if (!jsonOutput) {
    console.log("")
    process.stdout.write("  Running: Rate Limit Tests...")
  }
  const rateLimitTests = await runRateLimitTests(baseUrl)
  if (!jsonOutput) {
    console.log(" done")
  }

  // Build results
  const totalRequests = scenarios.reduce((s, m) => s + m.totalRequests, 0)
  const totalSuccess = scenarios.reduce((s, m) => s + m.successCount, 0)
  const totalFail = scenarios.reduce((s, m) => s + m.failCount, 0)
  const totalDurationMs = scenarios.reduce((s, m) => s + m.durationMs, 0)

  const results: LoadTestResults = {
    baseUrl,
    timestamp: new Date().toISOString(),
    scenarios,
    rateLimitTests,
    summary: {
      totalRequests,
      totalSuccess,
      totalFail,
      overallSuccessRate:
        totalRequests > 0
          ? Math.round((totalSuccess / totalRequests) * 10000) / 100
          : 0,
      totalDurationMs,
    },
  }

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2))
    return
  }

  // Print table
  console.log("")
  console.log("-".repeat(60))
  console.log(
    "  Scenario".padEnd(20) +
      "Reqs".padStart(6) +
      "OK%".padStart(7) +
      "Avg".padStart(7) +
      "P95".padStart(7) +
      "P99".padStart(7) +
      "RPS".padStart(8)
  )
  console.log("-".repeat(60))

  for (const s of scenarios) {
    console.log(
      `  ${s.name}`.padEnd(20) +
        String(s.totalRequests).padStart(6) +
        `${s.successRate}%`.padStart(7) +
        `${s.latency.avg}ms`.padStart(7) +
        `${s.latency.p95}ms`.padStart(7) +
        `${s.latency.p99}ms`.padStart(7) +
        String(s.rps).padStart(8)
    )
  }

  console.log("-".repeat(60))
  console.log("")

  // Rate limit results
  console.log("  Rate Limit Tests:")
  console.log("-".repeat(60))
  console.log(
    "  Endpoint".padEnd(30) +
      "Reqs".padStart(6) +
      "429s".padStart(6) +
      "429%".padStart(7) +
      "Policy".padStart(12)
  )
  console.log("-".repeat(60))
  for (const rl of rateLimitTests) {
    console.log(
      `  ${rl.endpoint}`.padEnd(30) +
        String(rl.totalRequests).padStart(6) +
        String(rl.rateLimited).padStart(6) +
        `${rl.rateLimitRate}%`.padStart(7) +
        `${rl.policyLimit}/${rl.policyWindowSeconds}s`.padStart(12)
    )
  }
  console.log("-".repeat(60))
  console.log("")
  console.log(`  Total Requests:  ${totalRequests}`)
  console.log(`  Success Rate:    ${results.summary.overallSuccessRate}%`)
  console.log(`  Total Duration:  ${totalDurationMs}ms`)
  console.log("")
  console.log("  Tip: Run with --json for machine-readable output")
  console.log("  Tip: Run with --base-url <url> to test a different server")
  console.log("")
}

main().catch((err) => {
  console.error("Load test failed:", err)
  process.exit(1)
})
