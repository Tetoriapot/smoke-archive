import { useCallback, useEffect, useRef, useState } from "react";
import {
  Archive,
  ArrowRight,
  BookOpen,
  BookUser,
  Bookmark,
  Check,
  ChevronRight,
  GitCompareArrows,
  Hand,
  Library,
  Menu,
  ShieldCheck,
  Users,
  X,
  Download,
} from "lucide-react";
import type { Notebook as NotebookData } from "./types";
import { storageKeys } from "./constants";
import { items } from "./data";
import { loadStorage, parseFavorites, saveStorage } from "./lib/storage";
import { parseNotebook } from "./lib/notebook";
import { download } from "./lib/export";
import { toggleCompare } from "./lib/catalog";
import { Modal } from "./components/Common";
import { HeaderTools } from "./components/HeaderTools";
import { Catalog } from "./pages/Catalog";
import { Detail } from "./pages/Detail";
import { Match } from "./pages/Match";
import { Gestures } from "./pages/Gestures";
import { Notebook } from "./pages/Notebook";
import { Compare } from "./pages/Compare";
import { Sources } from "./pages/Sources";
const navigation = [
  { path: "/", label: "図鑑トップ", icon: Library },
  { path: "/catalog", label: "銘柄・喫煙具図鑑", icon: BookOpen },
  { path: "/match", label: "キャラクター逆引き", icon: Users },
  { path: "/gestures", label: "所作辞典", icon: Hand },
  { path: "/notebook", label: "キャラクター設定帳", icon: BookUser },
  { path: "/compare", label: "資料を比較", icon: GitCompareArrows },
  { path: "/favorites", label: "お気に入り", icon: Bookmark },
  { path: "/sources", label: "資料・出典", icon: Archive },
];
export default function App() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || "/");
  const [menu, setMenu] = useState(false);
  const [favoriteState, setFavoriteState] = useState(() =>
    loadStorage(storageKeys.favorites, [] as string[], parseFavorites),
  );
  const [notebookState, setNotebookState] = useState(() =>
    loadStorage(
      storageKeys.notebook,
      { version: 1, characters: [] } as NotebookData,
      parseNotebook,
    ),
  );
  const [compared, setCompared] = useState<string[]>([]);
  const [message, setMessage] = useState<{
    text: string;
    error: boolean;
  } | null>(null);
  const [resetKey, setResetKey] = useState<"favorites" | "notebook" | null>(
    null,
  );
  const mainRef = useRef<HTMLElement>(null);
  const path = route.split("?")[0];
  const notify = useCallback(
    (text: string, error = false) => setMessage({ text, error }),
    [],
  );
  useEffect(() => {
    const handle = () => {
      setRoute(window.location.hash.slice(1) || "/");
      setMenu(false);
    };
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, []);
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [route]);
  useEffect(() => {
    if (!menu) return;
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".sidebar nav a"),
    );
    const toggle = document.querySelector<HTMLButtonElement>(".mobile-menu");
    const focusable = [...links, ...(toggle ? [toggle] : [])];
    links[0]?.focus();
    function keydown(event: KeyboardEvent) {
      if (document.querySelector("dialog[open]")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setMenu(false);
      }
      if (event.key !== "Tab") return;
      const index = focusable.indexOf(
        document.activeElement as HTMLAnchorElement,
      );
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        focusable.at(-1)?.focus();
      }
      if (!event.shiftKey && (index === focusable.length - 1 || index === -1)) {
        event.preventDefault();
        focusable[0]?.focus();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      toggle?.focus();
    };
  }, [menu]);
  useEffect(() => {
    if (!message || message.error) return;
    const timer = window.setTimeout(() => setMessage(null), 6000);
    return () => window.clearTimeout(timer);
  }, [message]);
  function onFavorite(id: string) {
    if (favoriteState.blocked) {
      notify(favoriteState.error, true);
      return;
    }
    const next = favoriteState.value.includes(id)
      ? favoriteState.value.filter((x) => x !== id)
      : [...favoriteState.value, id];
    try {
      saveStorage(storageKeys.favorites, next);
      setFavoriteState({ value: next, error: "", raw: null, blocked: false });
    } catch (error) {
      notify((error as Error).message, true);
    }
  }
  function onCompare(id: string) {
    try {
      setCompared(toggleCompare(compared, id));
    } catch (error) {
      notify((error as Error).message, true);
    }
  }
  function onSave(notebook: NotebookData) {
    if (notebookState.blocked) {
      notify(notebookState.error, true);
      return false;
    }
    try {
      saveStorage(storageKeys.notebook, notebook);
      setNotebookState({
        value: notebook,
        error: "",
        raw: null,
        blocked: false,
      });
      return true;
    } catch (error) {
      notify((error as Error).message, true);
      return false;
    }
  }
  const actions = {
    favorites: favoriteState.value,
    compared,
    onFavorite,
    onCompare,
  };
  const active = navigation.find((n) => n.path === path) || navigation[1];
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        本文へ移動
      </a>
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <a href="#/" className="brand">
          <span className="brand-mark">
            <BookOpen size={25} strokeWidth={1.2} />
          </span>
          <span>
            SMOKE
            <br />
            ARCHIVE<small>創作用喫煙キャラクター図鑑</small>
          </span>
        </a>
        <div className="sidebar-label">THE ARCHIVE</div>
        <nav aria-label="メインナビゲーション">
          {navigation.map((nav, i) => (
            <a
              key={nav.path}
              href={`#${nav.path}`}
              className={`${path === nav.path || (path.startsWith("/item/") && nav.path === "/catalog") ? "active" : ""} ${i === 4 || i === 7 ? "nav-divider" : ""}`}
              aria-current={path === nav.path ? "page" : undefined}
            >
              <nav.icon size={18} strokeWidth={1.6} />
              <span>{nav.label}</span>
              {nav.path === "/favorites" && !!favoriteState.value.length && (
                <small>{favoriteState.value.length}</small>
              )}
              {nav.path === "/compare" && !!compared.length && (
                <small>{compared.length}</small>
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="eyebrow">FOR FICTION & RESEARCH</span>
          <p>
            成人キャラクターの
            <br />
            創作・時代考証のための資料集
          </p>
          <div>
            <span className="status-dot" />
            ローカル保存対応
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="menu-backdrop"
          aria-label="メニューを閉じる"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label={menu ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="breadcrumb">
            <span>SMOKE ARCHIVE</span>
            <ChevronRight size={12} />
            <span>{active.label}</span>
          </div>
          <div className="topbar-right">
            <span className="adult-label">20+ 創作資料</span>
            <a href="#/sources" aria-label="出典と編集方針">
              <ShieldCheck size={15} />
              <span>出典と編集方針</span>
            </a>
            <HeaderTools notify={notify} />
          </div>
        </header>
        <main id="main-content" ref={mainRef} tabIndex={-1}>
          {(
            [
              ["favorites", favoriteState],
              ["notebook", notebookState],
            ] as const
          )
            .filter(([, state]) => state.blocked)
            .map(([key, state]) => (
              <div className="storage-error" key={key} role="alert">
                <strong>
                  {key === "favorites" ? "お気に入り" : "設定帳"}
                  の保存を停止しています
                </strong>
                <p>{state.error}</p>
                <div>
                  {state.raw !== null && (
                    <button
                      className="secondary-button"
                      onClick={() =>
                        download(
                          state.raw || "",
                          `SMOKE-ARCHIVE_${key}_復旧用.txt`,
                          "text/plain;charset=utf-8",
                        )
                      }
                    >
                      <Download size={14} />
                      元データを退避
                    </button>
                  )}
                  <button
                    className="text-button"
                    onClick={() => setResetKey(key)}
                  >
                    保存領域を初期化
                  </button>
                </div>
              </div>
            ))}
          {path === "/" ? (
            <Catalog key="home" home actions={actions} />
          ) : path === "/catalog" ? (
            <Catalog key="catalog" actions={actions} />
          ) : path === "/favorites" ? (
            <Catalog key="favorites" favoritePage actions={actions} />
          ) : path.startsWith("/item/") ? (
            <Detail
              id={path.slice(6)}
              actions={actions}
              onUse={(item) => {
                window.location.hash = `/notebook?item=${encodeURIComponent(item.id)}`;
              }}
            />
          ) : path === "/match" ? (
            <Match actions={actions} />
          ) : path === "/gestures" ? (
            <Gestures />
          ) : path === "/notebook" ? (
            <Notebook
              key={route}
              notebook={notebookState.value}
              onSave={onSave}
              initialItemId={
                new URLSearchParams(route.split("?")[1]).get("item") ||
                undefined
              }
              notify={notify}
            />
          ) : path === "/compare" ? (
            <Compare compared={compared} onRemove={onCompare} />
          ) : path === "/sources" ? (
            <Sources />
          ) : (
            <div className="empty-state">
              <h1>ページが見つかりません</h1>
              <a href="#/">図鑑トップへ戻る</a>
            </div>
          )}
          <footer className="footer">
            <div>
              <BookOpen size={18} />
              <span>
                SMOKE ARCHIVE <small>創作・調査用資料</small>
              </span>
            </div>
            <p>
              喫煙を推奨するサイトではありません。すべてのたばこ製品に健康リスクがあり、電子タバコも無害ではありません。
              <a href="#/sources">資料と利用上の注意</a>
            </p>
          </footer>
        </main>
        {!!compared.length && path !== "/compare" && (
          <div className="compare-tray">
            <GitCompareArrows size={19} />
            <div>
              <strong>
                比較リスト <span>{compared.length}/3</span>
              </strong>
              <span>
                {compared
                  .map((id) => items.find((i) => i.id === id)?.name)
                  .join(" / ")}
              </span>
            </div>
            <a className="primary-button" href="#/compare">
              比較する <ArrowRight size={15} />
            </a>
            <button
              className="icon-button"
              aria-label="比較をすべて解除"
              onClick={() => setCompared([])}
            >
              <X size={17} />
            </button>
          </div>
        )}
        {message && (
          <div
            className={`toast ${message.error ? "error" : ""}`}
            role={message.error ? "alert" : "status"}
          >
            {!message.error && <Check size={18} />}
            <p>{message.text}</p>
            <button
              className="icon-button"
              aria-label="通知を閉じる"
              onClick={() => setMessage(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      {resetKey && (
        <Modal title="保存領域を初期化" onClose={() => setResetKey(null)}>
          <p>
            {resetKey === "notebook" ? "設定帳" : "お気に入り"}
            の保存データを消去します。元データの退避が済んでいることを確認してください。この操作は元に戻せません。
          </p>
          <div className="dialog-actions">
            <button
              className="secondary-button"
              onClick={() => setResetKey(null)}
            >
              キャンセル
            </button>
            <button
              className="danger-button"
              onClick={() => {
                try {
                  localStorage.removeItem(storageKeys[resetKey]);
                  if (resetKey === "favorites")
                    setFavoriteState({
                      value: [],
                      error: "",
                      raw: null,
                      blocked: false,
                    });
                  else
                    setNotebookState({
                      value: { version: 1, characters: [] },
                      error: "",
                      raw: null,
                      blocked: false,
                    });
                  setResetKey(null);
                  notify("保存領域を初期化しました。");
                } catch {
                  notify(
                    "初期化できません。ブラウザーの保存設定を確認してください。",
                    true,
                  );
                }
              }}
            >
              初期化する
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
