# 📖 Guía: Por qué abrazar CSV y cómo exportar desde otros formatos

En **Analyticraft**, la decisión de enfocarse de manera exclusiva y estricta en archivos **CSV (Comma-Separated Values)** es un principio de diseño deliberado, no una limitación accidental.

---

## 🛑 ¿Por qué NO soportamos directamente XLSX, JSON o XML?

1. **Eficiencia Extrema y Sobrecarga Cero:**
   - Motores para parsear hojas binarias complejas de Excel (`.xlsx`, `.xlsb`), árboles jerárquicos anidados (`JSON`, `XML`) consumen decenas de megabytes de RAM tan solo para descomprimir metadatos, hojas ocultas, estilos y fórmulas.
   - DuckDB cuenta con un motor vectorizado C++ ultrarrápido (`read_csv_auto`) diseñado específicamente para procesar millones de filas de texto plano por segundo consumiendo una fracción mínima de CPU y memoria.

2. **Evitar la "Caja Negra" de Hojas de Cálculo:**
   - Un archivo Excel frecuentemente incluye celdas combinadas, totales intercalados, formatos visuales confusos o múltiples tablas en la misma pestaña. 
   - Exigir un archivo CSV educa al analista y al usuario a trabajar con datos **tabulares limpios**, garantizando cálculos matemáticos precisos y reproducibles en SQL.

3. **Inmutabilidad y Portabilidad Universal:**
   - El CSV es el estándar de oro abierto: cualquier sistema operativo, base de datos o lenguaje de programación puede leerlo y escribirlo sin pagar licencias ni depender de software propietario.

---

## 🛠️ Cómo exportar a CSV desde los formatos y aplicaciones más populares

A continuación encontrarás los pasos exactos para generar un CSV limpio listo para Analyticraft:

### 1. Desde Microsoft Excel (`.xlsx`, `.xls`)
1. Abre tu libro de trabajo en Excel.
2. Si tienes varias pestañas, ubícate en la pestaña que contiene los datos a analizar.
3. Asegúrate de que la primera fila contenga únicamente los nombres de columnas (encabezados) y elimina totales al pie.
4. Haz clic en **Archivo** > **Guardar como** (o presiona `F12`).
5. En el menú desplegable **Tipo de archivo**, selecciona:
   - **CSV (delimitado por comas) (*.csv)** o **CSV UTF-8 (delimitado por comas) (*.csv)** *(Recomendado para conservar tildes y caracteres especiales)*.
6. Haz clic en **Guardar**.

### 2. Desde Google Sheets (Hojas de cálculo de Google)
1. Abre tu documento en Google Sheets.
2. Selecciona la hoja específica que deseas exportar.
3. Ve a **Archivo** > **Descargar** > **Valores separados por comas (.csv, hoja actual)**.
4. El archivo se descargará de inmediato listo para arrastrar al Studio de Analyticraft.

### 3. Desde Apple Numbers
1. Abre tu hoja de cálculo en Numbers.
2. Ve al menú superior **Archivo** > **Exportar a** > **CSV...**.
3. En la ventana emergente, asegúrate de que la codificación de texto sea **Unicode (UTF-8)**.
4. Haz clic en **Siguiente...**, asigna un nombre y guarda el archivo.

### 4. Desde Archivos JSON (Línea de comandos / Scripts)
Si provienes de APIs web o colecciones de MongoDB:
- **Usando Python (Pandas):**
  ```python
  import pandas as pd
  df = pd.read_json("datos.json")
  df.to_csv("datos_limpios.csv", index=False, encoding="utf-8")
  ```
- **Usando `jq` en terminal:**
  ```bash
  jq -r '(map(keys) | add | unique) as $cols | map(. as $row | $cols | map($row[.])) as $rows | $cols, $rows[] | @csv' datos.json > datos.csv
  ```

### 5. Desde Bases de Datos Relacionales (PostgreSQL, MySQL, SQL Server)
- **PostgreSQL:**
  ```sql
  \copy (SELECT * FROM ventas) TO 'ventas.csv' WITH CSV HEADER;
  ```
- **MySQL:**
  ```sql
  SELECT * FROM ventas INTO OUTFILE '/tmp/ventas.csv' 
  FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';
  ```

---

## 💡 Consejos de Oro para tu CSV en Analyticraft
- **Fila 1:** Nombres claros de columnas sin saltos de línea (ej. `fecha,categoria,ventas,unidades`).
- **Fechas:** Usa formato estándar ISO `YYYY-MM-DD` (ej. `2026-03-15`).
- **Moneda y Números:** Evita símbolos de divisa (`$`, `€`) o comas de miles dentro de los números para que DuckDB los detecte automáticamente como columna numérica (`number`).
