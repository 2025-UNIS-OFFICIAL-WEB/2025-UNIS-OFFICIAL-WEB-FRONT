import "./Footer.css";
import disquietLogo from "../assets/disquiet-logo.png";
import mailLogo from "../assets/mail-logo.png";
import instagramLogo from "../assets/instagram-logo.png";
import vectorIcon from "../assets/Vector.png"; // > 아이콘

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* 왼쪽: 하나의 클래스 안에 3줄 배치, 첫 줄(회칙)만 굵게 */}
        <div className="footer__left">
          <div className="footer__meta">
            <button type="button" className="meta-link" aria-label="UNIS 회칙 보기">
              <span>UNIS 회칙</span>
              <img src={vectorIcon} alt="" className="meta-vector" />
            </button>
            <p>UNIS (유니스, 이화여자대학교 중앙 실전IT창업학회)</p>
            <p>Copyright©2025.UNIS. All rights reserved.</p>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className="footer__right">
        <div className="footer__icons">
          <a href="http://disquiet.io/club/egl" target="_blank" rel="noopener noreferrer">
            <img src={disquietLogo} alt="Disquiet" />
          </a>
          <a href="mailto:unisewha@gmail.com">
            <img src={mailLogo} alt="Mail" />
          </a>
          <a href="https://www.instagram.com/unis_ewha?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
            <img src={instagramLogo} alt="Instagram" />
          </a>
        </div>
          <p className="footer__makers">
            만든 사람들 | 6기 김겨레, 손하늘, 유혜민, 장현서
          </p>
        </div>
      </div>
    </footer>
  );
}
