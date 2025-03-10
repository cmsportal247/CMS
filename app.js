const apiBaseUrl = "https://backend-7l9n.onrender.com";
let currentPage = 1;
let currentEditingCaseId = null;
let casesList = [];
const pageSize = 10; // client-side page size

// -------------------
// Toast Utility
// -------------------
function showToast(message) {
  const toastMsgEl = document.getElementById("toastMessage");
  if (toastMsgEl) {
    toastMsgEl.innerText = message;
    const toastEl = document.getElementById("toast");
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

// -------------------
// Session & Navigation
// -------------------
function checkAndHandleToken() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (token && username) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
    document.getElementById("welcomeText").innerText = `Welcome, ${username}`;
    document.getElementById("logoutBtn").style.display = "inline-block";
    showSection("casesSection");
    fetchCases();
  } else {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
  }
}

async function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  try {
    const response = await fetch(`${apiBaseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      showToast("Login successful!");
      checkAndHandleToken();
    } else {
      showToast(data.error || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    showToast("Error during login: " + error.message);
  }
}

function logout() {
  localStorage.clear();
  showToast("Logged out");
  checkAndHandleToken();
}

function showSection(sectionId) {
  document.getElementById("casesSection").style.display = "none";
  document.getElementById("reportsSection").style.display = "none";
  document.getElementById("settingsSection").style.display = "none";
  document.getElementById(sectionId).style.display = "block";
  document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
  if (sectionId === "casesSection")
    document.querySelector("a[onclick*='casesSection']").classList.add("active");
  if (sectionId === "reportsSection")
    document.querySelector("a[onclick*='reportsSection']").classList.add("active");
  if (sectionId === "settingsSection")
    document.querySelector("a[onclick*='settingsSection']").classList.add("active");
}

// -------------------
// Cases: Fetch, Render, Client-side Pagination & Search
// -------------------
async function fetchCases() {
  const token = localStorage.getItem("token");
  try {
    // Fetch all cases (backend /cases endpoint does a scan)
    const response = await fetch(`${apiBaseUrl}/cases
    `, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      const allCases = await response.json();
      // Apply client-side search filtering
      const searchQuery = document.getElementById("searchInput").value.toLowerCase();
      if (searchQuery) {
        casesList = allCases.filter(c => {
          return (c.date && c.date.toLowerCase().includes(searchQuery)) ||
                 (c.staff && c.staff.toLowerCase().includes(searchQuery)) ||
                 (c.mobile && c.mobile.toLowerCase().includes(searchQuery)) ||
                 (c.name && c.name.toLowerCase().includes(searchQuery)) ||
                 (c.work && c.work.toLowerCase().includes(searchQuery)) ||
                 (c.info && c.info.toLowerCase().includes(searchQuery)) ||
                 (c.status && c.status.toLowerCase().includes(searchQuery));
        });
      } else {
        casesList = allCases;
      }
      renderCasesPage();
    } else {
      const errorText = await response.text();
      showToast("Failed to fetch cases: " + errorText);
      console.error("Fetch cases error:", response.status, errorText);
    }
  } catch (error) {
    console.error("Error fetching cases:", error);
    showToast("Error fetching cases: " + error.message);
  }
}

function renderCasesPage() {
  const tableBody = document.getElementById("casesTable");
  tableBody.innerHTML = "";
  const startIndex = (currentPage - 1) * pageSize;
  const pageCases = casesList.slice(startIndex, startIndex + pageSize);
  if (pageCases.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No cases found.</td></tr>`;
    document.getElementById("pageIndicator").innerText = `Page ${currentPage}`;
    return;
  }
  pageCases.forEach(c => {
    tableBody.innerHTML += `
      <tr>
        <td>${c.date || ""}</td>
        <td>${c.staff || ""}</td>
        <td>${c.mobile || ""}</td>
        <td>${c.name || ""}</td>
        <td>${c.work || ""}</td>
        <td>${c.info || ""}</td>
        <td>${c.status || ""}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editCase('${c.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCase('${c.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
  document.getElementById("pageIndicator").innerText = `Page ${currentPage}`;
}

function changePage(offset) {
  const totalPages = Math.ceil(casesList.length / pageSize);
  currentPage += offset;
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;
  renderCasesPage();
}

function applySearch() {
  currentPage = 1;
  fetchCases();
}

// -------------------
// Validate Case Form
// -------------------
function validateCaseForm() {
  const date = document.getElementById("caseDate").value;
  const staff = document.getElementById("caseStaff").value;
  const mobile = document.getElementById("caseMobile").value;
  const name = document.getElementById("caseName").value;
  if (!date || !staff || !mobile || !name) {
    showToast("Date, Staff, Mobile, and Name are required");
    return false;
  }
  return true;
}

// -------------------
// Cases: Add & Edit Modal
// -------------------
function showAddCaseModal() {
  currentEditingCaseId = null;
  document.getElementById("caseModalLabel").innerText = "Add New Case";
  document.getElementById("caseDate").value = "";
  document.getElementById("caseStaff").value = "";
  document.getElementById("caseMobile").value = "";
  document.getElementById("caseName").value = "";
  document.getElementById("caseWork").value = "";
  document.getElementById("caseRemarks").value = "";
  document.getElementById("caseStatus").value = "Pending";
  const modal = new bootstrap.Modal(document.getElementById("caseModal"));
  modal.show();
}

function editCase(id) {
  const caseToEdit = casesList.find(c => c.id === id);
  if (!caseToEdit) {
    showToast("Case not found");
    return;
  }
  currentEditingCaseId = id;
  document.getElementById("caseModalLabel").innerText = "Edit Case";
  document.getElementById("caseDate").value = caseToEdit.date || "";
  document.getElementById("caseStaff").value = caseToEdit.staff || "";
  document.getElementById("caseMobile").value = caseToEdit.mobile || "";
  document.getElementById("caseName").value = caseToEdit.name || "";
  document.getElementById("caseWork").value = caseToEdit.work || "";
  document.getElementById("caseRemarks").value = caseToEdit.info || "";
  document.getElementById("caseStatus").value = caseToEdit.status || "Pending";
  const modal = new bootstrap.Modal(document.getElementById("caseModal"));
  modal.show();
}

async function saveCase() {
  if (!validateCaseForm()) return;
  
  const token = localStorage.getItem("token");
  const caseData = {
    date: document.getElementById("caseDate").value,
    staff: document.getElementById("caseStaff").value,
    mobile: document.getElementById("caseMobile").value,
    name: document.getElementById("caseName").value,
    work: document.getElementById("caseWork").value,
    info: document.getElementById("caseRemarks").value,
    status: document.getElementById("caseStatus").value,
    pending: false,
    remarks: document.getElementById("caseRemarks").value
  };

  try {
    let response;
    if (currentEditingCaseId) {
      response = await fetch(`${apiBaseUrl}/update-case/${currentEditingCaseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(caseData)
      });
    } else {
      response = await fetch(`${apiBaseUrl}/add-case`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(caseData)
      });
    }
    if (response.ok) {
      showToast(currentEditingCaseId ? "Case updated!" : "Case added!");
      const modalEl = document.getElementById("caseModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      fetchCases();
    } else {
      const errorData = await response.json();
      showToast(errorData.error || "Operation failed");
    }
  } catch (error) {
    console.error("Error saving case:", error);
    showToast("Error saving case: " + error.message);
  }
}

// -------------------
// Cases: Delete
// -------------------
async function deleteCase(id) {
  if (!confirm("Are you sure you want to delete this case?")) return;
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${apiBaseUrl}/delete-case/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      showToast("Case deleted!");
      fetchCases();
    } else {
      showToast("Failed to delete case");
    }
  } catch (error) {
    console.error("Error deleting case:", error);
    showToast("Error deleting case: " + error.message);
  }
}

// -------------------
// Reports: Export to Excel
// -------------------
function exportToExcel() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  if (!fromDate || !toDate) {
    showToast("Please select both From and To dates");
    return;
  }
  const token = localStorage.getItem("token");
  if (!token) {
    showToast("No token found. Please log in again.");
    return;
  }
  // Construct the URL including the token as a query parameter
  const url = `${apiBaseUrl}/export-excel?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}&token=${encodeURIComponent(token)}`;
  console.log("Export URL:", url); // Debug: check URL in browser console
  window.open(url, "_blank");
}


// -------------------
// Settings: Change Password
// -------------------
async function changePassword() {
  const token = localStorage.getItem("token");
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  if (newPassword !== confirmPassword) {
    showToast("New passwords do not match!");
    return;
  }
  try {
    const response = await fetch(`${apiBaseUrl}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    if (response.ok) {
      showToast("Password changed successfully!");
    } else {
      const errorData = await response.json();
      showToast(errorData.error || "Failed to change password");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    showToast("Error changing password: " + error.message);
  }
}
