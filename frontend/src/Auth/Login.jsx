import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";   
import { UserContext } from "../Auth/UserContext";

const Login = () => {
    const navigate = useNavigate();
    const { setUserInfo } = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const { data } = await axios.post("http://localhost:5000/user/login", { email, password }, { withCredentials: true });
            console.log("the answer of login is:", data);
            setUserInfo(data);
            if (data.role && data.role.toLowerCase() === "admin") {
                navigate("/admin/dashboard"); 
            } else {
                navigate("/", { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Email or password is incorrect");  
        }
    };

    return (
        <div className="login-full-container">
            <div className="login-container">
                <div className="login-form">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-primary">Rental House</h2>
                        <p className="login-subtitle">
                            Welcome! Please log in to access your account.
                        </p>
                    </div>

                    {/* Rregulluar në onSubmit */}
                    <form onSubmit={handleLogin}>
                        <label>Email</label>
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@example.com"
                            required
                        />
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                        
                        {error && <div className="alert alert-danger p-2 mt-2" style={{ fontSize: "14px" }}>{error}</div>}
                        
                        <button type="submit" className="login-btn mt-3">Login</button>
                    </form>

                    <p className="login-signup-text mt-4"> Don't have an account? <a href="/register">Sign up</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;