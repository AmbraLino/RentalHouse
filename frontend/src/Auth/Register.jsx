import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "./Register.css";

const Register = () => {
    const navigate = useNavigate();
    const [newUser, setNewUser] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!newUser.username) return setError("Username is required");
        if (!newUser.password) return setError("Password is required");
        if (newUser.password.length < 6) return setError("Password must be at least 6 characters long");

        try {
            const res = await axios.post("http://localhost:5000/user/register/", newUser);
            console.log("The user was created:", res.data);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "The user was not created");
        }
    };

    return (
        <div className='register-full-container'>
            <div className="register-container">
                <form className="register-form" onSubmit={handleSubmit}>
                    
                    <div className="register-header-center">
                        <h2 className="fw-bold text-primary">Rental House</h2>
                        {/* <h2>Register</h2> */}
                        <p className="form-subtext">Please fill in your details to create an account.</p>
                    </div>

                    <div className="form-group-reg">
                        <label>Username *</label>
                        <input 
                            type="text"
                            name="username"
                            value={newUser.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group-reg">
                        <label>Email *</label>
                        <input 
                            type="email"
                            name="email"    
                            value={newUser.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group-reg">
                        <label>Password *</label>
                        <input 
                            type="password"
                            name="password"
                            value={newUser.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    
                    <button type="submit" className="register-submit-btn">Register</button>

                    <p className="login-link">
                        Already have an account? <a href="/login">Log in</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;