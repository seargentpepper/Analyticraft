import { CardLayout, ChartConfig } from "../types/dashboard";

export const GRID_SIZE = 10;
export const CARD_MIN_W = 260;
export const CARD_MIN_H = 200;
export const CARD_DEFAULT_W = 460;
export const CARD_DEFAULT_H = 340;
export const CANVAS_GAP = 16;
export const CANVAS_PADDING_BOTTOM = 120;

export function snapToGrid(value: number, enabled = true): number {
  return enabled ? Math.round(value / GRID_SIZE) * GRID_SIZE : Math.round(value);
}

/** Mantiene la tarjeta dentro del lienzo (>= 0) y respeta tamaños mínimos. */
export function clampLayout(layout: CardLayout): CardLayout {
  return {
    x: Math.max(0, Math.round(layout.x)),
    y: Math.max(0, Math.round(layout.y)),
    w: Math.max(CARD_MIN_W, Math.round(layout.w)),
    h: Math.max(CARD_MIN_H, Math.round(layout.h)),
  };
}

function intersects(a: CardLayout, b: CardLayout): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * Busca el primer hueco libre (izquierda→derecha, arriba→abajo) para una tarjeta nueva,
 * sin solaparse con las ya colocadas.
 */
export function findFreeSlot(existing: CardLayout[], canvasWidth: number): CardLayout {
  const stepX = CARD_DEFAULT_W + CANVAS_GAP;
  const stepY = CARD_DEFAULT_H + CANVAS_GAP;
  const cols = Math.max(1, Math.floor((canvasWidth - CANVAS_GAP) / stepX));
  for (let row = 0; row < 500; row++) {
    for (let col = 0; col < cols; col++) {
      const candidate: CardLayout = {
        x: CANVAS_GAP + col * stepX,
        y: CANVAS_GAP + row * stepY,
        w: CARD_DEFAULT_W,
        h: CARD_DEFAULT_H,
      };
      if (!existing.some((e) => intersects(candidate, e))) return candidate;
    }
  }
  return { x: CANVAS_GAP, y: CANVAS_GAP, w: CARD_DEFAULT_W, h: CARD_DEFAULT_H };
}

/**
 * Garantiza que todas las tarjetas tengan coordenadas (migra proyectos antiguos o tarjetas
 * recién creadas). Devuelve la misma referencia si no hay nada que asignar.
 */
export function ensureLayouts(charts: ChartConfig[], canvasWidth: number): ChartConfig[] {
  if (charts.every((c) => c.layout)) return charts;
  const placed: CardLayout[] = charts.filter((c) => c.layout).map((c) => c.layout as CardLayout);
  return charts.map((c) => {
    if (c.layout) return c;
    const slot = findFreeSlot(placed, canvasWidth);
    placed.push(slot);
    return { ...c, layout: slot };
  });
}

/** Alto mínimo que necesita el lienzo para contener todas las tarjetas + holgura para seguir arrastrando. */
export function canvasHeight(charts: ChartConfig[], minHeight = 600): number {
  const bottom = charts.reduce((max, c) => (c.layout ? Math.max(max, c.layout.y + c.layout.h) : max), 0);
  return Math.max(minHeight, bottom + CANVAS_PADDING_BOTTOM);
}

export function canvasWidthNeeded(charts: ChartConfig[]): number {
  return charts.reduce((max, c) => (c.layout ? Math.max(max, c.layout.x + c.layout.w + CANVAS_GAP) : max), 0);
}
