const mongoose = require('mongoose');
require('mongoose-type-email');
const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String,required: [true, 'Patient Name is required']},
    surname: {type: String,required: true},
    email:{type:mongoose.SchemaTypes.Email,required: true,unique:true},
    height:{type:Number,required: true},
    weight:{type:Number,required: true},
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
    }



},{collection: "patients"} );

module.exports = mongoose.model('Patients', userSchema);