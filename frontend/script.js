async function loadReports() {
    try {
        const res = await fetch('http://localhost:8000/api/utilization/');
        const reports = await res.json();

        document.getElementById('report-list').innerHTML = reports.map(r => `
            <div class="card">
                <p class="space">Space: ${r.space_name}</p>
                <p>Date: ${r.date}</p>
                <p>Average Occupancy: ${r.average_occupancy}%</p>
                <p>Peak Occupancy: ${r.peak_occupancy}</p>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('report-list').innerHTML = '<p>Failed to load reports.</p>';
        console.error(error);
    }
}

// Load reports on page load
loadReports();
