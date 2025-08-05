import "./Footer.css";
import disquietLogo from "../assets/disquiet-logo.png";
import mailLogo from "../assets/mail-logo.png";
import instagramLogo from "../assets/instagram-logo.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* 왼쪽 영역 */}
        <div className="footer__left">
          <p className="footer__title">UNIS 회칙 &gt;</p>
          <p>UNIS (유니스, 이화여자대학교 중앙 실전IT창업학회)</p>
          <p>Copyright©2025.UNIS. All rights reserved.</p>
        </div>

        {/* 오른쪽 영역 */}
        <div className="footer__right">
          <div className="footer__icons">
            <img src={disquietLogo} alt="Disquiet" />
            <img src={mailLogo} alt="Mail" />
            <img src={instagramLogo} alt="Instagram" />
          </div>
          <p>만든 사람들 | 6기 강린아, 김겨레, 손하늘, 유혜민, 장현서</p>
        </div>
      </div>
    </footer>
  );
}
