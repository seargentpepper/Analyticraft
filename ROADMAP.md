# 🗺️ Roadmap de Analyticraft - Próximas Versiones Clave (v0.9.0 → v8.9.0)

Este documento traza la hoja de ruta activa y las próximas **versiones clave** de **Analyticraft**, distribuyendo la complejidad de manera equitativa desde el primer hito de madurez desktop (`v1.0.0`) hasta la culminación total de la plataforma independiente en la versión **`v8.9.0`**.

- **Estado Actual del Proyecto:** Versión `v0.8.4` (Estable)
- **Primer Hito de Madurez Desktop:** Versión `v1.0.0` (Lienzo Avanzado, Páginas Múltiples y Marcadores)
- **Versión Final de Cierre (100%):** Versión `v8.9.0` (Suite Ejecutiva Completa sobre Núcleo Rust, CLI, MCP e IA Local)
- **Historial de Versiones Completadas (Done):** Consulta **[CHANGELOG.md](./CHANGELOG.md)** (`v0.1.0` a `v0.8.4`).

> **Regla de Desarrollo para Desarrolladores y LLMs:** Ninguna versión implementa cambios visuales sin su contraparte de motor de datos y viceversa. Antes de codificar cualquier hito, consulta la guía de contratos técnicos y diagramas de flujo en [docs/Página 6 Arquitectura de UI y Contratos de Backend](./docs/Página%206%20Arquitectura%20de%20UI%20y%20Contratos%20de%20Backend%20(Guía%20para%20Desarrolladores%20y%20LLMs).md).

---

## Índice de Próximas Versiones Clave

1. [v0.9.0 — Lienzo Avanzado, Alineación y Desacoplamiento Base de UI](#v090--lienzo-avanzado-alineación-y-desacoplamiento-base-de-ui)
2. [v1.0.0 — Madurez Desktop: Páginas Múltiples, Marcadores y Pruebas de Componentes](#v100--madurez-desktop-páginas-múltiples-marcadores-y-pruebas-de-componentes)
3. [v2.0.0 — Filtrado Cruzado Bidireccional y Catálogo Analítico Extendido](#v200--filtrado-cruzado-bidireccional-y-catálogo-analítico-extendido)
4. [v3.0.0 — Inteligencia Geoespacial con MapLibre GL JS (Online y Offline)](#v300--inteligencia-geoespacial-con-maplibre-gl-js-online-y-offline)
5. [v4.0.0 — Vista `Semantycs`, Medidas Reutilizables y Dimensión Calendario](#v400--vista-semantycs-medidas-reutilizables-y-dimensión-calendario)
6. [v5.0.0 — Vista `SQL Shortcuts`: Constructor Visual Secuencial estilo Apple Shortcuts](#v500--vista-sql-shortcuts-constructor-visual-secuencial-estilo-apple-shortcuts)
7. [v6.0.0 — ETL Power Query Ligero, Multifuente Local y Persistencia `.ddb`](#v600--etl-power-query-ligero-multifuente-local-y-persistencia-ddb)
8. [v7.0.0 — Automatización ELT: File Watcher Nativo y Sidecar `analyticraft-sync`](#v700--automatización-elt-file-watcher-nativo-y-sidecar-analyticraft-sync)
9. [v8.0.0 — Núcleo DuckDB en Rust (`src-tauri`) y Modo CLI (`analyticraft-cli`)](#v800--núcleo-duckdb-en-rust-src-tauri-y-modo-cli-analyticraft-cli)
10. [v8.5.0 — Puente MCP y `Chatview` con Ollama Local (Anti-Alucinaciones)](#v850--puente-mcp-y-chatview-con-ollama-local-anti-alucinaciones)
11. [v8.9.0 — Suite de Distribución Ejecutiva y Cierre Integral del Proyecto](#v890--suite-de-distribución-ejecutiva-y-cierre-integral-del-proyecto)
12. [Estrategia Transversal de Estabilidad y Calidad de UI](#estrategia-transversal-de-estabilidad-y-calidad-de-ui)

---

## v0.9.0 — Lienzo Avanzado, Alineación y Desacoplamiento Base de UI

> *Perfecciona el lienzo libre introducido en `v0.8.4` y sienta la base modular para escalar la interfaz sin regresiones.*

- 🖥️ **UI / Frontend:**
  - [ ] **Guías Inteligentes y Cuadrícula Configurable:** Guías magnéticas dinámicas al alinear tarjetas entre sí y paso de cuadrícula configurable (`8px` / `10px` / `16px`).
  - [ ] **Menú Flotante de Alineación:** Barra contextual al seleccionar una o múltiples tarjetas (alinear izquierda, centro, derecha, arriba, abajo, distribuir horizontal/verticalmente y control de capas `zIndex`).
  - [ ] **Banner Superior de KPIs:** Contenedor superior desacoplado para tarjetas numéricas destacadas con distribución automática.
- ⚙️ **Backend / Arquitectura:**
  - [ ] **Algoritmo de Alineación Geométrica:** Funciones puras en `src/lib/canvasLayout.ts` para recalcular posiciones relativas, distribución y `zIndex` sin solapamiento destructivo.
  - [ ] **Encapsulamiento Inicial de Estilos y Estado:** Inicio de migración de `src/App.css` a CSS Modules (`*.module.css`) en componentes estables (`ChartCard`, `FloatingCard`, `ModelView`, `FieldsPanel`) y extracción de hooks/subcomponentes desde `src/App.tsx`.

---

## v1.0.0 — Madurez Desktop: Páginas Múltiples, Marcadores y Pruebas de Componentes

> *Primer gran hito de madurez para uso diario en producción: reportes ejecutivos multipágina, marcadores de presentación y exportación HTML multipágina.*

- 🖥️ **UI / Frontend:**
  - [ ] **Barra Inferior de Páginas:** Pestañas (`Página 1`, `Página 2`, `+ Nueva Página`), menú contextual de pestaña (renombrar, duplicar, eliminar) y slider de zoom del lienzo.
  - [ ] **Panel Lateral de Marcadores (Bookmarks):** Lista de capturas guardadas (ej. `P1 - Vista General`, `P1 - Filtro Mayoristas`) con botón `Add` y modo `Presentar`.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Modelo Jerárquico de Proyecto:** Evolución a `AnalyticraftProject -> pages: PageConfig[]`, donde cada página posee su propio arreglo de `charts: ChartConfig[]`.
  - [ ] **Estado de Marcadores:** Captura snapshot de filtros activos, visibilidad de tarjetas y página activa en `bookmarks: BookmarkState[]`.
  - [ ] **Exportador HTML Multipágina:** Compilación del archivo `.html` autocontenido con navegación reactiva de pestañas y marcadores offline.
- 🧪 **Calidad:**
  - [ ] **Pruebas de Componentes (`@testing-library/react`):** Validación de montaje, selectores críticos y contratos interactivos de paneles y modales.

---

## v2.0.0 — Filtrado Cruzado Bidireccional y Catálogo Analítico Extendido

> *Convierte tableros estáticos en análisis exploratorio multidireccional con visualizaciones corporativas avanzadas.*

- 🖥️ **UI / Frontend:**
  - [ ] **Filtrado Cruzado Bidireccional (Cross-Filtering):** Clic sobre una barra, sector de dona o punto de línea resalta o filtra instantáneamente las demás tarjetas de la página, con atenuación de elementos no seleccionados en el emisor y control de interacciones para aislar tarjetas específicas.
  - [ ] **Gráfico Combinado (Barras + Líneas):** Soporte para doble eje Y (ej. Ventas en barras y Margen % en línea).
  - [ ] **Gráfico de Cascada (Waterfall):** Visualización de pérdidas y ganancias (P&L), incrementos y decrementos acumulativos.
  - [ ] **Treemap y Gráfico de Embudo (Funnel):** Distribución jerárquica de categorías y tasas de conversión por etapas.
  - [ ] **Tabla Matriz / Pivote:** Cuadrícula con filas, columnas, subtotales y totales generales colapsables.
  - [ ] **Perfeccionamiento Estilos Apple en Anillos:** Metas cuantitativas configurables en el inspector `Format` (fijas o enlazadas a medida SQL) y renderizado de segunda vuelta con sombra volumétrica y resplandor neón (`shadowBlur: 12`) al superar el 100%.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Bus y Caché de Filtrado Cruzado:** Estado `crossFilterState: { sourceChartId, column, selectedValue }` con caché volátil en memoria para respuestas en <8ms sin re-consultar DuckDB si los parámetros no cambian.
  - [ ] **Builders Modulares y SQL Avanzado:** Nuevos generadores en `src/lib/chartOptions.ts`, series polares duales, consulta `ROUND((val / goal) * 100, 1)` y cláusulas `PIVOT`, `ROLLUP` y `GROUPING SETS` en DuckDB.

---

## v3.0.0 — Inteligencia Geoespacial con MapLibre GL JS (Online y Offline)

> *Cartografía interactiva a nivel de calle, colonia y proximidad a 60fps en WebGL sin API keys ni costos de licencia.*

- 🖥️ **UI / Frontend:**
  - [ ] **Tarjeta de Mapa Detallado (`maplibre-gl` + `@vis.gl/react-maplibre`):** Renderizado WebGL declarativo en React 19 alineado a la paleta oscura *Workbench Industrial* (`#1e1e1e`).
  - [ ] **4 Drop-Zones en Inspector `Build`:** `Latitud`, `Longitud`, `Categoría / Color` y `Tamaño / Peso`.
  - [ ] **Tres Modos Visuales Geoespaciales:**
    - *Agrupación Inteligente (Clustering):* Agrupa cientos de puntos cercanos (ej. alumnos o clientes en una colonia) en un círculo con conteo que se desglosa al hacer zoom.
    - *Mapa de Calor (Heatmap):* Visualización continua de zonas calientes sin depender de límites administrativos.
    - *Círculos de Radio / Proximidad:* Clic en una ubicación candidata (ej. sede de evento o sucursal) para proyectar un radio configurable (`2 km`, `5 km`) y contabilizar registros dentro del área.
  - [ ] **Mapas Base Duales (Cero Costo de API):**
    - *Modo Online:* Teselas vectoriales gratuitas de **OpenFreeMap** o estilos **Positron / Dark Matter de CARTO** (sin registro ni API key).
    - *Modo 100% Offline:* Lectura directa de archivos locales `.pmtiles` (extracto de ciudad/estado) almacenados dentro de la subcarpeta `/data/` del proyecto.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Pipeline DuckDB → GeoJSON en Memoria:** Consulta reactiva `SELECT lat, lon, categoria, COUNT(*) ... WHERE [filtros_activos]` convertida a objeto `GeoJSON` en memoria + cálculo SQL de distancia **Haversine** en DuckDB para filtros por radio en kilómetros.
  - [ ] **Compatibilidad con Exportación `.html`:** Empaquetado de `maplibre-gl` y los datos `GeoJSON` en el HTML autocontenido (con mapa detallado de calles cuando hay internet y vista de puntos, agrupaciones y filtros funcional sin conexión).

---

## v4.0.0 — Vista `Semantycs`, Medidas Reutilizables y Dimensión Calendario

> *Inaugura la capa semántica del negocio como 4ª vista del Riel Lateral y estandariza métricas y jerarquías temporales.*

- 🖥️ **UI / Frontend (Nueva Vista 4: `Semantycs`):**
  - [ ] **4º Modo en Riel Lateral de Vistas:** Acceso directo a **Semantycs** conservando la estética *Workbench Industrial*.
  - [ ] **Editor y Bitácora Markdown con Plantillas:** Espacio para documentar reglas de negocio, glosarios de columnas, significado de códigos internos y referencias explícitas a nombres de Shortcuts (ej. *"Para analizar morosidad, usar siempre `Cartera_Vencida_30d`"*). Funciona como documentación viva para humanos y escudo determinista contra alucinaciones de IA.
- 🖥️ **UI / Frontend (Medidas y Dimensión Temporal):**
  - [ ] **Diálogo "Nueva Medida":** Modal en `Modelado > Nueva Medida` con editor SQL asistido, autocompletado de funciones (`SUM`, `AVG`, `COUNT`, `ROUND`, etc.) e icono de calculadora (`🧮`) en el panel `FIELDS`.
  - [ ] **Árbol de Fechas Desplegable:** Columnas `DATE` / `TIMESTAMP` en `FIELDS` expandibles automáticamente en `Año › Trimestre › Mes › Día`.
  - [ ] **Generador de Tabla Calendario:** Botón en Ribbon con selector de rango de fechas de inicio y fin.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Persistencia Semántica en `.analyticraft`:** Subcarpeta `/semantycs/` dentro de la carpeta de proyecto empaquetado (junto a `/data/` y `/backups/`), almacenando archivos planos `.md` incluidos en los respaldos automáticos.
  - [ ] **Validador e Inyector de Medidas:** Validación en tiempo real con `EXPLAIN SELECT {expression} FROM {table}` e inyección de CTEs (`WITH medidas AS (...)`) en consultas de tarjetas.
  - [ ] **Generador de Calendario en DuckDB:** `CREATE TABLE "calendario" AS SELECT d::DATE as fecha, year(d) as año, quarter(d) as trimestre, monthname(d) as mes, day(d) as dia FROM generate_series(DATE '...', DATE '...', INTERVAL 1 DAY) tbl(d)`.

---

## v5.0.0 — Vista `SQL Shortcuts`: Constructor Visual Secuencial estilo Apple Shortcuts

> *Completa el Riel de Vistas lateral a **5 modos integrados** (`Informe`, `Datos`, `Modelo`, `SQL Shortcuts`, `Semantycs`) y convierte consultas ad-hoc en activos nombrados y reutilizables para UI, CLI y MCP.*

- 🧭 **Decisión Arquitectónica Fundamental (Por qué Bloques Secuenciales y NO Nodos/Cables):**
  - Se adopta una **lista vertical de bloques secuenciales estilo Apple Shortcuts** como interfaz principal (acompañada de pestaña dual SQL), **descartando un canvas infinito de nodos y cables tipo n8n**: evita el desorden visual (*spaghetti*), reduce la curva de aprendizaje para contadores y directivos, facilita la depuración paso a paso y evita duplicidad visual con la `Vista de Modelo` relacional ya existente.
- 🖥️ **UI / Frontend (`SQL Shortcuts`):**
  - [ ] **Tarjetas Secuenciales en Lenguaje Natural (`@dnd-kit/core` + `@dnd-kit/sortable` + Radix/Headless UI):** Lista vertical reordenable con línea conectora entre pasos y píldoras/selectores clicables (`#2d2d2d`):
    - *Origen:* `Obtener registros de [Tabla ▾]`
    - *Filtro:* `Filtrar donde [Columna ▾] [operador ▾] [Valor] + Añadir condición`
    - *Cálculo:* `Crear columna calculada [Nombre] = [Columna] [operación ▾]`
    - *Agrupación:* `Agrupar por [Columna ▾] y calcular [Agregación ▾] de [Columna ▾]`
    - *Ordenar / Salida:* `Guardar resultado como [Variable / Vista]`
  - [ ] **Selector Segmentado Dual `[ Visual ] | [ SQL ]`:** Sincronización en tiempo real de bloques a SQL. Si un usuario experto edita manualmente el SQL para usar funciones no cubiertas por bloques (ej. funciones de ventana `OVER()`), se muestra el aviso *"Editado manualmente en SQL"* y se bloquea la traducción inversa para evitar pérdida de lógica.
  - [ ] **Variables Mágicas y Vista Previa por Bloque:** Menú contextual en selectores de valor (valor fijo, parámetro global `$Fecha_Corte` o salida de un bloque anterior) y botón *Play* por tarjeta para previsualizar las primeras 5 filas tras ese paso.
  - [ ] **Materialización Transparente en `FIELDS`:**
    - Shortcuts tipo **Tabla** (ej. `Resumen_Sucursales`) aparecen en `FIELDS` con icono distintivo (`⚡`), arrastrables a ECharts o MapLibre.
    - Shortcuts tipo **Valor Único / KPI** (ej. `Ticket_Promedio_Global`) aparecen bajo carpeta de Medidas/Shortcuts para tarjetas KPI.
- ⚙️ **Backend / Motor de Datos:**
  - [ ] **Modelo Único AST JSON → Compilador CTE:** Cada Shortcut se persiste como árbol JSON (bloques visuales + SQL compilado + tipo `table | kpi`) dentro del proyecto `.analyticraft`; una función pura TypeScript compila los pasos a CTEs encadenados (`WITH paso_1 AS (...), paso_2 AS (...)`).
  - [ ] **Vistas SQL Reactivas en DuckDB:** Materialización mediante `CREATE OR REPLACE VIEW`; reaccionan automáticamente a segmentadores del `Informe` y se recalculan al instante tras cualquier `Hot Swap (↻)`. Convive al 100% con el flujo directo CSV → ECharts.

---

## v6.0.0 — ETL Power Query Ligero, Multifuente Local y Persistencia `.ddb`

> *Amplía `SQL Shortcuts` con el catálogo completo de transformaciones ETL estilo Power Query y abre la puerta a archivos nativos locales más allá del CSV.*

- 🔧 **Extensión ETL en `SQL Shortcuts` (Power Query Ligero):**
  - [ ] **Bloques de Limpieza Reproducible:** Eliminar filas vacías, quitar duplicados, rellenar nulos, parsear texto a formato fecha/número, dividir y renombrar columnas (receta repetible con un clic ante datos nuevos).
  - [ ] **Bloque `Merge` (Combinar Consultas):** Cruzar dos tablas o resultados de otros Shortcuts mediante columna clave común (equivalente visual a `BUSCARV` sin cables).
  - [ ] **Bloque `Append` (Anexar Consultas):** Apilar una tabla debajo de otra cuando comparten el mismo esquema de columnas (ej. consolidar reportes mensuales enero + febrero).
  - [ ] **Bloque `SQL Personalizado` (Híbrido):** Insertar código SQL arbitrario en medio de una secuencia visual sin obligar a convertir todo el flujo a modo código.
- 🖥️ **UI / Frontend (Multifuente y Motor):**
  - [ ] **Diálogo Multifuente "Obtener Datos":** Importación guiada de Excel (`.xlsx` con selector de hoja), archivos `.parquet`, carpetas completas de CSVs y bases SQLite locales.
  - [ ] **Selector de Modo de Base de Datos:** Alternar entre DuckDB 100% en memoria volátil o archivo local persistente `.ddb`.
- ⚙️ **Backend / Calidad:**
  - [ ] **Extensiones Nativas y Pipeline Declarativo:** Carga en DuckDB de `read_parquet` y conector SQLite ejecutando secuencias ETL sin alterar archivos físicos de origen.
  - [ ] **Pruebas de Regresión Visual Automatizadas (Playwright):** Suite E2E con comparación de capturas de pantalla sobre lienzo libre, modelo relacional y vistas nuevas en CI/CD.

---

## v7.0.0 — Automatización ELT: File Watcher Nativo y Sidecar `analyticraft-sync`

> *Permite tableros actualizados casi en tiempo real mediante arquitectura modular satélite, manteniendo el núcleo de Analyticraft ligero, offline-safe y estrictamente de solo lectura.*

- ⚙️ **Etapa 1 — File Watcher Nativo en Tauri (Rust `notify` crate):**
  - [ ] Vigilancia de archivos en el directorio `/data/` del proyecto desde el backend Rust; al detectar cambios externos (ej. generados por scripts propios de Python o R), emite un evento IPC al frontend para disparar silenciosamente el `Hot Swap (↻)` atómico sin interrumpir al analista.
- 🦀 **Etapa 2 — Conector Sidecar Ligero en Rust (`analyticraft-sync`):**
  - [ ] Ejecutable satélite **opcional e independiente** (<5 MB, consumo mínimo de RAM) que el usuario solo instala si requiere sincronización externa; quien usa CSVs locales conserva la app base libre de peso.
  - [ ] **Bucle ELT Configurable (`sync.toml` / `sync.json`):** Cada intervalo (ej. `120s`), se conecta a **Google Sheets** (exportación CSV), bases SQL (**MySQL, PostgreSQL, SQL Server**), Excel compartido o APIs web, limpia columnas y normaliza dimensiones.
  - [ ] **Escritura Atómica y Tolerancia a Fallos:** Escribe el resultado en `/data/` como archivo `.tmp` y lo renombra atómicamente a `.csv` para impedir lecturas corruptas; si falla la red o el origen remoto, el último CSV válido y los respaldos en `/backups/` siguen intactos preservando la **Fuente Única de Verdad**.
- 🖥️ **Etapa 3 — UI de Orígenes y Estado de Sincronización:**
  - [ ] **Modal Opcional de Orígenes Externos:** Interfaz para pegar enlace de Google Sheets o credenciales SQL y delegar la ejecución a `analyticraft-sync` sin editar archivos de texto.
  - [ ] **Indicador y Conmutador en Barra de Estado:** Estado de sincronización ("Sincronizado", "Cambios detectados") y toggle de *Vigilancia de CSV* en `/data/`.

---

## v8.0.0 — Núcleo DuckDB en Rust (`src-tauri`) y Modo CLI (`analyticraft-cli`)

> *Desacopla el motor de lectura del proyecto hacia Rust para habilitar automatización desde terminal y preparar el ecosistema de agentes.*

- 🦀 **Backend Core (Rust / `src-tauri`):**
  - [ ] **Núcleo Unificado de Proyecto `.analyticraft`:** Lectura compartida desde Rust de la carpeta del proyecto (`/data/`, `/semantycs/`, definiciones JSON de `SQL Shortcuts`, esquema DuckDB y `/backups/`).
- ⌨️ **Modo CLI (`analyticraft-cli`):**
  - [ ] **Ejecución Headless por Nombre de Shortcut:** Ejecución de flujos guardados sin abrir interfaz gráfica, evitando consultas SQL largas o propensas a error en terminal:
    `analyticraft run proyecto.analyticraft --shortcut "Ventas_Netas_Trimestre"`
  - [ ] **Salida Estructurada:** Exportación directa de resultados a stdout (`JSON` / `CSV`) o generación automatizada de instantáneas para pipelines programados.

---

## v8.5.0 — Puente MCP y `Chatview` con Ollama Local (Anti-Alucinaciones)

> *Integra inteligencia artificial 100% local que habla exactamente el mismo lenguaje interno del proyecto (`Semantycs` + `SQL Shortcuts`), sin fugas de datos a la nube.*

- 🤖 **Puente MCP y Panel `Chatview`:**
  - [ ] **Conexión Nativa con Ollama Local (`localhost:11434`):** Panel `Chatview` integrado en la estética *Workbench Industrial* para consultar datos en lenguaje natural de forma 100% privada.
  - [ ] **Escudo Anti-Alucinaciones (`Semantycs` + Esquema):** Antes de que Ollama o el servidor MCP respondan, leen automáticamente los archivos `.md` de `/semantycs/` junto con el esquema activo de DuckDB para comprender códigos internos, reglas de negocio y filtros obligatorios.
  - [ ] **Herramientas Deterministas (`SQL Shortcuts` vía MCP):** Exposición de los Shortcuts validados del proyecto como herramientas directas e invocables por la IA (ej. `ejecutar_shortcut("Alumnos_Por_Colonia")`), garantizando cifras exactas sin alucinaciones en cálculos complejos.
  - [ ] **Acciones Asistidas en el Informe:** Capacidad para ejecutar consultas seguras en DuckDB, crear nuevas vistas o insertar tarjetas visuales directamente en la página activa del `Informe`.

---

## v8.9.0 — Suite de Distribución Ejecutiva y Cierre Integral del Proyecto

> *Culminación al 100% de Analyticraft como software BI independiente: exportación ejecutiva multiformato, seguridad verificada y calidad integral.*

- 📤 **UI / Frontend (Menú y Modal de Exportación Unificado en Ribbon):**
  - [ ] **Exportar HTML Interactivo Autocontenido:** Paquete único multipágina con ECharts, `maplibre-gl` + `GeoJSON` embebido, marcadores, filtros cruzados y segmentadores operativos sin internet.
  - [ ] **Exportar Documento PDF Vectorial:** Páginas de alta definición con tipografía nítida generadas desde Tauri/Rust.
  - [ ] **Exportar Imágenes HD (`Webp estatico y animado` / `SVG`):** Selección de páginas, resolución, metadatos y encabezados corporativos.
- 🛡️ **Seguridad y Cierre de Calidad:**
  - [ ] **Sanitización Estricta de Seguridad:** Escapado obligatorio (`escapeHtml`, `safeJson`) en textos, columnas, notas semánticas y exportaciones para neutralizar vectores XSS.
  - [ ] **Cobertura Integral Verificada:** Suite verde de extremo a extremo combinando pruebas unitarias (Vitest), pruebas de componentes (React Testing Library) y regresión visual (Playwright).

---

## Estrategia Transversal de Estabilidad y Calidad de UI

Para escalar de forma segura desde `v0.8.4` hasta `v8.9.0` (incluyendo las vistas `Semantycs`, `SQL Shortcuts`, `MapLibre` y `Chatview`), se aplican transversalmente cuatro pilares de ingeniería:

1. **Encapsulamiento con CSS Modules (`*.module.css`):** Aislamiento progresivo fuera de `src/App.css` para prevenir colisiones de estilos globales.
2. **Desacoplamiento de `src/App.tsx`:** Extracción de subcomponentes, reducers y hooks especializados para contener el *Blast Radius* entre vistas.
3. **Pruebas de Componentes (`@testing-library/react`):** Verificación de contratos visuales e interactivos en React desde `v1.0.0`.
4. **Regresión Visual E2E (Playwright):** Comparación automatizada de capturas de pantalla en CI/CD desde `v6.0.0`.

---

## Resumen de Cobertura Integral del Proyecto

| Área del Sistema                      | Versiones Completadas ([CHANGELOG.md](./CHANGELOG.md)) | Próximas Versiones Clave (`v0.9.0` → `v8.9.0`)                                                                   | Resultado Final en `v8.9.0`                                                                                                 |
| ------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Arquitectura de Interfaz y Vistas** | `v0.5.0`, `v0.5.1`, `v0.6.0–0.6.1`, `v0.8.4`           | `v0.9.0`, `v1.0.0` (Páginas/Bookmarks), `v4.0.0` (`Semantycs`), `v5.0.0` (`SQL Shortcuts`)                       | Shell de 5 modos (`Informe`, `Datos`, `Modelo`, `SQL Shortcuts`, `Semantycs`), lienzo libre avanzado, páginas y marcadores. |
| **Gobernanza, ETL y Conectividad**    | `v0.1.0`, `v0.2.0–0.4.0`, `v0.5.0`, `v0.8.2`, `v0.8.4` | `v5.0.0` (Bloques AST→CTE), `v6.0.0` (Merge/Append/XLSX/Parquet/.ddb), `v7.0.0` (`notify` + `analyticraft-sync`) | Vista de Datos *Read-Only*, recetas ETL estilo Apple Shortcuts/Power Query, File Watcher en `/data/` y sidecar ELT atómico. |
| **Modelado Semántico y Relacional**   | `v0.7.0`, `v0.8.0`, `v0.8.1`, `v0.8.2`                 | `v4.0.0` (`/semantycs/*.md`, Medidas `EXPLAIN`, Calendario), `v5.0.0` (Shortcuts `⚡` en `FIELDS`)                | Grafo estrella con auto-detección, glosario Markdown anti-alucinación, medidas SQL y vistas reutilizables reactivas.        |
| **Interactividad, Visuales y Mapas**  | `v0.1.0`, `v0.2.0–0.4.0`, `v0.6.1`, `v0.8.4`           | `v2.0.0` (Cross-Filtering, Cascada/Matriz/Anillos >100%), `v3.0.0` (`MapLibre GL JS` + `.pmtiles`)               | Filtrado cruzado <8ms, mapas WebGL con clustering/heatmap/radios Haversine offline, Waterfall/Matriz y estilos Apple.       |
| **Automatización, CLI e IA Local**    | `v0.8.2` (Síntesis Markdown para LLMs)                 | `v8.0.0` (Núcleo Rust + `analyticraft-cli`), `v8.5.0` (Puente MCP + `Chatview` Ollama)                           | Ejecución headless por nombre de Shortcut y copiloto local protegido por `Semantycs` y herramientas MCP deterministas.      |
| **Calidad, Seguridad y Distribución** | `v0.8.3` (Vitest), `v0.8.4` (CSP y 30 tests)           | `v0.9.0` (CSS Modules), `v1.0.0` (RTL), `v6.0.0` (Playwright), `v8.9.0` (HTML/PDF/PPTX/HD)                       | Pruebas unitarias + componentes + visuales, sanitización XSS estricta y suite completa de exportación ejecutiva offline.    |
