const express = require('express');
const { listAlerts } = require('../controllers/alertController');

const router = express.Router();

router.get('/', listAlerts);

module.exports = router;
