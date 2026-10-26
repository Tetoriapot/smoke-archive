import { useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { criteria } from "../constants";
import { items } from "../data";
import type { Criterion, MatchMode } from "../types";
import { rankItems } from "../lib/catalog";
import { Empty, ItemCard, PageHeading } from "../components/Common";
import type { ItemActions } from "../components/Common";
export function Match({ actions }: { actions: ItemActions }) {
  const [selected, setSelected] = useState<Partial<Record<Criterion, string>>>(
    {},
  );
  const [mode, setMode] = useState<MatchMode>("classic");
  const results = rankItems(items, selected, mode);
  const count = Object.values(selected).filter(Boolean).length;
  return (
    <>
      <PageHeading
        eyebrow="CHARACTER FINDER"
        title="キャラクター逆引き"
        description="成人キャラクターの条件から、設定に使う資料を探します。候補は創作用のルールで選びます。"
      />
      <div className="match-layout">
        <section className="panel match-form">
          <h2>人物の条件</h2>
          <p className="small muted">指定しない条件は空欄のまま使えます。</p>
          {criteria.map((c) => (
            <label key={c.id}>
              {c.label}
              <select
                value={selected[c.id] || ""}
                onChange={(e) =>
                  setSelected({ ...selected, [c.id]: e.target.value })
                }
              >
                <option value="">指定しない</option>
                {c.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          ))}
          <button className="text-button" onClick={() => setSelected({})}>
            条件をリセット
          </button>
        </section>
        <section className="match-results">
          <div className="mode-tabs" aria-label="提案の方針">
            {(["classic", "gap", "unexpected"] as MatchMode[]).map((m, i) => (
              <button
                key={m}
                className={mode === m ? "active" : ""}
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
              >
                {["王道", "ギャップ", "意外性重視"][i]}
              </button>
            ))}
          </div>
          <p className="mode-description">
            {mode === "classic"
              ? "人物の条件と一致する創作タグを優先します。"
              : mode === "gap"
                ? "一致する条件に加えて、対比を作れる条件を優先します。"
                : "意図的な対比として登録された組み合わせを優先します。"}
          </p>
          <p className="small muted">
            性格や職業と実際の喫煙者との関係を示すものではありません。価格・流通・健康面の評価には使えません。
          </p>
          <div className="section-title">
            <h2>候補の資料</h2>
            <span aria-live="polite">{results.length}件</span>
          </div>
          {!results.length ? (
            <Empty
              title={
                count
                  ? "この条件の候補はありません"
                  : "人物の条件を選んでください"
              }
            >
              <p>
                {count
                  ? "条件や提案の方針を変えると、別の組み合わせを調べられます。"
                  : "1つ以上の条件を選ぶと、候補と理由を表示します。"}
              </p>
            </Empty>
          ) : (
            <div className="match-card-grid">
              {results.map(({ item, reasons, historicalCaution }) => (
                <div className="match-result" key={item.id}>
                  <ItemCard
                    item={item}
                    actions={actions}
                    index={items.indexOf(item)}
                  />
                  <div className="match-reasons">
                    <p className="eyebrow">
                      <Sparkles size={13} />
                      選定理由・創作上の解釈
                    </p>
                    <ul>
                      {reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                    <p>
                      {mode === "classic"
                        ? item.creative.rationale
                        : item.creative.counterpoint}
                    </p>
                    <p className="small muted">{historicalCaution}</p>
                    <a className="text-link" href={`#/item/${item.id}`}>
                      根拠と詳細 <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
