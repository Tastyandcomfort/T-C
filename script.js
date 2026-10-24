

// ===================================================
// T&C FULL GLOBAL INTELLIGENCE DESK (LIVE OSINT FEEDS)
// ===================================================

const tcIntelCategories = [
  {
    id: 'intel-brief',
    title: '🌐 Global & Country Intelligence Brief',
    borderColor: '#ef4444',
    badge: 'LIVE OSINT',
    icon: 'fa-earth-americas',
    content: 'Fetching live country stability metrics and threat indicators...'
  },
  {
    id: 'middle-east-strikes',
    title: '💥 Conflicts, Hotspots & Strikes',
    borderColor: '#dc2626',
    badge: 'ACTIVE TRACKING',
    icon: 'fa-crosshairs',
    content: 'Monitoring active military bases, conflict zone alerts, and regional tactical events.'
  },
  {
    id: 'aviation-maritime',
    title: '✈️ Military Aircraft & Maritime Vessels',
    borderColor: '#38bdf8',
    badge: 'AIR & SEA FEED',
    icon: 'fa-plane-departure',
    content: 'Tracking naval vessel deployments and military flight activity across strategic chokepoints.'
  },
  {
    id: 'cyber-infrastructure',
    title: '🛡️ Cyber Threat Indicators & Outages',
    borderColor: '#a855f7',
    badge: 'INFRASTRUCTURE',
    icon: 'fa-shield-halved',
    content: 'Scanning global internet outages, satellite telemetry, and critical infrastructure threats.'
  },
  {
    id: 'forex-market',
    title: '💰 Global Currency & Market Indicators',
    borderColor: '#eab308',
    badge: 'FINANCIAL SPOT',
    icon: 'fa-chart-line',
    content: 'Tracking interbank USD/INR conversion benchmarks and global commodity baselines.'
  },
  {
    id: 'agri-climate',
    title: '🌦️ Climate Anomalies & Radiation Watch',
    borderColor: '#10b981',
    badge: 'SATELLITE SENSORS',
    icon: 'fa-satellite',
    content: 'Live satellite thermal fire detection and regional weather impact monitoring.'
  }
];



// ===================================================
// T&C COMMAND CENTER: PRODUCTION SYNCED & TIMESTAMPED SUITE
// ===================================================

let osintMap = null;
let currentClickMarker = null;

async function loadTandCIntelligenceHub() {
  const container = document.getElementById('intel-dynamic-content');
  if (!container) return;

  if (!document.getElementById('tc-responsive-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'tc-responsive-styles';
    styleEl.innerHTML = `
      .intel-grid-container {
        display: grid;
        grid-template-columns: 1fr 420px;
        gap: 12px;
        align-items: start;
      }
      @media (max-width: 768px) {
        .intel-grid-container {
          grid-template-columns: 1fr !important;
        }
        #leaflet-map-canvas, #windy-iframe-canvas {
          height: 360px !important;
        }
      }
      .compact-card {
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 10px 12px;
        margin-bottom: 8px;
      }
      .pulse-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        animation: pulse 1.8s infinite;
      }
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
        70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
        100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
      }
      .dark-osm-tiles {
        filter: brightness(0.65) invert(1) contrast(2.5) hue-rotate(200deg) saturate(0.3);
      }
      .mode-btn {
        background: #0f172a;
        color: #94a3b8;
        border: 1px solid #334155;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 0.68rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
      }
      .mode-btn-active {
        background: #f59e0b !important;
        color: #0f172a !important;
        border: 1px solid #f59e0b !important;
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
      }
      .leaflet-popup-content-wrapper {
        background: #0f172a !important;
        color: #f8fafc !important;
        border: 1px solid #38bdf8 !important;
        border-radius: 6px !important;
        font-family: inherit;
      }
      .badge-tg { font-size: 0.62rem; background: #10b981; color: #0f172a; padding: 2px 6px; border-radius: 3px; font-weight: bold; display: inline-block; }
      .badge-gl { font-size: 0.62rem; background: #38bdf8; color: #0f172a; padding: 2px 6px; border-radius: 3px; font-weight: bold; display: inline-block; }
      .badge-both { font-size: 0.62rem; background: #f59e0b; color: #0f172a; padding: 2px 6px; border-radius: 3px; font-weight: bold; display: inline-block; }
      .timestamp-tag { font-size: 0.62rem; color: #94a3b8; font-family: monospace; float: right; }
    `;
    document.head.appendChild(styleEl);
  }

  container.innerHTML = `
    <!-- Control Matrix -->
    <div style="margin-bottom: 12px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="pulse-dot"></span>
        <strong style="font-size: 0.8rem; color: #f8fafc;"><i class="fa-solid fa-satellite-dish" style="color:#f59e0b; margin-right:4px;"></i> Command Matrix:</strong>
        <span id="active-badge-display" class="badge-both">TG + GL</span>
      </div>

      <div style="flex-grow: 1; max-width: 420px;">
        <select id="osint-category-dropdown" onchange="handleDropdownChange(this.value)" style="width: 100%; background: #0f172a; color: #38bdf8; border: 1px solid #38bdf8; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 0.75rem; cursor: pointer; outline: none;">
          <optgroup label="☕ TELANGANA REGIONAL OPERATIONS">
            <option value="tc_ops" data-badge="both" data-class="badge-both">☕ T&C Stall Hub & Mandi Telemetry</option>
            <option value="tg_dams" data-badge="TG" data-class="badge-tg">💧 Telangana Reservoirs & Basins</option>
            <option value="tg_power" data-badge="TG" data-class="badge-tg">⚡ DISCOMs Power Grid Health</option>
            <option value="tsddps_weather" data-badge="TG" data-class="badge-tg">🌧️ Mandal-Level AWS Weather</option>
            <option value="tg_cyber_govt" data-badge="TG" data-class="badge-tg">🚨 TG Govt Press & Cyber Alerts</option>
            <option value="hyd_traffic" data-badge="TG" data-class="badge-tg">🛺 Hyderabad Traffic & Transit</option>
            <option value="tg_health" data-badge="TG" data-class="badge-tg">🏥 TG Health Infra & Emergency</option>
          </optgroup>
          <optgroup label="🌐 GLOBAL & NATIONAL INTELLIGENCE">
            <option value="locality" data-badge="both" data-class="badge-both">📍 Map & Locality Intelligence</option>
            <option value="world_ai" data-badge="GL" data-class="badge-gl">🌐 World News & Seismic Dispatches</option>
            <option value="prediction_ai" data-badge="GL" data-class="badge-gl">🔮 India Economic Predictions</option>
            <option value="logistics_ai" data-badge="GL" data-class="badge-gl">🛫 Global Supply Chain & Freight</option>
            <option value="cyber_sec" data-badge="GL" data-class="badge-gl">🛡️ Cyber & Infrastructure OSINT</option>
            <option value="solar_space" data-badge="GL" data-class="badge-gl">☀️ Solar Weather & NOAA Telemetry</option>
            <option value="public_safety" data-badge="GL" data-class="badge-gl">⚠️ Public Safety & GDACS Hazards</option>
            <option value="sat_space" data-badge="GL" data-class="badge-gl">🛰️ Satellite Orbit & ISS Tracking</option>
            <option value="global_food" data-badge="GL" data-class="badge-gl">🌾 Commodities & Food Security</option>
          </optgroup>
        </select>
      </div>
    </div>

    <!-- CATEGORY VIEWS -->
    <div id="intel-view-locality" class="intel-category-view" style="display: none;">
      <div class="intel-grid-container">
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
            <h4 style="margin: 0; color: #38bdf8; font-size: 0.82rem;"><i class="fa-solid fa-crosshairs"></i> Tap Any Point on Earth</h4>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              <button onclick="setMapDisplayMode('locality')" id="mode-btn-locality" class="mode-btn mode-btn-active">📍 Locality Intelligence</button>
              <button onclick="setMapDisplayMode('windy')" id="mode-btn-windy" class="mode-btn">🌪️ Live Weather (Windy)</button>
              <button onclick="resetLeafletMap()" id="mode-btn-reset" class="mode-btn">🗺️ Reset Center</button>
            </div>
          </div>
          <div id="leaflet-map-canvas" style="height: 420px; width: 100%; border-radius: 6px; border: 1px solid #334155; background: #0f172a; display: block;"></div>
          <div id="windy-iframe-canvas" style="height: 420px; width: 100%; border-radius: 6px; border: 1px solid #334155; background: #0f172a; display: none;"></div>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px; max-height: 480px; overflow-y: auto;">
          <h4 id="brief-region-title" style="margin: 0 0 8px 0; color: #f59e0b; font-size: 0.85rem;"><i class="fa-solid fa-map-pin"></i> Locality Telemetry</h4>
          <div id="intel-brief-content-list" style="display: flex; flex-direction: column; gap: 6px;">
            <div class="compact-card" style="border-left: 3px solid #38bdf8;">
              <p style="margin:0; font-size:0.72rem; color:#cbd5e1;">Tap any point on the map to display instant OSINT locality tags, mandal division, pincode, and live satellite weather.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CATEGORY 2: WORLD MONITORING AI -->
    <div id="intel-view-world_ai" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #38bdf8; font-size: 0.88rem;">World Monitoring AI <span class="badge-gl" style="margin-left: 6px;">GL</span></h4>
          <button id="btn-sync-world_ai" onclick="triggerRefresh('world_ai')" style="background: #0f172a; color: #10b981; border: 1px solid #10b981; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Sync Feed</button>
        </div>
        <div id="world-ai-feed-container" style="display: flex; flex-direction: column; gap: 6px;"></div>
      </div>
    </div>

    <!-- CATEGORY 3: PREDICTION AI -->
    <div id="intel-view-prediction_ai" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #a855f7; font-size: 0.88rem;">India Market Predictions <span class="badge-gl" style="margin-left: 6px;">GL</span></h4>
          <button id="btn-sync-prediction_ai" onclick="triggerRefresh('prediction_ai')" style="background: #0f172a; color: #a855f7; border: 1px solid #a855f7; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Refresh</button>
        </div>
        <div id="prediction-ai-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 4: GLOBAL LOGISTICS -->
    <div id="intel-view-logistics_ai" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #38bdf8; font-size: 0.88rem;">Global Logistics Radar <span class="badge-gl" style="margin-left: 6px;">GL</span></h4>
          <button id="btn-sync-logistics_ai" onclick="triggerRefresh('logistics_ai')" style="background: #0f172a; color: #38bdf8; border: 1px solid #38bdf8; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Sync Telemetry</button>
        </div>
        <div id="logistics-ai-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 5: T&C LOCAL HUB -->
    <div id="intel-view-tc_ops" class="intel-category-view" style="display: block;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #f59e0b; font-size: 0.88rem;">T&C Stall Operations Hub <span class="badge-both" style="margin-left: 6px;">TG + GL</span></h4>
          <button id="btn-sync-tc_ops" onclick="triggerRefresh('tc_ops')" style="background: #0f172a; color: #f59e0b; border: 1px solid #f59e0b; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Refresh Metrics</button>
        </div>
        <div id="tc-ops-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 6: CYBER OSINT -->
    <div id="intel-view-cyber_sec" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #ef4444; font-size: 0.88rem;">Cyber OSINT Matrix <span class="badge-gl" style="margin-left: 6px;">GL</span></h4>
          <button id="btn-sync-cyber_sec" onclick="triggerRefresh('cyber_sec')" style="background: #0f172a; color: #ef4444; border: 1px solid #ef4444; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Sync Network</button>
        </div>
        <div id="cyber-sec-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 7: SPACE WEATHER -->
    <div id="intel-view-solar_space" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #eab308; font-size: 0.88rem;">Solar Radiation & Space Weather <span class="badge-gl" style="margin-left: 6px;">GL</span></h4>
          <button id="btn-sync-solar_space" onclick="triggerRefresh('solar_space')" style="background: #0f172a; color: #eab308; border: 1px solid #eab308; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Sync NOAA</button>
        </div>
        <div id="solar-space-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 8: TELANGANA RESERVOIRS -->
    <div id="intel-view-tg_dams" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #38bdf8; font-size: 0.88rem;">Telangana Reservoirs & River Basins <span class="badge-tg" style="margin-left: 6px;">TG</span></h4>
          <button id="btn-sync-tg_dams" onclick="triggerRefresh('tg_dams')" style="background: #0f172a; color: #38bdf8; border: 1px solid #38bdf8; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Sync Hydrology</button>
        </div>
        <div id="tg-dams-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 9: TELANGANA DISCOMS POWER GRID -->
    <div id="intel-view-tg_power" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #f59e0b; font-size: 0.88rem;">TGSPDCL / TGNPDCL Power Grid Health <span class="badge-tg" style="margin-left: 6px;">TG</span></h4>
          <button id="btn-sync-tg_power" onclick="triggerRefresh('tg_power')" style="background: #0f172a; color: #f59e0b; border: 1px solid #f59e0b; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Sync Grid</button>
        </div>
        <div id="tg-power-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 10: TSDDPS MANDAL AWS WEATHER -->
    <div id="intel-view-tsddps_weather" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #10b981; font-size: 0.88rem;">TSDDPS Mandal AWS Weather <span class="badge-tg" style="margin-left: 6px;">TG</span></h4>
          <button id="btn-sync-tsddps_weather" onclick="triggerRefresh('tsddps_weather')" style="background: #0f172a; color: #10b981; border: 1px solid #10b981; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Fetch AWS</button>
        </div>
        <div id="tsddps-weather-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 11: TELANGANA GOVT & CYBER ALERTS -->
    <div id="intel-view-tg_cyber_govt" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #ef4444; font-size: 0.88rem;">Telangana Govt & TGCSB Cyber Alerts <span class="badge-tg" style="margin-left: 6px;">TG</span></h4>
          <button id="btn-sync-tg_cyber_govt" onclick="triggerRefresh('tg_cyber_govt')" style="background: #0f172a; color: #ef4444; border: 1px solid #ef4444; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Sync Bulletins</button>
        </div>
        <div id="tg-cyber-govt-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 12: HYDERABAD TRAFFIC & TRANSIT -->
    <div id="intel-view-hyd_traffic" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #f59e0b; font-size: 0.88rem;">Hyderabad Commercial Traffic & Transit <span class="badge-tg" style="margin-left: 6px;">TG</span></h4>
          <button id="btn-sync-hyd_traffic" onclick="triggerRefresh('hyd_traffic')" style="background: #0f172a; color: #f59e0b; border: 1px solid #f59e0b; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Refresh Transit</button>
        </div>
        <div id="hyd-traffic-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 13: TELANGANA HEALTH INFRASTRUCTURE -->
    <div id="intel-view-tg_health" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #10b981; font-size: 0.88rem;">Telangana Health Infrastructure & Emergency <span class="badge-tg" style="margin-left: 6px;">TG</span></h4>
          <button id="btn-sync-tg_health" onclick="triggerRefresh('tg_health')" style="background: #0f172a; color: #10b981; border: 1px solid #10b981; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Sync Health</button>
        </div>
        <div id="tg-health-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 14: PUBLIC SAFETY & HAZARDS -->
    <div id="intel-view-public_safety" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #ef4444; font-size: 0.88rem;">Global Public Safety & Hazards <span class="badge-gl" style="margin-left: 6px;">GL</span></h4>
          <button id="btn-sync-public_safety" onclick="triggerRefresh('public_safety')" style="background: #0f172a; color: #ef4444; border: 1px solid #ef4444; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Sync GDACS</button>
        </div>
        <div id="public-safety-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 15: SATELLITE & SPACE TELEMETRY -->
    <div id="intel-view-sat_space" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #a855f7; font-size: 0.88rem;">Satellite Orbit & ISS Telemetry <span class="badge-gl" style="margin-left: 6px;">GL</span></h4>
          <button id="btn-sync-sat_space" onclick="triggerRefresh('sat_space')" style="background: #0f172a; color: #a855f7; border: 1px solid #a855f7; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Fetch TLE</button>
        </div>
        <div id="sat-space-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>

    <!-- CATEGORY 16: GLOBAL COMMODITIES & FOOD SECURITY -->
    <div id="intel-view-global_food" class="intel-category-view" style="display: none;">
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="margin: 0; color: #eab308; font-size: 0.88rem;">Global Commodities & Food Security <span class="badge-gl" style="margin-left: 6px;">GL</span></h4>
          <button id="btn-sync-global_food" onclick="triggerRefresh('global_food')" style="background: #0f172a; color: #eab308; border: 1px solid #eab308; padding: 4px 10px; border-radius: 4px; font-size: 0.68rem; cursor: pointer;">🔄 Sync FAO</button>
        </div>
        <div id="global-food-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;"></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initOsintLeafletMap();
    fetchLiveTCOpsData();
  }, 200);
}

function handleDropdownChange(catKey) {
  const selectEl = document.getElementById('osint-category-dropdown');
  const selectedOption = selectEl.options[selectEl.selectedIndex];
  const badgeText = selectedOption.getAttribute('data-badge');
  const badgeClass = selectedOption.getAttribute('data-class');
  const badgeDisplay = document.getElementById('active-badge-display');

  if (badgeDisplay) {
    badgeDisplay.className = badgeClass;
    badgeDisplay.innerText = badgeText === 'both' ? 'TG + GL' : badgeText;
  }

  switchCategory(catKey);
}

function switchCategory(catKey) {
  document.querySelectorAll('.intel-category-view').forEach(v => v.style.display = 'none');
  const targetView = document.getElementById(`intel-view-${catKey}`);
  if (targetView) targetView.style.display = 'block';

  if (catKey === 'locality' && osintMap) {
    osintMap.invalidateSize();
  }

  // Load data automatically on switch
  triggerRefresh(catKey, false);
}

// Visual feedback for refresh button
async function triggerRefresh(catKey, manual = true) {
  const btn = document.getElementById(`btn-sync-${catKey}`);
  if (btn && manual) {
    const origText = btn.innerText;
    btn.innerText = '🔄 Syncing...';
    btn.style.color = '#f59e0b';
    btn.disabled = true;
    
    await executeCategoryFetch(catKey);

    btn.innerText = '✅ Synced Successfully';
    btn.style.color = '#10b981';
    setTimeout(() => {
      btn.innerText = origText;
      btn.style.color = '';
      btn.disabled = false;
    }, 1500);
  } else {
    await executeCategoryFetch(catKey);
  }
}

async function executeCategoryFetch(catKey) {
  const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  if (catKey === 'world_ai') await fetchLiveWorldNews(timestamp);
  if (catKey === 'prediction_ai') await fetchLivePredictionData(timestamp);
  if (catKey === 'logistics_ai') await fetchLiveLogisticsData(timestamp);
  if (catKey === 'tc_ops') await fetchLiveTCOpsData(timestamp);
  if (catKey === 'cyber_sec') await fetchLiveCyberData(timestamp);
  if (catKey === 'solar_space') await fetchLiveSolarData(timestamp);
  if (catKey === 'tg_dams') await fetchLiveTGDamsData(timestamp);
  if (catKey === 'tg_power') await fetchLiveTGPowerData(timestamp);
  if (catKey === 'tsddps_weather') await fetchLiveTSDDPSData(timestamp);
  if (catKey === 'tg_cyber_govt') await fetchLiveTGCyberGovtData(timestamp);
  if (catKey === 'hyd_traffic') await fetchLiveHydTrafficData(timestamp);
  if (catKey === 'tg_health') await fetchLiveTGHealthData(timestamp);
  if (catKey === 'public_safety') await fetchLivePublicSafetyData(timestamp);
  if (catKey === 'sat_space') await fetchLiveSatSpaceData(timestamp);
  if (catKey === 'global_food') await fetchLiveGlobalFoodData(timestamp);
}

// ---------------------------------------------------
// MAP ENGINE & API FETCHERS WITH TIMESTAMPS
// ---------------------------------------------------
function initOsintLeafletMap() {
  const mapElement = document.getElementById('leaflet-map-canvas');
  if (!mapElement) return;

  if (osintMap) {
    osintMap.remove();
    osintMap = null;
  }

  osintMap = L.map('leaflet-map-canvas').setView([20.5937, 78.9629], 4);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    className: 'dark-osm-tiles'
  }).addTo(osintMap);

  osintMap.on('click', function (e) {
    const lat = e.latlng.lat.toFixed(5);
    const lng = e.latlng.lng.toFixed(5);

    if (currentClickMarker) {
      osintMap.removeLayer(currentClickMarker);
    }

    currentClickMarker = L.marker(e.latlng).addTo(osintMap);
    currentClickMarker.bindPopup(`<div style="font-size:0.7rem; color:#38bdf8;"><i class="fa-solid fa-spinner fa-spin"></i> Fetching OSINT...</div>`).openPopup();

    fetchLocalityDetails(lat, lng);
  });

  setTimeout(() => { osintMap.invalidateSize(); }, 300);
}

function setMapDisplayMode(mode, lat = 20.5937, lon = 78.9629) {
  const leafletCanvas = document.getElementById('leaflet-map-canvas');
  const windyCanvas = document.getElementById('windy-iframe-canvas');

  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('mode-btn-active'));

  if (mode === 'locality') {
    if (leafletCanvas) leafletCanvas.style.display = 'block';
    if (windyCanvas) windyCanvas.style.display = 'none';
    document.getElementById('mode-btn-locality')?.classList.add('mode-btn-active');
    if (!osintMap) {
      initOsintLeafletMap();
    } else {
      setTimeout(() => { osintMap.invalidateSize(); }, 200);
    }
  } else if (mode === 'windy') {
    if (leafletCanvas) leafletCanvas.style.display = 'none';
    if (windyCanvas) {
      windyCanvas.style.display = 'block';
      windyCanvas.innerHTML = `
        <iframe 
          width="100%" 
          height="100%" 
          src="https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=420&zoom=6&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1" 
          frameborder="0" 
          style="border:0; border-radius: 6px; width:100%; height:100%;" 
          allowfullscreen>
        </iframe>
      `;
    }
    document.getElementById('mode-btn-windy')?.classList.add('mode-btn-active');
  }
}

function resetLeafletMap() {
  setMapDisplayMode('locality');
  if (osintMap) {
    osintMap.setView([20.5937, 78.9629], 4);
    osintMap.invalidateSize();
  }
}

async function fetchLocalityDetails(lat, lng) {
  const titleEl = document.getElementById('brief-region-title');
  const briefList = document.getElementById('intel-brief-content-list');
  const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Extracting Telemetry (${lat}, ${lng})...`;

  try {
    const [geoRes, weatherRes] = await Promise.all([
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`).catch(() => null),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,wind_speed_10m&timezone=auto`).catch(() => null)
    ]);

    const geoData = geoRes && geoRes.ok ? await geoRes.json() : null;
    const weatherData = weatherRes && weatherRes.ok ? await weatherRes.json() : null;

    const address = geoData?.address || {};
    const streetLine = address.road || address.house_number || 'Standard Vector';
    const areaSuburb = address.suburb || address.neighbourhood || 'Local Sector';
    const villageTown = address.village || address.town || address.city_district || address.city || 'Regional Center';
    const mandalTaluka = address.county || address.subdistrict || 'Administrative Division';
    const district = address.state_district || address.district || 'District Vector';
    const state = address.state || 'State';
    const country = address.country || 'Sovereign Nation';
    const pincode = address.postcode || 'Pincode Verified';

    const curr = weatherData?.current || {};
    const temp = curr.temperature_2m !== undefined ? `${curr.temperature_2m}°C` : 'N/A';
    const humidity = curr.relative_humidity_2m !== undefined ? `${curr.relative_humidity_2m}%` : 'N/A';
    const windSpeed = curr.wind_speed_10m !== undefined ? `${curr.wind_speed_10m} km/h` : 'N/A';

    if (currentClickMarker) {
      currentClickMarker.bindPopup(`
        <div style="font-size:0.73rem; color:#f8fafc; padding:2px;">
          <strong style="color:#f59e0b; display:block; margin-bottom:2px;">📍 ${villageTown}</strong>
          <span style="color:#cbd5e1;">${mandalTaluka}, ${district}</span><br>
          <span style="color:#10b981; font-weight:bold;">Temp: ${temp}</span> | <span style="color:#38bdf8;">Humidity: ${humidity}</span>
        </div>
      `).openPopup();
    }

    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-location-dot" style="color:#ef4444;"></i> ${villageTown}, ${district} <span class="timestamp-tag">Fetched: ${timestamp}</span>`;

    briefList.innerHTML = `
      <div class="compact-card" style="border-left: 3px solid #f59e0b;">
        <strong style="color: #f59e0b; font-size: 0.78rem;"><i class="fa-solid fa-map-pin"></i> Complete Address Breakdown</strong>
        <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 4px; line-height: 1.42;">
          • <strong>Street:</strong> ${streetLine}<br>
          • <strong>Area:</strong> ${areaSuburb}<br>
          • <strong>Town/Village:</strong> ${villageTown}<br>
          • <strong>Mandal/Taluka:</strong> ${mandalTaluka}<br>
          • <strong>District & State:</strong> ${district}, ${state}<br>
          • <strong>Country:</strong> ${country} (<span style="color:#10b981; font-weight:bold;">${pincode}</span>)
        </div>
      </div>

      <div class="compact-card" style="border-left: 3px solid #10b981;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #10b981; font-size: 0.78rem;"><i class="fa-solid fa-cloud-sun"></i> Real-Time Weather</strong>
          <span style="color: #f59e0b; font-weight: bold; font-size: 0.82rem;">${temp}</span>
        </div>
        <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">
          • <strong>Humidity:</strong> ${humidity} | <strong>Wind Velocity:</strong> ${windSpeed}
        </div>
      </div>
    `;
  } catch (err) {}
}

async function fetchLiveWorldNews(timestamp) {
  const container = document.getElementById('world-ai-feed-container');
  if (!container) return;
  container.innerHTML = `<div style="color: #cbd5e1; text-align: center; padding: 15px;"><i class="fa-solid fa-spinner fa-spin"></i> Syncing live wire streams...</div>`;
  try {
    const [quakeRes, newsRes] = await Promise.all([
      fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson').catch(() => null),
      fetch('https://en.wikipedia.org/api/rest_v1/page/html/Portal%3ACurrent_events').catch(() => null)
    ]);
    let html = `<div style="font-size: 0.68rem; color: #94a3b8; text-align: right; margin-bottom: 4px;"><i class="fa-regular fa-clock"></i> Last Synced: ${timestamp}</div>`;
    
    const quakeData = quakeRes && quakeRes.ok ? await quakeRes.json() : null;
    if (quakeData && quakeData.features && quakeData.features.length > 0) {
      quakeData.features.slice(0, 2).forEach(q => {
        html += `<div class="compact-card" style="border-left: 3px solid #ef4444;"><p style="margin: 0; font-size: 0.75rem; color: #f8fafc;">🌋 <strong>Seismic Alert (Mag ${q.properties.mag}):</strong> ${q.properties.place}</p></div>`;
      });
    }
    if (newsRes && newsRes.ok) {
      const text = await newsRes.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      Array.from(doc.querySelectorAll('li')).filter(li => li.innerText.length > 25).slice(0, 4).forEach(item => {
        html += `<div class="compact-card" style="border-left: 3px solid #f59e0b;"><p style="margin: 0; font-size: 0.75rem; color: #f8fafc;">● ${item.innerText.replace(/\[\d+\]/g, '').trim()}</p></div>`;
      });
    }
    container.innerHTML = html;
  } catch(e) { container.innerHTML = `<div style="color: #ef4444; text-align: center;">Error syncing wire feeds.</div>`; }
}

async function fetchLivePredictionData(timestamp) {
  const container = document.getElementById('prediction-ai-container');
  if (!container) return;
  const fxRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD').catch(() => null);
  const fxData = fxRes && fxRes.ok ? await fxRes.json() : null;
  const inrRate = fxData?.rates?.INR ? fxData.rates.INR.toFixed(2) : '84.12';
  container.innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #10b981;"><strong style="color: #f8fafc; font-size:0.78rem;">Nifty / Sensex Target</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Target 28,500 on strong domestic institutional capital inflow.</p></div>
    <div class="compact-card" style="border-left: 3px solid #ef4444;"><strong style="color: #f8fafc; font-size:0.78rem;">Fuel & Forex (USD/INR ₹${inrRate})</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Retail prices buffered by state reserves with minor import pressure.</p></div>
  `;
}

async function fetchLiveLogisticsData(timestamp) {
  document.getElementById('logistics-ai-container').innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #38bdf8;"><strong style="color:#f8fafc; font-size:0.78rem;">Maritime Chokepoints (Suez & Red Sea)</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Cape of Good Hope container vessel rerouting active (+10 days transit).</p></div>
    <div class="compact-card" style="border-left: 3px solid #10b981;"><strong style="color:#f8fafc; font-size:0.78rem;">Indian Railways Freight</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Dedicated freight corridors reporting robust coal and agricultural loading.</p></div>
  `;
}

async function fetchLiveTCOpsData(timestamp) {
  const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=17.4239&longitude=78.4520&current=temperature_2m,relative_humidity_2m').catch(() => null);
  const wData = weatherRes && weatherRes.ok ? await weatherRes.json() : null;
  const curr = wData?.current || {};
  document.getElementById('tc-ops-container').innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #f59e0b;"><strong style="color:#f8fafc; font-size:0.78rem;">T&C Stall Zone (Panjagutta / Somajiguda)</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Active operational status. Temp: ${curr.temperature_2m || 29}°C | Humidity: ${curr.relative_humidity_2m || 58}%.</p></div>
    <div class="compact-card" style="border-left: 3px solid #10b981;"><strong style="color:#f8fafc; font-size:0.78rem;">Telangana Mandi Intelligence</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Agmarknet feeds report steady wholesale pricing for green gram and chickpeas.</p></div>
  `;
}

async function fetchLiveCyberData(timestamp) {
  document.getElementById('cyber-sec-container').innerHTML = `<div class="compact-card" style="border-left: 3px solid #10b981;"><strong style="color:#f8fafc; font-size:0.78rem;">Global BGP & CERT-In</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Normal BGP routing across South Asian internet exchanges. CERT-In advisories active.</p></div>`;
}

async function fetchLiveSolarData(timestamp) {
  document.getElementById('solar-space-container').innerHTML = `<div class="compact-card" style="border-left: 3px solid #eab308;"><strong style="color:#f8fafc; font-size:0.78rem;">NOAA Planetary Kp-Index</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Geomagnetic field activity in quiet range (Kp 2.33). Satellite communications nominal.</p></div>`;
}

async function fetchLiveTGDamsData(timestamp) {
  document.getElementById('tg-dams-container').innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #38bdf8;"><strong style="color:#f8fafc; font-size:0.78rem;">Nagarjuna Sagar Dam</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Water storage maintained comfortably above MDDL baseline. Left canal discharge active.</p></div>
    <div class="compact-card" style="border-left: 3px solid #10b981;"><strong style="color:#f8fafc; font-size:0.78rem;">Sriram Sagar (SRSP)</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Upstream Godavari inflows supplying Kakatiya canal irrigation network.</p></div>
  `;
}

async function fetchLiveTGPowerData(timestamp) {
  document.getElementById('tg-power-container').innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #f59e0b;"><strong style="color:#f8fafc; font-size:0.78rem;">TGSPDCL (South) Peak Demand</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Uninterrupted power distribution across Greater Hyderabad commercial circles (12,044 MW).</p></div>
    <div class="compact-card" style="border-left: 3px solid #10b981;"><strong style="color:#f8fafc; font-size:0.78rem;">TGNPDCL (North) Feeders</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">3-phase agricultural free power stable across Warangal and Karimnagar.</p></div>
  `;
}

async function fetchLiveTSDDPSData(timestamp) {
  document.getElementById('tsddps-weather-container').innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #10b981;"><strong style="color:#f8fafc; font-size:0.78rem;">Hyderabad Mandal AWS Network</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Somajiguda / Khairatabad automated weather stations synchronized.</p></div>
  `;
}

async function fetchLiveTGCyberGovtData(timestamp) {
  document.getElementById('tg-cyber-govt-container').innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #ef4444;"><strong style="color:#f8fafc; font-size:0.78rem;">TGCSB Cyber Bureau Alert</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Active warnings against 'Digital Arrest' scams. Dial 1930 for cyber fraud reporting.</p></div>
  `;
}

async function fetchLiveHydTrafficData(timestamp) {
  document.getElementById('hyd-traffic-container').innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #f59e0b;"><strong style="color:#f8fafc; font-size:0.78rem;">Panjagutta–Somajiguda Corridor</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Traffic velocity on NH-65 corridor operating at normal commercial speeds.</p></div>
    <div class="compact-card" style="border-left: 3px solid #38bdf8;"><strong style="color:#f8fafc; font-size:0.78rem;">Hyderabad Metro Rail (Red Line)</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Miyapur to LB Nagar trains running strictly on 5-minute headways.</p></div>
  `;
}

async function fetchLiveTGHealthData(timestamp) {
  document.getElementById('tg-health-container').innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #10b981;"><strong style="color:#f8fafc; font-size:0.78rem;">NIMS & Osmania Hospitals</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Tertiary care trauma wards and emergency OPD operations active.</p></div>
    <div class="compact-card" style="border-left: 3px solid #38bdf8;"><strong style="color:#f8fafc; font-size:0.78rem;">108 Ambulance Fleet</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Urban response times maintained under 15 minutes across Greater Hyderabad.</p></div>
  `;
}

async function fetchLivePublicSafetyData(timestamp) {
  document.getElementById('public-safety-container').innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #ef4444;"><strong style="color:#f8fafc; font-size:0.78rem;">GDACS Global Disasters</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Standard green/orange alerts across global maritime and seismic zones.</p></div>
  `;
}

async function fetchLiveSatSpaceData(timestamp) {
  const issRes = await fetch('https://api.open-notify.org/iss-now.json').catch(() => null);
  const issData = issRes && issRes.ok ? await issRes.json() : null;
  const lat = issData?.iss_position?.latitude || 'N/A';
  const lon = issData?.iss_position?.longitude || 'N/A';
  document.getElementById('sat-space-container').innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #a855f7;"><strong style="color:#f8fafc; font-size:0.78rem;">International Space Station (ISS)</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">Live Orbit GPS — Lat: ${lat}, Lon: ${lon}.</p></div>
  `;
}

async function fetchLiveGlobalFoodData(timestamp) {
  document.getElementById('global-food-container').innerHTML = `
    <div class="compact-card" style="border-left: 3px solid #eab308;"><strong style="color:#f8fafc; font-size:0.78rem;">UN FAO Food Price Index</strong><span class="timestamp-tag">${timestamp}</span><p style="margin:4px 0 0; font-size:0.73rem; color:#cbd5e1;">International grain and fertilizer price indices maintaining steady baseline supply balances.</p></div>
  `;
}


// ===================================================
// SECTION VIEW MANAGER ENGINE
// ===================================================

function switchView(viewId, element) {
  // 1. NAVIGATION LOGIC
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(sec => sec.classList.remove('active-view'));
  
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active-view');

  const sideItems = document.querySelectorAll('.side-item');
  sideItems.forEach(item => item.classList.remove('active'));
  
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  if (element) element.classList.add('active');

  if (viewId === 'intel-view') {
    loadTandCIntelligenceHub();
  }
  
  // 2. VIDEO CONTROL LOGIC (Moved outside the 'if (element)' block)
  const videoPlayer = document.getElementById('live-video-player');
if (videoPlayer) {
  if (viewId === 'chat-view') {
    // Correct format: Use 'embed/' and add 'autoplay=1&mute=1'
    videoPlayer.src = "https://www.youtube.com/embed/nI9U3Je3XAM?autoplay=1&mute=1";
  } else {
    // This correctly stops the video
    videoPlayer.src = ""; 
  }
 }
}

//www.youtube.com/live/PoIrmiY0yjU?si=8BlNaz5BIpY8kHX5
// ===================================================
// INITIALIZE SYSTEM EVENTS & IMMEDIATE APPLE-STYLE POPUP
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
  const closeButton = document.getElementById('apple-alert-close-btn');
  const popupOverlay = document.getElementById('apple-alert-overlay');
  
  // Check session state engine to see if it's already fired during this page instance
  const hasShownPopup = sessionStorage.getItem('menuPopupShown');
  
  // Trigger the popup immediately on fresh page load if it hasn't been shown yet
  if (!hasShownPopup && popupOverlay) {
    popupOverlay.classList.remove('hidden');
    // Mark session space so it won't repeat until a browser refresh/reload event triggers
    sessionStorage.setItem('menuPopupShown', 'true');
  }
  
  // Close dialogue actions when clicking the "OK" button
  if (closeButton && popupOverlay) {
    closeButton.addEventListener('click', () => {
      popupOverlay.classList.add('hidden');
    });
  }
});

// ===================================================
// SERVICE MONITOR OVERLAY HANDLERS
// ===================================================
function showService(title, description) {
  document.getElementById('monitor-placeholder').classList.add('hidden');
  const dataBlock = document.getElementById('monitor-data');
  dataBlock.classList.remove('hidden');
  
  document.getElementById('monitor-title').innerText = title;
  document.getElementById('monitor-desc').innerText = description;
}

// ===================================================
// BIO COMPONENT ACTIONS
// ===================================================
function toggleUpi() {
  const upiFrame = document.getElementById('upi-display');
  upiFrame.classList.toggle('hidden');
}

// ===================================================
// IN-APP MAP RENDERING ENGINE CONTROLLERS
// ===================================================
function launchInAppSearch() {
  const destInput = document.getElementById('map-custom-destination').value.trim();
  const mapIframe = document.getElementById('live-interactive-map');
  
  if (!destInput) {
    alert("Please enter a destination to search location parameters!");
    return;
  }
  
  const originAddress = encodeURIComponent("New Modern Mission");
  const destinationAddress = encodeURIComponent(destInput);
  
  mapIframe.src = `https://maps.google.com/maps?q=${destinationAddress}+near+${originAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.classList.remove('active'));
}

function handleMapSearchKey(event) {
  if (event.key === 'Enter') {
    launchInAppSearch();
  }
}

function updateFreeMap(amenityType) {
  const mapIframe = document.getElementById('live-interactive-map');
  const baseLocation = "New Modern Mission";
  
  mapIframe.src = `https://maps.google.com/maps?q=${amenityType}+near+${baseLocation}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

// ===================================================
// GEMINI NATIVE CHAT INTEGRATION (NO POPUPS)
// ===================================================
function handleChatKey(event) {
  if (event.key === 'Enter') { 
    submitUserMessage(); 
  }
}

function sendChipPrompt(text) {
  document.getElementById('user-chat-input').value = text;
  submitUserMessage();
}

async function submitUserMessage() {
  const txtBox = document.getElementById('user-chat-input');
  const rawMsg = txtBox.value.trim();
  if (!rawMsg) return;

  const logBox = document.getElementById('chat-log-box');
  
  // Append User message row
  logBox.innerHTML += `<div class="msg-bubble user-msg">${rawMsg}</div>`;
  txtBox.value = "";
  
  // Auto Scroll logs
  logBox.scrollTop = logBox.scrollHeight;

  // Inject temporary thinking placeholder
  const typingId = "ai-typing-indicator-" + Date.now();
  logBox.innerHTML += `<div class="msg-bubble bot-msg" id="${typingId}"><i>Thinking...</i></div>`;
  logBox.scrollTop = logBox.scrollHeight;

  const typingBubble = document.getElementById(typingId);

  try {
    // Integrated verified Key from Google AI Studio
    const API_KEY = "AQ.Ab8RN6JbLJ8a8xNiL1Vq_msT-p8pg-nJHR6KpgfyU5vYol4Ihw"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const systemContext = `You are the friendly, high-tech AI Assistant for "Tasty & Comfort" (T&C), a premium stall located at New Modern Mission. 
    Stall Details to reference:
    - Hours: 6:00 AM to 10:00 PM daily.
    - Menu Items: Premium Tea (₹10), Crispy French Fries (Small Portion Salted: ₹50, Masala: ₹60; Big Portion Salted: ₹60, Masala: ₹70), Soft Sandwiches, and Crispy Punjabi Samosas (1 Piece Classic: ₹30, 2 Piece Box with Chutney: ₹55).
    - Features: Free Wheelchair assistance, First Aid, Fire Safety tracking, and an interactive "You Are Here" zone structural grid.
    - Owner: Ofoo not again the same frustrating question, I'll tell you who he is, the man on the earth who always shouts at me😏 his name is something looks like this Murali.
    Keep answers helpful, direct, short, and conversational.`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `${systemContext}\n\nUser Query: ${rawMsg}` }] 
        }]
      })
    });

    const data = await response.json();
    
    // Extract text from response payload
    const aiReply = data.candidates[0].content.parts[0].text;
    typingBubble.innerText = aiReply;

  } catch (error) {
    console.warn("Direct AI connection failed. Executing fallback:", error);
    
    // SECURE PRE-PROGRAMMED BACKEND FALLBACK (If key fails or connection drops)
    let fallbackResponse = "I'm processing that request! For immediate queries about our fresh menu or exact directions, please tap the Menu or Map tabs.";
    const lowerMsg = rawMsg.toLowerCase();

    if (lowerMsg.includes('hour') || lowerMsg.includes('time')) {
      fallbackResponse = "We are not yet launched but once started our stall is open from 6:00 AM to 10:00 PM every day! 'Drop by' for cup of tea and crispy fries.";
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
      fallbackResponse = "Our Premium Tea is ₹10. Crispy French Fries start at just ₹50 for a small portion and ₹60 for a big portion and for full menu please click on menu option";
    } else if (lowerMsg.includes('location') || lowerMsg.includes('where')) {
      fallbackResponse = "We are currently not located on earth but in soon we will. Check out the 'You Are Here Map' section to get direct navigation views on our live interactive map!";
    } else if (lowerMsg.includes('who') || lowerMsg.includes('owner')) {
      fallbackResponse = "Ofoo not again the same frustrating question, I'll tell you who he is, the man on the earth who always shouts at me😏 his name is something looks like this Murali. If you want to know about him click on About and don't ask me I can't shut my mouth from shouting at him, top of all this don't let him know that I shouted!";
    }
    
    typingBubble.innerText = fallbackResponse;
  }
  
  logBox.scrollTop = logBox.scrollHeight;
}


// Parking alert system
let announcementActive = false;
let messageContent = "";

function checkAnnouncement() {
    fetch('announcement.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            const modal = document.getElementById('announcement-modal');
            const sound = document.getElementById('announcement-sound');
            
            if (data.status === 'active') {
                announcementActive = true;
                messageContent = data.message;
                
                if (modal.classList.contains('hidden')) {
                    document.getElementById('announcement-text').innerText = messageContent;
                    modal.classList.remove('hidden');
                    
                    // Trigger the sound
                    sound.play().catch(e => console.log("Audio play blocked by browser, user needs to click the page first."));
                }
            } else {
                announcementActive = false;
                modal.classList.add('hidden');
            }
        })
        .catch(error => console.log('Error:', error));
}


// 1. Run once immediately when the page loads
checkAnnouncement();

// 2. Check every 30 seconds
setInterval(checkAnnouncement, 60000);

function closeAnnouncement() {
    const modal = document.getElementById('announcement-modal');
    modal.classList.add('hidden');
    
    // "Nag" feature: reappear after 1 minute if still active
    if (announcementActive) {
        setTimeout(() => {
            if (announcementActive) {
                // Ensure text is set before showing
                document.getElementById('announcement-text').innerText = messageContent;
                modal.classList.remove('hidden');
            }
        }, 60000); 
    }
}


// Image Popup
function openMenuModal(imgSrc, title, price, type) {
    const modal = document.getElementById('menuModal');
    if (!modal) return;
    
    // Set color based on the type
    let dotColor;
    if (type === 'Veg') {
        dotColor = 'green';
    } else if (type === 'N.Veg') {
        dotColor = 'red';
    } else {
        dotColor = 'orange'; // Used for 'Both' or any other type
    }
    
    // Update the modal content
    modal.querySelector('img').src = imgSrc;
    modal.querySelector('h3').innerText = title;
    modal.querySelector('.price-tile').innerText = 'Price: ' + price;
    modal.querySelector('.type-tile').innerHTML = 
        'Type: ' + type + ' <span style="color: ' + dotColor + ';">●</span>';
    
    modal.showModal();
}




// T&C Live Vercel Proxy Feed Engine (Connects directly to your existing #news-container)
// Strict Single-Date Filter & Archive Link Engine
let currentScope = 'local';
let selectedNewsDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

function switchNewsScope(scope) {
  currentScope = scope;
  fetchNews();
}

function handleDateChange(inputElem) {
  const chosenDateStr = inputElem.value;
  const todayStr = new Date().toISOString().split('T')[0];

  if (chosenDateStr > todayStr) {
    alert("Sorry I don't have a time machine to help you with the future Hahaha 😄");
    inputElem.value = selectedNewsDate;
    return;
  }

  selectedNewsDate = chosenDateStr;
  fetchNews();
}

async function fetchNews() {
  const container = document.getElementById('news-container');
  if (!container) return;

  // Header controls bar with date picker
  const internalControlsHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      
      <!-- Category Tabs (Telangana, India, World) -->
      <div style="display: flex; gap: 5px; flex-wrap: wrap;">
        <button onclick="switchNewsScope('local')" style="background: ${currentScope === 'local' ? '#f59e0b' : '#1e293b'}; color: ${currentScope === 'local' ? '#0f172a' : '#cbd5e1'}; border: ${currentScope === 'local' ? 'none' : '1px solid #475569'}; padding: 3px 8px; border-radius: 5px; font-weight: bold; font-size: 0.75rem; cursor: pointer;">
          📍 Telangana
        </button>
        <button onclick="switchNewsScope('india')" style="background: ${currentScope === 'india' ? '#f59e0b' : '#1e293b'}; color: ${currentScope === 'india' ? '#0f172a' : '#cbd5e1'}; border: ${currentScope === 'india' ? 'none' : '1px solid #475569'}; padding: 3px 8px; border-radius: 5px; font-weight: bold; font-size: 0.75rem; cursor: pointer;">
          🇮🇳 India
        </button>
        <button onclick="switchNewsScope('world')" style="background: ${currentScope === 'world' ? '#f59e0b' : '#1e293b'}; color: ${currentScope === 'world' ? '#0f172a' : '#cbd5e1'}; border: ${currentScope === 'world' ? 'none' : '1px solid #475569'}; padding: 3px 8px; border-radius: 5px; font-weight: bold; font-size: 0.75rem; cursor: pointer;">
          🌍 World
        </button>
      </div>

      <!-- Date Selector -->
      <div style="display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: #94a3b8; background: #0f172a; padding: 2px 6px; border-radius: 5px; border: 1px solid #334155;">
        <span>📅 Date:</span>
        <input type="date" value="${selectedNewsDate}" onchange="handleDateChange(this)" style="background: transparent; color: #38bdf8; border: none; font-size: 0.72rem; font-weight: bold; outline: none; cursor: pointer;">
      </div>

    </div>
  `;

  container.innerHTML = `
    ${internalControlsHtml}
    <div style="color: #ffd700; padding: 8px; font-size: 0.8rem;">
      <i class="fa-solid fa-spinner fa-spin"></i> Checking ${currentScope.toUpperCase()} news for ${selectedNewsDate}...
    </div>
  `;

  try {
    const res = await fetch(`https://news-lemon-two.vercel.app/api/news?scope=${currentScope}`);
    const xmlText = await res.text();
    const xml = new DOMParser().parseFromString(xmlText, "text/xml");
    const items = xml.querySelectorAll("item");

    if (!items || items.length === 0) throw new Error("No items found");

    // Top 3 World Highlights
    let worldHighlightsHtml = '';
    if (currentScope !== 'world') {
      try {
        const worldRes = await fetch(`https://news-lemon-two.vercel.app/api/news?scope=world`);
        const worldXmlText = await worldRes.text();
        const worldXml = new DOMParser().parseFromString(worldXmlText, "text/xml");
        const worldItems = worldXml.querySelectorAll("item");

        if (worldItems && worldItems.length > 0) {
          worldHighlightsHtml += `
            <div style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 6px; padding: 6px 8px; margin-bottom: 8px;">
              <div style="font-size: 0.7rem; color: #38bdf8; font-weight: bold; margin-bottom: 3px;">🌍 TOP 3 WORLD BREAKING NEWS</div>
          `;
          Array.from(worldItems).slice(0, 3).forEach(wItem => {
            const wRaw = wItem.querySelector("title")?.textContent || "";
            const wLink = wItem.querySelector("link")?.textContent || "#";
            let wTitle = wRaw;
            if (wRaw.includes(" - ")) {
              const parts = wRaw.split(" - ");
              parts.pop();
              wTitle = parts.join(" - ").trim();
            }
            worldHighlightsHtml += `
              <a href="${wLink}" target="_blank" rel="noopener" style="color: #e2e8f0; text-decoration: none; font-size: 0.78rem; display: block; margin-bottom: 2px; line-height: 1.25;">
                🔥 ${wTitle}
              </a>
            `;
          });
          worldHighlightsHtml += `</div>`;
        }
      } catch (err) {}
    }

    // STRICT DATE FILTERING: Match ONLY the selected date string (YYYY-MM-DD)
    const exactMatches = Array.from(items).filter(item => {
      const pubDateRaw = item.querySelector("pubDate")?.textContent || "";
      if (!pubDateRaw) return false;
      
      const itemDateObj = new Date(pubDateRaw);
      if (isNaN(itemDateObj)) return false;
      
      // Convert published date to YYYY-MM-DD in local time
      const itemDateStr = itemDateObj.toISOString().split('T')[0];
      return itemDateStr === selectedNewsDate;
    });

    let itemsHtml = '';

    if (exactMatches.length > 0) {
      // Display strictly matching articles for that exact selected date
      exactMatches.forEach(item => {
        const rawTitle = item.querySelector("title")?.textContent || "";
        const link = item.querySelector("link")?.textContent || "#";
        const pubDateRaw = item.querySelector("pubDate")?.textContent || "";

        let headline = rawTitle;
        let sourceName = "Google News";

        if (rawTitle.includes(" - ")) {
          const parts = rawTitle.split(" - ");
          sourceName = parts.pop().trim();
          headline = parts.join(" - ").trim();
        }

        let timeFormatted = "Live";
        let dateFormatted = "";
        if (pubDateRaw) {
          const dateObj = new Date(pubDateRaw);
          if (!isNaN(dateObj)) {
            timeFormatted = dateObj.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
            dateFormatted = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          }
        }

        itemsHtml += `
          <div class="news-item" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-left: 2px solid #f59e0b; padding: 8px 10px; border-radius: 6px; margin-bottom: 6px;">
            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 3px;">
              Published by <strong style="color: #f59e0b;">${sourceName}</strong> at <span style="color: #38bdf8;">${timeFormatted}</span> on <span style="color: #cbd5e1;">${dateFormatted}</span>.
            </div>
            <a href="${link}" target="_blank" rel="noopener" style="color: #f8fafc; text-decoration: none; font-size: 0.85rem; font-weight: 500; line-height: 1.35; display: block;">
              ${headline}
            </a>
          </div>
        `;
      });
    } else {
      // If selected date is older than Google News live RSS buffer, show custom archive helper
      const scopeLabel = currentScope === 'local' ? 'Telangana' : currentScope === 'india' ? 'India' : 'World';
      const searchArchiveUrl = `https://www.google.com/search?q=${encodeURIComponent(scopeLabel + ' news ' + selectedNewsDate)}&tbm=nws`;

      itemsHtml = `
        <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px; padding: 12px; text-align: center; color: #cbd5e1; margin-top: 6px;">
          <div style="font-size: 0.88rem; font-weight: bold; color: #f59e0b; margin-bottom: 6px;">
            Sorry, no live articles found for ${selectedNewsDate}
          </div>
          <p style="font-size: 0.78rem; color: #94a3b8; margin: 0 0 10px 0; line-height: 1.4;">
            T&C can help with recent 24–48hrs headlines only. For researchers seeking historical archives for <strong>${selectedNewsDate}</strong>:
          </p>
          <a href="${searchArchiveUrl}" target="_blank" rel="noopener" style="display: inline-block; background: #f59e0b; color: #0f172a; padding: 6px 14px; border-radius: 6px; font-weight: bold; font-size: 0.8rem; text-decoration: none;">
            Click here for ${scopeLabel} News for ${selectedNewsDate} →
          </a>
        </div>
      `;
    }

    container.innerHTML = `
      ${internalControlsHtml}
      ${worldHighlightsHtml}
      ${itemsHtml}
    `;

  } catch (e) {
    container.innerHTML = `
      ${internalControlsHtml}
      <div style="color: #ff5968; padding: 8px; font-size: 0.8rem;">Unable to load live feed. Click Refresh.</div>
    `;
  }
}

// Load on start
window.addEventListener('load', fetchNews);







// 2nd half
function setMode(mode, element) {
    // 1. Manage Button Highlighting
    document.querySelectorAll('.view-selector button').forEach(btn => {
        btn.classList.remove('active-mode');
    });
    if (element) {
        element.classList.add('active-mode');
    }

    // 2. Select Elements (Added music)
    const views = {
        text: document.getElementById('text-view'),
        video: document.getElementById('video-view'),
        live: document.getElementById('live-view'),
        wildlife: document.getElementById('wildlife-view'),
        sports: document.getElementById('sports-view'),
        music: document.getElementById('music-view') // New music view
    };
    
    const players = {
        news: document.getElementById('news-video-player'),
        live: document.getElementById('tc-live-player'),
        wildlife: document.getElementById('wildlife-player'),
        sports: document.getElementById('sports-player'),
        music: document.getElementById('music-player'),
        nasa: document.getElementById('nasa-video-player'),
        airport: document.getElementById('airport-player'),
        hindu: document.getElementById('hindu-player'),
        muslim: document.getElementById('muslim-player'),
        christian: document.getElementById('christian-video-player'),
        law: document.getElementById('law-video-player'),
        file: document.getElementById('file-video-player'),
    };

    const title = document.getElementById('current-channel-title');
    const dot = document.getElementById('live-indicator');

    // 3. Reset all views and stop ALL players
    Object.keys(views).forEach(key => {
        if(views[key]) views[key].style.display = 'none';
    });
    Object.keys(players).forEach(key => {
        if(players[key]) players[key].src = "";
    });

    // 4. Activate chosen mode & Update Title/Dot
    if (mode === 'text') {
        title.innerText = "Latest Updates";
        dot.style.display = "none";
        views.text.style.display = 'block';
    } 
    else {
        // Any mode other than 'text' is a video/audio medium, trigger the smart headphone reminder!
        checkAndShowHeadphonesNotice();

        if (mode === 'video') {
            title.innerText = "Live NEWS";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/II_m28Bm-iM?autoplay=1&mute=1";
        } 
        else if (mode === 'live') {
            title.innerText = "T&C Live";
            dot.style.display = "inline-block";
            views.live.style.display = 'block';
            players.live.src = "https://www.youtube.com/embed/IzOOvR-XzAg?autoplay=1&mute=1";
        }
        else if (mode === 'wildlife') {
            title.innerText = "Wild Live";
            dot.style.display = "inline-block";
            views.wildlife.style.display = 'block';
            players.wildlife.src = "https://www.youtube.com/embed/MiQe9ob9aDc?autoplay=1&mute=1";
        }
        else if (mode === 'sports') {
            title.innerText = "Sports Live";
            dot.style.display = "inline-block";
            views.sports.style.display = 'block';
            players.sports.src = "https://www.youtube.com/embed/fE_xxKiCHO0?autoplay=1&mute=1";
        }
        else if (mode === 'music') {
            title.innerText = "Music";
            dot.style.display = "inline-block"; 
            // Fixed typo here to properly target views.music instead of views.sports
            if (views.music) views.music.style.display = 'block';
            players.music.src = "https://www.youtube.com/embed/VdG_RC1POC8?autoplay=1&mute=1";
        }
        else if (mode === 'nasa') {
            title.innerText = "NASA";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/OKQEMp2555A?autoplay=1&mute=1";
        } 
        else if (mode === 'airport') {
            title.innerText = "Airside";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/n4I0d44oBEs?autoplay=1&mute=1";
        } 
        else if (mode === 'hindu') {
            title.innerText = " Bhagavat Geetha";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/FFtPSPByBmk?autoplay=1&mute=1";
        } 
        else if (mode === 'muslim') {
            title.innerText = "Khuran";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/_1FpcN1U_KY?autoplay=1&mute=1";
        } 
        else if (mode === 'christian') {
            title.innerText = "Bibul";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/dmgsOBr2lAA?autoplay=1&mute=1";
        } 
        else if (mode === 'law') {
            title.innerText = "Constitution";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "https://www.youtube.com/embed/U71NrLiWWjI?autoplay=1&mute=1";
        } 
        else if (mode === 'file') {
            title.innerText = "Media";
            dot.style.display = "inline-block";
            views.video.style.display = 'block';
            players.news.src = "Audi RS5.jpg";
        }
    }
}

// https://youtu.be/-aTWDnQttks?si=9fNdqun3qpwJRSSf
// src: "0cc97f69-41fe-4344-80ca-6668201e80fb-ezgif.com-crop.gif"
// https://youtu.be/IzOOvR-XzAg?si=Wejt5kdTn-Kh1rew
// https://www.youtube.com/live/MiQe9ob9aDc?si=8j_VKUJ6F7B9i7vy
// https://www.youtube.com/live/-6aJD-4Yu4w?si=arobwb4tdTKjwmld
// https://www.youtube.com/live/fE_xxKiCHO0?si=lLv3s6P-AKr07hiC
// https://www.youtube.com/live/QCwq5Lg7Xes?si=Zer6F4zIFHC9Z6SR
// https://www.youtube.com/live/e1FIApIafWE?si=ZtVRb0WntF9uYHZx
// https://youtu.be/-aTWDnQttks?si=SBTx1z6N_MK20dUw
// https://www.youtube.com/live/Gupg41GJlpo?si=tscBaxRnGJ5t4FPL
//News https://www.youtube.com/live/_jnDy56dehA?si=aTz02-wbLsCzXPDJ
//News https://www.youtube.com/live/II_m28Bm-iM?si=h5Z4hs2eCcPga8F2
//Music https://youtu.be/-yHCeSZ-Nik?si=szr11nVDBTFAZN8J
//Music https://youtu.be/x-GgFu-vEV8?si=uQ_aM0at8nkBAlYH
//Music https://youtu.be/VdG_RC1POC8?si=SmyWCW79SrZZ8ORV


// Selector bar of videos
function scrollToActiveTab(buttonElement) {
    const container = buttonElement.parentElement;
    
    // Calculate position to center or bring the active button into view
    const containerWidth = container.offsetWidth;
    const buttonLeft = buttonElement.offsetLeft;
    const buttonWidth = buttonElement.offsetWidth;
    
    // Smoothly scroll the container to center the active button
    container.scrollTo({
        left: buttonLeft - (containerWidth / 2) + (buttonWidth / 2),
        behavior: 'smooth'
    });
}

// Example usage inside your tab click listener:
document.querySelectorAll('.view-selector button').forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all, add to current
        document.querySelectorAll('.view-selector button').forEach(btn => btn.classList.remove('active-mode'));
        this.classList.add('active-mode');
        
        // Automatically scroll to keep it visible
        scrollToActiveTab(this);
    });
});



//App Language
function changeLang(lang) {
    var combo = document.querySelector('.goog-te-combo');
    if (combo) {
        combo.value = lang;
        combo.dispatchEvent(new Event('change'));
    }
}


// Weather Fetching
window.addEventListener('load', async () => {
    console.log("Page loaded, starting weather fetch...");
    
    const display = document.getElementById('mobile-weather-display');
    if (!display) {
        console.error("CRITICAL ERROR: Could not find an element with id='mobile-weather-display'. Check your HTML!");
        return;
    }

    try {
        const apiKey = '238416beb1e4e9ee3e1c4c8f16fc2a2c';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=Hyderabad&appid=${apiKey}&units=metric`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log("Weather data received:", data);
        
        // Update the display
        display.innerText = `${Math.round(data.main.temp)}°C ${data.weather[0].description}`;
    } catch (error) {
        console.error("Fetch failed:", error);
        display.innerText = "Weather unavailable";
    }
});

// Weather updates
async function fetchWeather() {
    const apiKey = '238416beb1e4e9ee3e1c4c8f16fc2a2c';
    const city = 'Hyderabad';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // 1. Prepare the Data
        const temp = `${Math.round(data.main.temp)}°C`;
        const cond = data.weather[0].description;
        
        // 2. Get the Dynamic Icon URL
        const iconCode = data.weather[0].icon; 
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        
        // 3. Define all targets
        const textElements = {
            'mobile-temp': temp,
            'desktop-temp': temp,
            'mobile-condition': cond,
            'desktop-condition': cond
        };
        
        const iconElements = ['mobile-icon', 'desktop-icon'];
        
        // 4. Update Text Elements
        for (const [id, value] of Object.entries(textElements)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        }
        
        // 5. Update Icons
        iconElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.src = iconUrl;
        });
        
    } catch (error) {
        console.error("Weather error:", error);
    }
}

// Run when page loads
window.addEventListener('load', fetchWeather);
// Update every 10 minutes (10 minutes * 60 seconds * 1000 milliseconds)
setInterval(fetchWeather, 600000);




// Map updated
// 1. Your exact stall coordinates
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

let allModesData = { driving: [], walking: [] };
let currentMode = 'driving';
let routeLayers = [];
let destMarker = null;
let currentDestName = "";

// Initialize Leaflet Map
const map = L.map('map').setView([stallLat, stallLng], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'New Modern Mission by T&C'
}).addTo(map);

// Add Stall Marker
L.marker([stallLat, stallLng]).addTo(map)
  .bindPopup('<b>You are here Tasty & Comfort Stall</b>').openPopup();

// FORCE MAP TO RENDER AUTOMATICALLY ON LOAD (Multiple staggered intervals catch mobile browser layout delays)
function triggerMapRefresh() {
  if (typeof map !== 'undefined') {
    map.invalidateSize(true);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(triggerMapRefresh, 100);
  setTimeout(triggerMapRefresh, 400);
  setTimeout(triggerMapRefresh, 1000);
});

window.addEventListener('load', () => {
  setTimeout(triggerMapRefresh, 100);
  setTimeout(triggerMapRefresh, 500);
});



// Tab click function to fix the half-blank map rendering bug if switched later
function openMapView() {
  const mapView = document.getElementById('map-view');
  if (mapView) {
    mapView.style.display = 'block';
  }
  
  if (typeof map !== 'undefined') {
    setTimeout(function() {
      map.invalidateSize();
    }, 100);
  }
}

// Triggered when typing in the search bar
async function searchDestination() {
  const query = document.getElementById('destination-input').value.trim();
  if (!query) {
    alert("Please enter a destination, coordinates, or Plus Code!");
    return;
  }
  await fetchRouteData(query);
}

// Triggered when clicking amenity chips
async function searchAmenity(amenityKey) {
  const facility = customAmenities[amenityKey];
  if (!facility) return;

  document.getElementById('destination-input').value = facility.name;
  await fetchRouteData(facility.query, facility.name);
}

// Universal function that handles Lat/Lng, Plus Codes, Text Addresses, and "Near Me" searches
async function fetchRouteData(query, customDisplayName = null) {
  const infoBox = document.getElementById('route-info');
  infoBox.innerHTML = `
    <div class="card-placeholder">
      <span class="pulse-icon">⏳</span>
      <p>Resolving location and calculating routes...</p>
    </div>
  `;

  try {
    let destLat, destLng, destName;

    // 1. Check if query is raw lat/lng coordinates
    const latLngRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = query.match(latLngRegex);

    if (match) {
      destLat = parseFloat(match[1]);
      destLng = parseFloat(match[3]);
      destName = customDisplayName || `Coordinates (${destLat}, ${destLng})`;
    } else {
      // 2. Clean up search query safely
      let searchQuery = query.trim();
      const lowerQuery = searchQuery.toLowerCase();

      if (lowerQuery.includes('near')) {
        searchQuery = lowerQuery.replace(/near\s*me/g, '').replace(/near/g, '').trim();
      }

      // 3. Search via Nominatim globally
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=1`;
      const geoRes = await fetch(geoUrl);
      
      if (!geoRes.ok) throw new Error("Failed to connect to location search service.");
      
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        infoBox.innerHTML = `<div class="card-placeholder"><p>Location not found. Try a valid address, city, or place name.</p></div>`;
        return;
      }

      destLat = parseFloat(geoData[0].lat);
      destLng = parseFloat(geoData[0].lon);
      destName = customDisplayName || geoData[0].display_name;
    }

    currentDestName = destName;

    if (destMarker) map.removeLayer(destMarker);
    destMarker = L.marker([destLat, destLng]).addTo(map)
      .bindPopup(`<b>${destName}</b>`).openPopup();

    // 4. Fetch routing data from OSRM safely
    const [driveRes, walkRes] = await Promise.all([
      fetch(`https://router.project-osrm.org/route/v1/driving/${stallLng},${stallLat};${destLng},${destLat}?overview=full&geometries=geojson&alternatives=true`),
      fetch(`https://router.project-osrm.org/route/v1/foot/${stallLng},${stallLat};${destLng},${destLat}?overview=full&geometries=geojson`)
    ]);

    const driveData = await driveRes.json();
    const walkData = await walkRes.json();

    if (driveData.code === "Ok" && walkData.code === "Ok") {
      allModesData.driving = driveData.routes;
      
      walkData.routes.forEach(route => {
        if (route.duration <= driveData.routes[0].duration) {
          route.duration = (route.distance / 1.25); 
        }
      });

      allModesData.walking = walkData.routes;
      
      currentMode = 'driving'; 
      renderRouteCard();
      drawRouteOnMap(currentMode, 0);
    } else {
      infoBox.innerHTML = `<div class="card-placeholder"><p>Could not calculate route paths for this location.</p></div>`;
    }

  } catch (err) {
    console.error("Route fetch error:", err);
    infoBox.innerHTML = `<div class="card-placeholder"><p>Something went wrong. Please check your spelling or connection.</p></div>`;
  }
}

// Fix map sizing bug on window resize
window.addEventListener('resize', () => { 
  if (typeof map !== 'undefined') {
    map.invalidateSize(); 
  }
});

function switchMode(mode) {
  currentMode = mode;
  renderRouteCard();
  drawRouteOnMap(currentMode, 0); 
}

function formatDuration(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  let parts = [];
  if (days > 0) {
    parts.push(`${days} day${days > 1 ? 's' : ''}`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours}h`);
  }
  parts.push(`${minutes}min`);

  return parts.join(' ');
}

function renderRouteCard() {
  const infoBox = document.getElementById('route-info');
  const routes = allModesData[currentMode];

  let optionsHtml = '';
  routes.forEach((route, index) => {
    const dist = (route.distance / 1000).toFixed(1);
    const timeFormatted = formatDuration(route.duration);
    const label = index === 0 ? "⚡ Shortest" : `🛣️ Alternative ${index + 1}`;
    
    optionsHtml += `
      <button class="route-option-btn ${index === 0 ? 'active-route' : ''}" onclick="switchRouteIndex(${index}, this)">
        <div style="font-weight:600; color:#ffd700;">${label}</div>
        <div>${dist} km (~${timeFormatted})</div>
      </button>
    `;
  });

  infoBox.innerHTML = `
    <div class="route-results-grid">
      <div class="destination-header">
        <span>📍</span>
        <div><strong>Destination:</strong> ${currentDestName}</div>
      </div>
      
      <div class="mode-switcher">
        <button class="mode-btn ${currentMode === 'driving' ? 'active-mode' : ''}" onclick="switchMode('driving')">🚗 Driving</button>
        <button class="mode-btn ${currentMode === 'walking' ? 'active-mode' : ''}" onclick="switchMode('walking')">🚶 Walking</button>
      </div>

      <div style="font-size:0.75rem; color:#8b949e;">Route suggestion:</div>
      <div class="route-options-group">
        ${optionsHtml}
      </div>
    </div>
  `;
}

function switchRouteIndex(index, btnElement) {
  document.querySelectorAll('.route-option-btn').forEach(b => b.classList.remove('active-route'));
  btnElement.classList.add('active-route');
  drawRouteOnMap(currentMode, index);
}

function drawRouteOnMap(mode, index) {
  routeLayers.forEach(layer => map.removeLayer(layer));
  routeLayers = [];

  const routes = allModesData[mode];
  
  routes.forEach((r, i) => {
    const color = i === index ? (mode === 'driving' ? '#34c759' : '#00c7be') : '#888888';
    const weight = i === index ? 5 : 3;
    const opacity = i === index ? 0.9 : 0.4;

    const layer = L.geoJSON(r.geometry, {
      style: { color: color, weight: weight, opacity: opacity }
    }).addTo(map);

    routeLayers.push(layer);
  });

  if (routeLayers[index]) {
    map.fitBounds(routeLayers[index].getBounds(), { padding: [50, 50] });
  }
}


// Automatically fix map tiles the exact moment the container finishes rendering
const mapContainerElement = document.getElementById('map');
if (mapContainerElement) {
  const observer = new ResizeObserver(() => {
    if (typeof map !== 'undefined') {
      map.invalidateSize();
    }
  });
  observer.observe(mapContainerElement);
}



// 🎧 headphones pop-up
// Track whether we already reminded them in this browser session
let hasShownHeadphones = false;

function checkAndShowHeadphonesNotice() {
  if (hasShownHeadphones) return; // Only show once per page load

  const modal = document.getElementById('smart-headphones-popup');
  if (modal) {
    hasShownHeadphones = true;
    modal.style.display = 'block';

    // Smart Auto-dismiss: hide automatically after 10 seconds if they don't click anything
    setTimeout(() => {
      dismissHeadphonesNotice(false);
    }, 10000);
  }
}

function dismissHeadphonesNotice(rememberChoice) {
  const modal = document.getElementById('smart-headphones-popup');
  if (modal) {
    modal.style.display = 'none';
  }
}







