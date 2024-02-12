package lsystem;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

/**
 * Interfaz grafica para un sistema L simple.
 *  @author Fabio Gonzalez
 *  @date Nov 18, 2003 
 */
public class Vista extends JApplet {
	private Tortuga tortuga = new Tortuga();
	private Modelo modelo = new Modelo();
	private JButton boton;
	private JTextField axioma;
	private JTextField regla;
	private JTextField profundidad;

	
	public Vista(){
//		setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
		setSize(600,400);
		Container cp = getContentPane();
		cp.setLayout(new BorderLayout());
		JPanel northPanel = new JPanel();
		northPanel.setLayout(new FlowLayout());
		northPanel.add(new JLabel("Axioma:"));
		axioma=new JTextField();
		axioma.setColumns(10);
		northPanel.add(axioma);
		northPanel.add(new JLabel("Regla: F->"));
		regla=new JTextField();
		regla.setColumns(10);
		northPanel.add(regla);
		northPanel.add(new JLabel("Prof.:"));
		profundidad=new JTextField();
		profundidad.setColumns(3);
		northPanel.add(profundidad);
		boton = new JButton("Dibujar");
		northPanel.add(boton);		
		cp.add(northPanel,BorderLayout.NORTH);
		cp.add(tortuga,BorderLayout.CENTER);
		boton.addActionListener(new ActionListener(){
			public void actionPerformed(ActionEvent event){
				String instr = modelo.calcular(axioma.getText(),
					regla.getText(),Integer.parseInt(profundidad.getText()));
				tortuga.setInstr(instr);
			}
		});
		setVisible(true);
	}
	
	
	public static void main(String[] args) {
		new Vista();
	}
}
