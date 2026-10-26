import React from "react";
import {
  X,
  BookOpen,
  Sparkles,
  Link2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Filter,
  FileDown,
} from "lucide-react";
import { TableInfo } from "../lib/duckdb";
import { TableRelation } from "../types/dashboard";

interface ModelExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableInfo[];
  relations: TableRelation[];
  onAutoDetectRelations?: () => void;
  onExportSynthesis?: () => void;
}

export const ModelExplanationModal: React.FC<ModelExplanationModalProps> = ({
  isOpen,
  onClose,
  tables,
  relations,
  onAutoDetectRelations,
  onExportSynthesis,
}) => {
  if (!isOpen) return null;

  // Clasificación determinista de hechos vs dimensiones
  const isFact = (tableName: string) => {
    const lower = tableName.toLowerCase();
    return (
      lower.includes("ventas") ||
      lower.includes("sales") ||
      lower.includes("fact") ||
      lower.includes("movimientos") ||
      lower.includes("gastos") ||
      lower.includes("costos") ||
      lower.includes("logistica") ||
      lower.includes("inventario") ||
      lower.includes("flujo_caja") ||
      lower.includes("transacciones") ||
      lower.includes("orders") ||
      lower.includes("envios")
    );
  };

  const dimTables = tables.filter((t) => !isFact(t.name));
  const factTables = tables.filter((t) => isFact(t.name));

  // Tablas huérfanas (sin ninguna relación activa)
  const connectedTableNames = new Set<string>();
  relations.forEach((r) => {
    connectedTableNames.add(r.sourceTable);
    connectedTableNames.add(r.targetTable);
  });
  const orphanTables = tables.filter((t) => !connectedTableNames.has(t.name));

  // Generador de explicación semántica en lenguaje natural
  const getSemanticRelationExplanation = (rel: TableRelation) => {
    const dim = rel.targetTable;
    const dimCol = rel.targetColumn;
    const fact = rel.sourceTable;
    const factCol = rel.sourceColumn;

    return `Al vincular '${dim}' con '${fact}' mediante la clave común '${dimCol}' = '${factCol}', cualquier visual o gráfico que agrupe por atributos descriptivos de '${dim}' calculará automáticamente las métricas de '${fact}'.`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1e1e1e",
          border: "1px solid #3e3e42",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "88vh",
          color: "#d4d4d4",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.7)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #333333",
            background: "#252526",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                background: "rgba(78, 201, 176, 0.15)",
                border: "1px solid rgba(78, 201, 176, 0.3)",
                borderRadius: "6px",
                padding: "6px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <BookOpen size={18} color="#4ec9b0" />
            </div>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>
                Comprensión del Modelo Relacional
              </h2>
              <div style={{ fontSize: "0.72rem", color: "#888888", marginTop: "2px" }}>
                Guía conceptual Newbie-Friendly: Aprende cómo interactúan tus tablas y cómo fluyen los datos
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#858585",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.1rem",
            overflowY: "auto",
          }}
        >
          {/* 1. Quick Stats Overview Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            <div
              style={{
                background: "#252526",
                border: "1px solid #3c3c3c",
                borderRadius: "6px",
                padding: "10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "#888888", fontWeight: 600 }}>Total Tablas</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ffffff", marginTop: "2px" }}>
                {tables.length}
              </div>
            </div>

            <div
              style={{
                background: "rgba(204, 167, 0, 0.08)",
                border: "1px solid rgba(204, 167, 0, 0.3)",
                borderRadius: "6px",
                padding: "10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "#eab308", fontWeight: 700 }}>Dimensiones (1)</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fbbf24", marginTop: "2px" }}>
                {dimTables.length}
              </div>
            </div>

            <div
              style={{
                background: "rgba(0, 122, 204, 0.08)",
                border: "1px solid rgba(0, 122, 204, 0.3)",
                borderRadius: "6px",
                padding: "10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "#38bdf8", fontWeight: 700 }}>Hechos / Métricas (*)</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#38bdf8", marginTop: "2px" }}>
                {factTables.length}
              </div>
            </div>

            <div
              style={{
                background: relations.length > 0 ? "rgba(78, 201, 176, 0.08)" : "rgba(239, 68, 68, 0.08)",
                border: relations.length > 0 ? "1px solid rgba(78, 201, 176, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "6px",
                padding: "10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  color: relations.length > 0 ? "#4ec9b0" : "#f87171",
                  fontWeight: 700,
                }}
              >
                Relaciones Activas
              </div>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: relations.length > 0 ? "#4ec9b0" : "#f87171",
                  marginTop: "2px",
                }}
              >
                {relations.length}
              </div>
            </div>
          </div>

          {/* 2. Regla de Oro: Dimensiones vs Hechos (Estilo Power BI) */}
          <div
            style={{
              background: "#252526",
              border: "1px solid #3c3c3c",
              borderRadius: "6px",
              padding: "12px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <HelpCircle size={15} color="#4ec9b0" />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
                Regla de Oro: ¿Qué significa "Dimensiones = Hechos"?
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
              {/* Columna Dimensión */}
              <div
                style={{
                  background: "#1e1e1e",
                  border: "1px solid #cca700",
                  borderRadius: "5px",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      background: "#cca700",
                      color: "#000000",
                      fontWeight: 800,
                      fontSize: "0.65rem",
                      padding: "2px 6px",
                      borderRadius: "3px",
                    }}
                  >
                    1 : DIMENSIÓN
                  </span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ffffff" }}>
                    Tablas de Catálogo (Filtros)
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#cccccc", lineHeight: 1.45, marginTop: "6px" }}>
                  • <strong>¿Qué son?</strong> Entidades únicas: Clientes, Productos, Vendedores, Almacenes.<br />
                  • <strong>¿Para qué sirven?</strong> Responden a <em>¿Quién?</em>, <em>¿Qué?</em>, <em>¿Dónde?</em> y <em>¿Cuándo?</em>.<br />
                  • <strong>En gráficos:</strong> Se colocan en el <strong>Eje X (Categoría)</strong> o como segmentadores de datos.
                </div>
              </div>

              {/* Columna Hechos */}
              <div
                style={{
                  background: "#1e1e1e",
                  border: "1px solid #007acc",
                  borderRadius: "5px",
                  padding: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      background: "#007acc",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "0.65rem",
                      padding: "2px 6px",
                      borderRadius: "3px",
                    }}
                  >
                    * : HECHOS
                  </span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ffffff" }}>
                    Tablas Transaccionales (Métricas)
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#cccccc", lineHeight: 1.45, marginTop: "6px" }}>
                  • <strong>¿Qué son?</strong> Procesos y operaciones continuas: Ventas, Envíos, Gastos, Saldo de Caja, Inventario.<br />
                  • <strong>¿Para qué sirven?</strong> Contienen los números y montos a sumar o promediar.<br />
                  • <strong>En gráficos:</strong> Se colocan en el <strong>Eje Y (Métrica/Valores)</strong> con funciones <code>SUM</code>, <code>AVG</code> o <code>COUNT</code>.
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "10px",
                background: "rgba(0,0,0,0.3)",
                padding: "8px 10px",
                borderRadius: "4px",
                fontSize: "0.72rem",
                color: "#9cdcfe",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Filter size={13} color="#38bdf8" style={{ flexShrink: 0 }} />
              <span>
                <strong>Flujo del Filtrado:</strong> Las dimensiones filtran a los hechos (<code>1 ──▶ *</code>). Cuando seleccionas un cliente o producto, el dashboard filtra únicamente las transacciones correspondientes en ventas o envíos.
              </span>
            </div>
          </div>

          {/* 3. Síntesis de Relaciones Activas */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Link2 size={15} color="#4ec9b0" />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>
                  Síntesis de Relaciones del Modelo ({relations.length})
                </span>
              </div>
            </div>

            {relations.length === 0 ? (
              <div
                style={{
                  background: "rgba(234, 179, 8, 0.08)",
                  border: "1px dashed rgba(234, 179, 8, 0.4)",
                  borderRadius: "6px",
                  padding: "16px",
                  textAlign: "center",
                }}
              >
                <AlertTriangle size={24} color="#eab308" style={{ margin: "0 auto 8px auto" }} />
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>
                  Aún no tienes relaciones activas en este proyecto
                </div>
                <div style={{ fontSize: "0.73rem", color: "#a0a0a0", marginTop: "4px", maxWidth: "480px", margin: "4px auto 12px auto" }}>
                  Tus tablas funcionan de forma aislada. Para que tus gráficos crucen ventas por cliente o gastos por almacén, vincula las columnas clave.
                </div>
                {onAutoDetectRelations && (
                  <button
                    onClick={() => {
                      onAutoDetectRelations();
                      onClose();
                    }}
                    style={{
                      background: "linear-gradient(180deg, #cca700 0%, #a38200 100%)",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 14px",
                      color: "#000000",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Auto-Detectar Relaciones Ahora</span>
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "240px", overflowY: "auto" }}>
                {relations.map((rel, idx) => (
                  <div
                    key={rel.id || idx}
                    style={{
                      background: "#252526",
                      border: "1px solid #333333",
                      borderRadius: "5px",
                      padding: "8px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            background: "rgba(204, 167, 0, 0.2)",
                            color: "#fbbf24",
                            border: "1px solid rgba(204, 167, 0, 0.4)",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "3px",
                          }}
                        >
                          {rel.targetTable} ({rel.targetColumn})
                        </span>
                        <ArrowRight size={13} color="#4ec9b0" />
                        <span
                          style={{
                            background: "rgba(0, 122, 204, 0.2)",
                            color: "#38bdf8",
                            border: "1px solid rgba(0, 122, 204, 0.4)",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "3px",
                          }}
                        >
                          {rel.sourceTable} ({rel.sourceColumn})
                        </span>
                      </div>
                      <span style={{ fontSize: "0.65rem", color: "#888888", fontWeight: 700 }}>
                        {rel.joinType || "LEFT"} JOIN (1 : *)
                      </span>
                    </div>

                    <div style={{ fontSize: "0.7rem", color: "#aaaaaa", lineHeight: 1.35, marginTop: "2px" }}>
                      {getSemanticRelationExplanation(rel)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Tablas Huérfanas (Aisladas) */}
          {orphanTables.length > 0 && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "6px",
                padding: "10px 12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f87171", fontWeight: 700, fontSize: "0.78rem" }}>
                <AlertTriangle size={14} />
                <span>Tablas Aisladas en el Modelo ({orphanTables.length}):</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "#cccccc", marginTop: "4px", lineHeight: 1.4 }}>
                Las siguientes tablas no tienen relaciones activas registradas:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                {orphanTables.map((t) => (
                  <span
                    key={t.name}
                    style={{
                      background: "#1e1e1e",
                      border: "1px solid #552222",
                      color: "#fca5a5",
                      fontSize: "0.68rem",
                      padding: "2px 8px",
                      borderRadius: "3px",
                      fontWeight: 600,
                    }}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#888888", marginTop: "6px" }}>
                💡 <em>Consejo: Arrastra columnas en común para integrarlas o pulsa '✨ Auto-Detectar' en la barra de herramientas.</em>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.85rem 1.25rem",
            borderTop: "1px solid #333333",
            background: "#252526",
            display: "flex",
            justifyContent: onExportSynthesis ? "space-between" : "flex-end",
            alignItems: "center",
          }}
        >
          {onExportSynthesis && (
            <button
              onClick={onExportSynthesis}
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid #10b981",
                borderRadius: "4px",
                padding: "6px 14px",
                color: "#10b981",
                fontWeight: 700,
                fontSize: "0.76rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Descarga la síntesis del modelo en .md y la copia al portapapeles para consultar a un LLM externo (ChatGPT, Claude, etc.)"
            >
              <FileDown size={14} />
              <span>Exportar Síntesis para LLM (.md)</span>
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: "#007acc",
              border: "1px solid #1177bb",
              borderRadius: "4px",
              padding: "6px 16px",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
