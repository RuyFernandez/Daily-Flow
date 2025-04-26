import React, { useState } from "react";
import "../Styles/Header.css";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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
    </header>
  );
}
