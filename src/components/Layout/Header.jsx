import { Activity, ClipboardList, LogOut, Menu, Settings, UserCircle, Users, X } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRole } from "../../context/RoleContext";
import "./Header.css";

const Header = ({ activePage, onNavigate }) => {
  const { signOut } = useAuth();
  const { profile } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
      setMobileMenuOpen(false);
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'manager' || isAdmin;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="header-logo">
            <h1 className="title">Todo App</h1>
            <p className="subtitle">Stay organized and productive</p>
          </div>

          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul className="nav-list">
              <li className={`nav-item ${activePage === 'todos' ? 'active' : ''}`}>
                <button onClick={() => handleNavigation('todos')} className="nav-link">
                  <ClipboardList size={18} />
                  <span>Todos</span>
                </button>
              </li>
              
              {isManager && (
                <li className={`nav-item ${activePage === 'users' ? 'active' : ''}`}>
                  <button onClick={() => handleNavigation('users')} className="nav-link">
                    <Users size={18} />
                    <span>Users</span>
                  </button>
                </li>
              )}
              
              <li className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}>
                <button onClick={() => handleNavigation('profile')} className="nav-link">
                  <UserCircle size={18} />
                  <span>Profile</span>
                </button>
              </li>
              
              {isAdmin && (
                <>
                  <li className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}>
                    <button onClick={() => handleNavigation('settings')} className="nav-link">
                      <Settings size={18} />
                      <span>Settings</span>
                    </button>
                  </li>
                  <li className={`nav-item ${activePage === 'diagnostics' ? 'active' : ''}`}>
                    <button onClick={() => handleNavigation('diagnostics')} className="nav-link">
                      <Activity size={18} />
                      <span>Diagnostics</span>
                    </button>
                  </li>
                </>
              )}
              
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link logout">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
