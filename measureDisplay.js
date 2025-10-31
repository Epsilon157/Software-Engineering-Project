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
        x.innerHTML = `2025 Session: > ${voteData.results[0].chamber}: > (BillID): <br>Date: ${voteData.results[0].date} <br>Vote: <br>Description: `;

        x.addEventListener('click', () => {
            const url = new URL('https://soonerview.org/measure');

            url.searchParams.set("vote_id", i);

            window.location.href = url.toString();
        });
    
        document.getElementById("measure-list").appendChild(x);
    }
}

loadSearchPage();