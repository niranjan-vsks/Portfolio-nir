import { test, expect } from "@playwright/test";
import { ROUTES, FIREWALL_NAMES, BANNED } from "./routes";

/**
 * Scripted verification (PRD §20.1). Per route: no 4xx/5xx, no uncaught page
 * exceptions, no em-dash / banned phrase in visible copy, and a full-page
 * screenshot artifact. Firewall check on /system-design. (Console errors are
 * logged, not auto-failed: headless SwiftShader is noisy, §20.4.)
 */
const PHASE = process.env.PHASE ?? "R0";

for (const route of ROUTES) {
  test(`route ${route}`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(String(e)));

    const resp = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(resp, `no response for ${route}`).toBeTruthy();
    expect(resp!.status(), `bad status on ${route}`).toBeLessThan(400);

    // let 3D/lazy chunks settle
    await page.waitForTimeout(1200);

    expect(pageErrors, `uncaught error on ${route}: ${pageErrors[0] ?? ""}`).toHaveLength(0);

    const bodyText = (await page.locator("body").innerText()).toLowerCase();
    for (const phrase of BANNED) {
      expect(bodyText.includes(phrase.toLowerCase()), `banned "${phrase}" on ${route}`).toBeFalsy();
    }

    await page.screenshot({
      path: `verification/screenshots/phase-${PHASE}/${route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "")}.png`,
      fullPage: true,
    });
  });
}

test("firewall: no employer/client names on /system-design", async ({ page }) => {
  await page.goto("/system-design", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const html = (await page.content()).toLowerCase();
  for (const name of FIREWALL_NAMES) {
    expect(html.includes(name.toLowerCase()), `firewall leak: ${name}`).toBeFalsy();
  }
});
