import { ChartConfig, GlobalFilter } from "../types/dashboard";

export interface BuildChartSQLOptions {
  config: ChartConfig;
  globalFilters?: GlobalFilter[];
  slicerSearch?: string;
  columnTypes?: Record<string, string>; // e.g. { age: "number", name: "string" }
}

/**
 * Escapes SQL string literal preventing injection and syntax breaks.
 */
export function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * Escapes SQL identifier (table / column name).
 */
export function escapeSqlIdent(ident: string): string {
  return `"${ident.replace(/"/g, '""')}"`;
}

/**
 * Determines whether a value string looks like a valid number.
 */
export function isNumericString(val: string): boolean {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed === "") return false;
  return !isNaN(Number(trimmed));
}

/**
 * Builds a typed SQL condition for a column and operator.
 * For '>' and '<', if the filter value is numeric or column type is number,
 * it avoids VARCHAR comparison to preserve mathematical accuracy (e.g. 10 > 2).
 */
export function buildFilterCondition(
  columnName: string,
  operator: "=" | "!=" | ">" | "<" | "LIKE",
  value: string,
  colType?: string
): string {
  const colIdent = escapeSqlIdent(columnName);
  const safeVal = escapeSqlString(value.trim());

  if (operator === "LIKE") {
    return `CAST(${colIdent} AS VARCHAR) ILIKE '%${safeVal}%'`;
  }

  const isNumericCol = colType === "number";
  const numericVal = isNumericString(value);

  if ((operator === ">" || operator === "<") && (isNumericCol || numericVal)) {
    // Numeric comparison: CAST to DOUBLE for safety against text-stored numbers
    const num = Number(value.trim());
    return `TRY_CAST(${colIdent} AS DOUBLE) ${operator} ${num}`;
  }

  if (operator === "=" || operator === "!=") {
    if (isNumericCol && numericVal) {
      return `TRY_CAST(${colIdent} AS DOUBLE) ${operator} ${Number(value.trim())}`;
    }
    return `CAST(${colIdent} AS VARCHAR) ${operator} '${safeVal}'`;
  }

  // Fallback
  return `CAST(${colIdent} AS VARCHAR) ${operator} '${safeVal}'`;
}

/**
 * Compiles the complete SQL query for a chart, handling types, filters,
 * chronological ordering for line/area series, and slicer queries.
 */
export function buildChartSQL({
  config,
  globalFilters = [],
  slicerSearch = "",
  columnTypes = {},
}: BuildChartSQLOptions): string {
  const conditions: string[] = [];

  // 1. Global filters matching table
  const activeGlobals = globalFilters.filter(
    (f) =>
      f.tableName === config.tableName &&
      f.columnName &&
      f.value &&
      f.value.trim() !== ""
  );

  for (const f of activeGlobals) {
    if (config.type === "slicer" && f.columnName === config.dimensionCol) {
      continue; // Don't filter out slicer's own options
    }
    conditions.push(
      buildFilterCondition(f.columnName, f.operator, f.value, columnTypes[f.columnName])
    );
  }

  // 2. Local filters
  const activeLocals = (config.localFilters || []).filter(
    (lf) => lf.enabled && lf.columnName && lf.value && lf.value.trim() !== ""
  );

  for (const lf of activeLocals) {
    conditions.push(
      buildFilterCondition(lf.columnName, lf.operator, lf.value, columnTypes[lf.columnName])
    );
  }

  // 3. Legacy filter
  if (config.filterCol && config.filterVal && config.filterVal.trim() !== "") {
    conditions.push(
      buildFilterCondition(config.filterCol, "LIKE", config.filterVal, columnTypes[config.filterCol])
    );
  }

  // 4. Slicer dynamic search condition in DuckDB
  if (config.type === "slicer" && slicerSearch.trim() !== "") {
    const colIdent = escapeSqlIdent(config.dimensionCol);
    const safeSearch = escapeSqlString(slicerSearch.trim());
    conditions.push(`CAST(${colIdent} AS VARCHAR) ILIKE '%${safeSearch}%'`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sanitizedTable = escapeSqlIdent(config.tableName);
  const sanitizedDim = escapeSqlIdent(config.dimensionCol);
  const sanitizedMetric = config.metricCol ? escapeSqlIdent(config.metricCol) : sanitizedDim;

  if (config.type === "kpi") {
    return `SELECT ${config.aggregation}(${sanitizedMetric}) as metric FROM ${sanitizedTable} ${whereClause}`;
  }

  if (config.type === "slicer") {
    return `
      SELECT 
        CAST(${sanitizedDim} AS VARCHAR) as dimension, 
        COUNT(*) as metric 
      FROM ${sanitizedTable} 
      ${whereClause}
      GROUP BY ${sanitizedDim} 
      ORDER BY metric DESC 
      LIMIT 100
    `.trim();
  }

  // Determine chronological ordering for time series
  const isTimeSeriesOrContinuous = config.type === "line" || config.type === "area";
  const orderByClause = isTimeSeriesOrContinuous ? "ORDER BY dimension ASC" : "ORDER BY metric DESC";

  return `
    SELECT 
      ${sanitizedDim} as dimension, 
      ${config.aggregation}(${sanitizedMetric}) as metric 
    FROM ${sanitizedTable} 
    ${whereClause}
    GROUP BY ${sanitizedDim} 
    ${orderByClause} 
    LIMIT 25
  `.trim();
}
