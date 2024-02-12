                         A. UN_Neuro

UN_Neuro es una herramienta que facilita el dise�o, entrenamiento
y simulaci�n de redes neuronales, est� hecha para MS-Windows 3.1.

Fu� desarrollada en la Universidad Nacional de Colombia como 
proyecto de grado de Ingenier�a de Sistemas. Cualquier inquietud o
sugerencia puede ser dirigida a sus autores.

	Jonatan G�mez
	Fabio Gonz�lez

      	Calle 75a #26-43 
	Santafe de Bogot�, Colombia.
	Tel 2 40 45 25
	II25406@UNALCOL.BITNET	    


                       B. MANUAL DEL USUARIO

B.1 INTRODUCCION

UN-Neuro es un prototipo de herramienta para el dise�o,
entrenamiento y simulaci�n de redes neuronales.

B.1.1 Como Instalar UN-Neuro
El disco flexible con UN-Neuro contiene un programa ejecutable
que instala UN-Neuro, si la unidad donde se encuentra el disco
flexible, corresponde a la unidad A:, digite ' win A:\UNNEURO '.
Esto activar� un programa de instalaci�n.

B.1.2 Requerimientos de hardware y software
- Para trabajar con UN-Neuro debe tener MicroSoft Windows 3.1
instalado en su computador.
- 2 Megabytes de memoria principal (Preferiblemente 4 Megabytes)
- 3 Megabyte en disco duro.
- Se recomienda el uso de una pantalla a color.
- Es indispensable el uso de un rat�n.
- Se recomienda el uso de un coprocesador matem�tico y un
procesador 80386 o superior.
B.1.3 Uso de UN-Neuro
Para trabajar con UN-Neuro usted debe conocer c�mo trabajar en
Windows, si no ha trabajado en Windows consulte la gu�a del
usuario Windows.

UN-Neuro al instalar genera un grupo Windows llamado UN-Neuro,
presione r�pidamente dos veces el bot�n izquierdo del rat�n en el
grupo UN-Neuro, y aparecer� la ventana mostrada en la ilustraci�n
1.

En esta ventana aparecen tres �conos con los nombres UN-
NeuroEditor, UN-NeuroEntrenador, UN-NeuroSimulador.

UN-NeuroEditor es el m�dulo de edici�n y dise�o gr�fico de redes
neuronales.

UN-NeuroEntrenador es el m�dulo de entrenamiento de redes
neuronales.

UN-NeuroSimulador es el m�dulo de simulaci�n de redes neuronales.

Para entrar a cada modulo presione r�pidamente dos veces el bot�n
izquierdo del rat�n en el �cono del m�dulo.

B.1.4 Pasos para la realizaci�n de una aplicaci�n de redes
neuronales
La realizaci�n de una aplicaci�n de redes neuronales implica la
utilizaci�n de los tres m�dulos. Aunque no se tiene un orden
predefinido para el uso de los m�dulos, la secuencia t�pica de
pasos para el empleo de los mismos es:

A. Dise�ar y construir la red neuronal usando UN-NeuroEditor,
guard�ndola en un archivo de disco.

B. Crear un archivo que contenga los patrones con los cuales se
va a entrenar la red. Para esto se puede utilizar cualquier
editor de texto (formato ASCII). Opcionalmente se puede crear
otro archivo de patrones con el cual se realiza el c�lculo del
error de generalizaci�n durante el entrenamiento.

C. Utilizar UN-NeuroEntrenador, cargando la red generada por UN-
NeuroEditor, as� como los patrones creados en el paso anterior.
Se debe especificar el algoritmo de entrenamiento. Despu�s de
terminado el entrenamiento se debe guardar la red en un archivo
de disco.

D. Simular la red que fue almacenada en un archivo en disco en el
paso anterior, utilizando UN-NeuroSimulador.
   



B.2 USANDO UN-NeuroEditor

UN-NeuroEditor es el m�dulo de edici�n y dise�o de redes
neuronales, en el cual se pueden tener a la vez varias redes en
edici�n, cada una en una ventana diferente.

Cuando usted entra a UN-NeuroEditor encuentra la ventana de la
ilustraci�n 2.

Esta ventana tiene una barra de men�s con los siguientes
submen�s:

B.2.1 Sumario de comandos
Archivos:
Permite realizar las operaciones de disco disponibles en la
aplicaci�n como cargar, guardar, incluir, etc..
Las opciones del men� son:

 Nueva:   Abre una ventana en blanco, para editar una red
          neuronal nueva (sin nombre). El efecto de este comando
          se puede apreciar en la ilustraci�n 3.

 Cargar:  Carga una red neuronal almacenada en un archivo en
          disco en una ventana con el nombre del archivo
          especificado. Primero seleccione esta opci�n con lo
          cual aparecer� una caja de di�logos en la que puede
          especificar el nombre del archivo. Al ejecutar este
          comando aparecer� una ventana conteniendo la red
          neuronal especificada, como lo muestra la ilustraci�n
          4.

 Guardar: Almacena la red neuronal de la ventana activa en un
          archivo en disco. Si la red neuronal que desea guardar
          no tiene nombre, la aplicaci�n desplegar� una caja de
          di�logos en la cual se debe especificar el nombre del
          archivo con el que se almacenara la red neuronal en
          disco.

 Guardar Como...:
          Almacena la red neuronal de la ventana activa en un
          archivo con el nombre que el usuario especifica,
          mediante una caja de di�logos.

 Incluir Red: 
          Incluye una red neuronal almacenada en un archivo en
          disco en la red neuronal actual, primero pregunta cual
          red quiere incluir mediante una caja de di�logos. Para
          incluir la red, primero se debe seleccionar esta
          opci�n, luego se debe seleccionar la opci�n Pegar del
          men� Edici�n y presionar el bot�n izquierdo del rat�n
          en el lugar donde se quiere incluir la red.

Terminar: Cierra el modulo de edici�n, si alguna red neuronal no
          ha sido salvada pregunta si se desea salvar o no.

Edici�n:
Permite realizar la manipulaci�n de bloques para realizar
operaciones de edici�n avanzadas como cortar, copiar, pegar,
etc..
Las opciones del men� son:

 Cortar:
          Elimina las neuronas y las conexiones relacionadas con
          �stas, que se encuentran en el bloque seleccionado y
          copia la subred neuronal contenida en el bloque a un
          buffer global. Para realizar esta operaci�n, primero se
          debe seleccionar un bloque de neuronas de la red con la
          opci�n Seleccionar Bloque del men� de Edici�n. La
          subred almacenada en el buffer global puede ser copiada
          en cualquier red neuronal que se este editando al
          seleccionar la opci�n Pegar del men� de Edici�n y
          presionando el bot�n izquierdo del rat�n en el lugar
          donde se quiere pegar.

 Copiar:
          Copia la subred neuronal contenida en el bloque
          seleccionado a un buffer global. Para realizar esta
          operaci�n primero se debe seleccionar un bloque de
          neuronas de la red con la opci�n Seleccionar Bloque del
          men� de Edici�n. La subred almacenada en el buffer
          global puede ser copiada en cualquier red neuronal que
          se este editando al seleccionar la opci�n Pegar del
          men� de Edici�n y presionando el bot�n izquierdo del
          rat�n en el lugar donde se quiere pegar.


 Pegar:
          Pega la subred contenida en un buffer global despu�s de
          realizar cualquier operaci�n de Copiar, Cortar o
          Incluir Red. Despu�s de seleccionar esta opci�n, para
          pegar la red neuronal contenida en el buffer global, se
          debe presionar el bot�n izquierdo del rat�n en el lugar
          donde se quiere pegar.

Seleccionar Bloque:
          Define un bloque de neuronas para realizar con ellas
          las operaciones de edici�n avanzada de bloques.
          Para seleccionar un bloque primero se debe escoger esta
          opci�n del men�, luego presionar el bot�n izquierdo del
          rat�n sobre la primer coordenada del bloque, sin soltar
          el bot�n del rat�n se arrastra el rat�n hasta la
          segunda coordenada del bloque y se suelta el bot�n
          izquierdo del rat�n. Despu�s de seleccionar el bloque
          se pueden realizar las operaciones de Cortar, Copiar,
          Mover, y definir Bloques para conexi�n total. Se puede
          seleccionar una sola neurona presionando el bot�n
          izquierdo del rat�n sobre la neurona y solt�ndolo
          inmediatamente.

Definir Bloque Origen:
          Determina que el bloque seleccionado de neuronas se
          considera como el bloque de origen para la conexi�n
          total entre dos bloques de neuronas. Para realizar esta
          operaci�n debe seleccionarse previamente un bloque con
          la opci�n Seleccionar Bloque del men� de Edici�n.

Definir Bloque Destino:
          Determina que el bloque seleccionado de neuronas se
          considera como el bloque de destino para la conexi�n
          entre dos bloques de neuronas. El efecto es que de toda
          neurona del bloque origen sale una conexi�n a toda
          neurona del bloque destino. Para realizar esta
          operaci�n debe seleccionarse previamente un bloque con
          la opci�n Seleccionar Bloque del men� de Edici�n. Para
          que esta opci�n tenga efecto, debe haberse definido
          previamente un bloque origen.

Copiar al Porta Papeles:
          Hace una copia gr�fica de la red neuronal que se env�a
          al Porta Papeles de Windows para ser llevado a otra
          aplicaci�n que lea el Porta Papeles. 

Neurona:
Permite realizar las operaciones b�sicas sobre una neurona como
borrar, adicionar, modificar, etc..

Las opciones del men� son:

 Adicionar:
          Adiciona una neurona de entrada, oculta o de salida
          desplegando un submen� con las siguientes opciones
          Entrada, Oculta, Salida. Para adicionar una neurona a
          la red neuronal se debe elegir primero que tipo de
          neurona se va a adicionar seleccion�ndolo del submen�
          que aparece, y luego presionar el bot�n izquierdo del
          rat�n en el lugar donde se desea adicionar.

 Borrar:
          Borra la neurona a seleccionar. Para borrar una neurona
          se debe seleccionar esta opci�n y luego presionar el
          bot�n izquierdo del rat�n sobre la neurona a borrar.

 Modificar Bloque de:
          Modifica los atributos de las neuronas contenidas en el
          bloque seleccionado, mediante una caja de di�logos en
          la que se pueden especificar los atributos para este
          grupo de neuronas. Para realizar esta operaci�n, se
          selecciona el bloque de neuronas a modificar con la
          opci�n de Seleccionar Bloque del men� de Edici�n, y se
          escoge esta opci�n.

 Consultar y Modificar:
          Muestra los atributos de la neurona que se seleccione,
          mediante una caja de di�logos. Para mostrar los
          atributos de la neurona se selecciona esta opci�n, y se
          presiona el bot�n izquierdo del rat�n en la neurona a
          consultar. Esta caja de dialogos permite la
          modificaci�n de los mismos.

 Fusionar:
          Fusiona dos neuronas en una. Para efectuar esta
          operaci�n se escoge esta opci�n, se selecciona la
          neurona que se incluir�a en otra presionando el bot�n
          izquierdo del rat�n sobre ella, sin liberar el bot�n
          del rat�n se ubica el rat�n sobre la neurona que va a
          recibir la neurona ya seleccionada y se libera el bot�n
          izquierdo del rat�n. Todas las conexiones de la primer
          neurona ser�n llevadas a la segunda neurona.

Conexi�n:
Permite realizar las operaciones b�sicas sobre una conexi�n como
borrar, adicionar, modificar, etc.

Las opciones del men� son:
 
 Adicionar:
          Adiciona una conexi�n entre dos neuronas. Primero se
          debe seleccionar la neurona de origen presionando el
          bot�n izquierdo del rat�n sobre la neurona, sin liberar
          el bot�n se ubica el rat�n sobre la neurona que va a
          ser la neurona destino y se libera el bot�n izquierdo
          del rat�n.

 Borrar:
          Elimina la conexi�n existente entre dos neuronas. La
          operaci�n es id�ntica a la de adici�n de conexiones.

 Modificar Bloque de:
          Modifica los atributos del grupo de conexiones que se
          encuentran en el bloque seleccionado, mediante una caja
          de di�logos donde se pueden especificar los atributos
          para este grupo de conexiones. Primero se escoge el
          bloque de conexiones con la opci�n de Seleccionar
          Bloques del men� de Edici�n, y luego se elige esta
          opci�n.

 Consultar y Modificar:
          Muestra los atributos de la conexi�n que se seleccione.
          La operaci�n es id�ntica a la de adici�n de conexiones.
          Los atributos son mostrados en una caja de di�logos que
          permite la modificaci�n de los mismos.

 Mostrar Conexiones:
          Si esta opci�n esta seleccionada la aplicaci�n mostrar�
          las l�neas de conexiones, si no esta seleccionada no
          las mostrar�.

Ventana:
Permite realizar la manipulaci�n de las ventanas que se
encuentran abiertas, tales como cerrar todas las ventanas,
arreglar los iconos, etc.
Las opciones de este men� son:

 Cascada: 
          Organiza todas las ventanas en forma de cascada

 Distribuir:
          Organiza todas las ventanas de modo que ninguna quede
          cubierta por otra.

 Cerrar Todas:
          Cierra todas las ventanas que se encuentre abiertas.
          Pregunta si se desean almacenar los cambios de las
          redes neuronales que se han modificado.

 Organizar Iconos:
          Organiza las ventanas minimizadas (�conos) de modo que
          no se sobrepongan unas a las otras.

Ayuda:
Permite al usuario obtener informaci�n sobre el m�dulo de
entrenamiento, los comandos y otra informaci�n que facilitan el
uso del programa.

Un men� muy importante que contiene cada ventana es el Men� de
Control de la ventana, y se encuentra en la esquina superior-
izquierda de la ventana. Las opciones de este men� son:

 Minimizar:
          Minimiza la ventana (la lleva a un �cono).
 
 Maximizar:
          Maximiza la ventana (lleva la ventana a su tama�o
          m�ximo).

 Restaurar:
          Lleva la ventana a su tama�o previo.

 Acercar:
          Reduce el factor de escala para ver la red neuronal un
          poco m�s grande.


 Alejar:
          Aumente el factor de escala para ver la red neuronal un
          poco m�s peque�a.


B.2.2 Como construir una red neuronal
Los pasos t�picos para la construcci�n de una red neuronal son
los siguientes:

A. Escoger la opci�n Nueva del men� Archivos.

B. Adicionar neuronas (ocultas, entrada y/o salida) mediante la
opci�n Adicionar del men� Neurona.

C. Adicionar conexiones entre neuronas utilizando la opci�n
Adicionar del men� Conexi�n.

D. Cambiar los atributos de las neuronas y las conexiones con la
opci�n Modificar de los men�s Neurona y Conexi�n respectivamente.

E. Opcionalmente emplear las herramientas de edici�n avanzada,
men� Edici�n, si se necesitan.

F. Guardar la red neuronal en un archivo de disco, empleando la
opci�n Guardar o Guardar como del men� Archivos.

G. Salir del programa utilizando la opci�n Terminar del men�
Archivos. 

B.2.3 Representaci�n gr�fica de una red neuronal
Las neuronas son representadas por un c�rculo que en el interior
tiene una letra indicando el tipo de neurona (E: Entrada, O:
Oculta, S: Salida).

Las conexiones son representadas por l�neas rectas que van desde
la parte frontal de la neurona origen a la parte posterior de la
neurona destino. El color de la conexi�n indica el signo de su
peso (azul: peso positivo, rojo : peso negativo). Las conexiones
que han sido fijadas aparecen como l�neas punteadas.



B.3  USANDO UN-NeuroEntrenador
 
Es el m�dulo de entrenamiento de redes neuronales, en el cual se
carga una red para entrenarla permitiendo la utilizaci�n de
varios algoritmos.

Cuando se ha entrado a UN-NeuroEntrenador se encuentra una
ventana como la de la Ilustraci�n 5.

La ventana consta de dos partes: una parte gr�fica y otra de
informaci�n en formato texto.

La parte gr�fica muestra la evoluci�n del error durante el
proceso de entrenamiento. La gr�fica superior corresponde a la
ra�z del error cuadr�tico medio tanto para los patrones de
entrenamiento (l�nea continua) como para los patrones de prueba
de generalizaci�n (l�nea punteada). La gr�fica inferior
corresponde al error m�ximo. La escala de estas gr�ficas se
ajusta dependiendo del valor del error.



La parte de informaci�n en formato texto se�ala el algoritmo de
entrenamiento en uso, el archivo que est� cargado y los archivos
de patrones tanto de entrenamiento como de prueba de
generalizaci�n. En la parte inferior se muestra el valor de los
errores en cada iteraci�n, adem�s el n�mero de iteraciones
acumuladas y los valores limites para el error y las iteraciones.

Esta ventana tiene una barra de men�s con los siguientes
submen�s:

B.3.1 Sumario de comandos
Archivos:
Permite realizar las operaciones de disco disponibles en la
aplicaci�n como cargar y guardar los patrones y la red neuronal a
entrenar.
Las opciones del men� son:

 Cargar:  Carga una red neuronal almacenada en un archivo en
          disco a ser entrenada. Primero seleccione esta opci�n
          con lo cual aparecer� una caja de di�logos en la que
          puede especificar el nombre del archivo. El programa
          preguntar� si se desea inicializar los pesos de las
          conexiones con valores aleatorios.

 Guardar: Almacena la red neuronal que est� cargada en ese
          momento en un archivo en disco, la red neuronal puede
          estar entrenada parcial o  totalmente.

 Guardar Como...:
          Almacena la red neuronal en un archivo con el nombre
          que el usuario especifica, mediante una caja de
          di�logos.

 Inicializar pesos:
          Da valores aleatorios a los pesos de las conexiones y
          los umbrales de las neuronas.

 Cargar patrones:
          Carga un archivo de patrones existente en disco, el
          cual se utiliza para entrenar la red. Para cargar
          patrones previamente se debe cargar una red neuronal.

 Terminar:
          Cierra el m�dulo de entrenamiento, si la red neuronal
          cargada en ese momento no ha sido guardada, pregunta si
          se desea guardar o no.


Opciones: 
Permite especificar el algoritmo de entrenamiento, sus
par�metros, el n�mero de iteraciones l�mite, la opci�n de
calcular el error de generalizaci�n, etc.

Las alternativas del men� son:

 Fijar l�mites:
          Mediante una caja de di�logo, permite especificar el
          n�mero de iteraciones l�mites y el error l�mite que
          determinan hasta cuando iterar� el algoritmo de
          aprendizaje.

 Especificar algoritmo de aprendizaje:
          Determina el algoritmo de aprendizaje utilizado para
          entrenar la red neuronal. Se utiliza una caja de
          di�logo en la cual el usuario escoge el algoritmo.

 Par�metros del algoritmo:
          Brinda la posibilidad de cambiar par�metros propios del
          algoritmo de aprendizaje en uso. 

 Error de generalizaci�n:
          Da la posibilidad de probar el grado de generalizaci�n
          de la red neuronal, con datos diferentes a los de
          entrenamiento. Una caja de di�logo se emplea para que
          se ingrese el nombre del archivo que contiene los
          patrones.

Entrenar:
Inicia el proceso de entrenamiento de la red neuronal, la barra
de men� es cambiada de modo que solo aparece la opci�n de Parar,
la cual interrumpe el proceso de entrenamiento.

Ayuda:
Permite al usuario obtener informaci�n sobre el m�dulo de
entrenamiento, los comandos y otra informaci�n que facilitan el
uso del programa.

B.3.2 C�mo entrenar una red neuronal
Los pasos para entrenar una red neuronal son los siguientes:

A. Dise�ar una red neuronal y almacenarla en un archivo de disco,
usando UN-NeuroEditor.
B. Crear uno o varios archivos de patrones utilizando cualquier
editor de texto (que deje el archivo en formato ASCII). Los
patrones deben ser consistentes con la estructura de la red
neuronal (ver numeral 3.3).
C. Entrar a UN-NeuroEntrenador, escoger un algoritmo de
aprendizaje utilizando la opci�n Especificar Algoritmo de
Aprendizaje del men� Opciones.
D. Cargar el archivo de disco de la red neuronal, usando la
opci�n Cargar del men� Archivo.
E. Cargar el archivo de patrones de entrenamiento utilizando la
opci�n Cargar Patrones del men� Archivo.
F. Opcionalmente especificar archivo de patrones para la prueba
de generalizaci�n usando la opci�n Error de Generalizaci�n del
men� Opciones.
G. Fijar las iteraciones l�mite y el error l�mite mediante la
opci�n Fijar l�mites del men� Opciones.
H. Fijar los par�metros propios del algoritmo mediante la opci�n
Par�metros del Algoritmo del men� Opciones.
I. Comenzar el proceso de entrenamiento seleccionando la opci�n
Entrenar de la barra de men�s.
J. Almacenar la red neuronal entrenada o parcialmente entrenada
en un archivo de disco, utilizando la opci�n Guardar del men�
Archivo.
K. Salir del programa mediante la opci�n Terminar del men�
Archivo.

Nota: Las instrucciones para cambiar los par�metros del algoritmo
de aprendizaje son propias de cada algoritmo, y pueden ser
consultadas en l�nea mediante la opci�n Ayuda de la barra de
men�s.
 
B.3.3 C�mo crear un archivo de patrones
Un patr�n es un vector de n�meros reales de longitud n+m, donde n
es el n�mero de neuronas de entrada y m es el n�mero de neuronas
de salida de la red neuronal a entrenar.

Un archivo de patrones es una colecci�n de vectores que
representan los patrones, los cuales se distribuyen uno por cada
l�nea. El formato de estos vectores debe ser el siguiente:
     ( p1 p2 .. pn pn+1 .. pn+m )
Por ejemplo:
          ( 0.9 0.1 0.9 )
es un patr�n que puede servir para entrenar una red neuronal con
dos entradas y una salida o, una red neuronal con una entrada y
dos salidas.

La realizaci�n de un archivo de patrones se puede llevar a cabo
con un editor de texto (que genere archivos ASCII).




B.4 USANDO UN-NeuroSimulador

Es el m�dulo de simulaci�n de redes neuronales, en el cual se
carga una red para simularla gr�ficamente o por medio de
archivos.

Cuando se ha entrado a UN-NeuroSimulador encuentra una ventana
como la de la ilustraci�n 6.

Esta ventana tiene una barra de men�s con los siguientes
submen�s:

B.4.1 Sumario de comandos
Archivo: 
La opci�n de este men� es: 
 
 Cargar red: 
          Permite especificar mediante una caja de di�logos el
          archivo de la red neuronal a simular, luego pregunta el
          modo de simulaci�n.
 
Opciones:
Este submen� da la posibilidad al usuario de simular la red de
una forma diferente a la gr�fica. Las opciones de este men� son:

 Propagar archivo de patrones: 
          El usuario debe especificar un archivo de patrones de
          entrada que el m�dulo de simulaci�n utiliza para
          propagarlos a trav�s de la red neuronal generando un
          archivo de salida. (Solo utilizable para redes
          neuronales feedforward)

  Generar c�digo C++:
          El m�dulo de simulaci�n genera mediante esta opci�n un
          programa fuente en C++ que al ser compilado permite
          simular la red neuronal.

 Mostrar Conexiones:
          Si esta opci�n esta seleccionada la aplicaci�n mostrar�
          las l�neas de conexiones, si no esta seleccionada no
          las mostrar�.

Propagar:
Por medio de esta opci�n el programa propaga gr�ficamente los
valores fijados previamente por el usuario mediante la
utilizaci�n del rat�n.

Ver:
Este submen� permite al usuario cambiar la escala de
visualizaci�n de la red neuronal.
 
 Acercar:
          Reduce el factor de escala para ver la red neuronal un
          poco m�s grande.

 Alejar:
          Aumenta el factor de escala para ver la red neuronal un
          poco m�s peque�a.

Ayuda:
Permite al usuario obtener informaci�n sobre el m�dulo de
simulaci�n, los comandos y otra informaci�n que facilitan el uso
del programa.

B.4.2 C�mo simular una red neuronal
Los pasos para simular una red neuronal son los siguientes:

A. Crear y entrenar una red neuronal utilizando UN-NeuroEditor y
UN-NeuroEntrenador.
B. Entrar a UN-NeuroSimulador, cargar la red neuronal a simular
utilizando la opci�n Cargar del men� Archivo.
C. Cambiar valores de salida de las neuronas utilizando el rat�n,
de la siguiente forma: posicione el cursor en la neurona a
modificar, presionando el bot�n izquierdo el valor de salida de
la neurona es cambiado a 0.1 o 0.9 alternadamente, presionando el
bot�n derecho aparece una caja de di�logo en la cual puede
modificar el valor de la salida.
D. Simular gr�ficamente la red neuronal paso a paso utilizando la
opci�n Propagar de la barra de men�s.
E. Opcionalmente propagar un archivo de entradas (un archivo de
patrones con valores para las neuronas de entrada, ver numeral
3.3) ya creado, usando la opci�n Propagar archivo de patrones del
men� Opciones.
F. Opcionalmente crear un archivo con c�digo en C++ que simule la
red neuronal, mediante la opci�n Generar c�digo C++ del men�
Opciones.

B.4.3 Representaci�n gr�fica de la red neuronal

La representaci�n es similar a la empleada en el m�dulo de dise�o
y edici�n (UN-NeuroEditor), pero las neuronas cuya salida supera
el valor n�merico 0.5 son mostradas en un color m�s oscuro.




                            C. EJEMPLOS


C.1 INTRODUCCION

En este anexo se muestran dos ejemplos de aplicaci�n del
prototipo. Son ejemplos sencillos y su prop�sito es el de
ilustrar el uso de los tres m�dulos. Los archivos de las redes
neuronales utilizadas en los ejemplos, as� como los archivos de
patrones utilizados para entrenarlas se adjuntan a la aplicaci�n,
de modo que se pueda experimentar con dichos ejemplos. El primer
ejemplo corresponde a una red que resuelve el problema de la
paridad y el segundo a una red que resuelve un problema de
codificaci�n, estos ejemplos se encuentran documentados en el
art�culo de D.E. Rumelhart y sus colegas.

C.2 EL PROBLEMA DE LA PARIDAD

El problema consiste en determinar si el n�mero de entradas que
tienen un valor l�gico de 1 es par o impar. Aqu� se resolver� el
problema para tres entradas,  de modo que la red neuronal para
este problema debe tener tres neuronas de entrada y una neurona
de salida. Las entradas y la salida son binarias, si la salida es
mayor de 0.5 indicar� que el n�mero de unos l�gicos en la entrada
es impar, en caso contrario es par. 


La red neuronal dise�ada usando UN-NeuroEditor se muestra en la
ilustraci�n 16, esta red tiene tres neuronas de entrada, siete
neuronas ocultas y una neurona de salida. La definici�n de esta
red se encuentra en el archivo PARIDAD.NET el cual puede ser
editado utilizando UN-NeuroEditor.

Se utilizaron ocho patrones para entrenar la red, cada uno de los
patrones tiene cuatro valores, los tres primeros corresponden a
los datos de entrada y el �ltimo a la salida deseada. A
continuaci�n se transcribe el archivo de patrones PARIDAD.PAT (el
valor 0.1 representa el cero l�gico, y el valor 0.9 el uno
l�gico).

     (  0.1  0.1  0.1  0.1  )
     (  0.1  0.1  0.9  0.9  )
     (  0.1  0.9  0.1  0.9  )
     (  0.1  0.9  0.9  0.1  )
     (  0.9  0.1  0.1  0.9  )
     (  0.9  0.1  0.9  0.1  )
     (  0.9  0.9  0.1  0.1  )
     (  0.9  0.9  0.9  0.9  )

Utilizando UN-NeuroEntrenador se entren� la red neuronal haciendo
uso de los archivos de definici�n de la red y el archivo de
patrones. Se fij� un error l�mite de 0.1, la red aprendi� en 260
iteraciones utilizando el algoritmo Back Propagation, con una
rata de aprendizaje de 1.0 y un momentum de 0.9.

En las ilustraciones 17 y 18 se muestran algunos resultados de la
simulaci�n de la red ya entrenada, utilizando UN_NeuroSimulador.







C.3 EL PROBLEMA DE CODIFICACION

Este problema consiste en encontrar una codificaci�n m�s compacta
para los patrones de entrada. En este caso se desea hacer una
correspondencia entre cadenas con una codificaci�n de N bits y
cadenas con una codificaci�n de Log2N bits. 

Para solucionar este problema se dise�a una red neuronal con N
neuronas de entrada, con Log2N neuronas ocultas y con N neuronas
de salida. La red debe aprender a producir una salida id�ntica a
la entrada, lo cual la obliga a encontrar una nueva codificaci�n
en la capa oculta para los patrones de entrada. En este ejemplo
se dise�� una red que resolviera el problema para N = 4, con
cuatro neuronas de entrada, dos ocultas y cuatro de salida, esta
se muestra en la ilustraci�n 19. ( el archivo en donde se
encuentra la definici�n de la red es CODIFI.NET, se puede editar
utilizando UN-NeuroEditor ). 


Se utilizaron cuatro patrones de tama�o ocho para entrenar la
red, estos patrones se encuentran en el archivo CODIFI.PAT y se
transcriben a continuaci�n.
     (  0.9  0.1  0.1  0.1  0.9  0.1  0.1  0.1  )
     (  0.1  0.9  0.1  0.1  0.1  0.9  0.1  0.1  )
     (  0.1  0.1  0.9  0.1  0.1  0.1  0.9  0.1  )
     (  0.1  0.1  0.1  0.9  0.1  0.1  0.1  0.9  )

Los primeros cuatro datos corresponden a las entradas y los
�ltimos cuatro corresponden a las salidas.

Utilizando UN-NeuroEntrenador se entren� la red con el algoritmo
BackPropagation, con una rata de aprendizaje de 1.5 y un momentum
de 0.9. El error l�mite se fij� en 0.1, la red aprendi� en 45
iteraciones.

Se realiz� la siulaci�n de la red entrenada mediante
UN_NeuroSimulador, los resultados de la simulaci�n se muestran en
las ilustraciones 20 a 23. 


Como se puede observar en los resultados de la
simulaci�n, la red neuronal despu�s de entrenada,
encontr� una codificaci�n interna para los patrones de entrada de
la siguiente manera:

    ENTRADAS               REPRESENTACION 
                              INTERNA   
    1  0  0  0                 0  0
    0  1  0  0                 1  0
    0  0  1  0                 0  1
    0  0  0  1                 1  1
