import React, { useState } from "react";
import "./Contact.css";

const Contact =() =>{
    const [formData, setFormData] = useState({
        email:"",
        name:"",
        message:""
    });
    const handleChange=(e)=>{
        setFormData({
            ...formData,[e.target.name]:e.target.value});
        };
                
    const handleSubmit=(e)=>{
        e.preventDefault();
        alert("Thank you! Your message has been sent successfully.");
        setFormData({email:"",name:"",message:""});
    };
    
  return (
    <div className="contact-container">
      <header className="contact-hero">
        <h1>Contact Us</h1>
        <p>Have questions or need assistance? Get in touch with us.</p>
      </header>

      <div className="contact-content">
        <div className="contact-wrapper">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>We would love to hear from you. Send us a message and we will respond as soon as possible.</p>
            
            <div className="info-item">
              <span>📍</span>
              <p>Tirana, Albania</p>
            </div>
            <div className="info-item">
              <span>📧</span>
              <p>support@rentalhouse.com</p>
            </div>
            <div className="info-item">
              <span>📞</span>
              <p>+355 69 00 00 000</p>
            </div>
          </div>
 
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter your name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div> 
            

            <div className="form-group">
              <label>Your Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Enter your email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea 
                name="message" 
                rows="5" 
                placeholder="Write your message here..." 
                value={formData.message} 
                onChange={handleChange} 
                required 
              ></textarea>
            </div>

            <button type="submit" className="contact-submit-btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;