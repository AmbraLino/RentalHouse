const mongoose = require('mongoose');

const ratingEntrySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stars: { type: Number, required: true, min: 1, max: 5 }
}, { _id: false });

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 }, 
    ratingCount: { type: Number, default: 0 }, 
    ratings: [ratingEntrySchema], 
    guests: { type: Number, default: 1, min: 1 },
    beds: { type: Number, default: 3 },
    baths: { type: Number, default: 3 },
    cars: { type: Number, default: 2 },
    sqft: { type: Number, default: 250 },
    description: { type: String, required: true },
    images: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);