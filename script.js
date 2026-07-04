// SECTION VIEW MANAGER ENGINE
function switchView(viewId, element) {
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(sec => sec.classList.remove('active-view'));
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active-view');
  
  const sideItems = document.querySelectorAll('.side-item');
  sideItems.forEach(item => item.classList.remove('active'));
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));
  
  if (element) element.classList.add('active');
}

// MAP ENGINE
const API_KEY = 'AIzaSyCu7y4OvhUildHH_PotkZO3pVvEAXHiuGU'; 
const MY_ORIGIN_COORDS = "17.368135,78.536981";

function launchInAppSearch() {
  const destInput = document.getElementById('map-custom-destination');
  if (!destInput) return;
  const destValue = destInput.value.trim();
  const mapIframe = document.getElementById('live-interactive-map');
  
  if (!destValue) {
    alert("Please enter a destination!");
    return;
  }
  
  const destination = encodeURIComponent(destValue);
  // Correct Template Literal usage
  mapIframe.src = `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}&origin=${MY_ORIGIN_COORDS}&destination=${destination}&mode=driving`;
}

function updateFreeMap(amenityType) {
  const mapIframe = document.getElementById('live-interactive-map');
  // Correct Template Literal usage
  mapIframe.src = `https://www.google.com/maps/embed/v1/search?key=${API_KEY}&q=${encodeURIComponent(amenityType)}+near+${MY_ORIGIN_COORDS}`;
  
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.classList.remove('active'));
  // Safe event handling
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
}

function handleMapSearchKey(event) {
  if (event.key === 'Enter') launchInAppSearch();
}
