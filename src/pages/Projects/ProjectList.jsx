import React from "react";
import { Link } from "react-router-dom"; // ✅ 추가
import "./ProjectList.css";

import mockImage from "../../assets/mock-image-2.png";
import img1 from "../../assets/project-image-1.png";
import img2 from "../../assets/project-image-2.png";
import img3 from "../../assets/project-image-3.png";
import img4 from "../../assets/project-image-4.png";
import img5 from "../../assets/project-image-5.png";

import savvy from "../../assets/savvy-thumbnail.png";
import dalchaebi from "../../assets/dalchaebi-thumbnail.png";
import uniconnect from "../../assets/uniconnect-thumbnail.png";
import brazil from "../../assets/brazil-thumbnail.png";
import moonda from "../../assets/moonda-thumbnail.png";
import degul from "../../assets/degul-thumbnail.png";

import luckydraw from "../../assets/luckydraw.png";
import booth from "../../assets/booth.png";
import website from "../../assets/website.png";

import albasolomon from "../../assets/albasolomon.png";
import cocobay from "../../assets/cocobay.png";
import univent from "../../assets/univent.png";
import semo from "../../assets/semo.png";
import uniconnectproject from "../../assets/uniconnectproject.png";
import ecyce from "../../assets/ecyce.png";

export default function ProjectList() {
  /* 창업 중인 프로젝트 */
  const startups = [
    { id: "1", title: "Savvy", gen: "6기", desc: "설명 입력", img: savvy },
    { id: "2", title: "달채비", gen: "6기", desc: "설명 입력", img: dalchaebi },
    { id: "3", title: "UniConnect", gen: "6기", desc: "설명 입력", img: uniconnect },
    { id: "4", title: "브라질 한인 커뮤니티", gen: "6기", desc: "설명 입력", img: brazil },
    { id: "5", title: "문다(MOONDA)", gen: "6기", desc: "설명 입력", img: moonda },
    { id: "6", title: "데굴", gen: "6기", desc: "설명 입력", img: degul },
  ];

  /* 학회 프로젝트 (운영진/TF 등) */
  const projects = [
    { id: "1", title: "대동제 럭키드로우", gen: "6기", desc: "프로젝트 설명은 최대 2줄로 가면 되겠죠 그 이상은 말줄임표를 사용하도록 합니다.", img: luckydraw },
    { id: "2", title: "대동제 부스", gen: "6기", desc: "프로젝트 설명은 최대 2줄로 가면 되겠죠 그 이상은 말줄임표를 사용하도록 합니다.", img: booth },
    { id: "3", title: "UNIS 공식 웹사이트", gen: "6기", desc: "프로젝트 설명은 최대 2줄로 가면 되겠죠 그 이상은 말줄임표를 사용하도록 합니다.", img: website },
  ];

  /* 학회원 프로젝트 (개인/팀) */
  const memberProjects = [
    { id: "1", title: "알쏭달송", gen: "6기", desc: "알바솔로몬 알바 근무표 원터치 생성 서비스", img: albasolomon },
    { id: "2", title: "코코베이", gen: "6기", desc: "내 아이 맞춤 육아용품 큐레이션 플랫폼", img: cocobay },
    { id: "3", title: "UniConnect", gen: "6기", desc: "프로젝트 설명은 최대 2줄로 가면 되겠죠 그 이상은 말줄임표를 사용하도록 합니다.", img: univent },
    { id: "4", title: "세모", gen: "6기", desc: "세상의 모든 운동인들을 위한 서비스, 단발성 온라인 PT", img: semo },
    { id: "5", title: "UNICONNECT", gen: "6기", desc: "대학 단체의 협찬을 더 쉽고 빠르게, 대학생 단체 & 기업 매칭 서비스", img: uniconnectproject },
    { id: "6", title: "ecyce", gen: "6기", desc: "차니 청년 식단 개선을 위한 지역 기반 반찬 소분 플랫폼", img: ecyce },
  ];

  return (
    <div className="projectlist">{/* 스코프 래퍼 */}
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
              실제 창업으로 이어진 Alumni &amp; Acting 멤버들의 프로젝트입니다.
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

        {/* 창업 중인 프로젝트 카드 */}
        <section className="project-cards">
          <div className="project-cards__row">
            {startups.map((p) => (
              <Link
                key={`startup-${p.id}`}
                to={`/projects/${p.id}`}
                state={{ preview: { id: p.id, title: p.title, gen: p.gen, intro: p.desc } }}
                className="project-card as-link"
              >
                <img src={p.img} alt={`${p.title} 대표 이미지`} className="project-card__image" />
                <div className="project-card__meta">
                  <span className="project-card__name">{p.title}</span>
                  <span className="project-card__gen">{p.gen}</span>
                </div>
                <p className="project-card__description clamp-2">{p.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 학회 프로젝트 */}
        <section className="highlighted-events">
          <div className="event-row">
            <div className="event-badge-with-line">
              <div className="event-badge">학회 프로젝트</div>
              <div className="event-line" />
              <div className="event-dot" />
            </div>
            <p className="event-description">
              자율성과 실행력을 바탕으로 운영진 및 TF가 기획·운영한 프로젝트입니다.
            </p>
          </div>
        </section>

        <section className="project-cards">
          <div className="project-cards__row">
            {projects.map((p) => (
              <Link
                key={`club-${p.id}`}
                to={`/projects/${p.id}`}
                state={{ preview: { id: p.id, title: p.title, gen: p.gen, intro: p.desc,  } }}
                className="project-card as-link"
              >
                <img src={p.img} alt={`${p.title} 대표 이미지`} className="project-card__image" />
                <div className="project-card__meta">
                  <span className="project-card__name">{p.title}</span>
                  <span className="project-card__gen">{p.gen}</span>
                </div>
                <p className="project-card__description clamp-2">{p.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 학회원 프로젝트 */}
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
              <Link
                key={`member-${p.id}`}
                to={`/projects/${p.id}`}
                state={{ preview: { id: p.id, title: p.title, gen: p.gen, intro: p.desc, } }}
                className="project-card as-link"
              >
                <img src={p.img} alt={`${p.title} 대표 이미지`} className="project-card__image" />
                <div className="project-card__meta">
                  <span className="project-card__name">{p.title}</span>
                  <span className="project-card__gen">{p.gen}</span>
                </div>
                <p className="project-card__description clamp-2">{p.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
