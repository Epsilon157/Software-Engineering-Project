for (let i=0; i<10; i++){

    var x = document.createElement("BUTTON");
    x.classList.add('measure-button');
    x.textContent = "Button " + i;
    x.onclick="window.open('/measure')";
    
    document.getElementById("measure-list").appendChild(x);
}

