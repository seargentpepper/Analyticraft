import React, { useState, useEffect } from "react";
import {
  BarChart2,
  TrendingUp,
  PieChart,
  AreaChart,
  Hash,
  Table as TableIcon,
  Target,
  Sliders,
  Paintbrush,
  ChevronRight,
  Eye,
  FileText,
  X,
  Sparkles,
  Layers,
  ArrowUpDown,
  Filter,
  SlidersHorizontal,
  Trash2,
  RotateCcw,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  ChartConfig,
  ChartType,
  AggregationType,
  DraggedFieldPayload,
  VisualizationsSubTab,
  LocalFilter,
} from "../types/dashboard";
import { TableInfo, executeQuery } from "../lib/duckdb";

interface VisualizationsPanelProps {
  selectedChart: ChartConfig | null;
  tables: TableInfo[];
  onUpdateChart: (updates: Partial<ChartConfig>) => void;
  onAddChartWithType?: (type: ChartType) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const VISUAL_TYPES: {
  type: ChartType;
  label: string;
  icon: React.FC<{ size?: number; color?: string }>;
}[] = [
  { type: "bar", label: "Barras", icon: BarChart2 },
  { type: "line", label: "Líneas", icon: TrendingUp },
  { type: "pie", label: "Circular", icon: PieChart },
  { type: "area", label: "Área", icon: AreaChart },
  { type: "kpi", label: "KPI", icon: Hash },
  { type: "table", label: "Tabla", icon: TableIcon },
  { type: "rings", label: "Anillos", icon: Target },
  { type: "slicer", label: "Segmentador", icon: SlidersHorizontal },
];

export const VisualizationsPanel: React.FC<VisualizationsPanelProps> = ({
  selectedChart,
  tables,
  onUpdateChart,
  onAddChartWithType,
  isOpen,
  onToggleOpen,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<VisualizationsSubTab>("build");
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  // Cache of distinct values fetched from DuckDB for local filters
  const [suggestedValues, setSuggestedValues] = useState<Record<string, string[]>>({});
  const [loadingColValues, setLoadingColValues] = useState<string | null>(null);

  // Keep active table synchronized
  const activeTable = tables.find((t) => t.name === selectedChart?.tableName) || tables[0];

  // Helper to load distinct values for a column from DuckDB
  const loadDistinctValuesForColumn = async (colName: string, force = false) => {
    if (!selectedChart?.tableName || !colName) return;
    if (!force && suggestedValues[colName]) return;

    try {
      setLoadingColValues(colName);
      const sanitizedTable = selectedChart.tableName.replace(/"/g, '""');
      const sanitizedCol = colName.replace(/"/g, '""');
      const rows = await executeQuery(`
        SELECT DISTINCT "${sanitizedCol}" AS val
        FROM "${sanitizedTable}"
        WHERE "${sanitizedCol}" IS NOT NULL
        ORDER BY val ASC
        LIMIT 25;
      `);
      const vals = rows.map((r: any) => String(r.val)).filter((v) => v.trim() !== "");
      setSuggestedValues((prev) => ({ ...prev, [colName]: vals }));
    } catch (err) {
      console.warn("Error fetching distinct values for filter:", err);
    } finally {
      setLoadingColValues(null);
    }
  };

  // Preload values for existing local filters
  useEffect(() => {
    if (selectedChart?.localFilters && selectedChart.localFilters.length > 0) {
      selectedChart.localFilters.forEach((lf) => {
        if (lf.columnName && !suggestedValues[lf.columnName]) {
          loadDistinctValuesForColumn(lf.columnName);
        }
      });
    }
  }, [selectedChart?.id, selectedChart?.localFilters]);

  if (!isOpen) {
    return (
      <div
        className="docked-rail-tab visuals-rail"
        onClick={onToggleOpen}
        title="Expandir panel de Visualizaciones"
      >
        <BarChart2 size={13} />
        <span className="vertical-label">Visualizaciones</span>
      </div>
    );
  }

  // 1. Swap Axes (Invertir Ejes X ↔ Y)
  const handleSwapAxes = () => {
    if (!selectedChart) return;
    const oldDim = selectedChart.dimensionCol;
    const oldMetric = selectedChart.metricCol;
    if (!oldDim && !oldMetric) return;

    const table = activeTable;
    const newMetricColObj = table?.columns.find((c) => c.name === oldDim);
    const isNewMetricNumeric = newMetricColObj?.type === "number";

    onUpdateChart({
      dimensionCol: oldMetric,
      metricCol: oldDim,
      aggregation: isNewMetricNumeric ? (selectedChart.aggregation || "SUM") : "COUNT",
    });
  };

  // 2. Drag & Drop handler for drop zones
  const handleDropOnZone = (
    e: React.DragEvent<HTMLDivElement>,
    zone: "dimension" | "metric" | "filter"
  ) => {
    e.preventDefault();
    setDragOverZone(null);
    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const payload: DraggedFieldPayload = JSON.parse(raw);

      if (zone === "dimension") {
        onUpdateChart({
          tableName: payload.tableName,
          dimensionCol: payload.columnName,
        });
      } else if (zone === "metric") {
        const isNumeric = payload.dataType === "number";
        onUpdateChart({
          tableName: payload.tableName,
          metricCol: payload.columnName,
          aggregation: isNumeric ? (selectedChart?.aggregation || "SUM") : "COUNT",
        });
      } else if (zone === "filter") {
        const currentFilters = selectedChart?.localFilters || [];
        const newFilter: LocalFilter = {
          id: crypto.randomUUID(),
          columnName: payload.columnName,
          operator: "=",
          value: "",
          enabled: true,
        };
        onUpdateChart({
          localFilters: [...currentFilters, newFilter],
        });
        loadDistinctValuesForColumn(payload.columnName, true);
      }
    } catch (err) {
      console.warn("Failed to parse dragged field payload", err);
    }
  };

  // 3. Local Filters Mutation Handlers
  const handleAddLocalFilterByCol = (colName: string) => {
    if (!colName || !selectedChart) return;
    const currentFilters = selectedChart.localFilters || [];
    const newFilter: LocalFilter = {
      id: crypto.randomUUID(),
      columnName: colName,
      operator: "=",
      value: "",
      enabled: true,
    };
    onUpdateChart({
      localFilters: [...currentFilters, newFilter],
    });
    loadDistinctValuesForColumn(colName, true);
  };

  const handleUpdateLocalFilter = (id: string, updates: Partial<LocalFilter>) => {
    if (!selectedChart?.localFilters) return;
    const updated = selectedChart.localFilters.map((f) =>
      f.id === id ? { ...f, ...updates } : f
    );
    onUpdateChart({ localFilters: updated });
  };

  const handleRemoveLocalFilter = (id: string) => {
    if (!selectedChart?.localFilters) return;
    const remaining = selectedChart.localFilters.filter((f) => f.id !== id);
    onUpdateChart({ localFilters: remaining });
  };

  const handleClearAllLocalFilters = () => {
    onUpdateChart({ localFilters: [], filterCol: "", filterVal: "" });
  };

  const handleToggleAllLocalFilters = () => {
    if (!selectedChart?.localFilters || selectedChart.localFilters.length === 0) return;
    const anyEnabled = selectedChart.localFilters.some((f) => f.enabled);
    const updated = selectedChart.localFilters.map((f) => ({
      ...f,
      enabled: !anyEnabled,
    }));
    onUpdateChart({ localFilters: updated });
  };

  const localFilters = selectedChart?.localFilters || [];

  return (
    <aside className="pbi-panel visuals-panel">
      {/* Header */}
      <div className="pbi-panel-header">
        <div className="pbi-panel-title">
          <BarChart2 size={13} color="#007acc" />
          <span>Visualizaciones</span>
        </div>
        <button
          className="pbi-panel-toggle"
          onClick={onToggleOpen}
          title="Colapsar panel de Visualizaciones"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Visual Type Icon Matrix */}
      <div className="visuals-type-matrix">
        {VISUAL_TYPES.map((vt) => {
          const Icon = vt.icon;
          const isActive = selectedChart?.type === vt.type;
          return (
            <button
              key={vt.type}
              className={`visual-matrix-btn ${isActive ? "active" : ""}`}
              onClick={() => {
                if (selectedChart) {
                  onUpdateChart({ type: vt.type });
                } else if (onAddChartWithType) {
                  onAddChartWithType(vt.type);
                }
              }}
              title={
                selectedChart
                  ? `Transformar a gráfico de ${vt.label}`
                  : `Insertar nuevo gráfico de ${vt.label}`
              }
            >
              <Icon size={16} />
              <span className="visual-matrix-label">{vt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-tabs: Build (Construir) vs Format (Formato) */}
      <div className="visuals-subtabs-strip">
        <button
          className={`visuals-subtab-btn ${activeSubTab === "build" ? "active" : ""}`}
          onClick={() => setActiveSubTab("build")}
          title="Construir visual: Asignación de Eje X, Eje Y y métricas"
        >
          <Sliders size={12} />
          <span>Construir</span>
        </button>
        <button
          className={`visuals-subtab-btn ${activeSubTab === "format" ? "active" : ""}`}
          onClick={() => setActiveSubTab("format")}
          title="Dar formato al visual: Título, leyendas y notas al pie"
        >
          <Paintbrush size={12} />
          <span>Formato</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="pbi-panel-scroll">
        {!selectedChart ? (
          <div className="visuals-empty-notice">
            <Sparkles size={26} color="#cca700" />
            <p className="notice-title">Ningún visual seleccionado</p>
            <p className="notice-desc">
              Selecciona una tarjeta en el lienzo para ajustar sus ejes, o haz clic en un icono de la
              galería superior para crear un gráfico nuevo.
            </p>
          </div>
        ) : (
          <>
            {/* SUBTAB 1: BUILD VISUAL (DROP ZONES) */}
            {activeSubTab === "build" && (
              <div className="build-zones-container">
                {/* Source Table Selector */}
                <div className="zone-group">
                  <div className="zone-label-row">
                    <span className="zone-title">Tabla Origen:</span>
                  </div>
                  <select
                    className="zone-select-compact"
                    value={selectedChart.tableName}
                    onChange={(e) => onUpdateChart({ tableName: e.target.value })}
                  >
                    {tables.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.rowCount.toLocaleString()} filas)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Drop Zone: Eje X / Dimensión */}
                <div className="zone-group">
                  <div className="zone-label-row">
                    <span className="zone-title">Eje X (Categoría / Dimensión):</span>
                    {selectedChart.dimensionCol && (
                      <button
                        className="zone-clear-btn"
                        onClick={() => onUpdateChart({ dimensionCol: "" })}
                        title="Quitar campo del Eje X"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>

                  <div
                    className={`dropzone-slot ${dragOverZone === "dimension" ? "dragover" : ""} ${
                      selectedChart.dimensionCol ? "filled" : "empty"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverZone("dimension");
                    }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(e) => handleDropOnZone(e, "dimension")}
                  >
                    {selectedChart.dimensionCol ? (
                      <div
                        className="dropzone-pill"
                        draggable={true}
                        onDragStart={(e) => {
                          const payload: DraggedFieldPayload = {
                            tableName: selectedChart.tableName,
                            columnName: selectedChart.dimensionCol,
                            dataType: "string",
                          };
                          e.dataTransfer.setData("application/json", JSON.stringify(payload));
                        }}
                        title="Arrastra para mover a otra zona"
                      >
                        <Layers size={11} color="#007acc" />
                        <span className="dropzone-text">{selectedChart.dimensionCol}</span>
                        <span className="dropzone-table-tag">{selectedChart.tableName}</span>
                        <button
                          className="pill-quick-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateChart({
                              metricCol: selectedChart.dimensionCol,
                              aggregation: "COUNT",
                            });
                          }}
                          title="Copiar/Mover a Eje Y como métrica COUNT"
                        >
                          → Y
                        </button>
                      </div>
                    ) : (
                      <span className="dropzone-placeholder">
                        Arrastra un campo aquí para el Eje X
                      </span>
                    )}
                  </div>

                  {/* Fallback column select */}
                  {activeTable && (
                    <select
                      className="zone-select-compact"
                      value={selectedChart.dimensionCol}
                      onChange={(e) => onUpdateChart({ dimensionCol: e.target.value })}
                    >
                      <option value="">-- Seleccionar Eje X --</option>
                      {activeTable.columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} [{c.type}]
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* SWAP AXES BUTTON (Invertir Ejes X ⇄ Y) */}
                <div className="swap-axes-container">
                  <button
                    type="button"
                    className="btn-swap-axes"
                    onClick={handleSwapAxes}
                    title="Intercambiar campos entre Eje X y Eje Y"
                  >
                    <ArrowUpDown size={12} />
                    <span>Invertir Ejes (X ⇄ Y)</span>
                  </button>
                </div>

                {/* Drop Zone: Eje Y / Métrica */}
                <div className="zone-group">
                  <div className="zone-label-row">
                    <span className="zone-title">Eje Y (Métrica / Valores):</span>
                    {selectedChart.metricCol && (
                      <button
                        className="zone-clear-btn"
                        onClick={() => onUpdateChart({ metricCol: "" })}
                        title="Quitar campo del Eje Y"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>

                  <div
                    className={`dropzone-slot ${dragOverZone === "metric" ? "dragover" : ""} ${
                      selectedChart.metricCol ? "filled" : "empty"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverZone("metric");
                    }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(e) => handleDropOnZone(e, "metric")}
                  >
                    {selectedChart.metricCol ? (
                      <div
                        className="dropzone-pill metric"
                        draggable={true}
                        onDragStart={(e) => {
                          const payload: DraggedFieldPayload = {
                            tableName: selectedChart.tableName,
                            columnName: selectedChart.metricCol,
                            dataType: "number",
                          };
                          e.dataTransfer.setData("application/json", JSON.stringify(payload));
                        }}
                        title="Arrastra para mover a otra zona"
                      >
                        <ArrowUpDown size={11} color="#4ec9b0" />
                        <span className="dropzone-text">{selectedChart.metricCol}</span>
                        <span className="dropzone-table-tag">{selectedChart.tableName}</span>
                        <button
                          className="pill-quick-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateChart({ dimensionCol: selectedChart.metricCol });
                          }}
                          title="Copiar/Mover a Eje X como dimensión"
                        >
                          ← X
                        </button>
                      </div>
                    ) : (
                      <span className="dropzone-placeholder">
                        Arrastra un campo numérico aquí para el Eje Y
                      </span>
                    )}
                  </div>

                  {/* Fallback metric select and aggregation selector */}
                  <div style={{ display: "flex", gap: "4px" }}>
                    {activeTable && (
                      <select
                        className="zone-select-compact"
                        style={{ flex: 1 }}
                        value={selectedChart.metricCol}
                        onChange={(e) => onUpdateChart({ metricCol: e.target.value })}
                      >
                        <option value="">-- Seleccionar Métrica --</option>
                        {activeTable.columns.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} [{c.type}]
                          </option>
                        ))}
                      </select>
                    )}

                    <select
                      className="zone-select-compact"
                      style={{ width: "95px" }}
                      value={selectedChart.aggregation}
                      onChange={(e) =>
                        onUpdateChart({ aggregation: e.target.value as AggregationType })
                      }
                      title="Función agregada SQL"
                    >
                      <option value="SUM">SUM</option>
                      <option value="AVG">AVG</option>
                      <option value="COUNT">COUNT</option>
                      <option value="MAX">MAX</option>
                      <option value="MIN">MIN</option>
                    </select>
                  </div>
                </div>

                {/* Drop Zone: Filtros en este Objeto Visual (Múltiples Filtros Locales) */}
                <div className="zone-group local-filters-section">
                  <div className="zone-label-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Filter size={12} color="#007acc" />
                      <span className="zone-title">Filtros de este Visual ({localFilters.length}):</span>
                    </div>
                    {localFilters.length > 0 && (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          className="zone-clear-btn"
                          onClick={handleToggleAllLocalFilters}
                          title="Pausar o reactivar todos los filtros"
                        >
                          <RotateCcw size={10} />
                        </button>
                        <button
                          className="zone-clear-btn"
                          onClick={handleClearAllLocalFilters}
                          title="Borrar todos los filtros de este visual"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Drop zone to add another filter */}
                  <div
                    className={`dropzone-slot filter-zone ${
                      dragOverZone === "filter" ? "dragover" : ""
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverZone("filter");
                    }}
                    onDragLeave={() => setDragOverZone(null)}
                    onDrop={(e) => handleDropOnZone(e, "filter")}
                    title="Arrastra columnas aquí para filtrar este visual de forma independiente"
                  >
                    <Filter size={11} color="#888888" />
                    <span className="dropzone-placeholder">
                      + Arrastra un campo aquí para filtrar este visual
                    </span>
                  </div>

                  {/* Fallback column selector to add filter */}
                  {activeTable && (
                    <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
                      <select
                        className="zone-select-compact"
                        style={{ flex: 1 }}
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddLocalFilterByCol(e.target.value);
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">+ Añadir filtro de columna...</option>
                        {activeTable.columns.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} [{c.type}]
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Active Local Filters List */}
                  {localFilters.length > 0 && (
                    <div className="local-filters-list">
                      {localFilters.map((lf) => {
                        const values = suggestedValues[lf.columnName] || [];
                        const isLoadingVals = loadingColValues === lf.columnName;

                        return (
                          <div
                            key={lf.id}
                            className={`local-filter-card ${lf.enabled ? "active" : "disabled"}`}
                          >
                            <div className="local-filter-card-header">
                              <label
                                className="filter-checkbox-label"
                                title={lf.enabled ? "Filtro activo" : "Filtro pausado"}
                              >
                                <input
                                  type="checkbox"
                                  checked={lf.enabled}
                                  onChange={(e) =>
                                    handleUpdateLocalFilter(lf.id, { enabled: e.target.checked })
                                  }
                                />
                                <span className="local-filter-col-name">{lf.columnName}</span>
                              </label>

                              <button
                                className="zone-clear-btn"
                                onClick={() => handleRemoveLocalFilter(lf.id)}
                                title="Borrar este filtro"
                              >
                                <X size={11} />
                              </button>
                            </div>

                            {/* Operator & Value Editor */}
                            <div className="local-filter-controls">
                              <select
                                className="local-filter-op-select"
                                value={lf.operator}
                                onChange={(e) =>
                                  handleUpdateLocalFilter(lf.id, {
                                    operator: e.target.value as any,
                                  })
                                }
                                title="Operador de comparación"
                              >
                                <option value="=">=</option>
                                <option value="!=">!=</option>
                                <option value="LIKE">contiene</option>
                                <option value=">">&gt;</option>
                                <option value="<">&lt;</option>
                              </select>

                              <div style={{ flex: 1, position: "relative" }}>
                                <input
                                  type="text"
                                  className="local-filter-input"
                                  placeholder="Escribe o selecciona..."
                                  value={lf.value}
                                  onChange={(e) =>
                                    handleUpdateLocalFilter(lf.id, { value: e.target.value })
                                  }
                                />
                                {lf.value && (
                                  <button
                                    className="filter-clear-val-btn"
                                    onClick={() => handleUpdateLocalFilter(lf.id, { value: "" })}
                                    title="Limpiar valor"
                                  >
                                    <X size={9} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Distinct Suggested Values Chips from DuckDB */}
                            <div className="filter-chips-suggestions">
                              <div className="filter-chips-header">
                                <span>Valores en datos:</span>
                                {isLoadingVals && <RefreshCw size={9} className="spin" />}
                              </div>
                              <div className="filter-chips-scroll">
                                {values.slice(0, 15).map((val) => {
                                  const isSelected = lf.value === val;
                                  return (
                                    <button
                                      key={val}
                                      type="button"
                                      className={`filter-val-chip ${isSelected ? "selected" : ""}`}
                                      onClick={() => {
                                        handleUpdateLocalFilter(lf.id, {
                                          value: isSelected ? "" : val,
                                        });
                                      }}
                                      title={`Filtrar por "${val}"`}
                                    >
                                      {isSelected && <Check size={8} />}
                                      <span>{val}</span>
                                    </button>
                                  );
                                })}
                                {values.length === 0 && !isLoadingVals && (
                                  <span className="filter-chips-empty">
                                    Sin sugerencias (escribe en el campo)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB 2: FORMAT VISUAL */}
            {activeSubTab === "format" && (
              <div className="format-options-container">
                {/* Title Section */}
                <div className="format-card-section">
                  <div className="section-title">Encabezado y Título</div>
                  <div className="format-field">
                    <label className="format-label">Texto del Título:</label>
                    <input
                      type="text"
                      className="format-input"
                      value={selectedChart.title}
                      onChange={(e) => onUpdateChart({ title: e.target.value })}
                    />
                  </div>
                </div>

                {/* Elements Toggles */}
                <div className="format-card-section">
                  <div className="section-title">Elementos Visuales</div>

                  {/* Toggle: Superior Legend */}
                  <label className="format-toggle-row">
                    <div className="toggle-label-group">
                      <Eye size={12} color="#007acc" />
                      <span>Leyenda Superior</span>
                    </div>
                    <input
                      type="checkbox"
                      className="format-checkbox"
                      checked={selectedChart.showLegend ?? false}
                      onChange={(e) => onUpdateChart({ showLegend: e.target.checked })}
                    />
                  </label>

                  {/* Toggle: Footer Note */}
                  <label className="format-toggle-row">
                    <div className="toggle-label-group">
                      <FileText size={12} color="#4ec9b0" />
                      <span>Nota Técnica al Pie</span>
                    </div>
                    <input
                      type="checkbox"
                      className="format-checkbox"
                      checked={selectedChart.showDescription !== false}
                      onChange={(e) => onUpdateChart({ showDescription: e.target.checked })}
                    />
                  </label>
                </div>

                {/* Description Textarea */}
                <div className="format-card-section">
                  <div className="section-title">Descripción al Pie</div>
                  <textarea
                    className="format-textarea"
                    rows={3}
                    placeholder="Escribe una explicación para este visual..."
                    value={selectedChart.description || ""}
                    onChange={(e) => onUpdateChart({ description: e.target.value })}
                  />
                  <span className="format-hint">
                    Visible en la base de la tarjeta cuando el interruptor esté activo.
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
