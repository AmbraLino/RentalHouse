import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../Auth/UserContext";
import { useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./UserProfile.css";

const StarRatingSelector = ({ value = 0, onSelect }) => {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onSelect(star)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              padding: 0,
              color: active ? "#f59e0b" : "#cbd5e1",
            }}
            title={`${star} ${star === 1 ? "star" : "stars"}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

const UserProfile = () => {
  const { userInfo } = useContext(UserContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingBookingId, setEditingBookingId] = useState(null);
  const [newCheckIn, setNewCheckIn] = useState("");
  const [newCheckOut, setNewCheckOut] = useState("");

  const [paymentMethods, setPaymentMethods] = useState({});

  const [reviewingBookingId, setReviewingBookingId] = useState(null);
  const [selectedStars, setSelectedStars] = useState({});
  const [reviewStatusMsg, setReviewStatusMsg] = useState({});

  const navigate = useNavigate();

  const currentUserId =
    userInfo?._id || userInfo?.id || userInfo?.user?._id || userInfo?.user?.id;

  const paypalClientId =
    process.env.REACT_APP_PAYPAL_CLIENT_ID ||
    import.meta.env?.VITE_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!userInfo) return;

    axios
      .get("http://localhost:5000/api/bookings/my-bookings", {
        withCredentials: true,
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setBookings(res.data);
        } else if (res.data && Array.isArray(res.data.bookings)) {
          setBookings(res.data.bookings);
        } else if (res.data && Array.isArray(res.data.data)) {
          setBookings(res.data.data);
        } else {
          setBookings([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setBookings([]);
        setLoading(false);
      });
  }, [userInfo]);

  const calculateTotalPrice = (booking) => {
    if (booking.totalPrice && booking.totalPrice > 0) return booking.totalPrice;
    if (!booking.checkIn || !booking.checkOut) return 0;

    const start = new Date(booking.checkIn);
    const end = new Date(booking.checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const pricePerNight = booking.property?.price || 0;
    return diffDays > 0 ? diffDays * pricePerNight : pricePerNight;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this reservation?"))
      return;

    try {
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        withCredentials: true,
      });
      setBookings(bookings.filter((b) => b._id !== bookingId));
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert(
        err.response?.data?.message || "Error during reservation deletion."
      );
    }
  };

  const startEditing = (booking) => {
    setEditingBookingId(booking._id);
    setNewCheckIn(formatDateForInput(booking.checkIn));
    setNewCheckOut(formatDateForInput(booking.checkOut));
  };

  const handleUpdate = async (bookingId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          checkIn: newCheckIn,
          checkOut: newCheckOut,
        },
        { withCredentials: true }
      );

      const updated = response.data.booking || response.data;
      setBookings(bookings.map((b) => (b._id === bookingId ? updated : b)));
      setEditingBookingId(null);
      alert("The reservation was updated successfully!");
    } catch (err) {
      console.error("Error updating booking:", err);
      alert(
        err.response?.data?.message || "Error while updating the reservation."
      );
    }
  };

  const handlePaymentMethodChange = (bookingId, method) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [bookingId]: method,
    }));
  };

  const getPropertyId = (booking) => {
    if (typeof booking.property === "object" && booking.property !== null) {
      return booking.property._id;
    }
    return booking.property;
  };

  const syncPropertyInBookings = (propertyId, updatedProperty) => {
    setBookings((prev) =>
      prev.map((booking) => {
        const bPropId = getPropertyId(booking);
        if (String(bPropId) !== String(propertyId)) return booking;
        return {
          ...booking,
          property:
            typeof booking.property === "object" && booking.property !== null
              ? { ...booking.property, ...updatedProperty }
              : updatedProperty,
        };
      })
    );
  };

  const toggleReviewBox = (booking) => {
    if (reviewingBookingId === booking._id) {
      setReviewingBookingId(null);
      return;
    }

    const propObj =
      typeof booking.property === "object" && booking.property !== null
        ? booking.property
        : null;

    const existingUserRating =
      currentUserId && Array.isArray(propObj?.ratings)
        ? propObj.ratings.find((r) => {
            const rId =
              typeof r.user === "object" && r.user !== null ? r.user._id : r.user;
            return String(rId) === String(currentUserId);
          })?.stars
        : null;

    setSelectedStars((prev) => ({
      ...prev,
      [booking._id]: existingUserRating || prev[booking._id] || 0,
    }));
    setReviewingBookingId(booking._id);
  };

  const handleSubmitRating = async (bookingId, propertyId, stars) => {
    if (!propertyId || !stars) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/properties/${propertyId}/rate`,
        { stars },
        { withCredentials: true }
      );

      const updatedProp = res.data?.property || res.data?.data || res.data;

      const votes =
        typeof updatedProp?.ratingCount === "number"
          ? updatedProp.ratingCount
          : Array.isArray(updatedProp?.ratings)
          ? updatedProp.ratings.length
          : 0;

      const newAvg =
        votes === 0
          ? 0
          : Array.isArray(updatedProp?.ratings) && updatedProp.ratings.length > 0
          ? updatedProp.ratings.reduce((sum, r) => sum + Number(r.stars || 0), 0) /
            updatedProp.ratings.length
          : Number(updatedProp?.rating || 0);

      const normalizedProp = {
        ...updatedProp,
        rating: Number(newAvg.toFixed(1)),
        ratingCount: votes,
      };

      syncPropertyInBookings(propertyId, normalizedProp);

      setReviewStatusMsg((prev) => ({
        ...prev,
        [bookingId]: `Rated ${stars} ★! Average: ${Number(newAvg).toFixed(
          1
        )} (${votes} ${votes === 1 ? "vote" : "votes"})`,
      }));
    } catch (err) {
      console.error("Error rating property:", err);
      alert(err.response?.data?.message || "Failed to submit rating.");
    }
  };

  if (!userInfo) {
    return (
      <div className="profile-container">
        <div className="empty-state-box">
          <h2>Please sign in to view your profile.</h2>
          <button
            onClick={() => navigate("/login")}
            className="profile-login-btn"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const userName =
    userInfo?.username ||
    userInfo?.name ||
    userInfo?.fullName ||
    userInfo?.user?.username ||
    userInfo?.user?.name ||
    "User";
  const userEmail =
    userInfo?.email ||
    userInfo?.mail ||
    userInfo?.user?.email ||
    "Email not available";
  const initial = userName !== "User" ? userName.charAt(0).toUpperCase() : "U";
  const isAdminUser =
    userInfo?.isAdmin || userInfo?.role?.toLowerCase() === "admin";

  return (
    <PayPalScriptProvider
      options={{ "client-id": paypalClientId, currency: "USD" }}
    >
      <div className="profile-container">
        <div className="profile-header-card">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-user-info">
            <h2>{userName}</h2>
            <p className="profile-email">✉️ {userEmail}</p>
            <p className="profile-role">
              🏷️ Role: {isAdminUser ? "Administrator" : "Customer"}
            </p>
          </div>
        </div>

        <h3 className="bookings-section-title">My Bookings</h3>

        {loading ? (
          <p>Loading bookings...</p>
        ) : Array.isArray(bookings) && bookings.length > 0 ? (
          <div className="bookings-list">
            {bookings.map((b, index) => {
              const totalPrice = calculateTotalPrice(b);
              const isEditing = editingBookingId === b._id;
              const isReviewOpen = reviewingBookingId === b._id;
              const selectedMethod =
                paymentMethods[b._id] || b.paymentMethod || "cash";
              const isPaid = b.paymentStatus === "Paid";

              const formattedCheckIn =
                b.checkIn && !isNaN(new Date(b.checkIn))
                  ? new Date(b.checkIn).toLocaleDateString()
                  : "N/A";

              const formattedCheckOut =
                b.checkOut && !isNaN(new Date(b.checkOut))
                  ? new Date(b.checkOut).toLocaleDateString()
                  : "N/A";

              const propertyObj =
                typeof b.property === "object" && b.property !== null
                  ? b.property
                  : null;
              const propertyId = getPropertyId(b);
              const propertyTitle =
                propertyObj?.title || "Reserved Property";
              const propertyLocation =
                propertyObj?.location || "Location not specified";

              const votesCount =
                typeof propertyObj?.ratingCount === "number"
                  ? propertyObj.ratingCount
                  : Array.isArray(propertyObj?.ratings)
                  ? propertyObj.ratings.length
                  : 0;

              const avgRating =
                votesCount === 0
                  ? "0.0"
                  : Array.isArray(propertyObj?.ratings) &&
                    propertyObj.ratings.length > 0
                  ? (
                      propertyObj.ratings.reduce(
                        (sum, r) => sum + Number(r.stars || 0),
                        0
                      ) / propertyObj.ratings.length
                    ).toFixed(1)
                  : Number(propertyObj?.rating || 0).toFixed(1);

              const rawImage =
                Array.isArray(propertyObj?.images) &&
                propertyObj.images.length > 0
                  ? propertyObj.images[0]
                  : null;

              const propertyImage = rawImage
                ? rawImage.startsWith("http")
                  ? rawImage
                  : `http://localhost:5000${
                      rawImage.startsWith("/") ? "" : "/"
                    }${rawImage}`
                : "https://via.placeholder.com/150?text=No+Image";

              return (
                <div
                  key={b._id || index}
                  className="booking-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: "20px",
                    padding: "20px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <img
                    src={propertyImage}
                    alt={propertyTitle}
                    style={{
                      width: "130px",
                      height: "95px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div className="booking-property-details">
                      <h4
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "18px",
                          color: "#1e293b",
                        }}
                      >
                        {propertyTitle}
                      </h4>
                      <p
                        className="booking-location"
                        style={{
                          margin: 0,
                          color: "#64748b",
                          fontSize: "14px",
                        }}
                      >
                        📍 {propertyLocation} • ⭐ {avgRating} ({votesCount}{" "}
                        {votesCount === 1 ? "vote" : "votes"})
                      </p>

                      {isEditing ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "15px",
                            margin: "10px 0",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                fontSize: "12px",
                                display: "block",
                                fontWeight: "bold",
                              }}
                            >
                              Check-In:
                            </label>
                            <input
                              type="date"
                              value={newCheckIn}
                              onChange={(e) => setNewCheckIn(e.target.value)}
                              style={{
                                padding: "6px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: "12px",
                                display: "block",
                                fontWeight: "bold",
                              }}
                            >
                              Check-Out:
                            </label>
                            <input
                              type="date"
                              value={newCheckOut}
                              onChange={(e) => setNewCheckOut(e.target.value)}
                              style={{
                                padding: "6px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div
                          className="booking-dates"
                          style={{
                            marginTop: "6px",
                            display: "flex",
                            gap: "15px",
                            fontSize: "14px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              background: "#f1f5f9",
                              padding: "4px 10px",
                              borderRadius: "6px",
                            }}
                          >
                            📅 <strong>Check-In:</strong> {formattedCheckIn}
                          </span>
                          <span
                            style={{
                              background: "#f1f5f9",
                              padding: "4px 10px",
                              borderRadius: "6px",
                            }}
                          >
                            📅 <strong>Check-Out:</strong> {formattedCheckOut}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* PAYMENT METHOD SELECTION */}
                    {!isPaid ? (
                      <div
                        style={{
                          marginTop: "8px",
                          background: "#f8fafc",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 6px 0",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#334155",
                          }}
                        >
                          Select Payment Method:
                        </p>
                        <div
                          style={{
                            display: "flex",
                            gap: "15px",
                            alignItems: "center",
                          }}
                        >
                          <label
                            style={{
                              fontSize: "13px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <input
                              type="radio"
                              name={`payment-${b._id}`}
                              value="cash"
                              checked={selectedMethod === "cash"}
                              onChange={() =>
                                handlePaymentMethodChange(b._id, "cash")
                              }
                            />
                            💵 Cash on Delivery
                          </label>
                          <label
                            style={{
                              fontSize: "13px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <input
                              type="radio"
                              name={`payment-${b._id}`}
                              value="online"
                              checked={selectedMethod === "online"}
                              onChange={() =>
                                handlePaymentMethodChange(b._id, "online")
                              }
                            />
                            💳 Online with PayPal
                          </label>
                        </div>

                        {selectedMethod === "online" && (
                          <div style={{ marginTop: "10px", maxWidth: "250px" }}>
                            <PayPalButtons
                              style={{ layout: "horizontal", height: 35 }}
                              createOrder={(data, actions) => {
                                return actions.order.create({
                                  purchase_units: [
                                    {
                                      amount: {
                                        value: totalPrice.toString(),
                                      },
                                    },
                                  ],
                                });
                              }}
                              onApprove={(data, actions) => {
                                return actions.order
                                  .capture()
                                  .then(async (details) => {
                                    try {
                                      const res = await axios.post(
                                        "http://localhost:5000/api/bookings/pay-paypal",
                                        {
                                          bookingId: b._id,
                                          paypalOrderId: data.orderID,
                                        },
                                        { withCredentials: true }
                                      );

                                      setBookings((prev) =>
                                        prev.map((item) =>
                                          item._id === b._id
                                            ? res.data.booking
                                            : item
                                        )
                                      );
                                      alert(
                                        `The payment was successfully made by ${details.payer.name.given_name}!`
                                      );
                                    } catch (err) {
                                      console.error(
                                        "Error saving payment:",
                                        err
                                      );
                                      alert(
                                        "The payment went through on PayPal, but there was an error saving it to the server.."
                                      );
                                    }
                                  });
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: "8px",
                          background: "#ecfdf5",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #a7f3d0",
                          color: "#065f46",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                         Paid Online via PayPal
                      </div>
                    )}

                    {isReviewOpen && (
                      <div
                        style={{
                          marginTop: "8px",
                          background: "#fffbeb",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #fde68a",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <strong style={{ fontSize: "13px", color: "#92400e" }}>
                          Rate this property (1–5 stars):
                        </strong>
                        <StarRatingSelector
                          value={selectedStars[b._id] || 0}
                          onSelect={(stars) => {
                            setSelectedStars((prev) => ({
                              ...prev,
                              [b._id]: stars,
                            }));
                            handleSubmitRating(b._id, propertyId, stars);
                          }}
                        />

                        {reviewStatusMsg[b._id] && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "#065f46",
                              fontWeight: "600",
                            }}
                          >
                            {reviewStatusMsg[b._id]}
                          </p>
                        )}
                      </div>
                    )}

                    <div
                      className="booking-price-status"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "5px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span
                          className="booking-price"
                          style={{
                            fontWeight: "bold",
                            fontSize: "18px",
                            color: "#2563eb",
                          }}
                        >
                          ${totalPrice}
                        </span>
                        <span
                          className="booking-status-badge"
                          style={{
                            background: isPaid ? "#d1fae5" : "#fef3c7",
                            color: isPaid ? "#065f46" : "#92400e",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {isPaid ? "Paid" : "Pending Payment"}
                        </span>
                      </div>

                      <div
                        style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleReviewBox(b)}
                          style={{
                            background: "#f59e0b",
                            color: "#fff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "500",
                          }}
                        >
                          {isReviewOpen ? "Close Review" : "⭐ Review"}
                        </button>

                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdate(b._id)}
                              style={{
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "500",
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingBookingId(null)}
                              style={{
                                background: "#64748b",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "500",
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(b)}
                              style={{
                                background: "#3b82f6",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "500",
                              }}
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleDelete(b._id)}
                              style={{
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "500",
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state-box">
            <p>You haven't made any bookings yet.</p>
            <button
              onClick={() => navigate("/properties")}
              className="profile-login-btn"
            >
              Browse Properties
            </button>
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  );
};

export default UserProfile;