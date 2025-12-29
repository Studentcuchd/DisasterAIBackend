const axios = require('axios');

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second
const TIMEOUT = 30000; // 30 seconds - increased from 15s for external service

const predictRisk = async (payload, retryCount = 0) => {
  const url = process.env.ML_API_URL || 'https://hackathon-model.onrender.com/predict';
  const startTime = Date.now();
  
  try {
    console.log(`[ML Service] Sending prediction request (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
    
    const { data } = await axios.post(url, payload, {
      timeout: TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });
    
    const duration = Date.now() - startTime;
    console.log(`[ML Service] Prediction successful in ${duration}ms`);
    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[ML Service] Error after ${duration}ms (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);
    
    // Retry logic for timeout and network errors
    if (retryCount < MAX_RETRIES - 1 && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.message.includes('timeout'))) {
      const delayMs = INITIAL_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(`[ML Service] Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return predictRisk(payload, retryCount + 1);
    }
    
    // Fallback response for external service failures
    console.warn('[ML Service] ML prediction failed, using fallback response');
    return {
      risk_level: 'medium',
      flood_risk: 0.5,
      earthquake_risk: 0.3,
      fallback: true,
      error: error.message
    };
  }
};

module.exports = { predictRisk };
