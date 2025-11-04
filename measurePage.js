
//Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('vote_id');


async function loadMeasurePage() {
    const res = await fetch(`query?vote_id=${id}`);
    const data = await res.json();

    //Load data for measure page by ID lookup.
    //TODO: Author, coauthor, yea/nay people, districts
    //      Districts will be done recursively
    (data.results || []).forEach(row => {
        document.getElementById('header').textContent = `2025 Session > ${row.chamber} > ${row.measure_number}`;
        //document.getElementById('coauthors').textContent = `Coauthors: ${row.coauthors.map(coauthors => String(coauthors.name))}`;
        document.getElementById('date').textContent = `Date: ${row.date}`;
        document.getElementById('desc').textContent = `Description: ${row.desc}`;
        document.getElementById('yeaheader').textContent = `Yea: ${row.yea_votes}`;
        document.getElementById('nayheader').textContent = `Nay: ${row.nay_votes}`;

        for(let i = 1; i <= 48; i++){
            var n = String(i).padStart(3, '0');
            var p = document.createElement('p');
            p.textContent = `${row.District_+n}`;
            document.getElementById("yea").appendChild(p);
        }
    });
}

loadMeasurePage();
