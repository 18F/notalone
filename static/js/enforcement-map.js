$(document).ready(function() {
  $.getJSON("../assets/consentagreements.json", function( data ) {
    // Using Awesome Markers as the default Leaflet marker icon
    var serviceMarker = L.AwesomeMarkers.icon({
        icon: 'glyphicon-file',
        markerColor: 'red'
      });

    // Setting up our Map. The View is centered on the zip coordinates provided earlier.
    var map = L.map('map', {
      scrollWheelZoom: false,
    }).setView([39.8282, -98.5795], 4);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
      subdomains: [1,2,3,4]
    }).addTo(map);
    L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
        return L.marker(latlng, {icon: serviceMarker, title: feature.properties.name});
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup('<span class="popup-name">' + feature.properties.name + '</span><br><a href="' + feature.properties.URL + '" target="_blank">View Report</a>');
      }
    }).addTo(map);
  });
});
