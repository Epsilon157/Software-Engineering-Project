

//Howto: https://leafletjs.com/examples/choropleth/

var map = L.map('map').setView([35,-97.9], 7);
var geoLayer = L.geoJSON().addTo(map);

fetch('./Website Assets/MapSHPFile/HouseGeoJSON.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);

        geoLayer.addData(data);
    })
        .catch(error => {
        console.error('Error loading map JSON data', error);
    });
