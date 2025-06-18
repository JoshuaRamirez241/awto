import React, { useState } from 'react';
import '../styles/LandingPage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginSection from '../components/LoginSection';

const LandingPage = () => {
  const [user, setUser] = useState(null); // 🔐 Logged in user
  const [showLogin, setShowLogin] = useState(false); // 🔓 Show/hide login popup

  const handleLoginSuccess = (userData) => {
    setUser(userData); // Save user data
    setShowLogin(false); // Close modal
  };

  return (
    <>
      <Navbar user={user} onLoginClick={() => setShowLogin(true)} /> {/* ✅ Pass user */}
      {showLogin && (
        <LoginSection
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      <main className="main-content">
        {/* Fitment */}
        <section id="fitment" className="section fitment-section">
          <div className="fitment-overlay">
            <div className="fitment-heading">
              <h2 className="fitment-subtitle">DISCOVER THE IDEAL FIT FOR YOUR RIDE</h2>
              <h1 className="fitment-title">Fitment Selection Tool</h1>
              <p className="fitment-description">Tires, Wheels, Suspension & More</p>
            </div>
            <div className="fitment-form">
              <select className="fitment-select"><option>Year</option><option>2024</option><option>2023</option></select>
              <select className="fitment-select"><option>Make</option><option>Toyota</option><option>Honda</option></select>
              <select className="fitment-select"><option>Model</option><option>Camry</option><option>Civic</option></select>
              <select className="fitment-select"><option>Trim</option><option>LE</option><option>EX</option></select>
              <select className="fitment-select"><option>Drive</option><option>FWD</option><option>AWD</option></select>
              <button className="fitment-button">Show Results</button>
            </div>
          </div>
        </section>

        {/* Brands */}
        <section id="brand" className="section brand-section">
          <h2>Brand</h2>
          <p>Showcase brands here...</p>
        </section>

        {/* Services */}
        <section id="services" className="section services-section">
          <h2>Services</h2>
          <p>List your services here...</p>
        </section>

        {/* About */}
        <section id="about" className="section about-section">
          <h2>About Us</h2>
          <p>Information about Joven Tire Enterprise...</p>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default LandingPage;
