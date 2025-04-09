const API_BASE = 'https://backend-7l9n.onrender.com';
let token = localStorage.getItem('token') || '';
let cases = [];

document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    showMainApp();
    fetchCases();
  } else {
    document.getElementById('loginSection').classList.remove('d-none');
  }
});

function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        token = data.token;
        localStorage.setItem('token', token);
        showMainApp();
        fetchCases();
      } else {
        alert('Login failed');
      }
    });
}

function logout() {
  token = '';
  localStorage.removeItem('token');
  location.reload();
}

function showMainApp() {
  document.getElementById('loginSection').classList.add('d-none');
  document.getElementById('mainApp').classList.remove('d-none');
}

function fetchCases() {
  fetch(`${API_BASE}/cases`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      cases = data;
      displayCases(cases);
    });
}

function displayCases(list) {
  const tbody = document.getElementById('caseTableBody');
  tbody.innerHTML = '';
  list.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.date}</td><td>${item.name}</td><td>${item.mobile}</td><td>${item.altMobile}</td>
      <td>${item.work}</td><td>${item.frameSize}</td><td>${item.frameColor}</td>
      <td>${item.requiredDetails}</td><td>${item.advance}</td><td>${item.actualPrice}</td>
      <td>${item.status}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editCase('${item.id}')">Edit</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function openCaseForm() {
  document.getElementById('caseFormModal').style.display = 'block';
  document.getElementById('caseForm').reset();
  document.getElementById('caseId').value = '';
}

function closeCaseForm() {
  document.getElementById('caseFormModal').style.display = 'none';
}

document.getElementById('caseForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const id = document.getElementById('caseId').value;
  const caseData = {
    date: document.getElementById('date').value,
    name: document.getElementById('name').value,
    mobile: document.getElementById('mobile').value,
    altMobile: document.getElementById('altMobile').value,
    work: document.getElementById('work').value,
    frameSize: document.getElementById('frameSize').value,
    frameColor: document.getElementById('frameColor').value,
    requiredDetails: document.getElementById('requiredDetails').value,
    advance: document.getElementById('advance').value,
    actualPrice: document.getElementById('actualPrice').value,
    status: document.getElementById('status').value,
  };

  const url = id ? `${API_BASE}/cases/${id}` : `${API_BASE}/cases`;
  const method = id ? 'PUT' : 'POST';

  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(caseData),
  })
    .then(res => res.json())
    .then(() => {
      closeCaseForm();
      fetchCases();
    });
});

function editCase(id) {
  const c = cases.find(c => c.id === id);
  if (c) {
    document.getElementById('caseId').value = c.id;
    document.getElementById('date').value = c.date;
    document.getElementById('name').value = c.name;
    document.getElementById('mobile').value = c.mobile;
    document.getElementById('altMobile').value = c.altMobile;
    document.getElementById('work').value = c.work;
    document.getElementById('frameSize').value = c.frameSize;
    document.getElementById('frameColor').value = c.frameColor;
    document.getElementById('requiredDetails').value = c.requiredDetails;
    document.getElementById('advance').value = c.advance;
    document.getElementById('actualPrice').value = c.actualPrice;
    document.getElementById('status').value = c.status;
    openCaseForm();
  }
}

function filterCases() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const filtered = cases.filter(
    c =>
      c.name.toLowerCase().includes(search) ||
      c.mobile.toLowerCase().includes(search)
  );
  displayCases(filtered);
}

function exportExcel() {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  if (!fromDate || !toDate) return alert('Select both dates');

  fetch(`${API_BASE}/cases/report?from=${fromDate}&to=${toDate}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
}

function openPasswordModal() {
  document.getElementById('changePasswordModal').style.display = 'block';
}

function closePasswordModal() {
  document.getElementById('changePasswordModal').style.display = 'none';
}

function changePassword(e) {
  e.preventDefault();
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;

  fetch(`${API_BASE}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || 'Password changed');
      closePasswordModal();
    });
}
