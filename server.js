require('dotenv').config();
const express = require('express');
const app = express();

// IMPORT ROUTES
const routes = require('./src/routes');

app.use(express.json());

// USE ROUTES
app.use('/', routes);
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
