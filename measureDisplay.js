/*
for (let i=1; i<=20; i++){

    var x = document.createElement("BUTTON");
    x.classList.add('measure-button');
    x.innerHTML = "(Session): > (Location): > (BillID): " + i + "<br>Date: <br>Vote: <br>Description: ";

    x.addEventListener('click', () => {
        const url = new URL('https://soonerview.org/measure');

        url.searchParams.set("vote_id", i);

        window.location.href = url.toString();
    });
    
    document.getElementById("measure-list").appendChild(x);

}*/

async function loadSearchPage() {
    const res = await fetch(`query?search`);
    const data = await res.json();

    
    for(let i=1; i<=20; i++){
        const voteResponse = await fetch(`query?vote_id=${data.results[i].roll_call_id}`);
        const voteData = await voteResponse.json();

        var x = document.createElement("BUTTON");
        x.classList.add('measure-button');
        x.innerHTML = `2025 Session: > ${voteData.results[0].chamber} > ${voteData.results[0].measure_number} <br>Date: ${voteData.results[0].date} <br>Yea: ${voteData.results[0].yea_votes} Nay: ${voteData.results[0].nay_votes} <br>Description: ${voteData.results[0].desc}`;

        x.addEventListener('click', () => {
            const url = new URL('https://soonerview.org/measure');

            url.searchParams.set("vote_id", voteData.results[0].roll_call_id);

            window.location.href = url.toString();
        });
    
        document.getElementById("measure-list").appendChild(x);
    }
}

loadSearchPage();