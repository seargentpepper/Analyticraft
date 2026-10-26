import { describe, it, expect } from "vitest";
import {
  accentColor,
  fillFor,
  ringRows,
  buildChartOption,
  buildRingsLegend,
  MAX_RINGS,
} from "../src/lib/chartOptions";
import { THEMES } from "../src/lib/themes";
import { ChartConfig } from "../src/types/dashboard";

describe("Generador de Opciones ECharts (chartOptions.ts)", () => {
  const corporate = THEMES.corporate;
  const vibrant = THEMES.vibrant;
  const fitness = THEMES.fitness;
  const iworkPastel = THEMES["iwork-pastel"];

  it("accentColor debe retornar colores coherentes según el tema", () => {
    expect(accentColor(corporate, 0)).toBe(corporate.palette[0]);
    expect(accentColor(vibrant, 1)).toBe(vibrant.palette[1]);
    expect(accentColor(fitness, 0)).toBe(fitness.gradients![0][0]);
  });

  it("fillFor debe soportar gradientes lineales y modos multicolor", () => {
    const fillCorp = fillFor(corporate, 0);
    expect(fillCorp.type).toBe("linear");

    const fillFit = fillFor(fitness, 0);
    expect(fillFit.type).toBe("linear");

    const fillMulti = fillFor(iworkPastel, 1);
    expect(typeof fillMulti).toBe("string");
    expect(fillMulti).toBe(iworkPastel.palette[1]);
  });

  it("ringRows debe limitar la cantidad de anillos a MAX_RINGS (4)", () => {
    const manyRows = [
      { dimension: "A", metric: 10 },
      { dimension: "B", metric: 20 },
      { dimension: "C", metric: 30 },
      { dimension: "D", metric: 40 },
      { dimension: "E", metric: 50 },
      { dimension: "F", metric: 60 },
    ];

    const trimmed = ringRows(manyRows);
    expect(trimmed).toHaveLength(MAX_RINGS);
    expect(trimmed[0].dimension).toBe("A");
    expect(trimmed[3].dimension).toBe("D");
  });

  it("buildRingsLegend debe generar los ítems de leyenda con etiquetas y valores formateados", () => {
    const rows = [
      { dimension: "Movimiento", metric: 450 },
      { dimension: "Ejercicio", metric: 30 },
    ];

    const legend = buildRingsLegend(rows, fitness);
    expect(legend).toHaveLength(2);
    expect(legend[0].label).toBe("Movimiento");
    expect(legend[0].value).toBe("450");
    expect(legend[0].color).toBe(fitness.gradients![0][0]);
  });

  it("buildChartOption debe generar opciones ECharts válidas para gráficos de barras", () => {
    const config: ChartConfig = {
      id: "bar-1",
      title: "Ventas Mensuales",
      type: "bar",
      aggregation: "SUM",
      metricCol: "Total",
      dimensionCol: "Mes",
      showLegend: true,
      tableName: "Sales",
    };

    const rows = [
      { dimension: "Enero", metric: 100 },
      { dimension: "Febrero", metric: 200 },
    ];

    const option = buildChartOption(config, rows, corporate);

    expect(option).toBeDefined();
    expect(option.xAxis.data).toEqual(["Enero", "Febrero"]);
    expect(option.yAxis.type).toBe("value");
    expect(option.series).toHaveLength(1);
    expect(option.series[0].type).toBe("bar");
    expect(option.series[0].data).toEqual([
      expect.objectContaining({ value: 100 }),
      expect.objectContaining({ value: 200 }),
    ]);
  });

  it("buildChartOption debe generar opciones ECharts válidas para donas y tortas", () => {
    const config: ChartConfig = {
      id: "pie-1",
      title: "Participación de Mercado",
      type: "pie",
      aggregation: "COUNT",
      metricCol: "ClienteID",
      dimensionCol: "Categoria",
      tableName: "Customers",
    };

    const rows = [
      { dimension: "Retail", metric: 50 },
      { dimension: "Mayorista", metric: 25 },
    ];

    const option = buildChartOption(config, rows, vibrant);

    expect(option).toBeDefined();
    expect(option.series[0].type).toBe("pie");
    expect(option.series[0].data).toEqual([
      { name: "Retail", value: 50, itemStyle: expect.any(Object) },
      { name: "Mayorista", value: 25, itemStyle: expect.any(Object) },
    ]);
  });
});
