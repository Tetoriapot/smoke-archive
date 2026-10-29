import { storageKeys } from "../constants";
import { loadStorage, saveStorage } from "./storage";

export type Theme = "dark" | "light";

export function parseTheme(value: unknown): Theme {
  if (value !== "dark" && value !== "light")
    throw new Error("表示モードの値が不正です。");
  return value;
}

export function loadTheme(): Theme {
  return loadStorage<Theme>(storageKeys.theme, "dark", parseTheme).value;
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content", theme === "light" ? "#f5f1e8" : "#15191c",
  );
}

export function saveTheme(theme: Theme) {
  saveStorage(storageKeys.theme, theme);
}
