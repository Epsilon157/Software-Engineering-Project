//import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
//import { onRequest2 } from "./api/query";
//onRequest2();

const url = new URL(request.url);
const id = url.searchParams.get("vote_id");

async function loadMessages() {
    const res = await fetch('query?vote_id=${id}');
    const data = await res.json();

    const list = document.getElementById('messages');
    (data.results || []).forEach(row => {
        const li = document.createElement('li');
        li.textContent = row.desc;
        list.appendChild(li);
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
