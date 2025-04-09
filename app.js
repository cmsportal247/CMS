const API_BASE = 'https://backend-7l9n.onrender.com';
let currentPage = 1;
let allCases = [];
const casesPerPage = 10;

// Auth token check
const token = localStorage.getItem('token');
if (!token) window.location.reload();

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.reload();
});

// Tabs switching
const tabs = {
  casesTab: 'casesSection',
  reportsTab: 'reportsSection',
  settingsTab: 'settingsSection',
};
Object.keys(tabs).forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    Object.values(tabs).forEach(sec => document.getElementById(sec).classList.add('hidden'));
    Object.keys(tabs).forEach(t => document.getElementById(t).classList.remove('active-tab'));
    document.getElementById(tabs[id]).classList.remove('hidden');
    document.getElementById(id).classList.add('active-tab');
  });
});

// Toast
function showToast(message, color = 'green') {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 bg-${color}-500 text-white px-4 py-2 rounded shadow z-50`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Spinner
function toggleLoading(show) {
  document.getElementById('loadingSpinner').classList.toggle('hidden', !show);
}

// Load cases
function loadCases() {
  toggleLoading(true);
  fetch(`${API_BASE}/cases`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.json())
    .then(data => {
      allCases = data;
      showPage(1);
      toggleLoading(false);
    })
    .catch(() => {
      showToast('Failed to load cases', 'red');
      toggleLoading(false);
    });
}

// Show cases per page
function showPage(page) {
  currentPage = page;
  const start = (page - 1) * casesPerPage;
  const pageCases = allCases.slice(start, start + casesPerPage);

  const tbody = document.getElementById('caseTableBody');
  tbody.innerHTML = '';
  pageCases.forEach(c => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${c.date}</td><td>${c.name}</td><td>${c.mobile}</td><td>${c.altMobile}</td>
      <td>${c.work}</td><td>${c.frameSize}</td><td>${c.frameColor}</td><td>${c.requiredDetails}</td>
      <td>${c.advance}</td><td>${c.actualPrice}</td><td>${c.status}</td>
      <td>
        <button onclick="editCase('${c.id}')" class="text-blue-600 font-semibold">Edit</button>
        <button onclick="deleteCase('${c.id}')" class="text-red-600 font-semibold ml-2">Delete</button>
      </td>`;
    tbody.appendChild(row);
  });

  // Pagination buttons
  const pageCount = Math.ceil(allCases.length / casesPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.className = `px-3 py-1 border rounded ${i === page ? 'bg-blue-500 text-white' : 'bg-gray-200'}`;
    btn.addEventListener('click', () => showPage(i));
    pagination.appendChild(btn);
  }
}

// Delete
window.deleteCase = (id) => {
  if (!confirm('Delete this case?')) return;
  toggleLoading(true);
  fetch(`${API_BASE}/cases/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(() => {
      showToast('Deleted successfully');
      loadCases();
    })
    .catch(() => {
      showToast('Delete failed', 'red');
      toggleLoading(false);
    });
};

// Modal control
document.getElementById('openAddModalBtn').onclick = () => {
  document.getElementById('modalTitle').innerText = 'Add Case';
  document.getElementById('caseForm').reset();
  document.getElementById('caseId').value = '';
  document.getElementById('caseModal').classList.remove('hidden');
};
document.getElementById('closeModalBtn').onclick = () =>
  document.getElementById('caseModal').classList.add('hidden');

// Edit case
window.editCase = (id) => {
  const caseData = allCases.find(c => c.id === id);
  if (!caseData) return;
  document.getElementById('modalTitle').innerText = 'Edit Case';
  Object.entries(caseData).forEach(([key, value]) => {
    const el = document.getElementById(key);
    if (el) el.value = value;
  });
  document.getElementById('caseModal').classList.remove('hidden');
};

// Save/Add case
document.getElementById('caseForm').addEventListener('submit', (e) => {
  e.preventDefault();
  toggleLoading(true);
  const id = caseId.value;
  const payload = {
    date: date.value, name: name.value, mobile: mobile.value, altMobile: altMobile.value,
    work: work.value, frameSize: frameSize.value, frameColor: frameColor.value,
    requiredDetails: requiredDetails.value, advance: advance.value,
    actualPrice: actualPrice.value, status: status.value,
  };

  const url = id ? `${API_BASE}/cases/${id}` : `${API_BASE}/cases`;
  const method = id ? 'PUT' : 'POST';

  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
    .then(res => res.json())
    .then(() => {
      showToast(id ? 'Case updated' : 'Case added');
      document.getElementById('caseModal').classList.add('hidden');
      loadCases();
    })
    .catch(() => {
      showToast('Operation failed', 'red');
      toggleLoading(false);
    });
});

// Export
document.getElementById('exportBtn').addEventListener('click', () => {
  const from = fromDate.value;
  const to = toDate.value;
  if (!from || !to) return alert('Select both dates');
  window.open(`${API_BASE}/cases/export?from=${from}&to=${to}&token=${token}`, '_blank');
});

// Change password
document.getElementById('changePasswordBtn').addEventListener('click', () => {
  fetch(`${API_BASE}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    }),
  })
    .then(res => res.json())
    .then(data => showToast(data.message))
    .catch(() => showToast('Password change failed', 'red'));
});

loadCases();
