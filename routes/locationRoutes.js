const express = require('express');
const { listLocations, createLocation } = require('../controllers/locationController');

const router = express.Router();

router.get('/', listLocations);
router.post('/', createLocation);

module.exports = router;
