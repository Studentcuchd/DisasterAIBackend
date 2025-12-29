const axios = require('axios');

const MAX_RETRIES = 2;
const INITIAL_DELAY = 2000; // 2 seconds
const TIMEOUT = 90000; // 90 seconds - for Render cold starts (free tier sleeps)

const predictRisk = async (payload, retryCount = 0) => {
  const url = process.env.ML_API_URL || 'https://hackathon-model.onrender.com/predict';
  const startTime = Date.now();
  
  try {
    console.log(`[ML Service] Sending prediction request (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
    console.log(`[ML Service] URL: ${url}`);
    console.log(`[ML Service] Payload:`, JSON.stringify(payload, null, 2));
    
    const { data } = await axios.post(url, payload, {
      timeout: TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });
    
    const duration = Date.now() - startTime;
    console.log(`[ML Service] Prediction successful in ${duration}ms`);
    console.log(`[ML Service] Response:`, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[ML Service] Error after ${duration}ms (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);
    console.error(`[ML Service] Error details:`, {
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
    });
    
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
      risk_level: 'Medium',  // Capitalized to match enum
      confidence: 0.5,
      probabilities: { Low: 0.3, Medium: 0.5, High: 0.2 },
      fallback: true,
      error: error.message
    };
  }
};

module.exports = { predictRisk };
