import React, { useState } from "react";
import axios from "axios";
import "./Booking.css";

const Booking = ({ propertyId, pricePerNight, maxGuests = 1 }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1); // <--- State për numrin e mysafirëve
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const calculatePreviewTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * pricePerNight : 0;
  };

  const totalPricePreview = calculatePreviewTotal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError("The check-out date must be after the check-in date!");
      setLoading(false);
      return;
    }

    if (guests < 1 || guests > maxGuests) {
      setError(`Number of guests must be between 1 and ${maxGuests}.`);
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/bookings",
        {
          propertyId,
          checkIn,
          checkOut,
          guests: Number(guests), // <--- Dërgohet edhe numri i mysafirëve në backend
        },
        { withCredentials: true }
      );

      setMessage("The booking was completed successfully!");
      setCheckIn("");
      setCheckOut("");
      setGuests(1);
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.response?.data?.message || "An error occurred during the booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-card">
      <h3>Book this property</h3>
      <p className="price-tag">${pricePerNight} / night</p>

      {message && <div className="success-alert" style={{ color: "green", marginBottom: "10px" }}>{message}</div>}
      {error && <div className="error-alert" style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group" style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Check-In Date</label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut && e.target.value >= checkOut) {
                setCheckOut("");
              }
            }}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div className="input-group" style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Check-Out Date</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today} 
            onChange={(e) => setCheckOut(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        {/* Fusha e re për zgjedhjen e mysafirëve */}
        <div className="input-group" style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Guests (Max: {maxGuests})
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            required
            style={{ width: "100%", padding: "8px" }}
          >
            {[...Array(maxGuests)].map((_, index) => {
              const num = index + 1;
              return (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Guest" : "Guests"}
                </option>
              );
            })}
          </select>
        </div>

        {totalPricePreview > 0 && (
          <div className="total-preview" style={{ marginBottom: "15px" }}>
            <span>Total to pay: </span>
            <strong>${totalPricePreview}</strong>
          </div>
        )}

        <button type="submit" className="book-btn" disabled={loading} style={{ width: "100%", padding: "10px", background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" }}>
          {loading ? "Processing..." : "Reserve Now"}
        </button>
      </form>
    </div>
  );
};

export default Booking;