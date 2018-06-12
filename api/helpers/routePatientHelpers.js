const Joi = require('joi');

module.exports = {
    validateBody: (schema) => {
        return (req, res, next) => {
            const result = Joi.validate(req.body, schema);
            if (result.error) {
                return res.status(400).json({"message" : result.error['details'][0]['message'] });
            }

            if (!req.value) { req.value = {}; }
            req.value['body'] = result.value;
            next();
        }
    },

    schemas: {
        authSchema: Joi.object().keys({

            name: Joi.string().required(),
            email: Joi.string().required().email(),
            surname: Joi.string().required(),
            height: Joi.string().required().number().max(3),
            weight: Joi.string().required().number().max(3),
            gender: Joi.string().required(),
            blood_type: Joi.string().required().max(3),
            patient_complaint: Joi.string().required(),
            date_of_birth: Joi.date().required(),
            home_no: Joi.number().max(10),
            mobile_no: Joi.number().max(13).min(11),
            address: Joi.string().required(),
            name_em: Joi.string(),
            relation: Joi.string(),
            phone_no_em: Joi.number().max(13).min(11),

        })
    }
}