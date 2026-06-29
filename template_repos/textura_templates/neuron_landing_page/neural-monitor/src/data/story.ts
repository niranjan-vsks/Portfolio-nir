/**
 * Brain Story — chapter content. The scroll narrative renders one panel per
 * entry here (in order), and each index lines up with the camera/focus keyframe
 * at the same index in `src/components/brain/story/story-keyframes.ts`.
 *
 * `kind`:
 *   - `"brain"`    — a narrative panel framing the live particle brain.
 *   - `"takeover"` — a full-screen procedural visual that hides the brain, then
 *                    reveals it again (see `components/story/takeover.tsx`).
 *
 * NOTE: the copy below is DRAFT placeholder text — replace `eyebrow` / `title` /
 * `body` with the final script. Structure, ids and `kind` should stay stable so
 * the camera keyframes remain aligned.
 */
export type StorySectionKind = "brain" | "takeover";

export interface StorySectionData {
  /** Stable id (used as the scroll anchor + React key). */
  id: string;
  kind: StorySectionKind;
  /** Short terminal kicker above the title (rendered with a `›` prompt). */
  eyebrow: string;
  /** The chapter headline — animated in with the text engine. */
  title: string;
  /** Supporting paragraph. */
  body: string;
  /** Optional readout chips shown in the scan frame (label/value pairs). */
  readouts?: { label: string; value: string }[];
  /** Copy alignment. Defaults to the alternating side; `"center"` for the finale. */
  align?: "left" | "right" | "center";
  /** Optional call-to-action button (finale). Clicking it scrolls back to the top. */
  cta?: { label: string };
}

export const STORY_SECTIONS: StorySectionData[] = [
  {
    id: "arrival",
    kind: "brain",
    eyebrow: "Arrival",
    title: "Eighty-six billion neurons, one quiet field.", // TODO: replace copy
    body:
      "A specimen resolves out of the dark. The scan holds it steady while the system maps its surface, point by point — the most complex object we have ever tried to understand.", // TODO: replace copy
    readouts: [
      { label: "specimen", value: "HUMAN · CEREBRUM" },
      { label: "status", value: "MAPPING" },
    ],
  },
  {
    id: "cortex",
    kind: "brain",
    eyebrow: "The Cortex",
    title: "The folded sheet where thought happens.", // TODO: replace copy
    body:
      "Two millimetres thick, crushed into ridges and valleys to fit. The system pushes in on the cortical surface — every fold buys more thinking room without a larger skull.", // TODO: replace copy
    readouts: [
      { label: "region", value: "FRONTAL CORTEX" },
      { label: "depth", value: "2.0 mm" },
    ],
  },
  {
    id: "signals",
    kind: "takeover",
    eyebrow: "Signals",
    title: "Everything you are, travelling as electricity.", // TODO: replace copy
    body:
      "Step inside the traffic. Each pulse is a thought in transit — chemical to electric and back, a hundred metres a second, never still.", // TODO: replace copy
    readouts: [
      { label: "rate", value: "4.21 M/s" },
      { label: "channel", value: "AXONAL" },
    ],
  },
  {
    id: "network",
    kind: "brain",
    eyebrow: "The Network",
    title: "No neuron thinks alone.", // TODO: replace copy
    body:
      "Trillions of connections wire the regions into one system. The scan isolates the temporal flank and watches it bind to the rest — meaning lives in the links, not the nodes.", // TODO: replace copy
    readouts: [
      { label: "region", value: "TEMPORAL · ASSOC." },
      { label: "links", value: "1.0e14" },
    ],
  },
  {
    id: "vision",
    kind: "brain",
    eyebrow: "Vision",
    title: "The world arrives at the back of your head.", // TODO: replace copy
    body:
      "The scan swings behind the brain to the occipital pole — where light becomes shape, motion, and depth long before you know you are seeing.", // TODO: replace copy
    readouts: [
      { label: "region", value: "OCCIPITAL LOBE" },
      { label: "channel", value: "VISUAL · V1" },
    ],
  },
  {
    id: "balance",
    kind: "brain",
    eyebrow: "Balance",
    title: "The quiet half that keeps you upright.", // TODO: replace copy
    body:
      "Tucked beneath and behind, the cerebellum holds a tenth of the mass and over half the neurons — timing, balance, and every movement you never think about.", // TODO: replace copy
    readouts: [
      { label: "region", value: "CEREBELLUM" },
      { label: "neurons", value: "69 B" },
    ],
  },
  {
    id: "whole",
    kind: "brain",
    eyebrow: "The Whole",
    title: "Then it becomes the network it always was.", // TODO: replace copy
    body:
      "The surface lets go and the points scatter into constellation — the brain resolving into the living web of signal it has been all along. End of scan.", // TODO: replace copy
    readouts: [
      { label: "coherence", value: "98.4%" },
      { label: "scan", value: "COMPLETE" },
    ],
    align: "center",
    cta: { label: "Begin again" },
  },
];

/** The index of the takeover chapter (the one that hides the brain). */
export const TAKEOVER_INDEX = STORY_SECTIONS.findIndex((s) => s.kind === "takeover");
