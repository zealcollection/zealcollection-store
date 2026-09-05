import { useEffect, useRef, useState } from "react";

// ------------------------------------------------------------------
// CUSTOM CURSOR - gold ring + glowing dot that follows the pointer.
// Mounted once in Layout.jsx; expands over links/buttons/inputs.
// Touch devices are excluded automatically (hover events never fire).
// ------------------------------------------------------------------
export default function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const ringEl = ringRef.current;
    const dotEl = dotRef.current;
    if (!ringEl || !dotEl) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      dotEl.style.left = `${pos.current.x}px`;
      dotEl.style.top = `${pos.current.y}px`;
    };

    // Ring trails the pointer smoothly with a lerp loop.
    let rafId;
    const tick = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.16;
      ring.current.y += (pos.current.y - ring.current.y) * 0.16;
      ringEl.style.left = `${ring.current.x}px`;
      ringEl.style.top = `${ring.current.y}px`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // Expand the ring when hovering interactive elements.
    const onOver = (e) => {
      const t = e.target.closest("a, button, input, textarea, [data-cursor-hover]");
      if (t) setHovering(true);
    };
    const onOut = (e) => {
      const t = e.target.closest("a, button, input, textarea, [data-cursor-hover]");
      if (t) setHovering(false);
    };

    const onLeave = () => {
      dotEl.style.display = "none";
      ringEl.style.display = "none";
    };
    const onEnter = () => {
      dotEl.style.display = "";
      ringEl.style.display = "";
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.body.classList.add("cursor-enabled");

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.body.classList.remove("cursor-enabled");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className={`cursor-ring ${hovering ? "cursor-hover" : ""}`} />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}
