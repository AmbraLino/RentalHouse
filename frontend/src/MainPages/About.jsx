import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <header className="about-hero">
        <h1>About RentalHouse</h1>
        <p>Your trusted partner in finding the perfect home, apartment, or room.</p>
      </header>

      <div className="about-content">
        <div className="about-grid">
          <div className="about-text">
            <h2>Who We Are</h2>
            <p>
              RentalHouse is a modern property rental platform dedicated to making the search for your next living space seamless and stress-free. Whether you are looking for a cozy city apartment, a spacious family house, or a luxurious villa, we bring the best spaces right to your screen.
            </p>
            <p>
              Our platform allows administrators to manage listings efficiently, ensuring that all information, pricing, and high-quality images are up to date for our users.
            </p>
          </div>
          <div className="about-image">
            <img 
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80" 
              alt="About RentalHouse" 
            />
          </div>
        </div>

        <div className="about-features">
          <div className="feature-box">
            <h3>🏠 Verified Listings</h3>
            <p>All properties are carefully reviewed and listed by our expert administrators.</p>
          </div>
          <div className="feature-box">
            <h3>💰 Best Prices</h3>
            <p>Find options that fit every budget, transparently displayed per night.</p>
          </div>
          <div className="feature-box">
            <h3>⚡ Easy Browsing</h3>
            <p>Quick search options and responsive design for an effortless experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;