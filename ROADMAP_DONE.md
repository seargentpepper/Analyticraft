# Roadmap de Analyticraft - Trabajo Completado (Done)

Este documento registra de forma exhaustiva el historial técnico y funcional de las fases completadas en **Analyticraft** desde el MVP fundacional hasta la versión estable actual.

- **Versión Actual:** `v0.8.3` (Estable)
- **Hoja de Ruta Activa:** Para consultar los próximos desarrollos e hitos hacia la versión 0.9 y 1.0, consulta **[ROADMAP.md (Coming Next)](./ROADMAP.md)**.
- **Historial Detallado de Versiones:** Consulta **[CHANGELOG.md](./CHANGELOG.md)**.

---

## Índice de Fases Completadas

1. [Fase 1: Fundaciones y MVP Local-First (v0.1)](#fase-1-fundaciones-y-mvp-local-first-v01)
2. [Fase 2: Robustez de Datos, Usabilidad y Experiencia Analítica (v0.2 - v0.4)](#fase-2-robustez-de-datos-usabilidad-y-experiencia-analítica-v02---v04)
3. [Fase 3: Shell Desktop y Barra Lateral de Vistas (3 Modos) (v0.5.0)](#fase-3-shell-desktop-y-barra-lateral-de-vistas-3-modos-v050)
4. [Fase 4: Refactorización UI de Shell y Vista de Datos Solo Lectura (v0.5.0)](#fase-4-refactorización-ui-de-shell-y-vista-de-datos-data-view-solo-lectura-v050)
5. [Fase 5: Cinta de Opciones Contextual (Ribbon Menu) y Despachador de Comandos (v0.5.1)](#fase-5-cinta-de-opciones-contextual-ribbon-menu-y-despachador-de-comandos-v051)
6. [Fase 5.1: Sprint de Estabilidad, Deduplicación de UI y Principio de Responsabilidad Única (v0.5.1)](#fase-51-sprint-de-estabilidad-deduplicación-de-ui-y-principio-de-responsabilidad-única-v051)
7. [Fase 6: Paneles Laterales Acoplables a la Derecha y Segmentadores (v0.6.0 - v0.6.1)](#fase-6-paneles-laterales-acoplables-a-la-derecha-visualizations--fields-y-segmentadores-v060---v061)
8. [Fase 7: Vista de Modelo Relacional (Grafo de Tablas, Drag & Drop y Vistas Virtuales) (v0.7.0)](#fase-7-vista-de-modelo-relacional-grafo-de-tablas-drag--drop-y-vistas-virtuales-v070)
9. [Fase 8: Asistente Newbie-Friendly en el Modelador Relacional (v0.8.0)](#fase-8-asistente-newbie-friendly-en-el-modelador-relacional-v080)
10. [Fase 8.1: Diagnóstico Ágil de Catálogo DuckDB, Estabilidad HMR y Visibilidad Contextual (v0.8.1)](#fase-81-diagnóstico-ágil-de-catálogo-duckdb-estabilidad-hmr-y-visibilidad-contextual-v081)
11. [Fase 8.2: Ergonomía de Modelos Complejos, Modales de Proyecto y Exportación para LLMs (v0.8.2)](#fase-82-ergonomía-de-modelos-complejos-modales-de-proyecto-y-exportación-para-llms-v082)
12. [Fase 8.3: Suite de Pruebas Unitarias Automatizadas (Vitest) y Gobernanza de Código (v0.8.3)](#fase-83-suite-de-pruebas-unitarias-automatizadas-vitest-y-gobernanza-de-código-v083)

---

### Fase 1: Fundaciones y MVP Local-First (v0.1) ✅
- [x] **Entorno Nativo:** Configuración de Tauri v2 (Rust) + Microsoft Visual Studio C++ Build Tools en Windows.
- [x] **Frontend Moderno:** React 19 + TypeScript + Vite + ECharts + Lucide Icons.
- [x] **Motor DuckDB en Memoria:** Ejecución de consultas analíticas vectorizadas sobre archivos locales sin infraestructura externa.
- [x] **Studio Inicial (3 Paneles):**
  - Panel izquierdo de carga y exploración de campos CSV.
  - Lienzo central interactivo en cuadrícula para tarjetas de gráficos.
  - Inspector de propiedades para dimensiones, métricas y agregaciones (`SUM`, `AVG`, `COUNT`, `MAX`, `MIN`).
- [x] **Visualizaciones Esenciales:** Barras con gradiente, Líneas, Áreas, Gráficos Donut/Pie, Tarjetas KPI y Tablas resumidas.
- [x] **Cero Fricción al Compartir:** Exportación a archivo `.html` autocontenido que cualquier directivo puede abrir con doble clic en su navegador sin dependencias.

---

### Fase 2: Robustez de Datos, Usabilidad y Experiencia Analítica (v0.2 - v0.4) ✅
- [x] **Rediseño UI Estilo Industrial (Tonos Grises Neutros):**
  - Paleta en grises neutros oscuros (`#1e1e1e`, `#252526`, `#2d2d2d`, `#383838`).
  - Tipografía en blanco puro (`#ffffff`) semibold/bold para contraste profesional.
- [x] **Sub-Menús y Ayudas Contextuales:**
  - Sub-toolbar de herramientas con accesos al modelador y refresco de consultas.
  - Pestañas en el inspector separando *"Campos y Datos"* y *"Tipo de Visualización"*.
  - Textos de ayuda y banners pedagógicos explicando Dimensiones (Eje X / GROUP BY), Métricas (Eje Y) y Agregaciones.
- [x] **Hot Swap de Datos (Reemplazo en Caliente):**
  - Recarga atómica de CSV en DuckDB sin reiniciar ni perder los gráficos existentes.
- [x] **Filtros Globales Interactivos:**
  - Barra de filtros reactivos (`=`, `!=`, `LIKE`, `>`, `<`) aplicando cláusulas `WHERE` multivariable a todas las tarjetas del lienzo.
- [x] **Persistencia de Proyectos (`.analyticraft`):**
  - Guardado y apertura del dashboard en formato JSON estructurado `.analyticraft`.
- [x] **Modelador Relacional Inicial (JOINs en Modal):**
  - Diálogo guiado con diagrama visual de hechos y dimensiones.
  - Vistas virtuales en DuckDB (`CREATE VIEW view_s_t`) con botón de eliminación (`🗑️`).
- [x] **Personalización de Tarjetas y Anotaciones:**
  - Interruptor para mostrar u ocultar la leyenda superior por gráfico.
  - Campo de descripción / nota al pie en cada tarjeta.
- [x] **Sistema Global de Temas para Tarjetas (18 perfiles):**
  - Corporativo, Geek, Colorido, All-Blue, All-Pink, Atardecer, Arrecife, Aurora Boreal, Pastel, Retro 80s, Otoño, Cyberpunk, Tropical, Estándar, Mono/Editorial, Pastel/Soft, Tierra/Cálido y Fitness.
  - Respeto integral del tema activo en la exportación `.html`.
- [x] **Visual de Anillos de Actividad (Activity Rings):**
  - Anillos concéntricos de fondo oscuro, gradientes neón y cota estricta de 4 anillos.

---

### Fase 3: Shell Desktop y Barra Lateral de Vistas (3 Modos) (v0.5.0) ✅
- 🖥️ **UI / Frontend:**
  - [x] **TitleBar Superior:** Botones compactos (Guardar, Deshacer, Rehacer), pastilla dinámica del proyecto (`.analyticraft`) y controles de ventana nativa.
  - [x] **Left View Switcher:** Barra lateral extrema izquierda con 3 iconos principales estilo Power BI Desktop:
    - 📊 *Vista de Informe (Report View)*.
    - 📋 *Vista de Datos (Data View)*.
    - 🕸️ *Vista de Modelo (Model View)*.
- ⚙️ **Backend / Motor de Datos:**
  - [x] **Store de Navegación React:** Estado central `activeView: 'report' | 'data' | 'model'`.
  - [x] **Ciclo de Vida Condicional:** Desmontaje o suspensión de renderizado intensivo (ECharts) al cambiar de vista para liberar ciclos de CPU.
  - [x] **Atajos Globales de Teclado:** Listener nativo para `Ctrl+1` (Informe), `Ctrl+2` (Datos), `Ctrl+3` (Modelo), `Ctrl+S` (Guardar), `Ctrl+Z` (Deshacer) y `Ctrl+Y` (Rehacer).

---

### Fase 4: Refactorización UI de Shell y Vista de Datos (Data View) Solo Lectura (v0.5.0) ✅
- 🛠️ **Refactorización de Interfaz (FixBugs & Gestalt):**
  - [x] **Quick Access Toolbar:** Mover "Abrir" junto a Guardar, Deshacer y Rehacer; eliminar duplicados de texto en barra superior; unificar iconografía a línea (`strokeWidth={1.5}`).
  - [x] **Reubicación hacia Sub-Toolbar:** Trasladar `[ + Agregar Gráfico ]`, `[ Selector de Tema ]` y `[ Exportar .HTML ]`; corrección tipográfica de sumas redundantes (`+ +`).
  - [x] **Agrupación Semántica Gestalt:** Separar acciones de modelado/datos a la izquierda y configuración/salida a la derecha.
  - [x] **Atenuación Visual:** Estilo discreto para el botón `Exportar .HTML` (fondo oscuro `#252526` y acento sutil).
  - [x] **Desacoplamiento de Modales:** Modal independiente `showCsvGuideModal` para evitar interferencias con la Wiki.
- 🖥️ **UI / Frontend (Vista de Datos):**
  - [x] **Cuadrícula Tabular de Alta Densidad:** Selector lateral de tablas cargadas y visor en tabla con cabeceras estilizadas y tipos de dato visibles (`[VARCHAR]`, `[BIGINT]`, `[DOUBLE]`).
  - [x] **Banner Pedagógico Permanente:** Aviso informativo destacado explicando que la vista es de **Solo Lectura** para preservar la fuente única de verdad.
  - [x] **Cabecera de Acción Directa:** Botón prominente `[ ↻ Hot Swap / Recargar CSV ]` junto al título de la tabla.
- ⚙️ **Backend / Motor de Datos:**
  - [x] **Introspección y Conteo:** Ejecución de `PRAGMA table_info('tabla')` y `SELECT COUNT(*) FROM "tabla"`.
  - [x] **Paginador Virtualizado en DuckDB:** Consulta por demanda `SELECT * FROM "tabla" LIMIT 100 OFFSET ?` garantizando latencia <16ms en datasets de 500k+ filas.
  - [x] **Prohibición de Mutación (Inmutabilidad Estricta):** Cero endpoints o queries de `UPDATE`/`INSERT` sobre celdas; canalización exclusiva vía `read_csv_auto` en DuckDB.

---

### Fase 5: Cinta de Opciones Contextual (Ribbon Menu) y Despachador de Comandos (v0.5.1) ✅
- 🖥️ **UI / Frontend:**
  - [x] **Estructura de Cinta Plegable:** Pestañas superiores (`Archivo`, `Inicio`, `Insertar`, `Modelado`, `Ver`, `Formato`) con micro-iconos, tooltips y botón toggle de colapso rápido (`Ctrl+F1`).
  - [x] **Grupos de 'Inicio':** Portapapeles (Copiar/Pegar/Duplicar/Eliminar visual), Insertar gráficos rápidos, Datos (`Obtener CSV`, `Hot Swap`, `Actualizar Todo`), Modelado (`Relaciones JOIN`) y Compartir (`Exportar HTML`).
  - [x] **Reactividad de Pestaña:** Pestaña `Formato` activa y resaltada con distintivo `Visual` cuando hay una tarjeta seleccionada en el lienzo.
- ⚙️ **Backend / Motor de Datos:**
  - [x] **ActionDispatcher Centralizado:** Patrón Command (`RibbonAction`) para canalizar de forma desacoplada y tipada todas las acciones de la cinta.
  - [x] **Portapapeles en Memoria (Clipboard Engine):** Almacenamiento inmutable profundo de tarjetas con atajos sincronizados (`Ctrl+C`, `Ctrl+V`, `Ctrl+D`, `Delete`).
  - [x] **Historial Undo/Redo Integrado:** Captura preventiva de snapshots (`recordSnapshot()`) antes de cada mutación para `Ctrl+Z` / `Ctrl+Y`.

---

### Fase 5.1: Sprint de Estabilidad, Deduplicación de UI y Principio de Responsabilidad Única (v0.5.1) ✅
- 🛠️ **Refactorización de Interfaz (SSI - Single Source of Interaction):**
  - [x] **TitleBar Limpia:** Supresión de controles simulados de ventana y botón `?` duplicado.
  - [x] **Nombre de Proyecto Inmutable:** Reemplazo de `<input>` por `<span className="project-name-label">` de solo lectura.
  - [x] **Depuración de Pestañas Ribbon:** Centralización de exportación en `Inicio > Compartir`; remoción de grupos duplicados de visuales y modelado en `Inicio`; saneamiento de `Ver`.
  - [x] **Espacio Vertical del Canvas:** Barra `.filter-bar` condicional: solo se renderiza si `globalFilters.length > 0`, liberando 40px de lienzo por defecto.
  - [x] **Corrección de Z-Index:** Solución de recorte en popover de selector de temas (`z-index: 9999`).
  - [x] **Empty State UI Humanizada para DuckDB:** Detección pedagógica de errores `Binder Error: Cannot compute sum(VARCHAR)` con guía para reasignar ejes.
  - [x] **Sincronización de Pie de Tarjeta:** Respeto estricto de `showDescription !== false` entre la cinta y `ChartCard.tsx`.
  - [x] **Directiva LLM:** Publicación de [docs/Página 9 Guía Anti-Duplicidad y Principio de Responsabilidad Única en UI](./docs/Página%209%20Guía%20Anti-Duplicidad%20y%20Principio%20de%20Responsabilidad%20Única%20en%20UI%20(Directiva%20para%20Desarrolladores%20y%20LLMs).md).

---

### Fase 6: Paneles Laterales Acoplables a la Derecha (Visualizations & FIELDS) y Segmentadores (v0.6.0 - v0.6.1) ✅
- 🖥️ **UI / Frontend:**
  - [x] **Panel Lateral "Campos" (FIELDS):** Acordeón colapsable por tabla con conteo de filas, clasificación cromática de columnas (`#` numérico, `Abc` texto, `📅` fechas, `☑` booleano), buscador rápido en vivo y botón de Hot Swap `↻`.
  - [x] **Panel Lateral "Visualizaciones":** Galería interactiva para transformar visuales + subpestaña `Build` (drop-zones para Eje X, Eje Y, agregaciones) + subpestaña `Format` (títulos, leyendas, pie de tarjeta).
  - [x] **Visual Segmentador de Datos (Slicer):** Tarjeta interactiva en lienzo con buscador de valores, conteo de registros, selector interactivo y botón de limpieza (`🧹 Limpiar`).
  - [x] **Inversión Rápida de Ejes (Swap X ⇄ Y):** Botón ergonómico para alternar dimensiones y métricas con un clic y corrección automática de agregaciones (`COUNT`/`SUM`).
  - [x] **Múltiples Filtros Locales por Tarjeta:** Drop-zone multifiltro con introspección reactiva de DuckDB (`SELECT DISTINCT`) en chips interactivos, botón de conmutación On/Off y borrado total.
  - [x] **Riel de Pestañas Colapsable:** Botones verticales en el borde derecho (`docked-rail-tab`) para acoplar/desacoplar paneles independientemente estilo Power BI Desktop.
- ⚙️ **Backend / Motor de Datos:**
  - [x] **API de Arrastre Tipada (`DraggedFieldPayload`):** Transferencia inmutable `{ tableName, columnName, dataType }` hacia drop-zones, tarjetas existentes y lienzo vacío.
  - [x] **Constructor SQL Reactivo:** Ensamblado automático de consultas vectorizadas `SELECT dim, agg(metric) FROM table WHERE ... GROUP BY dim` en DuckDB con latencia <16ms.
  - [x] **Filtrado Multitarjeta Reactivo:** Filtrado bidireccional en tiempo real al seleccionar valores en el visual Segmentador.

---

### Fase 7: Vista de Modelo Relacional (Grafo de Tablas, Drag & Drop y Vistas Virtuales) (v0.7.0) ✅
- 🖥️ **UI / Frontend:**
  - [x] **Lienzo de Grafo Interactivo (`ModelView.tsx`):** Espacio bidimensional con fondo workbench, cuadrícula matricial de 20px, paneo y zoom interactivo (50% a 160%).
  - [x] **Diferenciación Cromática Heurística:** Cabecera azul/cian (`#007acc`) y badge `HECHOS` para tablas transaccionales; cabecera dorada/ámbar (`#cca700`) y badge `DIMENSIÓN` para satélites.
  - [x] **Creación Visual de Relaciones por Drag & Drop:** Arrastre de columna a columna entre tablas con retroalimentación luminosa inmediata.
  - [x] **Conectores Visuales SVG:** Curvas cúbicas de Bézier conectando alturas exactas de columnas con badges de cardinalidad `1` (PK) y `*` (FK), flecha direccional (`1 : * ──▶`) e inspector flotante con botón de eliminación (`🗑️`).
  - [x] **Auto-Alineación en Estrella (`Auto-Alinear`):** Algoritmo que ubica los hechos en el centro y distribuye las dimensiones radialmente.
- ⚙️ **Backend / Motor de Datos:**
  - [x] **Motor de Vistas Virtuales con Deduplicación:** Generación de `CREATE VIEW "view_s_t" AS SELECT s.*, t.*` con introspección previa `PRAGMA table_info` para evitar errores de colisión de nombres de columnas.
  - [x] **Descarte Seguro:** Ejecución inmediata de `DROP VIEW IF EXISTS "view_s_t"` al eliminar relaciones sin alterar los archivos CSV físicos.

---

### Fase 8: Asistente Newbie-Friendly en el Modelador Relacional (v0.8.0) ✅
- 🖥️ **UI / Frontend:**
  - [x] **Algoritmo Heurístico de Detección (`✨ Auto-Detectar`):** Identificación semántica de claves coincidentes (`*_id`, `*_key`, `cod_*`) y verificación de compatibilidad de tipos en DuckDB.
  - [x] **Aura Luminosa y Banner de Sugerencias Flotante:** Resplandor ámbar en columnas detectadas (`.column-detected-aura`) y banner con botón individual `Conectar` y unión masiva `Conectar Todas (X)`.
  - [x] **Auto-Alineación Jerárquica en Cascada:** Reordenamiento en un clic con dimensiones arriba (`y = 60`) y hechos abajo (`y = 420`).
  - [x] **Tooltips y Explicaciones Pedagógicas en Lenguaje Natural:** Tooltips accesibles en `1`, `*` y flechas direccionales, además de explicaciones semánticas en el panel inspector.
  - [x] **Modal de Edición de JOIN (`EditJoinModal`):** Selector interactivo `LEFT JOIN` / `INNER JOIN`, reasignación de columnas y botón de inversión de dirección (`⇄`).
- ⚙️ **Backend / Motor de Datos:**
  - [x] **Regeneración Reactiva en DuckDB:** Descarte y recreación atómica de vistas relacionales (<10ms).
  - [x] **Motor de Layout Jerárquico:** Asignación automática de coordenadas `{x, y}` por nivel de conectividad relacional.

---

### Fase 8.1: Diagnóstico Ágil de Catálogo DuckDB, Estabilidad HMR y Visibilidad Contextual (v0.8.1) ✅
- 🛠️ **Correcciones Críticas de Motor y Arquitectura:**
  - [x] **Persistencia de Singleton DuckDB en `window`:** Almacenamiento de instancias en `window.__analyticraft_duckdb__` y `window.__analyticraft_conn__` para evitar que React Fast Refresh destruya el WebWorker o purgue tablas en memoria durante desarrollo.
  - [x] **Manejo Resiliente de Error de Catálogo (`sqlite_temp_master`):** `ChartCard.tsx` detecta amigablemente si una tabla referenciada no existe en la sesión y despliega una caja guiada para reimportar o reasignar la fuente.
  - [x] **Aislamiento Estricto de Pestaña Contextual `Formato`:** Renderizado exclusivo en la Vista de Informe (`activeView === "report"`) cuando hay un visual seleccionado (`selectedChartId !== null`), impidiendo que aparezca fuera de contexto en Modelo o Datos.
  - [x] **Conmutador Centralizado de Vistas (`handleSwitchView`):** Las transiciones por atajos (`Ctrl+1/2/3`) o por la barra lateral reajustan de forma limpia la cinta Ribbon a `"modeling"` o `"home"`.
  - [x] **Corrección Tipográfica en Barra de Herramientas del Modelo:** Removido glifo duplicado `+` en el botón de nueva relación (`<span>Nueva Relación</span>`).
  - [x] **Ampliación de Nodos Relacionales (`CARD_WIDTH: 250px`):** Ancho mínimo aumentado a 250px con atributos `title` en cabeceras para evitar truncamientos excesivos de nombres.
  - [x] **Documentación Técnica de Diagnóstico:** Creación de [docs/Página 12 Guía de Diagnóstico Rápido y Resolución Ágil de Errores](./docs/Página%2012%20Guía%20de%20Diagnóstico%20Rápido%20y%20Resolución%20Ágil%20de%20Errores%20(Troubleshooting%20y%20Depuración%20para%20Desarrolladores%20y%20LLMs).md) con matriz oficial de incidencias y protocolo de depuración para DuckDB.

---

### Fase 8.2: Ergonomía de Modelos Complejos, Modales de Proyecto y Exportación para LLMs (v0.8.2) ✅
- 🖥️ **UI / Frontend:**
  - [x] **Modal Interactivo de Apertura (`OpenProjectModal`):**
    - Corrección del bug donde Windows Explorer ocultaba archivos al usar selector de carpetas: incorporación del selector nativo de archivos (`.analyticraft` / `.json`) con atajo `Ctrl+O`.
    - Opción clara y guiada para abrir carpetas empaquetadas persistentes.
  - [x] **Modal Interactivo de Guardado (`SaveProjectModal`):**
    - Selección clara entre Proyecto Empaquetado (con subcarpetas `/data/`, `/backups/`, `/temp/`) e Instantánea Rápida (`.analyticraft`).
  - [x] **Persistencia de Rutas de Guardado y Sobrescritura In-Place:**
    - Registro de carpeta activa en `localStorage` (`analyticraft_project_dir_name`), visualización en píldora superior (`[Carpeta] Proyecto.analyticraft`) y guardado rápido con `Ctrl+S` sin diálogos redundantes.
  - [x] **Eliminación Total de Datos de Muestra y Arranque en Blanco Garantizado:**
    - Supresión de botones "Muestra PyME" del Ribbon y lienzo de inicio; reemplazo por botón profesional de importación CSV (`BarChart3`).
    - Arranque estrictamente en blanco (`Sin_Titulo.analyticraft`, 0 tablas, 0 tarjetas) y acción "Nuevo" con purga total de DuckDB (`resetDuckDBSession()`).
  - [x] **Herramientas de Limpieza y Ergonomía en Modelos Complejos (`ModelView.tsx`):**
    - **Algoritmo "Organizar Vista" (`handleCleanAndOrganizeLayout`):** Cuadrícula multinivel anti-solapamiento (Zero-Overlap) diseñada para decenas de tablas y más de 70 relaciones, con separación nítida entre dimensiones y hechos.
    - **Modo Compacto de Tablas (`isCompactMode`):** Activado por defecto en modelos con ≥6 tablas; filtra columnas visibles mostrando solo las activas en relaciones con botón inline colapsable (`+ X campos adicionales`).
    - **Atenuación Selectiva y Enfoque (Focus & Dimming):** Hover o clic en tabla atenúa relaciones ajenas al 8% de opacidad (`opacity: 0.08`) e ilumina las vinculadas con resplandor cian brillante (`#38bdf8`).
    - **Ocultamiento Inteligente de Badges `1 : *`:** Se ocultan cuando hay más de 15 relaciones a menos que la relación esté en foco.
    - **Scroll Vertical Interno en Columnas:** Contenedor con `max-height: 250px; overflow-y: auto` y scrollbar estilizada para tema oscuro.
    - **Colapso Individual de Tarjetas:** Chevron en cabecera para colapsar a 36px de altura mínima con reanclaje matemático limpio de curvas Bézier.
    - **Control Global "Expandir / Colapsar Todo":** Botón conmutador (`ChevronsUpDown`) en barra del modelador y en `FieldsPanel.tsx`.
    - **Anti-Colisión en Esquema de Estrella:** Órbitas concéntricas escaladas (520x390, 940x660) con relajación elástica de colisiones.
  - [x] **Modal Pedagógico "Explicar Modelo" (`ModelExplanationModal.tsx`):**
    - Asistente conceptual interactivo determinista (sin dependencias ni consumo de LLMs externos): Regla de Oro (Dimensiones vs Hechos), sentido de propagación de filtros (`1 ──▶ *`) y detección de tablas huérfanas.
  - [x] **Corrección de Ícono de Base de Datos en Vista de Datos:**
    - Ajuste con `flex-shrink: 0` y `min-width: 0` para evitar que nombres largos de tabla compriman el icono cilíndrico a 0px.
- ⚙️ **Backend / Motor de Datos:**
  - [x] **Persistencia Robusta de Relaciones en `.analyticraft`:**
    - Reconstrucción automática de vistas virtuales (`createVirtualRelationView()`) al abrir proyectos empaquetados o archivos `.analyticraft`.
    - Nomenclatura unívoca anti-colisión de vistas relacionales (`view_${sourceTable}_${sourceCol}_${targetTable}_${targetCol}`).
    - Marcado reactivo de estado sucio (`isDirty = true`) al conectar, editar o eliminar relaciones.
  - [x] **Exportación de Síntesis del Modelo en Markdown (`.md`) para Auditoría con LLMs (`modelSynthesis.ts`):**
    - Botón en barra de herramientas del Modelo y en modal didáctico: genera y descarga `<Proyecto>_sintesis_modelo.md` y copia el informe al portapapeles con prompt de auditoría para ChatGPT, Claude o Gemini.

---

### Fase 8.3: Suite de Pruebas Unitarias Automatizadas (Vitest) y Gobernanza de Código (v0.8.3) ✅
- 🧪 **Infraestructura de Pruebas Automatizadas (Vitest):**
  - [x] **Corredor de Pruebas Nativo:** Integración de Vitest 5 sobre Vite 8 y TypeScript con comando `npm test` (`vitest run`).
  - [x] **Pruebas de Catálogo de Temas (`tests/themes.test.ts`):** 4 pruebas que verifican la integridad de los 18 temas visuales, propiedades de contraste, paletas hexadecimales y fallback de `getTheme()`.
  - [x] **Pruebas de Generador de Opciones ECharts (`tests/chartOptions.test.ts`):** 6 pruebas que validan resolución de colores sólidos, gradientes vectoriales, cota de 4 anillos, formateo `es-MX` y generación de barras, líneas y donas.
  - [x] **Pruebas de Sanitización y Exportación (`tests/exporter.test.ts`):** 3 pruebas que garantizan prevención de XSS con `escapeHtml()`, serialización segura con `safeJson()` e integridad del HTML autocontenido generado.
- 🏛️ **Arquitectura y Documentación:**
  - [x] **Exportación de Utilidades:** Expuestas formalmente `escapeHtml` y `safeJson` en `src/lib/exporter.ts`.
  - [x] **Archivo Oficial de Licencia:** Creado `LICENSE` bajo Licencia MIT estándar.
  - [x] **Reestructuración de Documentación:**
    - `CONTRIBUTING.md` reescrito con enfoque técnico formal, 5 Principios Fundamentales, mapa de módulos y directrices de Blast Radius.
    - `README.md` modernizado con diagrama ASCII simétrico, flujo de trabajo en 4 pasos y tabla formal del stack tecnológico.

---

## Resumen de Cobertura Completada

| Área del Sistema | Fases Completadas | Cobertura Lograda al Día de Hoy |
|---|---|---|
| **Arquitectura de Interfaz Power BI** | Fases 3, 4, 5, 5.1, 6 | Shell de 3 vistas, Ribbon desacoplado con hotkeys, paneles acoplables de Campos y Visualizaciones. |
| **Gobernanza y Filosofía de Datos** | Fases 1, 2, 4, 8.2 | Vista de Datos Read-Only, paginación <16ms en DuckDB, Hot Swap atómico y arranque virgen limpio. |
| **Modelado Semántico y Relacional** | Fases 7, 8, 8.1, 8.2 | Grafo de tablas, heurística auto-detect, vistas virtuales deduplicadas, modo compacto, focus & dimming. |
| **Interactividad y Visualizaciones** | Fases 1, 2, 6 (Slicer) | Segmentador interactivo reactivo, 18 temas, ECharts optimizado y filtros múltiples. |
| **Calidad de Software y Testing** | Fase 8.3 (Vitest) | Suite automatizada de pruebas unitarias con Vitest 5 (`npm test`). |
| **Distribución y Exportación** | Fases 1, 2, 8.2 (Síntesis) | Exportador HTML autocontenido offline y exportación de síntesis relacional Markdown para LLMs. |
