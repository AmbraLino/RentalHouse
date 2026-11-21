import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { UserContext } from "../Auth/UserContext";
import "./AdminDashboard.css";

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
        src="https://via.placeholder.com/150"
        alt="Default"
        style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }}
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
    <div className="carousel-container" style={{ position: "relative", width: "100%" }}>
      <img
        src={imageSrc}
        alt="Property"
        style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }}
      />
      {allImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            style={{
              position: "absolute",
              left: "5px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "25px",
              height: "25px",
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
              right: "5px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "25px",
              height: "25px",
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
              bottom: "8px",
              right: "8px",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              padding: "1px 5px",
              fontSize: "10px",
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

const AdminDashboard = () => {
  const { userInfo } = useContext(UserContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [newProperty, setNewProperty] = useState({
    title: "",
    location: "",
    price: "",
    guests: "1",
    beds: "3",
    baths: "3",
    cars: "2",
    sqft: "250",
    description: "",
    images: [],
  });

  const [previews, setPreviews] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editPreviews, setEditPreviews] = useState([]);

  const adminScrollRef = useRef(null);

  const scrollAdminLeft = () => {
    if (adminScrollRef.current) {
      adminScrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollAdminRight = () => {
    if (adminScrollRef.current) {
      adminScrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/properties");
      if (Array.isArray(res.data)) {
        setProperties(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setProperties(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleChange = (e) => {
    setNewProperty({ ...newProperty, [e.target.name]: e.target.value });
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewProperty({ ...newProperty, images: files });
      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviews(previewUrls);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!newProperty.title || !newProperty.location || !newProperty.price || !newProperty.description) {
      return setError("Please fill all required fields!");
    }

    const formData = new FormData();
    formData.append("title", newProperty.title);
    formData.append("location", newProperty.location);
    formData.append("price", newProperty.price);
    formData.append("guests", String(newProperty.guests));
    formData.append("beds", newProperty.beds);
    formData.append("baths", newProperty.baths);
    formData.append("cars", newProperty.cars);
    formData.append("sqft", newProperty.sqft);
    formData.append("description", newProperty.description);

    if (Array.isArray(newProperty.images)) {
      newProperty.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      await axios.post("http://localhost:5000/api/properties/", formData, {
        withCredentials: true,
      });

      setSuccessMsg("Property added successfully!");
      setNewProperty({
        title: "",
        location: "",
        price: "",
        guests: "1",
        beds: "3",
        baths: "3",
        cars: "2",
        sqft: "250",
        description: "",
        images: [],
      });
      setPreviews([]);
      fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add property.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/properties/${id}`, {
        withCredentials: true,
      });
      setProperties(properties.filter((item) => item._id !== id));
      setSuccessMsg("Property deleted successfully!");
    } catch (err) {
      setError("Failed to delete property.");
    }
  };

  const handleEditClick = (item) => {
    setEditingProperty({
      ...item,
      guests: item.guests !== undefined && item.guests !== null ? String(item.guests) : "1",
      images: [],
    });

    let allImgs = [];
    if (item.images && item.images.length > 0) allImgs = item.images;
    else if (item.image) allImgs = [item.image];

    setEditPreviews(allImgs.map((img) => (img.startsWith("http") ? img : `http://localhost:5000/${img}`)));
  };

  const handleEditChange = (e) => {
    setEditingProperty({ ...editingProperty, [e.target.name]: e.target.value });
  };

  const handleEditFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setEditingProperty({ ...editingProperty, images: files });
      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setEditPreviews(previewUrls);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("title", editingProperty.title);
    formData.append("location", editingProperty.location);
    formData.append("price", editingProperty.price);
    formData.append("guests", String(editingProperty.guests));
    formData.append("beds", editingProperty.beds);
    formData.append("baths", editingProperty.baths);
    formData.append("cars", editingProperty.cars);
    formData.append("sqft", editingProperty.sqft);
    formData.append("description", editingProperty.description);

    if (Array.isArray(editingProperty.images) && editingProperty.images.length > 0) {
      editingProperty.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      await axios.put(`http://localhost:5000/api/properties/update/${editingProperty._id}`, formData, {
        withCredentials: true,
      });

      setSuccessMsg("Property updated successfully!");
      setEditingProperty(null);
      setEditPreviews([]);
      fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update property.");
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-hero">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {userInfo?.username || userInfo?.name || "Admin"}. Manage your listings below.</p>
      </header>

      <div className="admin-content">
        {error && <div className="alert-box error">{error}</div>}
        {successMsg && <div className="alert-box success">{successMsg}</div>}

        {editingProperty ? (
          <div className="admin-card add-property-card" style={{ border: "2px solid #3b82f6" }}>
            <h2>Edit Property</h2>
            <form className="admin-form" onSubmit={handleUpdateSubmit} encType="multipart/form-data">
              <div className="form-group mb-3">
                <label>Property Title</label>
                <input
                  type="text"
                  name="title"
                  value={editingProperty.title}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={editingProperty.location}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-grid" style={{ display: "flex", gap: "10px" }}>
                <div className="form-group flex-fill mb-3">
                  <label>Price ($ / night)</label>
                  <input
                    type="number"
                    name="price"
                    value={editingProperty.price}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group flex-fill mb-3">
                  <label>Max Guests</label>
                  <input
                    type="number"
                    name="guests"
                    min="1"
                    value={editingProperty.guests}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ display: "flex", gap: "10px" }}>
                <div className="form-group flex-fill mb-3">
                  <label>Beds</label>
                  <input type="number" name="beds" value={editingProperty.beds} onChange={handleEditChange} />
                </div>
                <div className="form-group flex-fill mb-3">
                  <label>Baths</label>
                  <input type="number" name="baths" value={editingProperty.baths} onChange={handleEditChange} />
                </div>
              </div>

              <div className="form-grid" style={{ display: "flex", gap: "10px" }}>
                <div className="form-group flex-fill mb-3">
                  <label>Cars</label>
                  <input type="number" name="cars" value={editingProperty.cars} onChange={handleEditChange} />
                </div>
                <div className="form-group flex-fill mb-3">
                  <label>Sqft</label>
                  <input type="number" name="sqft" value={editingProperty.sqft} onChange={handleEditChange} />
                </div>
              </div>

              <div className="form-group mb-3">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={editingProperty.description}
                  onChange={handleEditChange}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label>Property Photos (Multiple)</label>
                <input
                  type="file"
                  name="images"
                  id="edit-photo-input"
                  accept="image/*"
                  multiple
                  onChange={handleEditFiles}
                  style={{ display: "none" }}
                />
                <label htmlFor="edit-photo-input" className="custom-upload-btn">
                  Change Photos
                </label>
              </div>

              {editPreviews.length > 0 && (
                <div className="mb-3" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {editPreviews.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt="Edit Preview"
                      style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                    />
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="admin-btn-primary" style={{ backgroundColor: "#2563eb" }}>
                  Save Changes
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setEditingProperty(null)}
                  style={{
                    padding: "10px 20px",
                    background: "#64748b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="admin-card add-property-card">
            <h2>Add New Property</h2>
            <form className="admin-form" onSubmit={handleAddProperty} encType="multipart/form-data">
              <div className="form-group mb-3">
                <label>Property Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Design Apartment"
                  value={newProperty.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Chicago, IL"
                  value={newProperty.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-grid" style={{ display: "flex", gap: "10px" }}>
                <div className="form-group flex-fill mb-3">
                  <label>Price ($ /night)</label>
                  <input type="number" name="price" value={newProperty.price} onChange={handleChange} required />
                </div>
                <div className="form-group flex-fill mb-3">
                  <label>Max Guests</label>
                  <input
                    type="number"
                    name="guests"
                    min="1"
                    value={newProperty.guests}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ display: "flex", gap: "10px" }}>
                <div className="form-group flex-fill mb-3">
                  <label>Beds</label>
                  <input type="number" name="beds" value={newProperty.beds} onChange={handleChange} />
                </div>
                <div className="form-group flex-fill mb-3">
                  <label>Baths</label>
                  <input type="number" name="baths" value={newProperty.baths} onChange={handleChange} />
                </div>
              </div>

              <div className="form-grid" style={{ display: "flex", gap: "10px" }}>
                <div className="form-group flex-fill mb-3">
                  <label>Cars</label>
                  <input type="number" name="cars" value={newProperty.cars} onChange={handleChange} />
                </div>
                <div className="form-group flex-fill mb-3">
                  <label>Sqft</label>
                  <input type="number" name="sqft" value={newProperty.sqft} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group mb-3">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Enter property details..."
                  value={newProperty.description}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label>Property Photos (Multiple)</label>
                <input
                  type="file"
                  name="images"
                  id="upload-photo-input"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                  style={{ display: "none" }}
                />
                <label htmlFor="upload-photo-input" className="custom-upload-btn">
                  Add Photos
                </label>
              </div>

              {previews.length > 0 && (
                <div className="mb-3" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {previews.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt="Preview"
                      style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                    />
                  ))}
                </div>
              )}

              <button type="submit" className="admin-btn-primary">
                Add Property
              </button>
            </form>
          </div>
        )}

        <div className="admin-card" style={{ position: "relative" }}>
          <h2>Manage Existing Properties</h2>

          {loading ? (
            <p className="loading-text">Loading properties...</p>
          ) : properties.length > 0 ? (
            <div style={{ position: "relative", display: "flex", alignItems: "center", marginTop: "15px" }}>
              <button
                type="button"
                onClick={scrollAdminLeft}
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
                ref={adminScrollRef}
                style={{
                  display: "flex",
                  gap: "20px",
                  overflowX: "auto",
                  scrollBehavior: "smooth",
                  paddingBottom: "15px",
                  paddingTop: "5px",
                  width: "100%",
                  scrollbarWidth: "none",
                }}
              >
                {properties.map((item) => (
                  <div
                    className="admin-property-item"
                    key={item._id}
                    style={{ minWidth: "280px", maxWidth: "280px", flexShrink: 0 }}
                  >
                    <PropertyCarousel item={item} />

                    <div className="admin-prop-info">
                      <h3>{item.title}</h3>
                      <p className="loc">{item.location}</p>
                      <p className="prc">${item.price} / night</p>
                      <p className="desc" style={{ fontSize: "13px", color: "#475569", margin: "4px 0" }}>
                        {item.description}
                      </p>
                      <p className="details-txt" style={{ fontSize: "12px", color: "#64748b" }}>
                        👥 {item.guests} Guests | 🛏️ {item.beds} Beds | 🛁 {item.baths} Baths | 🚗 {item.cars} Cars | 📐 {item.sqft} sqft
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
                      <button
                        type="button"
                        className="update-btn"
                        onClick={() => handleEditClick(item)}
                        style={{
                          padding: "6px 12px",
                          background: "#f59e0b",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Update
                      </button>
                      <button type="button" className="delete-btn" onClick={() => handleDelete(item._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={scrollAdminRight}
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
          ) : (
            <p className="no-props">No properties found in the database.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;