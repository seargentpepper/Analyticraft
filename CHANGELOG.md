# Historial de Versiones - Analyticraft

Registro unificado de la evolución de **Analyticraft**, desde su lanzamiento inicial hasta la versión estable actual. Combina el detalle de versiones ([Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y [Semantic Versioning](https://semver.org/spec/v2.0.0.html)) con una lectura clara orientada a personas, equipos de negocio y desarrolladores.

- **Versión Actual:** `v0.8.4` (Estable)
- **Próximas Versiones Planificadas (`v0.9.0` → `v8.9.0`):** Consulta **[ROADMAP.md](./ROADMAP.md)**.

---

## Índice de Versiones

- **[0.8.4]** — Lienzo Libre Persistente, Aislamiento de Relaciones y Exactitud Analítica *(2026-10-26)*
- **[0.8.3]** — Suite de Pruebas Automatizadas (Vitest) y Gobernanza de Código *(2026-10-25)*
- **[0.8.2]** — Ergonomía de Modelos Complejos, Guardado Profesional y Síntesis para LLMs *(2026-10-25)*
- **[0.8.1]** — Estabilidad de Sesión DuckDB, Visibilidad Contextual y Diagnóstico Ágil *(2026-10-24)*
- **[0.8.0]** — Asistente Guiado para Principiantes en el Modelador Relacional *(2026-10-24)*
- **[0.7.0]** — Vista de Modelo Relacional (Grafo de Tablas y Vistas Virtuales) *(2026-10-24)*
- **[0.6.1]** — Segmentadores Interactivos (Slicers), Inversión de Ejes y Multifiltros *(2026-10-24)*
- **[0.6.0]** — Paneles Laterales Acoplables (Visualizaciones y Campos) con Drag & Drop *(2026-10-24)*
- **[0.5.1]** — Sprint de Estabilidad, Deduplicación de Interfaz y Principio de Responsabilidad Única *(2026-10-24)*
- **[0.5.0]** — Cinta de Opciones Contextual (Ribbon), Portapapeles y Deshacer/Rehacer *(2026-10-24)*
- **[0.4.1]** — Paginación en Vista de Datos (<16ms) y Refinamiento Gestalt *(2026-10-24)*
- **[0.4.0]** — Shell Desktop de 3 Vistas (Informe, Datos Solo Lectura y Modelo) *(2026-10-24)*
- **[0.3.0]** — Anillos de Actividad (Apple Fitness), 17 Temas, Wiki Integrada y Seguridad HTML *(2026-10-24)*
- **[0.2.0]** — Modelador Relacional Inicial, Personalización de Tarjetas y Temas Globales *(2026-10-24)*
- **[0.1.5]** — Rediseño Industrial Oscuro, Hot Swap de Datos y Filtros Globales *(2026-10-24)*
- **[0.1.0]** — Lanzamiento Inicial (MVP Local-First) *(2026-10-24)*

---

## [0.8.4] - 2026-10-26

> **En pocas palabras:** Los gráficos dejan de estar encerrados en una cuadrícula rígida y ahora flotan libremente sobre el lienzo guardando su posición y tamaño; además, se corrigen errores críticos de ordenamiento temporal y comparación numérica en los filtros.

### Experiencia e Interfaz
- **Lienzo libre con coordenadas persistentes (`FloatingCard`, `canvasLayout`):** Las tarjetas pueden arrastrarse desde su cabecera (con ajuste magnético a cuadrícula de 10px) y redimensionarse libremente; sus coordenadas `{ x, y, w, h }` se guardan en el proyecto y los tableros anteriores se migran automáticamente sin solapamientos.
- **Aislamiento y ventana flotante de relaciones (JOINs):** Las vistas virtuales dejaron de mezclarse con las tablas base del panel Campos (eliminando duplicados y entradas vacías). Ahora se gestionan desde un botón dedicado al pie del panel que abre una ventana flotante responsive con cierre rápido mediante `Escape`.
- **Exploración continua en el panel Campos:** Se eliminaron los recortes y truncamientos al expandir múltiples tablas simultáneamente.
- **Barra de herramientas depurada en Vista de Modelo:** Controles estandarizados a 28px de altura y organizados en tres bloques claros (*Zoom*, *Disposición* y *Asistentes*), trasladando "Nueva Relación" a su ubicación canónica en la pestaña **Modelado** de la cinta superior.
- **Protección de sesión y reactividad de cambios:** Cualquier movimiento de tarjeta, cambio de tema, filtro o asignación de campos activa inmediatamente el indicador de cambios sin guardar (`•`), y al abrir otro proyecto con cambios pendientes se solicita confirmación antes de reiniciar el estado visual.
- **Buscador en vivo del Segmentador:** El filtro del segmentador ahora consulta directamente en DuckDB sin el límite previo de 50 registros iniciales.

### Motor de Datos y Estabilidad
- **Filtros numéricos exactos (`queryBuilder`):** Se eliminó el fallo donde comparaciones como `'10' < '2'` se evaluaban como texto; los operadores `>` y `<` ahora convierten y comparan numéricamente con `TRY_CAST(... AS DOUBLE)`.
- **Orden cronológico en series de tiempo:** Los gráficos de líneas y áreas ordenan automáticamente por su dimensión temporal de forma ascendente, reservando el ordenamiento descendente por métrica para categorías.
- **Enteros grandes sin pérdida de precisión:** Soporte seguro para valores `bigint` superiores a `Number.MAX_SAFE_INTEGER`.
- **Hot Swap y relaciones atómicas:** La recarga de CSVs y reconstrucción de vistas pasan por tablas temporales de staging antes de reemplazar los datos activos, evitando estados corruptos ante fallos.
- **Exportación HTML confiable y offline:** Espera activa a que terminen todas las consultas pendientes antes de compilar el reporte, usa el título real del proyecto y embebe recursos sin depender de CDNs externos.
- **Concurrencia determinista en Vista de Datos:** Cancelación de respuestas asíncronas desfasadas y paginación con ordenamiento determinista.

### Calidad y Seguridad
- **30 pruebas unitarias automatizadas (Vitest):** Cobertura al 100% en layout de lienzo, constructor SQL, almacenamiento de proyectos, temas, opciones de ECharts y exportación HTML.
- **Higiene y seguridad:** Desinstalación definitiva de `papaparse` y configuración estricta de *Content Security Policy* (CSP) en Tauri.

---

## [0.8.3] - 2026-10-25

> **En pocas palabras:** Primera red formal de seguridad automática del proyecto con pruebas unitarias en Vitest, licencia MIT oficial y documentación de ingeniería estandarizada.

### Calidad, Seguridad y Documentación
- **Suite inicial de pruebas unitarias (Vitest 5):** 13 pruebas iniciales verificando la integridad del catálogo de temas visuales, el generador de opciones de ECharts (gradientes, cota de 4 anillos y formato `es-MX`) y la prevención de inyecciones XSS en el exportador HTML (`escapeHtml` y `safeJson`).
- **Licencia y estándares de contribución:** Creación del archivo `LICENSE` (MIT), reescritura técnica de `CONTRIBUTING.md` (5 Principios Fundamentales y control de *Blast Radius*) y modernización de `README.md`.

---

## [0.8.2] - 2026-10-25

> **En pocas palabras:** Guardado y apertura de proyectos al nivel de un software de escritorio real, arranque completamente limpio sin datos de muestra forzados y herramientas para manejar modelos complejos con decenas de tablas.

### Experiencia e Interfaz
- **Apertura y guardado sin fricciones (`OpenProjectModal`, `SaveProjectModal`):** Se resolvió el fallo donde el Explorador de Windows ocultaba archivos `.analyticraft` al usar el selector de carpetas, incorporando el selector nativo de archivos (`Ctrl+O`) junto con la opción guiada para proyectos empaquetados (con subcarpetas `/data/`, `/backups/` y `/temp/`).
- **Memoria de carpeta y guardado directo (`Ctrl+S`):** La barra de título muestra la carpeta vinculada y permite sobrescribir in-place generando respaldos seriados automáticos en `/backups/`.
- **Arranque limpio garantizado:** Eliminación total de datos de muestra precargados; la app abre en blanco (`Sin_Titulo.analyticraft`) lista para importar datos reales del negocio, y "Nuevo" purga por completo la sesión previa.
- **Ergonomía para modelos relacionales grandes (`ModelView`):**
  - Algoritmo **"Organizar Vista"** en cuadrícula multinivel anti-solapamiento separando dimensiones y hechos.
  - **Modo Compacto** automático (en modelos con 6 o más tablas) mostrando solo columnas vinculadas, con scroll vertical interno, colapso individual por tarjeta y botón global **Expandir / Colapsar Todo**.
  - **Enfoque y atenuación (*Focus & Dimming*):** Al señalar una tabla, las relaciones ajenas se atenúan al 8% y las conectadas se iluminan en cian; las etiquetas `1 : *` se ocultan automáticamente en modelos muy densos.
  - **Esquema en estrella mejorado:** Órbitas concéntricas con relajación elástica para evitar choques entre tablas.
- **Asistente pedagógico "Explicar Modelo":** Modal determinista (sin costo de IA externa) que explica qué tablas son Dimensiones vs. Hechos, cómo fluyen los filtros (`1 ──▶ *`) y qué tablas están huérfanas.
- **Corrección visual en Vista de Datos:** Evitado que nombres largos de tablas aplastaran el icono de base de datos en la lista lateral.

### Motor de Datos y Exportación
- **Reconstrucción automática de relaciones:** Al reabrir cualquier proyecto `.analyticraft`, se regeneran todas sus vistas virtuales en DuckDB antes de dibujar los gráficos, usando nombres unívocos para evitar colisiones.
- **Exportación de Síntesis para LLMs (`modelSynthesis.ts`):** Generación de un archivo Markdown (`.md`) + copiado al portapapeles con el resumen del modelo, relaciones, gráficos y un prompt pre-redactado para auditar el proyecto en ChatGPT, Claude o Gemini.

---

## [0.8.1] - 2026-10-24

> **En pocas palabras:** Mayor estabilidad en desarrollo y uso diario: DuckDB sobrevive a recargas en caliente, los errores de tabla faltante muestran guías amigables y la cinta superior oculta pestañas fuera de lugar.

### Experiencia e Interfaz
- **Pestaña contextual `Formato` aislada:** Solo aparece en la Vista de Informe cuando hay una tarjeta seleccionada, evitando mostrarse por error en Datos o Modelo.
- **Cambio de vista consistente:** Alternar entre Informe, Datos y Modelo (`Ctrl+1/2/3` o barra lateral) sincroniza automáticamente la pestaña activa de la cinta superior.
- **Nodos más legibles en Modelo:** Ancho ampliado a 250px con tooltips completos para evitar recortes en nombres largos y corrección de un símbolo `+` duplicado en el botón de relación.

### Motor de Datos y Diagnóstico
- **Persistencia del motor en `window`:** Evita que React Fast Refresh destruya el WebWorker de DuckDB o borre las tablas en memoria durante desarrollo.
- **Errores amigables de catálogo:** Si falta una tabla referenciada por un gráfico, se muestra un aviso guiado para reasignar o reimportar la fuente en lugar de un error técnico crudo.
- **Documentación de diagnóstico:** Publicada la Página 12 de la Wiki con la matriz oficial de resolución de errores DuckDB.

---

## [0.8.0] - 2026-10-24

> **En pocas palabras:** Conectar tablas deja de requerir conocimientos técnicos de SQL gracias a la detección automática de relaciones, explicaciones en lenguaje natural y edición visual de uniones.

### Experiencia e Interfaz
- **Auto-detección heurística de relaciones:** Identifica automáticamente llaves probables (`*_id`, `*_key`, `cod_*`), valida compatibilidad de tipos en DuckDB, ilumina las columnas candidatas y permite conectarlas una a una o todas en un clic.
- **Auto-alineación en Cascada:** Reordena dimensiones en la fila superior y tablas de hechos en la inferior con un solo clic.
- **Explicaciones en lenguaje natural:** Tooltips claros en los extremos `1`, `*` y en la flecha `1 : * ──▶`, junto con un resumen legible de cómo fluye el filtro entre ambas tablas.
- **Modal de edición de JOIN (`EditJoinModal`):** Permite alternar entre `LEFT JOIN` e `INNER JOIN`, cambiar columnas e invertir la dirección de la relación con un clic.

### Motor de Datos
- **Regeneración atómica en DuckDB:** Al editar una relación, la vista previa se descarta y recrea en menos de 10ms.

---

## [0.7.0] - 2026-10-24

> **En pocas palabras:** Nace la Vista de Modelo Relacional: un lienzo interactivo donde las tablas se vinculan arrastrando columnas de una tarjeta a otra.

### Experiencia e Interfaz
- **Lienzo de grafo en estrella (`ModelView`):** Área bidimensional con cuadrícula, zoom (50% a 160%), arrastre libre de tablas y botón **Auto-Alinear** en estrella (hechos al centro, dimensiones alrededor).
- **Diferenciación visual Hechos vs. Dimensiones:** Cabecera azul/cian (`HECHOS`) para tablas transaccionales y dorada/ámbar (`DIMENSIÓN`) para catálogos.
- **Conexiones visuales Drag & Drop:** Arrastrar una columna sobre otra traza una curva Bézier SVG con badges `1`, `*` e inspector flotante para eliminar la relación.

### Motor de Datos
- **Vistas virtuales deduplicadas:** Antes de crear una vista `CREATE VIEW`, DuckDB inspecciona columnas duplicadas para evitar errores de colisión, sin modificar jamás los archivos CSV originales.

---

## [0.6.1] - 2026-10-24

> **En pocas palabras:** Los tableros cobran interactividad real con el Segmentador de datos (Slicer), inversión rápida de ejes y múltiples filtros por tarjeta.

### Experiencia e Interfaz
- **Visual Segmentador de Datos (Slicer):** Tarjeta interactiva con buscador, conteo de registros y botón de limpieza que filtra en tiempo real los demás gráficos del tablero.
- **Inversión rápida de ejes (`X ⇄ Y`):** Alterna dimensión y métrica con un clic, ajustando automáticamente la agregación (`COUNT` para texto, `SUM` para números).
- **Múltiples filtros locales por tarjeta:** Cada gráfico admite varios filtros independientes activables/desactivables con valores reales consultados directamente desde DuckDB (`SELECT DISTINCT`).

---

## [0.6.0] - 2026-10-24

> **En pocas palabras:** Analyticraft adopta la ergonomía de paneles acoplables a la derecha estilo Power BI Desktop, permitiendo arrastrar columnas directamente sobre el lienzo o las tarjetas.

### Experiencia e Interfaz
- **Panel lateral "Campos" (FIELDS):** Tablas en acordeón con conteo de filas, clasificación visual de tipos (`#` numérico, `Abc` texto, fecha y booleano), buscador instantáneo y botón de *Hot Swap* (`↻`).
- **Panel lateral "Visualizaciones":** Galería de gráficos y subpestañas `Construir` (zonas de arrastre para Eje X, Eje Y, agregaciones y filtros) y `Formato` (título, leyenda y notas).
- **Riel derecho colapsable:** Botones verticales en el borde derecho para mostrar u ocultar cada panel de forma independiente y maximizar el lienzo.

### Motor de Datos
- **Arrastre tipado y constructor SQL reactivo:** Soltar un campo en el lienzo vacío crea una tarjeta nueva automáticamente; soltarlo sobre una tarjeta existente la actualiza al vuelo mediante consultas vectorizadas en DuckDB (<16ms).

---

## [0.5.1] - 2026-10-24

> **En pocas palabras:** Limpieza de botones duplicados en la interfaz para que cada acción viva en un único lugar lógico, además de mensajes humanos cuando falta un campo numérico.

### Experiencia e Interfaz
- **Principio de Responsabilidad Única (SSI):** Eliminados controles de ventana simulados, botones redundantes en la barra superior y grupos repetidos entre las pestañas del Ribbon y el riel lateral.
- **Más espacio vertical útil:** La barra de filtros globales se oculta automáticamente cuando no hay filtros activos, liberando 40px extra para los gráficos.
- **Mensajes pedagógicos ante errores SQL:** Si un usuario intenta sumar una columna de texto, la tarjeta explica amablemente cómo reasignar una columna numérica en lugar de mostrar un error técnico de DuckDB.
- **Corrección de menús y pies de tarjeta:** Solucionado el recorte del menú de temas (`z-index`) y sincronizada la visibilidad de notas al pie.

### Documentación
- Publicada la Página 9 de la Wiki con las directrices anti-duplicidad para desarrolladores y LLMs.

---

## [0.5.0] - 2026-10-24

> **En pocas palabras:** Incorporación de la Cinta de Opciones (Ribbon) plegable estilo Power BI, portapapeles completo para copiar/duplicar gráficos y sistema de Deshacer/Rehacer.

### Experiencia e Interfaz
- **Cinta Ribbon plegable (`Ctrl+F1`):** 6 pestañas organizadas (`Archivo`, `Inicio`, `Insertar`, `Modelado`, `Ver` y la pestaña contextual `Formato` que se activa al seleccionar una tarjeta).
- **Atajos de portapapeles:** Copiar (`Ctrl+C`), pegar (`Ctrl+V`), duplicar (`Ctrl+D`) y eliminar (`Delete`) tarjetas de visualización.
- **Historial Deshacer / Rehacer:** Soporte nativo para `Ctrl+Z` y `Ctrl+Y` mediante capturas inmutables de estado antes de cada cambio.

### Arquitectura
- **Despachador centralizado (`ActionDispatcher`):** Todas las acciones de la cinta se canalizan por comandos tipados, desacoplando la UI del estado y de DuckDB.

---

## [0.4.1] - 2026-10-24

> **En pocas palabras:** La Vista de Datos soporta tablas masivas mediante paginación instantánea en DuckDB y la barra de herramientas se ordena bajo principios visuales de Gestalt.

### Experiencia e Interfaz y Motor de Datos
- **Paginación veloz en Vista de Datos:** Conteo total y lectura por bloques de 100 filas (`LIMIT 100 OFFSET ?`) en menos de 16ms incluso con cientos de miles de registros.
- **Barra de acceso rápido y agrupación Gestalt:** Botón "Abrir" integrado junto a Guardar/Deshacer/Rehacer, separación clara entre acciones de modelado y salida, y estilo sobrio para "Exportar .HTML".
- **Modales desacoplados:** Separación entre la guía de exportación CSV y el lector de la Wiki.

---

## [0.4.0] - 2026-10-24

> **En pocas palabras:** Analyticraft da el salto a un Shell de escritorio con barra lateral de 3 vistas (Informe, Datos y Modelo) inspirado en Power BI Desktop.

### Experiencia e Interfaz
- **Selector lateral de 3 vistas (`Ctrl+1`, `Ctrl+2`, `Ctrl+3`):**
  - **Informe:** Lienzo principal de visualizaciones y filtros.
  - **Datos (Solo Lectura):** Cuadrícula tabular de alta densidad con tipos de columna visibles y aviso permanente explicando por qué el CSV físico es la fuente única de verdad.
  - **Modelo:** Espacio base para administrar relaciones entre tablas.
- **Optimización de recursos:** Al cambiar a Vista de Datos o Modelo se suspenden las instancias de ECharts para liberar CPU y memoria gráfica.

---

## [0.3.0] - 2026-10-24

> **En pocas palabras:** Llegan los Anillos de Actividad inspirados en Apple Fitness, 17 temas visuales consistentes entre el Studio y el HTML exportado, y la Wiki integrada.

### Experiencia e Interfaz
- **Gráfico de Anillos de Actividad:** Anillos concéntricos con fondo oscuro, gradientes neón y límite de 4 categorías principales.
- **Catálogo ampliado a 17 temas:** Familias corporativas, multicolor (*Atardecer*, *Cyberpunk*, *Aurora Boreal*, etc.), estilos iWork/Numbers y perfil *Fitness*, aplicables solo a las tarjetas sin alterar la interfaz oscura del Studio.
- **Wiki integrada en la aplicación:** Lector interactivo y guía dedicada explicando la filosofía CSV.

### Seguridad y Motor
- **Consistencia y sanitización en exportación HTML:** El archivo `.html` exportado respeta íntegramente el tema activo y escapa textos y JSON embebidos para prevenir inyecciones HTML/XSS.

---

## [0.2.0] - 2026-10-24

> **En pocas palabras:** Primer paso hacia el análisis multitarjeta con el modelador relacional inicial, notas explicativas en tarjetas y temas globales.

### Experiencia e Interfaz y Datos
- **Modelador Relacional inicial en modal:** Asistente guiado para unir tablas CSV mediante vistas virtuales en DuckDB (`CREATE VIEW`) con opción de descarte.
- **Personalización por tarjeta:** Interruptor de visibilidad de leyenda y campo de descripción/nota al pie.
- **Primeros 5 temas globales:** *Corporativo*, *Geek*, *Colorido*, *All-Blue* y *All-Pink*.

---

## [0.1.5] - 2026-10-24

> **En pocas palabras:** Adopción de la estética industrial en grises oscuros, recarga de CSVs sin perder gráficos (*Hot Swap*) y guardado de proyectos `.analyticraft`.

### Experiencia e Interfaz y Datos
- **Rediseño Industrial Oscuro:** Paleta en grises neutros (`#1e1e1e`, `#252526`, `#2d2d2d`) con tipografía blanca de alto contraste y ayudas contextuales sobre dimensiones, métricas y agregaciones.
- **Hot Swap de datos:** Reemplazo atómico de archivos CSV conservando intactos los gráficos existentes.
- **Filtros globales y persistencia:** Barra de filtros reactivos (`=`, `!=`, `LIKE`, `>`, `<`) y guardado/apertura de proyectos en formato `.analyticraft`.

---

## [0.1.0] - 2026-10-24

> **En pocas palabras:** Lanzamiento inicial del MVP *local-first* para transformar archivos CSV en tableros interactivos y compartirlos como un único archivo HTML sin servidores ni licencias.

### Capacidades Fundamentales
- **Aplicación de escritorio liviana:** Base nativa con **Tauri v2 (Rust)**, **React 19 + TypeScript + Vite** y **Apache ECharts**.
- **Motor analítico en memoria:** Consultas vectorizadas con **DuckDB** directamente en el equipo del usuario.
- **Studio inicial de 3 paneles:** Carga de CSVs, lienzo en cuadrícula e inspector con agregaciones (`SUM`, `AVG`, `COUNT`, `MAX`, `MIN`) para gráficos de barras, líneas, áreas, donas/pie, KPIs y tablas.
- **Exportación cero fricción:** Generación de un archivo `.html` autocontenido que cualquier directivo abre con doble clic en su navegador.
