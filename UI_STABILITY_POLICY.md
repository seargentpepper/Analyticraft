# Política de Estabilidad de UI y No Regresión (Zero UI Breakage)

Esta política establece directrices obligatorias para evitar romper vistas, estilos, componentes o layouts que ya se encuentran funcionando de forma correcta en **Analyticraft**.

---

## 1. Reglas de Intervención en Código

1. **Ediciones Quirúrgicas (No Reescribir Archivos Completos):**
   - Queda estrictamente prohibido reemplazar o regenerar componentes funcionales completos (`.tsx`) para agregar una función secundaria o corregir un detalle.
   - Solo se deben aplicar cambios localizados (diffs / ediciones específicas de funciones o bloques concretos).

2. **Integridad de Clases y Estilos Globales ([`src/App.css`](file:///c:/Users/Admin/Github/Analytics/Analyticraft/src/App.css)):**
   - **No renombrar, eliminar ni sobreescribir** selectores CSS existentes que afecten componentes estables (`.card`, `.panel`, `.btn`, `.modal-backdrop`, barras laterales o canvas).
   - Si se requiere un estilo nuevo o modificado, usar clases específicas con sufijo o namespaces (ej. `.card-floating--custom`) en lugar de alterar la clase base.

3. **Respeto a "Zonas Congeladas" (Frozen Zones):**
   - Las siguientes áreas con comportamiento visual y funcional validado no deben alterarse sin justificación y confirmación explícita:
     - **Canvas y distribución de tablas:** [`src/components/ModelView.tsx`](file:///c:/Users/Admin/Github/Analytics/Analyticraft/src/components/ModelView.tsx)
     - **Renderizado e interacción de gráficos:** [`src/components/ChartCard.tsx`](file:///c:/Users/Admin/Github/Analytics/Analyticraft/src/components/ChartCard.tsx)
     - **Selectores de campos y dimensiones:** [`src/components/FieldsPanel.tsx`](file:///c:/Users/Admin/Github/Analytics/Analyticraft/src/components/FieldsPanel.tsx)

4. **Inmutabilidad de Contratos de Props y Estados:**
   - No eliminar props existentes de los componentes de UI. Si se requiere una nueva funcionalidad, la prop debe ser opcional (`prop?: type`) con un valor predeterminado seguro que conserve el comportamiento previo.

---

## 2. Checklist Obligatorio tras Cada Cambio en UI

Antes de dar por concluida cualquier tarea que toque elementos visuales o de interacción:

- [ ] **Sin errores de compilación:** `npm run build` debe pasar sin fallos de TypeScript.
- [ ] **Tests unitarios vigentes:** `npm run test` debe ejecutar limpiamente sin regresiones lógicas.
- [ ] **Sin desbordamientos accidentales (overflow):** Las tarjetas, modales y paneles laterales no deben desbordar el viewport ni perder sus barras de desplazamiento internas.
- [ ] **Preservación visual:** Los componentes adyacentes conservan sus márgenes, padding y alineación originales.

