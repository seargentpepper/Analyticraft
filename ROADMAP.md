# 🗺️ Roadmap de Analyticraft - Próximos Cambios (Coming Next)

Este documento traza la hoja de ruta activa y los próximos desarrollos técnicos y funcionales de **Analyticraft**, desde la versión actual hasta el 100% de madurez de la suite.

- **Estado Actual del Proyecto:** Versión `v0.8.3` (Estable)
- **Próximo Hito Inmediato:** Versión `v0.8.4` (Saneamiento de Deuda Técnica, Exactitud Analítica y Resiliencia de Ciclo de Vida)
- **Hito Posterior:** Versión `v0.9.0` (Lienzo Libre, Cuadrícula Magnética y Snap-to-Grid)
- **Plan Maestro de Intervención:** Consulta **[PLAN_INTERVENCION_v0_8_4.md](./PLAN_INTERVENCION_v0_8_4.md)** para el desglose en 5 iteraciones.
- **Historial de Trabajo Completado (Done):** Para consultar las fases completadas (Fases 1 a 8.3), consulta **[ROADMAP_DONE.md](./ROADMAP_DONE.md)**.
- **Registro Detallado de Versiones:** Consulta **[CHANGELOG.md](./CHANGELOG.md)**.

> **Regla de Desarrollo para Desarrolladores y LLMs:** Ninguna fase implementa cambios visuales sin su contraparte de motor de datos y viceversa. Antes de codificar cualquier fase, consulta la guía de contratos técnicos y diagramas de flujo en [docs/Página 6 Arquitectura de UI y Contratos de Backend](./docs/Página%206%20Arquitectura%20de%20UI%20y%20Contratos%20de%20Backend%20(Guía%20para%20Desarrolladores%20y%20LLMs).md).

---

## Índice de Próximas Fases (Coming Next)

1. [Fase 8.4: Saneamiento de Deuda Técnica, Exactitud Analítica y Ciclo de Vida (Meta Inmediata: v0.8.4)](#fase-84-saneamiento-de-deuda-técnica-exactitud-analítica-y-ciclo-de-vida-meta-inmediata-v084)
2. [Fase 9: Lienzo Libre con Cuadrícula Magnética y Menú Flotante de Alineación (Hito v0.9.0)](#fase-9-lienzo-libre-con-cuadrícula-magnética-y-menú-flotante-de-alineación-hito-v090)
3. [Fase 10: Navegación de Páginas Múltiples y Marcadores (Bookmarks)](#fase-10-navegación-de-páginas-múltiples-y-marcadores-bookmarks)
4. [Fase 11: Medidas Analíticas Reutilizables y Columnas Calculadas (DAX simplificado en SQL)](#fase-11-medidas-analíticas-reutilizables-y-columnas-calculadas-dax-simplificado-en-sql)
5. [Fase 12: Jerarquía Temporal Automática y Dimensión Calendario](#fase-12-jerarquía-temporal-automática-y-dimensión-calendario)
6. [Fase 13: Filtrado Cruzado Bidireccional entre Visuales (Cross-Filtering)](#fase-13-filtrado-cruzado-bidireccional-entre-visuales-cross-filtering)
7. [Fase 14: Catálogo Extendido de Visualizaciones Analíticas](#fase-14-catálogo-extendido-de-visualizaciones-analíticas)
8. [Fase 15: Perfeccionamiento de Estilos Apple (Metas en Anillos y Superación del 100%)](#fase-15-perfeccionamiento-de-estilos-apple-metas-en-anillos-y-superación-del-100)
9. [Fase 16: Conectividad Multifuente y Power Query Ligero](#fase-16-conectividad-multifuente-y-power-query-ligero)
10. [Fase 17: Vigilancia Automática de Archivos en Disco y Persistencia .ddb](#fase-17-vigilancia-automática-de-archivos-en-disco-y-persistencia-ddb)
11. [Fase 18: Suite de Distribución y Exportación Ejecutiva (100% de Madurez)](#fase-18-suite-de-distribución-y-exportación-ejecutiva-100-de-madurez)

---

### Fase 8.4: Saneamiento de Deuda Técnica, Exactitud Analítica y Ciclo de Vida (Meta Inmediata: v0.8.4)
> *Detalle e iteraciones técnicas desglosadas en el [Plan de Intervención v0.8.4](./PLAN_INTERVENCION_v0_8_4.md).*
- 🖥️ **UI / Frontend:**
  - [x] **Reactividad Universal del Indicador de Cambios (`isDirty`):** Cualquier cambio en configuración visual, temas, filtros o Drag & Drop enciende de inmediato el indicador de guardado pendiente `•` (A-01).
  - [x] **Diálogo Protector de Carga de Proyectos:** Solicitud de confirmación ante cambios pendientes al abrir archivos o carpetas, con reseteo total de estados visuales y selección (A-02).
  - [x] **Sincronización Reactiva de Modales y Vistas:** Forzado de props sincronizadas en `SaveProjectModal` (nombre) y `ModelView` (posiciones entre proyectos) (M-04, M-05).
  - [x] **Buscador en Vivo del Segmentador:** Búsqueda reactiva en DuckDB sin el límite ciego de 50 registros iniciales (M-06).
  - [x] **Aislamiento Limpio de Vistas Relacionales:** Desacopladas de la lista de tablas base para no contaminar el panel. Se accede a ellas mediante botón rectangular al pie del panel con ventana flotante responsive y tecla de cierre Esc (A-07).
  - [x] **Lienzo Libre con Coordenadas Persistentes:** Tarjetas anidables y flotantes con arrastre y redimensionado libre (`{ x, y, w, h }`), ajuste magnético a cuadrícula de 10px y persistencia en guardado/apertura de proyectos.
  - [x] **Doomscroll sin Recortes en Panel Campos:** Contenedor de scroll infinito (`min-height: 0`, `flex-shrink: 0`) que impide que las tarjetas o columnas queden truncadas al expandir múltiples tablas.
  - [x] **Depuración de Barra en Vista de Modelo (Principios Gestalt):** Eliminados botones redundantes ("Exportar Síntesis (.md)", "Compacto/Detallado", "Nueva Relación"). Botones restantes estandarizados a 28px de altura y agrupados por proximidad y región común (Zoom, Disposición, Asistentes).
  - [x] **Reubicación Canónica de "Nueva Relación":** Trasladada a la cinta superior dentro de la pestaña `Modelado` en su propio grupo `Relaciones`.
- ⚙️ **Backend / Motor de Datos:**
  - [x] **Exactitud Numérica en Filtros SQL:** Eliminación de conversiones a `VARCHAR` en operadores `>` y `<`; comparaciones numéricas tipadas estrictas con `TRY_CAST(... AS DOUBLE)` (A-03).
  - [x] **Orden Cronológico en Series Temporales:** Gráficos de líneas y áreas ordenados por dimensión ascendente (`ORDER BY dim ASC`), reservando `ORDER BY metric DESC` para categorías (M-01).
  - [x] **Preservación Segura de Enteros Grandes (`bigint`):** Soporte seguro para valores superiores a `MAX_SAFE_INTEGER` con helper `safeNumericOrBigInt` (M-02).
  - [x] **Hot Swap y Modificación de Relaciones Atómicas:** Reemplazo transaccional de tablas y vistas usando tablas temporales antes de descartar la versión previa (A-06, M-07).
  - [x] **Exportación Confiable y Offline:** Espera activa a finalización de queries antes de exportar HTML, título real de proyecto y recursos embebidos sin dependencia de CDN (A-04, D-04).
  - [x] **Concurrencia y Orden Determinista en Vista de Datos:** Token de cancelación `isCurrent` y orden determinista en `SELECT * ... ORDER BY ... LIMIT ... OFFSET ...` (M-08, M-09).
- 🧪 **Calidad y Testing:**
  - [x] **Expansión de Suite Vitest:** 30 pruebas automáticas cubriendo filtros SQL, orden cronológico, ciclo de vida, sanitización y geometría de lienzo libre (`tests/canvasLayout.test.ts`) (D-01).
  - [x] **Depuración de Dependencias:** Desinstalación de `papaparse` del `package.json` y configuración de CSP en `tauri.conf.json` (D-06, D-07).

---

### Fase 9: Lienzo Libre con Cuadrícula Magnética y Menú Flotante de Alineación (Hito v0.9.0)
- 🖥️ **UI / Frontend:**
  - [ ] **Lienzo con Cuadrícula Magnética (Snap-to-Grid):** Arrastre y redimensionamiento libre de tarjetas con guías de alineación inteligentes y magnetismo a paso configurable (8px / 16px).
  - [ ] **Menú Flotante de Alineación:** Barra contextual al seleccionar una o múltiples tarjetas (alinear a la izquierda, centro, derecha, arriba, abajo, distribuir horizontal y verticalmente).
  - [ ] **Banner Superior de KPIs:** Contenedor superior desacoplado para tarjetas numéricas destacadas con distribución automática.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Esquema de Posicionamiento:** Adición de `{ x: number, y: number, w: number, h: number, zIndex: number }` al objeto `ChartConfig`.
  - [ ] **Algoritmo de Alineación Geométrica:** Funciones puras para recalcular posiciones relativas sin solapamiento destructivo.
  - [ ] **Serialización en Proyecto:** Persistencia de coordenadas y dimensiones exactas en el archivo `.analyticraft`.

---

### Fase 10: Navegación de Páginas Múltiples y Marcadores (Bookmarks)
- 🖥️ **UI / Frontend:**
  - [ ] **Barra Inferior de Páginas:** Pestañas (`Página 1`, `Página 2`, `+ Nueva Página`), menú contextual de pestaña (renombrar, duplicar, eliminar) y slider de zoom.
  - [ ] **Panel Lateral de Marcadores (Bookmarks):** Lista de capturas guardadas (ej. `P1 - Vista General`, `P1 - Filtro Mayoristas`) con botón `Add` y botón `Presentar`.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Modelo Jerárquico de Proyecto:** Evolución a `AnalyticraftProject -> pages: PageConfig[]`, donde cada página posee su propio array de `charts: ChartConfig[]`.
  - [ ] **Estado de Marcadores:** Captura snapshot de filtros activos, visibilidad de tarjetas y página activa en `bookmarks: BookmarkState[]`.
  - [ ] **Exportador HTML Multipágina:** Compilación del archivo `.html` autocontenido con navegación reactiva de pestañas y marcadores offline.

---

### Fase 11: Medidas Analíticas Reutilizables y Columnas Calculadas (DAX simplificado en SQL)
- 🖥️ **UI / Frontend:**
  - [ ] **Diálogo "Nueva Medida":** Modal accesible desde Ribbon (`Modelado > Nueva Medida`) con editor de expresiones SQL asistido y autocompletado de funciones (`SUM`, `AVG`, `COUNT`, `ROUND`, etc.).
  - [ ] **Icono Distintivo en FIELDS:** Las medidas creadas se listan en el panel de campos con un icono de calculadora (`🧮`) arrastrable a cualquier gráfico.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Validador de Expresiones en DuckDB:** Test de ejecución en tiempo real (`EXPLAIN SELECT {expression} FROM {table}`) antes de guardar la medida.
  - [ ] **Inyector Dinámico de CTEs:** En tiempo de consulta de la tarjeta, las medidas se inyectan como `WITH medidas AS (...)` o columnas derivadas en la query SQL vectorizada de DuckDB.

---

### Fase 12: Jerarquía Temporal Automática y Dimensión Calendario
- 🖥️ **UI / Frontend:**
  - [ ] **Árbol de Fechas Desplegable:** Las columnas de tipo fecha (`DATE`, `TIMESTAMP`) en el panel FIELDS se expanden automáticamente en `Año › Trimestre › Mes › Día`.
  - [ ] **Generador de Calendario en Ribbon:** Botón `Crear Tabla Calendario` con selector de rango de fechas de inicio y fin.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Generador de Dimensión de Calendario en DuckDB:** Ejecución de `CREATE TABLE "calendario" AS SELECT d::DATE as fecha, year(d) as año, quarter(d) as trimestre, monthname(d) as mes, day(d) as dia FROM generate_series(DATE '...', DATE '...', INTERVAL 1 DAY) tbl(d)`.
  - [ ] **Funciones SQL de Agrupación Temporal:** Extracción de partes de fecha para granularidad dinámica en los gráficos.

---

### Fase 13: Filtrado Cruzado Bidireccional entre Visuales (Cross-Filtering)
> *Nota: El objeto visual tipo Segmentador (Slicer) ya fue completado e integrado en la Fase 6 (v0.6.1). Esta fase aborda la interactividad multitarjeta cruzada al hacer clic sobre elementos de visualizaciones analíticas.*
- 🖥️ **UI / Frontend:**
  - [ ] **Filtrado Cruzado Reactivo al Clic:** Clic sobre una barra, sector de dona o punto de línea resalta o filtra instantáneamente todas las demás tarjetas de la página.
  - [ ] **Indicador Visual de Selección Activa:** Atenuación de barras o puntos no seleccionados en el gráfico emisor y distintivo de filtro cruzado en tarjetas receptoras.
  - [ ] **Control de Interacciones:** Interruptor para definir si un gráfico específico participa o se aísla del filtrado cruzado.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Bus de Filtrado Cruzado Bidireccional:** Estado `crossFilterState: { sourceChartId, column, selectedValue }`.
  - [ ] **Inyector de Cláusulas WHERE Compuestas:** Modificación reactiva de las consultas DuckDB agregando condiciones `AND "columna" = 'valor'` a todas las tarjetas receptoras.
  - [ ] **Caché en Memoria de Consultas:** Almacenamiento volátil de resultados para respuestas analíticas en <8ms sin re-consultar DuckDB si los parámetros no cambiaron.

---

### Fase 14: Catálogo Extendido de Visualizaciones Analíticas
- 🖥️ **UI / Frontend:**
  - [ ] **Gráfico Combinado (Barras + Líneas):** Soporte para doble eje Y (ej. Ventas en barras y Margen % en línea).
  - [ ] **Gráfico de Cascada (Waterfall):** Visualización de pérdidas y ganancias (P&L), incrementos y decrementos acumulativos.
  - [ ] **Treemap y Gráfico de Embudo (Funnel):** Distribución jerárquica de categorías y tasas de conversión por etapas.
  - [ ] **Tabla Matriz / Pivote:** Cuadrícula con filas, columnas, subtotales y totales generales colapsables.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **ECharts Option Builders Dedicados:** Nuevos generadores modulares en `src/lib/chartOptions.ts`.
  - [ ] **Consultas Agregadas Complejas:** Uso de cláusulas SQL avanzadas en DuckDB como `PIVOT`, `ROLLUP` y `GROUPING SETS` para calcular totales y subtotales de matrices en una sola pasada.

---

### Fase 15: Perfeccionamiento de Estilos Apple (Metas en Anillos y Superación del 100%)
- 🖥️ **UI / Frontend:**
  - [ ] **Metas Configurables por Anillo:** Campo en el inspector `Format` para fijar meta cuantitativa (ej. `Meta: 10,000 pasos`) o enlazar con una medida SQL.
  - [ ] **Efecto de Superación del 100%:** Renderizado de segunda vuelta con sombra volumétrica y resplandor neón cuando el valor excede la meta.
  - [ ] **Paletas Numbers Adaptativas:** Aplicación de tipografías semibold y fondos sutiles inspirados en macOS/iPadOS.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Series Polares Duales en ECharts:** Algoritmo en `chartOptions.ts` que desacopla la serie de base (0 a 100%) y genera una sub-serie con `shadowBlur: 12` y `shadowColor` para la fracción que supera el 100%.
  - [ ] **Cálculo de Proporción en DuckDB:** Consulta SQL que calcula el porcentaje normalizado: `ROUND((val / goal) * 100, 1)`.

---

### Fase 16: Conectividad Multifuente y Power Query Ligero
- 🖥️ **UI / Frontend:**
  - [ ] **Diálogo Multifuente "Obtener Datos":** Conectores visuales para Excel (`.xlsx`, selección de hoja), archivos Parquet, carpetas completas de CSVs y SQLite local.
  - [ ] **Editor de Pasos de Transformación (Power Query Ligero):** Panel visual que lista pasos aplicados (Filtrar filas, Renombrar columna, Cambiar tipo de dato, Rellenar nulos, Quitar duplicados).
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Extensiones Nativas de DuckDB:** Carga de extensiones en memoria (`read_parquet`, conector SQLite).
  - [ ] **Pipeline de Transformaciones Declarativas:** Estructura JSON de pasos reproducibles en el proyecto; DuckDB ejecuta la secuencia de transformaciones en orden sin alterar el archivo físico de origen.

---

### Fase 17: Vigilancia Automática de Archivos en Disco y Persistencia .ddb
- 🖥️ **UI / Frontend:**
  - [ ] **Indicador de Sincronización en Barra de Estado:** Icono de nube local o disco ("Guardado automáticamente", "Cambios pendientes").
  - [ ] **Conmutador de "Vigilancia de CSV" (File Watcher):** Opción para activar recarga en caliente automática al guardar el archivo fuente en disco.
  - [ ] **Selector de Modo de Base de Datos:** Alternar entre DuckDB 100% en memoria volátil o archivo de base de datos local persistente (`.ddb`).
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Vigilancia Nativa en Rust/Tauri:** Integración del crate `notify` en el backend Rust para monitorear el sistema de archivos del SO y emitir eventos IPC hacia el frontend cuando el CSV cambie.
  - [ ] **Hot Swap Autónomo:** Al recibir el evento IPC, el frontend ejecuta silenciosamente el reemplazo atómico de la tabla en DuckDB sin interrumpir la sesión del analista.

---

### Fase 18: Suite de Distribución y Exportación Ejecutiva (100% de Madurez)
- 🖥️ **UI / Frontend:**
  - [ ] **Menú de Exportación en Ribbon:** Opciones directas:
    - 🌐 *Exportar HTML Interactivo* (Dashboard vivo sin dependencias).
    - 📄 *Exportar Documento PDF* (Páginas vectoriales de alta definición).
    - 📊 *Exportar Presentación PowerPoint (`.pptx`)* (Una diapositiva por página de reporte).
    - 🖼️ *Exportar Imágenes HD (PNG / SVG)*.
  - [ ] **Modal de Configuración de Exportación:** Selección de páginas a incluir, resolución, metadatos y encabezados de empresa.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Compilador Offline Autocontenido:** Generación de archivo HTML con DuckDB-Wasm ligero embebido que conserva filtros cruzados y segmentadores funcionando sin internet.
  - [ ] **Generador Nativo de PDF/PPTX:** Procesamiento en Tauri/Rust para generar archivos PDF y PPTX con tipografía nítida y gráficos vectoriales embebidos.
  - [ ] **Sanitización Estricta de Seguridad:** Escapado obligatorio de todos los textos, nombres de columnas y categorías (`escapeHtml` y `safeJson`) para neutralizar cualquier vector de inyección XSS.

---

## Resumen de Cobertura Integral del Proyecto

| Área del Sistema | Fases Completadas (Done en [ROADMAP_DONE.md](./ROADMAP_DONE.md)) | Próximas Fases Planificadas (Coming Next) | Resultado al 100% |
|---|---|---|---|
| **Arquitectura de Interfaz Power BI** | Fases 3, 4, 5, 5.1, 6 | Fase 8.4 (Modales y Estados), Fases 9, 10 | Experiencia idéntica a Power BI Desktop (Ribbon, Vistas, Paneles, Lienzo Libre y Páginas). |
| **Gobernanza y Filosofía de Datos** | Fases 1, 2, 4, 8.2 | Fase 8.4 (Hot Swap atómico), Fases 16, 17 | Vista de Datos Read-Only, CSV como fuente de verdad, Hot Swap atómico y pasos reproducibles. |
| **Modelado Semántico y Relacional** | Fases 7, 8, 8.1, 8.2 | Fase 8.4 (Vistas en catálogo), Fases 11, 12 | Diagrama relacional visual con auto-detección, ergonomía anti-colisión, medidas analíticas y dimensión calendario. |
| **Interactividad y Visualizaciones** | Fases 1, 2, 6 (Slicer) | Fase 8.4 (Orden temporal y filtros numéricos), Fases 13, 14, 15 | Segmentadores interactivos, filtrado cruzado multitarjeta, visuales analíticos avanzados y estilos Apple. |
| **Calidad de Software y Testing** | Fase 8.3 (Vitest) | Fase 8.4 (Vitest ampliado + higiene de deps), Fase 18 | Suite automatizada de pruebas unitarias, sanitización estricta XSS y compilación reproducible. |
| **Distribución y Exportación** | Fases 1, 2, 8.2 (Síntesis LLM) | Fase 8.4 (Exportación offline fidedigna), Fase 18 | Visor HTML interactivo sin internet, exportación Markdown para LLMs, PDFs vectoriales y PPTX ejecutivas. |
