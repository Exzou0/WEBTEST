//
require('dotenv').config();


const express = require('express');
const path = require('path');
const fs = require('fs');
// NUR
const { ObjectId } = require('mongodb');
const { connectDB, getItemsCollection } = require('./db');


const app = express();
//
const PORT = process.env.PORT || 3000;


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB connect error:', err.message);
    process.exit(1);
  });



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* ---------------- PAGES ---------------- */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

/* ---------------- QUERY & PARAMS ---------------- */
app.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).send('Missing query parameter: q');
  res.send(`<h2>Search result for: ${q}</h2>`);
});

app.get('/item/:id', (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).send('Invalid ID');
  res.send(`<h2>Item ID: ${id}</h2>`);
});

/* ---------------- FORM (POST) ---------------- */
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).send('All fields are required');

  const data = { name, email, message, date: new Date() };
  fs.writeFile('messages.json', JSON.stringify(data, null, 2), (err) => {
    if (err) return res.status(500).send('Failed to save message');
    res.send(`<h2>Thanks, ${name}! Your message has been saved.</h2>`);
  });
});

/* ---------------- API INFO ---------------- */
app.get('/api/info', (req, res) => {
  res.json({
    project: 'Express Assignment',
    participant: 'Participant 2'
  });
});

/* ---------------- API + VALIDATION ---------------- */
function parsePrice(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function validateItemBody(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const price = parsePrice(body.price);

  if (!name) return { ok: false, error: 'Missing or empty field: name' };
  if (price === null) return { ok: false, error: 'Missing or invalid field: price' };
  if (price < 0) return { ok: false, error: 'price must be >= 0' };

  return { ok: true, data: { name, price } };
}


// ===== CRUD API /api/items =====

// GET all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await getItemsCollection().find({}).toArray();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET item by id
app.get('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const item = await getItemsCollection().findOne({ _id: new ObjectId(id) });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE item
app.post('/api/items', async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await getItemsCollection().insertOne({
      name,
      price,
      createdAt: new Date()
    });

    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE item
app.put('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!ObjectId.isValid(id) || !name || price === undefined) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const result = await getItemsCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, price } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ message: 'Item updated' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const result = await getItemsCollection().deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});



// API 404
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

/* ---------------- PAGE 404 ---------------- */
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

