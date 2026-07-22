"use client";

/**
 * Moving Border button . An animated border travels around
 * the button; on hover it lifts (glow + slight scale) so it reads interactive.
 * Used for System Design tag chips that route to a Mind Map node. Colors tuned
 * to the dark palette + green identity accent; the border-travel essence kept.
 */
export function MovingBorderButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex overflow-hidden rounded-full p-px transition-transform duration-200 hover:scale-[1.04] focus-visible:outline-none ${className}`}
    >
      {/* travelling border */}
      <span
        className="absolute inset-[-150%] motion-safe:animate-[spin_3.5s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0 70%, #4ade80 85%, #00e5ff 100%)",
        }}
        aria-hidden
      />
      <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-[#0a0f0d] px-3 py-1 font-mono text-[12px] text-green transition-colors group-hover:bg-[#0d1512] group-hover:text-white group-hover:shadow-[0_0_18px_-2px_rgba(74,222,128,0.6)]">
        {children}
      </span>
    </button>
  );
}
