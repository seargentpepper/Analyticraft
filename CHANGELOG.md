# Changelog - Analyticraft

Todas las modificaciones notables, adiciones funcionales y mejoras de diseño de este proyecto serán registradas en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto se adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.4] - 2026-10-26

### Lienzo Libre y Experiencia de Usuario (UI / Frontend)
- **Lienzo Libre con Coordenadas Persistentes (`FloatingCard.tsx`, `canvasLayout.ts`):**
  - Implementado sistema de anidación y libre posicionamiento donde las tarjetas flotan libremente con coordenadas `{ x, y, w, h }`.
  - Soporte de arrastre reactivo desde la cabecera con ajuste magnético a cuadrícula de 10px (*snap-to-grid*) y redimensionamiento bidireccional desde tiradores perimetrales y de esquina.
  - Las coordenadas se serializan dentro de cada objeto `ChartConfig.layout` y se preservan al guardar y reabrir sesiones en disco.
  - Algoritmo de empaquetado automático (`findFreeSlot`, `ensureLayouts`) que migra transparentemente gráficos preexistentes sin solapamiento destructivo.
- **Doomscroll y Protección de Exploración en Panel Campos:**
  - Configurado contenedor de desplazamiento fluido con `min-height: 0` y `flex-shrink: 0` en `.pbi-panel-scroll`.
  - Los contenidos internos de las tarjetas jamás se recortan o truncan al expandir múltiples tablas.
- **Aislamiento y Ventana Flotante de Relaciones (JOINs):**
  - Desacopladas las vistas relacionales virtuales del listado principal de tablas base para eliminar duplicaciones y tablas artificiales con 0 columnas.
  - Implementado botón rectangular dedicado al pie del panel Campos con indicador de conteo (`relations-count-chip`).
  - Al hacer clic, se abre una ventana flotante responsive con cabecera, listado de enlaces con tipo de JOIN, eliminación y botón de cierre (`X` y atajo `Escape`).
- **Depuración de la Barra en Vista de Modelo (Principios Gestalt):**
  - Removidos botones redundantes ("Exportar Síntesis (.md)", "Compacto/Detallado" y "Nueva Relación") de la barra horizontal del modelo.
  - Estandarizada la altura de todos los botones a 28px con tipografía uniforme, agrupados en 3 bloques delimitados por proximidad y región común: *Zoom* (Alejar, %, Acercar, Ajustar), *Disposición* (Organizar, Estrella, Cascada, Expandir/Colapsar) y *Asistentes* (Explicar, Auto-Detectar).
  - El botón "Nueva Relación" fue reubicado de forma canónica en la cinta superior dentro de la pestaña **Modelado** en su grupo propio **Relaciones**.
- **Reactividad Universal del Indicador de Cambios (`isDirty`):**
  - Activación inmediata del indicador visual (`•`) ante cualquier movimiento de tarjeta, cambio de tema, asignación de campos, mutación de filtros o borrado.
- **Buscador en Vivo del Segmentador:**
  - Búsqueda reactiva en DuckDB sin el límite ciego de 50 registros previos, permitiendo filtrado instantáneo en memoria.

### Exactitud Analítica y Motor de Datos (DuckDB-WASM)
- **Filtros Numéricos Tipados (`queryBuilder.ts`):**
  - Reemplazo de conversiones a `VARCHAR` por `TRY_CAST(... AS DOUBLE)` y literales numéricos directos en operadores `>` y `<`, resolviendo el error analítico donde `'10' < '2'` evaluaba como verdadero.
- **Orden Cronológico en Series Temporales:**
  - Consultas de gráficos de líneas y áreas aplican automáticamente `ORDER BY dimension ASC`, manteniendo la coherencia cronológica en análisis temporales.
- **Preservación Segura de Enteros Grandes (`bigint`):**
  - Helper `safeNumericOrBigInt` en `src/lib/duckdb.ts` para evitar pérdidas de precisión sobre `Number.MAX_SAFE_INTEGER`.
- **Atomicidad Transaccional (Hot Swap y Relaciones):**
  - Reemplazo en caliente de fuentes CSV mediante tabla intermedia temporal de staging (`__temp_staging_`), validando integridad antes de sustituir la tabla activa.
- **Concurrencia Determinista en Vista de Datos:**
  - Token de cancelación `isCurrent` para ignorar respuestas asíncronas desfasadas y cláusula `ORDER BY` determinista en paginación.

### Calidad, Seguridad y Testing
- **Expansión de la Suite Vitest:**
  - 30 pruebas unitarias automatizadas (`tests/canvasLayout.test.ts`, `tests/queryBuilder.test.ts`, `tests/projectStorage.test.ts`, `tests/themes.test.ts`, `tests/chartOptions.test.ts`, `tests/exporter.test.ts`) pasando al 100%.
- **Limpieza de Dependencias y CSP:**
  - Desinstalación total de `papaparse` y configuración estricta de Content Security Policy en `src-tauri/tauri.conf.json`.

---

## [0.8.3] - 2026-10-25

### Suite de Pruebas Unitarias Automatizadas (Vitest)
- **Infraestructura de Testing:** Integrado Vitest 5 como corredor nativo de pruebas automatizadas sobre Vite 8 y TypeScript, con comando `pnpm test` integrado al flujo de desarrollo y ejecución en una sola pasada (`vitest run`).
- **Verificación de Catálogo de Temas (`tests/themes.test.ts`):** 4 pruebas unitarias que validan la integridad de los 18 temas visuales de tarjetas, propiedades de contraste, paletas hexadecimales, modos (`gradient`/`multi`) y el fallback seguro de `getTheme()`.
- **Verificación de Generador de Opciones ECharts (`tests/chartOptions.test.ts`):** 6 pruebas unitarias que comprueban la resolución de colores sólidos (`accentColor`), gradientes vectoriales (`fillFor`), la cota estricta de 4 anillos (`MAX_RINGS`), formateo numérico localizado (`es-MX`) y la generación de estructuras válidas para gráficos de barras, líneas y donas/tortas.
- **Verificación de Sanitización y Exportación (`tests/exporter.test.ts`):** 3 pruebas unitarias que garantizan la prevención de vulnerabilidades XSS mediante `escapeHtml()`, la serialización segura de cadenas en etiquetas `<script>` con `safeJson()`, y la integridad del documento HTML autocontenido generado por `generateStandaloneHTML()`.

### Arquitectura y Proceso de Ingeniería

- **Exportación de Utilidades de Sanitización:** Expuestas formalmente `escapeHtml` y `safeJson` en `src/lib/exporter.ts` para habilitar pruebas unitarias aisladas sin alterar el comportamiento en tiempo de ejecución.
- **Archivo de Licencia Oficial:** Creado el archivo `LICENSE` con los términos de la Licencia MIT estándar para garantizar resolución de enlaces y cumplimiento de código abierto.

### Documentación y Estándares de Repositorio
- **Reestructuración de la Guía de Contribución (`CONTRIBUTING.md`):** Rediseñado íntegramente con enfoque sobrio de ingeniería (sin emojis), consolidando los 5 Principios Fundamentales (Local-First DuckDB, Inmutabilidad en Data View, Ergonomía Power BI, Aislamiento de Temas, Sanitización HTML), mapa exhaustivo de módulos del proyecto (`src/components/`, `src/lib/`, `src-tauri/`), directrices de control de alcance (Blast Radius) y checklist obligatorio previo a Pull Requests.
- **Modernización y Limpieza de Portada (`README.md`):**
  - Eliminación total de emojis en títulos, diagramas y viñetas para una presentación técnica profesional.
  - Rediseño del diagrama ASCII de la interfaz de usuario con tipografía monoespaciada simétrica de 74 caracteres de ancho fijo.
  - Incorporación de la sección "Flujo de Trabajo Típico" con el recorrido del usuario en 4 pasos (Importar, Modelar, Diseñar, Compartir).
  - Adición de la tabla formal del Stack Tecnológico desglosando runtime (Tauri v2 / Rust), motor analítico (DuckDB-WASM), frontend (React 19 + TypeScript + Vite 8) y visualización (Apache ECharts 6).
  - Simplificación canónica de la sección "Documentación y Enlaces" hacia los 4 documentos rectores del proyecto.

---

## [0.8.2] - 2026-10-25

###  Acciones Correctivas y Mejoras de Arquitectura (Ciclo de Vida, Persistencia de Guardado y Eliminación de Muestras)
- **Modal Interactivo de Guardado (`SaveProjectModal`):**
  - Implementado diálogo modal explícito que pregunta claramente al usuario el destino y método de guardado:
    1. **Proyecto Empaquetado (Carpeta Persistente):** Permite elegir el directorio en disco mediante `showDirectoryPicker()`, creando las subcarpetas `/data/` (copias de seguridad de los CSVs cargados), `/backups/` (historial seriado de versiones) y `/temp/`.
    2. **Instantánea Rápida (`.analyticraft`):** Descarga directa de un archivo JSON portable autocontenido con los datos en crudo para compartir rápidamente.
- **Modal Interactivo de Apertura y Corrección de Visualización de Archivos (`OpenProjectModal`):**
  - Resuelto el problema por el cual el explorador de Windows no mostraba ningún archivo `.analyticraft` al presionar "Abrir":
    - **Causa Raíz Identificada:** La función ejecutaba directamente `showDirectoryPicker()`, un diálogo de sistema operativo exclusivo para seleccionar carpetas que por diseño de Windows **oculta automáticamente todos los archivos**, provocando que carpetas sin subdirectorios (como `Downloads/test/data`) mostraran erróneamente *"Ningún elemento coincide con el criterio de búsqueda"*.
    - **Solución Implementada:** Se diseñó el nuevo diálogo `OpenProjectModal` que ofrece dos vías claras:
      1. **Abrir Archivo (`.analyticraft` / `.json`) [Recomendado]:** Invoca el selector nativo de archivos (`showOpenFilePicker` con fallback a input de archivo) donde el Explorador de Windows **sí visualiza y permite seleccionar directamente los archivos `.analyticraft`**.
      2. **Abrir Carpeta Empaquetada:** Explica explícitamente al usuario que el diálogo de carpetas solo muestra directorios y lo guía a seleccionar la carpeta raíz del proyecto (ej. `Downloads/test`) para vincular la persistencia y copias de seguridad continuas.
  - Añadido soporte para atajo de teclado nativo `Ctrl+O` para abrir el diálogo de proyectos.
- **Persistencia de Rutas de Guardado y Sobrescritura In-Place Profesional:**
  - Siguiendo los estándares de software de escritorio profesional, Analyticraft ahora recuerda de forma persistente la carpeta activa en `localStorage` (`analyticraft_project_dir_name`).
  - La pastilla del proyecto en la barra de título refleja visiblemente la carpeta activa vinculada (`[NombreCarpeta] Proyecto.analyticraft`).
  - Los guardados posteriores (`Ctrl+S` o botón Guardar) sobrescriben en el directorio vinculado sin desplegar modales innecesarios, creando en paralelo una copia de seguridad en `/backups/_backup_NNN.analyticraft`.
  - El botón `Guardar Como` (`Ctrl+Shift+S`) permite en cualquier momento reubicar o reempaquetar el proyecto en una nueva carpeta.
- **Eliminación Total de Alusiones a "Datos de Muestra":**
  - Removido el grupo `Demostración` y el botón `Muestra PyME` de la pestaña **Archivo** del Ribbon.
  - Removido el botón `Muestra PyME` de la pestaña **Inicio** del Ribbon.
  - Eliminado el botón `Cargar Datos de Muestra` del lienzo de trabajo inicial vacío; reemplazado por un botón profesional y limpio de importación: `Importar archivo CSV` junto a un icono neutral de BI (`BarChart3`).
- **Arranque Limpio y Restablecimiento de Sesión (`NEW_PROJECT`):**
  - La aplicación inicia estrictamente en blanco (`Sin_Titulo.analyticraft`) sin tablas ni gráficos precargados ni nombres de demostración.
  - La acción `Nuevo` ejecuta `resetDuckDBSession()`, purgando el catálogo de DuckDB en memoria y desvinculando la ruta de carpeta previa.
- **Herramientas de Limpieza y Organización de Vista para Modelos Complejos (`ModelView.tsx`):**
  - **Botón y Algoritmo "Organizar Vista" (`handleCleanAndOrganizeLayout`):**
    - Distribución automática en cuadrícula multinivel anti-solapamiento (Zero-Overlap) diseñada para modelos con decenas de tablas y relaciones (ej. 12 tablas y 70 relaciones).
    - Separa ordenadamente dimensiones (capas superiores) y hechos (capas inferiores) envolviendo en filas de máximo 4 tarjetas por nivel con alturas dinámicas y ordenamiento por conectividad.
    - Ejecuta un encuadre automático al lienzo tras reubicar los nodos.
  - **Modo Compacto de Tablas (`isCompactMode`):**
    - Activado por defecto en modelos con 6 o más tablas para reducir la altura vertical de las tarjetas.
    - Filtra las columnas visibles mostrando únicamente aquellas que forman parte de relaciones activas, incorporando un botón colapsable inline (`+ X campos adicionales`) para expandir/colapsar por tabla o de forma global con el botón `Compacto` de la barra de herramientas.
  - **Atenuación Selectiva y Enfoque de Relaciones (Focus & Dimming):**
    - Al posar el ratón (`hover`) o hacer clic en cualquier tabla, las relaciones ajenas se atenúan al 8% de opacidad (`opacity: 0.08`), mientras que las líneas vinculadas se iluminan con resplandor cian brillante (`#38bdf8`), eliminando el efecto de "red de araña" ininteligible.
    - Reducción inteligente de insignias: las etiquetas centrales `1 : *` se ocultan cuando existen más de 15 relaciones a menos que la relación esté seleccionada o en foco.
    - Precisión matemática en el anclaje de curvas Bézier SVG contemplando el índice de columnas visibles tanto en modo compacto como expandido.
  - **Navegación Completa de Columnas con Scroll Vertical Interno:**
    - La lista de columnas de las tarjetas relacionales ahora incorpora scroll vertical interno (`max-height: 250px; overflow-y: auto`) con barra de desplazamiento personalizada estilizada para tema oscuro. Los usuarios pueden inspeccionar y arrastrar el 100% de los campos sin que las tarjetas crezcan indefinidamente ni se salgan del encuadre visual.
  - **Colapso y Expansión Individual por Tarjeta de Tabla:**
    - Cada tarjeta cuenta con un conmutador chevron individual en la cabecera que permite colapsarla a su altura mínima (36px), ocultando la lista de columnas y pie de página para despejar el lienzo en modelos con gran número de fuentes de datos. Las líneas de relación vinculadas se reanclan matemáticamente de forma limpia al centro de la cabecera cuando la tabla está colapsada.
  - **Control Global "Expandir / Colapsar Todo" en Modelador y Panel de Campos:**
    - Añadido botón conmutador global (`ChevronsUpDown`) en la barra de herramientas del modelador relacional y en la cabecera del panel lateral de Campos (`FieldsPanel.tsx`) para minimizar o desplegar la totalidad de las tablas en un solo clic.
  - **Optimización Anti-Colisión en Esquema de Estrella (Zero-Overlap Star Schema):**
    - Rediseño del algoritmo de distribución en estrella con órbitas concéntricas escaladas (radio interior 520px × 390px, radio exterior 940px × 660px), desfasamiento angular entre capas y un pase post-procesado de relajación elástica de colisiones. Garantiza separación nítida sin solapamiento entre la tabla central y las dimensiones satélite, incluso en modelos de 12 tablas.
  - **Modal Pedagógico de Explicación del Modelo ("Explicar Modelo" para Principiantes y Migración desde Power BI):**
    - Nuevo asistente conceptual interactivo 100% determinista (sin dependencias ni consumo de LLMs externos) accesible desde el botón esmeralda `Explicar Modelo` en la barra de herramientas.
    - Desglosa didácticamente la Regla de Oro: diferencia entre Dimensiones (contexto cualitativo, quién/dónde/cuándo) y Tablas de Hechos (métricas cuantitativas, transacciones).
    - Explica el sentido de propagación de filtros (`1 ──▶ *`) y aclara por qué los filtros fluyen desde las dimensiones hacia los hechos.
    - Alerta contextual y diagnóstico de tablas huérfanas con acceso directo al motor heurístico de auto-detección.
  - **Corrección de Ícono de Base de Datos en Vista de Datos (`DATOS`):**
    - Resuelto el truncamiento del ícono `<Database>` que se comprimía a 0px de ancho debido a `flex-shrink` por nombres largos de tablas (ej. `sample_almacenes_costos_pyme`). Se aplicó `flex-shrink: 0` y `min-width: 0` con elipsis de texto, garantizando que el 100% de las tablas muestren su ícono cilíndrico de base de datos independientemente de la longitud de su nombre (aclarando que no es una diferenciación del modelo entidad-relación, sino un ajuste de ergonomía tipográfica).
  - **Persistencia Robusta de Relaciones en el Documento de Proyecto (`.analyticraft`):**
    - *Reconstrucción Automática de Vistas Virtuales al Abrir:* Al reabrir un proyecto empaquetado o archivo `.analyticraft`, DuckDB purga su sesión en memoria (`resetDuckDBSession()`) y carga los CSVs. Tanto en `handleOpenProjectDirectory` como en `loadProjectFromFile`, ahora se itera sobre `project.relations` y se reconstruye automáticamente cada vista relacional (`createVirtualRelationView()`) en la memoria de DuckDB antes de renderizar los gráficos.
    - *Nomenclatura Unívoca y Anti-Colisión:* En `handleAddRelationDirectly` y `handleExecuteJoin`, el nombre de las vistas ahora se genera determinísticamente contemplando tablas y columnas (`const cleanViewName = view_${sourceTable}_${sourceCol}_${targetTable}_${targetCol}.replace(/[^a-zA-Z0-9_]/g, "_");`), impidiendo que DuckDB lance errores de colisión cuando se detectan múltiples relaciones entre las mismas tablas.
    - *Marcado Reactivo de Estado (`isDirty`):* Las acciones de conexión (individual o en masa mediante "Conectar Todas"), actualización y eliminación de relaciones en el modelador ahora marcan `isDirty = true`, encendiendo el punto indicador en la barra de título para garantizar que el archivo guardado contenga la totalidad de las relaciones.
  - **Exportación de Síntesis del Modelo en Markdown (`.md`) para Auditoría Externa con LLMs:**
    - Nuevo módulo de exportación `src/lib/modelSynthesis.ts` accesible mediante:
      - Botón directo **`Exportar Síntesis (.md)`** en la barra de herramientas del modelador relacional (`ModelView.tsx`).
      - Botón **`Exportar Síntesis para LLM (.md)`** en el pie del modal de explicación didáctica (`ModelExplanationModal.tsx`).
    - *Contenido Estructurado del Documento:*
      - **Resumen Cuantitativo:** Total de tablas, conteo de dimensiones, hechos, relaciones, gráficos y tablas huérfanas.
      - **Catálogo de Tablas y Esquemas:** Registros, columnas, tipos de datos y roles arquitectónicos sugeridos (PK/FK, métricas cuantificables, dimensiones temporales y categóricas).
      - **Matriz de Relaciones:** Sentido `1 ──▶ *`, claves involucradas, tipo de JOIN y traducción semántica en lenguaje natural.
      - **Lienzo de Informe:** Lista de gráficos, ejes X/Y, agregaciones SQL (`SUM`, `AVG`, `COUNT`) y segmentadores activos.
      - **Prompt de Auditoría Pre-Redactado:** Instrucciones para que el LLM externo evalúe la integridad del modelo, proponga de 3 a 5 KPIs PyME de alto impacto y sugiera mejoras de ergonomía visual.
    - *Acción Dual:* Al pulsar el botón, descarga el archivo `<Proyecto>_sintesis_modelo.md` y copia simultáneamente el contenido completo al portapapeles con notificación toast para pegar con `Ctrl+V` directamente en ChatGPT, Claude o Gemini.
- **Documentación Centralizada en `docs/`:**
  - Actualizadas las páginas de la wiki en `docs/` ([Página 1](file:///c:/Users/Admin/Github/Analytics/Analyticraft/docs/P%C3%A1gina%201%20Home%20(Visi%C3%B3n%20y%20Filosof%C3%ADa)%20%C2%B7%20seargentpepperAnalyticraft%20Wiki.md), [Página 6](file:///c:/Users/Admin/Github/Analytics/Analyticraft/docs/P%C3%A1gina%206%20Arquitectura%20de%20UI%20y%20Contratos%20de%20Backend%20(Gu%C3%ADa%20para%20Desarrolladores%20y%20LLMs).md), [Página 8](file:///c:/Users/Admin/Github/Analytics/Analyticraft/docs/P%C3%A1gina%208%20Cinta%20de%20Opciones%20Contextual%20(Ribbon),%20Despachador%20de%20Comandos%20y%20Portapapeles.md), [Página 10](file:///c:/Users/Admin/Github/Analytics/Analyticraft/docs/P%C3%A1gina%2010%20Paneles%20Laterales%20de%20Visualizaciones%20y%20Campos%20(Drag%20&%20Drop%20y%20Constructor%20SQL%20Reactivo).md) y [Página 11](file:///c:/Users/Admin/Github/Analytics/Analyticraft/docs/P%C3%A1gina%2011%20Vista%20de%20Modelo%20Relacional%20(Grafo%20de%20Tablas,%20Drag%20&%20Drop%20y%20Vistas%20Virtuales).md)) y el `README.md` documentando los contratos de persistencia de proyectos empaquetados, el arranque limpio, la navegación con scroll y colapso de tarjetas, la guía didáctica de modelado relacional y la exportación de síntesis para LLMs.
- **Validación y Verificación Técnica:**
  - Compilación TypeScript (`npx tsc --noEmit`): **0 errores**.
  - Empaquetado Vite (`npm run build`): generado exitosamente en **662ms** (bundle `dist/assets/index-BhI9iv2m.js`).
  - Auditoría visual automatizada en el navegador verificó el renderizado del icono cilíndrico en la Vista de Datos, los botones en la barra de herramientas del Modelo y el modal de explicación con descarga y copiado al portapapeles.

---

## [0.8.1] - 2026-10-24

### 🐛 Corregido (Diagnóstico Ágil de Catálogo DuckDB, Visibilidad Contextual y Estabilidad HMR)
- **Persistencia de Singleton DuckDB en `window`:**
  - Se mitigó la desincronización entre React Fast Refresh y DuckDB-Wasm mediante el almacenamiento de la instancia en `window.__analyticraft_duckdb__` y `window.__analyticraft_conn__`. Las actualizaciones HMR en desarrollo ya no destruyen el WebWorker ni purgan las tablas registradas.
- **Manejo Resiliente de Error de Catálogo (`sqlite_temp_master`):**
  - `ChartCard.tsx` ahora detecta amigablemente si una tabla referenciada no existe en la sesión activa, sustituyendo el error crudo de base de datos por una caja informativa guiada con botón para reimportar o reasignar la fuente.
- **Aislamiento Estricto de Pestaña Contextual `Formato`:**
  - La pestaña `Formato VISUAL` del Ribbon ahora se renderiza única y exclusivamente en la **Vista de Informe** (`activeView === "report"`) cuando existe un visual seleccionado (`selectedChartId !== null`), impidiendo que aparezca fuera de contexto en la Vista de Modelo o Vista de Datos.
- **Conmutador Centralizado de Vistas (`handleSwitchView`):**
  - Las transiciones de vista (por atajos `Ctrl+1/2/3` o por la barra lateral izquierda) reajustan inteligentemente la pestaña activa de la cinta a `"modeling"` o `"home"`.
- **Corrección Tipográfica en Barra de Herramientas del Modelo:**
  - Eliminado el glifo duplicado `+` en el botón de nueva relación (`<span>Nueva Relación</span>`), resolviendo la etiqueta redundante `+ + Nueva Relación`.
- **Ampliación de Nodos Relacionales (`CARD_WIDTH: 250px`):**
  - Aumentado el ancho mínimo de las tarjetas a 250px y añadidos atributos `title` en cabeceras y pastillas de sugerencia para evitar truncamientos excesivos de nombres (`sample_clientes_p...`).
- **Cargador Rápido de Datos de Muestra PyME (`sampleData.ts`):**
  - Botón directo `Muestra PyME` en el Ribbon (`Inicio` y `Archivo`) y en el lienzo vacío para hidratar al instante `sample_ventas_pyme` y `sample_clientes_pyme` con sus relaciones en memoria.
- **Documentación Técnica (Página 12 de la Wiki):**
  - Publicada la **Guía de Diagnóstico Rápido y Resolución Ágil de Errores** con la matriz oficial de incidencias, comandos de consola DevTools para DuckDB y protocolo de 5 pasos para desarrolladores y LLMs.

---

## [0.8.0] - 2026-10-24

### 🚀 Añadido (Fase 8: Asistente Newbie-Friendly en el Modelador Relacional)
- **Algoritmo Heurístico de Detección de Relaciones (`✨ Auto-Detectar`):**
  - Normalización léxica de nombres de columnas descartando prefijos (`id_`, `cod_`, `pk_`, `fk_`) y sufijos (`_id`, `_key`, `_code`).
  - Detección semántica de coincidencias cruzadas entre nombres de columnas y nombres de tablas o columnas homólogas.
  - Verificación estricta de compatibilidad de tipos en DuckDB (familias numéricas vs. familias textuales).
  - Puntuación de confianza (`Alta` / `Media`) y descarte automático de relaciones ya activas.
- **Aura Luminosa y Banner de Sugerencias Flotante:**
  - Resplandor pulsante dorado/ámbar (`.column-detected-aura` con animación `@keyframes pulse-aura`) y micro-destellos en las columnas sugeridas.
  - Banner interactivo flotante (`.model-suggestions-banner`) con listado descriptivo de candidatos, botón `Conectar` por relación y botón de unión en masa `Conectar Todas (X)`.
- **Auto-Alineación Jerárquica en Cascada (`Cascade Cascada`):**
  - Motor de layout que asigna coordenadas automáticas `{x, y}` por nivel relacional: dimensiones en la fila superior (`y = 60`) con espaciado regular de 300px y tablas de hechos en la fila inferior (`y = 420`), emulando el flujo estándar de modelado analítico descendente.
- **Tooltips y Explicaciones Pedagógicas en Lenguaje Natural:**
  - Tooltips accesibles con descripción contextual en los extremos de cardinalidad `1` (*"Cada registro es único en esta tabla"*), `*` (*"Pueden existir múltiples registros asociados a la misma clave"*) y la flecha central de dirección de filtro (`1 : * ──▶`).
  - Tarjeta de resumen en lenguaje natural en el panel inspector: *"Un registro en Stores puede asociarse a múltiples transacciones en Sales. El filtrado fluye desde Stores hacia Sales."*
- **Modal de Edición de JOIN e Inversión de Dirección (`EditJoinModal`):**
  - Selector visual para alternar entre `LEFT JOIN` (Recomendado) e `INNER JOIN` (Estricto).
  - Botón de inversión ergonómica de dirección (`⇄ Invertir Dirección`) para conmutar tabla izquierda/derecha y cardinalidad.
  - Selectores desplegables para ajustar columnas fuente y destino.
  - Regeneración reactiva en DuckDB: descarte inmediato de la vista previa con `DROP VIEW IF EXISTS` y creación atómica de la nueva vista con `createVirtualRelationView` (<10ms).

---

## [0.7.0] - 2026-10-24

### 🚀 Añadido (Fase 7: Vista de Modelo Relacional - Grafo de Tablas, Drag & Drop y Vistas Virtuales)
- **Lienzo de Grafo Interactivo de Esquema en Estrella (`ModelView.tsx`):**
  - Espacio bidimensional infinito con fondo industrial workbench y cuadrícula matricial de 20px.
  - Nodos flotantes reposicionables mediante arrastre manual desde la cabecera de la tabla.
  - Controles de zoom interactivo (50% a 160%), porcentaje numérico y restablecimiento al 100%.
  - **Auto-Alineación en Estrella (`Auto-Alinear`):** Algoritmo que ubica la tabla de hechos en el centro (`x: 440, y: 200`) y distribuye las dimensiones radialmente en un círculo uniforme.
- **Diferenciación Cromática Heurística:**
  - Tablas de Hechos (Fact Tables): Cabecera con gradiente azul/cian neón (`#007acc`), borde luminoso y pastilla `HECHOS`.
  - Tablas de Dimensiones (Dim Tables): Cabecera en tono dorado/ámbar (`#cca700`), borde sutil y pastilla `DIMENSIÓN`.
- **Creación Visual de Relaciones por Drag & Drop:**
  - Arrastre directo de cualquier columna hacia una columna de otra tabla con retroalimentación visual (`.drop-active`).
  - Detección inteligente de cardinalidad e instanciación inmediata de la relación en memoria y DuckDB.
- **Conectores Visuales SVG:**
  - Curvas cúbicas de Bézier conectando las alturas exactas de las columnas relacionadas.
  - Pastilla de cardinalidad `1` (PK) en el extremo de la dimensión y `*` (FK) en el extremo de los hechos.
  - Marcador direccional de filtro en el centro (`1 : * ──▶`).
  - Panel inspector flotante al hacer clic en el conector con botón de eliminación rápida (`🗑️`).
- **Motor de Vistas Virtuales en DuckDB con Deduplicación:**
  - Introspección previa con `PRAGMA table_info` para detectar y evitar errores de colisión de nombres de columnas (`Duplicate column name`) al ejecutar `CREATE VIEW AS SELECT s.*, t.*`.
  - Descarte seguro con `DROP VIEW IF EXISTS` sin modificar los archivos físicos CSV.

---

## [0.6.1] - 2026-10-24

### 🚀 Añadido (Segmentadores Power BI, Inversión de Ejes X ⇄ Y y Múltiples Filtros Locales)
- **Visual "Segmentador de Datos" (Slicer):**
  - Incorporación del tipo `slicer` en la galería de Visualizaciones y lienzo general.
  - Renderizado interactivo en tarjeta (`ChartCard.tsx`) con buscador de valores en vivo, listado de opciones con conteo de registros, selector conmutador y botón de limpieza inmediata (`🧹 Limpiar`).
  - Filtrado reactivo multitarjeta: Al hacer clic en un elemento del segmentador, se actualiza el store de filtros globales y se segmentan en tiempo real todos los gráficos dependientes en DuckDB.
- **Inversión Rápida de Ejes (Swap X ⇄ Y):**
  - Botón ergonómico `Invertir Ejes (X ⇄ Y)` en el panel de Visualizaciones entre Eje X y Eje Y para alternar dimensiones y métricas con un solo clic.
  - Corrección automática e inteligente de funciones agregadas (`COUNT` si la nueva métrica es texto, `SUM` si es numérica).
  - Pastillas de arrastre bidireccionales con botones rápidos de asignación (`→ Y` y `← X`).
- **Múltiples Filtros Locales con Introspección de DuckDB:**
  - Drop-zone multi-filtro y selector desplegable para añadir N filtros locales por objeto visual.
  - Conmutador On/Off por filtro para pausar/activar individualmente sin perder la configuración.
  - Introspección reactiva de datos: DuckDB consulta `SELECT DISTINCT` para sugerir los valores reales existentes en chips interactivos.
  - Botones de gestión rápida: eliminación individual (`✕`), borrado total (`🧹 Borrar todo`) y conmutación en bloque.
- **Backend DuckDB Unificado:**
  - Inyección de todas las condiciones de filtros locales activos en la cláusula `WHERE` de `ChartCard.tsx`.
  - Badge visual de estado `[ 🔍 X filtro(s) ]` en la cabecera de las tarjetas con filtros locales.

---

## [0.6.0] - 2026-10-24

### 🚀 Añadido (Fase 6: Paneles Laterales Acoplables a la Derecha - Visualizations & FIELDS con Drag & Drop)
- **Panel Lateral "Campos" (FIELDS / Datos):**
  - **Acordeón Colapsable de Tablas:** Despliegue independiente por tabla con chevrons interactivos, conteo real de filas (`X filas`), icono de tipo de tabla y botón directo de **Hot Swap (↻)** para actualizar el CSV de forma atómica.
  - **Clasificación Cromática de Columnas:** Iconos distintivos según tipo de dato inferido por DuckDB: `#` numérico (verde/cian), `Abc` texto (azul), `📅` fecha/tiempo (ámbar) y `☑` booleano (púrpura).
  - **Buscador Rápido de Columnas:** Campo de búsqueda en vivo con botón de borrado inmediato (`✕`) para filtrar campos a lo largo de todas las tablas cargadas.
  - **Gestor de Relaciones (JOINs):** Sección integrada con vistas relacionales activas y botón de descarte seguro.
- **Panel Lateral "Visualizaciones":**
  - **Matriz de Tipos de Gráfico:** Galería superior interactiva (Barras, Líneas, Circular, Área, KPI, Tabla, Anillos de Actividad). Permite transformar la tarjeta seleccionada en un clic o insertar un gráfico nuevo directamente.
  - **Subpestaña `Construir` (`Build Visual`):** Zonas de colocación (`dropzone-slot`) reactivas con soporte Drag & Drop nativo (HTML5) para **Eje X (Dimensión)**, **Eje Y (Métrica + selector de funciones: `SUM`, `AVG`, `COUNT`, `MAX`, `MIN`)** y **Filtro Local**.
  - **Subpestaña `Formato` (`Format Visual`):** Configuración unificada de títulos, interruptores On/Off para leyendas superiores, notas al pie técnicas y editor de texto descriptivo.
- **API de Arrastre Tipada (`DraggedFieldPayload`) & Constructor SQL Reactivo:**
  - Transferencia inmutable del payload `{ tableName, columnName, dataType }` durante eventos de arrastre.
  - **Arrastre Directo al Canvas:** Soltar una columna en el lienzo vacío crea de forma autónoma una tarjeta preconfigurada con ese campo.
  - **Arrastre a Tarjetas Existentes:** Soltar un campo sobre una tarjeta (`ChartCard.tsx`) activa un resplandor luminoso cian (`drag-target-active`) y actualiza la métrica o dimensión al vuelo.
  - **Ensamblado SQL Vectorizado:** Ejecución automática de consultas `SELECT dim, agg(metric) FROM table GROUP BY dim ORDER BY val DESC LIMIT 50;` en DuckDB-Wasm con latencia <16ms.
- **Ergonomía de Escritorio Power BI Desktop:**
  - Desmantelamiento de la antigua barra lateral izquierda de tablas en el Informe, extendiendo el lienzo horizontalmente desde el conmutador de 3 vistas hasta el muelle derecho.
  - Riel de botones colapsables en el extremo derecho (`docked-rail-tab`) para ocultar/mostrar independientemente los paneles de Visualizaciones y Campos.
- **Documentación Técnica:**
  - Creación de **Página 10: Paneles Laterales de Visualizaciones y Campos (Drag & Drop y Constructor SQL Reactivo)** en la `Wiki/`.
  - Actualización de `Wiki/Índice de la Wiki.md` y `ROADMAP.md` (Fase 6 completada).

---

## [0.5.1] - 2026-10-24

### 🧹 Refactorizado & 🛡️ Deduplicación de UI (Principio de Responsabilidad Única - SSI)
- **TitleBar Superior Limpia y Desacoplada:**
  - Supresión de controles de ventana mock (`─`, `□`, `✕`) y botón de ayuda `?` redundante en la cabecera superior.
  - Sustitución del `<input>` editable del proyecto por un `<span className="project-name-label">` de solo lectura y contraste balanceado.
- **Deduplicación Integral del Ribbon Menu:**
  - **Pestaña Archivo:** Remoción del grupo `Publicación` (`Exportar HTML`), centralizando la exportación en `Inicio > Compartir`. Renombrado de `Guía CSV` a `¿Cómo traer tus datos?` bajo `Documentación`.
  - **Pestaña Inicio:** Desmantelamiento de grupos redundantes `Insertar Visuales` (canónico en pestaña `Insertar`) y `Modelado (Relaciones JOIN)` (canónico en `Modelado` y riel lateral). Consolidación exclusiva de `Portapapeles`, `Datos`, `Diseño` y `Compartir`.
  - **Pestaña Modelado:** Supresión del botón duplicado `Crear JOIN`, conservando accesos a `Vista Modelo` y `Vista Datos`.
  - **Pestaña Ver:** Eliminación del grupo `Vistas del Sistema` que duplicaba el riel lateral izquierdo `Left View Rail` permanente a 40px de distancia.
- **Optimización del Espacio Vertical del Canvas:**
  - La barra horizontal `.filter-bar` ahora es condicional y reactiva: se oculta automáticamente cuando no hay filtros activos (`globalFilters.length === 0`), devolviendo 40px de espacio vertical neto al lienzo.

### 🐛 Corregido (Bug Fixes & Estabilidad)
- **Z-Index y Overflow del Selector de Temas:**
  - Se corrigió el recorte del menú flotante de temas ajustando `.ribbon-command-stage` a `overflow: visible; position: relative; z-index: 100;` y dotando al menú popover de `z-index: 9999;`, garantizando visibilidad nítida por encima del lienzo.
- **Empty State Card UI Humanizada para Errores DuckDB:**
  - Intercepción pedagógica de errores de tipo SQL (`Binder Error: Cannot compute sum(VARCHAR)`, incompatibilidad de tipos) en `ChartCard.tsx`. Despliegue de aviso visual amigable explicando que métricas cuantitativas (`SUM`, `AVG`) requieren campos numéricos y guiando al analista en la reasignación de ejes.
- **Sincronización Reactiva de Pie de Tarjeta:**
  - Corrección en el botón toggle de la pestaña `Formato` para evaluar `selectedChart.showDescription !== false` y respeto estricto en el renderizado de `ChartCard.tsx`.

### 📚 Documentación Técnica y Directivas LLM
- **Nueva Página 9 de la Wiki:** *Guía Anti-Duplicidad y Principio de Responsabilidad Única en UI (Directiva para Desarrolladores y LLMs)*, con la "Prueba del Espejo de Comandos" y la matriz oficial de ubicaciones canónicas.
- **Actualización de Página 8:** Corrección del diagrama Mermaid del Ribbon eliminando botones duplicados y reflejando la distribución de responsabilidad única.
- **Actualización de Índice de la Wiki y Roadmap:** Inclusión de la Página 9 en `Wiki/Índice de la Wiki.md` y registro del Sprint 5.1 en `ROADMAP.md`.

---

## [0.5.0] - 2026-10-24

### 🚀 Añadido & ⚙️ Refactorizado (Fase 5: Cinta de Opciones Contextual, Despachador de Comandos y Portapapeles)
- **Cinta de Opciones Plegable (Power BI Style Ribbon Menu):**
  - **Tira de Pestañas Superiores (`.ribbon-tabs-strip`):** Navegación organizada en 6 pestañas con micro-iconos y tooltips:
    - 📁 **Archivo:** Gestión de proyectos (*Nuevo*, *Abrir*, *Guardar*), *Exportar HTML* standalone y enlaces directos a la *Wiki Oficial* y la *Guía CSV*.
    - 🏠 **Inicio:** Centro neurálgico con grupos para *Portapapeles* (Pegar, Copiar, Duplicar, Eliminar), *Datos* (Obtener CSV, Hot Swap, Actualizar Todo), *Insertar Visuales Rápidos* (Barras, Líneas, Torta, KPI, Tabla, Área), *Modelado* (Relaciones JOIN) y *Compartir* (Exportar HTML).
    - ➕ **Insertar:** Galería exhaustiva de visualizaciones y controles de segmentación (*+ Filtro Global* y *+ Tarjeta*).
    - 🕸️ **Modelado:** Accesos para creación de uniones en estrella (`CREATE VIEW`), diagrama de *Vista Modelo*, inspección en *Vista Datos* y guía de esquema CSV.
    - 👁️ **Ver:** Conmutador de vistas del sistema (*Informe*, *Datos*, *Modelo*), selector integrado de temas para tarjetas (17 perfiles) y soporte con glosario analítico.
    - 🎨 **Formato (Pestaña Contextual Reactiva):** Se ilumina en color ámbar con distintivo `Visual` cuando hay una tarjeta seleccionada en el lienzo. Permite transformar el tipo de visual en 1 clic, alternar leyendas y descripciones al pie, editar el título directamente en un input inline de la cinta, y ejecutar duplicaciones o eliminaciones rápidas.
  - **Colapso Vertical de la Cinta (`Ctrl+F1`):** Botón chevron en el extremo derecho de la tira de pestañas que permite ocultar el escenario de comandos para maximizar el área de visualización del informe al 100%.
- **ActionDispatcher Centralizado (Command Pattern):**
  - Todas las operaciones de la cinta se canalizan a través de `dispatchAction(action: RibbonAction)` de forma tipada, desacoplando los componentes visuales de las mutaciones de estado y las llamadas a DuckDB.
  - **Historial Inmutable Sincronizado:** Cualquier acción que altere tarjetas o filtros dispara automáticamente una captura previa con `recordSnapshot()`, garantizando reversibilidad total con `Ctrl+Z` (Deshacer) y `Ctrl+Y` (Rehacer).
- **Motor de Portapapeles en Memoria (Clipboard Engine):**
  - Estructura desacoplada `clipboard: ChartConfig | null` que clona profundamente la configuración métrica de la tarjeta activa.
  - Soporte de atajos nativos de teclado:
    - `Ctrl+C`: Copia la tarjeta seleccionada al portapapeles.
    - `Ctrl+V`: Pega una nueva tarjeta clonada con UUID generado y título `(Copia)`.
    - `Ctrl+D`: Duplica directamente la tarjeta seleccionada.
    - `Delete` / `Del`: Elimina la tarjeta activa guardando snapshot.
- **Unificación y Limpieza Ergonómica:**
  - Se eliminó la antigua `.sub-toolbar` intermedia en la Vista de Informe, centralizando todos los controles en la Cinta de Opciones superior accesible a lo largo de toda la aplicación.
- **Documentación Técnica:**
  - Creación de **Página 8: Cinta de Opciones Contextual (Ribbon Menu), Despachador de Comandos y Portapapeles** en la carpeta `Wiki/`.
  - Integración de la Página 8 en el modal interactivo de la Wiki dentro de la aplicación.
  - Actualización de `Wiki/Índice de la Wiki.md` y `ROADMAP.md` (Fase 5 completada).

---

## [0.4.1] - 2026-10-24

### 🎨 Refactorizado & 🐛 Corregido (Fase 4: Ergonomía Gestalt, Desacoplamiento de Modales y Paginación DuckDB)
- **Quick Access Toolbar y Limpieza de TitleBar:**
  - El botón **Abrir** (`FolderOpen`) ahora forma parte de la barra de acceso rápido superior izquierda junto a **Guardar**, **Deshacer** y **Rehacer**.
  - Se eliminaron los botones redundantes con texto `[ Abrir ]` y `[ Guardar ]` de la barra superior derecha.
  - Se unificó toda la iconografía del shell a trazo fino uniforme (`strokeWidth={1.5}` / outline en Lucide).
- **Reorganización de la Sub-Barra de Herramientas bajo Principios de Gestalt:**
  - **Bloque Izquierdo (Datos y Modelado):** `[ + Agregar Gráfico ]`, `[ Modelador Relacional (JOIN) ]` y `[ Refrescar Consultas ]`.
  - **Bloque Derecho (Configuración, Soporte y Salida):** `[ Selector de Tema ]`, `[ Wiki ]`, `[ Guía Exportar CSV ]` y `[ Exportar .HTML ]`.
  - Corrección tipográfica en el botón `+ Agregar Gráfico` (eliminada la suma duplicada `+ +`).
  - Eliminación de la etiqueta de texto redundante `"Tema Gráficos: [Tema]"` en la sub-barra.
- **Atenuación Visual del Botón de Exportación:**
  - Se rediseñó el botón `Exportar .HTML`: se reemplazó el verde brillante saturado por un estilo secundario sobrio (fondo `#1c2b20`, borde `#2e7d32` y texto verde suave `#81c784`) para no competir visualmente con los gráficos en pantalla.
- **Desacoplamiento de Enrutamiento de Modales (Bug Fix):**
  - El botón **Guía Exportar CSV** ahora dispara un diálogo modal dedicado e independiente (`showCsvGuideModal`), resolviendo el bug de colisión que forzaba a la Wiki general a quedar estancada en la página 5.
- **Paginación e Introspección en Vista de Datos (Data View):**
  - Consultas asíncronas paralelas con DuckDB: `SELECT COUNT(*) AS total` para conocer el volumen total de filas reales y `SELECT * FROM "tabla" LIMIT 100 OFFSET ?` para navegación de alta densidad con latencia <16ms.
  - Paginador interactivo con botones `[ ◀ Anterior ]`, `[ Siguiente ▶ ]`, contador de página y resumen de registros mostrados.
- **Ampliación de Documentación y Wiki:**
  - Creación de **Página 7: Ergonomía de UI, Principios de Gestalt y Arquitectura de Diálogos** en la carpeta `Wiki/`.
  - Incorporación de las Páginas 6 y 7 en el lector interactivo de la Wiki del Studio.
  - Actualización de `Wiki/Índice de la Wiki.md` y `ROADMAP.md` (Fase 4 marcada como completada).

---

## [0.4.0] - 2026-10-24

### 🚀 Añadido (Fase 3: Shell Desktop y Barra Lateral de 3 Vistas)
- **Shell Desktop Power BI y Left View Switcher (3 Modos):**
  - **Riel lateral de navegación (48px):** selector visual directo estilo Power BI Desktop entre 3 vistas de trabajo:
    - 📊 **Vista de Informe (Report View):** Lienzo analítico con tarjetas de visualización interactivas (ECharts), panel de propiedades, ribbon de herramientas y filtros reactivos.
    - 📋 **Vista de Datos (Data View - Solo Lectura):** Explorador tabular de alta densidad con selector lateral de esquemas de tablas DuckDB y previsualización de las primeras 100 filas con tipos de dato explícitos (`[VARCHAR]`, `[BIGINT]`, `[DOUBLE]`). Incluye botón de recarga rápida y Hot Swap directo por tabla.
    - 🕸️ **Vista de Modelo (Model View):** Lienzo interactivo de diseño relacional en esquema de estrella con tarjetas de entidades (nodos Hechos vs. Dimensiones), detección visual de llaves vinculadas y administración de vistas virtuales (`CREATE/DROP VIEW`).
  - **TitleBar Superior con Quick Access Toolbar:**
    - Botones compactos de acceso rápido: *Guardar Proyecto* (`Ctrl+S`), *Deshacer* (`Ctrl+Z`) y *Rehacer* (`Ctrl+Y`).
    - Pastilla central con nombre de proyecto activo editable (`.analyticraft`).
    - Glifos mock de control de ventana (`─`, `□`, `✕`).
- **Motor de Atajos Globales de Teclado:**
  - Listener nativo global para `Ctrl+1` / `Cmd+1` (Informe), `Ctrl+2` / `Cmd+2` (Datos), `Ctrl+3` / `Cmd+3` (Modelo) y `Ctrl+S` (Guardar).
  - Pila de historial en memoria para `Ctrl+Z` (Deshacer) y `Ctrl+Y` (Rehacer) con notificaciones toast en pantalla.
  - Guarda anti-colisión para no interceptar escritura cuando el foco se encuentra en campos de texto, inputs o selects.
- **Ciclo de Vida Condicional y Optimización de CPU:**
  - Desmontaje y destrucción de instancias de Apache ECharts al alternar a la Vista de Datos o de Modelo, liberando ciclos de procesador y memoria de GPU/Canvas en segundo plano.
- **Banner Pedagógico Permanente de Datos:**
  - Aviso contextual en la Vista de Datos reforzando la regla arquitectónica de **Solo Lectura** (el CSV físico como fuente única de verdad) y guiando al usuario al uso de *Hot Swap CSV (↻)* para modificaciones.
- **Ampliación de Documentación y Wiki:**
  - Creación de `Wiki/Página 6: Arquitectura de UI y Contratos de Backend (Guía para Desarrolladores y LLMs)` con diagramas de flujo Mermaid, contratos de DuckDB y registro de ingeniería backend (Sección 7).
  - Renombrado de `Wiki/README.md` a `Wiki/Índice de la Wiki.md`.
  - Reestructuración completa de `ROADMAP.md` en 18 fases simétricas (UI + Backend) y actualización de `CONTRIBUTING.md`.

---

## [0.3.0] - 2026-10-24

### ✨ Añadido
- **Catálogo ampliado de temas para tarjetas (17 en total, solo afectan a las tarjetas, no a la UI del Studio):**
  - **8 nuevos perfiles multicolor** (cada categoría recibe su propio color): *Atardecer*, *Arrecife*, *Aurora Boreal*, *Pastel*, *Retro 80s*, *Otoño*, *Cyberpunk* y *Tropical*.
  - **4 temas inspirados en iWork/Numbers:** *Estándar* (`#007AFF`, `#34C759`, `#FF9500`, `#FF2D55`, `#AF52DE`, `#5AC8FA`), *Mono/Editorial*, *Pastel/Soft* y *Tierra/Cálido*, con barras de esquinas redondeadas y fondo oscuro de sistema.
  - **Tema "Anillos de Actividad (Fitness)":** fondo negro puro y gradientes neón para recordar y diferenciar anillos — Move `#FA114F→#FF5E3A`, Exercise `#9EE600→#00E887`, Stand `#00E5FF→#00A3FF`.
  - El menú de temas ahora está **agrupado por familias** y muestra una **muestra de color** de cada paleta.
- **Nuevo gráfico "Anillos" (Activity Rings):** anillos concéntricos con extremos redondeados y pista de fondo (máx. 4 categorías; la mayor = 100 %). Incluye leyenda con color y valor.
- **Lector Interactivo de la Wiki en el Studio:** Botón **"Wiki"** y botón **"Guía Exportar CSV"** accesibles directamente desde la barra de herramientas para culturizar a usuarios y nuevos colaboradores sin salir de la app.
- **Reorganización y Expansión de la Wiki (`/Wiki`):**
  - **Página 5 (Nueva):** *Filosofía de Datos (Por qué CSV y Guía de Exportación)* detallando por qué se prohíbe XLSX/JSON/XML en el motor y cómo exportar desde Excel, Google Sheets, Numbers, JSON y SQL.
  - Limpieza de las Páginas 1 a 4 con redacción actualizada a la versión actual y creación de `Wiki/Índice de la Wiki.md` como índice general.
  - Simplificación y estilización del `README.md` raíz del proyecto.
- **Registro central de temas** (`src/lib/themes.ts`) y **constructor de opciones compartido** (`src/lib/chartOptions.ts`): el Studio y el `.html` exportado renderizan exactamente igual.

### 🔄 Cambiado
- El **reporte `.html` exportado ahora respeta el tema activo** (antes siempre salía con el estilo oscuro por defecto) y soporta el gráfico de anillos.
- Documentación (`README.md`, `ROADMAP.md`, `CONTRIBUTING.md`) actualizada con la estrategia para "clonar" estilos de Apple sin usar herramientas exclusivas de la plataforma y con el plan de las Fases 2 a 6.

### 🔒 Seguridad
- El exportador HTML ahora **escapa** títulos, descripciones y valores de datos y serializa el JSON embebido de forma segura (evita inyección de HTML/`</script>` a partir de contenido de un CSV o de textos del usuario).

---

## [0.2.0] - 2026-10-24

### ✨ Añadido (Usabilidad, Modelado y Personalización)
- **Modelador Relacional en Modal con Guía Visual:**
  - Asistente explicativo para vincular tablas CSV mediante llaves foráneas lógicas (JOINs en memoria con DuckDB).
  - Previsualización del tipo de relación (Hechos vs. Dimensiones).
  - Botón de eliminación directa (`🗑️`) para cualquier vista relacional creada si no aporta valor o se desea descartar.
- **Personalización de Tarjetas (Cards):**
  - Control para mostrar u ocultar la leyenda del gráfico.
  - Campo de pie de nota / descripción explicativa que describe exactamente qué cuentan o miden los datos mostrados.
- **Sistema Global de Temas para Gráficos:**
  - Selector unificado en la barra de herramientas que aplica paletas y tipografías a todas las tarjetas del lienzo al unísono:
    - **Corporativo:** Azules ejecutivos y grises pulidos.
    - **Geek / Terminal:** Fondo negro azabache, verdes fósforo y blancos de alto contraste.
    - **Colorido (Vibrant):** Paleta multicolor energética.
    - **All-Blue:** Gama monocromática azul profesional.
    - **All-Pink:** Gama moderna en magentas y rosas fucsia.
- **Documentación:**
  - Creación del presente archivo `CHANGELOG.md`.
  - Nueva sección detallada en `README.md` explicando cómo funciona el Modelador Relacional y cómo interactúan las tablas vinculadas.

---

## [0.1.5] - 2026-10-24

### 🎨 Mejorado
- **Rediseño UI Estilo Adobe / GIMP:**
  - Transición a paleta en tonos grises oscuros industriales (`#1e1e1e`, `#252526`, `#2d2d2d`).
  - Textos en blanco puro (`#ffffff`) y pesos semibold/bold para máxima legibilidad independientemente del modo oscuro del navegador.
- **Sub-Menus y Banners Informativos:**
  - Cintas de herramientas secundarias y división de pestañas (*Campos y Datos* vs. *Tipo de Visualización*).
  - Explicación guiada en cada campo (Dimensión, Métrica, Agregación).
- **Hot Swap de Datos:** Reemplazo atómico de CSV en caliente sin romper configuraciones existentes.
- **Filtros Globales Dinámicos:** Barra multivariable con cláusulas `WHERE` reactivas en DuckDB.
- **Persistencia de Proyectos:** Guardado y apertura en formato `.analyticraft`.

---

## [0.1.0] - 2026-10-24

### 🚀 Lanzamiento Inicial (MVP)
- Base de escritorio nativa con **Tauri v2 + Rust**.
- Frontend reactivo con **React 19 + TypeScript + Vite**.
- Motor analítico vectorizado **DuckDB en memoria**.
- Visualizaciones interactivas con **Apache ECharts** (Barras, Líneas, Áreas, Donuts, KPIs y Tablas).
- Exportador de reportes a un archivo único `.html` autocontenido para compartir sin dependencias.
