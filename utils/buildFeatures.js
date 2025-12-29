// Build ML feature payload from live weather + seismic data + optional overrides
const buildFeatures = ({ weather, seismic, overrides = {}, latitude, longitude }) => {
  const rainfall = typeof weather.rainfall1hMm === 'number' ? weather.rainfall1hMm : 0;
  const humidity = typeof weather.humidityPct === 'number' ? weather.humidityPct : 0;
  const wind = typeof weather.windSpeedMs === 'number' ? weather.windSpeedMs : 0;
  const cloud = typeof weather.cloudPct === 'number' ? weather.cloudPct : 0;

  const soilMoisturePct = overrides.soil_moisture_pct ?? Math.min(95, Math.max(10, humidity * 0.9 + cloud * 0.1));
  const riverLevelM = overrides.river_level_m ?? Number(((rainfall * 0.25) + (humidity * 0.02) + (wind * 0.05)).toFixed(2));
  const riverDangerLevelM = overrides.river_danger_level_m ?? Number((riverLevelM + Math.max(0.5, rainfall * 0.15 + wind * 0.05)).toFixed(2));
  const riverRiseRate = overrides.river_rise_rate_cmphr ?? Number(((rainfall * 1.8) + (wind * 0.4)).toFixed(2));

  const seismicMagnitude = overrides.seismic_magnitude ?? seismic?.magnitude ?? 0;
  const seismicDepthKm = overrides.seismic_depth_km ?? seismic?.depthKm ?? 0;
  const distanceFromFaultKm = overrides.distance_from_fault_km ?? seismic?.distanceFromFaultKm ?? 0;
  const groundAccelerationG = overrides.ground_acceleration_g ?? seismic?.groundAccelerationG ?? 0.001;

  const pastFlood = overrides.past_flood_event ?? 0;
  const pastEarthquake = overrides.past_earthquake_event ?? 0;

  return {
    latitude,
    longitude,
    rainfall_1h_mm: rainfall,
    soil_moisture_pct: soilMoisturePct,
    river_level_m: riverLevelM,
    river_danger_level_m: riverDangerLevelM,
    river_rise_rate_cmphr: riverRiseRate,
    seismic_magnitude: seismicMagnitude,
    seismic_depth_km: seismicDepthKm,
    distance_from_fault_km: distanceFromFaultKm,
    ground_acceleration_g: groundAccelerationG,
    past_flood_event: pastFlood,
    past_earthquake_event: pastEarthquake,
  };
};

module.exports = { buildFeatures };
