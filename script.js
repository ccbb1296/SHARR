const CONFIG = {
  youtubeId: "O1bhZgkC4Gw",
  songTitle: "Cry Baby",
  songArtist: "Official髭男dism",
  defaultVolume: 35,
  autoPlayOnEnter: false,
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const intro = $("#intro");
const bgmToggle = $("#bgmToggle");
const volume = $("#volume");
const volLabel = $("#volLabel");
const eq = $("#eq");
const toast = $("#toast");

let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

let yt = null;
let ytReady = false;
let playWanted = false;

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

const ytScript = document.createElement("script");
ytScript.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(ytScript);

window.onYouTubeIframeAPIReady = () => {
  yt = new YT.Player("ytPlayer", {
    width: "100%",
    height: "100%",
    videoId: CONFIG.youtubeId,
    playerVars: {
      playlist: CONFIG.youtubeId,
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

let entered = false;

function enterSite() {
  if (entered) return;
  entered = true;

  if (CONFIG.autoPlayOnEnter) playBgm();

  const lights = $$(".light");
  const wrap = $(".lights");
  lights.forEach((l, i) => setTimeout(() => l.classList.add("on"), i * 350));
  setTimeout(() => wrap.classList.add("go"), lights.length * 350 + 150);
  setTimeout(() => {
    intro.classList.add("hide");
    document.body.classList.remove("locked");
    revealHero();

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

$$(".hero-inner > *").forEach((el) => {
  el.style.opacity = 0;
  el.style.transform = "translateY(30px)";
});

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

const rail = $(".char-rail");
const charCard = $(".char-card");
const NAV_GAP = 96;

function moveChar() {
  if (!rail || rail.offsetParent === null) return;
  const railTop = rail.getBoundingClientRect().top + window.scrollY;
  const room = rail.offsetHeight - charCard.offsetHeight;
  const start = railTop - NAV_GAP;
  const end = document.documentElement.scrollHeight - window.innerHeight;
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

const CHAR_IMAGES = ["assets/character.webp", "assets/character2.webp"];
const charImg = $("#charImg");
let charIndex = 0;

CHAR_IMAGES.slice(1).forEach((src) => { new Image().src = src; });

$("#charSwap").addEventListener("click", () => {
  charCard.classList.add("swapping");
  setTimeout(() => {
    charIndex = (charIndex + 1) % CHAR_IMAGES.length;
    charImg.onload = () => {
      charCard.classList.remove("swapping");
      moveChar();
    };
    charImg.src = CHAR_IMAGES[charIndex];
    $("#charCount").textContent = `${charIndex + 1} / ${CHAR_IMAGES.length}`;
  }, 220);
});

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

async function copyText(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {

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
