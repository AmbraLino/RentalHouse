import { Router, Routes, Route } from "react-router-dom";
import './App.css';
import Home from './MainPages/Home';
import Navbar from './Base/Navbar';
import Properties from './MainPages/Properties';
import About from './MainPages/About';
import Contact from './MainPages/Contact';
import Login from './Auth/Login';
import Register from './Auth/Register';
import { UserContextProvider } from './Auth/UserContext';
import ProtectedRoute from './Auth/ProtectedRoute';
import AdminDashboard from "./Admin/AdminDashboard";
import Footer from "./Base/Footer";
import PropertyDetails from "./MainPages/PropertyDetails";
import UserProfile from "./User/UserProfile";
import Booking from "./MainPages/Booking";
import AdminBookings from "./Admin/AdminBookings";
import PropertyReviewsPage from "./MainPages/PropertyReviewsPage";
// import Create from "./Admin/Create";
function App() {
  return (
  <>
    <UserContextProvider>
      <Navbar /> 
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/booking" element={<Booking />}/>
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/reviews" element={<PropertyReviewsPage/>}/>
        {/* <Route path="/create" element={<Create />}/> */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
    </Routes>
    </UserContextProvider>
    <Footer/>
    </>
  );
}

export default App;
