const express = require('express');
const router = express.Router();

const { getBookmarks, createBookmark, deleteBookmark, updateBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBookmarks).post(protect, createBookmark);
router.route('/:id').delete(protect, deleteBookmark).put(protect, updateBookmark);

module.exports = router;