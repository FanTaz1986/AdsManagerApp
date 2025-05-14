# AdsManagerApp

A full-stack Node.js + Express + MongoDB application for managing users and classified ads.

## Features

- User registration and login (JWT authentication)
- Admin and regular user roles
- Create, edit, delete ads (only your own, unless admin)
- Admin can manage all users (edit, delete, recover password, clear all data)
- Responsive UI with modals for all actions
- Search and filter ads and users
- Demo data seed scripts

## Folder Structure

\\\
Passwords/
├── app.js                # Main Express app
├── config/
│   └── db.js             # MongoDB connection
├── controllers/
│   ├── adController.js
│   └── userController.js
├── midleware/
│   ├── adminMiddleware.js
│   ├── authMiddleware.js
│   └── errorHandler.js
├── models/
│   ├── adModel.js
│   └── userModel.js
├── public/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── Routes/
│   ├── adRoutes.js
│   └── userRoutes.js
├── seedAdminandUsers.js  # Seeds demo users (admin + 19 users)
├── seedAds.js            # Seeds demo ads for users
├── package.json
└── .env                  # Your environment variables (not committed)
\\\

## Quick Start

### 1. Clone the repository

\\\sh
git clone https://github.com/FanTaz1986/AdsManagerApp.git
cd AdsManagerApp
\\\

### 2. Install dependencies

\\\sh
npm install
\\\

### 3. Set up environment variables

Create a \.env\ file in the root with:

\\\
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
\\\

### 4. Seed the database (optional, for demo)

\\\sh
node seedAdminandUsers.js
node seedAds.js
\\\

### 5. Start the server

\\\sh
npm start
\\\
or for development with auto-reload:
\\\sh
npm run dev
\\\

### 6. Open the app

Go to [http://localhost:5000](http://localhost:5000) in your browser.

## Default Admin

- **Email:** admin@kitm.lt
- **Password:** kitm

## Usage

- Register as a new user or log in as admin.
- Regular users can create, edit, and delete their own ads.
- Admin can manage all users and ads, recover passwords, and clear user data.
- All actions use modals for confirmation and feedback.

## Scripts

- \seedAdminandUsers.js\ — Seeds 20 demo users (1 admin, 19 regular users)
- \seedAds.js\ — Seeds demo ads for all users

## Technologies

- Node.js, Express, MongoDB, Mongoose
- JWT authentication
- Vanilla JS frontend (no frameworks)
- Responsive CSS

## License

MIT
