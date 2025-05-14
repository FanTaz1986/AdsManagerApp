require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./midleware/errorHandler');
const path = require('path');

const userRoutes = require('./Routes/userRoutes');
const adRoutes = require('./Routes/adRoutes');

const app = express();
const port = process.env.PORT || 5000;


connectDB();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static('public'));


app.use('/api/users', userRoutes);
app.use('/api/ads', adRoutes);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});