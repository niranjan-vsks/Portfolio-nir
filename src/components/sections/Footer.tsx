import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg px-4 py-8 font-mono text-[11px] text-text-dim">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Niranjan VSKS · Senior Agentic AI Engineer</p>
        <div className="flex flex-wrap gap-4">
          <a href="mailto:niranjan.vsks@gmail.com" className="hover:text-green">
            email
          </a>
          <a
            href="https://www.linkedin.com/in/niranjanvsks"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green"
          >
            linkedin
          </a>
          <a
            href="https://github.com/niranjanvsks"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green"
          >
            github
          </a>
          <Link href="/NiranjanVSKS_FDE.pdf" target="_blank" className="hover:text-green">
            résumé
          </Link>
        </div>
      </div>
    </footer>
  );
}
