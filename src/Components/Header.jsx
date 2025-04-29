import React, { useState } from "react";
import "../Styles/Header.css";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../theme-context.jsx";

export default function Header() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  if (pathname === "/") return null;

  const handleMenuToggle = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <button
        className={`hamburger${menuOpen ? " open" : ""}`}
        onClick={handleMenuToggle}
        aria-label="Abrir menú"
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`nav-links${menuOpen ? " open" : ""}`}>
        <Link to="/todo" onClick={closeMenu}>
          <h3 className="title">To Do List</h3>
        </Link>
        <Link to="/mood" onClick={closeMenu}>
          <h3 className="title">Feeling tracker</h3>
        </Link>
        <Link to="/" onClick={closeMenu}>
          <h3 className="title">Home</h3>
        </Link>
      </nav>
      <button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label="Cambiar tema"
        style={{ marginLeft: 16, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--background-light)', color: 'var(--text-color)', transition: 'var(--transition)' }}
      >
        {theme === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
      </button>
    </header>
  );
}
