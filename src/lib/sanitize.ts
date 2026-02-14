/**
 * Strip HTML tags from a string to prevent XSS.
 * Allows only plain text content.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "")
}

/**
 * Escape HTML entities to prevent XSS in rendered output.
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  }
  return input.replace(/[&<>"'/]/g, (char) => map[char])
}

/**
 * Sanitize user input for storage.
 * Strips HTML, trims whitespace, and limits length.
 */
export function sanitizeInput(input: string, maxLength = 5000): string {
  return stripHtml(input).trim().slice(0, maxLength)
}

/**
 * Sanitize a URL to prevent javascript: protocol attacks.
 * Returns empty string if the URL is unsafe.
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url
    }
    return ""
  } catch {
    return ""
  }
}
