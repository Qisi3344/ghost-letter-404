import { pathToFileURL } from "node:url";
import { homedir } from "node:os";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const { chromium } = await import(
  pathToFileURL(
    process.env.PLAYWRIGHT_PATH ||
      homedir() +
        "/.codex/skills/develop-web-game/node_modules/playwright/index.mjs",
  )
);
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const page = await browser.newPage({
    viewport: { width: 1440, height: 1120 },
    deviceScaleFactor: 1,
  }),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const url = process.env.STAGE_URL || "http://127.0.0.1:4173/stage-a/index.html",
  out = "docs/visual/stage-a";
mkdirSync(out, { recursive: true });
try {
  const images = [];
  for (let pose = 0; pose < 3; pose++) {
    await page.goto(`${url}?pose=${pose}`);
    await page.waitForFunction(() => window.scene?.stats.frames > 0);
    assert.equal(await page.locator("#error").textContent(), "");
    const png = await page.locator("canvas").screenshot({
      path: `${out}/${pose === 0 ? "main-stage-1x" : `pose-${pose}`}.png`,
    });
    images.push(png);
  }
  assert(
    !images[0].equals(images[1]) && !images[1].equals(images[2]),
    "poses must change the actual rendered image",
  );
  await page.goto(`${url}?depth=1`);
  await page.waitForFunction(() => window.scene?.stats.frames > 0);
  await page
    .locator("canvas")
    .screenshot({ path: `${out}/main-stage-depth-check.png` });
  await page.goto(`${url}?motion=1`);
  await page.waitForFunction(() => window.scene?.stats.frames > 2);
  const before = await page.evaluate(() => scene.stats.frames);
  await page.waitForTimeout(2000);
  const stats = await page.evaluate(() => ({ ...scene.stats }));
  assert(stats.frames > before + 10, "motion did not advance");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const paused = await page.evaluate(() => scene.stats.frames);
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(() => scene.stats.frames),
    paused,
    "reduced motion must stop rendering",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await page.waitForFunction(() => window.scene?.stats.frames > 0);
  const fixedFrames = await page.evaluate(() => scene.stats.frames);
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => scene.stats.frames), fixedFrames);
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({ path: `${out}/main-stage-mobile.png` });
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").textContent(), "静态 A");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForURL("**?pose=1");
  await page.waitForFunction(() => window.scene?.stats.frames > 0);
  assert.equal(
    await page.locator('[aria-current="page"]').textContent(),
    "姿态 B",
  );
  const responsiveWidths = [390, 600, 601, 768];
  for (const width of responsiveWidths) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(100);
    const ratios = await page.locator("canvas").evaluate((canvas) => {
      const gl = canvas.getContext("webgl2"),
        program = gl.getParameter(gl.CURRENT_PROGRAM);
      const frame = gl.getUniform(
        program,
        gl.getUniformLocation(program, "frameSize"),
      );
      return [frame[0] / frame[1], canvas.clientWidth / canvas.clientHeight];
    });
    assert(
      Math.abs(ratios[0] - ratios[1]) < 0.001,
      `${width}px: distorted projection`,
    );
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  assert.deepEqual(errors, []);
  const report = {
    parts: stats.parts,
    triangles: stats.triangles,
    framesIn2Seconds: stats.frames - before,
    submitMs: stats.submitMs,
    threePoses: true,
    depthCapture: true,
    reducedMotion: true,
    mobileWidth: 390,
    horizontalOverflow: false,
    keyboardNavigation: true,
    responsiveWidths,
    errors,
  };
  writeFileSync(`${out}/browser.json`, JSON.stringify(report, null, 2));
  console.log(report);
} finally {
  await browser.close();
}
