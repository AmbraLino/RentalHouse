# 🏡 RentalHouse — Full-Stack Property Rental & Booking Platform

**RentalHouse** is a full-stack property rental and reservation web application built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It allows users to browse properties, filter listings, book stays with real-time date availability validation, pay online via PayPal or cash, and rate properties dynamically, while providing administrators with full control over properties, reservations, and user feedback.

---

## Key Features

### Customer / User Features
- **Authentication & Authorization:** Secure user registration and login using JWT tokens and HTTP-only cookies with role-based access control.
- **Property Browsing & Search Filtering:** Browse all available homes, apartments, and villas with image carousels, detailed specs (guests, beds, baths, parking, sqft), and filtering by location, guest count, property type, and maximum price.
- **Smart Booking System:** Create reservations with automatic price calculation based on nights stayed and backend date-overlap validation to prevent double bookings.
- **Booking Management:** View, update reservation dates, or cancel bookings directly from the **User Profile** page.
- **Flexible Payments:** Choose between **Cash on Delivery** or **Online Payment via PayPal** (integrated with `@paypal/react-paypal-js`).
- **Dynamic Star Rating System:** Rate booked properties (1–5 stars), with automatic real-time calculation of property average ratings and total vote counts across all pages.

### Admin Features
- **Property Management:** Add new properties with multi-image uploads (`Multer`), edit existing listings, or delete properties.
- **Reservation Oversight:** View all system-wide bookings, approve/confirm reservations, update check-in/check-out dates, or delete bookings.
- **Payment & Rating Monitoring:** Track online PayPal vs. cash payment statuses and view individual user star ratings alongside overall property averages.

---

## Tech Stack

- **Frontend:** React.js, React Router, Axios, CSS3, `@paypal/react-paypal-js`
- **Backend:** Node.js, Express.js, JWT (`jsonwebtoken`), Multer (image uploads)
- **Database:** MongoDB & Mongoose ODM

---

## Project Structure

```text
RentalHouse/
├── backend/
│   ├── middleware/       # JWT auth, admin verification, Multer file upload
│   ├── models/           # Mongoose schemas (User, Property, Booking)
│   ├── routes/           # REST API endpoints (auth, properties, bookings)
│   ├── uploads/          # Uploaded property images
│   └── server.js         # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── Auth/         # Login, Register, UserContext
│   │   ├── Components/   # Home, Properties, PropertyDetails, UserProfile, AdminBookings, etc.
│   │   └── App.js        # Application routing
│   └── package.json
└── README.md