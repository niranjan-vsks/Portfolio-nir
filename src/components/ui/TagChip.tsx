import Link from "next/link";

/**
 * Tag chip (PRD 12.4): every tag on project/system-design pages routes to the
 * Mind Map and deep-links the matching node (`/map?node=<id>`), where R3 zooms
 * + focuses it and highlights its edges. Premium hover (green glow). Never a
 * dead chip.
 */
export function TagChip({ label, node }: { label: string; node: string }) {
  return (
    <Link
      href={`/map?node=${encodeURIComponent(node)}`}
      className="group inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 font-mono text-[12px] text-text-dim transition-all duration-200 hover:-translate-y-px hover:border-green/60 hover:text-green hover:shadow-[0_0_16px_-4px_rgba(74,222,128,0.6)]"
    >
      {label}
      <span className="text-green opacity-0 transition-opacity group-hover:opacity-100">↗</span>
    </Link>
  );
}
