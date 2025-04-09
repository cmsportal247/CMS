const API_BASE = 'https://backend-7l9n.onrender.com';

// Check token
const token = localStorage.getItem('token');
if (token) {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('appSection').classList.remove('hidden');
  loadIframeTable();
}

// Login
document.getElementById('loginBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        location.reload();
      } else {
        document.getElementById('loginError').classList.remove('hidden');
      }
    });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  location.reload();
});

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

// Load iframe
function loadIframeTable() {
  const iframe = document.getElementById('caseTableFrame');
  iframe.srcdoc = `
    <html><head><style>
    table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
    th { background-color: #f3f4f6; }
    button { padding: 4px 8px; margin: 2px; border-radius: 4px; color: white; }
    .edit-btn { background: #3b82f6; }
    .delete-btn { background: #ef4444; }
    </style></head><body><table id="caseTable">
    <thead><tr>
      <th>ID</th><th>Date</th><th>Name</th><th>Mobile</th><th>Alt</th>
      <th>Work</th><th>Size</th><th>Color</th><th>Details</th>
      <th>Advance</th><th>Price</th><th>Status</th><th>Actions</th>
    </tr></thead><tbody></tbody></table></body></html>`;
  iframe.onload = loadCases;
}

// Fetch cases
function loadCases() {
  fetch(`${API_BASE}/cases`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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
            <button class="edit-btn" onclick="parent.editCase('${c.id}')">Edit</button>
            <button class="delete-btn" onclick="parent.deleteCase('${c.id}')">Delete</button>
          </td>`;
        tbody.appendChild(tr);
      });
    });
}

// Delete
window.deleteCase = (id) => {
  if (!confirm('Delete this case?')) return;
  fetch(`${API_BASE}/cases/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).then(loadCases);
};

// Add/Edit Modal
const modal = document.getElementById('caseModal');
document.getElementById('openAddModalBtn').onclick = () => {
  document.getElementById('modalTitle').innerText = 'Add Case';
  document.getElementById('caseForm').reset();
  document.getElementById('caseId').value = '';
  modal.classList.remove('hidden');
};
document.getElementById('closeModalBtn').onclick = () => modal.classList.add('hidden');

// Edit
window.editCase = (id) => {
  fetch(`${API_BASE}/cases/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(c => {
      Object.keys(c).forEach(k => {
        const el = document.getElementById(k);
        if (el) el.value = c[k];
      });
      document.getElementById('modalTitle').innerText = 'Edit Case';
      modal.classList.remove('hidden');
    });
};

// Save Case
document.getElementById('caseForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('caseId').value;
  const form = {
    date, name, mobile, altMobile, work,
    frameSize, frameColor, requiredDetails,
    advance, actualPrice, status
  };
  const payload = {};
  for (const k in form) payload[k] = form[k].value;

  fetch(`${API_BASE}/cases${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
    .then(() => {
      modal.classList.add('hidden');
      loadCases();
    });
});

// Export
document.getElementById('exportBtn').onclick = () => {
  const from = document.getElementById('fromDate').value;
  const to = document.getElementById('toDate').value;
  if (!from || !to) return alert('Please select both dates');
  window.open(`${API_BASE}/cases/export?from=${from}&to=${to}&token=${token}`, '_blank');
};

// Change password
document.getElementById('changePasswordBtn').onclick = () => {
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  fetch(`${API_BASE}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ oldPassword, newPassword })
  })
    .then(res => res.json())
    .then(d => alert(d.message));
};
