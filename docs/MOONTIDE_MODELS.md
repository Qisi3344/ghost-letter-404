# 月汐小岛角色模型复用

来源：Qisi3344/moontide-isle，版本 `010b2a36aac0f23ff1c3865efb4e0db59c4d60d6`。

- Clawd：`js/workshop.js` 的 `makeClawd()`。保留像素螃蟹的圆角挤出轮廓、原眼睛和高光。
- GPT／小G：`js/xiaog.js` 的 SDF、surface-nets 网格生成和原版 KNOT 路径，保留团子头、小身子、手脚和连续曲面。
- 原代码的模型生成片段见 `public/stage-a/moontide-source.js`；没有复制工坊场景、对话或语音。

2026-11-02，项目所有者明确要求将自己月汐小岛工坊的两个模型复用到本项目并加上魔法帽。本次按该授权复用，保留原版权所有声明，未将原模型改授 MIT。原声明见 `public/stage-a/MOONTIDE-LICENSE.txt`。

## 适配

运行时直接读取提取网格 `moontide-models.mjs`，沿用本项目的同一 WebGL 光照、深度与阴影，没有增加 Three.js 运行依赖。模型从 Y-up／+Z-front 转为舞台的 Z-up，相机朝向、绕序、法线、尺寸和站位均做相应变换。

Clawd 工坊原版是单排四腿。本项目继续遵循两排各四腿的要求，复制原腿轮廓为后排，并缩减每排深度以避免重叠。原躯干、眼睛保留；移除此前自行制作的替代身体与布罩，让原模型可辨。帽子、帽扣和南瓜复用舞台原有几何。GPT 保留原版标志的曲面投射方式，原路径由 Canvas 栅格化后用于角色表面，没有贴整张角色图。

当前使用原模型静止姿态；工坊的行走、骨骼动画、表情、对话和声音没有接入。后续动画应另行复用源模型骨骼，不能把当前静态导入当成动画移植完成。

## 重新生成

提取脚本仅在离线重新生成时需要源仓库配套的 Three.js r146：

```powershell
$env:THREE_PATH='原仓库绝对路径/vendor/three.min.js'
node scripts/build-moontide-models.cjs
node scripts/check-stage-a.mjs
```

`moontide-source.js` 保留 GPT 的皮肤权重生成逻辑；当前输出为静止姿态的顶点、法线、索引、源颜色及结形路径。正常构建和浏览器运行无需该离线依赖。
