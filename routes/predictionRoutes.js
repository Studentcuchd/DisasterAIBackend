const express = require('express');
const { predict, history } = require('../controllers/predictionController');

const router = express.Router();

router.post('/', predict);
router.get('/history', history);

module.exports = router;
