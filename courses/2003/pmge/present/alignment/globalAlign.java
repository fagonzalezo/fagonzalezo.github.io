
//Título:      Alineamiento Global de Pares de Cadenas
//Versión:     1.2
//Copyright:   Copyright (c) 1999
//Autor:       Arturo Tocarruncho
//Empresa:     Universidad Nacional de Colombia
//Descripción: Implementación del algoritmo de Needleman & Wunsch para alineamiento
//             Global de dos cadenas biológicas

import java.awt.*;
import java.awt.event.*;
import java.applet.*;
import javax.swing.*;


public class globalAlign extends JApplet {
  int[][] matriz;
  int[] ies;
  int[] jotas;
  int longCamino;
  int w=0;
  char[] aminoacidos ={'A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V'};
  int[][] BLOSUM50=    {{ 5,-2,-1,-2,-1,-1,-1, 0,-2,-1,-2,-1,-1,-3,-1, 1, 0,-3,-2, 0},
                        {-2, 7,-1,-2,-4, 1, 0,-3, 0,-4,-3, 3,-2,-3,-3,-1,-1,-3,-1,-3},
                        {-1,-1, 7, 2,-2, 0, 0, 0, 1,-3,-4, 0,-2,-4,-2, 1, 0,-4,-2,-3},
                        {-2,-2, 2, 8,-4, 0, 2,-1,-1,-4,-4,-1,-4,-5,-1, 0,-1,-5,-3,-4},
                        {-1,-4,-2,-4,13,-3,-3,-3,-3,-2,-2,-3,-2,-2,-4,-1,-1,-5,-3,-1},
                        {-1, 1, 0, 0,-3, 7, 2,-2, 1,-3,-2, 2, 0,-4,-1, 0,-1,-1,-1,-3},
                        {-1, 0, 0, 2,-3, 2, 6,-3, 0,-4,-3, 1,-2,-3,-1,-1,-1,-3,-2,-3},
                        { 0,-3, 0,-1,-3,-2,-3, 8,-2,-4,-4,-2,-3,-4,-2, 0,-2,-3,-3,-4},
                        {-2, 0, 1,-1,-3, 1, 0,-2,10,-4,-3, 0,-1,-1,-2,-1,-2,-3, 2,-4},
                        {-1,-4,-3,-4,-2,-3,-4,-4,-4, 5, 2,-3, 2, 0,-3,-3,-1,-3,-1, 4},
                        {-2,-3,-4,-4,-2,-2,-3,-4,-3, 2, 5,-3, 3, 1,-4,-3,-1,-2,-1, 1},
                        {-1, 3, 0,-1,-3, 2, 1,-2, 0,-3,-3, 6,-2,-4,-1, 0,-1,-3,-2,-3},
                        {-1,-2,-2,-4,-2, 0,-2,-3,-1, 2, 3,-2, 7, 0,-3,-2,-1,-1, 0, 1},
                        {-3,-3,-4,-5,-2,-4,-3,-4,-1, 0, 1,-4, 0, 8,-4,-3,-2, 1, 4,-1},
                        {-1,-3,-2,-1,-4,-1,-1,-2,-2,-3,-4,-1,-3,-4,10,-1,-1,-4,-3,-3},
                        { 1,-1, 1, 0,-1, 0,-1, 0,-1,-3,-3, 0,-2,-3,-1, 5, 2,-4,-2,-2},
                        { 0,-1, 0,-1,-1,-1,-1,-2,-2,-1,-1,-1,-1,-2,-1, 2, 5,-3,-2, 0},
                        {-3,-3,-4,-5,-5,-1,-3,-3,-3,-3,-2,-3,-1, 1,-4,-4,-3,15, 2,-3},
                        {-2,-1,-2,-3,-3,-1,-2,-3, 2,-1,-1,-2, 0, 4,-3,-2,-2, 2, 8,-1},
                        { 0,-3,-3,-4,-1,-3,-3,-4,-4, 4, 1,-3, 1,-1,-3,-2, 0,-3,-1, 5}};

  Label lAminoacido1[] = new Label[100];
  Label lAminoacido2[] = new Label[100];
  Label matGrafico[][] = new Label[100][100];
  String cadena1 = new String();
  String cadena2 = new String();
  boolean isStandalone = false;
  Panel panel1 = new Panel();
  TextField secuencia1 = new TextField();
  TextField secuencia2 = new TextField();
  Button Alinear = new Button();
  Label lSol1 = new Label();
  Label lSol2 = new Label();
  Label lSecuencia1 = new Label();
  Label lSecuencia2 = new Label();
  Label lSSecuencia1 = new Label();
  Label lSSecuencia2 = new Label();
  TextField penalizacion = new TextField();
  Label lPenalizacion = new Label();

  //Obtener el valor de un parámetro
  public String getParameter(String key, String def) {
    return isStandalone ? System.getProperty(key, def) :
      (getParameter(key) != null ? getParameter(key) : def);
  }

  //Construir el applet
  public globalAlign() {
  }

  //Inicializar el applet
  public void init() {
    try  {
      jbInit();
    }
    catch(Exception e)  {
      e.printStackTrace();
    }
  }

  //Inicialización del componente
  private void jbInit() throws Exception {
    this.getContentPane().setLayout(null);
    panel1.setLayout(null);
    Alinear.setBounds(new Rectangle(163, 78, 86, 21));
    Alinear.setLabel("Alinear");
    Alinear.addActionListener(new java.awt.event.ActionListener() {

      public void actionPerformed(ActionEvent e) {
        Alinear_actionPerformed(e);
      }
    });
    lSol1.setBounds(new Rectangle(79, 99, 461, 20));
    lSol1.setFont(new java.awt.Font("Monospaced", 1, 16));
    lSol2.setBounds(new Rectangle(78, 117, 464, 20));
    lSol2.setFont(new java.awt.Font("Monospaced", 1, 16));
    secuencia1.setBounds(new Rectangle(79, 37, 336, 20));
    secuencia1.setText("GGATCGA");
    secuencia2.setBounds(new Rectangle(79, 58, 336, 18));
    secuencia2.setText("GAATTCAGTTA");
    panel1.setBounds(new Rectangle(2, 1, 550, 503));
    lSecuencia1.setBounds(new Rectangle(6, 39, 70, 19));
    lSecuencia1.setText("Secuencia1");
    lSecuencia2.setText("Secuencia2");
    lSecuencia2.setBounds(new Rectangle(6, 57, 70, 19));
    lSSecuencia1.setBounds(new Rectangle(1, 99, 64, 19));
    lSSecuencia1.setText("Sol. Sec. 1");
    lSSecuencia2.setText("Sol. Sec.2");
    lSSecuencia2.setBounds(new Rectangle(-1, 119, 61, 19));
    penalizacion.setBounds(new Rectangle(466, 53, 42, 21));
    penalizacion.setText("0");
    lPenalizacion.setBounds(new Rectangle(431, 27, 112, 28));
    lPenalizacion.setText("Penalización Hueco");
    this.getContentPane().add(panel1, null);
    panel1.add(lSSecuencia1, null);
    panel1.add(lSSecuencia2, null);
    panel1.add(lSol1, null);
    panel1.add(lSol2, null);
    panel1.add(Alinear, null);
    panel1.add(secuencia2, null);
    panel1.add(secuencia1, null);
    panel1.add(lSecuencia1, null);
    panel1.add(lSecuencia2, null);
    panel1.add(penalizacion, null);
    panel1.add(lPenalizacion, null);
  }

  //Iniciar el applet
  public void start() {
  }

  //Detener el applet
  public void stop() {
  }

  //Destruir el applet
  public void destroy() {
  }

  //Obtener información del applet
  public String getAppletInfo() {
    return "Información del applet";
  }

  //Obtener información del parámetro
  public String[][] getParameterInfo() {
    return null;
  }

  //Método principal
  public static void main(String[] args) {
    globalAlign applet = new globalAlign();
    applet.isStandalone = true;
    JFrame frame = new JFrame();
    frame.setTitle("Alineamiento Global- Needleman & Wunsch");
    frame.getContentPane().add(applet, BorderLayout.CENTER);
    applet.init();
    applet.start();
    frame.setSize(450,400);
    Dimension d = Toolkit.getDefaultToolkit().getScreenSize();
    frame.setLocation((d.width - frame.getSize().width) / 2, (d.height - frame.getSize().height) / 2);
    frame.setVisible(true);
  }
  // static initializer for setting look & feel
  static {
    try {
      UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
      //UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName());
    }
    catch (Exception e) {}
  }




  //Funcion de Similitud
  public int similitud(int i, int j){
    int s=0;
    while (aminoacidos[s]!=cadena1.charAt(i-1))
      s=s+1;

    int p=0;
    while (aminoacidos[p]!=cadena2.charAt(j-1))
      p=p+1;
    return BLOSUM50[s][p];
/*    if (cadena1.charAt(i-1)==cadena2.charAt(j-1))
      return 1;
    else
      return 0;*/
  }

  //Encuentra el maximo
  public int max(int i, int j){
  int mayor;
  int a;
  a = matriz[i-1][j-1] + similitud(i,j);
  int b = matriz[i-1][j] - w;
  int c = matriz[i][j-1] - w;
  if (a>b)
    if (a>c)
       mayor = a;
    else
       mayor = c;
  else
    if (b>c)
      mayor = b;
    else
       mayor = c;
  return mayor;
  }

  //Backtracking
  public void bactracking(int n,int m, int i){
  int a, b, c;
  if ((n!=0) || (m!=0)){
  a = matriz[n-1][m-1];
  b = matriz[n-1][m];
  c = matriz[n][m-1];
//  System.out.println("n=" + n + " m=" + m);
  if (a>=b)
    if (a>=c){
      ies[i]=n;
      jotas[i]=m;
      matGrafico[n][m].setBackground(Color.red);
      i++;
      bactracking(n-1,m-1,i);
    }
    else{
      ies[i]=n;
      jotas[i]=m;
      matGrafico[n][m].setBackground(Color.red);
      i++;
      bactracking(n,m-1,i);

    }
  else
    if (b>=c){
      ies[i]=n;
      jotas[i]=m;
      matGrafico[n][m].setBackground(Color.red);
      i++;
      bactracking(n-1,m,i);
    }
    else{
      ies[i]=n;
      jotas[i]=m;
      matGrafico[n][m].setBackground(Color.red);
      i++;
      bactracking(n,m-1,i);
    }
  }
  else
    longCamino = i;
  }


  //Metodo para reconstruir las cadenas solución
  void generarCadenas(){
  int gasto1=0, gasto2=0;
  String cadenasol1= new String("");
  String cadenasol2= new String("");


  for (int j=longCamino-1;j>=0;j--){
   if (ies[j] == ies[j+1] && jotas[j] > jotas[j+1] ){
     cadenasol1 = cadenasol1 + "-";
     cadenasol2 = cadenasol2 + cadena2.charAt(gasto2++);
   }
   else if (jotas[j] == jotas[j+1] && ies[j] > ies[j+1]){
     cadenasol2 = cadenasol2 + "-";
     cadenasol1 = cadenasol1 + cadena1.charAt(gasto1++);
   }
   else if (jotas[j] > jotas[j+1] && ies[j] > ies[j+1]){
     cadenasol1 = cadenasol1 + cadena1.charAt(gasto1++);
     cadenasol2 = cadenasol2 + cadena2.charAt(gasto2++);
   }
   }
//  System.out.println("Cadena 1 es...:" + cadenasol1);
//  System.out.println("Cadena 2 es...:" + cadenasol2);
  lSol1.setText(cadenasol1);
  lSol2.setText(cadenasol2);
  }


  void Alinear_actionPerformed(ActionEvent e) {
    int n, m;
    cadena1 = secuencia1.getText();
    cadena2 = secuencia2.getText();
    w = Integer.parseInt(penalizacion.getText());
    n = cadena1.length();
    m = cadena2.length();
    matriz = new int[100][100];
    ies = new int[100];
    jotas = new int[100];
    for (int i=0;i< n;i++){
        lAminoacido1[i] = new Label();
        lAminoacido1[i].setBackground(Color.white);
        lAminoacido1[i].setBounds(new Rectangle(7, 153 + 23 + (i * 23), 23, 23));
        lAminoacido1[i].setAlignment(1);
        lAminoacido1[i].setText(""+cadena1.charAt(i));
        panel1.add(lAminoacido1[i]  , null);
     }

    for (int i=0;i< m;i++){
        lAminoacido2[i] = new Label();
        lAminoacido2[i].setBackground(Color.white);
        lAminoacido2[i].setBounds(new Rectangle(30+ 23 +(i * 23), 130, 23, 23));
        lAminoacido2[i].setAlignment(1);
        lAminoacido2[i].setText(""+cadena2.charAt(i));
        panel1.add(lAminoacido2[i]  , null);
     }

    //Inicializamos la matriz en ceros
    for(int i = 0;i <= n; i++)
      for(int j = 0;j <= m; j++){
        matriz[i][j]= 0;
        matGrafico[i][j]  = new Label();
        matGrafico[i][j].setBackground(Color.white);
        matGrafico[i][j].setBounds(new Rectangle(30 + (j * 23), 153 + (i * 23), 23, 23));
        matGrafico[i][j].setAlignment(1);
        matGrafico[i][j].setText("0");
        panel1.add(matGrafico[i][j], null);
        }

    //Calculamos el valor de la celda ij
    for (int i=1;i<=n;i++)
      for (int j=1;j<=m;j++){
        matriz[i][j] = max(i,j);
        matGrafico[i][j].setText("" + matriz[i][j]);
      }

    //Ahora hacemos Bactracking
    int s=0;
    bactracking(n,m,s);

    //Reconstruir las cadenas solucion
    generarCadenas();

  }
}

