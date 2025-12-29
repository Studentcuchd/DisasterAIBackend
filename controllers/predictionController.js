const { StatusCodes } = require('http-status-codes');
const Prediction = require('../models/Prediction');
const { fetchWeather } = require('../services/weatherService');
const { fetchRecentEarthquake } = require('../services/seismicService');
const { predictRisk } = require('../services/mlService');
const { createAlertIfNeeded } = require('../services/alertService');
const { buildFeatures } = require('../utils/buildFeatures');

const predict = async (req, res, next) => {
  try {
    console.log('📍 Prediction request received:', { latitude: req.body.latitude, longitude: req.body.longitude });
    
    const {
      latitude,
      longitude,
      locationName,
      past_flood_event,
      past_earthquake_event,
      seismic_magnitude,
      seismic_depth_km,
      distance_from_fault_km,
      ground_acceleration_g,
      soil_moisture_pct,
      river_level_m,
      river_danger_level_m,
      river_rise_rate_cmphr,
    } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'latitude and longitude are required numbers' });
    }

    console.log('🌤️ Fetching weather data...');
    const weather = await fetchWeather(latitude, longitude);
    console.log('✅ Weather data received');
    
    console.log('🌍 Fetching seismic data...');
    const seismic = await fetchRecentEarthquake(latitude, longitude);
    console.log('✅ Seismic data received');

    console.log('🔧 Building feature payload...');
    const featurePayload = buildFeatures({
      weather,
      seismic,
      latitude,
      longitude,
      overrides: {
        past_flood_event,
        past_earthquake_event,
        seismic_magnitude,
        seismic_depth_km,
        distance_from_fault_km,
        ground_acceleration_g,
        soil_moisture_pct,
        river_level_m,
        river_danger_level_m,
        river_rise_rate_cmphr,
      },
    });

    const mlResponse = await predictRisk(featurePayload);

    // Normalize risk_level to match enum values (Low, Medium, High)
    const normalizedRiskLevel = mlResponse.risk_level 
      ? mlResponse.risk_level.charAt(0).toUpperCase() + mlResponse.risk_level.slice(1).toLowerCase()
      : 'Low';
    
    console.log(`📊 ML Response risk_level: "${mlResponse.risk_level}" → normalized to: "${normalizedRiskLevel}"`);

    const predictionDoc = await Prediction.create({
      location: { name: locationName, latitude, longitude },
      weatherSnapshot: weather,
      modelRequest: featurePayload,
      modelResponse: {
        ...mlResponse,
        risk_level: normalizedRiskLevel, // Use normalized value
      },
    });

    const alert = await createAlertIfNeeded({ predictionDoc, riskLevel: normalizedRiskLevel, io: req.io });

    const statusCode = mlResponse.fallback ? StatusCodes.ACCEPTED : StatusCodes.OK;
    res.status(statusCode).json({
      prediction: predictionDoc,
      alert,
      warning: mlResponse.fallback ? 'Using fallback prediction due to ML service timeout' : undefined,
    });
  } catch (error) {
    return next(error);
  }
};

const history = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const items = await Prediction.find({}).sort({ createdAt: -1 }).limit(Number(limit)).lean();
    res.status(StatusCodes.OK).json(items);
  } catch (error) {
    next(error);
  }
};

module.exports = { predict, history };
