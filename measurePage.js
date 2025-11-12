
//Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('vote_id');


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

function style() {
    return {
        fillColor: "#696969ff",
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

L.geoJson(statesData, {style: style}).addTo(map);


async function loadMeasurePage() {
    const res = await fetch(`query?vote_id=${id}`);
    const data = await res.json();

    (data.results || []).forEach(row => {
        document.getElementById('header').textContent = `2025 Session > ${row.chamber} > ${row.measure_number}`;
        const coauthorsArray = typeof row.coauthors === 'string' 
        ? JSON.parse(row.coauthors) 
        : row.coauthors;
        const coauthorsNames = coauthorsArray.map(coauthor => coauthor.name).join(', ');

        //document.getElementById('coauthors').textContent = `Coauthors: ${coauthorsNames}`;// No highlight or bold
        //document.getElementById('coauthors').innerHTML = `<strong>Coauthors</strong>: ${coauthorsNames}`;// Just bold
        //document.getElementById('coauthors').innerHTML = `<mark>Coauthors</mark>: ${coauthorsNames}`;// Just highlight
        document.getElementById('coauthors').innerHTML = `<strong>Coauthors:</strong><br> ${coauthorsNames}`;// Highlight and bold

        //document.getElementById('coauthors').textContent = `Coauthors: ${row.coauthors.map(coauthors => String(coauthors.name))}`;
        
        document.getElementById('author').innerHTML = `<strong>Author:</strong><br> ${row.primary_author_name}`;
        document.getElementById('date').innerHTML = `<strong>Date:</strong><br> ${row.date}`;
        document.getElementById('desc').innerHTML = `<strong>Description:</strong><br> ${row.desc}`;
        document.getElementById('yeaheader').innerHTML = `<strong>Yea:</strong> ${row.yea_votes}`;
        document.getElementById('nayheader').innerHTML = `<strong>Nay:</strong> ${row.nay_votes}`;

        /*
        document.getElementById('author').textContent = `Author: ${row.primary_author_name}`;
        document.getElementById('date').textContent = `Date: ${row.date}`;
        document.getElementById('desc').textContent = `Description: ${row.desc}`;
        document.getElementById('yeaheader').textContent = `Yea: ${row.yea_votes}`;
        document.getElementById('nayheader').textContent = `Nay: ${row.nay_votes}`;
        */
        
    });
}



async function loadYeaNay() {
    for(let i = 1; i <= 101; i++){
        var n = String(i).padStart(3, '0');
        var p = document.createElement('p');

        const districtRes = await fetch(`query?vote_id=${id}&district=${n}`);
        const districtData = await districtRes.json();

        const voteData = districtData.districtResult[0];
        const termData = districtData.termResult[0];

        if(voteData == null || termData == null) continue;

        let partyColor = "#696969ff";
        let partyOpacity = 1.0;

        if(termData.party == 'Republican'){
            partyColor = "#9e2020ff";
        }
        else{
            partyColor = "#282bb3ff";
        }
            
        p.textContent = `${termData.name}`;
        p.style.color = partyColor;

        if(Number(voteData.district_result) == 1){
            document.getElementById("yea").appendChild(p);
        }
        else if(Number(voteData.district_result) == 2){
            document.getElementById("nay").appendChild(p);
            partyOpacity = 0.7;
        }
        else{
            partyOpacity = 0.0;
        }
        
        geoLayer.eachLayer(layer=>{
            if(layer.feature.properties.DISTRICT === i){
                layer.setStyle({fillColor: partyColor, fillOpacity: partyOpacity});
            }
        });
    }
}

loadMeasurePage();
loadYeaNay();