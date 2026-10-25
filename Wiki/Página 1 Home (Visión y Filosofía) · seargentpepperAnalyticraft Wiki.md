# Página 1: Home (Visión y Filosofía)

**Analyticraft** es una herramienta de Business Intelligence (BI) de escritorio, minimalista, local-first y de código abierto para PyMEs (de 2 a 500 empleados) y analistas independientes.

---

## 🎯 ¿Qué problema resolvemos y para quién?

El software corporativo tradicional de Business Intelligence (como Power BI, Tableau o Metabase) adolece de problemas críticos para el entorno PyME:
- **Consumo desmedido de recursos:** Suites que tardan minutos en abrir y consumen gigabytes de memoria RAM antes de renderizar un solo gráfico.
- **Dependencia de la nube y cobros por suscripción:** Costos mensuales por licencia por usuario y obligación de almacenar datos confidenciales en servidores ajenos.
- **Fricción al compartir:** Obligación de que los destinatarios tengan cuentas corporativas o software pesado instalado solo para ver un informe semanal.

**Analyticraft** devuelve el control total de los datos al analista y al directivo: una aplicación nativa de escritorio ultrarrápida que procesa millones de filas en memoria y genera reportes interactivos en un único archivo web sin servidores.

---

## 🧭 Principios Rectores

Todas las decisiones técnicas y de producto en Analyticraft se rigen por tres principios no negociables:

### 1. Local-First (Soberanía y Privacidad de Datos)
Todo el cómputo analítico y almacenamiento de proyectos ocurre en el ordenador del usuario.
- Cero servidores externos.
- Cero telemetría obligatoria ni dependencias en la nube.
- Cero Docker o infraestructura compleja para el usuario final.

### 2. Cero Fricción al Compartir
El valor de un análisis reside en que la dirección tome decisiones informadas sin barreras técnicas.
- Analyticraft compila el diseño visual, las consultas y los datos en un **único archivo `.html` autocontenido**.
- Cualquier persona puede abrir el reporte haciendo doble clic en su navegador web favorito (Chrome, Edge, Firefox, Safari) en Windows, Mac o Linux.
- Funciona 100% desconectado de internet y sin instalar software adicional.

### 3. Eficiencia Extrema y Filosofía Minimalista
Rechazamos el *bloatware*:
- Arquitectura construida sobre **Tauri (Rust)** y **DuckDB**, consumiendo una fracción mínima de RAM.
- Adopción estricta del formato **CSV** como estándar universal de entrada, evitando la pesadez de parsers binarios propietarios.