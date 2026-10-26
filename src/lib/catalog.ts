import type { Category, Criterion, Item, MatchMode } from "../types";
import { criteria } from "../constants";
export const normalize = (text: string) =>
  text
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .replace(/[\u30a1-\u30f6]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60),
    );
export type Filters = {
  query: string;
  category: Category | "all";
  tags: string[];
  year: string;
  includeUnknown: boolean;
  status: string;
  favoritesOnly: boolean;
};
export const initialFilters: Filters = {
  query: "",
  category: "all",
  tags: [],
  year: "",
  includeUnknown: false,
  status: "all",
  favoritesOnly: false,
};
export function existsInYear(item: Item, year: number, includeUnknown = false) {
  if (item.discontinuedYear !== null && item.discontinuedYear < year)
    return false;
  if (item.introducedYear === null) return includeUnknown;
  return (
    item.introducedYear <= year &&
    (item.discontinuedYear === null || item.discontinuedYear >= year)
  );
}
export function filterItems(
  items: Item[],
  filters: Filters,
  favorites: string[] = [],
) {
  const terms = normalize(filters.query).trim().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    const haystack = normalize(
      [
        item.name,
        item.originalName,
        item.brand,
        item.subcategory,
        ...item.tags,
        ...Object.values(item.facts).map((f) => f.text),
        item.creative.summary,
      ].join(" "),
    );
    return (
      terms.every((term) => haystack.includes(term)) &&
      (filters.category === "all" || item.category === filters.category) &&
      filters.tags.every((tag) => item.tags.includes(tag)) &&
      (!filters.year ||
        existsInYear(item, Number(filters.year), filters.includeUnknown)) &&
      (filters.status === "all" || item.status === filters.status) &&
      (!filters.favoritesOnly || favorites.includes(item.id))
    );
  });
}
const eraEnd: Record<string, number> = {
  江戸: 1868,
  "19世紀": 1900,
  "大正・明治": 1926,
  昭和: 1989,
};
const eraStart: Record<string, number> = {
  現代: 1990,
  昭和: 1926,
  "大正・明治": 1868,
  "19世紀": 1801,
  江戸: 1603,
};
export function rankItems(
  items: Item[],
  selected: Partial<Record<Criterion, string>>,
  mode: MatchMode,
) {
  const active = criteria.filter((c) => selected[c.id]);
  if (!active.length) return [];
  return items
    .flatMap((item) => {
      const era = selected.era;
      if (
        era &&
        ((item.introducedYear !== null &&
          eraEnd[era] &&
          item.introducedYear > eraEnd[era]) ||
          (item.discontinuedYear !== null &&
            item.discontinuedYear < eraStart[era]))
      )
        return [];
      const matched = active.filter((c) =>
        item.creative.matches[c.id]?.includes(selected[c.id]!),
      );
      const gaps = active.filter((c) =>
        item.creative.gaps[c.id]?.includes(selected[c.id]!),
      );
      const score =
        mode === "classic"
          ? matched.length * 3
          : mode === "gap"
            ? matched.length + gaps.length * 3
            : gaps.length * 4;
      if (!score) return [];
      const reason = matched.map(
        (c) => `${c.label}「${selected[c.id]}」と創作タグが一致`,
      );
      if (mode !== "classic")
        reason.push(
          ...gaps.map((c) => `${c.label}「${selected[c.id]}」との対比`),
        );
      return [
        {
          item,
          score,
          reasons: reason,
          historicalCaution:
            item.introducedYear === null
              ? "登場年は未確認。時代適合性は別途確認が必要です。"
              : "登場年だけでは、その地域での流通や当時の形状までは保証できません。",
        },
      ];
    })
    .sort(
      (a, b) =>
        b.score - a.score || a.item.name.localeCompare(b.item.name, "ja"),
    );
}
export function similarItems(item: Item, items: Item[]) {
  return items
    .filter((other) => other.id !== item.id)
    .map((other) => ({
      other,
      score:
        (other.category === item.category ? 2 : 0) +
        other.tags.filter((tag) => item.tags.includes(tag)).length +
        (item.relatedIds.includes(other.id) ? 5 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.other);
}
export function randomItem(items: Item[], previousId?: string) {
  const pool =
    items.length > 1 ? items.filter((x) => x.id !== previousId) : items;
  return pool[Math.floor(Math.random() * pool.length)];
}
export function toggleCompare(current: string[], id: string) {
  if (current.includes(id)) return current.filter((value) => value !== id);
  if (current.length >= 3)
    throw new Error(
      "比較できる資料は3件までです。選択中の資料を外してから追加してください。",
    );
  return [...current, id];
}
