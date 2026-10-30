# 阶段 A：独立量子悬浮主舞台

状态：待视觉审核；不是已验收成品。此轮只提交阶段 A，不接入旧游戏，不制作阶段 B 的最终整合，不修改 main。

## 本轮实现

整个场景使用同一组世界坐标、等距投影和 WebGL 深度缓冲。底台、角色、三环、星核都由实体网格生成，没有使用整张概念图、贴图角色或旧网页外框。

- 外／中／内环半径 151／120／91，截面宽 12／10／8、厚 9／8／7；完整闭合倒角截面、卷边、刻槽与每环 120 个刻度。旋转采用 X → Y → X 父子变换，共用中心 `[0, 0, 236]`，没有可见支撑模型，深度模式也不生成支架。
- 星核外壳半径 61，内部为六向立体星体、细环和局限在球内的程序化体积光。玻璃采用双面透明绘制、Fresnel 边缘和解析反射。
- 底台为分层外圈、六个下沉线圈舱、检修甲板、中央感应器、虹膜叶片和独立控制盘。铜绕组位于舱内，角色脚下保留实体通道。
- Clawd 为橙色方盒、前后各四条腿、深蓝矩形眼、连续布罩、弯曲帽和小南瓜。GPT 为白色立体幽灵、六向结形管线、披肩和弯帽。二者共享场景照明、阴影和遮挡。
- 材质使用 GGX 直接高光和有限区域灯反射，金属与涂层分别控制粗糙度；布罩下摆、帽檐具有实体包边。
- 独立页面支持三个固定姿态、慢速运动、深度检查和键盘链接导航。静态、离屏、后台及减少动态效果模式停止连续帧循环。移动端采用同一相机方向的竖向裁切，不拉伸模型；触控链接保留 44 px 高度。

## 技术选择与边界

沿用 Anatomy 的 `fitProjection`、`cameraOf`、`iso` 和工艺原则；保留原 MIT kit 及许可证。新增原生 WebGL 2 渲染是为了解决三层旋转环、角色及透明球体之间的逐像素遮挡，避免 SVG 分段排序和大量 DOM 每帧更新。没有新增运行依赖。

代价是需要 WebGL 2，以及维护网格／阴影／材质着色器。当前入口独立；后续通过 `start(canvas)`、`render(angles, debug)`、`dispose()` 挂接 React 生命周期。`parts` 中的命名部件和 `joint` 编号是后续交互挂接依据，当前不接入原游戏状态机。

## 相机与场景清单

- 正交等距，方位角 45°，仰角 30°，Z 向上；桌面逻辑画幅 1200 × 900。
- 使用 `fitProjection([[-220,-220,0],[220,220,0],[-220,220,0],[220,-220,0],[0,0,400]], 1200, 900, {pad:55, azimuth:45, elevation:30})`，具体投影值可从 `scene.mjs` 的 `camera` 导出读取。
- 手机逻辑画幅 720 × 900，仅水平裁切空白，视角和几何关系不变。
- 光源方向归一化 `[-0.5, 0.3, 0.82]`；2048² 阴影贴图；普通显示 DPR 上限 2，`?capture=1` 使用 DPR 4 重渲染。
- 825 个命名部件、393436 个三角形。完整清单见 [components.json](visual/stage-a/components.json)。部件分组：`altar/foot/deck`、`driver/operator`、`emitter/induction`、`orbit`、`star`、`dock/service`、`Clawd`、`GPT`。

## 真实浏览器截图

以下均来自运行中的 Edge 浏览器，没有生成式效果图或后期合成。

| 文件 | 内容 |
| --- | --- |
| [main-stage-1x.png](visual/stage-a/main-stage-1x.png) | 1440 × 1080，完整主舞台 |
| [main-stage-detail-4x.png](visual/stage-a/main-stage-detail-4x.png) | 710 × 480 CSS px 区域，4× 重渲染，输出 2840 × 1920 |
| [main-stage-depth-check.png](visual/stage-a/main-stage-depth-check.png) | 连续深度着色；暖色近、紫色中、蓝色远，隐藏地面干扰 |
| [pose-1.png](visual/stage-a/pose-1.png) / [pose-2.png](visual/stage-a/pose-2.png) | 两组额外固定姿态 |
| [main-stage-mobile.png](visual/stage-a/main-stage-mobile.png) | 390 × 844 视口 |

本轮灯光迭代前的同视角截图保留于 [before-lighting.png](visual/stage-a/before-lighting.png)，可与当前 1× 画面对照。

相较被打回的主舞台，此轮没有拼接旧版齿轮区、SVG 角色或网页边框；对比应以此轮整张画面及局部特写为准。旧 P0／游戏整合稿不是本次视觉验收对象。

## 运行与检查

```sh
npm install
npm run dev
# 浏览器打开 http://127.0.0.1:5173/ghost-letter-404/stage-a/index.html
node scripts/check-stage-a.mjs
npm test
npm run build
```

独立截图也可通过 `python -m http.server 4173 --bind 127.0.0.1 --directory public` 运行。

浏览器检查：`node scripts/browser-stage-a.mjs`。沿用仓库原有 Playwright 路径约定；可通过 `PLAYWRIGHT_PATH` 指定其 `index.mjs`，通过 `CHROME_PATH` 指定 Chromium/Edge 可执行文件，通过 `STAGE_URL` 指定页面地址。脚本生成本页截图和 [browser.json](visual/stage-a/browser.json)。4× 局部截图使用 Anatomy `capture.mjs`，URL 增加 `?capture=1`，参数为 `--width 1440 --height 1120 --select canvas --zoom 370,200,710,480 --zoom-scale 4`。

几何检查验证有限坐标、单位法线、三角形绕序、部件命名、八条腿、正交旋转及径向间隙。相邻星轨间隙约 20，内环至玻璃约 26；角色三角形包围球的保守下界距离星核中心超过 163，外环最远约 157，因此环的完整旋转扫掠不会碰到角色。该检查不等于全场景任意零件的碰撞检测。

本轮实际通过：上述几何检查；三姿态真实渲染；减少动态效果后停止动画；390／600／601／768 px 比例正确且无横向溢出；键盘导航；浏览器无报错；原有 6 项测试；生产构建及带 /ghost-letter-404/ 前缀的产物预览。桌面浏览器两秒观察到约 120 次动画提交，不代表真实手机 GPU 性能达标。

## 仍需审核的缺陷与限制

- 整体为程序化风格化建模，尚不能宣称达到参考图的雕塑和电影级材质质量；请重点审核角色布料、金属反射和场景温度。
- 玻璃反射与内部雾采用解析近似，没有真实折射、焦散或完整的半透明体积遮挡；阴影使用 PCF，4× 下仍可见采样局限。
- 已验证桌面 Edge 和手机尺寸模拟，尚无真实手机、Safari 或 WebGL 不可用设备的兼容性验收。WebGL 不可用时页面给出提示。
- 当前只有场景样张和旋转预览。原游戏流程、进内室的折叠转场、角色操作动画及阶段 B／C 均未接入。

阶段 A 的视觉审核通过后，再推进阶段 B；自动检查通过不代替美术验收。
