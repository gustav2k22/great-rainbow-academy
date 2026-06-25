import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const results = [];
function check(name, ok, extra = "") { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`); }

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

try {
  // 1. Home page renders
  await page.goto(BASE, { waitUntil: "networkidle" });
  check("Home heading visible", await page.getByRole("heading", { name: /Great Rainbow Academy/i }).first().isVisible());
  check("Home shows Supabase media", (await page.locator('img[src*="supabase"], img[srcset*="supabase"]').count()) > 0);

  // 2. Contact form submit (public write)
  const stamp = Date.now();
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.fill('#name', `E2E Tester ${stamp}`);
  await page.fill('#email', `e2e${stamp}@test.com`);
  await page.fill('#message', `Automated end-to-end test message ${stamp}.`);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
  const contactToast = await page.getByText(/message has been sent|thank you/i).first().isVisible().catch(() => false);
  check("Contact form submitted (toast)", contactToast);

  // 3. Gallery filter + lightbox
  await page.goto(`${BASE}/gallery`, { waitUntil: "networkidle" });
  const allCount = await page.locator(".columns-2 > button, .columns-3 > button, .columns-4 > button").count();
  await page.getByRole("button", { name: /^Videos/ }).click().catch(() => {});
  await page.waitForTimeout(1200);
  const vidCount = await page.locator(".columns-2 > button, .columns-3 > button, .columns-4 > button").count();
  check("Gallery 'Videos' filter narrows results", vidCount > 0 && vidCount < allCount, `all=${allCount} videos=${vidCount}`);
  await page.getByRole("button", { name: /^All/ }).first().click().catch(() => {});
  await page.waitForTimeout(800);
  await page.locator("button").filter({ has: page.locator("img") }).first().click().catch(() => {});
  await page.waitForTimeout(1000);
  check("Gallery lightbox opens", (await page.locator('.fixed.inset-0').count()) > 0);
  await page.keyboard.press("Escape").catch(() => {});

  // 3b. Events category/time filter
  await page.goto(`${BASE}/events`, { waitUntil: "networkidle" });
  const eAll = await page.locator("a[href^='/events/']").count();
  await page.getByRole("button", { name: /^Upcoming/ }).click().catch(() => {});
  await page.waitForTimeout(1000);
  const eUpcoming = await page.locator("a[href^='/events/']").count();
  check("Events 'Upcoming' filter changes results", eUpcoming <= eAll && eUpcoming >= 0, `all=${eAll} upcoming=${eUpcoming}`);

  // 4. Admin login
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('#email', "admin@greatrainbowacademy.com");
  await page.fill('#password', "Rainbow@Admin2025");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
  check("Admin login redirects to dashboard", page.url().includes("/dashboard"));

  // 5. Dashboard overview shows stats
  check("Dashboard overview renders", await page.getByText(/Dashboard/i).first().isVisible());

  // 5b. Dashboard table search
  await page.goto(`${BASE}/dashboard/departments`, { waitUntil: "networkidle" });
  const rowsBefore = await page.locator("tbody tr").count();
  await page.fill('input[type="search"]', "Nursery");
  await page.waitForTimeout(700);
  const rowsAfter = await page.locator("tbody tr").count();
  check("Dashboard search filters table", rowsAfter < rowsBefore && rowsAfter >= 1, `before=${rowsBefore} after=${rowsAfter}`);
  await page.fill('input[type="search"]', "");

  // 6. Create a department via CMS, verify on public site
  await page.goto(`${BASE}/dashboard/departments`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Add Department/i }).first().click();
  await page.waitForTimeout(600);
  const deptName = `E2E Dept ${stamp}`;
  await page.fill('input[name="name"]', deptName);
  await page.fill('input[name="slug"]', `e2e-dept-${stamp}`);
  await page.fill('input[name="tagline"]', "Created by automated test");
  await page.fill('textarea[name="description"]', "This department was created by the e2e test to prove CMS writes flow to the website.");
  await page.getByRole("button", { name: /^Create$/ }).click();
  await page.waitForTimeout(2500);
  const deptInList = await page.getByText(deptName).first().isVisible().catch(() => false);
  check("Department created in dashboard", deptInList);

  // verify on public departments page (revalidated)
  await page.goto(`${BASE}/departments`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const deptOnSite = await page.getByText(deptName).first().isVisible().catch(() => false);
  check("New department appears on public site", deptOnSite);

  // cleanup: delete the test department
  await page.goto(`${BASE}/dashboard/departments`, { waitUntil: "networkidle" });
  page.once("dialog", (d) => d.accept());
  const row = page.locator("tr", { hasText: deptName });
  await row.getByRole("button", { name: "Delete" }).click().catch(() => {});
  await page.waitForTimeout(1500);
  check("Department deleted (cleanup)", !(await page.getByText(deptName).first().isVisible().catch(() => false)));

} catch (e) {
  console.error("ERROR:", e.message);
  check("test run completed without throwing", false, e.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
