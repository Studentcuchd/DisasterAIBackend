const { StatusCodes } = require('http-status-codes');
const Location = require('../models/Location');

const listLocations = async (req, res, next) => {
  try {
    const items = await Location.find({}).sort({ createdAt: -1 }).lean();
    res.status(StatusCodes.OK).json(items);
  } catch (error) {
    next(error);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const { name, latitude, longitude, note } = req.body;
    if (!name || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'name, latitude, longitude are required' });
    }
    const location = await Location.create({ name, latitude, longitude, note });
    res.status(StatusCodes.CREATED).json(location);
  } catch (error) {
    next(error);
  }
};

module.exports = { listLocations, createLocation };
