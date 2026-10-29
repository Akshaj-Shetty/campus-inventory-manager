
const form = document.getElementById("itemForm");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const list = document.getElementById("itemList");
const count = document.getElementById("count");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

let editingId = null;

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

async function loadItems() {
  try {
    const items = await request("/api/items");
    list.replaceChildren();
    count.textContent = `${items.length} items`;

    if (items.length === 0) {
      const row = list.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 4;
      cell.textContent = "No items yet. Add your first item!";
      return;
    }

    items.forEach(item => {
      const row = list.insertRow();

      [item.id, item.name, `₹${item.price.toFixed(2)}`]
        .forEach(value => {
          row.insertCell().textContent = value;
        });

      const actions = row.insertCell();

      const edit = document.createElement("button");
      edit.textContent = "Edit";
      edit.className = "edit";
      edit.onclick = () => startEdit(item);

      const del = document.createElement("button");
      del.textContent = "Delete";
      del.className = "delete";
      del.onclick = () => deleteItem(item.id);

      actions.append(edit, del);
    });
  } catch (error) {
    message.textContent = error.message;
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const price = priceInput.value;

  if (!name || price === "" || Number(price) < 0 ||
      !Number.isFinite(Number(price))) {
    message.textContent = "Enter a valid name and price.";
    return;
  }

  const isEditing = editingId !== null;
  const url = isEditing
    ? `/api/items/${editingId}`
    : "/api/items";

  try {
    await request(url, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: Number(price) })
    });

    message.textContent = isEditing ? "Item updated!" : "Item added!";
    resetForm();
    await loadItems();
  } catch (error) {
    message.textContent = error.message;
  }
});

function startEdit(item) {
  editingId = item.id;
  nameInput.value = item.name;
  priceInput.value = item.price;
  formTitle.textContent = "Edit item";
  submitBtn.textContent = "Save changes";
  cancelBtn.hidden = false;
  nameInput.focus();
}

function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = "Add a new item";
  submitBtn.textContent = "+ Add item";
  cancelBtn.hidden = true;
}

cancelBtn.addEventListener("click", resetForm);

async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  try {
    await request(`/api/items/${id}`, { method: "DELETE" });
    message.textContent = "Item deleted!";
    if (editingId === id) resetForm();
    await loadItems();
  } catch (error) {
    message.textContent = error.message;
  }
}

loadItems();
