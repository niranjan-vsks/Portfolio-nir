"use client";
/* eslint-disable react-hooks/refs -- vendored CardItem forwards a
   ref to a dynamic element to drive its depth transform; correct at runtime,
   but the React Compiler ref-rule can't verify the dynamic tag. */

import {
  createContext,
  createElement,
  useState,
  useContext,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Real 3D card . Mouse-tracked perspective
 * tilt on the body; CardItems float at different translateZ depths on hover —
 * genuine 3D depth, NOT a flat rectangle (the round-1 defect). Reduced motion
 * holds it flat.
 */
const MouseEnterContext = createContext<[boolean, (b: boolean) => void] | undefined>(undefined);

export function CardContainer({
  children,
  className,
  containerClassName,
}: {
  children?: ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || reduced) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 22;
    const y = (e.clientY - top - height / 2) / 22;
    ref.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };
  const onMouseLeave = () => {
    if (!ref.current) return;
    setIsMouseEntered(false);
    ref.current.style.transform = "rotateY(0deg) rotateX(0deg)";
  };

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={cn("flex items-center justify-center", containerClassName)}
        style={{ perspective: "1200px" }}
      >
        <div
          ref={ref}
          onMouseEnter={() => setIsMouseEntered(true)}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className={cn(
            "relative flex items-center justify-center transition-all duration-200 ease-out [transform-style:preserve-3d]",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "h-96 w-96 [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardItem({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  [key: string]: unknown;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ctx = useContext(MouseEnterContext);
  const isMouseEntered = ctx?.[0] ?? false;

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.transform = isMouseEntered
      ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px)`
      : "translateX(0px) translateY(0px) translateZ(0px)";
  }, [isMouseEntered, translateX, translateY, translateZ]);

  return createElement(
    Tag,
    { ref, className: cn("w-fit transition duration-200 ease-out", className), ...rest },
    children,
  );
}
