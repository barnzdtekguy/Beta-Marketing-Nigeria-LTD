import Image from 'next/image';

export function Logo({
  variant = 'icon',
  size = 28,
  className,
}: {
  variant?: 'icon' | 'full';
  size?: number;
  className?: string;
}) {
  if (variant === 'full') {
    // Full lockup is taller than wide (432x464) — width follows from size.
    const width = Math.round(size * (432 / 464));
    return (
      <Image
        src="/logo-full.png"
        alt="Beta Marketing Nigeria Limited"
        width={width}
        height={size}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src="/logo-icon.png"
      alt="Beta Marketing"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
