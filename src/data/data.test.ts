import { describe, expect, it } from "vitest";
import { items, gestures, sources } from ".";
import { categories, criteria, factLabels } from "../constants";
describe("source-backed data integrity", () => {
  it("covers all seven categories with stable, unique item IDs", () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    expect(new Set(items.map((i) => `${i.kind}:${i.originalName}`)).size).toBe(
      items.length,
    );
    for (const c of categories)
      expect(items.some((i) => i.category === c.id)).toBe(true);
  });
  it("requires sources for factual claims and dates", () => {
    for (const item of items) {
      const ids = item.sources.map((s) => s.id);
      expect(Object.keys(item.facts).sort()).toEqual(
        Object.keys(factLabels).sort(),
      );
      for (const fact of Object.values(item.facts)) {
        expect(fact.text.length).toBeGreaterThan(0);
        if (fact.confidence !== "unverified")
          expect(fact.sourceIds.length, item.id).toBeGreaterThan(0);
        for (const id of fact.sourceIds) expect(ids, item.id).toContain(id);
      }
      if (item.introducedYear !== null || item.discontinuedYear !== null)
        expect(item.dateSourceIds.length, item.id).toBeGreaterThan(0);
      if (item.status !== "unknown")
        expect(item.statusSourceIds.length, item.id).toBeGreaterThan(0);
      for (const id of [...item.dateSourceIds, ...item.statusSourceIds])
        expect(ids, item.id).toContain(id);
    }
  });
  it("has safe source URLs, dates and palettes", () => {
    for (const source of sources) {
      expect(new URL(source.url).protocol).toBe("https:");
      expect(source.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.scope.length).toBeGreaterThan(0);
    }
    for (const item of items)
      for (const color of item.palette) expect(color).toMatch(/^#[a-f\d]{6}$/i);
  });
  it("uses only defined matching criteria and valid related IDs", () => {
    for (const item of items) {
      for (const map of [item.creative.matches, item.creative.gaps])
        for (const [key, values] of Object.entries(map)) {
          const definition = criteria.find((c) => c.id === key);
          expect(definition).toBeDefined();
          for (const value of values)
            expect(definition!.options, item.id).toContain(value);
        }
      for (const related of item.relatedIds)
        expect(
          items.some((i) => i.id === related),
          related,
        ).toBe(true);
    }
  });
  it("keeps source IDs consistent across items", () => {
    const seen = new Map();
    for (const item of items)
      for (const source of item.sources) {
        if (seen.has(source.id)) expect(source).toEqual(seen.get(source.id));
        seen.set(source.id, source);
      }
  });
  it("covers gestures and references real sources for confirmed descriptions", () => {
    expect(gestures.length).toBeGreaterThanOrEqual(11);
    expect(new Set(gestures.map((g) => g.id)).size).toBe(gestures.length);
    for (const g of gestures) {
      expect(g.staging.length).toBeGreaterThan(0);
      if (g.confidence === "confirmed")
        expect(g.sourceIds.length).toBeGreaterThan(0);
      for (const id of g.sourceIds)
        expect(
          sources.some((s) => s.id === id),
          id,
        ).toBe(true);
    }
  });
});
