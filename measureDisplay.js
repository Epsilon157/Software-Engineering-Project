for (let i=1; i<=20; i++){

    var x = document.createElement("BUTTON");
    x.classList.add('measure-button');
    x.textContent = "Button " + i;

    x.addEventListener('click', () => {
        const url = new URL('https://soonerview.org/measure');

        url.searchParams.set("voteid", i);

        window.location.href = url.toString();
    });
    
    document.getElementById("measure-list").appendChild(x);
}

