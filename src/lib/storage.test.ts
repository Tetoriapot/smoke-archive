import { afterEach, describe, expect, it, vi } from "vitest";
import { loadStorage, parseFavorites, saveStorage } from "./storage";
import { parseNotebook } from "./notebook";
afterEach(() => vi.unstubAllGlobals());
describe("local storage protection", () => {
  it("loads missing data without creating a write", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem: () => null, setItem });
    expect(loadStorage("favorites", [], parseFavorites).value).toEqual([]);
    expect(setItem).not.toHaveBeenCalled();
  });
  it("preserves corrupt raw data and blocks overwrite", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem: () => "{broken", setItem });
    const result = loadStorage(
      "notebook",
      { version: 1, characters: [] },
      parseNotebook,
    );
    expect(result.blocked).toBe(true);
    expect(result.raw).toBe("{broken");
    expect(setItem).not.toHaveBeenCalled();
  });
  it("reports storage access and quota errors", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    expect(loadStorage("favorites", [], parseFavorites).blocked).toBe(true);
    expect(() => saveStorage("key", {})).toThrow("保存できません");
  });
  it("saves and reloads favorites", () => {
    const data = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    });
    saveStorage("favorites", ["seven-stars"]);
    expect(loadStorage("favorites", [], parseFavorites).value).toEqual([
      "seven-stars",
    ]);
  });
  it("rejects invalid favorites and removes duplicate IDs", () => {
    expect(() => parseFavorites([12])).toThrow();
    expect(parseFavorites(["a", "a", "b"])).toEqual(["a", "b"]);
  });
});
