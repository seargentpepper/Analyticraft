import { TableInfo } from "./duckdb";
import { TableRelation, ChartConfig, GlobalFilter } from "../types/dashboard";

/**
 * Heuristically determines if a table is a Fact table.
 */
function isFactTable(tableName: string, tables: TableInfo[]): boolean {
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
  const tbl = tables.find((t) => t.name === tableName);
  if (tbl) {
    const numCols = tbl.columns.filter((c) => c.type === "number").length;
    if (numCols >= tbl.columns.length / 2) return true;
    if (tbl.rowCount > 500) return true;
  }
  return false;
}

/**
 * Generates a comprehensive, highly-structured Markdown synthesis of the project's data model,
 * relations, and dashboard visualizations, optimized for review by an external LLM.
 */
export function generateModelSynthesisMarkdown(
  projectName: string,
  tables: TableInfo[],
  relations: TableRelation[],
  charts: ChartConfig[] = [],
  globalFilters: GlobalFilter[] = []
): string {
  const cleanName = projectName.replace(/\.analyticraft$/i, "");
  const now = new Date().toLocaleString();

  const dimTables = tables.filter((t) => !isFactTable(t.name, tables));
  const factTables = tables.filter((t) => isFactTable(t.name, tables));

  // Determine connected vs orphaned tables
  const connectedTableNames = new Set<string>();
  relations.forEach((r) => {
    connectedTableNames.add(r.sourceTable);
    connectedTableNames.add(r.targetTable);
  });
  const orphanedTables = tables.filter((t) => !connectedTableNames.has(t.name));

  let md = `# 📊 Síntesis Ejecutiva del Proyecto: ${cleanName}\n\n`;
  md += `> **Generado por Analyticraft Studio BI** | **Fecha:** ${now} | **Motor:** DuckDB Vectorizado en Memoria (Local-First)\n\n`;

  md += `## 1. Resumen Cuantitativo del Proyecto\n\n`;
  md += `| Métrica | Cantidad | Descripción |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| **Total de Tablas / Fuentes CSV** | ${tables.length} | Tablas base ingestadas en DuckDB |\n`;
  md += `| **Tablas de Dimensión (1)** | ${dimTables.length} | Catálogos descriptivos (Quién, Dónde, Cuándo) |\n`;
  md += `| **Tablas de Hechos (*)** | ${factTables.length} | Tablas transaccionales y acumulativas con métricas numéricas |\n`;
  md += `| **Relaciones Activas (JOINs)** | ${relations.length} | Vistas virtuales compiladas en DuckDB |\n`;
  md += `| **Tarjetas Visuales / KPIs** | ${charts.length} | Elementos visuales activos en el lienzo de informe |\n`;
  md += `| **Filtros Globales / Segmentadores** | ${globalFilters.length} | Filtros interactivos que cruzan el lienzo |\n`;
  md += `| **Tablas Huérfanas (Sin enlazar)** | ${orphanedTables.length} | ${orphanedTables.length === 0 ? "Ninguna (Modelo 100% conectado)" : orphanedTables.map((t) => `\`${t.name}\``).join(", ")} |\n\n`;

  md += `## 2. Catálogo Detallado de Tablas y Esquemas\n\n`;
  tables.forEach((tbl, idx) => {
    const isFact = isFactTable(tbl.name, tables);
    const degree = relations.filter(
      (r) => r.sourceTable === tbl.name || r.targetTable === tbl.name
    ).length;

    md += `### 2.${idx + 1}. Tabla \`${tbl.name}\`\n`;
    md += `- **Rol Arquitectónico:** ${isFact ? "⚡ Tabla de Hechos (Fact Table - Métrica/Transaccional)" : "🏷️ Tabla de Dimensión (Dimension Table - Filtro/Catálogo)"}\n`;
    md += `- **Registros:** ${tbl.rowCount.toLocaleString()} filas | **Columnas:** ${tbl.columns.length} campos | **Conexiones activas:** ${degree}\n`;
    md += `\n| Columna | Tipo de Dato | Clasificación Sugerida |\n`;
    md += `| :--- | :--- | :--- |\n`;

    tbl.columns.forEach((col) => {
      const isKey = relations.some(
        (r) =>
          (r.sourceTable === tbl.name && r.sourceColumn === col.name) ||
          (r.targetTable === tbl.name && r.targetColumn === col.name)
      );
      const roleLabel = isKey
        ? "🔑 Clave de Relación (PK / FK)"
        : col.type === "number"
        ? "🔢 Métrica Cuantitativa (SUM, AVG)"
        : col.type === "date"
        ? "📅 Dimensión Temporal"
        : "🔤 Atributo Categórico / Segmentador";

      md += `| \`${col.name}\` | \`${col.type}\` | ${roleLabel} |\n`;
    });
    md += `\n`;
  });

  md += `## 3. Matriz de Relaciones de Datos (JOINs)\n\n`;
  if (relations.length === 0) {
    md += `> ⚠️ **No hay relaciones activas configuradas.** Las tarjetas visuales consultan tablas de forma aislada sin propagación de filtros cruzados.\n\n`;
  } else {
    md += `| # | Tabla Origen (Dimensión / 1) | Columna Origen | Dirección | Tabla Destino (Hechos / *) | Columna Destino | Tipo de JOIN |\n`;
    md += `| :- | :--- | :--- | :-: | :--- | :--- | :--- |\n`;

    relations.forEach((rel, i) => {
      md += `| ${i + 1} | \`${rel.sourceTable}\` | \`${rel.sourceColumn}\` | ──▶ | \`${rel.targetTable}\` | \`${rel.targetColumn}\` | \`${rel.joinType || "LEFT"} JOIN\` |\n`;
    });
    md += `\n### 3.1. Interpretación Semántica en Lenguaje Natural\n`;
    relations.forEach((rel, i) => {
      md += `${i + 1}. **\`${rel.sourceTable}.${rel.sourceColumn}\` ──▶ \`${rel.targetTable}.${rel.targetColumn}\`:** Por cada registro único en \`${rel.sourceTable}\`, se filtran y consolidan transacciones en \`${rel.targetTable}\` mediante la clave común \`${rel.sourceColumn}\`.\n`;
    });
    md += `\n`;
  }

  md += `## 4. Visualizaciones y Métricas en el Lienzo de Informe\n\n`;
  if (charts.length === 0) {
    md += `> ℹ️ No hay tarjetas visuales construidas en el lienzo actual.\n\n`;
  } else {
    md += `| Título | Tipo de Visual | Tabla Fuente | Eje X (Dimensión) | Eje Y (Métrica) | Agregación |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    charts.forEach((c) => {
      md += `| **${c.title}** | \`${c.type}\` | \`${c.tableName}\` | \`${c.dimensionCol || "-"}\` | \`${c.metricCol || "-"}\` | \`${c.aggregation || "SUM"}\` |\n`;
    });
    md += `\n`;
  }

  if (globalFilters.length > 0) {
    md += `## 5. Filtros Globales y Segmentadores Activos\n\n`;
    md += `| Tabla | Columna | Operador | Valor Activo |\n`;
    md += `| :--- | :--- | :---: | :--- |\n`;
    globalFilters.forEach((f) => {
      md += `| \`${f.tableName}\` | \`${f.columnName}\` | \`${f.operator || "="}\` | **${f.value}** |\n`;
    });
    md += `\n`;
  }

  md += `## 6. 🤖 Instrucciones para el Auditor / Consultor LLM Externo\n\n`;
  md += `> **Copia y pega este documento directamente en tu LLM preferido (ChatGPT, Claude, Gemini, DeepSeek, etc.) con el siguiente prompt:**\n\n`;
  md += `\`\`\`text\n`;
  md += `Hola. Soy un analista de datos utilizando Analyticraft (una solución analítica local-first basada en DuckDB).\n`;
  md += `Te comparto la síntesis estructurada de mi proyecto analítico arriba.\n\n`;
  md += `Como Arquitecto de Datos y Consultor Senior de Business Intelligence, por favor realiza una auditoría completa del entregable y responde los siguientes puntos:\n\n`;
  md += `1. CALIDAD DEL MODELO ENTIDAD-RELACIÓN:\n`;
  md += `   - ¿El esquema en estrella (Star Schema) está bien concebido o detectas relaciones cruzadas riesgosas (bucles o referencias circulares)?\n`;
  md += `   - ${orphanedTables.length > 0 ? `Tengo ${orphanedTables.length} tablas huérfanas sin conectar (${orphanedTables.map((t) => t.name).join(", ")}). ¿Con qué tablas de hechos o dimensiones deberían unirse?` : "Mis tablas están completamente conectadas. ¿Qué optimizaciones sugieres?"}\n\n`;
  md += `2. PROPUESTAS DE MÉTRICAS Y KPIS DE ALTO IMPACTO:\n`;
  md += `   - Basándote en las columnas numéricas y categóricas de mis tablas, ¿qué 3 a 5 KPIs clave (ej. Margen de Contribución, Rotación, Ticket Promedio, CAC, EBITDA) me recomiendas construir?\n\n`;
  md += `3. MEJORA DEL DISEÑO Y ERGONOMÍA VISUAL:\n`;
  md += `   - Revisa mi lista de tarjetas visuales. ¿Son adecuados los tipos de gráfico (barras, líneas, donas, KPIs) para las métricas elegidas?\n`;
  md += `   - ¿Qué preguntas de negocio clave no estoy respondiendo aún con mi informe actual?\n`;
  md += `\`\`\`\n`;

  return md;
}

/**
 * Downloads the Markdown synthesis as a `.md` file and copies the raw text to clipboard.
 */
export async function downloadAndCopyModelSynthesis(
  projectName: string,
  tables: TableInfo[],
  relations: TableRelation[],
  charts: ChartConfig[] = [],
  globalFilters: GlobalFilter[] = []
): Promise<{ success: boolean; copied: boolean }> {
  const cleanName = projectName.replace(/\.analyticraft$/i, "");
  const markdown = generateModelSynthesisMarkdown(
    projectName,
    tables,
    relations,
    charts,
    globalFilters
  );

  let copied = false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(markdown);
      copied = true;
    }
  } catch (err) {
    console.warn("No se pudo copiar al portapapeles:", err);
  }

  // Trigger file download
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cleanName}_sintesis_modelo.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, copied };
}
