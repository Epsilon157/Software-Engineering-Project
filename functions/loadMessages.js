export async function loadVoteData() {
    const res = await fetch('query');
    const data = await res.json();

    const list = document.getElementById('messages');
    (data.results || []).forEach(row => {
        const li = document.createElement('li');
        li.textContent = row.bill_id;
        list.appendChild(li);
    });
}