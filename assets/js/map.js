// Set dimensions and create the SVG container
var w = 900;
var h = 600;

var projection = d3.geoAlbersUsa()
    .translate([w / 2, h / 2])
    .scale([1000]);

var path = d3.geoPath().projection(projection);

var color = d3.scaleOrdinal()
    .domain(['1', '2', '3', '4', '5'])
    .range(['#bbc7df', '#9c9ac9', '#7f7dbc', '#6954a1', '#491c85']);

var legendText = ["Category 5", "Category 4", "Category 3", "Category 2", "Category 1"];

// Create SVG element within the mapWrapper
var svg = d3.select("#map")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");


var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Convert string to Title Case
function toTitleCase(str) {
    return str.toLowerCase().replace(/(^|\s)\S/g, function (l) { return l.toUpperCase(); });
}

// Load CSV and JSON data
d3.csv("assets/data/states.csv").then(function (data) {
    var dataMap = {};
    data.forEach(function (d) {
        var stateName = toTitleCase(d.STATE_NAME);
        dataMap[stateName] = {
            category: d.category,
            denominator: d.DENOMINATOR,
            numerator: d.NUMERATOR,
            numericValue: d.NUMERIC_VALUE
        };
    });

    d3.json("assets/data/us-states.json").then(function (json) {
        json.features.forEach(function (feature) {
            var stateName = feature.properties.name;
            var stateData = dataMap[stateName];
            feature.properties.category = stateData ? stateData.category : '5';
            feature.properties.denominator = stateData ? stateData.denominator : 'N/A';
            feature.properties.numerator = stateData ? stateData.numerator : 'N/A';
            feature.properties.numericValue = stateData ? stateData.numericValue : 'N/A';
        });

        // Draw the map
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function (d) {
                var value = d.properties.category;
                return color(value) || "#ddd";
            })
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<strong>State:</strong> " + d.properties.name +
                    "<br><strong>Total number of students:</strong> " + d.properties.denominator +
                    "<br><strong>Number chronically absent:</strong> " + d.properties.numerator +
                    "<br><strong>% of students who are chronically absent:</strong> " + d.properties.numericValue + "%")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });

    // Create legend
    var legend = d3.select("#map").append("svg")
        .attr("class", "legend")
        .attr("width", 140)
        .attr("height", 200)
        .selectAll("g")
        .data(color.domain().slice().reverse())
        .enter()
        .append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function (d, i) { return legendText[i]; });
});
