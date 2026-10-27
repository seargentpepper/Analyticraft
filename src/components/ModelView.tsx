import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Database,
  Link2,
  Trash2,
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
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronsUpDown,
  BookOpen,
} from "lucide-react";
import { TableInfo } from "../lib/duckdb";
import { TableRelation, ChartConfig, GlobalFilter } from "../types/dashboard";
import { ModelExplanationModal } from "./ModelExplanationModal";
import { downloadAndCopyModelSynthesis } from "../lib/modelSynthesis";

interface NodePosition {
  x: number;
  y: number;
}

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
  showNotification: (msg: string) => void;
  savedPositions?: Record<string, NodePosition>;
  onSavePositions?: (positions: Record<string, NodePosition>) => void;
  projectName?: string;
  charts?: ChartConfig[];
  globalFilters?: GlobalFilter[];
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
  showNotification,
  savedPositions,
  onSavePositions,
  projectName,
  charts,
  globalFilters,
}) => {
  const [positions, setPositions] = useState<Record<string, NodePosition>>(savedPositions || {});
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    setPositions(savedPositions || {});
  }, [savedPositions]);

  const handleExportSynthesis = async () => {
    try {
      const res = await downloadAndCopyModelSynthesis(
        projectName || "Analyticraft_Project",
        tables,
        relations,
        charts || [],
        globalFilters || []
      );
      if (res.copied) {
        showNotification("Síntesis del modelo descargada en .md y copiada al portapapeles para consultar a un LLM");
      } else {
        showNotification("Síntesis del modelo descargada en archivo .md");
      }
    } catch (err: any) {
      showNotification("Error al generar síntesis: " + err.message);
    }
  };
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

  // Table view modes: el modo compacto se retiró de la barra (la vista siempre es detallada);
  // se conservan los colapsos individuales, el colapso global y el enfoque por tabla.
  const isCompactMode = false;
  const [expandedTableNames, setExpandedTableNames] = useState<Set<string>>(new Set());
  const [collapsedTableNames, setCollapsedTableNames] = useState<Set<string>>(new Set());
  const [focusedTable, setFocusedTable] = useState<string | null>(null);
  const [showExplanationModal, setShowExplanationModal] = useState<boolean>(false);

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

  // Toggle individual table expansion in compact mode
  const toggleTableExpanded = (tableName: string) => {
    setExpandedTableNames((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  };

  // Toggle individual table collapse to header
  const toggleTableCollapsed = (tableName: string) => {
    setCollapsedTableNames((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  };

  // Toggle collapse state for all tables at once
  const handleToggleAllCollapsed = () => {
    if (collapsedTableNames.size === tables.length) {
      setCollapsedTableNames(new Set());
    } else {
      setCollapsedTableNames(new Set(tables.map((t) => t.name)));
    }
  };

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
        lower.includes("transac") ||
        lower.includes("gasto") ||
        lower.includes("inventario") ||
        lower.includes("logistica") ||
        lower.includes("flujo")
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

  // Auto-fit all positioned tables into viewport
  const handleFitToScreen = useCallback(
    (customPositions?: Record<string, NodePosition>) => {
      const posMap = customPositions || positions;
      const tableNames = Object.keys(posMap);
      if (tableNames.length === 0) return;

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      tableNames.forEach((name) => {
        const p = posMap[name];
        if (!p) return;
        const tbl = tables.find((t) => t.name === name);
        const isCollapsed = collapsedTableNames.has(name);
        const isExp = expandedTableNames.has(name) || !isCompactMode;
        const colCount = tbl?.columns.length || 6;
        const h = isCollapsed ? 38 : (isExp ? Math.min(320, 70 + colCount * 24) : 130);
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x + CARD_WIDTH);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y + h);
      });

      const totalW = maxX - minX + 160;
      const totalH = maxY - minY + 160;

      const viewportW = canvasRef.current?.clientWidth || window.innerWidth - 120;
      const viewportH = canvasRef.current?.clientHeight || window.innerHeight - 200;

      const scaleX = viewportW / totalW;
      const scaleY = viewportH / totalH;
      const optimalZoom = Math.min(1.1, Math.max(0.42, Math.min(scaleX, scaleY)));

      setZoom(Math.round(optimalZoom * 100) / 100);

      if (canvasRef.current) {
        canvasRef.current.scrollTo({
          left: Math.max(0, minX * optimalZoom - 40),
          top: Math.max(0, minY * optimalZoom - 40),
          behavior: "smooth",
        });
      }
    },
    [positions, tables, isCompactMode, expandedTableNames, collapsedTableNames]
  );

  // 1. Limpiar y Organizar Vista: Cuadrícula multinivel balanceada anti-solapamiento
  const handleCleanAndOrganizeLayout = useCallback(() => {
    if (tables.length === 0) return;

    // Helper to calculate approximate height of a table node
    const getTableHeight = (tbl: TableInfo) => {
      if (collapsedTableNames.has(tbl.name)) {
        return CARD_HEADER_HEIGHT;
      }
      const isExp = expandedTableNames.has(tbl.name) || !isCompactMode;
      if (!isExp) {
        const relColCount = tbl.columns.filter((col) =>
          relations.some(
            (r) =>
              (r.sourceTable === tbl.name && r.sourceColumn === col.name) ||
              (r.targetTable === tbl.name && r.targetColumn === col.name)
          )
        ).length;
        return CARD_HEADER_HEIGHT + Math.max(1, relColCount) * FIELD_ROW_HEIGHT + 35;
      }
      const visibleCols = Math.min(tbl.columns.length, 8);
      return CARD_HEADER_HEIGHT + visibleCols * FIELD_ROW_HEIGHT + 30;
    };

    const getDegree = (name: string) =>
      relations.filter((r) => r.sourceTable === name || r.targetTable === name).length;

    const dimTables = tables.filter((t) => !isFactTable(t.name));
    const factTables = tables.filter((t) => isFactTable(t.name));

    // Sort by connectivity so related tables stay close
    dimTables.sort((a, b) => getDegree(b.name) - getDegree(a.name));
    factTables.sort((a, b) => getDegree(b.name) - getDegree(a.name));

    const newPositions: Record<string, NodePosition> = {};
    const colSpacing = CARD_WIDTH + 65; // 315px
    const MAX_COLS_PER_ROW = tables.length > 8 ? 4 : 3;

    let currentY = 50;

    // 1. Distribute Dimensions in top rows
    if (dimTables.length > 0) {
      const dimRowsCount = Math.ceil(dimTables.length / MAX_COLS_PER_ROW);
      for (let r = 0; r < dimRowsCount; r++) {
        const rowTables = dimTables.slice(r * MAX_COLS_PER_ROW, (r + 1) * MAX_COLS_PER_ROW);
        let maxRowH = 0;
        rowTables.forEach((tbl, colIdx) => {
          newPositions[tbl.name] = {
            x: 60 + colIdx * colSpacing,
            y: currentY,
          };
          maxRowH = Math.max(maxRowH, getTableHeight(tbl));
        });
        currentY += maxRowH + 60;
      }
    }

    // Buffer between Dimensions and Fact tables
    currentY += 25;

    // 2. Distribute Facts in bottom rows
    if (factTables.length > 0) {
      const factRowsCount = Math.ceil(factTables.length / MAX_COLS_PER_ROW);
      for (let r = 0; r < factRowsCount; r++) {
        const rowTables = factTables.slice(r * MAX_COLS_PER_ROW, (r + 1) * MAX_COLS_PER_ROW);
        let maxRowH = 0;
        rowTables.forEach((tbl, colIdx) => {
          newPositions[tbl.name] = {
            x: 60 + colIdx * colSpacing,
            y: currentY,
          };
          maxRowH = Math.max(maxRowH, getTableHeight(tbl));
        });
        currentY += maxRowH + 60;
      }
    }

    setPositions(newPositions);
    if (onSavePositions) onSavePositions(newPositions);

    setTimeout(() => {
      handleFitToScreen(newPositions);
    }, 60);

    showNotification(
      `Vista organizada limpiamente: ${tables.length} tablas distribuidas en cuadrícula multinivel sin solapamientos`
    );
  }, [tables, relations, isFactTable, isCompactMode, expandedTableNames, onSavePositions, handleFitToScreen, showNotification]);

  // 2. Auto-arrange in Star Schema layout (Radial con órbitas concéntricas amplias y anti-colisión)
  const handleStarLayout = useCallback(() => {
    if (tables.length === 0) return;

    const getDegree = (name: string) =>
      relations.filter((r) => r.sourceTable === name || r.targetTable === name).length;

    const sortedByDegree = [...tables].sort((a, b) => getDegree(b.name) - getDegree(a.name));
    const hubTable = sortedByDegree[0];
    const otherTables = tables.filter((t) => t.name !== hubTable.name);

    const newPositions: Record<string, NodePosition> = {};

    if (otherTables.length <= 6) {
      const centerX = 560;
      const centerY = 420;
      const radiusX = 490;
      const radiusY = 360;

      newPositions[hubTable.name] = { x: centerX, y: centerY };

      otherTables.forEach((tbl, idx) => {
        const angle = (2 * Math.PI * idx) / otherTables.length - Math.PI / 2;
        newPositions[tbl.name] = {
          x: Math.max(40, Math.round(centerX + radiusX * Math.cos(angle))),
          y: Math.max(40, Math.round(centerY + radiusY * Math.sin(angle))),
        };
      });
    } else {
      // 2 Órbitas Concéntricas amplias para modelos complejos con separación anti-solapamiento
      const centerX = 820;
      const centerY = 580;
      newPositions[hubTable.name] = { x: centerX, y: centerY };

      const innerCount = Math.min(5, Math.ceil(otherTables.length / 2));
      const innerTables = otherTables.slice(0, innerCount);
      const outerTables = otherTables.slice(innerCount);

      const innerRadiusX = 520;
      const innerRadiusY = 390;

      innerTables.forEach((tbl, idx) => {
        const angle = (2 * Math.PI * idx) / innerTables.length - Math.PI / 2;
        newPositions[tbl.name] = {
          x: Math.max(40, Math.round(centerX + innerRadiusX * Math.cos(angle))),
          y: Math.max(40, Math.round(centerY + innerRadiusY * Math.sin(angle))),
        };
      });

      const outerRadiusX = 940;
      const outerRadiusY = 660;

      outerTables.forEach((tbl, idx) => {
        const angle = (2 * Math.PI * idx) / outerTables.length - Math.PI / 2 + Math.PI / outerTables.length;
        newPositions[tbl.name] = {
          x: Math.max(40, Math.round(centerX + outerRadiusX * Math.cos(angle))),
          y: Math.max(40, Math.round(centerY + outerRadiusY * Math.sin(angle))),
        };
      });
    }

    // Pase de relajación anti-colisión
    const names = Object.keys(newPositions);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const posA = newPositions[names[i]];
        const posB = newPositions[names[j]];
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        if (Math.abs(dx) < CARD_WIDTH + 20 && Math.abs(dy) < 140) {
          if (dx >= 0) posB.x += CARD_WIDTH + 30 - dx;
          else posB.x -= CARD_WIDTH + 30 + dx;
        }
      }
    }

    setPositions(newPositions);
    if (onSavePositions) onSavePositions(newPositions);
    setTimeout(() => handleFitToScreen(newPositions), 60);
    showNotification(`Esquema en estrella balanceado: '${hubTable.name}' en el centro sin solapamientos`);
  }, [tables, relations, onSavePositions, handleFitToScreen, showNotification]);

  // 3. Auto-Alineación en Cascada multinivel (Dimensiones arriba, Hechos abajo)
  const handleCascadeLayout = useCallback(() => {
    if (tables.length === 0) return;

    const factTables = tables.filter((t) => isFactTable(t.name));
    const dimTables = tables.filter((t) => !isFactTable(t.name));

    const newPositions: Record<string, NodePosition> = {};
    const colSpacing = CARD_WIDTH + 65;
    const MAX_PER_ROW = 4;

    let currentY = 50;

    const dimRows = Math.ceil(dimTables.length / MAX_PER_ROW);
    for (let r = 0; r < dimRows; r++) {
      const slice = dimTables.slice(r * MAX_PER_ROW, (r + 1) * MAX_PER_ROW);
      slice.forEach((tbl, idx) => {
        newPositions[tbl.name] = {
          x: 60 + idx * colSpacing,
          y: currentY,
        };
      });
      currentY += (isCompactMode ? 140 : 280) + 60;
    }

    currentY += 30;

    const factRows = Math.ceil(factTables.length / MAX_PER_ROW);
    for (let r = 0; r < factRows; r++) {
      const slice = factTables.slice(r * MAX_PER_ROW, (r + 1) * MAX_PER_ROW);
      slice.forEach((tbl, idx) => {
        newPositions[tbl.name] = {
          x: 60 + idx * colSpacing,
          y: currentY,
        };
      });
      currentY += (isCompactMode ? 140 : 280) + 60;
    }

    setPositions(newPositions);
    if (onSavePositions) onSavePositions(newPositions);
    setTimeout(() => handleFitToScreen(newPositions), 60);
    showNotification("Alineación en Cascada multinivel aplicada");
  }, [tables, isFactTable, isCompactMode, onSavePositions, handleFitToScreen, showNotification]);

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

  // Initialize positions on first load: clean & organize automatically
  useEffect(() => {
    if (tables.length > 0 && Object.keys(positions).length === 0) {
      handleCleanAndOrganizeLayout();
    }
  }, [tables, positions, handleCleanAndOrganizeLayout]);

  // Window drag listeners for moving nodes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeDraggingNode) return;
      const deltaX = (e.clientX - activeDraggingNode.startX) / zoom;
      const deltaY = (e.clientY - activeDraggingNode.startY) / zoom;

      const updated = {
        ...positions,
        [activeDraggingNode.tableName]: {
          x: Math.max(20, Math.round(activeDraggingNode.initialNodeX + deltaX)),
          y: Math.max(20, Math.round(activeDraggingNode.initialNodeY + deltaY)),
        },
      };
      setPositions(updated);
    };

    const handleMouseUp = () => {
      if (activeDraggingNode) {
        setActiveDraggingNode(null);
        if (onSavePositions) onSavePositions(positions);
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
  }, [activeDraggingNode, zoom, positions, onSavePositions]);

  // Calculate connection coordinates for SVG lines with compact mode awareness
  const connectorPaths = useMemo(() => {
    const getVisibleColIdx = (tblName: string, colName: string) => {
      const tbl = tables.find((t) => t.name === tblName);
      if (!tbl) return 0;
      const isExp = expandedTableNames.has(tbl.name) || !isCompactMode;
      if (isExp) {
        const idx = tbl.columns.findIndex((c) => c.name === colName);
        return Math.min(Math.max(0, idx), 8);
      }
      const visibleCols = tbl.columns.filter((c) =>
        relations.some(
          (r) =>
            (r.sourceTable === tbl.name && r.sourceColumn === c.name) ||
            (r.targetTable === tbl.name && r.targetColumn === c.name)
        )
      );
      const idx = visibleCols.findIndex((c) => c.name === colName);
      return Math.min(Math.max(0, idx), 8);
    };

    return relations.map((rel) => {
      const sPos = positions[rel.sourceTable] || { x: 100, y: 100 };
      const tPos = positions[rel.targetTable] || { x: 450, y: 100 };

      const sIsCollapsed = collapsedTableNames.has(rel.sourceTable);
      const tIsCollapsed = collapsedTableNames.has(rel.targetTable);

      const sColIdx = getVisibleColIdx(rel.sourceTable, rel.sourceColumn);
      const tColIdx = getVisibleColIdx(rel.targetTable, rel.targetColumn);

      const sColY = sIsCollapsed
        ? sPos.y + CARD_HEADER_HEIGHT / 2
        : sPos.y + CARD_HEADER_HEIGHT + Math.min(sColIdx, 7) * FIELD_ROW_HEIGHT + FIELD_ROW_HEIGHT / 2;

      const tColY = tIsCollapsed
        ? tPos.y + CARD_HEADER_HEIGHT / 2
        : tPos.y + CARD_HEADER_HEIGHT + Math.min(tColIdx, 7) * FIELD_ROW_HEIGHT + FIELD_ROW_HEIGHT / 2;

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
  }, [relations, positions, tables, isCompactMode, expandedTableNames, collapsedTableNames]);

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
            {relations.length === 0 && (
              <span
                style={{
                  fontSize: "0.64rem",
                  color: "#f59e0b",
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  padding: "2px 7px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                title="Aún no hay relaciones activas. Usa Auto-Detectar para conectarlas automáticamente."
              >
                ⚠️ Sin enlaces activos
              </span>
            )}
          </div>
        </div>

        <div className="model-toolbar-actions">
          {/* Grupo 1 · Vista: zoom y ajuste (ley de proximidad / región común) */}
          <div className="model-btn-group" role="group" aria-label="Zoom del diagrama">
            <button
              className="model-btn icon-only"
              onClick={() => setZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))}
              title="Alejar (Zoom Out)"
            >
              <ZoomOut size={13} />
            </button>
            <span className="model-btn model-zoom-level" aria-live="polite">
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="model-btn icon-only"
              onClick={() => setZoom((z) => Math.min(1.6, Math.round((z + 0.1) * 10) / 10))}
              title="Acercar (Zoom In)"
            >
              <ZoomIn size={13} />
            </button>
            <button
              className="model-btn icon-only"
              onClick={() => handleFitToScreen()}
              title="Ajustar todas las tablas al lienzo (Fit to Screen)"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          {/* Grupo 2 · Disposición de tablas */}
          <div className="model-btn-group" role="group" aria-label="Disposición de tablas">
            <button
              className="model-btn"
              onClick={handleCleanAndOrganizeLayout}
              title="Limpiar y Organizar Vista: Distribuye automáticamente todas las tablas en una cuadrícula multinivel balanceada sin solapamientos"
            >
              <LayoutGrid size={13} />
              <span>Organizar</span>
            </button>
            <button
              className="model-btn"
              onClick={handleStarLayout}
              title="Distribuir radialmente en órbitas concéntricas sin solapamiento"
            >
              <Sparkles size={13} />
              <span>Estrella</span>
            </button>
            <button
              className="model-btn"
              onClick={handleCascadeLayout}
              title="Distribuir en cascada multinivel: Dimensiones arriba, Hechos abajo"
            >
              <GitBranch size={13} />
              <span>Cascada</span>
            </button>
            <button
              className="model-btn"
              onClick={handleToggleAllCollapsed}
              title={
                collapsedTableNames.size === tables.length
                  ? "Expandir todas las tablas para ver sus columnas"
                  : "Colapsar todas las tablas a solo cabeceras"
              }
            >
              <ChevronsUpDown size={13} />
              <span>{collapsedTableNames.size === tables.length ? "Expandir" : "Colapsar"}</span>
            </button>
          </div>

          {/* Grupo 3 · Asistentes del modelo */}
          <div className="model-btn-group" role="group" aria-label="Asistentes del modelo">
            <button
              className="model-btn"
              onClick={() => setShowExplanationModal(true)}
              title="Aprende cómo interactúan tus tablas: Explicación didáctica de dimensiones, hechos y relaciones (Sin tecnicismos)"
            >
              <BookOpen size={13} />
              <span>Explicar</span>
            </button>
            <button
              className={`model-btn ${suggestedCandidates.length > 0 ? "is-active" : ""}`}
              onClick={handleAutoDetectRelations}
              title="Analiza claves primarias y foráneas coincidentes y sugiere conexiones"
            >
              <Wand2 size={13} />
              <span>Auto-Detectar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Drag & Drop Helper Prompt Banner */}
      <div className="model-drag-instructions-strip">
        <Info size={13} color="#9cdcfe" />
        <span>
          <strong>Asistente de Modelo:</strong> Arrastra columnas entre tablas para vincularlas. Usa <strong>Organizar Vista</strong> para desenredar diagramas complejos o posa el cursor sobre una tabla para enfocar solo sus relaciones.
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
              const isConnectedToFocus =
                !focusedTable ||
                relation.sourceTable === focusedTable ||
                relation.targetTable === focusedTable;
              const isProminent = isSelected || (focusedTable !== null && isConnectedToFocus);

              // Line opacity: if focused, dim non-connected lines heavily to 0.08
              const lineOpacity = focusedTable
                ? (isConnectedToFocus ? 1 : 0.08)
                : (relations.length > 20 ? 0.45 : 0.85);

              // Hide mid-pills when crowded unless focused/selected
              const showMidPill = relations.length <= 15 || isProminent || isSelected;

              return (
                <g
                  key={relation.id}
                  className={`relation-svg-group ${isSelected ? "selected" : ""} ${isProminent ? "prominent" : ""}`}
                  style={{ opacity: lineOpacity, transition: "opacity 0.2s ease" }}
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
                    strokeWidth={isProminent ? 2.5 : 1.8}
                    style={{
                      stroke: isProminent ? "#38bdf8" : "#4ec9b0",
                    }}
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

                  {/* Directional Center Pill with Natural Language Tooltip (Hidden when crowded) */}
                  {showMidPill && (
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
                  )}
                </g>
              );
            })}
          </svg>

          {/* Table Entity Nodes */}
          {tables.map((tbl) => {
            const pos = positions[tbl.name] || { x: 50, y: 50 };
            const isFact = isFactTable(tbl.name);
            const isTableExpanded = expandedTableNames.has(tbl.name) || !isCompactMode;
            const isCollapsed = collapsedTableNames.has(tbl.name);

            // Columns to display (in compact mode, show only fields in relations)
            const columnsToDisplay = isTableExpanded
              ? tbl.columns
              : tbl.columns.filter((col) =>
                  relations.some(
                    (r) =>
                      (r.sourceTable === tbl.name && r.sourceColumn === col.name) ||
                      (r.targetTable === tbl.name && r.targetColumn === col.name)
                  )
                );

            const hiddenCount = tbl.columns.length - columnsToDisplay.length;
            const isFocused = focusedTable === tbl.name;

            return (
              <div
                key={tbl.name}
                className={`model-table-node ${isFact ? "fact-node" : "dim-node"} ${isFocused ? "focused" : ""} ${isCollapsed ? "collapsed" : ""}`}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  width: `${CARD_WIDTH}px`,
                }}
                onMouseEnter={() => setFocusedTable(tbl.name)}
                onMouseLeave={() => setFocusedTable((curr) => (curr === tbl.name ? null : curr))}
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
                    <button
                      className="model-header-collapse-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTableCollapsed(tbl.name);
                      }}
                      title={isCollapsed ? "Expandir tabla" : "Colapsar tabla a cabecera"}
                    >
                      {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                    </button>
                    <Database
                      size={13}
                      color={isFact ? "#007acc" : "#cca700"}
                      style={{ flexShrink: 0 }}
                    />
                    <span className="model-node-name" title={tbl.name}>
                      {tbl.name}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span className={`node-classification-tag ${isFact ? "fact" : "dim"}`}>
                      {isFact ? "Hechos" : "Dimensión"}
                    </span>
                    {isCollapsed && (
                      <span style={{ fontSize: "0.6rem", color: "#888888", fontWeight: 700 }}>
                        {tbl.rowCount.toLocaleString()} r
                      </span>
                    )}
                    {isCompactMode && !isCollapsed && (
                      <button
                        className="model-node-collapse-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTableExpanded(tbl.name);
                        }}
                        title={isTableExpanded ? "Compactar tabla" : "Expandir todas las columnas"}
                      >
                        {isTableExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Node Columns List & Footer */}
                {!isCollapsed && (
                  <>
                    <div className="model-node-columns-list">
                      {columnsToDisplay.map((col) => {
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

                  {/* Expander / Collapser footer button in compact mode */}
                  {isCompactMode && hiddenCount > 0 && (
                    <button
                      className="model-expand-columns-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTableExpanded(tbl.name);
                      }}
                      title="Expandir todas las columnas de esta tabla"
                    >
                      <span>+ {hiddenCount} campos adicionales</span>
                      <ChevronDown size={10} />
                    </button>
                  )}
                  {isCompactMode && isTableExpanded && tbl.columns.length > columnsToDisplay.length && (
                    <button
                      className="model-expand-columns-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTableExpanded(tbl.name);
                      }}
                      title="Compactar a solo claves de relación"
                    >
                      <span>Compactar tabla</span>
                      <ChevronUp size={10} />
                    </button>
                  )}
                </div>

                {/* Node Footer: Row Count */}
                <div className="model-node-footer">
                  <span>{tbl.rowCount.toLocaleString()} registros</span>
                </div>
                  </>
                )}
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

      {/* 7. Modal de Explicación Didáctica del Modelo (Newbies / No-LLM) */}
      <ModelExplanationModal
        isOpen={showExplanationModal}
        onClose={() => setShowExplanationModal(false)}
        tables={tables}
        relations={relations}
        onAutoDetectRelations={handleAutoDetectRelations}
        onExportSynthesis={handleExportSynthesis}
      />
    </div>
  );
};
