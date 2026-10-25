import type { ChartConfig } from "../types/dashboard";
import type { ThemeDef } from "./themes";

/**
 * Builds ECharts options as PLAIN JSON (no functions, no echarts.graphic classes)
 * so the very same option can be rendered in the Studio and embedded verbatim
 * in the standalone .html export.
 */

export type Row = Record<string, any>;

export const MAX_RINGS = 4;

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(n);

function linear(from: string, to: string) {
  return {
    type: "linear",
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  };
}

/** Fill for the i-th category/ring according to the theme mode. */
export function fillFor(theme: ThemeDef, i: number): any {
  if (theme.gradients && theme.gradients.length > 0) {
    const [a, b] = theme.gradients[i % theme.gradients.length];
    return linear(a, b);
  }
  if (theme.mode === "multi") {
    return theme.palette[i % theme.palette.length];
  }
  return linear(theme.palette[0], theme.palette[1]);
}

/** Solid accent color (KPI numbers, line strokes). */
export function accentColor(theme: ThemeDef, i = 0): string {
  if (theme.gradients && theme.gradients.length > 0) {
    return theme.gradients[i % theme.gradients.length][0];
  }
  return theme.palette[i % theme.palette.length];
}

export interface RingLegendItem {
  label: string;
  value: string;
  color: string;
}

export function ringRows(rows: Row[]): Row[] {
  return rows.slice(0, MAX_RINGS);
}

export function buildRingsLegend(rows: Row[], theme: ThemeDef): RingLegendItem[] {
  return ringRows(rows).map((r, i) => ({
    label: String(r.dimension ?? "N/A"),
    value: fmt(Number(r.metric) || 0),
    color: accentColor(theme, i),
  }));
}

function baseAxisStyle(theme: ThemeDef) {
  return {
    axisLabel: { color: theme.subtext, rotate: 25, fontWeight: "bold" },
    axisLine: { lineStyle: { color: theme.cardBorder } },
  };
}

export function buildChartOption(
  config: ChartConfig,
  rows: Row[],
  theme: ThemeDef
): Record<string, any> {
  const categories = rows.map((d) => String(d.dimension ?? "N/A"));
  const values = rows.map((d) => Number(d.metric) || 0);
  const seriesName = `${config.aggregation}(${config.metricCol})`;
  const showLegend = config.showLegend ?? false;

  const tooltip = {
    backgroundColor: "#1c1c1c",
    borderColor: theme.cardBorder,
    textStyle: { color: "#ffffff", fontWeight: 600, fontSize: 12 },
  };

  const legend = {
    show: showLegend,
    top: 0,
    textStyle: { color: theme.text, fontWeight: "bold" },
  };

  const cartesianGrid = {
    left: "10%",
    right: "6%",
    bottom: "24%",
    top: showLegend ? "18%" : "12%",
  };

  const valueAxis = {
    type: "value",
    splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
    axisLabel: { color: theme.subtext, fontWeight: "bold" },
  };

  if (config.type === "bar") {
    const r = theme.barRadius;
    return {
      textStyle: theme.fontFamily ? { fontFamily: theme.fontFamily } : undefined,
      legend,
      tooltip: { ...tooltip, trigger: "axis" },
      grid: cartesianGrid,
      xAxis: { type: "category", data: categories, ...baseAxisStyle(theme) },
      yAxis: valueAxis,
      series: [
        {
          name: seriesName,
          type: "bar",
          data: values.map((v, i) => ({
            value: v,
            itemStyle: { color: fillFor(theme, i), borderRadius: [r, r, 0, 0] },
          })),
        },
      ],
    };
  }

  if (config.type === "line" || config.type === "area") {
    const color = accentColor(theme, 0);
    return {
      textStyle: theme.fontFamily ? { fontFamily: theme.fontFamily } : undefined,
      legend,
      tooltip: { ...tooltip, trigger: "axis" },
      grid: cartesianGrid,
      xAxis: { type: "category", data: categories, ...baseAxisStyle(theme) },
      yAxis: valueAxis,
      series: [
        {
          name: seriesName,
          type: "line",
          smooth: true,
          data: values,
          itemStyle: { color },
          lineStyle: { width: 3, color },
          areaStyle:
            config.type === "area"
              ? { color: linear(color, "rgba(0,0,0,0)"), opacity: 0.55 }
              : undefined,
        },
      ],
    };
  }

  if (config.type === "pie") {
    return {
      textStyle: theme.fontFamily ? { fontFamily: theme.fontFamily } : undefined,
      legend,
      tooltip: { ...tooltip, trigger: "item" },
      series: [
        {
          name: seriesName,
          type: "pie",
          radius: ["38%", "72%"],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 3, borderColor: theme.cardBg, borderWidth: 2 },
          label: { show: false },
          data: rows.map((d, i) => {
            // Gradient-mode themes alternate their 2 hues and fade opacity so
            // every slice stays distinguishable.
            const single = theme.mode === "gradient";
            return {
              name: String(d.dimension ?? "N/A"),
              value: Number(d.metric) || 0,
              itemStyle: {
                color: single
                  ? theme.palette[i % 2]
                  : accentColor(theme, i),
                opacity: single ? Math.max(0.35, 1 - i * 0.07) : 1,
              },
            };
          }),
        },
      ],
    };
  }

  if (config.type === "rings") {
    // Concentric "activity rings": each ring is the category's value relative
    // to the largest one (largest = 100% = outermost ring).
    const top = ringRows(rows);
    const max = Math.max(...top.map((d) => Number(d.metric) || 0), 1);

    // Category axis draws index 0 at the center -> reverse so rank 1 is outermost.
    const ordered = top
      .map((d, rank) => ({ d, rank }))
      .reverse();

    return {
      textStyle: theme.fontFamily ? { fontFamily: theme.fontFamily } : undefined,
      tooltip: { ...tooltip, trigger: "item", formatter: "{b} ({c}%)" },
      polar: { radius: ["18%", "92%"], center: ["50%", "50%"] },
      angleAxis: {
        max: 100,
        show: false,
        startAngle: 90,
      },
      radiusAxis: {
        type: "category",
        show: false,
        data: ordered.map(
          ({ d }) => `${String(d.dimension ?? "N/A")}: ${fmt(Number(d.metric) || 0)}`
        ),
      },
      series: [
        {
          name: seriesName,
          type: "bar",
          coordinateSystem: "polar",
          roundCap: true,
          barCategoryGap: "28%",
          showBackground: true,
          backgroundStyle: { color: theme.track, borderRadius: 20 },
          data: ordered.map(({ d, rank }) => ({
            value: Math.round(((Number(d.metric) || 0) / max) * 1000) / 10,
            itemStyle: { color: fillFor(theme, rank) },
          })),
        },
      ],
    };
  }

  return {};
}
