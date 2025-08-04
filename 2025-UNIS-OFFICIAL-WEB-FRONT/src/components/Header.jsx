import React from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/unis-logo.svg";

const Header = () => {
  return (
    <header className="bg-black text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* 로고 */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="UNIS Logo" className="h-7 w-auto" />
          <span className="text-xl font-bold tracking-wide">UNIS</span>
        </Link>

        {/* 메뉴 */}
        <nav className="hidden md:flex space-x-10 text-sm font-medium">
          <NavLink to="/activities" className={({ isActive }) =>
            isActive ? "text-white underline" : "hover:text-gray-300"
          }>
            활동
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) =>
            isActive ? "text-white underline" : "hover:text-gray-300"
          }>
            프로젝트
          </NavLink>
          <NavLink to="/recruit" className={({ isActive }) =>
            isActive ? "text-white underline" : "hover:text-gray-300"
          }>
            지원하기
          </NavLink>
        </nav>

        {/* 모바일 메뉴 아이콘 자리 */}
        <div className="md:hidden">
          <button aria-label="Open mobile menu" className="text-white text-xl">☰</button>
        </div>
      </div>
    </header>
  );
};

export default Header;