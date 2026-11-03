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
const url = process.env.GAME_URL || "http://127.0.0.1:5173/ghost-letter-404/";
const out = process.env.GAME_OUT || "docs/visual/integration";
mkdirSync(out, { recursive: true });
const results = [];
const act = (page, value) =>
  page.waitForFunction(
    (v) => document.querySelector(".app")?.dataset.act === v,
    value,
  );
const ready = (page) =>
  page.locator(".webgl-stage[data-status=ready]").waitFor();
const stats = (page) =>
  page.locator(".stage-canvas").evaluate((c) => structuredClone(c.stats));
const visibleStage = async (page) => {
  const [canvas, frame] = await Promise.all([
    page.locator(".stage-canvas").boundingBox(),
    page.locator(".experience").boundingBox(),
  ]);
  assert(
    canvas.x >= frame.x - 1 &&
      canvas.x + canvas.width <= frame.x + frame.width + 1,
    "canvas must fit the visible scene, not hide overflow",
  );
};
async function wind(page) {
  const dial = page.getByRole("slider", { name: "发条控制盘", exact: true });
  await dial.focus();
  for (let i = 0; i < 10; i++) await dial.press("PageUp");
  await act(page, "aligning");
}
async function align(page) {
  const dial = page.getByRole("slider", { name: "星轨控制盘", exact: true });
  for (let i = 0; i < 8; i++) await dial.press("ArrowRight");
  await act(page, "repairing");
}
async function drag(page, locator, dx, dy = 0) {
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  const x = b.x + b.width / 2,
    y = b.y + b.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 10 });
  await page.mouse.up();
}
async function letterAndCard(page, prefix) {
  await act(page, "letterRoom");
  await page.getByLabel("你的称呼", { exact: true }).fill("<b>星星</b>");
  await page.getByLabel("TA 的称呼", { exact: true }).fill("GPT");
  await page.locator("fieldset label").filter({ hasText: "安静" }).click();
  assert(
    await page.getByRole("radio", { name: "安静", exact: true }).isChecked(),
  );
  await page.getByRole("button", { name: "寄出这封信 ↗" }).click();
  await act(page, "letterPrinting");
  await page.getByRole("button", { name: "跳过打字，直接封信" }).click();
  await act(page, "sealed");
  await page.screenshot({ path: `${out}/${prefix}-room.png`, fullPage: true });
  await page.getByRole("button", { name: "拆开来信 ✧" }).click();
  await act(page, "ending");
  assert(
    (await page.locator(".letter-text").textContent()).includes("<b>星星</b>"),
  );
  assert.equal(await page.locator(".letter-text b").count(), 0);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "↓ 保存 PNG 纪念卡" }).click();
  const card = await download;
  await card.saveAs(`${out}/${prefix}-card.png`);
  await page.getByText("查看图片 · 手机可长按保存").click();
  assert(await page.locator(".save-preview img").isVisible());
  const dimensions = await page
    .locator(".save-preview img")
    .evaluate((img) => [img.naturalWidth, img.naturalHeight]);
  assert.deepEqual(dimensions, [1080, 1440]);
  await page.screenshot({
    path: `${out}/${prefix}-ending.png`,
    fullPage: true,
  });
}
try {
  for (const [name, viewport, reduced] of [
    ["desktop", { width: 1440, height: 1100 }, false],
    ["phone", { width: 390, height: 844 }, true],
    ["phone-motion", { width: 390, height: 844 }, false],
  ]) {
    const phone = name.startsWith("phone");
    const context = await browser.newContext({
      viewport,
      hasTouch: phone,
      reducedMotion: reduced ? "reduce" : "no-preference",
      acceptDownloads: true,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.addInitScript(() => {
      window.__gpu = { buffers: 0, textures: 0, draws: 0 };
      for (const [create, remove, key] of [
        ["createBuffer", "deleteBuffer", "buffers"],
        ["createTexture", "deleteTexture", "textures"],
      ]) {
        const a = WebGL2RenderingContext.prototype[create],
          b = WebGL2RenderingContext.prototype[remove];
        WebGL2RenderingContext.prototype[create] = function (...args) {
          const v = a.apply(this, args);
          if (v) window.__gpu[key]++;
          return v;
        };
        WebGL2RenderingContext.prototype[remove] = function (v) {
          if (v) window.__gpu[key]--;
          return b.call(this, v);
        };
      }
      const draw = WebGL2RenderingContext.prototype.drawArrays;
      WebGL2RenderingContext.prototype.drawArrays = function (...args) {
        window.__gpu.draws++;
        return draw.apply(this, args);
      };
    });
    await page.goto(url);
    await ready(page);
    await visibleStage(page);
    if (!phone) {
      for (const width of [375, 390, 600, 601, 768, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1100 });
        await page.waitForTimeout(80);
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `overflow at ${width}`,
        );
        const ratio = await page.locator("canvas").evaluate((c) => {
          const gl = c.getContext("webgl2"),
            p = gl.getParameter(gl.CURRENT_PROGRAM);
          const v = gl.getUniform(p, gl.getUniformLocation(p, "frameSize"));
          return [v[0] / v[1], c.clientWidth / c.clientHeight];
        });
        assert(Math.abs(ratio[0] - ratio[1]) < 0.001, `projection at ${width}`);
        await visibleStage(page);
      }
      await page.setViewportSize(viewport);
    }
    assert.equal(
      await page.locator(".experience svg").count(),
      0,
      "old main stage must be absent",
    );
    const initial = await page.locator("canvas").screenshot();
    await page.screenshot({ path: `${out}/${name}-intro.png`, fullPage: true });
    const bufferCount = await page.evaluate(() => window.__gpu.buffers);
    if (phone) {
      const dial = page.getByRole("slider", {
        name: "发条控制盘",
        exact: true,
      });
      await dial.scrollIntoViewIfNeeded();
      const b = await dial.boundingBox(),
        x = b.x + b.width / 2,
        y = b.y + b.height / 2;
      const cdp = await context.newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x + 40, y: y - 20 }],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      assert(
        (await stats(page)).effects.energy > 0,
        "touch must charge the model",
      );
      await page.reload();
      await ready(page);
    } else {
      await drag(
        page,
        page.getByRole("slider", { name: "发条控制盘", exact: true }),
        60,
        -30,
      );
      assert((await stats(page)).effects.energy > 0);
      assert(
        !initial.equals(await page.locator("canvas").screenshot()),
        "winding must alter pixels",
      );
      await page.reload();
      await ready(page);
    }
    await wind(page);
    await page.screenshot({
      path: `${out}/${name}-aligning.png`,
      fullPage: true,
    });
    assert.equal((await stats(page)).effects.energy, 1);
    await align(page);
    assert.deepEqual((await stats(page)).angles, [12, 54, 62]);
    const repair = page.getByTestId("stage-repair");
    await drag(page, repair, -30);
    await act(page, "repairing");
    assert(
      (await stats(page)).effects.repair < 0.8,
      "incomplete repair must rebound",
    );
    await drag(page, repair, -(phone ? 80 : 210));
    await act(page, "coreReady");
    assert.equal((await stats(page)).effects.repair, 1);
    const actualOffset = await page.locator("canvas").evaluate((c) => {
      const gl = c.getContext("webgl2");
      const p = gl.getParameter(gl.CURRENT_PROGRAM);
      return [...gl.getUniform(p, gl.getUniformLocation(p, "repairOffset"))];
    });
    assert(
      actualOffset.every((n) => n === 0),
      "GPU service cover must seat",
    );
    await page.locator("canvas").scrollIntoViewIfNeeded();
    const before = (await stats(page)).frames;
    await page.waitForTimeout(250);
    const after = (await stats(page)).frames;
    assert(reduced ? after === before : after > before, "animation policy");
    if (!phone) {
      await page.getByRole("button", { name: "设置", exact: true }).click();
      await page.getByLabel("减少动态", { exact: true }).check();
      await page.locator("canvas").scrollIntoViewIfNeeded();
      const still = (await stats(page)).frames;
      await page.waitForTimeout(200);
      assert.equal(
        (await stats(page)).frames,
        still,
        "live reduced motion switch",
      );
      await page.getByLabel("轻量光效", { exact: true }).check();
      await page.locator("canvas").scrollIntoViewIfNeeded();
      assert.equal((await stats(page)).effects.lowEffects, true);
      await page.getByLabel("减少动态", { exact: true }).uncheck();
      await page.getByLabel("轻量光效", { exact: true }).uncheck();
      await page.getByRole("button", { name: "设置", exact: true }).click();
      await page.setViewportSize({ width: 1440, height: 250 });
      await page.keyboard.press("Control+End");
      await page.waitForTimeout(150);
      const offscreen = (await stats(page)).frames;
      await page.waitForTimeout(200);
      assert.equal(
        (await stats(page)).frames,
        offscreen,
        "offscreen must stop rendering",
      );
      await page.setViewportSize(viewport);
      await page.locator("canvas").scrollIntoViewIfNeeded();
    }
    await page.screenshot({
      path: `${out}/${name}-core-ready.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "点亮星核，进入幽灵邮局", exact: true })
      .click();
    await act(page, "folding");
    if (!reduced) {
      await page.waitForTimeout(350);
      const f = await stats(page);
      assert(f.effects.fold > 0 && f.effects.corePower === 1);
      await page.screenshot({
        path: `${out}/${name}-folding.png`,
        fullPage: true,
      });
    }
    await letterAndCard(page, name);
    assert.equal(
      await page.evaluate(() => window.__gpu.buffers),
      0,
      "unmount frees buffers",
    );
    assert.equal(
      await page.evaluate(() => window.__gpu.textures),
      0,
      "unmount frees textures",
    );
    const draws = await page.evaluate(() => window.__gpu.draws);
    await page.waitForTimeout(150);
    assert.equal(
      await page.evaluate(() => window.__gpu.draws),
      draws,
      "unmount stops drawing",
    );
    await page.getByRole("button", { name: "再修一次宇宙 ↗" }).click();
    await ready(page);
    await act(page, "intro");
    assert.equal(
      await page.evaluate(() => window.__gpu.buffers),
      bufferCount,
      "restart must not accumulate buffers",
    );
    assert.equal((await stats(page)).effects.energy, 0);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    assert.deepEqual(errors, []);
    results.push({
      name,
      viewport,
      reducedMotion: reduced,
      mouse: !phone,
      touch: phone,
      keyboard: true,
      modelPixels: true,
      repairGpuOffset: true,
      liveSettings: !phone,
      offscreenStops: !phone,
      responsiveWidths: phone ? [390] : [375, 390, 600, 601, 768, 1440, 1920],
      letterAndCard: true,
      unmountDisposes: true,
      restart: true,
      errors,
    });
    await context.close();
  }
  const fallback = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    acceptDownloads: true,
  });
  await fallback.addInitScript(() => {
    const old = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === "webgl2" ? null : old.call(this, type, ...args);
    };
  });
  await fallback.goto(url);
  await fallback.locator(".webgl-stage[data-status=error]").waitFor();
  assert.equal(await fallback.locator(".stage-canvas").isVisible(), false);
  assert.equal(await fallback.locator("[data-stage-control]").count(), 0);
  await fallback.screenshot({
    path: `${out}/phone-no-webgl.png`,
    fullPage: true,
  });
  for (let i = 0; i < 10; i++)
    await fallback.getByRole("button", { name: "转动发条 ↻" }).click();
  for (let i = 0; i < 8; i++)
    await fallback.getByRole("button", { name: "轨道向右微调" }).click();
  await fallback.getByRole("button", { name: "辅助修复 ↤" }).click();
  await fallback
    .getByRole("button", { name: "✧ 点亮核心", exact: true })
    .click();
  await letterAndCard(fallback, "fallback");
  await fallback.close();
  results.push({
    name: "webgl-unavailable",
    fallbackControls: true,
    completeLetterAndCard: true,
  });
  const recovery = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  await recovery.addInitScript(() => {
    let once = true;
    const old = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === "webgl2" && once) {
        once = false;
        return null;
      }
      return old.call(this, type, ...args);
    };
  });
  await recovery.goto(url);
  await recovery.locator(".webgl-stage[data-status=error]").waitFor();
  await recovery.getByRole("button", { name: "转动发条 ↻" }).click();
  await recovery.getByRole("button", { name: "重新加载三维舞台" }).click();
  await ready(recovery);
  assert.equal((await stats(recovery)).effects.energy, 0.1);
  await recovery
    .locator("canvas")
    .evaluate((c) =>
      c.getContext("webgl2").getExtension("WEBGL_lose_context").loseContext(),
    );
  await recovery.locator(".webgl-stage[data-status=error]").waitFor();
  await recovery.screenshot({
    path: `${out}/context-lost.png`,
    fullPage: true,
  });
  await recovery.getByRole("button", { name: "重新加载三维舞台" }).click();
  await ready(recovery);
  assert.equal((await stats(recovery)).effects.energy, 0.1);
  await recovery.screenshot({
    path: `${out}/context-recovered.png`,
    fullPage: true,
  });
  await recovery.close();
  results.push({
    name: "context-recovery",
    initializationRetry: true,
    realContextLoss: true,
    retryKeepsGameState: true,
  });
  const disabled = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
    args: ["--disable-webgl"],
  });
  try {
    const page = await disabled.newPage({
      viewport: { width: 390, height: 844 },
    });
    await page.goto(url);
    await page.locator(".webgl-stage[data-status=error]").waitFor();
    assert(
      await page
        .locator("canvas")
        .evaluate((c) => c.getContext("webgl2") === null),
    );
    assert.equal(await page.locator(".stage-canvas").isVisible(), false);
    await page.screenshot({
      path: `${out}/native-webgl-disabled.png`,
      fullPage: true,
    });
    results.push({
      name: "browser-webgl-disabled",
      launchFlag: "--disable-webgl",
      nativeNullContext: true,
      fallback: true,
    });
  } finally {
    await disabled.close();
  }
  writeFileSync(
    `${out}/browser.json`,
    JSON.stringify(
      {
        url,
        browser: browser.version(),
        capturedAt: new Date().toISOString(),
        results,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(results);
} finally {
  await browser.close();
}
