# Página 4: UX y Ecosistema (Studio vs. Viewer)

El ecosistema de Analyticraft está dividido en dos experiencias claramente diferenciadas que cubren todo el ciclo analítico: la creación técnica por parte del analista y el consumo ejecutivo por parte de la dirección.

---

## 1. Analyticraft Studio (Herramienta de Escritorio)

El Studio es el entorno de trabajo del analista de datos, controller financiero o director operativo.

### Estilo Visual Workbench (Inspiración Photoshop / GIMP)
- **Paleta de Grises Industriales:** La interfaz utiliza tonos grises neutros oscuros (`#1e1e1e`, `#252526`, `#2d2d2d`, `#383838`) que eliminan la fatiga visual, no compiten con el contenido de los gráficos y previenen incompatibilidades con extensiones de modo oscuro de los navegadores.
- **Tipografía de Alto Contraste:** Textos en blanco puro (`#ffffff`) con pesos semibold y bold para máxima claridad y legibilidad en pantallas de alta densidad.

### Arquitectura de 3 Paneles y Cintas de Herramientas
1. **Panel Izquierdo (Fuentes de Datos):**
   - Dropzone para arrastre y carga de múltiples archivos CSV.
   - Listado de tablas en memoria, esquema de columnas detectado y tipos de datos.
   - Botón de Hot Swap (**↻**) para reemplazo en caliente.
   - Listado de vistas relacionales activas con botón de descarte rápido (**🗑️**).
2. **Lienzo Central (Canvas Interactivo):**
   - Cuadrícula responsiva que aloja las tarjetas de visualización (barras, líneas, áreas, donuts, anillos de actividad, KPIs y tablas).
   - Renderizado dinámico en tiempo real mediante Apache ECharts.
3. **Panel Derecho (Inspector con Sub-pestañas):**
   - **Pestaña "Campos y Datos":** Selección de tabla fuente, dimensión (Eje X / GROUP BY), métrica numérica (Eje Y) y función de agregación SQL. Incluye textos de ayuda explicativos bajo cada campo.
   - **Pestaña "Estilo y Leyendas":** Selector de tipos de gráfico, activación de leyendas superiores y área de texto para redactar descripciones / notas al pie de la tarjeta.
4. **Cinta Superior y Sub-Toolbar:**
   - Barra de filtros globales multivariable (`=`, `!=`, `LIKE`, `>`, `<`).
   - Botón del **Modelador Relacional** con previsualización esquemática.
   - Selector global de **Temas para Tarjetas** (17 perfiles de color sin alterar la UI del Studio).
   - Acciones de Guardar y Abrir proyectos (`.analyticraft`).

---

## 2. El "Viewer" (Reporte HTML Autocontenido)

El entregable final está diseñado para el director general, socio o manager que necesita consumir la información con cero complicaciones.

### El Proceso de Compilación Cero Fricción:
1. El analista hace clic en el botón verde **"Exportar .HTML"** en el Studio.
2. Analyticraft compila el diseño visual, las consultas precalculadas, el tema seleccionado, las descripciones de las tarjetas y el motor de renderizado dentro de **un único archivo `.html`**.
3. El archivo resultante es completamente autocontenido (con CDN para ECharts y fuentes seguras).

### Beneficios para el Usuario Final:
- **Doble Clic Inmediato:** Se abre en Google Chrome, Microsoft Edge, Mozilla Firefox o Safari al instante.
- **Sin Instalaciones ni Registros:** No requiere instalar Power BI Desktop, ni crear cuentas de Microsoft 365, ni configurar servidores.
- **Interactividad Total:** Incluye tooltips interactivos, redimensionamiento adaptativo, leyendas informativas y notas al pie contextuales.
- **Soberanía y Seguridad:** El archivo puede enviarse por correo electrónico, guardarse en una memoria USB o archivarse en la red local de la empresa con total privacidad.