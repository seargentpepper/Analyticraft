# Analyticraft 📊

> **Herramienta de Business Intelligence de escritorio, minimalista, local-first y de código abierto para PyMEs.**

Analyticraft permite a analistas, contadores y directores procesar, modelar y visualizar datos históricos con velocidad instantánea, sin la sobrecarga ni los costos de licencias en la nube de herramientas corporativas tradicionales como Power BI o Metabase.

---

## ⚡ Características Principales

- **Local-First & Privacidad Absoluta:** Todo se procesa en tu ordenador con **DuckDB** en memoria. Cero servidores externos, cero telemetría y cero dependencias en la nube.
- **Cero Fricción al Compartir:** Exporta dashboards completos e interactivos a un **único archivo `.html` autocontenido** que cualquier directivo abre con doble clic en su navegador web.
- **Entrada de Datos Estándar (CSV):** Diseñado deliberadamente para consumir archivos CSV individuales con detección automática de esquemas y máximo rendimiento.
- **Hot Swap de Datos (↻):** Reemplaza o actualiza el archivo de una tabla en caliente sin perder tus gráficos, títulos ni configuraciones del lienzo.
- **Arquitectura de Interfaz Power BI Desktop:** Distribución espacial 100% familiar (Cinta Ribbon, barra de vistas de 3 modos, paneles laterales acoplables y navegación por páginas).
- **Vista de Datos (Solo Lectura) & Filosofía CSV:** Exploración ágil de registros crudos sin mutación de celdas, garantizando reproducibilidad y derivando los cambios al Hot Swap atómico del CSV.
- **Modelador Relacional Visual (Esquema de Estrella):** Vinculación gráfica de tablas y dimensiones mediante líneas conectoras (1 a *), flechas de propagación de filtros y herramientas amigables para principiantes.
- **Persistencia Profesional y Empaquetado Estructurado:** Guardado de proyectos en carpetas persistentes del sistema de archivos con selector explícito (`showDirectoryPicker()`), memoria de ruta activa en la TitleBar (`[Carpeta]`), respaldos seriados continuos en `/backups/` (`_backup_NNN`), subcarpeta `/data/` para fuentes CSV, guardado en caliente in-place (`Ctrl+S`) e instantáneas portables `.analyticraft`.
- **Arranque Limpio y Libre de Distracciones:** Inicio estrictamente en blanco y libre de datos de muestra forzados o marcas ficticias; interfaz orientada directamente a importar archivos CSV reales del negocio desde el primer segundo.
- **Estética Workbench Photoshop/GIMP:** Interfaz en grises oscuros industriales (`#1e1e1e` - `#2d2d2d`) con tipografía blanca semibold/bold de alto contraste que respeta tu vista y resalta tus datos.
- **17 Temas para Gráficos:** Catálogo de temas que se aplica al unísono a las tarjetas sin alterar la UI del Studio (Básicos, Multicolor, estilo iWork/Numbers y Anillos de Actividad Fitness).

---

## 🖥️ Arquitectura de Interfaz: Inspiración Power BI + Filosofía Local-First

Analyticraft rediseña su interfaz adoptando los estándares de **Power BI Desktop**, permitiendo a cualquier analista o usuario de negocios operar la herramienta desde el minuto cero sin curva de aprendizaje:

```
┌────────────────────────────────────────────────────────────────────────┐
│  BARRA DE TÍTULO: [📁 Abrir] [💾 Guardar] [📁+ Como] [↶] [↷]  [Carpeta] Proyecto.analyticraft*  [ ? ] │
├────────────────────────────────────────────────────────────────────────┤
│  CINTA RIBBON: [Archivo] [Inicio] [Insertar] [Modelado] [Ver] [Formato]│
├──────┬───────────────────────────────────────────┬────────┬────────────┤
│BARRA │ LIENZO DE TRABAJO (CANVAS)                │PANELES │CAMPOS      │
│VISTAS│                                           │FORMATO │(FIELDS)    │
│      │ [Banner de KPIs - Total Ventas | Margen]  │        │            │
│ [📊] │                                           │Visuals │📁 Sales    │
│Report│ ┌───────────────────┐ ┌──────────────────┐│[📊][🥧] │  # Venta   │
│      │ │ Ventas por Región │ │ Cierres x Equipo ││[📈][⭕] │  📅 Fecha  │
│ [📋] │ └───────────────────┘ └──────────────────┘│        │  Abc Tienda│
│Data  │ ┌───────────────────┐ ┌──────────────────┐│Build   │            │
│      │ │ P&L Cascada       │ │ Mix de Producto  ││Format  │📁 Stores   │
│ [🕸️] │ └───────────────────┘ └──────────────────┘│        │  # StoreKey│
│Model │                                           │        │  Abc Ciudad│
├──────┴───────────────────────────────────────────┴────────┴────────────┤
│ PÁGINAS Y ZOOM: [Página 1] [Página 2] [+]   |   Pág 1 de 2  |  [-] 100% [+]│
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Barra de Vistas Lateral (3 Modos Esenciales)
1. **Vista de Informe (Report View):** Lienzo visual para estructurar gráficos, métricas y tarjetas KPI interactivas.
2. **Vista de Datos (Data View - Solo Lectura):** Visor en cuadrícula de los registros crudos cargados en DuckDB.
   - **¿Por qué es estrictamente de Solo Lectura y no permite editar celdas?**
     En analítica profesional, permitir la alteración arbitraria de celdas en el visor de BI **destruye la fuente única de verdad (Single Source of Truth)**, genera discrepancias irreconciliables con los sistemas de origen (ERP, CRM, SQL) y corrompe las relaciones lógicas del modelo.
     En Analyticraft, la integridad de los datos es sagrada: **para corregir o alterar registros, el flujo recomendado es modificar el archivo CSV original y realizar un Hot Swap (↻)**. DuckDB reinserta los datos en memoria en menos de 50 milisegundos sin perder configuraciones, títulos ni filtros en el lienzo.
3. **Vista de Modelo (Model View):** Diagrama relacional de grafos para enlazar tablas de dimensiones (`Stores`, `Calendar`) con tablas de hechos (`Sales`) mediante drag & drop visual, con flechas de flujo y cardinalidad `1` a `*`. Incluye soporte *Newbie-Friendly* con auto-detección y auto-alineación semántica en cascada.

### 2. Paneles Laterales y Cinta Ribbon
- **Cinta Ribbon (Superior):** Acceso contextual organizado a herramientas de portapapeles, inserción de visuales, consultas CSV, medidas SQL y temas.
- **Panel de Visualizaciones & Formato (Derecha):** Selector visual en cuadrícula de tipos de gráfico y personalización detallada (`Build` para asignación de campos y `Format` para propiedades visuales).
- **Panel de Campos (FIELDS):** Estructura jerárquica de tablas cargadas con tipado visible (`#`, `Abc`, `📅`).
- **Navegación por Páginas:** Barra inferior para intercambiar solapas de reportes ejecutivos con control de zoom del lienzo.

---

## 🚀 Puesta en Marcha Rápida

### Prerrequisitos
- **Node.js:** v20+ o v24+
- **Rust & Cargo:** v1.75+ (instalado vía `rustup`)
- **Microsoft C++ Build Tools & Windows SDK** (en Windows)

### Comandos de Ejecución
```bash
# 1. Clonar el repositorio
git clone https://github.com/seargentpepper/Analyticraft.git
cd Analyticraft

# 2. Instalar dependencias
npm install

# 3. Iniciar la aplicación nativa de escritorio (Tauri)
npm run tauri dev

# 4. (Opcional) Iniciar el Studio en modo navegador web
npm run dev
```

---

## 📚 Documentación y Enlaces

- **[Wiki del Proyecto](./docs/Índice%20de%20la%20Wiki.md):** Documentación a fondo sobre la visión, arquitectura, flujos de datos y diseño del ecosistema.
  - [Página 1: Visión y Filosofía](./docs/Página%201%20Home%20(Visión%20y%20Filosofía)%20·%20seargentpepperAnalyticraft%20Wiki.md)
  - [Página 2: Arquitectura y Stack Tecnológico](./docs/Página%202%20Arquitectura%20y%20Stack%20Tecnológico%20·%20seargentpepperAnalyticraft%20Wiki.md)
  - [Página 3: Flujo de Datos y Workflows Técnicos](./docs/Página%203%20Flujo%20de%20Datos%20y%20Workflows%20Técnicos%20·%20seargentpepperAnalyticraft%20Wiki.md)
  - [Página 4: UX y Ecosistema (Studio vs. Viewer)](./docs/Página%204%20UX%20y%20Ecosistema%20(Studio%20vs.%20Viewer)%20·%20seargentpepperAnalyticraft%20Wiki.md)
  - [Página 5: Filosofía de Datos y Guía de Exportación a CSV](./docs/Página%205%20Filosofía%20de%20Datos%20(Por%20qué%20CSV%20y%20Guía%20de%20Exportación).md)
  - [Página 6: Arquitectura de UI y Contratos de Backend (Guía Técnica)](./docs/Página%206%20Arquitectura%20de%20UI%20y%20Contratos%20de%20Backend%20(Guía%20para%20Desarrolladores%20y%20LLMs).md)
  - [Página 8: Cinta de Opciones Contextual (Ribbon) y Despachador](./docs/Página%208%20Cinta%20de%20Opciones%20Contextual%20(Ribbon),%20Despachador%20de%20Comandos%20y%20Portapapeles.md)
- **[ROADMAP.md](./ROADMAP.md):** Mapa de ruta en 18 fases acopladas (UI + Backend) hacia el 100% de la suite.
- **[CHANGELOG.md](./CHANGELOG.md):** Historial detallado de versiones y cambios del proyecto.
- **[CONTRIBUTING.md](./CONTRIBUTING.md):** Directrices técnicas para colaborar, crear temas y respetar los principios del proyecto.

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).
