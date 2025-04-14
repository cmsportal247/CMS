const apiBase = "https://backend-7l9n.onrender.com";
let currentPage = 1;
let totalPages = 1;
let authToken = "";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", loginUser);
  document.getElementById("logoutBtn").addEventListener("click", logoutUser);
  document.getElementById("caseForm").addEventListener("submit", saveCase);
  document.getElementById("searchBtn").addEventListener("click", searchCases);
  document.getElementById("addNewCaseBtn").addEventListener("click", openAddCaseModal);
  document.getElementById("reportExportBtn").addEventListener("click", exportReport);
  document.getElementById("passwordForm").addEventListener("submit", changePassword);

  showTab("casesTab");
});

function loginUser(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  fetch(`${apiBase}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        authToken = data.token;
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("appSection").style.display = "block";
        loadCases();
      } else {
        showToast("Login failed", "danger");
      }
    });
}

function logoutUser() {
  authToken = "";
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("appSection").style.display = "none";
}

function loadCases(page = 1, query = "") {
  document.getElementById("loader").style.display = "block";
  fetch(`${apiBase}/cases?page=${page}&limit=10&search=${query}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  })
    .then(res => res.json())
    .then(data => {
      currentPage = page;
      totalPages = Math.ceil(data.total / 10);
      renderCases(data.cases);
      renderPagination();
      document.getElementById("loader").style.display = "none";
    });
}

function renderCases(cases) {
  const tbody = document.getElementById("caseTableBody");
  tbody.innerHTML = "";
  cases.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.date || ""}</td>
      <td>${c.name || ""}</td>
      <td>${c.mobile || ""}</td>
      <td>${c.altMobile || ""}</td>
      <td>${c.work || ""}</td>
      <td>${c.frameSize || ""}</td>
      <td>${c.frameColor || ""}</td>
      <td>${c.requiredDetails || ""}</td>
      <td>${c.advance || ""}</td>
      <td>${c.actualPrice || ""}</td>
      <td>${c.status || ""}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick='editCase(${JSON.stringify(c)})'>Edit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `btn btn-sm ${i === currentPage ? "btn-primary" : "btn-outline-primary"} me-1`;
    btn.onclick = () => loadCases(i);
    pagination.appendChild(btn);
  }
}

function openAddCaseModal() {
  document.getElementById("caseForm").reset();
  document.getElementById("id").value = "";
  new bootstrap.Modal(document.getElementById("caseModal")).show();
}

function saveCase(e) {
  e.preventDefault();
  const caseData = {};
  [...e.target.elements].forEach(input => {
    if (input.name) caseData[input.name] = input.value;
  });

  const method = caseData.id ? "PUT" : "POST";
  const url = caseData.id ? `${apiBase}/cases/${caseData.id}` : `${apiBase}/cases`;

  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify(caseData)
  })
    .then(res => res.json())
    .then(() => {
      bootstrap.Modal.getInstance(document.getElementById("caseModal")).hide();
      loadCases(currentPage);
      showToast("Case saved successfully", "success");
    });
}

function editCase(data) {
  Object.keys(data).forEach(key => {
    if (document.getElementById(key)) {
      document.getElementById(key).value = data[key];
    }
  });
  new bootstrap.Modal(document.getElementById("caseModal")).show();
}

function searchCases() {
  const query = document.getElementById("searchInput").value;
  loadCases(1, query);
}

function showTab(tab) {
  document.querySelectorAll(".tab-pane").forEach(el => el.style.display = "none");
  document.getElementById(tab).style.display = "block";
}

function exportReport() {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  if (!from || !to) {
    showToast("Select both From and To dates", "warning");
    return;
  }

  fetch(`${apiBase}/cases/export?from=${from}&to=${to}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cases_report.csv";
      a.click();
      showToast("CSV downloaded", "success");
    });
}

function changePassword(e) {
  e.preventDefault();
  const oldPass = document.getElementById("oldPassword").value;
  const newPass = document.getElementById("newPassword").value;

  fetch(`${apiBase}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("Password changed", "success");
        e.target.reset();
      } else {
        showToast("Failed to change password", "danger");
      }
    });
}

function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
  toast.role = "alert";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
