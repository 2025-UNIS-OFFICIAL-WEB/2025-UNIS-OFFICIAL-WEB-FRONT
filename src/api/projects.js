const BASE = "/api"; // vite proxy or 서버 prefix

// 🔹 프로젝트 목록 가져오기
export async function fetchProjects() {
  const res = await fetch(`${BASE}/projects`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load projects");
  const json = await res.json(); // { status, message, data: [...] }

  // DB에서 오는 data 배열을 프론트 구조로 변환
  const arr = Array.isArray(json?.data) ? json.data : [];

  return arr.map((d) => ({
    id: d.projectId,          // 고유 ID → 라우트/React key 용
    title: d.serviceName,     // 서비스명
    gen: d.generation,        // 기수
    intro: d.shortDescription ?? "", // 한 줄 소개 (목록에 표시)
    thumbnail: d.imageUrl || "/placeholder-project.png", // 썸네일
    isAlumni: !!d.isAlumni,   // 알럼니 여부 (필요 시 배지)
    isOfficial: !!d.isOfficial, // 학회 공식 여부
  }));
}

// 🔹 특정 프로젝트 상세 가져오기
export async function fetchProjectDetail(id) {
  const res = await fetch(`${BASE}/projects/${id}`, { credentials: "include" });
  if (res.status === 404) return null; // 없는 경우
  if (!res.ok) throw new Error("Failed to load project detail");
  const json = await res.json(); // { status, message, data: {...} }

  const d = json?.data || {};
  return {
    id: d.projectId,
    title: d.serviceName,
    gen: d.generation,
    intro: d.shortDescription ?? "",
    detail: d.description ?? "", // 상세 설명 (max 1000자 제한은 프론트에서 가드)
    coverImage: d.imageUrl || "/placeholder-project.png",
    links: {
      github: d.githubUrl || "",
      instagram: d.instagramUrl || "",
      etc: d.etcUrl || "",
    },
    isAlumni: !!d.isAlumni,
    isOfficial: !!d.isOfficial,
    gallery: d.gallery ?? [], // 알럼니 프로젝트일 경우 추가 사진 배열
  };
}