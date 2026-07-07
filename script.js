// ===== Loader =====
window.addEventListener('load', () => {
  document.getElementById('loader').classList.add('hide');
});

// ===== Year stamps =====
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('docketYear').textContent = new Date().getFullYear();

// ===== Theme toggle (persisted) =====
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('nlc-theme');
if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');

themeToggle.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (isLight) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('nlc-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('nlc-theme', 'light');
  }
});

// ===== Scroll progress bar =====
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  scrollProgress.style.width = scrolled + '%';
}

// ===== Navbar chrome: scrolled state + back-to-top =====
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

function onChromeScroll() {
  updateScrollProgress();
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('show', window.scrollY > 500);
}
window.addEventListener('scroll', onChromeScroll, { passive: true });
onChromeScroll();
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== Mobile menu =====
const menuToggle = document.getElementById('menuToggle');
const navCenter = document.querySelector('.nav-center');
menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navCenter.classList.toggle('active');
});
document.querySelectorAll('.nav-link[href^="#"]').forEach(link => link.addEventListener('click', () => {
  menuToggle.classList.remove('active');
  navCenter.classList.remove('active');
}));

// ===== "Work" dropdown =====
const workDropdown = document.getElementById('workDropdown');
const dropdownTrigger = document.getElementById('dropdownTrigger');

dropdownTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = workDropdown.classList.toggle('open');
  dropdownTrigger.setAttribute('aria-expanded', isOpen);
});
document.addEventListener('click', (e) => {
  if (!workDropdown.contains(e.target)) {
    workDropdown.classList.remove('open');
    dropdownTrigger.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    workDropdown.classList.remove('open');
    dropdownTrigger.setAttribute('aria-expanded', 'false');
  }
});

// ===== Smooth scroll for in-page anchors =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 90, behavior: 'smooth' });
  });
});

// ===== Scrollspy + sliding nav indicator =====
// Maps each page section to the nav element that should highlight for it.
// Attorneys / Case Studies / Insights all live under the "Work" dropdown trigger.
const navIndicator = document.getElementById('navIndicator');
const topLevelLinks = document.querySelectorAll('.nav-links > li > .nav-link, .nav-links > li > .dropdown-trigger');
const sectionMap = { about: 'about', practice: 'practice', attorneys: 'work', cases: 'work', insights: 'work', contact: 'contact' };
const spySections = document.querySelectorAll('section[id]');

function moveIndicator(targetEl) {
  if (!targetEl) { navIndicator.classList.remove('show'); return; }
  const navLinksRect = targetEl.closest('.nav-links').getBoundingClientRect();
  const rect = targetEl.getBoundingClientRect();
  navIndicator.style.width = rect.width + 'px';
  navIndicator.style.transform = `translateX(${rect.left - navLinksRect.left - 6}px)`;
  navIndicator.classList.add('show');
}

function setActiveNav(key) {
  let activeEl = null;
  topLevelLinks.forEach(link => {
    const isDropdown = link.classList.contains('dropdown-trigger');
    const linkKey = isDropdown ? 'work' : link.dataset.section;
    const isActive = linkKey === key;
    link.classList.toggle('active', isActive);
    if (isActive) activeEl = link;
  });
  moveIndicator(activeEl);
}

function scrollSpy() {
  // Only run once sections exist and we're past the hero.
  let current = null;
  spySections.forEach(section => {
    const top = section.offsetTop - 150;
    if (window.scrollY >= top) current = section.id;
  });
  const key = sectionMap[current];
  if (key) setActiveNav(key);
  else navIndicator.classList.remove('show');
}
window.addEventListener('scroll', scrollSpy, { passive: true });
window.addEventListener('resize', scrollSpy);
window.addEventListener('load', () => setTimeout(scrollSpy, 300));
scrollSpy();

// ===== Scroll reveal (IntersectionObserver) =====
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ===== Animated docket counters =====
const counters = document.querySelectorAll('.docket-num');
function animateCounter(el) {
  const target = +el.dataset.target;
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
counters.forEach(c => counterObserver.observe(c));

// ===== Magnetic buttons =====
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.4}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ===== Testimonial slider =====
const slides = document.querySelectorAll('.testimonial-slide');
const dotsWrap = document.getElementById('sliderDots');
let currentSlide = 0;
let sliderTimer;

slides.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => goToSlide(i));
  dotsWrap.appendChild(dot);
});
const dots = dotsWrap.querySelectorAll('.dot');

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
  resetSliderTimer();
}
function resetSliderTimer() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 6000);
}
document.getElementById('nextSlide').addEventListener('click', () => goToSlide(currentSlide + 1));
document.getElementById('prevSlide').addEventListener('click', () => goToSlide(currentSlide - 1));
resetSliderTimer();

// ===== FAQ accordion + search =====
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    faqItems.forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});
const faqSearch = document.getElementById('faqSearch');
faqSearch.addEventListener('input', () => {
  const q = faqSearch.value.trim().toLowerCase();
  faqItems.forEach(item => {
    item.hidden = q.length > 0 && !item.textContent.toLowerCase().includes(q);
  });
});

// ===== Case studies filter =====
const caseFilterBtns = document.querySelectorAll('#cases .filter-btn');
const caseCards = document.querySelectorAll('#caseGrid .result-card');
caseFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    caseFilterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    let visible = 0;
    caseCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.hidden = !show;
      if (show) visible++;
    });
    document.getElementById('noResultsCases').hidden = visible > 0;
  });
});

// ===== Insights search + filter =====
const insightFilterBtns = document.querySelectorAll('#insights .filter-btn');
const insightCards = document.querySelectorAll('#insightsGrid .insight-card');
const insightSearch = document.getElementById('insightSearch');

function applyInsightFilters() {
  const activeBtn = document.querySelector('#insights .filter-btn.active');
  const category = activeBtn ? activeBtn.dataset.filter : 'all';
  const q = insightSearch.value.trim().toLowerCase();
  let visible = 0;
  insightCards.forEach(card => {
    const matchesCategory = category === 'all' || card.dataset.category === category;
    const matchesSearch = !q || card.textContent.toLowerCase().includes(q);
    const show = matchesCategory && matchesSearch;
    card.hidden = !show;
    if (show) visible++;
  });
  document.getElementById('noResultsInsights').hidden = visible > 0;
}
insightFilterBtns.forEach(btn => btn.addEventListener('click', () => {
  insightFilterBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyInsightFilters();
}));
insightSearch.addEventListener('input', applyInsightFilters);

// ===== Newsletter form (front-end only demo) =====
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  input.value = '';
  input.placeholder = 'Subscribed ✓';
  setTimeout(() => { input.placeholder = 'Your email'; }, 3000);
});

// ===== Consultation / booking form =====
const form = document.getElementById('consultationForm');
const submitBtn = document.getElementById('submitBtn');
const dateField = document.getElementById('preferredDate');
dateField.min = new Date().toISOString().split('T')[0];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const service = document.getElementById('service').value;
  const message = document.getElementById('message').value.trim();
  if (!name || !email || !service || !message) return;

  // Front-end-only demo state. To actually deliver messages / bookings,
  // POST this data to the backend — see backend/routes/contact.js and appointments.js.
  submitBtn.disabled = true;
  form.classList.add('sent');
  setTimeout(() => {
    form.reset();
    form.classList.remove('sent');
    submitBtn.disabled = false;
  }, 2600);
});
