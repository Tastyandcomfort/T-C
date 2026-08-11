// Initialize Leaflet mini-map preview
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("mini-map")) {
    const miniMap = L.map('mini-map', {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false
    }).setView([17.3850, 78.4867], 15); // Default coordinates (e.g., Hyderabad)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(miniMap);

    // Add pin for "You Are Here"
    L.marker([17.3850, 78.4867]).addTo(miniMap);
  }
});

// Tab navigation switcher
function switchTab(tabName, element) {
  // Update active state in bottom bar if clicked from nav
  if (element) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
  } else {
    // Find matching nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('onclick')?.includes(tabName)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Handle actions based on selected tab
  if (tabName === 'map') {
    alert("Opening full interactive 'You Are Here' navigation map view.");
  } else if (tabName === 'chat') {
    alert("Launching ChatGPT Assistant session.");
  } else if (tabName === 'menu') {
    alert("Displaying full menu catalog.");
  } else if (tabName === 'services') {
    alert("Displaying all available customer support services.");
  } else if (tabName === 'certifications') {
    alert("Displaying complete list of verified compliance certificates.");
  }
}

// Service tile click trigger
function openServiceModal(serviceName) {
  alert(`Service Selected: ${serviceName}. Our team is ready to assist you immediately!`);
}

// UPI QR Code Modal Toggle
function toggleUpiModal() {
  const modal = document.getElementById('upi-modal');
  modal.classList.toggle('hidden');
}
