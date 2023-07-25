// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define the getColor function to assign color based on depth.
  function getColor(depth) {
    if (depth < 10) {
      return "#ffe6ff";
    } else if (depth < 30) {
      return "#ff80ff";
    } else if (depth < 50) {
      return "#ff33ff";
    } else if (depth < 70) {
      return "#cc00cc";
    } else if (depth < 90) {
      return "#800080";
    } else {
      return "#4d004d";
    }
  }

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place, magnitude, and depth of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag * 5,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: onEachFeature
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    //"Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a legend
  var myColors = ["#ffe6ff", "#ff80ff", "#ff33ff", "#cc00cc", "#800080", "#4d004d"];
  // https://gis.stackexchange.com/questions/133630/adding-leaflet-legend
  var legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {

      var div = L.DomUtil.create('div', 'info legend');
      labels = ["<div style='background-color: lightgray'><strong>&nbsp&nbspDepth (km)&nbsp&nbsp</strong></div>"];
      categories = ['-10-10', ' 10-30', ' 30-50', ' 50-70', ' 70-90', '+90'];
      for (var i = 0; i < categories.length; i++) {
          div.innerHTML +=
              labels.push(
                  '<li class="circle" style="background-color:' + myColors[i] + '">' + categories[i] + '</li> '
              );
      }
      div.innerHTML = '<ul style="list-style-type:none; text-align: center">' + labels.join('') + '</ul>'
      return div;
  };
  legend.addTo(myMap);

  // Adding a Scale to a map
  L.control.scale()
      .addTo(myMap);

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps,{
    collapsed: false
  }).addTo(myMap);
}
