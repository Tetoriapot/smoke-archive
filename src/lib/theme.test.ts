import { afterEach, describe, expect, it, vi } from "vitest";
import { storageKeys } from "../constants";
import { applyTheme, loadTheme, parseTheme, saveTheme } from "./theme";

afterEach(() => vi.unstubAllGlobals());
describe("display theme", () => {
  it("defaults to dark without writing existing storage", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem: () => null, setItem });
    expect(loadTheme()).toBe("dark");
    expect(setItem).not.toHaveBeenCalled();
  });
  it("preserves favorites and notebook when saving and reloading a theme", () => {
    const data = new Map([[storageKeys.favorites, '["seven-stars"]'], [storageKeys.notebook, '{"version":1,"characters":[]}']]);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    });
    saveTheme("light");
    expect(loadTheme()).toBe("light");
    saveTheme("dark");
    expect(loadTheme()).toBe("dark");
    expect(data.get(storageKeys.favorites)).toBe('["seven-stars"]');
    expect(data.get(storageKeys.notebook)).toBe('{"version":1,"characters":[]}');
  });
  it.each(['{broken', '"unknown"', 'true', '{}'])("uses dark for invalid saved data %s without overwriting it", (raw) => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem: () => raw, setItem });
    expect(loadTheme()).toBe("dark");
    expect(setItem).not.toHaveBeenCalled();
  });
  it("handles denied storage reads and reports denied saves", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => { throw new Error("SecurityError"); },
      setItem: () => { throw new Error("QuotaExceededError"); },
    });
    expect(loadTheme()).toBe("dark");
    expect(() => saveTheme("light")).toThrow("保存できません");
    expect(() => parseTheme(1)).toThrow();
  });
  it("updates page palette, native controls and browser chrome together", () => {
    const element = { dataset: {}, style: {} };
    const setAttribute = vi.fn();
    vi.stubGlobal("document", { documentElement: element, querySelector: () => ({ setAttribute }) });
    applyTheme("light");
    expect(element.dataset).toEqual({ theme: "light" });
    expect(element.style).toEqual({ colorScheme: "light" });
    expect(setAttribute).toHaveBeenLastCalledWith("content", "#f5f1e8");
    applyTheme("dark");
    expect(element.dataset).toEqual({ theme: "dark" });
    expect(setAttribute).toHaveBeenLastCalledWith("content", "#15191c");
  });
});
