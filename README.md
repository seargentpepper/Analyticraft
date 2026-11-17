# Analyticraft

Herramienta de Business Intelligence de escritorio, minimalista, *local-first* y de código abierto (Tauri v2 + DuckDB-WASM + React 19 + Apache ECharts 6) enfocada en PyMEs.

> **Versión actual:** `v0.8.4` (Estable)  
> **Presentación del producto, arquitectura visual y comparativa:** consulta la [Landing Page]([https://seargentpepper.github.io/Analyticraft/#flujo).

---

## Resumen de Cobertura Completada

| Área del Sistema | Versiones Clave Completadas | Cobertura Lograda al Día de Hoy (`v0.8.4`) |
|---|---|---|
| **Arquitectura de Interfaz Power BI** | `v0.5.0`, `v0.5.1`, `v0.6.0–0.6.1`, `v0.8.4` | Shell de 3 vistas, Ribbon desacoplado con atajos, paneles acoplables de Campos y Visualizaciones, y lienzo libre persistente (`{ x, y, w, h }`) con ajuste a cuadrícula. |
| **Gobernanza y Filosofía de Datos** | `v0.1.0`, `v0.2.0–0.4.0`, `v0.5.0`, `v0.8.2`, `v0.8.4` | Vista de Datos *Read-Only*, paginación <16ms en DuckDB, Hot Swap atómico transaccional, arranque virgen limpio y preservación segura de `bigint`. |
| **Modelado Semántico y Relacional** | `v0.7.0`, `v0.8.0`, `v0.8.1`, `v0.8.2`, `v0.8.4` | Grafo de tablas, heurística auto-detect, vistas virtuales deduplicadas aisladas en ventana flotante de relaciones, modo compacto y *focus & dimming*. |
| **Interactividad y Visualizaciones** | `v0.1.0`, `v0.2.0–0.4.0`, `v0.6.1`, `v0.8.4` | Segmentador reactivo con buscador en vivo, 18 temas, ECharts optimizado, filtros numéricos tipados (`TRY_CAST`), orden cronológico en series temporales y reactividad universal `isDirty`. |
| **Calidad de Software y Testing** | `v0.8.3`, `v0.8.4` | Suite automatizada con Vitest 5 (`30` pruebas unitarias), CSP estricta en Tauri y depuración de dependencias. |
| **Distribución y Exportación** | `v0.1.0`, `v0.2.0–0.4.0`, `v0.8.2`, `v0.8.4` | Exportador HTML autocontenido offline con espera activa de consultas y exportación de síntesis relacional Markdown para LLMs. |

---

## Puesta en Marcha (Desarrollo Local)

### Prerrequisitos
- **Node.js:** Versión LTS activa (`v20.x` o `v22.x`)
- **Rust y Cargo:** `v1.75+` (instalado vía `rustup`)
- **Gestor de paquetes:** `pnpm` o `npm` (`v10+`)
- **Compilador C++ (Windows):** Microsoft Visual Studio C++ Build Tools y Windows SDK

### Instalación y Comandos
```bash
# 1. Clonar el repositorio
git clone https://github.com/seargentpepper/Analyticraft.git
cd Analyticraft

# 2. Instalar dependencias
pnpm install
# (o alternativamente: npm install)

# 3. Iniciar la aplicación nativa de escritorio (Tauri)
pnpm run tauri dev
# (o: npm run tauri dev)

# 4. Ejecutar suite de pruebas unitarias (Vitest)
pnpm test
# (o: npm test)

# 5. Compilar y verificar tipos estrictos
pnpm run build
# (o: npm run build)
```

---

## Documentación y Enlaces

- **[ROADMAP.md](./ROADMAP.md):** Hoja de ruta activa con las próximas **versiones clave** planificadas (`v0.9.0` hacia `v8.9.0`: páginas múltiples, MapLibre GL JS, Semantycs, SQL Shortcuts, sidecar `analyticraft-sync`, CLI, MCP y Ollama local).
- **[CHANGELOG.md](./CHANGELOG.md):** Historial unificado y legible de todas las versiones completadas (`v0.1.0` a `v0.8.4`).
- **[UI_STABILITY_POLICY.md](./UI_STABILITY_POLICY.md):** Política estricta de estabilidad de interfaz y no regresión.
- **[CONTRIBUTING.md](./CONTRIBUTING.md):** Directrices de arquitectura, control de alcance y checklist para Pull Requests.
- **[Índice de la Wiki](./docs/Índice%20de%20la%20Wiki.md):** Base de conocimiento con la arquitectura, flujos de datos y contratos técnicos del sistema.

---

## Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE).
