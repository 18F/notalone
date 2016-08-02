$(document).ready(function () {
  // Service Locator Form
  // This script takes a given zipcode provided in a form and pulls nearby services from the RAINN API. You'll be provided with both a Leaflet/OSM map and a list of services at the end!
  //
  // As a work of the United States Government, this package is in the public domain within the United States. Additionally, we waive copyright and related rights in the work worldwide through the CC0 1.0 Universal public domain dedication.
  //
  // By Sean Herron <sean@herron.io>
  //
  // Using Awesome Markers as the default Leaflet marker icon
  var serviceMarker = L.AwesomeMarkers.icon({
    icon: 'glyphicon-star',
    markerColor: 'red'
  });

  // Setting up our Map. The View is centered on the zip coordinates provided earlier.
  var map = L.map('map', {
    scrollWheelZoom: false
  }).setView([39.8282, -98.5795], 4);
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
    subdomains: [1, 2, 3, 4]
  }).addTo(map);

  $('#service-locator-form').on('submit', function(event){
    event.preventDefault();
    $(".status").remove();

    // Get the zipcode from the relevant input from the form
    var zipcode = $('#service-locator-form #zipcode').val();

    // First clear out any old results that may have been submitted
    $(".service-locator-results").remove();
    $(".service-locator-guide").append('<div class="service-locator-results"></div>');

    if(zipcode) {
      // We start this out by providing some structure HTML and a loading text since it can take some time to get results from YQL
      $('.service-locator-map').prepend("<div class='status loading'><span class='glyphicon glyphicon-refresh'></span> Loading</div>");

      // We'll get the lat/lng of the zipcode here:
      // First set some empty vars
      var zipLat = "";
      var zipLng = "";
      var zipCoord = [];
      $.getJSON("//maps.googleapis.com/maps/api/geocode/json?address=" + zipcode + "&sensor=false")
        .done(function(data) {
          // Get back a lat/lng and coordinates array from the geocoder
          zipLat = data.results[0].geometry.location.lat;
          zipLng = data.results[0].geometry.location.lng;
          zipCoord = [data.results[0].geometry.location.lat,  data.results[0].geometry.location.lng];
          map.setView(new L.LatLng(zipLat, zipLng), 8);
        });

      $.ajax({
        url: "https://api.rainn.org/centers/v1/centers/zip/" + zipcode,
        headers: {
          'Authorization': 'Basic dGVzdDp0ZXN0'
        },
        dataType: 'json'
      })
        .done(function(json) {
          // Stop our loading stuff
          $(".status").remove();

          // This function finds the distance between the zipcoord and the coord of a given latlng.
          function compare_distance(a,b) {
            var a_distance = geolib.getDistance({"latitude": zipLat, "longitude": zipLng}, {"latitude": a.latitude, "longitude": a.longitude});
            var b_distance = geolib.getDistance({"latitude": zipLat, "longitude": zipLng}, {"latitude": b.latitude, "longitude": b.longitude});
            if (a_distance < b_distance) {
              return -1;
            }
            if (a_distance > b_distance) {
              return 1;
            }
            return 0;
          }

          // Grab all the known services from YQL
          var services = json;

          // Sort these by distance from the given ZIP
          services.sort(compare_distance);
          $.each(services, function(i, service){

            // Create Map Point
            var marker = new L.marker([service.latitude,service.longitude], {icon: serviceMarker, title: service.name}).on('click', function(e) {
              $(".service").removeClass("selected");
              $("#" + service.id).addClass("selected");
              $(".service-locator-results").scrollTop($(".service-locator-results").scrollTop() + $("#" + service.id).position().top);
            }).addTo(map);

            // Create Service Entry
            $(".service-locator-results").append('<div class="service" id="' + service.id + '"></div>');
            $("#" + service.id).append('<div class="service-name"><a href="' + service.url + '" target="_blank">' + service.name + '</a></div><div class="service-location">' + service.city + ', ' + service.state + '</div>');

            if(service.hotline) {
              if(service.hotline === "null") {

              }
              else {
                $("#" + service.id).append('<div class="service-hotline">Hotline: ' + service.hotline + '</div>');
              }
            }
            if(service.hotlinePhone) {
              $("#" + service.id).append('<div class="service-hotline">Hotline: ' + service.hotlinePhone + '</div>');
            }

            if(service.businessPhone) {
              $("#" + service.id).append('<div class="service-phone">Phone: ' + service.hotlinePhone + '</div>');
            }
          });


        });
    }
    else {
      $('.service-locator-map').prepend("<div class='status'>You did not provide a proper zipcode!</div>");
    }
  });
});
