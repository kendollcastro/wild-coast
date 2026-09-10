import Link from "next/link";

export function Wordmark({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-baseline gap-0.5">
      <span
        className={`font-display text-[1.35rem] font-extrabold tracking-tight lowercase ${
          light ? "text-white" : "text-ink"
        }`}
      >
        jacó
      </span>
      <span className="size-1.5 -translate-y-[2px] rounded-full bg-coral transition-transform duration-200 group-hover:scale-150" />
    </Link>
  );
}