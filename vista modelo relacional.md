### 1\. ¿Qué es esta UI y qué aporta al usuario?

-   **Definición:** Es la **Vista de Modelo (Model View)** de Power BI Desktop.
    
    PNG
    
-   **Aporte:** Permite al usuario visualizar, construir y gestionar el modelo de datos relacional. En lugar de tener una única tabla plana gigante, el usuario puede tener múltiples tablas conectadas lógicamente (esquemas de estrella o copo de nieve). Esto optimiza el rendimiento, evita la redundancia de datos y permite que los filtros aplicados en una tabla (como `Geography` o `Calendar`) interactúen correctamente con los datos de otra (como `Sales`).
    
    PNG\+ 1
    

### 2\. ¿Cómo se accede a ella?

-   El usuario accede haciendo clic en el **tercer ícono de la barra lateral izquierda**, el cual muestra tres rectángulos conectados por líneas. En la imagen de referencia, este botón está resaltado con un recuadro rosa y la letra **"A"**.
    
    PNG\+ 1
    

### 3\. Interacción: ¿Cómo crea el usuario conexiones e interrelaciones?

-   **Método visual (Drag & Drop):** El usuario hace clic izquierdo mantenido sobre un campo de una tabla (por ejemplo, `StoreKey` en la tabla `Stores`) y lo arrastra hasta el campo correspondiente en otra tabla (como `StoreKey` en la tabla `Sales`).
    
    PNG
    
-   **Líneas de relación:** Al hacer esto, la UI genera una línea conectora (como la resaltada con la letra **"B"**) que une ambas tablas.
    
    PNG
    
-   **Gestión avanzada:** Para editar detalles de la relación (cardinalidad o dirección del filtro), el usuario puede hacer doble clic sobre la línea conectora o utilizar el botón **"Manage Relationships"** ubicado en la cinta superior.
    
    PNG
    
-   **Lectura de interrelaciones:** Las líneas muestran símbolos en sus extremos. Un "1" indica el lado "uno" de la relación (valores únicos, llave primaria), y un asterisco "\*" indica el lado "muchos" (valores repetidos, llave foránea). La flecha en el centro de la línea indica la dirección en la que fluyen los filtros.
    
    PNG\+ 1
    

### 4\. Distribución de la Interfaz (Diagrama de Árbol)

-   1\. Cinta de Opciones Superior (Ribbon - Pestaña 'Home' activa)
    
    PNG
    
    -   **1.1. External Data:** Botones `Get Data`, `Recent Sources`, `Edit Queries`, `Refresh` para importar y actualizar datos.
        
        PNG
        
    -   **1.2. Insert:** Botones para añadir `Text Box`, `Image`.
        
        PNG
        
    -   **1.3. Report:** Botón para crear una `New Page`.
        
        PNG
        
    -   **1.4. Relationships:** Botón crucial `Manage Relationships` para ver y editar todas las conexiones en forma de lista.
        
        PNG
        
    -   **1.5. Calculations:** Herramientas DAX para crear `New Measure` o `New Column`.
        
        PNG
        
-   2\. Barra de Vistas (Barra Lateral Izquierda)
    
    PNG
    
    -   **2.1. Vista de Informe:** (Ícono de gráfico, inactivo).
        
        PNG
        
    -   **2.2. Vista de Datos:** (Ícono de tabla, inactivo).
        
        PNG
        
    -   **2.3. Vista de Modelo (Activa):** (Ícono de diagrama relacional, resaltado con la letra A).
        
        PNG
        
-   3\. Lienzo de Modelado (Área Central Oscura)
    
    PNG
    
    -   **3.1. Tablas de Entidades (Nodos):** Cajas blancas flotantes que representan las tablas cargadas en el modelo (`Geography`, `Sales`, `Product`, `Stores`, etc.).
        
        PNG
        
        -   _Cabecera de Tabla:_ Nombre de la tabla.
            
            PNG
            
        -   _Cuerpo de Tabla:_ Lista desplegable de los campos/columnas de esa tabla. Las tablas seleccionadas (como `Stores`) se resaltan con un borde amarillo.
            
            PNG\+ 1
            
    -   **3.2. Conectores (Líneas de Relación):** Líneas que unen los campos de diferentes tablas (ej. línea **"B"** conectando `StoreKey` entre `Stores` y `Sales`).
        
        PNG
        
        -   _Indicadores de Cardinalidad:_ Símbolos `1` (Uno) y `*` (Muchos) en los extremos.
            
            PNG
            
        -   _Indicadores de Dirección:_ Pequeñas flechas en el medio de la línea indicando hacia dónde se propagan los filtros.
            
            PNG
            

### 5\. ¿Cómo hacerla más "Newbie Friendly"? (Sugerencias de mejora UX)

Para un usuario novato, este diagrama puede resultar abrumador. Se podría mejorar de las siguientes formas:

1.  **Codificación por Colores Automática:** Que la UI detecte y coloree automáticamente las cabeceras de las Tablas de Hechos (Fact tables, ej. `Sales`) de un color, y las Tablas de Dimensiones (Dim tables, ej. `Stores`, `Geography`) de otro.
    
2.  **Sugerencias de Relación Visibles:** Un botón de "Auto-Detectar" que sugiera relaciones no solo lógicamente, sino resaltando los campos en ambas tablas con un aura brillante para que el usuario simplemente confirme la conexión sugerida.
    
3.  **Glosario en Tooltips:** Que al pasar el cursor sobre el "1" o el "\*", aparezca un globo de texto explicando en lenguaje natural: _"Un elemento de 'Stores' puede tener múltiples registros en 'Sales'"_.
    
4.  **Auto-Alineación Semántica:** Un botón que ordene automáticamente las tablas en un esquema de "cascada" (Dimensiones arriba, Hechos abajo), en lugar de dejar que el usuario las tire desordenadamente en el lienzo.
    

### 6\. ¿Cómo replicarla sin perder detalles? (Guía de reconstrucción)

Si un sistema necesitara regenerar este modelo exacto desde cero, los pasos imperativos serían:

1.  **Instanciar las Tablas:** Crear exactamente los 7 nodos principales visibles (`Geography`, `Stores`, `Channel`, `Promotion`, `Sales`, `Product`, `ProductSubcategory`, `ProductCategory`, `Calendar`) con todos sus respectivos campos listados internamente.
    
    PNG
    
2.  **Replicar Posicionamiento:** Distribuir las tablas espacialmente en el lienzo. Colocar `Sales` (la tabla de hechos principal) en el centro. Colocar las dimensiones alrededor (`Geography` y `Stores` a la izquierda, `Product` arriba a la derecha, `Calendar` abajo, etc.).
    
    PNG\+ 1
    
3.  **Trazar las Relaciones (Foreign Keys a Primary Keys):**
    
    -   Trazar línea de `Stores` (StoreKey) a `Sales` (StoreKey) -> Cardinalidad 1 a \*, Filtro Único.
        
        PNG
        
    -   Trazar línea de `Channel` a `Sales` -> Cardinalidad 1 a \*, Filtro Único.
        
        PNG
        
    -   Trazar línea de `Promotion` a `Sales` -> Cardinalidad 1 a \*, Filtro Único.
        
        PNG
        
    -   Trazar línea de `Calendar` a `Sales` -> Cardinalidad 1 a \*, Filtro Único.
        
        PNG
        
    -   Recrear la relación en copo de nieve: `Product` conectado a `Sales`, pero `Product` a su vez se conecta a `ProductSubcategory`, y esta a `ProductCategory` (trazando relaciones de 1 a \*).
        
        PNG
        
4.  **Verificar Cardinalidad y Flujo:** Asegurar que todos los números "1" estén del lado de las tablas descriptivas (dimensiones) y los asteriscos "\*" estén del lado de la tabla `Sales` (hechos), apuntando las flechas del centro siempre hacia la tabla `Sales`.
    
    PNG