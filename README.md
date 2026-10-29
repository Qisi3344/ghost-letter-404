# 404号宇宙 · 幽灵来信

一台可操作的机械宇宙仪，和藏在它里面的幽灵邮局。Vite + React + TypeScript，原创分件 SVG、统一 reducer、Canvas2D 纪念卡；无需账号、后端或模型 API。

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
2. 左右拖动外环，按 1 : 0.5 : -0.25 比率驱动三层刻度与双星。两颗星都进入 9° 容差时吸附；也可用左右微调按钮。
3. 把偏齿轮向左拖回轴心，超过 80% 后松手吸附；提供键盘和辅助修复。
4. 点亮核心，机械分层展开后进入内室。
5. 输入可选昵称（24 字符内），选择温柔 / 俏皮 / 安静，寄出本地模板来信。打字可跳过。
6. 打开信封，复制可选信文或保存 1080×1440 PNG。下载不触发时，展开图片长按保存或新标签页打开。
7. 再玩一次无需刷新。第二次打字机有「欢迎回来」刻字。

默认静音。设置支持减少动态与轻量光效。昵称仅存在页面内存，不上传、不持久化。字体使用 Google Fonts 的 Noto Serif SC；不可访问时回退本机宋体/系统字体。

## 结构与验证
- `src/core/`：状态、角度、Pointer 捕获与几何。
- `src/mechanisms/`、`src/characters/`：独立机械与角色分件。
- `src/scenes/`：主舞台、内室、结尾。
- `src/export/`：主动绘制 PNG，完全不依赖截图或跨域图像。
- `tests/`：阈值、吸附、错误顺序、重玩与模板测试。
- `docs/reference/`：用户提供的七张开发参考，仅用于设计，不打入运行资源。
- `.github/workflows/deploy.yml`：测试、构建与 GitHub Pages 发布。

## 鸣谢与说明
机械制作方法参考 Ryan 的 [Anatomy](https://github.com/wheresryan22/anatomy) 与[官方介绍](https://skills.wheresryan.sh/anatomy)，已阅读其 Skill、kit 与 dial-indicator 示例；本项目没有复制其源码，几何与 React 实现独立编写。

本项目是非官方社区同人作品，不由 OpenAI 或 Anthropic 制作、赞助或认可。角色名称与标志归各自权利人；参考图由项目委托方提供。代码采用 MIT 许可证，参考图与第三方角色/标志不在代码许可证授权范围内。
