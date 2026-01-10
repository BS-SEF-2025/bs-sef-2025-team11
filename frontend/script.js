async function loadOccupancy() {
    const res = await fetch('http://localhost:8000/api/spaces/');
    const spaces = await res.json();

    document.getElementById('occupancy-list').innerHTML = spaces.map(s => `
        <div class="card ${s.is_overloaded ? 'overloaded' : ''}">
            <h3>${s.name}</h3>
            <p>${s.current_occupancy} / ${s.capacity}</p>
            ${s.is_overloaded ? '<strong>OVERLOADED</strong>' : ''}
        </div>
    `).join('');
}

loadOccupancy();
setInterval(loadOccupancy, 5000);
