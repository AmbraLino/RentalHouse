const express = require('express');
const router = express.Router();
const Property = require('../models/propertyModel');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Merr të gjitha pronat
router.get('/', async (req, res) => {
    try {
        const properties = await Property.find().populate('ratings.user', 'username name email');
        res.json(properties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Merr një pronë sipas ID-së
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('ratings.user', 'username name email');
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        res.json(property);
    } catch (err) {
        console.error("Gabim gjatë kërkimit të pronës:", err);
        res.status(500).json({ message: err.message });
    }
});

// Shto pronë të re
router.post('/', verifyToken, isAdmin, upload.array('images', 10), async (req, res) => {
    try {
        console.log("BODY NE SERVER:", req.body);

        const { title, location, price, guests, beds, baths, cars, sqft, description } = req.body;
        const imagePaths = req.files ? req.files.map(file => file.path.replace(/\\/g, "/")) : [];

        const rawGuests = Array.isArray(guests) ? guests[guests.length - 1] : guests;
        const parsedGuests = Number(rawGuests);

        const newProperty = new Property({
            title,
            location,
            price: Number(price),
            rating: 0,
            ratingCount: 0,
            ratings: [],
            guests: !isNaN(parsedGuests) && parsedGuests >= 1 ? parsedGuests : 1,
            beds: beds !== undefined && beds !== "" ? Number(beds) : 3,
            baths: baths !== undefined && baths !== "" ? Number(baths) : 3,
            cars: cars !== undefined && cars !== "" ? Number(cars) : 2,
            sqft: sqft !== undefined && sqft !== "" ? Number(sqft) : 250,
            description,
            images: imagePaths
        });

        const savedProperty = await newProperty.save();
        res.status(201).json(savedProperty);
    } catch (err) {
        console.error("Gabim gjatë ruajtjes:", err);
        res.status(400).json({ message: err.message });
    }
});

// Vlerësimi me yje (1 - 5) nga përdoruesi
router.post('/:id/rate', verifyToken, async (req, res) => {
    try {
        const stars = Number(req.body.stars);
        if (!stars || stars < 1 || stars > 5) {
            return res.status(400).json({ message: "The rating must be from 1 to 5 stars." });
        }

        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        const userId = req.user?._id || req.user?.id || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "User ID missing in token." });
        }

        if (!Array.isArray(property.ratings)) {
            property.ratings = [];
        }

        const existingIndex = property.ratings.findIndex(
            (r) => String(r.user) === String(userId)
        );

        if (existingIndex > -1) {
            property.ratings[existingIndex].stars = stars;
        } else {
            property.ratings.push({ user: userId, stars });
        }

        const totalVotes = property.ratings.length;
        const sumStars = property.ratings.reduce((acc, item) => acc + Number(item.stars), 0);

        property.ratingCount = totalVotes;
        property.rating = totalVotes > 0 ? Number((sumStars / totalVotes).toFixed(1)) : 0;

        property.markModified('ratings');
        const savedProperty = await property.save();
        await savedProperty.populate('ratings.user', 'username name email');

        console.log("SAVED RATING:", {
            id: savedProperty._id,
            rating: savedProperty.rating,
            ratingCount: savedProperty.ratingCount,
            ratingsLength: savedProperty.ratings.length
        });

        res.json(savedProperty);
    } catch (err) {
        console.error("Error during rating:", err);
        res.status(500).json({ message: err.message });
    }
});

// Fshi pronë
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        await property.deleteOne();
        res.json({ message: "Property deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Përditëso pronë
router.put('/update/:id', verifyToken, isAdmin, upload.array('images', 10), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        if (req.body.title !== undefined) property.title = req.body.title;
        if (req.body.location !== undefined) property.location = req.body.location;
        if (req.body.price !== undefined && req.body.price !== "") property.price = Number(req.body.price);
        if (req.body.guests !== undefined && req.body.guests !== "") {
            const rawGuests = Array.isArray(req.body.guests) ? req.body.guests[req.body.guests.length - 1] : req.body.guests;
            const parsedGuests = Number(rawGuests);
            if (!isNaN(parsedGuests) && parsedGuests >= 1) {
                property.guests = parsedGuests;
            }
        }
        if (req.body.beds !== undefined && req.body.beds !== "") property.beds = Number(req.body.beds);
        if (req.body.baths !== undefined && req.body.baths !== "") property.baths = Number(req.body.baths);
        if (req.body.cars !== undefined && req.body.cars !== "") property.cars = Number(req.body.cars);
        if (req.body.sqft !== undefined && req.body.sqft !== "") property.sqft = Number(req.body.sqft);
        if (req.body.description !== undefined) property.description = req.body.description;

        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map(file => file.path.replace(/\\/g, "/"));
            property.images = newImagePaths;
        }

        const updatedProperty = await property.save();
        await updatedProperty.populate('ratings.user', 'username name email');
        res.json(updatedProperty);
    } catch (err) {
        console.error("Error during update:", err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;