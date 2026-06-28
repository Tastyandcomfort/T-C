function setActiveNav(element) {
  // Find all nav navigation items
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  
  // Remove the active color state from all links
  navItems.forEach(item => {
    item.classList.remove('active');
  });
  
  // Apply active highlight to the clicked button
  element.classList.add('active');
}
