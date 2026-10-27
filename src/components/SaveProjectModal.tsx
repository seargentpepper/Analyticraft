import React, { useState } from "react";
import {
  X,
  FolderOpen,
  Download,
  FolderPlus,
  HardDrive,
} from "lucide-react";
import { isFileSystemAccessSupported } from "../lib/projectStorage";

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  onSaveAsFolder: (projectName: string) => Promise<void>;
  onSaveInstantSnapshot: (projectName: string) => void;
  currentDirectoryName?: string | null;
  onOverwriteCurrentFolder?: () => Promise<void>;
}

export const SaveProjectModal: React.FC<SaveProjectModalProps> = ({
  isOpen,
  onClose,
  projectName,
  onSaveAsFolder,
  onSaveInstantSnapshot,
  currentDirectoryName,
  onOverwriteCurrentFolder,
}) => {
  const [nameInput, setNameInput] = useState<string>(
    projectName.replace(/\.analyticraft$/i, "") || "Mi_Proyecto_Analyticraft"
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setNameInput(projectName.replace(/\.analyticraft$/i, "") || "Mi_Proyecto_Analyticraft");
    }
  }, [isOpen, projectName]);

  if (!isOpen) return null;

  const handleFolderSave = async () => {
    setIsSaving(true);
    try {
      await onSaveAsFolder(nameInput.trim() || "Sin_Titulo");
      onClose();
    } catch (err: any) {
      console.error("Error al guardar en carpeta:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverwrite = async () => {
    if (!onOverwriteCurrentFolder) return;
    setIsSaving(true);
    try {
      await onOverwriteCurrentFolder();
      onClose();
    } catch (err: any) {
      console.error("Error al sobrescribir:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnapshotSave = () => {
    onSaveInstantSnapshot(nameInput.trim() || "Sin_Titulo");
    onClose();
  };

  const supportsDirPicker = isFileSystemAccessSupported();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
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
          maxWidth: "640px",
          color: "#d4d4d4",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.6)",
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FolderPlus size={18} color="#38bdf8" />
            <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>
              Guardar Proyecto de Analyticraft
            </h2>
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

        {/* Body */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Project Name Input */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#9cdcfe",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Nombre del Archivo / Proyecto
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Nombre_Del_Proyecto"
                style={{
                  flex: 1,
                  background: "#2d2d30",
                  border: "1px solid #3e3e42",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
              <span
                style={{
                  background: "#252526",
                  border: "1px solid #3e3e42",
                  borderRadius: "4px",
                  padding: "8px 10px",
                  fontSize: "0.78rem",
                  color: "#4ec9b0",
                  fontWeight: 700,
                }}
              >
                .analyticraft
              </span>
            </div>
          </div>

          {/* Current Path Banner if already saved */}
          {currentDirectoryName && (
            <div
              style={{
                background: "#182230",
                border: "1px solid #0284c7",
                borderRadius: "6px",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <HardDrive size={16} color="#38bdf8" />
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#93c5fd", fontWeight: 700 }}>
                    Directorio activo vinculado:
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#ffffff", fontWeight: 600 }}>
                    📁 {currentDirectoryName}
                  </div>
                </div>
              </div>
              {onOverwriteCurrentFolder && (
                <button
                  onClick={handleOverwrite}
                  disabled={isSaving}
                  style={{
                    background: "#0284c7",
                    border: "none",
                    borderRadius: "4px",
                    color: "#ffffff",
                    padding: "6px 12px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Sobrescribir Aquí
                </button>
              )}
            </div>
          )}

          {/* Two Distinct Modes of Saving */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "4px" }}>
            {/* Option 1: Full Project Package in Dedicated Directory */}
            <div
              style={{
                background: "#252526",
                border: "1px solid #007acc",
                borderRadius: "6px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <FolderOpen size={16} color="#007acc" />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#ffffff" }}>
                    Proyecto Empaquetado
                  </span>
                </div>
                <p style={{ fontSize: "0.73rem", color: "#cccccc", lineHeight: "1.4", margin: "0 0 10px 0" }}>
                  Crea o vincula una carpeta en tu equipo. Guarda el archivo maestro, anida copias de los CSVs en{" "}
                  <code style={{ color: "#4ec9b0" }}>/data</code> y genera respaldos seriados automáticos en{" "}
                  <code style={{ color: "#f59e0b" }}>/backups</code>.
                </p>
                <div style={{ fontSize: "0.7rem", color: "#858585", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div>✓ Estructura ordenada y persistente</div>
                  <div>✓ Respaldo automático (_backup_001, etc.)</div>
                  <div>✓ No satura tu carpeta de descargas</div>
                </div>
              </div>

              <button
                onClick={handleFolderSave}
                disabled={isSaving}
                style={{
                  marginTop: "14px",
                  background: "#007acc",
                  border: "none",
                  borderRadius: "4px",
                  color: "#ffffff",
                  padding: "9px 12px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "background 0.15s ease",
                }}
              >
                <FolderOpen size={14} />
                <span>{supportsDirPicker ? "Elegir Carpeta y Guardar" : "Guardar Proyecto"}</span>
              </button>
            </div>

            {/* Option 2: Instant Snapshot (.analyticraft File) */}
            <div
              style={{
                background: "#252526",
                border: "1px solid #3e3e42",
                borderRadius: "6px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <Download size={16} color="#4ec9b0" />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#ffffff" }}>
                    Instantánea Rápida
                  </span>
                </div>
                <p style={{ fontSize: "0.73rem", color: "#cccccc", lineHeight: "1.4", margin: "0 0 10px 0" }}>
                  Descarga un archivo individual <code style={{ color: "#4ec9b0" }}>.analyticraft</code> con los
                  gráficos, relaciones y datos CSV embebidos, ideal para transferir rápidamente por correo o USB.
                </p>
                <div style={{ fontSize: "0.7rem", color: "#858585", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div>✓ Archivo único portable</div>
                  <div>✓ Contiene datos embebidos</div>
                  <div>✓ Descarga directa e instantánea</div>
                </div>
              </div>

              <button
                onClick={handleSnapshotSave}
                style={{
                  marginTop: "14px",
                  background: "#333333",
                  border: "1px solid #4a4a4a",
                  borderRadius: "4px",
                  color: "#d4d4d4",
                  padding: "9px 12px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Download size={14} />
                <span>Descargar Instantánea</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.85rem 1.25rem",
            background: "#252526",
            borderTop: "1px solid #333333",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #4a4a4a",
              color: "#cccccc",
              borderRadius: "4px",
              padding: "6px 14px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
