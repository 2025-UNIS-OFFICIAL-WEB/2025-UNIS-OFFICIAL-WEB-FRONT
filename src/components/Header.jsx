import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../assets/unis-logo.svg";

export default function Header() {
  return (
    <header className="unis-header">
      <div className="unis-header__logo">
        <Link to="/" className="unis-logo-link">
          <img src={logo} alt="UNIS logo" className="unis-logo-icon" />
          <span className="unis-logo-text">UNIS</span>
        </Link>
      </div>
      <nav className="unis-header__nav">
        <Link to="/activities">활동</Link>
        <Link to="/projects">프로젝트</Link>
        <Link to="/apply">지원하기</Link>
      </nav>
    </header>
  );
}
