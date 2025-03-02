const apiBaseUrl = "https://backend-7l9n.onrender.com";
let currentPage = 1;
let currentEditingCaseId = null;
let casesList = [];

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
    showToast("Error during login");
  }
}

function logout() {
  localStorage.clear();
  showToast("Logged out");
  checkAndHandleToken();
}

function showSection(sectionId) {
  // Hide all sections
  document.getElementById("casesSection").style.display = "none";
  document.getElementById("reportsSection").style.display = "none";
  document.getElementById("settingsSection").style.display = "none";
  // Show selected section
  document.getElementById(sectionId).style.display = "block";
  // Update nav tabs active class
  document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
  if (sectionId === "casesSection")
    document.querySelector("a[onclick*='casesSection']").classList.add("active");
  if (sectionId === "reportsSection")
    document.querySelector("a[onclick*='reportsSection']").classList.add("active");
  if (sectionId === "settingsSection")
    document.querySelector("a[onclick*='settingsSection']").classList.add("active");
}

// -------------------
// Cases: Fetch, Render, Pagination
// -------------------
async function fetchCases() {
  const token = localStorage.getItem("token");
  const searchQuery = document.getElementById("searchInput").value || "";
  try {
    const response = await fetch(`${apiBaseUrl}/cases?search=${encodeURIComponent(searchQuery)}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      // Backend returns an array of cases
      const cases = await response.json();
      casesList = cases;
      renderCasesTable(casesList);
      document.getElementById("pageIndicator").innerText = `Page ${currentPage}`;
    } else {
      const errorText = await response.text();
      showToast("Failed to fetch cases: " + errorText);
    }
  } catch (error) {
    showToast("Error fetching cases: " + error.message);
  }
}

function renderCasesTable(cases) {
  const tableBody = document.getElementById("casesTable");
  tableBody.innerHTML = "";
  if (cases.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No cases found.</td></tr>`;
    return;
  }
  cases.forEach(c => {
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
}

function changePage(offset) {
  currentPage += offset;
  if (currentPage < 1) currentPage = 1;
  // (Since backend is not paginated, this just refetches all cases.)
  fetchCases();
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
  const token = localStorage.getItem("token");
  const caseData = {
    date: document.getElementById("caseDate").value,
    staff: document.getElementById("caseStaff").value,
    mobile: document.getElementById("caseMobile").value,
    name: document.getElementById("caseName").value,
    work: document.getElementById("caseWork").value,
    info: document.getElementById("caseRemarks").value,
    status: document.getElementById("caseStatus").value
  };
  try {
    let response;
    if (currentEditingCaseId) {
      // Call update endpoint; ensure your backend implements this.
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
    showToast("Error saving case");
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
    showToast("Error deleting case");
  }
}

// -------------------
// Reports: Export to Excel
// -------------------
function exportToExcel() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  window.open(`${apiBaseUrl}/export-excel?from=${fromDate}&to=${toDate}`, "_blank");
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
    showToast("Error changing password");
  }
}
