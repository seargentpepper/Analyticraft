# 📚 Índice de la Wiki de Analyticraft

Bienvenido a la documentación oficial y base de conocimiento de **Analyticraft**. Esta wiki está diseñada tanto para educar a los nuevos usuarios en buenas prácticas de analítica ágil como para guiar a desarrolladores que deseen contribuir o hacer forks del proyecto.

---

### 📑 Documentos Disponibles:

1. **[Página 1: Visión y Filosofía](./Página%201%20Home%20(Visión%20y%20Filosofía)%20·%20seargentpepperAnalyticraft%20Wiki.md)**
   - El problema del software corporativo de BI en las PyMEs.
   - Principios rectores: *Local-First*, Cero Fricción al Compartir y Eficiencia Extrema.

2. **[Página 2: Arquitectura y Stack Tecnológico](./Página%202%20Arquitectura%20y%20Stack%20Tecnológico%20·%20seargentpepperAnalyticraft%20Wiki.md)**
   - Diagrama de capas del sistema.
   - Justificación técnica de Tauri (Rust), DuckDB vectorizado en memoria, React 19 y Apache ECharts.

3. **[Página 3: Flujo de Datos y Workflows Técnicos](./Página%203%20Flujo%20de%20Datos%20y%20Workflows%20Técnicos%20·%20seargentpepperAnalyticraft%20Wiki.md)**
   - Pipeline de ingesta y principio de inmutabilidad en disco.
   - Mecanismo de Hot Swap (reemplazo en caliente de datos).
   - Modelado de Esquema de Estrella mediante vistas relacionales virtuales (`CREATE VIEW`) y descarte seguro.

4. **[Página 4: UX y Ecosistema (Studio vs. Viewer)](./Página%204%20UX%20y%20Ecosistema%20(Studio%20vs.%20Viewer)%20·%20seargentpepperAnalyticraft%20Wiki.md)**
   - Entorno de trabajo de Analyticraft Studio (estética workbench Photoshop/GIMP y tipografía de alto contraste).
   - Sistema de 3 paneles, sub-pestañas de inspector y catálogo de temas para tarjetas.
   - El Viewer: generación y ventajas del archivo `.html` autocontenido.

5. **[Página 5: Filosofía de Datos (Por qué CSV y Guía de Exportación)](./Página%205%20Filosofía%20de%20Datos%20(Por%20qué%20CSV%20y%20Guía%20de%20Exportación).md)**
   - Razones técnicas de por qué se rechaza la ingesta directa de XLSX, JSON y XML.
   - Guía paso a paso para exportar a CSV limpio desde Excel, Google Sheets, Apple Numbers, JSON y bases de datos relacionales (PostgreSQL/MySQL).

6. **[Página 6: Arquitectura de UI y Contratos de Backend (Guía para Desarrolladores y LLMs)](./Página%206%20Arquitectura%20de%20UI%20y%20Contratos%20de%20Backend%20(Guía%20para%20Desarrolladores%20y%20LLMs).md)**
   - Diagrama de flujo de ejecución global (Mermaid) entre la interfaz Power BI y DuckDB.
   - Contratos técnicos de la Vista de Datos (Data View Solo Lectura y pipeline Hot Swap).
   - Contratos y ciclo de vida de la Vista de Modelo (Model View y `CREATE/DROP VIEW`).
   - Contratos de Ribbon, Drag & Drop y Reglas de Oro inmutables para LLMs.
   - Registro de ingeniería backend para el Shell Desktop, navegación en 3 vistas y ciclo de vida de CPU.
   - Bitácora de refactorización UI/UX, principios de Gestalt y desacoplamiento de enrutamiento de modales.

7. **[Página 7: Ergonomía de UI, Principios de Gestalt y Arquitectura de Diálogos](./Página%207%20Ergonomía%20de%20UI,%20Principios%20de%20Gestalt%20y%20Arquitectura%20de%20Diálogos.md)**
   - Aplicación de principios de proximidad y jerarquía visual de Gestalt en el shell.
   - Atenuación visual del botón de exportación y unificación iconográfica.
   - Desacoplamiento de estados de modales (Guía CSV vs. Wiki general) para resolver conflictos de navegación.
   - Introspección `COUNT(*)` y paginación con `LIMIT / OFFSET` en la Vista de Datos.

8. **[Página 8: Cinta de Opciones Contextual (Ribbon), Despachador de Comandos y Portapapeles](./Página%208%20Cinta%20de%20Opciones%20Contextual%20(Ribbon),%20Despachador%20de%20Comandos%20y%20Portapapeles.md)**
   - Anatomía de la cinta plegable de dos pisos (`Ctrl+F1`): pestañas `Archivo`, `Inicio`, `Insertar`, `Modelado`, `Ver` y la contextual `Formato`.
   - Despachador centralizado `ActionDispatcher` bajo el patrón Command con sincronización inmutable de snapshots (`Ctrl+Z` / `Ctrl+Y`).
   - Motor de portapapeles en memoria (`clipboard: ChartConfig | null`) y atajos nativos (`Ctrl+C`, `Ctrl+V`, `Ctrl+D`, `Delete`).
   - Edición rápida de tipo de gráfico, leyenda, descripción y título sin abandonar la cinta.

9. **[Página 9: Guía Anti-Duplicidad y Principio de Responsabilidad Única en UI (Directiva para Desarrolladores y LLMs)](./Página%209%20Guía%20Anti-Duplicidad%20y%20Principio%20de%20Responsabilidad%20Única%20en%20UI%20(Directiva%20para%20Desarrolladores%20y%20LLMs).md)**
   - El anti-patrón del "Relleno Inconsciente" y la ilusión destructiva de complejidad.
   - Principio de Responsabilidad Única en UI (Single Source of Interaction - SSI).
   - La "Prueba del Espejo de Comandos" (Command Mirroring Test) para validar adiciones de botones.
   - Matriz oficial de ubicaciones canónicas por acción del sistema.
   - Estudio de caso: el refactor de deduplicación y estabilidad v0.5.1 (10 puntos corregidos).

10. **[Página 10: Paneles Laterales de Visualizaciones y Campos (Drag & Drop y Constructor SQL Reactivo)](./Página%2010%20Paneles%20Laterales%20de%20Visualizaciones%20y%20Campos%20(Drag%20&%20Drop%20y%20Constructor%20SQL%20Reactivo).md)**
    - Paneles laterales acoplables estilo Power BI Desktop (`Visualizaciones` y `Campos / FIELDS`).
    - API de arrastre tipada (`DraggedFieldPayload`) y soporte Drag & Drop en drop-zones y tarjetas.
    - Subpestaña `Build`: Drop-zones interactivas para Eje X (Dimensión), Eje Y (Métrica + agregaciones) y Filtro local.
    - Subpestaña `Format`: Edición de títulos, switches On/Off para leyendas superiores y notas al pie descriptivas.
    - Constructor SQL reactivo en DuckDB vectorizado (<16ms por consulta analítica).
    - Inversión de ejes `X ⇄ Y`, visual nativo `Segmentador (Slicer)` y múltiples filtros locales con introspección `SELECT DISTINCT`.

11. **[Página 11: Vista de Modelo Relacional (Grafo de Tablas, Drag & Drop y Vistas Virtuales)](./Página%2011%20Vista%20de%20Modelo%20Relacional%20(Grafo%20de%20Tablas,%20Drag%20&%20Drop%20y%20Vistas%20Virtuales).md)**
    - Diseñador relacional con lienzo infinito de grafo, zoom interactivo y auto-alineaciones (Estrella zero-overlap con órbitas dinámicas y Cascada jerárquica).
    - Tarjetas de tabla con scroll vertical interno (`max-height: 250px`) y conmutador individual de colapso a cabecera (36px) con reanclaje automático de conectores SVG.
    - Conmutador global "Expandir / Colapsar Todo" en la barra de herramientas del modelo y en el panel de Campos.
    - Modal Pedagógico "Explicar Modelo" para Newbies y analistas migrando desde Power BI: Regla de Oro (Dimensiones vs Hechos), dirección de filtros `1 ──▶ *`, traductor semántico y diagnóstico de tablas huérfanas.
    - Diferenciación cromática heurística entre Tablas de Hechos (`#007acc`) y Tablas de Dimensiones (`#cca700`).
    - Creación de relaciones arrastrando una columna directamente hacia otra tabla con resaltado de compatibilidad.
    - Conectores visuales SVG con curvas cúbicas de Bézier, símbolos de cardinalidad `1` y `*`, flecha direccional y tooltips en lenguaje natural.
    - Asistente Newbie-Friendly: Auto-detección heurística con aura luminosa (`.column-detected-aura`), banner de conexión en masa y modal de edición de JOIN con inversión de dirección (`⇄`).
    - Generación de vistas virtuales en DuckDB (`CREATE VIEW`) con resolución automática de colisión de nombres y descarte seguro (`DROP VIEW`).

12. **[Página 12: Guía de Diagnóstico Rápido y Resolución Ágil de Errores (Troubleshooting y Depuración para Desarrolladores y LLMs)](./Página%2012%20Guía%20de%20Diagnóstico%20Rápido%20y%20Resolución%20Ágil%20de%20Errores%20(Troubleshooting%20y%20Depuración%20para%20Desarrolladores%20y%20LLMs).md)**
    - Diagnóstico de causa raíz para errores de catálogo en DuckDB (`Catalog Error: Table does not exist! Did you mean "sqlite_temp_master"?`).
    - Persistencia de singleton de DuckDB en `window` para mitigar desacoplamiento de estado por Vite HMR.
    - Reglas de oro para pestañas contextuales en Ribbon y aislamiento de vistas (`handleSwitchView`).
    - Solución a errores de Binder y deduplicación de columnas en uniones virtuales.
    - Protocolo de diagnóstico ágil en 5 pasos y matriz de errores vs. archivo canónico responsable.



