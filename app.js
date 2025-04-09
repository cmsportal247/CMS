const API_BASE = 'https://backend-7l9n.onrender.com';

// Tabs logic
const tabs = {
  casesTab: 'casesSection',
  reportsTab: 'reportsSection',
  settingsTab: 'settingsSection',
};

Object.keys(tabs).forEach(tabId => {
  document.getElementById(tabId).addEventListener('click', () => {
    Object.keys(tabs).forEach(id => {
      document.getElementById(id).classList.remove('active-tab');
      document.getElementById(tabs[id]).classList.add('hidden');
    });
    document.getElementById(tabId).classList.add('active-tab');
    document.getElementById(tabs[tabId]).classList.remove('hidden');
  });
});

// Token check
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Load iframe content with table
function loadIframeTable() {
  const iframe = document.getElementById('caseTableFrame');
  iframe.srcdoc = `<html><head><style>
    table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f3f4f6; }
    button { padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; }
  </style></head><body><table id="caseTable">
    <thead><tr>
      <th>ID</th><th>Date</th><th>Name</th><th>Mobile</th><th>Alt Mobile</th>
      <th>Work</th><th>Frame Size</th><th>Frame Color</th><th>Details</th>
      <th>Advance</th><th>Actual</th><th>Status</th><th>Actions</th>
    </tr></thead><tbody></tbody></table></body></html>`;
  iframe.onload = loadCases;
}

loadIframeTable();

// Fetch and display cases
function loadCases() {
  fetch(`${API_BASE}/cases`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('caseTableFrame').contentDocument.querySelector('tbody');
      tbody.innerHTML = '';
      data.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${c.id}</td><td>${c.date}</td><td>${c.name}</td><td>${c.mobile}</td><td>${c.altMobile}</td>
          <td>${c.work}</td><td>${c.frameSize}</td><td>${c.frameColor}</td><td>${c.requiredDetails}</td>
          <td>${c.advance}</td><td>${c.actualPrice}</td><td>${c.status}</td>
          <td>
            <button onclick="editCase('${c.id}')">Edit</button>
            <button onclick="deleteCase('${c.id}')" style="background:#ef4444;">Delete</button>
          </td>`;
        tbody.appendChild(tr);
      });
    });
}

// Delete
function deleteCase(id) {
  if (!confirm('Delete this case?')) return;
  fetch(`${API_BASE}/cases/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).then(() => loadCases());
}

// Add/Edit Modal Logic
const caseModal = document.getElementById('caseModal');
document.getElementById('openAddModalBtn').onclick = () => {
  document.getElementById('modalTitle').innerText = 'Add Case';
  document.getElementById('caseForm').reset();
  document.getElementById('caseId').value = '';
  caseModal.classList.remove('hidden');
};

document.getElementById('closeModalBtn').onclick = () => {
  caseModal.classList.add('hidden');
};

window.editCase = (id) => {
  fetch(`${API_BASE}/cases/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(c => {
      document.getElementById('modalTitle').innerText = 'Edit Case';
      Object.keys(c).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = c[key];
      });
      caseModal.classList.remove('hidden');
    });
};

// Save/Add case
document.getElementById('caseForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('caseId').value;
  const formData = {
    date: date.value, name: name.value, mobile: mobile.value, altMobile: altMobile.value,
    work: work.value, frameSize: frameSize.value, frameColor: frameColor.value,
    requiredDetails: requiredDetails.value, advance: advance.value,
    actualPrice: actualPrice.value, status: status.value
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/cases/${id}` : `${API_BASE}/cases`;

  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  })
    .then(res => res.json())
    .then(() => {
      caseModal.classList.add('hidden');
      loadCases();
    });
});

// Export to Excel
document.getElementById('exportBtn').addEventListener('click', () => {
  const from = document.getElementById('fromDate').value;
  const to = document.getElementById('toDate').value;
  if (!from || !to) return alert('Select both dates');
  window.open(`${API_BASE}/cases/export?from=${from}&to=${to}&token=${token}`, '_blank');
});

// Change password
document.getElementById('changePasswordBtn').addEventListener('click', () => {
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
    .then(data => alert(data.message));
});
