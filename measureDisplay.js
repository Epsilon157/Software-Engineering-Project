import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {onAuthStateChanged}from'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

window.isLoading = false;

const firebaseConfig = {
    apiKey: "AIzaSyAwIf4z7Yc0rgtHm1BwF9HIaoAJxS5RD_k",
    authDomain: "soonerview-3bdcd.firebaseapp.com",
    projectId: "soonerview-3bdcd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let page = 1;
//Arrays that store all relevant data from votes tables - saves queries - and stores the filtered and searched data from that array
let allVoteData = [];
let filteredVoteIds = [];
let userBookmarks = [];

async function displayMeasures(voteIds, resetPage = false){
    const user = auth.currentUser;

    if(resetPage){
        page = 1;
    }
    document.getElementById("measure-list").innerHTML = '';
    //Disable arrows and display message if 0 measures info is displayed
    if(voteIds.length === 0){
        document.getElementById("measure-list").innerHTML = '<p>No measures found</p>';
        document.getElementById("left").disabled = true;
        document.getElementById("farleft").disabled = true;
        document.getElementById("right").disabled = true;
        document.getElementById("farright").disabled = true;
        return;
    }

    const votePromises = [];
    const bookmarkPromises = [];
    const startIndex = (page - 1) * 20;
    const endIndex = Math.min(page * 20, voteIds.length);
    //Disable arrows if can't go far enough
    //document.getElementById("left").disabled = page <= 1;
    //document.getElementById("farleft").disabled = page <= 10;
    //document.getElementById("right").disabled = page >= Math.ceil(voteIds.length / 20);
    //document.getElementById("farright").disabled = page >= Math.ceil(voteIds.length / 200);

    for(let i = startIndex; i < endIndex; i++){
        votePromises.push(fetch(`query?vote_id=${voteIds[i]}`));

        if(user) {
            const token = await user.getIdToken();
            bookmarkPromises.push(fetch(`query?vote_id=${voteIds[i]}`, { 
                method: "OPTIONS", 
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }));
        }
    }

    
    const voteResponses = await Promise.all(votePromises);
    const bookmarkResponses = await Promise.all(bookmarkPromises);

    for(let i = 0; i < voteResponses.length; i++){
        const voteData = await voteResponses[i].json();
        
        if(voteData.results && voteData.results.length > 0){
            var div = document.createElement("DIV");
            div.classList.add('measure-div');

            var measureButton = document.createElement("BUTTON");
            measureButton.classList.add('measure-button');
            measureButton.innerHTML = `2025 Session > ${voteData.results[0].chamber} > ${voteData.results[0].measure_number} <br>Date: ${voteData.results[0].date} <br>Yea: ${voteData.results[0].yea_votes} Nay: ${voteData.results[0].nay_votes} <br>${voteData.results[0].desc}`;

            const rollCallID = voteIds[startIndex + i];
            measureButton.addEventListener('click', () => {
                const url = new URL('https://soonerview.org/measure');

                url.searchParams.set("vote_id", rollCallID);

                window.location.href = url.toString();
            });
        
            var bookmarkButton = document.createElement("INPUT");
            bookmarkButton.classList.add('bookmark-button');
            bookmarkButton.type = "image";

            bookmarkButton.dataset.rollCallId = rollCallID;

            bookmarkButton.addEventListener("click", async (e) => {
                e.stopPropagation(); // prevent the measure button from triggering

                const buttonToUpdate = e.currentTarget;

                const user = auth.currentUser;

                if (!user) {
                    alert("You must be logged in to bookmark.");
                    return;
                }
            
                const token = await user.getIdToken();

                const bookmarked = buttonToUpdate.dataset.bookmarked === "true";
                const rollCallId = buttonToUpdate.dataset.rollCallId;
            
                if (!bookmarked) {

                    // ADD BOOKMARK
                    await fetch("https://soonerview.org/query", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ roll_call_id: rollCallId })
                    });

                    // Create a new input element with the updated image
                    buttonToUpdate.src = "Website Assets/BookmarkOn.png";
                    buttonToUpdate.dataset.bookmarked = "true";

                    await updateBookmarks();

                } else {
                    // REMOVE BOOKMARK
                    await fetch("https://soonerview.org/query", {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ roll_call_id: rollCallId })
                    });
                
                    buttonToUpdate.src = "Website Assets/BookmarkOff.png";
                    buttonToUpdate.dataset.bookmarked = "false";

                    await updateBookmarks();
                }
            });
            
            /*
            if (user) {
                const token = await user.getIdToken();
        
                const response = await fetch(`https://soonerview.org/query?vote_id=${bookmarkButton.dataset.rollCallId}`, {
                    method: "OPTIONS",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await response.json();
                bookmarkButton.dataset.bookmarked = data.bookmarked ? "true" : "false";

                if (data.bookmarked) {
                    bookmarkButton.src = "Website Assets/BookmarkOn.png";
                } else {
                    bookmarkButton.src = "Website Assets/BookmarkOff.png";
                }
            }
            else {
                bookmarkButton.src = "Website Assets/BookmarkOff.png";
            }*/

            const bookmarkResponse = bookmarkResponses[i];
            if (user && bookmarkResponse.ok) {
                const bookmarkData = await bookmarkResponse.json();
                bookmarkButton.dataset.bookmarked = bookmarkData.bookmarked ? "true" : "false";
                if (bookmarkData.bookmarked) {
                    bookmarkButton.src = "Website Assets/BookmarkOn.png";
                } else {
                    bookmarkButton.src = "Website Assets/BookmarkOff.png";
                }
            }
            else {
                bookmarkButton.src = "Website Assets/BookmarkOff.png";
            }

            document.getElementById("measure-list").appendChild(div);
            div.appendChild(measureButton);
            div.appendChild(bookmarkButton);
        }
    }
}

//Function for filtering; Date, chamber, or passed
async function filter(){
    //Get user selection from dropdown menu
    const searchby = document.getElementById("searchby");
    const selectedOption = searchby.options[searchby.selectedIndex];
    const filterValue = selectedOption ? selectedOption.textContent : '';

    //Will hold data to be returned 
    let filteredIds = [...allVoteData.map(v => v.roll_call_id)];
    //
    if(filterValue === "Date - Asc"){
        const sorted = [...allVoteData].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        filteredIds = sorted.map(v => v.roll_call_id);
    }
    else if(filterValue === "Date - Desc"){
        const sorted = [...allVoteData].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        filteredIds = sorted.map(v => v.roll_call_id);
    }
    else if(filterValue === "Chamber - House"){
        filteredIds = allVoteData.filter(v => v.chamber === "House").map(v => v.roll_call_id);
    }
    else if(filterValue === "Chamber - Senate"){
        filteredIds = allVoteData.filter(v => v.chamber === "Senate").map(v => v.roll_call_id);
    }
    else if(filterValue === "Passed - Yes"){
        filteredIds = allVoteData.filter(v => v.yea_votes > v.nay_votes).map(v => v.roll_call_id);
    }
    else if(filterValue === "Passed - No"){
        filteredIds = allVoteData.filter(v => v.nay_votes > v.yea_votes).map(v => v.roll_call_id);
    }
    else if(filterValue === "Bookmarked"){
        filteredIds = allVoteData.filter(v => userBookmarks.includes(v.roll_call_id)).map(v => v.roll_call_id);
    }
    //Returns filtered data
    filteredVoteIds = filteredIds;
    await displayMeasures(filteredVoteIds, true);
}
//Function for searching; Measure name/number and author name
async function search(){
    const searchby = document.getElementById("searchby");
    const selectedOption = searchby.options[searchby.selectedIndex];
    const filterValue = selectedOption ? selectedOption.textContent : '';
    const searchValue = document.getElementById("searchbar").value.trim();

    let searchUrl = 'query?search';

    if(filterValue === "Measure Number"){
        searchUrl += `&searchID=${encodeURIComponent(searchValue)}`;
    }
    else if(filterValue === "Author Name"){
        searchUrl += `&searchAuthor=${encodeURIComponent(searchValue)}`;
    }
    else{
        return;
    }

    const res = await fetch(searchUrl);
    const data = await res.json();

    if(data.results && data.results.length > 0){
        filteredVoteIds = data.results.map(r => r.roll_call_id);
        await displayMeasures(filteredVoteIds, true);
    }
    else{
        document.getElementById("measure-list").innerHTML = '<p>No measures found</p>';
        filteredVoteIds = [];
    }
}

async function loadSearchPage(changePage){

    if(isLoading){
        while(isLoading){
            console.log("Waiting");
        }
    }
    else{
        isLoading = true;
    }

    if(changePage){
        page += changePage;
        if(page < 1){
            page = 1;
        }
    }

    document.getElementById("right")
    .addEventListener("click", () => loadSearchPage(1));

    document.getElementById("left")
    .addEventListener("click", () => loadSearchPage(-1));

    document.getElementById("farleft")
    .addEventListener("click", () => loadSearchPage(-10));

    document.getElementById("farright")
    .addEventListener("click", () => loadSearchPage(10));
    
    /*
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        const res = await fetch("https://soonerview.org/query?bookmarks", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        const data = await res.json();
        userBookmarks = data.results.map(r => parseInt(r.roll_call_id));
    } else {
        userBookmarks = [];
    }*/

    await updateBookmarks();

    if(allVoteData.length === 0){
        const res = await fetch(`query?search`);
        const data = await res.json();
        allVoteData = data.results || [];
        filteredVoteIds = allVoteData.map(v => v.roll_call_id);
    }

    if(!document.getElementById("searchby").hasAttribute('data-listeners-set')){
        document.getElementById("searchby").setAttribute('data-listeners-set', 'true');
        document.getElementById("searchby").addEventListener("change", function(e){
            const selectedOption = e.target.options[e.target.selectedIndex];
            const filterValue = selectedOption ? selectedOption.textContent : '';

            const searchbar = document.getElementById("searchbar");
            if(filterValue === "Measure Number" || filterValue === "Author Name"){
                searchbar.disabled = false;
                searchbar.placeholder = filterValue === "Measure Number" ? "Enter measure number" : "Enter author name";
            }
            else{
                searchbar.disabled = true;
                searchbar.placeholder = "Search Measures";
                searchbar.value = '';
                filter();
            }

        });
        document.getElementById("searchbar").addEventListener("keypress", function(e){
            if(e.key === "Enter"){
                const searchby = document.getElementById("searchby");
                const selectedOption = searchby.options[searchby.selectedIndex];
                const filterValue = selectedOption ? selectedOption.textContent : '';

                if(filterValue === "Measure Number" || filterValue === "Author Name"){
                    search();
                }
            }
        });
    }
    await displayMeasures(filteredVoteIds.length > 0 ? filteredVoteIds : allVoteData.map(v => v.roll_call_id), false);

    
    //const res = await fetch(`query?search`);
    //const data = await res.json();
    //document.getElementById("right").disabled = page >= Math.ceil(data.results.length / 20);
    //for(let i=(page-1)*20; i<page*20 && i<data.results.length; i++){
    //    votePromises.push(fetch(`query?vote_id=${data.results[i].roll_call_id}`));
    //}
    isLoading = false;
}

async function updateBookmarks() {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        const res = await fetch("https://soonerview.org/query?bookmarks", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        const data = await res.json();
        userBookmarks = data.results.map(r => parseInt(r.roll_call_id));
    } else {
        userBookmarks = [];
    }
}

onAuthStateChanged(auth, async (user) => {

    await loadSearchPage(0);
});