const API_BASE = 'https://backend-7l9n.onrender.com'; // Your backend
let token = localStorage.getItem('token');
let currentPage = 1;
let casesData = [];

// DOM Elements
const loginSection = document.getElementById('loginSection');
const appSection = document.getElementById('appSection');
const loginForm = document.getElementById('loginForm');
const toast = document.getElementById('toast');
const tabs = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-pane');

function showToast(message, success = true) {
  toast.innerText = message;
  toast.className = `toast align-items-center text-white ${success ? 'bg-success' : 'bg-danger'} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function showSection(section) {
  loginSection.style.display = section === 'login' ? 'block' : 'none';
  appSection.style.display = section === 'app' ? 'block' : 'none';
}

function checkLogin() {
  if (token) {
    showSection('app');
    loadCases();
  } else {
    showSection('login');
  }
}

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value.trim();
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
      showSection('app');
      showToast('Login successful!');
      loadCases();
    } else {
      showToast(data.error || 'Login failed', false);
    }
  } catch (err) {
    showToast('Error during login', false);
  }
};

document.getElementById('logoutBtn').onclick = () => {
  token = null;
  localStorage.removeItem('token');
  showSection('login');
};

async function loadCases() {
  try {
    document.getElementById('casesBody').innerHTML = '<tr><td colspan="13">Loading...</td></tr>';
    const res = await fetch(`${API_BASE}/cases`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    casesData = data;
    renderCases();
  } catch (err) {
    showToast('Failed to load cases', false);
  }
}

function renderCases() {
  const start = (currentPage - 1) * 10;
  const paginated = casesData.slice(start, start + 10);
  const tbody = document.getElementById('casesBody');
  tbody.innerHTML = paginated.map(c => `
    <tr>
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
        <button class="btn btn-sm btn-primary" onclick='editCase("${c.id}")'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick='deleteCase("${c.id}")'>Delete</button>
      </td>
    </tr>`).join('');
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(casesData.length / 10);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `<button class="btn btn-sm ${i === currentPage ? 'btn-dark' : 'btn-light'}" onclick="gotoPage(${i})">${i}</button>`;
  }
}

function gotoPage(page) {
  currentPage = page;
  renderCases();
}

document.getElementById('searchInput').oninput = function () {
  const query = this.value.toLowerCase();
  const filtered = casesData.filter(c => c.name.toLowerCase().includes(query) || c.mobile.includes(query));
  renderCases(filtered);
};

document.getElementById('addBtn').onclick = () => {
  document.getElementById('caseForm').reset();
  document.getElementById('caseId').value = '';
  new bootstrap.Modal(document.getElementById('caseModal')).show();
};

document.getElementById('caseForm').onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const isEdit = !!data.id;
  const url = isEdit ? `${API_BASE}/update-case/${data.id}` : `${API_BASE}/add-case`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    showToast(result.message);
    bootstrap.Modal.getInstance(document.getElementById('caseModal')).hide();
    loadCases();
  } catch (err) {
    showToast(err.message, false);
  }
};

async function editCase(id) {
  const c = casesData.find(c => c.id === id);
  if (!c) return;
  const form = document.getElementById('caseForm');
  for (let key in c) {
    if (form[key]) form[key].value = c[key];
  }
  new bootstrap.Modal(document.getElementById('caseModal')).show();
}

async function deleteCase(id) {
  if (!confirm('Delete this case?')) return;
  try {
    const res = await fetch(`${API_BASE}/delete-case/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    showToast('Deleted successfully');
    loadCases();
  } catch (err) {
    showToast(err.message, false);
  }
}

// Reports Tab
document.getElementById('generateReport').onclick = () => {
  const from = document.getElementById('fromDate').value;
  const to = document.getElementById('toDate').value;
  if (!from || !to) return showToast('Select from & to dates', false);
  const link = document.createElement('a');
  link.href = `${API_BASE}/export-excel?from=${from}&to=${to}&token=${token}`;
  link.download = 'cases.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// Change Password
document.getElementById('changePassForm').onsubmit = async (e) => {
  e.preventDefault();
  const oldPassword = e.target.oldPassword.value;
  const newPassword = e.target.newPassword.value;
  try {
    const res = await fetch(`${API_BASE}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    showToast('Password changed');
    e.target.reset();
  } catch (err) {
    showToast(err.message, false);
  }
};

// Tab Navigation
tabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault();
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('href').replace('#', '');
    tabContents.forEach(c => c.classList.remove('show', 'active'));
    document.getElementById(target).classList.add('show', 'active');
  });
});

checkLogin();
