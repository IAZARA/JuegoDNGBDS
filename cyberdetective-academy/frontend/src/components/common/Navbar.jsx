import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (!user) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <span className="brand-icon">🕵️‍♂️</span>
          <span className="brand-text">Academia de Detectives</span>
        </Link>
        
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        
        <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            🏠 Dashboard
          </Link>
          <Link 
            to="/exercises" 
            className={`navbar-link ${isActive('/exercises') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            🎯 Ejercicios
          </Link>
          <Link 
            to="/leaderboard" 
            className={`navbar-link ${isActive('/leaderboard') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            🏆 Ranking
          </Link>
          <Link 
            to="/teams" 
            className={`navbar-link ${isActive('/teams') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            👥 Mi Equipo
          </Link>
          
          <div className="navbar-user-mobile">
            <div className="user-info">
              <span className="user-points">{user.totalPoints} pts</span>
              <span className="user-level">Nv.{user.level}</span>
              <span className="user-name">{user.username}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Salir
            </button>
          </div>
        </div>
        
        <div className="navbar-user-desktop">
          <div className="user-info">
            <span className="user-points">{user.totalPoints} pts</span>
            <span className="user-level">Nv.{user.level}</span>
            <span className="user-name">{user.username}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;