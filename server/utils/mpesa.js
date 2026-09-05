const axios = require("axios");
const moment = require("moment");

/**
 * M-Pesa Daraja API Utility
 * Handles authentication and STK Push (Lipa Na M-Pesa Online)
 */

const getAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  
  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa Consumer Key or Secret is missing in .env");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("[M-Pesa] Auth Error:", error.response?.data || error.message);
    throw new Error("Failed to get M-Pesa access token");
  }
};

const initiateSTKPush = async ({ phoneNumber, amount, orderNumber, callbackUrl }) => {
  const accessToken = await getAccessToken();
  const timestamp = moment().format("YYYYMMDDHHmmss");
  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortCode || !passkey) {
    throw new Error("M-Pesa Shortcode or Passkey is missing in .env");
  }

  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");

  // Format phone number to 254XXXXXXXXX
  let formattedPhone = phoneNumber.replace(/\+/g, "").replace(/\s/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.slice(1);
  } else if (!formattedPhone.startsWith("254")) {
    formattedPhone = "254" + formattedPhone;
  }

  const requestBody = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: orderNumber,
    TransactionDesc: `Payment for Order ${orderNumber}`,
  };

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("[M-Pesa] STK Push Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.CustomerMessage || "Failed to initiate M-Pesa payment");
  }
};

module.exports = {
  initiateSTKPush,
};
