const mongoose = require('mongoose');

const ProbabilitySchema = new mongoose.Schema(
  {
    Low: { type: Number, default: 0 },
    Medium: { type: Number, default: 0 },
    High: { type: Number, default: 0 },
  },
  { _id: false }
);

const PredictionSchema = new mongoose.Schema(
  {
    location: {
      name: String,
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    weatherSnapshot: {
      temperatureC: Number,
      humidityPct: Number,
      pressurehPa: Number,
      windSpeedMs: Number,
      rainfall1hMm: Number,
      cloudPct: Number,
    },
    modelRequest: {
      rainfall_1h_mm: Number,
      soil_moisture_pct: Number,
      river_level_m: Number,
      river_danger_level_m: Number,
      river_rise_rate_cmphr: Number,
      seismic_magnitude: Number,
      seismic_depth_km: Number,
      distance_from_fault_km: Number,
      ground_acceleration_g: Number,
      past_flood_event: Number,
      past_earthquake_event: Number,
    },
    modelResponse: {
      risk_level: { type: String, enum: ['Low', 'Medium', 'High'] },
      confidence: Number,
      probabilities: ProbabilitySchema,
      timestamp: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', PredictionSchema);
