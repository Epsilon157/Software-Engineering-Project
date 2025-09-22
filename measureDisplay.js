for (let i=0; i<10; i++){
    /*
    newButton = document.createElement('button');
    newButton.textContent = 'Test Button';
    newButton.classList.add('my-button'); // Apply existing CSS class
    newButton.addEventListener('click', () => {
        console.log('New button clicked!');
    });

    document.body.appendChild(newButton);

    document.querySelector('my-button').appendChild(newButton);*/

    var x = document.createElement("BUTTON");
    x.classList.add('measure-button');
    x.textContent = "Button " + i;
    
    document.body.appendChild(x);
}

