export type Stored<T> = {
  value: T;
  error: string;
  raw: string | null;
  blocked: boolean;
};
export function loadStorage<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => T,
): Stored<T> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
    return {
      value: raw === null ? fallback : validate(JSON.parse(raw)),
      error: "",
      raw,
      blocked: false,
    };
  } catch {
    return {
      value: fallback,
      error:
        "保存データを読み出せません。元のデータは上書きせず保持しています。バックアップを保存して内容を確認してください。",
      raw,
      blocked: true,
    };
  }
}
export function saveStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(
      "ブラウザーに保存できません。空き容量や保存の許可を確認してください。編集中の内容はエクスポートできます。",
    );
  }
}
export function parseFavorites(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((x) => typeof x === "string"))
    throw new Error("お気に入りの形式が不正です。");
  return [...new Set(value)];
}
