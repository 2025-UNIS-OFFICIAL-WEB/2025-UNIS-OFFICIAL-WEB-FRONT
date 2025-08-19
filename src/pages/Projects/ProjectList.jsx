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

/* ─────────────────────────────────────────────────────────
   하드코딩: 상단 "창업 중인 프로젝트" 6개
   - 이미지/텍스트는 임시값. 자유롭게 교체해도 됨.
   - 링크 없이 카드만 렌더링(요구사항).
────────────────────────────────────────────────────────── */
const HARDCODED_STARTUPS = [
  {
    id: "s1",
    title: "Savvy (더미)",
    intro: "실제 창업으로 이어진 프로젝트의 간단 소개문구",
    thumbnail: img1,
    gen: 12,
  },
  {
    id: "s2",
    title: "달채비 (더미)",
    intro: "사용자 문제 해결에 집중한 서비스",
    thumbnail: img2,
    gen: 11,
  },
  {
    id: "s3",
    title: "UNI:CONNECT (더미)",
    intro: "산학 연결을 돕는 매칭 플랫폼",
    thumbnail: img3,
    gen: 10,
  },
  {
    id: "s4",
    title: "브라질커피 (더미)",
    intro: "브랜드/커머스 실험 프로젝트",
    thumbnail: img4,
    gen: 9,
  },
  {
    id: "s5",
    title: "문답(MoonDa) (더미)",
    intro: "학습 Q&A 기반 서비스",
    thumbnail: img5,
    gen: 9,
  },
  {
    id: "s6",
    title: "DeGul (더미)",
    intro: "커뮤니티 실험 프로젝트",
    thumbnail: img1, 
    gen: 8,
  },
];

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
          if (ga !== gb) return gb - ga; // gen desc
          const ia = Number(a.id) || 0;
          const ib = Number(b.id) || 0;
          return ia - ib; // id asc
        });

        setItems(withGen);
      } catch (e) {
        setErr(e?.message || "프로젝트 목록 로드 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔸 API 연동은 아래 두 섹션만 사용
  const club = useMemo(() => items.filter((p) => p.isOfficial), [items]);
  const members = useMemo(
    () => items.filter((p) => !p.isAlumni && !p.isOfficial),
    [items]
  );

  if (loading) return <div className="page-container">프로젝트 불러오는 중…</div>;
  if (err) return <div className="page-container">에러: {err}</div>;

  // 공용 카드 섹션(링크 여부 토글)
  const Section = ({ title, list, linked = true }) => (
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
        {list.map((p) =>
          linked ? (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              state={{
                preview: {
                  id: p.id,
                  title: p.title,
                  gen: p.gen,
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
                {p.gen ? (
                  <span className="project-card__gen">{p.gen}기</span>
                ) : null}
              </div>
              {p.intro ? (
                <p className="project-card__description clamp-2">{p.intro}</p>
              ) : null}
            </Link>
          ) : (
            // 링크 없는 정적 카드
            <div key={p.id} className="project-card">
              <img
                src={p.thumbnail}
                alt={`${p.title} 대표 이미지`}
                className="project-card__image"
              />
              <div className="project-card__meta">
                <span className="project-card__name">{p.title}</span>
                {p.gen ? (
                  <span className="project-card__gen">{p.gen}기</span>
                ) : null}
              </div>
              {p.intro ? (
                <p className="project-card__description clamp-2">{p.intro}</p>
              ) : null}
            </div>
          )
        )}
      </div>
    </section>
  );

  return (
    <div className="projectlist">
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

        {/* 작은 로고 갤러리(그대로) */}
        <section className="project-gallery">
          <div className="project-gallery__images">
            <img src={img1} alt="프로젝트 1" />
            <img src={img2} alt="프로젝트 2" />
            <img src={img3} alt="프로젝트 3" />
            <img src={img4} alt="프로젝트 4" />
            <img src={img5} alt="프로젝트 5" />
          </div>
        </section>

        {/* 🔹 하드코딩된 상단 6개 (링크 없음) */}
        <Section title="undefined" list={HARDCODED_STARTUPS} linked={false} />

        {/* 🔹 아래 두 섹션만 API 연동 */}
        {club.length > 0 && <Section title="학회 프로젝트" list={club} linked={true} />}

        {/* 학회원 프로젝트 타이틀 영역 (디자인 유지) */}
        <section className="highlighted-events">
          <div className="event-row">
            <div className="event-badge-with-line">
              <div className="event-badge">학회원 프로젝트</div>
            </div>
          </div>
        </section>
        <Section title={undefined} list={members} linked={true} />
      </div>
    </div>
  );
}
