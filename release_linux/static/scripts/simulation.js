var map;
var nodeList;
var meters = [];
var routers = [];
var collectors = [];

var heatmapData = [];
var heatmap = undefined;

var gradientRY = ['rgba(255, 255, 0, 1)', 'rgba(255, 0, 0, 1)'];
var gradientBW = ['rgba(0, 0, 0, 1)', 'rgba(255, 255, 255, 1)'];
var gradientGB = ['rgba(0, 255, 0, 1)', 'rgba(0, 0, 255, 1)'];
var currentGradient = gradientRY;
var currentGradientIndex = 0;

let kmlParser = undefined;

var currentParam;
var currentSimulation;
var currentTopology;

var maxTransmissionCount;
var maxCollisionCount;
var maxCollisionProbability;
var maxCreatedPacketCount;
var maxMeanPacketTransitTime;

const SIM_PATH = "/static/simulations/";

var websocket;

//
function runSimulation(topologyName, paramName, lightMode) {
    var ansi_up = new AnsiUp;

    websocket = new WebSocket('ws://' + window.location.host + '/simulation/run/' + topologyName + '/' + paramName + '/' + lightMode);
    websocket.onmessage = function (event) {
        var output = event.data;
        if (output.length > 6 && output[6] == '%') {
            var progressValue = output.substr(0, 7).trim().replace(',', '.');
            $('#sim-progress').css("width", progressValue).text(progressValue)
        } else {
            $('#sim-output').append(ansi_up.ansi_to_html(output));
        }
    };
    websocket.onclose = function () {
        $('#sim-progress').removeClass("progress-bar-striped active");
        location.reload(); 
    };
}

// called by google maps script
function initMap() {
    let darkStyledMapStyle = new google.maps.StyledMapType ( 
            [
                {
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#212121"
                    }
                    ]
                },
                {
                    "elementType": "labels.icon",
                    "stylers": [
                    {
                        "visibility": "off"
                    }
                    ]
                },
                {
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#757575"
                    }
                    ]
                },
                {
                    "elementType": "labels.text.stroke",
                    "stylers": [
                    {
                        "color": "#212121"
                    }
                    ]
                },
                {
                    "featureType": "administrative",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#757575"
                    }
                    ]
                },
                {
                    "featureType": "administrative.country",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                    ]
                },
                {
                    "featureType": "administrative.land_parcel",
                    "stylers": [
                    {
                        "visibility": "off"
                    }
                    ]
                },
                {
                    "featureType": "administrative.locality",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#bdbdbd"
                    }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#757575"
                    }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#181818"
                    }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#616161"
                    }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                    {
                        "color": "#1b1b1b"
                    }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.fill",
                    "stylers": [
                    {
                        "color": "#2c2c2c"
                    }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#8a8a8a"
                    }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#373737"
                    }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#3c3c3c"
                    }
                    ]
                },
                {
                    "featureType": "road.highway.controlled_access",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#4e4e4e"
                    }
                    ]
                },
                {
                    "featureType": "road.local",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#616161"
                    }
                    ]
                },
                {
                    "featureType": "transit",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#757575"
                    }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#000000"
                    }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#3d3d3d"
                    }
                    ]
                }
            ],
            {name: 'Dark'}
        );
        
        let silverStyledMapStyle = new google.maps.StyledMapType ( 
            [
                {
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                    ]
                },
                {
                    "elementType": "labels.icon",
                    "stylers": [
                    {
                        "visibility": "off"
                    }
                    ]
                },
                {
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#616161"
                    }
                    ]
                },
                {
                    "elementType": "labels.text.stroke",
                    "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                    ]
                },
                {
                    "featureType": "administrative.land_parcel",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#bdbdbd"
                    }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#757575"
                    }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#ffffff"
                    }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#757575"
                    }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#dadada"
                    }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#616161"
                    }
                    ]
                },
                {
                    "featureType": "road.local",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                    ]
                },
                {
                    "featureType": "transit.line",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                    ]
                },
                {
                    "featureType": "transit.station",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [
                    {
                        "color": "#c9c9c9"
                    }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                    ]
                }
            ],
            {name: 'Silver'}
        );


    
    if (document.getElementById('map') != null) {
        
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: {
                lat: 45.501709456413984,
                lng: -73.71938522905111
            },
            mapTypeControlOptions: {
                mapTypeIds: ['dark_styled_map', 'silver_styled_map']
            },
            styles: [{
                featureType: "all",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            }]
        });

        map.mapTypes.set('dark_styled_map', darkStyledMapStyle);
        map.setMapTypeId('dark_styled_map');
        map.mapTypes.set('silver_styled_map', silverStyledMapStyle); 

        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('symbolLegend'));

        init();
    }
}

function init() {
    if (currentTopology && currentSimulation) {

        nodeList = currentSimulation.nodeSummaries;

        computeMinMax();

        currentTopology.routers.forEach(addRouter);
        currentTopology.collectors.forEach(addCollector);

        $("#map-container").removeClass("hidden");
        google.maps.event.trigger(map, 'resize');

        map.setCenter(currentTopology.collectors[0]);

        $('#btnYR').click();
    }
}

// //// METERS
var metersVisible = true;
var mtrsVisbileBtn = $("#m-visible-btn");

function toggleMeters() {
    if (metersVisible) {
        map.data.setMap(null);
        mtrsVisbileBtn.removeClass('active');
    } else {
        map.data.setMap(map);
        mtrsVisbileBtn.addClass('active');
    }
    metersVisible = !metersVisible;
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
        }
    });
    routers.push(marker);
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
        }
    });
    collectors.push(marker);
}

// /load

function loadTplg(tplg, item) {
    $('.tplg').removeClass('active');
    $(item).addClass('active');
    loadSimulation();
}

function loadParams(params, item) {
    $('.param').removeClass('active');
    $(item).addClass('active');
    loadSimulation();
}

function loadSimulation(e) {
    var tplg = $(".tplg.active");
    var param = $(".param.active");

    if (tplg.length === 0 || param.length === 0) return;

    location.pathname = "/simulation/" + tplg.text().trim() + "/" + param.text().trim();

    // maxCanals = currentSimulation.summary.numberChannels;
}

function computeMinMax() {
    maxTransmissionCount = 0;
    maxCollisionCount = 0;
    maxCollisionProbability = 0;
    maxCreatedPacketCount = 0;
    maxMeanPacketTransitTime = 0;
    nodeList.filter(function (ns) {
        return ns.type == "SMART_METER"
    }).forEach(function (ns) {
        maxTransmissionCount = Math.max(maxTransmissionCount, ns.transmissionCount);
        maxCollisionCount = Math.max(maxCollisionCount, ns.collisionCount);
        maxCollisionProbability = Math.max(maxCollisionProbability, ns.collisionCount*1.0/ns.transmissionCount);
        maxCreatedPacketCount = Math.max(maxCreatedPacketCount, ns.createdPacketCount);
        maxMeanPacketTransitTime = Math.max(maxMeanPacketTransitTime, ns.meanPacketTransitTime);
    });
    updateLegend();
}

function updateLegend() {
    var gradientCss = '(left';
    currentGradient.map((color) => {
        gradientCss += ', ' + color;
    });
    gradientCss += ')';

    $('#legendGradient').css('background', '-webkit-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', '-moz-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', '-o-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', 'linear-gradient' + gradientCss);

    switch ($("#legendParameterList").val()) {
        case "0":
            $("#legendLabelLeft").text("0(transmissions)");
            $("#legendLabelRight").text(maxTransmissionCount);
            $("#legendLabelLeft").css("color", currentGradient[1]);
            $("#legendLabelRight").css("color", currentGradient[0]);
            $("#unit").css("color", currentGradient[0]);
            $("#unit").text("(transmissions)");
            break;
        case "1":
            $("#legendLabelLeft").text("0(collisions)");
            $("#legendLabelRight").text(maxCollisionCount);
            $("#legendLabelLeft").css("color", currentGradient[1]);
            $("#legendLabelRight").css("color", currentGradient[0]);
            $("#unit").css("color", currentGradient[0]);
            $("#unit").text("(collisions)");
            break;
        case "2":
            $("#legendLabelLeft").text("0.00%");
            $("#legendLabelRight").text((maxCollisionProbability*100).toFixed(2));
            $("#legendLabelLeft").css("color", currentGradient[1]);
            $("#legendLabelRight").css("color", currentGradient[0]);
            $("#unit").css("color", currentGradient[0]);
            $("#unit").text("%");
            break;
        case "3":
            $("#legendLabelLeft").text("0(packets)");
            $("#legendLabelRight").text(maxCreatedPacketCount);
            $("#legendLabelLeft").css("color", currentGradient[1]);
            $("#legendLabelRight").css("color", currentGradient[0]);
            $("#unit").css("color", currentGradient[0]);
            $("#unit").text("(packets)");
            break;
        case "4":
            $("#legendLabelLeft").text("0(seconds)");
            $("#legendLabelRight").text(maxMeanPacketTransitTime.toFixed(2));
            $("#legendLabelLeft").css("color", currentGradient[1]);
            $("#legendLabelRight").css("color", currentGradient[0]);
            $("#unit").css("color", currentGradient[0]);
            $("#unit").text("(seconds)");
            break;
    }
}

$('#btnYR').click(() => {
    currentGradient = gradientRY;
    currentGradientIndex = 0;
    updateLegend();
    if(kmlParser)
        try {
            kmlParser.hideDocument();
            
        } catch (error) {}
    kmlParser = new geoXML3.parser({
        map : map,
        singleInfoWindow:true
    });
    switch ($("#legendParameterList").val()) {
        case "0":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/YellowToRed/transmissionCount.kmz");
            break;
        case "1":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/YellowToRed/collisionCount.kmz");
            break;
        case "2":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/YellowToRed/collisionProbability.kmz");
            break;
        case "3":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/YellowToRed/createdPacketCount.kmz");
            break;
        case "4":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/YellowToRed/meanPacketTransitTime.kmz");
            break;
    }
});

$('#btnBW').click(() => { 
    currentGradient = gradientBW;
    currentGradientIndex = 1;
    updateLegend();
    if(kmlParser)
        try {
            kmlParser.hideDocument();
            
        } catch (error) {} 
    kmlParser = new geoXML3.parser({
        map : map,
        singleInfoWindow:true
    });
    switch ($("#legendParameterList").val()) {
        case "0":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/BlackToWhite/transmissionCount.kmz");
            break;
        case "1":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/BlackToWhite/collisionCount.kmz");
            break;
        case "2":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/BlackToWhite/collisionProbability.kmz");
            break;
        case "3":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/BlackToWhite/createdPacketCount.kmz");
            break;
        case "4":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/BlackToWhite/meanPacketTransitTime.kmz");
            break;
    }
});

$('#btnGB').click(() => {
    currentGradient = gradientGB;
    currentGradientIndex = 2;
    updateLegend();
    if(kmlParser)
        try {
            kmlParser.hideDocument();
            
        } catch (error) {}
    kmlParser = new geoXML3.parser({
        map : map,
        singleInfoWindow:true
    });
    switch ($("#legendParameterList").val()) {
        case "0":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/GreenToBlue/transmissionCount.kmz");
            break;
        case "1":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/GreenToBlue/collisionCount.kmz");
            break;
        case "2":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/GreenToBlue/collisionProbability.kmz");
            break;
        case "3":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/GreenToBlue/createdPacketCount.kmz");
            break;
        case "4":
            kmlParser.parse(SIM_PATH + currentTopology.name + '/' + currentParamName + "/GreenToBlue/meanPacketTransitTime.kmz");
            break;
    }
});
//// Controls
// var tglFullscreenBtn = $("#toggle-fullscreen");

// function toggleFullScreen() {
//     $("#map-container").toggleClass("fullscreen");
//     tglFullscreenBtn.toggleClass("active");
//     google.maps.event.trigger(map, 'resize');
// }

//// Simulation
// var simulation;
// var playing = false;

// function toggleSimulation() {
//     maxCanals = currentSimulation.summary.numberChannels;
//     maxPackets = currentSimulation.summary.maxSimultaneousPacketsTx;
//     playbtn.toggleClass("active");

//     playing = !playing;
//     if (playing) {
//         simulation = setInterval(function() {
//             curTime++;
//             if (curTime > endTime) {
//                 toggleSimulation();
//             } else {
//                 timerSlider.slider('setValue', curTime);
//                 drawFrame();
//             }
//         }, intervalFrameDuration);
//     } else {
//         clearInterval(simulation);
//     }
// }

// $(timer).on("change", function() {
//     curTime = $(timer).val();
//     drawFrame();
// });

// function drawFrame() {
//     // Clear frame
//     frametransmissions.forEach(function(marker) {
//         marker.setMap(null);
//     });
//     frametransmissions = [];

//     frameCollisions.forEach(function(marker) {
//         marker.setMap(null);
//     });
//     frameCollisions = [];

//     frameAnimations.forEach(function(anim) {
//         clearInterval(anim);
//     });
//     frameAnimations = [];

//     //draw frame
//     drawtransmissions();
//     //drawCollisions();
// }

// function drawCollisions() {
//     var currentCollisions = collisions.filter(function(coll) {
//         return coll.timeSlot == curTime;
//     });

//     currentCollisions.forEach(function(coll) {
//         var marker = new google.maps.Marker({
//             position: nodeList[transmissions[coll.transmissionId].from].position,
//             map: map,
//             icon: {
//                 path: google.maps.SymbolPath.CIRCLE,
//                 scale: 7,
//                 strokeColor: "#FF0000",
//                 fillColor: "#FF0000",
//                 zIndex: 5,
//                 strokeWeight: 3
//             }
//         });
//         frameCollisions.push(marker);
//     });
// }

// function drawtransmissions() {
//     var currentTx = transmissions.filter(function(tx) {
//         return tx.timeSlot == curTime;
//     });

//     currentTx.forEach(function(tx) {
//         let posFrom, posTo;
//         posFrom = currentSimulation.nodeSummaries[tx.from].position
//         posTo = currentSimulation.nodeSummaries[tx.to].position

//         var linepath = [posFrom, posTo];
//         var scale = 3;
//         if (packetsByWidth) {
//             scale = tx.packets;
//         }
//         var color
//         if (tx.collision == 1) {
//             color = "red";
//         } else {
//             color = chroma.mix("yellow", "blue", tx.channel / maxCanals, 'hsl').hex();
//         }
//         var lineParams = {
//             path: linepath,
//             map: map,
//             strokeWeight: scale,
//             strokeColor: color,
//             zIndex: 2
//         };
//         if (packetsAnimation) {
//             var packet = {
//                 path: google.maps.SymbolPath.CIRCLE,
//                 scale: 0.5 * scale * (1 + tx.packets * 4.0 / maxPackets),
//                 strokeColor: color,
//                 zIndex: 3
//             };
//             lineParams.icons = [];
//             lineParams.icons.push({
//                 icon: packet,
//                 offset: '100%'
//             });
//         }
//         var line = new google.maps.Polyline(lineParams);
//         frametransmissions.push(line);

//         if (packetsAnimation) {
//             var curframe = 0;
//             var nbFrames = Math.floor(intervalFrameDuration / 20);
//             var fact = 100 / nbFrames;
//             var anim = setInterval(function() {
//                 curframe = (curframe + 1) % nbFrames;

//                 var icons = line.get('icons');
//                 var offset = 100 / icons.length;
//                 for (var i = 0; i < icons.length; i++) {
//                     icons[i].offset = (curframe * fact + offset * i) + '%';
//                 }
//                 line.set('icons', icons);
//             }, 20);

//             frameAnimations.push(anim);
//         }
//     });
// }