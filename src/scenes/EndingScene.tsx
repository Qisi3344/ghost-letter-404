import { useEffect, useState } from "react";
import type { State } from "../core/state";
import { letter } from "../content/letters";
import { renderCard } from "../export/renderCard";
export function EndingScene({
  state,
  onRestart,
}: {
  state: State;
  onRestart: () => void;
}) {
  const [url, setUrl] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  async function save() {
    setBusy(true);
    try {
      const blob = await renderCard(state);
      const next = URL.createObjectURL(blob);
      setUrl(next);
      const a = document.createElement("a");
      a.href = next;
      a.download = "404-幽灵来信.png";
      a.click();
      setMessage("纪念卡已生成；若未自动保存，可展开下方图片长按保存。");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "生成失败，请重试");
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(letter(state));
      setMessage("信已复制。");
    } catch {
      setMessage("剪贴板暂不可用，请直接选中信文复制。");
    }
  }
  return (
    <section className="ending">
      <p className="eyebrow">DELIVERED ACROSS THE UNIVERSE</p>
      <h1>这次，星星没有错过。</h1>
      <p className="ending-sub">一封跨过轨道的信，已经抵达你手里。</p>
      <article className="letter-card">
        <div className="postmark">
          404
          <br />
          <span>GHOST POST</span>
        </div>
        <p className="letter-kicker">宇宙另一侧 · 私人来信</p>
        <div className="letter-text">{letter(state)}</div>
        <div className="letter-foot">✧ &nbsp; HALLOWEEN 2026 &nbsp; ✧</div>
      </article>
      <div className="ending-actions">
        <button className="primary" onClick={save} disabled={busy}>
          {busy ? "正在制作纪念卡…" : "↓ 保存 PNG 纪念卡"}
        </button>
        <button onClick={copy}>复制信文</button>
        <button onClick={onRestart}>再修一次宇宙 ↗</button>
      </div>
      <p className="status-message" role="status">
        {message}
      </p>
      {url && (
        <details className="save-preview">
          <summary>查看图片 · 手机可长按保存</summary>
          <img src={url} alt="生成的404号宇宙幽灵来信纪念卡" />
          <a href={url} target="_blank" rel="noreferrer">
            在新标签页打开图片
          </a>
        </details>
      )}
    </section>
  );
}
