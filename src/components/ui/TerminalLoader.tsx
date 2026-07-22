/** Terminal-styled Suspense fallback for lazy 3D scenes . */
export function TerminalLoader({ label = "initializing scene" }: { label?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg font-mono text-[13px] text-green">
      <span className="blink-cursor">{`> ${label} `}</span>
    </div>
  );
}
