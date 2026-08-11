/**
 * Decorative background: a faint city skyline (real estate) layered with a
 * technical grid and a soft brand-red glow (fintech). Fully original SVG —
 * no external images, so nothing to license and nothing that can 404.
 *
 * Usage: place inside a `relative` parent, behind your content:
 *   <div className="relative">
 *     <TechRealEstateBackdrop />
 *     <div className="relative z-10">...content...</div>
 *   </div>
 */
export function TechRealEstateBackdrop({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const lineColor = variant === 'dark' ? '#FFFFFF' : '#17130F';
  const buildingColor = variant === 'dark' ? '#FFFFFF' : '#17130F';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Soft brand glow */}
      <div
        className="absolute -top-32 -right-32 w-[560px] h-[560px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(235,49,55,0.35) 0%, rgba(235,49,55,0) 70%)' }}
      />
      <div
        className="absolute -bottom-40 -left-24 w-[420px] h-[420px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(235,49,55,0.18) 0%, rgba(235,49,55,0) 70%)' }}
      />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMax slice">
        <defs>
          <pattern id="techGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke={lineColor} strokeOpacity="0.06" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="800" height="600" fill="url(#techGrid)" />

        {/* City skyline silhouette, low opacity */}
        <g fill={buildingColor} fillOpacity={variant === 'dark' ? 0.07 : 0.045}>
          <rect x="20" y="380" width="60" height="220" />
          <rect x="90" y="330" width="45" height="270" />
          <rect x="145" y="410" width="70" height="190" />
          <rect x="225" y="290" width="50" height="310" />
          <rect x="285" y="360" width="65" height="240" />
          <polygon points="360,600 360,340 395,300 430,340 430,600" />
          <rect x="450" y="400" width="55" height="200" />
          <rect x="515" y="320" width="48" height="280" />
          <rect x="573" y="440" width="80" height="160" />
          <polygon points="663,600 663,320 700,270 737,320 737,600" />
          <rect x="750" y="390" width="40" height="210" />
        </g>

        {/* Faint window grid on the tallest towers, techy detail */}
        <g fill={lineColor} fillOpacity={variant === 'dark' ? 0.09 : 0.06}>
          {Array.from({ length: 6 }).map((_, row) =>
            Array.from({ length: 3 }).map((_, col) => (
              <rect key={`t1-${row}-${col}`} x={368 + col * 10} y={330 + row * 24} width="4" height="10" />
            ))
          )}
          {Array.from({ length: 7 }).map((_, row) =>
            Array.from({ length: 3 }).map((_, col) => (
              <rect key={`t2-${row}-${col}`} x={671 + col * 10} y={300 + row * 24} width="4" height="10" />
            ))
          )}
        </g>

        {/* Ground line */}
        <line x1="0" y1="600" x2="800" y2="600" stroke={lineColor} strokeOpacity="0.12" strokeWidth="1" />
      </svg>
    </div>
  );
}
