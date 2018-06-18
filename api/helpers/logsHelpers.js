const mongoose = require("mongoose");
const ip = require("ip");
const Logs = require("../models/logs");
const TransactionLogs = require("../models/transaction_logs");

module.exports = {
    // All logs
    all_log: function (req, res, err_mss) {
        const log = new Logs({
            _id: new mongoose.Types.ObjectId(),
            url: req.originalUrl,
            method: req.method,
            userIp: ip.address(),
            status: res.statusCode,
            message: err_mss
        });
        log.save();
    },

    // All Transaction Logs
    TransactionLog: function (req, res, mess) {
        const Transaction = new TransactionLogs({
            _id: new mongoose.Types.ObjectId(),
            url: req.originalUrl,
            method: req.method,
            userIp: ip.address(),
            status: res.statusCode,
            message: mess
        });
        Transaction.save();
    },

};

