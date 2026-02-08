require('dotenv').config();

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { ObjectId } = require('mongodb');
const { connectDB, getProductsCollection, getUsersCollection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение статики в самом начале (исправляет проблему с CSS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});

app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// --- PAGES ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get(['/auth', '/auth.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'auth.html'));
});

// --- MIDDLEWARES ---
async function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const user = await getUsersCollection().findOne({ _id: new ObjectId(req.session.userId) });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
}

// --- AUTH API ---
app.post('/auth/register', async (req, res) => {
  const { email, password, role } = req.body; 
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

  const users = getUsersCollection();
  if (await users.findOne({ email })) return res.status(400).json({ error: 'User exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  await users.insertOne({ 
    email, 
    passwordHash, 
    role: (role === 'admin') ? 'admin' : 'user'
  });
  res.status(201).json({ message: 'User created' });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await getUsersCollection().findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ error: 'Invalid credentials' });

  req.session.userId = user._id;
  res.json({ message: 'Logged in' });
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

app.get('/auth/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ user: null });
  const user = await getUsersCollection().findOne({ _id: new ObjectId(req.session.userId) });
  if (!user) return res.status(401).json({ user: null });
  res.json({ user: user._id, role: user.role });
});

// --- PRODUCTS API ---
app.get('/api/products', async (req, res) => {
  const products = await getProductsCollection().find({}).toArray();
  res.json(products);
});

app.post('/api/products', requireAdmin, async (req, res) => {
  const { name, price, brand, category, stock, description, imageUrl } = req.body;

  if (!name || price == null) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const result = await getProductsCollection().insertOne({
    name,
    price: Number(price),
    brand: brand || "Generic",
    category: category || "Electronics",
    stock: Number(stock) || 1,
    description: description || "No description",
    imageUrl: imageUrl || "https://via.placeholder.com/400x300/1c1c1e/ffffff?text=ElectroTech",
    createdAt: new Date()
  });
  res.status(201).json({ id: result.insertedId });
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  
  // Создаем объект обновления, исключая _id
  const updateData = { ...req.body };
  delete updateData._id;

  await getProductsCollection().updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: updateData }
  );
  res.json({ message: 'Updated' });
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  await getProductsCollection().deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ message: 'Deleted' });
});

// Получить данные текущего профиля
app.get('/api/profile', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await getUsersCollection().findOne({ _id: new ObjectId(req.session.userId) }, { projection: { passwordHash: 0 } });
  res.json(user);
});

// Обновить ТОЛЬКО свой профиль
app.put('/api/profile', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  
  const { email, password } = req.body;
  const updateData = {};
  
  if (email) updateData.email = email;
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  await getUsersCollection().updateOne(
    { _id: new ObjectId(req.session.userId) },
    { $set: updateData }
  );
  
  res.json({ message: 'Profile updated successfully' });
});