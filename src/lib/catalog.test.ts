import { describe, expect, it } from "vitest";
import { items } from "../data";
import {
  existsInYear,
  filterItems,
  initialFilters,
  normalize,
  randomItem,
  rankItems,
  similarItems,
  toggleCompare,
} from "./catalog";
describe("catalog search and history", () => {
  it("normalizes width, case, and kana", () => {
    expect(normalize("ＭＥＶＩＵＳ")).toBe("mevius");
    expect(normalize("セブンスター")).toBe(normalize("せぶんすたー"));
  });
  it("finds Japanese and English names", () => {
    expect(
      filterItems(items, { ...initialFilters, query: "せぶんすたー" }).map(
        (x) => x.id,
      ),
    ).toContain("seven-stars");
    expect(
      filterItems(items, { ...initialFilters, query: "ＭＥＶＩＵＳ" }).map(
        (x) => x.id,
      ),
    ).toContain("mevius");
  });
  it("combines tags, category, and favorites", () => {
    const item = items.find((x) => x.id === "seven-stars")!;
    const result = filterItems(
      items,
      {
        ...initialFilters,
        category: "cigarette",
        tags: item.tags.slice(0, 2),
        favoritesOnly: true,
      },
      [item.id],
    );
    expect(result).toEqual([item]);
  });
  it("does not match an unknown search", () =>
    expect(
      filterItems(items, {
        ...initialFilters,
        query: "存在しない資料ABCDEFGHI",
      }),
    ).toEqual([]));
  it("includes launch year and excludes earlier years", () => {
    const item = items.find((x) => x.id === "mevius")!;
    expect(existsInYear(item, 2012)).toBe(false);
    expect(existsInYear(item, 2013)).toBe(true);
  });
  it("excludes unknown dates unless requested", () => {
    const item = items.find((x) => x.introducedYear === null)!;
    expect(existsInYear(item, 1950)).toBe(false);
    expect(existsInYear(item, 1950, true)).toBe(true);
  });
  it("excludes ended items even when their introduction is unknown", () => {
    const item = { ...items[0], introducedYear: null, discontinuedYear: 1979 };
    expect(existsInYear(item, 1980, true)).toBe(false);
  });
  it("honors discontinued year boundary", () => {
    const item = { ...items[0], introducedYear: 1950, discontinuedYear: 1979 };
    expect(existsInYear(item, 1979)).toBe(true);
    expect(existsInYear(item, 1980)).toBe(false);
  });
  it("filters status without fabricating current items", () =>
    expect(
      filterItems(items, { ...initialFilters, status: "discontinued" }).every(
        (i) => i.status === "discontinued",
      ),
    ).toBe(true));
});
describe("creative matching and selection", () => {
  it("requires a condition and explains every result", () => {
    expect(rankItems(items, {}, "classic")).toEqual([]);
    const result = rankItems(items, { occupation: "探偵" }, "classic");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.reasons.length > 0)).toBe(true);
  });
  it("uses gap metadata for unexpected recommendations", () => {
    const result = rankItems(items, { personality: "大胆" }, "unexpected");
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((r) => r.item.creative.gaps.personality?.includes("大胆")),
    ).toBe(true);
  });
  it("excludes technology introduced after the selected era", () => {
    const result = rankItems(items, { era: "江戸", age: "30代" }, "gap");
    expect(
      result.every(
        (r) => !r.item.introducedYear || r.item.introducedYear <= 1868,
      ),
    ).toBe(true);
  });
  it("does not suggest an item as similar to itself", () =>
    expect(
      similarItems(items[0], items).every((x) => x.id !== items[0].id),
    ).toBe(true));
  it("random selection handles an empty set and avoids repeat", () => {
    expect(randomItem([])).toBeUndefined();
    expect(randomItem([items[0]], items[0].id)).toBe(items[0]);
    expect(randomItem(items, items[0].id)?.id).not.toBe(items[0].id);
  });
  it("limits comparison to three and permits removing", () => {
    expect(toggleCompare(["a", "b"], "c")).toEqual(["a", "b", "c"]);
    expect(() => toggleCompare(["a", "b", "c"], "d")).toThrow("3件");
    expect(toggleCompare(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });
});
