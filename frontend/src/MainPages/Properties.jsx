import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Properties.css";

const PropertyCarousel = ({ item }) => {
  let allImages = [];
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    allImages = item.images;
  } else if (item.image) {
    allImages = [item.image];
  } else if (item.imageUrl) {
    allImages = [item.imageUrl];
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <img
        src="https://via.placeholder.com/300"
        alt="Default"
        className="property-img"
        style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
      />
    );
  }

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const imageSrc = allImages[currentIndex].startsWith("http")
    ? allImages[currentIndex]
    : `http://localhost:5000/${allImages[currentIndex]}`;

  return (
    <div className="carousel-container" style={{ position: "relative" }}>
      <img
        src={imageSrc}
        alt="Property"
        className="property-img"
        style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
      />
      {allImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ❮
          </button>
          <button
            type="button"
            onClick={nextImage}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ❯
          </button>
          <span
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              padding: "2px 6px",
              fontSize: "12px",
              borderRadius: "4px",
            }}
          >
            {currentIndex + 1} / {allImages.length}
          </span>
        </>
      )}
    </div>
  );
};

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);

  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/properties")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setProperties(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setProperties(response.data.data);
        } else {
          setProperties([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching properties:", error);
        setProperties([]);
      });
  }, []);

  return (
    <div className="properties-page-container">
      <div className="properties-header">
        <h1>All Available Properties</h1>
        <p>Explore all the homes, apartments, and rooms added by the admin.</p>
      </div>

      <div className="properties-content" style={{ position: "relative" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <button
            type="button"
            onClick={scrollLeft}
            style={{
              position: "absolute",
              left: "-60px",
              zIndex: 10,
              background: "#2e68c4",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            ❮
          </button>

          <div
            ref={scrollContainerRef}
            style={{
              display: "flex",
              gap: "20px",
              overflowX: "auto",
              scrollBehavior: "smooth",
              paddingBottom: "15px",
              paddingTop: "10px",
              width: "100%",
              scrollbarWidth: "none",
            }}
          >
            {Array.isArray(properties) && properties.length > 0 ? (
              properties.map((item) => {
                const votesCount =
                  typeof item.ratingCount === "number"
                    ? item.ratingCount
                    : Array.isArray(item.ratings)
                    ? item.ratings.length
                    : 0;

                const avgRating =
                  votesCount === 0
                    ? "0.0"
                    : Array.isArray(item.ratings) && item.ratings.length > 0
                    ? (
                        item.ratings.reduce((sum, r) => sum + Number(r.stars || 0), 0) /
                        item.ratings.length
                      ).toFixed(1)
                    : Number(item.rating || 0).toFixed(1);

                return (
                  <div
                    className="property-card"
                    key={item._id}
                    onClick={() => navigate(`/property/${item._id}`)}
                    style={{ cursor: "pointer", minWidth: "300px", maxWidth: "300px", flexShrink: 0 }}
                  >
                    <PropertyCarousel item={item} />

                    <div className="property-details">
                      <h3>{item.title}</h3>
                      <p className="location">{item.location}</p>
                      <p className="desc" style={{ fontSize: "13px", color: "#475569", margin: "4px 0" }}>
                        {item.description}
                      </p>

                      <div className="card-footer">
                        <span className="rating">
                          ⭐ {avgRating} ({votesCount} {votesCount === 1 ? "vote" : "votes"})
                        </span>
                        <span className="price">${item.price} / night</span>
                      </div>

                      <p className="details-txt" style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>
                        👥 {item.guests ?? 2} Guests | 🛏️ {item.beds} Beds | 🛁 {item.baths} Baths | 🚗 {item.cars} Cars | 📐 {item.sqft} sqft
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-properties">
                <p>No properties found. Please add some properties from the admin panel.</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={scrollRight}
            style={{
              position: "absolute",
              right: "-60px",
              zIndex: 10,
              background: "#2e68c4",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            ❯
          </button>
        </div>
      </div>
    </div>
  );
};

export default Properties;