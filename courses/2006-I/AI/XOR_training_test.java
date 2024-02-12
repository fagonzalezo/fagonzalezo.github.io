
import org.joone.engine.*;
import org.joone.engine.learning.*;
import org.joone.io.*;
import org.joone.net.NeuralNet;

/**
 * Programa de demostraci—n basado en XORMemory.java e
 * ImmediateEmbeddedXOR.java
 * ambos programas se pueden encontrar en el joone-engine
 * en el directorio samples/engine/xor
 * 
 */
public class XOR_training_test implements NeuralNetListener {
	
	// XOR input
	private double[][]  inputArray = new double[][] {
			{0.0, 0.0, 0.0},
			{0.0, 1.0, 1.0},
			{1.0, 0.0, 1.0},
			{1.0, 1.0, 0.0}
	};
	private double[][]  testArray = new double[][] {
			{0.0, 0.0},
			{0.0, 1.0},
			{1.0, 0.0},
			{1.0, 1.0}
	};
	
	private long mills;
	private NeuralNet net;
	private LinearLayer	input;
	private SigmoidLayer	hidden;
	private SigmoidLayer	output;
	private Monitor monitor = new Monitor();
	
	
	/**
	 * @param args the command line arguments
	 */
	public static void main(String args[]) {
		XOR_training_test   xor = new XOR_training_test();
		
		xor.Initialize();
		xor.Train();
		xor.Test();
	}
	
	/**
	 * Method declaration
	 */
	public void Initialize() {
		// El objeto net encapsula toda la red
		net = new NeuralNet();
		// First, creates the three Layers
		input = new LinearLayer();
		hidden = new SigmoidLayer();
		output = new SigmoidLayer();
		
		input.setLayerName("input");
		hidden.setLayerName("hidden");
		output.setLayerName("output");
		
		// sets their dimensions
		input.setRows(2);
		hidden.setRows(3);
		output.setRows(1);
		
		//adiciona las capas a la red
		net.addLayer(input);
		net.addLayer(hidden);
		net.addLayer(output);
		
		// Now create the two Synapses
		FullSynapse synapse_IH = new FullSynapse();	/* input -> hidden conn. */
		FullSynapse synapse_HO = new FullSynapse();	/* hidden -> output conn. */
		
		synapse_IH.setName("IH");
		synapse_HO.setName("HO");
		
		// Connect the input layer whit the hidden layer
		input.addOutputSynapse(synapse_IH);
		hidden.addInputSynapse(synapse_IH);
		
		// Connect the hidden layer whit the output layer
		hidden.addOutputSynapse(synapse_HO);
		output.addInputSynapse(synapse_HO);
	}
	
	public void Train(){
		// Create the Monitor object and set the learning parameters
		monitor = new Monitor();
		
		monitor.setLearningRate(0.1);
		monitor.setMomentum(0.9);
		
		// Passe the Monitor to all components
		net.setMonitor(monitor);
		// The application registers itself as monitor's listener so it can receive
		// the notifications of termination from the net.
		monitor.addNeuralNetListener(this);
		
		MemoryInputSynapse  inputStream = new MemoryInputSynapse();
		
		// The first two columns contain the input values
		inputStream.setInputArray(inputArray);
		inputStream.setAdvancedColumnSelector("1,2");
		
		// set the input data
//		input.addInputSynapse(inputStream);
		net.addInputSynapse(inputStream);
		TeachingSynapse trainer = new TeachingSynapse();
		
		trainer.setMonitor(monitor);
		
		// Setting of the file containing the desired responses provided by a FileInputSynapse
		MemoryInputSynapse samples = new MemoryInputSynapse();
		
		
		// The output values are on the third column of the file
		samples.setInputArray(inputArray);
		samples.setAdvancedColumnSelector("3");
		trainer.setDesired(samples);
		
		// Connects the Teacher to the last layer of the net
		net.addOutputSynapse(trainer);
		/*
		 * All the layers must be activated invoking their method start;
		 * the layers are implemented as Runnable objects, then they are
		 * instanziated on separated threads.
		 */
		net.start();
		monitor.setTrainingPatterns(4);	// # of rows (patterns) contained in the input file
		monitor.setTotCicles(10000);		// How many times the net must be trained on the input patterns
		monitor.setLearning(true);		// The net must be trained
		mills = System.currentTimeMillis();
		monitor.Go();					// The net starts the training job
	}
	
	public  void Test(){
		// Joone utiliza hilos para ejecutar el entrenamiento,
		// por lo tanto debemos esperar a que el entrenamiento termine
		// antes de probar la red. El metodo join() espera a que los hilos de la 
		// red terminen.
		net.join();
		System.out.println("***************** Test *****************");
		/* We get the first layer of the net (the input layer),
        then remove all the input synapses attached to it
        and attach a DirectSynapse */
		input.removeAllInputs();
		DirectSynapse memInp = new DirectSynapse();
		input.addInputSynapse(memInp);
		/*
		 * We get the last layer of the net (the output layer), then remove all
		 * the output synapses attached to it and attach a DirectSynapse
		 */
		output.removeAllOutputs();
		DirectSynapse memOut = new DirectSynapse();
		output.addOutputSynapse(memOut);
		// Now we interrogate the net
		monitor.setLearning(false);
		net.start();
		for (int i=0; i < 4; ++i) {
			// Prepare the next input pattern
			System.out.println("Input: "+testArray[i][0]+"  "+testArray[i][1]);
			Pattern iPattern = new Pattern(testArray[i]);
			iPattern.setCount(i+1);
			// Interrogate the net
			memInp.fwdPut(iPattern);
			// Read the output pattern and print out it
			// double[] pattern = memOut.getNextPattern();
			Pattern pattern = memOut.fwdGet();
			System.out.println("Output: "+pattern.getArray()[0]);
		}
		//Tell the network to stop
		Pattern stop = new Pattern(new double[2]);
		stop.setCount(-1);
		memInp.fwdPut(stop);
		memOut.fwdGet();
	}
	


/**
 * Method declaration
 */
public  void netStopped(NeuralNetEvent e) {
	long delay = System.currentTimeMillis() - mills;
	System.out.println("Training finished after "+delay+" ms");
}

/**
 * Method declaration
 */
public void cicleTerminated(NeuralNetEvent e) {
}

/**
 * Method declaration
 */
public void netStarted(NeuralNetEvent e) {
	System.out.println("Training...");
}

public void errorChanged(NeuralNetEvent e) {
	Monitor mon = (Monitor) e.getSource();
	long	c = mon.getCurrentCicle();
	long	cl = c / 1000;
	
	// We want to print the results every 1000 cycles
	if ((cl * 1000) == c) {
		System.out.println(c + " cycles remaining - Error = " + mon.getGlobalError());
	}
}

public void netStoppedError(NeuralNetEvent e,String error) {
}

}


