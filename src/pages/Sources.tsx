import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { sources, items } from "../data";
import { normalize } from "../lib/catalog";
import { Empty, PageHeading } from "../components/Common";
export function Sources() {
  const [query, setQuery] = useState("");
  const filtered = sources.filter((s) =>
    normalize([s.title, s.publisher, s.scope].join(" ")).includes(
      normalize(query),
    ),
  );
  return (
    <>
      <PageHeading
        eyebrow="SOURCES & EDITORIAL POLICY"
        title="資料・出典"
        description="確認できた事実と、出典側の説明、創作上の解釈を区別して掲載しています。"
      />
      <div className="policy-grid">
        <article className="panel">
          <span className="confidence confirmed">出典で確認</span>
          <h2>事実の確認</h2>
          <p>
            メーカーの公式発表、博物館の収蔵品情報などに記載された内容です。出典と確認日を項目ごとに示します。
          </p>
        </article>
        <article className="panel">
          <span className="confidence attributed">出典側の説明</span>
          <h2>評価・宣伝の区別</h2>
          <p>
            味や香りなど、メーカー自身による評価です。独立した検証結果や、誰にでも当てはまる感覚としては扱いません。
          </p>
        </article>
        <article className="panel">
          <span className="interpretation-label">創作上の解釈</span>
          <h2>人物設定の提案</h2>
          <p>
            性格、職業、服装、所作、配色は編集上の提案です。利用者の実像や日本社会の共通認識を示しません。
          </p>
        </article>
      </div>
      <section className="policy-notes panel">
        <h2>資料を使うときの注意</h2>
        <p>
          ブランド、個別製品、器具の型式は登録単位が異なります。ブランドの設立年から、すべての製品が当時存在したと判断しないでください。博物館の資料年代も、その型式の最初の登場年とは限りません。
        </p>
        <p>
          発売年、終売、製造元、文化的な関連が確認できない箇所は「未確認」としています。価格や流通状況は掲載していません。出典を閲覧できたことだけを根拠に現行品とは判断しません。
        </p>
        <p>
          収録資料は{items.length}
          件です。100件以上への拡充は、重複を除き、出典を検証しながら進めます。実在のパッケージ画像は転載せず、独自のSVGで道具の分類を示しています。
        </p>
        <p>
          成人キャラクターの創作資料です。喫煙の推奨や購入案内は行いません。紙巻き・葉巻・パイプ・シーシャ・加熱式には健康リスクがあり、電子タバコも無害ではありません。
          <a
            href="https://www.who.int/news-room/fact-sheets/detail/tobacco"
            target="_blank"
            rel="noreferrer"
          >
            WHOの資料 <ExternalLink size={12} />
          </a>
        </p>
        <p>
          設定帳とお気に入りは、このブラウザーのlocalStorageに保存されます。別の端末とは同期しません。ブラウザーのデータを削除する前に、設定帳を書き出してください。外部への自動送信、アクセス解析、AI
          APIは使用しません。
        </p>
      </section>
      <section className="sources-block">
        <div className="section-title">
          <h2>情報源一覧</h2>
          <span>{filtered.length}件</span>
        </div>
        <div className="search-bar">
          <Search size={18} />
          <label className="sr-only" htmlFor="source-search">
            出典を検索
          </label>
          <input
            id="source-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="情報源・発行元・確認内容で検索"
          />
        </div>
        {filtered.map((source) => (
          <article className="source-row" key={source.id}>
            <div>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.title}
                <ExternalLink size={14} />
              </a>
              <p>{source.scope}</p>
              <span>{source.publisher}</span>
              <div className="source-items">
                {items
                  .filter((item) =>
                    item.sources.some((s) => s.id === source.id),
                  )
                  .map((item) => (
                    <a key={item.id} href={`#/item/${item.id}`}>
                      {item.name}
                    </a>
                  ))}
              </div>
            </div>
            <time dateTime={source.checkedAt}>確認日 {source.checkedAt}</time>
          </article>
        ))}
        {!filtered.length && <Empty title="一致する出典がありません" />}
      </section>
    </>
  );
}
