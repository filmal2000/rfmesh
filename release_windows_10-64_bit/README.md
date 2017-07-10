# RF-MESH Simulator #

## Table of Contents ##

1. [Installation](#c1)
2. [Structure](#c2)
3. [Usage](#c3)
  
  3.1 [Accessing the web application](#c3.1)
  3.2 [Creating a new topology or modifying an old one](#c3.2)
  3.3 [Creating new parameters or modifying old ones](#c3.3)
  3.4 [Running a simulation](#c3.4)

4. [Parameter Definition](#c4)

<a id="c1"></a>
## Installation ##

* Download RF\_MESH\_SIMULATOR.zip.
* Extract the downloaded zip file in a directory.
* If Java isn't installed on your computer please install it [here](https://www.java.com/en/download/)

<a id="c2"></a>
## Structure ##

***simulator.exe*** 
: Main application that serves at [localhost:8000](localhost:8000) and [127.0.0.1:8000](127.0.0.1:8000). It must be started to access the web application (see [***Accessing the web application***](#c3.1)).

***input/***
: Contains the information of **smart meters**, **routers** and **collectors**.

***javaSim/***
: Java application that is called by the application to simulate traffic.

***sim_parameters/*** 
: Contains a list of default parameters. Parameters that you define will be saved here.

***simulations/*** 
: Contains the simulation results, classified by topology and by parameters.

***static/***
: Contains the images, the styling and the scripts of the web pages of the application.

***templates/***
: Contains the *html* files of the web pages.

***topologies/*** 
: Contains a list of default topologies, stored in directories named after them. Inside each directory is a file named nodes.json. Topologies that you create will be saved here.


### Detailed structure ###

```
.
├── simulator.exe               
├── simulator.jar
├── input
|   ├── collector.txt
|   ├──	montrealLatLong.txt
|   ├──	polygon.txt
|   ├──	router.txt
|   └──	smartmeter.txt
├── javaSim
|   └── target
|       └──	simulator.jar
├── static
|   ├── images
|	  |   ├── dark_dot.png
|	  |	  └── dot.png
|   ├──	scripts
|	  |   ├── lib
|	  |   ├── param.js
|	  |   ├── simulation.js
|	  |   ├── simulationOld.js
|	  |	  └── topology.js
|   └──	styles.css
├── templates
|   ├── params.html
|   ├──	simulation.html
|   └──	topology.html
├── topologies
|   ├── topology1
|   |   └── nodes.json
|   ├── topology2
|   |	└── nodes.json
|   ...
├── sim_parameters
|   ├── defaultParams.json
|   ├── customParams1.json
|   ...
└── simulations
    ├── topology1
    |   ├── defaultParams
    |   |   └── 1234
    |   |       ├── nodeSummaries.json
    |   |       ├── summary.json
    |   |       └── out.log
    |   └── customParams1.json
    |       └── 1234
    |           ├── nodeSummaries.json
    |           ├── summary.json
    |           └── out.log
    ├── topology2
    |	└── defaultParams
    |       └── 1234
    |           ├── nodeSummaries.json
    |           ├── summary.json
    |           └── out.log
    ...

```

<a id="c3"></a>
## Usage ##

<a id="c3.1"></a>
### Accessing the web application ###
1. Double click on ***simulator.exe*** in the directory where you extracted the archive.
2. Go to *[localhost:8000](localhost:8000)* or *[127.0.0.1:8000](127.0.0.1:8000)* in your web browser.

<a id="c3.2"></a>
### Creating a new topology or modifying an old one ###
1. Navigate to the "Topology" tab and click on "New Topology" or select an already existing topology from the list.
2. Enter the topology name in the "name" field.
3. Click on the tab "Area Definition" and select a zone on the map. This is the zone that will be used in your simulation. You can always modify it if you want to.
4. To add smart meters, click on the tab "Meters", then on "Load Meters in defined area". To delete them, click on "Remove all meters".
5. To add a router or a collector, click on the corresponding tab, then clic on the map where you want to place a router/collector. To delete them, click on "Remove all routers" or "remove all collectors".
6. When you are done, click on "Save Topology"

<a id="c3.3"></a>
### Creating new parameters or modifying old ones ###

1. Navigate to the "Simulation Parameters" tab and click on "New Params" or select an already existing topology from the list.
2. Enter the values you want in the different fields. (See below for a definition of each parameter)
3. When you are done, click on "Save".

<a id="c3.4"></a>
### Running a simulation ###

1. Navigate to the "Simulation" tab, then select a topology and a parameters set among those listed.
2. If a simulation hasn't already been run with this topology and these parameters, click on "Run Simulation".
3. A heatmap will show the simulation results, using the parameter selected from the dropdown menu on the bottom of the screen.

<a id="c4"></a>
## Parameters Definition ##

**Simulation Time Slot Count**
: The duration of the simulation, in time slots.

**Time Slot Duration (s)** 
: The duration of a single time slot, in seconds.

**Up-link Mean Generation Time (h)**
: The mean time required for each smartmeter to genereate a packet, if "Reading" is enabled, in hours.

**Down-link Mean Generation Time (h)**
: The mean time required for each collector to generate a packet, if "Demand" is enabled, in hours.

**Transmission probability (0.0 to 1.0)**
: The probability of a transmission beeing sent from a node. The higher this value is, the more frequently transmissions will occur.

**Number of Channels**
: The number of different channels each node can use for their transmissions. More channels means a smaller chance of collisions.

**Max Simultaneous Packets in Transmission**
: The maximum number of packets that can be sent in a single transmission.

**Packets TTL (s)**
: A packet's time to live, in seconds. After this time, the packet will be destroyed.

**Collector Range (m)**
: The range in which a collector can send transmissions, in meters.

**Router Range (m)**
: The range in which a router can send transmissions, in meters.

**Smart Meter Range (m)**
: The range in which a smart meter can send transmissions, in meters.

**Demand**
: If enabled, allows down-link packets to be generated.

**Reading**
: If enabled, allows up-link packets to be generated.

**Broadcast timeslots (comma separated numbers)**
: A list of all time slots during which a broadcast is emmited from the collectors to the smart meters.

**Timeout After Reading Requests (s)**
: Time after which, if a collector doesn't receive a confirmation of the reception of a packet it sent, it will resend the same packet. *(not implemented yet)*
