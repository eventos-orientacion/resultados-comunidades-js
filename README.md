# Resultados por comunidades en Javascript
Calculo de resultados por comunidades usando Javascript en un navegador de internet (e.g Firefox). Diseñado para la realización de clasificaciones por comunidades autónomas en campeonatos de España de orientación, siguiendo la normativa FEDO y tras realizar el control de tiempos por sportsoftware.de

Calculo de resultados individuales testeado en 2018 (CEO distancia media, resultados de relevos no testeado completamente)

## Instrucciones
Este programa se ejecuta en cualquier navegador moderno (ha sido probado en Firefox 59). Para ejecutarlo sigue estos pasos:
 + Arrastra el archivo index.html a la barra de direcciones del navegador (o pulsa este [enlace](https://eventos-orientacion.github.io/resultados-comunidades-js/index.html)).
 + Selecciona la opcion "individual" o "relevos" para el cálculo en carreras individuales o por relevos.
 + Selecciona el csv exportado desde sportsoftware
 + Pulsa el botón "upload"

Si se realiza correctamente y el archivo csv tiene el formato correcto, los resultados serán automaticante mostrados en los 2 cuadros de texto:

 + **Suma final de resultados**: contiene los resultados de las comunidades desglosados por categorías. Las múltiples columnas ayudan a saber de donde vienen los puntos. Los nombres están definidos en `CEC.config.columns`:
   - **cant** (sum): cantidad de corredores usados en esa categoría
   - **PUNTOS** (points): suma de puntos de los `sum` corredores
   - **fuera** (excluded): cantidad de corredores no usados para el cálculo de puntuación en esa categoría
   - **TOTAL**: suma de puntos (`points`) de todas las categorías para cada comunidad.

 + **Todos los puntos por cada corredor**: contiene todos los puntos calculados para todos los corredores que existen en el archivo csv, con sus categorías, grupos de edad y puestos.

   El cálculo es realizado en `cecParser.js` por la siguiente línea.
   > return winner.getTime().getSeconds() / this.getTime().getSeconds() * winner.getPoints(); // calculate points

 + **Errores**: contiene (en caso de haberlos) posibles errores. Generalmente serán categorías o grupos de edad no definidos en `CEC.config`.


El archivo `cecParser.js` es el script principal. En el se pueden modificar los parámetros de cálculo editanto el objeto `CEC.config`.
En el se definen las categorías (e.g. M-50, F-E, etc), los grupos de edad en los que se agrupa cada categoría (e.g. veteranos, senior, etc), los diferentes puntos al vencedor (e.g. 100, 125, etc) y el número de corredores que puntua en cada grupo de edad por cada comunidad (e.g. 3, 7, etc).
Todos estos parámetros son facilmente modificables con un editor de texto.


### Exportar desde sportsoftware

Exporta los resultados desde OE2010 y OS2010: `Results/Preliminary/Courses/Export`.

El formato del archivo debe ser similar a `ejemplo.csv`

Selecciona las opciones por defecto (csv; delimitador punto y coma `;` ; y delimitador de texto comillas dobles `"` ). Si el evento tiene más de una etapa, exporta una única etapa.

Los archivos exportados se deben almacenar en la carpeta csv.

Es importante que la columna `Región` contiene el nombre de las comunidades autónomas.

Es importante que el caracter de final de línea sea `\r\n` y que la codificación sea `ISO-8859-15`, en caso contrario modificar `CEC.csvParser.config`

Es importante comprobar que los nombres de las columnas coinciden con los archivos del objecto `col` en `CEC.Entry` (Nombre, Apellidos, Dorsal, Región, Corto, Tiempo, Puesto).

La columna `Puesto` será utilizada para obtener la puntuación del ganador de la categoría (`Corto`). En el supuesto que un corredor tenga un resultado en `Tiempo` que menor al primero de la categoría y un `Puesto` mayor, el corredor obtendrá una puntuación mayor a la del ganador (esto no debería pasar nunca, pero podría darse el caso de una exportación erronea, por ejemplo, en eventos de varias etapas)

Es importante que los corredores fuera de concurso (por ejemplo, extranjeros) no aparezcan como ganadores (`Puesto` 1) ya que alteraría los resultados de puntos de los demás corredores de la categoría (en último caso deben ser eliminados manualmente del csv)


### Posibles errores
+ Probar con una versión actual de Firefox y abrir la consola de inspección (pulsar F12) para ver más errores.
+ Errores de `group` y `class` mostrados en el cuadro de errores. Estas categorías pueden no estr definidas con los nombres correctos en el objeto `CEC.config`.
+ Aparicion de todos los valores como `undefined` o `NA` o no mostrar ningún resultado despues de pulsar el botón de calcular: Problemas con la definición de columnas (comprobar sus nombres con el objecto `col` en `CEC.Entry`). Puede ser que el exista un carácter invisible (`\r\n`) al final de la última columna del csv (para evitar esto añadir una columna con cualquier nombre en el csv). Los nombres de las columnas no deben contener comillas dobles `"`. 
+ Los resultados aparecen en una única fila del csv. El carácter de final de línea debe ser `\r\n` (modificar el csv o `CEC.csvParser.config.newline` a `\n`)
+ Cálculo de puntuaciones muy alto o muy bajo: es posible que el formato de tiempos no sea el adecuado, este debe ser de MM:SS (ejemplo: 21:32 son 21 minutos 32 segundos). En ocasiones programas como Excel, pueden alterar los tiempos del csv (por ejemplo, si queden 21:32:00 serán tomados como 21 horas 32 minutos)
