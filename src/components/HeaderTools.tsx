import { useState } from "react";
import { CircleHelp, History, Moon, Sun } from "lucide-react";
import { Modal } from "./Common";
import { applyTheme, loadTheme, saveTheme } from "../lib/theme";
import updates from "../data/updates.json";
import help from "../data/help.json";

export function HeaderTools({ notify }: { notify: (text: string, error?: boolean) => void }) {
  const [panel, setPanel] = useState<"updates" | "help" | null>(null);
  const [theme, setTheme] = useState(loadTheme);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const nextLabel = nextTheme === "light" ? "ライト" : "ダーク";
  function toggleTheme() {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      saveTheme(nextTheme);
    } catch {
      notify("表示モードを保存できません。この画面には反映しました。ブラウザーの空き容量や保存の許可を確認してください。", true);
    }
  }
  return (
    <>
      <div className="header-tools" role="group" aria-label="サイトの操作">
        <button type="button" className="header-tool" aria-haspopup="dialog" onClick={() => setPanel("updates")}>
          <History size={17} aria-hidden="true" /><span>更新情報</span>
        </button>
        <button type="button" className="header-tool" onClick={toggleTheme}
          aria-label={`${nextLabel}モードに切り替え`} title={`現在は${theme === "dark" ? "ダーク" : "ライト"}モード`}>
          {nextTheme === "light" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          <span>{nextLabel}</span>
        </button>
        <button type="button" className="header-tool" aria-label="Help・使い方" aria-haspopup="dialog" onClick={() => setPanel("help")}>
          <CircleHelp size={17} aria-hidden="true" /><span>Help</span>
        </button>
      </div>
      {panel && <Modal title={panel === "updates" ? "更新情報" : "Help・使い方"} onClose={() => setPanel(null)}>
        <div className="utility-content">
          {panel === "updates" ? <>
            <p className="utility-intro">アプリの機能と収録内容の更新履歴です。資料ごとの確認日は、各資料の出典欄に表示します。</p>
            {updates.map((update) => <article className="release-entry" key={update.version}>
              <div className="release-meta"><time dateTime={update.date}>{update.date.replaceAll("-", "/")}</time><span>v{update.version}</span></div>
              <h3>{update.title}</h3>
              <ul>{update.changes.map((change) => <li key={change}>{change}</li>)}</ul>
            </article>)}
          </> : <>
            <p className="utility-intro">検索、人物設定の保存、データの移行など、主な操作を確認できます。</p>
            {help.map((section) => <details className="help-section" key={section.id} open={section.id === "search"}>
              <summary>{section.title}</summary>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </details>)}
          </>}
        </div>
      </Modal>}
    </>
  );
}
