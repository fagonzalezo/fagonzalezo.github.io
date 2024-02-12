/*
 * Created on Nov 18, 2003
 *
 * To change the template for this generated file go to
 * Window&gt;Preferences&gt;Java&gt;Code Generation&gt;Code and Comments
 */
package lsystem;

import java.awt.*;

import javax.swing.*;

/**
 * 
 *  @author Fabio Gonzalez
 *  @date Nov 18, 2003 
 */
/**
 * Modela una tortuga tipo logo que interpreta una secuencia simple
 * de comandos (F,-,+).
 *  @author Fabio Gonzalez
 *  @date Nov 18, 2003 
 */
public class Tortuga extends JPanel {
	private String instr="";
	private int longPaso;
	private int xIni;
	private int yIni;
	private int[] sentX={1,0,-1,0};
	private int[] sentY={0,-1,0,1};
	
	public Tortuga(){
		setSize(new Dimension(400,400));
	}
	
	/**
	 * Dibuja una secuencia de instrucciones
	 * @param instr secuencia de instrucciones a interpretar
	 */
	public void setInstr(String instr){
		this.instr=instr;
		int minX=0,minY=0,maxX=0,maxY=0,x=0,y=0;
		int sentido=0;
		
		for(int i=0;i<instr.length();i++){
			char c = instr.charAt(i);
			switch (c){
				case 'F':
					x+=sentX[sentido];
					y+=sentY[sentido];
					maxX= Math.max(maxX,x);
					maxY= Math.max(maxY,y);
					minX= Math.min(minX,x);
					minY= Math.min(minY,y);
					break;
				case '+':
					sentido = sentido<3?sentido+1:0;
					break;
				case '-':
					sentido = sentido>0?sentido-1:3;
					break;
			}
		}
		double lpX = getSize().getWidth()/(maxX-minX);
		double lpY = getSize().getHeight()/(maxY-minY);
		longPaso = (int) Math.min(lpX,lpY);
		xIni = -longPaso*minX;
		yIni = -longPaso*minY;
		repaint();
	}
	
	public void paint(Graphics g){
		g.setColor(Color.white);
		g.fillRect(0,0,getSize().width,getSize().height);
		g.setColor(Color.black);
		int x = xIni,y = yIni,newX,newY;
		int sentido=0;
		for(int i=0;i<instr.length();i++){
			char c = instr.charAt(i);
			switch (c){
				case 'F':
					newX=x+sentX[sentido]*longPaso;
					newY=y+sentY[sentido]*longPaso;
					g.drawLine(x,y,newX,newY);
					x=newX;
					y=newY;
					break;
				case '+':
					sentido = sentido<3?sentido+1:0;
					break;
				case '-':
					sentido = sentido>0?sentido-1:3;
					break;
			}
		}
	}
	

}
