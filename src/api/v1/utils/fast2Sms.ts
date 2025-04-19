const axios = require('axios');
require('dotenv').config();

const fast2SmsApiKey = process.env.FAST2SMS_API_KEY;

/**
 * Send OTP via Fast2SMS
 * @param {string} mobileNumber - The recipient's mobile number
 * @param {string} otp - The OTP to be sent
 * @returns {Promise} - Axios response promise
 */
export const sendOtp = async (mobileNumber: string, otp: string) => {
  
  const data = {
    "route": "dlt",
    "sender_id": "SMC101",
    "message": "171614",
    "variables_values": otp,
    "flash": 0,
    "numbers": mobileNumber,
  };

  const config = {
    method: 'post',
    url: 'https://www.fast2sms.com/dev/bulkV2',
    headers: {
      'authorization': fast2SmsApiKey,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(data),
  };

  try {
    const response = await axios(config)
    return response.data;
  } catch (error) {
    throw error;
  }
};