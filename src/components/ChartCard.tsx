import React, { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ChartConfig, GlobalFilter, CardTheme, DraggedFieldPayload } from "../types/dashboard";
import { executeQuery } from "../lib/duckdb";
import { getTheme } from "../lib/themes";
import {
  accentColor,
  buildChartOption,
  buildRingsLegend,
} from "../lib/chartOptions";
import {
  Trash2,
  Settings,
  AlertCircle,
  RefreshCw,
  FileText,
  Filter,
  RotateCcw,
  Check,
  Search,
} from "lucide-react";

interface ChartCardProps {
  config: ChartConfig;
  globalFilters: GlobalFilter[];
  theme: CardTheme;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDataLoaded?: (data: Record<string, any>[]) => void;
  onDropField?: (payload: DraggedFieldPayload) => void;
  onSlicerFilterChange?: (tableName: string, columnName: string, value: string | null) => void;
  refreshTrigger?: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  config,
  globalFilters,
  theme,
  isSelected,
  onSelect,
  onDelete,
  onDataLoaded,
  onDropField,
  onSlicerFilterChange,
  refreshTrigger,
}) => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [slicerSearch, setSlicerSearch] = useState("");

  const themeDef = getTheme(theme);

  // Active local filters count for header badge
  const activeLocals = useMemo(
    () =>
      (config.localFilters || []).filter(
        (lf) => lf.enabled && lf.columnName && lf.value.trim() !== ""
      ),
    [config.localFilters]
  );

  // Check if this visual is a slicer and has an active value in globalFilters
  const activeSlicerVal = useMemo(() => {
    if (config.type !== "slicer") return null;
    const match = globalFilters.find(
      (f) =>
        f.enabled &&
        f.tableName === config.tableName &&
        f.columnName === config.dimensionCol
    );
    return match ? match.value : null;
  }, [config.type, config.tableName, config.dimensionCol, globalFilters]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      if (!config.tableName || !config.dimensionCol || (!config.metricCol && config.type !== "slicer")) {
        return;
      }
      setLoading(true);
      setError(null);

      try {
        // 1. Global filters targeting this table
        const activeGlobals = globalFilters.filter(
          (f) => f.enabled && f.tableName === config.tableName && f.value.trim() !== ""
        );

        // 2. Local filters defined in this visual
        const activeLocalsList = (config.localFilters || []).filter(
          (lf) => lf.enabled && lf.columnName && lf.value.trim() !== ""
        );

        // 3. Fallback legacy local filter
        const hasLegacyLocal =
          (!config.localFilters || config.localFilters.length === 0) &&
          Boolean(config.filterCol && config.filterVal && config.filterVal.trim() !== "");

        const conditions: string[] = [];

        for (const f of activeGlobals) {
          // If this visual is itself a slicer on this column, don't filter out its own options!
          if (config.type === "slicer" && f.columnName === config.dimensionCol) {
            continue;
          }
          const col = `"${f.columnName.replace(/"/g, '""')}"`;
          if (f.operator === "LIKE") {
            conditions.push(`CAST(${col} AS VARCHAR) ILIKE '%${f.value.replace(/'/g, "''")}%'`);
          } else {
            conditions.push(`CAST(${col} AS VARCHAR) ${f.operator} '${f.value.replace(/'/g, "''")}'`);
          }
        }

        for (const lf of activeLocalsList) {
          const col = `"${lf.columnName.replace(/"/g, '""')}"`;
          if (lf.operator === "LIKE") {
            conditions.push(`CAST(${col} AS VARCHAR) ILIKE '%${lf.value.replace(/'/g, "''")}%'`);
          } else {
            conditions.push(`CAST(${col} AS VARCHAR) ${lf.operator} '${lf.value.replace(/'/g, "''")}'`);
          }
        }

        if (hasLegacyLocal) {
          const col = `"${config.filterCol!.replace(/"/g, '""')}"`;
          conditions.push(`CAST(${col} AS VARCHAR) ILIKE '%${config.filterVal!.replace(/'/g, "''")}%'`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        let sql = "";
        const sanitizedTable = `"${config.tableName.replace(/"/g, '""')}"`;
        const sanitizedDim = `"${config.dimensionCol.replace(/"/g, '""')}"`;
        const sanitizedMetric = config.metricCol ? `"${config.metricCol.replace(/"/g, '""')}"` : sanitizedDim;

        if (config.type === "kpi") {
          sql = `SELECT ${config.aggregation}(${sanitizedMetric}) as metric FROM ${sanitizedTable} ${whereClause}`;
        } else if (config.type === "slicer") {
          sql = `
            SELECT 
              CAST(${sanitizedDim} AS VARCHAR) as dimension, 
              COUNT(*) as metric 
            FROM ${sanitizedTable} 
            ${whereClause}
            GROUP BY ${sanitizedDim} 
            ORDER BY metric DESC 
            LIMIT 50
          `;
        } else {
          sql = `
            SELECT 
              ${sanitizedDim} as dimension, 
              ${config.aggregation}(${sanitizedMetric}) as metric 
            FROM ${sanitizedTable} 
            ${whereClause}
            GROUP BY ${sanitizedDim} 
            ORDER BY metric DESC 
            LIMIT 25
          `;
        }

        const rows = await executeQuery(sql);
        if (isMounted) {
          setData(rows);
          if (onDataLoaded) onDataLoaded(rows);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Error al ejecutar consulta DuckDB");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [
    config.tableName,
    config.dimensionCol,
    config.metricCol,
    config.aggregation,
    config.type,
    config.filterCol,
    config.filterVal,
    JSON.stringify(config.localFilters),
    globalFilters,
    refreshTrigger,
  ]);

  const chartOption = useMemo(
    () => buildChartOption(config, data, themeDef),
    [config, data, themeDef]
  );

  const ringsLegend = useMemo(
    () => (config.type === "rings" ? buildRingsLegend(data, themeDef) : []),
    [config.type, data, themeDef]
  );

  const isEchart = ["bar", "line", "area", "pie", "rings"].includes(config.type);

  // Filtered rows for Slicer internal search
  const filteredSlicerData = useMemo(() => {
    if (config.type !== "slicer") return [];
    if (!slicerSearch.trim()) return data;
    const q = slicerSearch.toLowerCase();
    return data.filter((r) => String(r.dimension || "").toLowerCase().includes(q));
  }, [config.type, data, slicerSearch]);

  return (
    <div
      className={`chart-card ${isSelected ? "selected" : ""} ${isDragOver ? "drag-target-active" : ""}`}
      style={{
        backgroundColor: themeDef.cardBg,
        borderColor: isDragOver
          ? "#4ec9b0"
          : isSelected
          ? accentColor(themeDef, 0)
          : themeDef.cardBorder,
        boxShadow: isDragOver ? "0 0 12px rgba(78, 201, 176, 0.45)" : undefined,
        fontFamily: themeDef.fontFamily || "inherit",
      }}
      onClick={onSelect}
      onDragOver={(e) => {
        if (onDropField) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        if (onDropField) {
          e.preventDefault();
          setIsDragOver(false);
          try {
            const raw = e.dataTransfer.getData("application/json");
            if (raw) {
              const payload: DraggedFieldPayload = JSON.parse(raw);
              onDropField(payload);
            }
          } catch (err) {
            console.warn("Failed to drop field on card", err);
          }
        }
      }}
    >
      <div
        className="chart-card-header"
        style={{ borderBottomColor: themeDef.cardBorder }}
      >
        <div>
          <div className="chart-card-title-row">
            <span className="chart-card-title" style={{ color: themeDef.text }}>
              {config.title}
            </span>
            {activeLocals.length > 0 && (
              <span
                className="card-local-filter-badge"
                title={`Filtros locales aplicados: ${activeLocals
                  .map((l) => `${l.columnName} ${l.operator} ${l.value}`)
                  .join(", ")}`}
              >
                <Filter size={10} />
                <span>{activeLocals.length} local</span>
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: "0.68rem",
              color: themeDef.subtext,
              fontWeight: 600,
            }}
          >
            {config.type === "slicer" ? (
              <span>Segmentador interactivo de {config.dimensionCol}</span>
            ) : (
              <span>
                {config.aggregation}({config.metricCol}) según {config.dimensionCol}
              </span>
            )}
          </div>
        </div>
        <div className="chart-actions" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" onClick={onSelect} title="Editar propiedades">
            <Settings size={14} />
          </button>
          <button className="icon-btn" onClick={onDelete} title="Eliminar tarjeta">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              color: themeDef.text,
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <RefreshCw size={14} className="spin" />
            <span>Consultando DuckDB...</span>
          </div>
        )}

        {error && (
          (() => {
            const isTypeMismatch =
              error.toLowerCase().includes("binder error") ||
              error.toLowerCase().includes("no function matches") ||
              error.toLowerCase().includes("varchar") ||
              error.toLowerCase().includes("type mismatch");

            if (isTypeMismatch) {
              return (
                <div
                  style={{
                    padding: "1rem",
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px dashed rgba(239, 68, 68, 0.35)",
                    borderRadius: "6px",
                    margin: "0.5rem",
                    fontSize: "0.74rem",
                    lineHeight: 1.45,
                    color: "#f3f3f3",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#fca5a5",
                      fontWeight: 800,
                      fontSize: "0.82rem",
                      marginBottom: "6px",
                    }}
                  >
                    <span>⚠️</span>
                    <span>Configuración de datos no válida</span>
                  </div>
                  <p style={{ color: "#e5e7eb", marginBottom: "8px" }}>
                    No es posible calcular una &quot;Suma&quot; sobre texto (por ejemplo, nombres de clientes).
                    Las funciones matemáticas requieren columnas numéricas.
                  </p>
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.25)",
                      padding: "8px",
                      borderRadius: "4px",
                      color: "#a0aec0",
                      fontSize: "0.7rem",
                    }}
                  >
                    💡 <strong>Solución:</strong> Cambia la métrica a un campo numérico en el panel de Visualizaciones o invierte los ejes con el botón <strong>X ⇄ Y</strong>.
                  </div>
                </div>
              );
            }

            const isMissingTable =
              error.includes("does not exist") ||
              error.includes("Catalog Error") ||
              error.includes("sqlite_temp_master");

            if (isMissingTable) {
              return (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px dashed rgba(239, 68, 68, 0.35)",
                    borderRadius: "6px",
                    padding: "1rem",
                    margin: "0.75rem",
                    fontSize: "0.78rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      color: "#f87171",
                      fontWeight: 800,
                      marginBottom: "6px",
                    }}
                  >
                    <AlertCircle size={15} />
                    <span>Tabla &quot;{config.tableName}&quot; no encontrada en DuckDB</span>
                  </div>
                  <p style={{ color: "#d1d5db", marginBottom: "8px", lineHeight: "1.4" }}>
                    Los datos de esta tabla no están en la memoria activa de la sesión (posible reinicio de sesión o recarga).
                  </p>
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      padding: "6px 8px",
                      borderRadius: "4px",
                      color: "#9ca3af",
                      fontSize: "0.7rem",
                    }}
                  >
                    💡 <strong>Solución:</strong> Vuelve a importar el archivo <code>{config.tableName}.csv</code> desde el panel de Campos o selecciona otra tabla en Visualizaciones.
                  </div>
                </div>
              );
            }

            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "180px",
                  color: "#ef4444",
                  gap: "0.5rem",
                  fontSize: "0.75rem",
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            );
          })()
        )}

        {!loading && !error && config.type === "kpi" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
            }}
          >
            <div
              style={{
                fontSize: "2.8rem",
                fontWeight: 900,
                color: accentColor(themeDef, 0),
                letterSpacing: "-0.03em",
              }}
            >
              {new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(
                Number(data[0]?.metric) || 0
              )}
            </div>
            <div
              style={{
                color: themeDef.subtext,
                fontSize: "0.85rem",
                fontWeight: 700,
                marginTop: "0.35rem",
              }}
            >
              {config.aggregation} de {config.metricCol}
            </div>
          </div>
        )}

        {/* Slicer Visual Type Body */}
        {!loading && !error && config.type === "slicer" && (
          <div className="slicer-card-body" onClick={(e) => e.stopPropagation()}>
            <div className="slicer-search-bar">
              <Search size={11} color="#888888" />
              <input
                type="text"
                className="slicer-search-input"
                placeholder={`Buscar en ${config.dimensionCol}...`}
                value={slicerSearch}
                onChange={(e) => setSlicerSearch(e.target.value)}
              />
              {activeSlicerVal && (
                <button
                  type="button"
                  className="slicer-clear-btn"
                  onClick={() =>
                    onSlicerFilterChange?.(config.tableName, config.dimensionCol, null)
                  }
                  title="Borrar selección"
                >
                  <RotateCcw size={10} />
                  <span>Limpiar</span>
                </button>
              )}
            </div>

            <div className="slicer-items-list">
              {filteredSlicerData.map((row, idx) => {
                const valStr = String(row.dimension ?? "");
                const isSelected = activeSlicerVal === valStr;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`slicer-item-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      onSlicerFilterChange?.(
                        config.tableName,
                        config.dimensionCol,
                        isSelected ? null : valStr
                      );
                    }}
                  >
                    <div className="slicer-item-left">
                      <div className={`slicer-checkbox ${isSelected ? "checked" : ""}`}>
                        {isSelected && <Check size={10} color="#ffffff" />}
                      </div>
                      <span className="slicer-item-label">{valStr || "(Vacío)"}</span>
                    </div>
                    <span className="slicer-item-count">
                      {new Intl.NumberFormat("es-MX").format(Number(row.metric) || 0)}
                    </span>
                  </button>
                );
              })}
              {filteredSlicerData.length === 0 && (
                <div className="slicer-no-results">No hay coincidencias</div>
              )}
            </div>
          </div>
        )}

        {!loading && !error && config.type === "table" && (
          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            <table
              style={{
                width: "100%",
                fontSize: "0.75rem",
                textAlign: "left",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    color: themeDef.text,
                    fontWeight: 800,
                    borderBottom: `1px solid ${themeDef.cardBorder}`,
                    background: "rgba(0,0,0,0.2)",
                  }}
                >
                  <th style={{ padding: "6px" }}>{config.dimensionCol}</th>
                  <th style={{ padding: "6px" }}>
                    {config.aggregation}({config.metricCol})
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontWeight: 600,
                      color: themeDef.subtext,
                    }}
                  >
                    <td style={{ padding: "6px" }}>{String(r.dimension)}</td>
                    <td style={{ padding: "6px" }}>
                      {new Intl.NumberFormat("es-MX").format(Number(r.metric) || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && isEchart && (
          <ReactECharts
            option={chartOption}
            style={{ height: config.type === "rings" ? "210px" : "240px", width: "100%" }}
            opts={{ renderer: "canvas" }}
            notMerge
          />
        )}

        {!loading && !error && config.type === "rings" && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem 0.9rem",
              justifyContent: "center",
              marginTop: "0.25rem",
            }}
          >
            {ringsLegend.map((l) => (
              <div
                key={l.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: themeDef.text,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: l.color,
                    display: "inline-block",
                  }}
                />
                <span style={{ color: l.color }}>{l.label}</span>
                <span style={{ color: themeDef.subtext }}>{l.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer description note (controlado por showDescription) */}
      {config.showDescription !== false && config.description && config.description.trim() !== "" && (
        <div
          style={{
            marginTop: "0.5rem",
            paddingTop: "0.45rem",
            borderTop: `1px dashed ${themeDef.cardBorder}`,
            fontSize: "0.68rem",
            color: themeDef.subtext,
            fontWeight: 500,
            display: "flex",
            alignItems: "flex-start",
            gap: "0.35rem",
          }}
        >
          <FileText size={11} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>{config.description}</span>
        </div>
      )}
    </div>
  );
};
