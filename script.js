// ============================================================
// CONFIG
// ============================================================
const USER_ID = "1183198296861319191";
const LANYARD_API = `https://api.lanyard.rest/v1/users/${USER_ID}`;
const LANYARD_WS  = "wss://api.lanyard.rest/socket";

// ============================================================
// LOADER
// ============================================================
const loaderMessages = [
  "Connecting to Discord...",
  "Syncing presence data...",
  "Loading server info...",
  "Fetching experiences...",
  "Almost there..."
];

function runLoader() {
  const bar    = document.getElementById("loaderBar");
  const status = document.getElementById("loaderStatus");
  const loader = document.getElementById("loader");

  // Show loader
  loader.classList.remove("hidden");

  const canvas = document.getElementById("loaderCanvas");
  const ctx    = canvas.getContext("2d");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  // Scanline grid effect
  let scanY = 0;
  let gridAlpha = 0;
  let fadeIn = true;

  // Floating Discord-style blobs
  const blobs = Array.from({ length: 6 }, (_, i) => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 120 + Math.random() * 180,
    dx: (Math.random() - 0.5) * 0.3,
    dy: (Math.random() - 0.5) * 0.3,
    hue: [260, 280, 300, 220, 240, 200][i],
    alpha: 0.04 + Math.random() * 0.05
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark base
    ctx.fillStyle = "#080a0e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Blobs
    blobs.forEach(b => {
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, `hsla(${b.hue},70%,60%,${b.alpha})`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      b.x += b.dx; b.y += b.dy;
      if (b.x < -b.r || b.x > canvas.width + b.r) b.dx *= -1;
      if (b.y < -b.r || b.y > canvas.height + b.r) b.dy *= -1;
    });

    // Grid lines
    ctx.strokeStyle = "rgba(88,101,242,0.06)";
    ctx.lineWidth = 1;
    const gap = 40;
    for (let x = 0; x < canvas.width; x += gap) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gap) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Scanline sweep
    const sweepGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
    sweepGrad.addColorStop(0, "transparent");
    sweepGrad.addColorStop(0.5, "rgba(88,101,242,0.08)");
    sweepGrad.addColorStop(1, "transparent");
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(0, scanY - 60, canvas.width, 120);
    scanY = (scanY + 2) % canvas.height;

    if (!loader.classList.contains("hidden") && document.body.contains(loader)) requestAnimationFrame(draw);
  }
  draw();

  let pct = 0, msgIdx = 0;
  const interval = setInterval(() => {
    pct += Math.random() * 16 + 5;
    if (pct > 100) pct = 100;
    bar.style.width = pct + "%";

    if (msgIdx < loaderMessages.length - 1 && pct > (msgIdx + 1) * 20) {
      msgIdx++;
      status.textContent = loaderMessages[msgIdx];
    }

    if (pct >= 100) {
      clearInterval(interval);
      status.textContent = "Welcome, hounnds.";
      setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => {
          loader.classList.add("hidden");
          document.body.classList.add("entered");
          revealElements();
        }, 900);
      }, 700);
    }
  }, 200);
}

// ============================================================
// REVEAL ON SCROLL
// ============================================================
function revealElements() {
  const els = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.05 });
  els.forEach(el => observer.observe(el));
}

// ============================================================
// CUSTOM CURSOR
// ============================================================
function initCursor() {
  const cursor = document.getElementById("cursor");
  const glow   = document.getElementById("cursorGlow");
  let mx = 0, my = 0;
  let gx = 0, gy = 0;

  document.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + "px";
    cursor.style.top  = my + "px";
  });

  // Smooth glow follow
  function animGlow() {
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;
    glow.style.left = gx + "px";
    glow.style.top  = gy + "px";
    requestAnimationFrame(animGlow);
  }
  animGlow();

  // Hover detection
  const hoverEls = "a, button, .hov-card, .role-tag, .server-card__btn, .join-btn, .sidebar__link, .scroll-role";
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });

  // Click burst
  document.addEventListener("click", e => {
    const burst = document.createElement("div");
    burst.style.cssText = `
      position:fixed; left:${e.clientX}px; top:${e.clientY}px;
      width:20px; height:20px; border-radius:50%;
      border:2px solid rgba(88,101,242,0.8);
      transform:translate(-50%,-50%) scale(0);
      pointer-events:none; z-index:9997;
      animation: burstAnim 0.5s ease forwards;
    `;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 500);
  });

  const style = document.createElement("style");
  style.textContent = `
    @keyframes burstAnim {
      to { transform: translate(-50%,-50%) scale(3); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
// LANYARD — Discord presence
// ============================================================
let spotifyInterval = null;

function msToTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function startSpotifyBar(ts) {
  clearInterval(spotifyInterval);
  spotifyInterval = setInterval(() => {
    const elapsed = Date.now() - ts.start;
    const total   = ts.end - ts.start;
    const pct     = Math.min((elapsed / total) * 100, 100);
    document.getElementById("spotifyProgress").style.width = pct + "%";
    document.getElementById("spotifyElapsed").textContent  = msToTime(elapsed);
    document.getElementById("spotifyDuration").textContent = msToTime(total);
  }, 1000);
}

function statusClass(s) {
  return { online: "online", dnd: "dnd", idle: "idle" }[s] || "offline";
}

function statusLabel(s) {
  return {
    online:  '<span class="dot green"></span> Online',
    dnd:     '<span class="dot red"></span> Do Not Disturb',
    idle:    '<span class="dot yellow"></span> Idle',
    offline: '<span class="dot"></span> Offline'
  }[s] || '<span class="dot"></span> Offline';
}

function applyPresence(data) {
  const { discord_status: status, discord_user: user, spotify, listening_to_spotify } = data;

  // Avatar
  const hash = user.avatar;
  const url  = hash
    ? `https://cdn.discordapp.com/avatars/${user.id}/${hash}.${hash.startsWith("a_") ? "gif" : "png"}?size=128`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  ["sidebarAvatar", "profileAvatar"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.src = url;
  });

  // Name
  const name = user.global_name || user.username;
  const sidebarName = document.getElementById("sidebarUsername");
  const handle      = document.getElementById("profileHandle");
  if (sidebarName) sidebarName.textContent = name;
  if (handle)      handle.textContent = `@${user.username}`;

  // Status tag
  const tagEl = document.getElementById("sidebarTag");
  if (tagEl) tagEl.textContent = status.toUpperCase();

  // Status indicators
  const cls = statusClass(status);
  ["sidebarStatus"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = `sidebar__status ${cls}`;
  });
  const dot = document.getElementById("profileStatusDot");
  if (dot) dot.className = `profile-card__status-dot ${cls}`;
  const lbl = document.getElementById("profileStatusLabel");
  if (lbl) lbl.innerHTML = statusLabel(status);

  // Spotify
  const widget = document.getElementById("spotifyWidget");
  if (listening_to_spotify && spotify) {
    document.getElementById("spotifySong").textContent   = spotify.song;
    document.getElementById("spotifyArtist").textContent = `by ${spotify.artist} — ${spotify.album}`;
    document.getElementById("spotifyArt").src            = spotify.album_art_url || "";
    startSpotifyBar(spotify.timestamps);
    widget.style.display = "flex";
  } else {
    clearInterval(spotifyInterval);
    widget.style.display = "none";
  }
}

function connectLanyard() {
  const ws = new WebSocket(LANYARD_WS);
  let hb = null;

  ws.onopen = () => {
    ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: USER_ID } }));
  };

  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.op === 1) {
      hb = setInterval(() => ws.send(JSON.stringify({ op: 3 })), msg.d.heartbeat_interval);
    }
    if (msg.op === 0 && (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE")) {
      applyPresence(msg.d);
    }
  };

  ws.onclose = () => { clearInterval(hb); setTimeout(connectLanyard, 5000); };
  ws.onerror = () => ws.close();
}

async function fetchPresenceREST() {
  try {
    const res  = await fetch(LANYARD_API);
    const json = await res.json();
    if (json.success) applyPresence(json.data);
  } catch (e) { /* silent */ }
}

// ============================================================
// CLOCKS
// ============================================================
function updateClocks() {
  const now = new Date();
  const sho  = now.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit" });
  const you  = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const s1 = document.getElementById("shoTime");
  const s2 = document.getElementById("yourTime");
  if (s1) s1.textContent = `${sho} hounnds (EST)`;
  if (s2) s2.textContent = `${you} You (Local)`;
}

// ============================================================
// ROLE TAG → SCROLL TO CARD
// ============================================================
function initRoleTags() {
  document.querySelectorAll(".scroll-role").forEach(tag => {
    tag.addEventListener("click", e => {
      e.preventDefault();
      const targetId = tag.dataset.target;
      const target = document.getElementById(targetId);
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        target.classList.add("highlight-target");
        setTimeout(() => target.classList.remove("highlight-target"), 1800);
      }, 500);
    });
  });
}

// ============================================================
// SIDEBAR SCROLL SPY
// ============================================================
function initScrollSpy() {
  const sections = document.querySelectorAll(".section[id]");
  const links    = document.querySelectorAll(".sidebar__link[data-section]");

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove("active"));
        const a = document.querySelector(`.sidebar__link[data-section="${entry.target.id}"]`);
        if (a) a.classList.add("active");
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => obs.observe(s));

  document.querySelectorAll('.sidebar__link[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const t = document.querySelector(link.getAttribute("href"));
      if (t) t.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  // loader now triggered by enter screen click
  initCursor();
  initRoleTags();
  initScrollSpy();
  fetchPresenceREST();
  connectLanyard();
  updateClocks();
  setInterval(updateClocks, 30000);
});

// ============================================================

// ============================================================
// DISCORD SERVER WIDGETS — live counts + icons
// ============================================================
const SERVERS = [
  { inviteCode: "PtKWyrYeUP", iconElId: "sidebarServerIcon", metaElId: null,           isPortfolio: true  },
  { inviteCode: "DKSd4A386H", iconElId: "iconResonance",     metaElId: "meta-resonance" },
  { inviteCode: "myYGKXPa4Z", iconElId: "iconBleach",        metaElId: "meta-bleach"    },
  { inviteCode: "DfP3WvHYwn", iconElId: "iconShogun",        metaElId: "meta-shogun"    },
  { inviteCode: "4aPfnt8mT8", iconElId: "iconGrimoire",      metaElId: "meta-grimoire"  },
  { inviteCode: "ePZfXftYZr", iconElId: "iconBLR",           metaElId: "meta-blr"       },
  { inviteCode: "pF9Xr2y6YW", iconElId: "iconShinokai", metaElId: "meta-shinokai" },
];

async function fetchServerInfo(server) {
  try {
    const res  = await fetch(`https://discord.com/api/v9/invites/${server.inviteCode}?with_counts=true`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.guild) return;

    const online  = data.approximate_presence_count || 0;
    const members = data.approximate_member_count   || 0;

    // --- Icon ---
    if (server.iconElId && data.guild.icon) {
      const el = document.getElementById(server.iconElId);
      if (el) {
        const ext = data.guild.icon.startsWith("a_") ? "gif" : "png";
        const url = `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.${ext}?size=64`;
        if (server.isPortfolio) {
          // sidebar icon — replace the letter with an img
          el.innerHTML = `<img src="${url}" alt="icon" style="width:100%;height:100%;border-radius:50%;object-fit:cover"/>`;
        } else {
          el.innerHTML = `<img src="${url}" alt="${data.guild.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover"/>`;
        }
      }
    }

    // --- Online count in sidebar header + widget + contact ---
    if (server.isPortfolio) {
      const iconUrl = data.guild.icon
        ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.${data.guild.icon.startsWith("a_") ? "gif" : "png"}?size=64`
        : null;

      // Sidebar icon
      const sidebarIcon = document.getElementById("sidebarServerIcon");
      if (sidebarIcon && iconUrl) sidebarIcon.innerHTML = `<img src="${iconUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover"/>`;

      // Widget icon
      const widgetIcon = document.getElementById("widgetPortfolioIcon");
      if (widgetIcon && iconUrl) widgetIcon.innerHTML = `<img src="${iconUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover"/>`;

      // Contact icon
      const contactIcon = document.getElementById("contactPortfolioIcon");
      if (contactIcon && iconUrl) contactIcon.innerHTML = `<img src="${iconUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover"/>`;

      // Sidebar online count
      const onlineEl = document.getElementById("onlineCount");
      if (onlineEl) onlineEl.innerHTML = `<span class="dot green"></span> ${online}`;

      // Widget online count
      const widgetCount = document.getElementById("widgetOnlineCount");
      if (widgetCount) widgetCount.textContent = online;

      // Contact online count
      const contactCount = document.getElementById("contactOnlineCount");
      if (contactCount) contactCount.textContent = online;
    }

    // --- Member/online meta on card ---
    if (server.metaElId) {
      const meta = document.getElementById(server.metaElId);
      if (meta) {
        meta.innerHTML = `
          <span><span class="dot green"></span> ${online.toLocaleString()} online</span>
          <span>👥 ${members.toLocaleString()} members</span>
        `;
      }
    }
  } catch (e) { /* silent — CORS or invalid invite */ }
}

function fetchAllServers() {
  SERVERS.forEach(s => fetchServerInfo(s));
}

fetchAllServers();

// ============================================================
// ENTER SCREEN + AUDIO
// ============================================================
function initEnterScreen() {
  const enterScreen = document.getElementById("enterScreen");
  const audio       = document.getElementById("bgAudio");
  const musicBar    = document.getElementById("musicBar");
  const musicToggle = document.getElementById("musicToggle");

  audio.volume = 0.35;

  function doEnter() {
    audio.play().catch(() => {});
    enterScreen.classList.add("hidden");
    musicBar.style.display = "flex";
    document.body.classList.add("entered");
    runLoader();
  }

  // Click anywhere on enter screen
  enterScreen.addEventListener("click", doEnter);

  musicToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (audio.paused) {
      audio.play();
      musicBar.classList.remove("paused");
      musicToggle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    } else {
      audio.pause();
      musicBar.classList.add("paused");
      musicToggle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    }
  });
}

// Override DOMContentLoaded to use enter screen first
document.addEventListener("DOMContentLoaded", () => {
  initEnterScreen();
  initCursor();
  initRoleTags();
  initScrollSpy();
  fetchPresenceREST();
  connectLanyard();
  updateClocks();
  setInterval(updateClocks, 30000);
});

// ============================================================
// IMPRESSED POPUP — shows after 40s
// ============================================================
function initPopup() {
  const popup         = document.getElementById("impressedPopup");
  const close         = document.getElementById("popupClose");
  const viewProfile   = document.getElementById("popupViewProfile");
  const overlay       = document.getElementById("profileModalOverlay");
  const modalClose    = document.getElementById("profileModalClose");

  // Show after 30 seconds — rAF ensures transition plays after display:block
  setTimeout(() => {
    popup.style.display = "block";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        popup.classList.add("visible");
      });
    });
  }, 25000);

  // Close popup on X
  close.addEventListener("click", (e) => {
    e.stopPropagation();
    popup.classList.remove("visible");
  });

  // Open profile modal — syncs live data from Lanyard
  viewProfile.addEventListener("click", (e) => {
    e.stopPropagation();

    const modalAvatar   = document.getElementById("modalAvatar");
    const profileAvatar = document.getElementById("profileAvatar");
    if (profileAvatar && profileAvatar.src) modalAvatar.src = profileAvatar.src;

    const modalStatus = document.getElementById("modalStatus");
    const profileDot  = document.getElementById("profileStatusDot");
    if (profileDot) modalStatus.className = profileDot.className.replace("profile-card__status-dot", "profile-modal__status");

    const modalStatusLabel = document.getElementById("modalStatusLabel");
    const profileLabel     = document.getElementById("profileStatusLabel");
    if (profileLabel) modalStatusLabel.innerHTML = profileLabel.innerHTML;

    const modalName   = document.getElementById("modalName");
    const sidebarName = document.getElementById("sidebarUsername");
    if (sidebarName) modalName.textContent = sidebarName.textContent;

    const modalTag      = document.getElementById("modalTag");
    const profileHandle = document.getElementById("profileHandle");
    if (profileHandle) modalTag.textContent = profileHandle.textContent;

    overlay.classList.add("visible");
    popup.classList.remove("visible");
  });

  // Close modal
  modalClose.addEventListener("click", () => overlay.classList.remove("visible"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("visible");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPopup();
});

