// Constants
const BASE_URL = 'https://backend-7l9n.onrender.com';
let token = '';
let currentPage = 1;
const casesPerPage = 10;
let allCases = [];

// DOM Elements
const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const loader = document.getElementById('loader');
const toastContainer = document.getElementById('toastContainer');
const caseForm = document.getElementById('caseForm');
const caseModalEl = document.getElementById('caseModal');
const caseModal = new bootstrap.Modal(caseModalEl);
const caseTableBody = document.getElementById('caseTableBody');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      token = data.token;
      showToast('Login successful');
      loginSection.style.display = 'none';
      appSection.style.display = 'block';
      fetchCases();
    } else {
      showToast(data.message || 'Login failed');
    }
  } catch (err) {
    showToast('Server error during login');
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  token = '';
  loginSection.style.display = 'block';
  appSection.style.display = 'none';
});

// Fetch Cases
async function fetchCases() {
  loader.style.display = 'inline-block';
  try {
    const res = await fetch(`${BASE_URL}/cases`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      allCases = data.reverse();
      renderTable();
    } else {
      showToast(data.message || 'Failed to load cases');
    }
  } catch {
    showToast('Failed to fetch cases');
  } finally {
    loader.style.display = 'none';
  }
}

// Render Cases
function renderTable() {
  const searchQuery = searchInput.value.toLowerCase();
  const filteredCases = allCases.filter(c =>
    Object.values(c).some(val =>
      String(val).toLowerCase().includes(searchQuery)
    )
  );

  const start = (currentPage - 1) * casesPerPage;
  const paginated = filteredCases.slice(start, start + casesPerPage);
  caseTableBody.innerHTML = '';

  for (const c of paginated) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${c.date}</td>
      <td>${c.name}</td>
      <td>${c.mobile}</td>
      <td>${c.altMobile}</td>
      <td>${c.work}</td>
      <td>${c.frameSize}</td>
      <td>${c.frameColor}</td>
      <td>${c.requiredDetails}</td>
      <td>${c.advance}</td>
      <td>${c.actualPrice}</td>
      <td>${c.status}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick='editCase("${c.id}")'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick='deleteCase("${c.id}")'>Delete</button>
      </td>
    `;
    caseTableBody.appendChild(row);
  }

  // Pagination
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);
  pagination.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm me-1 ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}`;
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderTable();
    };
    pagination.appendChild(btn);
  }
}

// Add New Case
document.getElementById('addCaseBtn').addEventListener('click', () => {
  caseForm.reset();
  document.getElementById('id').value = '';
  caseModal.show();
});

// Submit Case
caseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(caseForm).entries());
  const method = formData.id ? 'PUT' : 'POST';
  const url = `${BASE_URL}/cases${formData.id ? '/' + formData.id : ''}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok) {
      caseModal.hide();
      showToast(formData.id ? 'Case updated' : 'Case added');
      fetchCases();
    } else {
      showToast(data.message || 'Error saving case');
    }
  } catch {
    showToast('Server error while saving case');
  }
});

// Edit Case
window.editCase = (id) => {
  const c = allCases.find(x => x.id === id);
  for (const key in c) {
    const el = document.getElementById(key);
    if (el) el.value = c[key];
  }
  caseModal.show();
};

// Delete Case
window.deleteCase = async (id) => {
  if (!confirm('Are you sure you want to delete this case?')) return;
  try {
    const res = await fetch(`${BASE_URL}/cases/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Case deleted');
      fetchCases();
    } else {
      showToast(data.message || 'Delete failed');
    }
  } catch {
    showToast('Server error during delete');
  }
};

// Search
searchInput.addEventListener('input', () => {
  currentPage = 1;
  renderTable();
});

// Toast
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast align-items-center text-white bg-primary border-0 show mb-2';
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Tabs
document.querySelectorAll('#mainTabs .nav-link').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab-section').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('#mainTabs .nav-link').forEach(t => t.classList.remove('active'));
    document.getElementById(tab.dataset.tab).classList.add('active');
    tab.classList.add('active');
  });
});

// Export CSV
document.getElementById('exportBtn').addEventListener('click', async () => {
  const from = document.getElementById('fromDate').value;
  const to = document.getElementById('toDate').value;

  try {
    const res = await fetch(`${BASE_URL}/cases/export?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cases_${from}_to_${to}.csv`;
    a.click();
  } catch {
    showToast('Failed to export CSV');
  }
});

// Change Password
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;

  try {
    const res = await fetch(`${BASE_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    showToast(data.message || 'Password changed');
  } catch {
    showToast('Error changing password');
  }
});
