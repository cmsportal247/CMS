document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // Ensure the token is in localStorage
    const caseModal = new bootstrap.Modal(document.getElementById('caseModal'));

    if (!token) {
        alert('Please log in first');
        window.location.href = '/login'; // Redirect to login page if no token
        return;
    }

    // Function to fetch cases with pagination and search
    const fetchCases = async (page = 1, search = '') => {
        const url = `https://backend-7l9n.onrender.com/cases?search=${search}&page=${page}`;

        document.getElementById('loadingSpinner').style.display = 'block'; // Show loading spinner

        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // Add Bearer token to header
                }
            });

            const data = await res.json();
            if (res.ok) {
                const tableBody = document.querySelector('#caseTable tbody');
                tableBody.innerHTML = ''; // Clear table before adding new rows

                data.cases.forEach(caseItem => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${caseItem.name}</td>
                        <td>${caseItem.mobile}</td>
                        <td>${caseItem.work}</td>
                        <td>${caseItem.frameSize}</td>
                        <td>${caseItem.frameColor}</td>
                        <td>${caseItem.requiredDetails}</td>
                        <td>${caseItem.advance}</td>
                        <td>${caseItem.actualPrice}</td>
                        <td>${caseItem.status}</td>
                        <td><button class="btn btn-warning" onclick="editCase(${caseItem.id})">Edit</button></td>
                    `;
                    tableBody.appendChild(row);
                });

                // Handle pagination
                const pagination = document.getElementById('pagination');
                pagination.innerHTML = ''; // Clear pagination controls
                for (let i = 1; i <= data.totalPages; i++) {
                    const pageButton = document.createElement('button');
                    pageButton.classList.add('btn', 'btn-secondary', 'mx-1');
                    pageButton.textContent = i;
                    pageButton.onclick = () => fetchCases(i, search);
                    pagination.appendChild(pageButton);
                }
            } else {
                alert(data.message || 'Failed to fetch cases');
            }
        } catch (error) {
            alert('Error fetching cases: ' + error.message);
        } finally {
            document.getElementById('loadingSpinner').style.display = 'none'; // Hide loading spinner
        }
    };

    // Function to handle case editing
    window.editCase = (id) => {
        // Fetch case data by ID to populate the modal for editing
        const url = `https://backend-7l9n.onrender.com/cases/${id}`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Add Bearer token to header
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.case) {
                // Populate modal fields
                document.getElementById('name').value = data.case.name;
                document.getElementById('mobile').value = data.case.mobile;
                document.getElementById('work').value = data.case.work;
                document.getElementById('frameSize').value = data.case.frameSize;
                document.getElementById('frameColor').value = data.case.frameColor;
                document.getElementById('requiredDetails').value = data.case.requiredDetails;
                document.getElementById('advance').value = data.case.advance;
                document.getElementById('actualPrice').value = data.case.actualPrice;
                document.getElementById('status').value = data.case.status;

                // Open modal
                caseModal.show();
            } else {
                alert('Failed to fetch case data');
            }
        })
        .catch(error => alert('Error fetching case data: ' + error.message));
    };

    // Handle case form submission for Add/Edit
    document.getElementById('caseForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const caseData = {
            name: document.getElementById('name').value,
            mobile: document.getElementById('mobile').value,
            work: document.getElementById('work').value,
            frameSize: document.getElementById('frameSize').value,
            frameColor: document.getElementById('frameColor').value,
            requiredDetails: document.getElementById('requiredDetails').value,
            advance: document.getElementById('advance').value,
            actualPrice: document.getElementById('actualPrice').value,
            status: document.getElementById('status').value
        };

        // Send the updated data to backend
        const caseId = document.getElementById('caseId')?.value; // If editing, fetch the case ID
        const url = caseId ? `https://backend-7l9n.onrender.com/cases/${caseId}` : 'https://backend-7l9n.onrender.com/cases';
        const method = caseId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(caseData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                fetchCases(); // Refresh cases list after adding/editing
                caseModal.hide(); // Close modal
            } else {
                alert(data.message || 'Error saving case');
            }
        })
        .catch(error => alert('Error saving case: ' + error.message));
    });

    // Initial fetch of cases on page load
    fetchCases();

    // Handle search
    document.getElementById('searchButton').addEventListener('click', () => {
        const searchTerm = document.getElementById('searchInput').value;
        fetchCases(1, searchTerm); // Fetch cases based on search
    });
});
