import java.net.*; 
import java.io.*; 

public class JabberClient { 
 public static void main(String[] args) throws IOException { 
	// Passing null to getByName() produces the 
	// special "Local Loopback" IP address, for 
	// testing on one machine w/o a network: 
	InetAddress addr = InetAddress.getByName(null); 
	// Alternatively, you can use 
	// the address or name: 
	// InetAddress addr = InetAddress.getByName("127.0.0.1"); 
	// InetAddress addr = InetAddress.getByName("localhost"); 
	System.out.println("addr = " + addr); 
	Socket socket = 
	new Socket(addr, MultiJabberServer.PORT); 
	// Guard everything in a try-finally to make 
	// sure that the socket is closed: 
	try { 
		System.out.println("socket = " + socket); 
		BufferedReader teclado = new BufferedReader(
			new InputStreamReader(System.in)); 
		// Output is automatically flushed 
		// by PrintWriter: 
		PrintWriter out = 
		new PrintWriter( new BufferedWriter( 
			new OutputStreamWriter( socket.getOutputStream())),true); 
		String str;
		do{
			str = teclado.readLine(); 
			out.println(str); 
		}while (!str.equals("END")); 
	} finally { 
		System.out.println("closing..."); 
		socket.close(); 
	} 
 } 
} 
