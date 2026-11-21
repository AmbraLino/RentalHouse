const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "online"],
        default: "cash",
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending",
    },
    paypalOrderId: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Rejected"],
        default: "Pending",
    },

});

module.exports = mongoose.model('Booking', bookingSchema);