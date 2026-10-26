import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import {
  BarChart3,
  Database,
  Plus,
  Share2,
  FileSpreadsheet,
  BarChart2,
  TrendingUp,
  PieChart,
  AreaChart,
  Hash,
  Table as TableIcon,
  RefreshCw,
  Filter,
  Save,
  FolderOpen,
  HelpCircle,
  X,
  Palette,
  Trash2,
  ArrowRight,
  Info,
  BookOpen,
  Undo2,
  Redo2,
  LayoutDashboard,
  GitFork,
  FileText,
  Lock,
  Copy,
  CopyPlus,
  Clipboard,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  Eye,
  FolderPlus,
} from "lucide-react";
import {
  registerCSVFile,
  registerCSVContent,
  TableInfo,
  createVirtualRelationView,
  dropVirtualRelationView,
  executeQuery,
  resetDuckDBSession,
  getRegisteredCSVs,
} from "./lib/duckdb";
import {
  saveProjectFolder,
  openProjectFolder,
  openProjectSingleFile,
  isFileSystemAccessSupported,
  exportProjectSnapshot,
  getSavedProjectDirectoryName,
  setSavedProjectDirectoryName,
} from "./lib/projectStorage";
import { SaveProjectModal } from "./components/SaveProjectModal";
import { OpenProjectModal } from "./components/OpenProjectModal";
import {
  ChartConfig,
  ChartType,
  GlobalFilter,
  TableRelation,
  AnalyticraftProject,
  CardTheme,
  AppViewMode,
  RibbonTab,
  RibbonAction,
  DraggedFieldPayload,
} from "./types/dashboard";
import { ChartCard } from "./components/ChartCard";
import { VisualizationsPanel } from "./components/VisualizationsPanel";
import { FieldsPanel } from "./components/FieldsPanel";
import { ModelView } from "./components/ModelView";
import { generateStandaloneHTML } from "./lib/exporter";
import { THEME_GROUPS, THEME_LIST, getTheme } from "./lib/themes";

export function App() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [chartDataStore, setChartDataStore] = useState<
    Record<string, Record<string, any>[]>
  >({});
  const [globalFilters, setGlobalFilters] = useState<GlobalFilter[]>([]);
  const [relations, setRelations] = useState<TableRelation[]>([]);
  const [activeTheme, setActiveTheme] = useState<CardTheme>("corporate");
  const [refreshVersion, setRefreshVersion] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Shell Navigation & Project Meta (Fase 3 & 8.5: Ciclo de vida limpio y empaquetado)
  const [activeView, setActiveView] = useState<AppViewMode>("report");
  const [projectName, setProjectName] = useState<string>("Sin_Titulo.analyticraft");
  const [projectNameDraft, setProjectNameDraft] = useState<string>("Sin_Titulo");
  const [projectDirHandle, setProjectDirHandle] = useState<any | null>(null);
  const [activeDirName, setActiveDirName] = useState<string | null>(() => getSavedProjectDirectoryName());
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isEditingProjectName, setIsEditingProjectName] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showOpenModal, setShowOpenModal] = useState<boolean>(false);
  const [modelLayout, setModelLayout] = useState<Record<string, { x: number; y: number }>>({});
  const [history, setHistory] = useState<{ charts: ChartConfig[]; filters: GlobalFilter[] }[]>([]);
  const [future, setFuture] = useState<{ charts: ChartConfig[]; filters: GlobalFilter[] }[]>([]);

  // Ribbon Menu & Centralized Clipboard State (Fase 5)
  const [activeRibbonTab, setActiveRibbonTab] = useState<RibbonTab>("home");
  const [isRibbonCollapsed, setIsRibbonCollapsed] = useState<boolean>(false);
  const [clipboard, setClipboard] = useState<ChartConfig | null>(null);

  // Right Dockable Panels (Fase 6: Visualizations & FIELDS)
  const [isVisualsPanelOpen, setIsVisualsPanelOpen] = useState<boolean>(true);
  const [isFieldsPanelOpen, setIsFieldsPanelOpen] = useState<boolean>(true);

  // Data View State (Solo Lectura con Paginación e Introspección)
  const [dataViewTable, setDataViewTable] = useState<string>("");
  const [dataViewRows, setDataViewRows] = useState<Record<string, any>[]>([]);
  const [dataViewTotalRows, setDataViewTotalRows] = useState<number>(0);
  const [dataViewPage, setDataViewPage] = useState<number>(1);
  const dataViewPageSize = 100;
  const [dataViewLoading, setDataViewLoading] = useState<boolean>(false);

  // Submenus & Tool modals state
  const [showRelationModal, setShowRelationModal] = useState<boolean>(false);
  const [showQuickHelp, setShowQuickHelp] = useState<boolean>(false);
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);
  const [showWikiModal, setShowWikiModal] = useState<boolean>(false);
  const [showCsvGuideModal, setShowCsvGuideModal] = useState<boolean>(false);
  const [activeWikiPage, setActiveWikiPage] = useState<number>(1);

  // Form states for Join Modal
  const [joinSourceTable, setJoinSourceTable] = useState<string>("");
  const [joinSourceCol, setJoinSourceCol] = useState<string>("");
  const [joinTargetTable, setJoinTargetTable] = useState<string>("");
  const [joinTargetCol, setJoinTargetCol] = useState<string>("");

  // Hidden file input references for Hot Swap and Project Open
  const projectInputRef = useRef<HTMLInputElement | null>(null);
  const hotSwapInputRef = useRef<HTMLInputElement | null>(null);
  const [hotSwapTargetTable, setHotSwapTargetTable] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Undo / Redo helpers
  const recordSnapshot = () => {
    setIsDirty(true);
    setHistory((prev) => [...prev.slice(-25), { charts, filters: globalFilters }]);
    setFuture([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    setIsDirty(true);
    const previous = history[history.length - 1];
    setFuture((prev) => [{ charts, filters: globalFilters }, ...prev]);
    setCharts(previous.charts);
    setGlobalFilters(previous.filters);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    showNotification("Deshacer: estado anterior restaurado");
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    setIsDirty(true);
    const next = future[0];
    setHistory((prev) => [...prev, { charts, filters: globalFilters }]);
    setCharts(next.charts);
    setGlobalFilters(next.filters);
    setFuture((prev) => prev.slice(1));
    showNotification("Rehacer: cambios reaplicados");
  };

  // 0. Inicio limpio en blanco (Fase 8.5)
  useEffect(() => {
    resetDuckDBSession().catch((err) =>
      console.warn("Limpieza inicial DuckDB:", err)
    );
  }, []);

  // Synchronize rows for Data View with introspection (COUNT) and paginated LIMIT/OFFSET
  useEffect(() => {
    if (activeView === "data") {
      const target = dataViewTable || tables[0]?.name || "";
      if (target) {
        if (dataViewTable !== target) {
          setDataViewTable(target);
          setDataViewPage(1);
        }
        setDataViewLoading(true);
        const offset = (dataViewPage - 1) * dataViewPageSize;
        Promise.all([
          executeQuery(`SELECT COUNT(*) AS total FROM "${target}"`),
          executeQuery(`SELECT * FROM "${target}" LIMIT ${dataViewPageSize} OFFSET ${offset}`),
        ])
          .then(([countRes, rows]) => {
            const countVal = countRes[0]?.total !== undefined ? Number(countRes[0].total) : rows.length;
            setDataViewTotalRows(countVal);
            setDataViewRows(rows);
          })
          .catch((err) => console.error("Error al cargar registros en Data View:", err))
          .finally(() => setDataViewLoading(false));
      } else {
        setDataViewRows([]);
        setDataViewTotalRows(0);
      }
    }
  }, [activeView, dataViewTable, dataViewPage, tables, refreshVersion]);

  const handleSwitchView = (newView: AppViewMode) => {
    setActiveView(newView);
    if (newView === "model") {
      if (activeRibbonTab === "format") {
        setActiveRibbonTab("modeling");
      }
      showNotification("Vista de Modelo (Model View) activada");
    } else if (newView === "data") {
      if (activeRibbonTab === "format") {
        setActiveRibbonTab("home");
      }
      showNotification("Vista de Datos (Data View) activada - Solo Lectura");
    } else {
      showNotification("Vista de Informe (Report View) activada");
    }
  };

  // Global Keyboard Shortcuts (Fase 3 & 5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "1") {
        e.preventDefault();
        handleSwitchView("report");
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "2") {
        e.preventDefault();
        handleSwitchView("data");
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "3") {
        e.preventDefault();
        handleSwitchView("model");
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "o" || e.key === "O")) {
        e.preventDefault();
        setShowOpenModal(true);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        handleSaveProject(true);
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        handleSaveProject(false);
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || e.key === "Y" || (e.shiftKey && (e.key === "z" || e.key === "Z")))
      ) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "c" || e.key === "C")) {
        if (selectedChartId) {
          e.preventDefault();
          handleCopyCard();
        }
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "v" || e.key === "V")) {
        if (clipboard) {
          e.preventDefault();
          handlePasteCard();
        }
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "d" || e.key === "D")) {
        if (selectedChartId) {
          e.preventDefault();
          handleDuplicateCard();
        }
      } else if (e.key === "Delete" || e.key === "Del") {
        if (selectedChartId) {
          e.preventDefault();
          handleDeleteCard();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "F1") {
        e.preventDefault();
        setIsRibbonCollapsed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    history,
    future,
    charts,
    globalFilters,
    relations,
    projectName,
    projectNameDraft,
    projectDirHandle,
    activeDirName,
    activeTheme,
    activeView,
    selectedChartId,
    clipboard,
  ]);

  // 1. Initial CSV Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const tableName = file.name
          .replace(/\.csv$/i, "")
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .toLowerCase();

        const tableInfo = await registerCSVFile(file, tableName);
        setTables((prev) => [
          ...prev.filter((t) => t.name !== tableName),
          tableInfo,
        ]);

        if (charts.length === 0 && tableInfo.columns.length >= 2) {
          const stringCol =
            tableInfo.columns.find((c) => c.type === "string") ||
            tableInfo.columns[0];
          const numCol =
            tableInfo.columns.find((c) => c.type === "number") ||
            tableInfo.columns[1];

          const newChart: ChartConfig = {
            id: crypto.randomUUID(),
            title: `Distribución de ${numCol.name} por ${stringCol.name}`,
            description: `Cálculo de la suma de ${numCol.name} segmentado por ${stringCol.name}.`,
            showLegend: false,
            type: "bar",
            tableName: tableInfo.name,
            dimensionCol: stringCol.name,
            metricCol: numCol.name,
            aggregation: "SUM",
          };
          setCharts([newChart]);
          setSelectedChartId(newChart.id);
        }
      }
      setIsDirty(true);
      showNotification("Tabla registrada en memoria DuckDB");
    } catch (err: any) {
      alert("Error al cargar archivo CSV: " + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // 1b. Nuevo Proyecto en Blanco Total (Fase 8.5)
  const handleNewProject = async () => {
    if (
      (isDirty || charts.length > 0 || tables.length > 0) &&
      !confirm("¿Iniciar un nuevo proyecto en blanco? Los cambios no guardados se cerrarán.")
    ) {
      return;
    }

    setIsUploading(true);
    try {
      await resetDuckDBSession();
      setTables([]);
      setCharts([]);
      setGlobalFilters([]);
      setRelations([]);
      setSelectedChartId(null);
      setProjectName("Sin_Titulo.analyticraft");
      setProjectNameDraft("Sin_Titulo");
      setProjectDirHandle(null);
      setActiveDirName(null);
      setSavedProjectDirectoryName(null);
      setModelLayout({});
      setIsDirty(false);
      setHistory([]);
      setFuture([]);
      setRefreshVersion((v) => v + 1);
      showNotification("Nuevo proyecto en blanco iniciado. Catálogo de DuckDB reiniciado.");
    } catch (err: any) {
      alert("Error al restablecer la sesión: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Hot Swap Handler
  const triggerHotSwap = (tableName: string) => {
    setHotSwapTargetTable(tableName);
    if (hotSwapInputRef.current) {
      hotSwapInputRef.current.click();
    }
  };

  const handleHotSwapFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !hotSwapTargetTable) return;

    setIsUploading(true);
    try {
      const updatedTable = await registerCSVFile(file, hotSwapTargetTable);
      setTables((prev) =>
        prev.map((t) => (t.name === hotSwapTargetTable ? updatedTable : t))
      );
      setIsDirty(true);
      setRefreshVersion((v) => v + 1);
      showNotification(`Hot Swap exitoso: '${hotSwapTargetTable}' actualizada`);
    } catch (err: any) {
      alert("Error en Hot Swap: " + err.message);
    } finally {
      setIsUploading(false);
      setHotSwapTargetTable(null);
      e.target.value = "";
    }
  };

  // 3. Project Persistence: Guardar en Carpeta con Backups Seriados (Fase 8.5)
  const handleSaveProject = async (saveAs: boolean = false) => {
    // Si no es "Guardar Como" y ya tenemos un handle de directorio activo, guardamos directamente
    if (!saveAs && projectDirHandle) {
      const cleanProjectName = (projectNameDraft || projectName || "Sin_Titulo")
        .replace(/\.analyticraft$/i, "")
        .trim();

      const project: AnalyticraftProject = {
        version: "1.1",
        name: cleanProjectName,
        activeTheme,
        activeView,
        charts,
        filters: globalFilters,
        relations,
        modelLayout: Object.keys(modelLayout).length > 0 ? modelLayout : undefined,
        savedAt: new Date().toISOString(),
      };

      const csvMap = getRegisteredCSVs();
      const result = await saveProjectFolder(
        project,
        csvMap,
        projectDirHandle,
        false
      );

      if (result.success) {
        setIsDirty(false);
        if (result.backupCreated) {
          showNotification(
            `Proyecto guardado. Respaldo creado en /backups/${result.backupCreated}`
          );
        } else {
          showNotification(
            `Proyecto guardado en carpeta '${activeDirName || cleanProjectName}'`
          );
        }
      }
      return;
    }

    // Si es "Guardar Como" o aún no hay carpeta asignada, abrimos el diálogo modal para que el usuario elija
    setShowSaveModal(true);
  };

  // Guardar en Carpeta Confirmado desde el Modal
  const handleSaveAsFolderConfirmed = async (customName: string) => {
    const cleanProjectName = customName.trim() || "Sin_Titulo";
    const project: AnalyticraftProject = {
      version: "1.1",
      name: cleanProjectName,
      activeTheme,
      activeView,
      charts,
      filters: globalFilters,
      relations,
      modelLayout: Object.keys(modelLayout).length > 0 ? modelLayout : undefined,
      savedAt: new Date().toISOString(),
    };

    const csvMap = getRegisteredCSVs();
    const result = await saveProjectFolder(
      project,
      csvMap,
      null, // Forzar selector de directorio
      true
    );

    if (result.success) {
      if (result.dirHandle) {
        setProjectDirHandle(result.dirHandle);
        setActiveDirName(result.dirHandle.name);
        setSavedProjectDirectoryName(result.dirHandle.name);
      }
      setProjectName(`${result.projectName}.analyticraft`);
      setProjectNameDraft(result.projectName);
      setIsDirty(false);

      if (result.method === "directory") {
        showNotification(
          `Proyecto y fuentes CSV empaquetados en carpeta '${result.dirHandle?.name || result.projectName}'`
        );
      } else {
        showNotification(
          `Instantánea descargada como '${result.projectName}.analyticraft'`
        );
      }
    }
  };

  // Guardar Instantánea Rápida (.analyticraft JSON) Confirmado desde el Modal
  const handleSaveInstantSnapshotConfirmed = (customName: string) => {
    const cleanProjectName = customName.trim() || "Sin_Titulo";
    const project: AnalyticraftProject = {
      version: "1.1",
      name: cleanProjectName,
      activeTheme,
      activeView,
      charts,
      filters: globalFilters,
      relations,
      modelLayout: Object.keys(modelLayout).length > 0 ? modelLayout : undefined,
      savedAt: new Date().toISOString(),
    };

    const csvMap = getRegisteredCSVs();
    exportProjectSnapshot(project, csvMap, cleanProjectName);
    setProjectName(`${cleanProjectName}.analyticraft`);
    setProjectNameDraft(cleanProjectName);
    setIsDirty(false);
    showNotification(
      `Instantánea rápida descargada como '${cleanProjectName}.analyticraft'`
    );
  };

  // 4a. Abrir Carpeta de Proyecto estructurada (Fase 8.5)
  const handleOpenProjectDirectory = async () => {
    if (isFileSystemAccessSupported()) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({
          id: "analyticraft_projects",
          mode: "readwrite",
          startIn: "documents",
        });
        setIsUploading(true);
        const res = await openProjectFolder(dirHandle);
        if (!res) return;

        await resetDuckDBSession();
        const loadedTables: TableInfo[] = [];
        for (const csv of res.csvFiles) {
          const tInfo = await registerCSVContent(csv.content, csv.tableName, csv.fileName);
          loadedTables.push(tInfo);
        }
        setTables(loadedTables);

        const pName = res.project.name.endsWith(".analyticraft")
          ? res.project.name
          : `${res.project.name}.analyticraft`;
        setProjectName(pName);
        setProjectNameDraft(res.project.name.replace(/\.analyticraft$/i, ""));
        if (res.project.activeTheme) setActiveTheme(res.project.activeTheme);
        if (res.project.activeView) setActiveView(res.project.activeView);
        if (res.project.charts) setCharts(res.project.charts);
        if (res.project.filters) setGlobalFilters(res.project.filters);
        if (res.project.relations) setRelations(res.project.relations);
        if (res.project.modelLayout) setModelLayout(res.project.modelLayout);
        if (res.project.charts && res.project.charts.length > 0) {
          setSelectedChartId(res.project.charts[0].id);
        }

        setProjectDirHandle(res.dirHandle);
        setActiveDirName(res.dirHandle.name);
        setSavedProjectDirectoryName(res.dirHandle.name);
        setIsDirty(false);
        setRefreshVersion((v) => v + 1);
        showNotification(`Proyecto '${res.project.name}' cargado con ${loadedTables.length} fuentes CSV`);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          alert("Error al abrir carpeta de proyecto: " + err.message);
        }
      } finally {
        setIsUploading(false);
      }
    } else {
      projectInputRef.current?.click();
    }
  };

  // 4b. Cargar proyecto desde un archivo (.analyticraft o .json)
  const loadProjectFromFile = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await openProjectSingleFile(file);
      if (!res) return;

      if (res.csvFiles.length > 0) {
        await resetDuckDBSession();
        const loadedTables: TableInfo[] = [];
        for (const csv of res.csvFiles) {
          const tInfo = await registerCSVContent(csv.content, csv.tableName, csv.fileName);
          loadedTables.push(tInfo);
        }
        setTables(loadedTables);
      }

      const pName = res.project.name.endsWith(".analyticraft")
        ? res.project.name
        : `${res.project.name}.analyticraft`;
      setProjectName(pName);
      setProjectNameDraft(res.project.name.replace(/\.analyticraft$/i, ""));
      if (res.project.activeTheme) setActiveTheme(res.project.activeTheme);
      if (res.project.activeView) setActiveView(res.project.activeView);
      if (res.project.charts) setCharts(res.project.charts);
      if (res.project.filters) setGlobalFilters(res.project.filters);
      if (res.project.relations) setRelations(res.project.relations);
      if (res.project.modelLayout) setModelLayout(res.project.modelLayout);
      if (res.project.charts && res.project.charts.length > 0) {
        setSelectedChartId(res.project.charts[0].id);
      }

      setProjectDirHandle(null);
      setActiveDirName(null);
      setSavedProjectDirectoryName(null);
      setIsDirty(false);
      setRefreshVersion((v) => v + 1);
      showNotification(`Proyecto '${res.project.name}' cargado exitosamente`);
    } catch (err: any) {
      alert("Error al leer archivo de proyecto: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 4c. Selector Nativo de Archivos (.analyticraft)
  const handleOpenProjectSingleFilePicker = async () => {
    if (typeof window !== "undefined" && "showOpenFilePicker" in window) {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: "Proyecto Analyticraft (*.analyticraft, *.json)",
              accept: {
                "application/json": [".analyticraft", ".json"],
              },
            },
          ],
          multiple: false,
        });
        if (!fileHandle) return;
        const file = await fileHandle.getFile();
        await loadProjectFromFile(file);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          projectInputRef.current?.click();
        }
      }
    } else {
      projectInputRef.current?.click();
    }
  };

  const handleOpenProjectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadProjectFromFile(file);
    e.target.value = "";
  };

  // 5. Global Filter Actions
  const handleAddGlobalFilter = () => {
    if (tables.length === 0) return;
    const targetTable = tables[0];
    const targetCol = targetTable.columns[0];

    const newFilter: GlobalFilter = {
      id: crypto.randomUUID(),
      tableName: targetTable.name,
      columnName: targetCol.name,
      operator: "=",
      value: "",
      enabled: true,
    };
    recordSnapshot();
    setGlobalFilters((prev) => [...prev, newFilter]);
  };

  const updateGlobalFilter = (id: string, updates: Partial<GlobalFilter>) => {
    setGlobalFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeGlobalFilter = (id: string) => {
    recordSnapshot();
    setGlobalFilters((prev) => prev.filter((f) => f.id !== id));
  };

  // 6. Virtual Join Relations Modal Actions
  const openJoinModal = () => {
    if (tables.length < 2) {
      alert("Debes cargar al menos 2 tablas CSV para crear una relación de esquema en estrella.");
      return;
    }
    setJoinSourceTable(tables[0].name);
    setJoinSourceCol(tables[0].columns[0]?.name || "");
    setJoinTargetTable(tables[1].name);
    setJoinTargetCol(tables[1].columns[0]?.name || "");
    setShowRelationModal(true);
  };

  const handleExecuteJoin = async () => {
    if (!joinSourceTable || !joinSourceCol || !joinTargetTable || !joinTargetCol) {
      alert("Por favor selecciona las tablas y columnas para el enlace.");
      return;
    }
    const viewName = `view_${joinSourceTable}_${joinTargetTable}`;

    try {
      await createVirtualRelationView(
        viewName,
        joinSourceTable,
        joinSourceCol,
        joinTargetTable,
        joinTargetCol,
        "LEFT"
      );

      const relation: TableRelation = {
        id: crypto.randomUUID(),
        name: viewName,
        sourceTable: joinSourceTable,
        sourceColumn: joinSourceCol,
        targetTable: joinTargetTable,
        targetColumn: joinTargetCol,
        joinType: "LEFT",
        description: `Unión LEFT JOIN de ${joinSourceTable}.${joinSourceCol} con ${joinTargetTable}.${joinTargetCol}`,
      };

      setRelations((prev) => [...prev, relation]);
      setShowRelationModal(false);
      showNotification(`Vista relacional '${viewName}' creada en DuckDB`);
    } catch (err: any) {
      alert("Error al crear relación virtual: " + err.message);
    }
  };

  const handleAddRelationDirectly = async (
    sourceTable: string,
    sourceCol: string,
    targetTable: string,
    targetCol: string,
    joinType: "LEFT" | "INNER" = "LEFT"
  ) => {
    const exists = relations.some(
      (r) =>
        (r.sourceTable === sourceTable &&
          r.sourceColumn === sourceCol &&
          r.targetTable === targetTable &&
          r.targetColumn === targetCol) ||
        (r.sourceTable === targetTable &&
          r.sourceColumn === targetCol &&
          r.targetTable === sourceTable &&
          r.targetColumn === sourceCol)
    );
    if (exists) {
      showNotification(`Esta relación ya existe en el modelo.`);
      return;
    }

    const viewName = `view_${sourceTable}_${targetTable}`;
    try {
      await createVirtualRelationView(
        viewName,
        sourceTable,
        sourceCol,
        targetTable,
        targetCol,
        joinType
      );

      const relation: TableRelation = {
        id: crypto.randomUUID(),
        name: viewName,
        sourceTable,
        sourceColumn: sourceCol,
        targetTable,
        targetColumn: targetCol,
        joinType,
        description: `Unión ${joinType} JOIN de ${sourceTable}.${sourceCol} con ${targetTable}.${targetCol}`,
      };

      setRelations((prev) => [...prev, relation]);
      showNotification(`Relación creada: ${sourceTable}.${sourceCol} ──(1:*)──▶ ${targetTable}.${targetCol}`);
    } catch (err: any) {
      alert("Error al crear relación virtual: " + err.message);
    }
  };

  // Delete Virtual Relation View
  const handleDeleteRelation = async (relation: TableRelation) => {
    if (
      !confirm(
        `¿Eliminar la vista relacional '${relation.name}'? Ningún archivo físico será alterado.`
      )
    ) {
      return;
    }
    try {
      await dropVirtualRelationView(relation.name);
      setRelations((prev) => prev.filter((r) => r.id !== relation.id));
      showNotification(`Vista '${relation.name}' eliminada de DuckDB`);
    } catch (err: any) {
      alert("Error al eliminar relación: " + err.message);
    }
  };

  const handleUpdateRelation = async (
    relationId: string,
    newSourceTable: string,
    newSourceCol: string,
    newTargetTable: string,
    newTargetCol: string,
    newJoinType: "LEFT" | "INNER"
  ) => {
    const existing = relations.find((r) => r.id === relationId);
    if (!existing) return;

    try {
      await dropVirtualRelationView(existing.name);

      const newViewName = `view_${newSourceTable}_${newTargetTable}`;
      await createVirtualRelationView(
        newViewName,
        newSourceTable,
        newSourceCol,
        newTargetTable,
        newTargetCol,
        newJoinType
      );

      const updated: TableRelation = {
        ...existing,
        name: newViewName,
        sourceTable: newSourceTable,
        sourceColumn: newSourceCol,
        targetTable: newTargetTable,
        targetColumn: newTargetCol,
        joinType: newJoinType,
        description: `Unión ${newJoinType} JOIN de ${newSourceTable}.${newSourceCol} con ${newTargetTable}.${newTargetCol}`,
      };

      setRelations((prev) =>
        prev.map((r) => (r.id === relationId ? updated : r))
      );
      showNotification(`Relación actualizada: ${newViewName} (${newJoinType} JOIN)`);
    } catch (err: any) {
      alert("Error al actualizar relación: " + err.message);
    }
  };

  // 7. Add Chart Action (with chart type support for Ribbon Insert)
  const handleAddChartWithType = (chartType: ChartType = "bar") => {
    if (tables.length === 0) {
      alert("Por favor carga primero un archivo CSV.");
      return;
    }
    recordSnapshot();
    const currentTable = tables[0];
    const stringCol =
      currentTable.columns.find((c) => c.type === "string") ||
      currentTable.columns[0];
    const numCol =
      currentTable.columns.find((c) => c.type === "number") ||
      currentTable.columns[1] ||
      stringCol;

    const typeLabels: Record<ChartType, string> = {
      bar: "Barras",
      line: "Líneas",
      pie: "Composición Torta",
      area: "Área",
      rings: "Anillos de Actividad",
      kpi: "Métrica KPI",
      table: "Tabla SQL",
      slicer: "Segmentador",
    };

    const newChart: ChartConfig = {
      id: crypto.randomUUID(),
      title: `${typeLabels[chartType] || "Gráfico"} #${charts.length + 1}`,
      description:
        chartType === "slicer"
          ? "Segmentador interactivo en lienzo."
          : "Resumen estadístico de datos en DuckDB.",
      showLegend: chartType === "pie",
      showDescription: chartType !== "slicer",
      type: chartType,
      tableName: currentTable.name,
      dimensionCol: stringCol.name,
      metricCol: numCol.name,
      aggregation: "SUM",
      localFilters: [],
    };

    setCharts((prev) => [...prev, newChart]);
    setSelectedChartId(newChart.id);
    setActiveRibbonTab("format");
    showNotification(`Tarjeta de ${typeLabels[chartType] || chartType} creada`);
  };

  const handleSlicerFilterChange = (
    tableName: string,
    columnName: string,
    value: string | null
  ) => {
    recordSnapshot();
    if (value === null) {
      setGlobalFilters((prev) =>
        prev.filter((f) => !(f.tableName === tableName && f.columnName === columnName))
      );
      showNotification(`Filtro de segmentador limpiado: ${columnName}`);
    } else {
      setGlobalFilters((prev) => {
        const existingIdx = prev.findIndex(
          (f) => f.tableName === tableName && f.columnName === columnName
        );
        if (existingIdx >= 0) {
          if (prev[existingIdx].value === value && prev[existingIdx].enabled) {
            return prev.filter((_, idx) => idx !== existingIdx);
          }
          const next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            value,
            enabled: true,
            operator: "=",
          };
          return next;
        } else {
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              tableName,
              columnName,
              operator: "=",
              value,
              enabled: true,
            },
          ];
        }
      });
      showNotification(`Segmentador aplicado: ${columnName} = ${value}`);
    }
  };

  // Clipboard & Card Mutation Handlers (Fase 5)
  const handleCopyCard = (cardId?: string) => {
    const targetId = cardId || selectedChartId;
    const target = charts.find((c) => c.id === targetId);
    if (!target) {
      showNotification("Selecciona una tarjeta para copiar al portapapeles");
      return;
    }
    setClipboard(JSON.parse(JSON.stringify(target)));
    showNotification(`Tarjeta "${target.title}" copiada al portapapeles`);
  };

  const handlePasteCard = () => {
    if (!clipboard) {
      showNotification("Portapapeles vacío. Copia una tarjeta primero.");
      return;
    }
    recordSnapshot();
    const newId = crypto.randomUUID();
    const pasted: ChartConfig = {
      ...JSON.parse(JSON.stringify(clipboard)),
      id: newId,
      title: `${clipboard.title} (Copia)`,
      showDescription: clipboard.showDescription !== false,
    };
    setCharts((prev) => [...prev, pasted]);
    setSelectedChartId(newId);
    setActiveRibbonTab("format");
    showNotification(`Tarjeta "${pasted.title}" pegada desde el portapapeles`);
  };

  const handleDuplicateCard = (cardId?: string) => {
    const targetId = cardId || selectedChartId;
    const target = charts.find((c) => c.id === targetId);
    if (!target) {
      showNotification("Selecciona una tarjeta para duplicar");
      return;
    }
    recordSnapshot();
    const newId = crypto.randomUUID();
    const duplicated: ChartConfig = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      title: `${target.title} (Duplicado)`,
      showDescription: target.showDescription !== false,
    };
    setCharts((prev) => [...prev, duplicated]);
    setSelectedChartId(newId);
    showNotification(`Tarjeta "${duplicated.title}" duplicada`);
  };

  const handleDeleteCard = (cardId?: string) => {
    const targetId = cardId || selectedChartId;
    if (!targetId) {
      showNotification("Selecciona una tarjeta para eliminar");
      return;
    }
    recordSnapshot();
    setCharts((prev) => prev.filter((c) => c.id !== targetId));
    if (selectedChartId === targetId) {
      setSelectedChartId(null);
    }
    showNotification("Tarjeta eliminada");
  };

  // Centralized Action Dispatcher (Command Pattern - Fase 5)
  const dispatchAction = (action: RibbonAction) => {
    switch (action.type) {
      case "NEW_PROJECT":
        handleNewProject();
        break;

      case "OPEN_PROJECT":
        setShowOpenModal(true);
        break;

      case "SAVE_PROJECT":
        handleSaveProject(false);
        break;

      case "SAVE_PROJECT_AS":
        handleSaveProject(true);
        break;

      case "COPY_CARD":
        handleCopyCard(action.cardId);
        break;

      case "PASTE_CARD":
        handlePasteCard();
        break;

      case "DUPLICATE_CARD":
        handleDuplicateCard(action.cardId);
        break;

      case "DELETE_CARD":
        handleDeleteCard(action.cardId);
        break;

      case "ADD_CHART":
        handleAddChartWithType(action.chartType || "bar");
        break;

      case "OPEN_JOIN_MODAL":
        openJoinModal();
        break;

      case "REFRESH_ALL_DATA":
        setRefreshVersion((v) => v + 1);
        showNotification("Consultas SQL actualizadas en todas las tarjetas");
        break;

      case "TRIGGER_HOT_SWAP":
        triggerHotSwap(action.tableName || tables[0]?.name);
        break;

      case "EXPORT_HTML":
        handleExportHTML();
        break;

      case "OPEN_WIKI":
        if (action.page) setActiveWikiPage(action.page);
        setShowWikiModal(true);
        break;

      case "OPEN_CSV_GUIDE":
        setShowCsvGuideModal(true);
        break;

      case "TOGGLE_QUICK_HELP":
        setShowQuickHelp((prev) => !prev);
        break;

      case "SET_THEME":
        setActiveTheme(action.theme);
        showNotification(`Tema '${getTheme(action.theme).label}' aplicado`);
        break;

      case "SWITCH_VIEW":
        handleSwitchView(action.view);
        break;

      case "UPDATE_SELECTED_CHART_TYPE":
        if (selectedChartId) {
          recordSnapshot();
          updateSelectedChart({ type: action.chartType });
          showNotification(`Visual transformado a ${action.chartType}`);
        }
        break;

      case "TOGGLE_SELECTED_CHART_LEGEND":
        if (selectedChartId && selectedChart) {
          recordSnapshot();
          updateSelectedChart({ showLegend: !selectedChart.showLegend });
          showNotification(selectedChart.showLegend ? "Leyenda desactivada" : "Leyenda activada");
        }
        break;

      case "TOGGLE_SELECTED_CHART_DESCRIPTION":
        if (selectedChartId && selectedChart) {
          recordSnapshot();
          const nextState = selectedChart.showDescription === false ? true : false;
          updateSelectedChart({ showDescription: nextState });
          showNotification(nextState ? "Pie descriptivo visible" : "Pie descriptivo oculto");
        }
        break;

      case "UPDATE_SELECTED_CHART_TITLE":
        if (selectedChartId) {
          updateSelectedChart({ title: action.title });
        }
        break;
    }
  };

  // 8. Export Standalone HTML
  const handleExportHTML = () => {
    if (charts.length === 0) {
      alert("Agrega al menos un gráfico para exportar el reporte.");
      return;
    }

    const exportPayload = {
      projectName: "Analyticraft Dashboard",
      theme: activeTheme,
      charts: charts.map((cfg) => ({
        config: cfg,
        data: chartDataStore[cfg.id] || [],
      })),
    };

    const htmlContent = generateStandaloneHTML(exportPayload);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Analyticraft_Report_${new Date().toISOString().slice(0, 10)}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Reporte HTML exportado exitosamente");
  };

  const selectedChart = charts.find((c) => c.id === selectedChartId);
  const activeDataViewTable =
    tables.find((t) => t.name === (dataViewTable || tables[0]?.name)) || tables[0];

  const updateSelectedChart = (updates: Partial<ChartConfig>) => {
    if (!selectedChartId) return;
    setCharts((prev) =>
      prev.map((c) => (c.id === selectedChartId ? { ...c, ...updates } : c))
    );
  };

  const handleFieldClick = (payload: DraggedFieldPayload) => {
    if (selectedChartId) {
      if (payload.dataType === "number") {
        updateSelectedChart({
          tableName: payload.tableName,
          metricCol: payload.columnName,
          aggregation: selectedChart?.aggregation || "SUM",
        });
        showNotification(`Métrica asignada: ${payload.columnName} (${selectedChart?.aggregation || "SUM"})`);
      } else {
        updateSelectedChart({
          tableName: payload.tableName,
          dimensionCol: payload.columnName,
        });
        showNotification(`Eje X asignado: ${payload.columnName}`);
      }
    } else {
      const newId = crypto.randomUUID();
      const isNum = payload.dataType === "number";
      const newChart: ChartConfig = {
        id: newId,
        title: `${isNum ? "Total" : "Distribución de"} ${payload.columnName}`,
        type: isNum ? "kpi" : "bar",
        tableName: payload.tableName,
        dimensionCol: payload.columnName,
        metricCol: payload.columnName,
        aggregation: isNum ? "SUM" : "COUNT",
        showLegend: false,
        showDescription: true,
      };
      recordSnapshot();
      setCharts((prev) => [...prev, newChart]);
      setSelectedChartId(newId);
      showNotification(`Nuevo visual creado para "${payload.columnName}"`);
    }
  };

  return (
    <div className="app-container">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={hotSwapInputRef}
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleHotSwapFileSelected}
      />
      <input
        type="file"
        ref={projectInputRef}
        accept=".analyticraft,.json"
        style={{ display: "none" }}
        onChange={handleOpenProjectFile}
      />

      {/* 1. Main Studio Top Menu (Fase 3: TitleBar Superior estilo Power BI) */}
      <header className="topbar">
        <div className="brand-section">
          <div className="brand-icon">
            <BarChart3 size={18} />
          </div>
          <div>
            <span className="brand-title">Analyticraft</span>
            <span className="brand-badge" style={{ marginLeft: "6px" }}>Studio BI</span>
          </div>

          {/* Quick Access Toolbar (Fase 3, 4 & 8.5) */}
          <div className="titlebar-quick-actions" style={{ marginLeft: "14px" }}>
            <button
              className="quick-action-btn"
              onClick={() => setShowOpenModal(true)}
              title="Abrir Proyecto (.analyticraft o carpeta) (Ctrl+O)"
            >
              <FolderOpen size={13} strokeWidth={1.5} />
            </button>
            <button
              className="quick-action-btn"
              onClick={() => handleSaveProject(false)}
              title="Guardar Proyecto (Ctrl+S) - Crea backup seriado"
            >
              <Save size={13} strokeWidth={1.5} />
            </button>
            <button
              className="quick-action-btn"
              onClick={() => handleSaveProject(true)}
              title="Guardar Como en Carpeta (Ctrl+Shift+S)"
            >
              <FolderPlus size={13} strokeWidth={1.5} />
            </button>
            <button
              className="quick-action-btn"
              onClick={handleUndo}
              disabled={history.length === 0}
              title="Deshacer última acción (Ctrl+Z)"
            >
              <Undo2 size={13} strokeWidth={1.5} />
            </button>
            <button
              className="quick-action-btn"
              onClick={handleRedo}
              disabled={future.length === 0}
              title="Rehacer acción (Ctrl+Y)"
            >
              <Redo2 size={13} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Project Name Pill con Directorio Persistente, Dirty State y Renombrado Inline (Fase 8.5) */}
        <div
          className="project-name-pill"
          title={
            activeDirName
              ? `Proyecto vinculado a carpeta: ${activeDirName}. Clic para renombrar.`
              : "Nombre del proyecto activo. Clic para renombrar."
          }
          onClick={() => {
            if (!isEditingProjectName) {
              setIsEditingProjectName(true);
            }
          }}
        >
          <FolderOpen size={13} color={activeDirName ? "#38bdf8" : "#4ec9b0"} />
          {isEditingProjectName ? (
            <input
              type="text"
              className="project-name-input"
              value={projectNameDraft}
              autoFocus
              onChange={(e) => setProjectNameDraft(e.target.value)}
              onBlur={() => {
                setIsEditingProjectName(false);
                const clean = projectNameDraft.trim() || "Sin_Titulo";
                setProjectName(`${clean}.analyticraft`);
                setIsDirty(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingProjectName(false);
                  const clean = projectNameDraft.trim() || "Sin_Titulo";
                  setProjectName(`${clean}.analyticraft`);
                  setIsDirty(true);
                } else if (e.key === "Escape") {
                  setIsEditingProjectName(false);
                  setProjectNameDraft(projectName.replace(/\.analyticraft$/i, ""));
                }
              }}
            />
          ) : (
            <span className="project-name-label">
              {activeDirName && (
                <span style={{ color: "#38bdf8", marginRight: "4px", fontWeight: 700 }}>
                  [{activeDirName}]
                </span>
              )}
              {projectName}
              {isDirty && (
                <span
                  className="project-name-dirty-dot"
                  title="Cambios no guardados (Ctrl+S para guardar)"
                />
              )}
            </span>
          )}
        </div>
      </header>

      {/* 2. Ribbon Menu (Fase 5: Cinta de Opciones Contextual estilo Power BI) */}
      <div className={`pbi-ribbon ${isRibbonCollapsed ? "collapsed" : ""}`}>
        {/* Ribbon Tabs Strip */}
        <div className="ribbon-tabs-strip">
          <div className="ribbon-tabs-list">
            <button
              className={`ribbon-tab-btn ${activeRibbonTab === "file" ? "active" : ""}`}
              onClick={() => {
                setActiveRibbonTab("file");
                if (isRibbonCollapsed) setIsRibbonCollapsed(false);
              }}
              title="Pestaña Archivo: Gestión de proyectos y guías de importación"
            >
              <FileText size={13} strokeWidth={1.5} />
              <span>Archivo</span>
            </button>

            <button
              className={`ribbon-tab-btn ${activeRibbonTab === "home" ? "active" : ""}`}
              onClick={() => {
                setActiveRibbonTab("home");
                if (isRibbonCollapsed) setIsRibbonCollapsed(false);
              }}
              title="Pestaña Inicio: Portapapeles, datos, diseño y exportación"
            >
              <LayoutDashboard size={13} strokeWidth={1.5} />
              <span>Inicio</span>
            </button>

            <button
              className={`ribbon-tab-btn ${activeRibbonTab === "insert" ? "active" : ""}`}
              onClick={() => {
                setActiveRibbonTab("insert");
                if (isRibbonCollapsed) setIsRibbonCollapsed(false);
              }}
              title="Pestaña Insertar: Galería de visualizaciones y filtros globales"
            >
              <Plus size={13} strokeWidth={1.5} />
              <span>Insertar</span>
            </button>

            <button
              className={`ribbon-tab-btn ${activeRibbonTab === "modeling" ? "active" : ""}`}
              onClick={() => {
                setActiveRibbonTab("modeling");
                if (isRibbonCollapsed) setIsRibbonCollapsed(false);
              }}
              title="Pestaña Modelado: Diagrama del modelo y cuadrícula de datos"
            >
              <GitFork size={13} strokeWidth={1.5} />
              <span>Modelado</span>
            </button>

            <button
              className={`ribbon-tab-btn ${activeRibbonTab === "view" ? "active" : ""}`}
              onClick={() => {
                setActiveRibbonTab("view");
                if (isRibbonCollapsed) setIsRibbonCollapsed(false);
              }}
              title="Pestaña Ver: Soporte y glosario en pantalla"
            >
              <Eye size={13} strokeWidth={1.5} />
              <span>Ver</span>
            </button>

            {/* Pestaña Contextual: Formato (Solo visible en Vista de Informe con tarjeta seleccionada) */}
            {activeView === "report" && selectedChartId && (
              <button
                className={`ribbon-tab-btn tab-format ${
                  activeRibbonTab === "format" ? "active" : ""
                } highlight`}
                onClick={() => {
                  setActiveRibbonTab("format");
                  if (isRibbonCollapsed) setIsRibbonCollapsed(false);
                }}
                title="Pestaña Formato: Ajusta tipo, leyenda, descripción y título de la tarjeta seleccionada"
              >
                <SlidersHorizontal size={13} strokeWidth={1.5} />
                <span>Formato</span>
                <span className="ribbon-context-badge">Visual</span>
              </button>
            )}
          </div>

          {/* Toggle de Plegado / Desplegado del Ribbon */}
          <button
            className="ribbon-collapse-toggle"
            onClick={() => setIsRibbonCollapsed(!isRibbonCollapsed)}
            title={
              isRibbonCollapsed
                ? "Desplegar la cinta de opciones (Ctrl+F1)"
                : "Plegar la cinta de opciones para maximizar el lienzo (Ctrl+F1)"
            }
          >
            {isRibbonCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {/* Ribbon Command Stage */}
        <div className="ribbon-command-stage">
          {/* TAB 1: ARCHIVO */}
          {activeRibbonTab === "file" && (
            <>
              <div className="ribbon-group">
                <div className="ribbon-group-controls">
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "NEW_PROJECT" })}
                    title="Iniciar un nuevo proyecto en blanco (limpia el lienzo y purga DuckDB)"
                  >
                    <Plus size={18} strokeWidth={1.5} color="#4ec9b0" />
                    <span>Nuevo</span>
                  </button>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "OPEN_PROJECT" })}
                    title="Cargar carpeta de proyecto estructurada o archivo .analyticraft"
                  >
                    <FolderOpen size={18} strokeWidth={1.5} color="#cca700" />
                    <span>Abrir</span>
                  </button>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "SAVE_PROJECT" })}
                    title="Guardar estado del proyecto actual con backup seriado (Ctrl+S)"
                  >
                    <Save size={18} strokeWidth={1.5} color="#007acc" />
                    <span>Guardar</span>
                  </button>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "SAVE_PROJECT_AS" })}
                    title="Guardar en una nueva carpeta seleccionada por el usuario (Ctrl+Shift+S)"
                  >
                    <FolderPlus size={18} strokeWidth={1.5} color="#38bdf8" />
                    <span>Guardar Como</span>
                  </button>
                </div>
                <div className="ribbon-group-title">Proyecto</div>
              </div>

              <div className="ribbon-divider" />

              <div className="ribbon-group">
                <div className="ribbon-group-controls">
                  <div className="ribbon-btn-stack">
                    <button
                      className="ribbon-btn-compact"
                      onClick={() => dispatchAction({ type: "OPEN_WIKI" })}
                      title="Abrir la Wiki oficial y manual técnico de Analyticraft"
                    >
                      <BookOpen size={12} strokeWidth={1.5} color="#4ec9b0" />
                      <span>Wiki Oficial</span>
                    </button>
                    <button
                      className="ribbon-btn-compact"
                      onClick={() => dispatchAction({ type: "OPEN_CSV_GUIDE" })}
                      title="Guía de exportación desde Excel, Sheets y Numbers"
                    >
                      <FileSpreadsheet size={12} strokeWidth={1.5} color="#f59e0b" />
                      <span>¿Cómo traer tus datos?</span>
                    </button>
                  </div>
                </div>
                <div className="ribbon-group-title">Documentación</div>
              </div>
            </>
          )}

          {/* TAB 2: INICIO */}
          {activeRibbonTab === "home" && (
            <>
              {/* Portapapeles */}
              <div className="ribbon-group">
                <div className="ribbon-group-controls">
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "PASTE_CARD" })}
                    disabled={!clipboard}
                    title={
                      clipboard
                        ? `Pegar tarjeta "${clipboard.title}" del portapapeles (Ctrl+V)`
                        : "Portapapeles vacío (copia una tarjeta con Ctrl+C)"
                    }
                  >
                    <Clipboard size={18} strokeWidth={1.5} color={clipboard ? "#4ec9b0" : "#888888"} />
                    <span>Pegar</span>
                  </button>
                  <div className="ribbon-btn-stack">
                    <button
                      className="ribbon-btn-compact"
                      onClick={() => dispatchAction({ type: "COPY_CARD" })}
                      disabled={!selectedChartId}
                      title="Copiar tarjeta seleccionada al portapapeles (Ctrl+C)"
                    >
                      <Copy size={12} strokeWidth={1.5} />
                      <span>Copiar</span>
                    </button>
                    <button
                      className="ribbon-btn-compact"
                      onClick={() => dispatchAction({ type: "DUPLICATE_CARD" })}
                      disabled={!selectedChartId}
                      title="Duplicar tarjeta seleccionada en el lienzo (Ctrl+D)"
                    >
                      <CopyPlus size={12} strokeWidth={1.5} />
                      <span>Duplicar</span>
                    </button>
                    <button
                      className="ribbon-btn-compact"
                      onClick={() => dispatchAction({ type: "DELETE_CARD" })}
                      disabled={!selectedChartId}
                      title="Eliminar tarjeta seleccionada (Delete)"
                    >
                      <Trash2 size={12} strokeWidth={1.5} color="#d16969" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
                <div className="ribbon-group-title">Portapapeles</div>
              </div>

              <div className="ribbon-divider" />

              {/* Datos */}
              <div className="ribbon-group">
                <div className="ribbon-group-controls">
                  <label
                    className="ribbon-btn-large"
                    style={{ margin: 0, cursor: "pointer" }}
                    title="Cargar uno o múltiples archivos CSV en DuckDB"
                  >
                    <input
                      type="file"
                      accept=".csv"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                    <FileSpreadsheet size={18} strokeWidth={1.5} color="#f59e0b" />
                    <span>Obtener CSV</span>
                  </label>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "TRIGGER_HOT_SWAP" })}
                    disabled={tables.length === 0}
                    title="Hot Swap: Reemplaza en caliente el CSV de la tabla activa sin perder gráficos"
                  >
                    <RefreshCw size={18} strokeWidth={1.5} color="#4ec9b0" />
                    <span>Hot Swap</span>
                  </button>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "REFRESH_ALL_DATA" })}
                    title="Reejecutar consultas SQL sobre todas las tarjetas"
                  >
                    <RefreshCw size={18} strokeWidth={1.5} color="#007acc" />
                    <span>Actualizar</span>
                  </button>
                </div>
                <div className="ribbon-group-title">Datos</div>
              </div>

              <div className="ribbon-divider" />

              {/* Diseño (Reubicación de Temas de Tarjetas) */}
              <div className="ribbon-group" style={{ position: "relative" }}>
                <div className="ribbon-group-controls">
                  <div style={{ position: "relative" }}>
                    <button
                      className="ribbon-btn-large"
                      onClick={() => setShowThemeMenu(!showThemeMenu)}
                      title="Seleccionar paleta y estilo para todas las tarjetas (17 temas disponibles)"
                    >
                      <Palette size={18} strokeWidth={1.5} color="#4ec9b0" />
                      <span>{getTheme(activeTheme).label}</span>
                    </button>

                    {showThemeMenu && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          left: 0,
                          background: "#252526",
                          border: "1px solid #4a4a4a",
                          borderRadius: "4px",
                          boxShadow: "0 12px 28px rgba(0,0,0,0.8)",
                          zIndex: 9999,
                          width: "270px",
                          maxHeight: "65vh",
                          overflowY: "auto",
                          padding: "4px",
                        }}
                      >
                        {THEME_GROUPS.map((group) => (
                          <div key={group}>
                            <div
                              style={{
                                fontSize: "0.62rem",
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: "#9e9e9e",
                                padding: "6px 8px 2px",
                              }}
                            >
                              {group === "Base"
                                ? "Básicos"
                                : group === "Multicolor"
                                ? "Perfiles multicolor"
                                : group === "iWork"
                                ? "Inspirados en iWork"
                                : "Anillos de actividad"}
                            </div>
                            {THEME_LIST.filter((th) => th.group === group).map((th) => (
                              <button
                                key={th.id}
                                style={{
                                  width: "100%",
                                  textAlign: "left",
                                  padding: "6px 8px",
                                  fontSize: "0.74rem",
                                  fontWeight: activeTheme === th.id ? 800 : 600,
                                  color: activeTheme === th.id ? "#ffffff" : "#cccccc",
                                  background: activeTheme === th.id ? "#007acc" : "transparent",
                                  border: "none",
                                  borderRadius: "2px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "8px",
                                }}
                                onClick={() => {
                                  dispatchAction({ type: "SET_THEME", theme: th.id });
                                  setShowThemeMenu(false);
                                }}
                              >
                                <span>{th.label}</span>
                                <span style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                                  {th.palette.slice(0, 6).map((c, i) => (
                                    <span
                                      key={i}
                                      style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 2,
                                        background: c,
                                        border: "1px solid rgba(255,255,255,0.25)",
                                      }}
                                    />
                                  ))}
                                </span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ribbon-group-title">Diseño</div>
              </div>

              <div className="ribbon-divider" />

              {/* Compartir */}
              <div className="ribbon-group">
                <div className="ribbon-group-controls">
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "EXPORT_HTML" })}
                    title="Exportar informe interactivo autocontenido (.html)"
                  >
                    <Share2 size={18} strokeWidth={1.5} color="#81c784" />
                    <span>Exportar HTML</span>
                  </button>
                </div>
                <div className="ribbon-group-title">Compartir</div>
              </div>
            </>
          )}

          {/* TAB 3: INSERTAR */}
          {activeRibbonTab === "insert" && (
            <>
              <div className="ribbon-group">
                <div className="ribbon-group-controls">
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "ADD_CHART", chartType: "bar" })}
                    title="Crear Gráfico de Barras"
                  >
                    <BarChart2 size={18} strokeWidth={1.5} />
                    <span>Barras</span>
                  </button>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "ADD_CHART", chartType: "line" })}
                    title="Crear Gráfico de Tendencia Temporal (Líneas)"
                  >
                    <TrendingUp size={18} strokeWidth={1.5} />
                    <span>Líneas</span>
                  </button>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "ADD_CHART", chartType: "pie" })}
                    title="Crear Gráfico Circular de Composición Porcentual"
                  >
                    <PieChart size={18} strokeWidth={1.5} />
                    <span>Torta</span>
                  </button>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "ADD_CHART", chartType: "area" })}
                    title="Crear Gráfico de Área Acumulada"
                  >
                    <AreaChart size={18} strokeWidth={1.5} />
                    <span>Área</span>
                  </button>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "ADD_CHART", chartType: "kpi" })}
                    title="Crear Tarjeta Numérica Resumen KPI"
                  >
                    <Hash size={18} strokeWidth={1.5} color="#4ec9b0" />
                    <span>Métrica KPI</span>
                  </button>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "ADD_CHART", chartType: "table" })}
                    title="Crear Tarjeta de Tabla de Registros Paginada"
                  >
                    <TableIcon size={18} strokeWidth={1.5} color="#f59e0b" />
                    <span>Tabla SQL</span>
                  </button>
                </div>
                <div className="ribbon-group-title">Visualizaciones</div>
              </div>

              <div className="ribbon-divider" />

              <div className="ribbon-group">
                <div className="ribbon-group-controls">
                  <button
                    className="ribbon-btn-large"
                    onClick={handleAddGlobalFilter}
                    disabled={tables.length === 0}
                    title="Añadir una píldora de filtro global para segmentar todas las tarjetas al unísono"
                  >
                    <Filter size={18} strokeWidth={1.5} color="#007acc" />
                    <span>+ Filtro Global</span>
                  </button>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "ADD_CHART" })}
                    title="Insertar tarjeta estándar en el lienzo"
                  >
                    <Plus size={18} strokeWidth={1.5} />
                    <span>+ Tarjeta</span>
                  </button>
                </div>
                <div className="ribbon-group-title">Controles y Filtros</div>
              </div>
            </>
          )}

          {/* TAB 4: MODELADO */}
          {activeRibbonTab === "modeling" && (
            <>
              <div className="ribbon-group">
                <div className="ribbon-group-controls">
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "SWITCH_VIEW", view: "model" })}
                    title="Conmutar al lienzo interactivo de relaciones y esquema (Ctrl+3)"
                  >
                    <GitFork size={18} strokeWidth={1.5} color="#cca700" />
                    <span>Vista Modelo</span>
                  </button>
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "SWITCH_VIEW", view: "data" })}
                    title="Inspeccionar cuadrícula de datos crudos (Solo Lectura - Ctrl+2)"
                  >
                    <TableIcon size={18} strokeWidth={1.5} color="#007acc" />
                    <span>Vista Datos</span>
                  </button>
                </div>
                <div className="ribbon-group-title">Estructura y Esquema</div>
              </div>
            </>
          )}

          {/* TAB 5: VER */}
          {activeRibbonTab === "view" && (
            <>
              <div className="ribbon-group">
                <div className="ribbon-group-controls">
                  <button
                    className="ribbon-btn-large"
                    onClick={() => dispatchAction({ type: "TOGGLE_QUICK_HELP" })}
                    title="Mostrar/ocultar barra de glosario y ayuda contextual en pantalla"
                  >
                    <HelpCircle size={18} strokeWidth={1.5} color="#cca700" />
                    <span>Glosario en Pantalla</span>
                  </button>
                </div>
                <div className="ribbon-group-title">Soporte</div>
              </div>
            </>
          )}

          {/* TAB 6: FORMATO (Contextual para la tarjeta seleccionada) */}
          {activeRibbonTab === "format" && (
            <>
              {!selectedChart ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#a0a0a0",
                    fontSize: "0.75rem",
                    padding: "0.5rem 1rem",
                  }}
                >
                  <Info size={16} color="#cca700" />
                  <span>
                    Selecciona una tarjeta visual en el lienzo para ajustar sus propiedades de formato
                    rápido (tipo de gráfico, leyenda, descripción, título y atajos).
                  </span>
                </div>
              ) : (
                <>
                  {/* Tipo de Visual */}
                  <div className="ribbon-group">
                    <div className="ribbon-group-controls">
                      <div className="ribbon-btn-stack">
                        <button
                          className={`ribbon-btn-compact ${selectedChart.type === "bar" ? "active" : ""}`}
                          onClick={() => dispatchAction({ type: "UPDATE_SELECTED_CHART_TYPE", chartType: "bar" })}
                          title="Transformar a Gráfico de Barras"
                        >
                          <BarChart2 size={11} />
                          <span>Barras</span>
                        </button>
                        <button
                          className={`ribbon-btn-compact ${selectedChart.type === "line" ? "active" : ""}`}
                          onClick={() => dispatchAction({ type: "UPDATE_SELECTED_CHART_TYPE", chartType: "line" })}
                          title="Transformar a Gráfico de Líneas"
                        >
                          <TrendingUp size={11} />
                          <span>Líneas</span>
                        </button>
                        <button
                          className={`ribbon-btn-compact ${selectedChart.type === "pie" ? "active" : ""}`}
                          onClick={() => dispatchAction({ type: "UPDATE_SELECTED_CHART_TYPE", chartType: "pie" })}
                          title="Transformar a Gráfico Circular (Torta)"
                        >
                          <PieChart size={11} />
                          <span>Torta</span>
                        </button>
                      </div>

                      <div className="ribbon-btn-stack">
                        <button
                          className={`ribbon-btn-compact ${selectedChart.type === "area" ? "active" : ""}`}
                          onClick={() => dispatchAction({ type: "UPDATE_SELECTED_CHART_TYPE", chartType: "area" })}
                          title="Transformar a Gráfico de Área"
                        >
                          <AreaChart size={11} />
                          <span>Área</span>
                        </button>
                        <button
                          className={`ribbon-btn-compact ${selectedChart.type === "kpi" ? "active" : ""}`}
                          onClick={() => dispatchAction({ type: "UPDATE_SELECTED_CHART_TYPE", chartType: "kpi" })}
                          title="Transformar a Tarjeta Numérica KPI"
                        >
                          <Hash size={11} />
                          <span>Métrica KPI</span>
                        </button>
                        <button
                          className={`ribbon-btn-compact ${selectedChart.type === "table" ? "active" : ""}`}
                          onClick={() => dispatchAction({ type: "UPDATE_SELECTED_CHART_TYPE", chartType: "table" })}
                          title="Transformar a Tabla SQL de Registros"
                        >
                          <TableIcon size={11} />
                          <span>Tabla SQL</span>
                        </button>
                      </div>
                    </div>
                    <div className="ribbon-group-title">Tipo de Visual</div>
                  </div>

                  <div className="ribbon-divider" />

                  {/* Elementos y Leyenda */}
                  <div className="ribbon-group">
                    <div className="ribbon-group-controls">
                      <div className="ribbon-btn-stack">
                        <button
                          className={`ribbon-btn-compact ${selectedChart.showLegend ? "active" : ""}`}
                          onClick={() => dispatchAction({ type: "TOGGLE_SELECTED_CHART_LEGEND" })}
                          title="Alternar visibilidad de la leyenda superior"
                        >
                          <Eye size={11} />
                          <span>Leyenda: {selectedChart.showLegend ? "Visible" : "Oculta"}</span>
                        </button>
                        <button
                          className={`ribbon-btn-compact ${selectedChart.showDescription !== false ? "active" : ""}`}
                          onClick={() => dispatchAction({ type: "TOGGLE_SELECTED_CHART_DESCRIPTION" })}
                          title="Alternar visibilidad de la nota técnica al pie"
                        >
                          <FileText size={11} />
                          <span>Pie: {selectedChart.showDescription !== false ? "Visible" : "Oculto"}</span>
                        </button>
                      </div>
                    </div>
                    <div className="ribbon-group-title">Elementos</div>
                  </div>

                  <div className="ribbon-divider" />

                  {/* Título en Vivo */}
                  <div className="ribbon-group">
                    <div className="ribbon-group-controls">
                      <div className="ribbon-inline-field">
                        <label className="ribbon-inline-label">Título del Visual:</label>
                        <input
                          type="text"
                          className="ribbon-inline-input"
                          value={selectedChart.title}
                          onChange={(e) =>
                            dispatchAction({ type: "UPDATE_SELECTED_CHART_TITLE", title: e.target.value })
                          }
                          title="Edita el título de la tarjeta seleccionada directamente desde la cinta"
                        />
                      </div>
                    </div>
                    <div className="ribbon-group-title">Encabezado</div>
                  </div>

                  <div className="ribbon-divider" />

                  {/* Operaciones Rápidas */}
                  <div className="ribbon-group">
                    <div className="ribbon-group-controls">
                      <button
                        className="ribbon-btn-large"
                        onClick={() => dispatchAction({ type: "DUPLICATE_CARD" })}
                        title="Duplicar tarjeta seleccionada (Ctrl+D)"
                      >
                        <CopyPlus size={18} strokeWidth={1.5} color="#4ec9b0" />
                        <span>Duplicar</span>
                      </button>
                      <button
                        className="ribbon-btn-large"
                        onClick={() => dispatchAction({ type: "DELETE_CARD" })}
                        title="Eliminar tarjeta seleccionada (Delete)"
                      >
                        <Trash2 size={18} strokeWidth={1.5} color="#d16969" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                    <div className="ribbon-group-title">Operaciones</div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="app-layout-shell">
        {/* Left View Switcher Rail (3 Modos Estilo Power BI) */}
        <nav className="view-switcher-rail" aria-label="Selector de Vistas">
          <button
            className={`view-rail-btn ${activeView === "report" ? "active" : ""}`}
            onClick={() => handleSwitchView("report")}
            title="Vista de Informe (Report View) - Ctrl+1"
          >
            <LayoutDashboard size={20} />
            <span className="view-rail-label">Informe</span>
          </button>

          <button
            className={`view-rail-btn ${activeView === "data" ? "active" : ""}`}
            onClick={() => handleSwitchView("data")}
            title="Vista de Datos (Data View) - Solo Lectura - Ctrl+2"
          >
            <TableIcon size={20} />
            <span className="view-rail-label">Datos</span>
          </button>

          <button
            className={`view-rail-btn ${activeView === "model" ? "active" : ""}`}
            onClick={() => handleSwitchView("model")}
            title="Vista de Modelo (Model View) - Ctrl+3"
          >
            <GitFork size={20} />
            <span className="view-rail-label">Modelo</span>
          </button>
        </nav>

        {/* Main Stage Area */}
        <div className="main-view-stage">
          {/* 1. Vista de Informe (Report View) */}
          {activeView === "report" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}>

      {/* 3. Global Filter Ribbon (Solo se renderiza si hay filtros activos para liberar espacio vertical) */}
      {globalFilters.length > 0 && (
        <div className="filter-bar">
          <div className="filter-bar-header">
            <Filter size={13} color="#007acc" />
            <span>Filtros Globales:</span>
          </div>

          <div className="filter-pills-list">
            {globalFilters.map((f) => (
              <div key={f.id} className="filter-chip">
                <span className="filter-target">
                  {f.tableName}.{f.columnName}
                </span>
                <select
                  className="filter-op"
                  value={f.operator}
                  onChange={(e) =>
                    updateGlobalFilter(f.id, { operator: e.target.value as any })
                  }
                  title="Operador de comparación"
                >
                  <option value="=">=</option>
                  <option value="!=">!=</option>
                  <option value="LIKE">contiene</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                </select>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Valor..."
                  value={f.value}
                  onChange={(e) => updateGlobalFilter(f.id, { value: e.target.value })}
                  title="Valor de filtrado (se aplicará dinámicamente con WHERE en DuckDB)"
                />
                <button
                  className="filter-remove"
                  onClick={() => removeGlobalFilter(f.id)}
                  title="Quitar filtro"
                >
                  ×
                </button>
              </div>
            ))}

            {tables.length > 0 && (
              <button
                className="btn-add-filter"
                onClick={handleAddGlobalFilter}
                title="Añade un nuevo filtro que segmentará todas las tarjetas del lienzo simultáneamente"
              >
                <Plus size={11} />
                <span>+ Nuevo Filtro</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Help Collapsible Banner */}
      {showQuickHelp && (
        <div style={{ background: "#202428", borderBottom: "1px solid #3c3c3c", padding: "0.6rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.72rem", color: "#dddddd", lineHeight: 1.4 }}>
            <div>
              <strong style={{ color: "#ffffff", display: "block" }}>1. Dimensión (Eje X):</strong>
              Es el campo de agrupación o categoría (ej. Categoría de Producto, Cliente, Región, Fecha).
            </div>
            <div>
              <strong style={{ color: "#ffffff", display: "block" }}>2. Métrica (Eje Y):</strong>
              Es el campo numérico que deseas calcular o medir (ej. Ventas, Unidades, Margen, Costo).
            </div>
            <div>
              <strong style={{ color: "#ffffff", display: "block" }}>3. Modelador Relacional:</strong>
              Vincula dos CSVs en memoria usando una columna en común (ej. <code>cliente</code> con <code>id_cliente</code>) permitiendo cruzar tablas en tus gráficos.
            </div>
            <div>
              <strong style={{ color: "#ffffff", display: "block" }}>4. Hot Swap (↻):</strong>
              Reemplaza los datos del CSV en caliente sin romper gráficos ni configuraciones existentes.
            </div>
          </div>
          <button className="icon-btn" onClick={() => setShowQuickHelp(false)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* 4. Main Workspace Layout (Power BI Desktop: Canvas + Dockable Right Panels) */}
      <div className="workspace-body">
        {/* Center Canvas: Interactive Visualizations Grid */}
        <main
          className="canvas-area"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(e) => {
            e.preventDefault();
            try {
              const raw = e.dataTransfer.getData("application/json");
              if (!raw) return;
              const payload: DraggedFieldPayload = JSON.parse(raw);
              handleFieldClick(payload);
            } catch (err) {
              console.warn("Failed to drop field on canvas", err);
            }
          }}
        >
          <div className="canvas-toolbar">
            <h2 className="canvas-title">Lienzo Principal de Trabajo</h2>
            <div style={{ fontSize: "0.75rem", color: "#cccccc", fontWeight: 600 }}>
              Visualizaciones dinámicas en tiempo real · Drag & Drop desde panel de Campos
            </div>
          </div>

          {charts.length === 0 ? (
            <div className="empty-state">
              <BarChart3 size={40} color="#007acc" />
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ffffff" }}>
                Comienza cargando un archivo CSV o arrastrando un campo
              </div>
              <p style={{ maxWidth: "440px", fontSize: "0.8rem", color: "#cccccc", fontWeight: 500 }}>
                Arrastra una columna desde el panel de Campos a este lienzo o haz clic en cualquier tipo de gráfico en Visualizaciones.
              </p>
              <label
                className="btn"
                style={{
                  marginTop: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#0e639c",
                  border: "1px solid #1177bb",
                  color: "#ffffff",
                  padding: "8px 18px",
                  borderRadius: "4px",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="file"
                  accept=".csv"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <FileSpreadsheet size={15} color="#ffffff" />
                <span>Importar archivo CSV</span>
              </label>
            </div>
          ) : (
            <div className="charts-grid">
              {charts.map((cfg) => (
                <ChartCard
                  key={cfg.id}
                  config={cfg}
                  globalFilters={globalFilters}
                  theme={activeTheme}
                  refreshTrigger={refreshVersion}
                  isSelected={cfg.id === selectedChartId}
                  onSelect={() => setSelectedChartId(cfg.id)}
                  onDelete={() => {
                    setCharts((prev) => prev.filter((c) => c.id !== cfg.id));
                    if (selectedChartId === cfg.id) setSelectedChartId(null);
                  }}
                  onDataLoaded={(rows) => {
                    setChartDataStore((prev) => ({ ...prev, [cfg.id]: rows }));
                  }}
                  onDropField={(payload) => {
                    setSelectedChartId(cfg.id);
                    if (payload.dataType === "number") {
                      setCharts((prev) =>
                        prev.map((c) =>
                          c.id === cfg.id
                            ? {
                                ...c,
                                tableName: payload.tableName,
                                metricCol: payload.columnName,
                                aggregation: c.aggregation || "SUM",
                              }
                            : c
                        )
                      );
                      showNotification(`Métrica actualizada en "${cfg.title}": ${payload.columnName}`);
                    } else {
                      setCharts((prev) =>
                        prev.map((c) =>
                          c.id === cfg.id
                            ? {
                                ...c,
                                tableName: payload.tableName,
                                dimensionCol: payload.columnName,
                              }
                            : c
                        )
                      );
                      showNotification(`Eje X actualizado en "${cfg.title}": ${payload.columnName}`);
                    }
                  }}
                  onSlicerFilterChange={handleSlicerFilterChange}
                />
              ))}
            </div>
          )}
        </main>

        {/* Right Dockable Panels (Fase 6: Visualizations & FIELDS) */}
        <div className="right-dock-container">
          <VisualizationsPanel
            selectedChart={selectedChart || null}
            tables={tables}
            onUpdateChart={updateSelectedChart}
            onAddChartWithType={handleAddChartWithType}
            isOpen={isVisualsPanelOpen}
            onToggleOpen={() => setIsVisualsPanelOpen(!isVisualsPanelOpen)}
          />
          <FieldsPanel
            tables={tables}
            relations={relations}
            selectedChart={selectedChart || null}
            onFieldClick={handleFieldClick}
            onTriggerHotSwap={triggerHotSwap}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            onDeleteRelation={handleDeleteRelation}
            isOpen={isFieldsPanelOpen}
            onToggleOpen={() => setIsFieldsPanelOpen(!isFieldsPanelOpen)}
          />
        </div>
      </div>
    </div>
  )}

  {/* 2. Vista de Datos (Data View) - Solo Lectura */}
  {activeView === "data" && (
    <div className="data-view-wrapper">
      <aside className="data-view-sidebar">
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-app)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#ffffff" }}>
            Tablas ({tables.length})
          </span>
          <span style={{ fontSize: "0.64rem", color: "var(--text-dim)" }}>
            Esquema DuckDB
          </span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {tables.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", fontSize: "0.72rem", color: "var(--text-dim)" }}>
              No hay tablas cargadas en memoria.
            </div>
          ) : (
            tables.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setDataViewTable(t.name);
                  setDataViewPage(1);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  marginBottom: "4px",
                  borderRadius: "4px",
                  background: dataViewTable === t.name ? "var(--bg-subtle)" : "transparent",
                  border: dataViewTable === t.name ? "1px solid var(--accent-blue)" : "1px solid transparent",
                  color: dataViewTable === t.name ? "#ffffff" : "var(--text-light)",
                  cursor: "pointer",
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <Database size={13} color="#4ec9b0" />
                  <span>{t.name}</span>
                </span>
                <span style={{ fontSize: "0.64rem", color: "var(--text-dim)", flexShrink: 0 }}>
                  {t.columns.length} col
                </span>
              </button>
            ))
          )}
        </div>

        <div style={{ padding: "10px", borderTop: "1px solid var(--border-app)" }}>
          <button
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", fontSize: "0.72rem" }}
            onClick={() => {
              if (!dataViewTable) return;
              setHotSwapTargetTable(dataViewTable);
              hotSwapInputRef.current?.click();
            }}
            disabled={!dataViewTable}
            title="Reemplaza los datos de esta tabla atómicamente preservando gráficos y relaciones"
          >
            <RefreshCw size={12} color="#4ec9b0" />
            <span>Hot Swap CSV</span>
          </button>
        </div>
      </aside>

      <section className="data-view-main">
        {/* Pedagogical Banner */}
        <div className="data-view-banner">
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <Lock size={15} color="#f59e0b" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div className="data-banner-text">
              <strong>Modo Vista de Datos (Solo Lectura):</strong> Las tablas en Analyticraft son inmutables para garantizar que tus métricas y KPIs reflejen fielmente la fuente de verdad.
              Si necesitas corregir o añadir registros, modifica tu hoja de cálculo CSV original y presiona <strong>Hot Swap CSV (↻)</strong> para actualizar los datos al instante sin alterar tu dashboard.
            </div>
          </div>
          {dataViewTable && (
            <button
              className="btn btn-secondary"
              style={{ flexShrink: 0, fontSize: "0.72rem", padding: "4px 10px" }}
              onClick={() => {
                setHotSwapTargetTable(dataViewTable);
                hotSwapInputRef.current?.click();
              }}
              title="Reemplazar archivo CSV de la tabla seleccionada"
            >
              <RefreshCw size={12} color="#4ec9b0" strokeWidth={1.5} />
              <span>Hot Swap / Recargar CSV</span>
            </button>
          )}
        </div>

        {/* Table Data Grid */}
        <div className="data-grid-container">
          {dataViewLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9cdcfe", gap: "8px", fontSize: "0.8rem" }}>
              <RefreshCw size={16} className="spin" />
              <span>Consultando DuckDB (SELECT * FROM "{dataViewTable}" LIMIT {dataViewPageSize} OFFSET {(dataViewPage - 1) * dataViewPageSize})...</span>
            </div>
          ) : tables.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-dim)", gap: "12px" }}>
              <Database size={36} color="var(--text-dim)" strokeWidth={1.5} />
              <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>No hay tablas cargadas en memoria</div>
              <div style={{ fontSize: "0.72rem" }}>Regresa a la Vista de Informe (Ctrl+1) y carga tu primer archivo CSV.</div>
            </div>
          ) : dataViewRows.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-dim)", fontSize: "0.78rem" }}>
              <span>No se encontraron registros en la tabla {dataViewTable}.</span>
            </div>
          ) : (
            <table className="data-table-grid">
              <thead>
                <tr>
                  <th style={{ width: "45px", textAlign: "center" }}>#</th>
                  {activeDataViewTable?.columns.map((col) => (
                    <th key={col.name}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span>{col.name}</span>
                        <span style={{ fontSize: "0.62rem", color: "#4ec9b0", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                          {col.type}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataViewRows.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "center", color: "var(--text-dim)", background: "rgba(0,0,0,0.2)" }}>
                      {((dataViewPage - 1) * dataViewPageSize) + idx + 1}
                    </td>
                    {activeDataViewTable?.columns.map((col) => (
                      <td key={col.name} title={String(row[col.name] ?? "")}>
                        {row[col.name] !== null && row[col.name] !== undefined ? (
                          String(row[col.name])
                        ) : (
                          <span style={{ color: "#777", fontStyle: "italic" }}>null</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Status with Introspection & Paginator */}
        <div className="data-view-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>Tabla activa: <strong style={{ color: "#ffffff" }}>{dataViewTable || "Ninguna"}</strong></span>
            {dataViewTotalRows > 0 && (
              <span style={{ color: "var(--text-dim)" }}>
                | Mostrando {((dataViewPage - 1) * dataViewPageSize) + 1} - {Math.min(dataViewPage * dataViewPageSize, dataViewTotalRows)} de {dataViewTotalRows.toLocaleString()} filas en DuckDB
              </span>
            )}
          </div>

          {dataViewTotalRows > dataViewPageSize && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                className="btn btn-secondary"
                style={{ padding: "2px 8px", fontSize: "0.68rem" }}
                onClick={() => setDataViewPage((p) => Math.max(1, p - 1))}
                disabled={dataViewPage <= 1}
                title="Página anterior"
              >
                ◀ Anterior
              </button>
              <span style={{ fontSize: "0.68rem", color: "var(--text-light)" }}>
                Página {dataViewPage} de {Math.ceil(dataViewTotalRows / dataViewPageSize)}
              </span>
              <button
                className="btn btn-secondary"
                style={{ padding: "2px 8px", fontSize: "0.68rem" }}
                onClick={() => setDataViewPage((p) => p + 1)}
                disabled={dataViewPage * dataViewPageSize >= dataViewTotalRows}
                title="Página siguiente"
              >
                Siguiente ▶
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )}

  {/* 3. Vista de Modelo (Model View) */}
  {activeView === "model" && (
    <ModelView
      tables={tables}
      relations={relations}
      onAddRelation={handleAddRelationDirectly}
      onUpdateRelation={handleUpdateRelation}
      onDeleteRelation={handleDeleteRelation}
      onOpenJoinModal={openJoinModal}
      showNotification={showNotification}
      savedPositions={modelLayout}
      onSavePositions={(newLayout) => {
        setModelLayout(newLayout);
        setIsDirty(true);
      }}
    />
  )}
        </div>
      </div>

      {/* Virtual JOIN Modal (Modelador Relacional) with Visual Guidance */}
      {showRelationModal && (
        <div className="modal-overlay" onClick={() => setShowRelationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Modelador Relacional: Esquema en Estrella</div>
              <button className="icon-btn" onClick={() => setShowRelationModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="help-banner" style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <Info size={16} color="#007acc" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  <strong>¿Cómo interactúan las tablas?</strong><br />
                  Vinculamos una <em>Tabla de Hechos</em> (ej. tus ventas transaccionales) con una <em>Tabla de Dimensiones</em> (ej. tus clientes o catálogo) usando una clave común.
                  Esto te permitirá hacer gráficos agrupando ventas por sector, ciudad o categoría de cliente.
                </span>
              </div>

              {/* Visual Diagram Representation */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#202020", border: "1px solid #3c3c3c", padding: "0.65rem 0.85rem", borderRadius: "4px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.65rem", color: "#88cc88", fontWeight: 700 }}>TABLA ORIGEN (Hechos)</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#ffffff" }}>{joinSourceTable || "..."}</div>
                  <div style={{ fontSize: "0.68rem", color: "#cccccc" }}>🔑 {joinSourceCol || "columna"}</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "0.65rem", color: "#4ec9b0", fontWeight: 700 }}>LEFT JOIN</span>
                  <ArrowRight size={18} color="#4ec9b0" />
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.65rem", color: "#9cdcfe", fontWeight: 700 }}>TABLA DESTINO (Dimensión)</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#ffffff" }}>{joinTargetTable || "..."}</div>
                  <div style={{ fontSize: "0.68rem", color: "#cccccc" }}>🔑 {joinTargetCol || "columna"}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Tabla Origen (Hechos)</label>
                  <select
                    className="form-select"
                    value={joinSourceTable}
                    onChange={(e) => setJoinSourceTable(e.target.value)}
                  >
                    {tables.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Columna Llave en Origen</label>
                  <select
                    className="form-select"
                    value={joinSourceCol}
                    onChange={(e) => setJoinSourceCol(e.target.value)}
                  >
                    {tables
                      .find((t) => t.name === joinSourceTable)
                      ?.columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} [{c.type}]
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tabla Destino (Dimensión)</label>
                  <select
                    className="form-select"
                    value={joinTargetTable}
                    onChange={(e) => setJoinTargetTable(e.target.value)}
                  >
                    {tables
                      .filter((t) => t.name !== joinSourceTable)
                      .map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Columna Llave en Destino</label>
                  <select
                    className="form-select"
                    value={joinTargetCol}
                    onChange={(e) => setJoinTargetCol(e.target.value)}
                  >
                    {tables
                      .find((t) => t.name === joinTargetTable)
                      ?.columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} [{c.type}]
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowRelationModal(false)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleExecuteJoin}>
                Vincular y Crear Vista Virtual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wiki Reader Modal */}
      {showWikiModal && (
        <div className="modal-overlay" onClick={() => setShowWikiModal(false)}>
          <div
            className="modal-content"
            style={{ width: "720px", maxWidth: "90vw", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <BookOpen size={18} color="#4ec9b0" />
                <span className="modal-title">Wiki Oficial de Analyticraft</span>
              </div>
              <button className="icon-btn" onClick={() => setShowWikiModal(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Wiki Navigation Tabs */}
            <div style={{ display: "flex", gap: "4px", background: "#202020", padding: "4px", borderRadius: "4px", marginBottom: "0.85rem", overflowX: "auto" }}>
              {[
                { id: 1, title: "1. Visión" },
                { id: 2, title: "2. Stack" },
                { id: 3, title: "3. Datos" },
                { id: 4, title: "4. UX & Studio" },
                { id: 5, title: "5. ¿Por qué CSV?" },
                { id: 6, title: "6. Arquitectura UI & Backend" },
                { id: 7, title: "7. Ergonomía & Gestalt" },
                { id: 8, title: "8. Cinta & Ribbon" },
              ].map((p) => (
                <button
                  key={p.id}
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.72rem",
                    fontWeight: activeWikiPage === p.id ? 800 : 600,
                    color: activeWikiPage === p.id ? "#ffffff" : "#a0a0a0",
                    background: activeWikiPage === p.id ? "#007acc" : "transparent",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => setActiveWikiPage(p.id)}
                >
                  {p.title}
                </button>
              ))}
            </div>

            {/* Wiki Page Content Viewer */}
            <div style={{ flex: 1, overflowY: "auto", fontSize: "0.78rem", color: "#e0e0e0", lineHeight: 1.5, paddingRight: "0.5rem" }}>
              {activeWikiPage === 1 && (
                <div>
                  <h3 style={{ color: "#ffffff", fontSize: "0.95rem", marginBottom: "0.4rem" }}>🎯 Visión y Filosofía de Analyticraft</h3>
                  <p style={{ marginBottom: "0.6rem" }}>
                    Analyticraft es una herramienta de Business Intelligence de escritorio, minimalista y de código abierto para PyMEs (2 a 500 empleados).
                  </p>
                  <div className="help-banner" style={{ marginBottom: "0.7rem" }}>
                    <strong>Pilares Rectores:</strong><br />
                    • <strong>Local-First:</strong> Todo corre en tu equipo con DuckDB; sin Docker obligatorio ni servidores en la nube.<br />
                    • <strong>Cero Fricción al Compartir:</strong> Exporta un reporte interactivo en un único archivo <code>.html</code> ejecutable en cualquier navegador.<br />
                    • <strong>Eficiencia Extrema:</strong> Cero bloatware; memoria RAM optimizada y carga instantánea.
                  </div>
                </div>
              )}

              {activeWikiPage === 2 && (
                <div>
                  <h3 style={{ color: "#ffffff", fontSize: "0.95rem", marginBottom: "0.4rem" }}>⚙️ Arquitectura y Stack Tecnológico</h3>
                  <p style={{ marginBottom: "0.5rem" }}>
                    • <strong>Tauri (Rust):</strong> Capa nativa ligera que utiliza el WebView del sistema (WebView2 en Windows), evitando cargar Chromium como en Electron.<br />
                    • <strong>DuckDB (In-Memory):</strong> "El SQLite de la analítica". Consultas vectorizadas sobre CPUs modernas y soporte nativo de SQL estándar.<br />
                    • <strong>React 19 + TypeScript + Apache ECharts:</strong> Renderizado acelerado local, alta densidad de datos y gráficos fluidos.
                  </p>
                </div>
              )}

              {activeWikiPage === 3 && (
                <div>
                  <h3 style={{ color: "#ffffff", fontSize: "0.95rem", marginBottom: "0.4rem" }}>🔄 Flujo de Datos y Modelado en Memoria</h3>
                  <p style={{ marginBottom: "0.5rem" }}>
                    • <strong>Inmutabilidad en disco:</strong> Los archivos CSV originales son de solo lectura; jamás se corrompen ni alteran.<br />
                    • <strong>Hot Swap (↻):</strong> Reemplaza el CSV de una tabla en caliente sin perder gráficos ni títulos ya armados.<br />
                    • <strong>Esquema de Estrella (JOINs virtuales):</strong> Cruza tablas en DuckDB mediante <code>CREATE VIEW</code> sin tocar archivos físicos y con botón de eliminación (🗑️) seguro.
                  </p>
                </div>
              )}

              {activeWikiPage === 4 && (
                <div>
                  <h3 style={{ color: "#ffffff", fontSize: "0.95rem", marginBottom: "0.4rem" }}>🖥️ UX y Ecosistema (Studio vs. Viewer)</h3>
                  <p style={{ marginBottom: "0.5rem" }}>
                    • <strong>Analyticraft Studio:</strong> Entorno workbench gris (#1e1e1e) estilo Photoshop/GIMP con tipografía bold blanca de alto contraste.<br />
                    • <strong>Catálogo de 17 Temas:</strong> Colores básicos, perfiles multicolor, temas estilo iWork y Anillos de Actividad (Fitness).<br />
                    • <strong>El Viewer (.html):</strong> Reporte autocontenido que directores o clientes abren con doble clic sin instalar nada.
                  </p>
                </div>
              )}

              {activeWikiPage === 5 && (
                <div>
                  <h3 style={{ color: "#ffffff", fontSize: "0.95rem", marginBottom: "0.4rem" }}>📊 Por qué abrazar CSV y Guía de Exportación</h3>
                  <div className="help-banner" style={{ marginBottom: "0.7rem" }}>
                    <strong>¿Por qué NO XLSX, JSON o XML directamente?</strong><br />
                    Los formatos binarios o anidados consumen decenas de MB de RAM en descompresión y permiten tablas sucias con celdas combinadas. El CSV exige tablas limpias y acelera DuckDB al máximo.
                  </div>
                  <strong style={{ color: "#ffffff" }}>Cómo exportar a CSV:</strong>
                  <ul style={{ paddingLeft: "1.2rem", marginTop: "0.3rem" }}>
                    <li><strong>Excel:</strong> <em>Archivo &gt; Guardar como &gt; CSV UTF-8 (delimitado por comas) (*.csv)</em>.</li>
                    <li><strong>Google Sheets:</strong> <em>Archivo &gt; Descargar &gt; Valores separados por comas (.csv, hoja actual)</em>.</li>
                    <li><strong>Apple Numbers:</strong> <em>Archivo &gt; Exportar a &gt; CSV... (Codificación UTF-8)</em>.</li>
                    <li><strong>SQL:</strong> <code>\copy (SELECT * FROM tabla) TO 'datos.csv' WITH CSV HEADER;</code></li>
                  </ul>
                </div>
              )}

              {activeWikiPage === 6 && (
                <div>
                  <h3 style={{ color: "#ffffff", fontSize: "0.95rem", marginBottom: "0.4rem" }}>🏗️ Arquitectura de UI y Contratos de Backend</h3>
                  <p style={{ marginBottom: "0.5rem" }}>
                    • <strong>Shell Desktop Power BI:</strong> Tres vistas estancas (Informe, Datos Solo Lectura, Modelo Relacional) con ciclo de vida condicional que suspende ECharts en segundo plano.<br />
                    • <strong>Regla Inmutable de Datos:</strong> Prohibición estricta de edición in situ en celdas de Data View. Modificaciones exclusivamente por Hot Swap CSV.<br />
                    • <strong>Atajos Globales Nativos:</strong> <code>Ctrl+1/2/3</code> (Vistas), <code>Ctrl+S</code> (Guardar), <code>Ctrl+Z/Y</code> (Deshacer/Rehacer) con salvaguarda en inputs.
                  </p>
                </div>
              )}

              {activeWikiPage === 7 && (
                <div>
                  <h3 style={{ color: "#ffffff", fontSize: "0.95rem", marginBottom: "0.4rem" }}>📐 Ergonomía de UI y Principios de Gestalt</h3>
                  <p style={{ marginBottom: "0.5rem" }}>
                    • <strong>Ley de Proximidad Gestalt:</strong> Agrupación simétrica en la sub-barra: lado izquierdo para modelado y datos, lado derecho para soporte, configuración y exportación.<br />
                    • <strong>Atenuación del Botón Exportar:</strong> Botón secundario discreto con fondo oscuro para priorizar la exploración de datos sobre la salida final.<br />
                    • <strong>Paginación DuckDB:</strong> Introspección <code>COUNT(*)</code> paralela con ventanas <code>LIMIT 100 OFFSET ?</code> para respuesta ultra-rápida.
                  </p>
                </div>
              )}

              {activeWikiPage === 8 && (
                <div>
                  <h3 style={{ color: "#ffffff", fontSize: "0.95rem", marginBottom: "0.4rem" }}>🎀 Cinta de Opciones (Ribbon), Portapapeles y Comandos</h3>
                  <p style={{ marginBottom: "0.5rem" }}>
                    • <strong>Estructura de Cinta Plegable:</strong> 6 pestañas principales (<code>Archivo</code>, <code>Inicio</code>, <code>Insertar</code>, <code>Modelado</code>, <code>Ver</code> y la pestaña contextual <code>Formato</code>) con micro-iconos y botón de colapso rápido (<code>Ctrl+F1</code>).<br />
                    • <strong>ActionDispatcher (Command Pattern):</strong> Todas las mutaciones de la cinta despachan a través de una función centralizada que registra snapshots inmutables para <code>Ctrl+Z</code> (Deshacer) y <code>Ctrl+Y</code> (Rehacer).<br />
                    • <strong>Portapapeles en Memoria (Clipboard):</strong> Copia, pega y duplica tarjetas enteras con configuraciones métricas intactas mediante <code>Ctrl+C</code>, <code>Ctrl+V</code> y <code>Ctrl+D</code>.<br />
                    • <strong>Pestaña Contextual Formato:</strong> Se activa dinámicamente al seleccionar un visual en el lienzo para transformar tipos de gráfico, alternar leyendas y editar títulos sin salir de la cinta.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.7rem", color: "#888888" }}>
                Documentos completos disponibles en la carpeta <code>/Wiki</code> del repositorio.
              </span>
              <button className="btn btn-secondary" onClick={() => setShowWikiModal(false)}>
                Cerrar Wiki
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated CSV Export Guide Modal (Desacoplado de la Wiki) */}
      {showCsvGuideModal && (
        <div className="modal-overlay" onClick={() => setShowCsvGuideModal(false)}>
          <div
            className="modal-content"
            style={{ width: "700px", maxWidth: "92vw", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileSpreadsheet size={18} color="#f59e0b" strokeWidth={1.5} />
                <span className="modal-title">Guía Oficial: Por qué usar CSV y cómo exportar</span>
              </div>
              <button className="icon-btn" onClick={() => setShowCsvGuideModal(false)}>
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", fontSize: "0.78rem", color: "#e0e0e0", lineHeight: 1.5, paddingRight: "0.5rem" }}>
              <div className="help-banner" style={{ marginBottom: "1rem" }}>
                <strong>¿Por qué NO permitimos importar XLSX, JSON o XML directamente?</strong><br />
                Los archivos binarios (.xlsx) y jerárquicos (.json, .xml) consumen decenas de megabytes de RAM en descompresión, admiten celdas combinadas y fórmulas opacas que desvirtúan la analítica. El formato <strong>CSV plano con codificación UTF-8</strong> garantiza tablas 100% rectangulares y permite a DuckDB procesar millones de filas en memoria en milisegundos.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ background: "#252526", padding: "10px 14px", borderRadius: "5px", border: "1px solid #3c3c3c" }}>
                  <div style={{ color: "#34a853", fontWeight: 700, fontSize: "0.82rem", marginBottom: "4px" }}>
                    📗 Microsoft Excel (Windows / Mac)
                  </div>
                  <div>1. Abre tu libro y ubícate en la hoja con los datos rectangulares.</div>
                  <div>2. Ve a <strong>Archivo &gt; Guardar como...</strong></div>
                  <div>3. En tipo de archivo, selecciona <strong>CSV UTF-8 (delimitado por comas) (*.csv)</strong>.</div>
                  <div style={{ fontSize: "0.7rem", color: "#a0a0a0", marginTop: "2px" }}>⚠️ No uses "CSV (MS-DOS)" ni "Texto con formato" para evitar pérdida de tildes o caracteres especiales.</div>
                </div>

                <div style={{ background: "#252526", padding: "10px 14px", borderRadius: "5px", border: "1px solid #3c3c3c" }}>
                  <div style={{ color: "#4285f4", fontWeight: 700, fontSize: "0.82rem", marginBottom: "4px" }}>
                    📊 Google Sheets
                  </div>
                  <div>1. Abre la hoja de cálculo en tu navegador.</div>
                  <div>2. Dirígete a <strong>Archivo &gt; Descargar &gt; Valores separados por comas (.csv, hoja actual)</strong>.</div>
                  <div>3. El archivo descargado ya cuenta con codificación UTF-8 estándar.</div>
                </div>

                <div style={{ background: "#252526", padding: "10px 14px", borderRadius: "5px", border: "1px solid #3c3c3c" }}>
                  <div style={{ color: "#a855f7", fontWeight: 700, fontSize: "0.82rem", marginBottom: "4px" }}>
                    🍎 Apple Numbers (macOS / iPadOS)
                  </div>
                  <div>1. En la barra superior, haz clic en <strong>Archivo &gt; Exportar a &gt; CSV...</strong></div>
                  <div>2. En 'Ajustes avanzados', confirma que la codificación sea <strong>UTF-8</strong>.</div>
                  <div>3. Haz clic en 'Siguiente...' y guarda tu archivo.</div>
                </div>

                <div style={{ background: "#252526", padding: "10px 14px", borderRadius: "5px", border: "1px solid #3c3c3c" }}>
                  <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.82rem", marginBottom: "4px" }}>
                    🗄️ Bases de Datos SQL (PostgreSQL, MySQL, SQLite)
                  </div>
                  <div>Exporta directamente el resultado de tu consulta a CSV:</div>
                  <pre style={{ background: "#181818", padding: "6px 10px", borderRadius: "4px", fontSize: "0.72rem", color: "#79c0ff", marginTop: "4px" }}>
                    \copy (SELECT * FROM ventas WHERE fecha &gt;= '2026-01-01') TO 'ventas.csv' WITH CSV HEADER;
                  </pre>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.7rem", color: "#888888" }}>
                Consulta más detalles en <code>Wiki/Página 5 Filosofía de Datos</code>.
              </span>
              <button className="btn btn-primary" onClick={() => setShowCsvGuideModal(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Guardado y Empaquetado Estructurado (Fase 8.5) */}
      <SaveProjectModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        projectName={projectName}
        currentDirectoryName={activeDirName}
        onSaveAsFolder={handleSaveAsFolderConfirmed}
        onSaveInstantSnapshot={handleSaveInstantSnapshotConfirmed}
        onOverwriteCurrentFolder={
          projectDirHandle
            ? async () => {
                await handleSaveProject(false);
              }
            : undefined
        }
      />
 
       {/* Modal de Apertura de Proyecto (Fase 8.5) */}
       <OpenProjectModal
         isOpen={showOpenModal}
         onClose={() => setShowOpenModal(false)}
         onOpenSingleFile={handleOpenProjectSingleFilePicker}
         onOpenFolder={handleOpenProjectDirectory}
         savedDirectoryName={activeDirName || getSavedProjectDirectoryName()}
       />

      {/* Floating Status Notification Toast */}
      {statusNotification && (
        <div className="toast-notification">
          <span>{statusNotification}</span>
        </div>
      )}
    </div>
  );
}

export default App;
