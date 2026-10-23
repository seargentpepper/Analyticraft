## 1\. Resumen Ejecutivo (Para la Wiki)

**Analyticraft** es una herramienta de Business Intelligence de escritorio, minimalista y de código abierto, diseñada para analistas, managers y directores de PyMEs (de 2 a 500 empleados) que necesitan procesar, analizar y visualizar datos históricos sin la sobrecarga, lentitud o dependencia de infraestructura de los gigantes corporativos (como Power BI o Metabase).

### Principios Rectores:

- **Local-First:** Todo corre en la computadora del usuario. Sin servidores dedicados, sin Docker obligatorio para el cliente final y sin dependencias en la nube para funcionar.
  
- **Cero Fricción de Compartir:** Capacidad única de exportar un reporte interactivo completo a un archivo `.html` autocontenido que cualquier directivo no técnico puede abrir con doble clic en su navegador web sin instalar nada.
  
- **Eficiencia Extrema:** Arquitectura construida para consumir una fracción de la RAM de herramientas tradicionales, utilizando motores modernos en memoria.
  

## 2\. Decisiones de Arquitectura (El Stack Tecnológico)

Para garantizar velocidad, portabilidad y bajo consumo de recursos, el proyecto se estructurará bajo el siguiente stack:

- **Capa de Escritorio (Framework):** **Tauri (Rust + Frontend Web)**
  
  - _Por qué:_ Permite crear ejecutables ligeros (`.exe` / `.app`) que pesan pocos megabytes y consumen muy poca RAM al arrancar, delegando el núcleo pesado de operaciones al sistema nativo mediante Rust.
- **Motor de Datos y Analítica:** **DuckDB (con bindings en Rust)**
  
  - _Por qué:_ Es el "SQLite para analítica". Permite realizar consultas ultrarrápidas, vectorizadas y multihilo directamente sobre archivos locales, soportando funciones analíticas complejas sin requerir una base de datos relacional pesada corriendo como servicio.
- **Interfaz Gráfica (Frontend):** **TypeScript + Framework moderno (Svelte o React) + Apache ECharts**
  
  - _Por qué:_ Provee una interfaz limpia, reactiva y componentes de gráficos de alta velocidad adaptados para renderizado local.

## 3\. Flujo de Datos y Formatos Soportados

Para mantener la simplicidad y evitar la sobreingeniería inicial, el ciclo de vida de los datos funcionará de la siguiente manera:

1. **Entrada de Datos (MVP):** Archivos **CSV individuales**. Se descarta inicialmente el soporte para XML y XLSX complejos para acelerar el desarrollo del MVP, permitiendo que los usuarios exporten sus hojas de cálculo como CSV limpios.
  
2. **Modelo Relacional (Esquema de Estrella):** Los CSVs se importan como tablas independientes dentro de DuckDB y se enlazan mediante relaciones lógicas virtuales (llaves foráneas / _JOINs_) en la memoria de la aplicación, sin alterar los archivos originales en disco.
  
3. **Inmutabilidad de Datos (Solo Lectura):** La aplicación trata los archivos fuente como de solo lectura para evitar errores de sincronización. Si los datos cambian, se implementará una función de **Hot Swap (Reemplazo en Caliente)** para actualizar la tabla en DuckDB sin romper el diseño de los gráficos ni las relaciones del dashboard.
  
4. **Transformación y Consultas:** Se utiliza **SQL estándar** soportado por DuckDB para agregaciones y cálculos derivados, evitando por completo la complejidad de crear un motor de lenguaje tipo DAX.
  

## 4\. Experiencia de Usuario (UX) y Entregables

El software se divide en dos experiencias claramente diferenciadas para cubrir tanto al analista como al usuario final:

- **El "Studio" (Herramienta de Escritorio):**
  
  - Diseñado para el analista o contador de la PyME.
    
  - Interfaz inspirada en Power BI pero simplificada:
    
    - Panel de campos/tablas (izquierda).
      
    - Lienzo interactivo de gráficos en cuadrícula (centro).
      
    - Panel inspector de propiedades y agregaciones (derecha).
      
    - Filtros globales.
      
- **El Formato de Salida (El "Viewer" / Archivo HTML Autocontenido):**
  
  - Diseñado para el director o manager no técnico.
    
  - Un botón en el Studio compila el diseño visual, las consultas y una versión ligera del motor en memoria dentro de **un único archivo `.html`**.
    
  - Al abrirlo en cualquier navegador web, el usuario obtiene un dashboard interactivo completo (filtros cruzados, selección de rangos, gráficos dinámicos) sin requerir internet ni instalación previa.
