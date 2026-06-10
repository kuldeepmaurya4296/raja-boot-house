import Link from "next/link";

export function Logo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/rbh-logo.png"
        alt="Raja Boot House"
        width={size}
        height={size}
        className="rounded-full bg-white object-contain p-1 shadow-sm border border-border/10 shrink-0"
        style={{ width: size, height: size }}
      />
      <span className="font-serif text-base font-bold tracking-tight text-foreground hidden sm:inline">
        Raja <span className="text-primary">Boot House</span>
      </span>
    </Link>
  );
}
