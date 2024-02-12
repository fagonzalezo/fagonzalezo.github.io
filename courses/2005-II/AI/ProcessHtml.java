
import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import javax.swing.text.MutableAttributeSet;
import javax.swing.text.html.HTML;
import javax.swing.text.html.HTMLEditorKit;
import javax.swing.text.html.HTML.Tag;
import javax.swing.text.html.parser.ParserDelegator;
import java.util.ArrayList;

public class ProcessHtml {
	private ArrayList links;

	private StringBuffer bufferHtmlParsing;

	private String initAddress;

	public String address;

	public StringBuffer text = new StringBuffer();

	private final class Callback extends HTMLEditorKit.ParserCallback {
		boolean tag = false;

		public void handleText(char[] data, int pos) {
			if (tag) {
				bufferHtmlParsing.append(data);
			}else{
				text.append(data); 
			}
		}

		public void handleEndTag(Tag t, int pos) {
			if (t == HTML.Tag.A) {
				tag = false;
				links.add(address+" \""+bufferHtmlParsing+"\"");
			}
		}

		public void handleStartTag(Tag t, MutableAttributeSet a, int pos) {
			if (t == HTML.Tag.A) {
				tag = true;
				bufferHtmlParsing = new StringBuffer();
				String obtained = (String) a.getAttribute(HTML.Attribute.HREF);
				if (!obtained.startsWith("http")) {
					if (!initAddress.endsWith("/")) {
						address=initAddress + "/" + obtained;
					} else {
						address=initAddress + obtained;
					}
				} else
					address=obtained;
			}
		}
	}

	/**
	 * Constructor. Se debe invocar con un objeto de clase URL con el url que se quiere explorar
	 * @param url ej: http://www.unal.edu.co
	 */
	public ProcessHtml(URL url) {
		super();
		links = new ArrayList();
		initAddress = new String(url.toString());
	}
/**
 * Devuelve lista de objetos URL encontrados.
 * @return arrayList con todas los links encontrados
 * @throws IOException 
 */
	public ArrayList getURLs() throws IOException,MalformedURLException   {
		HTMLEditorKit.ParserCallback callback = new Callback();
		Reader reader;
		URL url = new URL(initAddress);
		reader = new InputStreamReader(url.openStream());
		ParserDelegator pd = new ParserDelegator();
		pd.parse(reader, callback, true);
		return links;
	}
	/**
	 * Retorna el texto de la p'agina. Debe ser llamado despu'es de <code> getURLs() </code>
	 * @return texto plano de la p'agina
	 */
	public String getText(){
		return text.toString();
	}
/**
 * Ejemplo de como se pueden obtener las urls
 * @param args
 */
	public static void main(String[] args) {
		try {
			ProcessHtml X = new ProcessHtml(new URL(args[0])); //constructor
			ArrayList recibido=new ArrayList(X.getURLs());//obtener urls
			//imprimo urls...(para probar!)
			for(int i=0;i<recibido.size();i++){
				System.out.println(recibido.get(i));
			}
			System.out.println("\n\n******************Texto****************** ");
			System.out.println(X.getText());
		} catch (MalformedURLException e) {
			System.err.println("URL no est'a bien formada");
			e.printStackTrace();
		} catch (IOException e) {
			System.err.println("Error tratando de leer URL");
			e.printStackTrace();
		}
	}

}