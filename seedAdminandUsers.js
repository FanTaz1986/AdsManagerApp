require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

const lithuanianNames = [
  "Mantas", "Eglė", "Tomas", "Aistė", "Lukas", "Gabija", "Dovydas", "Ieva", "Justinas", "Agnė",
  "Paulius", "Rūta", "Karolis", "Monika", "Simonas", "Viktorija", "Dainius", "Jurgita", "Edvinas", "Austėja"
];

async function seedUsers() {
  await mongoose.connect(process.env.MONGO_URI);

  // Remove all existing users to avoid duplicates
  await User.deleteMany({});


  
  const users = [];

    users.push({
    name: 'admin',
    email: 'admin@kitm.lt',
    password: await bcrypt.hash('kitm', 10),
    isAdmin: true
  });

  
  for (let i = 0; i < lithuanianNames.length; i++) {
    const name = lithuanianNames[i];
    users.push({
      name,
      email: `${name.toLowerCase()}@kitm.lt`,
      password: await bcrypt.hash('kitm', 10),
      isAdmin: false
    });
  }

  await User.insertMany(users);
  console.log('Seeded 20 Lithuanian users!');
  mongoose.disconnect();
}

seedUsers();