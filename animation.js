// animations.js - Handles animations for the Daniele Pauli Coaching website

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Create particle effects
  createParticles();
  
  // Fade in content
  fadeInContent();
  
  // Initialize smooth scrolling for the arrow
  initSmoothScroll();
});

/**
 * Creates floating particles in the background
 */
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  // Create 20 particles
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random size between 4px and 8px
    const size = 4 + Math.random() * 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random horizontal position
    particle.style.left = `${Math.random() * 100}%`;
    
    // Random animation delay
    particle.style.animationDelay = `${Math.random() * 10}s`;
    
    particlesContainer.appendChild(particle);
  }
}

/**
 * Fades in the content with a delay
 */
function fadeInContent() {
  const content = document.querySelector('.content');
  if (!content) return;
  
  // Set initial opacity
  content.style.opacity = '0';
  content.style.transform = 'translateY(20px)';
  content.style.transition = 'opacity 1.5s ease, transform 1.5s ease';
  
  // Delay the fade in for a better effect
  setTimeout(() => {
    content.style.opacity = '1';
    content.style.transform = 'translateY(0)';
  }, 300);
}

/**
 * Initializes smooth scrolling for the down arrow
 */
function initSmoothScroll() {
  const scrollArrow = document.querySelector('.scroll-indicator');
  if (!scrollArrow) return;
  
  scrollArrow.addEventListener('click', () => {
    // Get the height of the viewport
    const viewportHeight = window.innerHeight;
    
    // Scroll to the next section smoothly
    window.scrollTo({
      top: viewportHeight,
      behavior: 'smooth'
    });
  });
}
