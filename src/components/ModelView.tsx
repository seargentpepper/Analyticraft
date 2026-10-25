import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Database,
  Link2,
  Trash2,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Sparkles,
  ArrowRight,
  GitBranch,
  Wand2,
  SlidersHorizontal,
  ArrowLeftRight,
  Check,
  X,
  HelpCircle,
} from "lucide-react";
import { TableInfo } from "../lib/duckdb";
import { TableRelation } from "../types/dashboard";

interface ModelViewProps {
  tables: TableInfo[];
  relations: TableRelation[];
  onAddRelation: (
    sourceTable: string,
    sourceCol: string,
    targetTable: string,
    targetCol: string,
    joinType?: "LEFT" | "INNER"
  ) => Promise<void>;
  onUpdateRelation?: (
    relationId: string,
    newSourceTable: string,
    newSourceCol: string,
    newTargetTable: string,
    newTargetCol: string,
    newJoinType: "LEFT" | "INNER"
  ) => Promise<void>;
  onDeleteRelation: (relation: TableRelation) => Promise<void>;
  onOpenJoinModal: () => void;
  showNotification: (msg: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

export interface DetectedCandidate {
  sourceTable: string;
  sourceCol: string;
  targetTable: string;
  targetCol: string;
  reason: string;
  confidence: number;
}

const CARD_WIDTH = 250;
const CARD_HEADER_HEIGHT = 38;
const FIELD_ROW_HEIGHT = 26;

export const ModelView: React.FC<ModelViewProps> = ({
  tables,
  relations,
  onAddRelation,
  onUpdateRelation,
  onDeleteRelation,
  onOpenJoinModal,
  showNotification,
}) => {
  const [positions, setPositions] = useState<Record<string, NodePosition>>({});
  const [zoom, setZoom] = useState<number>(1);
  const [activeDraggingNode, setActiveDraggingNode] = useState<{
    tableName: string;
    startX: number;
    startY: number;
    initialNodeX: number;
    initialNodeY: number;
  } | null>(null);

  const [draggedColumn, setDraggedColumn] = useState<{
    tableName: string;
    columnName: string;
    type: string;
  } | null>(null);

  const [dropHoverColumn, setDropHoverColumn] = useState<{
    tableName: string;
    columnName: string;
  } | null>(null);

  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null);

  // Fase 8: Newbie-Friendly State
  const [suggestedCandidates, setSuggestedCandidates] = useState<DetectedCandidate[]>([]);
  const [editingRelation, setEditingRelation] = useState<TableRelation | null>(null);

  // Edit JOIN modal form states
  const [editSourceTable, setEditSourceTable] = useState("");
  const [editSourceCol, setEditSourceCol] = useState("");
  const [editTargetTable, setEditTargetTable] = useState("");
  const [editTargetCol, setEditTargetCol] = useState("");
  const [editJoinType, setEditJoinType] = useState<"LEFT" | "INNER">("LEFT");

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Set of column keys highlighted by auto-detection ("tableName.colName")
  const highlightedColumnKeys = useMemo(() => {
    const keys = new Set<string>();
    suggestedCandidates.forEach((s) => {
      keys.add(`${s.sourceTable}.${s.sourceCol}`);
      keys.add(`${s.targetTable}.${s.targetCol}`);
    });
    return keys;
  }, [suggestedCandidates]);

  // Heuristic Fact vs Dimension classification
  const isFactTable = useCallback(
    (tableName: string): boolean => {
      const tbl = tables.find((t) => t.name === tableName);
      if (!tbl) return false;
      const lower = tableName.toLowerCase();
      if (
        lower.includes("venta") ||
        lower.includes("fact") ||
        lower.includes("sales") ||
        lower.includes("order") ||
        lower.includes("transac")
      ) {
        return true;
      }
      const isSource = relations.some((r) => r.sourceTable === tableName);
      if (isSource) return true;

      const maxRows = Math.max(...tables.map((t) => t.rowCount));
      return tbl.rowCount === maxRows && tables.length > 1;
    },
    [tables, relations]
  );

  // Auto-arrange in Star Schema layout (Radial)
  const handleStarLayout = useCallback(() => {
    if (tables.length === 0) return;

    const factTbl = tables.find((t) => isFactTable(t.name)) || tables[0];
    const dimTables = tables.filter((t) => t.name !== factTbl.name);

    const centerX = 440;
    const centerY = 200;
    const radiusX = 360;
    const radiusY = 220;

    const newPositions: Record<string, NodePosition> = {
      [factTbl.name]: { x: centerX, y: centerY },
    };

    dimTables.forEach((dim, idx) => {
      const angle = (2 * Math.PI * idx) / Math.max(dimTables.length, 1) - Math.PI / 2;
      const x = Math.round(centerX + radiusX * Math.cos(angle));
      const y = Math.round(centerY + radiusY * Math.sin(angle));
      newPositions[dim.name] = { x: Math.max(40, x), y: Math.max(40, y) };
    });

    setPositions(newPositions);
    showNotification("Esquema en estrella auto-distribuido");
  }, [tables, isFactTable, showNotification]);

  // Fase 8: Auto-Alineación en Cascada (Dimensiones arriba, Hechos abajo)
  const handleCascadeLayout = useCallback(() => {
    if (tables.length === 0) return;

    // Dimensions: tables that are not primary fact
    const factTables = tables.filter((t) => isFactTable(t.name));
    const dimTables = tables.filter((t) => !isFactTable(t.name));

    const newPositions: Record<string, NodePosition> = {};
    const colSpacing = CARD_WIDTH + 50;

    // 1. Place Dimensions in Top Row (y = 60)
    dimTables.forEach((dim, idx) => {
      newPositions[dim.name] = {
        x: 60 + idx * colSpacing,
        y: 60,
      };
    });

    // 2. Place Fact Tables in Bottom Row (y = 420)
    const totalDimWidth = dimTables.length * colSpacing;
    const factStartX = Math.max(60, (totalDimWidth - factTables.length * colSpacing) / 2);

    factTables.forEach((fact, idx) => {
      newPositions[fact.name] = {
        x: Math.round(factStartX + idx * colSpacing),
        y: 420,
      };
    });

    setPositions(newPositions);
    showNotification("Alineación en Cascada aplicada: Dimensiones arriba, Hechos abajo");
  }, [tables, isFactTable, showNotification]);

  // Fase 8: Algoritmo Heurístico de Detección de Relaciones
  const handleAutoDetectRelations = useCallback(() => {
    if (tables.length < 2) {
      showNotification("Carga al menos dos tablas para detectar relaciones.");
      return;
    }

    const detected: DetectedCandidate[] = [];

    // Helper to normalize column names: removes prefixes/suffixes
    const normalize = (name: string) => {
      return name
        .toLowerCase()
        .replace(/^(id_|cod_|pk_|fk_|c_)/, "")
        .replace(/(_id|_key|_pk|_fk|key|id)$/, "");
    };

    for (let i = 0; i < tables.length; i++) {
      for (let j = i + 1; j < tables.length; j++) {
        const tableA = tables[i];
        const tableB = tables[j];

        tableA.columns.forEach((colA) => {
          tableB.columns.forEach((colB) => {
            // Check if relation already exists between these columns
            const alreadyExists = relations.some(
              (r) =>
                (r.sourceTable === tableA.name &&
                  r.sourceColumn === colA.name &&
                  r.targetTable === tableB.name &&
                  r.targetColumn === colB.name) ||
                (r.sourceTable === tableB.name &&
                  r.sourceColumn === colB.name &&
                  r.targetTable === tableA.name &&
                  r.targetColumn === colA.name)
            );
            if (alreadyExists) return;

            // Data type compatibility check
            if (colA.type !== colB.type) return;

            const nameA = colA.name.toLowerCase();
            const nameB = colB.name.toLowerCase();

            let matched = false;
            let reason = "";
            let confidence = 0;

            // Rule 1: Exact match on ID or key column
            if (
              nameA === nameB &&
              (nameA.includes("id") ||
                nameA.includes("key") ||
                nameA.includes("cod") ||
                nameA.includes("clave"))
            ) {
              matched = true;
              reason = `Mismo nombre de columna clave: "${colA.name}"`;
              confidence = 0.95;
            }
            // Rule 2: Table name matching foreign key (e.g. clientes -> id_cliente)
            else if (
              nameA.includes(normalize(tableB.name)) ||
              nameB.includes(normalize(tableA.name))
            ) {
              matched = true;
              reason = `Coincidencia semántica con nombre de tabla`;
              confidence = 0.9;
            }
            // Rule 3: Normalized stem equivalence
            else {
              const stemA = normalize(nameA);
              const stemB = normalize(nameB);
              if (stemA.length >= 3 && stemA === stemB) {
                matched = true;
                reason = `Claves normalizadas coincidentes: "${stemA}"`;
                confidence = 0.85;
              }
            }

            if (matched) {
              // Fact table becomes source, Dimension becomes target
              const aIsFact = isFactTable(tableA.name);
              const sourceTable = aIsFact ? tableA.name : tableB.name;
              const sourceCol = aIsFact ? colA.name : colB.name;
              const targetTable = aIsFact ? tableB.name : tableA.name;
              const targetCol = aIsFact ? colB.name : colA.name;

              // Avoid duplicate suggestions in list
              if (
                !detected.some(
                  (d) =>
                    d.sourceTable === sourceTable &&
                    d.sourceCol === sourceCol &&
                    d.targetTable === targetTable &&
                    d.targetCol === targetCol
                )
              ) {
                detected.push({
                  sourceTable,
                  sourceCol,
                  targetTable,
                  targetCol,
                  reason,
                  confidence,
                });
              }
            }
          });
        });
      }
    }

    if (detected.length === 0) {
      showNotification("No se detectaron nuevas relaciones potenciales entre las tablas.");
      setSuggestedCandidates([]);
    } else {
      setSuggestedCandidates(detected);
      showNotification(`Se detectaron ${detected.length} relaciones potenciales con resplandor dorado.`);
    }
  }, [tables, relations, isFactTable, showNotification]);

  // Connect single detected suggestion
  const handleApplySingleSuggestion = async (sug: DetectedCandidate) => {
    await onAddRelation(sug.sourceTable, sug.sourceCol, sug.targetTable, sug.targetCol);
    setSuggestedCandidates((prev) =>
      prev.filter(
        (s) =>
          !(
            s.sourceTable === sug.sourceTable &&
            s.sourceCol === sug.sourceCol &&
            s.targetTable === sug.targetTable &&
            s.targetCol === sug.targetCol
          )
      )
    );
  };

  // Connect all detected suggestions in bulk
  const handleApplyAllSuggestions = async () => {
    for (const sug of suggestedCandidates) {
      await onAddRelation(sug.sourceTable, sug.sourceCol, sug.targetTable, sug.targetCol);
    }
    setSuggestedCandidates([]);
    showNotification("Todas las relaciones detectadas han sido conectadas en DuckDB.");
  };

  // Open Edit JOIN Modal
  const handleOpenEditModal = (rel: TableRelation) => {
    setEditingRelation(rel);
    setEditSourceTable(rel.sourceTable);
    setEditSourceCol(rel.sourceColumn);
    setEditTargetTable(rel.targetTable);
    setEditTargetCol(rel.targetColumn);
    setEditJoinType(rel.joinType || "LEFT");
  };

  // Swap Direction in Edit Modal
  const handleSwapEditDirection = () => {
    const tempTbl = editSourceTable;
    const tempCol = editSourceCol;
    setEditSourceTable(editTargetTable);
    setEditSourceCol(editTargetCol);
    setEditTargetTable(tempTbl);
    setEditTargetCol(tempCol);
  };

  // Save changes from Edit JOIN Modal
  const handleSaveEditJoin = async () => {
    if (!editingRelation) return;
    if (onUpdateRelation) {
      await onUpdateRelation(
        editingRelation.id,
        editSourceTable,
        editSourceCol,
        editTargetTable,
        editTargetCol,
        editJoinType
      );
    }
    setEditingRelation(null);
  };

  // Initialize positions on first load
  useEffect(() => {
    if (tables.length > 0 && Object.keys(positions).length === 0) {
      handleStarLayout();
    }
  }, [tables, positions, handleStarLayout]);

  // Window drag listeners for moving nodes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeDraggingNode) return;
      const deltaX = (e.clientX - activeDraggingNode.startX) / zoom;
      const deltaY = (e.clientY - activeDraggingNode.startY) / zoom;

      setPositions((prev) => ({
        ...prev,
        [activeDraggingNode.tableName]: {
          x: Math.max(20, Math.round(activeDraggingNode.initialNodeX + deltaX)),
          y: Math.max(20, Math.round(activeDraggingNode.initialNodeY + deltaY)),
        },
      }));
    };

    const handleMouseUp = () => {
      if (activeDraggingNode) {
        setActiveDraggingNode(null);
      }
    };

    if (activeDraggingNode) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeDraggingNode, zoom]);

  // Calculate connection coordinates for SVG lines
  const connectorPaths = useMemo(() => {
    return relations.map((rel) => {
      const sPos = positions[rel.sourceTable] || { x: 100, y: 100 };
      const tPos = positions[rel.targetTable] || { x: 450, y: 100 };

      const sTable = tables.find((t) => t.name === rel.sourceTable);
      const tTable = tables.find((t) => t.name === rel.targetTable);

      const sColIdx = sTable
        ? Math.max(
            0,
            sTable.columns.findIndex((c) => c.name === rel.sourceColumn)
          )
        : 0;
      const tColIdx = tTable
        ? Math.max(
            0,
            tTable.columns.findIndex((c) => c.name === rel.targetColumn)
          )
        : 0;

      const sColY = sPos.y + CARD_HEADER_HEIGHT + sColIdx * FIELD_ROW_HEIGHT + FIELD_ROW_HEIGHT / 2;
      const tColY = tPos.y + CARD_HEADER_HEIGHT + tColIdx * FIELD_ROW_HEIGHT + FIELD_ROW_HEIGHT / 2;

      const isSourceLeft = sPos.x < tPos.x;
      const x1 = isSourceLeft ? sPos.x + CARD_WIDTH : sPos.x;
      const y1 = sColY;
      const x2 = isSourceLeft ? tPos.x : tPos.x + CARD_WIDTH;
      const y2 = tColY;

      const dx = Math.abs(x2 - x1) * 0.55;
      const cx1 = isSourceLeft ? x1 + dx : x1 - dx;
      const cy1 = y1;
      const cx2 = isSourceLeft ? x2 - dx : x2 + dx;
      const cy2 = y2;

      const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      return {
        relation: rel,
        pathData,
        x1,
        y1,
        x2,
        y2,
        midX,
        midY,
      };
    });
  }, [relations, positions, tables]);

  return (
    <div className="model-view-container">
      {/* 1. Control Toolbar */}
      <div className="model-toolbar">
        <div className="model-toolbar-left">
          <div className="model-toolbar-title-group">
            <Link2 size={16} color="#4ec9b0" />
            <span className="model-title-text">Vista de Modelo Relacional</span>
            <span className="model-tables-count-chip">
              {tables.length} {tables.length === 1 ? "tabla" : "tablas"} · {relations.length}{" "}
              {relations.length === 1 ? "relación" : "relaciones"}
            </span>
          </div>
        </div>

        <div className="model-toolbar-actions">
          {/* Zoom controls */}
          <div className="model-zoom-controls">
            <button
              className="model-tool-btn"
              onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
              title="Alejar (Zoom Out)"
            >
              <ZoomOut size={13} />
            </button>
            <span className="model-zoom-level">{Math.round(zoom * 100)}%</span>
            <button
              className="model-tool-btn"
              onClick={() => setZoom((z) => Math.min(1.6, Math.round((z + 0.1) * 10) / 10))}
              title="Acercar (Zoom In)"
            >
              <ZoomIn size={13} />
            </button>
            <button
              className="model-tool-btn"
              onClick={() => setZoom(1)}
              title="Restablecer escala al 100%"
            >
              <Maximize2 size={12} />
            </button>
          </div>

          {/* Fase 8: Auto-Detect Relations */}
          <button
            className={`model-action-btn ${suggestedCandidates.length > 0 ? "active-sug" : "secondary"}`}
            onClick={handleAutoDetectRelations}
            title="Analiza claves primarias y foráneas coincidentes y sugiere conexiones"
          >
            <Wand2 size={12} color="#f59e0b" />
            <span>Auto-Detectar</span>
          </button>

          {/* Star Schema Layout */}
          <button
            className="model-tool-btn-layout"
            onClick={handleStarLayout}
            title="Distribuir radialmente en esquema de estrella"
          >
            <Sparkles size={11} color="#cca700" />
            <span>Estrella</span>
          </button>

          {/* Fase 8: Cascade Layout */}
          <button
            className="model-tool-btn-layout"
            onClick={handleCascadeLayout}
            title="Distribuir en cascada: Dimensiones arriba, Hechos abajo"
          >
            <GitBranch size={11} color="#4ec9b0" />
            <span>Cascada</span>
          </button>

          {/* New Relation Modal */}
          <button
            className="model-action-btn primary"
            onClick={onOpenJoinModal}
            disabled={tables.length < 2}
            title="Abrir asistente de relación asistido"
          >
            <Plus size={13} />
            <span>Nueva Relación</span>
          </button>
        </div>
      </div>

      {/* 2. Drag & Drop Helper Prompt Banner */}
      <div className="model-drag-instructions-strip">
        <Info size={13} color="#9cdcfe" />
        <span>
          <strong>Asistente Newbie-Friendly:</strong> Arrastra cualquier columna de una tabla sobre
          otra para vincularlas, o usa <strong>Auto-Detectar</strong> para encontrar relaciones clave
          automáticamente.
        </span>
      </div>

      {/* 3. Floating Auto-Detection Banner (Fase 8) */}
      {suggestedCandidates.length > 0 && (
        <div className="model-suggestions-banner">
          <div className="suggestions-header">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Wand2 size={13} color="#f59e0b" />
              <span className="suggestions-title">
                {suggestedCandidates.length} relaciones sugeridas automáticamente:
              </span>
            </div>
            <button
              className="suggestions-close-btn"
              onClick={() => setSuggestedCandidates([])}
              title="Cerrar sugerencias"
            >
              <X size={12} />
            </button>
          </div>

          <div className="suggestions-list">
            {suggestedCandidates.map((sug, i) => (
              <div key={i} className="suggestion-item-row">
                <div className="suggestion-cols">
                  <span
                    className="sug-pill fact"
                    title={`Tabla de Hechos: ${sug.sourceTable}, columna: ${sug.sourceCol}`}
                  >
                    {sug.sourceTable}.{sug.sourceCol} (*)
                  </span>
                  <ArrowRight size={10} color="#4ec9b0" />
                  <span
                    className="sug-pill dim"
                    title={`Tabla de Dimensión: ${sug.targetTable}, columna: ${sug.targetCol}`}
                  >
                    {sug.targetTable}.{sug.targetCol} (1)
                  </span>
                  <span className="sug-reason-text">({sug.reason})</span>
                </div>
                <button
                  className="btn-apply-sug"
                  onClick={() => handleApplySingleSuggestion(sug)}
                  title="Conectar esta relación"
                >
                  <Check size={11} />
                  <span>Conectar</span>
                </button>
              </div>
            ))}
          </div>

          <div className="suggestions-footer">
            <button className="btn-apply-all-sug" onClick={handleApplyAllSuggestions}>
              <Sparkles size={12} />
              <span>Conectar Todas ({suggestedCandidates.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Infinite Workspace Canvas */}
      <div className="model-canvas-viewport" ref={canvasRef}>
        <div
          className="model-canvas-surface"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* SVG Connectors Layer */}
          <svg className="model-connectors-svg">
            <defs>
              <marker
                id="arrow-right"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4ec9b0" />
              </marker>
            </defs>

            {connectorPaths.map(({ relation, pathData, x1, y1, x2, y2, midX, midY }) => {
              const isSelected = selectedRelationId === relation.id;

              return (
                <g
                  key={relation.id}
                  className={`relation-svg-group ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedRelationId(isSelected ? null : relation.id)}
                >
                  {/* Outer glow stroke for selection/hover */}
                  <path
                    d={pathData}
                    className="relation-line-glow"
                    strokeWidth={isSelected ? 6 : 4}
                  />

                  {/* Main connection curve */}
                  <path
                    d={pathData}
                    className="relation-line-main"
                    strokeWidth={isSelected ? 2.5 : 2}
                  />

                  {/* Cardinality Badge: Many (*) on Source / Fact with Natural Language Tooltip */}
                  <g transform={`translate(${x1 - 10}, ${y1 - 10})`}>
                    <title>
                      {`Lado "*" (Muchos / Hechos): La tabla '${relation.sourceTable}' puede contener múltiples filas asociadas al campo '${relation.sourceColumn}'.`}
                    </title>
                    <rect
                      x="0"
                      y="0"
                      width="18"
                      height="18"
                      rx="3"
                      className="cardinality-rect fact"
                    />
                    <text x="9" y="13" textAnchor="middle" className="cardinality-text">
                      *
                    </text>
                  </g>

                  {/* Cardinality Badge: One (1) on Target / Dim with Natural Language Tooltip */}
                  <g transform={`translate(${x2 - 8}, ${y2 - 10})`}>
                    <title>
                      {`Lado "1" (Clave Única / Dimensión): Cada registro en la tabla '${relation.targetTable}' es único para el campo '${relation.targetColumn}'.`}
                    </title>
                    <rect
                      x="0"
                      y="0"
                      width="18"
                      height="18"
                      rx="3"
                      className="cardinality-rect dim"
                    />
                    <text x="9" y="12" textAnchor="middle" className="cardinality-text">
                      1
                    </text>
                  </g>

                  {/* Directional Center Pill with Natural Language Tooltip */}
                  <g transform={`translate(${midX - 35}, ${midY - 12})`}>
                    <title>
                      {`Relación 1 a Muchos: Un registro en '${relation.targetTable}' filtra múltiples filas en '${relation.sourceTable}'. El filtro fluye hacia los Hechos.`}
                    </title>
                    <rect
                      x="0"
                      y="0"
                      width="70"
                      height="22"
                      rx="11"
                      className="relation-mid-pill"
                    />
                    <text x="30" y="14" textAnchor="middle" className="relation-mid-text">
                      1 : *
                    </text>
                    <path
                      d="M 46 11 L 52 11 M 49 8 L 52 11 L 49 14"
                      stroke="#4ec9b0"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Table Entity Nodes */}
          {tables.map((tbl) => {
            const pos = positions[tbl.name] || { x: 50, y: 50 };
            const isFact = isFactTable(tbl.name);

            return (
              <div
                key={tbl.name}
                className={`model-table-node ${isFact ? "fact-node" : "dim-node"}`}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  width: `${CARD_WIDTH}px`,
                }}
              >
                {/* Node Header (Draggable Handle) */}
                <div
                  className="model-node-header"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setActiveDraggingNode({
                      tableName: tbl.name,
                      startX: e.clientX,
                      startY: e.clientY,
                      initialNodeX: pos.x,
                      initialNodeY: pos.y,
                    });
                  }}
                  title="Arrastra para mover la tabla en el lienzo"
                >
                  <div className="model-node-title-group">
                    <Database
                      size={13}
                      color={isFact ? "#007acc" : "#cca700"}
                      style={{ flexShrink: 0 }}
                    />
                    <span className="model-node-name" title={tbl.name}>
                      {tbl.name}
                    </span>
                  </div>

                  <span className={`node-classification-tag ${isFact ? "fact" : "dim"}`}>
                    {isFact ? "Hechos" : "Dimensión"}
                  </span>
                </div>

                {/* Node Columns List */}
                <div className="model-node-columns-list">
                  {tbl.columns.map((col) => {
                    const isKeyInRelation = relations.some(
                      (r) =>
                        (r.sourceTable === tbl.name && r.sourceColumn === col.name) ||
                        (r.targetTable === tbl.name && r.targetColumn === col.name)
                    );

                    const isDropTarget =
                      dropHoverColumn?.tableName === tbl.name &&
                      dropHoverColumn?.columnName === col.name;

                    const isHighlightedCandidate = highlightedColumnKeys.has(
                      `${tbl.name}.${col.name}`
                    );

                    const isTypeNumber = col.type === "number";

                    return (
                      <div
                        key={col.name}
                        className={`model-column-item ${isKeyInRelation ? "connected" : ""} ${
                          isDropTarget ? "drop-active" : ""
                        } ${isHighlightedCandidate ? "column-detected-aura" : ""}`}
                        draggable={true}
                        onDragStart={(e) => {
                          setDraggedColumn({
                            tableName: tbl.name,
                            columnName: col.name,
                            type: col.type,
                          });
                          e.dataTransfer.setData(
                            "application/json",
                            JSON.stringify({
                              tableName: tbl.name,
                              columnName: col.name,
                              dataType: col.type,
                            })
                          );
                        }}
                        onDragOver={(e) => {
                          if (draggedColumn && draggedColumn.tableName !== tbl.name) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "link";
                            setDropHoverColumn({
                              tableName: tbl.name,
                              columnName: col.name,
                            });
                          }
                        }}
                        onDragLeave={() => {
                          setDropHoverColumn(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDropHoverColumn(null);
                          if (!draggedColumn) return;
                          if (draggedColumn.tableName === tbl.name) return;

                          const sourceIsFact = isFactTable(draggedColumn.tableName);
                          const sourceTable = sourceIsFact ? draggedColumn.tableName : tbl.name;
                          const sourceCol = sourceIsFact
                            ? draggedColumn.columnName
                            : col.name;
                          const targetTable = sourceIsFact ? tbl.name : draggedColumn.tableName;
                          const targetCol = sourceIsFact
                            ? col.name
                            : draggedColumn.columnName;

                          onAddRelation(sourceTable, sourceCol, targetTable, targetCol);
                          setDraggedColumn(null);
                        }}
                        title={
                          isHighlightedCandidate
                            ? `✨ Clave coincidente detectada: ${col.name}`
                            : `Arrastra para relacionar con otra tabla (${col.type})`
                        }
                      >
                        <div className="column-left-info">
                          <span className={`col-type-dot ${isTypeNumber ? "num" : "str"}`}>
                            {isTypeNumber ? "#" : "Abc"}
                          </span>
                          <span className="model-col-name">{col.name}</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          {isHighlightedCandidate && (
                            <span className="aura-sparkle-dot" title="Sugerencia activa">
                              ✨
                            </span>
                          )}
                          {isKeyInRelation && (
                            <div className="column-key-indicator" title="Llave de relación activa">
                              <Link2 size={10} color="#f59e0b" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Node Footer: Row Count */}
                <div className="model-node-footer">
                  <span>{tbl.rowCount.toLocaleString()} registros</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Active Relation Inspector Drawer */}
      {selectedRelationId && (
        <div className="model-relation-inspector">
          {(() => {
            const rel = relations.find((r) => r.id === selectedRelationId);
            if (!rel) return null;

            return (
              <div className="inspector-card">
                <div className="inspector-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Link2 size={13} color="#4ec9b0" />
                    <span className="inspector-title">Detalles de Relación Activa</span>
                  </div>
                  <button
                    className="inspector-close-btn"
                    onClick={() => setSelectedRelationId(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="inspector-body">
                  <div className="inspector-rel-flow">
                    <span className="rel-tag fact">
                      {rel.sourceTable}.{rel.sourceColumn} (*)
                    </span>
                    <ArrowRight size={12} color="#4ec9b0" />
                    <span className="rel-tag dim">
                      {rel.targetTable}.{rel.targetColumn} (1)
                    </span>
                  </div>

                  {/* Natural Language Explanation */}
                  <div className="inspector-natural-lang-box">
                    <HelpCircle size={11} color="#9cdcfe" style={{ flexShrink: 0 }} />
                    <span>
                      Un registro único de <strong>{rel.targetTable}</strong> puede estar asociado a
                      múltiples filas en <strong>{rel.sourceTable}</strong>.
                    </span>
                  </div>

                  <div className="inspector-meta-row">
                    <span className="meta-label">Vista Virtual en DuckDB:</span>
                    <code className="meta-code">{rel.name}</code>
                  </div>
                  <div className="inspector-meta-row">
                    <span className="meta-label">Tipo de Unión:</span>
                    <span className="meta-value">{rel.joinType} JOIN</span>
                  </div>

                  {/* Action Buttons: Edit JOIN Modal & Delete */}
                  <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                    <button
                      className="btn-edit-rel"
                      onClick={() => handleOpenEditModal(rel)}
                      title="Modificar tipo de unión o invertir dirección"
                    >
                      <SlidersHorizontal size={11} />
                      <span>Editar JOIN</span>
                    </button>

                    <button
                      className="btn-delete-rel"
                      style={{ flex: 1, marginTop: 0 }}
                      onClick={() => {
                        onDeleteRelation(rel);
                        setSelectedRelationId(null);
                      }}
                      title="Eliminar esta vista virtual de DuckDB"
                    >
                      <Trash2 size={11} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 6. Modal de Edición de JOIN (Fase 8) */}
      {editingRelation && (
        <div className="modal-overlay" onClick={() => setEditingRelation(null)}>
          <div className="modal-dialog-edit-join" onClick={(e) => e.stopPropagation()}>
            <div className="edit-join-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SlidersHorizontal size={15} color="#4ec9b0" />
                <span className="edit-join-title">Editar Relación (JOIN)</span>
              </div>
              <button
                className="edit-join-close"
                onClick={() => setEditingRelation(null)}
              >
                ✕
              </button>
            </div>

            <div className="edit-join-body">
              {/* Direction Swapper Button */}
              <div className="swap-direction-banner">
                <button
                  type="button"
                  className="btn-swap-join-direction"
                  onClick={handleSwapEditDirection}
                  title="Intercambiar tabla de origen y destino"
                >
                  <ArrowLeftRight size={12} />
                  <span>Invertir Dirección de la Relación</span>
                </button>
              </div>

              {/* Source (Fact / Many side) */}
              <div className="edit-join-row">
                <label className="edit-join-label">
                  <span className="label-badge fact">Tabla de Hechos (Origen *):</span>
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  <select
                    className="edit-join-select"
                    value={editSourceTable}
                    onChange={(e) => {
                      setEditSourceTable(e.target.value);
                      const tbl = tables.find((t) => t.name === e.target.value);
                      if (tbl) setEditSourceCol(tbl.columns[0]?.name || "");
                    }}
                  >
                    {tables.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="edit-join-select"
                    value={editSourceCol}
                    onChange={(e) => setEditSourceCol(e.target.value)}
                  >
                    {tables
                      .find((t) => t.name === editSourceTable)
                      ?.columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} [{c.type}]
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Target (Dim / One side) */}
              <div className="edit-join-row">
                <label className="edit-join-label">
                  <span className="label-badge dim">Tabla de Dimensión (Destino 1):</span>
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  <select
                    className="edit-join-select"
                    value={editTargetTable}
                    onChange={(e) => {
                      setEditTargetTable(e.target.value);
                      const tbl = tables.find((t) => t.name === e.target.value);
                      if (tbl) setEditTargetCol(tbl.columns[0]?.name || "");
                    }}
                  >
                    {tables.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="edit-join-select"
                    value={editTargetCol}
                    onChange={(e) => setEditTargetCol(e.target.value)}
                  >
                    {tables
                      .find((t) => t.name === editTargetTable)
                      ?.columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} [{c.type}]
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Join Type Selector */}
              <div className="edit-join-row">
                <label className="edit-join-label">Tipo de Unión SQL:</label>
                <div className="join-type-cards-group">
                  <label
                    className={`join-type-card ${editJoinType === "LEFT" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="joinType"
                      checked={editJoinType === "LEFT"}
                      onChange={() => setEditJoinType("LEFT")}
                    />
                    <div>
                      <div className="join-type-title">LEFT JOIN (Recomendado)</div>
                      <div className="join-type-desc">
                        Conserva todas las filas de la tabla de hechos, anexando los atributos de la
                        dimensión si coinciden.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`join-type-card ${editJoinType === "INNER" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="joinType"
                      checked={editJoinType === "INNER"}
                      onChange={() => setEditJoinType("INNER")}
                    />
                    <div>
                      <div className="join-type-title">INNER JOIN (Estricto)</div>
                      <div className="join-type-desc">
                        Conserva exclusivamente registros donde la clave coincida en ambas tablas.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="edit-join-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setEditingRelation(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-save-join"
                onClick={handleSaveEditJoin}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
