const API_BASE = 'https://backend-7l9n.onrender.com';
let token = localStorage.getItem('token');
let allCases = [];
let currentPage = 1;
const casesPerPage = 10;

// DOM elements
const loginSection = document.getElementById('loginSection');
const mainApp = document.getElementById('mainApp');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');
const spinner = document.getElementById('loadingSpinner');
const pagination = document.getElementById('pagination');

// Show toast
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Show/hide spinner
function toggleSpinner(show) {
  spinner.classList.toggle('hidden', !show);
}

// Toggle views
function toggleAuthViews() {
  const loggedIn = !!token;
  loginSection.classList.toggle('hidden', loggedIn);
  mainApp.classList.toggle('hidden', !loggedIn);
  if (loggedIn) loadCases();
}

// Login
loginBtn.onclick = async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) return showToast('Enter credentials');
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      localStorage.setItem('token', token);
      toggleAuthViews();
      showToast('Login successful');
    } else {
      showToast(data.error || 'Login failed');
    }
  } catch {
    showToast('Server error');
  }
};

// Logout
logoutBtn.onclick = () => {
  token = null;
  localStorage.removeItem('token');
  toggleAuthViews();
};

// Load all cases
async function loadCases() {
  toggleSpinner(true);
  try {
    const res = await fetch(`${API_BASE}/cases`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    allCases = await res.json();
    renderCases();
  } catch {
    showToast('Failed to load cases');
  }
  toggleSpinner(false);
}

// Render paginated cases
function renderCases() {
  const start = (currentPage - 1) * casesPerPage;
  const paginatedCases = allCases.slice(start, start + casesPerPage);
  const tbody = document.getElementById('casesTableBody');
  tbody.innerHTML = '';
  paginatedCases.forEach(c => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="py-1 px-2">${c.date}</td>
      <td class="py-1 px-2">${c.name}</td>
      <td class="py-1 px-2">${c.mobile}</td>
      <td class="py-1 px-2">${c.altMobile}</td>
      <td class="py-1 px-2">${c.work}</td>
      <td class="py-1 px-2">${c.frameSize}</td>
      <td class="py-1 px-2">${c.frameColor}</td>
      <td class="py-1 px-2">${c.requiredDetails}</td>
      <td class="py-1 px-2">${c.advance}</td>
      <td class="py-1 px-2">${c.actualPrice}</td>
      <td class="py-1 px-2">${c.status}</td>
      <td class="py-1 px-2">
        <button onclick='editCase(${JSON.stringify(c)})' class="text-blue-600">Edit</button>
        <button onclick='deleteCase("${c.id}")' class="text-red-600 ml-2">Delete</button>
      </td>`;
    tbody.appendChild(row);
  });
  renderPagination();
}

// Render pagination buttons
function renderPagination() {
  pagination.innerHTML = '';
  const totalPages = Math.ceil(allCases.length / casesPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = `px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200'}`;
    btn.onclick = () => {
      currentPage = i;
      renderCases();
    };
    pagination.appendChild(btn);
  }
}

// Add/Edit case
const openModalBtn = document.getElementById('openAddModalBtn');
const caseModal = document.getElementById('caseModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const caseForm = document.getElementById('caseForm');

openModalBtn.onclick = () => {
  caseForm.reset();
  document.getElementById('caseId').value = '';
  document.getElementById('modalTitle').textContent = 'Add Case';
  caseModal.classList.remove('hidden');
};
closeModalBtn.onclick = () => caseModal.classList.add('hidden');

caseForm.onsubmit = async (e) => {
  e.preventDefault();
  const data = {};
  ['caseId','date','name','mobile','altMobile','work','frameSize','frameColor','requiredDetails','advance','actualPrice','status'].forEach(id => {
    data[id === 'caseId' ? 'id' : id] = document.getElementById(id).value;
  });

  toggleSpinner(true);
  const isEdit = !!data.id;
  try {
    const url = `${API_BASE}/cases${isEdit ? '/' + data.id : ''}`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showToast(isEdit ? 'Case updated' : 'Case added');
      caseModal.classList.add('hidden');
      loadCases();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to save');
    }
  } catch {
    showToast('Server error');
  }
  toggleSpinner(false);
};

// Edit case
window.editCase = (data) => {
  document.getElementById('modalTitle').textContent = 'Edit Case';
  Object.keys(data).forEach(k => {
    if (document.getElementById(k)) {
      document.getElementById(k).value = data[k];
    }
  });
  caseModal.classList.remove('hidden');
};

// Delete case
window.deleteCase = async (id) => {
  if (!confirm('Delete this case?')) return;
  toggleSpinner(true);
  try {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      showToast('Case deleted');
      loadCases();
    } else {
      showToast('Delete failed');
    }
  } catch {
    showToast('Error deleting');
  }
  toggleSpinner(false);
};

// Search filter
document.getElementById('searchInput').oninput = (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allCases.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.mobile.includes(q) ||
    c.altMobile.includes(q)
  );
  allCases = filtered.length ? filtered : allCases;
  currentPage = 1;
  renderCases();
};

// Export
document.getElementById('exportBtn').onclick = async () => {
  const from = document.getElementById('fromDate').value;
  const to = document.getElementById('toDate').value;
  if (!from || !to) return showToast('Select dates');
  try {
    const res = await fetch(`${API_BASE}/export?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Exported');
  } catch {
    showToast('Export failed');
  }
};

// Change password
document.getElementById('changePasswordBtn').onclick = async () => {
  const oldPass = document.getElementById('oldPassword').value;
  const newPass = document.getElementById('newPassword').value;
  if (!oldPass || !newPass) return showToast('Enter both passwords');
  try {
    const res = await fetch(`${API_BASE}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
    });
    const data = await res.json();
    if (res.ok) showToast('Password changed');
    else showToast(data.error || 'Failed');
  } catch {
    showToast('Error changing password');
  }
};

// Tabs
['casesTab', 'reportsTab', 'settingsTab'].forEach(tabId => {
  document.getElementById(tabId).onclick = () => {
    document.querySelectorAll('.tab-content').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    document.getElementById(tabId).classList.add('active-tab');
    const sectionId = tabId.replace('Tab', 'Section');
    document.getElementById(sectionId).classList.remove('hidden');
  };
});

// Init
toggleAuthViews();
