// SECTION VIEW MANAGER ENGINE
function switchView(viewId, element) {
  // Hide all sections smoothly
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(sec => sec.classList.remove('active-view'));
  
  // Show target section
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active-view');
  }

  // Update active states on sidebar
  const sideItems = document.querySelectorAll('.side-item');
  sideItems.forEach(item => item.classList.remove('active'));
  
  // Update active states on mobile tab-bar
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  // Highlight active element trigger frame
  if (element) {
    element.classList.add('active');
  }
}

// SERVICE MONITOR OVERLAY HANDLERS
function showService(title, description) {
  document.getElementById('monitor-placeholder').classList.add('hidden');
  const dataBlock = document.getElementById('monitor-data');
  dataBlock.classList.remove('hidden');
  
  document.getElementById('monitor-title').innerText = title;
  document.getElementById('monitor-desc').innerText = description;
}

// BIO COMPONENT ACTIONS
function toggleUpi() {
  const upiFrame = document.getElementById('upi-display');
  upiFrame.classList.toggle('hidden');
}

// IN-APP MAP RENDERING ENGINE CONTROLLERS (FIXED GO BUTTON BUG)
function launchInAppSearch() {
  const destInput = document.getElementById('map-custom-destination').value.trim();
  const mapIframe = document.getElementById('live-interactive-map');
  
  if (!destInput) {
    alert("Please enter a destination to search location parameters!");
    return;
  }
  
  const originAddress = encodeURIComponent("New Modern Mission");
  const destinationAddress = encodeURIComponent(destInput);
  
  // FIXED: Standardized string interpolation format parameters correctly
  mapIframe.src = `https://maps.google.com/maps?q=${destinationAddress}+near+${originAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  
  // Clear category chip selections since a unique search is running
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

  // Update button highlights
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(chip => chip.classList.remove('active'));
  event.currentTarget.classList.add('active');
}


// SIMPLE INTEGRATED CHAT INTERFACES
function handleChatKey(event) {
  if (event.key === 'Enter') { submitUserMessage(); }
}

function sendChipPrompt(text) {
  document.getElementById('user-chat-input').value = text;
  submitUserMessage();
}

function submitUserMessage() {
  const txtBox = document.getElementById('user-chat-input');
  const rawMsg = txtBox.value.trim();
  if (!rawMsg) return;

  const logBox = document.getElementById('chat-log-box');
  
  // Append User message row
  logBox.innerHTML += `<div class="msg-bubble user-msg">${rawMsg}</div>`;
  txtBox.value = "";
  
  // Auto Scroll logs
  logBox.scrollTop = logBox.scrollHeight;

  // Simple automated responses
  setTimeout(() => {
    let response = "I'm processing that request! For immediate queries about our fresh menu or exact directions, please tap the Menu or Map tabs.";
    if (rawMsg.toLowerCase().includes('hour') || rawMsg.toLowerCase().includes('time')) {
      response = "Our stall is open from 6:00 AM to 10:00 PM every day! Drop by anytime for hot tea and crispy fries.";
    } else if (rawMsg.toLowerCase().includes('price') || rawMsg.toLowerCase().includes('cost')) {
      response = "Our Premium Tea is ₹10. Crispy French Fries start at just ₹50 for a small portion and ₹60 for a big portion!";
    } else if (rawMsg.toLowerCase().includes('location') || rawMsg.toLowerCase().includes('where')) {
      response = "We are located at New Modern Mission. Check out the 'You Are Here' tab to get direct navigation views on our live interactive map!";
    }
    
    logBox.innerHTML += `<div class="msg-bubble bot-msg">${response}</div>`;
    logBox.scrollTop = logBox.scrollHeight;
  }, 600);
}

// POP-UP ENGINE CONTROLLER INTERFACES
function openMenuPopup(title, desc, price, imgSrc, fallbackIconHTML) {
  document.getElementById('modal-item-title').innerText = title;
  document.getElementById('modal-item-desc').innerText = desc;
  document.getElementById('modal-item-price').innerText = price;
  
  const imgElement = document.getElementById('modal-item-img');
  imgElement.src = imgSrc;
  imgElement.style.display = 'block';
  
  document.getElementById('modal-item-fallback').innerHTML = fallbackIconHTML;
  document.getElementById('standard-menu-modal').classList.remove('hidden');
}

function openFriesPopup(imgSrc) {
  const imgElement = document.getElementById('modal-fries-img');
  imgElement.src = imgSrc;
  imgElement.style.display = 'block';
  
  document.getElementById('fries-menu-modal').classList.remove('hidden');
}

function closePopup(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}
