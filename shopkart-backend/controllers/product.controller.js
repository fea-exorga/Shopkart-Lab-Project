const mongoose = require('mongoose');
const Product = require('../models/product.model');

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, category, image and stock are required'
      });
    }

    if (Number(price) <= 0 || Number.isNaN(Number(price))) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    if (Number(stock) < 0 || Number.isNaN(Number(stock))) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock
    });

    return res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((item) => item.message).join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (category && category.trim()) {
      query.category = category.trim();
    }

    const products = await Product.find(query)
      .select('name description price category image stock createdAt')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id)
      .select('name description price category image stock createdAt');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct
};
