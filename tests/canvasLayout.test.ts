import { describe, it, expect } from "vitest";
import {
  CANVAS_GAP,
  CARD_DEFAULT_H,
  CARD_DEFAULT_W,
  CARD_MIN_H,
  CARD_MIN_W,
  canvasHeight,
  clampLayout,
  ensureLayouts,
  findFreeSlot,
  snapToGrid,
} from "../src/lib/canvasLayout";
import { ChartConfig } from "../src/types/dashboard";

const baseChart = (id: string, layout?: ChartConfig["layout"]): ChartConfig => ({
  id,
  title: id,
  type: "bar",
  tableName: "t",
  dimensionCol: "d",
  metricCol: "m",
  aggregation: "SUM",
  layout,
});

describe("canvasLayout", () => {
  it("ajusta a la cuadrícula de 10px y permite desactivar el snap", () => {
    expect(snapToGrid(14)).toBe(10);
    expect(snapToGrid(16)).toBe(20);
    expect(snapToGrid(14, false)).toBe(14);
  });

  it("clampLayout evita coordenadas negativas y tamaños menores al mínimo", () => {
    expect(clampLayout({ x: -50, y: -1, w: 10, h: 10 })).toEqual({
      x: 0,
      y: 0,
      w: CARD_MIN_W,
      h: CARD_MIN_H,
    });
  });

  it("findFreeSlot coloca la primera tarjeta en la esquina con margen y la segunda a su derecha", () => {
    const first = findFreeSlot([], 1200);
    expect(first).toMatchObject({ x: CANVAS_GAP, y: CANVAS_GAP });
    const second = findFreeSlot([first], 1200);
    expect(second.x).toBe(CANVAS_GAP + CARD_DEFAULT_W + CANVAS_GAP);
    expect(second.y).toBe(CANVAS_GAP);
  });

  it("findFreeSlot baja de fila cuando el ancho no alcanza para otra columna", () => {
    const first = findFreeSlot([], 500);
    const second = findFreeSlot([first], 500);
    expect(second.x).toBe(CANVAS_GAP);
    expect(second.y).toBe(CANVAS_GAP + CARD_DEFAULT_H + CANVAS_GAP);
  });

  it("findFreeSlot respeta tarjetas movidas manualmente (no se solapa)", () => {
    const moved = { x: CANVAS_GAP, y: CANVAS_GAP, w: 900, h: 300 };
    const slot = findFreeSlot([moved], 1200);
    const overlaps =
      slot.x < moved.x + moved.w &&
      slot.x + slot.w > moved.x &&
      slot.y < moved.y + moved.h &&
      slot.y + slot.h > moved.y;
    expect(overlaps).toBe(false);
  });

  it("ensureLayouts conserva las coordenadas guardadas y solo asigna las faltantes", () => {
    const saved = { x: 300, y: 40, w: 400, h: 260 };
    const out = ensureLayouts([baseChart("a", saved), baseChart("b")], 1200);
    expect(out[0].layout).toEqual(saved);
    expect(out[1].layout).toBeDefined();
    expect(out[1].layout).not.toEqual(saved);
  });

  it("ensureLayouts devuelve la misma referencia si todo tiene layout", () => {
    const charts = [baseChart("a", { x: 0, y: 0, w: 300, h: 300 })];
    expect(ensureLayouts(charts, 1000)).toBe(charts);
  });

  it("canvasHeight crece con la tarjeta más baja y respeta un mínimo", () => {
    expect(canvasHeight([], 600)).toBe(600);
    const tall = [baseChart("a", { x: 0, y: 900, w: 300, h: 400 })];
    expect(canvasHeight(tall, 600)).toBeGreaterThan(1300);
  });
});
