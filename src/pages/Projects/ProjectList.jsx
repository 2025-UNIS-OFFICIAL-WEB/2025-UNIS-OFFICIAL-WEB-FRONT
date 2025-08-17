// src/pages/Projects/ProjectList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./ProjectList.css";
import { fetchProjects } from "../../api/projects"; 
import { enrichProjectsWithGen } from "../../api/projects";

// (그대로 쓰던 작은 로고 갤러리용 에셋)
import img1 from "../../assets/project-image-1.png";
import img2 from "../../assets/project-image-2.png";
import img3 from "../../assets/project-image-3.png";
import img4 from "../../assets/project-image-4.png";
import img5 from "../../assets/project-image-5.png";

export default function ProjectList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
  
        // 1) 기본 목록
        const base = await fetchProjects();
        setItems(base); // 먼저 그려주고
  
        // 2) gen 없는 항목만 상세에서 끌어와 보강 (내부 캐시 있음)
        const withGen = await enrichProjectsWithGen(base);
  
        // 3) 정렬: 기수 내림차순 → id 오름차순
        withGen.sort((a, b) => {
          const ga = Number.isFinite(a.gen) ? a.gen : -Infinity;
          const gb = Number.isFinite(b.gen) ? b.gen : -Infinity;
          if (ga !== gb) return gb - ga;           // gen desc
          const ia = Number(a.id) || 0;
          const ib = Number(b.id) || 0;
          return ia - ib;                           // id asc
        });
  
        setItems(withGen);
      } catch (e) {
        setErr(e?.message || "프로젝트 목록 로드 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startups = useMemo(() => items.filter(p => p.isAlumni), [items]);
  const club = useMemo(() => items.filter(p => p.isOfficial), [items]);
  const members = useMemo(
    () => items.filter(p => !p.isAlumni && !p.isOfficial),
    [items]
  );

  if (loading) return <div className="page-container">프로젝트 불러오는 중…</div>;
  if (err) return <div className="page-container">에러: {err}</div>;

  const Section = ({ title, list }) => (
    <section className="project-cards">
      {title ? (
        <div className="event-row">
          <div className="event-badge-with-line">
            <div className="event-badge">{title}</div>
            <div className="event-line" />
            <div className="event-dot" />
          </div>
          {title === "창업 중인 프로젝트" && (
            <p className="event-description">
              실제 창업으로 이어진 Alumni &amp; Acting 멤버들의 프로젝트입니다.
            </p>
          )}
          {title === "학회 프로젝트" && (
            <p className="event-description">
              자율성과 실행력을 바탕으로 운영진 및 TF가 기획·운영한 프로젝트입니다.
            </p>
          )}
        </div>
      ) : null}

      <div className="project-cards__row">
        {list.map(p => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            state={{
              preview: {
                id: p.id,
                title: p.title,
                gen: p.gen,           // 목록 스펙엔 없어서 대부분 undefined
                intro: p.intro,
                thumbnail: p.thumbnail,
              },
            }}
            className="project-card as-link"
          >
            <img
              src={p.thumbnail}
              alt={`${p.title} 대표 이미지`}
              className="project-card__image"
            />
            <div className="project-card__meta">
              <span className="project-card__name">{p.title}</span>
              {p.gen ? <span className="project-card__gen">{p.gen}기</span> : null}
            </div>
            {p.intro ? (
              <p className="project-card__description clamp-2">{p.intro}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <div className="projectlist">{/* 스코프 래퍼 */}
      <div className="page-container">
        {/* 상단 문구 */}
        <section className="project-intro">
          <h2 className="project-intro__title text-gradient">
            세상을 바꾸는 시작, UNIS입니다
          </h2>
        </section>

        {/* 하이라이트 배지 + 설명 (갤러리 포함, 기존 그대로) */}
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

        {/* 섹션별 카드 */}
        {startups.length > 0 && <Section title="창업 중인 프로젝트" list={startups} />}
        {club.length > 0 && <Section title="학회 프로젝트" list={club} />}

        {/* 학회원 프로젝트 타이틀 영역 (디자인 유지) */}
        <section className="highlighted-events">
          <div className="event-row">
            <div className="event-badge-with-line">
              <div className="event-badge">학회원 프로젝트</div>
            </div>
          </div>
        </section>
        <Section title={undefined} list={members} />
      </div>
    </div>
  );
}
