// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

//color gradient array for depth
var colorArray = ['#90EE90','#e1e96b','#F6D42A','#E28C1F','#EE5312','#8b0000'];

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // show first feature
    console.log(data.features);
    // pass CreateFeatures function
    createFeatures(data.features);
});

// Define a markerSize() function that will give each earthquake a different radius based on its magnitude.
function markerSize(magnitude) {
    return Math.sqrt(magnitude) * 12;
}

// 
function createMap(earthquakes) {
    //test by printing first feature into console log. 
    //console.log(earthquakes);
    
    // Create the base layers.
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a baseMaps object.
    var baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // Create an overlay object to hold our overlay.
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 2,
        layers: [topo]
    });

    // Create widget to control layer visibility
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false //this makes the control layer visible by default
    }).addTo(myMap);

    // Create legend for bottom righthand corner
    var legend = L.control({ position: "bottomright" });
    
    // function to prepare a 'div' to insert into the html for the legend. 
    legend.onAdd = function() {
        //Create div with class "info legend"
        var div = L.DomUtil.create("div", "info legend");

        //Set limits for legend
        var limits = ["-10–10 km", "10–30 km", "30–50 km", "50–70 km", "70–90 km", "90+ km"];

        //Initialize empty labels array to store <li> items for legend
        var labels = [];
        
        // create html code to add to the div. 
        var legendInfo = "<h1>Earthquake Depth</h1>";

        // add above html code to the div created. 
        div.innerHTML = legendInfo;

        //Populate label array. For each limit, create a list item w/ two spans
        //--one for the background color and another for the label.
        limits.forEach(function(limit, index) {
            labels.push("<li><span style=\"background-color: " + colorArray[index] + "\"></span><span class=\"label\">" + limits[index] + "</span></li>");
        });

        //put them all together in the div. 
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        //return div
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
};  

//Create features on features layer
function createFeatures(earthquakeData) {
    //function to run on each feature in the features array. 
    
    //bind a popup to each feature. 
    function onEachFeature(feature, layer) {
        let place = feature.properties.place;
        let date = feature.properties.time;
        let magnitude = feature.properties.mag;
        let depth = feature.geometry.coordinates[2];
        layer.bindPopup(`<h3>${place}</h3><p><strong>Time</strong>: ${new Date(date)}<br><strong>Magnitude</strong>: ${(magnitude)}<br><strong>Depth</strong>: ${(depth)}</p>`);
    }
    
    //create circle with size magnitude 
    function createCircleMarker(feature) {
        var magnitude = feature.properties.mag;
        var depth = feature.geometry.coordinates[2];
        var lat = feature.geometry.coordinates[1];
        var lon = feature.geometry.coordinates[0];
        //vary color conditional to depth of earthquake 
        var fillColor = depth <= 10 ? colorArray[0] : depth <= 30 ? colorArray[1] : depth <= 50 ? colorArray[2] : depth <= 70 ? colorArray[3] : depth <= 90 ? colorArray[4] : colorArray[5] ;
        return L.circleMarker([lat,lon], {
            //vary size of marker based on magnitude size
            radius: markerSize(magnitude),
            fillColor: fillColor,
            fillOpacity: 0.5,
            weight: 1, //stroke weight
            color: 'white' //stroke color 
        });
    }

    //create earthquake layer with geoJSON, and pass circles
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: createCircleMarker, 
        // By default, geoJSON maps simple markers. PointToLayer allows these simple markers to be altered, 
        // in this case, circles w varying radii. 
        onEachFeature: onEachFeature
    });

    createMap(earthquakes);
}

  

