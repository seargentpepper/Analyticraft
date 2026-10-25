# Página 3: Flujo de Datos y Workflows Técnicos

Para mantener la robustez, simplicidad y velocidad del motor, el pipeline de datos de Analyticraft opera bajo reglas claras de inmutabilidad y modelado relacional en memoria.

---

## 1. Entrada de Datos Exclusiva: Archivos CSV
- **Regla Estricta:** Analyticraft procesa exclusivamente archivos **CSV individuales**.
- **Fundamento Técnico:** Se rechaza de forma expresa la ingesta directa de formatos binarios o anidados como XLSX, JSON o XML para evitar el consumo desmedido de memoria y educar al usuario en el trabajo con estructuras tabulares limpias (consulta la [Página 5: Filosofía de Datos](./Página%205%20Filosofía%20de%20Datos%20(Por%20qué%20CSV%20y%20Gu%C3%ADa%20de%20Exportación).md)).
- **Detección Automática:** Al cargar un CSV, DuckDB detecta automáticamente los tipos de datos de las columnas (`number`, `string`, `date`, `boolean`) y su conteo de filas sin intervención manual.

---

## 2. Inmutabilidad en Disco (Tratamiento de Solo Lectura)
- **Principio:** Los archivos CSV originales del usuario **jamás son modificados, sobreescritos o bloqueados** por Analyticraft.
- La aplicación carga los datos en la memoria virtual de DuckDB. Cualquier error o experimento visual ocurre en memoria volátil sin riesgo de corromper la información contable o de ventas de la PyME.

---

## 3. Mecanismo de Hot Swap (Reemplazo en Caliente)
- **¿Qué es?:** En la barra lateral izquierda, cada tarjeta de tabla cuenta con un botón de recarga (**↻**).
- **Cómo opera:**
  1. El usuario selecciona una versión actualizada o corregida del archivo CSV.
  2. DuckDB ejecuta de forma atómica:
     ```sql
     DROP TABLE IF EXISTS "mi_tabla";
     CREATE TABLE "mi_tabla" AS SELECT * FROM read_csv_auto('nuevo_archivo.csv');
     ```
  3. Todas las tarjetas del lienzo que consultan esa tabla reejecutan sus consultas SQL automáticamente.
  4. **Ventaja:** No se pierde la posición en el lienzo, ni los títulos, colores, agregaciones o configuraciones de gráficos ya personalizadas.

---

## 4. Modelado Relacional (Esquema de Estrella y Vistas Virtuales)
- **¿Qué resuelve?:** Permite cruzar tablas independientes (por ejemplo, una tabla de transacciones de ventas con una tabla dimensional de clientes o sucursales).
- **Cómo funciona técnicamente:**
  - En lugar de alterar archivos físicos o crear tablas intermedias pesadas, el Studio genera una vista relacional virtual en DuckDB:
    ```sql
    CREATE VIEW "view_ventas_clientes" AS
    SELECT s.*, t.*
    FROM "ventas" s
    LEFT JOIN "clientes" t ON s."cliente" = t."id_cliente";
    ```
  - La nueva vista resultante (`view_ventas_clientes`) aparece inmediatamente en el inspector de gráficos como una fuente seleccionable.
  - El usuario puede graficar ventas agrupadas por ciudad o sector del cliente con cero latencia.
- **Descarte Seguro:** Si la relación ya no es necesaria o el resultado no aporta valor, la vista cuenta con un **botón de eliminación (`🗑️`)** que ejecuta `DROP VIEW` en DuckDB sin tocar ningún CSV físico.

---

## 5. Transformaciones y Consultas: SQL Estándar
Analyticraft evita intencionalmente la complejidad de lenguajes propietarios como DAX (de Power BI). Todas las métricas y agregaciones se procesan mediante consultas directas en DuckDB (`SUM`, `AVG`, `COUNT`, `MAX`, `MIN`, `GROUP BY`, `ORDER BY`), garantizando universalidad y predictibilidad matemática.