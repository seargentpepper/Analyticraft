import React, { useState } from "react";
import {
  Layers,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Search,
  Database,
  Upload,
  Link2,
  Trash2,
  X,
  Plus,
} from "lucide-react";
import { TableInfo } from "../lib/duckdb";
import { DraggedFieldPayload, TableRelation, ChartConfig } from "../types/dashboard";

interface FieldsPanelProps {
  tables: TableInfo[];
  relations: TableRelation[];
  selectedChart: ChartConfig | null;
  onFieldClick?: (payload: DraggedFieldPayload) => void;
  onTriggerHotSwap: (tableName: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  onDeleteRelation?: (relation: TableRelation) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const FieldsPanel: React.FC<FieldsPanelProps> = ({
  tables,
  relations,
  selectedChart,
  onFieldClick,
  onTriggerHotSwap,
  onFileUpload,
  isUploading,
  onDeleteRelation,
  isOpen,
  onToggleOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTable = (name: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [name]: prev[name] === false ? true : false, // Default is expanded
    }));
  };

  const isTableExpanded = (name: string) => expandedTables[name] !== false;

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "number":
        return <span className="field-type-pill number" title="Numérico (Métrica: SUM, AVG)">#</span>;
      case "date":
        return <span className="field-type-pill date" title="Fecha / Tiempo">📅</span>;
      case "boolean":
        return <span className="field-type-pill boolean" title="Booleano (Verdadero/Falso)">☑</span>;
      case "string":
      default:
        return <span className="field-type-pill string" title="Texto / Categoría (Dimensión)">Abc</span>;
    }
  };

  if (!isOpen) {
    return (
      <div
        className="docked-rail-tab fields-rail"
        onClick={onToggleOpen}
        title="Expandir panel de Campos (FIELDS)"
      >
        <Database size={13} />
        <span className="vertical-label">Campos ({tables.length})</span>
      </div>
    );
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();

  return (
    <aside className="pbi-panel fields-panel">
      {/* Panel Header */}
      <div className="pbi-panel-header">
        <div className="pbi-panel-title">
          <Database size={13} color="#4ec9b0" />
          <span>Campos</span>
          <span className="pbi-panel-badge">{tables.length} {tables.length === 1 ? "tabla" : "tablas"}</span>
        </div>
        <button
          className="pbi-panel-toggle"
          onClick={onToggleOpen}
          title="Colapsar panel de Campos"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Quick Search */}
      <div className="fields-search-box">
        <Search size={12} className="fields-search-icon" />
        <input
          type="text"
          className="fields-search-input"
          placeholder="Buscar campos o métricas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="fields-search-clear" onClick={() => setSearchTerm("")}>
            <X size={11} />
          </button>
        )}
      </div>

      {/* Tables Accordion List */}
      <div className="pbi-panel-scroll">
        {tables.length === 0 ? (
          <div className="fields-empty-prompt">
            <Upload size={24} color="#888888" />
            <p>No hay fuentes cargadas.</p>
            <label className="btn-load-csv-inline">
              <input
                type="file"
                accept=".csv"
                multiple
                onChange={onFileUpload}
                style={{ display: "none" }}
              />
              <Plus size={11} />
              <span>{isUploading ? "Cargando..." : "Cargar CSV"}</span>
            </label>
          </div>
        ) : (
          <>
            {tables.map((tbl) => {
              const expanded = isTableExpanded(tbl.name);
              const filteredCols = tbl.columns.filter((c) =>
                normalizedSearch === ""
                  ? true
                  : c.name.toLowerCase().includes(normalizedSearch) ||
                    tbl.name.toLowerCase().includes(normalizedSearch)
              );

              if (normalizedSearch !== "" && filteredCols.length === 0) {
                return null;
              }

              return (
                <div key={tbl.name} className="table-accordion-item">
                  {/* Table Header Row */}
                  <div className="table-accordion-header">
                    <button
                      className="table-expand-btn"
                      onClick={() => toggleTable(tbl.name)}
                      title={expanded ? "Colapsar tabla" : "Expandir tabla"}
                    >
                      {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      <Layers size={13} color="#007acc" />
                      <span className="table-name-text">{tbl.name}</span>
                    </button>

                    <div className="table-meta-actions">
                      <span className="table-row-count-chip">
                        {tbl.rowCount.toLocaleString()}
                      </span>
                      <button
                        className="btn-hotswap-icon"
                        onClick={() => onTriggerHotSwap(tbl.name)}
                        title={`Hot Swap: Reemplaza ${tbl.name} con un nuevo CSV sin perder configuraciones de visuales`}
                      >
                        <RefreshCw size={11} color="#4ec9b0" />
                      </button>
                    </div>
                  </div>

                  {/* Columns List (Draggable Items) */}
                  {expanded && (
                    <div className="columns-drag-list">
                      {filteredCols.map((col) => {
                        const isAssignedDim =
                          selectedChart?.tableName === tbl.name &&
                          selectedChart?.dimensionCol === col.name;
                        const isAssignedMetric =
                          selectedChart?.tableName === tbl.name &&
                          selectedChart?.metricCol === col.name;

                        return (
                          <div
                            key={col.name}
                            className={`column-drag-item ${isAssignedDim ? "active-dim" : ""} ${
                              isAssignedMetric ? "active-metric" : ""
                            }`}
                            draggable={true}
                            onDragStart={(e) => {
                              const payload: DraggedFieldPayload = {
                                tableName: tbl.name,
                                columnName: col.name,
                                dataType: col.type,
                              };
                              e.dataTransfer.setData("application/json", JSON.stringify(payload));
                              e.dataTransfer.setData("text/plain", col.name);
                              e.dataTransfer.effectAllowed = "copy";
                            }}
                            onClick={() => {
                              if (onFieldClick) {
                                onFieldClick({
                                  tableName: tbl.name,
                                  columnName: col.name,
                                  dataType: col.type,
                                });
                              }
                            }}
                            title={`Arrastra "${col.name}" a una zona de colocación o haz clic para asignarlo al visual`}
                          >
                            <div className="col-info">
                              {getFieldIcon(col.type)}
                              <span className="col-name">{col.name}</span>
                            </div>
                            {isAssignedDim && <span className="col-assigned-tag">Eje X</span>}
                            {isAssignedMetric && <span className="col-assigned-tag metric">Eje Y</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Virtual Relations Section */}
            {relations.length > 0 && (
              <div className="relations-accordion-section">
                <div className="relations-header">
                  <Link2 size={12} color="#cca700" />
                  <span>Vistas Relacionales (JOINs)</span>
                </div>
                <div className="relations-list">
                  {relations.map((rel) => (
                    <div key={rel.id} className="relation-item-chip">
                      <div className="relation-item-info">
                        <span className="relation-name">{rel.name}</span>
                        <span className="relation-type-badge">{rel.joinType}</span>
                      </div>
                      {onDeleteRelation && (
                        <button
                          className="btn-delete-relation"
                          onClick={() => onDeleteRelation(rel)}
                          title="Eliminar esta vista relacional de DuckDB"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with CSV Quick Loader */}
      <div className="fields-panel-footer">
        <label className="btn-upload-bottom" title="Cargar archivo CSV adicional en DuckDB">
          <input
            type="file"
            accept=".csv"
            multiple
            onChange={onFileUpload}
            style={{ display: "none" }}
          />
          <Plus size={12} />
          <span>Obtener Otro CSV</span>
        </label>
      </div>
    </aside>
  );
};
