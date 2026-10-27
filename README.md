# Analyticraft

Herramienta de Business Intelligence de escritorio, minimalista, orientada a la privacidad (local-first) y de código abierto para PyMEs.

Analyticraft permite a analistas, contadores y directores procesar, modelar y visualizar datos históricos con velocidad instantánea, sin la sobrecarga ni los costos de licencias en la nube de herramientas corporativas tradicionales como Power BI o Metabase.

---

## Características Principales

- **Procesamiento Local y Privacidad Absoluta:** Todo se procesa en el ordenador del usuario mediante DuckDB-WASM en memoria. Cero servidores externos, cero telemetría y cero dependencias en la nube.
- **Cero Fricción al Compartir:** Exporta dashboards completos e interactivos a un único archivo `.html` autocontenido que cualquier directivo abre con doble clic en su navegador web sin instalar dependencias.
- **Entrada de Datos Estándar (CSV):** Diseñado deliberadamente para consumir archivos CSV individuales con detección automática de esquemas y máximo rendimiento.
- **Hot Swap de Datos (↻):** Reemplaza o actualiza el archivo de una tabla en caliente sin perder gráficos, títulos ni configuraciones del lienzo.
- **Arquitectura de Interfaz Power BI Desktop:** Distribución espacial familiar compuesta por Cinta Ribbon, barra lateral de 3 vistas, paneles acoplables y navegación por páginas.
- **Vista de Datos (Solo Lectura) y Filosofía CSV:** Exploración ágil de registros crudos sin mutación de celdas, garantizando reproducibilidad y derivando los cambios al Hot Swap atómico del CSV original.
- **Modelador Relacional Visual (Esquema de Estrella):** Vinculación gráfica de tablas y dimensiones mediante líneas conectoras (1 a *), flechas de propagación de filtros y herramientas para principiantes.
- **Persistencia Profesional y Empaquetado Estructurado:** Guardado de proyectos en carpetas persistentes del sistema de archivos con selector explícito (`showDirectoryPicker()`), memoria de ruta activa en la TitleBar, respaldos seriados continuos en `/backups/` (`_backup_NNN`), subcarpeta `/data/` para fuentes CSV, guardado in-place (`Ctrl+S`) e instantáneas portables `.analyticraft`.
- **Arranque Limpio y Libre de Distracciones:** Inicio estrictamente en blanco y libre de datos de muestra forzados; interfaz orientada directamente a importar archivos CSV reales del negocio desde el primer segundo.
- **Estética Workbench Industrial:** Interfaz en grises neutros oscuros (`#1e1e1e` a `#2d2d2d`) con tipografía blanca semibold/bold de alto contraste que respeta la vista y resalta los datos.
- **17 Temas para Gráficos:** Catálogo de temas que se aplica al unísono a las tarjetas sin alterar la interfaz del Studio (Básicos, Multicolor, estilo iWork/Numbers y Anillos de Actividad Fitness).

---

## Flujo de Trabajo Típico

1. **Importar Datos:** Cargar uno o más archivos CSV locales desde la pestaña Inicio o el panel Campos. DuckDB detecta los tipos de columna automáticamente en milisegundos.
2. **Modelar Relaciones:** Cambiar a la Vista de Modelo para enlazar tablas de dimensiones con tablas de hechos mediante arrastre visual de columnas o mediante el botón de auto-detección.
3. **Diseñar el Informe:** En la Vista de Informe, arrastrar campos hacia las tarjetas visuales (barras, líneas, áreas, donas, anillos o KPIs) y aplicar filtros reactivos.
4. **Compartir Dashboard:** Exportar el proyecto a un archivo `.html` autocontenido con un clic, listo para enviar por correo o mensajería sin requerir servidores ni licencias.

---

## Stack Tecnológico

| Componente | Tecnología | Rol en la Arquitectura |
|---|---|---|
| Runtime de Escritorio | Tauri v2 (Rust 1.75+) | Ventana nativa liviana, consumo mínimo de RAM y acceso seguro al sistema de archivos |
| Motor Analítico | DuckDB-WASM | Procesamiento columnar vectorizado en memoria y ejecución de consultas SQL analíticas |
| Frontend Core | React 19 + TypeScript + Vite 8 | Interfaz reactiva desacoplada, tipado estricto y compilación rápida |
| Motor de Visualización | Apache ECharts 6 + Lucide Icons | Renderizado interactivo de alto rendimiento en Canvas y sistema iconográfico |
| Sistema de Diseño | CSS Workbench Industrial | Paleta neutra oscura (`#1e1e1e` a `#2d2d2d`) con tokens de diseño dedicados |

---

## Arquitectura de Interfaz: Estándar Power BI Desktop

Analyticraft estructura su espacio de trabajo replicando la anatomía de Power BI Desktop, permitiendo una adopción inmediata sin curva de aprendizaje:

```
┌────────────────────────────────────────────────────────────────────────┐
│  BARRA DE TITULO: [Abrir] [Guardar] [Guardar Como] [Deshacer] [Rehacer]│
│                   [Carpeta] Proyecto.analyticraft*                     │
├────────────────────────────────────────────────────────────────────────┤
│  CINTA RIBBON: [Archivo] [Inicio] [Insertar] [Modelado] [Ver] [Formato]│
├──────┬───────────────────────────────────────────┬────────┬────────────┤
│RIEL  │ LIENZO DE TRABAJO (CANVAS)                │PANELES │CAMPOS      │
│VISTAS│                                           │FORMATO │(FIELDS)    │
│      │ [Banner de KPIs - Total Ventas | Margen]  │        │            │
│[Rep] │                                           │Visuals │[Tbl] Sales │
│Report│ ┌───────────────────┐ ┌──────────────────┐│[Bar]   │  # Venta   │
│      │ │ Ventas por Region │ │ Cierres x Equipo ││[Line]  │  Fecha     │
│[Dat] │ └───────────────────┘ └──────────────────┘│[Pie]   │  Abc Tienda│
│Data  │ ┌───────────────────┐ ┌──────────────────┐│[Table] │            │
│      │ │ P&L Cascada       │ │ Mix de Producto  ││Build   │[Tbl] Stores│
│[Mod] │ └───────────────────┘ └──────────────────┘│Format  │  # StoreKey│
│Model │ └───────────────────┘ └──────────────────┘│        │  Abc Ciudad│
├──────┴───────────────────────────────────────────┴────────┴────────────┤
│PAGINAS Y ZOOM: [Pagina 1] [Pagina 2] [+]   |  Pag 1 de 2  | [-]100% [+]│
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Barra de Vistas Lateral (3 Modos Principales)
1. **Vista de Informe (Report View):** Lienzo analítico interactivo para organizar gráficos, tarjetas métricas y segmentadores.
2. **Vista de Datos (Data View - Solo Lectura):** Cuadrícula tabular de alta densidad para inspeccionar los registros crudos cargados en DuckDB.
   - **Por qué es estrictamente de solo lectura:** Permitir la edición directa de celdas en el visor destruye la Fuente Única de Verdad (*Single Source of Truth*), provocando discrepancias con los sistemas origen (ERP, CRM) y corrompiendo las relaciones lógicas. Para corregir registros, la regla es modificar el CSV original y realizar un Hot Swap (`↻`).
3. **Vista de Modelo (Model View):** Diagrama relacional para enlazar dimensiones y hechos mediante drag & drop, con cálculo de cardinalidad (`1` a `*`), auto-alineación en cascada y sugerencias heurísticas asistidas.

### 2. Paneles Laterales y Cinta Ribbon
- **Cinta Ribbon (Superior):** Acceso contextual organizado a herramientas de portapapeles, inserción de visuales, consultas CSV, medidas SQL y temas.
- **Panel de Visualizaciones (Derecha):** Selector visual de gráficos y subpestañas `Build` (drop-zones de ejes) y `Format` (ajustes de títulos, leyendas y notas).
- **Panel de Campos (FIELDS):** Árbol jerárquico de tablas y columnas con tipado visual explícito (`#` numérico, `Abc` texto, fecha y booleano).
- **Navegación por Páginas (Inferior):** Pestañas de reportes ejecutivos con selector dinámico y control de zoom.

---

## Puesta en Marcha

### Prerrequisitos
- **Node.js:** Versión LTS activa (v20.x o v22.x)
- **Rust y Cargo:** v1.75+ (instalado vía `rustup`)
- **Gestor de paquetes:** `pnpm` (recomendado) o `npm` v10+
- **Compilador C++ (Windows):** Microsoft Visual Studio C++ Build Tools y Windows SDK

### Instalación y Ejecución
```bash
# 1. Clonar el repositorio
git clone https://github.com/seargentpepper/Analyticraft.git
cd Analyticraft

# 2. Instalar dependencias
pnpm install
# (o alternativamente: npm install)

# 3. Iniciar la aplicación nativa de escritorio (Tauri)
pnpm run tauri dev
# (o alternativamente: npm run tauri dev)

# 4. (Opcional) Compilar y verificar tipos estrictos
pnpm run build
```

---

## Documentación y Enlaces

- **[Índice de la Wiki](./docs/Índice%20de%20la%20Wiki.md):** Base de conocimiento central con las 12 páginas de arquitectura, flujos de datos y contratos técnicos del sistema.
- **[ROADMAP.md](./ROADMAP.md):** Hoja de ruta activa con los próximos cambios planificados (*Coming Next*, hacia v0.9 y v1.0).
- **[ROADMAP_DONE.md](./ROADMAP_DONE.md):** Historial técnico completo de todas las fases y mejoras completadas (*Done*, de v0.1 a v0.8.3).
- **[CONTRIBUTING.md](./CONTRIBUTING.md):** Directrices de desarrollo, arquitectura de componentes y checklist para Pull Requests.
- **[CHANGELOG.md](./CHANGELOG.md):** Registro histórico detallado de versiones y cambios notables.


---

## Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE).
