$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function saveParameters() {
    var originalData = $("#paramForm").serializeObject();
    var data = {};
    $.each(Object.keys(originalData), function () {
        data[this] = Number(originalData[this]);
    });
    data.name = originalData.name;
    data.reading = !!originalData.reading;
    data.demand = !!originalData.demand;
    data.broadcastDemandTimeslots = originalData
        .broadcastDemandTimeslots.split(',')
        .map(function (n) {
            return parseInt(n, 10)
        })
        .filter(function(n) {
            return !isNaN(n) && n >= 0
        });


    $.ajax({
        url: "/params/save",
        type: 'POST',
        data: JSON.stringify(data),
        success: function () {
            alert("Parameters saved with success");
            location.pathname = "/params/edit/" + data.name;
        },
        contentType: "application/json",
        error: function () {
            alert("Error saving parameters");
        }
    });
}