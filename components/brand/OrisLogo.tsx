/** Marketing lockup: emblem + OrisTrade wordmark */
export function OrisLogoFull({ className = "" }: { className?: string }) {
  return (
    <img
      src="/brand/logo-full.png"
      alt="OrisTrade — Where Precision Meets Profit"
      width={280}
      height={78}
      className={`h-8 w-auto max-w-[min(280px,92vw)] object-contain object-left ${className}`}
      decoding="async"
    />
  );
}

/** Emblem only — collapsed sidebar, compact chrome */
export function OrisLogoMark({ className = "" }: { className?: string }) {
  return (
    <img
      src="/brand/mark.png"
      alt="OrisTrade"
      width={64}
      height={64}
      className={`h-8 w-8 object-contain ${className}`}
      decoding="async"
    />
  );
}
