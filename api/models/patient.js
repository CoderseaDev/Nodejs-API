const mongoose = require('mongoose');
require('mongoose-type-email');
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    patientId: {type: Number,default:1},
    name: {type: String,required: [true, 'Patient Name is required']},
    surname: {type: String,required: true},
    // email:{type:mongoose.SchemaTypes.Email,required: true,unique:true},
    email:{type:String},
    height:{
        type:Number,
        required: true,
        maxlength:3,
    },
    weight:{
        type:Number,
        required: true,
        maxlength:3,
    },
    gender:{
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    blood_type:{
        type:String,
        max:3,
        required: true
    },
    patient_complaint:{
        type:String,
        required: true
    },
    date_of_birth:{
        type:Date,
        required: true
    },
    home_no:{
        type:Number,
        maxlength:10,
        required: true
    },
    mobile_no:{
        type:Number,
        minlength:11,
        maxlength:13,
        required: true
    },
    address:{
        type:String,
        required: true
    },
    name_em :{
        type:String,
    },
    relation:{
        type:String,
    },
    phone_no_em:{
        type:Number,
        minlength:11,
        maxlength:13,
    },
    delete:{
        type: String,
        enum: ['false', 'true'],
        default: 'false'
    },
    created_at    : { type: Date, required: true, default: Date.now },
    updated_at    : { type: Date, required: true, default: Date.now },


},{collection: "patients"} );

module.exports = mongoose.model('Patients', userSchema);