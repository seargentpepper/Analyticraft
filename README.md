<p align="center">
  <img src="logo.png" width="128" height="128" alt="Analyticraft icon: a duck">
</p>

<h1 align="center">Analyticraft</h1>

<p align="center">
  <b>Minimalist, local-first open-source desktop Business Intelligence tool for SMEs, rebuilt in Tauri, DuckDB-WASM, React, and Apache ECharts.</b>
</p>

<p align="center">
  A native Business Intelligence desktop application with a 3-view shell, decoupled ribbon with shortcuts, dockable fields and visualizations panels, and a persistent free-form canvas. It runs natively on macOS, Windows, and Linux, and in the browser via WebAssembly. non-built by the ArtCraft team.
</p>

<p align="center">
  <img alt="Status: stable" src="https://img.shields.io/badge/status-stable-dac604?style=flat-square">
  <img alt="DuckDB-WASM: 50%" src="https://img.shields.io/badge/DuckDB--WASM-50%25-blueviolet?style=flat-square">
  <img alt="React 19 + TypeScript + Vite 8: 20%" src="https://img.shields.io/badge/React%2019%20%2B%20TS%20%2B%20Vite%208-20%25-blue?style=flat-square">
  <img alt="Tauri v2 (Rust): 15%" src="https://img.shields.io/badge/Tauri%20v2%20(Rust)-15%25-orange?style=flat-square">
  <img alt="Apache ECharts 6 + Lucide Icons: 15%" src="https://img.shields.io/badge/Apache%20ECharts%206-15%25-green?style=flat-square">
  <br>
  <a href="https://sonarcloud.io/"><img alt="Scanned by SonarCloud" src="https://img.shields.io/badge/Scanned_by-SonarCloud-4b9fd5?style=flat-square&logo=sonarqubecloud&logoColor=white"></a>
  <a href="https://coderabbit.ai"><img alt="Reviewed by CodeRabbit" src="https://img.shields.io/coderabbit/prs/github/seargentpepper/analyticraft?style=flat-square&label=Reviewed%20by%20CodeRabbit&logo=coderabbit"></a>
</p>

<p align="center">
  <a href="https://seargentpepper.github.io/Analyticraft/"><b>Analyticraft on seargentpepper.github.io</b></a> ·
  <a href="https://getartcraft.com/">ArtCraft</a> ·
  <a href="https://getartcraft.com/apps">All Crafting Apps</a>
</p>

<br>

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
