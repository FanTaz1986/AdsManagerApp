const express = require('express');
const { protect } = require('../midleware/authMiddleware');
const { admin } = require('../midleware/adminMiddleware');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers,
  updateUser,
  deleteUser,
  recoverPassword
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, require('../controllers/userController').updateProfile);
router.get('/', protect, admin, getUsers);
router.put('/:id/recover', protect, admin, recoverPassword);
router.delete('/:id/clear', protect, admin, require('../controllers/userController').clearAllData);
router.put('/:id', protect, admin, updateUser);
router.delete('/:id', protect, admin, deleteUser);
module.exports = router;