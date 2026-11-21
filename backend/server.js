const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.use(cors({ 
    credentials: true,
    origin: "http://localhost:3000",
    exposedHeaders: ["set-cookie"], 
}));

app.use(session({ 
    secret: process.env.SESSION_SECRET || "This will be secret",
    resave: false, 
    saveUninitialized: true, 
    cookie: { maxAge: 1000 * 60 * 60 * 24 } 
}));

app.use(cookieParser()); 

app.use(express.json({ limit: "1000mb", extended: true }));
app.use(express.urlencoded({ limit: "1000mb", extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("Something is wrong", err));

const userRoute = require('./routes/userRoute');
app.use('/user', userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/api/admin', adminRoute);
// app.use('/api/properties', adminRoute);

const propertyRoutes = require('./routes/propertyRoute'); 
app.use('/api/properties', propertyRoutes);

const bookingRoutes = require('./routes/bookingRoute');
app.use('/api/bookings', bookingRoutes);

app.use('/uploads', express.static('uploads'));

app.use('/', (req, res) => { 
    res.send("Hello Node!"); 
});

app.listen(PORT, () => { 
    console.log(`Server created on port ${PORT}!`); 
});