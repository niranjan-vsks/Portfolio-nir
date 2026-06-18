import { cn } from "@/lib/utils";

/**
 * Renders pre-sanitized markdown HTML produced by the content loader
 * (bullseye/07). Content is authored in-repo, so it is trusted.
 */
export function Markdown({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn("prose-nir", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
