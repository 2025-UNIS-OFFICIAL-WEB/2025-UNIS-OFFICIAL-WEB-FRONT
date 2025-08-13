import React from "react";
import { useNavigate } from "react-router-dom";
import mockImage from "../../assets/mock-image-2.png";
import "./sessions.css";


export default function Sessions() {
  const navigate = useNavigate();

  return (
    <div className="sessions">
      {/* 탭 버튼 영역 */}
      <div className="sessions__tab-buttons">
        <button className="tab-button" onClick={() => navigate("/sessions")}>
          정규 세션
        </button>
        <button className="tab-button active">네트워킹</button>
      </div>

      {/* 1학기 섹션 */}
      <section className="sessions__section">
        <div className="section-with-label">
          <div className="semester-label">외부 활동</div>
          <h2>대학교 연합 행사</h2>
          <p>
          IT’s Time, 경희대 Flip, 서강대 BlackBox 등 20개 이상의 외부 동아리와 해커톤, 아이디어톤을 진행합니다.
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

      <section className="sessions__section">
        <div className="section-with-label">
          <div className="semester-label">내부 결속 프로그램</div>
          <h2>실전 창업 프로젝트</h2>
          <p>
          학회 내부 짝궁 프로그램 ‘유니벗', 식사를 함께하는 ‘네트워킹 주간', MT와 LT 등의 활동을 통해 팀워크를 강화합니다.
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

    </div>
  );
}
