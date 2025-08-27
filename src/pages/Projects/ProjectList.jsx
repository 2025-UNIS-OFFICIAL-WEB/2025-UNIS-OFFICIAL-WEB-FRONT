// src/pages/Projects/ProjectList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./ProjectList.css";
import { fetchProjects } from "../../api/projects";

// (작은 로고 갤러리용 에셋)
import img1 from "../../assets/project-image-1.png";
import img2 from "../../assets/project-image-2.png";
import img3 from "../../assets/project-image-3.png";
import img4 from "../../assets/project-image-4.png";
import img5 from "../../assets/project-image-5.png";

// (상단 하드코딩 6개 에셋) 👉 더 이상 사용 안 함: API 연동으로 대체
// import savvy from "../../assets/savvy-thumbnail.png"; ...

const PLACEHOLDER = "/placeholder-project.png";

/** 백엔드 응답 스키마 정규화 */
const normalize = (raw = {}) => ({
  id: raw.id ?? raw.projectId ?? raw.pid ?? String(raw.id ?? ""),
  title: raw.title ?? raw.serviceName ?? raw.name ?? "",
  intro: raw.intro ?? raw.shortDescription ?? raw.description ?? "",
  thumbnail: raw.thumbnail ?? raw.imageUrl ?? PLACEHOLDER,
  gen: raw.gen ?? raw.generation ?? null,
  isOfficial: raw.isOfficial ?? raw.is_official ?? false,
  isAlumni: raw.isAlumni ?? raw.is_alumni ?? false,
});

export default function ProjectList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1) 기본 목록 호출
        const baseRaw = await fetchProjects();

        // 2) 정규화
        const base = (Array.isArray(baseRaw) ? baseRaw : []).map(normalize);

        // 3) 정렬: 기수 내림차순 → id 오름차순
        base.sort((a, b) => {
          const ga = Number.isFinite(a.gen) ? a.gen : -Infinity;
          const gb = Number.isFinite(b.gen) ? b.gen : -Infinity;
          if (ga !== gb) return gb - ga; // gen desc
          const ia = Number(a.id) || 0;
          const ib = Number(b.id) || 0;
          return ia - ib; // id asc
        });

        setItems(base);
      } catch (e) {
        setErr(e?.message || "프로젝트 목록 로드 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔹 API 연동: 섹션별 분류
  const startups = useMemo(
    () => items.filter((p) => p.isAlumni).slice(0, 6), // 창업 중인 프로젝트(최대 6개)
    [items]
  );
  const club = useMemo(() => items.filter((p) => p.isOfficial), [items]); // 학회 프로젝트
  const members = useMemo(
    () => items.filter((p) => !p.isAlumni && !p.isOfficial), // 학회원 프로젝트
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
                {p.gen ? <span className="project-card__gen">{p.gen}기</span> : null}
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
                {p.gen ? <span className="project-card__gen">{p.gen}기</span> : null}
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
            세상을 바꾸는 시작, <wbr />UNIS입니다
          </h2>
        </section>

        {/* 하이라이트 배지 + 설명 (창업 중인 프로젝트) */}
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

        {/* 🔹 창업 중인 프로젝트: API 연동 (isAlumni만) — 링크 없음 */}
        <Section title={undefined} list={startups} linked={false} />

        {/* 🔹 학회 프로젝트: API 연동 (isOfficial) — 링크 있음 */}
        {club.length > 0 && <Section title="학회 프로젝트" list={club} linked={true} />}

        {/* 학회원 프로젝트 타이틀 영역 (디자인 유지) */}
        <section className="highlighted-events">
          <div className="event-row">
            <div className="event-badge-with-line">
              <div className="event-badge">학회원 프로젝트</div>
            </div>
          </div>
        </section>

        {/* 🔹 학회원 프로젝트: API 연동 (not alumni & not official) — 링크 있음 */}
        <Section title={undefined} list={members} linked={true} />
      </div>
    </div>
  );
}
