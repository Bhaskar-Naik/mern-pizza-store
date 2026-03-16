const crypto = require("crypto");

const verifyWebhook = (req) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac("sha256", secret);

  shasum.update(JSON.stringify(req.body));

  const digest = shasum.digest("hex");

  return digest === req.headers["x-razorpay-signature"];
};

module.exports = verifyWebhook;