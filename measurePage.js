//import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';
//import { onRequest2 } from "./api/query";
//onRequest2();

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('voteid');

async function loadMessages() {
    const res = await fetch('query?vote_id=1471208');
    const data = await res.json();

    const list = document.getElementById('messages');
    (data.results || []).forEach(row => {
        const li = document.createElement('li');
        li.textContent = row.desc;
        list.appendChild(li);
    });
}

loadMessages();

const res = await fetch('d1-tutorial.aidenmaner.workers.dev');
const data = await res.json();


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
