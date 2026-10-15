const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateCart = (customerQuery) => customerQuery.populate({
  path: 'cart.product',
  select: 'name description price category image stock'
});

const getPopulatedCart = async (userId) => {
  const customer = await populateCart(Customer.findById(userId));
  return customer?.cart?.filter((item) => item.product) || [];
};

const addToCart = async (req, res) => {
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

    if (Number(product.stock) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    const cartItem = req.user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (cartItem) {
      if (cartItem.quantity + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units are available`
        });
      }

      cartItem.quantity += 1;
    } else {
      req.user.cart.push({
        product: product._id,
        quantity: 1
      });
    }

    await req.user.save();
    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart
    });
  } catch (error) {
    console.error('Add cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getCart = async (req, res) => {
  try {
    const customer = await populateCart(Customer.findById(req.user._id));

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const cart = customer.cart.filter((item) => item.product);

    return res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load cart'
    });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be an integer of at least 1'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units are available`
      });
    }

    const cartItem = req.user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product is not in your cart'
      });
    }

    cartItem.quantity = quantity;
    await req.user.save();

    const cart = await getPopulatedCart(req.user._id);

    return res.json({
      success: true,
      message: 'Cart quantity updated',
      cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const cartItem = req.user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product is not in your cart'
      });
    }

    req.user.cart = req.user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await req.user.save();
    const cart = await getPopulatedCart(req.user._id);

    return res.json({
      success: true,
      message: 'Product removed from cart',
      cart
    });
  } catch (error) {
    console.error('Remove cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
};
