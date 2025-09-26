const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('voteid');

document.getElementById('info').textContent = 'Currently viewing information about VoteID = ' + id;