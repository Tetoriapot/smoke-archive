import { useId, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  GitCompareArrows,
  SearchX,
  X,
} from "lucide-react";
import type { Item } from "../types";
import { categories, kindLabels, statusLabels } from "../constants";
import { Silhouette } from "./Artwork";
export type ItemActions = {
  favorites: string[];
  compared: string[];
  onFavorite: (id: string) => void;
  onCompare: (id: string) => void;
};
export function ItemCard({
  item,
  actions,
  index = 0,
}: {
  item: Item;
  actions: ItemActions;
  index?: number;
}) {
  const category = categories.find((c) => c.id === item.category)!;
  const saved = actions.favorites.includes(item.id),
    compared = actions.compared.includes(item.id);
  return (
    <article className="item-card">
      <a
        href={`#/item/${item.id}`}
        className="card-art"
        aria-label={`${item.name}の詳細`}
      >
        <span className="plate-id">
          NO. {String(index + 1).padStart(3, "0")}
        </span>
        <span className="plate-category">{category.en}</span>
        <Silhouette category={item.category} />
        <span className="drawing-note">
          形態イメージ・実物の再現ではありません
        </span>
      </a>
      <div className="card-body">
        <div className="card-meta">
          <span>{category.short}</span>
          <span>{kindLabels[item.kind]}</span>
          {item.status === "discontinued" && (
            <span className="ended">終売</span>
          )}
        </div>
        <a className="card-title" href={`#/item/${item.id}`}>
          <h3>{item.name}</h3>
          <ArrowUpRight size={17} />
        </a>
        <p className="original-name">{item.originalName}</p>
        <p className="item-summary">{item.creative.summary}</p>
        <div className="tag-row">
          {item.tags.slice(0, 3).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="card-bottom">
          <span>
            {item.introducedYear
              ? `${item.introducedYear}年〜`
              : "登場年 未確認"}
          </span>
          <button
            className={`icon-button ${saved ? "selected" : ""}`}
            aria-label={`${item.name}をお気に入り${saved ? "から解除" : "に登録"}`}
            aria-pressed={saved}
            onClick={() => actions.onFavorite(item.id)}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          </button>
          <button
            className={`compare-button ${compared ? "selected" : ""}`}
            aria-pressed={compared}
            onClick={() => actions.onCompare(item.id)}
          >
            {compared ? <Check size={15} /> : <GitCompareArrows size={15} />}
            比較
          </button>
        </div>
      </div>
    </article>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <SearchX size={32} strokeWidth={1} />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <div className="heading-row">
        <h1>{title}</h1>
        {children}
      </div>
      <p>{description}</p>
    </div>
  );
}
export function Status({ item }: { item: Item }) {
  return (
    <span className={`status-badge ${item.status}`}>
      {statusLabels[item.status]}
    </span>
  );
}
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useLayoutEffect(() => {
    const dialog = ref.current!;
    const previousFocus = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby={titleId}
    >
      <div className="heading-row">
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="icon-button"
          aria-label="閉じる"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
