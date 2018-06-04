const mongoose = require('mongoose');

const transactionLogSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    url: { type: String, required: true },
    method: { type: String, required: true },
    userIp: { type: String, required: true },
    status: { type: String },
    message: { type: String },
},{timestamps: true});

module.exports = mongoose.model('TransactionLog', transactionLogSchema);