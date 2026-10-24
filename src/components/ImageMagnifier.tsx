"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

const LENS = 190;
const ZOOM = 2.5;

type Box = { x: number; y: number; w: number; h: number };

// Area the photo covers inside the frame when drawn with object-contain.
function containBox(frameW: number, frameH: number, natural: { w: number; h: number } | null): Box {
  if (!natural || !natural.w || !natural.h) return { x: 0, y: 0, w: frameW, h: frameH };
  const scale = Math.min(frameW / natural.w, frameH / natural.h);
  const w = natural.w * scale;
  const h = natural.h * scale;
  return { x: (frameW - w) / 2, y: (frameH - h) / 2, w, h };
}

export function ImageMagnifier({ src }: { src: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [lens, setLens] = useState<{ x: number; y: number; box: Box } | null>(null);

  useEffect(() => {
    setNatural(null);
    setLens(null);
    if (!src) return;
    const img = new window.Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const box = containBox(rect.width, rect.height, natural);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const inside = x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
    setLens(inside ? { x, y, box } : null);
  }

  return (
    <div
      ref={frame}
      className={`absolute inset-0 z-[5] hidden [@media(hover:hover)_and_(pointer:fine)]:block ${lens ? "cursor-none" : "cursor-zoom-in"}`}
      onMouseMove={onMove}
      onMouseLeave={() => setLens(null)}
      aria-hidden="true"
    >
      {lens ? (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white bg-white bg-no-repeat shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-black/10"
          style={{
            width: LENS,
            height: LENS,
            left: lens.x - LENS / 2,
            top: lens.y - LENS / 2,
            backgroundImage: `url("${src}")`,
            backgroundSize: `${lens.box.w * ZOOM}px ${lens.box.h * ZOOM}px`,
            backgroundPosition: `${-((lens.x - lens.box.x) * ZOOM - LENS / 2)}px ${-((lens.y - lens.box.y) * ZOOM - LENS / 2)}px`,
          }}
        />
      ) : (
        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#4a142a] shadow-sm">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" strokeWidth={1.8} />
            <path strokeLinecap="round" strokeWidth={1.8} d="M20 20l-3.5-3.5M11 8v6M8 11h6" />
          </svg>
          Hover to zoom
        </span>
      )}
    </div>
  );
}
