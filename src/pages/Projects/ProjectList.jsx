import React from "react";
import "./ProjectList.css";

import mockImage from "../../assets/mock-image-2.png";
import img1 from "../../assets/project-image-1.png";
import img2 from "../../assets/project-image-2.png";
import img3 from "../../assets/project-image-3.png";
import img4 from "../../assets/project-image-4.png";
import img5 from "../../assets/project-image-5.png";

export default function ProjectList() {
  const projects = [
    { id: 1, title: "프로젝트명", gen: "6기", desc: "프로젝트 설명은 최대 2줄로 가면 되겠죠 그 이상은 말줄임표를 사용하도록 합니다.", img: mockImage },
    { id: 2, title: "프로젝트명", gen: "6기", desc: "프로젝트 설명은 최대 2줄로 가면 되겠죠 그 이상은 말줄임표를 사용하도록 합니다.", img: mockImage },
    { id: 3, title: "프로젝트명", gen: "6기", desc: "프로젝트 설명은 최대 2줄로 가면 되겠죠 그 이상은 말줄임표를 사용하도록 합니다.", img: mockImage },
  ];

const memberProjects = Array.from({ length: 6 }, (_, i) => ({
    id: `member-${i + 1}`,         // ✅ key 중복 방지
    title: "프로젝트명",
    gen: "6기",
    desc: "프로젝트 설명은 최대 2줄로 가면 되겠죠 그 이상은 말줄임표를 사용하도록 합니다.",
    img: mockImage,
}));

  return (
    <div className="page-container">
      {/* 상단 문구 */}
      <section className="project-intro">
        <h2 className="project-intro__title text-gradient">
          세상을 바꾸는 시작, UNIS입니다
        </h2>
      </section>

      {/* 하이라이트 배지 + 설명 */}
      <section className="highlighted-events">
        <div className="event-row">
          <div className="event-badge-with-line">
            <div className="event-badge">창업 중인 프로젝트</div>
            <div className="event-line" />
            <div className="event-dot" />
          </div>
          <p className="event-description">
            실제 창업으로 이어진 Alumni & Acting 멤버들의 프로젝트입니다.
          </p>
        </div>
      </section>

      {/* 작은 로고 갤러리 */}
      <section className="project-gallery">
        <div className="project-gallery__images">
          <img src={img1} alt="프로젝트 1" />
          <img src={img2} alt="프로젝트 2" />
          <img src={img3} alt="프로젝트 3" />
          <img src={img4} alt="프로젝트 4" />
          <img src={img5} alt="프로젝트 5" />
        </div>
      </section>

      {/* 카드 3열 */}
      <section className="project-cards">
        <div className="project-cards__row">
          {projects.map((p) => (
            <div key={p.id} className="project-card">
              <img
                src={p.img}
                alt={`${p.title} 대표 이미지`}
                className="project-card__image"
              />

              <div className="project-card__meta">
                <span className="project-card__name">{p.title}</span>
                <span className="project-card__gen">{p.gen}</span>
              </div>

              <p className="project-card__description clamp-2">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="highlighted-events">
        <div className="event-row">
          <div className="event-badge-with-line">
            <div className="event-badge">학회 프로젝트</div>
            <div className="event-line" />
            <div className="event-dot" />
          </div>
          <p className="event-description">
            자율성과 실행력을 바탕으로, 학회의 가능성을 확장하고자 운영진 및 별도 TF가 기획·운영한 프로젝트입니다.
          </p>
        </div>
      </section>

      <section className="project-cards">
        <div className="project-cards__row">
          {projects.map((p) => (
            <div key={p.id} className="project-card">
              <img
                src={p.img}
                alt={`${p.title} 대표 이미지`}
                className="project-card__image"
              />

              <div className="project-card__meta">
                <span className="project-card__name">{p.title}</span>
                <span className="project-card__gen">{p.gen}</span>
              </div>

              <p className="project-card__description clamp-2">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="highlighted-events">
        <div className="event-row">
          <div className="event-badge-with-line">
            <div className="event-badge">학회원 프로젝트</div>
          </div>
        </div>
      </section>

      <section className="project-cards">
        <div className="project-cards__row">
            {memberProjects.map((p) => (
            <div key={p.id} className="project-card">
                <img src={p.img} alt={`${p.title} 대표 이미지`} className="project-card__image" />
                <div className="project-card__meta">
                <span className="project-card__name">{p.title}</span>
                <span className="project-card__gen">{p.gen}</span>
                </div>
                <p className="project-card__description clamp-2">{p.desc}</p>
            </div>
            ))}
        </div>
      </section>
    </div>
  );
}
