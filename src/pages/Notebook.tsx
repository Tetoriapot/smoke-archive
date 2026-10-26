import { useEffect, useRef, useState } from "react";
import {
  BookUser,
  Check,
  Copy,
  Download,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import type { FormEvent } from "react";
import type { Character, Notebook as NotebookData } from "../types";
import { items } from "../data";
import { categories } from "../constants";
import {
  blankCharacter,
  importNotebook,
  MAX_CHARACTERS,
  mergeNotebooks,
  notebookMarkdown,
  validateFile,
} from "../lib/notebook";
import { download } from "../lib/export";
import { Modal, PageHeading } from "../components/Common";
type Props = {
  notebook: NotebookData;
  onSave: (data: NotebookData) => boolean;
  initialItemId?: string;
  notify: (message: string, error?: boolean) => void;
};
function createDraft(itemId?: string) {
  const draft = blankCharacter();
  const item = items.find((i) => i.id === itemId);
  return item
    ? {
        ...draft,
        itemId: item.id,
        brand: item.name,
        equipment: categories.find((c) => c.id === item.category)!.label,
        gestures: item.creative.gestures.join("\n"),
      }
    : draft;
}
export function Notebook({ notebook, onSave, initialItemId, notify }: Props) {
  const [draft, setDraft] = useState<Character>(() =>
    initialItemId
      ? createDraft(initialItemId)
      : notebook.characters[0] || createDraft(),
  );
  const [baseline, setBaseline] = useState(() => JSON.stringify(draft));
  const [pending, setPending] = useState<{
    title: string;
    text: string;
    run: () => void;
  } | null>(null);
  const [incoming, setIncoming] = useState<NotebookData | null>(null);
  const [loading, setLoading] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const dirty =
    JSON.stringify(draft) !== baseline ||
    Boolean(
      initialItemId && !notebook.characters.some((c) => c.id === draft.id),
    );
  const saved = notebook.characters.some((c) => c.id === draft.id);
  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a");
      const href = anchor?.getAttribute("href");
      if (!href?.startsWith("#/") || href === window.location.hash) return;
      event.preventDefault();
      setPending({
        title: "未保存の変更があります",
        text: "この画面を離れると、編集中の変更は保存されません。",
        run: () => {
          window.location.hash = href;
        },
      });
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, [dirty]);
  function choose(character: Character) {
    setDraft(character);
    setBaseline(JSON.stringify(character));
  }
  function guard(run: () => void) {
    if (dirty)
      setPending({
        title: "未保存の変更があります",
        text: "編集内容を破棄して操作を続けますか。保存済みの設定は残ります。",
        run,
      });
    else run();
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim()) {
      notify("名前を入力してください。", true);
      return;
    }
    if (!saved && notebook.characters.length >= MAX_CHARACTERS) {
      notify("設定帳は500人まで保存できます。", true);
      return;
    }
    const character = {
      ...draft,
      name: draft.name.trim(),
      updatedAt: new Date().toISOString(),
    };
    const next = {
      ...notebook,
      characters: saved
        ? notebook.characters.map((c) => (c.id === draft.id ? character : c))
        : [...notebook.characters, character],
    };
    if (onSave(next)) {
      choose(character);
      notify("キャラクター設定を保存しました。");
    }
  }
  function exportData(format: "json" | "md", includeDraft = false) {
    const data = includeDraft ? { ...notebook, characters: [draft] } : notebook;
    download(
      format === "json"
        ? JSON.stringify(data, null, 2)
        : notebookMarkdown(data),
      `SMOKE-ARCHIVE_${includeDraft ? "編集中の設定" : "キャラクター設定帳"}.${format}`,
      format === "json"
        ? "application/json;charset=utf-8"
        : "text/markdown;charset=utf-8",
    );
  }
  async function readFile(file?: File) {
    if (!file) return;
    setLoading(true);
    try {
      validateFile(file);
      const result = importNotebook(await file.text(), file.name);
      setIncoming(result);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "ファイルを読み出せません。別のファイルを選んでください。",
        true,
      );
    } finally {
      setLoading(false);
      if (uploadRef.current) uploadRef.current.value = "";
    }
  }
  function importData() {
    if (!incoming) return;
    try {
      const merged = mergeNotebooks(notebook, incoming),
        count = merged.characters.length - notebook.characters.length;
      if (onSave(merged)) {
        setIncoming(null);
        notify(
          `${count}人の設定を追加しました。同一内容の設定は重複登録しません。`,
        );
      }
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "読み込みに失敗しました。",
        true,
      );
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="CHARACTER NOTEBOOK"
        title="キャラクター設定帳"
        description="名前・道具・銘柄・所作を、人物ごとに保存できます。保存先はこのブラウザーです。"
      />
      <div className="notebook-tools">
        <div>
          <button
            className="secondary-button"
            disabled={loading}
            onClick={() => uploadRef.current?.click()}
          >
            <Upload size={15} />
            {loading ? "読み込み中…" : "インポート"}
          </button>
          <input
            ref={uploadRef}
            className="sr-only"
            type="file"
            accept=".json,.md,.markdown,application/json,text/markdown"
            aria-label="設定帳ファイル"
            onChange={(e) => void readFile(e.target.files?.[0])}
          />
        </div>
        <div>
          <span className="small muted">保存済みの全設定</span>
          <button
            className="text-button"
            disabled={!notebook.characters.length}
            onClick={() => exportData("json")}
          >
            <Download size={14} />
            JSON
          </button>
          <button
            className="text-button"
            disabled={!notebook.characters.length}
            onClick={() => exportData("md")}
          >
            <Download size={14} />
            Markdown
          </button>
        </div>
      </div>
      <div className="notebook-layout">
        <aside className="notebook-list panel">
          <div className="heading-row">
            <h2>
              人物一覧 <small>{notebook.characters.length}</small>
            </h2>
            <button
              className="icon-button"
              aria-label="新しい人物を作成"
              onClick={() => guard(() => choose(createDraft()))}
            >
              <Plus size={20} />
            </button>
          </div>
          {notebook.characters.length ? (
            notebook.characters.map((c) => (
              <button
                key={c.id}
                onClick={() => guard(() => choose(c))}
                className={`character-list-item ${draft.id === c.id ? "active" : ""}`}
              >
                <BookUser size={18} />
                <span>
                  <strong>{c.name}</strong>
                  <small>{c.occupation || "職業未設定"}</small>
                </span>
              </button>
            ))
          ) : (
            <p className="muted small">
              人物はまだ保存されていません。右のフォームから登録できます。
            </p>
          )}
          <button
            className="secondary-button full-width"
            onClick={() => guard(() => choose(createDraft()))}
          >
            <Plus size={15} />
            人物を追加
          </button>
        </aside>
        <form className="panel character-form" onSubmit={save}>
          <div className="heading-row">
            <h2>{saved ? "人物設定を編集" : "新しい人物設定"}</h2>
            <span className={`save-state ${dirty ? "unsaved" : ""}`}>
              {dirty ? (
                "未保存の変更"
              ) : saved ? (
                <>
                  <Check size={13} />
                  保存済み
                </>
              ) : (
                "未登録"
              )}
            </span>
          </div>
          <div className="form-grid">
            <label>
              名前 <span className="required">必須</span>
              <input
                name="name"
                required
                maxLength={120}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="キャラクター名"
              />
            </label>
            <label>
              年齢
              <input
                name="age"
                type="number"
                min="20"
                max="999"
                step="1"
                value={draft.age}
                onChange={(e) => setDraft({ ...draft, age: e.target.value })}
                placeholder="20歳以上・未設定可"
              />
            </label>
            <label>
              職業
              <input
                name="occupation"
                maxLength={500}
                value={draft.occupation}
                onChange={(e) =>
                  setDraft({ ...draft, occupation: e.target.value })
                }
                placeholder="例：私立探偵"
              />
            </label>
            <label>
              時代設定
              <input
                name="era"
                maxLength={500}
                value={draft.era}
                onChange={(e) => setDraft({ ...draft, era: e.target.value })}
                placeholder="例：1960年代の日本"
              />
            </label>
            <label className="full-width">
              性格
              <input
                name="personality"
                maxLength={2000}
                value={draft.personality}
                onChange={(e) =>
                  setDraft({ ...draft, personality: e.target.value })
                }
                placeholder="人物の性格や価値観"
              />
            </label>
            <label className="full-width">
              図鑑から銘柄・道具を選ぶ
              <select
                value={
                  items.some((i) => i.id === draft.itemId) ? draft.itemId : ""
                }
                onChange={(e) => {
                  const item = items.find((i) => i.id === e.target.value);
                  setDraft({
                    ...draft,
                    itemId: item?.id || "",
                    ...(item
                      ? {
                          brand: item.name,
                          equipment: categories.find(
                            (c) => c.id === item.category,
                          )!.label,
                        }
                      : {}),
                  });
                }}
              >
                <option value="">自由に入力する</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              喫煙具
              <input
                name="equipment"
                maxLength={2000}
                value={draft.equipment}
                onChange={(e) =>
                  setDraft({ ...draft, equipment: e.target.value })
                }
              />
            </label>
            <label>
              銘柄
              <input
                name="brand"
                maxLength={2000}
                value={draft.brand}
                onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
              />
            </label>
            <label className="full-width">
              所作
              <textarea
                name="gestures"
                maxLength={10000}
                rows={3}
                value={draft.gestures}
                onChange={(e) =>
                  setDraft({ ...draft, gestures: e.target.value })
                }
                placeholder="例：考え込むと、火をつけずにケースを開け閉めする。"
              />
            </label>
            <label className="full-width">
              設定メモ
              <textarea
                name="notes"
                maxLength={50000}
                rows={6}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="習慣の理由、人間関係、物語での変化など"
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-button">
              <Save size={16} />
              設定を保存
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled={!draft.name.trim()}
              onClick={() =>
                guard(() =>
                  choose({
                    ...draft,
                    id: crypto.randomUUID(),
                    name: `${draft.name}（複製）`,
                    updatedAt: "",
                  }),
                )
              }
            >
              <Copy size={15} />
              複製
            </button>
            {saved && (
              <button
                type="button"
                className="danger-button"
                onClick={() =>
                  setPending({
                    title: "人物設定を削除",
                    text: `「${draft.name}」を削除します。削除後は元に戻せません。必要な設定は先に書き出してください。`,
                    run: () => {
                      const remaining = notebook.characters.filter(
                        (c) => c.id !== draft.id,
                      );
                      if (onSave({ ...notebook, characters: remaining })) {
                        choose(remaining[0] || createDraft());
                        notify("人物設定を削除しました。");
                      }
                    },
                  })
                }
              >
                <Trash2 size={15} />
                削除
              </button>
            )}
          </div>
          <p className="small muted">
            Markdownの再読み込みには、末尾の復元用JSONを使用します。本文だけの編集は反映されません。
          </p>
          <button
            type="button"
            className="text-button"
            disabled={!draft.name.trim()}
            onClick={() => exportData("json", true)}
          >
            <Download size={13} />
            編集中の設定をJSONで退避
          </button>
        </form>
      </div>
      {pending && (
        <Modal title={pending.title} onClose={() => setPending(null)}>
          <p>{pending.text}</p>
          <div className="dialog-actions">
            <button
              className="secondary-button"
              onClick={() => setPending(null)}
            >
              キャンセル
            </button>
            <button
              className="primary-button"
              onClick={() => {
                pending.run();
                setPending(null);
              }}
            >
              続ける
            </button>
          </div>
        </Modal>
      )}
      {incoming && (
        <Modal title="設定帳を読み込む" onClose={() => setIncoming(null)}>
          <p>
            {incoming.characters.length}
            人の設定を読み込みます。既存の設定は保持します。同じIDで内容が異なる人物は、別の人物として追加します。
          </p>
          <p className="small muted">編集中のフォームはそのまま残ります。</p>
          <div className="dialog-actions">
            <button
              className="secondary-button"
              onClick={() => setIncoming(null)}
            >
              キャンセル
            </button>
            <button className="primary-button" onClick={importData}>
              設定を追加
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
