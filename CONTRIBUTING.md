# Contribuir a Analyticraft 📊

¡Gracias por tu interés en colaborar con Analyticraft! Este proyecto busca entregar una herramienta de BI de escritorio, local-first y ultraeficiente para PyMEs y analistas independientes.

Para mantener una base de código robusta, predecible y fácil de mantener entre contributors, solicitamos seguir estas directrices.

---

## 💻 Requisitos del Sistema y Entorno Local

Analyticraft utiliza una arquitectura híbrida compuesta por un backend nativo en Rust y un frontend web compilado a través de Tauri.

### Herramientas Requeridas:
- **Rust & Cargo:** Versión **1.75.0** o superior (recomendado instalar vía `rustup`).
- **Node.js:** Versión **LTS (v20.x o v22.x)**.
- **Gestor de paquetes:** `pnpm` (recomendado) o `npm` v10+.
- **Dependencias del sistema para Tauri:**
  - **Linux (Debian/Ubuntu):** `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`.
  - **Windows:** Microsoft Visual Studio C++ Build Tools (con SDK de Windows 10/11) y WebView2 (incluido por defecto en Windows 10/11).
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`).

### Puesta en Marcha:
1. Clona el repositorio:
   ```bash
   git clone https://github.com/seargentpepper/Analyticraft.git
   cd Analyticraft
   ```
2. Instala dependencias y ejecuta la app de escritorio:
   ```bash
   npm install
   npm run tauri dev
   ```
3. Antes de abrir un PR, verifica tipos y compilación:
   ```bash
   npm run build
   ```

---

## 🎨 Temas de Gráficos y Estilos Inspirados en Apple

Los temas viven en un único lugar: [`src/lib/themes.ts`](./src/lib/themes.ts). Solo afectan a las **tarjetas** (nunca a la UI gris del Studio).

### Cómo agregar un tema
1. Añade el `id` a la unión `CardTheme` en `src/types/dashboard.ts`.
2. Registra el tema en `THEMES` (`src/lib/themes.ts`) con: `label`, `group`, colores de tarjeta, `palette` y `mode`:
   - `"gradient"`: look de un solo tono (degradado `palette[0] → palette[1]`).
   - `"multi"`: cada categoría/anillo recibe un color distinto de `palette`.
   - `gradients` (opcional): pares `[desde, hasta]` por color (temas neón / anillos).
3. No necesitas tocar `ChartCard` ni el exportador: ambos usan `buildChartOption()` de `src/lib/chartOptions.ts`.
4. Verifica contraste: texto **blanco / semibold** sobre fondos oscuros, legible también con el modo oscuro del navegador.

### Reglas para estilos "inspirados en Apple" (iWork / Fitness)
Referencia: `Guía de gráficos Apple y Fitness - Google Gemini.md` y la sección *Estrategia de "clonado"* de [`ROADMAP.md`](./ROADMAP.md).

- ✅ **Sí:** usar valores hex públicos, `borderRadius`, gradientes y anillos con `roundCap` de **Apache ECharts**.
- ❌ **No** usar ni referenciar componentes exclusivos de Apple (`HKActivityRingView`, Swift Charts, SwiftUI): no funcionan en Tauri/Windows/Linux.
- ❌ **No** incluir la fuente **SF Pro**, **SF Symbols**, logotipos ni la marca "Apple Fitness". Usa nombres descriptivos ("inspirado en iWork", "Anillos de Actividad") y la pila tipográfica `-apple-system, 'SF Pro Display', 'Inter', sans-serif`.
- ❌ **No** añadir otra librería de gráficos (p. ej. ApexCharts) para replicar un estilo que ECharts ya cubre; justifica cualquier dependencia nueva en el PR (peso del bundle, licencia).

### Reglas de seguridad para el exportador HTML
El `.html` autocontenido se comparte con terceros. Todo texto de usuario o dato de un CSV (títulos, descripciones, categorías) **debe escaparse** (`escapeHtml` / `safeJson` en `src/lib/exporter.ts`). Nunca inyectes valores con `innerHTML` sin escapar.

---

## 🏛️ Directrices de Diseño UX/UI (Rediseño Inspirado 100% en Power BI)

Para facilitar la adopción inmediata de usuarios acostumbrados a Microsoft Power BI Desktop, toda contribución a la interfaz debe alinearse estrictamente con los siguientes principios:

### 1. Jerarquía de Componentes de la Interfaz
La interfaz se estructura de acuerdo a la anatomía de Power BI Desktop:
- **`TitleBar`:** Barra superior que contiene accesos rápidos (`Guardar`, `Deshacer`, `Rehacer`), el nombre del archivo de proyecto (`.analyticraft`) y los controles de ventana.
- **`RibbonMenu`:** Menú tipo cinta con pestañas contextuales (`Archivo`, `Inicio`, `Insertar`, `Modelado`, `Ver`, `Formato`) organizadas en grupos funcionales.
- **`LeftViewSwitcher`:** Barra lateral izquierda con los 3 selectores de vista principales:
  - `ReportView` (Lienzo de informe con gráficos y KPIs).
  - `DataView` (Cuadrícula tabular de datos).
  - `ModelView` (Lienzo interactivo de diagrama relacional).
- **`RightPaneDock`:** Paneles acoplables y colapsables a la derecha:
  - `Visualizations` (Matriz de selección de gráficos con subpestañas `Build` y `Format`).
  - `Fields` (Árbol jerárquico de tablas y columnas con iconos `#`, `Abc`, `📅`).
  - `Filters` (Filtros a nivel de elemento visual, página y reporte).
  - `Bookmarks` (Gestión de estados del dashboard).
- **`BottomPageBar`:** Pestañas horizontales de páginas (`Página 1`, `+ Nueva Página`) e indicador de zoom.

### 2. Regla No Negociable: Inmutabilidad en Vista de Datos (Data View Solo Lectura)
- **Prohibido añadir edición directa de celdas (Read-Only estricto):**
  Analyticraft trata los archivos CSV físicos como la **Fuente Única de Verdad (Single Source of Truth)**. La alteración in situ de celdas en el visor de datos fragmenta la trazabilidad y corrompe las relaciones de DuckDB.
- **Mantenimiento del Banner Pedagógico:**
  La `DataView` debe mostrar siempre el aviso informativo que explica que los datos son de solo lectura y que cualquier modificación debe realizarse en el CSV de origen, utilizando el botón `Hot Swap (↻)` para actualizar en caliente.
- Cualquier PR que agregue inputs editables en las celdas del grid será rechazado.

### 3. Paleta Workbench Industrial y Variables CSS
- **No importar paletas claras ni estilos ajenos:** Toda la estructura del Ribbon, paneles y barras laterales debe utilizar las variables CSS ya declaradas en `src/App.css`:
  - Fondos: `--bg-app` (`#1e1e1e`), `--bg-topbar` (`#252526`), `--bg-panel` (`#2d2d2d`), `--bg-subtle` (`#383838`).
  - Bordes: `--border-app` (`#3e3e42`), `--border-focus` (`#0e639c`).
  - Tipografía: `--text-white` (`#ffffff`) en peso `semibold` o `bold` para máximo contraste.
- **Aislamiento de Temas de Gráficos:** Los 17 temas de tarjetas (`src/lib/themes.ts`) **únicamente** estilizan el contenido dentro de las tarjetas visuales. La carcasa del Studio (Ribbon, paneles, barra lateral) no cambia de tema.

### 4. Directrices para la Vista de Modelo Relacional (Model View)
- Las tablas en el diagrama deben diferenciarse visualmente: cabeceras con acento sutil para **Hechos** (métricas) y neutras para **Dimensiones**.
- Las conexiones deben implementar drag & drop de columnas, renderizando símbolos de cardinalidad (`1` y `*`) y flechas de dirección de filtro apuntando a la tabla de hechos.
- Todo desarrollo en esta vista debe contemplar la experiencia para novatos (*Newbie-Friendly*):
  - Botón de **Auto-Detectar Relaciones** basado en nombres de columnas compartidos.
  - Auto-alineación semántica en cascada (dimensiones arriba / hechos al centro o abajo).
  - Tooltips explicativos en lenguaje natural al pasar el mouse por los conectores.
  - Opción directa para eliminar relaciones (`🗑️`) sin dejar vistas huérfanas en DuckDB.

### 5. Convenciones de Shell Desktop, Vistas y Atajos Globales
- **Navegación Unificada:** La conmutación entre vistas se gestiona exclusivamente a través de `activeView: 'report' | 'data' | 'model'`. No añadas enrutadores basados en hash ni browser history para evitar desincronizaciones en el runtime de Tauri.
- **Liberación de Ciclos de CPU (Desmontaje Condicional):** Al cambiar de vista, las visualizaciones pesadas de ECharts deben suspenderse o desmontarse. Cualquier nueva visualización debe implementar limpieza estricta en su hook de desmontaje (`chartInstance.dispose()`).
- **Atajos de Teclado Globales:**
  - `Ctrl+1` / `Ctrl+2` / `Ctrl+3` para alternar vistas.
  - `Ctrl+S` para guardar proyecto.
  - `Ctrl+Z` / `Ctrl+Y` para deshacer y rehacer.
  - **Regla:** Cualquier listener global debe comprobar `e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement` para no capturar teclas mientras el usuario edita textos o fórmulas.
- **Deshacer / Rehacer:** Al añadir operaciones que muten el dashboard (añadir/eliminar gráficos o filtros), se debe invocar `recordSnapshot()` antes de aplicar la mutación.

### 6. Convenciones de Paneles Laterales y Drag & Drop (Fase 6)
- **Estructura de Paneles a la Derecha:**
  - El lienzo de la Vista de Informe (`canvas-area`) se expande directamente desde el `LeftViewSwitcher` hasta los paneles del muelle derecho (`right-dock-container`).
  - Queda prohibido reinstalar una barra lateral izquierda de tablas en el informe. Las fuentes de datos, columnas, conteos de filas y hot swap residen exclusivamente en el panel **Campos (FIELDS)** a la derecha.
- **API de Arrastre Tipada (`DraggedFieldPayload`):**
  - Cualquier elemento arrastrable debe transferir el objeto `{ tableName, columnName, dataType }` serializado en `application/json` vía `e.dataTransfer.setData()`.
  - Las drop-zones en la subpestaña `Build` de `VisualizationsPanel` deben procesar el payload de forma tipada, asignando de forma segura dimensiones (`string`/`date`) y métricas cuantitativas (`number`).
- **Inversión de Ejes (Swap X ⇄ Y):**
  - Toda implementación de drop-zones de ejes debe contar con el botón de intercambio bidireccional `X ⇄ Y` y reajuste inteligente de funciones agregadas (`COUNT` vs `SUM`).
- **Filtros Locales e Introspección DuckDB:**
  - Los filtros específicos de tarjeta se estructuran en `localFilters: LocalFilter[]`, permitiendo conmutar su estado On/Off individualmente y consultar valores existentes mediante `SELECT DISTINCT` en DuckDB.
- **Visual Segmentador (Slicer):**
  - Los segmentadores en lienzo operan sobre una dimensión y disparan mutaciones sobre `globalFilters`, permitiendo segmentar dinámicamente todo el reporte con un solo clic.
- **Respaldo Accesible:** Todas las zonas de colocación deben conservar un selector desplegable alternativo para analistas que utilicen navegación exclusiva por teclado o ratón sin arrastre.
- **Sincronización Bidireccional:** Todo cambio realizado en la subpestaña `Format` (título, leyenda, notas al pie) debe sincronizarse en tiempo real con la tarjeta visual y con la pestaña `Formato` del Ribbon.

### 7. Convenciones de la Vista de Modelo Relacional y Asistente Newbie-Friendly (Fases 7 y 8)
- **Desacoplamiento Arquitectónico (`ModelView.tsx`):**
  - Toda la interacción del grafo de tablas, cálculo de conectores SVG, heurísticas de detección y zoom/paneo reside de forma aislada en `src/components/ModelView.tsx`.
  - Queda prohibido mezclar lógica de dibujo SVG o posicionamiento de nodos en el cuerpo principal de `App.tsx`.
- **Diferenciación Cromática Heurística:**
  - Las tablas de Hechos deben distinguirse con acento Azul/Cian neón (`#007acc`) y pastilla `HECHOS`.
  - Las tablas de Dimensiones descriptivas deben distinguirse con acento Dorado/Ámbar (`#cca700`) y pastilla `DIMENSIÓN`.
- **API de Arrastre Columna a Columna:**
  - Cada fila de columna en un nodo debe ser `draggable={true}` y actuar como drop target cuando el origen pertenezca a otra tabla.
  - Al soltar una columna, debe invocarse `onAddRelation(sourceTable, sourceCol, targetTable, targetCol)`.
- **Algoritmo Heurístico de Detección de Relaciones:**
  - Al implementar o alterar el algoritmo de auto-detección, se debe mantener la normalización léxica (descartando `id_`, `cod_`, `pk_`, `fk_`, `_id`, `_key`, `_code`), la comparación cruzada con nombres de tablas y la validación de familias de tipos en DuckDB.
  - Las sugerencias deben activar el aura luminosa (`.column-detected-aura`) y desplegar el banner flotante con opciones de conexión individual o en bloque (`Conectar Todas`).
- **Motores de Layout Automático:**
  - **Estrella (Radial):** Hechos al centro (`x: 440, y: 200`) y dimensiones en círculo uniforme.
  - **Cascada (Jerárquico):** Dimensiones en la capa superior (`y = 60`) distribuidas horizontalmente a 300px y hechos en la capa inferior (`y = 420`).
- **Explicaciones en Lenguaje Natural:**
  - Todo glifo relacional (`1`, `*`, `1 : * ──▶`) y tarjeta de inspección debe presentar texto legible para principiantes sin tecnicismos SQL forzados.
- **Edición y Recreación Reactiva de Vistas (`EditJoinModal`):**
  - La edición de tipo de unión (`LEFT` vs `INNER`) o la inversión de dirección (`⇄`) debe invocar `onUpdateRelation(oldRel, newRel)`, ejecutando secuencialmente `dropVirtualRelationView()` y `createVirtualRelationView()`.
- **Resolución Obligatoria de Colisiones SQL en DuckDB:**
  - Al generar vistas virtuales (`createVirtualRelationView`), nunca uses `SELECT s.*, t.*` directo. Es imperativo introspeccionar con `PRAGMA table_info` para evitar el error `Duplicate column name` en columnas homónimas o claves compartidas.
- **Inmutabilidad y Descarte Seguro:**
  - Las relaciones solo generan vistas en memoria (`CREATE VIEW`). Ningún archivo CSV en disco puede ser modificado o sobreescrito.
  - La eliminación de relaciones debe ejecutar `DROP VIEW IF EXISTS "view_name"` y actualizar inmediatamente el array `relations`.



