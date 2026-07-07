"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/ThreeDCard";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Landing photo card (PRD 9.2) on the real 3D card: photo floats forward on
 * hover (translateZ), balanced photo-to-text proportion. Summary toggles a
 * terminal summary in place; an ask_niranjan button opens the chatbot from the
 * card itself.
 */
export function Photo3DCard({
  name,
  title,
  summary,
  onAsk,
}: {
  name: string;
  title: string;
  summary: string;
  onAsk: () => void;
}) {
  const reduced = useReducedMotion();
  const [showSummary, setShowSummary] = useState(false);
  const [typed, setTyped] = useState("");
  const [photoOk, setPhotoOk] = useState(true);

  useEffect(() => {
    if (!showSummary) return;
    if (reduced) {
      setTyped(summary);
      return;
    }
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(summary.slice(0, i));
      if (i >= summary.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [showSummary, summary, reduced]);

  return (
    <CardContainer className="py-4">
      <CardBody className="h-auto w-[20rem] rounded-2xl border border-white/10 bg-[#0b0e0c]/90 p-5 shadow-2xl backdrop-blur-md transition-shadow duration-300 hover:shadow-emerald-500/10 sm:w-[22rem]">
        {/* media / summary */}
        <CardItem translateZ={90} className="w-full">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/10">
            {!showSummary ? (
              photoOk ? (
                <Image
                  src="/niranjan-photo.jpg"
                  alt="Niranjan VSKS"
                  fill
                  priority
                  sizes="352px"
                  className="object-cover"
                  onError={() => setPhotoOk(false)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green/10 to-cyan/10">
                  <span className="font-mono text-7xl text-green/70">N</span>
                </div>
              )
            ) : (
              <div className="h-full w-full bg-[#06080c] p-4">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
                <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-green">
                  {typed}
                  {!reduced && typed.length < summary.length && (
                    <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-green" />
                  )}
                </pre>
              </div>
            )}
          </div>
        </CardItem>

        <CardItem translateZ={50} as="h1" className="mt-4 text-xl font-semibold text-white">
          {name}
        </CardItem>
        <CardItem translateZ={40} as="p" className="mt-1 text-[13px] text-green">
          {title}
        </CardItem>

        <div className="mt-5 flex items-center gap-3">
          <CardItem
            translateZ={30}
            as="button"
            onClick={() => setShowSummary((s) => !s)}
            className="rounded-lg border border-white/15 px-3.5 py-1.5 text-[13px] text-text transition-colors hover:border-green/60 hover:text-green"
          >
            {showSummary ? "photo" : "summary"}
          </CardItem>
          <CardItem
            translateZ={30}
            as="button"
            onClick={onAsk}
            className="rounded-lg bg-green px-3.5 py-1.5 text-[13px] font-medium text-bg transition-transform hover:scale-[1.03] active:scale-95"
          >
            ask_niranjan
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
