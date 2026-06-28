// Dynamic Section Controller
function switchView(sectionId, clickedElement) {
  // 1. Hide all main content views
  const sections = document.querySelectorAll('.app-section');
  sections.forEach(section => {
    section.classList.remove('active-view');
  });
  
  // 2. Project target section into visibility
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active-view');
  }

  // 3. Reset styling for BOTH Desktop Sidebar and Mobile Bottom Dock buttons
  const allNavButtons = document.querySelectorAll('.side-item, .nav-btn');
  allNavButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // 4. Highlight current selection across the app interface layout matches
  // Identifies button pairings automatically by matching item string titles
  const targetLabel = clickedElement.innerText || clickedElement.querySelector('span').innerText;
  allNavButtons.forEach(btn => {
    const btnLabel = btn.innerText || btn.querySelector('span').innerText;
    if(btnLabel.trim().toLowerCase() === targetLabel.trim().toLowerCase()) {
      btn.classList.add('active');
    }
  });
  
  // Shift window view smoothly back up to zero-line coordinates
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Services Live Display Unit Controller
function showService(title, descriptiveText) {
  const placeholder = document.getElementById('monitor-placeholder');
  const dataBlock = document.getElementById('monitor-data');
  const titleBox = document.getElementById('monitor-title');
  const descBox = document.getElementById('monitor-desc');

  if(placeholder) placeholder.classList.add('hidden');
  
  titleBox.innerText = title;
  descBox.innerText = descriptiveText;
  dataBlock.classList.remove('hidden');
}

// UPI Panel Display Layer Toggle Switcher
function toggleUpi() {
  const upiPanel = document.getElementById('upi-display');
  upiPanel.classList.toggle('hidden');
}
