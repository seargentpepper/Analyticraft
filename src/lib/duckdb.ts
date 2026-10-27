import * as duckdb from "@duckdb/duckdb-wasm";

// Cache singleton on global/window so Vite HMR module re-evaluations do not wipe in-memory DuckDB tables
const g = typeof window !== "undefined" ? (window as any) : (globalThis as any);

export async function getDuckDB(): Promise<{
  db: duckdb.AsyncDuckDB;
  conn: duckdb.AsyncDuckDBConnection;
}> {
  if (g.__analyticraft_duckdb__ && g.__analyticraft_conn__) {
    return { db: g.__analyticraft_duckdb__, conn: g.__analyticraft_conn__ };
  }

  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

  const worker_url = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], {
      type: "text/javascript",
    })
  );

  const worker = new Worker(worker_url);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);

  const conn = await db.connect();
  g.__analyticraft_duckdb__ = db;
  g.__analyticraft_conn__ = conn;

  return { db, conn };
}

export interface ColumnSchema {
  name: string;
  type: "number" | "string" | "date" | "boolean";
}

export interface TableInfo {
  name: string;
  fileName: string;
  rowCount: number;
  columns: ColumnSchema[];
  lastUpdated: string;
  isView?: boolean;
}

// In-memory registry of raw CSV contents for project packaging and offline portability
const rawCsvCache = new Map<string, { fileName: string; content: string }>();

export function getRegisteredCSVs(): Map<string, { fileName: string; content: string }> {
  return rawCsvCache;
}

export function setRegisteredCSV(tableName: string, fileName: string, content: string): void {
  rawCsvCache.set(tableName, { fileName, content });
}

export function clearRegisteredCSVs(): void {
  rawCsvCache.clear();
}

export async function registerCSVFile(
  file: File,
  tableName: string
): Promise<TableInfo> {
  const { db, conn } = await getDuckDB();

  await db.registerFileHandle(
    file.name,
    file,
    duckdb.DuckDBDataProtocol.BROWSER_FILEREADER,
    true
  );

  // Atomic Hot Swap: Load into a staging table first
  const stagingTable = `__temp_staging_${tableName}_${Date.now()}`;
  await conn.query(
    `CREATE TABLE "${stagingTable}" AS SELECT * FROM read_csv_auto('${file.name.replace(/'/g, "''")}')`
  );

  // Drop original and rename staging table
  await conn.query(`DROP TABLE IF EXISTS "${tableName.replace(/"/g, '""')}"`);
  await conn.query(`ALTER TABLE "${stagingTable}" RENAME TO "${tableName.replace(/"/g, '""')}"`);

  // Update raw cache only after successful table creation
  try {
    const text = await file.text();
    rawCsvCache.set(tableName, { fileName: file.name, content: text });
  } catch (err) {
    console.warn("No se pudo almacenar en caché el texto sin formato del CSV:", file.name, err);
  }

  const schemaResult = await conn.query(`DESCRIBE "${tableName.replace(/"/g, '""')}"`);
  const columns: ColumnSchema[] = [];

  for (let i = 0; i < schemaResult.numRows; i++) {
    const colName = String(schemaResult.getChild("column_name")?.get(i));
    const colType = String(schemaResult.getChild("column_type")?.get(i)).toUpperCase();

    let simpleType: ColumnSchema["type"] = "string";
    if (
      colType.includes("INT") ||
      colType.includes("FLOAT") ||
      colType.includes("DOUBLE") ||
      colType.includes("DECIMAL") ||
      colType.includes("HUGEINT")
    ) {
      simpleType = "number";
    } else if (
      colType.includes("DATE") ||
      colType.includes("TIMESTAMP") ||
      colType.includes("TIME")
    ) {
      simpleType = "date";
    } else if (colType.includes("BOOL")) {
      simpleType = "boolean";
    }

    columns.push({ name: colName, type: simpleType });
  }

  const countResult = await conn.query(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
  const rowCount = Number(countResult.getChild("cnt")?.get(0) ?? 0);

  return {
    name: tableName,
    fileName: file.name,
    rowCount,
    columns,
    lastUpdated: new Date().toLocaleTimeString(),
  };
}

export function safeNumericOrBigInt(val: unknown): any {
  if (typeof val === "bigint") {
    if (val <= BigInt(Number.MAX_SAFE_INTEGER) && val >= BigInt(Number.MIN_SAFE_INTEGER)) {
      return Number(val);
    }
    return val.toString();
  }
  return val;
}

export async function executeQuery(sql: string): Promise<Record<string, any>[]> {
  const { conn } = await getDuckDB();
  const arrowResult = await conn.query(sql);

  const rows: Record<string, any>[] = [];
  const fields = arrowResult.schema.fields.map((f) => f.name);

  for (let i = 0; i < arrowResult.numRows; i++) {
    const row: Record<string, any> = {};
    for (const field of fields) {
      const val = arrowResult.getChild(field)?.get(i);
      row[field] = safeNumericOrBigInt(val);
    }
    rows.push(row);
  }

  return rows;
}

export async function createVirtualRelationView(
  viewName: string,
  sourceTable: string,
  sourceCol: string,
  targetTable: string,
  targetCol: string,
  joinType: "LEFT" | "INNER" = "LEFT"
): Promise<void> {
  const { conn } = await getDuckDB();
  await conn.query(`DROP VIEW IF EXISTS "${viewName}"`);

  try {
    const sCols = await conn.query(`PRAGMA table_info("${sourceTable.replace(/"/g, '""')}")`);
    const tCols = await conn.query(`PRAGMA table_info("${targetTable.replace(/"/g, '""')}")`);

    const sNames = new Set<string>();
    for (let i = 0; i < sCols.numRows; i++) {
      sNames.add(String(sCols.getChild("name")?.get(i)));
    }

    const tSelects: string[] = [];
    for (let i = 0; i < tCols.numRows; i++) {
      const col = String(tCols.getChild("name")?.get(i));
      if (sNames.has(col)) {
        if (col === targetCol && targetCol === sourceCol) {
          // Skip redundant join key column
          continue;
        } else {
          // Alias collision to avoid DuckDB binder error
          tSelects.push(`t."${col.replace(/"/g, '""')}" AS "${targetTable}_${col.replace(/"/g, '""')}"`);
        }
      } else {
        tSelects.push(`t."${col.replace(/"/g, '""')}"`);
      }
    }

    const extraTargetColumns = tSelects.length > 0 ? `, ${tSelects.join(", ")}` : "";

    await conn.query(`
      CREATE VIEW "${viewName}" AS 
      SELECT s.* ${extraTargetColumns}
      FROM "${sourceTable.replace(/"/g, '""')}" s 
      ${joinType} JOIN "${targetTable.replace(/"/g, '""')}" t 
        ON s."${sourceCol.replace(/"/g, '""')}" = t."${targetCol.replace(/"/g, '""')}"
    `);
  } catch (err) {
    // Fallback simple query
    await conn.query(`
      CREATE VIEW "${viewName}" AS 
      SELECT s.*, t.* 
      FROM "${sourceTable.replace(/"/g, '""')}" s 
      ${joinType} JOIN "${targetTable.replace(/"/g, '""')}" t 
        ON s."${sourceCol.replace(/"/g, '""')}" = t."${targetCol.replace(/"/g, '""')}"
    `);
  }
}

export async function dropVirtualRelationView(viewName: string): Promise<void> {
  const { conn } = await getDuckDB();
  await conn.query(`DROP VIEW IF EXISTS "${viewName.replace(/"/g, '""')}"`);
}

export async function introspectViewColumns(viewName: string): Promise<ColumnSchema[]> {
  try {
    const { conn } = await getDuckDB();
    const schemaResult = await conn.query(`DESCRIBE "${viewName.replace(/"/g, '""')}"`);
    const columns: ColumnSchema[] = [];
    for (let i = 0; i < schemaResult.numRows; i++) {
      const colName = String(schemaResult.getChild("column_name")?.get(i));
      const colType = String(schemaResult.getChild("column_type")?.get(i)).toUpperCase();
      let simpleType: "string" | "number" | "date" | "boolean" = "string";
      if (
        colType.includes("INT") ||
        colType.includes("FLOAT") ||
        colType.includes("DOUBLE") ||
        colType.includes("DECIMAL") ||
        colType.includes("NUMERIC") ||
        colType.includes("REAL")
      ) {
        simpleType = "number";
      } else if (colType.includes("DATE") || colType.includes("TIME") || colType.includes("TIMESTAMP")) {
        simpleType = "date";
      } else if (colType.includes("BOOL")) {
        simpleType = "boolean";
      }
      columns.push({ name: colName, type: simpleType });
    }
    return columns;
  } catch {
    return [];
  }
}

export async function registerCSVContent(
  csvText: string,
  tableName: string,
  fileName: string = `${tableName}.csv`
): Promise<TableInfo> {
  const file = new File([csvText], fileName, { type: "text/csv" });
  return registerCSVFile(file, tableName);
}

export async function isTableRegistered(tableName: string): Promise<boolean> {
  try {
    const { conn } = await getDuckDB();
    await conn.query(`SELECT 1 FROM "${tableName.replace(/"/g, '""')}" LIMIT 0`);
    return true;
  } catch {
    return false;
  }
}

export async function listRegisteredTables(): Promise<string[]> {
  try {
    const { conn } = await getDuckDB();
    const res = await conn.query(`SHOW TABLES`);
    const tables: string[] = [];
    for (let i = 0; i < res.numRows; i++) {
      tables.push(String(res.getChild("name")?.get(i)));
    }
    return tables;
  } catch {
    return [];
  }
}

export async function resetDuckDBSession(): Promise<void> {
  try {
    const { conn } = await getDuckDB();
    const tablesResult = await conn.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'main'
    `);
    
    // 1. Drop views first to avoid foreign dependencies
    for (let i = 0; i < tablesResult.numRows; i++) {
      const tName = String(tablesResult.getChild("table_name")?.get(i));
      const tType = String(tablesResult.getChild("table_type")?.get(i));
      if (tType === "VIEW") {
        await conn.query(`DROP VIEW IF EXISTS "${tName.replace(/"/g, '""')}"`);
      }
    }
    // 2. Drop base tables
    for (let i = 0; i < tablesResult.numRows; i++) {
      const tName = String(tablesResult.getChild("table_name")?.get(i));
      const tType = String(tablesResult.getChild("table_type")?.get(i));
      if (tType !== "VIEW") {
        await conn.query(`DROP TABLE IF EXISTS "${tName.replace(/"/g, '""')}"`);
      }
    }
  } catch (err) {
    console.warn("Error al purgar sesión de DuckDB:", err);
  } finally {
    rawCsvCache.clear();
  }
}


