const jwt = require('jsonwebtoken');

const generateToken = (res, customerId) => {
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d'
    }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict'
  });
};

module.exports = generateToken;