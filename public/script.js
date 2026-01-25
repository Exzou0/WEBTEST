(function () {

const statusDiv = document.getElementById("status");
const itemsBody = document.getElementById("itemsBody");

const itemForm = document.getElementById("itemForm");
const itemIdInput = document.getElementById("itemId");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");

const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const refreshBtn = document.getElementById("refreshBtn");

if (!itemForm || !itemsBody || !refreshBtn) {
  console.warn("CRUD UI not found on this page, script skipped.");
  return;
}



// show status message
function setStatus(msg, type) {
  statusDiv.textContent = msg;
  statusDiv.className = "status " + (type === "err" ? "err" : "ok");
  statusDiv.style.display = "block";
  setTimeout(() => (statusDiv.style.display = "none"), 3000);
}

// helper: fetch with error handling
async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();

  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = (data && data.error) ? data.error : `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// small protection for rendering
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// render table
function renderItems(items) {
  itemsBody.innerHTML = "";

  if (!items || items.length === 0) {
    itemsBody.innerHTML = `<tr><td colspan="4">No items found</td></tr>`;
    return;
  }

  for (const item of items) {
    const id = item.id ?? item._id; // supports both
    const name = item.name ?? "";
    const price = item.price ?? "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${id}</td>
      <td>${escapeHtml(name)}</td>
      <td>${price}</td>
      <td>
        <button class="secondary" data-action="edit" data-id="${id}">Edit</button>
        <button class="danger" data-action="delete" data-id="${id}">Delete</button>
      </td>
    `;
    itemsBody.appendChild(tr);
  }
}

// load items (READ)
async function loadItems() {
  try {
    const items = await fetchJson("/api/items");
    renderItems(items);
  } catch (err) {
    setStatus(err.message, "err");
    itemsBody.innerHTML = `<tr><td colspan="4">Error loading items</td></tr>`;
  }
}

// reset form to Create mode
function resetForm() {
  itemIdInput.value = "";
  nameInput.value = "";
  priceInput.value = "";
  formTitle.textContent = "Create Item";
  submitBtn.textContent = "Create";
  cancelBtn.style.display = "none";
}

// switch to Edit mode
function startEdit({ id, name, price }) {
  itemIdInput.value = id;
  nameInput.value = name;
  priceInput.value = price;
  formTitle.textContent = "Update Item";
  submitBtn.textContent = "Update";
  cancelBtn.style.display = "inline-block";
}

// CREATE / UPDATE (form submit)
itemForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = itemIdInput.value.trim();
  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  if (!name || Number.isNaN(price)) {
    setStatus("Enter valid name and price", "err");
    return;
  }

  try {
    submitBtn.disabled = true;

    if (!id) {
      // CREATE
      await fetchJson("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price })
      });
      setStatus("Created successfully", "ok");
    } else {
      // UPDATE
      await fetchJson(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price })
      });
      setStatus("Updated successfully", "ok");
    }

    resetForm();
    await loadItems();
  } catch (err) {
    setStatus(err.message, "err");
  } finally {
    submitBtn.disabled = false;
  }
});

// cancel edit
cancelBtn.addEventListener("click", resetForm);

// refresh
refreshBtn.addEventListener("click", loadItems);

// click buttons in table (EDIT / DELETE)
itemsBody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === "edit") {
    const row = btn.closest("tr");
    const name = row.children[1].textContent;
    const price = row.children[2].textContent;
    startEdit({ id, name, price });
  }

  if (action === "delete") {
    const ok = confirm(`Delete item ${id}?`);
    if (!ok) return;

    try {
      btn.disabled = true;
      await fetchJson(`/api/items/${id}`, { method: "DELETE" });
      setStatus("Deleted successfully", "ok");
      await loadItems();
    } catch (err) {
      setStatus(err.message, "err");
    } finally {
      btn.disabled = false;
    }
  }
});

// initial load
loadItems();
})();
