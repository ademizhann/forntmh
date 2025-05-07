const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock-данные вместо MongoDB
let contacts = [];

app.post('/api/contact', (req, res) => {
  const newContact = { ...req.body, id: Date.now() };
  contacts.push(newContact);
  res.json(newContact);
});

app.get('/api/contacts', (req, res) => {
  res.json(contacts);
});

app.listen(5000, () => console.log('Mock server running on http://localhost:5000'));
