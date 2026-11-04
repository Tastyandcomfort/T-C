// ===================================================
// T&C APPLE SYSTEM: MODEL A SEMANTIC TOKENS & LOGIC
// ===================================================

const stallLat = 17.367761; 
const stallLng = 78.537016; 

const customAmenities = {
  'hospital': { name: 'TIMS Hospital', query: '17.369313, 78.536573' },
  'police station': { name: 'Saroor Nagar Police Station', query: '17.368289, 78.527748' },
  'fire station': { name: 'Malakpet Fire Station', query: '17.368435, 78.501937' },
  'metro station': { name: 'Chaitanyapuri Metro Station', query: '17.368154, 78.536516' }, 
  'bus station': { name: 'Bus Stop infront of Gautham Electrical Shop', query: '17.368161, 78.534952' },
  'atm': { name: '24*7 ATMs of SBI/ICICI/DCB', query: '17.368727, 78.533186' },
  'gas station': { name: 'Bharat Petroleum Bunk', query: '17.367467, 78.539245' }
};

// Unified Broadcast Channels Catalog
const channelStreams = [
  { id: 'II_m28Bm-iM', mode: 'video', name: 'TV9 Live News', category: 'Telugu News', isLive: true },
  { id: '28IZl9iM-EE', mode: 'video', name: 'V6 News Live', category: 'Regional News', isLive: true },
  { id: 'KQhNZQ_Uag8', mode: 'video', name: 'ABC News Live', category: 'World News', isLive: true },
  { id: 'QB5BNdBFujE', mode: 'video', name: 'Bloomberg Market', category: 'Finance', isLive: true },
  { id: 'gCNeDWCI0vo', mode: 'video', name: 'Al Jazeera Live', category: 'International', isLive: true },
  { id: 'C96oohpWBGw', mode: 'video', name: 'Fox News Live', category: 'US News', isLive: true },
  { id: 'HvZt-nh9sGg', mode: 'video', name: 'France 24 Live', category: 'Global', isLive: true },
  { id: '1_Ih0JYmkjI', mode: 'video', name: 'CNBC Live', category: 'Markets', isLive: true },
  { id: 'umLWFz4izTM', mode: 'video', name: 'Sky News Live', category: 'Live Desk', isLive: true },
  { id: 'GotlA1KKWoo', mode: 'video', name: 'CNN Live', category: 'Breaking News', isLive: true },
  { id: 'IzOOvR-XzAg', mode: 'live', name: 'T&C Zone Live', category: 'Stall Cam', isLive: true },
  { id: 'MiQe9ob9aDc', mode: 'wildlife', name: 'Wild Safari Cam', category: 'Nature Safari', isLive: true },
  { id: 'fE_xxKiCHO0', mode: 'sports', name: 'Sports Highlights', category: 'Sports', isLive: true },
  { id: 'VdG_RC1POC8', mode: 'music', name: 'T&C Chill Lounge', category: 'Music Audio', isLive: false },
  { id: 'OKQEMp2555A', mode: 'nasa', name: 'NASA Earth View', category: 'Space HD', isLive: true },
  { id: 'n4I0d44oBEs', mode: 'airport', name: 'Airside Live', category: 'Aviation', isLive: true },
  { id: 'FFtPSPByBmk', mode: 'hindu', name: 'Bhagavat Geetha', category: 'Spiritual', isLive: false },
  { id: '_1FpcN1U_KY', mode: 'muslim', name: 'Holy Khuran', category: 'Spiritual', isLive: false },
  { id: 'dmgsOBr2lAA', mode: 'christian', name: 'Holy Bibul', category: 'Spiritual', isLive: false },
  { id: 'U71NrLiWWjI', mode: 'law', name: 'Constitution of India', category: 'Civics & Law', isLive: false },
  { id: null, mode: 'file', name: 'Media Showcase', category: 'T&C Media', isLive: false }
];

let allModesData = { driving: [], walking: [] };
let currentMode = 'driving';
let routeLayers = [];
let destMarker = null;
let currentDestName = "";
let telemetryMarker = null;
let activePinnedLat = null;
let activePinnedLng = null;
let pendingLat = null;
let pendingLng = null;
let masterTelemetryData = null;

let map = null;
let seismicLayerGroup = null;

// ===================================================
// 1. IMAGE FAILOVER HANDLER
// ===================================================
function handleImgError(img, iconName) {
  const parent = img.parentElement;
  if (!parent) return;
  img.style.display = 'none';

  let fallback = parent.querySelector('.auto-generated-fallback');
  if (!fallback) {
    fallback = document.createElement('div');
    fallback.className = 'auto-generated-fallback';
    fallback.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:var(--apple-gold); font-size:2rem; background:var(--surface-input); border-radius:inherit;';
    fallback.innerHTML = `<i class="fa-solid fa-${iconName || 'bowl-food'}"></i>`;
    parent.style.position = 'relative';
    parent.appendChild(fallback);
  }
}

// ===================================================
// 2. APPLE THEME ENGINE (DARK / LIGHT)
// ===================================================
function setAppTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('tc-theme', theme);

  const btnLight = document.getElementById('btn-theme-light');
  const btnDark = document.getElementById('btn-theme-dark');
  const mobileIcon = document.getElementById('mobile-theme-icon');
  const metaTheme = document.getElementById('theme-color-meta');

  if (theme === 'light') {
    if (btnLight) btnLight.classList.add('active-theme');
    if (btnDark) btnDark.classList.remove('active-theme');
    if (mobileIcon) mobileIcon.className = "fa-solid fa-sun";
    if (metaTheme) metaTheme.setAttribute('content', '#f2f2f7');
  } else {
    if (btnDark) btnDark.classList.add('active-theme');
    if (btnLight) btnLight.classList.remove('active-theme');
    if (mobileIcon) mobileIcon.className = "fa-solid fa-moon";
    if (metaTheme) metaTheme.setAttribute('content', '#000000');
  }
}

function toggleThemeQuick() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  setAppTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
  const saved = localStorage.getItem('tc-theme');
  if (saved) {
    setAppTheme(saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    setAppTheme('light');
  } else {
    setAppTheme('dark');
  }
}

// ===================================================
// 3. LANGUAGE SWITCHER (EN, TE, HI)
// ===================================================
function changeLang(langCode) {
  ['en', 'te', 'hi'].forEach(l => {
    const b = document.getElementById(`lang-btn-${l}`);
    if (b) b.classList.toggle('active-lang', l === langCode);
  });

  document.cookie = `googtrans=/en/${langCode}; path=/;`;
  document.cookie = `googtrans=/en/${langCode}; domain=${window.location.hostname}; path=/;`;

  const combo = document.querySelector('.goog-te-combo');
  if (combo) {
    combo.value = langCode;
    combo.dispatchEvent(new Event('change'));
  } else {
    window.location.reload();
  }
}

// ===================================================
// 4. MODEL 1: COMBINED MASTER DECK (HEADLINES VS CHANNELS)
// ===================================================
function switchMasterDeck(deckKey, element) {
  document.querySelectorAll('.master-pill-deck button').forEach(b => b.classList.remove('active-mode'));
  if (element) element.classList.add('active-mode');

  const headlinesPanel = document.getElementById('deck-headlines-subview');
  const channelsPanel = document.getElementById('deck-channels-subview');
  const sectionTitle = document.getElementById('deck-section-title');
  const liveIndicator = document.getElementById('deck-live-indicator');

  if (deckKey === 'headlines') {
    if (headlinesPanel) headlinesPanel.style.display = 'block';
    if (channelsPanel) channelsPanel.style.display = 'none';
    if (sectionTitle) sectionTitle.innerText = "Headlines & Information";
    if (liveIndicator) liveIndicator.style.display = 'none';
  } else {
    if (headlinesPanel) headlinesPanel.style.display = 'none';
    if (channelsPanel) channelsPanel.style.display = 'block';
    if (sectionTitle) sectionTitle.innerText = "Live Broadcast Channels";
    if (liveIndicator) liveIndicator.style.display = 'inline-block';
  }
}

// ===================================================
// 5. APPLE VIDEO SHELF & 8-HANDLE MULTI-DIRECTIONAL PiP
// ===================================================
function renderAppleVideoShelf() {
  const carousel = document.getElementById('channels-carousel');
  if (!carousel) return;

  carousel.innerHTML = channelStreams.map(c => `
    <div class="video-shelf-card apple-squircle" onclick="launchVideo('${c.id}', '${c.name}', '${c.mode}')">
      <div class="card-thumb-wrap">
        ${c.id ? `<img src="https://img.youtube.com/vi/${c.id}/hqdefault.jpg" alt="${c.name}" onerror="handleImgError(this, 'tv')" />` : `<img src="Audi RS5.jpg" alt="${c.name}" onerror="handleImgError(this, 'image')" />`}
        ${c.isLive ? '<div class="card-live-chip"><span class="live-pulse" style="width:5px; height:5px;"></span> LIVE</div>' : ''}
        <div class="card-play-overlay"><i class="fa-solid fa-play"></i></div>
      </div>
      <div class="card-meta-wrap">
        <div class="card-title">${c.name}</div>
        <div class="card-category">${c.category}</div>
      </div>
    </div>
  `).join('');
}

function launchVideo(videoId, title, modeKey) {
  if (videoId) {
    const fileMedia = document.getElementById('file-media-preview');
    if (fileMedia) fileMedia.style.display = 'none';
    launchMiniplayer(videoId, title);
    const ticker = document.getElementById('headphones-ticker');
    if (ticker) ticker.style.display = 'flex';
  } else {
    const fileMedia = document.getElementById('file-media-preview');
    if (fileMedia) fileMedia.style.display = 'block';
  }
}

function launchMiniplayer(videoId, title) {
  const mini = document.getElementById('apple-miniplayer');
  const iframe = document.getElementById('miniplayer-iframe');
  const titleEl = document.getElementById('miniplayer-channel-title');

  if (iframe) iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&enablejsapi=1`;
  if (titleEl) titleEl.innerText = title;
  if (mini) mini.classList.remove('hidden');

  const saved = JSON.parse(localStorage.getItem('tc_pip_dims') || 'null');
  if (saved && saved.width && saved.height) {
    mini.style.width = `${Math.min(saved.width, window.innerWidth - 20)}px`;
    mini.style.height = `${Math.min(saved.height, window.innerHeight - 50)}px`;
  }
}

function closeMiniplayer() {
  const mini = document.getElementById('apple-miniplayer');
  const iframe = document.getElementById('miniplayer-iframe');
  if (iframe) iframe.src = "";
  if (mini) mini.classList.add('hidden');
}

let isPiPMoveMode = true;
let autoLockTimer = null;

function togglePiPLockMode() {
  isPiPMoveMode = !isPiPMoveMode;
  const barrier = document.getElementById('pip-touch-barrier');
  const icon = document.getElementById('pip-lock-icon');
  const btn = document.getElementById('pip-lock-btn');

  if (barrier) barrier.style.pointerEvents = isPiPMoveMode ? 'auto' : 'none';
  if (icon) icon.className = isPiPMoveMode ? 'fa-solid fa-lock text-xs' : 'fa-solid fa-lock-open text-xs';
  if (btn) btn.style.background = isPiPMoveMode ? 'var(--surface-input)' : 'rgba(48, 209, 88, 0.4)';

  if (!isPiPMoveMode) {
    clearTimeout(autoLockTimer);
    autoLockTimer = setTimeout(() => {
      if (!isPiPMoveMode) togglePiPLockMode();
    }, 15000);
  }
}

// 8-Directional Boundary Resizing & Multi-Touch Dragging (Matched to News Engine)
function initPiPInteractivity() {
  const mini = document.getElementById('apple-miniplayer');
  const barrier = document.getElementById('pip-touch-barrier');
  const header = document.getElementById('miniplayer-header');
  if (!mini) return;

  let isDragging = false;
  let isResizing = false;
  let resizeDir = '';
  let startX, startY, startLeft, startTop, startW, startH;

  const savePipDimensions = () => {
    localStorage.setItem('tc_pip_dims', JSON.stringify({
      width: mini.offsetWidth,
      height: mini.offsetHeight
    }));
  };

  const onDragStart = (e) => {
    if (!isPiPMoveMode && e.target === barrier) return;
    if (e.target.closest('.mini-btn')) return;
    
    isDragging = true;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;
    const rect = mini.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    mini.style.right = 'auto';
    mini.style.bottom = 'auto';
    mini.style.left = `${startLeft}px`;
    mini.style.top = `${startTop}px`;
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    const newLeft = Math.max(10, Math.min(window.innerWidth - mini.offsetWidth - 10, startLeft + dx));
    const newTop = Math.max(50, Math.min(window.innerHeight - mini.offsetHeight - 10, startTop + dy));

    mini.style.left = `${newLeft}px`;
    mini.style.top = `${newTop}px`;
  };

  const onDragEnd = () => { isDragging = false; };

  [barrier, header].forEach(el => {
    if (!el) return;
    el.addEventListener('mousedown', onDragStart);
    el.addEventListener('touchstart', onDragStart, { passive: true });
  });

  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('touchmove', onDragMove, { passive: true });
  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchend', onDragEnd);

  // 8-Directional Edge/Corner Resizing
  document.querySelectorAll('.pip-resize-handle').forEach(h => {
    const onResizeStart = (e) => {
      e.stopPropagation();
      e.preventDefault();
      isResizing = true;
      resizeDir = h.dataset.resize;

      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

      startX = clientX;
      startY = clientY;
      const rect = mini.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      startW = rect.width;
      startH = rect.height;

      mini.style.right = 'auto';
      mini.style.bottom = 'auto';
      mini.style.left = `${startLeft}px`;
      mini.style.top = `${startTop}px`;
    };

    h.addEventListener('mousedown', onResizeStart);
    h.addEventListener('touchstart', onResizeStart, { passive: false });
  });

  const onResizeMove = (e) => {
    if (!isResizing) return;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    let newW = startW;
    let newH = startH;
    let newL = startLeft;
    let newT = startTop;

    const minW = 200, maxW = window.innerWidth * 0.95;
    const minH = 140, maxH = window.innerHeight * 0.90;

    if (resizeDir.includes('e')) newW = Math.max(minW, Math.min(maxW, startW + dx));
    if (resizeDir.includes('w')) {
      const calcW = startW - dx;
      if (calcW >= minW && calcW <= maxW) {
        newW = calcW;
        newL = startLeft + dx;
      }
    }

    if (resizeDir.includes('s')) newH = Math.max(minH, Math.min(maxH, startH + dy));
    if (resizeDir.includes('n')) {
      const calcH = startH - dy;
      if (calcH >= minH && calcH <= maxH) {
        newH = calcH;
        newT = startTop + dy;
      }
    }

    mini.style.width = `${newW}px`;
    mini.style.height = `${newH}px`;
    mini.style.left = `${newL}px`;
    mini.style.top = `${newT}px`;
  };

  const onResizeEnd = () => {
    if (isResizing) savePipDimensions();
    isResizing = false;
  };

  window.addEventListener('mousemove', onResizeMove);
  window.addEventListener('touchmove', onResizeMove, { passive: false });
  window.addEventListener('mouseup', onResizeEnd);
  window.addEventListener('touchend', onResizeEnd);
}

// ===================================================
// 6. HEADLINES ENGINE: STRICT USER DATE FILTERING
// ===================================================
let currentScope = 'local';
let selectedNewsDate = new Date().toISOString().split('T')[0];

function switchNewsScope(scope) {
  currentScope = scope;
  ['local', 'india', 'world'].forEach(s => {
    const btn = document.getElementById(`scope-btn-${s}`);
    if (btn) btn.classList.toggle('active', s === scope);
  });
  fetchNews();
}

function handleDateChange(inputElem) {
  const chosen = inputElem.value;
  const today = new Date().toISOString().split('T')[0];

  if (chosen > today) {
    alert("🗓️ Future Date Warning: Cannot select future dates.");
    inputElem.value = selectedNewsDate;
    return;
  }
  selectedNewsDate = chosen;
  fetchNews();
}

async function fetchNews() {
  const container = document.getElementById('news-container');
  if (!container) return;

  container.innerHTML = `
    <div style="color:var(--apple-gold); padding:10px; font-size:0.8rem;">
      <i class="fa-solid fa-spinner fa-spin"></i> Checking ${currentScope.toUpperCase()} news for ${selectedNewsDate}...
    </div>
  `;

  try {
    const res = await fetch(`https://news-lemon-two.vercel.app/api/news?scope=${currentScope}&date=${selectedNewsDate}`);
    const xmlText = await res.text();
    const xml = new DOMParser().parseFromString(xmlText, "text/xml");
    let items = Array.from(xml.querySelectorAll("item"));

    if (!items || items.length === 0) throw new Error("No feed items found");

    // Strictly match user-selected date
    let filteredItems = items.filter(item => {
      const pubDate = item.querySelector("pubDate")?.textContent || "";
      if (!pubDate) return false;
      const d = new Date(pubDate);
      return !isNaN(d) && d.toISOString().split('T')[0] === selectedNewsDate;
    });

    // Fallback if today's feed format uses recent entries
    const todayStr = new Date().toISOString().split('T')[0];
    if (filteredItems.length === 0 && selectedNewsDate === todayStr && items.length > 0) {
      filteredItems = items.slice(0, 15);
    }

    if (filteredItems.length > 0) {
      container.innerHTML = filteredItems.map(item => {
        let rawTitle = item.querySelector("title")?.textContent || "News Story";
        const link = item.querySelector("link")?.textContent || "#";
        const pubDateRaw = item.querySelector("pubDate")?.textContent || "";
        
        let sourceName = "T&C Verified";
        if (rawTitle.includes(" - ")) {
          const parts = rawTitle.split(" - ");
          sourceName = parts.pop().trim();
          rawTitle = parts.join(" - ").trim();
        }

        let timeFormatted = "Live";
        if (pubDateRaw) {
          const d = new Date(pubDateRaw);
          timeFormatted = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
        }

        return `
          <div class="news-item">
            <a href="${link}" target="_blank" rel="noopener">
              ${rawTitle}
            </a>
            <div class="news-meta-row">
              <span class="news-source-tag">${sourceName}</span>
              <span><i class="fa-regular fa-clock" style="margin-right:3px;"></i> ${timeFormatted} &bull; ${selectedNewsDate}</span>
            </div>
          </div>
        `;
      }).join('');
    } else {
      const scopeLabel = currentScope === 'local' ? 'Telangana State' : (currentScope === 'india' ? 'India' : 'World');
      const searchArchiveUrl = `https://www.google.com/search?q=${encodeURIComponent(scopeLabel + ' news ' + selectedNewsDate)}&tbm=nws`;

      container.innerHTML = `
        <div style="background:var(--surface-input); border:0.5px solid var(--surface-border); border-radius:12px; padding:18px; text-align:center;">
          <div style="font-size:0.9rem; font-weight:bold; color:var(--apple-gold); margin-bottom:6px;">
            <i class="fa-solid fa-calendar-xmark" style="margin-right:6px;"></i> No Stories Found for ${selectedNewsDate}
          </div>
          <p style="font-size:0.75rem; color:var(--label-secondary); margin-bottom:12px; line-height:1.4;">
            No direct RSS records matched this exact date. Check the official news archive source below:
          </p>
          <a href="${searchArchiveUrl}" target="_blank" rel="noopener" class="apple-pill-btn" style="font-size:0.75rem; padding:6px 14px;">
            Open ${scopeLabel} News Archive (${selectedNewsDate}) →
          </a>
        </div>
      `;
    }
  } catch (err) {
    container.innerHTML = `<div style="font-size:0.78rem; color:var(--apple-red); padding:8px;">Unable to load feed. Tap refresh.</div>`;
  }
}

// ===================================================
// 7. MAP TELEMETRY, 2ND DESTINATION CALCULATION & TABS
// ===================================================
function getAQIShortBadge(aqiVal) {
  if (aqiVal === undefined || aqiVal === null || isNaN(aqiVal)) return { text: 'AQI N/A', color: '#94a3b8' };
  if (aqiVal <= 50) return { text: `🟢 AQI ${aqiVal} (Good)`, color: '#30d158' };
  if (aqiVal <= 100) return { text: `🟡 AQI ${aqiVal} (Moderate)`, color: '#ffd60a' };
  if (aqiVal <= 150) return { text: `🟠 AQI ${aqiVal} (Sensitive)`, color: '#ff9f0a' };
  return { text: `🔴 AQI ${aqiVal} (Poor)`, color: '#ff453a' };
}

function removePinnedLocation() {
  if (telemetryMarker && map) { map.removeLayer(telemetryMarker); telemetryMarker = null; }
  if (destMarker && map) { map.removeLayer(destMarker); destMarker = null; }
  if (map) routeLayers.forEach(l => map.removeLayer(l));
  routeLayers = [];
  
  activePinnedLat = null;
  activePinnedLng = null;
  currentDestName = "";
  masterTelemetryData = null;

  closeWindyOverlay();
  closeConfirmModal();

  const infoBox = document.getElementById('route-info');
  if (infoBox) {
    infoBox.innerHTML = `
      <div class="card-placeholder">
        <span class="pulse-icon">📍</span>
        <p>Search a destination or tap an amenity tile above.</p>
      </div>
    `;
  }
  setTimeout(() => { if (map) map.invalidateSize(); }, 50);
}

function openSameContainerWindy() {
  if (!activePinnedLat || !activePinnedLng || !masterTelemetryData) {
    alert("Please search or pin a location on the map first!");
    return;
  }
  currentMode = 'radar';
  renderMasterCard();

  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;

  const controls = mapDiv.querySelectorAll('.leaflet-control-container');
  controls.forEach(c => c.style.display = 'none');

  let overlay = document.getElementById('windy-overlay-frame');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'windy-overlay-frame';
    mapDiv.appendChild(overlay);
  }

  const t = masterTelemetryData;
  overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; z-index:999; background:#0f172a; border-radius:16px; display:flex; flex-direction:column; overflow:hidden;';

  overlay.innerHTML = `
    <div style="background:var(--surface-card-elevated); border-bottom:0.5px solid var(--surface-border); padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
      <div style="display:flex; align-items:center; gap:6px; font-size:0.75rem;">
        <span style="color:var(--apple-gold); font-weight:bold;">🌪️ Live Radar</span>
        <span style="color:var(--label-primary);">🌡️ ${t.currW.temperature_2m !== undefined ? t.currW.temperature_2m + '°C' : 'N/A'}</span>
      </div>
      <button onclick="switchMode('driving')" style="background:var(--apple-red); color:#fff; border:none; padding:4px 10px; border-radius:9999px; font-size:0.7rem; font-weight:bold; cursor:pointer;">
        ✕ Close
      </button>
    </div>
    <div style="flex-grow:1; width:100%; height:100%;">
      <iframe width="100%" height="100%" src="https://embed.windy.com/embed2.html?lat=${activePinnedLat}&lon=${activePinnedLng}&detailLat=${activePinnedLat}&detailLon=${activePinnedLng}&marker=true&zoom=9&level=surface&overlay=wind" frameborder="0" style="border:0; width:100%; height:100%;"></iframe>
    </div>
  `;
}

function closeWindyOverlay() {
  const o = document.getElementById('windy-overlay-frame');
  if (o) o.remove();
  const mapDiv = document.getElementById('map');
  if (mapDiv) {
    mapDiv.querySelectorAll('.leaflet-control-container').forEach(c => c.style.display = 'block');
    setTimeout(() => { if (map) map.invalidateSize(); }, 50);
  }
}

function switchMode(mode) {
  if (mode === 'radar') { openSameContainerWindy(); return; }
  closeWindyOverlay();
  closeConfirmModal();
  currentMode = mode;
  if ((mode === 'driving' || mode === 'walking') && activePinnedLat && activePinnedLng) {
    drawRouteOnMap(currentMode, 0);
  }
  renderMasterCard();
  setTimeout(() => { if (map) map.invalidateSize(); }, 50);
}

function showConfirmModal(lat, lng) {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;

  let modal = document.getElementById('confirm-pin-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirm-pin-modal';
    mapDiv.appendChild(modal);
  }

  modal.style.cssText = 'position:absolute; bottom:16px; left:50%; transform:translateX(-50%); width:90%; max-width:320px; z-index:2000; background:var(--surface-card-elevated); backdrop-filter:blur(20px); border:0.5px solid var(--surface-border); border-radius:18px; padding:14px; text-align:center; color:var(--label-primary); font-family:-apple-system, sans-serif;';

  modal.innerHTML = `
    <div style="font-size:0.85rem; font-weight:700; color:var(--apple-gold); margin-bottom:4px;">Recalculate New Destination?</div>
    <div style="font-size:0.72rem; color:var(--label-secondary); margin-bottom:12px;">Coordinates: <b>${lat}, ${lng}</b></div>
    <div style="display:flex; gap:8px;">
      <button id="btn-confirm-yes" style="flex:1; background:var(--apple-green); color:#000; border:none; padding:8px; border-radius:9999px; font-size:0.75rem; font-weight:700; cursor:pointer;">Update</button>
      <button id="btn-confirm-no" style="flex:1; background:var(--surface-input); color:var(--label-primary); border:none; padding:8px; border-radius:9999px; font-size:0.75rem; font-weight:600; cursor:pointer;">Cancel</button>
    </div>
  `;

  document.getElementById('btn-confirm-yes').onclick = e => { e.stopPropagation(); confirmDestinationChange(); };
  document.getElementById('btn-confirm-no').onclick = e => { e.stopPropagation(); closeConfirmModal(); };
}

function closeConfirmModal() {
  const modal = document.getElementById('confirm-pin-modal');
  if (modal) modal.remove();
  pendingLat = null;
  pendingLng = null;
}

// Fixed 2nd Destination Confirmation & Telemetry Recalculation
async function confirmDestinationChange() {
  if (pendingLat !== null && pendingLng !== null) {
    const targetLat = parseFloat(pendingLat);
    const targetLng = parseFloat(pendingLng);
    activePinnedLat = targetLat;
    activePinnedLng = targetLng;

    closeConfirmModal();
    closeWindyOverlay();

    if (map) routeLayers.forEach(l => map.removeLayer(l));
    routeLayers = [];

    await fetchLocationDataAndRoutes(targetLat, targetLng);
  } else {
    closeConfirmModal();
  }
}

async function fetchRouteData(query, customDisplayName = null) {
  try {
    let destLat, destLng, destName;
    const latLngMatch = query.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);

    if (latLngMatch) {
      destLat = parseFloat(latLngMatch[1]);
      destLng = parseFloat(latLngMatch[3]);
      destName = customDisplayName || `Coords (${destLat}, ${destLng})`;
    } else {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&addressdetails=1&limit=1`);
      if (!geoRes.ok) throw new Error("Geo service failed");
      const geoData = await geoRes.json();
      if (!geoData || geoData.length === 0) {
        alert("Location not found.");
        return;
      }
      destLat = parseFloat(geoData[0].lat);
      destLng = parseFloat(geoData[0].lon);
      destName = customDisplayName || geoData[0].display_name;
    }

    activePinnedLat = destLat;
    activePinnedLng = destLng;
    currentDestName = destName;
    await fetchLocationDataAndRoutes(destLat, destLng, destName);
  } catch (err) {
    console.error(err);
  }
}

async function fetchLocationDataAndRoutes(lat, lng, displayName = null) {
  const infoBox = document.getElementById('route-info');
  if (infoBox) {
    infoBox.innerHTML = `
      <div class="card-placeholder">
        <span class="pulse-icon">⏳</span>
        <p>Connecting telemetry &amp; live routes...</p>
      </div>
    `;
  }

  if (telemetryMarker && map) map.removeLayer(telemetryMarker);
  if (map) {
    telemetryMarker = L.marker([lat, lng]).addTo(map).bindPopup(`<b>Destination</b><br>${lat}, ${lng}`).openPopup();
  }

  try {
    const [geoRes, weatherRes, aqiRes, quakeRes, driveRes, walkRes] = await Promise.all([
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm2_5,us_aqi`),
      fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson').catch(() => null),
      fetch(`https://router.project-osrm.org/route/v1/driving/${stallLng},${stallLat};${lng},${lat}?overview=full&geometries=geojson&alternatives=true`),
      fetch(`https://router.project-osrm.org/route/v1/foot/${stallLng},${stallLat};${lng},${lat}?overview=full&geometries=geojson`)
    ]);

    const geoData = geoRes.ok ? await geoRes.json() : null;
    const weatherData = weatherRes.ok ? await weatherRes.json() : null;
    const aqiData = aqiRes.ok ? await aqiRes.json() : null;
    const quakeData = quakeRes && quakeRes.ok ? await quakeRes.json() : null;
    const driveData = await driveRes.json();
    const walkData = await walkRes.json();

    const addr = geoData?.address || {};
    const villageTown = addr.village || addr.town || addr.city_district || addr.city || addr.suburb || 'Local Sector';
    const district = addr.state_district || addr.district || 'District';
    const state = addr.state || 'State';
    const landmark = addr.road || addr.neighbourhood || 'Landmark Area';
    const county = addr.county || addr.subdistrict || 'Mandal/Taluka';
    let pincode = addr.postcode || addr.pincode || "Verified Zone";

    const currW = weatherData?.current || {};
    const currAQI = aqiData?.current || {};
    const aqiBadge = getAQIShortBadge(currAQI.us_aqi);

    let nearestQuakeText = "No active seismic events recorded nearby";
    const quakes = quakeData?.features || [];
    if (quakes.length > 0) {
      let closest = quakes[0];
      let minDist = Infinity;
      quakes.forEach(q => {
        const dist = Math.hypot(q.geometry.coordinates[1] - lat, q.geometry.coordinates[0] - lng);
        if (dist < minDist) { minDist = dist; closest = q; }
      });
      nearestQuakeText = `Mag ${closest.properties.mag} near ${closest.properties.place} (~${Math.round(minDist * 111)} km)`;
    }

    if (driveData.code === "Ok" && walkData.code === "Ok") {
      allModesData.driving = driveData.routes;
      walkData.routes.forEach(r => {
        if (r.duration <= driveData.routes[0].duration) r.duration = (r.distance / 1.25);
      });
      allModesData.walking = walkData.routes;
    }

    masterTelemetryData = {
      villageTown, district, state, landmark, county, pincode, currW, currAQI, aqiBadge, nearestQuakeText
    };

    currentMode = 'driving';
    renderMasterCard();
    drawRouteOnMap('driving', 0);
    setTimeout(() => { if (map) map.invalidateSize(); }, 50);

  } catch (err) {
    if (infoBox) infoBox.innerHTML = `<div><p>Unable to calculate route data.</p></div>`;
  }
}

// Model A Semantic Dynamic Tokens Master Card (Driving, Walking, Locality, Radar)
function renderMasterCard() {
  const infoBox = document.getElementById('route-info');
  if (!infoBox || !masterTelemetryData) return;

  const t = masterTelemetryData;
  let tabSpecificHtml = '';

  if (currentMode === 'driving' || currentMode === 'walking') {
    const routes = allModesData[currentMode] || [];
    let optionsHtml = '';
    routes.forEach((route, index) => {
      const dist = (route.distance / 1000).toFixed(1);
      const timeFormatted = formatDuration(route.duration);
      const label = index === 0 ? "Fastest Route" : `Alternative ${index + 1}`;
      
      optionsHtml += `
        <div class="route-option-card ${index === 0 ? 'active-route' : ''}" onclick="switchRouteIndex(${index}, this)">
          <div class="r-title">${label}</div>
          <div class="r-stats">${dist} km &bull; ~${timeFormatted}</div>
        </div>
      `;
    });

    tabSpecificHtml = `<div class="route-options-flex">${optionsHtml}</div>`;
  } else if (currentMode === 'locality') {
    tabSpecificHtml = `
      <div style="background:var(--surface-input); border:0.5px solid var(--surface-border); padding:12px; border-radius:12px; font-size:0.75rem; margin-top:8px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="font-weight:bold; color:var(--apple-gold);">Sector Intelligence</span>
          <span style="color:${t.aqiBadge.color}; font-weight:bold;">${t.aqiBadge.text}</span>
        </div>
        <p style="margin:0 0 6px 0; color:var(--label-primary); line-height:1.4;">
          Mandal: <b>${t.county}</b> &bull; Local Temp: <b>${t.currW.temperature_2m || '--'}°C</b> (${t.currW.relative_humidity_2m || '--'}% Humidity)
        </p>
        <p style="margin:0; color:var(--apple-red); font-size:0.72rem;">🌋 ${t.nearestQuakeText}</p>
      </div>
    `;
  }

  infoBox.innerHTML = `
    <div>
      <div style="background:var(--surface-input); border-left:3px solid var(--apple-gold); border-radius:10px; padding:10px 14px; margin-bottom:10px;">
        <div style="font-size:0.92rem; font-weight:800; color:var(--label-primary);">📍 ${t.villageTown}, ${t.district}</div>
        <div style="font-size:0.75rem; color:var(--label-secondary); margin-top:2px;">${t.landmark} &bull; ${t.state} (${t.pincode})</div>
      </div>

      <!-- High-Contrast Apple Segmented Control for Driving / Walking / Locality / Radar -->
      <div class="map-mode-nav-bar">
        <button class="map-mode-btn ${currentMode === 'driving' ? 'active-mode' : ''}" onclick="switchMode('driving')">🚗 Driving</button>
        <button class="map-mode-btn ${currentMode === 'walking' ? 'active-mode' : ''}" onclick="switchMode('walking')">🚶 Walking</button>
        <button class="map-mode-btn ${currentMode === 'locality' ? 'active-mode' : ''}" onclick="switchMode('locality')">📍 Locality</button>
        <button class="map-mode-btn ${currentMode === 'radar' ? 'active-mode' : ''}" onclick="switchMode('radar')">🌪️ Radar</button>
      </div>

      ${tabSpecificHtml}

      ${activePinnedLat ? `
        <button onclick="removePinnedLocation()" style="width:100%; margin-top:12px; background:rgba(255,59,48,0.15); color:var(--apple-red); border:0.5px solid var(--apple-red); padding:8px; border-radius:9999px; font-size:0.75rem; font-weight:700; cursor:pointer;">
          Clear Pin &amp; Reset Map
        </button>
      ` : ''}
    </div>
  `;
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
}

function switchRouteIndex(index, btnElement) {
  document.querySelectorAll('.route-option-card').forEach(b => b.classList.remove('active-route'));
  btnElement.classList.add('active-route');
  drawRouteOnMap(currentMode, index);
}

function drawRouteOnMap(mode, index) {
  if (!map) return;
  routeLayers.forEach(l => map.removeLayer(l));
  routeLayers = [];

  const routes = allModesData[mode];
  if (!routes || routes.length === 0) return;
  
  routes.forEach((r, i) => {
    const color = i === index ? (mode === 'driving' ? '#ffd700' : '#34c759') : '#888';
    const layer = L.geoJSON(r.geometry, { style: { color, weight: i === index ? 5 : 3, opacity: 0.85 } }).addTo(map);
    routeLayers.push(layer);
  });

  if (routeLayers[index]) map.fitBounds(routeLayers[index].getBounds(), { padding: [40, 40] });
}

async function searchDestination() {
  const inputEl = document.getElementById('destination-input');
  if (!inputEl) return;
  const q = inputEl.value.trim();
  if (!q) { alert("Please enter a destination!"); return; }
  await fetchRouteData(q);
}

async function searchAmenity(amenityKey) {
  const facility = customAmenities[amenityKey];
  if (!facility) return;

  const inputEl = document.getElementById('destination-input');
  if (inputEl) inputEl.value = facility.name;

  if (activePinnedLat !== null && activePinnedLng !== null) {
    const coords = facility.query.split(',').map(s => parseFloat(s.trim()));
    pendingLat = coords[0].toFixed(4);
    pendingLng = coords[1].toFixed(4);
    showConfirmModal(pendingLat, pendingLng);
    return;
  }
  await fetchRouteData(facility.query, facility.name);
}

async function loadLiveUSGSEarthquakes() {
  if (!map || !seismicLayerGroup) return;
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson');
    if (!res.ok) return;
    const data = await res.json();
    seismicLayerGroup.clearLayers();

    (data.features || []).forEach(q => {
      const coords = q.geometry.coordinates;
      const mag = q.properties.mag;
      L.circleMarker([coords[1], coords[0]], {
        radius: Math.max(4, mag * 2),
        color: mag > 6 ? '#ff453a' : '#ffd60a',
        fillColor: mag > 6 ? '#ff453a' : '#ffd60a',
        fillOpacity: 0.75
      }).bindPopup(`<b>🌋 Mag ${mag} Earthquake</b><br>${q.properties.place}`).addTo(seismicLayerGroup);
    });
  } catch (err) {}
}

// ===================================================
// 8. ROUTING, FULLSCREEN CHAT & UTILITIES
// ===================================================
function switchView(viewId, element) {
  document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active-view'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active-view');

  document.querySelectorAll('.side-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (element) element.classList.add('active');

  if (viewId === 'map-view' && map) setTimeout(() => map.invalidateSize(), 150);
}

function showService(title, description) {
  const p = document.getElementById('monitor-placeholder');
  const d = document.getElementById('monitor-data');
  const t = document.getElementById('monitor-title');
  const desc = document.getElementById('monitor-desc');

  if (p) p.classList.add('hidden');
  if (d) d.classList.remove('hidden');
  if (t) t.innerText = title;
  if (desc) desc.innerText = description;
}

function toggleUpi() {
  const u = document.getElementById('upi-display');
  if (u) u.classList.toggle('hidden');
}

// Model A Semantic Menu Item Popup (Zero Hardcoded White)
function openMenuModal(imgSrc, title, price, type) {
  const modal = document.getElementById('menuModal');
  if (!modal) return;
  
  modal.querySelector('img').src = imgSrc;
  modal.querySelector('h3').innerText = title;
  
  const priceTile = modal.querySelector('.price-tile');
  const typeTile = modal.querySelector('.type-tile');

  if (priceTile) {
    priceTile.innerHTML = `<span>Price: <b>${price}</b></span>`;
  }
  if (typeTile) {
    const isVeg = type.toLowerCase().includes('veg') && !type.toLowerCase().includes('non');
    typeTile.innerHTML = `<span>Type: <b>${type}</b> <span style="color:${isVeg ? 'var(--apple-green)' : 'var(--apple-red)'}; font-size:1.1rem;">●</span></span>`;
  }
  modal.showModal();
}

function toggleChatFullScreen() {
  const box = document.querySelector('.ai-terminal-box');
  const icon = document.getElementById('ai-expand-icon');
  if (!box) return;

  box.classList.toggle('ai-fullscreen-active');
  const isFull = box.classList.contains('ai-fullscreen-active');
  if (icon) icon.className = isFull ? "fa-solid fa-compress" : "fa-solid fa-expand";
}

// AI Chat Engine
function handleChatKey(e) { if (e.key === 'Enter') submitUserMessage(); }
function sendChipPrompt(t) {
  const i = document.getElementById('user-chat-input');
  if (i) i.value = t;
  submitUserMessage();
}

async function submitUserMessage() {
  const box = document.getElementById('user-chat-input');
  if (!box) return;
  const msg = box.value.trim();
  if (!msg) return;

  const log = document.getElementById('chat-log-box');
  log.innerHTML += `<div class="msg-bubble user-msg">${msg}</div>`;
  box.value = "";
  log.scrollTop = log.scrollHeight;

  const tId = "ai-" + Date.now();
  log.innerHTML += `<div class="msg-bubble bot-msg" id="${tId}"><i>Thinking...</i></div>`;
  log.scrollTop = log.scrollHeight;
  const bubble = document.getElementById(tId);

  try {
    const API_KEY = "AQ.Ab8RN6JbLJ8a8xNiL1Vq_msT-p8pg-nJHR6KpgfyU5vYol4Ihw"; 
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `You are the T&C Assistant. Store hours: 8AM-10PM daily. Founder: Murali Manohar Nidadavolu. Menu: Tea (₹10), Fries (₹50-70), Samosas (₹15/25), Rolls, Puffs. Short and helpful reply.\nUser: ${msg}` }] }] })
    });
    const d = await res.json();
    bubble.innerText = d.candidates[0].content.parts[0].text;
  } catch (e) {
    let fallback = "Welcome to Tasty & Comfort! We're open 8:00 AM to 10:00 PM daily. Explore our Menu & Map sections!";
    const low = msg.toLowerCase();
    if (low.includes('hour') || low.includes('time')) fallback = "We are open 8:00 AM to 10:00 PM every day!";
    else if (low.includes('owner') || low.includes('founder')) fallback = "The founder and owner of Tasty & Comfort is Murali Manohar Nidadavolu.";
    bubble.innerText = fallback;
  }
  log.scrollTop = log.scrollHeight;
}

// Announcements
function checkAnnouncement() {
  fetch('announcement.json?t=' + Date.now())
    .then(r => r.json())
    .then(data => {
      const modal = document.getElementById('announcement-modal');
      const sound = document.getElementById('announcement-sound');
      if (data.status === 'active') {
        const textEl = document.getElementById('announcement-text');
        if (textEl) textEl.innerText = data.message;
        if (modal) modal.classList.remove('hidden');
        if (sound) sound.play().catch(() => {});
      } else if (modal) {
        modal.classList.add('hidden');
      }
    }).catch(() => {});
}

function closeAnnouncement() {
  const modal = document.getElementById('announcement-modal');
  if (modal) modal.classList.add('hidden');
}

async function fetchWeather() {
  const apiKey = '238416beb1e4e9ee3e1c4c8f16fc2a2c';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=Hyderabad&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const temp = `${Math.round(data.main.temp)}°C`;
    const cond = data.weather[0].description;
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    ['desktop-temp', 'mobile-temp'].forEach(id => { const el = document.getElementById(id); if (el) el.innerText = temp; });
    const cEl = document.getElementById('desktop-condition'); if (cEl) cEl.innerText = cond;
    ['desktop-icon', 'mobile-icon'].forEach(id => { const el = document.getElementById(id); if (el) { el.src = iconUrl; el.style.display = 'block'; } });
  } catch (err) {}
}

// Master Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderAppleVideoShelf();
  initPiPInteractivity();

  const dateInput = document.getElementById('news-date-input');
  if (dateInput) {
    dateInput.value = selectedNewsDate;
    dateInput.max = selectedNewsDate;
  }

  const mapDiv = document.getElementById('map');
  if (mapDiv && typeof L !== 'undefined') {
    map = L.map('map').setView([stallLat, stallLng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: 'Tasty & Comfort' }).addTo(map);
    L.marker([stallLat, stallLng]).addTo(map).bindPopup('<b>Tasty &amp; Comfort Stall</b><br>New Modern Mission').openPopup();

    seismicLayerGroup = L.layerGroup().addTo(map);
    loadLiveUSGSEarthquakes();

    map.on('click', e => {
      const lat = e.latlng.lat.toFixed(4);
      const lng = e.latlng.lng.toFixed(4);
      if (activePinnedLat !== null && activePinnedLng !== null) {
        pendingLat = lat; pendingLng = lng; showConfirmModal(lat, lng); return;
      }
      activePinnedLat = lat; activePinnedLng = lng;
      fetchLocationDataAndRoutes(lat, lng);
    });
  }

  const alertClose = document.getElementById('apple-alert-close-btn');
  const alertOverlay = document.getElementById('apple-alert-overlay');
  if (!sessionStorage.getItem('menuPopupShown') && alertOverlay) {
    alertOverlay.classList.remove('hidden');
    sessionStorage.setItem('menuPopupShown', 'true');
  }
  if (alertClose && alertOverlay) {
    alertClose.addEventListener('click', () => alertOverlay.classList.add('hidden'));
  }

  const ticker = document.getElementById('headphones-ticker');
  if (ticker) ticker.addEventListener('click', () => ticker.style.display = 'none');

  fetchWeather();
  setInterval(fetchWeather, 600000);
  fetchNews();
  checkAnnouncement();
  setInterval(checkAnnouncement, 60000);
});
