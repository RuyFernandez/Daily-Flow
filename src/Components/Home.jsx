import "../Styles/Home.css";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-container">
      <h1>Home</h1>
      <h2>Que deseas hacer hoy?</h2>
      <div className="button-container">
      <Link to="/todo" >
        <button className="redirection-button">Lista de Tareas</button>
      </Link>
      <Link to="/mood" >
        <button className="redirection-button">Feeling tracker</button>
      </Link>
      </div>
    </div>
  );
}
