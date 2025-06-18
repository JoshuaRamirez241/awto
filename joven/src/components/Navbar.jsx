import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { FaBars } from 'react-icons/fa';
import { FiBell, FiShoppingCart } from 'react-icons/fi';
import jovenLogo from '../assets/jovenlogo.png';
import { auth } from '../firebase';
import '../styles/Navbar.css';
import LoginSection from './LoginSection';

const Navbar = () => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);

  const dropdownRef = useRef(null);
  const notificationCount = 3; // Replace with dynamic value from Firestore if needed
  const cartCount = 2; // Replace with dynamic cart count

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setShowDropdown(false);
    navigate('/');
  };

  const goToProfileTab = (tab) => {
    setShowDropdown(false);
    navigate(`/profile?tab=${tab}`);
  };

  return (
    <>
      <nav className="navbar">
        <div className="left-nav" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={jovenLogo} alt="Joven Tire Logo" className="logo" />
          <span className="brand-name">Joven Tire Enterprise</span>
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars />
        </button>

        <div className={`right-nav ${menuOpen ? 'open' : ''}`}>
          <a href="#fitment" className="nav-link" onClick={() => setMenuOpen(false)}>Fitment</a>
          <a href="#brand" className="nav-link" onClick={() => setMenuOpen(false)}>Brand</a>
          <a href="#services" className="nav-link" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>About</a>

          <div className="icon-buttons">
            <button className="icon-button" title="Notifications">
              <FiBell size={20} />
              {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
            </button>
            <button className="icon-button" title="My Selections">
              <FiShoppingCart size={20} />
              <span className="label">My Selections</span>
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
          </div>

          {user ? (
            <div className="profile-dropdown" ref={dropdownRef}>
              <button
                className="profile-info"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                {user.displayName || user.email}
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => goToProfileTab('profile')}>
                    View Profile
                  </button>
                  <button className="dropdown-item" onClick={() => goToProfileTab('orders')}>
                    Orders
                  </button>
                  <button className="dropdown-item" onClick={() => goToProfileTab('payment')}>
                    Payment
                  </button>
                  <button className="dropdown-item" onClick={() => goToProfileTab('settings')}>
                    Settings
                  </button>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="create-account-button"
              onClick={() => {
                setShowLogin(true);
                setMenuOpen(false);
              }}
            >
              Account
            </button>
          )}
        </div>
      </nav>

      {showLogin && (
        <div className="login-popup-overlay" onClick={() => setShowLogin(false)}>
          <div className="login-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={() => setShowLogin(false)}>✖</button>
            <LoginSection onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
