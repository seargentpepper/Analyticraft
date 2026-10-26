import { AnalyticraftProject, ProjectSourceCSV } from "../types/dashboard";

export interface ProjectSaveResult {
  success: boolean;
  dirHandle: any | null;
  projectName: string;
  backupCreated?: string | null;
  method: "directory" | "download";
}

export interface ProjectLoadResult {
  project: AnalyticraftProject;
  csvFiles: ProjectSourceCSV[];
  dirHandle: any | null;
}

/**
 * Checks if the File System Access API (showDirectoryPicker) is supported in the current environment.
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export function getSavedProjectDirectoryName(): string | null {
  try {
    return localStorage.getItem("analyticraft_active_directory_name");
  } catch {
    return null;
  }
}

export function setSavedProjectDirectoryName(name: string | null): void {
  try {
    if (name) {
      localStorage.setItem("analyticraft_active_directory_name", name);
    } else {
      localStorage.removeItem("analyticraft_active_directory_name");
    }
  } catch {}
}

/**
 * Exports an instant self-contained .analyticraft snapshot file with embedded CSV data
 */
export function exportProjectSnapshot(
  project: AnalyticraftProject,
  csvMap: Map<string, { fileName: string; content: string }>,
  customName?: string
): void {
  const cleanName = (customName || project.name || "Sin_Titulo")
    .replace(/\.analyticraft$/i, "")
    .trim();

  const sourcesList: ProjectSourceCSV[] = Array.from(csvMap.entries()).map(
    ([tableName, item]) => ({
      tableName,
      fileName: item.fileName,
      content: item.content,
    })
  );

  const fullProjectData: AnalyticraftProject = {
    ...project,
    version: "1.1",
    name: cleanName,
    sources: sourcesList,
    savedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(fullProjectData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cleanName}.analyticraft`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Saves a project in an enterprise-grade folder bundle:
 * 📁 <Proyecto>/
 *    ├── <Proyecto>.analyticraft
 *    ├── 📁 data/     (Copias de los CSVs cargados)
 *    ├── 📁 backups/  (Versiones previas seriadas: <Proyecto>_backup_001.analyticraft)
 *    └── 📁 temp/     (Temporales y multimedia)
 */
export async function saveProjectFolder(
  project: AnalyticraftProject,
  csvMap: Map<string, { fileName: string; content: string }>,
  existingDirHandle?: any | null,
  forceNewFolderPrompt: boolean = false
): Promise<ProjectSaveResult> {
  const cleanName = (project.name || "Sin_Titulo")
    .replace(/\.analyticraft$/i, "")
    .trim();

  const sourcesList: ProjectSourceCSV[] = Array.from(csvMap.entries()).map(
    ([tableName, item]) => ({
      tableName,
      fileName: item.fileName,
      content: item.content,
    })
  );

  const fullProjectData: AnalyticraftProject = {
    ...project,
    version: "1.1",
    name: cleanName,
    sources: sourcesList, // Embedded for maximum portability
    savedAt: new Date().toISOString(),
  };

  const projectJson = JSON.stringify(fullProjectData, null, 2);

  // 1. If File System Access API is supported and user has chosen or can choose a folder
  if (isFileSystemAccessSupported()) {
    try {
      let dirHandle = existingDirHandle;

      if (!dirHandle || forceNewFolderPrompt) {
        dirHandle = await (window as any).showDirectoryPicker({
          id: "analyticraft_projects",
          mode: "readwrite",
          startIn: "documents",
        });
      }

      // Ensure subdirectories exist
      const dataSubDir = await dirHandle.getDirectoryHandle("data", { create: true });
      const backupsSubDir = await dirHandle.getDirectoryHandle("backups", { create: true });
      await dirHandle.getDirectoryHandle("temp", { create: true });

      // Check if main project file already exists to create serialized backup
      let backupCreated: string | null = null;
      try {
        const existingProjectFileHandle = await dirHandle.getFileHandle(
          `${cleanName}.analyticraft`,
          { create: false }
        );
        const existingFile = await existingProjectFileHandle.getFile();
        const existingText = await existingFile.text();

        // Calculate next backup serial number
        let nextIndex = 1;
        try {
          for await (const entry of backupsSubDir.values()) {
            if (entry.kind === "file" && entry.name.startsWith(`${cleanName}_backup_`)) {
              const match = entry.name.match(/_backup_(\d+)\.analyticraft$/i);
              if (match) {
                const num = parseInt(match[1], 10);
                if (num >= nextIndex) nextIndex = num + 1;
              }
            }
          }
        } catch (iterErr) {
          console.warn("No se pudo listar backups para seriado:", iterErr);
        }

        const serialStr = String(nextIndex).padStart(3, "0");
        const backupFileName = `${cleanName}_backup_${serialStr}.analyticraft`;

        const backupFileHandle = await backupsSubDir.getFileHandle(backupFileName, { create: true });
        const backupWritable = await backupFileHandle.createWritable();
        await backupWritable.write(existingText);
        await backupWritable.close();
        backupCreated = backupFileName;
      } catch (err: any) {
        // File does not exist yet; first save into this directory
      }

      // Write active project file
      const projectFileHandle = await dirHandle.getFileHandle(
        `${cleanName}.analyticraft`,
        { create: true }
      );
      const projectWritable = await projectFileHandle.createWritable();
      await projectWritable.write(projectJson);
      await projectWritable.close();

      // Write each registered CSV in /data
      for (const item of sourcesList) {
        try {
          const csvFileHandle = await dataSubDir.getFileHandle(item.fileName, { create: true });
          const csvWritable = await csvFileHandle.createWritable();
          await csvWritable.write(item.content);
          await csvWritable.close();
        } catch (csvErr) {
          console.warn(`Error al guardar CSV '${item.fileName}' en /data:`, csvErr);
        }
      }

      setSavedProjectDirectoryName(dirHandle.name || cleanName);
      return {
        success: true,
        dirHandle,
        projectName: cleanName,
        backupCreated,
        method: "directory",
      };
    } catch (err: any) {
      if (err.name === "AbortError") {
        return {
          success: false,
          dirHandle: existingDirHandle || null,
          projectName: cleanName,
          method: "directory",
        };
      }
      console.warn("Fallo en showDirectoryPicker, activando fallback de descarga:", err);
    }
  }

  // 2. Fallback: Download self-contained portable .analyticraft file with embedded CSV sources
  const blob = new Blob([projectJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cleanName}.analyticraft`;
  a.click();
  URL.revokeObjectURL(url);

  return {
    success: true,
    dirHandle: null,
    projectName: cleanName,
    method: "download",
  };
}

/**
 * Opens a project from a picked folder handle.
 */
export async function openProjectFolder(
  dirHandle: any
): Promise<ProjectLoadResult | null> {
  try {
    let mainProjectText: string | null = null;

    // Look for .analyticraft file in root
    for await (const entry of dirHandle.values()) {
      if (entry.kind === "file" && entry.name.endsWith(".analyticraft")) {
        const file = await entry.getFile();
        mainProjectText = await file.text();
        break;
      }
    }

    if (!mainProjectText) {
      alert("No se encontró ningún archivo de proyecto '.analyticraft' en la carpeta seleccionada.");
      return null;
    }

    const project = JSON.parse(mainProjectText) as AnalyticraftProject;
    const csvFiles: ProjectSourceCSV[] = [];

    // Read CSVs from data/ directory if present
    try {
      const dataSubDir = await dirHandle.getDirectoryHandle("data", { create: false });
      for await (const entry of dataSubDir.values()) {
        if (entry.kind === "file" && entry.name.toLowerCase().endsWith(".csv")) {
          const file = await entry.getFile();
          const content = await file.text();
          const tableName = entry.name
            .replace(/\.csv$/i, "")
            .replace(/[^a-zA-Z0-9_]/g, "_")
            .toLowerCase();
          csvFiles.push({
            tableName,
            fileName: entry.name,
            content,
          });
        }
      }
    } catch (err) {
      console.info("Carpeta /data no encontrada en directorio, usando fuentes embebidas si existen.");
    }

    // Merge embedded sources if disk /data was empty
    if (csvFiles.length === 0 && project.sources && project.sources.length > 0) {
      csvFiles.push(...project.sources);
    }

    setSavedProjectDirectoryName(dirHandle.name || project.name);
    return {
      project,
      csvFiles,
      dirHandle,
    };
  } catch (err: any) {
    alert("Error al abrir carpeta de proyecto: " + err.message);
    return null;
  }
}

/**
 * Opens a project from a single file (.analyticraft o .json).
 */
export async function openProjectSingleFile(
  file: File
): Promise<ProjectLoadResult | null> {
  const text = await file.text();
  const project = JSON.parse(text) as AnalyticraftProject;
  const csvFiles = project.sources || [];
  return {
    project,
    csvFiles,
    dirHandle: null,
  };
}
