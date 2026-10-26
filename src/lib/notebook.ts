import type { Character, Notebook } from "../types";
export const MAX_FILE_SIZE = 2 * 1024 * 1024;
export const MAX_CHARACTERS = 500;
const fields = [
  "id",
  "name",
  "age",
  "occupation",
  "personality",
  "era",
  "equipment",
  "itemId",
  "brand",
  "gestures",
  "notes",
  "updatedAt",
] as const;
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function parseNotebook(value: unknown): Notebook {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Array.isArray(value.characters)
  )
    throw new Error(
      "設定帳の形式が異なります。SMOKE ARCHIVEで書き出したバージョン1のファイルを選んでください。",
    );
  if (value.characters.length > MAX_CHARACTERS)
    throw new Error(
      "設定帳は500人まで読み込めます。ファイルを分けてください。",
    );
  const ids = new Set<string>();
  const characters = value.characters.map((raw: unknown) => {
    if (
      !isRecord(raw) ||
      typeof raw.id !== "string" ||
      !raw.id.trim() ||
      typeof raw.name !== "string" ||
      !raw.name.trim()
    )
      throw new Error(
        "キャラクターのIDまたは名前がありません。ファイルの内容を確認してください。",
      );
    const entry = { ...raw };
    for (const key of fields) {
      if (entry[key] === undefined) entry[key] = "";
      if (
        typeof entry[key] !== "string" ||
        (entry[key] as string).length > 50000
      )
        throw new Error(
          `「${key}」の値が不正、または長すぎます。文字列で指定してください。`,
        );
    }
    if (ids.has(raw.id))
      throw new Error(
        "ファイル内でキャラクターのIDが重複しています。IDを修正してください。",
      );
    ids.add(raw.id);
    if (
      entry.age !== "" &&
      (!/^\d{1,3}$/.test(entry.age as string) || Number(entry.age) < 20)
    )
      throw new Error("年齢は20歳以上の整数、または空欄で指定してください。");
    return entry as Character;
  });
  return { ...value, version: 1, characters };
}
export function validateFile(file: Pick<File, "name" | "type" | "size">) {
  if (!/\.(json|md|markdown)$/i.test(file.name))
    throw new Error("JSONまたはMarkdownファイルを選んでください。");
  if (
    ![
      "",
      "application/json",
      "text/json",
      "text/plain",
      "text/markdown",
      "text/x-markdown",
      "application/octet-stream",
    ].includes(file.type)
  )
    throw new Error(
      "ファイルの種類を確認できません。JSONまたはMarkdownとして書き出してください。",
    );
  if (!file.size)
    throw new Error("ファイルが空です。書き出した設定帳を選んでください。");
  if (file.size > MAX_FILE_SIZE)
    throw new Error(
      "ファイルが2MBを超えています。内容を分割してから読み込んでください。",
    );
}
export function importNotebook(text: string, filename: string) {
  let json = text.replace(/^\uFEFF/, "");
  if (/\.(md|markdown)$/i.test(filename)) {
    const match = json.match(
      /<!-- SMOKE_ARCHIVE_DATA_V1 -->\r?\n(`{3,})json\r?\n([\s\S]*?)\r?\n\1\s*$/,
    );
    if (!match)
      throw new Error(
        "復元用データが見つかりません。SMOKE ARCHIVEから書き出したMarkdownを選んでください。",
      );
    json = match[2];
  }
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error(
      "JSONを読み込めません。括弧や引用符など、ファイルの内容を確認してください。",
    );
  }
  return parseNotebook(value);
}
export function mergeNotebooks(
  current: Notebook,
  incoming: Notebook,
): Notebook {
  const used = new Set(current.characters.map((c) => c.id));
  const additions = incoming.characters.flatMap((character) => {
    const existing = current.characters.find((c) => c.id === character.id);
    if (existing && JSON.stringify(existing) === JSON.stringify(character))
      return [];
    const copy = { ...character };
    while (used.has(copy.id)) copy.id = crypto.randomUUID();
    used.add(copy.id);
    return [copy];
  });
  if (current.characters.length + additions.length > MAX_CHARACTERS)
    throw new Error(
      "読み込み後に500人を超えます。不要な設定をバックアップしてから整理してください。",
    );
  return {
    ...incoming,
    ...current,
    version: 1,
    characters: [...current.characters, ...additions],
  };
}
export function notebookMarkdown(notebook: Notebook) {
  const json = JSON.stringify(notebook, null, 2);
  const longest = Math.max(
    2,
    ...Array.from(json.matchAll(/`+/g), (m) => m[0].length),
  );
  const fence = "`".repeat(longest + 1);
  const text = notebook.characters
    .map(
      (c) =>
        `## ${c.name.replace(/\n/g, " ")}\n\n年齢：${c.age || "未設定"}\n\n職業：${c.occupation}\n\n性格：${c.personality}\n\n時代：${c.era}\n\n喫煙具：${c.equipment}\n\n銘柄：${c.brand}\n\n所作：${c.gestures}\n\n${c.notes}`,
    )
    .join("\n\n---\n\n");
  return `# SMOKE ARCHIVE キャラクター設定帳\n\n${text}\n\n---\n\n以下は再読み込み用のデータです。本文だけの編集は再読み込みに反映されません。\n\n<!-- SMOKE_ARCHIVE_DATA_V1 -->\n${fence}json\n${json}\n${fence}\n`;
}
export function blankCharacter(): Character {
  return {
    id: crypto.randomUUID(),
    name: "",
    age: "",
    occupation: "",
    personality: "",
    era: "",
    equipment: "",
    itemId: "",
    brand: "",
    gestures: "",
    notes: "",
    updatedAt: "",
  };
}
