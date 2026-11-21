import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../Auth/UserContext";
import { useNavigate } from "react-router-dom";
import "./AdminBookings.css";

const AdminBookings = () => {
  const { userInfo } = useContext(UserContext);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingBookingId, setEditingBookingId] = useState(null);
  const [newCheckIn, setNewCheckIn] = useState("");
  const [newCheckOut, setNewCheckOut] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const isAdminUser =
      userInfo?.isAdmin || userInfo?.role?.toLowerCase() === "admin";

    if (!userInfo || !isAdminUser) {
      navigate("/");
      return;
    }

    Promise.all([
      axios.get("http://localhost:5000/api/bookings/admin/all-bookings", {
        withCredentials: true,
      }),
      axios.get("http://localhost:5000/api/properties", {
        withCredentials: true,
      }),
    ])
      .then(([bookingsRes, propertiesRes]) => {
        const data = bookingsRes.data;
        if (Array.isArray(data)) {
          setBookings(data);
        } else if (data && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else if (data && Array.isArray(data.data)) {
          setBookings(data.data);
        } else {
          setBookings([]);
        }

        const propsData = propertiesRes.data;
        if (Array.isArray(propsData)) {
          setProperties(propsData);
        } else if (propsData && Array.isArray(propsData.data)) {
          setProperties(propsData.data);
        } else {
          setProperties([]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin data:", err);
        setBookings([]);
        setProperties([]);
        setLoading(false);
      });
  }, [userInfo, navigate]);

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
    if (
      !window.confirm("Admin: Are you sure you want to delete this reservation?")
    )
      return;

    try {
      await axios.delete(
        `http://localhost:5000/api/bookings/admin/${bookingId}`,
        {
          withCredentials: true,
        }
      );
      setBookings(bookings.filter((b) => b && b._id !== bookingId));
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert(err.response?.data?.message || "Error during deletion.");
    }
  };

  const startEditing = (booking) => {
    if (!booking?._id) return;
    setEditingBookingId(booking._id);
    setNewCheckIn(formatDateForInput(booking.checkIn));
    setNewCheckOut(formatDateForInput(booking.checkOut));
  };

  const handleUpdate = async (bookingId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/bookings/admin/${bookingId}`,
        {
          checkIn: newCheckIn,
          checkOut: newCheckOut,
        },
        { withCredentials: true }
      );

      const updated = response.data.booking || response.data;
      setBookings(bookings.map((b) => (b?._id === bookingId ? updated : b)));
      setEditingBookingId(null);
      alert("The reservation was successfully updated by the Admin!");
    } catch (err) {
      console.error("Error updating booking:", err);
      alert(err.response?.data?.message || "Error during update.");
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/bookings/admin/approve/${bookingId}`,
        {},
        { withCredentials: true }
      );

      const updated = response.data.booking || response.data;
      setBookings(bookings.map((b) => (b?._id === bookingId ? updated : b)));
      alert("The booking and payment were accepted by the Admin!");
    } catch (err) {
      console.error("Error approving booking:", err);
      alert(err.response?.data?.message || "Error during receipt.");
    }
  };

  const isAdminUser =
    userInfo?.isAdmin || userInfo?.role?.toLowerCase() === "admin";

  if (!userInfo || !isAdminUser) {
    return <p className="access-denied">Access Denied. Admins only.</p>;
  }

  const allUserRatings = properties.flatMap((prop) => {
    if (!Array.isArray(prop.ratings)) return [];
    const propVotes = prop.ratingCount ?? prop.ratings.length;
    const propAvg =
      propVotes === 0
        ? "0.0"
        : (
            prop.ratings.reduce((sum, r) => sum + Number(r.stars || 0), 0) /
            prop.ratings.length
          ).toFixed(1);

    return prop.ratings.map((r, idx) => {
      const rUserId =
        typeof r.user === "object" && r.user !== null ? r.user._id : r.user;
      const matchedBooking = bookings.find(
        (b) => String(b.user?._id || b.user) === String(rUserId)
      );

      const rUserName =
        (typeof r.user === "object" && (r.user?.username || r.user?.name)) ||
        matchedBooking?.user?.username ||
        matchedBooking?.user?.name ||
        `User (${String(rUserId).slice(-5)})`;

      const rUserEmail =
        (typeof r.user === "object" && r.user?.email) ||
        matchedBooking?.user?.email ||
        "";

      return {
        key: `${prop._id}-${rUserId}-${idx}`,
        propertyId: prop._id,
        propertyTitle: prop.title,
        propertyLocation: prop.location,
        avgRating: propAvg,
        totalVotes: propVotes,
        userId: rUserId,
        userName: rUserName,
        userEmail: rUserEmail,
        stars: Number(r.stars || 0),
      };
    });
  });

  return (
    <div className="admin-bookings-container">
      <h2 className="admin-title">Admin Panel - All System Bookings</h2>
      <p className="admin-subtitle">
        Here you can view and manage all bookings and user star ratings.
      </p>

      {loading ? (
        <p className="admin-loading">Loading bookings...</p>
      ) : (
        <>
          {Array.isArray(bookings) && bookings.length > 0 ? (
            <div className="bookings-list">
              {bookings.map((b, index) => {
                if (!b) return null;

                const bookingId = b._id || index;
                const isEditing = editingBookingId === bookingId;

                const propertyObj =
                  properties.find(
                    (p) =>
                      String(p._id) === String(b.property?._id || b.property)
                  ) || b.property;

                const propertyTitle = propertyObj?.title || "Reserved Property";
                const userId = b.user?._id || b.user;
                const userName =
                  b.user?.username || b.user?.name || "Unknown User";
                const userEmail = b.user?.email || "No email";

                const userRatingEntry = Array.isArray(propertyObj?.ratings)
                  ? propertyObj.ratings.find((r) => {
                      const rId =
                        typeof r.user === "object" && r.user !== null
                          ? r.user._id
                          : r.user;
                      return String(rId) === String(userId);
                    })
                  : null;

                const votesCount =
                  typeof propertyObj?.ratingCount === "number"
                    ? propertyObj.ratingCount
                    : Array.isArray(propertyObj?.ratings)
                    ? propertyObj.ratings.length
                    : 0;

                const numericAvg =
                  votesCount === 0
                    ? 0
                    : Array.isArray(propertyObj?.ratings) &&
                      propertyObj.ratings.length > 0
                    ? propertyObj.ratings.reduce(
                        (sum, r) => sum + Number(r.stars || 0),
                        0
                      ) / propertyObj.ratings.length
                    : Number(propertyObj?.rating || 0);

                const propertyRatingsList = Array.isArray(propertyObj?.ratings)
                  ? propertyObj.ratings
                  : [];

                let userRatingText = "Not rated yet";
                if (userRatingEntry) {
                  const s = Number(userRatingEntry.stars || 0);
                  userRatingText = `Voted ${"★".repeat(s)}${"☆".repeat(
                    5 - s
                  )} (${s} ${s === 1 ? "star" : "stars"})`;
                } else if (propertyRatingsList.length > 0) {
                  const formattedVoters = propertyRatingsList
                    .map((r) => {
                      const rId =
                        typeof r.user === "object" && r.user !== null
                          ? r.user._id
                          : r.user;
                      const matchedBooking = bookings.find(
                        (bk) => String(bk.user?._id || bk.user) === String(rId)
                      );
                      const voterName =
                        (typeof r.user === "object" &&
                          (r.user?.username || r.user?.name)) ||
                        matchedBooking?.user?.username ||
                        matchedBooking?.user?.name ||
                        "User";
                      const s = Number(r.stars || 0);
                      return `${voterName}: ${s} ${s === 1 ? "star" : "stars"}`;
                    })
                    .join(" • ");
                  userRatingText = `Voted (${formattedVoters})`;
                }

                const paymentMethod = b.paymentMethod
                  ? b.paymentMethod.toUpperCase()
                  : "CASH";
                const isPaidOnline = b.paymentStatus === "Paid";
                const isApproved = b.status === "Confirmed";

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
                  <div key={bookingId} className="booking-card">
                    <img
                      src={propertyImage}
                      alt={propertyTitle}
                      className="property-img"
                    />

                    <div className="booking-details">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <h4 className="property-title">{propertyTitle}</h4>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            background: isApproved ? "#d1fae5" : "#fef3c7",
                            color: isApproved ? "#065f46" : "#92400e",
                          }}
                        >
                          {isApproved ? " Confirmed" : " Waiting"}
                        </span>
                      </div>

                      <p className="user-info">
                        👤 <strong>Reserved by:</strong> {userName} ({userEmail})
                      </p>

                      {/* USER RATING & PROPERTY AVERAGE */}
                      <div
                        style={{
                          background: "#fffbeb",
                          border: "1px solid #fde68a",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          color: "#92400e",
                          margin: "4px 0",
                          display: "flex",
                          gap: "14px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>
                          ⭐ <strong>User Rating:</strong> {userRatingText}
                        </span>
                        <span>
                          📊 <strong>Property Average:</strong>{" "}
                          {numericAvg.toFixed(1)} / 5 ({votesCount}{" "}
                          {votesCount === 1 ? "vote" : "votes"})
                        </span>
                      </div>

                      {isPaidOnline ? (
                        <div
                          style={{
                            background: "#ecfdf5",
                            border: "1px solid #6ee7b7",
                            color: "#065f46",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            margin: "6px 0",
                          }}
                        >
                          💳 <strong>{userName}</strong> made the payment online
                          via PayPal (${b.totalPrice || 0})!
                        </div>
                      ) : (
                        <p
                          className="payment-info"
                          style={{
                            margin: "4px 0",
                            fontSize: "13px",
                            color: "#334155",
                          }}
                        >
                          💵 <strong>Payment Method:</strong>{" "}
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background: "#fef3c7",
                              color: "#b45309",
                            }}
                          >
                            {paymentMethod} (Not yet paid)
                          </span>
                        </p>
                      )}

                      {isEditing ? (
                        <div className="edit-dates-container">
                          <div className="edit-field">
                            <label>Check-In:</label>
                            <input
                              type="date"
                              value={newCheckIn}
                              onChange={(e) => setNewCheckIn(e.target.value)}
                            />
                          </div>
                          <div className="edit-field">
                            <label>Check-Out:</label>
                            <input
                              type="date"
                              value={newCheckOut}
                              onChange={(e) => setNewCheckOut(e.target.value)}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="booking-dates">
                          <span>
                            📅 <strong>Check-In:</strong>{" "}
                            {b.checkIn && !isNaN(new Date(b.checkIn))
                              ? new Date(b.checkIn).toLocaleDateString()
                              : "N/A"}
                          </span>
                          <span>
                            📅 <strong>Check-Out:</strong>{" "}
                            {b.checkOut && !isNaN(new Date(b.checkOut))
                              ? new Date(b.checkOut).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      )}

                      <div className="booking-footer">
                        <span className="total-price">${b.totalPrice || 0}</span>

                        <div className="action-buttons">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdate(b._id)}
                                className="btn-base btn-save"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingBookingId(null)}
                                className="btn-base btn-cancel"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              {!isApproved && (
                                <button
                                  onClick={() => handleApproveBooking(b._id)}
                                  className="btn-base"
                                  style={{
                                    backgroundColor: "#10b981",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                  }}
                                >
                                  Accept
                                </button>
                              )}

                              <button
                                onClick={() => startEditing(b)}
                                className="btn-base btn-update"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleDelete(b._id)}
                                className="btn-base btn-delete"
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
            <p className="admin-empty">
              There are currently no reservations in the system.
            </p>
          )}

          {/* ALL USER RATINGS SUMMARY SECTION */}
          <div style={{ marginTop: "36px" }}>
            <h3 style={{ marginBottom: "12px", color: "#1e293b" }}>
              ⭐ All User Ratings ({allUserRatings.length})
            </h3>

            {allUserRatings.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "14px",
                }}
              >
                {allUserRatings.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "14px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                  >
                    <h4 style={{ margin: "0 0 4px", color: "#0f172a" }}>
                      {item.propertyTitle}
                    </h4>
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      📍 {item.propertyLocation}
                    </p>
                    <p style={{ margin: "0 0 4px", fontSize: "13px" }}>
                      👤 <strong>{item.userName}</strong>
                      {item.userEmail ? ` (${item.userEmail})` : ""}
                    </p>
                    <p
                      style={{
                        margin: "4px 0",
                        fontSize: "15px",
                        color: "#f59e0b",
                        fontWeight: "bold",
                      }}
                    >
                      {"★".repeat(item.stars)}
                      {"☆".repeat(5 - item.stars)}{" "}
                      <span style={{ color: "#334155", fontSize: "13px" }}>
                        ({item.stars} {item.stars === 1 ? "star" : "stars"})
                      </span>
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      Overall Property Avg: ⭐ {item.avgRating} / 5 (
                      {item.totalVotes}{" "}
                      {item.totalVotes === 1 ? "vote" : "votes"})
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-empty">
                No user ratings have been submitted yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBookings;