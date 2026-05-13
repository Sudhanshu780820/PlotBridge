const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    landId: { type: mongoose.Schema.Types.ObjectId, ref: 'land', required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The person who enquired
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The owner of the land
    name: String,
    email: String,
    phone: String,
    message: String,
    sellerReply: { type: String, default: "" }, // New: Seller's response
    status: { type: String, default: 'New' }, // New, Replied, Closed
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);