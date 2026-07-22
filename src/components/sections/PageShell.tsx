import type { ReactNode } from "react";

/** Standard text-page frame: max ~1100px, top padding clears the fixed nav. */
export function PageShell({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-[1100px] px-4 pb-24 pt-24">
      {(eyebrow || title) && (
        <header className="mb-10 border-b border-border pb-6">
          {eyebrow && (
            <p className="mb-2 font-mono text-[13px] text-green">{`> ${eyebrow}`}</p>
          )}
          {title && (
            <h1 className="font-mono text-3xl font-semibold tracking-tight text-white">
              {title}
            </h1>
          )}
        </header>
      )}
      {children}
    </main>
  );
}
