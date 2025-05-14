const asyncHandler = require('express-async-handler');
const Ad = require('../models/adModel');

// @desc    Create new ad
// @route   POST /api/ads
// @access  Public or Private (add auth as needed)
const createAd = asyncHandler(async (req, res) => {
  const { title, description, price } = req.body;
  if (!title || !description || !price) {
    res.status(400);
    throw new Error('Please add all required fields');
  }
  const ad = await Ad.create({ title, description, price, user: req.user._id });
  res.status(201).json(ad);
});

// @desc    Get all ads
// @route   GET /api/ads
// @access  Public
const getAds = asyncHandler(async (req, res) => {
  const ads = await Ad.find().populate('user', 'name email');
  res.json(ads);
});

// @desc    Get ad by ID
// @route   GET /api/ads/:id
// @access  Public
const getAdById = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id).populate('user', 'name email');
  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }
  res.json(ad);
});

// @desc    Update ad
// @route   PUT /api/ads/:id
// @access  Public or Private (add auth as needed)
const updateAd = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }
  // Only ad creator or admin can update
  if ((!ad.user || ad.user.toString() !== req.user._id.toString()) && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this ad');
  }
  const updatedAd = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedAd);
});

// @desc    Delete ad
// @route   DELETE /api/ads/:id
// @access  Private
const deleteAd = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }
  // Only ad creator or admin can delete
  if ((!ad.user || ad.user.toString() !== req.user._id.toString()) && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to delete this ad');
  }
  await ad.deleteOne();
  res.json({ message: 'Ad deleted' });
});
module.exports = {
  createAd,
  getAds,
  getAdById,
  updateAd,
  deleteAd,
};