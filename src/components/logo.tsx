import Image from 'next/image';
import Link from 'next/link';

export function Logo({
  variant = 'icon',
  size = 28,
  className,
  href,
}: {
  variant?: 'icon' | 'full';
  size?: number;
  className?: string;
  /** When set, wraps the mark in a link (e.g. "/" to get back to the landing page). Omit inside the dashboard, where the logo shouldn't navigate away. */
  href?: string;
}) {
  const image =
    variant === 'full' ? (
      // Full lockup is taller than wide (432x464) — width follows from size.
      <Image
        src="/logo-full.png"
        alt="Beta Marketing Nigeria Limited"
        width={Math.round(size * (432 / 464))}
        height={size}
        className={className}
        priority
      />
    ) : (
      <Image
        src="/logo-icon.png"
        alt="Beta Marketing"
        width={size}
        height={size}
        className={className}
        priority
      />
    );

  if (!href) return image;

  return (
    <Link href={href} aria-label="Go to homepage">
      {image}
    </Link>
  );
}
