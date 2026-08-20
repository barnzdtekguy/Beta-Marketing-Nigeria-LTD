'use client';

import { Logo } from '@/components/logo';
import { useAuthSubmit } from '@/components/auth-submit-context';

const SEATS = 6;

/**
 * Full-screen takeover shown while a form submitted via AuthSubmitButton is
 * in flight — the page hands off entirely to the brand mark (like Opay's or
 * Hostinger's login loading screen) until the server responds. The site
 * icon sits at the center as the "table", with small dots pulsing around it
 * in sequence to read as people gathering around it.
 */
export function SubmitOverlay({ label = 'Just a moment…' }: { label?: string }) {
  const { submitting } = useAuthSubmit();

  if (!submitting) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-ink animate-fade-in"
    >
      <GatherMark size={30} />
      <div className="text-center">
        <p className="font-display text-white text-lg tracking-tight">Beta Marketing</p>
        <p className="mt-1 text-sm text-white/50">{label}</p>
      </div>
    </div>
  );
}

function GatherMark({ size }: { size: number }) {
  const box = size * 3.6;
  const radius = size * 1.35;
  const seatSize = Math.max(6, size * 0.24);

  return (
    <div className="relative" style={{ width: box, height: box }}>
      <div
        className="absolute"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <Logo variant="icon" size={size} />
      </div>
      {Array.from({ length: SEATS }).map((_, i) => {
        const angle = (360 / SEATS) * i;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: seatSize,
              height: seatSize,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px)`,
              animation: 'gather-seat 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        );
      })}
    </div>
  );
}
