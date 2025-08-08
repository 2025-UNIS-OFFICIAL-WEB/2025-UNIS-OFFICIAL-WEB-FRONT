import React from "react";
import { useNavigate } from "react-router-dom";
import mockImage from "../../assets/mock-image-2.png";
import "./Sessions.css";

export default function Sessions() {
  const navigate = useNavigate();

  return (
    <div className="sessions">
      {/* 탭 버튼 영역 */}
      <div className="sessions__tab-buttons">
        <button className="tab-button active">정규 세션</button>
        <button className="tab-button" onClick={() => navigate("/networking")}>
          네트워킹
        </button>
      </div>

      {/* 1학기 섹션 */}
      <section className="sessions__section">
        <div className="section-with-label">
          <div className="semester-label">1학기</div>
          <h2>아이디어 창업 프로젝트</h2>
          <p>
            창업의 첫걸음, 기획 단계에 집중해 가설 도출부터 경쟁사 분석, 사용자 검증과 Pitch Deck까지 진행합니다.
          </p>
          <div className="card-grid">
            <div className="card">
              <img src={mockImage} alt="프로젝트1" className="card-image" />
            </div>
            <div className="card">
              <img src={mockImage} alt="프로젝트2" className="card-image" />
            </div>
            <div className="card">
              <img src={mockImage} alt="프로젝트3" className="card-image" />
            </div>
          </div>
        </div>
      </section>

      {/* 직무 스터디 섹션 */}
      <section className="sessions__section">
        <h2>직무 스터디</h2>
        <p>
          기획&마케팅, 디자인, 프론트엔드, 백엔드 각 분야별 실무 역량 강화를 위해 창업팀과 별개로 학기 중 스터디를 진행합니다.
        </p>
        <div className="card-grid">
          <div className="card">
            <img src={mockImage} alt="스터디1" className="card-image" />
          </div>
          <div className="card">
            <img src={mockImage} alt="스터디2" className="card-image" />
          </div>
          <div className="card">
            <img src={mockImage} alt="스터디3" className="card-image" />
          </div>
        </div>
      </section>

      {/* 🔽 하이라이트 이벤트 섹션 */}
      <section className="highlighted-events">
        {[
          {
            title: "홈커밍데이 (5월)",
            description: "알럼나이 창업가들과의 네트워킹",
          },
          {
            title: "직무스터디 최종 발표 (7월)",
            description: "직무스터디 성과 발표",
          },
          {
            title: "아창프 데모데이 (7월)",
            description: "상반기 창업팀 성과 발표",
          },
          {
            title: "해커톤 (7월)",
            description: "이화여대 최대 규모 창업 해커톤 U-Kathon",
          },
        ].map((event, idx) => (
          <div key={idx} className="event-row">
            <div className="event-badge-with-line">
              <div className="event-badge">{event.title}</div>
              <div className="event-line" />
              <div className="event-dot" />
            </div>
            <p className="event-description">{event.description}</p>
          </div>
        ))}
      </section>

      <section className="sessions__section">
        <div className="section-with-label">
          <div className="semester-label">2학기</div>
          <h2>실전 창업 프로젝트</h2>
          <p>
          상반기 아이디어창업프로젝트의 기획을 바탕으로, MVP 개발과 실제 수익 창출을 목표로 아이템을 고도화합니다.
          </p>
          <div className="card-grid">
            <div className="card">
              <img src={mockImage} alt="프로젝트1" className="card-image" />
            </div>
            <div className="card">
              <img src={mockImage} alt="프로젝트2" className="card-image" />
            </div>
            <div className="card">
              <img src={mockImage} alt="프로젝트3" className="card-image" />
            </div>
          </div>
        </div>
      </section>

      {/* 🔽 하이라이트 이벤트 섹션 */}
      <section className="highlighted-events">
        {[
          {
            title: "창립제(10월)",
            description: "창업팀별 IR 피칭과 포스터 발표",
          },
          {
            title: "모의투자대회 (11월)",
            description: "투자 심사단의 모의투자를 통해 시장성 검증",
          },
          {
            title: "파이널 데모데이 (1월)",
            description: "하반기 창업팀 성과 발표",
          },
          
        ].map((event, idx) => (
          <div key={idx} className="event-row">
            <div className="event-badge-with-line">
              <div className="event-badge">{event.title}</div>
              <div className="event-line" />
              <div className="event-dot" />
            </div>
            <p className="event-description">{event.description}</p>
          </div>
        ))}
      </section>

    </div>
  );
}
