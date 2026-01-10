// Load spaces dynamically
async function loadSpaces() {
    const res = await fetch('http://127.0.0.1:8000/api/spaces/');
    const spaces = await res.json();
    const select = document.getElementById('fault-space');
    spaces.forEach(space => {
        const option = document.createElement('option');
        option.value = space.id;
        option.textContent = space.name;
        select.appendChild(option);
    });
}

// Handle form submission
document.getElementById('fault-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        space: document.getElementById('fault-space').value,
        category: document.getElementById('fault-category').value,
        description: document.getElementById('fault-description').value,
        severity: document.getElementById('fault-severity').value
    };
    const res = await fetch('http://127.0.0.1:8000/api/faults/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        document.getElementById('confirmation').textContent = 'Fault reported successfully!';
        document.getElementById('fault-form').reset();
    } else {
        document.getElementById('confirmation').textContent = 'Error reporting fault.';
    }
};

// Initialize
loadSpaces();
