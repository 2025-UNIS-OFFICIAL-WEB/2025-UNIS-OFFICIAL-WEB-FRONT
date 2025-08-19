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
  const preview = state?.preview || null;

  // 프리뷰로 먼저 그리기(제목/인트로/임시 커버 + gen)
  const [data, setData] = useState(
    preview
      ? {
          id: preview.id,
          title: preview.title,
          intro: preview.intro,
          gen: preview.gen ?? undefined,
          coverImage: preview.thumbnail || projectdetailthumbnail,
          detail: preview.detail || "",
        }
      : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let off = false;
    setLoading(true);
    setError("");

    fetchProjectDetail(id)
      .then((d) => {
        if (off) return;
        if (!d) {
          if (!preview) setError("NOT_FOUND");
          return;
        }
        setData((prev) => ({
          id: d.id ?? prev?.id ?? Number(id),
          title: d.title ?? prev?.title ?? "프로젝트명",
          intro: d.intro ?? prev?.intro ?? "",
          detail: d.detail ?? prev?.detail ?? "",
          gen: d.gen ?? prev?.gen ?? undefined,
          coverImage: d.coverImage || prev?.coverImage || projectdetailthumbnail,
          links: {
            github: d.links?.github || prev?.links?.github || "",
            instagram: d.links?.instagram || prev?.links?.instagram || "",
            etc: d.links?.etc || prev?.links?.etc || "",
          },
          isAlumni:
            typeof d.isAlumni === "boolean" ? d.isAlumni : !!prev?.isAlumni,
          isOfficial:
            typeof d.isOfficial === "boolean" ? d.isOfficial : !!prev?.isOfficial,
          gallery: Array.isArray(d.gallery) ? d.gallery : prev?.gallery || [],
        }));
      })
      .catch(() => {
        if (off) return;
        if (!preview) setError("LOAD_FAIL");
      })
      .finally(() => !off && setLoading(false));

    return () => {
      off = true;
    };
  }, [id]);

  if (!data && error === "NOT_FOUND") {
    return (
      <main className="project-detail">
        <div className="container">
          <h1>프로젝트를 찾을 수 없어요.</h1>
          <Link to="/projects" className="btn-back">목록으로</Link>
        </div>
      </main>
    );
  }

  if (!data && loading) {
    return (
      <main className="project-detail">
        <div className="container">불러오는 중…</div>
      </main>
    );
  }

  const DETAIL_MAX = 1000;
  const title = data?.title ?? "프로젝트명";
  const intro = data?.intro ?? "";
  const gen = data?.gen;
  const detail = (data?.detail || "").slice(0, DETAIL_MAX).trim();
  const links = data?.links || {};
  const gallery = Array.isArray(data?.gallery) ? data.gallery : [];
  const heroImage = data?.coverImage || projectdetailthumbnail;

  const orderedLinks = [
    links.github && { label: "GitHub", href: links.github, icon: githublogo },
    links.instagram && { label: "Instagram", href: links.instagram, icon: instalogo },
    links.etc && { label: "Link", href: links.etc, icon: linkicon },
  ].filter(Boolean);

  return (
    <div className="project-detail">
      {/* Hero */}
      <section
        className="pd-hero"
        style={{ backgroundImage: `url(${heroImage})`, "--hero-bg": `url(${heroImage})` }}
        aria-label="프로젝트 대표 이미지"
      >
        <div className="pd-hero__overlay" />
        <div className="pd-hero__center">
          {Number.isFinite(gen) && (
            <div className="pd-badge pd-badge--small" aria-label="기수 배지">
              {gen}기
            </div>
          )}
          <h1 className="pd-title">{title}</h1>
          <div className="pd-vline" aria-hidden />
          <div className="pd-vline-dot" aria-hidden />
        </div>
      </section>

      {/* 본문 */}
      <main className="pd-content">
        {/* ▶ 모바일 전용 헤더: 제목 + (같은 줄) 기수, 오른쪽 아이콘 */}
        <div className="pd-header--mobile">
          <div className="pd-hrow">
            <div className="pd-hleft">
              <h1 className="pd-title pd-title--mobile">{title}</h1>
              {Number.isFinite(gen) && <span className="pd-gen">{gen}기</span>}
            </div>
            {orderedLinks.length > 0 && (
              <div className="pd-hright pd-socials">
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
          </div>
        </div>

        {/* 한 줄 소개 (모바일에선 숨김) */}
        {intro && (
          <div className="pd-text pd-text--intro">
            <p>{intro}</p>
          </div>
        )}

        {/* 상세 설명(= description만) */}
        {detail && (
          <div className="pd-text">
            <p>{detail}</p>
          </div>
        )}

        {/* 알럼니 전용 사진 섹션 */}
        {gallery.length > 0 && (
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
      </main>
    </div>
  );
}
