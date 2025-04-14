const baseURL = 'https://backend-7l9n.onrender.com';
let token = localStorage.getItem('token') || '';
let currentPage = 1;
const casesPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
  showTab('cases');

  document.getElementById('loginForm').addEventListener('submit', login);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('searchBtn').addEventListener('click', searchCases);
  document.getElementById('caseForm').addEventListener('submit', saveCase);
  document.getElementById('fromDate').addEventListener('change', filterReports);
  document.getElementById('toDate').addEventListener('change', filterReports);
  document.getElementById('exportCSV').addEventListener('click', exportToCSV);
  document.getElementById('changePasswordForm').addEventListener('submit', changePassword);
  document.getElementById('openModalBtn').addEventListener('click', openNewCaseModal);

  document.querySelectorAll('.nav-link').forEach(tab => {
    tab.addEventListener('click', () => {
      showTab(tab.dataset.tab);
    });
  });

  if (token) {
    showApp();
    fetchCases();
  }
});

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  document.getElementById(`${tabName}Tab`).style.display = 'block';

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function showLoader(show) {
  document.getElementById('loader').style.display = show ? 'block' : 'none';
}

function showToast(msg) {
  const toastContainer = document.getElementById('toastContainer');
  toastContainer.innerHTML = `<div class="toast align-items-center text-bg-primary show" role="alert">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`;
}

function login(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  fetch(`${baseURL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        token = data.token;
        localStorage.setItem('token', token);
        showApp();
        fetchCases();
      } else {
        alert('Login failed');
      }
    });
}

function logout() {
  localStorage.removeItem('token');
  token = '';
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('appSection').style.display = 'none';
}

function showApp() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('appSection').style.display = 'block';
}

function fetchCases(page = 1, search = '') {
  currentPage = page;
  showLoader(true);
  fetch(`${baseURL}/cases?search=${search}&page=${page}&limit=${casesPerPage}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      populateTable(data.items);
      setupPagination(data.totalCount);
      showLoader(false);
    });
}

function populateTable(cases) {
  const tbody = document.getElementById('caseTableBody');
  tbody.innerHTML = '';
  cases.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.date}</td>
      <td>${item.name}</td>
      <td>${item.mobile}</td>
      <td>${item.altMobile}</td>
      <td>${item.work}</td>
      <td>${item.frameSize}</td>
      <td>${item.frameColor}</td>
      <td>${item.requiredDetails}</td>
      <td>${item.advance}</td>
      <td>${item.actualPrice}</td>
      <td>${item.status}</td>
      <td><button class="btn btn-sm btn-warning" onclick='editCase(${JSON.stringify(item)})'>Edit</button></td>
    `;
    tbody.appendChild(row);
  });
}

function setupPagination(totalCount) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  const totalPages = Math.ceil(totalCount / casesPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm mx-1 ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}`;
    btn.textContent = i;
    btn.onclick = () => fetchCases(i);
    pagination.appendChild(btn);
  }
}

function openNewCaseModal() {
  document.getElementById('caseForm').reset();
  document.getElementById('id').value = '';
  new bootstrap.Modal(document.getElementById('caseModal')).show();
}

function editCase(data) {
  Object.keys(data).forEach(key => {
    if (document.getElementById(key)) {
      document.getElementById(key).value = data[key];
    }
  });
  new bootstrap.Modal(document.getElementById('caseModal')).show();
}

function saveCase(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const caseData = Object.fromEntries(form.entries());
  const method = caseData.id ? 'PUT' : 'POST';
  const url = caseData.id ? `${baseURL}/cases/${caseData.id}` : `${baseURL}/cases`;

  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(caseData)
  })
    .then(res => res.json())
    .then(() => {
      fetchCases();
      bootstrap.Modal.getInstance(document.getElementById('caseModal')).hide();
      showToast('Case saved successfully');
    });
}

function searchCases() {
  const query = document.getElementById('searchInput').value;
  fetchCases(1, query);
}

// REPORTS
let allCases = [];
function filterReports() {
  const from = document.getElementById('fromDate').value;
  const to = document.getElementById('toDate').value;
  if (!from || !to) return;

  fetch(`${baseURL}/cases`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      allCases = data.items.filter(item => item.date >= from && item.date <= to);
    });
}

function exportToCSV() {
  if (!allCases.length) return;
  const headers = Object.keys(allCases[0]);
  const csvRows = [headers.join(',')];

  allCases.forEach(row => {
    const values = headers.map(h => `"${row[h] || ''}"`);
    csvRows.push(values.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cases.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// SETTINGS
function changePassword(e) {
  e.preventDefault();
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;

  fetch(`${baseURL}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ oldPassword, newPassword })
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        showToast('Password changed successfully');
        e.target.reset();
      } else {
        alert(res.message || 'Error changing password');
      }
    });
}
