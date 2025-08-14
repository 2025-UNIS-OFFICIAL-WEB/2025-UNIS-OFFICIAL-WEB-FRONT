import React from "react";
import "./Recruiting.css";

export default function Recruit() {
  return (
    <main className="recruit">
      {/* ===== Hero ===== */}
      <section className="recruit-hero">
        <div className="hero-inner">
          <p className="eyebrow">혁신을 함께할 당신을 기다립니다.</p>
          <h1>
            <span className="muted">be UNique, work in UNIS.</span>
          </h1>
          <button className="btn-primary">지원하기</button>
        </div>
      </section>

      {/* ===== 모집 대상 ===== */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">모집 대상</h2>

          {/* 중앙 배지 */}
          <div className="center-pill">IT 창업에 열정 있는 “모든” 이화인</div>

          {/* 위 선: 배지 ↘ 카드 */}
          <div className="vline vline-top" aria-hidden />

          {/* 아래 3개 카드 */}
          <div className="three-cards with-connector">
            <article className="card">
              <p>
                내가 만든 아이디어를<br />
                <span className="highlight-line">진짜 서비스로</span><br />
                만들어보고 싶다면
              </p>
            </article>
            <article className="card">
              <p>
                기획, 디자인, 개발을<br />
                <span className="highlight-line">아우르는 협업을</span><br />
                경험해보고 싶다면
              </p>
            </article>
            <article className="card">
              <p>
                성장 중심 커뮤니티를 통해<br />
                <span className="highlight-line">지속적인 시장 검증을</span><br />
                경험하고 싶다면
              </p>
            </article>
          </div>

          {/* 아래 선: 카드 ↘ 점 */}
          <div className="vline vline-bottom" aria-hidden />
          {/* 구분 점 */}
          <div className="vline-dot" aria-hidden />
        </div>
      </section>

      {/* ===== 정답은 UNIS ===== */}
      <section className="section center">
        <h3 className="answer">정답은, UNIS입니다</h3>
      </section>

      {/* ===== 모집 직군 ===== */}
      <section className="section">
        <div className="container roles">
          <h2 className="section-title">모집 직군</h2>

          {/* 안내 배지 */}
          <div className="center-pill">경험이 없어도 괜찮아요!</div>

          {/* roles 전용 선 + 점 */}
          <div className="vline vline-bottom-roles" aria-hidden />
          <div className="vline-dot" aria-hidden />

          <div className="role-grid">
            <article className="role-card">
              <h4>기획</h4>
              <p>
                시장/문제 정의, 가설 수립,<br />
                사용자 인터뷰 &amp; 실험 설계로<br />
                제품 방향을 만듭니다.
              </p>
            </article>
            <article className="role-card">
              <h4>디자인</h4>
              <p>
                툴 사용 기초부터 응용,<br />
                UXUI 디자인을 위한<br />
                문제 해결 능력을 기릅니다.
              </p>
            </article>
            <article className="role-card">
              <h4>프론트엔드</h4>
              <p>
                HTML, CSS 웹 마크업<br />
                기초부터 React 등<br />
                프레임워크까지 학습합니다.
              </p>
            </article>
            <article className="role-card">
              <h4>백엔드</h4>
              <p>
                Spring 프레임워크를<br />
                기반으로 개발부터<br />
                배포까지 학습합니다.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== 모집 일정 ===== */}
      <section className="section center">
        <div className="container">
          <h2 className="section-title">모집 일정</h2>
          <p className="schedule-desc main-line">
            UNIS는 상반기, 하반기로 나누어 리쿠르팅을 진행합니다.
          </p>
          <p className="schedule-desc sub-line">
            자세한 모집 일정과 방법은 행사 공지에 안내된 모집 공지를 참고해주세요.
          </p>
          <button className="btn-primary schedule-btn">지원하기</button>
        </div>
      </section>

    </main>
  );
}
