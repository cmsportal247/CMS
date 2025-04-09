let currentUser = null;
let cases = [];
let currentPage = 1;
const itemsPerPage = 5;
let editingIndex = null;

// LOGIN
function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  if (username === 'admin' && password === '1234') {
    const token = btoa(username + ':' + password);
    localStorage.setItem('cms_token', token);
    localStorage.setItem('cms_user', username);
    showToast('Login successful');
    checkAndHandleToken();
  } else {
    showToast('Invalid credentials');
  }
}

function logout() {
  localStorage.removeItem('cms_token');
  localStorage.removeItem('cms_user');
  document.getElementById('appSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
  showToast('Logged out');
}

// AUTH CHECK
function checkAndHandleToken() {
  const token = localStorage.getItem('cms_token');
  const user = localStorage.getItem('cms_user');
  if (token && user) {
    currentUser = user;
    document.getElementById('welcomeText').textContent = 'Welcome, ' + currentUser;
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    loadCases();
    renderCases();
  } else {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('appSection').style.display = 'none';
  }
}

// TOAST
function showToast(message) {
  const toastEl = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');
  toastMsg.textContent = message;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

// CASE MODAL
function showAddCaseModal(index = null) {
  editingIndex = index;
  document.getElementById('caseModalLabel').textContent = index === null ? 'Add Case' : 'Edit Case';

  const fields = ['Date', 'Name', 'Mobile', 'AltNo', 'Work', 'FrameSize', 'FrameColor', 'RequiredDetails', 'AdvanceGiven', 'ActualPrice', 'Remarks', 'Status'];
  if (index !== null) {
    const c = cases[index];
    fields.forEach(f => {
      const id = 'case' + f;
      document.getElementById(id).value = c[f.toLowerCase()];
    });
  } else {
    fields.forEach(f => {
      const id = 'case' + f;
      document.getElementById(id).value = '';
    });
  }

  new bootstrap.Modal(document.getElementById('caseModal')).show();
}

// SAVE CASE
function saveCase() {
  const newCase = {
    date: document.getElementById('caseDate').value,
    name: document.getElementById('caseName').value,
    mobile: document.getElementById('caseMobile').value,
    altno: document.getElementById('altNo').value,
    work: document.getElementById('caseWork').value,
    framesize: document.getElementById('caseFrameSize').value,
    framecolor: document.getElementById('caseFrameColor').value,
    requireddetails: document.getElementById('caseRequiredDetails').value,
    advancegiven: document.getElementById('caseAdvanceGiven').value,
    actualprice: document.getElementById('caseActualPrice').value,
    remarks: document.getElementById('caseRemarks').value,
    status: document.getElementById('caseStatus').value
  };

  if (editingIndex !== null) {
    cases[editingIndex] = newCase;
    showToast('Case updated');
  } else {
    cases.push(newCase);
    showToast('Case added');
  }

  saveCases();
  renderCases();
  bootstrap.Modal.getInstance(document.getElementById('caseModal')).hide();
}

// DELETE CASE
function deleteCase(index) {
  if (confirm('Are you sure you want to delete this case?')) {
    cases.splice(index, 1);
    saveCases();
    renderCases();
    showToast('Case deleted');
  }
}

// RENDER CASES
function renderCases() {
  const start = (currentPage - 1) * itemsPerPage;
  const filtered = filterCases();
  const paginated = filtered.slice(start, start + itemsPerPage);

  const table = document.getElementById('casesTable');
  table.innerHTML = '';

  if (paginated.length === 0) {
    table.innerHTML = '<tr><td colspan="12" class="text-center">No cases found</td></tr>';
  } else {
    paginated.forEach((c, i) => {
      const row = `
        <tr>
          <td>${c.date}</td>
          <td>${c.name}</td>
          <td>${c.mobile}</td>
          <td>${c.altno}</td>
          <td>${c.work}</td>
          <td>${c.framesize}</td>
          <td>${c.framecolor}</td>
          <td>${c.requireddetails}</td>
          <td>${c.advancegiven}</td>
          <td>${c.actualprice}</td>
          <td>${c.status}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="showAddCaseModal(${cases.indexOf(c)})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteCase(${cases.indexOf(c)})">Delete</button>
          </td>
        </tr>`;
      table.innerHTML += row;
    });
  }

  document.getElementById('pageIndicator').textContent = `Page ${currentPage}`;
}

// PAGINATION
function changePage(direction) {
  const totalPages = Math.ceil(filterCases().length / itemsPerPage);
  currentPage += direction;
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;
  renderCases();
}

// SEARCH
function applySearch() {
  currentPage = 1;
  renderCases();
}

function filterCases() {
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  return cases.filter(c => Object.values(c).some(v => v.toLowerCase().includes(keyword)));
}

// STORAGE
function saveCases() {
  localStorage.setItem('cms_cases', JSON.stringify(cases));
}

function loadCases() {
  const saved = localStorage.getItem('cms_cases');
  if (saved) {
    cases = JSON.parse(saved);
  }
}

// EXPORT TO EXCEL
function exportToExcel() {
  const from = document.getElementById('fromDate').value;
  const to = document.getElementById('toDate').value;
  if (!from || !to) {
    showToast('Select both dates');
    return;
  }

  const filtered = cases.filter(c => c.date >= from && c.date <= to);
  if (filtered.length === 0) {
    showToast('No records found');
    return;
  }

  let csv = 'Date,Name,Mobile,Alt No,Work,Frame Size,Frame Color,Required Details,Advance Given,Actual Price,Remarks,Status\n';
  filtered.forEach(c => {
    csv += `${c.date},${c.name},${c.mobile},${c.altno},${c.work},${c.framesize},${c.framecolor},${c.requireddetails},${c.advancegiven},${c.actualprice},${c.remarks},${c.status}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Cases_${from}_to_${to}.csv`;
  link.click();
}

// CHANGE PASSWORD
function changePassword() {
  const oldPass = document.getElementById('oldPassword').value;
  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;

  if (oldPass !== '1234') {
    showToast('Old password is incorrect');
    return;
  }

  if (!newPass || newPass !== confirmPass) {
    showToast('Passwords do not match');
    return;
  }

  showToast('Password changed (simulated)');
}
