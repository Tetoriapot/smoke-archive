import tobacco from "./tobacco.json";
import extraTobacco from "./tobacco-extra.json";
import pipes from "./pipes.json";
import devices from "./devices.json";
import gestureData from "./gestures.json";
import gestureSourceData from "./gesture-sources.json";
import type { Item, Gesture, Source } from "../types";
// JSON is validated by the data integrity tests before production builds.
export const items = [
  ...tobacco,
  ...extraTobacco,
  ...pipes,
  ...devices,
] as Item[];
export const gestures = gestureData as Gesture[];
export const healthSource: Source = {
  id: "who-tobacco",
  title: "Tobacco and nicotine",
  publisher: "World Health Organization",
  url: "https://www.who.int/news-room/fact-sheets/detail/tobacco",
  checkedAt: "2026-10-26",
  scope:
    "紙巻き・葉巻・パイプ・水たばこ・加熱式の健康リスクと、電子タバコの有害性。",
};
export const sources: Source[] = Array.from(
  new Map(
    [
      ...items.flatMap((i) => i.sources),
      ...(gestureSourceData as Source[]),
      healthSource,
    ].map((s) => [s.id, s]),
  ).values(),
);
