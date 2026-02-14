import { test, expect } from "@playwright/test"

test.describe("Smoke Tests", () => {
  test("homepage loads and shows hero", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("body")).toBeVisible()
    await expect(page.locator("text=CS Viz")).toBeVisible()
  })

  test("modules page loads", async ({ page }) => {
    await page.goto("/modules")
    await expect(page.locator("body")).toBeVisible()
  })

  test("community page loads", async ({ page }) => {
    await page.goto("/community")
    await expect(page.locator("body")).toBeVisible()
  })

  test("login page loads", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("body")).toBeVisible()
    await expect(page.locator("text=로그인")).toBeVisible()
  })

  test("session page loads for http-journey", async ({ page }) => {
    await page.goto("/session/http-journey")
    await expect(page.locator("body")).toBeVisible()
  })

  test("session page loads for concurrency", async ({ page }) => {
    await page.goto("/session/concurrency")
    await expect(page.locator("body")).toBeVisible()
  })

  test("session page loads for git-pr", async ({ page }) => {
    await page.goto("/session/git-pr")
    await expect(page.locator("body")).toBeVisible()
  })

  test("navigation between pages works", async ({ page }) => {
    await page.goto("/")
    // Navigate to modules
    const modulesLink = page.locator('a[href="/modules"]').first()
    if (await modulesLink.isVisible()) {
      await modulesLink.click()
      await expect(page).toHaveURL(/\/modules/)
    }
  })
})
