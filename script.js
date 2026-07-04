// SECTION VIEW MANAGER ENGINE
function switchView(viewId, element) {
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(sec => sec.classList.remove('active-view'));
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active-view');
  
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));
  if (element) element.classList.add('active');
}

// MAP ENGINE
const API_KEY = 'AIzaSyCu7y4OvhUildHH_PotkZO3pVvEAXHiuGU'; 
const MY_ORIGIN_COORDS = "17.368135,78.536981";

// Helper: Show spinner
function toggleSpinner(show) {
  const spinner = document.getElementById('map-loading-spinner');
  if (spinner) spinner.style.display = show ? 'block' : 'none';
}

function launchInAppSearch() {
  const destInput = document.getElementById('map-custom-destination');
  if (!destInput) return;
  const destValue = destInput.value.trim();
  const mapIframe = document.getElementById('live-interactive-map');
  
  if (!destValue) {
    alert("Please enter a destination!");
    return;
  }
  
  toggleSpinner(true);
  const destination = encodeURIComponent(destValue);
  // Correct Template Literal: Added $ to ${API_KEY}
  mapIframe.src = `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}&origin=${MY_ORIGIN_COORDS}&destination=${destination}&mode=driving`;
  
  // Hide spinner after loading
  mapIframe.onload = () => toggleSpinner(false);
}

function updateFreeMap(amenityType) {
  const mapIframe = document.getElementById('live-interactive-map');
  const queryMap = {
    'hospital': 'hospital',
    'metro': 'subway_station',
    'bus_station': 'bus_station',
    'police': 'police',
    'fire_station': 'fire_station',
    'courier': 'post_office',
    'temple': 'hindu_temple'
  };

  const searchTerm = queryMap[amenityType] || amenityType;
  
  toggleSpinner(true);
  // Correct Template Literal: Added $ to ${API_KEY}
  mapIframe.src = `https://www.google.com/maps/embed/v1/search?key=${API_KEY}&q=${encodeURIComponent(searchTerm)}+near+${MY_ORIGIN_COORDS}`;
  
  mapIframe.onload = () => toggleSpinner(false);
  
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.classList.remove('active'));
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
}

function handleMapSearchKey(event) {
  if (event.key === 'Enter') launchInAppSearch();
}
