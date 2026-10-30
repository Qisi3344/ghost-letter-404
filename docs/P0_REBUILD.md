# P0 空间原型工作记录（未验收）

基线：GitHub main `a0c23ee3208a0228df7acbbd7fbd1ec40318f24f`，2026-10-30。Git HTTPS 克隆失败后下载 main 源码归档；本地初始提交是归档快照，不能作为上游历史推送。

## 已实现

- 独立预览 `/ghost-letter-404/p0/`，原 React 交互入口及 reducer 未修改。
- `public/p0/camera.mjs`：Anatomy `fitProjection / iso / depthOf`，45° 方位、30° 仰角，统一世界坐标。
- `public/p0/stage.mjs`：`cylinder / slabOf / extrude / knurl / segment` 实际调用；四足分层底盘、检修盖与螺钉、双柱支架、轴承连接桥、完整厚环、球形核心。
- 环半径 127、内径半径 117、厚度 9，96 个空间扇区分别排序，实现球体前后遮挡。
- `public/p0/vendor/iso-kit.mjs` 原样复制已安装 Anatomy 的对应模块，附原 MIT LICENSE。阅读了 craft、kit、verify 和 test-rig、raptor-engine、turning-dial 示例的相关实现。

## 实测

- `npm ci` 成功，`npm test` 6/6，`npm run build` 成功。
- `node scripts/check-p0.mjs`：投影高度方向、深度方向、环宽与厚度、SVG 有限值检查通过。
- Edge 实际浏览器截图：1440×900 主图、4× 支架特写、390×844 减少动画视口；截图工具报告无控制台异常、无横向溢出。
- 本地 `docs/visual/` 保存 baseline.png、p0-isometric-stage.png、p0-4x-closeup.png、p0-phone.png。基线截图为同宽视口的完整页面，P0 为 SVG 裁切，尚不是严格同构图 A/B。

## 未完成，不能宣称通过验收

- 现阶段仍是空间结构草模：玻璃是投影球轮廓内的材质近似，厚度与透光表现不足；金属曲面分档、环分段接缝仍可见。
- 当前排序为底座物理层级和上层部件中心深度；未接入 Anatomy recorder/settle 的完整几何遮挡审计，不构成零穿模证明。
- P0 为静态原型，没有轨道转动验证；本次未重跑原入口完整触屏、键盘、信件导出工作流。
- 没有实现 P1–P3；按返工说明，P0 通过视觉验收前不得推进剧情、内室或粒子。
- 不合并 main。此分支只能作为继续细化的草稿，不能当作已达到参考图质量的成品。

启动：`npm run dev`，访问终端显示地址下的 `p0/`。独立检查也可 `python -m http.server 4173 --directory public` 后访问 `http://127.0.0.1:4173/p0/`。
