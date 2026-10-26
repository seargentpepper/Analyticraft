# Auditoría de bugs y deuda técnica — Analyticraft

**Fecha:** 2026-10-26  
**Versión revisada:** 0.8.3  
**Alcance:** frontend React/TypeScript, DuckDB-WASM, persistencia, exportación HTML, modelo relacional, configuración de Tauri y pruebas automatizadas.  
**Método:** revisión estática de los flujos críticos y ejecución de las validaciones disponibles. No se modificó código de aplicación.

## 1. Resumen ejecutivo

El proyecto **sí presenta bugs funcionales y deuda técnica**. La compilación y las pruebas existentes pasan, pero la cobertura actual no ejercita los flujos donde se concentran los problemas: persistencia, consultas DuckDB, componentes React y aplicación de escritorio.

No se identificó un fallo crítico de ejecución remota ni vulnerabilidades conocidas en dependencias de producción. Los riesgos principales son **pérdida o mezcla de trabajo del usuario, resultados analíticos incorrectos y diferencias entre lo prometido y lo entregado**.

Se documentan **7 hallazgos de prioridad alta, 9 de prioridad media y 7 elementos de deuda técnica**. Las referencias indican la evidencia estática; los casos que requieren reproducción en navegador o WebView se señalan expresamente.

## 2. Validaciones ejecutadas

| Comando | Resultado |
| --- | --- |
| `pnpm test` | Correcto: 3 archivos, 13 pruebas aprobadas. |
| `npm run build` | Correcto: TypeScript y Vite compilan. Advertencia de un paquete JS de 1.756,39 kB (546,39 kB gzip). |
| `pnpm audit --prod` | Sin vulnerabilidades conocidas reportadas al momento de la auditoría. |
| `cargo check --manifest-path src-tauri/Cargo.toml` | No ejecutado: `cargo` no está instalado en este entorno. |
| `git status --short` | Sin cambios al comenzar la auditoría. |

**Límite de la revisión:** no se realizaron pruebas manuales de extremo a extremo en el WebView de Tauri ni pruebas con archivos CSV de gran volumen. Por tanto, no se afirma que los escenarios descritos se hayan ejecutado dinámicamente; se derivan de rutas de código concretas.

## 3. Bugs de prioridad alta

### A-01. El indicador de cambios no cubre la mayoría de las ediciones

**Evidencia:** `src/App.tsx:1219-1224`, `src/App.tsx:1146-1149`, `src/App.tsx:2267-2270`, `src/App.tsx:740-744`.

`updateSelectedChart` modifica configuración sin llamar a `setIsDirty(true)`. Tampoco lo hacen los cambios de tema, los cambios de valor/operador de filtros globales, la eliminación desde el botón de la tarjeta ni varias asignaciones mediante arrastrar y soltar. Algunas operaciones equivalentes sí marcan el proyecto como modificado, por lo que el comportamiento es inconsistente.

**Impacto:** el punto de cambios pendientes puede desaparecer tras guardar y no volver a aparecer aunque se edite el informe. El usuario puede creer que todo está guardado cuando no es así.

**Recomendación:** centralizar todas las mutaciones del proyecto y derivar `isDirty` de un estado/versionado común. Añadir una prueba por cada acción de edición.

### A-02. Abrir un proyecto no protege el trabajo actual ni limpia todo el estado anterior

**Evidencia:** `src/App.tsx:552-685`, especialmente `src/App.tsx:631-639`; comparar con la confirmación de `src/App.tsx:369-375`.

Abrir archivo o carpeta no solicita confirmación aunque existan cambios sin guardar. Si el archivo abierto no contiene fuentes CSV, no se ejecuta `resetDuckDBSession()` ni se vacía `tables`, por lo que se conservan las tablas del proyecto anterior. Además, no se restablecen de forma sistemática `selectedChartId`, `chartDataStore`, historial, tema, vista o layout cuando faltan propiedades en el archivo cargado.

**Impacto:** pérdida de cambios sin aviso y proyectos híbridos con datos/configuración de dos proyectos distintos.

**Recomendación:** usar una única transición `loadProject` que confirme cambios pendientes, valide primero, reinicie todo el estado y solo confirme la carga cuando todas las fuentes y relaciones se hayan restaurado correctamente.

### A-03. Los filtros `>` y `<` comparan números como texto

**Evidencia:** `src/components/ChartCard.tsx:104-123`.

Todas las columnas se convierten con `CAST(... AS VARCHAR)` antes de aplicar el operador. En una comparación lexicográfica, por ejemplo, `'10' < '2'` es verdadero, a diferencia de la comparación numérica.

**Impacto:** gráficos y KPIs incorrectos al filtrar importes, cantidades o cualquier campo numérico. Es un problema de exactitud analítica, no solo visual.

**Recomendación:** conservar el tipo de columna y usar valores SQL tipados/parámetros; reservar la conversión a texto para `LIKE`. Probar valores 2, 10 y 100, negativos, decimales y nulos.

### A-04. La exportación puede contener datos vacíos o desactualizados y no es realmente autocontenida

**Evidencia:** `src/App.tsx:1189-1212`, `src/lib/exporter.ts:44-45`, `src/lib/exporter.ts:71-74`.

La exportación toma `chartDataStore` sin esperar a que finalicen las consultas activas. Si una tarjeta está cargando, aún no terminó de actualizarse o falló, se exporta `[]` o el último resultado almacenado y se muestra un mensaje de éxito. Además, el HTML depende de ECharts y fuentes remotas; sin red, los gráficos no pueden inicializarse.

El nombre del proyecto también está fijado a `Analyticraft Dashboard` en `src/App.tsx:1196`, en vez de utilizar el proyecto activo.

**Impacto:** informes incompletos u obsoletos con apariencia de exportación correcta; el archivo no cumple la promesa de funcionar sin dependencias externas.

**Recomendación:** ejecutar y esperar las consultas al exportar, bloquear la salida ante errores, validar que cada tarjeta tenga su resultado actual e incrustar ECharts y las fuentes necesarias. Incorporar una prueba offline real del HTML generado.

### A-05. El guardado puede informar éxito pese a errores parciales

**Evidencia:** `src/lib/projectStorage.ts:135-171`, `src/lib/projectStorage.ts:182-191`, `src/lib/projectStorage.ts:202-229`.

Los errores al crear un respaldo se tratan como si el archivo principal no existiera. Los errores al guardar CSV se limitan a `console.warn` y no cambian el resultado. Cualquier fallo no `AbortError` del flujo de carpeta activa la descarga alternativa, que devuelve `success: true` aunque el usuario esperaba actualizar una carpeta persistente.

**Impacto:** archivo maestro actualizado con fuentes ausentes/obsoletas, ausencia de respaldo por permisos o disco lleno y falsa sensación de persistencia.

**Recomendación:** distinguir explícitamente “no existe” de otros errores, abortar ante fallos de respaldo o fuentes y devolver un resultado detallado. Escribir mediante archivos temporales y reemplazo final para evitar estados parciales.

### A-06. Hot Swap y recarga de CSV no son atómicos

**Evidencia:** `src/lib/duckdb.ts:70-87`, `src/App.tsx:411-432`; promesa de atomicidad en `README.md:16`.

El contenido se guarda en caché antes de completar la importación y la tabla existente se elimina antes de crear su reemplazo. Si el nuevo CSV es inválido, la caché ya quedó modificada y la tabla puede haberse perdido. Cuando existen vistas dependientes, el `DROP TABLE` también puede fallar por dependencias; este último escenario requiere confirmación dinámica con la versión concreta de DuckDB.

**Impacto:** una actualización fallida puede dejar el proyecto sin la tabla o con datos guardados diferentes de los datos consultables.

**Recomendación:** importar primero a una tabla temporal, validar esquema y consulta, y sustituir dentro de una transición controlada. Actualizar la caché solo al confirmar el reemplazo; recrear las vistas dependientes de forma explícita.

### A-07. Las relaciones no se integran en el flujo normal de visualización y filtrado

**Evidencia:** `src/components/ChartCard.tsx:88-90`, `src/components/VisualizationsPanel.tsx:322-331`, `src/components/FieldsPanel.tsx:164-288`, `src/lib/duckdb.ts:149-204`.

Las relaciones crean vistas en DuckDB, pero esas vistas no se agregan a `tables`; por ello, no aparecen en el selector de tablas ni en el panel de campos. Los filtros globales solo se aplican cuando `f.tableName === config.tableName`, sin propagación por relaciones.

**Impacto:** el flujo documentado de cruzar dimensiones y hechos y propagar filtros no está disponible de manera general desde la interfaz. Las vistas pueden crearse, pero no explotarse normalmente en los visuales.

**Recomendación:** definir un modelo de catálogo que incluya tablas y vistas, validar columnas duplicadas y aplicar filtros mediante las relaciones del modelo. Añadir una prueba integral hecho–dimensión–visual–filtro.

## 4. Bugs de prioridad media

### M-01. Las series temporales se ordenan por métrica, no por fecha o dimensión

**Evidencia:** `src/components/ChartCard.tsx:151-161`.

Todas las consultas no KPI/segmentador usan `ORDER BY metric DESC`. Un gráfico de líneas muestra los puntos de mayor a menor valor, destruyendo la secuencia temporal.

**Corrección sugerida:** ordenar por dimensión para líneas y áreas; mantener orden por métrica solo donde sea útil y configurable.

### M-02. La conversión de `bigint` pierde precisión

**Evidencia:** `src/lib/duckdb.ts:130-146`.

`Number(val)` pierde exactitud por encima de `Number.MAX_SAFE_INTEGER`. Conteos, identificadores o importes enteros grandes pueden cambiar silenciosamente.

**Corrección sugerida:** preservar `bigint` o cadenas para identificadores y definir una conversión segura para métricas, con aviso si se excede el rango exacto.

### M-03. La importación de proyectos carece de validación de esquema

**Evidencia:** `src/lib/projectStorage.ts:255`, `src/lib/projectStorage.ts:300-310`, `src/lib/duckdb.ts:84-87`.

Se hace una aserción TypeScript sobre `JSON.parse`, pero en ejecución no se comprueban versión, nombre, tablas, columnas, relaciones, agregaciones ni identificadores. Los nombres de tabla y archivo procedentes del proyecto se interpolan en SQL sin el escape usado en otras rutas.

**Impacto:** proyectos malformados pueden producir estados inválidos, consultas rotas o errores parciales durante la carga. No se afirma una explotación de seguridad; el problema demostrado estáticamente es la falta de validación de una entrada externa.

**Corrección sugerida:** validación runtime con esquema versionado, migraciones, escape uniforme de identificadores y rechazo antes de modificar la sesión activa.

### M-04. La posición del modelo puede quedar de un proyecto anterior

**Evidencia:** `src/components/ModelView.tsx:95`, `src/App.tsx:582`, `src/App.tsx:650`.

`positions` solo se inicializa desde `savedPositions`; no se sincroniza cuando esa prop cambia. Si se abre o reinicia un proyecto mientras la Vista de Modelo sigue montada, conserva coordenadas antiguas y las tablas nuevas pueden quedar superpuestas en la posición de reserva.

**Corrección sugerida:** sincronizar al cambiar de proyecto o usar una clave de identidad de proyecto para reinicializar el estado de la vista.

### M-05. El nombre del diálogo de guardado queda obsoleto

**Evidencia:** `src/components/SaveProjectModal.tsx:30-35`, `src/App.tsx:2927-2941`.

`nameInput` se inicializa una sola vez. Como el componente permanece montado, abrir el diálogo después de renombrar o cambiar de proyecto puede mostrar el nombre anterior.

**Corrección sugerida:** sincronizar el borrador cuando cambien `isOpen` o `projectName`, sin sobrescribir una edición activa.

### M-06. El buscador del segmentador solo busca entre los 50 valores más frecuentes

**Evidencia:** `src/components/ChartCard.tsx:141-150`, `src/components/ChartCard.tsx:205-211`.

La consulta limita las opciones a 50 antes de aplicar la búsqueda local. Categorías válidas fuera de ese subconjunto no se pueden encontrar ni seleccionar.

**Corrección sugerida:** buscar en DuckDB o paginar/cargar bajo demanda; indicar cualquier truncamiento al usuario.

### M-07. Editar una relación elimina primero la versión funcional

**Evidencia:** `src/App.tsx:873-914`.

Se ejecuta `dropVirtualRelationView(existing.name)` antes de crear la nueva vista. Si la nueva definición falla, la vista antigua ya no existe y el estado React todavía muestra la relación anterior.

**Corrección sugerida:** crear y validar una vista temporal antes de sustituir la anterior; restaurar o conservar el estado consistente ante errores.

### M-08. La Vista de Datos admite respuestas fuera de orden

**Evidencia:** `src/App.tsx:187-213`.

No se cancela ni se invalida la consulta anterior al cambiar rápidamente de tabla o página. Una respuesta antigua puede llegar después y escribir filas de otra tabla/página en el estado actual.

**Corrección sugerida:** token de solicitud o cancelación; comprobar tabla y página antes de aplicar resultados. Mostrar también el error en la interfaz, no solo en consola.

### M-09. La paginación no tiene orden determinista

**Evidencia:** `src/App.tsx:197-200`.

`SELECT * ... LIMIT ... OFFSET ...` no incluye `ORDER BY`. No hay garantía de orden estable entre páginas o ejecuciones, por lo que pueden repetirse u omitirse filas en la experiencia de paginación.

**Corrección sugerida:** definir una clave de orden estable o explicar la estrategia si el motor no puede garantizarla para fuentes sin clave única.

## 5. Deuda técnica y mantenibilidad

### D-01. Cobertura insuficiente en los flujos de mayor riesgo

Las 13 pruebas cubren temas, utilidades de gráficos y sanitización/exportación como texto. No hay pruebas de componentes, ciclo de vida del proyecto, consultas DuckDB, relaciones, Hot Swap ni Tauri. La prueba denominada “HTML autocontenido” (`tests/exporter.test.ts:33-66`) solo comprueba cadenas, no ejecución offline ni datos actualizados.

**Prioridad de nuevas pruebas:** filtros numéricos, carga entre proyectos, guardado con errores, exportación durante consulta, Hot Swap con CSV inválido y gráfico temporal.

### D-02. Componentes excesivamente grandes y estado distribuido

`src/App.tsx` tiene 2.962 líneas; `ModelView.tsx`, 1.646; `VisualizationsPanel.tsx`, 786. La concentración de persistencia, comandos, consultas, formularios y renderizado facilita inconsistencias como las de `isDirty` y la carga de proyectos.

**Recomendación:** extraer progresivamente servicios/hooks de ciclo de vida, consultas y mutaciones; no realizar una reescritura general sin pruebas de caracterización.

### D-03. Manejo de errores poco fiable

Hay capturas vacías o genéricas y mensajes de éxito no vinculados a un resultado completamente válido. Ejemplos: `src/lib/projectStorage.ts:39`, `src/lib/projectStorage.ts:169-171`, `src/lib/duckdb.ts:194-203`.

El fallback de `createVirtualRelationView` oculta la causa original y vuelve a intentar `SELECT s.*, t.*`, que puede reintroducir colisiones de columnas.

**Recomendación:** errores tipados, contexto de operación y política explícita de fallback; no ocultar fallos de escritura o modelado.

### D-04. Dependencia de red y documentación offline incoherente

`src/lib/duckdb.ts:14-18` obtiene bundles mediante jsDelivr y `src/lib/exporter.ts:71-74` carga ECharts/fuentes remotas. Esto contradice “cero dependencias en la nube” y “autocontenido” en `README.md:11-12`, aunque los datos analizados no se envíen a esos servicios.

**Recomendación:** empaquetar los recursos localmente y verificar arranque/exportación sin conexión.

### D-05. Paquete inicial sobredimensionado

Vite advierte un bundle principal de aproximadamente 1,76 MB. DuckDB, ECharts y la aplicación se cargan en el mismo camino inicial.

**Recomendación:** medir antes de optimizar; valorar carga diferida de vistas y división de dependencias sin romper los workers de DuckDB.

### D-06. Dependencia declarada sin uso y documentación desalineada

`papaparse` y `@types/papaparse` aparecen en `package.json`, pero no hay importaciones en `src`. El README lo presenta como parser activo (`README.md:42`), mientras la carga usa DuckDB directamente.

**Recomendación:** retirar la dependencia si no forma parte del diseño previsto o corregir la documentación. Reducir superficie de instalación y auditoría.

### D-07. Endurecimiento de escritorio pendiente

`src-tauri/tauri.conf.json:22-24` tiene `csp: null`. Además, no fue posible compilar Rust en esta máquina, por lo que la validación nativa queda pendiente.

**Recomendación:** definir una CSP compatible con workers/WASM y recursos locales, y añadir `cargo check`/pruebas nativas a la verificación de integración continua.

## 6. Orden de remediación recomendado

1. **Exactitud y datos:** A-03, A-06, A-07 y M-01/M-02.
2. **Protección del trabajo:** A-01, A-02, A-05 y M-07.
3. **Exportación confiable:** A-04, con una prueba offline y otra de consulta en curso.
4. **Robustez de interacción:** M-03 a M-09.
5. **Prevención de regresiones:** pruebas de integración antes de dividir componentes; después, D-02 y optimización de bundle.

## 7. Conclusión

El estado “build y tests en verde” es real, pero **no equivale a ausencia de bugs**. Los hallazgos más urgentes afectan corrección de cálculos, preservación del trabajo y cumplimiento de las funciones principales. Conviene resolver primero esos flujos y ampliar pruebas antes de continuar con nuevas fases del roadmap.
