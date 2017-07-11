# Simulator

Driven by the need of robust, cost-effective, and ready-to-use solutions to connect wirelessly thousands to million of nodes, an increasing number of applications such as Smart Grids and IoT networks use large-scale Wireless Mesh Networks as transmission support. Tools and methodologies to study the performance of such systems are constantly sought and, in particular, they become fundamental in the feasibility assessment of the high number of possible applications. 

This simulation tool is proposed to study **the performance of a particular kind of wireless mesh networks, based on the RF-mesh technology**. The tool was used in the context of a large-scale Smart Grid AMI (Advanced Metering Infrastructure) system. The modular nature of the implemented tool allows a smooth extension to the performance analysis of other types of Wireless Mesh Networks using technologies similar to RF-mesh. The tool, coded in Java, considers different types of traffic and provides the packet collision probability, the end-to-end delay, and several other performance indexes of large scale (i.e., up to 6 thousand nodes) instances in a reasonable time. 

## Installation
1. Download and install [Maven](https://maven.apache.org/).
2. In the project root, run `mvn package`.

## Usage

To run a simulation you will need :

1. A file specifying Node positions (e.g. input/nodes_small.json)
2. A file specifying simulation parameters (e.g. input/sampleParams.json)

Currently the command to run a simulation is

`java -jar target/simulator-1.0.jar -o [OUTPUT_FOLDER] -p [PARAMS_FILE] -t [NODE_FILE] -s [SEED]`

where :
> \[OUTPUT_FOLDER\] 
>: is the desired location of the output, simulation summaries and logs will be created there

>\[PARAMS_FILE\]
>: is the path to the simulation parameters file

>\[NODE_FILE\]
>: is the path to the node positions file

>\[SEED\]
>: is an optional number specifying the seed for the random engine used in the simulation.

## Structure
```
.
├── src
|   ├── test : Unit Tests run automatically by Maven on install.
|   └── main
|       ├── resources
|       |   └── log4j2.properties: Defines logging properties used.
|       └── java
|           ├── RFMesh : Used for comparison and feature discovery.
|           └── Simulator : Actual simulator, these sources are compiled and form the entirety of the simulator.
|               ├── Base : Base components to be reused in concrete simulations.
|               ├── RFMesh : Concrete RFMesh simulation.
|               └── ... Other possible simulations.
└── Target : Maven output folder, contains jar and compiled code.
```
