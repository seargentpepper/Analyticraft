export type ChartType =
  | "bar"
  | "line"
  | "pie"
  | "area"
  | "rings"
  | "kpi"
  | "table"
  | "slicer";

export type AppViewMode = "report" | "data" | "model";

export type AggregationType = "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";

export type CardTheme =
  // Base
  | "corporate"
  | "geek"
  | "vibrant"
  | "all-blue"
  | "all-pink"
  // Multicolor profiles
  | "sunset"
  | "ocean-reef"
  | "aurora"
  | "pastel"
  | "retro-80s"
  | "autumn"
  | "cyberpunk"
  | "tropical"
  // iWork-inspired
  | "iwork"
  | "iwork-mono"
  | "iwork-pastel"
  | "iwork-earth"
  // Activity-rings inspired
  | "fitness";

export interface LocalFilter {
  id: string;
  columnName: string;
  operator: "=" | "!=" | ">" | "<" | "LIKE";
  value: string;
  enabled: boolean;
}

export interface ChartConfig {
  id: string;
  title: string;
  description?: string; // Footer note specifying what data is counting
  showLegend?: boolean; // Toggle chart legend
  showDescription?: boolean; // Toggle footer description note
  type: ChartType;
  tableName: string;
  dimensionCol: string;
  metricCol: string;
  aggregation: AggregationType;
  filterCol?: string;
  filterVal?: string;
  localFilters?: LocalFilter[];
}

export interface DraggedFieldPayload {
  tableName: string;
  columnName: string;
  dataType: "string" | "number" | "date" | "boolean";
}

export type VisualizationsSubTab = "build" | "format";

export interface GlobalFilter {
  id: string;
  tableName: string;
  columnName: string;
  operator: "=" | "!=" | ">" | "<" | "LIKE";
  value: string;
  enabled: boolean;
}

export interface TableRelation {
  id: string;
  name: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  joinType: "LEFT" | "INNER";
  description?: string;
}

export interface ProjectSourceCSV {
  tableName: string;
  fileName: string;
  content: string;
}

export interface AnalyticraftProject {
  version: "1.0" | "1.1";
  name: string;
  activeTheme?: CardTheme;
  activeView?: AppViewMode;
  charts: ChartConfig[];
  filters: GlobalFilter[];
  relations: TableRelation[];
  savedAt: string;
  sources?: ProjectSourceCSV[];
  backupCount?: number;
  modelLayout?: Record<string, { x: number; y: number }>;
}

export type RibbonTab = "file" | "home" | "insert" | "modeling" | "view" | "format";

export type RibbonAction =
  | { type: "NEW_PROJECT" }
  | { type: "OPEN_PROJECT" }
  | { type: "SAVE_PROJECT" }
  | { type: "SAVE_PROJECT_AS" }
  | { type: "COPY_CARD"; cardId?: string }
  | { type: "PASTE_CARD" }
  | { type: "DUPLICATE_CARD"; cardId?: string }
  | { type: "DELETE_CARD"; cardId?: string }
  | { type: "ADD_CHART"; chartType?: ChartType }
  | { type: "OPEN_JOIN_MODAL" }
  | { type: "REFRESH_ALL_DATA" }
  | { type: "TRIGGER_HOT_SWAP"; tableName?: string }
  | { type: "EXPORT_HTML" }
  | { type: "OPEN_WIKI"; page?: number }
  | { type: "OPEN_CSV_GUIDE" }
  | { type: "TOGGLE_QUICK_HELP" }
  | { type: "SET_THEME"; theme: CardTheme }
  | { type: "SWITCH_VIEW"; view: AppViewMode }
  | { type: "UPDATE_SELECTED_CHART_TYPE"; chartType: ChartType }
  | { type: "TOGGLE_SELECTED_CHART_LEGEND" }
  | { type: "TOGGLE_SELECTED_CHART_DESCRIPTION" }
  | { type: "UPDATE_SELECTED_CHART_TITLE"; title: string };
