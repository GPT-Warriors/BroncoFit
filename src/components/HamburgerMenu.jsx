import { useState, useEffect } from 'react';
import './HamburgerMenu.css';

function HamburgerMenu({ user, onNavigate, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when side panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleMenuClick = (action) => {
    setIsOpen(false);
    if (action === 'logout') {
      onLogout();
    } else {
      onNavigate(action);
    }
  };

  return (
    <>
      {/* Hamburger Button - Fixed Position */}
      <button
        className={`hamburger-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay Backdrop */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Side Panel */}
      <div className={`side-panel ${isOpen ? 'open' : ''}`}>
        <div className="side-panel-header">
          <h2>BroncoFit</h2>
          <button
            className="close-button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="side-panel-content">
          {user ? (
            <>
              <div className="user-info">
                <div className="user-avatar">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <div className="user-info-name">{user.name || 'User'}</div>
                  <div className="user-info-email">{user.email}</div>
                </div>
              </div>

              <nav className="side-panel-nav">
                <div className="menu-item" onClick={() => handleMenuClick('home')}>
                  <span className="menu-item-icon">🏠</span>
                  <span className="menu-item-text">Home</span>
                </div>
                <div className="menu-item" onClick={() => handleMenuClick('profile')}>
                  <span className="menu-item-icon">👤</span>
                  <span className="menu-item-text">Profile</span>
                </div>
                <div className="menu-item primary" onClick={() => handleMenuClick('coach')}>
                  <span className="menu-item-icon">🤖</span>
                  <span className="menu-item-text">AI Coach</span>
                </div>
                <div className="menu-item" onClick={() => handleMenuClick('dashboard')}>
                  <span className="menu-item-icon">📊</span>
                  <span className="menu-item-text">Dashboard</span>
                </div>
                <div className="menu-item" onClick={() => handleMenuClick('settings')}>
                  <span className="menu-item-icon">⚙️</span>
                  <span className="menu-item-text">Settings</span>
                </div>
              </nav>

              <div className="side-panel-footer">
                <div className="menu-item logout" onClick={() => handleMenuClick('logout')}>
                  <span className="menu-item-icon">🚪</span>
                  <span className="menu-item-text">Logout</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="guest-welcome">
                <h3>Welcome!</h3>
                <p>Sign in to track your fitness journey</p>
              </div>

              <nav className="side-panel-nav">
                <div className="menu-item" onClick={() => handleMenuClick('login')}>
                  <span className="menu-item-icon">🔐</span>
                  <span className="menu-item-text">Login</span>
                </div>
                <div className="menu-item primary" onClick={() => handleMenuClick('signup')}>
                  <span className="menu-item-icon">✨</span>
                  <span className="menu-item-text">Sign Up</span>
                </div>
              </nav>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default HamburgerMenu;
