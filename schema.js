const Joi=require("joi");

module.exports.listingSchema=Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.string().required(),
        image:Joi.string().allow("",null),
        numBeds:Joi.string().required(),
        gender:Joi.string().required(),
        amenities: Joi.array().items(Joi.string()), 
    }).required(),
});

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required(),
});