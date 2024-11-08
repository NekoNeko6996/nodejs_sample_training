const startPage = 1;
const maxPerPage = 10;
const showLimit = 10;

function fetchData(page) {
  const url = `http://localhost:3000/api/v1/get/grades?limit=10&page=${page}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      populateTable(data.data);
      createPagination(data.count, maxPerPage, parseInt(data.page), showLimit);
      document.getElementById("show-item-index").textContent = `[${
        page * maxPerPage - (maxPerPage - data.data.length)
      }/${data.count}]`;
    })
    .catch((error) => console.error("Error:", error));
}

fetchData(startPage);

function getScoreByType(scores, type, occurrence = 1) {
  let count = 0;
  for (let score of scores) {
    if (score.type === type) {
      count++;
      if (count === occurrence) {
        return score.score.toFixed(2);
      }
    }
  }
  return "";
}

function populateTable(data) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  data.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
                    <td>${item._id}</td>
                    <td>${item.student_id}</td>
                    <td>${item.class_id}</td>
                    <td>${getScoreByType(item.scores, "exam")}</td>
                    <td>${getScoreByType(item.scores, "quiz")}</td>
                    <td>${getScoreByType(item.scores, "homework", 1)}</td>
                    <td>${getScoreByType(item.scores, "homework", 2)}</td>
                    <td>
                      <button class="btn btn-info btn-sm" onclick="viewDetails('${
                        item._id
                      }')">View</button>
                      <button class="btn btn-warning btn-sm" onclick="editDetails('${
                        item._id
                      }')">Edit</button>
                      <button class="btn btn-danger btn-sm" onclick="deleteEntry('${
                        item._id
                      }')">Delete</button>
                    </td>
                `;

    tableBody.appendChild(row);
  });
}

function viewDetails(id) {
  location.href = `http://localhost:3000/view/grade/${id}`;
}

function editDetails(id) {
  location.href = `http://localhost:3000/edit/grade/${id}`;
}

function deleteEntry(id) {
  if (confirm("Are you sure you want to delete this entry?")) {
    const url = `http://localhost:3000/api/v1/delete/grade/${id}`;
    fetch(url, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          alert("Entry deleted successfully!");
          fetchData(startPage);
        } else {
          alert("Failed to delete entry.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while deleting the entry.");
      });
  }
}

function createPagination(itemCount, maxPerPage, page, showLimit) {
  const totalPages = Math.ceil(itemCount / maxPerPage);
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = ""; // Clear previous pagination buttons

  // Previous Button
  const prevButton = document.createElement("li");
  prevButton.classList.add("page-item");
  prevButton.innerHTML = `<button class="page-link"${
    page === 1 ? " disabled" : ""
  }>Previous</button>`;
  prevButton.addEventListener("click", () => {
    if (page > 1) {
      fetchData(page - 1); // Fetch previous page
    }
  });
  paginationContainer.appendChild(prevButton);

  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > showLimit) {
    const sidePages = Math.floor(showLimit / 2);
    startPage = Math.max(1, page - sidePages);
    endPage = Math.min(totalPages, page + sidePages);

    if (startPage === 1) {
      endPage = showLimit;
    } else if (endPage === totalPages) {
      startPage = totalPages - showLimit + 1;
    }
  }

  if (startPage > 1) {
    addPageButton(paginationContainer, 1, page);
    if (startPage > 2) {
      addEllipsis(paginationContainer);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    addPageButton(paginationContainer, i, page);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      addEllipsis(paginationContainer);
    }
    addPageButton(paginationContainer, totalPages, page);
  }

  // Next Button
  const nextButton = document.createElement("li");
  nextButton.classList.add("page-item");
  nextButton.innerHTML = `<button class="page-link"${
    page === totalPages ? " disabled" : ""
  }>Next</button>`;
  nextButton.addEventListener("click", () => {
    if (page < totalPages) {
      fetchData(page + 1); // Fetch next page
    }
  });
  paginationContainer.appendChild(nextButton);
}

// Helper functions for pagination
function addPageButton(container, pageNum, currentPage) {
  const pageItem = document.createElement("li");
  pageItem.classList.add("page-item");
  if (pageNum === currentPage) pageItem.classList.add("active");
  pageItem.innerHTML = `<button class="page-link">${pageNum}</button>`;
  pageItem.addEventListener("click", () => fetchData(pageNum));
  container.appendChild(pageItem);
}

function addEllipsis(container) {
  const ellipsisItem = document.createElement("li");
  ellipsisItem.classList.add("page-item", "disabled");
  ellipsisItem.innerHTML = `<button class="page-link">...</button>`;
  container.appendChild(ellipsisItem);
}

function redirectToAddGrade() {
  location.href = "http://localhost:3000/add/grade";
}
