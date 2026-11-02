# 404号宇宙 · 幽灵来信

一台可操作的机械宇宙仪，和藏在它里面的幽灵邮局。Vite + React + TypeScript，WebGL 2 实体主舞台、统一 reducer、原内室流程与 Canvas2D 纪念卡；无需账号、后端或模型 API。

**在线体验：https://qisi3344.github.io/ghost-letter-404/**

当前开发分支的整合验收见 [INTEGRATION_REVIEW.md](docs/INTEGRATION_REVIEW.md)，独立静态舞台记录见 [STAGE_A_REVIEW.md](docs/STAGE_A_REVIEW.md)。上方在线地址仍由 main 的 Pages 流程发布，开发分支未自动部署。

## 本地运行

Node.js 24（CI 使用），npm 11。

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

开发地址由 Vite 输出，默认 `http://127.0.0.1:5173/ghost-letter-404/`。生产子路径固定为 `/ghost-letter-404/`。

## 玩法

1. 向右上拖动发条，累计 1.25 圈。也可 Tab 聚焦发条，用左右键操作，或点「转动发条」。
2. 左右拖动同一控制盘，按 1 : 0.5 : -0.25 比率驱动三层实体星轨。中/内环进入目标角度 9° 容差后吸附；也可用左右微调按钮。
3. 把前方百叶检修盖向左推回，超过 80% 后松手锁定；提供键盘和辅助修复。
4. 点亮实体星核，星轨与玻璃一起折叠后进入内室。
5. 输入可选昵称（24 字符内），选择温柔 / 俏皮 / 安静，寄出本地模板来信。打字可跳过。
6. 打开信封，复制可选信文或保存 1080×1440 PNG。下载不触发时，展开图片长按保存或新标签页打开。
7. 再玩一次无需刷新。第二次打字机有「欢迎回来」刻字。

默认静音。设置支持减少动态与轻量光效。昵称仅存在页面内存，不上传、不持久化。字体使用 Google Fonts 的 Noto Serif SC；不可访问时回退本机宋体/系统字体。

WebGL 不可用时不回接旧主舞台；文字控制仍可走完来信流程，也可重试三维舞台。内室保留原 SVG 场景，未包含新建独立内室模型。

## 结构与验证

- `src/core/`：唯一游戏状态机、角度与几何。
- `src/stage/`：React 舞台、状态到模型参数映射、渲染生命周期与实体投影交互。
- `public/stage-a/`：独立样张与 React 共用的 WebGL 引擎、网格、材质及原版角色。
- `src/mechanisms/`、`src/characters/`：保留内室使用的打字机与角色。
- `src/scenes/`：内室、结尾；旧主舞台 SVG 模块已删除。
- `src/export/`：主动绘制 PNG，完全不依赖截图或跨域图像。
- `tests/`：状态阈值、全流程、模板安全及模型参数联动测试。
- `scripts/browser-integrated-stage.mjs`：桌面、手机尺寸、动画、兼容性、纪念卡及重玩验证；通过 `npm run test:browser` 运行，环境变量说明见整合报告。
- `docs/reference/`：用户提供的七张开发参考，仅用于设计，不打入运行资源。
- `.github/workflows/deploy.yml`：测试、构建与 GitHub Pages 发布。

## 鸣谢与说明

机械制作方法参考 Ryan 的 [Anatomy](https://github.com/wheresryan22/anatomy)；主舞台使用其 MIT kit 的投影工具，许可证保留于 `public/p0/vendor/LICENSE`。角色源模型和授权见 [MOONTIDE_MODELS.md](docs/MOONTIDE_MODELS.md)。没有引入新的运行依赖。

本项目是非官方社区同人作品，不由 OpenAI 或 Anthropic 制作、赞助或认可。角色名称与标志归各自权利人；参考图由项目委托方提供。代码采用 MIT 许可证，参考图与第三方角色/标志不在代码许可证授权范围内。
