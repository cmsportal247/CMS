let casesData = [];
let currentPage = 1;
const casesPerPage = 5;
let editingCaseId = null;

// ========== Authentication ==========

function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        showToast("Login successful!");
        initApp();
      } else {
        showToast("Invalid credentials", true);
      }
    })
    .catch(() => showToast("Login error", true));
}

function logout() {
  localStorage.clear();
  location.reload();
}

function checkAndHandleToken() {
  const token = localStorage.getItem("token");
  if (token) initApp();
}

// ========== App Initialization ==========

function initApp() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";
  document.getElementById("welcomeText").innerText =
    "Welcome, " + localStorage.getItem("username");
  document.getElementById("logoutBtn").style.display = "inline-block";
  loadCases();
}

// ========== Toast ==========

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  toastMessage.innerText = message;
  toast.className = "toast show " + (isError ? "bg-danger text-white" : "bg-success text-white");
  setTimeout(() => (toast.className = "toast hide"), 3000);
}

// ========== Case Management ==========

function loadCases() {
  fetch("/api/cases", {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  })
    .then(res => res.json())
    .then(data => {
      casesData = data;
      renderCases();
    })
    .catch(() => showToast("Failed to load cases", true));
}

function renderCases() {
  const start = (currentPage - 1) * casesPerPage;
  const end = start + casesPerPage;
  const filtered = applySearch(true);
  const visibleCases = filtered.slice(start, end);

  const table = document.getElementById("casesTable");
  table.innerHTML = "";

  visibleCases.forEach((c) => {
    const row = `<tr>
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
        <button class="btn btn-sm btn-warning" onclick="editCase('${c._id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCase('${c._id}')">Delete</button>
      </td>
    </tr>`;
    table.innerHTML += row;
  });

  document.getElementById("pageIndicator").innerText =
    `Page ${currentPage} of ${Math.ceil(filtered.length / casesPerPage)}`;
}

function changePage(step) {
  const maxPage = Math.ceil(applySearch(true).length / casesPerPage);
  currentPage = Math.max(1, Math.min(currentPage + step, maxPage));
  renderCases();
}

function applySearch(returnData = false) {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = casesData.filter(c =>
    Object.values(c).some(val => String(val).toLowerCase().includes(query))
  );

  if (!returnData) {
    currentPage = 1;
    renderCases();
  }

  return filtered;
}

function showAddCaseModal() {
  editingCaseId = null;
  document.getElementById("caseModalLabel").innerText = "Add Customer";
  document.getElementById("saveCaseBtn").innerText = "Add";
  document.querySelectorAll("#caseModal input, #caseModal textarea, #caseModal select").forEach(el => el.value = "");
  new bootstrap.Modal(document.getElementById("caseModal")).show();
}

function editCase(id) {
  const caseData = casesData.find(c => c._id === id);
  if (!caseData) return;

  editingCaseId = id;
  document.getElementById("caseModalLabel").innerText = "Edit Customer";
  document.getElementById("saveCaseBtn").innerText = "Update";

  for (let key in caseData) {
    const input = document.getElementById("case" + capitalize(key));
    if (input) input.value = caseData[key];
  }

  new bootstrap.Modal(document.getElementById("caseModal")).show();
}

function saveCase() {
  const newCase = {
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

  const method = editingCaseId ? "PUT" : "POST";
  const url = editingCaseId ? `/api/cases/${editingCaseId}` : "/api/cases";

  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify(newCase),
  })
    .then(res => res.json())
    .then(() => {
      showToast(editingCaseId ? "Case updated!" : "Case added!");
      document.querySelector(".modal.show .btn-close").click();
      loadCases();
    })
    .catch(() => showToast("Error saving case", true));
}

function deleteCase(id) {
  if (!confirm("Delete this case?")) return;

  fetch(`/api/cases/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  })
    .then(() => {
      showToast("Case deleted");
      loadCases();
    })
    .catch(() => showToast("Error deleting case", true));
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== Export & Password Change ==========

function exportToExcel() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  fetch("/api/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ fromDate, toDate }),
  })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cases_report.xlsx";
      link.click();
      showToast("Excel exported!");
    })
    .catch(() => showToast("Export failed", true));
}

function changePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword !== confirmPassword) {
    return showToast("Passwords don't match", true);
  }

  fetch("/api/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("Password changed successfully!");
        document.getElementById("oldPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";
      } else {
        showToast(data.message || "Password change failed", true);
      }
    })
    .catch(() => showToast("Error changing password", true));
}
