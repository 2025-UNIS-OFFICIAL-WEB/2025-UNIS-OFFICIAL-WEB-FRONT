import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import "./ProjectDetail.css";
import projectdetailthumbnail from "../../assets/projectdetail_thumbnail.png";
import githublogo from "../../assets/github.png";
import instalogo from "../../assets/instagram.png";
import linkicon from "../../assets/link.png";
import { fetchProjectDetail } from "../../api/projects";

export default function ProjectDetail() {
  const { id } = useParams();
  const { state } = useLocation();

  const [data, setData] = useState(
    state?.preview
      ? {
          id: state.preview.id,
          gen: state.preview.gen,
          title: state.preview.title,
          intro: state.preview.intro,
        }
      : null
  );
  const [loading, setLoading] = useState(!state?.preview);
  const [error, setError] = useState("");

  useEffect(() => {
    let off = false;
    if (!state?.preview) {
      setLoading(true);
      fetchProjectDetail(id)
        .then((d) => {
          if (off) return;
          if (!d) setError("NOT_FOUND");
          setData(d || null);
        })
        .catch(() => !off && setError("LOAD_FAIL"))
        .finally(() => !off && setLoading(false));
    }
    return () => {
      off = true;
    };
  }, [id, state?.preview]);

  if (error === "NOT_FOUND") {
    return (
      <main className="project-detail">
        <div className="container">
          <h1>프로젝트를 찾을 수 없어요.</h1>
          <Link to="/projects" className="btn-back">목록으로</Link>
        </div>
      </main>
    );
  }
  if (loading && !data) {
    return (
      <main className="project-detail">
        <div className="container">불러오는 중…</div>
      </main>
    );
  }

  const DETAIL_MAX = 1000;
  const title = data?.title ?? "프로젝트명";
  const gen = data?.gen;
  const intro = data?.intro ?? "";
  const detail = (data?.detail || "").slice(0, DETAIL_MAX);
  const links = data?.links || {};
  const isAlumni = !!data?.isAlumni;
  const gallery = Array.isArray(data?.gallery) ? data.gallery : [];

  const orderedLinks = [
    links.github && { label: "GitHub", href: links.github, icon: githublogo },
    links.instagram && { label: "Instagram", href: links.instagram, icon: instalogo },
    links.etc && { label: "Link", href: links.etc, icon: linkicon },
  ].filter(Boolean);

  const heroImage = projectdetailthumbnail; // ✅ 고정 이미지

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
          {gen && (
            <span className="pd-badge pd-badge--small">
              {typeof gen === "number" ? `${gen}기` : gen}
            </span>
          )}
          <h1 className="pd-title">{title}</h1>

          <div className="pd-vline" aria-hidden />
          <div className="pd-vline-dot" aria-hidden />
        </div>
      </section>

      {/* 본문 */}
      <main className="pd-content">
        {/* 한 줄 소개(전체 노출) */}
        {intro && (
          <div className="pd-text">
            <p>{intro}</p>
          </div>
        )}

        {/* 상세 설명 */}
        <div className="pd-text">
          <p>{detail || "설명이 준비 중입니다."}</p>
        </div>

        {/* 알럼니 전용 사진 섹션 */}
        {isAlumni && gallery.length > 0 && (
          <section className="pd-photo" aria-label="프로젝트 이미지">
            {gallery.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${title} 스크린샷 ${i + 1}`}
                loading="lazy"
              />
            ))}
          </section>
        )}

        {/* 소셜 아이콘 */}
        {orderedLinks.length > 0 && (
          <div className="pd-socials" aria-label="프로젝트 소셜 링크">
            {orderedLinks.map((l, i) => (
              <a
                key={i}
                className="pd-social"
                href={l.href}
                target="_blank"
                rel="noreferrer"
                aria-label={l.label}
              >
                <img src={l.icon} alt={`${l.label} 아이콘`} />
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
