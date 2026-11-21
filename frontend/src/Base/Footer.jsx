import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Rental House</h3>
          <p>
            Your trusted partner in finding the perfect home, apartment, or room with ease and complete peace of mind.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/properties">Properties</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <p>📍 Tirana, Albania</p>
          <p>📧 support@rentalhouse.com</p>
          <p>📞 +355 69 00 00 000</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Rental House. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;