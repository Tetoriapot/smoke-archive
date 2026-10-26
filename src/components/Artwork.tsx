import type { Category } from "../types";
export function Silhouette({
  category,
  className = "",
}: {
  category: Category;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 150"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {category === "cigarette" && (
          <>
            <path
              d="M66 41l55-8 18 10v79l-55 9-18-11z"
              fill="currentColor"
              fillOpacity=".055"
            />
            <path d="M66 41l18 11 55-9M84 52v79M67 61l17 10 55-8M92 84l37-6M92 89l37-6M98 105l24-4M121 33v9" />
            <path d="M162 36l9 1-12 91-9-1zM154 99l9 1M155 94l9 1" />
            <path d="M167 26c-8-7 10-11 4-20" opacity=".3" />
          </>
        )}
        {category === "cigar" && (
          <>
            <path
              d="M48 105l133-55c12-5 19 11 7 17L55 122c-11 4-17-12-7-17z"
              fill="currentColor"
              fillOpacity=".07"
            />
            <path d="M114 78l7 17M132 71l7 16M118 76l7 17M50 105l7 17M66 103l22-9M145 75l25-11" />
            <ellipse cx="176" cy="110" rx="23" ry="13" />
            <ellipse cx="176" cy="110" rx="11" ry="6" />
            <path d="M153 110v9c0 17 46 17 46 0v-9" />
          </>
        )}
        {category === "pipe" && (
          <>
            <path
              d="M41 66c0-20 64-20 64 0v26c0 40-53 43-59 9z"
              fill="currentColor"
              fillOpacity=".08"
            />
            <ellipse cx="73" cy="66" rx="32" ry="12" />
            <ellipse cx="73" cy="65" rx="24" ry="7" />
            <path d="M106 91c41 12 43-41 66-44l33-5 2 9-31 5c-19 2-22 61-70 49M54 84l4 22M64 86l3 23M76 88v22M88 86v20" />
            <path
              d="M70 38c-18-14 12-13 0-29M88 40c-10-8 13-14 4-22"
              opacity=".25"
            />
          </>
        )}
        {category === "shisha" && (
          <>
            <path
              d="M99 121c-20-8-15-25-2-37l10-9V42h18v33l10 9c15 14 19 29-2 37z"
              fill="currentColor"
              fillOpacity=".06"
            />
            <path d="M96 121h40v5H96zM99 83h33M94 106h43M107 68h18M100 42h32l-7-10h-18zM103 25h26l-5 7h-16zM114 14h5v11M125 71c54-33 44 61 71 43 14-10-2-48-6-63M183 31l7 20 6-2-7-20z" />
            <path d="M110 12c-8-5 4-7 0-12" opacity=".25" />
          </>
        )}
        {category === "vape" && (
          <>
            <path d="M82 59h51v67H82z" fill="currentColor" fillOpacity=".06" />
            <path d="M89 34h36v25H89zM96 20h22v14H96zM91 42h32M91 52h32M94 75h27v15H94zM98 98h18M99 104h16M133 65l9-4v60l-9 5" />
            <circle cx="108" cy="113" r="4" />
            <path d="M168 48h16v76h-16zM170 32h12v16h-12zM171 101h10" />
          </>
        )}
        {category === "heated" && (
          <>
            <rect
              x="63"
              y="44"
              width="68"
              height="82"
              rx="16"
              fill="currentColor"
              fillOpacity=".06"
            />
            <path d="M65 62h64M79 112h15M117 81v17" />
            <rect x="156" y="45" width="17" height="81" rx="8" />
            <path d="M160 45V23h9v22M157 66h15M160 101h9" />
          </>
        )}
        {category === "kiseru" && (
          <>
            <path
              d="M35 103l139-27 19-18 8 5-18 25-146 28z"
              fill="currentColor"
              fillOpacity=".08"
            />
            <path d="M37 103l25-5 3 14-28 5M155 80l3 14M174 76l9 12M191 52l20-4 4 12-18 6z" />
            <ellipse
              cx="201"
              cy="50"
              rx="11"
              ry="4"
              transform="rotate(-12 201 50)"
            />
            <path d="M67 105l86-17M200 35c-8-9 9-11 4-21" opacity=".4" />
          </>
        )}
      </g>
    </svg>
  );
}
export function HeroArtwork() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="hero-plate">
        <span>FIELD NOTES</span>
        <Silhouette category="pipe" />
        <div className="plate-rule" />
        <small>FORM · CULTURE · CHARACTER</small>
      </div>
      <span className="specimen-number">PLATE / 003</span>
      <span className="specimen-caption">喫煙具の形態研究</span>
    </div>
  );
}
