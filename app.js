const API_BASE = "https://backend-7l9n.onrender.com";
const token = localStorage.getItem("token");

if (!token) window.location.href = "login.html";

const headers = { "Content-Type": "application/json", Authorization: "Bearer " + token };
const spinner = document.getElementById("spinner");
const casesContainer = document.getElementById("casesContainer");

async function fetchCases() {
  spinner.style.display = "block";
  try {
    const res = await fetch(`${API_BASE}/cases`, { headers });
    const data = await res.json();
    showCases(data);
  } catch (err) {
    alert("Error fetching cases");
  } finally {
    spinner.style.display = "none";
  }
}

function showCases(cases) {
  casesContainer.innerHTML = "";
  cases.forEach(c => {
    const div = document.createElement("div");
    div.className = "card mb-2";
    div.innerHTML = `
      <div class="card-body">
        <h5>${c.name} (${c.status})</h5>
        <p>${c.mobile} | ${c.altMobile}</p>
        <p>${c.work} | ${c.frameSize}, ${c.frameColor}</p>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteCase('${c.id}')">Delete</button>
      </div>`;
    casesContainer.appendChild(div);
  });
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

function showAddModal() {
  document.getElementById("addCaseModal").style.display = "block";
}

function hideAddModal() {
  document.getElementById("addCaseModal").style.display = "none";
}

async function addCase(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch(`${API_BASE}/add-case`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok) {
      alert("Case added!");
      hideAddModal();
      fetchCases();
    } else {
      alert(json.error || "Error adding case");
    }
  } catch {
    alert("Failed to add case");
  }
}

async function deleteCase(id) {
  if (!confirm("Delete this case?")) return;
  try {
    await fetch(`${API_BASE}/delete-case/${id}`, {
      method: "DELETE",
      headers,
    });
    fetchCases();
  } catch {
    alert("Delete failed");
  }
}

function filterCases() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const cards = casesContainer.querySelectorAll(".card");
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(keyword) ? "block" : "none";
  });
}

function showReports() {
  document.getElementById("reportsSection").classList.toggle("d-none");
  document.getElementById("settingsSection").classList.add("d-none");
}

function showSettings() {
  document.getElementById("settingsSection").classList.toggle("d-none");
  document.getElementById("reportsSection").classList.add("d-none");
}

async function exportExcel() {
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;
  if (!from || !to) return alert("Select both dates");

  const link = document.createElement("a");
  link.href = `${API_BASE}/export-excel?from=${from}&to=${to}&token=${token}`;
  link.download = "cases.csv";
  link.click();
}

async function changePassword() {
  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  if (!oldPassword || !newPassword) return alert("Fill all fields");
  try {
    const res = await fetch(`${API_BASE}/change-password`, {
      method: "POST",
      headers,
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Password changed!");
      document.getElementById("oldPassword").value = "";
      document.getElementById("newPassword").value = "";
    } else {
      alert(data.error);
    }
  } catch {
    alert("Error changing password");
  }
}

fetchCases();
