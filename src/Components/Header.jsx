import "../Styles/Header.css";

import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <Link to="/todo">
        <h3 className="title">To Do List</h3>
      </Link>
      <Link to="/mood">
        <h3 className="title">Feeling tracker</h3>
      </Link>
      <Link to="/">
        <h3 className="title">Home</h3>
      </Link>
    </header>
  );
}
