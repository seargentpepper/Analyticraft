# 🕸️ Página 11: Vista de Modelo Relacional (Grafo de Tablas, Drag & Drop y Vistas Virtuales)

Bienvenido a la documentación técnica de la **Vista de Modelo Relacional (Model View)** implementada en la **Fase 7 del Roadmap** de **Analyticraft**. Esta vista traslada la experiencia de modelado relacional visual de Microsoft Power BI Desktop a un entorno de escritorio ligero y ultra-rápido impulsado por **Tauri**, **React** y **DuckDB-Wasm**.

---

## 1. Visión y Propósito de la Vista de Modelo

En lugar de forzar al analista a trabajar con un archivo CSV plano gigante y desnormalizado, Analyticraft permite importar múltiples tablas independientes (ej. `ventas`, `clientes`, `productos`, `tiendas`) y enlazarlas lógicamente en esquemas analíticos de **Estrella (Star Schema)** o **Copo de Nieve (Snowflake Schema)**.

```mermaid
graph TD
    subgraph StarSchemaLayout ["Lienzo de Grafo Relacional (Analyticraft Model View)"]
        DimClientes["Dimensión: Clientes (1) [Dorado]"]
        DimProductos["Dimensión: Productos (1) [Dorado]"]
        FactVentas["Tabla de Hechos: Ventas (*) [Azul/Cian]"]
        DimTiendas["Dimensión: Tiendas (1) [Dorado]"]
    end

    DimClientes -- "1 : * (LEFT JOIN)" --> FactVentas
    DimProductos -- "1 : * (LEFT JOIN)" --> FactVentas
    DimTiendas -- "1 : * (LEFT JOIN)" --> FactVentas
```

### Beneficios Clave:
1. **Normalización sin Dolor:** Mantiene los CSVs físicos livianos y libres de datos duplicados.
2. **Cero Mutación en Disco:** Las relaciones no alteran ni reescriben los archivos CSV originales; se instancian como **Vistas Virtuales SQL (`CREATE VIEW`)** en la memoria vectorizada de DuckDB.
3. **Modelado Visual Intuitivo:** La creación de relaciones se realiza simplemente arrastrando una columna de una tabla y soltándola sobre la columna equivalente de otra.

---

## 2. Anatomía de la Interfaz (`ModelView.tsx`)

Al presionar el tercer botón del riel izquierdo de vistas (`Ctrl+3`), se accede al diseñador relacional compuesto por:

### 2.1. Barra de Herramientas Superior (`.model-toolbar`)
- **Identificador y Contadores:** Muestra el total de tablas cargadas y relaciones activas (`X tablas · Y relaciones`).
- **Controles de Zoom:** Botones de alejar (`-`), porcentaje visual (`100%`), acercar (`+`) y ajuste al lienzo (`⛶`).
- **Botón "✨ Auto-Detectar":** Dispara el algoritmo heurístico de concordancia de nombres y compatibilidad de tipos DuckDB, resaltando claves candidatas con un aura dorada luminosa y abriendo el banner de sugerencias.
- **Botón "Auto-Alinear (Estrella)":** Algoritmo radial que ubica la tabla de hechos en el centro (`x: 440, y: 200`) y distribuye las dimensiones uniformemente en un círculo armónico.
- **Botón "Cascade Cascada":** Algoritmo jerárquico que reordena las dimensiones descriptivas en la fila superior (`y: 60`) y las tablas de hechos transaccionales en la fila inferior (`y: 420`), optimizando la legibilidad de flujos analíticos.
- **Botón "+ Nueva Relación":** Acceso al modal asistido para analistas que prefieren el teclado o selección por lista desplegable.

### 2.2. Nodos de Tabla (`.model-table-node`)
Cada tabla importada en la sesión se renderiza como una tarjeta flotante posicionable en el espacio bidimensional:
- **Cabecera Arrastrable (`.model-node-header`):** Permite mover libremente la tabla por el lienzo mediante drag manual con el ratón.
- **Diferenciación Cromática Heurística:**
  - **Tablas de Hechos (Fact Tables):** Detectadas automáticamente por mayor proporción de métricas numéricas, mayor volumen de filas o prefijos semánticos (`ventas`, `fact`, `sales`, `orders`). Cuentan con borde y cabecera en **Azul/Cian Neón (`#007acc`)** y la pastilla `HECHOS`.
  - **Tablas de Dimensiones (Dim Tables):** Tablas descriptivas con atributos categóricos y claves (`clientes`, `productos`). Cuentan con borde y cabecera en **Dorado/Ámbar (`#cca700`)** y la pastilla `DIMENSIÓN`.
- **Listado de Columnas y Tipos:** Cada columna muestra su indicador de tipo (`#` numérico en verde, `Abc` texto en azul) y un icono de candado/enlace (`Link2`) si forma parte de una relación activa. Las columnas candidatas detectadas por el asistente se iluminan con un aura dorada pulsante (`.column-detected-aura`).
- **Pie de Tarjeta:** Muestra el conteo de registros físicos indexados.

---

## 3. Creación de Relaciones Visuales (Drag & Drop de Columnas)

El flujo de conexión de datos replica exactamente la ergonomía de Power BI Desktop:

```
[ Tabla Clientes ]               [ Tabla Ventas ]
   id_cliente  ──(Drag & Drop)──▶   id_cliente
     (Dim / 1)                     (Hechos / *)
```

1. **Inicio de Arrastre:** El analista hace clic sostenido sobre una columna de una tabla (ej. `id_cliente` en `clientes`). El cursor cambia a estado de agarre y serializa el payload de columna.
2. **Resaltado de Compatibilidad (`.drop-active`):** Al pasar sobre columnas de una tabla distinta, la fila destino se ilumina con resplandor verde cian brillante indicando que es un destino válido.
3. **Soltado (`onDrop`):**
   - El sistema detecta la tabla fuente y la tabla destino.
   - Invoca la función [`createVirtualRelationView()`](./src/lib/duckdb.ts) en DuckDB.
   - Trazado inmediato del conector visual SVG en tiempo real.
   - Despliegue de notificación confirmando la unión relacional.

---

## 4. Conectores Visuales SVG y Lectura de Cardinalidad

Las conexiones no son simples líneas rectas; se renderizan mediante una capa SVG interactiva utilizando curvas cúbicas de Bézier:

```
(Extremo Hechos)                                    (Extremo Dimensión)
     [ * ]  ━━━━━━━━━━━ 1 : * ──▶ ━━━━━━━━━━━  [ 1 ]
  (Muchos / FK)       (Dirección de Filtro)       (Uno / PK)
```

### Elementos del Conector:
- **Curva Bézier Suave (`.relation-line-main`):** Calcula los puntos de anclaje exactos a la altura de las columnas involucradas en cada tarjeta.
- **Indicador `1` (Uno / Primary Key):** Pastilla dorada en el extremo de la tabla de dimensiones descriptivas. Al posar el cursor, despliega un tooltip en lenguaje natural: *"Cardinalidad 1 (Dimensión / PK): Cada registro es único en esta tabla"*.
- **Indicador `*` (Muchos / Foreign Key):** Pastilla azulada en el extremo de la tabla de hechos. Tooltip en lenguaje natural: *"Cardinalidad * (Hechos / FK): Pueden existir múltiples registros asociados a la misma clave"*.
- **Flecha y Pastilla Central (`1 : *`):** Señalizador central que indica la dirección en que fluye el filtrado y las relaciones. Tooltip: *"Dirección del filtro: Las dimensiones filtran las transacciones de hechos"*.
- **Inspector de Relación (`.model-relation-inspector`):** Al hacer clic sobre cualquier conector SVG, se despliega una tarjeta flotante de detalle que muestra la consulta de la vista, la explicación en lenguaje natural para principiantes (*"Un registro en Stores puede asociarse a múltiples transacciones en Sales"*), el botón de edición visual (**`✏️ Editar Relación`**) y el botón para **Eliminar Relación de DuckDB (`🗑️`)**.

---

## 5. El Generador de Vistas Virtuales en DuckDB

Toda relación creada visualmente se compila internamente en una consulta SQL vectorizada ejecutada por DuckDB-Wasm:

```sql
DROP VIEW IF EXISTS "view_ventas_clientes";

CREATE VIEW "view_ventas_clientes" AS 
SELECT 
  s.*,
  t."nombre_cliente",
  t."ciudad",
  t."sector"
FROM "ventas" s 
LEFT JOIN "clientes" t 
  ON s."id_cliente" = t."id_cliente";
```

### Mitigación de Colisión de Columnas:
Para evitar el error estándar de DuckDB `Binder Error: Duplicate column name "id"`, [`createVirtualRelationView()`](./src/lib/duckdb.ts) introspecciona previamente el esquema de ambas tablas con `PRAGMA table_info`:
1. Omite la columna de clave foránea duplicada en el lado `t.*`.
2. Si existen otras columnas con nombres idénticos (ej. `fecha`), les antepone automáticamente el prefijo de la tabla destino (`clientes_fecha`), garantizando que la vista relacional nunca falle.

### Descarte Seguro (`DROP VIEW`):
Al eliminar una relación desde el inspector del modelo o desde el panel derecho de Campos:
```sql
DROP VIEW IF EXISTS "view_ventas_clientes";
```
La vista se purga de la memoria de DuckDB al instante, sin tocar ni comprometer los archivos CSV originales en el disco del usuario.

---

## 6. Asistente Newbie-Friendly para Modelado Relacional (Fase 8)

Para democratizar el modelado multidimensional y eliminar la fricción técnica para analistas junior o principiantes ("Newbies"), Analyticraft incorpora un asistente inteligente que automatiza la detección, el layout visual y la explicación semántica de los esquemas:

### 6.1. Algoritmo Heurístico de Detección de Relaciones
Al presionar el botón **`✨ Auto-Detectar`**, el motor examina en memoria todas las tablas cargadas ejecutando una heurística de matching en dos niveles:
1. **Normalización Léxica de Claves:**
   - Extrae el token nuclear del nombre de la columna eliminando prefijos y sufijos comunes (`id_`, `cod_`, `pk_`, `fk_`, `_id`, `_key`, `_code`, `_cd`).
   - Evalúa si el token normalizado coincide con el nombre de otra tabla o con una columna clave de otra tabla (ej. `clientes.id_cliente` con `ventas.id_cliente`, o `tiendas.store_id` con `ventas.store_id`).
2. **Validación de Compatibilidad de Tipos DuckDB:**
   - Comprueba que los tipos de datos inferidos sean intercambiables (ej. familias numéricas `INTEGER` / `BIGINT` entre sí, o familias de texto `VARCHAR` / `TEXT`).
3. **Exclusión de Redundancias:**
   - Ignora pares de tablas que ya cuenten con una relación activa registrada.
4. **Resaltado Visual con Aura Luminosa (`.column-detected-aura`):**
   - Las columnas involucradas en las sugerencias se iluminan con un resplandor ámbar pulsante de advertencia amigable (`pulse-aura`) y una micro-partícula luminosa (`.aura-sparkle-dot`).
5. **Banner de Sugerencias Flotante (`.model-suggestions-banner`):**
   - Muestra la lista de relaciones detectadas con su nivel de confianza (`Alta` / `Media`).
   - Permite vincularlas una por una mediante el botón **`Conectar`** o todas simultáneamente con un solo clic en **`Conectar Todas (X)`**.

### 6.2. Motor de Layout Jerárquico en Cascada (`Auto-Alinear Cascada`)
A diferencia del alineamiento radial en estrella, el layout en cascada organiza los nodos según su nivel arquitectónico en el pipeline analítico:
- **Capa Superior (Nivel 0 - Dimensiones):** Se posicionan en `y = 60` con una distribución horizontal equidistante (`x = 40 + index * 300`).
- **Capa Inferior (Nivel 1 - Tablas de Hechos):** Se colocan en `y = 420`, centradas horizontalmente respecto a las dimensiones que las filtran.
- **Ventaja Ergonómica:** Refleja la convención estándar de la industria (las dimensiones "alimentan" y filtran los hechos de arriba hacia abajo).

### 6.3. Tooltips y Resumen en Lenguaje Natural
Los conceptos matemáticos de teoría de conjuntos y cardinalidades se traducen a lenguaje claro y pedagógico:
- Al pasar el cursor sobre `1`, `*` o la flecha de dirección, se despliegan tooltips explicativos inmediatos.
- En el panel de inspección (`.inspector-natural-lang-box`), se genera dinámicamente un texto explicativo:
  > *"Un registro en Stores puede asociarse a múltiples transacciones en Sales. El filtrado fluye desde Stores hacia Sales."*
- Esto permite que cualquier usuario sin conocimientos previos de SQL comprenda el impacto del JOIN sobre sus métricas.

### 6.4. Modal Visual de Edición de JOIN (`EditJoinModal`)
Al pulsar el botón **`✏️ Editar Relación`** en el panel inspector:
1. **Selector de Tipo de Unión:**
   - **`LEFT JOIN` (Recomendado):** Conserva todas las transacciones de la tabla principal aunque falte la clave en la tabla secundaria.
   - **`INNER JOIN` (Estricto):** Mantiene únicamente las filas que tengan coincidencia exacta en ambas tablas.
2. **Inversión de Dirección (`⇄ Invertir Dirección`):**
   - Permite conmutar la tabla izquierda y derecha con un solo clic.
3. **Selectores de Columnas:**
   - Permite ajustar las columnas de enlace en caso de que el modelo requiera una clave sustituta.
4. **Regeneración Atómica en DuckDB:**
   - Al guardar, el backend descarta la vista anterior con `DROP VIEW IF EXISTS` e invoca `createVirtualRelationView` con la nueva configuración, refrescando el árbol de campos y el lienzo en menos de 10 milisegundos.

---

## 7. Reglas de Preservación para Desarrolladores y LLMs

1. **Mantener la Vista de Modelo Desacoplada (`ModelView.tsx`):** La lógica del grafo relacional, heurísticas y modales especializados deben residir en su componente, sin sobrecargar `App.tsx`.
2. **Preservar el Drag & Drop Columna a Columna:** Cualquier columna de una tabla debe ser arrastrable hacia columnas de tablas ajenas. Nunca desactives los manejadores `draggable` o `onDrop`.
3. **Respetar la Deduplicación de Columnas en JOINs:** No modifiques `createVirtualRelationView` para usar `SELECT s.*, t.*` directo; preserva siempre la introspección previa con `PRAGMA table_info` y el aliasing de colisiones.
4. **Coexistencia Asistida y Manual:** El botón `+ Nueva Relación`, el modal asistido y el banner de auto-detección deben coexistir armónicamente como vías alternativas para distintos perfiles de analistas.
5. **Diferenciación Cromática Obligatoria:** Las tablas de hechos deben distinguirse en tono cian/azul (`#007acc`) y las dimensiones en tono ámbar (`#cca700`).
6. **Tooltips y Explicaciones Pedagógicas:** Todo nuevo indicador o glifo relacional debe acompañarse de un tooltip explicativo en lenguaje natural accesible para usuarios principiantes.
7. **Inmutabilidad de Archivos Físicos:** Ninguna operación de auto-detección, alineación en cascada o edición de JOIN puede alterar o sobreescribir los archivos CSV físicos del usuario.
