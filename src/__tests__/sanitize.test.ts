import { stripHtml, escapeHtml, sanitizeInput, sanitizeUrl } from "../lib/sanitize"

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<b>bold</b>")).toBe("bold")
    expect(stripHtml("<script>alert('xss')</script>")).toBe("alert('xss')")
  })
  it("handles nested tags", () => {
    expect(stripHtml("<div><p>text</p></div>")).toBe("text")
  })
  it("returns plain text unchanged", () => {
    expect(stripHtml("hello world")).toBe("hello world")
  })
  it("handles empty string", () => {
    expect(stripHtml("")).toBe("")
  })
})

describe("escapeHtml", () => {
  it("escapes special characters", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;")
    expect(escapeHtml('"quotes"')).toBe("&quot;quotes&quot;")
    expect(escapeHtml("a & b")).toBe("a &amp; b")
  })
  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#x27;s")
  })
  it("returns safe string unchanged", () => {
    expect(escapeHtml("hello")).toBe("hello")
  })
})

describe("sanitizeInput", () => {
  it("strips HTML and trims", () => {
    expect(sanitizeInput("  <b>bold</b>  ")).toBe("bold")
  })
  it("truncates to maxLength", () => {
    expect(sanitizeInput("a".repeat(100), 10)).toBe("a".repeat(10))
  })
  it("uses default maxLength of 5000", () => {
    expect(sanitizeInput("x".repeat(6000)).length).toBe(5000)
  })
})

describe("sanitizeUrl", () => {
  it("allows http URLs", () => {
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com")
  })
  it("allows https URLs", () => {
    expect(sanitizeUrl("https://example.com/path")).toBe("https://example.com/path")
  })
  it("blocks javascript: protocol", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("")
  })
  it("blocks data: protocol", () => {
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("")
  })
  it("returns empty for invalid URLs", () => {
    expect(sanitizeUrl("not-a-url")).toBe("")
  })
})
