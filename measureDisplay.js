
let page = 1;

async function loadSearchPage(changePage){
    const res = await fetch(`query?search`);
    const data = await res.json();
    const votePromises = [];

    document.getElementById("left").disabled = page <= 1;

    for(let i=0; i<=20; i++){
        votePromises.push(fetch(`query?vote_id=${data.results[i].roll_call_id}`));
    }
    
    const voteResponses = await Promise.all(votePromises);
    for(let i = 0; i < voteResponses.length; i++){
        const voteData = await voteResponses[i].json();
        
        var x = document.createElement("BUTTON");
        x.classList.add('measure-button');
        x.innerHTML = `2025 Session > ${voteData.results[0].chamber} > ${voteData.results[0].measure_number} <br>Date: ${voteData.results[0].date} <br>Yea: ${voteData.results[0].yea_votes} Nay: ${voteData.results[0].nay_votes} <br>${voteData.results[0].desc}`;

        x.addEventListener('click', () => {
            const url = new URL('https://soonerview.org/measure');

            url.searchParams.set("vote_id", data.results[i].roll_call_id);

            window.location.href = url.toString();
        });
    
        document.getElementById("measure-list").appendChild(x);
    }
}

loadSearchPage(0);