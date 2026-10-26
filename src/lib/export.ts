import type { Item } from "../types";
import { factLabels, kindLabels, statusLabels } from "../constants";
export function download(text: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function catalogCSV(items: Item[]) {
  const keys = Object.keys(factLabels) as (keyof typeof factLabels)[];
  const header = [
    "ID",
    "日本語名",
    "原語名",
    "カテゴリー",
    "登録単位",
    "ブランド",
    "登場年",
    "終売年",
    "状況",
    ...keys.flatMap((k) => [
      factLabels[k],
      `${factLabels[k]}の確実性`,
      `${factLabels[k]}の出典ID`,
    ]),
    "創作上の解釈",
    "タグ",
    "出典URL",
    "確認日",
  ];
  const rows = items.map((i) => [
    i.id,
    i.name,
    i.originalName,
    i.category,
    kindLabels[i.kind],
    i.brand,
    i.introducedYear ?? "未確認",
    i.discontinuedYear ?? "未確認",
    statusLabels[i.status],
    ...keys.flatMap((k) => [
      i.facts[k].text,
      i.facts[k].confidence,
      i.facts[k].sourceIds.join(" | "),
    ]),
    i.creative.summary,
    i.tags.join(" | "),
    i.sources.map((s) => s.url).join(" | "),
    [...new Set(i.sources.map((s) => s.checkedAt))].join(" | "),
  ]);
  return (
    "\uFEFF" +
    [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")
  );
}
