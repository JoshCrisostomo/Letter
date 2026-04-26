// ═══════════════════════════════════════════════════════════
//  CONFIG — set your release date/time and PIN here
// ═══════════════════════════════════════════════════════════

// The exact date & time the letter becomes unlockable.
// Format: new Date(year, monthIndex, day, hour, minute, second)
// monthIndex is 0-based: Jan=0, Feb=1, … Dec=11
// This example: April 27, 2026 at 1:00 AM
const RELEASE_DATE = new Date(2026, 3, 27, 1, 0, 0);

// Your 6-digit PIN (the date you first met, e.g. MMDDYY)
const SECRET = "000000"; // ← change this


// ═══════════════════════════════════════════════════════════
//  SCREEN ROUTING — decides which screen to show on load
// ═══════════════════════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function init() {
  const now = new Date();
  if (now < RELEASE_DATE) {
    showScreen('countdown-screen');
    startCountdown();
  } else {
    showScreen('lock-screen');
  }
}

// ═══════════════════════════════════════════════════════════
//  COUNTDOWN TIMER
// ═══════════════════════════════════════════════════════════
function startCountdown() {
  // Show the release date/time as a readable label
  const opts = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
  document.getElementById('countdown-date-label').textContent =
    '🗓️ ' + RELEASE_DATE.toLocaleString('en-US', opts);

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = RELEASE_DATE - new Date();

    if (diff <= 0) {
      // Time's up — switch to lock screen with a little fanfare
      clearInterval(timer);
      document.getElementById('cd-days').textContent  = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent  = '00';
      document.getElementById('cd-secs').textContent  = '00';
      setTimeout(() => {
        showScreen('lock-screen');
      }, 800);
      return;
    }

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins  = Math.floor((diff / (1000 * 60)) % 60);
    const secs  = Math.floor((diff / 1000) % 60);

    document.getElementById('cd-days').textContent  = pad(days);
    document.getElementById('cd-hours').textContent = pad(hours);
    document.getElementById('cd-mins').textContent  = pad(mins);
    document.getElementById('cd-secs').textContent  = pad(secs);
  }

  tick(); // run immediately so there's no 1s blank
  const timer = setInterval(tick, 1000);
}


// ═══════════════════════════════════════════════════════════
//  FALLING LEAVES (canvas-drawn)
// ═══════════════════════════════════════════════════════════
(function initLeaves() {
  const cv = document.getElementById('leaf-canvas');
  const cx = cv.getContext('2d');

  function resize() {
    cv.width  = window.innerWidth;
    cv.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = [
    'rgba(187,157,255,', 'rgba(212,168,255,', 'rgba(155,110,252,',
    'rgba(244,160,192,', 'rgba(212,104,142,', 'rgba(232,200,240,',
    'rgba(200,140,230,', 'rgba(240,180,220,',
  ];

  function drawLeaf(ctx, x, y, size, angle, colorBase, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    const s = size;

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.bezierCurveTo( s * 0.95, -s * 0.6,  s * 1.1,  s * 0.3,  0,  s * 0.85);
    ctx.bezierCurveTo(-s * 1.1,   s * 0.3, -s * 0.95, -s * 0.6, 0, -s * 0.9);
    ctx.closePath();

    const grad = ctx.createRadialGradient(-s*0.2, -s*0.3, s*0.1, 0, 0, s*1.2);
    grad.addColorStop(0,   colorBase + (alpha * 0.95) + ')');
    grad.addColorStop(0.6, colorBase + (alpha * 0.75) + ')');
    grad.addColorStop(1,   colorBase + (alpha * 0.45) + ')');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.lineTo(0,  s * 0.8);
    ctx.strokeStyle = colorBase + (alpha * 0.4) + ')';
    ctx.lineWidth = s * 0.045;
    ctx.stroke();

    ctx.lineWidth = s * 0.025;
    for (let i = 1; i <= 5; i++) {
      const t      = -s * 0.75 + i * s * 0.3;
      const spread =  s * 0.55 * (1 - Math.abs(i - 3) / 5);
      ctx.beginPath(); ctx.moveTo(0, t);
      ctx.quadraticCurveTo( spread * 0.6, t - s * 0.05,  spread, t + s * 0.18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, t);
      ctx.quadraticCurveTo(-spread * 0.6, t - s * 0.05, -spread, t + s * 0.18); ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(0, s * 0.8);
    ctx.quadraticCurveTo(s * 0.1, s * 1.15, 0, s * 1.35);
    ctx.lineWidth = s * 0.055;
    ctx.strokeStyle = colorBase + (alpha * 0.55) + ')';
    ctx.stroke();

    ctx.restore();
  }

  function mkLeaf() {
    const size = 28 + Math.random() * 46;
    return {
      x: Math.random() * cv.width,
      y: -size * 2 - Math.random() * cv.height,
      size,
      angle:     Math.random() * Math.PI * 2,
      rot:       (Math.random() - 0.5) * 0.025,
      vy:        0.55 + Math.random() * 1.1,
      vx:        (Math.random() - 0.5) * 0.7,
      sway:      Math.random() * Math.PI * 2,
      swaySpeed: 0.008 + Math.random() * 0.012,
      swayAmp:   18 + Math.random() * 30,
      color:     COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha:     0.35 + Math.random() * 0.45,
    };
  }

  const leaves = [];
  for (let i = 0; i < 28; i++) {
    const l = mkLeaf();
    l.y = Math.random() * cv.height;
    leaves.push(l);
  }

  (function tick() {
    cx.clearRect(0, 0, cv.width, cv.height);
    for (const l of leaves) {
      l.sway  += l.swaySpeed;
      l.x     += l.vx + Math.sin(l.sway) * 0.55;
      l.y     += l.vy;
      l.angle += l.rot;
      drawLeaf(cx, l.x, l.y, l.size, l.angle, l.color, l.alpha);
      if (l.y > cv.height + l.size * 2) Object.assign(l, mkLeaf());
    }
    requestAnimationFrame(tick);
  })();
})();


// ═══════════════════════════════════════════════════════════
//  DIGIT ROLLERS
// ═══════════════════════════════════════════════════════════
const values  = [0, 0, 0, 0, 0, 0];
const tracks  = [];
const DIGIT_H = 56;

const rollerWrap = document.getElementById('rollers-wrap');

for (let i = 0; i < 6; i++) {
  const col = document.createElement('div');
  col.className = 'roller';

  const upBtn = document.createElement('button');
  upBtn.className = 'roller-btn';
  upBtn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>`;
  upBtn.addEventListener('click', () => spin(i, 1));

  const win   = document.createElement('div'); win.className = 'roller-window';
  const mT    = document.createElement('div'); mT.className  = 'roller-mask-t';
  const mB    = document.createElement('div'); mB.className  = 'roller-mask-b';
  const track = document.createElement('div'); track.className = 'roller-track';

  for (let d = 0; d <= 9; d++) {
    const el = document.createElement('div');
    el.className   = 'roller-digit' + (d === 0 ? ' active' : '');
    el.textContent = d;
    track.appendChild(el);
  }
  tracks.push(track);
  win.appendChild(mT); win.appendChild(track); win.appendChild(mB);

  const dnBtn = document.createElement('button');
  dnBtn.className = 'roller-btn';
  dnBtn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`;
  dnBtn.addEventListener('click', () => spin(i, -1));

  col.appendChild(upBtn); col.appendChild(win); col.appendChild(dnBtn);
  rollerWrap.appendChild(col);

  // Separator dots after positions 1 and 3 (MM·DD·YY)
  if (i === 1 || i === 3) {
    const sep = document.createElement('div');
    sep.className = 'roller-sep';
    rollerWrap.appendChild(sep);
  }
}

function spin(idx, dir) {
  values[idx] = (values[idx] + dir + 10) % 10;
  tracks[idx].style.transform = `translateY(${-values[idx] * DIGIT_H}px)`;
  Array.from(tracks[idx].children).forEach((el, i) => {
    el.classList.toggle('active', i === values[idx]);
  });
  document.getElementById('error-msg').textContent = '';
}


// ═══════════════════════════════════════════════════════════
//  UNLOCK LOGIC
// ═══════════════════════════════════════════════════════════
document.getElementById('unlock-btn').addEventListener('click', () => {
  if (values.join('') === SECRET) {
    doUnlock();
  } else {
    const outer = document.getElementById('heart-lock-outer');
    outer.classList.remove('shake');
    void outer.offsetWidth;
    outer.classList.add('shake');
    document.getElementById('error-msg').textContent = "Not quite… try again 💜";
    setTimeout(() => {
      document.getElementById('error-msg').textContent = '';
      outer.classList.remove('shake');
    }, 1500);
  }
});

function doUnlock() {
  const icon = document.getElementById('lock-icon');
  icon.textContent = '🔓';
  icon.classList.add('pop');
  burstConfetti();
  setTimeout(() => {
    showScreen('letter-screen');
  }, 1000);
}


// ═══════════════════════════════════════════════════════════
//  ENVELOPE / LETTER
// ═══════════════════════════════════════════════════════════
document.getElementById('envelope').addEventListener('click', () => {
  document.getElementById('letter-overlay').classList.add('open');
});
document.getElementById('close-letter').addEventListener('click', () => {
  document.getElementById('letter-overlay').classList.remove('open');
});
document.getElementById('letter-overlay').addEventListener('click', e => {
  if (e.target.id === 'letter-overlay')
    document.getElementById('letter-overlay').classList.remove('open');
});


// ═══════════════════════════════════════════════════════════
//  CONFETTI BURST
// ═══════════════════════════════════════════════════════════
function burstConfetti() {
  const cv = document.getElementById('confetti-canvas');
  const cx = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight;

  const cols = ['#bb9dff','#d4688e','#f4a0c0','#9b6efc','#e8c8ff','#d8c8ff','#c4a8f8'];
  const ps = Array.from({ length: 100 }, () => ({
    x:  innerWidth  / 2 + (Math.random() - 0.5) * 120,
    y:  innerHeight / 2 - 40,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 18 - 5,
    s:  6 + Math.random() * 10,
    c:  cols[Math.floor(Math.random() * cols.length)],
    r:  Math.random() * 360,
    rv: (Math.random() - 0.5) * 10,
    a:  1,
    heart: Math.random() < 0.5,
  }));

  function drawHeart(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x, y, x-s*.5, y, x-s*.5, y+s*.35);
    ctx.bezierCurveTo(x-s*.5, y+s*.7, x, y+s*1.1, x, y+s*1.1);
    ctx.bezierCurveTo(x, y+s*1.1, x+s*.5, y+s*.7, x+s*.5, y+s*.35);
    ctx.bezierCurveTo(x+s*.5, y, x, y, x, y+s*.35);
    ctx.closePath();
  }

  let t = 0;
  (function frame() {
    cx.clearRect(0, 0, cv.width, cv.height);
    ps.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.48; p.r += p.rv; p.a -= 0.011;
      if (p.a <= 0) return;
      cx.save(); cx.globalAlpha = p.a; cx.fillStyle = p.c;
      cx.translate(p.x, p.y); cx.rotate(p.r * Math.PI / 180);
      if (p.heart) drawHeart(cx, 0, -p.s * 0.5, p.s);
      else { cx.beginPath(); cx.arc(0, 0, p.s * 0.45, 0, Math.PI * 2); }
      cx.fill(); cx.restore();
    });
    if (++t < 160) requestAnimationFrame(frame);
    else cx.clearRect(0, 0, cv.width, cv.height);
  })();
}


// ═══════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════
init();
