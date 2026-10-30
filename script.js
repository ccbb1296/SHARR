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

const CURSOR_FX = true;

(function neonCursor() {
  if (!CURSOR_FX) return;
  if (!matchMedia("(pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cv = document.createElement("canvas");
  cv.className = "cursor-fx";
  document.body.appendChild(cv);
  document.documentElement.classList.add("fx-cursor");
  const ctx = cv.getContext("2d");

  let dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const orbs = [
    { rgb: "255,61,127", trail: [] },
    { rgb: "62,240,193", trail: [] },
  ];
  const sparks = [];
  let mx = -200, my = -200, cx = mx, cy = my;
  let angle = 0, radius = 15, visible = false, hover = false, down = false;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (!visible) { cx = mx; cy = my; visible = true; }
    hover = !!e.target.closest("a, button, label, input, .char-card, [data-copy]");
  });
  document.addEventListener("mouseleave", () => { visible = false; });
  document.addEventListener("mousedown", () => {
    down = true;

    orbs.forEach((o) => {
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 3;
        sparks.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, rgb: o.rgb, size: 2 + Math.random() * 2 });
      }
    });
  });
  document.addEventListener("mouseup", () => { down = false; });

  function dot(x, y, r, rgb, alpha) {
    ctx.fillStyle = `rgba(${rgb},${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    if (visible) {
      cx += (mx - cx) * 0.35;
      cy += (my - cy) * 0.35;
      const targetR = down ? 8 : hover ? 24 : 15;
      radius += (targetR - radius) * 0.2;
      angle += hover ? 0.17 : 0.1;

      orbs.forEach((o, i) => {
        const a = angle + i * Math.PI;
        const x = cx + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius;
        o.trail.push({ x, y });
        if (o.trail.length > 20) o.trail.shift();
        o.x = x; o.y = y;

        if (Math.random() < 0.6) {
          sparks.push({ x, y, vx: (Math.random() - 0.5) * 0.8, vy: -0.4 - Math.random() * 0.9, life: 1, rgb: o.rgb, size: 1 + Math.random() * 2 });
        }
      });
    } else {
      orbs.forEach((o) => { if (o.trail.length) o.trail.shift(); });
    }

    ctx.globalCompositeOperation = "lighter";

    orbs.forEach((o) => {
      const n = o.trail.length;
      o.trail.forEach((p, j) => {
        const t = (j + 1) / n;
        dot(p.x, p.y, 1 + t * 5, o.rgb, t * 0.35);
      });
    });

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vx *= 0.96; s.vy *= 0.96;
      s.life -= 0.035;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      dot(s.x, s.y, s.size * s.life, s.rgb, s.life * 0.8);
    }
    if (sparks.length > 300) sparks.splice(0, sparks.length - 300);

    if (visible) {
      orbs.forEach((o) => {
        ctx.shadowBlur = 18;
        ctx.shadowColor = `rgb(${o.rgb})`;
        dot(o.x, o.y, 6, o.rgb, 0.9);
        ctx.shadowBlur = 0;
        dot(o.x, o.y, 2.6, "255,255,255", 0.95);
      });
      dot(mx, my, 2, "255,255,255", 0.9);
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
