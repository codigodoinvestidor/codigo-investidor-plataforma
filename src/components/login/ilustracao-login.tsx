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
      <circle cx="150" cy="200" r="260" fill="url(#brilho)" />
      <circle cx="470" cy="620" r="220" fill="url(#brilho)" opacity="0.7" />

      {/* candles abstratos subindo */}
      <g opacity="0.9">
        <rect x="90" y="560" width="26" height="120" rx="4" fill="url(#barraDourada)" />
        <rect x="140" y="500" width="26" height="180" rx="4" fill="url(#barraDourada)" opacity="0.85" />
        <rect x="190" y="430" width="26" height="250" rx="4" fill="url(#barraDourada)" opacity="0.7" />
        <rect x="240" y="470" width="26" height="210" rx="4" fill="url(#barraDourada)" opacity="0.8" />
        <rect x="290" y="380" width="26" height="300" rx="4" fill="url(#barraDourada)" />
        <rect x="340" y="340" width="26" height="340" rx="4" fill="url(#barraDourada)" opacity="0.9" />
        <rect x="390" y="300" width="26" height="380" rx="4" fill="url(#barraDourada)" />
      </g>

      {/* linha de tendência */}
      <path
        d="M90 600 L140 540 L190 500 L240 520 L290 430 L340 390 L390 330 L440 300"
        fill="none"
        stroke="url(#linhaGrafico)"
        strokeWidth="3"
      />
      {[
        [90, 600],
        [190, 500],
        [290, 430],
        [390, 330],
        [440, 300],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="#f3d27a" />
      ))}

      {/* partículas flutuantes */}
      <g fill="#f3d27a">
        <circle cx="500" cy="150" r="3" opacity="0.6" />
        <circle cx="540" cy="220" r="2" opacity="0.4" />
        <circle cx="80" cy="120" r="2.5" opacity="0.5" />
        <circle cx="460" cy="700" r="2" opacity="0.4" />
        <circle cx="130" cy="730" r="3" opacity="0.5" />
      </g>
    </svg>
  );
}
