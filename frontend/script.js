async function loadUsers() {
    try {
        const res = await fetch('http://localhost:8000/api/users/', {
            headers: {
                'Authorization': 'Basic ' + btoa('admin:adminpassword') // optional if DRF auth is enabled
            }
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const users = await res.json();

        document.getElementById('user-list').innerHTML = users.map(u => `
            <div class="card role-${u.role}">
                <p><strong>${u.username}</strong> - Role: ${u.role.charAt(0).toUpperCase() + u.role.slice(1)}</p>
            </div>
        `).join('');
    } catch (err) {
        document.getElementById('user-list').innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
}

// Load users when page loads
window.onload = loadUsers;
