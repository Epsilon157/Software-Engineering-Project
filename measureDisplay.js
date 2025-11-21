//import { fillAndStroke } from "pdfkit/js/mixins/vector";

let page = 1;

let allVoteData = [];
let filteredVoteIds = [];

async function displayMeasures(voteIds, resetPage = false){
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
    const startIndex = (page - 1) * 20;
    const endIndex = Math.min(page * 20, voteIds.length);
    //Disable arrows if can't go far enough
    //document.getElementById("left").disabled = page <= 1;
    //document.getElementById("farleft").disabled = page <= 10;
    //document.getElementById("right").disabled = page >= Math.ceil(voteIds.length / 20);
    //document.getElementById("farright").disabled = page >= Math.ceil(voteIds.length / 200);

    for(let i = startIndex; i < endIndex; i++){
        votePromises.push(fetch(`query?vote_id=${voteIds[i]}`));
    }

    
    const voteResponses = await Promise.all(votePromises);
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
            //bookmarkButton.classList.add('bookmark-button');
            //bookmarkButton.innerHTML = "Bookmark";
            bookmarkButton.type = "image";
            bookmarkButton.src = "Website Assets/BookmarkOn.png";

            document.getElementById("measure-list").appendChild(div);
            div.appendChild(measureButton);
            div.appendChild(bookmarkButton);
        }
    }
}

async function filter(){
    const searchby = document.getElementById("searchby");
    const selectedOption = searchby.options[searchby.selectedIndex];
    const filterValue = selectedOption ? selectedOption.textContent : '';

    let filteredIds = [...allVoteData.map(v => v.roll_call_id)];

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
    filteredVoteIds = filteredIds;
    await displayMeasures(filteredVoteIds, true);
}

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
    if(changePage){
        page += changePage;
        if(page < 1){
            page = 1;
        }
    }

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
}

loadSearchPage(0);