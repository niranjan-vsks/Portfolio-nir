import { CubeLoaderScreen } from "@/components/ui/CubeLoaderScreen";

/**
 * Root route-transition fallback. App Router renders this while a navigated
 * segment is still loading, then unmounts it — so on a fast/cached navigation
 * it just flashes by, and on a slow network or server it holds the cube loader
 * visibly. No artificial delay is added here; the only deliberate wait is the
 * first-ever landing visit (see the landing first-visit gate).
 */
export default function Loading() {
  return <CubeLoaderScreen />;
}
