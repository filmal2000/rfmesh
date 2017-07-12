var map;
var nodeList;
var meters = [];
var routers = [];
var collectors = [];

var heatmapData = [];
var heatmap = undefined;
var gradient = [
    'rgba(0, 255, 0, 0)',
    'rgba(0, 255, 0, 1)',
    'rgba(64, 255, 0, 1)',
    'rgba(128, 255, 0, 1)',
    'rgba(191, 255, 0, 1)',
    'rgba(255, 255, 0, 1)',
    'rgba(255, 233, 0, 1)',
    'rgba(255, 210, 0, 1)',
    'rgba(255, 188, 0, 1)',
    'rgba(255, 165, 0, 1)',
    'rgba(255, 124, 0, 1)',
    'rgba(255, 83, 0, 1)',
    'rgba(255, 41, 0, 1)',
    'rgba(255, 0, 0, 1)'
];

var currentSimulation;
var currentTopology;

var maxTransmissionCount;
var maxCollisionCount;
var maxCollisionProbability;
var maxCreatedPacketCount;
var maxMeanPacketTransitTimeSlots;

// var collisions = [];
// var transmissions = [];

// var frameCollisions = [];
// var frametransmissions = [];
// var frameAnimations = [];

// var endTime = 100;
// var curTime = 0;

// var timer = $("#timer");
// var timerSlider;
// var playbtn = $("#playbtn");

// var maxCanals;
// var intervalFrameDuration = 500;
// var packetsAnimation = false;
// var packetsByWidth = false;

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
            console.log("adwdw")
        }
    };
    websocket.onclose = function () {
        $('#sim-progress').removeClass("progress-bar-striped active");
        console.log("!!!!!!")
         location.reload(); 
    };
}

// called by google maps script
function initMap() {
    if (document.getElementById('map') != null) {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: {
                lat: 45.501709456413984,
                lng: -73.71938522905111
            },
            mapTypeControlOptions: {
                mapTypeIds: ['roadmap']
            },
            styles: [{
                featureType: "all",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            }]
        });
        init();
    }
}

function init() {
    if (currentTopology && currentSimulation) {

        nodeList = currentSimulation.nodeSummaries;

        computeMinMax();

        var gradientCss = '(left';
        for (var i = 0; i < gradient.length; ++i) {
            gradientCss += ', ' + gradient[i];
        }
        gradientCss += ')';

        $('#legendGradient').css('background', '-webkit-linear-gradient' + gradientCss);
        $('#legendGradient').css('background', '-moz-linear-gradient' + gradientCss);
        $('#legendGradient').css('background', '-o-linear-gradient' + gradientCss);
        $('#legendGradient').css('background', 'linear-gradient' + gradientCss);

        map.data.setStyle({
            icon: {
                url: "/static/images/dot.png"
            },
            fillColor: 'red',
            strokeColor: 'blue',
            zIndex: 0
        });
        meters = map.data.add({ geometry: new google.maps.Data.MultiPoint(currentTopology.meters) });
        // metersVisible = true;

        updateHeatMap();

        currentTopology.routers.forEach(addRouter);
        currentTopology.collectors.forEach(addCollector);

        // collisions = currentSimulation.collisions;
        // transmissions = currentSimulation.transmissions;

        // endTime = transmissions[transmissions.length - 1].timeSlot;
        // curTime = 0;

        // var highlights = collisions.map(function(coll) {
        //     return { start: coll.timeSlot - 1, end: coll.timeSlot + 1 }
        // });

        // timerSlider = $(timer).slider({
        //     id: 'timerSlider',
        //     min: 0,
        //     max: endTime,
        //     step: 1,
        //     value: 0,
        //     rangeHighlights: highlights
        // });

        $("#map-container").removeClass("hidden");
        google.maps.event.trigger(map, 'resize');

        map.setCenter(currentTopology.collectors[0]);
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

function addMeter(meter) {
    // let ratio = 0;
    switch ($("#legendParameterList").val()) {
        case "0":
            heatmapData.push({location: new google.maps.LatLng(meter.position), weight: meter.transmissionCount});// + maxTransmissionCount/4.0});
            break;
        case "1":
            heatmapData.push({location: new google.maps.LatLng(meter.position), weight: meter.collisionCount});// + maxCollisionCount/4.0});
            break;
        case "2":
            heatmapData.push({location: new google.maps.LatLng(meter.position), weight: meter.collisionCount*1.0/meter.transmissionCount});// + maxCollisionProbability/4.0});
            break;
        case "3":
            heatmapData.push({location: new google.maps.LatLng(meter.position), weight: meter.createdPacketCount});// + maxCreatedPacketCount/4.0});
            break;
        case "4":
            heatmapData.push({location: new google.maps.LatLng(meter.position), weight: meter.meanPacketTransitTimeSlots});// + maxMeanPacketTransitTimeSlots/4.0});
            break;
    }
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
    maxMeanPacketTransitTimeSlots = 0;
    nodeList.filter(function (ns) {
        return ns.type == "SMART_METER"
    }).forEach(function (ns) {
        maxTransmissionCount = Math.max(maxTransmissionCount, ns.transmissionCount);
        maxCollisionCount = Math.max(maxCollisionCount, ns.collisionCount);
        maxCollisionProbability = Math.max(maxCollisionProbability, ns.collisionCount*1.0/ns.transmissionCount);
        maxCreatedPacketCount = Math.max(maxCreatedPacketCount, ns.createdPacketCount);
        maxMeanPacketTransitTimeSlots = Math.max(maxMeanPacketTransitTimeSlots, ns.meanPacketTransitTimeSlots);
    });
}

function updateHeatMap() {
    heatmapData = [];
    nodeList.filter(function (ns) {
        return ns.type == "SMART_METER"
    }).forEach(addMeter);
    if (heatmap)
        heatmap.setMap(null);
    heatmap = new google.maps.visualization.HeatmapLayer({
        opacity: 1,
        data: heatmapData,
        gradient: gradient
    });
    heatmap.setMap(map);
    updateLegend();
}

function updateLegend() {
            switch ($("#legendParameterList").val()) {
        case "0":
            $("#legendLabelLeft").text("0(transmissions)");
            $("#legendLabelRight").text(maxTransmissionCount);
            $("#unit").text("(transmissions)");
            break;
        case "1":
            $("#legendLabelLeft").text("0(collisions)");
            $("#legendLabelRight").text(maxCollisionCount);
            $("#unit").text("(collisions)");
            break;
        case "2":
            $("#legendLabelLeft").text("0.00%");
            $("#legendLabelRight").text((maxCollisionProbability*100).toFixed(2));
            $("#unit").text("%");
            break;
        case "3":
            $("#legendLabelLeft").text("0(packets)");
            $("#legendLabelRight").text(maxCreatedPacketCount);
            $("#unit").text("(packets)");
            break;
        case "4":
            $("#legendLabelLeft").text("0(time slots)");
            $("#legendLabelRight").text(maxMeanPacketTransitTimeSlots.toFixed(2));
            $("#unit").text("(time slots)");
            maxIntensity = maxMeanPacketTransitTimeSlots;
            break;
    }
}

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