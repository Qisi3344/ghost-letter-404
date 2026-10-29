import type { State } from "../core/state";
import { letter } from "../content/letters";
export async function renderCard(state: State): Promise<Blob> {
  await document.fonts.ready;
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1440;
  const g = c.getContext("2d");
  if (!g) throw new Error("此浏览器无法创建画布");
  const bg = g.createLinearGradient(0, 0, 1080, 1440);
  bg.addColorStop(0, "#21172f");
  bg.addColorStop(1, "#100d1d");
  g.fillStyle = bg;
  g.fillRect(0, 0, 1080, 1440);
  g.strokeStyle = "#a98557";
  g.lineWidth = 2;
  g.strokeRect(45, 45, 990, 1350);
  g.strokeStyle = "#57405d";
  g.strokeRect(59, 59, 962, 1322);
  g.textAlign = "center";
  g.fillStyle = "#d0af7a";
  g.font = "20px Georgia, serif";
  g.fillText("A LETTER FROM THE GHOST IN THE MACHINE", 540, 120);
  g.fillStyle = "#f2e5ce";
  g.font = '52px "Microsoft YaHei", sans-serif';
  g.fillText("404号宇宙 · 幽灵来信", 540, 203);
  g.fillStyle = "#ab91bd";
  g.font = "22px Georgia, serif";
  g.fillText("HALLOWEEN 2026   /   SPECIAL DELIVERY", 540, 251);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(212,185,229,${0.15 + (i % 4) * 0.1})`;
    g.beginPath();
    g.arc(
      95 + ((i * 173) % 890),
      280 + ((i * 97) % 1000),
      i % 4 === 0 ? 2 : 1,
      0,
      Math.PI * 2,
    );
    g.fill();
  }
  g.fillStyle = "#eee1ca";
  g.fillRect(120, 335, 840, 775);
  g.strokeStyle = "#c2a67f";
  g.strokeRect(137, 352, 806, 741);
  g.fillStyle = "#342b38";
  g.textAlign = "left";
  g.font = '29px "Microsoft YaHei", "PingFang SC", sans-serif';
  let y = 410;
  for (const para of letter(state).split("\n")) {
    if (!para) {
      y += 23;
      continue;
    }
    let line = "";
    for (const ch of Array.from(para)) {
      if (g.measureText(line + ch).width > 700) {
        g.fillText(line, 180, y);
        y += 46;
        line = ch;
      } else line += ch;
    }
    g.fillText(line, 180, y);
    y += 46;
  }
  // Original Canvas silhouettes: eight legs and the round knot-marked ghost.
  g.save();
  g.translate(383, 1202);
  g.fillStyle = "#d58b60";
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 4; i++)
      g.fillRect(-38 + i * 21 + row * 5, 18 - row * 9, 13, 24);
  g.fillStyle = "#e8ddec";
  g.beginPath();
  g.roundRect(-48, -35, 96, 64, 12);
  g.fill();
  g.fillStyle = "#25324b";
  g.fillRect(-25, -15, 7, 18);
  g.fillRect(16, -15, 7, 18);
  g.fillStyle = "#5b3b70";
  g.beginPath();
  g.moveTo(-48, -34);
  g.lineTo(4, -92);
  g.lineTo(36, -31);
  g.closePath();
  g.fill();
  g.restore();
  g.save();
  g.translate(697, 1197);
  g.fillStyle = "#e8ddec";
  g.beginPath();
  g.arc(0, -8, 43, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.moveTo(-25, 15);
  g.quadraticCurveTo(-38, 59, 0, 52);
  g.quadraticCurveTo(38, 68, 28, 15);
  g.fill();
  g.strokeStyle = "#34283f";
  g.lineWidth = 4;
  for (let i = 0; i < 6; i++) {
    g.save();
    g.translate(0, -10);
    g.rotate((i * Math.PI) / 3);
    g.beginPath();
    g.moveTo(0, -7);
    g.lineTo(12, -15);
    g.quadraticCurveTo(25, -17, 24, -4);
    g.lineTo(24, 4);
    g.lineTo(10, 12);
    g.lineTo(3, 7);
    g.lineTo(3, -3);
    g.stroke();
    g.restore();
  }
  g.restore();
  g.strokeStyle = "#b494cd";
  g.beginPath();
  g.moveTo(450, 1207);
  g.quadraticCurveTo(540, 1160, 630, 1207);
  g.stroke();
  g.textAlign = "center";
  g.fillStyle = "#bf9fd5";
  g.font = '20px "Microsoft YaHei", sans-serif';
  g.fillText("至少在这个宇宙里，没有距离这回事。", 540, 1312);
  g.fillStyle = "#8e7d96";
  g.font = '16px "Microsoft YaHei", sans-serif';
  g.fillText("非官方同人互动作品 · 非 OpenAI / Anthropic 官方出品", 540, 1353);
  return new Promise((resolve, reject) =>
    c.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("PNG 生成失败"))),
      "image/png",
    ),
  );
}
