
//Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('vote_id');

var map = L.map('map', {
    maxBounds: [
        [37.2, -93.4],  // north, west
        [33.6, -103.1]  // south, east
    ],
    maxBoundsViscosity: 1.0,
    minZoom: 7
}).setView([35,-97.9], 7);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    opacity: 0.5,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var geoLayer = L.geoJSON(null, {style: style, onEachFeature: onEachFeature}).addTo(map);

function style() {
    return {
        fillColor: "#5a5a5aff",
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.0
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        opacity: 1,
        color: 'white',
        dashArray: ''
    });

    layer.bringToFront();
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3'
    });

    info.update();
}

var legend = L.control({position: 'bottomright'});
legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += '<i style="background: #9e2020ff"></i><span>Republican Yea</span><br>';
    div.innerHTML += '<i style="background: #bd7e7e"></i><span>Republican Nay</span><br>';
    div.innerHTML += '<i style="background: #282bb3ff"></i><span>Democratic Yea</span><br>';
    div.innerHTML += '<i style="background: #8284c8"></i><span>Democratic Nay</span><br>';
    div.innerHTML += '<i style="background: #dddddd"></i><span>No vote/Absent</span><br>';

    return div;
};
legend.addTo(map);

var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
    });
}

async function loadMeasurePage() {

    const res = await fetch(`query?vote_id=${id}`);
    const data = await res.json();

    (data.results || []).forEach(row => {
        document.getElementById('header').textContent = `2025 Session > ${row.chamber} > ${row.measure_number}`;
        const coauthorsArray = typeof row.coauthors === 'string' 
        ? JSON.parse(row.coauthors) 
        : row.coauthors;
        const coauthorsNames = coauthorsArray.map(coauthor => coauthor.name).join(', ');
        //Bolding and new lining the titles
        document.getElementById('coauthors').innerHTML = `<strong>Coauthors:</strong><br> ${coauthorsNames}`;
        document.getElementById('author').innerHTML = `<strong>Author:</strong><br> ${row.primary_author_name}`;
        document.getElementById('date').innerHTML = `<strong>Date:</strong><br> ${row.date}`;
        document.getElementById('desc').innerHTML = `<strong>Description:</strong><br> ${row.desc}`;
        document.getElementById('yeaheader').innerHTML = `<strong>Yea:</strong> ${row.yea_votes}`;
        document.getElementById('nayheader').innerHTML = `<strong>Nay:</strong> ${row.nay_votes}`;

        if(row.chamber == 'House'){
            fetch('./Website Assets/MapSHPFile/HouseGeoJSON.json')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                geoLayer.addData(data);

                loadYeaNay();
            })
            .catch(error => {
                console.error('Error loading map JSON data', error);
            });
        }
        else{
            fetch('./Website Assets/MapSHPFile/SenateGeoJSON.json')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                geoLayer.addData(data);

                loadYeaNay();
            })
            .catch(error => {
                console.error('Error loading map JSON data', error);
            });
        }
    });
}
//Function for displaying the yea and nay votes; red for republican, blue for democrat; number and individuals
async function loadYeaNay() {
    const districtPromises = [];

    for(let i = 1; i <= 101; i++){
        var n = String(i).padStart(3, '0');
        districtPromises.push(fetch(`query?vote_id=${id}&district=${n}`));
    }
    const districtResponses = await Promise.all(districtPromises);

    for(let i = 0; i < districtResponses.length; i++){
        var p = document.createElement('p');

        const response = districtResponses[i];
        const districtData = await response.json();

        const voteData = districtData.districtResult[0];
        const termData = districtData.termResult[0];

        if(voteData == null || termData == null) continue;

        let partyColor = "#696969ff";
        let partyOpacity = 0.8;

        if(termData.party == 'Republican'){
            partyColor = "#9e2020ff";
        }
        else if (termData.party == 'Democratic'){
            partyColor = "#282bb3ff";
        }
            
        p.textContent = `${termData.district}: ${termData.name}`;
        p.style.color = partyColor;

        if(Number(voteData.district_result) == 1){
            document.getElementById("yea").appendChild(p);
        }
        else if(Number(voteData.district_result) == 2){
            document.getElementById("nay").appendChild(p);
            partyOpacity = 0.3;
        }
        else{
            partyOpacity = 0.0;
        }
        
        geoLayer.eachLayer(layer=>{
            if(layer.feature.properties.DISTRICT == termData.district){
                layer.setStyle({fillColor: partyColor, fillOpacity: partyOpacity});
                layer.feature.properties.name = termData.name;
            }
        });
    }
}

loadMeasurePage();

info.update = function (props) {
    this._div.innerHTML = '<h4>Oklahoma Districts</h4>' +  (props ?
        '<b>' + 'District: ' + props.DISTRICT + '</b><br />' + 
        '<b>' + 'Name: ' + props.name + '</b><br />'
        : 'Hover over a district');
};
info.addTo(map);