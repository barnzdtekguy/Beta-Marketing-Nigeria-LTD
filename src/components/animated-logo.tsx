'use client';

import { Logo } from '@/components/logo';
import { useAuthSubmit } from '@/components/auth-submit-context';

const SEATS = 6;

/**
 * Drop-in replacement for <Logo> on auth pages: shows the normal mark until
 * the sign-in/sign-up form is submitted (via AuthSubmitProvider), then
 * swaps to a small "people gathering around a table" animation for the
 * duration of the request.
 */
export function AnimatedLogo({
  size = 26,
  href,
  className,
  dark = false,
}: {
  size?: number;
  href?: string;
  className?: string;
  /** Use light-on-dark colors when the mark sits on a dark panel. */
  dark?: boolean;
}) {
  const { submitting } = useAuthSubmit();

  if (!submitting) {
    return <Logo variant="icon" size={size} href={href} className={className} />;
  }

  const box = size * 2.6;
  const tableSize = size * 1.05;
  const radius = size * 1.05;
  const seatSize = Math.max(5, size * 0.26);
  const tableClass = dark ? 'border-2 border-white/50 bg-white/15' : 'border-2 border-brand/50 bg-brand-soft';
  const seatClass = dark ? 'bg-white' : 'bg-brand';

  return (
    <div
      role="status"
      aria-label="Working on it"
      className={className}
      style={{ width: box, height: box, position: 'relative', flexShrink: 0 }}
    >
      <div
        className={`absolute rounded-full ${tableClass}`}
        style={{
          width: tableSize,
          height: tableSize,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {Array.from({ length: SEATS }).map((_, i) => {
        const angle = (360 / SEATS) * i;
        return (
          <span
            key={i}
            className={`absolute rounded-full ${seatClass}`}
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
