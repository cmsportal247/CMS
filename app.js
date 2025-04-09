const API_BASE = 'https://backend-7l9n.onrender.com';
let token = localStorage.getItem('token');
let originalCases = []; // the full data from the API
let allCases = [];      // the working copy used for rendering and filtering
let currentPage = 1;
const casesPerPage = 10;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const mainApp = document.getElementById('mainApp');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');
const spinner = document.getElementById('loadingSpinner');
const pagination = document.getElementById('pagination');

// Show toast notification
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Toggle spinner visibility
function toggleSpinner(show) {
  spinner.classList.toggle('hidden', !show);
}

// Toggle login and app views based on auth status
function toggleAuthViews() {
  const loggedIn = !!token;
  loginSection.classList.toggle('hidden', loggedIn);
  mainApp.classList.toggle('hidden', !loggedIn);
  if (loggedIn) {
    loadCases();
  }
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
  } catch (error) {
    console.error('Login error:', error);
    showToast('Server error');
  }
};

// Logout
logoutBtn.onclick = () => {
  token = null;
  localStorage.removeItem('token');
  toggleAuthViews();
};

// Load cases from API
async function loadCases() {
  toggleSpinner(true);
  try {
    const res = await fetch(`${API_BASE}/cases`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      showToast('Error loading cases');
      return;
    }
    originalCases = await res.json();
    // Copy the original cases to our working variable
    allCases = [...originalCases];
    currentPage = 1;
    renderCases();
  } catch (error) {
    console.error('Load cases error:', error);
    showToast('Failed to load cases');
  }
  toggleSpinner(false);
}

// Render paginated cases in the table
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
        <button onclick="editCase('${c.id}')" class="text-blue-600">Edit</button>
        <button onclick="deleteCase('${c.id}')" class="text-red-600 ml-2">Delete</button>
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

// Add/Edit Modal Elements
const openModalBtn = document.getElementById('openAddModalBtn');
const caseModal = document.getElementById('caseModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const caseForm = document.getElementById('caseForm');

// Open Add Modal: reset the form and set title
openModalBtn.onclick = () => {
  caseForm.reset();
  document.getElementById('caseId').value = '';
  document.getElementById('modalTitle').textContent = 'Add Case';
  caseModal.classList.remove('hidden');
};

// Close the modal
closeModalBtn.onclick = () => caseModal.classList.add('hidden');

// Form submission for Add/Edit Case
caseForm.onsubmit = async (e) => {
  e.preventDefault();
  // Gather form data
  const data = {};
  ['caseId','date','name','mobile','altMobile','work','frameSize','frameColor','requiredDetails','advance','actualPrice','status']
    .forEach(id => data[id === 'caseId' ? 'id' : id] = document.getElementById(id).value);
  
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
    const result = await res.json();
    if (res.ok) {
      showToast(isEdit ? 'Case updated' : 'Case added');
      caseModal.classList.add('hidden');
      // Reload cases to update table and master copy
      loadCases();
    } else {
      showToast(result.error || 'Failed to save case');
    }
  } catch (error) {
    console.error('Error saving case:', error);
    showToast('Server error');
  }
  toggleSpinner(false);
};

// Edit case: find the case by id and populate form fields
function editCase(id) {
  const data = originalCases.find(c => c.id === id);
  if (!data) {
    showToast('Case not found');
    return;
  }
  document.getElementById('modalTitle').textContent = 'Edit Case';
  // Populate form fields with corresponding keys
  Object.keys(data).forEach(key => {
    const input = document.getElementById(key);
    if (input) {
      input.value = data[key];
    }
  });
  caseModal.classList.remove('hidden');
}
window.editCase = editCase; // expose globally

// Delete case
async function deleteCase(id) {
  if (!confirm('Delete this case?')) return;
  toggleSpinner(true);
  try {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      showToast('Case deleted');
      // Refresh cases after deletion
      loadCases();
    } else {
      showToast('Delete failed');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Error deleting case');
  }
  toggleSpinner(false);
}
window.deleteCase = deleteCase;

// Search: filter cases without modifying original data
document.getElementById('searchInput').oninput = (e) => {
  const q = e.target.value.toLowerCase();
  if (q) {
    allCases = originalCases.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.altMobile.includes(q)
    );
  } else {
    // Restore full list if search cleared
    allCases = [...originalCases];
  }
  currentPage = 1;
  renderCases();
};

// Export to Excel
document.getElementById('exportBtn').onclick = async () => {
  const from = document.getElementById('fromDate').value;
  const to = document.getElementById('toDate').value;
  if (!from || !to) return showToast('Select dates');
  try {
    const res = await fetch(`${API_BASE}/export?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      return showToast('Export failed');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Exported');
  } catch (error) {
    console.error('Export error:', error);
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
    if (res.ok) {
      showToast('Password changed');
    } else {
      showToast(data.error || 'Failed');
    }
  } catch (error) {
    console.error('Change password error:', error);
    showToast('Error changing password');
  }
};

// Tab navigation
['casesTab', 'reportsTab', 'settingsTab'].forEach(tabId => {
  document.getElementById(tabId).onclick = () => {
    // Hide all tab content sections
    document.querySelectorAll('.tab-content').forEach(sec => sec.classList.add('hidden'));
    // Remove active styling from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    // Activate the clicked tab button and corresponding section
    document.getElementById(tabId).classList.add('active-tab');
    const sectionId = tabId.replace('Tab', 'Section');
    document.getElementById(sectionId).classList.remove('hidden');
  };
});

// Initial view toggle based on login status
toggleAuthViews();
