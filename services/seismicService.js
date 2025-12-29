const axios = require('axios');
const { haversineKm } = require('../utils/haversine');

const fetchRecentEarthquake = async (latitude, longitude) => {
  const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
  const params = {
    format: 'geojson',
    latitude,
    longitude,
    maxradiuskm: 400,
    starttime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endtime: new Date().toISOString(),
    limit: 1,
    orderby: 'time',
  };

  const { data } = await axios.get(url, { params });
  const feature = data.features?.[0];
  if (!feature) return null;

  const magnitude = feature.properties?.mag || 0;
  const depthKm = feature.geometry?.coordinates?.[2] || 0;
  const epicenterLat = feature.geometry?.coordinates?.[1];
  const epicenterLon = feature.geometry?.coordinates?.[0];
  const distanceKm = haversineKm(latitude, longitude, epicenterLat, epicenterLon);

  // Simple attenuation-based estimate of PGA (not for scientific use)
  const groundAccelerationG = Number((magnitude / Math.pow(distanceKm + 1, 1.2) / 10).toFixed(4));

  return {
    magnitude,
    depthKm,
    distanceFromFaultKm: distanceKm,
    groundAccelerationG,
  };
};

module.exports = { fetchRecentEarthquake };
