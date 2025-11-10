
//Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('vote_id');


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
        document.getElementById('coauthors').innerHTML = `<strong><mark>Coauthors</mark></strong>: ${coauthorsNames}`;// Highlight and bold

        document.getElementById('coauthors').textContent = `Coauthors: ${row.coauthors.map(coauthors => String(coauthors.name))}`;
        
        document.getElementById('author').textContent = `Author: ${row.primary_author_name}`;
        document.getElementById('date').textContent = `Date: ${row.date}`;
        document.getElementById('desc').textContent = `Description: ${row.desc}`;
        document.getElementById('yeaheader').textContent = `Yea: ${row.yea_votes}`;
        document.getElementById('nayheader').textContent = `Nay: ${row.nay_votes}`;

        for(let i = 1; i <= 48; i++){
            var n = String(i).padStart(3, '0');
            var p = document.createElement('p');

            //const districtRes = await fetch(`query?vote_id=${id}district=${n}`);
            //const districtData = await districtRes.json();

            //p.textContent = `${}`;
            document.getElementById("yea").appendChild(p);
        }
    });
}

loadMeasurePage();
