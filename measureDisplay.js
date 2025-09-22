    const newButton = document.createElement('button');
    newButton.textContent = 'New Button';
    newButton.classList.add('my-button'); // Apply existing CSS class
    newButton.addEventListener('click', () => {
        console.log('New button clicked!');
    });

    document.body.appendChild(newButton);

    document.querySelector('my-button').appendChild(newButton);
