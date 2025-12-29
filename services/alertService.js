const Alert = require('../models/Alert');

const createAlertIfNeeded = async ({ predictionDoc, riskLevel, io }) => {
  if (!['High', 'Medium'].includes(riskLevel)) return null;
  const message = `Risk level ${riskLevel} detected at ${predictionDoc.location?.name || 'selected location'}`;
  const alert = await Alert.create({
    riskLevel,
    message,
    location: predictionDoc.location,
    prediction: predictionDoc._id,
  });

  if (io) {
    io.emit('alert', alert);
  }

  return alert;
};

module.exports = { createAlertIfNeeded };
