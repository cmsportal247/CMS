// app.js
document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('token');
  const baseUrl = "https://backend-7l9n.onrender.com";
  const caseTableBody = document.getElementById('case-table-body');
  const searchInput = document.getElementById('search-input');
  const paginationContainer = document.getElementById('pagination-container');
  const addCaseModal = document.getElementById('add-case-modal');
  const editCaseModal = document.getElementById('edit-case-modal');
  const caseForm = document.getElementById('case-form');
  const reportForm = document.getElementById('report-form');
  const passwordForm = document.getElementById('password-form');
  const loadingSpinner = document.getElementById('loading-spinner');

  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  async function fetchCases(page = 1) {
    toggleLoading(true);
    try {
      const res = await fetch(`${baseUrl}/cases?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cases = await res.json();
      displayCases(cases);
      const totalPages = Math.ceil(cases.total / 10); // Assuming API gives total count
      renderPagination(totalPages, page);
    } catch (error) {
      console.error("Failed to fetch cases:", error);
      alert("Error fetching cases!");
    } finally {
      toggleLoading(false);
    }
  }

  function displayCases(cases) {
    caseTableBody.innerHTML = '';
    cases.forEach(caseItem => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="display: none;">${caseItem.id}</td>
        <td>${caseItem.date}</td>
        <td>${caseItem.name}</td>
        <td>${caseItem.mobile}</td>
        <td>${caseItem.altMobile}</td>
        <td>${caseItem.work}</td>
        <td>${caseItem.frameSize}</td>
        <td>${caseItem.frameColor}</td>
        <td>${caseItem.requiredDetails}</td>
        <td>${caseItem.advance}</td>
        <td>${caseItem.actualPrice}</td>
        <td>${caseItem.status}</td>
        <td>
          <button onclick="editCase('${caseItem.id}')">Edit</button>
          <button onclick="deleteCase('${caseItem.id}')">Delete</button>
        </td>
      `;
      caseTableBody.appendChild(row);
    });
  }

  function renderPagination(totalPages, currentPage) {
    paginationContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.classList.toggle('active', i === currentPage);
      pageButton.addEventListener('click', () => fetchCases(i));
      paginationContainer.appendChild(pageButton);
    }
  }

  function toggleLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
  }

  // Add Case Modal
  document.getElementById('open-add-case-modal').addEventListener('click', () => {
    addCaseModal.style.display = 'block';
  });

  document.getElementById('close-add-case-modal').addEventListener('click', () => {
    addCaseModal.style.display = 'none';
  });

  // Submit Add Case
  caseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(caseForm);
    const data = Object.fromEntries(formData);
    try {
      const res = await fetch(`${baseUrl}/add-case`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      alert(result.message);
      fetchCases(); // Refresh the case list
      addCaseModal.style.display = 'none'; // Close modal
    } catch (error) {
      console.error("Failed to add case:", error);
      alert("Error adding case!");
    }
  });

  // Edit Case Modal
  window.editCase = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const caseData = await res.json();
      document.getElementById('edit-case-id').value = caseData.id;
      document.getElementById('edit-date').value = caseData.date;
      document.getElementById('edit-name').value = caseData.name;
      document.getElementById('edit-mobile').value = caseData.mobile;
      document.getElementById('edit-altMobile').value = caseData.altMobile;
      document.getElementById('edit-work').value = caseData.work;
      document.getElementById('edit-frameSize').value = caseData.frameSize;
      document.getElementById('edit-frameColor').value = caseData.frameColor;
      document.getElementById('edit-requiredDetails').value = caseData.requiredDetails;
      document.getElementById('edit-advance').value = caseData.advance;
      document.getElementById('edit-actualPrice').value = caseData.actualPrice;
      document.getElementById('edit-status').value = caseData.status;
      editCaseModal.style.display = 'block';
    } catch (error) {
      console.error("Failed to fetch case for editing:", error);
      alert("Error fetching case data!");
    }
  };

  document.getElementById('close-edit-case-modal').addEventListener('click', () => {
    editCaseModal.style.display = 'none';
  });

  document.getElementById('edit-case-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const caseData = {
      id: document.getElementById('edit-case-id').value,
      date: document.getElementById('edit-date').value,
      name: document.getElementById('edit-name').value,
      mobile: document.getElementById('edit-mobile').value,
      altMobile: document.getElementById('edit-altMobile').value,
      work: document.getElementById('edit-work').value,
      frameSize: document.getElementById('edit-frameSize').value,
      frameColor: document.getElementById('edit-frameColor').value,
      requiredDetails: document.getElementById('edit-requiredDetails').value,
      advance: document.getElementById('edit-advance').value,
      actualPrice: document.getElementById('edit-actualPrice').value,
      status: document.getElementById('edit-status').value
    };
    try {
      const res = await fetch(`${baseUrl}/update-case/${caseData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(caseData)
      });
      const result = await res.json();
      alert(result.message);
      fetchCases(); // Refresh the case list
      editCaseModal.style.display = 'none'; // Close modal
    } catch (error) {
      console.error("Failed to edit case:", error);
      alert("Error editing case!");
    }
  });

  // Delete Case
  window.deleteCase = async (id) => {
    if (confirm("Are you sure you want to delete this case?")) {
      try {
        const res = await fetch(`${baseUrl}/delete-case/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        alert(result.message);
        fetchCases(); // Refresh the case list
      } catch (error) {
        console.error("Failed to delete case:", error);
        alert("Error deleting case!");
      }
    }
  };

  // Search functionality
  searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    try {
      const res = await fetch(`${baseUrl}/cases?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cases = await res.json();
      displayCases(cases);
    } catch (error) {
      console.error("Failed to search cases:", error);
      alert("Error searching cases!");
    }
  });

  // Export Report
  reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;
    if (!fromDate || !toDate) {
      return alert("Please select both from and to dates");
    }
    window.location.href = `${baseUrl}/export-excel?from=${fromDate}&to=${toDate}&token=${token}`;
  });

  // Change Password
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    try {
      const res = await fetch(`${baseUrl}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const result = await res.json();
      alert(result.message);
    } catch (error) {
      console.error("Failed to change password:", error);
      alert("Error changing password!");
    }
  });

  // Initial Fetch
  fetchCases();
});
