"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export type SuggestionBarProps = {
  items: string[];
  onPick: (v: string) => void;
  className?: string;
};

/**
 * Muestra una única fila de sugerencias, centradas.
 * Renderiza SOLO las que entran completas (sin truncar ni scroll).
 * Añade animaciones Framer Motion: stagger al aparecer y micro‑interacciones.
 */
export function SuggestionBar({
  items,
  onPick,
  className,
}: SuggestionBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labRowRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  const chipClass =
    "inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm bg-background/70 hover:bg-muted/70 transition-colors whitespace-nowrap";

  const recalc = useCallback(() => {
    const container = containerRef.current;
    const labRow = labRowRef.current;
    if (!container || !labRow) return;

    const available = container.clientWidth;
    const gap = parseFloat(getComputedStyle(labRow).columnGap || "0") || 0;

    let used = 0;
    let count = 0;

    for (let i = 0; i < items.length; i++) {
      const el = measureRefs.current[i];
      if (!el) continue;
      const w = el.offsetWidth;
      const nextUsed = count === 0 ? w : used + gap + w;
      if (nextUsed <= available) {
        used = nextUsed;
        count++;
      } else break;
    }
    setVisibleCount(count);
  }, [items.length]);

  useEffect(() => {
    // primera medición
    requestAnimationFrame(recalc);

    const ro = new ResizeObserver(() => recalc());
    if (containerRef.current) ro.observe(containerRef.current);
    if (labRowRef.current) ro.observe(labRowRef.current);
    measureRefs.current.forEach((el) => el && ro.observe(el));

    return () => ro.disconnect();
  }, [recalc, items]);

  const setMeasureRef = useCallback(
    (index: number) =>
      (el: HTMLButtonElement | null): void => {
        measureRefs.current[index] = el;
      },
    []
  );

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  // Variants
  const list = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 6, scale: 0.98, filter: "blur(2px)" },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 220, damping: 18 },
    },
    exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } },
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto px-2", className)}>
      {/* Fila visible: centrada */}
      <motion.div
        ref={containerRef}
        className="flex flex-nowrap gap-2 overflow-hidden justify-center"
        role="listbox"
        aria-orientation="horizontal"
        variants={list}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence initial={false}>
          {visibleItems.map((text) => (
            <motion.button
              key={text}
              type="button"
              onClick={() => onPick(text)}
              className={chipClass}
              aria-label={text}
              variants={item}
              whileHover={{ y: -1, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              layout="position"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>{text}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Laboratorio oculto para medir anchos y gap exactos */}
      <div className="absolute -z-10 h-0 overflow-hidden opacity-0 pointer-events-none">
        <div ref={labRowRef} className="flex flex-nowrap gap-2">
          {items.map((text, i) => (
            <button
              key={`measure-${i}`}
              ref={setMeasureRef(i)}
              className={chipClass}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>{text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
