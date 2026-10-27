import { describe, it, expect } from "vitest";
import {
  escapeSqlIdent,
  escapeSqlString,
  isNumericString,
  buildFilterCondition,
  buildChartSQL,
} from "../src/lib/queryBuilder";
import { ChartConfig } from "../src/types/dashboard";

describe("queryBuilder - A-03 & M-01 & M-06", () => {
  it("escapes SQL identifiers and strings correctly", () => {
    expect(escapeSqlIdent('my_table"test')).toBe('"my_table""test"');
    expect(escapeSqlString("O'Reilly")).toBe("O''Reilly");
  });

  it("detects numeric strings accurately", () => {
    expect(isNumericString("100")).toBe(true);
    expect(isNumericString("-25.5")).toBe(true);
    expect(isNumericString("0")).toBe(true);
    expect(isNumericString("abc")).toBe(false);
    expect(isNumericString("")).toBe(false);
  });

  it("builds numeric comparison for > and < without converting to text (A-03)", () => {
    // Numeric value with > should use TRY_CAST AS DOUBLE and numeric literal
    const condGt = buildFilterCondition("monto", ">", "10");
    expect(condGt).toBe('TRY_CAST("monto" AS DOUBLE) > 10');

    const condLt = buildFilterCondition("cantidad", "<", "2");
    expect(condLt).toBe('TRY_CAST("cantidad" AS DOUBLE) < 2');

    // Negative numbers
    const condNeg = buildFilterCondition("saldo", "<", "-50.5");
    expect(condNeg).toBe('TRY_CAST("saldo" AS DOUBLE) < -50.5');

    // Non-numeric with > falls back to VARCHAR
    const condText = buildFilterCondition("categoria", ">", "B");
    expect(condText).toBe('CAST("categoria" AS VARCHAR) > \'B\'');

    // LIKE always uses VARCHAR ILIKE
    const condLike = buildFilterCondition("cliente", "LIKE", "Perez");
    expect(condLike).toBe('CAST("cliente" AS VARCHAR) ILIKE \'%Perez%\'');
  });

  it("orders line and area charts chronologically by dimension ASC (M-01)", () => {
    const lineConfig: ChartConfig = {
      id: "chart-1",
      title: "Tendencia de Ventas",
      type: "line",
      tableName: "ventas",
      dimensionCol: "fecha",
      metricCol: "total",
      aggregation: "SUM",
    };

    const lineSql = buildChartSQL({ config: lineConfig });
    expect(lineSql).toContain("ORDER BY dimension ASC");
    expect(lineSql).not.toContain("ORDER BY metric DESC");

    const areaConfig: ChartConfig = {
      ...lineConfig,
      type: "area",
    };
    const areaSql = buildChartSQL({ config: areaConfig });
    expect(areaSql).toContain("ORDER BY dimension ASC");
  });

  it("orders bar, pie, and table charts by metric DESC", () => {
    const barConfig: ChartConfig = {
      id: "chart-2",
      title: "Top Clientes",
      type: "bar",
      tableName: "ventas",
      dimensionCol: "cliente",
      metricCol: "total",
      aggregation: "SUM",
    };

    const barSql = buildChartSQL({ config: barConfig });
    expect(barSql).toContain("ORDER BY metric DESC");
  });

  it("injects search condition in DuckDB query for slicer (M-06)", () => {
    const slicerConfig: ChartConfig = {
      id: "slicer-1",
      title: "Selector de Ciudad",
      type: "slicer",
      tableName: "clientes",
      dimensionCol: "ciudad",
      metricCol: "",
      aggregation: "COUNT",
    };

    const slicerSql = buildChartSQL({
      config: slicerConfig,
      slicerSearch: "Guadalajara",
    });

    expect(slicerSql).toContain("CAST(\"ciudad\" AS VARCHAR) ILIKE '%Guadalajara%'");
    expect(slicerSql).toContain("LIMIT 100");
  });
});
