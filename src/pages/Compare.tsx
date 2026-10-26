import { Plus, X } from "lucide-react";
import { items } from "../data";
import { PageHeading, Empty, Status } from "../components/Common";
import { Silhouette } from "../components/Artwork";
import { confidenceLabels, kindLabels } from "../constants";
export function Compare({
  compared,
  onRemove,
}: {
  compared: string[];
  onRemove: (id: string) => void;
}) {
  const selected = compared
    .map((id) => items.find((i) => i.id === id))
    .filter((i) => i !== undefined);
  return (
    <>
      <PageHeading
        eyebrow="SIDE BY SIDE"
        title="資料を比較"
        description="最大3件の外観・文化・創作イメージ・所作・登場年代を比較できます。"
      >
        <a className="secondary-button" href="#/catalog">
          <Plus size={15} />
          資料を追加
        </a>
      </PageHeading>
      {selected.length ? (
        <>
          <p className="small muted">
            狭い画面では表を横にスクロールできます。印象と所作の提案は創作上の解釈です。
          </p>
          <div
            className="comparison-scroll"
            role="region"
            aria-label="資料比較表"
            tabIndex={0}
          >
            <table className="comparison-table">
              <caption className="sr-only">
                選択した{selected.length}件の比較
              </caption>
              <thead>
                <tr>
                  <th scope="col">比較項目</th>
                  {selected.map((item) => (
                    <th key={item.id} scope="col">
                      <button
                        className="icon-button remove-compare"
                        aria-label={`${item.name}を比較から外す`}
                        onClick={() => onRemove(item.id)}
                      >
                        <X size={17} />
                      </button>
                      <Silhouette category={item.category} />
                      <a href={`#/item/${item.id}`}>{item.name}</a>
                      <small>{kindLabels[item.kind]}</small>
                      <Status item={item} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["appearance", "culture"] as const).map((key, i) => (
                  <tr key={key}>
                    <th scope="row">{["外観・形状", "文化的背景"][i]}</th>
                    {selected.map((item) => (
                      <td key={item.id}>
                        <span
                          className={`confidence ${item.facts[key].confidence}`}
                        >
                          {confidenceLabels[item.facts[key].confidence]}
                        </span>
                        <p>{item.facts[key].text}</p>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row">創作的イメージ</th>
                  {selected.map((item) => (
                    <td key={item.id}>
                      <span className="interpretation-label">創作上の解釈</span>
                      <p>{item.creative.rationale}</p>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">所作・小道具</th>
                  {selected.map((item) => (
                    <td key={item.id}>
                      <span className="interpretation-label">演出案</span>
                      <p>
                        {[
                          ...item.creative.gestures,
                          ...item.creative.props,
                        ].join(" / ")}
                      </p>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">時代適合性</th>
                  {selected.map((item) => (
                    <td key={item.id}>
                      <b>
                        登場：
                        {item.introducedYear
                          ? `${item.introducedYear}年`
                          : "未確認"}
                      </b>
                      <p>
                        終売：
                        {item.discontinuedYear
                          ? `${item.discontinuedYear}年`
                          : "未確認"}
                      </p>
                      <p>{item.facts.history.text}</p>
                      <small className="muted">
                        当時の地域別流通・仕様は別途確認が必要です。
                      </small>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">配色案</th>
                  {selected.map((item) => (
                    <td key={item.id}>
                      <div className="palette">
                        {item.palette.map((color) => (
                          <span key={color}>
                            <i style={{ background: color }} />
                            <code>{color}</code>
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Empty title="比較する資料を選んでください">
          <p>図鑑の各カードにある「比較」ボタンから追加できます。</p>
          <a href="#/catalog" className="primary-button">
            図鑑で選ぶ
          </a>
        </Empty>
      )}
    </>
  );
}
