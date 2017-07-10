var map;
var nodeList;
var meters = null;
var routers = [];
var collectors = [];

var collisions = [];
var transmissions = [];

var frameCollisions = [];
var frametransmissions = [];
var frameAnimations = [];

var endTime = 100;
var curTime = 0;

var timer = $("#timer");
var timerSlider;
var playbtn = $("#playbtn");

var maxCanals;
var intervalFrameDuration = 500;
var packetsAnimation = true;
var packetsByWidth = false;

var websocket;

//
function runSimulation(topologyName, paramName, lightMode) {
    var ansi_up = new AnsiUp;

    websocket = new WebSocket('ws://' + window.location.host + '/simulation/run/' + topologyName + '/' + paramName + '/' + lightMode);
    websocket.onmessage = function(event) {
        var output = event.data;
        if (output.length > 6 && output[6] == '%') {
            var progressValue = output.substr(0, 7).trim().replace(',', '.');
            $('#sim-progress').css("width", progressValue).text(progressValue)
        } else {
            $('#sim-output').append(ansi_up.ansi_to_html(output));
        }
    };
    websocket.onclose = function() {
        $('#sim-progress').removeClass("progress-bar-striped active");
    };
}

// called by google maps script
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
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

function init() {
    if (currentTopology && currentSimulation) {
        map.data.setStyle({
            icon: {
                url: "/static/images/dot.png"
            },
            zIndex: 0
        });
        meters = map.data.add({ geometry: new google.maps.Data.MultiPoint(currentTopology.meters) });
        metersVisible = true;
        currentTopology.routers.forEach(addRouter);
        currentTopology.collectors.forEach(addCollector);

        collisions = currentSimulation.collisions;
        transmissions = currentSimulation.transmissions;

        nodeList = currentSimulation.nodeSummaries;

        endTime = transmissions[transmissions.length - 1].timeSlot;
        curTime = 0;

        var highlights = collisions.map(function(coll) {
            return { start: coll.timeSlot - 1, end: coll.timeSlot + 1 }
        });

        timerSlider = $(timer).slider({
            id: 'timerSlider',
            min: 0,
            max: endTime,
            step: 1,
            value: 0,
            rangeHighlights: highlights
        });

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

    maxCanals = currentSimulation.summary.numberChannels;

}

//// Controls
var tglFullscreenBtn = $("#toggle-fullscreen");

function toggleFullScreen() {
    $("#map-container").toggleClass("fullscreen");
    tglFullscreenBtn.toggleClass("active");
    google.maps.event.trigger(map, 'resize');
}

//// Simulation
var simulation;
var playing = false;

function toggleSimulation() {
    maxCanals = currentSimulation.summary.numberChannels;
    maxPackets = currentSimulation.summary.maxSimultaneousPacketsTx;
    playbtn.toggleClass("active");

    playing = !playing;
    if (playing) {
        simulation = setInterval(function() {
            curTime++;
            if (curTime > endTime) {
                toggleSimulation();
            } else {
                timerSlider.slider('setValue', curTime);
                drawFrame();
            }
        }, intervalFrameDuration);
    } else {
        clearInterval(simulation);
    }
}

$(timer).on("change", function() {
    curTime = $(timer).val();
    drawFrame();
});

function drawFrame() {
    // Clear frame
    frametransmissions.forEach(function(marker) {
        marker.setMap(null);
    });
    frametransmissions = [];

    frameCollisions.forEach(function(marker) {
        marker.setMap(null);
    });
    frameCollisions = [];

    frameAnimations.forEach(function(anim) {
        clearInterval(anim);
    });
    frameAnimations = [];

    //draw frame
    drawtransmissions();
    //drawCollisions();
}

function drawCollisions() {
    var currentCollisions = collisions.filter(function(coll) {
        return coll.timeSlot == curTime;
    });

    currentCollisions.forEach(function(coll) {
        var marker = new google.maps.Marker({
            position: nodeList[transmissions[coll.transmissionId].from].position,
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                strokeColor: "#FF0000",
                fillColor: "#FF0000",
                zIndex: 5,
                strokeWeight: 3
            }
        });
        frameCollisions.push(marker);
    });
}

function drawtransmissions() {
    var currentTx = transmissions.filter(function(tx) {
        return tx.timeSlot == curTime;
    });

    currentTx.forEach(function(tx) {
        let posFrom, posTo;
        posFrom = currentSimulation.nodeSummaries[tx.from].position
        posTo = currentSimulation.nodeSummaries[tx.to].position

        var linepath = [posFrom, posTo];
        var scale = 3;
        if (packetsByWidth) {
            scale = tx.packets;
        }
        var color
        if (tx.collision == 1) {
            color = "red";
        } else {
            color = chroma.mix("yellow", "blue", tx.channel / maxCanals, 'hsl').hex();
        }
        var lineParams = {
            path: linepath,
            map: map,
            strokeWeight: scale,
            strokeColor: color,
            zIndex: 2
        };
        if (packetsAnimation) {
            var packet = {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 0.5 * scale * (1 + tx.packets * 4.0 / maxPackets),
                strokeColor: color,
                zIndex: 3
            };
            lineParams.icons = [];
            lineParams.icons.push({
                icon: packet,
                offset: '100%'
            });
        }
        var line = new google.maps.Polyline(lineParams);
        frametransmissions.push(line);

        if (packetsAnimation) {
            var curframe = 0;
            var nbFrames = Math.floor(intervalFrameDuration / 20);
            var fact = 100 / nbFrames;
            var anim = setInterval(function() {
                curframe = (curframe + 1) % nbFrames;

                var icons = line.get('icons');
                var offset = 100 / icons.length;
                for (var i = 0; i < icons.length; i++) {
                    icons[i].offset = (curframe * fact + offset * i) + '%';
                }
                line.set('icons', icons);
            }, 20);

            frameAnimations.push(anim);
        }
    });
}