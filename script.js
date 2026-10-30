/* =========================================================
   [쌰르] SHARR — 길드 모집 페이지 스크립트
   ========================================================= */

// ---- 여기만 수정하면 돼요 ----
const CONFIG = {
  defaultVolume: 35,     // 처음 볼륨 (0~100)
  autoPlayOnEnter: false, // 인트로에서 입장할 때 음악 자동 재생 (true로 바꾸면 켜짐)
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const bgm = $("#bgm");
const intro = $("#intro");
const bgmToggle = $("#bgmToggle");
const volume = $("#volume");
const volLabel = $("#volLabel");
const eq = $("#eq");
const toast = $("#toast");

/* ---------------- 토스트 ---------------- */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

/* ---------------- BGM ---------------- */
bgm.volume = CONFIG.defaultVolume / 100;
volume.value = CONFIG.defaultVolume;
volLabel.textContent = CONFIG.defaultVolume + "%";

function setPlayingUI(on) {
  bgmToggle.textContent = on ? "BGM ON" : "BGM OFF";
  bgmToggle.classList.toggle("on", on);
  eq.classList.toggle("play", on);
}

async function playBgm() {
  try {
    await bgm.play();
    setPlayingUI(true);
  } catch (e) {
    // 음악 파일이 없거나 브라우저가 막은 경우
    setPlayingUI(false);
    if (bgm.error) showToast("assets 폴더에 음악 파일을 넣어주세요 ♪");
  }
}

function pauseBgm() {
  bgm.pause();
  setPlayingUI(false);
}

bgmToggle.addEventListener("click", () => (bgm.paused ? playBgm() : pauseBgm()));

volume.addEventListener("input", () => {
  bgm.volume = volume.value / 100;
  volLabel.textContent = volume.value + "%";
});

/* ---------------- 인트로 (출발 신호 3 → GO) ---------------- */
let entered = false;

function enterSite() {
  if (entered) return;
  entered = true;

  // 음악은 사용자 클릭 직후에 재생해야 브라우저가 막지 않아요
  if (CONFIG.autoPlayOnEnter) playBgm();

  const lights = $$(".light");
  const wrap = $(".lights");
  lights.forEach((l, i) => setTimeout(() => l.classList.add("on"), i * 350));
  setTimeout(() => wrap.classList.add("go"), lights.length * 350 + 150);
  setTimeout(() => {
    intro.classList.add("hide");
    document.body.classList.remove("locked");
    revealHero();
  }, lights.length * 350 + 650);
}

$("#startBtn").addEventListener("click", enterSite);
intro.addEventListener("click", (e) => {
  if (e.target === intro) enterSite();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !entered) enterSite();
});

function revealHero() {
  $$(".hero .reveal, .hero-inner > *").forEach((el, i) => {
    el.style.transition = "opacity .8s ease, transform .8s ease";
    el.style.transitionDelay = i * 0.08 + "s";
    el.style.opacity = 1;
    el.style.transform = "none";
  });
}
// 히어로 등장 애니메이션 준비
$$(".hero-inner > *").forEach((el) => {
  el.style.opacity = 0;
  el.style.transform = "translateY(30px)";
});

/* ---------------- 스크롤 등장 ---------------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
$$(".reveal").forEach((el) => io.observe(el));

/* ---------------- 모바일 메뉴 ---------------- */
const burger = $("#burger");
const navLinks = $("#navLinks");
burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  navLinks.classList.toggle("open");
});
$$("#navLinks a").forEach((a) =>
  a.addEventListener("click", () => {
    burger.classList.remove("open");
    navLinks.classList.remove("open");
  })
);

/* ---------------- 복사 기능 ---------------- */
async function copyText(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // 구형 브라우저 대비
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  showToast(msg);
}

$("#copyForm").addEventListener("click", () =>
  copyText($("#formText").textContent, "가입 양식이 복사됐어요 ✦")
);

$$("[data-copy]").forEach((btn) =>
  btn.addEventListener("click", () =>
    copyText(btn.dataset.copy, `'${btn.dataset.copy}' 닉네임 복사 완료!`)
  )
);
