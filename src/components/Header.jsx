import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../assets/unis-logo.svg";

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const closeDrawer = () => setOpen(false);

  // ✅ 스크롤 가능한 모든 후보를 0으로 초기화하는 유틸
  const forceScrollTop = () => {
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {}

    // 라우팅이 먼저 일어나도록 하고 그 다음 프레임에 스크롤 초기화
    setTimeout(() => {
      requestAnimationFrame(() => {
        // 1) 윈도우 자체
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });

        // 2) 흔한 컨테이너들
        const candidates = [
          document.querySelector("[data-scroll-root]"),
          document.querySelector("main"),
          document.querySelector('[role="main"]'),
          document.getElementById("root"),
          document.scrollingElement,
          document.documentElement,
          document.body,
        ].filter(Boolean);

        const seen = new Set();
        candidates.forEach(el => {
          if (!seen.has(el)) {
            try { el.scrollTop = 0; } catch {}
            seen.add(el);
          }
        });

        // 3) overflow가 걸려 실제 스크롤이 발생하는 모든 요소 스윕 (세이프티넷)
        document.querySelectorAll("*").forEach(el => {
          const cs = getComputedStyle(el);
          const scrollableY = (cs.overflowY === "auto" || cs.overflowY === "scroll");
          if (scrollableY && el.scrollHeight > el.clientHeight) {
            try { el.scrollTop = 0; } catch {}
          }
        });
      });
    }, 0);
  };

  // ✅ 메뉴 클릭: 드로어 닫고, 강제 스크롤 초기화
  const handleNavClick = () => {
    closeDrawer();
    forceScrollTop();
  };

  return (
    <header className="unis-header">
      <div className="unis-header__logo">
        <Link to="/" className="unis-logo-link" onClick={handleNavClick}>
          <img src={logo} alt="UNIS logo" className="unis-logo-icon" />
          <span className="unis-logo-text">UNIS</span>
        </Link>
      </div>

      <nav className="unis-header__nav">
        <Link to="/sessions" onClick={handleNavClick}>활동</Link>
        <Link to="/projectlist" onClick={handleNavClick}>프로젝트</Link>
        <Link to="/recruiting" onClick={handleNavClick}>지원하기</Link>
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
            <Link to="/sessions" onClick={handleNavClick}>활동</Link>
            <Link to="/projectlist" onClick={handleNavClick}>프로젝트</Link>
            <Link to="/recruiting" onClick={handleNavClick}>지원하기</Link>
          </nav>
        </aside>
      </div>
    </header>
  );
}
