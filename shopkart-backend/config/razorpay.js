const Razorpay = require('razorpay');

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error(
      'Razorpay test keys are missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to shopkart-backend/.env.'
    );
    error.statusCode = 503;
    throw error;
  }

  return {
    keyId,
    client: new Razorpay({ key_id: keyId, key_secret: keySecret })
  };
}

module.exports = { getRazorpayClient };
