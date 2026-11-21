import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../Auth/UserContext";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userInfo, setUserInfo } = useContext(UserContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Gabim gjatë daljes:", err);
    } finally {
      setUserInfo(null);
      setIsOpen(false);
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">RH</span> RentalHouse
        </Link>

        <ul className={`nav-menu ${isOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={toggleMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/properties" className="nav-links" onClick={toggleMenu}>
              Properties
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-links" onClick={toggleMenu}>
              About Us
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-links" onClick={toggleMenu}>
              Contact
            </Link>
          </li>

          {(userInfo?.isAdmin || userInfo?.role?.toLowerCase() === "admin") && (
            <>
              <li className="nav-item">
                <Link to="/admin/dashboard" className="nav-links" onClick={toggleMenu} style={{ color: "#2563eb", fontWeight: "bold" }}>
                  Admin Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/bookings" className="nav-links" onClick={toggleMenu} style={{ color: "#2563eb", fontWeight: "bold" }}>
                  Admin Bookings
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-right" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {userInfo ? (
            <>
              <Link 
                to="/profile" 
                className="nav-links" 
                style={{ fontWeight: "600", color: "#2563eb", textDecoration: "none" }}
              >
                👤 {userInfo.username || userInfo.name || "My Profile"}
              </Link>
              <button 
                onClick={handleLogout} 
                className="nav-btn" 
                style={{ backgroundColor: "#ef4444", border: "none", cursor: "pointer" }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-btn">
              Sign In
            </Link>
          )}
          
          <div className="menu-icon" onClick={toggleMenu}>
            <div className={`hamburger ${isOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;