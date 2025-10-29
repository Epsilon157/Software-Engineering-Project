//import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
//import { onRequest2 } from "./api/query";
//onRequest2();

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('voteid');

async function loadMeasurePage() {
    const res = await fetch(`query?vote_id=${id}`);
    const data = await res.json();

    (data.results || []).forEach(row => {
        document.getElementById('date').textContent = `Date: ${row.date}`;
        document.getElementById('yea').textContent = `Yea: ${row.yea_votes}`;
        document.getElementById('nay').textContent = `Nay: ${row.nay_votes}`;
    });
}

loadMeasurePage();
