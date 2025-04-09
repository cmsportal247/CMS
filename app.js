const apiBaseUrl = "https://backend-7l9n.onrender.com";
let currentPage = 1;
let currentEditingCaseId = null;
let casesList = [];
const pageSize = 10;

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
// Auth Functions
// -------------------
function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  fetch(`${apiBaseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        showToast("Login successful!");
        showApp();
      } else {
        showToast(data.message || "Login failed");
      }
    })
    .catch(() => showToast("Error logging in"));
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("appSection").style.display = "none";
  document.getElementById("logoutBtn").style.display = "none";
  showToast("Logged out");
}

function checkAndHandleToken() {
  const token = localStorage.getItem("token");
  if (token) {
    showApp();
  }
}

function showApp() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";
  document.getElementById("logoutBtn").style.display = "inline-block";
  document.getElementById("welcomeText").innerText =
    "Welcome, " + localStorage.getItem("username");
  fetchCases();
}

// -------------------
// Case Functions
// -------------------
function fetchCases() {
  const token = localStorage.getItem("token");
  fetch(`${apiBaseUrl}/cases`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      casesList = data;
      renderCases();
    })
    .catch(() => showToast("Error fetching cases"));
}

function renderCases() {
  const tbody = document.getElementById("casesTable");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * pageSize;
  const paginatedCases = casesList.slice(start, start + pageSize);

  paginatedCases.forEach((c) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.date}</td>
      <td>${c.name}</td>
      <td>${c.mobile}</td>
      <td>${c.altNo}</td>
      <td>${c.work}</td>
      <td>${c.frameSize}</td>
      <td>${c.frameColor}</td>
      <td>${c.requiredDetails}</td>
      <td>${c.advanceGiven}</td>
      <td>${c.actualPrice}</td>
      <td>${c.status}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editCase('${c._id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCase('${c._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("pageIndicator").innerText = `Page ${currentPage}`;
}

function changePage(offset) {
  const maxPage = Math.ceil(casesList.length / pageSize);
  currentPage += offset;
  if (currentPage < 1) currentPage = 1;
  if (currentPage > maxPage) currentPage = maxPage;
  renderCases();
}

function applySearch() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = casesList.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      c.mobile.includes(query) ||
      c.work.toLowerCase().includes(query)
  );
  const tbody = document.getElementById("casesTable");
  tbody.innerHTML = "";
  filtered.forEach((c) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.date}</td>
      <td>${c.name}</td>
      <td>${c.mobile}</td>
      <td>${c.altNo}</td>
      <td>${c.work}</td>
      <td>${c.frameSize}</td>
      <td>${c.frameColor}</td>
      <td>${c.requiredDetails}</td>
      <td>${c.advanceGiven}</td>
      <td>${c.actualPrice}</td>
      <td>${c.status}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editCase('${c._id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCase('${c._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showAddCaseModal() {
  currentEditingCaseId = null;
  document.getElementById("caseModalLabel").innerText = "Add Case";
  resetModalFields();
  new bootstrap.Modal(document.getElementById("caseModal")).show();
}

function editCase(id) {
  const c = casesList.find((x) => x._id === id);
  if (c) {
    currentEditingCaseId = id;
    document.getElementById("caseModalLabel").innerText = "Edit Case";
    document.getElementById("caseDate").value = c.date;
    document.getElementById("caseName").value = c.name;
    document.getElementById("caseMobile").value = c.mobile;
    document.getElementById("altNo").value = c.altNo;
    document.getElementById("caseWork").value = c.work;
    document.getElementById("caseFrameSize").value = c.frameSize;
    document.getElementById("caseFrameColor").value = c.frameColor;
    document.getElementById("caseRequiredDetails").value = c.requiredDetails;
    document.getElementById("caseAdvanceGiven").value = c.advanceGiven;
    document.getElementById("caseActualPrice").value = c.actualPrice;
    document.getElementById("caseRemarks").value = c.remarks;
    document.getElementById("caseStatus").value = c.status;
    new bootstrap.Modal(document.getElementById("caseModal")).show();
  }
}

function resetModalFields() {
  document.querySelectorAll("#caseModal input, #caseModal textarea, #caseModal select").forEach(
    (el) => (el.value = "")
  );
}

function saveCase() {
  const data = {
    date: document.getElementById("caseDate").value,
    name: document.getElementById("caseName").value,
    mobile: document.getElementById("caseMobile").value,
    altNo: document.getElementById("altNo").value,
    work: document.getElementById("caseWork").value,
    frameSize: document.getElementById("caseFrameSize").value,
    frameColor: document.getElementById("caseFrameColor").value,
    requiredDetails: document.getElementById("caseRequiredDetails").value,
    advanceGiven: document.getElementById("caseAdvanceGiven").value,
    actualPrice: document.getElementById("caseActualPrice").value,
    remarks: document.getElementById("caseRemarks").value,
    status: document.getElementById("caseStatus").value,
  };

  const token = localStorage.getItem("token");
  const url = currentEditingCaseId
    ? `${apiBaseUrl}/cases/${currentEditingCaseId}`
    : `${apiBaseUrl}/cases`;

  const method = currentEditingCaseId ? "PUT" : "POST";

  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then(() => {
      showToast("Case saved successfully");
      fetchCases();
      bootstrap.Modal.getInstance(document.getElementById("caseModal")).hide();
    })
    .catch(() => showToast("Error saving case"));
}

function deleteCase(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Are you sure to delete this case?")) return;

  fetch(`${apiBaseUrl}/cases/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then(() => {
      showToast("Case deleted successfully");
      fetchCases();
    })
    .catch(() => showToast("Error deleting case"));
}

// -------------------
// Reports & Password
// -------------------
function exportToExcel() {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;
  const token = localStorage.getItem("token");

  window.open(`${apiBaseUrl}/reports?from=${from}&to=${to}&token=${token}`, "_blank");
}

function changePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const token = localStorage.getItem("token");

  if (newPassword !== confirmPassword) {
    showToast("New passwords do not match");
    return;
  }

  fetch(`${apiBaseUrl}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  })
    .then((res) => res.json())
    .then((data) => {
      showToast(data.message || "Password changed");
    })
    .catch(() => showToast("Error changing password"));
}

// -------------------
// Section Switching
// -------------------
function showSection(id) {
  document.getElementById("casesSection").style.display = "none";
  document.getElementById("reportsSection").style.display = "none";
  document.getElementById("settingsSection").style.display = "none";
  document.getElementById(id).style.display = "block";
}
