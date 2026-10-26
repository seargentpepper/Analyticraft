import React from "react";
import {
  X,
  FolderOpen,
  FileCode2,
  FolderArchive,
  Info,
  CheckCircle2,
  HardDrive,
} from "lucide-react";

interface OpenProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSingleFile: () => void;
  onOpenFolder: () => void;
  savedDirectoryName?: string | null;
}

export const OpenProjectModal: React.FC<OpenProjectModalProps> = ({
  isOpen,
  onClose,
  onOpenSingleFile,
  onOpenFolder,
  savedDirectoryName,
}) => {
  if (!isOpen) return null;

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
          maxWidth: "660px",
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FolderOpen size={20} color="#cca700" />
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#ffffff" }}>
                Abrir Proyecto de Analyticraft
              </h2>
              <div style={{ fontSize: "0.72rem", color: "#888888", marginTop: "2px" }}>
                Elige si deseas abrir un archivo directo o vincular una carpeta empaquetada
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

        {/* Body */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Option 1: Abrir Archivo .analyticraft (Recomendado para ver archivos) */}
          <div
            style={{
              border: "1px solid #007acc",
              background: "linear-gradient(180deg, rgba(0, 122, 204, 0.12) 0%, rgba(30, 30, 30, 0.6) 100%)",
              borderRadius: "6px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    background: "rgba(56, 189, 248, 0.15)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    borderRadius: "6px",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileCode2 size={24} color="#38bdf8" />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#ffffff" }}>
                      Abrir Archivo (.analyticraft)
                    </span>
                    <span
                      style={{
                        background: "#007acc",
                        color: "#ffffff",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "10px",
                        textTransform: "uppercase",
                      }}
                    >
                      Recomendado
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#cccccc", marginTop: "3px" }}>
                    Visualiza y selecciona tu archivo de proyecto directamente en el Explorador de Windows.
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: "0.72rem",
                color: "#a0a0a0",
                lineHeight: 1.5,
                background: "rgba(0,0,0,0.25)",
                padding: "8px 10px",
                borderRadius: "4px",
                border: "1px solid #333333",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4ec9b0", fontWeight: 600 }}>
                <CheckCircle2 size={13} />
                <span>¿Por qué elegir esta opción?</span>
              </div>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: "1.2rem", color: "#bbbbbb" }}>
                <li>Muestra los archivos guardados (<code>.analyticraft</code> y <code>.json</code>).</li>
                <li>Ideal tanto para instantáneas individuales como para el archivo dentro de una carpeta empaquetada.</li>
                <li>Carga instantáneamente todas las tablas en DuckDB, relaciones, visuales y layout del lienzo.</li>
              </ul>
            </div>

            <button
              onClick={() => {
                onOpenSingleFile();
                onClose();
              }}
              style={{
                background: "linear-gradient(180deg, #007acc 0%, #005a9e 100%)",
                border: "1px solid #1177bb",
                borderRadius: "4px",
                padding: "8px 16px",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 2px 6px rgba(0, 122, 204, 0.4)",
              }}
            >
              <FileCode2 size={15} />
              <span>Seleccionar Archivo .analyticraft...</span>
            </button>
          </div>

          {/* Option 2: Abrir Carpeta de Proyecto Empaquetada */}
          <div
            style={{
              border: "1px solid #3e3e42",
              background: "#252526",
              borderRadius: "6px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    background: "rgba(204, 167, 0, 0.15)",
                    border: "1px solid rgba(204, 167, 0, 0.3)",
                    borderRadius: "6px",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FolderArchive size={24} color="#cca700" />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#ffffff" }}>
                      Abrir Carpeta Empaquetada
                    </span>
                    <span
                      style={{
                        background: "#3e3e42",
                        color: "#d4d4d4",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "10px",
                        textTransform: "uppercase",
                      }}
                    >
                      Modo Persistente
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#cccccc", marginTop: "3px" }}>
                    Vincula una carpeta completa para permitir guardado directo in-place y backups automáticos.
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: "0.72rem",
                color: "#eab308",
                lineHeight: 1.45,
                background: "rgba(234, 179, 8, 0.08)",
                padding: "8px 10px",
                borderRadius: "4px",
                border: "1px solid rgba(234, 179, 8, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                <Info size={14} />
                <span>¿Por qué el selector de carpetas no muestra archivos?</span>
              </div>
              <div style={{ marginTop: "4px", color: "#cccccc" }}>
                Por diseño de Windows, el diálogo de carpetas <strong>oculta todos los archivos</strong> y solo permite seleccionar directorios.
                Para usar esta opción, <strong>selecciona la carpeta raíz</strong> del proyecto (ej. <code>test</code>) y presiona <em>"Seleccionar carpeta"</em> sin entrar a la subcarpeta <code>/data/</code>.
              </div>
            </div>

            <button
              onClick={() => {
                onOpenFolder();
                onClose();
              }}
              style={{
                background: "#2d2d30",
                border: "1px solid #454545",
                borderRadius: "4px",
                padding: "8px 16px",
                color: "#d4d4d4",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <FolderOpen size={15} color="#cca700" />
              <span>Seleccionar Carpeta del Proyecto...</span>
            </button>
          </div>

          {savedDirectoryName && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.72rem",
                color: "#858585",
                background: "#181818",
                padding: "6px 10px",
                borderRadius: "4px",
              }}
            >
              <HardDrive size={13} color="#38bdf8" />
              <span>
                Última carpeta vinculada: <strong style={{ color: "#38bdf8" }}>{savedDirectoryName}</strong>
              </span>
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
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#333333",
              border: "1px solid #454545",
              borderRadius: "4px",
              padding: "6px 14px",
              color: "#cccccc",
              fontWeight: 600,
              fontSize: "0.78rem",
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
