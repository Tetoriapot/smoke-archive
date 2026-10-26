export type Category =
  | "cigarette"
  | "cigar"
  | "pipe"
  | "shisha"
  | "vape"
  | "heated"
  | "kiseru";
export type FactKey =
  | "manufacturer"
  | "origin"
  | "history"
  | "appearance"
  | "aroma"
  | "culture"
  | "advertising"
  | "japanImage";
export type Fact = {
  text: string;
  confidence: "confirmed" | "attributed" | "unverified";
  sourceIds: string[];
};
export type Source = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  checkedAt: string;
  scope: string;
};
export type Criterion =
  | "age"
  | "occupation"
  | "personality"
  | "era"
  | "country"
  | "clothing"
  | "budget"
  | "aesthetic";
export type Item = {
  id: string;
  name: string;
  originalName: string;
  category: Category;
  subcategory: string;
  kind: "brand" | "product" | "type";
  brand: string;
  introducedYear: number | null;
  discontinuedYear: number | null;
  status: "current" | "discontinued" | "unknown";
  dateSourceIds: string[];
  statusSourceIds: string[];
  facts: Record<FactKey, Fact>;
  creative: {
    summary: string;
    rationale: string;
    counterpoint: string;
    matches: Partial<Record<Criterion, string[]>>;
    gaps: Partial<Record<Criterion, string[]>>;
    gestures: string[];
    props: string[];
  };
  tags: string[];
  palette: string[];
  relatedIds: string[];
  sources: Source[];
};
export type Gesture = {
  id: string;
  title: string;
  category: Category | "common";
  tags: string[];
  description: string;
  confidence: "confirmed" | "unverified";
  staging: string;
  sourceIds: string[];
};
export type Character = {
  id: string;
  name: string;
  age: string;
  occupation: string;
  personality: string;
  era: string;
  equipment: string;
  itemId: string;
  brand: string;
  gestures: string;
  notes: string;
  updatedAt: string;
  [key: string]: unknown;
};
export type Notebook = {
  version: 1;
  characters: Character[];
  [key: string]: unknown;
};
export type MatchMode = "classic" | "gap" | "unexpected";
