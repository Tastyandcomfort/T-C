// Function to switch between main views
function switchView(sectionId, element) {
  // 1. Hide all application sections
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(section => {
    section.classList.remove('active-view');
  });
  
  // 2. Show the selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active-view');
  }

  // 3. Remove active highlighting from all bottom buttons
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
  });
  
  // 4. Add active gold color highlighting to clicked button
  element.classList.add('active');
  
  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Function to handle clicking on different services in the grid
function selectService(title, description) {
  const placeholder = document.querySelector('.panel-placeholder');
  const content = document.querySelector('.panel-content');
  const titleElem = document.getElementById('panel-title');
  const descElem = document.getElementById('panel-desc');
  const displayBox = document.getElementById('service-detail-box');

  // Hide initial placeholder prompt
  if (placeholder) placeholder.classList.add('hidden');
  
  // Inject text and reveal container panel
  titleElem.innerText = title;
  descElem.innerText = description;
  content.classList.remove('hidden');

  // Apply quick glow flash highlight animation
  displayBox.style.borderColor = "#f39c12";
  setTimeout(() => {
    displayBox.style.borderColor = "rgba(255, 255, 255, 0.08)";
  }, 400);
}

// Attach listeners for owner contact buttons once DOM loads
document.addEventListener("DOMContentLoaded", () => {
  const contactBtn = document.getElementById('btn-contact');
  const upiBtn = document.getElementById('btn-upi');
  const displayPanel = document.getElementById('owner-action-display');

  if(contactBtn && upiBtn && displayPanel) {
    contactBtn.addEventListener('click', () => {
      displayPanel.innerHTML = `<strong>Hotline Phone:</strong> <a href="tel:+919553904524" style="color:#f39c12; text-decoration:none;">+91 9553904524</a><br><small style="color:#aaa;">Tap number to place a direct voice call</small>`;
      displayPanel.classList.remove('hidden');
    });

    upiBtn.addEventListener('click', () => {
      displayPanel.innerHTML = `<strong>UPI Merchant Address:</strong> <code style="background:#222; padding:2px 6px; border-radius:4px; color:#2ecc71;">senthil.kumar@upi</code><br><small style="color:#aaa;">Scan standard merchant QR code at the service counter desk</small>`;
      displayPanel.classList.remove('hidden');
    });
  }
});
