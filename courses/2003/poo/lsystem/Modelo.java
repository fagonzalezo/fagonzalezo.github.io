package lsystem;

/**
 * Esta clase se encarga de aplicar las reglas que producen una 
 * secuencia de instrucciones para la tortuga. 
 *  @author Fabio Gonzalez
 *  @date Nov 18, 2003 
 */
public class Modelo {
	private String regla;
	
	private String reescribir(String str,int veces){
		String result="";
		for(int n=0;n<veces;n++){
			for(int i=0;i<str.length();i++){
				char c = str.charAt(i);
				if(c=='F'){
					result+=regla;
				}else{
					result+=c;
				}
			}
			str=result;
			result="";
		}
		return str;
	}
	
	
	/**
	 * Calcula la secuencia de instrucciones para un sistema L
	 * determinado.
	 * @param axiom Axioma (debe contener solo F,+ y -)
	 * @param rule	regla (debe contener solo F,+ y -)
	 * @param depth numero de veces que se aplica la reglas de'
	 * reescritura
	 * @return la secuencia de instrucciones.
	 */
	public String calcular(String  axiom, String rule, int depth){
		this.regla = rule;
		return reescribir(axiom,depth);	
	}
}
