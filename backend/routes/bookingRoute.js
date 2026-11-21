const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel');
const Property = require('../models/propertyModel');
const { verifyToken } = require('../middleware/auth');

const verifyAdmin = (req, res, next) => {
    if (req.user && (req.user.isAdmin || (req.user.role && req.user.role.toLowerCase() === "admin"))) {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin only." });
    }
};

router.get('/admin/all-bookings', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate({
                path: 'property',
                populate: {
                    path: 'ratings.user',
                    select: 'username name email'
                }
            })
            .populate('user', 'username email name')
            .sort({ createdAt: -1 });
        console.log("Bookings found for admin:", bookings.length);
        res.json(bookings);
    } catch (err) {
        console.error("Error fetching all bookings for admin:", err);
        res.status(500).json({ message: err.message });
    }
});

router.delete('/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.json({ message: "Booking deleted successfully by admin" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { checkIn, checkOut } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const newStart = checkIn ? new Date(checkIn) : booking.checkIn;
        const newEnd = checkOut ? new Date(checkOut) : booking.checkOut;

        if (newEnd <= newStart) {
            return res.status(400).json({ message: "Check-out date must be after check-in date." });
        }

        booking.checkIn = newStart;
        booking.checkOut = newEnd;

        const property = await Property.findById(booking.property);
        if (property) {
            const diffTime = Math.abs(newEnd - newStart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            booking.totalPrice = diffDays > 0 ? diffDays * property.price : property.price;
        }

        const updatedBooking = await booking.save();
        await updatedBooking.populate({
            path: 'property',
            populate: {
                path: 'ratings.user',
                select: 'username name email'
            }
        });
        await updatedBooking.populate('user', 'username email name');

        res.json({ message: "Booking updated successfully by admin", booking: updatedBooking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { propertyId, checkIn, checkOut, paymentMethod } = req.body;
        const userId = req.user?.id || req.user?._id;

        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        if (endDate <= startDate) {
            return res.status(400).json({ message: "Check-out date must be after check-in date." });
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        const overlappingBooking = await Booking.findOne({
            property: propertyId,
            $and: [
                { checkIn: { $lt: endDate } },
                { checkOut: { $gt: startDate } }
            ]
        });

        if (overlappingBooking) {
            return res.status(400).json({ 
                message: "This property is already booked for the selected dates." 
            });
        }

        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalPrice = diffDays * property.price;

        const newBooking = new Booking({
            property: propertyId,
            user: userId,
            checkIn: startDate,
            checkOut: endDate,
            totalPrice,
            paymentMethod: paymentMethod || "cash" 
        });

        const savedBooking = await newBooking.save();
        await savedBooking.populate('property');

        res.status(201).json(savedBooking);

    } catch (err) {
        console.error("Error during reservation:", err);
        res.status(500).json({ message: err.message });
    }
});

router.get('/my-bookings', verifyToken, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const bookings = await Booking.find({ user: userId }).populate('property');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deletedBooking = await Booking.findOneAndDelete({
            _id: req.params.id,
            user: req.user?.id || req.user?._id
        });

        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        res.json({ message: "Booking deleted successfully" });
    } catch (err) {
        console.error("Gabim gjatë fshirjes:", err);
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { checkIn, checkOut } = req.body;
        
        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user?.id || req.user?._id
        });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found or unauthorized" });
        }

        const newStart = checkIn ? new Date(checkIn) : booking.checkIn;
        const newEnd = checkOut ? new Date(checkOut) : booking.checkOut;

        if (newEnd <= newStart) {
            return res.status(400).json({ message: "Check-out date must be after check-in date." });
        }

        const overlappingBooking = await Booking.findOne({
            property: booking.property,
            _id: { $ne: booking._id },
            $and: [
                { checkIn: { $lt: newEnd } },
                { checkOut: { $gt: newStart } }
            ]
        });

        if (overlappingBooking) {
            return res.status(400).json({ message: "These dates are already booked for this property." });
        }

        booking.checkIn = newStart;
        booking.checkOut = newEnd;

        const property = await Property.findById(booking.property);
        if (property) {
            const diffTime = Math.abs(newEnd - newStart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            booking.totalPrice = diffDays > 0 ? diffDays * property.price : property.price;
        }

        const updatedBooking = await booking.save();
        await updatedBooking.populate('property');

        res.json({ message: "Booking updated successfully", booking: updatedBooking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/pay-paypal", verifyToken, async (req, res) => {
    const { bookingId, paypalOrderId } = req.body;
    const userId = req.user?.id || req.user?._id;

    try {
        const booking = await Booking.findOne({ _id: bookingId, user: userId });
        if (!booking) {
            return res.status(404).json({ message: "Reservation not found or unauthorized." });
        }

        booking.paymentMethod = "online";
        booking.paymentStatus = "Paid";
        booking.paypalOrderId = paypalOrderId;

        await booking.save();
        await booking.populate('property');

        res.status(200).json({ message: "The payment was successfully recorded!", booking });
    } catch (err) {
        console.error("Error while saving the payment:", err);
        res.status(500).json({ message: "Server error." });
    }
});

router.put("/admin/approve/:id", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Reservation not found.." });
        }

        booking.status = "Confirmed";
        await booking.save();

        await booking.populate("user", "username name email");
        await booking.populate({
            path: "property",
            populate: {
                path: "ratings.user",
                select: "username name email"
            }
        });

        res.status(200).json({
            message: "The reservation was successfully accepted by the Admin!",
            booking,
        });
    } catch (err) {
        console.error("Error during approval:", err);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;