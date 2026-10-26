import type { Category, Criterion, FactKey } from "./types";
export const categories: {
  id: Category;
  label: string;
  short: string;
  en: string;
  number: string;
}[] = [
  {
    id: "cigarette",
    label: "紙巻きタバコ",
    short: "紙巻き",
    en: "CIGARETTES",
    number: "01",
  },
  {
    id: "cigar",
    label: "葉巻・シガリロ",
    short: "葉巻",
    en: "CIGARS & CIGARILLOS",
    number: "02",
  },
  {
    id: "pipe",
    label: "パイプ・パイプ用葉",
    short: "パイプ",
    en: "PIPES & TOBACCO",
    number: "03",
  },
  {
    id: "shisha",
    label: "シーシャ・フレーバー",
    short: "シーシャ",
    en: "SHISHA",
    number: "04",
  },
  {
    id: "vape",
    label: "VAPE・電子タバコ",
    short: "VAPE",
    en: "VAPORIZERS",
    number: "05",
  },
  {
    id: "heated",
    label: "加熱式タバコ",
    short: "加熱式",
    en: "HEATED TOBACCO",
    number: "06",
  },
  {
    id: "kiseru",
    label: "煙管・刻みタバコ",
    short: "煙管",
    en: "KISERU",
    number: "07",
  },
];
export const factLabels: Record<FactKey, string> = {
  manufacturer: "製造元・ブランド運営元",
  origin: "発祥国・地域",
  history: "登場年代・歴史",
  appearance: "外観・形状・パッケージ",
  aroma: "味・香り",
  culture: "文化・映画・文学",
  advertising: "広告・歴史上のイメージ",
  japanImage: "日本での通俗的イメージ",
};
export const criteria: { id: Criterion; label: string; options: string[] }[] = [
  { id: "age", label: "年齢層", options: ["20代", "30代", "40代以上"] },
  {
    id: "occupation",
    label: "職業",
    options: [
      "探偵",
      "作家",
      "研究者",
      "職人",
      "会社員",
      "経営者",
      "芸術家",
      "旅人",
    ],
  },
  {
    id: "personality",
    label: "性格",
    options: ["寡黙", "社交的", "几帳面", "大胆", "内向的"],
  },
  {
    id: "era",
    label: "時代",
    options: ["現代", "昭和", "大正・明治", "19世紀", "江戸"],
  },
  {
    id: "country",
    label: "舞台の国・地域",
    options: ["日本", "英国", "米国", "キューバ", "中東", "その他"],
  },
  {
    id: "clothing",
    label: "服装",
    options: ["スーツ", "和装", "作業着", "カジュアル"],
  },
  { id: "budget", label: "経済状況", options: ["質素", "中庸", "裕福"] },
  {
    id: "aesthetic",
    label: "美意識",
    options: ["実用", "伝統", "洗練", "前衛"],
  },
];
export const statusLabels = {
  current: "現行",
  discontinued: "終売",
  unknown: "現行状況 未確認",
};
export const kindLabels = {
  brand: "ブランド",
  product: "個別製品",
  type: "器具の型式",
};
export const confidenceLabels = {
  confirmed: "出典で確認",
  attributed: "出典側の説明",
  unverified: "未確認",
};
export const storageKeys = {
  favorites: "smoke-archive:favorites:v1",
  notebook: "smoke-archive:notebook:v1",
};
