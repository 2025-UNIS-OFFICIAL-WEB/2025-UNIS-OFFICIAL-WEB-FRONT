import React from "react";
import "./ProjectDetail.css";

import heroImage from "../../assets/projectdetail_thumbnail.png";

export default function ProjectDetail() {
  return (
    <div className="project-detail">
      {/* Hero */}
      <section
        className="pd-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
        aria-label="프로젝트 대표 이미지"
      >
        <div className="pd-hero__overlay" />
        <div className="pd-hero__center">
          <span className="pd-badge pd-badge--small">6기</span>
          <h1 className="pd-title">프로젝트명</h1>
        </div>
      </section>

      {/* 본문 */}
      <main className="pd-content">
        <h2 className="pd-section-title">프로젝트 소개</h2>
        <div className="pd-text">
          <p>
            프로젝트 — 메인 설명글입니다. 몇 자까지 넣어야 하는 걸까요? 사실 아무
            생각이 없습니다. 리안씨가 알아서 텍스트를 끌어와 주실 거예요.
          </p>
          <p>
            프로젝트 — 메인 설명글입니다. 몇 자까지 넣어야 하는 걸까요? 사실 아무
            생각이 없습니다. 리안씨가 알아서 텍스트를 끌어와 주실 거예요.
          </p>
          <p>
            프로젝트 — 메인 설명글입니다. 몇 자까지 넣어야 하는 걸까요? 사실 아무
            생각이 없습니다. 리안씨가 알아서 텍스트를 끌어와 주실 거예요.
          </p>
        </div>

        {/* 소셜 아이콘 자리 (SVG/이미지로 교체) */}
        <div className="pd-socials" aria-label="프로젝트 소셜 링크">
          <a className="pd-social" href="#" aria-label="홈페이지">◎</a>
          <a className="pd-social" href="#" aria-label="인스타그램">◎</a>
          <a className="pd-social" href="#" aria-label="깃허브">◎</a>
        </div>
      </main>
    </div>
  );
}
