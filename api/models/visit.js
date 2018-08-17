const mongoose = require('mongoose');
const visitSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: {type: Date},
    comment:{type: String},
    delete:{
        type: String,
        enum: ['false', 'true'],
        default: 'false'
    },
    image: { type: String},
    
    created_at  : { type: Date, required: true, default: Date.now },


},{collection: "visits"} );

module.exports = mongoose.model('Visit', visitSchema);