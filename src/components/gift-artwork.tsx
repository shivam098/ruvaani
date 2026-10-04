import { useId } from "react";
import type { Artwork } from "@/lib/types";

export function GiftArtwork({ kind = "hamper", color = "#ede5da", className = "" }: {
  kind?: Artwork; color?: string; className?: string;
}) {
  const id = useId().replaceAll(":", "");
  const dark = kind === "festive" ? "#74363c" : kind === "eco" ? "#65725a" : kind === "wellness" ? "#a37970" : "#484f42";
  return (
    <svg viewBox="0 0 480 400" className={`gift-artwork ${className}`} role="img" aria-label={`${kind} gift collection illustration`}>
      <defs>
        <linearGradient id={`${id}-bg`} x2="1" y2="1"><stop stopColor={color} /><stop offset="1" stopColor="#f8f4ed" /></linearGradient>
        <linearGradient id={`${id}-box`} x2=".4" y2="1"><stop stopColor="#f3e3cb" /><stop offset="1" stopColor="#c9ac85" /></linearGradient>
        <linearGradient id={`${id}-bottle`}><stop stopColor={dark} /><stop offset=".4" stopColor={kind === "festive" ? "#a45b5c" : "#899180"} /><stop offset="1" stopColor={dark} /></linearGradient>
        <linearGradient id={`${id}-gold`}><stop stopColor="#b48d48" /><stop offset=".45" stopColor="#efda9d" /><stop offset="1" stopColor="#b99752" /></linearGradient>
        <linearGradient id={`${id}-ceramic`}><stop stopColor="#d8c8b8" /><stop offset=".35" stopColor="#fff9ef" /><stop offset="1" stopColor="#e7daca" /></linearGradient>
        <filter id={`${id}-shadow`} x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="3" dy="13" stdDeviation="9" floodColor="#3d3020" floodOpacity=".18" /></filter>
        <filter id={`${id}-small`} x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#3d3020" floodOpacity=".2" /></filter>
      </defs>
      <rect width="480" height="400" fill={`url(#${id}-bg)`} />
      <path d="M0 290 480 230V400H0Z" fill="#fff" opacity=".15" />
      <ellipse cx="255" cy="340" rx="173" ry="27" fill="#806748" opacity=".08" />
      <g opacity=".7" stroke="#8e9478" strokeWidth="2" fill="#9fa68b">
        <path d="M390 329q-9-100 43-175" fill="none" />
        <ellipse cx="412" cy="210" rx="10" ry="24" transform="rotate(38 412 210)" />
        <ellipse cx="397" cy="238" rx="10" ry="25" transform="rotate(-25 397 238)" />
        <ellipse cx="410" cy="273" rx="10" ry="24" transform="rotate(55 410 273)" />
        <ellipse cx="399" cy="300" rx="9" ry="21" transform="rotate(48 399 300)" />
      </g>
      {(kind === "hamper" || kind === "festive") ? (
        <>
          <g filter={`url(#${id}-shadow)`} transform="rotate(-8 180 150)">
            <rect x="71" y="55" width="240" height="190" rx="5" fill={dark} />
            <rect x="82" y="66" width="218" height="168" rx="2" fill="none" stroke="#d1b47a" strokeWidth="1" opacity=".65" />
            <text x="191" y="130" fill="#e9d4a4" fontFamily="Georgia,serif" fontSize="28" textAnchor="middle" letterSpacing="5">ruvaani</text>
            <text x="191" y="153" fill="#e9d4a4" fontFamily="Arial,sans-serif" fontSize="6.5" textAnchor="middle" letterSpacing="2.5">THOUGHTFULLY YOURS</text>
            <path d="M170 174h42m-21-8v16" stroke="#d1b47a" opacity=".6" />
          </g>
          <g filter={`url(#${id}-shadow)`}>
            <path d="m90 239 227-56 88 72-228 65Z" fill="#eadbc1" />
            <path d="m100 239 212-45 78 60-211 53Z" fill="#bca281" />
            <path d="m90 239 87 81 228-65v69l-226 62-89-78Z" fill={`url(#${id}-box)`} />
            <path d="m177 320 228-65v69l-226 62Z" fill="#d6bc97" />
            <path d="m108 254 63 57 214-55" fill="none" stroke="#f8efdc" strokeWidth="4" />
            <text x="282" y="332" fill="#65553f" fontSize="18" fontFamily="Georgia,serif" letterSpacing="4" transform="rotate(-15 282 332)" textAnchor="middle">ruvaani</text>
          </g>
          <g filter={`url(#${id}-small)`} transform="rotate(-12 220 200)">
            <rect x="179" y="128" width="56" height="139" rx="15" fill={`url(#${id}-bottle)`} />
            <rect x="187" y="114" width="40" height="26" rx="5" fill={dark} />
            <path d="M192 146v95" stroke="white" opacity=".13" strokeWidth="5" strokeLinecap="round" />
            <text x="207" y="218" fill="#e8dfc8" textAnchor="middle" fontSize="8" fontFamily="Georgia,serif" transform="rotate(-90 207 218)" letterSpacing="2">ruvaani</text>
          </g>
          <g filter={`url(#${id}-small)`} transform="rotate(8 279 228)">
            <rect x="250" y="190" width="61" height="76" rx="7" fill="#b29c77" />
            <ellipse cx="280" cy="191" rx="30" ry="9" fill="#ead7ad" />
            <ellipse cx="280" cy="191" rx="23" ry="6" fill="#f9f0d9" />
            <path d="M280 190v-7" stroke="#665a44" strokeWidth="2" />
            <rect x="258" y="214" width="45" height="34" fill="#f6eee1" rx="1" />
            <text x="280" y="229" fontFamily="Georgia,serif" fontSize="8" textAnchor="middle" fill="#776449">a little</text>
            <text x="280" y="241" fontFamily="Georgia,serif" fontSize="8" textAnchor="middle" fill="#776449">warmth</text>
          </g>
          <g transform="rotate(-15 335 255)" filter={`url(#${id}-small)`}>
            <rect x="313" y="213" width="45" height="62" rx="3" fill={dark} />
            <rect x="317" y="222" width="37" height="37" fill="none" stroke="#d7ba7a" />
            <text x="336" y="240" textAnchor="middle" fill="#ecdab7" fontFamily="Georgia,serif" fontSize="7">cacao</text>
            <text x="336" y="250" textAnchor="middle" fill="#ecdab7" fontSize="5">70% DARK</text>
          </g>
          <path d="m124 272 20-16 43 24-11 30Z" fill="#fbf6ea" filter={`url(#${id}-small)`} />
          <path d="m144 274 24 9m-20-3 15 9" stroke="#ac8c69" />
          {kind === "festive" && <g fill={`url(#${id}-gold)`}><ellipse cx="86" cy="333" rx="26" ry="13" /><path d="M63 332q24 46 48 0Z" /><path d="M86 331q-14-22 0-32 13 17 0 32" fill="#edb76a" /></g>}
        </>
      ) : (
        <>
          <g filter={`url(#${id}-shadow)`} transform="rotate(-8 243 254)">
            <rect x="102" y="123" width="277" height="209" rx="5" fill={`url(#${id}-box)`} />
            <rect x="111" y="133" width="259" height="188" rx="2" fill="#c5b499" />
            <path d="M119 162l224 150M117 213l164 100M170 140l187 125M128 150l-7 136M202 140l-6 170M279 145l-12 166M345 145l-9 168" stroke="#f2e5ce" strokeWidth="2" opacity=".4" />
          </g>
          {(kind === "desk" || kind === "eco") && (
            <g filter={`url(#${id}-small)`} transform="rotate(-12 178 220)">
              <rect x="112" y="117" width="117" height="171" rx="5" fill={dark} />
              <path d="M121 119v166" stroke="#d3ceaf" opacity=".4" />
              <path d="M213 117v171" stroke="#31362f" strokeWidth="4" opacity=".4" />
              <text x="169" y="184" textAnchor="middle" fill="#e7ddc7" fontSize="13" fontFamily="Georgia,serif">good things</text>
              <text x="169" y="203" textAnchor="middle" fill="#e7ddc7" fontSize="13" fontFamily="Georgia,serif">start here.</text>
              <text x="169" y="262" textAnchor="middle" fill="#e7ddc7" fontSize="8" fontFamily="Georgia,serif" letterSpacing="2">ruvaani</text>
              <rect x="240" y="136" width="9" height="139" rx="4" fill={`url(#${id}-gold)`} />
              <path d="M245 137v35" stroke="#63583d" strokeWidth="2" />
            </g>
          )}
          {(kind === "gourmet" || kind === "wellness") && (
            <g filter={`url(#${id}-small)`} transform="rotate(-12 178 209)">
              <path d="M114 113h109l-5 164H119Z" fill={kind === "gourmet" ? "#896449" : "#b9978a"} />
              <path d="M114 113h109v12H114Z" fill="#695941" opacity=".45" />
              <rect x="129" y="150" width="80" height="87" rx="1" fill="#f8f0df" />
              <text x="169" y="174" textAnchor="middle" fill="#6b5545" fontSize="9" fontFamily="Georgia,serif" letterSpacing="2">ruvaani</text>
              <path d="M148 190h42" stroke="#a28965" />
              <text x="169" y="208" textAnchor="middle" fill="#6b5545" fontSize="11" fontFamily="Georgia,serif">{kind === "gourmet" ? "slow mornings" : "a quiet moment"}</text>
              <text x="169" y="222" textAnchor="middle" fill="#6b5545" fontSize="6" letterSpacing="1.5">{kind === "gourmet" ? "FRESHLY ROASTED" : "CHAMOMILE TEA"}</text>
            </g>
          )}
          <g filter={`url(#${id}-small)`} transform="rotate(7 305 200)">
            <path d="M334 162h10q31 0 28 32-3 27-38 22" fill="none" stroke="#dacdbb" strokeWidth="13" />
            <path d="M264 153h78v64q-1 36-39 36t-39-36Z" fill={`url(#${id}-ceramic)`} />
            <ellipse cx="303" cy="153" rx="39" ry="12" fill="#f9f3e6" />
            <ellipse cx="303" cy="154" rx="31" ry="8" fill={kind === "wellness" ? "#f0e3c6" : "#695540"} />
            <text x="304" y="204" fill="#826f56" textAnchor="middle" fontSize="10" fontFamily="Georgia,serif">{kind === "wellness" ? "unwind" : "hello, lovely"}</text>
          </g>
          <g filter={`url(#${id}-small)`} transform="rotate(13 287 296)">
            <rect x="242" y="274" width="100" height="45" rx="2" fill="#f8f0e3" />
            <text x="292" y="293" textAnchor="middle" fill="#887158" fontFamily="Georgia,serif" fontSize="10">a little something,</text>
            <text x="292" y="307" textAnchor="middle" fill="#887158" fontFamily="Georgia,serif" fontSize="10">just for you.</text>
          </g>
          <path d="M95 308q-47-18-27-39t53 51q-7-62 17-61t-7 65M111 319l-29 43m38-38 27 36" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="9" />
        </>
      )}
    </svg>
  );
}
