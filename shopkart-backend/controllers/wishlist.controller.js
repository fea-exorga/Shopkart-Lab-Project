const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const alreadyWishlisted = req.user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product is already in your wishlist'
      });
    }

    req.user.wishlist.push(product._id);
    await req.user.save();

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    console.error('Add wishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id)
      .populate({
        path: 'wishlist',
        select: 'name description price category image stock'
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const wishlist = customer.wishlist.filter(Boolean);

    return res.json({
      success: true,
      count: wishlist.length,
      wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load wishlist'
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const isWishlisted = req.user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (!isWishlisted) {
      return res.status(404).json({
        success: false,
        message: 'Product is not in your wishlist'
      });
    }

    req.user.wishlist = req.user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await req.user.save();

    return res.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Remove wishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist
};
