const express = require('express');
const router = express.Router();
const Property = require('../models/propertyModel');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload'); 

// 1. Merr të gjitha pronat
router.get('/', async (req, res) => {
    try {
        const properties = await Property.find();
        res.json(properties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Merr vetëm një pronë sipas ID (VENDOSE KËTU, NË FILLIM)
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        res.json(property);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Krijo pronë të re
router.post('/', verifyToken, isAdmin, upload.array('images', 10), async (req, res) => {
    try {
        const { title, location, price, rating, beds, baths, cars, sqft, description } = req.body;
        const imagePaths = req.files ? req.files.map(file => file.path.replace(/\\/g, "/")) : [];

        const newProperty = new Property({
            title, location, price, rating, beds, baths, cars, sqft, description,
            images: imagePaths
        });

        const savedProperty = await newProperty.save();
        res.status(201).json(savedProperty);    
    } catch (err) {
        console.error("Gabim gjatë ruajtjes:", err);
        res.status(400).json({ message: err.message });
    }   
});

// 4. Fshi pronën
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);  
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        await property.deleteOne();
        res.json({ message: "Property deleted succesfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. Përditëso pronën
router.put('/update/:id', verifyToken, isAdmin, upload.array('images', 10), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        property.set(req.body);

        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map(file => file.path.replace(/\\/g, "/"));
            property.images = newImagePaths;
        }

        const updatedProperty = await property.save();
        res.json(updatedProperty);
    } catch (err) {
        console.error("Error during update:", err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;