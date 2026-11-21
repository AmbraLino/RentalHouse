import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../Auth/UserContext";
import Booking from "./Booking";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext);

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/properties/${id}`)
      .then((response) => {
        const propData = response.data.property || response.data.data || response.data;
        setProperty(propData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching property details:", err);
        setError("Failed to load property details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Loading details...</div>;
  if (error) return <div style={{ textAlign: "center", padding: "50px", color: "red" }}>{error}</div>;
  if (!property) return <div style={{ textAlign: "center", padding: "50px" }}>Property not found.</div>;

  let allImages = [];
  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    allImages = property.images;
  } else if (property.image) {
    allImages = [property.image];
  } else if (property.imageUrl) {
    allImages = [property.imageUrl];
  }

  const activeImage = allImages.length > 0
    ? (allImages[currentImageIndex].startsWith("http") ? allImages[currentImageIndex] : `http://localhost:5000/${allImages[currentImageIndex]}`)
    : "https://via.placeholder.com/600";

  const propertyId = property?._id || property?.id;

  return (
    <div className="property-details-container" style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px" }}
      >
        ← Back
      </button>

      <h1>{property.title || "Property Details"}</h1>
      <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "20px" }}>📍 {property.location || "Location not specified"}</p>

      {/* Karuseli i Fotove */}
      <div className="property-main-image-container" style={{ position: "relative", marginBottom: "20px" }}>
        <img
          src={activeImage}
          alt={property.title}
          style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "12px" }}
        />

        {allImages.length > 1 && (
          <div style={{ display: "flex", gap: "10px", marginTop: "10px", overflowX: "auto" }}>
            {allImages.map((img, idx) => {
              const thumbSrc = img.startsWith("http") ? img : `http://localhost:5000/${img}`;
              return (
                <img
                  key={idx}
                  src={thumbSrc}
                  alt="Thumbnail"
                  onClick={() => setCurrentImageIndex(idx)}
                  style={{
                    width: "90px", height: "70px", objectFit: "cover", borderRadius: "6px", cursor: "pointer",
                    border: currentImageIndex === idx ? "3px solid #3b82f6" : "1px solid #cbd5e1"
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Pjesa e Informacionit dhe Box-i i Rezervimit */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>

        {/* Detajet e Pronës */}
        <div className="property-info-card" style={{ background: "#f8fafc", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#1e293b", margin: "0 0 15px 0" }}>
            ${property.price || 0} <span style={{ fontSize: "16px", fontWeight: "normal", color: "#64748b" }}>/ night</span>
          </h2>
          <hr style={{ border: "0", borderTop: "1px solid #e2e8f0", margin: "15px 0" }} />
          <h3>Description</h3>
          <p style={{ lineHeight: "1.6", color: "#475569", marginBottom: "20px" }}>{property.description || "No description provided."}</p>

          <h3>Amenities & Specifications</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px", marginTop: "10px", fontSize: "16px" }}>
            {/* U shtua shfaqja e Max Guests këtu */}
            <div>👥 <strong>Max Guests:</strong> {property.guests ?? "N/A"}</div>
            <div>🛏️ <strong>Beds:</strong> {property.beds ?? "N/A"}</div>
            <div>🛁 <strong>Baths:</strong> {property.baths ?? "N/A"}</div>
            <div>🚗 <strong>Cars:</strong> {property.cars ?? "N/A"}</div>
            <div>📐 <strong>Area:</strong> {property.sqft ?? "N/A"} sqft</div>
          </div>
        </div>

        <div>
          <Booking
            propertyId={propertyId}
            pricePerNight={property.price || 0}
            maxGuests={property.guests || 1}
          />
        </div>

      </div>
    </div>
  );
};

export default PropertyDetails;