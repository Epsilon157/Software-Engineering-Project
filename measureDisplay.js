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
    const res = await fetch(`query?vote_id=${id}`);
    const data = await res.json();

    
    for(let i=1; i<=20; i++){
        var x = document.createElement("BUTTON");
        x.classList.add('measure-button');
        x.innerHTML = "(Session): > (Location): > (BillID): <br>Date: " + data[i].date + "<br>Vote: <br>Description: ";

        x.addEventListener('click', () => {
            const url = new URL('https://soonerview.org/measure');

            url.searchParams.set("vote_id", i);

            window.location.href = url.toString();
        });
    
        document.getElementById("measure-list").appendChild(x);
    }
}