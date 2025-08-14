import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../assets/unis-logo.svg";

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const closeDrawer = () => setOpen(false);

  return (
    <header className="unis-header">
      <div className="unis-header__logo">
        <Link to="/" className="unis-logo-link" onClick={closeDrawer}>
          <img src={logo} alt="UNIS logo" className="unis-logo-icon" />
          <span className="unis-logo-text">UNIS</span>
        </Link>
      </div>

      <nav className="unis-header__nav">
        <Link to="/sessions">활동</Link>
        <Link to="/projectlist">프로젝트</Link>
        <Link to="/recruiting">지원하기</Link>
      </nav>

      {/* ▼ 모바일에서만 보이는 햄버거 */}
      <button
        className="unis-hamburger"
        aria-label="메뉴 열기"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* ▼ 모바일 드로어 */}
      <div
        className={`nav-overlay ${open ? "is-open" : ""}`}
        onClick={(e) => e.target.classList.contains("nav-overlay") && closeDrawer()}
      >
        <aside className={`nav-drawer ${open ? "is-open" : ""}`} role="dialog" aria-modal="true">
          <div className="drawer-header">
            <span className="drawer-title">메뉴</span>
            <button className="drawer-close" aria-label="메뉴 닫기" onClick={closeDrawer}>✕</button>
          </div>
          <nav className="nav-mobile">
            <Link to="/sessions" onClick={closeDrawer}>활동</Link>
            <Link to="/projectlist" onClick={closeDrawer}>프로젝트</Link>
            <Link to="/recruiting" onClick={closeDrawer}>지원하기</Link>
          </nav>
        </aside>
      </div>
    </header>
  );
}
