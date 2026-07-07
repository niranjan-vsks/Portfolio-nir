import { defineConfig, devices } from "@playwright/test";

/**
 * Verification harness (PRD §20). Headed by default so WebGL renders on a real
 * GPU rather than SwiftShader (§20.4). Boots the dev server if one is not
 * already running. Run: `npm run test:verify` (scripted crawl + copy/firewall
 * audit + screenshots). Visual side-by-side vs template sources uses the
 * Playwright MCP interactively, not this file.
 */
export default defineConfig({
  testDir: "./tests/verify",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.VERIFY_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    // Headed so real WebGL renders; toggle with PWHEADLESS=1 for CI-ish runs.
    headless: process.env.PWHEADLESS === "1",
    launchOptions: {
      args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-gl=angle"],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: process.env.VERIFY_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
