const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Location', LocationSchema);
