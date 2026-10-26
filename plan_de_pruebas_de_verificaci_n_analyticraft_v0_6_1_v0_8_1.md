# 🧪 Plan de Pruebas de Verificación: Analyticraft (v0.8.1 - v0.8.4)

Este documento detalla una serie de "retos de prueba" (test steps) diseñados para corroborar el estado operativo de las tecnologías núcleo (DuckDB-Wasm, React Fast Refresh, Drag & Drop, Heurísticas Relacionales, Persistencia y Exactitud SQL).

**Objetivo:** Prevenir regresiones y la acumulación de deuda técnica (*zero slop*), validando que la aplicación procese datasets CSV bajo los estándares de inmutabilidad, exactitud analítica y eficiencia esperados.

---

## 🛠️ Preparación
1. Lanza el entorno de desarrollo de Analyticraft (`npm run dev` en Tauri).
2. Asegúrate de tener la consola de DevTools abierta (`F12`) para monitorear consultas DuckDB y posibles errores.
3. Ten a mano dos archivos CSV de prueba (ej. un archivo de ventas/transacciones y uno de clientes/categorías).

---

## 🟢 Reto 1: Arranque Limpio, Importación CSV y Resiliencia HMR (v0.8.2 - v0.8.4)
*Este reto valida que la aplicación inicie en blanco, importe fuentes limpiamente y que la persistencia Singleton de DuckDB sobreviva a los refrescos de React sin corromper el catálogo.*

- [ ] **Paso 1.1:** Abre la aplicación. Verifica que inicie en estado virgen (`Sin_Titulo.analyticraft`, 0 tablas en el panel de Campos y lienzo en blanco sin tablas precargadas).
- [ ] **Paso 1.2:** En el centro del lienzo vacío o desde la cinta `Inicio > Obtener CSV`, haz clic en **`Importar archivo CSV`** y selecciona tu primer archivo CSV.
- [ ] **Paso 1.3:** Comprueba que la tabla aparezca en el acordeón del Panel de Campos (derecha) con su conteo real de registros e iconos de tipo de dato (`#`, `Abc`, `📅`).
- [ ] **Paso 1.4:** Provoca un *Fast Refresh* (guarda un cambio menor en cualquier archivo `.tsx` de tu editor) o cambia el foco de la ventana.
- [ ] **Paso 1.5:** **Validación:** Verifica que la consola no muestre el error de catálogo (`Did you mean "sqlite_temp_master"?`). La tabla debe seguir existiendo y consultable en DuckDB.

---

## 🟡 Reto 2: Exactitud Analítica, Ejes y Filtros Tipados (v0.8.4)
*Prueba de estrés para el motor reactivo de Drag & Drop, la construcción SQL tipada y el ordenamiento temporal.*

- [ ] **Paso 2.1:** Desde la pestaña `Insertar` (o la galería del panel de visuales), crea una nueva tarjeta de tipo **Barras**.
- [ ] **Paso 2.2:** Arrastra una columna categórica (`Abc`) al **Eje X** y una columna numérica (`#`) al **Eje Y**.
- [ ] **Paso 2.3:** Haz clic en el botón **`Invertir Ejes (X ⇄ Y)`**. Comprueba que la agregación se ajuste automáticamente.
- [ ] **Paso 2.4 (Exactitud de Filtros Numéricos - A-03):** En el panel de visuales, agrega un filtro numérico local con operador `>` o `<`. Si filtras por ejemplo `> 2`, comprueba que valores como `10` o `100` permanezcan y NO se comparen como texto alfabético.
- [ ] **Paso 2.5 (Orden Temporal en Líneas - M-01):** Cambia el tipo de visual a **Líneas** (`line`) o **Área** (`area`) y asigna una dimensión de fechas o secuencial al Eje X. Verifica que los puntos se ordenen cronológicamente de izquierda a derecha (`ORDER BY dim ASC`), no por el valor mayor de la métrica.
- [ ] **Paso 2.6 (Segmentador con Búsqueda Reactiva - M-06):** Crea una tarjeta tipo **Segmentador / Slicer**. Escribe en el buscador de la tarjeta un valor que no pertenezca a los primeros 50 más comunes. Comprueba que DuckDB ejecute la búsqueda y filtre el visual dependiente en tiempo real al hacer clic.

---

## 🟠 Reto 3: Grafo Relacional, Layouts y Ergonomía Visual (v0.8.0 - v0.8.2)
*Verificación del esquema lógico en estrella, vistas virtuales y herramientas anti-colisión.*

- [ ] **Paso 3.1:** Presiona `Ctrl+3` para ir a la **Vista de Modelo**.
- [ ] **Paso 3.2:** **Diferenciación Cromática:** Observa los nodos de las tablas. Las tablas de hechos deben lucir cabecera azul/cian (`HECHOS`) y las de dimensiones cabecera dorada/ámbar (`DIMENSIÓN`).
- [ ] **Paso 3.3 (Drag & Drop de Relación):** Arrastra una columna clave desde una tabla hacia la clave correspondiente en otra. Debe trazarse una curva Bézier con conectores `1` y `*`.
- [ ] **Paso 3.4 (Herramientas de Limpieza):** Haz clic en el botón **`Organizar Vista`**. Las tarjetas deben reposicionarse en cuadrícula multinivel sin solapamiento (*Zero-Overlap*).
- [ ] **Paso 3.5 (Modo Compacto y Scroll):** Si una tabla tiene muchas columnas, verifica que se active el scroll vertical interno (`max-height: 250px`) y prueba el botón chevron en la cabecera para colapsarla a 36px.
- [ ] **Paso 3.6 (Atenuación Selectiva - Focus & Dimming):** Posa el cursor sobre una tabla. Las relaciones no conectadas deben atenuarse al 8% de opacidad, resaltando en cian brillante las relaciones activas.
- [ ] **Paso 3.7 (Explicación y Síntesis para LLM):** Haz clic en **`Explicar Modelo`** (modal didáctico) y prueba el botón **`Exportar Síntesis (.md)`**. Verifica que se descargue el archivo Markdown y se copie el prompt de auditoría al portapapeles.

---

## 🟣 Reto 4: Ciclo de Vida, Guardado Atómico y Protección del Trabajo (v0.8.2 - v0.8.4)
*Prueba de los diálogos de guardado/apertura, persistencia en disco y marcado de estado sucio.*

- [ ] **Paso 4.1 (Indicador Dirty State - A-01):** Modifica cualquier parámetro de un gráfico (título, leyenda, color o filtro). Verifica que aparezca de inmediato el punto ámbar `*` en la pastilla superior del proyecto.
- [ ] **Paso 4.2 (Guardado Estructurado - SaveProjectModal):** Presiona `Ctrl+S` (o icono disquete). En el modal interactivo, selecciona carpeta de destino. Verifica en disco que se creen las subcarpetas `/data/` y `/backups/`.
- [ ] **Paso 4.3 (Protección al Abrir Nuevo Proyecto - A-02):** Con cambios sin guardar, presiona `Ctrl+O` o `Nuevo +`. Verifica que el sistema solicite confirmación antes de descartar el trabajo.
- [ ] **Paso 4.4 (Selector Nativo de Archivos):** En `OpenProjectModal`, elige "Abrir Archivo (.analyticraft)" y confirma que el explorador de archivos muestre y permita seleccionar directamente el archivo `.analyticraft` sin ocultarlo.

---

## 🔴 Reto 5: Aislamiento de UI, Exportación Offline y Tests (v0.8.3 - v0.8.4)
*Prueba de seguridad, límites de visualización y suites automatizadas.*

- [ ] **Paso 5.1:** Estando en la Vista de Modelo (`Ctrl+3`), verifica que la pestaña `Formato VISUAL` **NO** esté visible. Regresa a la Vista de Informe (`Ctrl+1`), selecciona un visual y confirma que `Formato VISUAL` aparezca.
- [ ] **Paso 5.2 (Exportación Offline Fidedigna - A-04, D-04):** Ve a `Inicio > Compartir > Exportar HTML`. Abre el archivo `.html` generado con la conexión Wi-Fi desactivada (o modo avión). Comprueba que el dashboard renderice las gráficas con su título de proyecto real y datos actualizados.
- [ ] **Paso 5.3 (Ejecución de Pruebas Unitarias Automatizadas):** En la terminal del proyecto, ejecuta:
  ```bash
  npm test
  ```
  **Validación:** Todas las pruebas unitarias deben ejecutarse y aprobarse al 100% en Vitest.

---

**Resultado Esperado:** Al superar todos los retos, Analyticraft v0.8.4 garantiza solvencia técnica, precisión analítica matemática y protección de datos, dejando la plataforma preparada para el desarrollo de la Fase 9 (Lienzo Libre y Snap-to-Grid).
