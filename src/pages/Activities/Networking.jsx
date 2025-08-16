import React from "react";
import { useNavigate } from "react-router-dom";
import external1 from "../../assets/external1.png";
import external2 from "../../assets/external2.png";
import external3 from "../../assets/external3.png";
import internal1 from "../../assets/internal1.png";
import internal2 from "../../assets/internal2.png";
import internal3 from "../../assets/internal3.png";
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
              <img src={external1} alt="프로젝트1" className="card-image" />
            </div>
            <div className="card">
              <img src={external2} alt="프로젝트2" className="card-image" />
            </div>
            <div className="card">
              <img src={external3} alt="프로젝트3" className="card-image" />
            </div>
          </div>
        </div>
      </section>

      <section className="sessions__section">
        <div className="section-with-label">
          <div className="semester-label">내부 활동</div>
          <h2>내부 결속 프로그램</h2>
          <p>
          학회 내부 짝궁 프로그램 ‘유니벗', 식사를 함께하는 ‘네트워킹 주간', MT와 LT 등의 활동을 통해 팀워크를 강화합니다.
          </p>
          <div className="card-grid">
            <div className="card">
              <img src={internal1} alt="프로젝트1" className="card-image" />
            </div>
            <div className="card">
              <img src={internal2} alt="프로젝트2" className="card-image" />
            </div>
            <div className="card">
              <img src={internal3} alt="프로젝트3" className="card-image" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
