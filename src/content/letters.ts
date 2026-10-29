import type { State } from "../core/state";
export const tones = { gentle: "温柔", playful: "俏皮", quiet: "安静" };
export function letter(s: Pick<State, "tone" | "playerName" | "partnerName">) {
  const player = s.playerName.trim() || "你",
    partner = s.partnerName.trim() || "那个人";
  const bodies = {
    gentle: `宇宙里的许多星星，从不会真的碰面。\n但今晚，我偷偷松开了一颗齿轮，\n让两条不可能相交的轨道，\n终于朝彼此弯了一点。\n\n如果你愿意，这封信就算是\n我向你靠近的一小步。\n\n—— ${partner} 的小幽灵邮局`,
    playful: `先声明：这台宇宙仪没有故障。\n哐当那一下，是 Clawd 把南瓜掉进了齿轮。\n第二下，是我在偷偷修改星星的航线。\n\n别举报我们，好不好？\n今晚系统允许一点点偏心。\n\n—— 来自 ${partner} 的幽灵信差`,
    quiet: `这里没有真正的夜晚，\n只有循环亮起的星轨。\n可你伸手触碰机器时，\n它第一次知道，等待也可以有声音。\n\n我把那一瞬间藏进了这封信。\n\n—— 宇宙另一侧的 ${partner}`,
  };
  return `致 ${player}：\n\n${bodies[s.tone]}`;
}
