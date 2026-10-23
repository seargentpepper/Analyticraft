# Contribuir a Analyticraft 📊

¡Gracias por tu interés en colaborar con Analyticraft! Este proyecto busca entregar una herramienta de BI de escritorio, local-first y ultraeficiente para PyMEs y analistas independientes.

Para mantener una base de código robusta, predecible y fácil de mantener entre contributors, solicitamos seguir estas directrices.

---

## 💻 Requisitos del Sistema y Entorno Local

Analyticraft utiliza una arquitectura híbrida compuesta por un backend nativo en Rust y un frontend web compilado a través de Tauri.

### Herramientas Requeridas:
- **Rust & Cargo:** Versión **1.75.0** o superior (recomendado instalar vía `rustup`).
- **Node.js:** Versión **LTS (v20.x o v22.x)**.
- **Gestor de paquetes:** `pnpm` (recomendado) o `npm` v10+.
- **Dependencias del sistema para Tauri:**
  - **Linux (Debian/Ubuntu):** `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`.
  - **Windows:** Microsoft Visual Studio C++ Build Tools (con SDK de Windows 10/11) y WebView2 (incluido por defecto en Windows 10/11).
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`).

### Puesta en Marcha:
1. Clona el repositorio:
   ```bash
   git clone [https://github.com/TU_USUARIO/Analyticraft.git](https://github.com/TU_USUARIO/Analyticraft.git)
   cd Analyticraft
