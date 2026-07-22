import Link from "next/link";
import { getAllProjects } from "@/lib/content";

/**
 * Footer  — the full sitemap. The Work column is derived from the
 * content loader, so every project (current and future) shows up automatically
 * with no second place to update. Static sections are listed explicitly.
 */
interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const STATIC_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Mind Map", href: "/map" },
      { label: "System Design", href: "/system-design" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Guide", href: "/guide" },
    ],
  },
  {
    title: "Profile",
    links: [
      { label: "About", href: "/about" },
      { label: "Experience", href: "/experience" },
      { label: "Forward Deployed Engineering", href: "/forward-deployed" },
      { label: "Skills", href: "/skills" },
      { label: "Certifications", href: "/certifications" },
      { label: "Education", href: "/education" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "ask_niranjan", href: "/chat" },
      { label: "Contact", href: "/contact" },
      { label: "GitHub", href: "https://github.com/niranjan-vsks", external: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/niranjanvsks", external: true },
      { label: "Résumé (PDF)", href: "/Niranjan_VSKS_FDE_RN.pdf", external: true },
    ],
  },
];

export function Footer() {
  // Work column: every project, straight from the content loader (auto-updates).
  const workLinks: FooterLink[] = [
    { label: "All Projects", href: "/projects" },
    ...getAllProjects().map((p) => ({
      label: (p.frontmatter.public_name ?? p.frontmatter.title) as string,
      href: `/projects/${p.frontmatter.slug ?? p.slug}`,
    })),
  ];
  const columns = [
    STATIC_COLUMNS[0],
    { title: "Work", links: workLinks },
    STATIC_COLUMNS[1],
    STATIC_COLUMNS[2],
  ];

  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 bg-[#080a09]">
      <div className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-green/40 bg-green/10 font-mono text-green">N</span>
              <span className="font-semibold text-white">Niranjan VSKS</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-text-dim">
              Senior Agentic AI Engineer, Forward Deployed. Ships production agentic and RAG systems into enterprise environments end to end.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-green">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[14px] text-text-dim transition-colors hover:text-white">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-[14px] text-text-dim transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-[13px] text-text-dim sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Niranjan VSKS. Built end to end.</span>
          <span>Remote-first, available to work with teams globally.</span>
        </div>
      </div>
    </footer>
  );
}
