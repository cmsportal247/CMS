const apiBaseUrl = "https://backend-7l9n.onrender.com";
let currentPage = 1;
let currentEditingCaseId = null;
let casesList = [];
const pageSize = 10;

// ------------------- Toast Utility -------------------
function showToast(message) {
  const toastMsgEl = document.getElementById("toastMessage");
  if (toastMsgEl) {
    toastMsgEl.innerText = message;
    const toastEl = document.getElementById("toast");
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

// ------------------- Auth -------------------
function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        showToast("Login successful");
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("appSection").style.display = "block";
        document.getElementById("welcomeText").innerText = `Hi, ${username}`;
        document.getElementById("logoutBtn").style.display = "block";
        fetchCases();
      } else {
        showToast("Invalid credentials");
      }
    })
    .catch(() => showToast("Login failed"));
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  document.getElementById("appSection").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("logoutBtn").style.display = "none";
  showToast("Logged out");
}

function checkAndHandleToken() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (token && username) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("appSection").style.display = "block";
    document.getElementById("welcomeText").innerText = `Hi, ${username}`;
    document.getElementById("logoutBtn").style.display = "block";
    fetchCases();
  }
}

// ------------------- Case Management -------------------
function fetchCases() {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${apiBaseUrl}/cases`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      casesList = data.reverse();
      applySearch();
    })
    .catch(() => showToast("Failed to fetch cases"));
}

function renderCases() {
  const table = document.getElementById("casesTable");
  table.innerHTML = "";
  const start = (currentPage - 1) * pageSize;
  const pageItems = casesList.slice(start, start + pageSize);

  pageItems.forEach(c => {
    const row = `
      <tr>
        <td>${c.date || ""}</td>
        <td>${c.name || ""}</td>
        <td>${c.mobile || ""}</td>
        <td>${c.altNo || ""}</td>
        <td>${c.work || ""}</td>
        <td>${c.frameSize || ""}</td>
        <td>${c.frameColor || ""}</td>
        <td>${c.requiredDetails || ""}</td>
        <td>${c.advanceGiven || ""}</td>
        <td>${c.actualPrice || ""}</td>
        <td>${c.status || ""}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editCase('${c._id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCase('${c._id}')">Delete</button>
        </td>
      </tr>
    `;
    table.innerHTML += row;
  });

  document.getElementById("pageIndicator").innerText = `Page ${currentPage}`;
}

function applySearch() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  if (query) {
    casesList = casesList.filter(
      c =>
        c.name?.toLowerCase().includes(query) ||
        c.mobile?.includes(query) ||
        c.altNo?.includes(query)
    );
  } else {
    fetchCases(); // Re-fetch all
    return;
  }
  currentPage = 1;
  renderCases();
}

function changePage(step) {
  const maxPage = Math.ceil(casesList.length / pageSize);
  currentPage += step;
  if (currentPage < 1) currentPage = 1;
  if (currentPage > maxPage) currentPage = maxPage;
  renderCases();
}

function showAddCaseModal() {
  currentEditingCaseId = null;
  document.getElementById("caseModalLabel").innerText = "Add Case";
  document.querySelector("#caseModal form")?.reset();

  [
    "caseDate", "caseName", "caseMobile", "altNo", "caseWork", "caseFrameSize",
    "caseFrameColor", "caseRequiredDetails", "caseAdvanceGiven", "caseActualPrice",
    "caseRemarks", "caseStatus"
  ].forEach(id => document.getElementById(id).value = "");

  new bootstrap.Modal(document.getElementById("caseModal")).show();
}

function editCase(caseId) {
  currentEditingCaseId = caseId;
  const c = casesList.find(x => x._id === caseId);
  if (!c) return;

  document.getElementById("caseModalLabel").innerText = "Edit Case";
  document.getElementById("caseDate").value = c.date || "";
  document.getElementById("caseName").value = c.name || "";
  document.getElementById("caseMobile").value = c.mobile || "";
  document.getElementById("altNo").value = c.altNo || "";
  document.getElementById("caseWork").value = c.work || "";
  document.getElementById("caseFrameSize").value = c.frameSize || "";
  document.getElementById("caseFrameColor").value = c.frameColor || "";
  document.getElementById("caseRequiredDetails").value = c.requiredDetails || "";
  document.getElementById("caseAdvanceGiven").value = c.advanceGiven || "";
  document.getElementById("caseActualPrice").value = c.actualPrice || "";
  document.getElementById("caseRemarks").value = c.remarks || "";
  document.getElementById("caseStatus").value = c.status || "Open";

  new bootstrap.Modal(document.getElementById("caseModal")).show();
}

function saveCase() {
  const token = localStorage.getItem("token");
  if (!token) return showToast("Unauthorized");

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

  const method = currentEditingCaseId ? "PUT" : "POST";
  const url = currentEditingCaseId
    ? `${apiBaseUrl}/cases/${currentEditingCaseId}`
    : `${apiBaseUrl}/cases`;

  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(() => {
      showToast("Case saved");
      bootstrap.Modal.getInstance(document.getElementById("caseModal")).hide();
      currentEditingCaseId = null;
      fetchCases();
    })
    .catch(() => showToast("Save failed"));
}

function deleteCase(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Are you sure?")) return;

  fetch(`${apiBaseUrl}/cases/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(() => {
      showToast("Case deleted");
      fetchCases();
    })
    .catch(() => showToast("Delete failed"));
}

// ------------------- Report Export -------------------
function exportToExcel() {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;
  const token = localStorage.getItem("token");

  if (!from || !to) {
    showToast("Select both dates");
    return;
  }

  fetch(`${apiBaseUrl}/cases/export?from=${from}&to=${to}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${from}_to_${to}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("Report downloaded");
    })
    .catch(() => showToast("Export failed"));
}

// ------------------- Password Change -------------------
function changePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const token = localStorage.getItem("token");

  if (newPassword !== confirmPassword) {
    return showToast("Passwords do not match");
  }

  fetch(`${apiBaseUrl}/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  })
    .then(res => res.json())
    .then(data => showToast(data.message || "Password changed"))
    .catch(() => showToast("Password change failed"));
}

// ------------------- Tabs -------------------
function showSection(sectionId) {
  document.getElementById("casesSection").style.display = "none";
  document.getElementById("reportsSection").style.display = "none";
  document.getElementById("settingsSection").style.display = "none";
  document.getElementById(sectionId).style.display = "block";
}
