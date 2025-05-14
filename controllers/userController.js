const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');
    res.json(users);
  });

  const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.name = req.body.name || user.name;

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email.toLowerCase() });
      if (emailExists) {
        res.status(400);
        throw new Error('User with this email already exists');
      }
      user.email = req.body.email.toLowerCase();
    }

    if (typeof req.body.isAdmin === 'boolean') {
      user.isAdmin = req.body.isAdmin;
    }

    await user.save();
    res.json({ message: 'User updated', user });
  });
  

  const Ad = require('../models/adModel');

  const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    // Set all ads by this user to have no user (anonymize)
    await Ad.updateMany({ user: user._id }, { $unset: { user: "" } });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  });
  
  const registerUser = asyncHandler(async (req, res) => {
    try {
      const name = req.body.name;
      const email = req.body.email.toLowerCase();
      const password = req.body.password;
      if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
      }
      const userExistsByEmail = await User.findOne({ email });
      if (userExistsByEmail) {
        res.status(400);
        throw new Error('User with this email already exists');
      }
      const userExistsByName = await User.findOne({ name });
      if (userExistsByName) {
        res.status(400);
        throw new Error('User with this name already exists');
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
      if (user) {
        res.status(201).json({
          _id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
        });
      } else {
        res.status(400);
        throw new Error('Invalid user data');
      }
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key error
        res.status(400);
        throw new Error('User with this email or name already exists');
      }
      throw err;
    }
  });
  
  const loginUser = asyncHandler(async (req, res) => {
    const loginField = req.body.email; 
    const password = req.body.password;
  
    let user;
    if (loginField.includes('@')) {
      user = await User.findOne({ email: loginField.toLowerCase() });
    } else {
      user = await User.findOne({ name: loginField });
    }
  
    if (!user) {
      res.status(400);
      throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid credentials');
    }
  });
  
  const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user);
  });
  
  function generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  }
  
  const recoverPassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    const newPassword = `recover${user.name}`;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: `Password reset to recover${user.name}` });
  });

 const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    const { email, password, currentPassword } = req.body;
    if (!currentPassword) {
      res.status(400);
      throw new Error('Current password is required');
    }
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400);
      throw new Error('Current password is incorrect');
    }
    // Check if email is changing and not already in use
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        res.status(400);
        throw new Error('User with this email already exists');
      }
      user.email = email.toLowerCase();
    }
    // Change password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    res.json({ message: 'Profile updated successfully' });
  });

  const clearAllData = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    // Delete all ads by this user
    await Ad.deleteMany({ user: user._id });
    await user.deleteOne();
    res.json({ message: 'User and all their posts deleted' });
  });

  module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getUsers,
    updateUser,
    deleteUser,
    recoverPassword,
    updateProfile,
    clearAllData,
  };