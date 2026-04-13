const express = require('express');
const router = express.Router();
const { getItems, getItem, createItem, updateItem, deleteItem, getStats } = require('../controllers/itemController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.get('/', getItems);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
