//import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
//import { onRequest2 } from "./api/query";
//onRequest2();

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('voteid');

let p = document.getElementById('billID');
p.textContent = `Hello ${id}`;

async function loadMessages() {
    const res = await fetch(`query?vote_id=${id}`);
    const data = await res.json();

    (data.results || []).forEach(row => {
        document.getElementById('date').textContent = `Date: ${row.date}`;
    });
}

loadMessages();

/*
async function loadMessages() {
        const res = await fetch('query');
        const data = await res.json();

        const list = document.getElementById('messages');
        (data.results || []).forEach(row => {
          const li = document.createElement('li');
          li.textContent = row.desc;
          list.appendChild(li);
        });
        }

        loadMessages();*/
