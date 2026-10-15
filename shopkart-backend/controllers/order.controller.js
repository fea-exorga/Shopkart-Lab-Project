const crypto = require('crypto');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const { getRazorpayClient } = require('../config/razorpay');

const validateShippingAddress = (address) => {
  if (!address || typeof address !== 'object') return 'Shipping address is required.';
  const fields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
  for (const field of fields) {
    if (typeof address[field] !== 'string' || !address[field].trim()) {
      return `${field} is required.`;
    }
  }
  if (!/^[0-9+\-\s()]{10,15}$/.test(address.phone.trim())) {
    return 'Enter a valid phone number.';
  }
  if (!/^\d{6}$/.test(address.pincode.trim())) {
    return 'Pincode must contain 6 digits.';
  }
  return null;
};

const createPaymentOrder = async (req, res) => {
  let shopKartOrder;
  try {
    const addressError = validateShippingAddress(req.body.shippingAddress);
    if (addressError) {
      return res.status(400).json({ success: false, message: addressError });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Customer not found.' });
    }
    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'A product in your cart is no longer available. Remove it and try again.'
        });
      }
      const quantity = Number(cartItem.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}.` });
      }
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image || ''
      });
      totalAmount += Number(product.price) * quantity;
    }

    totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Unable to calculate order total.' });
    }

    const { client, keyId } = getRazorpayClient();

    shopKartOrder = await Order.create({
      user: customer._id,
      items: orderItems,
      shippingAddress: Object.fromEntries(
        Object.entries(req.body.shippingAddress).map(([key, value]) => [key, String(value).trim()])
      ),
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT'
    });

    const razorpayOrder = await client.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: shopKartOrder._id.toString()
    });

    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId,
      totalAmount: shopKartOrder.totalAmount
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Unable to start checkout. Please try again.'
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (![shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature].every(
      (value) => typeof value === 'string' && value.trim()
    )) {
      return res.status(400).json({ success: false, message: 'Payment verification details are incomplete.' });
    }
    if (!mongoose.isValidObjectId(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid ShopKart order ID.' });
    }

    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.paymentStatus === 'PAID') {
      return res.json({ success: true, message: 'Payment already verified.', order });
    }
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Razorpay order does not match.' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(503).json({ success: false, message: 'Razorpay test keys are not configured on the server.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = Buffer.from(razorpay_signature, 'hex');
    const signatureIsValid =
      expectedBuffer.length === receivedBuffer.length &&
      expectedBuffer.length > 0 &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!signatureIsValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature. Your cart has not been cleared.' });
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Clear the persistent cart only after server-side signature verification.
    await Customer.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

    return res.json({ success: true, message: 'Payment verified and order placed.', order });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ success: false, message: 'Unable to verify payment. Please contact support if you were charged.' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load orders.' });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    return res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load order.' });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrderById };
