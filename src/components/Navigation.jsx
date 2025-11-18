import { useState, useEffect } from 'react';
import './Navigation.css';

function Navigation({ user, onNavigate, onLogout, currentPage }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`main-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo Section */}
        <div className="nav-logo" onClick={() => onNavigate('home')}>
          <img src="/broncofit_logo_new.png" alt="BroncoFit" className="nav-logo-img" />
          <span className="nav-brand">BRONCOFIT</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <a
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            Home
          </a>
          {user && (
            <>
              <a
                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => onNavigate('dashboard')}
              >
                Dashboard
              </a>
              <a
                className={`nav-link ${currentPage === 'coach' ? 'active' : ''}`}
                onClick={() => onNavigate('coach')}
              >
                AI Coach
              </a>
              <a
                className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`}
                onClick={() => onNavigate('profile')}
              >
                Stats
              </a>
            </>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="nav-actions">
          {user ? (
            <>
              <div className="nav-user" onClick={() => onNavigate('dashboard')}>
                <div className="nav-user-avatar">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="nav-user-name">{user.name || 'User'}</span>
              </div>
              <button className="nav-btn logout" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="nav-btn secondary" onClick={() => onNavigate('login')}>
                Login
              </button>
              <button className="nav-btn primary" onClick={() => onNavigate('signup')}>
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
