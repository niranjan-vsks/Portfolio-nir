/**
 * Identity mark — stands in wherever a portrait would go (landing avatar, chat
 * avatars). Deliberately one component rather than a photo path repeated in
 * several files: when a real portrait is ready, swapping it in here updates
 * every surface at once.
 *
 * Green-only by palette rule (green is the identity lane; cyan/blue belong to
 * the 3D scenes), and monospaced to match the footer's monogram, so the site
 * reads as one mark instead of a different treatment per surface.
 */
export function AvatarMark({
  size = 34,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`grid shrink-0 select-none place-items-center rounded-full border border-green/40 bg-green/10 font-mono font-semibold leading-none text-green ${className}`}
      style={{
        width: size,
        height: size,
        // keep the glyph optically centred and legible from 30px up to 56px
        fontSize: Math.max(11, Math.round(size * 0.42)),
      }}
    >
      N
    </div>
  );
}
