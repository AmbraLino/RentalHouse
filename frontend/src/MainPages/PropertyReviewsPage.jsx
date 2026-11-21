import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../Auth/UserContext";

const StarRatingInput = ({ currentRating = 0, onRate, disabled }) => {
  const [hoverStar, setHoverStar] = useState(0);

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const active = starValue <= (hoverStar || Math.round(currentRating));
        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            onMouseEnter={() => setHoverStar(starValue)}
            onMouseLeave={() => setHoverStar(0)}
            onClick={() => onRate(starValue)}
            style={{
              background: "none",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: "22px",
              padding: 0,
              color: active ? "#f59e0b" : "#cbd5e1",
              transition: "transform 0.15s ease",
            }}
            title={`Rate ${starValue} ${starValue === 1 ? "star" : "stars"}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

const PropertyReviewsPage = () => {
  const { userInfo } = useContext(UserContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentUserId = userInfo?._id || userInfo?.id;

  const loadProperties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/properties", {
        withCredentials: true,
      });
      setProperties(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      setError("It was not possible to load the houses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const updateSingleProperty = (updatedProp) => {
    setProperties((prev) =>
      prev.map((item) => (item._id === updatedProp._id ? updatedProp : item))
    );
  };

  const handleRate = async (propertyId, stars) => {
    setError("");
    setMessage("");

    if (!currentUserId) {
      return setError("You must be logged in as a user to rate.");
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/properties/${propertyId}/rate`,
        { stars },
        { withCredentials: true }
      );
      updateSingleProperty(res.data);
      setMessage(`You gave a rating of ${stars} ${stars === 1 ? "star" : "stars"}!`);
    } catch (err) {
      setError(err.response?.data?.message || "Error while sending the rating.");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading the houses...</p>;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px" }}>
      <h1>Home Ratings</h1>
      <p style={{ color: "#64748b" }}>
        Rate the homes you prefer. Averages and vote counts are calculated automatically.
      </p>

      {error && <div style={{ color: "#dc2626", marginBottom: "12px" }}>{error}</div>}
      {message && <div style={{ color: "#16a34a", marginBottom: "12px" }}>{message}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {properties.map((item) => {
          const votesCount =
            typeof item.ratingCount === "number"
              ? item.ratingCount
              : Array.isArray(item.ratings)
              ? item.ratings.length
              : 0;

          const firstImg =
            Array.isArray(item.images) && item.images.length > 0
              ? item.images[0].startsWith("http")
                ? item.images[0]
                : `http://localhost:5000/${item.images[0]}`
              : "https://via.placeholder.com/300x180";

          return (
            <div
              key={item._id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <img
                src={firstImg}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "170px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "12px",
                }}
              />

              <h3 style={{ margin: "0 0 4px" }}>{item.title}</h3>
              <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "14px" }}>
                {item.location} • <strong>${item.price}</strong> / night
              </p>

              <p style={{ fontSize: "14px", margin: "8px 0" }}>
                ⭐ <strong>{Number(item.rating || 0).toFixed(1)}</strong> / 5 ({votesCount}{" "}
                {votesCount === 1 ? "vote" : "votes"})
              </p>

              <div style={{ margin: "10px 0" }}>
                <span style={{ fontSize: "13px", color: "#475569" }}>Provide your rating:</span>
                <StarRatingInput
                  currentRating={item.rating}
                  onRate={(stars) => handleRate(item._id, stars)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyReviewsPage;