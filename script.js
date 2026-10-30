/* =========================================================
   [쌰르] SHARR — 길드 모집 페이지 스크립트
   ========================================================= */

// ---- 여기만 수정하면 돼요 ----
const CONFIG = {
  youtubeId: "O1bhZgkC4Gw",      // BGM 유튜브 영상 ID (youtu.be/여기부분)
  songTitle: "Cry Baby",          // 미니 플레이어에 보일 곡 제목
  songArtist: "Official髭男dism", // 가수
  defaultVolume: 35,              // 처음 볼륨 (0~100)
  autoPlayOnEnter: false,         // 인트로에서 입장할 때 음악 자동 재생 (true로 바꾸면 켜짐)
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

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

/* ---------------- BGM (유튜브 연결 재생) ---------------- */
let yt = null;          // 유튜브 플레이어
let ytReady = false;
let playWanted = false; // 준비 전에 재생 버튼을 누른 경우 기억

$("#ytTitle").textContent = CONFIG.songTitle;
$("#ytArtist").textContent = CONFIG.songArtist;
volume.value = CONFIG.defaultVolume;
volLabel.textContent = CONFIG.defaultVolume + "%";

function setPlayingUI(on) {
  bgmToggle.textContent = on ? "BGM ON" : "BGM OFF";
  bgmToggle.classList.toggle("on", on);
  eq.classList.toggle("play", on);
  $("#ytMini").classList.toggle("playing", on);
}

// 유튜브 IFrame API 불러오기
const ytScript = document.createElement("script");
ytScript.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(ytScript);

window.onYouTubeIframeAPIReady = () => {
  yt = new YT.Player("ytPlayer", {
    width: "100%",
    height: "100%",
    videoId: CONFIG.youtubeId,
    playerVars: {
      playlist: CONFIG.youtubeId, // 반복 재생용
      loop: 1,
      controls: 1,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady: () => {
        ytReady = true;
        yt.setVolume(CONFIG.defaultVolume);
        if (playWanted) yt.playVideo();
      },
      onStateChange: (e) => setPlayingUI(e.data === YT.PlayerState.PLAYING),
      onError: () => showToast("이 영상은 사이트에서 재생할 수 없어요. script.js 의 youtubeId를 바꿔주세요."),
    },
  });
};

function playBgm() {
  playWanted = true;
  if (ytReady) yt.playVideo();
}

function pauseBgm() {
  playWanted = false;
  if (ytReady) yt.pauseVideo();
}

bgmToggle.addEventListener("click", () => {
  const playing = ytReady && yt.getPlayerState() === YT.PlayerState.PLAYING;
  playing ? pauseBgm() : playBgm();
});

volume.addEventListener("input", () => {
  if (ytReady) yt.setVolume(Number(volume.value));
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
    // 사라지는 효과가 끝나면 인트로를 완전히 치워서 클릭을 막지 않게
    setTimeout(() => { intro.style.display = "none"; }, 1000);
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

/* ---------------- 따라오는 캐릭터 ----------------
   띠 아래(레일 시작)에서 출발해서, 페이지 맨 아래에 도착하면
   캐릭터 아랫면이 푸터 선에 딱 닿도록 스크롤 비율로 위치를 계산해요. */
const rail = $(".char-rail");
const charCard = $(".char-card");
const NAV_GAP = 96; // 메뉴바 아래 여백(px)

function moveChar() {
  if (!rail || rail.offsetParent === null) return; // 숨겨진 화면(모바일)에서는 계산 안 함
  const railTop = rail.getBoundingClientRect().top + window.scrollY;
  const room = rail.offsetHeight - charCard.offsetHeight; // 움직일 수 있는 거리
  const start = railTop - NAV_GAP;                        // 레일이 메뉴바 아래에 닿는 스크롤 위치
  const end = document.documentElement.scrollHeight - window.innerHeight; // 맨 아래
  const p = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
  charCard.style.transform = `translateY(${Math.max(0, room) * p}px)`;
}

let charTicking = false;
function onCharScroll() {
  if (charTicking) return;
  charTicking = true;
  requestAnimationFrame(() => { moveChar(); charTicking = false; });
}
window.addEventListener("scroll", onCharScroll, { passive: true });
window.addEventListener("resize", onCharScroll);
window.addEventListener("load", moveChar);
moveChar();

/* ---------------- 캐릭터 클릭하면 바꾸기 ---------------- */
const CHAR_IMAGES = ["assets/character.webp", "assets/character2.webp"]; // 순서대로 번갈아 바뀜
const charImg = $("#charImg");
let charIndex = 0;

// 두 번째 사진을 미리 불러와서 클릭할 때 바로 바뀌게
CHAR_IMAGES.slice(1).forEach((src) => { new Image().src = src; });

$("#charSwap").addEventListener("click", () => {
  charCard.classList.add("swapping");
  setTimeout(() => {
    charIndex = (charIndex + 1) % CHAR_IMAGES.length;
    charImg.onload = () => {
      charCard.classList.remove("swapping");
      moveChar(); // 사진 높이가 다르면 위치 다시 계산
    };
    charImg.src = CHAR_IMAGES[charIndex];
    $("#charCount").textContent = `${charIndex + 1} / ${CHAR_IMAGES.length}`;
  }, 220);
});

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
