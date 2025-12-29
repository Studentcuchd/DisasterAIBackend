const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    message: { type: String, required: true },
    location: {
      name: String,
      latitude: Number,
      longitude: Number,
    },
    prediction: { type: mongoose.Schema.Types.ObjectId, ref: 'Prediction' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', AlertSchema);
