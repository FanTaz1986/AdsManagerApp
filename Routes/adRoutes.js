const express = require('express');
const router = express.Router();

const {
    createAd,
    getAds,
    getAdById,
    updateAd,
    deleteAd
  } = require('../controllers/adController');
  
  const { protect } = require('../midleware/authMiddleware');
  router.post('/', protect, createAd);
  router.get('/', getAds);
  router.get('/:id', getAdById);
  router.put('/:id', protect, updateAd);
  router.delete('/:id', protect, deleteAd);


module.exports = router;