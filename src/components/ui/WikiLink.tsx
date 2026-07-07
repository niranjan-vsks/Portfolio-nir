import Link from "next/link";

/**
 * Wikipedia-style inline hyperlink (PRD 11.1): a distinct link color inside
 * prose with a hover caption dialog ("Click here to explore ..."). Routes to a
 * project page, section anchor, or Mind Map node.
 */
export function WikiLink({
  href,
  children,
  caption = "Click to explore in detail",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  caption?: string;
  external?: boolean;
}) {
  return (
    <span className="group/wiki relative inline-block">
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="font-medium text-cyan-300 underline decoration-cyan-300/40 decoration-dotted underline-offset-2 transition-colors hover:text-cyan-200 hover:decoration-cyan-200"
      >
        {children}
      </Link>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-cyan-300/30 bg-[#0a0f14] px-2.5 py-1 text-[11px] font-normal text-cyan-100 shadow-lg group-hover/wiki:block">
        {caption}
        <span className="absolute left-1/2 top-full h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-cyan-300/30 bg-[#0a0f14]" />
      </span>
    </span>
  );
}
