const BASE_URL = "https://backend-7l9n.onrender.com";
let token = "";
let currentPage = 1;
let cases = [];

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      token = data.token;
      showApp();
      fetchCases();
    } else {
      showToast(data.message || "Login failed", "danger");
    }
  } catch {
    showToast("Network error", "danger");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  token = "";
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("appSection").style.display = "none";
});

function showApp() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";
}

// Fetch cases
async function fetchCases() {
  try {
    document.getElementById("loader").style.display = "block";
    const res = await fetch(`${BASE_URL}/cases`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    cases = data;
    renderCases();
  } catch {
    showToast("Failed to fetch cases", "danger");
  } finally {
    document.getElementById("loader").style.display = "none";
  }
}

// Render cases with pagination
function renderCases() {
  const tbody = document.getElementById("caseTableBody");
  tbody.innerHTML = "";
  const start = (currentPage - 1) * 10;
  const paginated = cases.slice(start, start + 10);
  paginated.forEach((c) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.date}</td><td>${c.name}</td><td>${c.mobile}</td>
      <td>${c.altMobile}</td><td>${c.work}</td><td>${c.frameSize}</td>
      <td>${c.frameColor}</td><td>${c.requiredDetails}</td><td>${c.advance}</td>
      <td>${c.actualPrice}</td><td>${c.status}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick='editCase(${JSON.stringify(c)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick='deleteCase("${c.id}")'>Delete</button>
      </td>`;
    tbody.appendChild(row);
  });
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(cases.length / 10);
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm me-1 ${i === currentPage ? "btn-primary" : "btn-outline-primary"}`;
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderCases();
    };
    container.appendChild(btn);
  }
}

// Add/Edit form
document.getElementById("caseForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = {
    id: document.getElementById("id").value,
    date: document.getElementById("date").value,
    name: document.getElementById("name").value,
    mobile: document.getElementById("mobile").value,
    altMobile: document.getElementById("altMobile").value,
    work: document.getElementById("work").value,
    frameSize: document.getElementById("frameSize").value,
    frameColor: document.getElementById("frameColor").value,
    requiredDetails: document.getElementById("requiredDetails").value,
    advance: document.getElementById("advance").value,
    actualPrice: document.getElementById("actualPrice").value,
    status: document.getElementById("status").value
  };

  const method = formData.id ? "PUT" : "POST";
  const url = formData.id ? `${BASE_URL}/cases/${formData.id}` : `${BASE_URL}/cases`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message || "Case saved", "success");
      fetchCases();
      bootstrap.Modal.getInstance(document.getElementById("caseModal")).hide();
      document.getElementById("caseForm").reset();
    } else {
      showToast(data.message || "Failed", "danger");
    }
  } catch {
    showToast("Network error", "danger");
  }
});

function editCase(c) {
  document.getElementById("id").value = c.id;
  document.getElementById("date").value = c.date;
  document.getElementById("name").value = c.name;
  document.getElementById("mobile").value = c.mobile;
  document.getElementById("altMobile").value = c.altMobile;
  document.getElementById("work").value = c.work;
  document.getElementById("frameSize").value = c.frameSize;
  document.getElementById("frameColor").value = c.frameColor;
  document.getElementById("requiredDetails").value = c.requiredDetails;
  document.getElementById("advance").value = c.advance;
  document.getElementById("actualPrice").value = c.actualPrice;
  document.getElementById("status").value = c.status;
  new bootstrap.Modal(document.getElementById("caseModal")).show();
}

async function deleteCase(id) {
  if (!confirm("Are you sure to delete this case?")) return;
  try {
    const res = await fetch(`${BASE_URL}/cases/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    showToast(data.message || "Deleted", "info");
    fetchCases();
  } catch {
    showToast("Delete failed", "danger");
  }
}

// Export CSV
document.getElementById("exportBtn").addEventListener("click", async () => {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  if (!from || !to) return showToast("Select both dates", "warning");

  try {
    const res = await fetch(`${BASE_URL}/cases/export?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cases.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    showToast("Export failed", "danger");
  }
});

// Change password
document.getElementById("passwordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  try {
    const res = await fetch(`${BASE_URL}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Password changed successfully", "success");
      document.getElementById("passwordForm").reset();
    } else {
      showToast(data.message || "Failed", "danger");
    }
  } catch {
    showToast("Network error", "danger");
  }
});

// Search
document.getElementById("searchBtn").addEventListener("click", () => {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = cases.filter(c =>
    Object.values(c).some(val =>
      String(val).toLowerCase().includes(keyword)
    )
  );
  renderFiltered(filtered);
});

function renderFiltered(filteredList) {
  currentPage = 1;
  cases = filteredList;
  renderCases();
}

// Toast
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
  toast.role = "alert";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// Tab switching
document.querySelectorAll(".nav-link").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});
