const apiUrl = 'https://backend-7l9n.onrender.com';

let currentPage = 1;
const pageSize = 10;

// Login function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            showToast('Login successful!', 'success');
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            document.getElementById('welcomeText').innerText = `Welcome, ${username}`;
            fetchCases();
        } else {
            showToast(data.message || 'Login failed', 'danger');
        }
    })
    .catch(() => showToast('Error during login', 'danger'));
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    showToast('Logged out successfully', 'info');
}

// Fetch cases with pagination and search
function fetchCases(search = '', page = 1) {
    document.getElementById('loadingSpinner').style.display = 'block';

    fetch(`${apiUrl}/cases?search=${search}&page=${page}&limit=${pageSize}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loadingSpinner').style.display = 'none';
        if (data.success) {
            renderCases(data.cases);
            renderPagination(data.totalPages, page);
        } else {
            showToast(data.message || 'Failed to fetch cases', 'danger');
        }
    })
    .catch(() => {
        document.getElementById('loadingSpinner').style.display = 'none';
        showToast('Error fetching cases', 'danger');
    });
}

// Render cases in table
function renderCases(cases) {
    const tableBody = document.getElementById('casesTableBody');
    tableBody.innerHTML = '';

    cases.forEach(caseItem => {
        const row = `
            <tr ondblclick="editCase('${caseItem._id}')">
                <td>${caseItem.dateReceived}</td>
                <td>${caseItem.staff}</td>
                <td>${caseItem.mobile}</td>
                <td>${caseItem.name}</td>
                <td>${caseItem.work}</td>
                <td>${caseItem.info}</td>
                <td>${caseItem.status}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteCase('${caseItem._id}')">Delete</button>
                </td>
            </tr>`;
        tableBody.innerHTML += row;
    });
}

// Render pagination
function renderPagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="fetchCases('', ${i})">${i}</a>
            </li>`;
    }
}

// Add a new case
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

    fetch(`${apiUrl}/add-case`, {
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
            showToast('Case added successfully!', 'success');
            fetchCases();
        } else {
            showToast(data.message || 'Failed to add case', 'danger');
        }
    })
    .catch(() => showToast('Error adding case', 'danger'));
}

// Edit an existing case
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

    fetch(`${apiUrl}/update-case/${id}`, {
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
            showToast('Case updated successfully!', 'success');
            fetchCases();
        } else {
            showToast(data.message || 'Failed to update case', 'danger');
        }
    })
    .catch(() => showToast('Error updating case', 'danger'));
}

// Delete a case
function deleteCase(id) {
    if (!confirm('Are you sure you want to delete this case?')) return;

    fetch(`${apiUrl}/delete-case/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Case deleted successfully!', 'success');
            fetchCases();
        } else {
            showToast(data.message || 'Failed to delete case', 'danger');
        }
    })
    .catch(() => showToast('Error deleting case', 'danger'));
}

// Export to Excel
function exportToExcel() {
    window.open(`${apiUrl}/export-excel?token=${localStorage.getItem('token')}`, '_blank');
}

// Change password
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    fetch(`${apiUrl}/change-password`, {
        method: 'PUT',
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

// Show toast notifications
function showToast(message, type) {
    const toastContainer = document.getElementById('toastContainer');
    toastContainer.innerHTML = `
        <div class="toast show bg-${type} text-white">
            <div class="toast-body">${message}</div>
        </div>`;
    setTimeout(() => toastContainer.innerHTML = '', 3000);
}

// Auto-login check
window.onload = function() {
    if (localStorage.getItem('token')) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        fetchCases();
    }
};
