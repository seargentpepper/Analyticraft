# Contribuir a Analyticraft

Gracias por el interés en colaborar con Analyticraft. Este proyecto busca ofrecer una herramienta de Business Intelligence de escritorio, minimalista, orientada a la privacidad (local-first) y de alto rendimiento para PyMEs y analistas independientes.

Para mantener una base de código robusta, predecible y fácil de mantener entre todos los colaboradores, solicitamos seguir estrictamente estas directrices.

---

## 1. Principios Fundamentales

Toda contribución al repositorio debe alinearse con estos cinco principios no negociables:

1. **Procesamiento Local y Privacidad Absoluta (Local-First):**
   - Todo cómputo analítico se ejecuta en la máquina local mediante DuckDB-WASM en memoria.
   - Queda estrictamente prohibido introducir telemetría externa, servicios en la nube o dependencias que envíen datos de usuario fuera del equipo local.
2. **Inmutabilidad en Vista de Datos (Data View Solo Lectura):**
   - El visor tabular de datos crudos es de solo lectura. Los archivos CSV en disco constituyen la Fuente Única de Verdad (Single Source of Truth).
   - Queda prohibido añadir edición directa de celdas o mutaciones SQL arbitrarias (`UPDATE`/`INSERT`). Cualquier corrección en los datos debe realizarse en el CSV original y sincronizarse mediante el botón de Hot Swap (`↻`).
3. **Ergonomía Power BI Desktop y Estética Workbench Industrial:**
   - La disposición espacial replica el estándar de herramientas profesionales de Business Intelligence: Barra superior de título, Cinta Ribbon, Riel de 3 Vistas (`Report`, `Data`, `Model`), Paneles acoplables a la derecha (`Visualizations`, `Fields`) y barra inferior de páginas.
   - La interfaz utiliza una paleta en grises industriales (`#1e1e1e` a `#2d2d2d`) con tipografía blanca en pesos semibold y bold para garantizar máximo contraste y legibilidad.
4. **Aislamiento Estricto de Temas:**
   - Los temas de gráficos (`src/lib/themes.ts`) modifican exclusivamente el interior de las tarjetas visuales (`ChartCard.tsx`). La estructura de la aplicación (shell, Ribbon, paneles y barras laterales) nunca cambia de color con el tema de datos.
5. **Seguridad y Sanitización en Exportaciones:**
   - El archivo `.html` exportado es autocontenido y se comparte con terceros. Todo texto de usuario o dato proveniente de un CSV debe ser sanitizado con `escapeHtml` y `safeJson` (`src/lib/exporter.ts`). Queda prohibida la inyección de cadenas crudas vía `innerHTML`.

---

## 2. Requisitos del Sistema y Entorno Local

Analyticraft utiliza una arquitectura híbrida compuesta por un backend nativo en Rust y un frontend web compilado a través de Tauri v2 y Vite.

### Herramientas Requeridas:
- **Rust y Cargo:** Versión 1.75.0 o superior (instalación recomendada vía `rustup`).
- **Node.js:** Versión LTS activa (v20.x o v22.x).
- **Gestor de paquetes:** `pnpm` (recomendado) o `npm` v10+.
- **Dependencias del sistema para Tauri:**
  - **Linux (Debian/Ubuntu):** `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`.
  - **Windows:** Microsoft Visual Studio C++ Build Tools (con SDK de Windows 10/11) y WebView2 Runtime (incluido por defecto en Windows 10/11).
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`).

### Puesta en Marcha:
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/seargentpepper/Analyticraft.git
   cd Analyticraft
   ```
2. Instalar dependencias e iniciar la aplicación en modo desarrollo:
   ```bash
   pnpm install
   pnpm run tauri dev
   ```
   *(o alternativamente con `npm install` y `npm run tauri dev`)*.
3. Ejecutar la suite de pruebas unitarias y verificar compilación:
   ```bash
   pnpm test       
   npm run build   
   ```

---

## 3. Mapa de Arquitectura y Estructura de Módulos

Antes de realizar cambios, consulta la ubicación y responsabilidad de cada módulo:

```
Analyticraft/
├── src/
│   ├── components/            # Componentes React de la interfaz
│   │   ├── ChartCard.tsx          # Tarjeta visual interactiva con renderizado Apache ECharts
│   │   ├── ModelView.tsx          # Modelador relacional (lienzo SVG, drag & drop de claves)
│   │   ├── FieldsPanel.tsx        # Panel derecho con árbol de tablas, columnas y tipos de dato
│   │   ├── VisualizationsPanel.tsx # Matriz de visuales, drop-zones de ejes y panel de formato
│   │   ├── SaveProjectModal.tsx   # Diálogo modal de guardado estructurado y copias seriadas
│   │   ├── OpenProjectModal.tsx   # Diálogo de apertura de archivos .analyticraft y carpetas
│   │   └── ModelExplanationModal.tsx # Modal asistido de conceptos relacionales y JOINs
│   ├── lib/                   # Lógica de datos, utilidades y servicios puros
│   │   ├── duckdb.ts              # Inicialización de DuckDB-WASM, vistas y consultas vectorizadas
│   │   ├── chartOptions.ts        # Constructores de opciones de Apache ECharts por tipo de gráfico
│   │   ├── themes.ts              # Catálogo de 17 temas para tarjetas visuales y dashboards
│   │   ├── exporter.ts            # Motor de compilación a archivo .html interactivo autocontenido
│   │   ├── projectStorage.ts      # Persistencia en disco, empaquetado y copias de seguridad
│   │   ├── modelSynthesis.ts      # Algoritmos heurísticos de detección y esquemas en estrella
│   │   └── sampleData.ts          # Definiciones y esquemas base
│   ├── types/
│   │   └── dashboard.ts           # Definiciones TypeScript de modelos, gráficos, vistas y filtros
│   ├── App.tsx                # Shell de la aplicación: TitleBar, RibbonMenu, LeftViewSwitcher
│   ├── App.css                # Sistema de tokens CSS, paleta Workbench y maquetación
│   └── main.tsx               # Punto de entrada frontend React 19
├── src-tauri/                 # Backend de escritorio nativo Tauri v2 (Rust)
│   ├── src/main.rs                # Inicialización del runtime y handlers nativos
│   ├── Cargo.toml                 # Configuración de crates y dependencias Rust
│   └── tauri.conf.json            # Configuración de ventana, permisos y seguridad de Tauri
└── public/                    # Archivos estáticos y binarios WASM de DuckDB
```

---

## 4. Directrices de Interfaz y Experiencia de Usuario (UI/UX)

La interfaz debe mantener la coherencia espacial y estética inspirada en Power BI Desktop:

### Jerarquía de Contenedores:
- **TitleBar:** Barra superior con acciones inmediatas (`Guardar`, `Deshacer`, `Rehacer`), la pastilla de proyecto (`[Carpeta] Archivo.analyticraft*`) y los controles de ventana.
- **RibbonMenu:** Menú tipo cinta con pestañas contextuales (`Archivo`, `Inicio`, `Insertar`, `Modelado`, `Ver`, `Formato`). Toda acción se canaliza de forma desacoplada mediante el despachador de acciones (`RibbonAction`).
- **LeftViewSwitcher:** Barra lateral izquierda permanente con los selectores de las 3 vistas principales:
  - `ReportView` (Lienzo interactivo de tarjetas métricas y gráficos).
  - `DataView` (Visor tabular de datos crudos).
  - `ModelView` (Lienzo relacional de tablas y diagramas de estrella).
- **RightPaneDock:** Paneles acoplables a la derecha:
  - `Visualizations` (Selector de tipos de gráficos, drop-zones de Eje X / Eje Y y ajustes de formato).
  - `Fields` (Árbol jerárquico de tablas y columnas con tipado visual: `#`, `Abc`, `Fecha`, `Booleano`).
- **BottomPageBar:** Barra inferior con pestañas horizontales de páginas y control de zoom.

### Sistema de Diseño Workbench Industrial:
- Toda contribución de estilos debe usar exclusivamente las variables CSS declaradas en `src/App.css`:
  - Fondos: `--bg-app` (`#1e1e1e`), `--bg-topbar` (`#252526`), `--bg-panel` (`#2d2d2d`), `--bg-subtle` (`#383838`).
  - Bordes: `--border-app` (`#3e3e42`), `--border-focus` (`#0e639c`).
  - Tipografía: `--text-white` (`#ffffff`) en peso `semibold` o `bold` para máximo contraste.
- No importar fuentes externas privativas ni componentes de diseño con fondos claros.

---

## 5. Convenciones de Shell, Vistas y Navegación

1. **Navegación Unificada sin Enrutador Web:**
   - La alternancia entre vistas se controla exclusivamente mediante el estado React `activeView: 'report' | 'data' | 'model'`. No agregues enrutadores basados en hash ni historial de navegador para evitar inconsistencias en el runtime de Tauri.
2. **Atajos Globales de Teclado:**
   - `Ctrl+1`, `Ctrl+2`, `Ctrl+3` para alternar entre Informe, Datos y Modelo.
   - `Ctrl+S` para guardar proyecto sobre la carpeta vinculada.
   - `Ctrl+Z` y `Ctrl+Y` para deshacer y rehacer.
   - **Regla obligatoria:** Todo listener global de teclado debe comprobar `e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement` antes de capturar atajos, evitando interferir cuando el usuario edita entradas de texto.
3. **Gestión de Historial (Undo / Redo):**
   - Antes de mutar el estado de tarjetas, filtros o relaciones, debe invocarse `recordSnapshot()` para registrar el estado previo en la pila inmutable.
4. **Liberación de Memoria y Ciclos de CPU:**
   - Al cambiar de vista o cerrar tarjetas, las instancias de Apache ECharts deben desmontarse limpiamente invocando `chartInstance.dispose()`.

---

## 6. Motor de Datos DuckDB e Integridad Analítica

1. **Inmutabilidad Absoluta en DataView:**
   - La vista de datos es estrictamente de solo lectura. Queda prohibido añadir campos de texto editables dentro del grid de datos. Las correcciones se realizan en el CSV original y se recargan con Hot Swap (`↻`).
   - El banner explicativo de solo lectura en la parte superior de DataView debe permanecer visible en todo momento.
2. **Paginación Virtualizada:**
   - Las consultas sobre tablas crudas deben ejecutarse bajo demanda utilizando cláusulas `LIMIT 100 OFFSET ?` para asegurar tiempos de respuesta inferiores a 16 milisegundos incluso en conjuntos de más de 500.000 registros.
3. **Manejo Seguro de Relaciones y JOINs (`ModelView.tsx`):**
   - El cálculo de conexiones SVG, zoom, paneo y auto-alineación debe permanecer encapsulado en `src/components/ModelView.tsx` sin mezclarse en `App.tsx`.
   - Diferenciación visual: Cabeceras con pastilla `HECHOS` en azul (`#007acc`) y `DIMENSIÓN` en ámbar (`#cca700`).
   - Resolución obligatoria de colisiones: Al crear vistas virtuales en DuckDB (`createVirtualRelationView`), no utilices `SELECT s.*, t.*` directo. Es obligatorio introspeccionar las columnas con `PRAGMA table_info` para prevenir errores de nombres duplicados en claves compartidas.
   - Eliminación segura: Toda relación eliminada debe ejecutar `DROP VIEW IF EXISTS "view_name"` de inmediato, purgando la vista virtual de la memoria sin alterar ningún archivo físico.

---

## 7. Catálogo de Temas y Reglas para Gráficos

Los temas de gráficos se administran exclusivamente en `src/lib/themes.ts`:

### Cómo Agregar un Nuevo Tema:
1. Añadir el identificador a la unión de tipos `CardTheme` en `src/types/dashboard.ts`.
2. Registrar el objeto del tema en `THEMES` (`src/lib/themes.ts`) especificando:
   - `label`: Nombre descriptivo legible.
   - `group`: Grupo de pertenencia (Básicos, Multicolor, iWork, Fitness).
   - Colores de fondo y borde de tarjeta.
   - `palette`: Arreglo de colores hexadecimales para series y categorías.
   - `mode`: `"gradient"` (look uniforme con degradado) o `"multi"` (colores alternos por categoría).
3. No modifiques `ChartCard.tsx` ni `exporter.ts` para agregar estilos de tema; ambos componentes consumen directamente `buildChartOption()` de `src/lib/chartOptions.ts`.
4. Comprobar que el contraste del texto sea blanco semibold legible contra el fondo configurado.

### Reglas para Diseños Inspirados en Apple (iWork y Anillos Fitness):
- **Permitido:** Emplear paletas hexadecimales públicas, bordes redondeados (`borderRadius`), gradientes vectoriales y anillos con `roundCap` mediante Apache ECharts.
- **Prohibido:** Utilizar o referenciar componentes privativos de Apple (`HKActivityRingView`, Swift Charts, SwiftUI), los cuales son incompatibles con plataformas cruzadas en Tauri.
- **Prohibido:** Incluir fuentes comerciales de Apple (SF Pro, New York), glifos privativos (SF Symbols) o marcas comerciales registradas. Utiliza nombres descriptivos ("Inspirado en iWork", "Anillos de Actividad") y la pila de fuentes de sistema `-apple-system, 'SF Pro Display', 'Inter', sans-serif`.
- **Prohibido:** Añadir librerías alternativas de gráficos (como ApexCharts, Chart.js o Recharts) para replicar aspectos visuales que Apache ECharts ya resuelve de manera nativa.

---

## 8. Protocolo de Contribución y Calidad de Código

Para garantizar revisiones de código ágiles y mantener la estabilidad del proyecto:

1. **Límite de Modificación (Radio de Impacto Controlado):**
   - Cíñete estrictamente a los archivos y funciones relacionados con la funcionalidad o corrección del Pull Request.
   - Quedan prohibidas las refactorizaciones colaterales no solicitadas (*drive-by refactorings*) o modificaciones cosméticas en archivos fuera del alcance inmediato de la tarea.
2. **Inmunidad de Dependencias:**
   - Antes de proponer una nueva dependencia en `package.json` o `Cargo.toml`, verifica si la funcionalidad ya está cubierta por librerías existentes en el proyecto (ej. Apache ECharts, DuckDB, Lucide Icons, PapaParse).
   - Cualquier dependencia agregada debe contar con justificación técnica explícita en la descripción del PR y tener versión fijada para evitar rupturas de entorno.
3. **Tipado Estricto en TypeScript:**
   - Todo nuevo modelo, payload de evento o propiedad de componente debe contar con interfaces o tipos estrictos en `src/types/`. Evita el uso de `any`.
4. **Checklist Obligatorio Antes de Abrir un Pull Request:**
   - [ ] Ejecutar `pnpm test` y confirmar que todas las pruebas pasen en verde.
   - [ ] Ejecutar `npm run build` en la raíz del proyecto y confirmar que compila sin errores de TypeScript ni fallos de Vite.
   - [ ] Comprobar que la aplicación inicia correctamente con `npm run tauri dev`.
   - [ ] Verificar que ninguna celda en la Vista de Datos sea directamente editable.
   - [ ] Comprobar que los temas de gráficos se apliquen a las tarjetas sin alterar la UI oscura del Studio.
   - [ ] Asegurarse de no incluir secretos, tokens ni rutas absolutas locales en el código.
   - [ ] Escribir descripciones de Pull Request claras, detallando el objetivo del cambio y los pasos manuales para validarlo.
