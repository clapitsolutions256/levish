"use client";

import { useEffect, useRef, useState, type ReactNode, type TouchEvent, type TransitionEvent } from "react";
import Image from "next/image";

export function SwipeGallery({
  photos,
  active,
  onIndex,
  alt,
  imageClassName,
  sizes,
  priority = false,
  className,
  onLoad,
  children,
}: {
  photos: string[];
  active: number;
  onIndex: (index: number) => void;
  alt: string;
  imageClassName: string;
  sizes: string;
  priority?: boolean;
  className: string;
  onLoad?: (image: HTMLImageElement) => void;
  children?: ReactNode;
}) {
  const container = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"x" | "y" | null>(null);
  const pending = useRef<number | null>(null);
  const [shown, setShown] = useState(active);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [animate, setAnimate] = useState(true);
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const count = photos.length;
  const current = photos[shown] ?? photos[0];
  const previous = count > 1 ? photos[(shown - 1 + count) % count] : "";
  const next = count > 1 ? photos[(shown + 1) % count] : "";

  useEffect(() => {
    if (pending.current != null) return;
    setShown(active);
    setOffset(0);
  }, [active, photos]);

  useEffect(() => {
    if (animate) return;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  function finish(direction: number) {
    if (count < 2) return;
    const index = (shownRef.current + direction + count) % count;
    pending.current = null;
    setAnimate(false);
    setOffset(0);
    setShown(index);
    onIndex(index);
  }

  function onTouchStart(event: TouchEvent) {
    if (count < 2 || pending.current != null) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    start.current = { x: touch.clientX, y: touch.clientY };
    axis.current = null;
    setDragging(true);
  }

  function onTouchMove(event: TouchEvent) {
    const origin = start.current;
    const touch = event.changedTouches[0];
    if (!origin || !touch || axis.current === "y") return;
    const dx = touch.clientX - origin.x;
    const dy = touch.clientY - origin.y;
    if (!axis.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (axis.current === "y") return;
    }
    setOffset(dx);
  }

  function onTouchEnd(event: TouchEvent) {
    const origin = start.current;
    start.current = null;
    const horizontal = axis.current === "x";
    axis.current = null;
    setDragging(false);
    if (!origin || !horizontal || count < 2) {
      setOffset(0);
      return;
    }
    const touch = event.changedTouches[0];
    const dx = touch ? touch.clientX - origin.x : 0;
    const width = container.current?.getBoundingClientRect().width ?? 1;
    const passed = Math.abs(dx) > Math.max(48, width * 0.18);
    if (!passed) {
      setOffset(0);
      return;
    }
    const direction = dx < 0 ? 1 : -1;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      finish(direction);
      return;
    }
    pending.current = direction;
    setOffset(direction === 1 ? -width : width);
  }

  function onTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
    if (pending.current == null) return;
    finish(pending.current);
  }

  return (
    <div
      ref={container}
      className={`relative touch-pan-y overflow-hidden ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        className="absolute inset-0"
        onTransitionEnd={onTransitionEnd}
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          transition: dragging || !animate ? "none" : "transform 320ms cubic-bezier(0.22, 0.8, 0.3, 1)",
        }}
      >
        {previous ? (
          <div className="absolute inset-0" style={{ transform: "translateX(-100%)" }}>
            <Image src={previous} alt="" fill className={imageClassName} sizes={sizes} />
          </div>
        ) : null}
        {current ? (
          <Image
            src={current}
            alt={alt}
            fill
            priority={priority}
            className={imageClassName}
            sizes={sizes}
            onLoad={(event) => onLoad?.(event.currentTarget)}
          />
        ) : null}
        {next ? (
          <div className="absolute inset-0" style={{ transform: "translateX(100%)" }}>
            <Image src={next} alt="" fill className={imageClassName} sizes={sizes} />
          </div>
        ) : null}
      </div>
      {count > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center md:hidden" aria-hidden>
          <div className="flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-sm">
            {photos.map((photo, index) => (
              <span
                key={`${photo}-${index}`}
                className={`h-1.5 rounded-full bg-white transition-all duration-300 ${index === shown ? "w-4" : "w-1.5 opacity-60"}`}
              />
            ))}
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
