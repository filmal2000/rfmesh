// This example creates an interactive map which constructs a polygon based on
// user clicks. The polygon points are then saved in a file to be used afterwards
// the variable of the polygon we are going to draw

var map;
var area = null;
var meters = [];
var routers = [];
var collectors = [];


var nameField = $("#topologyName");
var topologyContainer = $('#tplglist');
var topologyTemplate = $('#tplgtmplate');

// called by google maps script
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 11,
		center: {
			lat: 45.501709456413984,
			lng: -73.71938522905111
		}
	});

	// Add a listener for the click event
	map.addListener('click', addLatLng);

	createNewArea();
	loadTopology();
}

// Handles click events on a map, dispatches depending on current mode;
function addLatLng(event) {
	var currentAction = $(".tabbable li.active").index(".tabbable li");
	var position = event.latLng;

	if (currentAction === 0)
		addAreaPosition(position);
	else if (currentAction === 1)
		addMeter(position);
	else if (currentAction === 2)
		addRouter(position);
	else if (currentAction === 3)
		addCollector(position);
}

// //// AREA

function createNewArea() {
	if (area !== null) {
		area.setMap(null);
		area = null;
	}

	area = new google.maps.Polygon({
		strokeColor: '#00008B',
		strokeOpacity: 1.0,
		strokeWeight: 3,
		fillColor: "#DCDCDC",
		fillOpacity: 0.5,
		clickable: false,
		editable: true
	});
	area.setMap(map);
}

function addAreaPosition(position) {
	area.getPath().push(position);
}

function polygonToJson() {
	var json = {};
	var vertices = area.getPath().getArray();
	json = vertices.map(function (vertice) {
		return {
			lat: vertice.lat(),
			lng: vertice.lng()
		}
	});
	return json;
}

// //// METERS

function addMeter(position) {
	var marker = new google.maps.Marker({
		position: position,
		map: map,
		icon: "/static/images/dark_dot.png",
		draggable: true,
	});
	meters.push(marker);
}

function addMeters(metersList) {
	map.data.setStyle({
        icon: {
            url: "/static/images/dot.png"
        },
        fillColor: 'red',
        strokeColor: 'blue',
        zIndex: 0
    });
    map.data.add({ geometry: new google.maps.Data.MultiPoint(metersList) });
	meters = metersList;
}

function clearMeters() {
	meters.forEach(function (marker) {
		marker.setMap(null);
	});
	meters = [];
}

function getMeters() {
	jsonPath = polygonToJson();
	if (jsonPath.length < 3) {
		alert("La zone a trop peu de points");
		return;
	}

	$.ajax({
		url: "/get-meters",
		type: 'POST',
		data: JSON.stringify(jsonPath),
		success: function (meters) {
			clearMeters();
			addMeters(meters);//meters.forEach(addMeter);
		},
		contentType: "application/json",
		dataType: "json",
		error: function () {
			alert("Error loading meters");
		}
	});

}

// /// Routers

function addRouter(position) {
	var marker = new google.maps.Marker({
		position: position,
		map: map,
		icon: {
			path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
			scale: 3,
			strokeColor: "#0000FF",
			fillColor: "#0000FF"
		},
		draggable: true,
	});
	routers.push(marker);
}

function clearRouters() {
	routers.forEach(function (marker) {
		marker.setMap(null);
	});
	routers = [];
}

// /// Collectors

function addCollector(position) {
	var marker = new google.maps.Marker({
		position: position,
		map: map,
		icon: {
			path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
			scale: 3,
			strokeColor: "#00AA22",
			fillColor: "#00AA22"
		},
		draggable: true,
	});
	collectors.push(marker);
}

function clearCollectors() {
	collectors.forEach(function (marker) {
		marker.setMap(null);
	});
	collectors = [];
}

// /// Save and load
function getSaveConfirmation() {
	return confirm("Some information might be missing (meters, routers or collectors), are you sure you want to save?");
}

function markersToJson(markerArray) {
	return markerArray.map(function (marker) {
		var position = marker.getPosition();
		return {
			lat: position.lat(),
			lng: position.lng()
		};
	})
}

function getJsonData() {
	var data = {};
	data.name = nameField.val().trim();
	data.area = polygonToJson();
	data.meters = meters;
	data.routers = markersToJson(routers);
	data.collectors = markersToJson(collectors);
	return data;
}

function saveTopology(event) {
	if ((meters.length !== 0 && routers.length !== 0 && collectors.length !== 0)
		|| getSaveConfirmation()) {

		var data = getJsonData();

		$.ajax({
			url: "/save-topology",
			type: 'POST',
			data: JSON.stringify(data),
			success: function () {
				alert("Topology saved with success");
			},
			contentType: "application/json",
			error: function () {
				alert("Error saving topology");
			}
		});
	}
}

function loadTopology() {
	if (currentTopology !== undefined) {
		currentTopology.area.forEach(function (areaPos) {
			addAreaPosition({
				lat: function () {
					return areaPos.lat;
				},
				lng: function () {
					return areaPos.lng;
				}
			});
		});
		addMeters(currentTopology.meters);
		currentTopology.routers.forEach(addRouter);
		currentTopology.collectors.forEach(addCollector);
	}
}
