# Resultados por comunidades en Javascript
Calculo de resultados por comunidades usando Javascript en un navegador de internet (e.g Firefox). Diseñado para la realización de clasificaciones por comunidades autónomas en campeonatos de España de orientación, siguiendo la normativa FEDO y tras realizar el control de tiempos por sportsoftware.de

## Instrucciones
Este programa se ejecuta en cualquier navegador moderno (ha sido probado en Firefox 59). Para ejecutarlo sigue estos pasos:
 + Selecciona la opcion "individual" o "relevos" para el cálculo en carreras individuales o por relevos.
 + Arrastra el archivo index.html a la barra de direcciones del navegador.
 + Selecciona el csv exportado desde sportsoftware
 + Pulsa el botón "upload"

Si se realiza correctamente y el archivo csv tiene el formato correcto, los resultados serán automaticante mostrados en los 2 cuadros de texto:

 + Final: contiene los resultados de las comunidades desglosados por categorías. Las múltiples columnas ayudan a saber de donde vienen los puntos:
   - sum: cantidad de corredores usados en esa categoría
   - points: suma de puntos de los `sum` corredores
   - excluded: cantidad de corredores no usados para el cálculo de puntuación en esa categoría
   - total: suma de puntos (`points`) de todas las categorías para cada comunidad.

 + Paso 1: contiene todos los puntos calculados para todos los corredores que existen en el archivo csv, con sus categorías, grupos de edad y puestos.

   El cálculo es realizado en `cecParser.js` por la siguiente línea.
   > return winner.getTime().getSeconds() / this.getTime().getSeconds() * winner.getPoints(); // calculate points

 + Errores: contiene (en caso de haberlos) posibles errores. Generalmente serán categorías o grupos de edad no definidos en `CEC.config`.


El archivo `cecParser.js` es el script principal. En el se pueden modificar los parámetros de cálculo editanto el objeto `CEC.config`.
En el se definen las categorías (e.g. M-50, F-E, etc), los grupos de edad en los que se agrupa cada categoría (e.g. veteranos, senior, etc), los diferentes puntos al vencedor (e.g. 100, 125, etc) y el número de corredores que puntua en cada grupo de edad por cada comunidad (e.g. 3, 7, etc).
Todos estos parámetros son facilmente modificables con un editor de texto.


### Exportar desde sportsoftware

Exporta los resultados desde OE2010 y OS2010: `Results/Preliminary/Courses/Export`.
Selecciona las opciones por defecto (csv; delimitador punto y coma `;` ; y delimitador de texto comillas dobles `"` ). Si el evento tiene más de una etapa, exporta una única etapa.
Los archivos exportados se deben almacenar en la carpeta csv.
Es importante que la columna `Región` contiene el nombre de las comunidades autónomas.
Es importante comprobar que los nombres de las columnas coinciden con los archivos de ejemplo en la carpeta `csv`.