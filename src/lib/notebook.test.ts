import { describe, expect, it } from "vitest";
import {
  blankCharacter,
  importNotebook,
  MAX_FILE_SIZE,
  mergeNotebooks,
  notebookMarkdown,
  parseNotebook,
  validateFile,
} from "./notebook";
import { catalogCSV, csvCell } from "./export";
import { items } from "../data";
const character = {
  ...blankCharacter(),
  name: "検証用の人物",
  age: "42",
  notes: '日本語、"引用"\n改行\n```json\n<script>alert(1)</script>',
  extraField: { retained: true },
};
const notebook = {
  version: 1 as const,
  characters: [character],
  futureMetadata: "保持する",
};
describe("notebook round trips", () => {
  it("preserves all text and unknown fields in JSON", () =>
    expect(importNotebook(JSON.stringify(notebook), "設定 帳.json")).toEqual(
      notebook,
    ));
  it("preserves multiline text, code fences and unknown fields in Markdown", () =>
    expect(
      importNotebook(notebookMarkdown(notebook), "日本語 設定.md"),
    ).toEqual(notebook));
  it("supports BOM and uppercase extension", () =>
    expect(
      importNotebook("\uFEFF" + JSON.stringify(notebook), "設定.JSON"),
    ).toEqual(notebook));
  it("supports older missing optional fields", () =>
    expect(
      parseNotebook({ version: 1, characters: [{ id: "old", name: "旧設定" }] })
        .characters[0].notes,
    ).toBe(""));
  it("adds conflicting IDs without overwriting existing settings", () => {
    const merged = mergeNotebooks(notebook, {
      version: 1,
      characters: [{ ...character, name: "別の名前" }],
      importedMetadata: "new",
    });
    expect(merged.characters).toHaveLength(2);
    expect(merged.characters[0]).toEqual(character);
    expect(merged.characters[1].id).not.toBe(character.id);
    expect(merged.importedMetadata).toBe("new");
  });
  it("skips exact duplicates", () =>
    expect(mergeNotebooks(notebook, notebook)).toEqual(notebook));
  it("accepts an empty notebook", () =>
    expect(
      importNotebook('{"version":1,"characters":[]}', "empty.json").characters,
    ).toEqual([]));
});
describe("invalid input protection", () => {
  it("rejects malformed JSON and foreign Markdown", () => {
    expect(() => importNotebook("{", "bad.json")).toThrow("JSON");
    expect(() => importNotebook("# メモ", "bad.md")).toThrow("復元用データ");
  });
  it("rejects missing names, invalid ages, duplicate IDs and unsupported versions", () => {
    for (const value of [
      { version: 2, characters: [] },
      { version: 1, characters: [{ id: "x" }] },
      { version: 1, characters: [character, character] },
      { version: 1, characters: [{ ...character, age: "19" }] },
      { version: 1, characters: [{ ...character, age: "20.5" }] },
    ])
      expect(() => parseNotebook(value)).toThrow();
  });
  it("rejects invalid field types and oversized fields", () => {
    expect(() =>
      parseNotebook({ version: 1, characters: [{ ...character, notes: 42 }] }),
    ).toThrow();
    expect(() =>
      parseNotebook({
        version: 1,
        characters: [{ ...character, notes: "x".repeat(50001) }],
      }),
    ).toThrow();
  });
  it("enforces 500 character limit on parsing and merging", () => {
    const chars = Array.from({ length: 501 }, (_, i) => ({
      ...character,
      id: String(i),
    }));
    expect(() => parseNotebook({ version: 1, characters: chars })).toThrow(
      "500",
    );
    expect(() =>
      mergeNotebooks({ version: 1, characters: chars.slice(0, 500) }, notebook),
    ).toThrow("500");
  });
  it("rejects empty files, huge files, unsupported types and MIME", () => {
    for (const file of [
      { name: "a.json", type: "application/json", size: 0 },
      { name: "a.json", type: "application/json", size: MAX_FILE_SIZE + 1 },
      { name: "a.exe", type: "", size: 10 },
      { name: "a.json", type: "image/png", size: 10 },
    ])
      expect(() => validateFile(file)).toThrow();
  });
  it("accepts Japanese names and blank MIME", () =>
    expect(() =>
      validateFile({ name: "人物 設定.md", type: "", size: 100 }),
    ).not.toThrow());
});
describe("catalog CSV", () => {
  it("escapes quotes, line breaks and formula injection", () => {
    expect(csvCell('a"b\nc')).toBe('"a""b\nc"');
    expect(csvCell("=1+1")).toBe('"\'=1+1"');
  });
  it("includes UTF-8 BOM, source URLs and certainty", () => {
    const csv = catalogCSV(items.slice(0, 1));
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain(items[0].sources[0].url);
    expect(csv).toContain("unverified");
  });
});
