/** Decorative botanical watermark (from the original demo design). */
export function FloralShape({ className }: { className?: string }) {
  const stroke = 'rgb(167 203 18 / 0.5)';
  const fill = 'rgb(167 203 18 / 0.22)';
  const bloom = (x: number, y: number, r: number) => (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={fill} />
      <circle r={r / 2} fill="#a7cb12" />
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          d={`M0 -${r} C -${r * 1.3} -${r * 3.4}, ${r * 1.3} -${r * 3.4}, 0 -${r} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
          transform={`rotate(${a})`}
        />
      ))}
    </g>
  );

  return (
    <svg className={className} viewBox="0 0 320 620" fill="none" aria-hidden="true">
      <path d="M40 620 C 60 480, 140 380, 110 240 C 90 140, 180 60, 240 20" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M110 240 C 70 200, 30 210, 10 190" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M125 360 C 180 320, 220 340, 260 310" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M75 480 C 120 450, 160 480, 200 450" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M130 180 C 160 160, 190 180, 170 205 C 150 205, 135 190, 130 180 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <path d="M90 280 C 60 260, 40 280, 50 305 C 70 305, 85 295, 90 280 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <path d="M140 420 C 180 395, 210 420, 190 445 C 165 445, 145 435, 140 420 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {bloom(240, 20, 10)}
      {bloom(260, 310, 12)}
      {bloom(10, 190, 7)}
    </svg>
  );
}
