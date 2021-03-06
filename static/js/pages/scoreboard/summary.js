var flag_chart;
var money_chart;
var game_data;

/* Highcharts code */
$(document).ready(function() {
    if ($("#timercount").length === 0) {
        /* Options for both graphs*/
        Highcharts.getOptions().colors = $.map(Highcharts.getOptions().colors, function(color) {
            return {
                radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
                stops: [
                    [0, color],
                    [1, Highcharts.Color(color).brighten(-0.3).get('rgb')]
                ]
            };
        });
        /* Flag Chart */
        flag_chart = new Highcharts.Chart({
            chart: {
                renderTo: 'pie_flags',
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                backgroundColor:'transparent'
            },
            title: {
                text: '<strong>Flags Captured</strong>',
                style: {
                    color: '#FFFFFF',
                    font: 'bold 16px "Trebuchet MS", Verdana, sans-serif',
                    'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
                },
            },
            tooltip: {
                enable: true,
                formatter: function() {
                    return htmlEncode(this.point.y) + ' flag(s)<br /><strong>' + htmlEncode(this.point.percentage.toFixed(2)) + '%</strong>';
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#FFFFFF',
                        connectorColor: '#FFFFFF',
                        formatter: function() {
                            return '<div style="font-size:small;text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;">' +
                                        htmlEncode(this.point.name) + '</div>';
                        }
                    }
                }
            },
            series: [{
                type: 'pie',
                name: 'Flags Captured',
                data: []
            }]
        });
        /* Money Chart */
        money_chart = new Highcharts.Chart({
            chart: {
                renderTo: 'pie_money',
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                backgroundColor:'transparent'
            },
            title: {
                text: '<strong>' + $("#bankname").text() + '</strong>',
                style: {
                    color: '#FFFFFF',
                    font: 'bold 16px "Trebuchet MS", Verdana, sans-serif',
                    'text-shadow': '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black',
                },
            },
            tooltip: {
                enabled: true,
                formatter: function() {
                    return $("#banksymbol").text() + htmlEncode(this.point.y) + '<br /><strong>' +
                        htmlEncode(this.point.percentage.toFixed(2)) + '%</strong>';
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#FFFFFF',
                        connectorColor: '#FFFFFF',
                        formatter: function() {
                            return '<div style="font-size:small;text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;">' +
                                        htmlEncode(this.point.name) + '</div>';
                        }
                    }
                }
            },
            series: [{
                type: 'pie',
                name: 'Team Money',
                data: []
            }]
        });
    }
});


/* Update code */
$(document).ready(function() {
    
    if ($("#timercount").length > 0) {
        $.get("/scoreboard/ajax/timer", function(distance) {
            distance = distance * 1000;
            setTimer(distance);
        });
        window.scoreboard_ws = new WebSocket(wsUrl() + "/scoreboard/wsocket/pause_score");
        scoreboard_ws.onmessage = function(event) {
            if (event.data !== "pause") {
                location.reload();
            }
        }
    } else {
        window.scoreboard_ws = new WebSocket(wsUrl() + "/scoreboard/wsocket/game_data");
        scoreboard_ws.onmessage = function(event) {
            if (event.data === "pause") {
                location.reload();
            } else {
                game_data = jQuery.parseJSON(event.data);

                /* Update Money */
                var money_ls = [];
                $.each(game_data, function(index, item) {
                    money_ls.push([index.toString(), item.money]);
                });
                money_chart.series[0].setData(money_ls, true);
    
                /* Update Flags */
                var flag_ls = [];
                $.each(game_data, function(index, item) {
                    flag_ls.push([index.toString(), item.flags.length]);
                });
                flag_chart.series[0].setData(flag_ls, true);
    
                /* Update Summary Table */
                $.get("/scoreboard/ajax/summary", function(table) {
                    $("#summary_table").html(table);
                    $("a[id^=team-details-button]").click(function() {
                        window.location = "/teams#" + $(this).data("uuid");
                    });
                    barcolor();
                });
                if ($("#mvp_table").length > 0) {
                    /* Update MVP Table */
                    $.get("/scoreboard/ajax/mvp", function(table) {
                        $("#mvp_table").html(table);
                    });
                }
            }
        };

        $("#graphtext").click(function(){
            $("#pie_graphs").toggle();
            if ($("#pie_graphs").is(":visible")) {
                $("#graphtext").html('<i class="fa fa-caret-down graphtoggle"></i>&nbsp;&nbsp;Graphs');
            } else {
                $("#graphtext").html('<i class="fa fa-caret-up graphtoggle"></i>&nbsp;&nbsp;Graphs');
            }
        });
    }
});


function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}
  
function setTimer(distance) {
    // Update the count down every 1 second
    var x = setInterval(function() {
        // Time calculations for days, hours, minutes and seconds
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        var hourval = "";
        if (hours > 0) {
        hourval = hours + "h ";
        }
        $("#timercount").text(hourval + padDigits(minutes,2) + "m " + padDigits(seconds,2) + "s ");

        // If the count down is finished, write some text
        if (distance < 0) {
        clearInterval(x);
        $("#timercount").text("EXPIRED");
        }
        distance = distance - 1000;
    }, 1000);
}