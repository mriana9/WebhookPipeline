interface Job {
  id: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

const API_URL = 'http://localhost:3000/jobs';

async function fetchAndRenderJobs() {
  try {
    const response = await fetch(API_URL);
    const jobs: Job[] = await response.json();

    updateStats(jobs);
    renderTable(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
  }
}

function updateStats(jobs: Job[]) {
  const stats = {
    completed: jobs.filter((j) => j.status === 'completed').length,
    pending: jobs.filter((j) => j.status === 'pending' || j.status === 'processing').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  };

  document.getElementById('stats-completed')!.innerText = stats.completed.toString();
  document.getElementById('stats-pending')!.innerText = stats.pending.toString();
  document.getElementById('stats-failed')!.innerText = stats.failed.toString();
}

function renderTable(jobs: Job[]) {
  const tableBody = document.getElementById('jobs-table-body')!;
  tableBody.innerHTML = ''; // Clear previous rows

  jobs.forEach((job) => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-rose-50/20 transition-colors';

    const statusClass =
      job.status === 'completed'
        ? 'bg-green-100 text-green-700'
        : job.status === 'failed'
          ? 'bg-red-100 text-red-700'
          : 'bg-yellow-100 text-yellow-700';

    row.innerHTML = `
            <td class="px-6 py-4 text-xs font-mono text-slate-400">${job.id.substring(0, 8)}...</td>
            <td class="px-6 py-4 max-w-xs truncate text-slate-600">${JSON.stringify(job.payload)}</td>
            <td class="px-6 py-4 text-center">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">${job.status}</span>
            </td>
            <td class="px-6 py-4 text-slate-500">${new Date(job.createdAt).toLocaleTimeString()}</td>
        `;
    tableBody.appendChild(row);
  });
}

async function deletePipeline(id: string) {
  if (confirm('هل أنتِ متأكدة من حذف هذا المسار؟')) {
    await fetch(`http://localhost:3000/pipelines/${id}`, { method: 'DELETE' });
    fetchAndRenderJobs(); 
  }
}

// Initial fetch and set interval for live updates
fetchAndRenderJobs();
setInterval(fetchAndRenderJobs, 5000);
