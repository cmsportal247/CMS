const apiUrl = "https://backend-7l9n.onrender.com";
let token = "";
let currentPage = 1;
let allCases = [];

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const searchBtn = document.getElementById("searchBtn");
  const caseForm = document.getElementById("caseForm");

  token = localStorage.getItem("token");
  if (token) {
    showApp();
    fetchCases();
  } else {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("appSection").style.display = "none";
  }

  loginForm.addEventListener("submit", login);
  logoutBtn.addEventListener("click", logout);
  searchBtn.addEventListener("click", handleSearch);
  caseForm.addEventListener("submit", saveCase);
});

function showApp() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";
}

function login(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  fetch(`${apiUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        token = data.token;
        showApp();
        fetchCases();
      } else {
        alert("Login failed: " + data.error);
      }
    });
}

function logout() {
  localStorage.removeItem("token");
  token = "";
  location.reload();
}

function fetchCases() {
  showLoader(true);
  fetch(`${apiUrl}/cases`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      allCases = data;
      currentPage = 1;
      renderCases();
    })
    .catch(err => {
      alert("Error fetching cases: " + err.message);
    })
    .finally(() => showLoader(false));
}

function renderCases() {
  const caseTableBody = document.getElementById("caseTableBody");
  caseTableBody.innerHTML = "";

  const start = (currentPage - 1) * 10;
  const paginatedCases = allCases.slice(start, start + 10);

  paginatedCases.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.date}</td>
      <td>${c.name}</td>
      <td>${c.mobile}</td>
      <td>${c.altMobile || ""}</td>
      <td>${c.work || ""}</td>
      <td>${c.frameSize || ""}</td>
      <td>${c.frameColor || ""}</td>
      <td>${c.requiredDetails || ""}</td>
      <td>${c.advance || ""}</td>
      <td>${c.actualPrice || ""}</td>
      <td>${c.status || ""}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick='editCase(${JSON.stringify(c)})'>Edit</button>
        <button class="btn btn-sm btn-danger" onclick='deleteCase("${c.id}")'>Delete</button>
      </td>`;
    caseTableBody.appendChild(tr);
  });

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(allCases.length / 10);
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.className = `btn btn-sm ${i === currentPage ? "btn-dark" : "btn-light"}`;
    btn.onclick = () => {
      currentPage = i;
      renderCases();
    };
    paginationContainer.appendChild(btn);
  }
}

function handleSearch() {
  const searchValue = document.getElementById("searchInput").value.toLowerCase();
  if (!searchValue) return renderCases();

  const filtered = allCases.filter(c =>
    c.name.toLowerCase().includes(searchValue) ||
    c.mobile.includes(searchValue) ||
    (c.altMobile && c.altMobile.includes(searchValue)) ||
    (c.work && c.work.toLowerCase().includes(searchValue))
  );

  allCases = filtered;
  currentPage = 1;
  renderCases();
}

function editCase(caseData) {
  const form = document.getElementById("caseForm");
  form.reset();

  Object.entries(caseData).forEach(([key, value]) => {
    if (form.elements[key]) {
      form.elements[key].value = value;
    }
  });

  document.getElementById("caseModal").style.display = "block";
}

function saveCase(e) {
  e.preventDefault();
  const form = e.target;
  const formData = Object.fromEntries(new FormData(form).entries());
  const method = formData.id ? "PUT" : "POST";
  const url = formData.id ? `${apiUrl}/update-case/${formData.id}` : `${apiUrl}/add-case`;

  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      document.getElementById("caseModal").style.display = "none";
      fetchCases();
    })
    .catch(err => alert("Save failed: " + err.message));
}

function deleteCase(id) {
  if (!confirm("Are you sure you want to delete this case?")) return;

  fetch(`${apiUrl}/delete-case/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      fetchCases();
    })
    .catch(err => alert("Delete failed: " + err.message));
}

function showLoader(show) {
  document.getElementById("loader").style.display = show ? "block" : "none";
}
