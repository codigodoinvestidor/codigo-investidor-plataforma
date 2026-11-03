export function IlustracaoLogin() {
  return (
    <svg
      viewBox="0 0 600 800"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fundoNavy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1324" />
          <stop offset="100%" stopColor="#060a14" />
        </linearGradient>
        <linearGradient id="barraDourada" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3d27a" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="brilho" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="linhaGrafico" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#f3d27a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect width="600" height="800" fill="url(#fundoNavy)" />

      {/* grid sutil */}
      <g stroke="#f3d27a" strokeOpacity="0.05">
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="800" />
        ))}
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
        ))}
      </g>

      {/* brilho decorativo */}
      <circle cx="220" cy="160" r="260" fill="url(#brilho)" />
      <circle cx="540" cy="540" r="220" fill="url(#brilho)" opacity="0.7" />

      {/* candles abstratos subindo, deslocados à direita e sem invadir a área inferior do texto */}
      <g opacity="0.9">
        <rect x="150" y="500" width="26" height="120" rx="4" fill="url(#barraDourada)" />
        <rect x="200" y="440" width="26" height="180" rx="4" fill="url(#barraDourada)" opacity="0.85" />
        <rect x="250" y="370" width="26" height="250" rx="4" fill="url(#barraDourada)" opacity="0.7" />
        <rect x="300" y="410" width="26" height="210" rx="4" fill="url(#barraDourada)" opacity="0.8" />
        <rect x="350" y="320" width="26" height="300" rx="4" fill="url(#barraDourada)" />
        <rect x="400" y="280" width="26" height="340" rx="4" fill="url(#barraDourada)" opacity="0.9" />
        <rect x="450" y="240" width="26" height="380" rx="4" fill="url(#barraDourada)" />
        <rect x="500" y="200" width="26" height="420" rx="4" fill="url(#barraDourada)" opacity="0.85" />
        <rect x="550" y="160" width="26" height="460" rx="4" fill="url(#barraDourada)" />
      </g>

      {/* linha de tendência */}
      <path
        d="M163 500 L213 440 L263 370 L313 410 L363 320 L413 280 L463 240 L513 200 L563 160"
        fill="none"
        stroke="url(#linhaGrafico)"
        strokeWidth="3"
      />
      {[
        [163, 500],
        [263, 370],
        [363, 320],
        [463, 240],
        [563, 160],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="#f3d27a" />
      ))}

      {/* partículas flutuantes */}
      <g fill="#f3d27a">
        <circle cx="130" cy="110" r="3" opacity="0.6" />
        <circle cx="580" cy="100" r="2" opacity="0.4" />
        <circle cx="90" cy="250" r="2.5" opacity="0.5" />
        <circle cx="560" cy="650" r="2" opacity="0.4" />
        <circle cx="200" cy="700" r="3" opacity="0.5" />
      </g>
    </svg>
  );
}
