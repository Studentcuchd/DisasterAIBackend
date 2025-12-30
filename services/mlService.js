const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

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
    const status = error.response?.status;
    const isRetryable = status === 502 || status === 503 || error.code === 'ECONNABORTED' || error.message.includes('timeout');
    
    console.error(`[ML Service] Error after ${duration}ms (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);
    console.error(`[ML Service] Error details:`, {
      code: error.code,
      status: status,
      isRetryable: isRetryable,
    });
    
    // Retry on 502/503 (server errors) or timeout errors
    if (retryCount < MAX_RETRIES - 1 && isRetryable) {
      const delayMs = INITIAL_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(`[ML Service] Retrying in ${delayMs}ms... (Render cold start recovery)`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return predictRisk(payload, retryCount + 1);
    }
    
    // Create detailed error object with detection info
    const errorDetails = {
      type: status ? `HTTP_ERROR_${status}` : (error.code === 'ECONNABORTED' || error.message.includes('timeout') ? 'TIMEOUT' : 'NETWORK_ERROR'),
      status: status,
      code: error.code,
      message: error.message,
      duration: duration,
      attempt: retryCount + 1,
    };
    
    const err = new Error(error.message);
    err.details = errorDetails;
    err.status = status || StatusCodes.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

module.exports = { predictRisk };
