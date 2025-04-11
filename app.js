document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'https://backend-7l9n.onrender.com';
  let token = '';

  const showToast = (message) => {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  };

  const toggleSpinner = (show) => {
    const spinner = document.getElementById('loadingSpinner');
    spinner.classList.toggle('hidden', !show);
  };

  const loadCases = async () => {
    toggleSpinner(true);
    try {
      const res = await fetch(`${API_BASE}/cases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cases = await res.json();
      if (res.ok) {
        const tableBody = document.getElementById('casesTableBody');
        tableBody.innerHTML = cases.map((caseData) => `
          <tr>
            <td>${caseData.date}</td>
            <td>${caseData.name}</td>
            <td>${caseData.mobile}</td>
            <td>${caseData.altMobile}</td>
            <td>${caseData.work}</td>
            <td>${caseData.frameSize}</td>
            <td>${caseData.frameColor}</td>
            <td>${caseData.requiredDetails}</td>
            <td>${caseData.advance}</td>
            <td>${caseData.actualPrice}</td>
            <td>${caseData.status}</td>
            <td>
              <button class="bg-yellow-500 text-white px-4 py-1 rounded" onclick="editCase(${caseData.id})">Edit</button>
            </td>
          </tr>
        `).join('');
      } else {
        showToast('Failed to load cases');
      }
    } catch {
      showToast('Server error');
    }
    toggleSpinner(false);
  };

  window.editCase = (id) => {
    fetch(`${API_BASE}/cases/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json()).then((data) => {
      document.getElementById('modalTitle').textContent = 'Edit Case';
      document.getElementById('caseId').value = data.id;
      document.getElementById('date').value = data.date;
      document.getElementById('name').value = data.name;
      document.getElementById('mobile').value = data.mobile;
      document.getElementById('altMobile').value = data.altMobile;
      document.getElementById('work').value = data.work;
      document.getElementById('frameSize').value = data.frameSize;
      document.getElementById('frameColor').value = data.frameColor;
      document.getElementById('requiredDetails').value = data.requiredDetails;
      document.getElementById('advance').value = data.advance;
      document.getElementById('actualPrice').value = data.actualPrice;
      document.getElementById('status').value = data.status;
      caseModal.classList.remove('hidden');
    });
  };

  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const exportBtn = document.getElementById('exportBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const caseModal = document.getElementById('caseModal');
  const caseForm = document.getElementById('caseForm');
  const loginForm = document.getElementById('loginForm');

  openAddModalBtn.onclick = () => {
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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

  exportBtn.onclick = async () => {
    const from = document.getElementById('fromDate').value;
    const to = document.getElementById('toDate').value;
    if (!from || !to) return showToast('Select dates');
    try {
      const res = await fetch(`${API_BASE}/export?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        showToast('Export failed');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Export successful');
    } catch {
      showToast('Server error');
    }
  };

  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        token = data.token;
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('mainSection').classList.remove('hidden');
        loadCases();
      } else {
        showToast(data.error || 'Login failed');
      }
    } catch {
      showToast('Server error');
    }
  };

  logoutBtn.onclick = () => {
    token = '';
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('mainSection').classList.add('hidden');
    showToast('Logged out');
  };
});
