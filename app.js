const apiUrl = 'https://backend-7l9n.onrender.com';

let currentPage = 1;
const pageSize = 10;

// 🟢 Handle Login
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.token) {
            localStorage.setItem('token', data.token);
            showToast('Login successful!', 'success');
            showSection('casesSection');
            updateNavForAuth(true);
            fetchCases();
        } else {
            showToast(data.message || 'Login failed', 'danger');
        }
    })
    .catch(() => showToast('Error logging in', 'danger'));
}

// 🟢 Handle Logout
function logout() {
    localStorage.removeItem('token');
    showToast('Logged out successfully', 'info');
    updateNavForAuth(false);
    showSection('loginSection');
}

// 🟢 Fetch Customer Cases
function fetchCases(search = '', page = 1) {
    document.getElementById('loadingSpinner').style.display = 'block';

    fetch(`${apiUrl}/CustomerCases?search=${search}&page=${page}&limit=${pageSize}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loadingSpinner').style.display = 'none';
        if (data.success) {
            renderCases(data.cases);
            renderPagination(data.totalPages, page);
        } else {
            showToast(data.message || 'Failed to fetch customer cases', 'danger');
        }
    })
    .catch(() => {
        document.getElementById('loadingSpinner').style.display = 'none';
        showToast('Error fetching customer cases', 'danger');
    });
}

// 🟢 Add a New Case
function addCase() {
    const caseData = {
        dateReceived: document.getElementById('caseDate').value,
        staff: document.getElementById('caseStaff').value,
        mobile: document.getElementById('caseMobile').value,
        name: document.getElementById('caseName').value,
        work: document.getElementById('caseWork').value,
        info: document.getElementById('caseInfo').value,
        status: document.getElementById('caseStatus').value,
    };

    fetch(`${apiUrl}/add-customer-case`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(caseData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Customer case added successfully!', 'success');
            fetchCases();
        } else {
            showToast(data.message || 'Failed to add customer case', 'danger');
        }
    })
    .catch(() => showToast('Error adding customer case', 'danger'));
}

// 🟢 Update Case
function editCase(id) {
    const caseData = {
        dateReceived: prompt('Date Received:'),
        staff: prompt('Staff:'),
        mobile: prompt('Mobile:'),
        name: prompt('Name:'),
        work: prompt('Work:'),
        info: prompt('Information:'),
        status: prompt('Status:')
    };

    fetch(`${apiUrl}/update-customer-case/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(caseData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Customer case updated successfully!', 'success');
            fetchCases();
        } else {
            showToast(data.message || 'Failed to update customer case', 'danger');
        }
    })
    .catch(() => showToast('Error updating customer case', 'danger'));
}

// 🟢 Delete Case
function deleteCase(id) {
    if (!confirm('Are you sure you want to delete this customer case?')) return;

    fetch(`${apiUrl}/delete-customer-case/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Customer case deleted successfully!', 'success');
            fetchCases();
        } else {
            showToast(data.message || 'Failed to delete customer case', 'danger');
        }
    })
    .catch(() => showToast('Error deleting customer case', 'danger'));
}

// 🟢 Export to Excel
function exportToExcel() {
    window.open(`${apiUrl}/export-customer-cases?token=${localStorage.getItem('token')}`, '_blank');
}

// 🟢 Change Password
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    fetch(`${apiUrl}/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Password changed successfully!', 'success');
        } else {
            showToast(data.message || 'Failed to change password', 'danger');
        }
    })
    .catch(() => showToast('Error changing password', 'danger'));
}

// 🟢 UI Helpers
function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.className = `toast toast-${type}`;
    toast.style.display = 'block';
    setTimeout(() => (toast.style.display = 'none'), 3000);
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

function updateNavForAuth(isLoggedIn) {
    document.getElementById('loginNav').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('logoutNav').style.display = isLoggedIn ? 'block' : 'none';
}

// 🟢 Initial Load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showSection('casesSection');
        updateNavForAuth(true);
        fetchCases();
    } else {
        showSection('loginSection');
    }
});
