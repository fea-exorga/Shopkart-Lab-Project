const Customer = require('../models/customer.model');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      return res.status(409).json({
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    generateToken(res, customer._id);

    res.json({
      success: true,
      message: 'Login successful'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error'
    });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

const logout = (req, res) => {
  res.clearCookie('token');

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout
};