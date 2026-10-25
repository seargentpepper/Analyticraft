# Página 2: Arquitectura y Stack Tecnológico

Para garantizar velocidad instantánea, portabilidad y bajo consumo de memoria, Analyticraft divide el procesamiento analítico y la capa gráfica mediante un stack moderno y eficiente:

```
┌────────────────────────────────────────────────────────┐
│                   Analyticraft Studio                   │
├────────────────────────────────────────────────────────┤
│  Frontend (Capa de Presentación React 19 + TypeScript)  │
│  - Workbench gris Photoshop/GIMP (#1e1e1e - #2d2d2d)   │
│  - Apache ECharts (Renderizado local interactivo)       │
│  - Registro global de temas desacoplado de la UI        │
├────────────────────────────────────────────────────────┤
│  Motor Analítico en Memoria (DuckDB Vectorizado)       │
│  - SQL Estándar sin sobrecarga DAX                     │
│  - Ingesta y detección de esquemas CSV ultra-eficiente  │
│  - Vistas virtuales para Esquema en Estrella (JOINs)    │
├────────────────────────────────────────────────────────┤
│  Capa de Escritorio Nativa (Tauri v2 + Rust)           │
│  - Ejecutables ultraligeros sin Chromium empaquetado    │
│  - Uso de WebView2 (Windows) / WebKit nativo            │
│  - Acceso seguro al sistema de archivos local           │
└────────────────────────────────────────────────────────┘
```

---

## 1. Capa de Escritorio (Framework): Tauri (Rust)
- **¿Por qué Tauri?:** A diferencia de suites basadas en Electron (que obligan a empaquetar una instancia completa de Chromium y Node.js, pesando más de 150 MB y consumiendo cientos de megabytes de RAM en reposo), Tauri aprovecha el motor de renderizado nativo del sistema operativo (WebView2 en Windows, WebKit en macOS/Linux).
- **Resultado:** Ejecutables nativos de pocos megabytes con tiempos de arranque casi instantáneos y un consumo base de RAM mínimo.

---

## 2. Motor de Datos y Analítica: DuckDB (In-Memory Vectorizado)
- **¿Por qué DuckDB?:** Es conocido en la industria como el "SQLite para la analítica".
- **Ventajas:**
  - Corre en el mismo proceso de la aplicación sin requerir servidores externos o contenedores Docker.
  - Ejecuta consultas vectorizadas por columnas altamente optimizadas sobre CPUs modernas.
  - Es capaz de procesar millones de registros de archivos CSV planos en fracciones de segundo.
  - Soporta SQL estándar completo (funciones analíticas, agregaciones, `GROUP BY`, `JOIN`, CTEs), evitando la necesidad de inventar o aprender lenguajes propietarios como DAX.

---

## 3. Interfaz Gráfica y Visualizaciones: TypeScript + React 19 + Apache ECharts
- **Tipado Estricto con TypeScript:** Seguridad integral en las definiciones del proyecto, esquemas de tablas, filtros globales y configuración de gráficos.
- **Apache ECharts:** Motor de renderizado visual de alto rendimiento basado en Canvas. Permite manipular miles de puntos de datos, barras con esquinas redondeadas, gráficos polares/anillos concéntricos y gradientes lineales con aceleración gráfica local fluida.
- **Arquitectura de Temas Centralizada:** El sistema de estilos de tarjetas (`src/lib/themes.ts`) y el constructor de opciones (`src/lib/chartOptions.ts`) garantizan que el dashboard dentro del Studio y el archivo `.html` exportado rendericen de forma idéntica con el 100% de coherencia visual.