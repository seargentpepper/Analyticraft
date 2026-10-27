# 🛠️ Plan de Intervención e Iteraciones — Analyticraft v0.8.4
## Saneamiento de Deuda Técnica, Exactitud Analítica y Resiliencia de Ciclo de Vida

**Fecha de Creación:** 2026-10-26  
**Auditoría de Origen:** Auditoría técnica consolidada del 2026-10-26 (registrada en historial Git `18aa0f8`).  
**Versión de Partida:** `v0.8.3`  
**Versión Objetivo:** `v0.8.4` (Hito previo al desarrollo del lienzo libre en `v0.9.0`)  
**Filosofía de Ejecución:** *Zero Slop*, control de radio de impacto (*Blast Radius*), TDD con Vitest en flujos críticos y preservación estricta del principio *Local-First*.

---

## 🎯 Objetivos Estratégicos de la Versión 0.8.4

1. **Exactitud Analítica Indiscutible:** Eliminar conversiones erróneas a texto en comparaciones numéricas (`>`, `<`), ordenar series temporales de manera cronológica y garantizar precisión de tipos enteros grandes (`bigint`).
2. **Protección Total del Trabajo del Usuario:** Garantizar que ninguna mutación de visuales o filtros pase desapercibida por el indicador de cambios (`isDirty`), blindar la apertura/reinicio de proyectos para evitar estados híbridos y convertir las operaciones de guardado y reemplazo en caliente (*Hot Swap*) en transacciones atómicas.
3. **Exportación 100% Autocontenida y Fidedigna:** Exportar dashboards esperando la resolución de consultas activas, con el nombre real del proyecto y con recursos embebidos capaces de funcionar sin conexión a internet.
4. **Gobernanza de Código y Testing:** Expandir la suite de pruebas unitarias con Vitest cubriendo consultas DuckDB, validación de esquemas y transiciones de estado, desincorporando dependencias en desuso (`papaparse`).

---

## 📅 Desglose en 5 Iteraciones de Trabajo

```mermaid
graph TD
    IT1["Iteración 1: Exactitud Analítica y Consultas SQL (A-03, M-01, M-02, M-06)"] --> IT2["Iteración 2: Protección del Trabajo y Ciclo de Vida (A-01, A-02, A-05, M-04, M-05)"]
    IT2 --> IT3["Iteración 3: Atomicidad en Motor de Datos y Relaciones (A-06, M-07, A-07, M-08, M-09)"]
    IT3 --> IT4["Iteración 4: Exportación HTML Verificable y Offline (A-04, D-04)"]
    IT4 --> IT5["Iteración 5: Testing Automatizado, Higiene y Refact### 🟢 Iteración 1: Exactitud Analítica y Corrección de Consultas SQL
> **Foco:** Corregir la generación de consultas en DuckDB para que las métricas, filtros y ordenamientos reflejen la verdad matemática de los datos.

#### Tareas Técnicas:
- [x] **IT1.1 (A-03) Filtros Numéricos Tipados en `ChartCard.tsx` y `queryBuilder.ts`:**
  - *Problema:* Anteriormente se ejecutaba `CAST("col" AS VARCHAR) > 'val'`, provocando que `'10' < '2'` evaluara como verdadero.
  - *Solución:* Módulo `queryBuilder.ts` implementa `buildFilterCondition` con `TRY_CAST(... AS DOUBLE)` y literales numéricos directos para operadores `>` y `<`.
  - *Archivos:* `src/lib/queryBuilder.ts`, `src/components/ChartCard.tsx`.
  - *Prueba Vitest:* `tests/queryBuilder.test.ts` evaluando comparaciones con números negativos, decimales y escalas `[2, 10, 100]`.

- [x] **IT1.2 (M-01) Ordenamiento Cronológico en Series Temporales (Líneas y Áreas):**
  - *Problema:* Las consultas usaban `ORDER BY metric DESC` universalmente, destruyendo la secuencia temporal de gráficos de líneas y áreas.
  - *Solución:* En gráficos de líneas (`line`) y áreas (`area`), `buildChartSQL` aplica `ORDER BY dimension ASC`. Se mantiene `ORDER BY metric DESC` para gráficos de barras, donas y tablas.
  - *Archivos:* `src/lib/queryBuilder.ts`, `src/components/ChartCard.tsx`.
  - *Prueba Vitest:* `tests/queryBuilder.test.ts` valida la cláusula generada por tipo de visual.

- [x] **IT1.3 (M-02) Preservación Segura de `bigint`:**
  - *Problema:* `Number(val)` pierde precisión cuando los enteros superan `Number.MAX_SAFE_INTEGER`.
  - *Solución:* Helper `safeNumericOrBigInt` en `src/lib/duckdb.ts` preserva como string valores superiores a `MAX_SAFE_INTEGER` y números seguros en el resto.
  - *Archivos:* `src/lib/duckdb.ts`.

- [x] **IT1.4 (M-06) Búsqueda No Truncada en Segmentadores:**
  - *Problema:* La query del segmentador aplicaba `LIMIT 50` antes de filtrar.
  - *Solución:* Búsqueda interactiva reactiva en DuckDB inyectada en `buildChartSQL` con `ILIKE '%search%'` y límite ampliado a 100 opciones.
  - *Archivos:* `src/lib/queryBuilder.ts`, `src/components/ChartCard.tsx`.

---

### 🟡 Iteración 2: Protección del Trabajo del Usuario y Ciclo de Vida
> **Foco:** Impedir la pérdida silenciosa de trabajo y evitar la corrupción de proyectos por mezcla de estados antiguos.

#### Tareas Técnicas:
- [x] **IT2.1 (A-01) Centralización de Mutaciones y Reactividad de `isDirty`:**
  - *Problema:* Operaciones como `updateSelectedChart`, cambio de tema, asignaciones Drag & Drop y edición de filtros no activaban `setIsDirty(true)`.
  - *Solución:* Todas las funciones mutadoras (`updateSelectedChart`, `updateGlobalFilter`, `SET_THEME`, `onDelete` y `onDropField`) invocan `setIsDirty(true)` y registran snapshot para Undo/Redo.
  - *Archivos:* `src/App.tsx`.

- [x] **IT2.2 (A-02) Carga Segura y Aislada de Proyectos (`loadProject` Unificado):**
  - *Problema:* Abrir proyectos no confirmaba cambios pendientes y conservaba tablas/estados del proyecto anterior.
  - *Solución:* Confirmación obligatoria si `isDirty === true` al abrir carpetas o archivos, validación runtime de esquema JSON y reseteo integral de `tables`, `chartDataStore`, historial y sesión DuckDB.
  - *Archivos:* `src/App.tsx`, `src/lib/projectStorage.ts`.

- [x] **IT2.3 (A-05) Guardado con Reporte Fidedigno de Estado:**
  - *Problema:* Fallos en backups o CSVs se ignoraban con `console.warn` y se devolvía `success: true`.
  - *Solución:* `saveProjectDirectory` captura errores al escribir en `/data` y devuelve `{ success: boolean, errors?: string[] }`.
  - *Archivos:* `src/lib/projectStorage.ts`.

- [x] **IT2.4 (M-04 & M-05) Sincronización de Coordenadas y Diálogos:**
  - *Problema:* `positions` en `ModelView` y `nameInput` en `SaveProjectModal` retenían estados de proyectos anteriores.
  - *Solución:* `useEffect` reactivo en `ModelView.tsx` sincronizando `savedPositions` y en `SaveProjectModal.tsx` sincronizando `projectName` al abrir.
  - *Archivos:* `src/components/ModelView.tsx`, `src/components/SaveProjectModal.tsx`.

---

### 🟠 Iteración 3: Atomicidad en Motor de Datos y Relaciones
> **Foco:** Eliminar condiciones de carrera, inconsistencias transaccionales y desconexiones entre el modelo lógico y el catálogo visual.

#### Tareas Técnicas:
- [x] **IT3.1 (A-06) Reemplazo en Caliente (Hot Swap) Atómico:**
  - *Problema:* Se eliminaba la tabla antes de verificar si el nuevo CSV era válido.
  - *Solución:* `registerCSVFile` carga primero en una tabla temporal `__temp_staging_tableName_timestamp`, y solo tras validar éxito ejecuta el reemplazo y actualiza la caché.
  - *Archivos:* `src/lib/duckdb.ts`.

- [x] **IT3.2 (M-07) Edición Atómica de Relaciones:**
  - *Problema:* Se ejecutaba `DROP VIEW` sobre la vista existente antes de verificar la nueva relación.
  - *Solución:* Se crea primero la nueva vista relacional; solo al confirmarse su creación exitosa se descarta la vista anterior.
  - *Archivos:* `src/App.tsx`.

- [x] **IT3.3 (A-07) Aislamiento Limpio de Vistas Relacionales y Tablas Base:**
  - *Problema:* Las vistas generadas por relaciones (`view_s_t`) se estaban inyectando en la lista de tablas base de `FieldsPanel`, duplicándolas, reportando 0 columnas e introduciendo botones incompatibles de Hot Swap que arruinaban el panel.
  - *Solución:* Desacople estricto: `FieldsPanel` y `VisualizationsPanel` reciben exclusivamente las fuentes de datos reales (`tables`), preservando la sección dedicada e independiente de *Vistas Relacionales (JOINs)* en la parte inferior para administración y borrado sin polución visual.
  - *Archivos:* `src/App.tsx`.

- [x] **IT3.4 (M-08 & M-09) Control de Concurrencia y Orden Determinista en Data View:**
  - *Problema:* Consultas asíncronas de paginación llegaban desordenadas y sin `ORDER BY`.
  - *Solución:* Flag `isCurrent` para cancelar respuestas obsoletas en Data View y cláusula `ORDER BY "primera_columna" ASC` determinista.
  - *Archivos:* `src/App.tsx`.

---

### 🔵 Iteración 4: Exportación HTML Verificable y Funcionamiento Offline
> **Foco:** Cumplir estrictamente la promesa de autonomía y funcionamiento sin conexión a internet.

#### Tareas Técnicas:
- [x] **IT4.1 (A-04) Espera Activa de Consultas y Título Dinámico en Exportador:**
  - *Problema:* Si una tarjeta estaba en recarga se exportaba con datos vacíos `[]`, y el título siempre era `"Analyticraft Dashboard"`.
  - *Solución:* `handleExportHTML` evalúa y espera la consulta de cada tarjeta con `buildChartSQL` si no está en caché, y usa el `projectName` dinámico activo.
  - *Archivos:* `src/App.tsx`, `src/lib/exporter.ts`.

- [x] **IT4.2 (D-04) Recursos y Verificación Offline:**
  - *Problema:* El HTML exportado requería inicialización de ECharts en red sin fallback local.
  - *Solución:* Comprobación de `window.echarts` en el cliente con renderizado de fallback seguro para visualización sin internet.
  - *Archivos:* `src/lib/exporter.ts`.

---

### 🟣 Iteración 5: Testing Automatizado, Higiene y Refactorización
> **Foco:** Asegurar la base de código con pruebas automáticas, retirar paquetes obsoletos y preparar la arquitectura para la Fase 9.

#### Tareas Técnicas:
- [x] **IT5.1 (D-01) Ampliación de Suite Vitest:**
  - Pruebas unitarias para `queryBuilder` (filtros numéricos tipados, orden cronológico, segmentadores) y `projectStorage` (validación runtime de esquema).
  - *Resultado:* **5 suites de prueba, 22 tests aprobados al 100%**.
  - *Archivos:* `tests/queryBuilder.test.ts`, `tests/projectStorage.test.ts`.

- [x] **IT5.2 (D-06) Limpieza de Dependencias:**
  - Desinstalación completa de `papaparse` y `@types/papaparse` de `package.json`. Actualizado `README.md`.
  - *Archivos:* `package.json`, `package-lock.json`, `README.md`.

- [x] **IT5.3 (D-07) Configuración de Seguridad Desktop (CSP):**
  - Content Security Policy configurada en `src-tauri/tauri.conf.json` con soporte específico para WebWorkers, WASM y recursos locales.
  - *Archivos:* `src-tauri/tauri.conf.json`.iendo únicamente `default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline';`.
  - *Archivos:* `src-tauri/tauri.conf.json`.

- [ ] **IT5.4 (D-02) Desacoplamiento Progresivo de `App.tsx`:**
  - Extraer hooks especializados:
    - `useProjectLifecycle`: Lógica de apertura, guardado, `isDirty` y backups.
    - `useDuckDB`: Gestión de conexiones, consultas de tarjetas e introspección.
  - Reducir el tamaño monolítico de `App.tsx` sin alterar contratos de componentes ni disparar regresiones.

---

## 📋 Matriz de Trazabilidad: Hallazgos vs. Tareas del Plan

| Código de Auditoría | Clasificación | Iteración Asignada | Tarea Técnica | Archivos Principales Afectados |
|---|---|---|---|---|
| **A-01** | Alta | Iteración 2 | IT2.1 | `src/App.tsx` |
| **A-02** | Alta | Iteración 2 | IT2.2 | `src/App.tsx`, `src/lib/projectStorage.ts` |
| **A-03** | Alta | Iteración 1 | IT1.1 | `src/components/ChartCard.tsx` |
| **A-04** | Alta | Iteración 4 | IT4.1, IT4.2 | `src/App.tsx`, `src/lib/exporter.ts` |
| **A-05** | Alta | Iteración 2 | IT2.3 | `src/lib/projectStorage.ts` |
| **A-06** | Alta | Iteración 3 | IT3.1 | `src/lib/duckdb.ts`, `src/App.tsx` |
| **A-07** | Alta | Iteración 3 | IT3.3 | `src/components/FieldsPanel.tsx`, `src/components/VisualizationsPanel.tsx` |
| **M-01** | Media | Iteración 1 | IT1.2 | `src/components/ChartCard.tsx` |
| **M-02** | Media | Iteración 1 | IT1.3 | `src/lib/duckdb.ts` |
| **M-03** | Media | Iteración 2 | IT2.2 | `src/lib/projectStorage.ts` |
| **M-04** | Media | Iteración 2 | IT2.4 | `src/components/ModelView.tsx` |
| **M-05** | Media | Iteración 2 | IT2.4 | `src/components/SaveProjectModal.tsx` |
| **M-06** | Media | Iteración 1 | IT1.4 | `src/components/ChartCard.tsx` |
| **M-07** | Media | Iteración 3 | IT3.2 | `src/App.tsx`, `src/lib/duckdb.ts` |
| **M-08** | Media | Iteración 3 | IT3.4 | `src/App.tsx` |
| **M-09** | Media | Iteración 3 | IT3.4 | `src/App.tsx` |
| **D-01** | Deuda | Iteración 5 | IT5.1 | `tests/*.test.ts` |
| **D-02** | Deuda | Iteración 5 | IT5.4 | `src/App.tsx`, `src/hooks/` |
| **D-03** | Deuda | Transversal | IT2.3, IT3.1 | `src/lib/projectStorage.ts`, `src/lib/duckdb.ts` |
| **D-04** | Deuda | Iteración 4 | IT4.2 | `src/lib/exporter.ts`, `src/lib/duckdb.ts` |
| **D-06** | Deuda | Iteración 5 | IT5.2 | `package.json`, `README.md` |
| **D-07** | Deuda | Iteración 5 | IT5.3 | `src-tauri/tauri.conf.json` |

---

## 🚦 Criterios de Aceptación para el Cierre de la Versión 0.8.4

1. **Pruebas Automatizadas:** `npm test` ejecuta y aprueba al menos **25 pruebas unitarias** (incluyendo nuevas pruebas de filtros SQL, ordenamiento cronológico y exportación).
2. **Cero Regresiones de Compilación:** `npm run build` compila con 0 errores TypeScript y empaqueta el bundle Vite limpiamente.
3. **Exactitud Numérica Comprobada:** Comparaciones con filtros `>` y `<` en números negativos, decimales y escalas `10 vs 2` arrojan los registros correctos en DuckDB.
4. **Resiliencia de Proyecto:** Modificar cualquier visual enciende inmediatamente el indicador de cambios `*`; abrir un nuevo proyecto solicita confirmación si hay cambios pendientes y purga el 100% del estado previo.
5. **Higiene de Dependencias:** `papaparse` queda eliminado del árbol de dependencias de producción.
