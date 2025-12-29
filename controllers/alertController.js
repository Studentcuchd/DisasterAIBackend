const { StatusCodes } = require('http-status-codes');
const Alert = require('../models/Alert');

const listAlerts = async (req, res, next) => {
  try {
    const { riskLevel, start, end } = req.query;
    const filters = {};
    if (riskLevel) filters.riskLevel = riskLevel;
    if (start || end) {
      filters.createdAt = {};
      if (start) filters.createdAt.$gte = new Date(start);
      if (end) filters.createdAt.$lte = new Date(end);
    }
    const alerts = await Alert.find(filters).sort({ createdAt: -1 }).lean();
    res.status(StatusCodes.OK).json(alerts);
  } catch (error) {
    next(error);
  }
};

module.exports = { listAlerts };
