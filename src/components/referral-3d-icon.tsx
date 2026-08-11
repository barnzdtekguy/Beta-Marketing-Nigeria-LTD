/**
 * A stylised "3D" referral network graphic: a central sphere (you) linked
 * to three orbiting spheres (the people you refer), each shaded with a
 * radial gradient + drop shadow to read as a solid 3D object rather than
 * a flat icon. Pure SVG — no external image, so it never breaks or needs
 * licensing, and it scales crisply at any size.
 */
export function Referral3DIcon({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-float ${className}`}>
      <svg viewBox="0 0 420 420" className="w-full h-full" role="img" aria-label="Referral network illustration">
        <defs>
          <radialGradient id="sphereMain" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FF6B6E" />
            <stop offset="45%" stopColor="#EB3137" />
            <stop offset="100%" stopColor="#9B1418" />
          </radialGradient>
          <radialGradient id="sphereSmall" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F3EFED" />
            <stop offset="100%" stopColor="#C9C2BF" />
          </radialGradient>
          <linearGradient id="linkLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EB3137" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EB3137" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EB3137" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#EB3137" stopOpacity="0" />
          </radialGradient>
          <filter id="softShadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000000" floodOpacity="0.35" />
          </filter>
          <filter id="tinyShadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Ambient glow behind everything */}
        <circle cx="210" cy="210" r="200" fill="url(#haloGlow)" />

        {/* Connector lines from center to each satellite, drawn first so spheres sit on top */}
        <line x1="210" y1="210" x2="90" y2="120" stroke="url(#linkLine)" strokeWidth="3" strokeLinecap="round" />
        <line x1="210" y1="210" x2="335" y2="95" stroke="url(#linkLine)" strokeWidth="3" strokeLinecap="round" />
        <line x1="210" y1="210" x2="320" y2="300" stroke="url(#linkLine)" strokeWidth="3" strokeLinecap="round" />

        {/* Small orbiting particles for extra "network" texture */}
        <circle cx="150" cy="165" r="3" fill="#EB3137" fillOpacity="0.6" />
        <circle cx="270" cy="150" r="4" fill="#EB3137" fillOpacity="0.5" />
        <circle cx="270" cy="260" r="3" fill="#EB3137" fillOpacity="0.55" />

        {/* Satellite sphere 1 (top-left) */}
        <g filter="url(#tinyShadow)">
          <circle cx="90" cy="120" r="34" fill="url(#sphereSmall)" />
          <circle cx="78" cy="108" r="10" fill="#FFFFFF" fillOpacity="0.55" />
        </g>

        {/* Satellite sphere 2 (top-right) */}
        <g filter="url(#tinyShadow)">
          <circle cx="335" cy="95" r="28" fill="url(#sphereSmall)" />
          <circle cx="325" cy="85" r="8" fill="#FFFFFF" fillOpacity="0.55" />
        </g>

        {/* Satellite sphere 3 (bottom-right) */}
        <g filter="url(#tinyShadow)">
          <circle cx="320" cy="300" r="30" fill="url(#sphereSmall)" />
          <circle cx="309" cy="289" r="9" fill="#FFFFFF" fillOpacity="0.55" />
        </g>

        {/* Central sphere — the largest, representing the realtor at the center of their network */}
        <g filter="url(#softShadow)">
          <circle cx="210" cy="210" r="78" fill="url(#sphereMain)" />
          <circle cx="186" cy="184" r="22" fill="#FFFFFF" fillOpacity="0.35" />
          <path
            d="M210 175a35 35 0 100 70 35 35 0 000-70z"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}
