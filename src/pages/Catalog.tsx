import { useMemo, useState } from "react";
import {
  ArrowRight,
  Download,
  Search,
  Shuffle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { categories } from "../constants";
import { items } from "../data";
import { filterItems, initialFilters, randomItem } from "../lib/catalog";
import { catalogCSV, download } from "../lib/export";
import { ItemCard, Empty, PageHeading } from "../components/Common";
import type { ItemActions } from "../components/Common";
import { HeroArtwork, Silhouette } from "../components/Artwork";
export function Catalog({
  actions,
  home = false,
  favoritePage = false,
}: {
  actions: ItemActions;
  home?: boolean;
  favoritePage?: boolean;
}) {
  const [filters, setFilters] = useState({
    ...initialFilters,
    favoritesOnly: favoritePage,
  });
  const [sort, setSort] = useState("archive");
  const [expanded, setExpanded] = useState(false);
  const tags = useMemo(
    () =>
      [...new Set(items.flatMap((i) => i.tags))].sort(
        (a, b) =>
          items.filter((i) => i.tags.includes(b)).length -
          items.filter((i) => i.tags.includes(a)).length,
      ),
    [],
  );
  const filtered = filterItems(items, filters, actions.favorites);
  if (sort === "name")
    filtered.sort((a, b) => a.name.localeCompare(b.name, "ja"));
  if (sort === "year")
    filtered.sort(
      (a, b) => (a.introducedYear ?? Infinity) - (b.introducedYear ?? Infinity),
    );
  const active =
    filters.query ||
    filters.category !== "all" ||
    filters.tags.length ||
    filters.year ||
    filters.status !== "all";
  function random() {
    const item = randomItem(filtered);
    if (item) window.location.hash = `/item/${item.id}`;
  }
  return (
    <>
      {home ? (
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-line" /> A REFERENCE FOR STORYTELLERS
            </p>
            <h1>
              創作用喫煙
              <br />
              キャラクター図鑑<span className="gold-dot">.</span>
            </h1>
            <p>
              銘柄、道具、文化、所作。
              <br />
              成人キャラクターの設定と時代考証に使える資料集。
            </p>
            <a className="primary-button" href="#/match">
              キャラクターから逆引き <ArrowRight size={16} />
            </a>
            <div className="hero-stats">
              <span>
                <b>{items.length}</b> 収録資料
              </span>
              <i />
              <span>
                <b>07</b> カテゴリー
              </span>
              <i />
              <span>出典・確認日を掲載</span>
            </div>
          </div>
          <HeroArtwork />
        </section>
      ) : (
        <PageHeading
          eyebrow={favoritePage ? "YOUR COLLECTION" : "THE COLLECTION"}
          title={favoritePage ? "お気に入り" : "銘柄・喫煙具図鑑"}
          description={
            favoritePage
              ? "保存した資料を検索・比較できます。お気に入りはこのブラウザーに保存されます。"
              : "ブランド、個別製品、器具の型式を区別して収録しています。"
          }
        />
      )}
      <section className="category-section" aria-label="カテゴリー">
        <div className="section-label">
          <span>BROWSE BY CATEGORY</span>
          <button onClick={() => setFilters({ ...filters, category: "all" })}>
            すべてのカテゴリー <ArrowRight size={13} />
          </button>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setFilters({
                  ...filters,
                  category:
                    filters.category === category.id ? "all" : category.id,
                })
              }
              className={`category-tile ${filters.category === category.id ? "active" : ""}`}
              aria-pressed={filters.category === category.id}
            >
              <Silhouette category={category.id} />
              <span>{category.short}</span>
              <small>
                {String(
                  items.filter((i) => i.category === category.id).length,
                ).padStart(2, "0")}
              </small>
            </button>
          ))}
        </div>
      </section>
      <section
        className="collection-section"
        aria-labelledby="collection-title"
      >
        <div className="section-title">
          <div>
            <span className="eyebrow">EXPLORE THE ARCHIVE</span>
            <h2 id="collection-title">
              {favoritePage ? "保存した資料" : "資料を探す"}{" "}
              <span>
                {filtered.length} <small>件</small>
              </span>
            </h2>
          </div>
          <button
            className="text-button"
            disabled={!filtered.length}
            onClick={random}
          >
            <Shuffle size={16} />
            ランダムに表示
          </button>
        </div>
        <div className="search-bar">
          <Search size={20} />
          <label className="sr-only" htmlFor="archive-search">
            資料を検索
          </label>
          <input
            id="archive-search"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            placeholder="銘柄・英語名・キーワードで検索"
          />
          {filters.query && (
            <button
              className="icon-button"
              aria-label="検索をクリア"
              onClick={() => setFilters({ ...filters, query: "" })}
            >
              <X size={17} />
            </button>
          )}
          <button
            className={`filter-button ${expanded ? "active" : ""}`}
            aria-label="絞り込み"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls="advanced-filters"
          >
            <SlidersHorizontal size={16} />
            <span>絞り込み</span>
          </button>
        </div>
        {expanded && (
          <div className="advanced-filters" id="advanced-filters">
            <label>
              時代考証の基準年
              <input
                type="number"
                min="1500"
                max="2200"
                placeholder="例：1950"
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
              />
            </label>
            <label>
              現行・終売
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="all">すべて</option>
                <option value="current">現行</option>
                <option value="discontinued">終売</option>
                <option value="unknown">未確認</option>
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.includeUnknown}
                onChange={(e) =>
                  setFilters({ ...filters, includeUnknown: e.target.checked })
                }
              />
              登場年が未確認の資料も含める
            </label>
            <p className="muted small full-width">
              登場年・終売年で絞り込みます。当時の地域別流通、パッケージ、法規制は別途確認してください。終売年が未確認の資料は除外しません。
            </p>
            <label className="full-width">
              すべてのタグ
              <select
                value=""
                onChange={(e) =>
                  e.target.value &&
                  setFilters({
                    ...filters,
                    tags: [...new Set([...filters.tags, e.target.value])],
                  })
                }
              >
                <option value="">追加するタグを選択</option>
                {tags.map((tag) => (
                  <option key={tag}>{tag}</option>
                ))}
              </select>
            </label>
          </div>
        )}
        <div className="popular-tags">
          <span>創作タグ</span>
          {[...new Set([...filters.tags, ...tags.slice(0, 7)])].map((tag) => (
            <button
              key={tag}
              className={`tag ${filters.tags.includes(tag) ? "active" : ""}`}
              aria-pressed={filters.tags.includes(tag)}
              onClick={() =>
                setFilters({
                  ...filters,
                  tags: filters.tags.includes(tag)
                    ? filters.tags.filter((t) => t !== tag)
                    : [...filters.tags, tag],
                })
              }
            >
              {tag}
              {filters.tags.includes(tag) && <X size={12} />}
            </button>
          ))}
        </div>
        <div className="result-toolbar">
          <p aria-live="polite">
            {filters.category === "all"
              ? "すべての資料"
              : categories.find((c) => c.id === filters.category)?.label}
            <span className="muted"> / {filtered.length}件</span>
          </p>
          <div>
            {!!active && (
              <button
                className="text-button"
                onClick={() =>
                  setFilters({ ...initialFilters, favoritesOnly: favoritePage })
                }
              >
                条件をリセット
              </button>
            )}
            <label className="sort-label">
              <span className="sr-only">並び順</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="archive">収録順</option>
                <option value="name">名前順</option>
                <option value="year">登場年順</option>
              </select>
            </label>
          </div>
        </div>
        {filtered.length ? (
          <div className="card-grid">
            {filtered.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                actions={actions}
                index={items.indexOf(item)}
              />
            ))}
          </div>
        ) : (
          <Empty
            title={
              favoritePage && !actions.favorites.length
                ? "お気に入りはまだありません"
                : "条件に一致する資料がありません"
            }
          >
            <p>
              カテゴリーや検索条件を変更してください。カードのしおりボタンから保存できます。
            </p>
            <button
              className="secondary-button"
              onClick={() =>
                setFilters({ ...initialFilters, favoritesOnly: favoritePage })
              }
            >
              検索条件をリセット
            </button>
          </Empty>
        )}
        <div className="export-row">
          <span className="muted small">
            表示中の{filtered.length}件を書き出す
          </span>
          <button
            className="text-button"
            disabled={!filtered.length}
            onClick={() =>
              download(
                JSON.stringify({ version: 1, items: filtered }, null, 2),
                "SMOKE-ARCHIVE_資料.json",
                "application/json;charset=utf-8",
              )
            }
          >
            <Download size={14} />
            JSON
          </button>
          <button
            className="text-button"
            disabled={!filtered.length}
            onClick={() =>
              download(
                catalogCSV(filtered),
                "SMOKE-ARCHIVE_資料.csv",
                "text/csv;charset=utf-8",
              )
            }
          >
            <Download size={14} />
            CSV
          </button>
        </div>
      </section>
    </>
  );
}
