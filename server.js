
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let items = [
  { id: 1, name: "Notebook", price: 50 },
  { id: 2, name: "Pen", price: 15 }
];
let nextId = 3;

// READ
app.get("/api/items", (req, res) => {
  res.json(items);
});

// CREATE
app.post("/api/items", (req, res) => {
  const { name, price } = req.body;

  if (!name?.trim() || price === "" ||
      price == null || !Number.isFinite(Number(price)) ||
      Number(price) < 0) {
    return res.status(400).json({ error: "Enter a valid name and price" });
  }

  const item = {
    id: nextId++,
    name: name.trim(),
    price: Number(price)
  };

  items.push(item);
  res.status(201).json(item);
});

// UPDATE
app.put("/api/items/:id", (req, res) => {
  const item = items.find(i => i.id === Number(req.params.id));

  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  const { name, price } = req.body;

  if (!name?.trim() || price === "" ||
      price == null || !Number.isFinite(Number(price)) ||
      Number(price) < 0) {
    return res.status(400).json({ error: "Enter a valid name and price" });
  }

  item.name = name.trim();
  item.price = Number(price);
  res.json(item);
});

// DELETE
app.delete("/api/items/:id", (req, res) => {
  const index = items.findIndex(i => i.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "Item not found" });
  }

  items.splice(index, 1);
  res.json({ message: "Item deleted" });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
