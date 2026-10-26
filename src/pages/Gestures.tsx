import { useState } from "react";
import { Search, ExternalLink } from "lucide-react";
import { categories } from "../constants";
import { gestures, sources } from "../data";
import { normalize } from "../lib/catalog";
import { Empty, PageHeading } from "../components/Common";
export function Gestures() {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [tag, setTag] = useState("");
  const tags = [...new Set(gestures.flatMap((g) => g.tags))];
  const filtered = gestures.filter(
    (g) =>
      normalize(
        [g.title, g.description, g.staging, ...g.tags].join(" "),
      ).includes(normalize(query)) &&
      (category === "all" ||
        g.category === category ||
        g.category === "common") &&
      (!tag || g.tags.includes(tag)),
  );
  return (
    <>
      <PageHeading
        eyebrow="GESTURE DICTIONARY"
        title="所作辞典"
        description="道具の扱いと文化的背景を確認し、人物の行動を考えるための辞典です。技術的な説明と演出案を分けて掲載します。"
      />
      <div className="gesture-filters">
        <div className="search-bar">
          <Search size={18} />
          <label className="sr-only" htmlFor="gesture-search">
            所作を検索
          </label>
          <input
            id="gesture-search"
            placeholder="所作・感情・小道具を検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <label>
          <span className="sr-only">道具のカテゴリー</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">すべての道具</option>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.short}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="popular-tags">
        <button
          className={`tag ${!tag ? "active" : ""}`}
          onClick={() => setTag("")}
        >
          すべて
        </button>
        {tags.map((t) => (
          <button
            key={t}
            className={`tag ${t === tag ? "active" : ""}`}
            aria-pressed={t === tag}
            onClick={() => setTag(t === tag ? "" : t)}
          >
            {t}
          </button>
        ))}
      </div>
      <p className="small muted" aria-live="polite">
        {filtered.length}件の所作。共通の所作は各カテゴリーにも表示します。
      </p>
      <div className="gesture-grid">
        {filtered.map((g, i) => (
          <article className="gesture-card" key={g.id}>
            <span className="eyebrow">
              NOTE {String(i + 1).padStart(2, "0")} /{" "}
              {categories.find((c) => c.id === g.category)?.short || "共通"}
            </span>
            <h2>{g.title}</h2>
            <div className="gesture-fact">
              <span className={`confidence ${g.confidence}`}>
                {g.confidence === "confirmed"
                  ? "文化・技術の説明"
                  : "文化・技術の説明は未確認"}
              </span>
              <p>{g.description}</p>
            </div>
            <div className="gesture-staging">
              <span className="interpretation-label">創作上の演出案</span>
              <p>{g.staging}</p>
            </div>
            <div className="tag-row">
              {g.tags.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <div className="fact-sources">
              {g.sourceIds.map((id) => {
                const source = sources.find((s) => s.id === id);
                return source ? (
                  <a
                    href={source.url}
                    key={id}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {source.publisher}
                    <ExternalLink size={11} />
                  </a>
                ) : null;
              })}
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <Empty title="条件に一致する所作がありません">
          <button
            className="secondary-button"
            onClick={() => {
              setQuery("");
              setCategory("all");
              setTag("");
            }}
          >
            条件をリセット
          </button>
        </Empty>
      )}
    </>
  );
}
