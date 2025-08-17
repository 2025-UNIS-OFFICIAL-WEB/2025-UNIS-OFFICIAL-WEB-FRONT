import "./Home.css";
import homeBackground from "../../assets/home-background.png";
import logo from "../../assets/unis-logo.svg";
import mockImage from "../../assets/mock-image.png";
import homeimage1 from "../../assets/home-image-1.png";

export default function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section
        className="home-hero"
        style={{ "--hero-bg": `url(${homeBackground})` }}
      >
        <div className="home-hero__container">
          <div className="home-hero__text-group">
            <h1>
              세상을 밝힐 첫 걸음, <span className="highlight">UNIS</span>입니다.
            </h1>
            <p>
              이화여대 유일의 중앙 실전IT창업학회 유니스는
              더 나은 세상을 위한 실행력 있는 혁신 창업가를 양성합니다.
            </p>
            <button className="learn-more-btn"
              onClick={() => window.location.href = "https://www.instagram.com/unis_ewha?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="}
            >자세히 알아보기</button>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="home-intro">
        <div className="home-intro__top">
          <div className="line-with-circle left">
            <div className="line"></div>
            <div className="circle"></div>
          </div>

          <img src={logo} alt="UNIS Logo" className="home-intro__logo" />

          <div className="line-with-circle right">
            <div className="circle"></div>
            <div className="line"></div>
          </div>
        </div>

        <h2>be UNIque, work in UNIso​n.</h2>

        <div className="home-intro__caption">
          독보적인 아이디어와 견고한 기술력, 그 시너지는 세상을 선도합니다.
        </div>
      </section>

      {/* Program Section 1 */}
      <section className="home-program">
        <div className="home-program__inner">
          {/* LEFT */}
          <div className="program-left">
            <h3>아이디어의 반짝이는 빛이</h3>

            {/* 블록 1 */}
            <div className="program-block">
              <span className="chip">스터디를 통해 역량을 강화</span>
              <ul className="dot-list">
                <li>1학기 직무스터디</li>
                <li>여름방학 Summer Upskill</li>
              </ul>
            </div>

            {/* 블록 2 */}
            <div className="program-block">
              <span className="chip">프로젝트를 통한 실전 경험</span>
              <ul className="dot-list">
                <li>상반기 아이디어창업프로젝트</li>
                <li>하반기 실전창업프로젝트</li>
              </ul>
            </div>
          </div>

          {/* RIGHT */}
          <div className="program-media">
            <img src={homeimage1} alt="활동 미리보기" />
          </div>
        </div>
      </section>

      {/* Program Section 2 */}
      <section className="home-program">
        <div className="home-program__inner">
          {/* LEFT */}
          <div className="program-left">
            <h3>세상을 따르는 북극성이 되기까지</h3>

            {/* 블록 1 */}
            <div className="program-block">
              <span className="chip">실제 유저 유치를 통한 시장성 검증</span>
              <ul className="dot-list">
                <li>사흘 간 7500명의 유저가 방문한 ‘대동제 럭키드로우 이벤트'</li>
                <li>빙그레, 요거트월드와 협업한 ‘유니커넥트'</li>
              </ul>
            </div>

            {/* 블록 2 */}
            <div className="program-block">
              <span className="chip">혁신을 이끄는 창업가로 성장</span>
              <ul className="dot-list">
                <li>창업지원프로그램 ORDA 선정</li>
                <li>데굴데굴, 달채비, 베스펙스 등의 알럼나이 배출</li>
              </ul>
            </div>
          </div>

          {/* RIGHT */}
          <div className="program-media">
            <img src={mockImage} alt="활동 미리보기" />
          </div>
        </div>
      </section>

      <section className="home-closing">
        <h2>당신의 반짝이는 열정은 세상을 바꿀 빛이 됩니다.</h2>
        <p>be UNIque, work in UNIso​n.</p>
      </section>
    </div>
  );
}
