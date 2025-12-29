const axios = require('axios');

const fetchWeather = async (latitude, longitude) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENWEATHER_API_KEY is not set in environment variables');
    throw new Error('OPENWEATHER_API_KEY is required');
  }
  const url = 'https://api.openweathermap.org/data/2.5/weather';
  try {
    const { data } = await axios.get(url, {
      params: {
        lat: latitude,
        lon: longitude,
        units: 'metric',
        appid: apiKey,
      },
    });

    return {
      temperatureC: data.main?.temp,
      humidityPct: data.main?.humidity,
      pressurehPa: data.main?.pressure,
      windSpeedMs: data.wind?.speed,
      rainfall1hMm: data.rain?.['1h'] || 0,
      cloudPct: data.clouds?.all,
      raw: data,
    };
  } catch (error) {
    console.error('❌ Weather API Error:', error.message);
    throw error;
  }
};

module.exports = { fetchWeather };
