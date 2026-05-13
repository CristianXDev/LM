// Navbar scroll behavior
const navbar = document.getElementById("navbar");
const collapseNav = document.getElementById("navbarNav");
let isScrolled = false;

// Scroll handler for navbar
window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 50 && !isScrolled) {
      navbar.classList.add("scrolled");
      isScrolled = true;
    } else if (window.scrollY <= 50 && isScrolled) {
      // Only remove if mobile menu is not open
      if (!collapseNav || !collapseNav.classList.contains("show")) {
        navbar.classList.remove("scrolled");
        isScrolled = false;
      }
    }
  },
  { passive: true },
);

// Mobile menu open/close handler
if (collapseNav) {
  collapseNav.addEventListener("shown.bs.collapse", () => {
    navbar.classList.add("scrolled");
    isScrolled = true;
  });
  collapseNav.addEventListener("hidden.bs.collapse", () => {
    // Remove scrolled style only if page is near top
    if (window.scrollY <= 50) {
      navbar.classList.remove("scrolled");
      isScrolled = false;
    }
  });
}

// Init canvas and particles
const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d");
let particles = [];

// Initialize particles and canvas size
function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    });
  }
}

// Draw animation frame
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1A1A1A";
  ctx.strokeStyle = "rgba(26, 26, 26, 0.03)";

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      let p2 = particles[j];
      let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
      if (dist < 180) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(draw);
}

// Handle window resize
window.addEventListener("resize", init);
init();
draw();
