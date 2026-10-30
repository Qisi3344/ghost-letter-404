# 方案 C：中央量子悬浮

本次用户选择方案 C，优先于 V2 任务书的可见机械支撑要求。

- 移除左右立柱、外露轴承、连接轴、中央承托件；正常和深度调试视图均不生成这些模型。
- 保留三条完整厚金属环，环截面包含内外壁和真实倒角。三环共用星核中心和 45°/30° 相机。
- world() 保留 X/Y/X 旋转轴和父子坐标链；每帧重新投影、着色及世界深度排序。
- 默认交错旋转；静止观察、三种固定姿态和深度诊断通过页脚链接切换。系统减少动态时静止，离屏和后台不重建几何。
- 纯 SVG，重建频率上限约 12.5 Hz；未验证手机帧率。后续若不够流畅应迁移网格渲染，不能称为 60 fps。

验证：原测试 6/6、生产构建、check-p0 和 check-rings 检查。check-rings 以精确径向包络证明三环与星核的净空对任何刚体姿态成立，且检查三个固定姿态的台面净空。环半径 155/126/98，星核半径 64。没有可见实体 joint 模型，不需要审计支撑接触。

边界：仍未接入 Anatomy recorder/settle；逐面中心深度排序尚不能当作所有角度零冲突证明。玻璃是透射/反射分层近似，无真实折射；P0 美术仍需验收。未修改原游戏状态机或 main。

截图：docs/visual/p0-isometric-stage.png、p0-4x-closeup.png、p0-depth.png、p0-phone.png，以及 p0-triple-rings-poses/ 三姿态均为本轮浏览器截图。p0-before-same-camera.png 为上轮单环样件按当前相机重新截图。

运行 npm run dev 后访问 /ghost-letter-404/p0/index.html，必须带 index.html。独立预览可 python -m http.server 4173 --directory public 后访问 /p0/index.html。
