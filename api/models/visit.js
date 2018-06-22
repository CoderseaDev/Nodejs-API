const mongoose = require('mongoose');
const visitSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    visitorName: {type: String,required: [true, 'visitor Name is required']},
    patient : { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: {type: Date,required: true},
    comment:{type: String,required: true},
    delete:{
        type: String,
        enum: ['false', 'true'],
        default: 'false'
    },
    created_at  : { type: Date, required: true, default: Date.now },


},{collection: "visits"} );

module.exports = mongoose.model('visit', visitSchema);