# 🗺️ Roadmap de Analyticraft

Este documento traza la evolución funcional y técnica de **Analyticraft**, una herramienta de Business Intelligence de escritorio, local-first y de código abierto para PyMEs.

---

## 📌 Fase 1: Fundaciones y MVP Local-First (Completada ✅)
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

## 🚀 Fase 2: Robustez de Datos, Usabilidad y Experiencia Analítica (Completada y Refinada ✅)
- [x] **Rediseño UI Estilo Adobe / GIMP (Tonos Grises Industriales):**
  - Paleta completa en grises neutros oscuros (`#1e1e1e`, `#252526`, `#2d2d2d`, `#383838`) que no compite con el navegador.
  - Tipografía en **blanco puro (`#ffffff`) y semibold/bold** para garantizar máxima legibilidad y contraste profesional.
- [x] **Sub-Menús, Cintas de Acción y Ayudas Contextuales:**
  - **Sub-toolbar de Herramientas:** Acceso directo al modelador relacional y refresco general de consultas.
  - **Pestañas en el Inspector:** Separación limpia entre *"Campos y Datos"* y *"Tipo de Visualización"*.
  - **Textos de Ayuda y Banners:** Explicación clara bajo cada campo sobre qué significa una Dimensión (Eje X / GROUP BY), Métrica (Eje Y) y cómo operan las Funciones de Agregación (`SUM`, `AVG`, `COUNT`, `MAX`, `MIN`).
  - **Panel Desplegable de Ayuda Rápida:** Botón `?` en el menú superior con guía de conceptos BI.
- [x] **Hot Swap de Datos (Reemplazo en Caliente):**
  - Botón de recarga en cada tarjeta de tabla para reemplazar el archivo CSV atómicamente en DuckDB sin reiniciar ni perder los gráficos existentes.
- [x] **Filtros Globales Interactivos (Top Bar):**
  - Barra superior de filtros reactivos (`=`, `!=`, `LIKE`, `>`, `<`) que aplica condiciones `WHERE` multivariable a todas las tarjetas del lienzo simultáneamente.
- [x] **Persistencia de Proyectos (`.analyticraft`):**
  - Botones "Guardar" y "Abrir" para exportar e importar la estructura completa del dashboard (gráficos, filtros, relaciones y metadatos) en formato JSON `.analyticraft`.
- [x] **Modelador Relacional en Modal (Esquema de Estrella / JOINs):**
  - Diálogo modal guiado con diagrama visual de cómo interactúan las tablas de hechos y dimensiones.
  - Generación de vistas virtuales en DuckDB (`CREATE VIEW view_s_t`) sin alterar archivos físicos.
  - **Botón de Eliminación (`🗑️`)** para descartar vistas relacionales de la memoria DuckDB de forma segura e inmediata.
- [x] **Personalización de Tarjetas y Anotaciones:**
  - Control para mostrar u ocultar la leyenda superior de cada gráfico.
  - Campo de descripción / nota al pie para detallar qué fenómeno o regla de negocio miden los datos mostrados.
- [x] **Sistema Global de Temas para Tarjetas (No afecta la UI del Studio):**
  - Selector agrupado en la barra de herramientas que transforma el estilo de todas las tarjetas simultáneamente (17 temas):
    - **Básicos:** *Corporativo*, *Geek* (negro/verde, monospace), *Colorido*, *All-Blue*, *All-Pink*.
    - **8 perfiles multicolor** (un color por categoría): *Atardecer*, *Arrecife*, *Aurora Boreal*, *Pastel*, *Retro 80s*, *Otoño*, *Cyberpunk*, *Tropical*.
    - **Inspirados en iWork/Numbers:** *Estándar*, *Mono/Editorial*, *Pastel/Soft*, *Tierra/Cálido*.
    - **Anillos de Actividad (Fitness):** fondo negro y gradientes neón Move / Exercise / Stand.
  - El `.html` exportado respeta el tema activo.
- [x] **Gráfico de Anillos Concéntricos (Activity Rings):** extremos redondeados, pista de fondo y leyenda (máx. 4 anillos).

---

## 🏛️ Hoja de Ruta Detallada (18 Fases Acopladas: UI + Backend hasta el 100%)

> **Regla de Desarrollo para Desarrolladores y LLMs:** Ninguna fase implementa cambios visuales sin su contraparte de motor de datos y viceversa. Antes de codificar cualquier fase, consulta la guía de contratos técnicos y diagramas de flujo en [Wiki/Página 6: Arquitectura de UI y Contratos de Backend](./Wiki/Página%206%20Arquitectura%20de%20UI%20y%20Contratos%20de%20Backend%20(Guía%20para%20Desarrolladores%20y%20LLMs).md).

---

### 📍 Fase 3: Shell Desktop y Barra Lateral de Vistas (3 Modos) (Completada ✅)
- 🖥️ **UI / Frontend:**
  - [x] **TitleBar Superior:** Botones compactos (Guardar, Deshacer, Rehacer), nombre dinámico del proyecto (`.analyticraft`) y controles de ventana nativa.
  - [x] **Left View Switcher:** Barra lateral extrema izquierda con 3 iconos principales estilo Power BI:
    - 📊 *Vista de Informe (Report View)*.
    - 📋 *Vista de Datos (Data View)*.
    - 🕸️ *Vista de Modelo (Model View)*.
- ⚙️ **Backend / Motor de Datos:**
  - [x] **Store de Navegación React:** Estado central `activeView: 'report' | 'data' | 'model'`.
  - [x] **Ciclo de Vida Condicional:** Desmontaje o suspensión de renderizado intensivo (ECharts) al cambiar de vista para liberar ciclos de CPU.
  - [x] **Atajos Globales de Teclado:** Listener nativo para `Ctrl+1` (Informe), `Ctrl+2` (Datos), `Ctrl+3` (Modelo), `Ctrl+S` (Guardar), `Ctrl+Z` (Deshacer) y `Ctrl+Y` (Rehacer).

---

### 📍 Fase 4: Refactorización UI de Shell (FixBugs & Gestalt) + Vista de Datos (Data View) Solo Lectura y Paginación DuckDB (Completada ✅)

- 🛠️ **Refactorización de Interfaz y Corrección de UI (FixBugs & Ergonomía):**
  - [x] **Quick Access Toolbar (TitleBar Superior):**
    - Mover el botón "Abrir" (`FolderOpen`, estilo línea) a la barra superior izquierda junto a los iconos de "Guardar", "Deshacer" y "Rehacer".
    - Eliminar los botones duplicados con texto `[ Abrir ]` y `[ Guardar ]` de la barra superior derecha, conservando una cabecera limpia y profesional.
    - Unificar el estilo iconográfico a línea uniforme (`strokeWidth={1.5}` / outline de `lucide-react`) en todos los botones del shell, eliminando iconos rellenos disonantes (ej. `Palette`).
  - [x] **Reubicación hacia la Sub-Barra de Herramientas (Sub-Toolbar):**
    - Trasladar los botones `[ + Agregar Gráfico ]`, `[ Selector de Tema ]` y `[ Exportar .HTML ]` desde la barra superior hacia la sub-barra de herramientas.
    - Corrección tipográfica: Renombrar `+ + Agregar Gráfico` a `+ Agregar Gráfico` (eliminar el símbolo de suma duplicado).
    - Agrupación semántica (Principio de Gestalt):
      - *Lado Izquierdo (Acciones de Modelado y Datos):* `[ + Agregar Gráfico ]`, `[ Modelador Relacional (JOIN) ]`, `[ Refrescar Consultas ]`.
      - *Lado Derecho (Configuración, Ayuda y Salida):* `[ Selector de Tema ]`, `[ Wiki ]`, `[ Guía Exportar CSV ]`, `[ Exportar .HTML ]`.
  - [x] **Atenuación Visual del Botón Exportar:**
    - Reducir el peso visual del botón `Exportar .HTML`: reemplazar el verde brillante saturado por un estilo secundario discreto (fondo oscuro `#252526`, borde sutil y acento verde suave) para priorizar el lienzo analítico.
  - [x] **Eliminación de Redundancia de Tema:**
    - Eliminar la etiqueta de texto redundante `"Tema Gráficos: [Tema]"` en el extremo de la sub-barra; el tema activo se visualiza exclusivamente en el botón del selector.
  - [x] **Resolución de Conflicto de Enrutamiento (Bug Fix):**
    - Desacoplar el manejador del botón `Guía Exportar CSV`: actualmente reusa el estado `showWikiModal` forzando la página 5, interfiriendo con el botón general `Wiki`.
    - Implementar un diálogo modal independiente (`showCsvGuideModal`) con su propio ciclo de vida y navegación desacoplada.
  - [x] **Optimización del Espacio Vertical:**
    - Ajustar CSS/Flexbox de la sub-barra (`flex-wrap: wrap`, `gap: 8px`, sin desbordamientos horizontales).
    - Preparar la migración de la barra horizontal de "Filtros Globales" hacia un panel lateral colapsable a la derecha (estilo dock de filtros de Power BI) para ganar altura de lienzo.

- 🖥️ **UI / Frontend (Vista de Datos):**
  - [x] **Cuadrícula Tabular de Alta Densidad:** Selector lateral de tablas cargadas y visor en tabla con cabeceras estilizadas y tipos de dato visibles (`[VARCHAR]`, `[BIGINT]`, `[DOUBLE]`).
  - [x] **Banner Pedagógico Permanente:** Aviso informativo destacado explicando que la vista es de **Solo Lectura** para preservar la fuente única de verdad, y guiando al usuario al Hot Swap CSV.
  - [x] **Cabecera de Acción Directa:** Botón prominente `[ ↻ Hot Swap / Recargar CSV ]` junto al título de la tabla.
- ⚙️ **Backend / Motor de Datos:**
  - [x] **Introspección y Conteo:** Ejecución de `PRAGMA table_info('tabla')` y `SELECT COUNT(*) FROM "tabla"`.
  - [x] **Paginador Virtualizado en DuckDB:** Consulta por demanda `SELECT * FROM "tabla" LIMIT 100 OFFSET ?` garantizando latencia <16ms en datasets de 500k+ filas.
  - [x] **Prohibición de Mutación (Inmutabilidad Estricta):** Cero endpoints o queries de `UPDATE`/`INSERT` sobre celdas; canalización exclusiva vía `read_csv_auto` en DuckDB.

---

### 📍 Fase 5: Cinta de Opciones Contextual (Ribbon Menu) y Despachador de Comandos (Completada ✅)
- 🖥️ **UI / Frontend:**
  - [x] **Estructura de Cinta Plegable:** Pestañas superiores (`Archivo`, `Inicio`, `Insertar`, `Modelado`, `Ver`, `Formato`) con micro-iconos, tooltips y botón toggle de colapso rápido (`Ctrl+F1`).
  - [x] **Grupos de 'Inicio':** Portapapeles (Copiar/Pegar/Duplicar/Eliminar visual), Insertar gráficos rápidos (Barras, Líneas, Torta, KPI, Tabla, Área), Datos (`Obtener CSV`, `Hot Swap`, `Actualizar Todo`), Modelado (`Relaciones JOIN`) y Compartir (`Exportar HTML`).
  - [x] **Reactividad de Pestaña:** La pestaña `Formato` se activa y resalta automáticamente con distintivo `Visual` cuando hay una tarjeta seleccionada en el lienzo, permitiendo transformar el tipo de visual, alternar leyenda/pie y editar el título en vivo.
- ⚙️ **Backend / Motor de Datos:**
  - [x] **ActionDispatcher Centralizado:** Patrón Command (`RibbonAction`) para canalizar de forma desacoplada y tipada todas las acciones de la cinta (`COPY_CARD`, `PASTE_CARD`, `DUPLICATE_CARD`, `DELETE_CARD`, `REFRESH_ALL_DATA`, `TRIGGER_HOT_SWAP`, etc.).
  - [x] **Portapapeles en Memoria (Clipboard Engine):** Almacenamiento inmutable profundo de tarjetas (`clipboard: ChartConfig | null`) con atajos nativos sincronizados (`Ctrl+C`, `Ctrl+V`, `Ctrl+D`, `Delete`).
  - [x] **Historial Undo/Redo Integrado:** Captura preventiva de snapshots (`recordSnapshot()`) antes de cada mutación despachada, permitiendo revertir o rehacer cualquier operación con `Ctrl+Z` / `Ctrl+Y`.

---

### 📍 Fase 5.1: Sprint de Estabilidad, Deduplicación de UI y Principio de Responsabilidad Única (Completada ✅)
- 🛠️ **Refactorización de Interfaz y Eliminación de Duplicidad (SSI - Single Source of Interaction):**
  - [x] **Punto 1 (TitleBar Limpia):** Remoción de controles de ventana simulados (`─`, `□`, `✕`) y botón `?` duplicado en la cabecera superior.
  - [x] **Punto 2 (Nombre de Proyecto Inmutable):** Reemplazo de `<input>` editable por `<span className="project-name-label">` de solo lectura.
  - [x] **Punto 3 (Pestaña Archivo):** Supresión del grupo `Publicación` (redundante con `Inicio > Compartir`) y renombrado de `Guía CSV` a `¿Cómo traer tus datos?`.
  - [x] **Punto 4 (Pestaña Inicio Depurada):** Retiro de grupos clonados `Insertar Visuales` (canónico en `Insertar`) y `Modelado` (canónico en `Modelado` y riel lateral). Consolidación exclusiva de `Portapapeles`, `Datos`, `Diseño` y `Compartir`.
  - [x] **Punto 5 (Espacio Vertical del Canvas):** Barra de `Filtros Globales` reactiva y condicional; solo se renderiza si `globalFilters.length > 0`, liberando 40px de lienzo por defecto.
  - [x] **Punto 6 (Pestaña Modelado):** Eliminación de botones redundantes (`Crear JOIN`), manteniendo accesos de navegación técnica (`Vista Modelo`, `Vista Datos`).
  - [x] **Punto 7 (Pestaña Ver):** Supresión del grupo `Vistas del Sistema` que duplicaba el `Left View Rail` permanente a 40px de distancia.
  - [x] **Punto 8 (Z-Index y Overflow de Temas):** Solución de recorte en `.ribbon-command-stage` (`overflow: visible; z-index: 100`) y popover de temas en `Inicio > Diseño` con `z-index: 9999` flotando sobre el lienzo.
  - [x] **Punto 9 (Empty State UI Humanizada para DuckDB):** Detección pedagógica de `Binder Error` / `sum(VARCHAR)` en tarjetas visuales, explicando que las métricas cuantitativas requieren tipos numéricos y guiando la selección de ejes.
  - [x] **Punto 10 (Directiva LLM en Wiki):** Creación de la [Página 9 de la Wiki](./Wiki/Página%209%20Guía%20Anti-Duplicidad%20y%20Principio%20de%20Responsabilidad%20Única%20en%20UI%20(Directiva%20para%20Desarrolladores%20y%20LLMs).md) con la "Prueba del Espejo de Comandos" y matriz oficial de ubicaciones canónicas.
  - [x] **Punto 11 (Bug Fix de Pie de Tarjeta):** Sincronización reactiva de `showDescription !== false` entre el botón de la cinta `Formato` y el renderizado en `ChartCard.tsx`.

---

### 📍 Fase 6: Paneles Laterales Acoplables a la Derecha (Visualizations & FIELDS con Drag & Drop) (Completada ✅)
- 🖥️ **UI / Frontend:**
  - [x] **Panel "Visualizaciones":** Matriz de iconos para alternar tipos de visual con un clic (incluyendo nuevo visual **Segmentador / Slicer**) + subpestaña `Build` (drop-zones para Eje X / Dimensión, Eje Y / Métrica, **Botón Invertir Ejes X ⇄ Y**, **Filtros Locales Múltiples con chips de datos reales**) y subpestaña `Format` (interruptores On/Off para títulos, ejes, etiquetas, notas al pie).
  - [x] **Panel "Campos" (FIELDS):** Acordeón colapsable con tablas y columnas clasificadas con iconos (`#` numérico, `Abc` texto, `📅` fechas, `☑` booleanos), buscador rápido en vivo y botón de Hot Swap `↻`.
  - [x] **Pestañas de Riel Colapsable:** Paneles acoplables independientemente con botones verticales en el borde derecho (`docked-rail-tab`).
- ⚙️ **Backend / Motor de Datos:**
  - [x] **API de Arrastre Tipada:** Transferencia de payload `{ tableName, columnName, dataType }` (`DraggedFieldPayload`) mediante eventos de Drag & Drop hacia las drop-zones, tarjetas visuales y el lienzo general.
  - [x] **Constructor SQL Reactivo & Filtros Múltiples:** Ensamblado automático de la consulta `SELECT dim, agg(metric) FROM table WHERE ... GROUP BY dim` combinando filtros globales y locales activos en DuckDB (<16ms).
  - [x] **Segmentador de Datos Reactivo:** Filtrado bidireccional interactivo sobre el dashboard al seleccionar valores en el visual Segmentador.

---

### 📍 Fase 7: Vista de Modelo Relacional (Grafo de Tablas, Drag & Drop y Vistas Virtuales) (Completada ✅)
- 🖥️ **UI / Frontend:**
  - [x] **Lienzo de Grafo Interactivo:** Espacio de trabajo infinito con zoom interactivo (50% - 160%), paneo y nodos flotantes reposicionables mediante drag manual (`ModelView.tsx`).
  - [x] **Diferenciación Cromática:** Cabeceras y bordes diferenciados heurísticamente para Tablas de Hechos (`#007acc`, badge "HECHOS") y Tablas de Dimensiones (`#cca700`, badge "DIMENSIÓN").
  - [x] **Conectores Visuales SVG:** Arrastre de una columna hacia otra tabla para trazar curvas cúbicas de Bézier con extremos `1` (PK / Dimensión) y `*` (FK / Hechos), flecha direccional y panel de inspección interactivo.
  - [x] **Auto-Alineación en Esquema de Estrella:** Botón inteligente que coloca la tabla de hechos en el centro (`x: 440, y: 200`) y distribuye las dimensiones radialmente en un círculo uniforme.
- ⚙️ **Backend / Motor de Datos:**
  - [x] **Generador de Vistas Virtuales en DuckDB:** Ejecución de `CREATE OR REPLACE VIEW "view_s_t" AS SELECT s.*, t.*` con deduplicación y aliasing automático de colisiones de columnas mediante `PRAGMA table_info`.
  - [x] **Gestor de Relaciones en Store:** Sincronización bidireccional del array `relations: TableRelation[]` con el árbol de campos de `FieldsPanel` y la Vista de Datos.
  - [x] **Descarte Seguro:** Ejecución inmediata de `DROP VIEW IF EXISTS "view_s_t"` al presionar el botón de eliminar relación (`🗑️`) sin alterar ningún archivo físico CSV.

---

### 📍 Fase 8: Asistente Newbie-Friendly en el Modelador Relacional (Completada ✅)
- 🖥️ **UI / Frontend:**
  - [x] **Botón "Auto-Detectar Relaciones":** Analiza el modelo y resalta con un aura luminosa (`.column-detected-aura`) los campos con nombres clave coincidentes, con banner flotante de sugerencias y conexión masiva.
  - [x] **Auto-Alineación en Cascada:** Botón de un solo clic que reordena las dimensiones arriba (`y = 60`) y los hechos al centro/abajo (`y = 420`).
  - [x] **Tooltips en Lenguaje Natural:** Explicación emergente al pasar el cursor sobre `1`, `*` y `1 : * ──▶` (*"Un registro en Stores puede tener múltiples ventas en Sales"*), además de caja explicativa en el panel inspector.
  - [x] **Modal de Edición de JOIN:** Selector visual para modificar tipo de unión (`LEFT`, `INNER`), cambiar columnas de clave o invertir dirección de la relación (`⇄`).
- ⚙️ **Backend / Motor de Datos:**
  - [x] **Algoritmo Heurístico de Detección:** Coincidencia de nombres normalizados (`*_id`, `*_key`, `id`, `cod_*`, coincidencias semánticas con tablas) y verificación de tipos de datos compatibles en DuckDB.
  - [x] **Motor de Layout Jerárquico:** Algoritmo matemático para asignar coordenadas `{x, y}` automáticas a los nodos según su nivel relacional (dimensiones en capa superior, hechos en capa inferior).

### 📍 Fase 8.5: Ciclo de Vida de Proyecto Limpio, Empaquetado Estructurado y Backups Seriados (Completada ✅)
- 🖥️ **UI / Frontend:**
  - [x] **Arranque en Blanco Garantizado:** Al abrir la UI, el espacio de trabajo inicia en estado virgen (`Sin_Titulo.analyticraft`, 0 tablas en panel Campos, 0 tarjetas en lienzo, sin precargas forzadas).
  - [x] **Acción "Nuevo +" Reestructurada:** Al presionar `Nuevo +` en Ribbon Archivo o atajo, solicita confirmación si hay cambios pendientes, cierra el proyecto activo, vacía el catálogo visual y purga por completo el estado de DuckDB.
  - [x] **Indicador de Proyecto Modificado (*Dirty State*):** La píldora superior (`.project-name-pill`) muestra un punto ámbar/asterisco `*` cuando existan cambios sin guardar en el lienzo, datos o relaciones.
  - [x] **Edición en Línea del Nombre de Proyecto:** Clic o doble clic en la píldora superior para renombrar el archivo directamente sin necesidad de exportar.
  - [x] **Diferenciación "Guardar" vs "Guardar Como...":**
    - `Guardar` (`Ctrl+S` / icono disquete): Guarda atómicamente sobre la carpeta de proyecto activa sin abrir descargas del navegador.
    - `Guardar Como...` (Ribbon Archivo / `Ctrl+Shift+S`): Abre el selector de directorio para elegir una nueva ubicación de proyecto.

- ⚙️ **Backend / Motor de Datos:**
  - [x] **Purga Atómica de Sesión DuckDB (`resetDuckDBSession`):** Consulta a `information_schema` o `duckdb_tables()` y ejecución en cadena de `DROP VIEW IF EXISTS` y `DROP TABLE IF EXISTS` para limpiar la memoria física de DuckDB.
  - [x] **Empaquetado Estructurado de Proyecto (File System Access API & Fallback Autocontenido):**
    - Persistencia en carpeta seleccionada por el usuario con subdirectorios:
      - `<nombre>.analyticraft` (Definición JSON del proyecto).
      - `data/` (Instantáneas de los archivos CSV cargados para portabilidad total).
      - `temp/` (Archivos temporales y multimedia).
      - `backups/` (Histórico de versiones seriadas).
  - [x] **Motor de Backups Seriados (`analyticraft-backup`):** Al guardar sobre un proyecto existente, el archivo `.analyticraft` anterior se renombra automáticamente a `<nombre>_backup_NNN.analyticraft` antes de escribir la nueva versión.

---

### 📍 Fase 9: Lienzo Libre con Cuadrícula Magnética y Menú Flotante de Alineación
- 🖥️ **UI / Frontend:**
  - [ ] **Lienzo con Cuadrícula Magnética (Snap-to-Grid):** Arrastre y redimensionamiento libre de tarjetas con guías de alineación inteligentes.
  - [ ] **Menú Flotante de Alineación:** Barra contextual al seleccionar tarjetas (alinear a la izquierda, centro, derecha, arriba, distribuir horizontal/verticalmente).
  - [ ] **Banner Superior de KPIs:** Contenedor superior para tarjetas numéricas destacadas.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Esquema de Posicionamiento:** Adición de `{ x: number, y: number, w: number, h: number, zIndex: number }` al objeto `ChartConfig`.
  - [ ] **Algoritmo de Alineación Geométrica:** Funciones puras para recalcular posiciones relativas sin solapamiento destructivo.
  - [ ] **Serialización en Proyecto:** Persistencia de coordenadas y dimensiones exactas en el archivo `.analyticraft`.

---

### 📍 Fase 10: Navegación de Páginas Múltiples y Marcadores (Bookmarks)
- 🖥️ **UI / Frontend:**
  - [ ] **Barra Inferior de Páginas:** Pestañas (`Página 1`, `Página 2`, `+ Nueva Página`), menú contextual de pestaña (renombrar, duplicar, eliminar) y slider de zoom.
  - [ ] **Panel Lateral de Marcadores (Bookmarks):** Lista de capturas guardadas (ej. `P1 - Vista General`, `P1 - Filtro Mayoristas`) con botón `Add` y botón `Presentar`.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Modelo Jerárquico de Proyecto:** Evolución a `AnalyticraftProject -> pages: PageConfig[]`, donde cada página posee su propio array de `charts: ChartConfig[]`.
  - [ ] **Estado de Marcadores:** Captura snapshot de filtros activos, visibilidad de tarjetas y página activa en `bookmarks: BookmarkState[]`.
  - [ ] **Exportador HTML Multipágina:** Compilación del archivo `.html` autocontenido con navegación reactiva de pestañas y marcadores offline.

---

### 📍 Fase 11: Medidas Analíticas Reutilizables y Columnas Calculadas (DAX simplificado en SQL)
- 🖥️ **UI / Frontend:**
  - [ ] **Diálogo "Nueva Medida":** Modal accesible desde Ribbon (`Modelado > Nueva Medida`) con editor de expresiones SQL asistido y autocompletado de funciones (`SUM`, `AVG`, `COUNT`, `ROUND`, etc.).
  - [ ] **Icono Distintivo en FIELDS:** Las medidas creadas se listan en el panel de campos con un icono de calculadora (`🧮`) arrastrable a cualquier gráfico.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Validador de Expresiones en DuckDB:** Test de ejecución en tiempo real (`EXPLAIN SELECT {expression} FROM {table}`) antes de guardar la medida.
  - [ ] **Inyector Dinámico de CTEs:** En tiempo de consulta de la tarjeta, las medidas se inyectan como `WITH medidas AS (...)` o columnas derivadas en la query SQL vectorizada de DuckDB.

---

### 📍 Fase 12: Jerarquía Temporal Automática y Tabla Dimensional de Calendario
- 🖥️ **UI / Frontend:**
  - [ ] **Árbol de Fechas Desplegable:** Las columnas de tipo fecha (`DATE`, `TIMESTAMP`) en el panel FIELDS se expanden automáticamente en `Año › Trimestre › Mes › Día`.
  - [ ] **Generador de Calendario en Ribbon:** Botón `Crear Tabla Calendario` con selector de rango de fechas de inicio y fin.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Generador de Dimensión de Calendario en DuckDB:** Ejecución de `CREATE TABLE "calendario" AS SELECT d::DATE as fecha, year(d) as año, quarter(d) as trimestre, monthname(d) as mes, day(d) as dia FROM generate_series(DATE '...', DATE '...', INTERVAL 1 DAY) tbl(d)`.
  - [ ] **Funciones SQL de Agrupación Temporal:** Extracción de partes de fecha para granularidad dinámica en los gráficos.

---

### 📍 Fase 13: Interactividad estilo Power BI (Filtrado Cruzado y Segmentadores/Slicers)
- 🖥️ **UI / Frontend:**
  - [ ] **Filtrado Cruzado Reactivo:** Clic en una barra, sector de dona o punto de línea resalta o filtra instantáneamente todas las demás tarjetas de la página.
  - [ ] **Visual Tipo "Segmentador" (Slicer):** Tarjeta arrastrable al lienzo configurable como: lista de casillas de verificación, menú desplegable, control deslizante numérico o selector de rango de fechas.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Bus de Filtrado Cruzado Bidireccional:** Estado `crossFilterState: { sourceChartId, column, selectedValue }`.
  - [ ] **Inyector de Cláusulas WHERE Compuestas:** Modificación reactiva de las consultas DuckDB agregando condiciones `AND "columna" = 'valor'` a todas las tarjetas receptoras.
  - [ ] **Caché en Memoria de Consultas:** Almacenamiento volátil de resultados para respuestas analíticas en <8ms sin re-consultar DuckDB si los parámetros no cambiaron.

---

### 📍 Fase 14: Catálogo Extendido de Visualizaciones Analíticas
- 🖥️ **UI / Frontend:**
  - [ ] **Gráfico Combinado (Barras + Líneas):** Soporte para doble eje Y (ej. Ventas en barras y Margen % en línea).
  - [ ] **Gráfico de Cascada (Waterfall):** Visualización de pérdidas y ganancias (P&L), incrementos y decrementos acumulativos.
  - [ ] **Treemap y Gráfico de Embudo (Funnel):** Distribución jerárquica de categorías y tasas de conversión por etapas.
  - [ ] **Tabla Matriz / Pivote:** Cuadrícula con filas, columnas, subtotales y totales generales colapsables.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **ECharts Option Builders Dedicados:** Nuevos generadores modulares en `src/lib/chartOptions.ts`.
  - [ ] **Consultas Agregadas Complejas:** Uso de cláusulas SQL avanzadas en DuckDB como `PIVOT`, `ROLLUP` y `GROUPING SETS` para calcular totales y subtotales de matrices en una sola pasada.

---

### 📍 Fase 15: Perfeccionamiento de Estilos Apple (iWork y Anillos Fitness Avanzados)
- 🖥️ **UI / Frontend:**
  - [ ] **Metas Configurables por Anillo:** Campo en el inspector `Format` para fijar meta cuantitativa (ej. `Meta: 10,000 pasos`) o enlazar con una medida SQL.
  - [ ] **Efecto de Superación del 100%:** Renderizado de segunda vuelta con sombra volumétrica y resplandor neón cuando el valor excede la meta.
  - [ ] **Paletas Numbers Adaptativas:** Aplicación de tipografías semibold y fondos sutiles inspirados en macOS/iPadOS.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Series Polares Duales en ECharts:** Algoritmo en `chartOptions.ts` que desacopla la serie de base (0 a 100%) y genera una sub-serie con `shadowBlur: 12` y `shadowColor` para la fracción que supera el 100%.
  - [ ] **Cálculo de Proporción en DuckDB:** Consulta SQL que calcula el porcentaje normalizado: `ROUND((val / goal) * 100, 1)`.

---

### 📍 Fase 16: Conectividad Multifuente y Preparación de Datos (Power Query Ligero)
- 🖥️ **UI / Frontend:**
  - [ ] **Diálogo Multifuente "Obtener Datos":** Conectores visuales para Excel (`.xlsx`, selección de hoja), archivos Parquet, carpetas completas de CSVs y SQLite local.
  - [ ] **Editor de Pasos de Transformación (Power Query Ligero):** Panel visual que lista pasos aplicados (Filtrar filas, Renombrar columna, Cambiar tipo de dato, Rellenar nulos, Quitar duplicados).
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Extensiones Nativas de DuckDB:** Carga de extensiones en memoria (`read_parquet`, conector SQLite).
  - [ ] **Pipeline de Transformaciones Declarativas:** Estructura JSON de pasos reproducibles en el proyecto; DuckDB ejecuta la secuencia de transformaciones en orden sin alterar el archivo físico de origen.

---

### 📍 Fase 17: Persistencia Local Robusta y Monitoreo Automático de Archivos
- 🖥️ **UI / Frontend:**
  - [ ] **Indicador de Sincronización en Barra de Estado:** Icono de nube local o disco ("Guardado automáticamente", "Cambios pendientes").
  - [ ] **Conmutador de "Vigilancia de CSV" (File Watcher):** Opción para activar recarga en caliente automática al guardar el archivo fuente en disco.
  - [ ] **Selector de Modo de Base de Datos:** Alternar entre DuckDB 100% en memoria volátil o archivo de base de datos local persistente (`.ddb`).
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Vigilancia Nativa en Rust/Tauri:** Integración del crate `notify` en el backend Rust para monitorear el sistema de archivos del SO y emitir eventos IPC hacia el frontend cuando el CSV cambie.
  - [ ] **Hot Swap Autónomo:** Al recibir el evento IPC, el frontend ejecuta silenciosamente el reemplazo atómico de la tabla en DuckDB sin interrumpir la sesión del analista.

---

### 📍 Fase 18: Suite de Distribución y Exportación Ejecutiva (100% de Madurez)
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

### 🧭 Resumen de Cobertura Integral del Proyecto

| Área del Sistema | Fases de Desarrollo | Resultado al 100% |
|---|---|---|
| **Arquitectura de Interfaz Power BI** | Fase 3, 5, 6, 9, 10 | Experiencia idéntica a Power BI Desktop (Ribbon, Vistas, Paneles, Páginas). |
| **Gobernanza y Filosofía de Datos** | Fase 4, 16, 17 | Vista de Datos Read-Only, CSV como fuente de verdad, Hot Swap automático y pasos reproducibles. |
| **Modelado Semántico y Relacional** | Fase 7, 8, 11, 12 | Diagrama relacional visual con auto-detección, medidas analíticas en SQL y dimensión calendario. |
| **Interactividad y Visualizaciones** | Fase 13, 14, 15 | Filtrado cruzado, segmentadores interactivos, visuales analíticos avanzados y estilos Apple. |
| **Distribución y Exportación** | Fase 18 | Visor HTML interactivo sin internet, PDFs vectoriales y presentaciones PPTX ejecutivas. |

