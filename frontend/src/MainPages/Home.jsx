import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";

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

const Home = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);

  const [searchParams, setSearchParams] = useState({
    location: "",
    guests: "1",
    type: "All",
    priceRange: "",
  });

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
        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }
        setProperties(data);
        setFilteredProperties(data);
      })
      .catch((error) => {
        console.error("Error fetching properties:", error);
        setProperties([]);
        setFilteredProperties([]);
      });
  }, []);

  const handleChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const filtered = properties.filter((item) => {
      const matchesLocation =
        searchParams.location.trim() === "" ||
        (item.location && item.location.toLowerCase().includes(searchParams.location.toLowerCase())) ||
        (item.title && item.title.toLowerCase().includes(searchParams.location.toLowerCase()));

      const requestedGuests = parseInt(searchParams.guests, 10) || 1;
      const propertyGuests = item.guests !== undefined && item.guests !== null ? parseInt(item.guests, 10) : 2;
      const matchesGuests = propertyGuests >= requestedGuests;

      const selectedType = searchParams.type.toLowerCase();
      let matchesType = true;

      if (selectedType !== "all") {
        const titleMatch = item.title && item.title.toLowerCase().includes(selectedType);
        const descMatch = item.description && item.description.toLowerCase().includes(selectedType);

        let extraMatch = false;
        if (selectedType === "apartment") {
          extraMatch = item.title?.toLowerCase().includes("apt") || item.title?.toLowerCase().includes("flat");
        } else if (selectedType === "house") {
          extraMatch = item.title?.toLowerCase().includes("home") || item.title?.toLowerCase().includes("shtëpi");
        }

        matchesType = titleMatch || descMatch || extraMatch;
      }

      let matchesPrice = true;
      if (searchParams.priceRange.trim() !== "") {
        const maxPrice = parseFloat(searchParams.priceRange);
        if (!isNaN(maxPrice)) {
          matchesPrice = item.price <= maxPrice;
        }
      }

      return matchesLocation && matchesGuests && matchesType && matchesPrice;
    });

    setFilteredProperties(filtered);
  };

  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>Browse Homes, Apartments & Rentals with Ease</h1>
      </header>

      <form className="search-bar-container" onSubmit={handleSearchSubmit}>
        <div className="search-items-wrapper">
          <div className="search-item">
            <span className="search-icon">📍</span>
            <div className="search-text">
              <label className="search-label">Location</label>
              <input
                type="text"
                name="location"
                className="search-input-field"
                placeholder="Where are you going?"
                value={searchParams.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="search-divider"></div>

          <div className="search-item">
            <span className="search-icon">👤</span>
            <div className="search-text">
              <label className="search-label">Guests</label>
              <select
                name="guests"
                className="search-input-field"
                value={searchParams.guests}
                onChange={handleChange}
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="6">6+ Guests</option>
              </select>
            </div>
          </div>

          <div className="search-divider"></div>

          <div className="search-item">
            <span className="search-icon">🏠</span>
            <div className="search-text">
              <label className="search-label">Type</label>
              <select
                name="type"
                className="search-input-field"
                value={searchParams.type}
                onChange={handleChange}
              >
                <option value="All">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
              </select>
            </div>
          </div>

          <div className="search-divider"></div>

          <div className="search-item">
            <span className="search-icon">💰</span>
            <div className="search-text">
              <label className="search-label">Price Max ($)</label>
              <input
                type="text"
                name="priceRange"
                className="search-input-field"
                placeholder="e.g. 200"
                value={searchParams.priceRange}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="search-submit-btn">
          Search
        </button>
      </form>

      <div className="properties-section" style={{ position: "relative" }}>
        <h2>Browse the Spaces</h2>

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <button
            type="button"
            onClick={scrollLeft}
            style={{
              position: "absolute",
              left: "-20px",
              zIndex: 10,
              background: "#3b82f6",
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
            {Array.isArray(filteredProperties) && filteredProperties.length > 0 ? (
              filteredProperties.map((item) => {
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
                        👥 {item.guests} Guests | 🛏️ {item.beds} Beds | 🛁 {item.baths} Baths | 🚗 {item.cars} Cars | 📐 {item.sqft} sqft
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ textAlign: "center", width: "100%", color: "#64748b", padding: "20px" }}>
                No properties match your search criteria.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={scrollRight}
            style={{
              position: "absolute",
              right: "-20px",
              zIndex: 10,
              background: "#3b82f6",
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

export default Home;