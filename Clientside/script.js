const links = document.querySelectorAll('nav.sidebar a[data-section]');
const sections = document.querySelectorAll('.content-section');

function showSection(id) {
  // Hide all sections
  sections.forEach(sec => sec.classList.remove('active'));

  // Remove active state from links
  links.forEach(a => a.classList.remove('active'));

  // Show the selected section
  const activeSection = document.getElementById(id);
  if (activeSection) activeSection.classList.add('active');

  // Highlight the corresponding link
  const activeLink = document.querySelector(`nav.sidebar a[data-section="${id}"]`);
  if (activeLink) activeLink.classList.add('active');
}

links.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-section');
    if (!target) return;
    // Update hash without jumping
    history.replaceState(null, '', `#${target}`);
    showSection(target);
  });
});

// On load, open section from hash or default to first
window.addEventListener('DOMContentLoaded', () => {
  const hash = (location.hash || '').replace('#', '');
  if (hash && document.getElementById(hash)) {
    showSection(hash);
  } else if (sections.length) {
    const first = sections[0].id;
    showSection(first);
  }
});