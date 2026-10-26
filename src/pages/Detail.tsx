import {
  ArrowLeft,
  Bookmark,
  GitCompareArrows,
  Plus,
  ExternalLink,
} from "lucide-react";
import { items } from "../data";
import {
  categories,
  confidenceLabels,
  criteria,
  factLabels,
  kindLabels,
} from "../constants";
import { Empty, ItemCard, Status } from "../components/Common";
import type { ItemActions } from "../components/Common";
import { Silhouette } from "../components/Artwork";
import { similarItems } from "../lib/catalog";
import type { FactKey, Item } from "../types";
export function Detail({
  id,
  actions,
  onUse,
}: {
  id: string;
  actions: ItemActions;
  onUse: (item: Item) => void;
}) {
  const item = items.find((i) => i.id === id);
  if (!item)
    return (
      <Empty title="資料が見つかりません">
        <a href="#/catalog">図鑑へ戻る</a>
      </Empty>
    );
  const category = categories.find((c) => c.id === item.category)!;
  const related = similarItems(item, items);
  return (
    <>
      <a href="#/catalog" className="back-link">
        <ArrowLeft size={16} />
        図鑑に戻る
      </a>
      <div className="detail-hero">
        <div className="detail-art" style={{ color: item.palette[0] }}>
          <span className="eyebrow">{category.en}</span>
          <Silhouette category={item.category} />
          <small>独自の形態イメージ</small>
        </div>
        <div className="detail-intro">
          <p className="eyebrow">
            {category.number} / {category.label} / {kindLabels[item.kind]}
          </p>
          <h1>{item.name}</h1>
          <p className="detail-original">{item.originalName}</p>
          <div className="tag-row">
            <Status item={item} />
            <span className="tag">{item.subcategory}</span>
          </div>
          <p className="muted">ブランド：{item.brand || "未確認"}</p>
          <p className="detail-summary">{item.creative.summary}</p>
          <span className="interpretation-label">上記は創作上の解釈</span>
          <div className="detail-buttons">
            <button className="primary-button" onClick={() => onUse(item)}>
              <Plus size={16} />
              設定帳に使う
            </button>
            <button
              className="secondary-button"
              aria-pressed={actions.favorites.includes(item.id)}
              onClick={() => actions.onFavorite(item.id)}
            >
              <Bookmark size={16} />
              {actions.favorites.includes(item.id) ? "保存済み" : "お気に入り"}
            </button>
            <button
              className="secondary-button"
              aria-pressed={actions.compared.includes(item.id)}
              onClick={() => actions.onCompare(item.id)}
            >
              <GitCompareArrows size={16} />
              {actions.compared.includes(item.id)
                ? "比較から外す"
                : "比較に追加"}
            </button>
          </div>
        </div>
      </div>
      <div className="detail-layout">
        <section>
          <div className="section-title">
            <div>
              <p className="eyebrow">DOCUMENTED INFORMATION</p>
              <h2>事実・出典側の説明</h2>
            </div>
          </div>
          <div className="date-panel">
            <span>
              登場年 <b>{item.introducedYear ?? "未確認"}</b>
            </span>
            <span>
              終売年 <b>{item.discontinuedYear ?? "未確認"}</b>
            </span>
            <p>
              年月・状況の出典：
              {[
                ...new Set([...item.dateSourceIds, ...item.statusSourceIds]),
              ].map((sourceId) => (
                <a
                  key={sourceId}
                  href={`#source-${sourceId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(`source-${sourceId}`)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {item.sources.find((s) => s.id === sourceId)?.publisher}{" "}
                </a>
              ))}
              {!item.dateSourceIds.length &&
                !item.statusSourceIds.length &&
                "未確認"}
            </p>
          </div>
          <dl className="fact-list">
            {(Object.keys(factLabels) as FactKey[]).map((key) => (
              <div key={key}>
                <dt>
                  {factLabels[key]}
                  <span className={`confidence ${item.facts[key].confidence}`}>
                    {confidenceLabels[item.facts[key].confidence]}
                  </span>
                </dt>
                <dd>
                  {item.facts[key].text}
                  <div className="fact-sources">
                    {item.facts[key].sourceIds.map((sourceId) => {
                      const source = item.sources.find(
                        (s) => s.id === sourceId,
                      );
                      return source ? (
                        <a
                          key={sourceId}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {source.publisher}
                          <ExternalLink size={11} />
                        </a>
                      ) : null;
                    })}
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <aside className="creative-panel">
          <p className="eyebrow">CHARACTER NOTES</p>
          <h2>創作への応用</h2>
          <p className="notice-text">
            以下は編集上の提案です。実際の利用者の性格・職業や、社会共通の評価を示しません。
          </p>
          <h3>王道の組み合わせ</h3>
          <p>{item.creative.rationale}</p>
          <dl className="trait-list">
            {criteria.map((c) =>
              item.creative.matches[c.id]?.length ? (
                <div key={c.id}>
                  <dt>{c.label}</dt>
                  <dd>{item.creative.matches[c.id]!.join("・")}</dd>
                </div>
              ) : null,
            )}
          </dl>
          <h3>ギャップのある組み合わせ</h3>
          <p>{item.creative.counterpoint}</p>
          <div className="tag-row">
            {Object.values(item.creative.gaps)
              .flat()
              .map((tag, i) => (
                <span key={`${tag}-${i}`} className="tag">
                  {tag}
                </span>
              ))}
          </div>
          <h3>所作・小道具</h3>
          <ul className="plain-list">
            {[...item.creative.gestures, ...item.creative.props].map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
          <a className="text-link" href="#/gestures">
            所作辞典を見る <ExternalLink size={13} />
          </a>
          <h3>創作用の色パレット</h3>
          <div className="palette">
            {item.palette.map((color) => (
              <span key={color}>
                <i style={{ background: color }} />
                <code>{color}</code>
              </span>
            ))}
          </div>
          <p className="small muted">
            画面・衣装・小道具の配色案です。公式のブランドカラーではありません。
          </p>
        </aside>
      </div>
      <section className="sources-block">
        <p className="eyebrow">REFERENCES</p>
        <h2>この資料の出典</h2>
        {item.sources.map((source) => (
          <div
            className="source-row"
            id={`source-${source.id}`}
            key={source.id}
          >
            <div>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.title}
                <ExternalLink size={14} />
              </a>
              <p>{source.scope}</p>
              <span>{source.publisher}</span>
            </div>
            <time dateTime={source.checkedAt}>確認日 {source.checkedAt}</time>
          </div>
        ))}
      </section>
      {!!related.length && (
        <section className="related-section">
          <div className="section-title">
            <div>
              <p className="eyebrow">RELATED REFERENCES</p>
              <h2>関連する資料</h2>
            </div>
            <span className="small muted">カテゴリー・共通タグから選定</span>
          </div>
          <div className="card-grid">
            {related.map((other) => (
              <ItemCard
                key={other.id}
                item={other}
                actions={actions}
                index={items.indexOf(other)}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
