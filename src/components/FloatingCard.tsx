import React, { useRef, useState } from "react";
import { CardLayout } from "../types/dashboard";
import { clampLayout, snapToGrid, CARD_MIN_W, CARD_MIN_H } from "../lib/canvasLayout";

type InteractionMode = "move" | "e" | "s" | "se";

interface FloatingCardProps {
  layout: CardLayout;
  zIndex: number;
  isSelected: boolean;
  /** Se invoca una sola vez al soltar, con las coordenadas finales (ya ajustadas a la cuadrícula). */
  onCommit: (layout: CardLayout) => void;
  /** Se invoca al iniciar un arrastre/redimensionado real (útil para registrar snapshot de Undo). */
  onInteractionStart?: () => void;
  children: React.ReactNode;
}

interface Session {
  mode: InteractionMode;
  startX: number;
  startY: number;
  origin: CardLayout;
  moved: boolean;
}

const DRAG_THRESHOLD_PX = 3;
const NON_DRAG_TARGETS = "button, input, select, textarea, a, label";

/**
 * Contenedor flotante del lienzo libre: posiciona la tarjeta en coordenadas absolutas.
 * - Arrastre: desde la cabecera de la tarjeta (`.chart-card-header`).
 * - Redimensionado: tiradores en borde derecho, inferior y esquina.
 * - Alt mantiene el movimiento sin ajuste a cuadrícula.
 * Durante la interacción solo este componente se re-renderiza; el contenido (ChartCard)
 * no vuelve a consultar DuckDB hasta que se confirma la posición final.
 */
export const FloatingCard: React.FC<FloatingCardProps> = ({
  layout,
  zIndex,
  isSelected,
  onCommit,
  onInteractionStart,
  children,
}) => {
  const [live, setLive] = useState<CardLayout | null>(null);
  const liveRef = useRef<CardLayout | null>(null);
  const sessionRef = useRef<Session | null>(null);

  const compute = (session: Session, clientX: number, clientY: number, snap: boolean): CardLayout => {
    const dx = clientX - session.startX;
    const dy = clientY - session.startY;
    const o = session.origin;
    let next: CardLayout = { ...o };
    if (session.mode === "move") {
      next.x = snapToGrid(o.x + dx, snap);
      next.y = snapToGrid(o.y + dy, snap);
    } else {
      if (session.mode === "e" || session.mode === "se") {
        next.w = Math.max(CARD_MIN_W, snapToGrid(o.w + dx, snap));
      }
      if (session.mode === "s" || session.mode === "se") {
        next.h = Math.max(CARD_MIN_H, snapToGrid(o.h + dy, snap));
      }
    }
    return clampLayout(next);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    let mode: InteractionMode | null = null;

    const resize = target.dataset?.resize as InteractionMode | undefined;
    if (resize) {
      mode = resize;
    } else if (target.closest(".chart-card-header") && !target.closest(NON_DRAG_TARGETS)) {
      mode = "move";
    }
    if (!mode) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    sessionRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origin: layout,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = sessionRef.current;
    if (!session) return;
    if (
      !session.moved &&
      Math.abs(e.clientX - session.startX) < DRAG_THRESHOLD_PX &&
      Math.abs(e.clientY - session.startY) < DRAG_THRESHOLD_PX
    ) {
      return;
    }
    if (!session.moved) {
      session.moved = true;
      onInteractionStart?.();
    }
    const next = compute(session, e.clientX, e.clientY, !e.altKey);
    liveRef.current = next;
    setLive(next);
  };

  const finish = (e: React.PointerEvent<HTMLDivElement>) => {
    const session = sessionRef.current;
    if (!session) return;
    sessionRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const final = liveRef.current;
    liveRef.current = null;
    setLive(null);
    if (session.moved && final) onCommit(final);
  };

  const eff = live ?? layout;

  return (
    <div
      className={`floating-card ${isSelected ? "selected" : ""} ${live ? "interacting" : ""}`}
      style={{
        left: eff.x,
        top: eff.y,
        width: eff.w,
        height: eff.h,
        zIndex: live ? 1000 : zIndex,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      {children}
      <div className="floating-resize-handle e" data-resize="e" title="Arrastra para cambiar el ancho" />
      <div className="floating-resize-handle s" data-resize="s" title="Arrastra para cambiar el alto" />
      <div className="floating-resize-handle se" data-resize="se" title="Arrastra para redimensionar" />
    </div>
  );
};
