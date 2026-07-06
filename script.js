// ===== Loader =====
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hide');
});

// ===== Theme (applied before partials load to avoid a flash) =====
(function initTheme() {
  const saved = localStorage.getItem('nlc-theme');
  if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
})();

// ===== Load shared nav + footer partials, then wire up everything that depends on them =====
async function loadPartials() {
  const navSlot = document.getElementById('nav-placeholder');
  const footerSlot = document.getElementById('footer-placeholder');
  try {
    if (navSlot) {
      const res = await fetch('partials/nav.html');
      navSlot.outerHTML = await res.text();
    }
    if (footerSlot) {
      const res = await fetch('partials/footer.html');
      footerSlot.outerHTML = await res.text();
    }
  } catch (err) {
    console.error('Could not load shared nav/footer. Run this through a local server (VS Code Live Server), not by opening the file directly.', err);
  }
  initNavAndChrome();
}
document.addEventListener('DOMContentLoaded', loadPartials);

function initNavAndChrome() {
  document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());
  const docketYear = document.getElementById('docketYear');
  if (docketYear) docketYear.textContent = new Date().getFullYear();

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
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
  }

  const currentPage = document.body.dataset.page;
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === currentPage);
  });

  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
    }));
  }

  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const scrollProgress = document.getElementById('scrollProgress');

  function onScroll() {
    if (scrollProgress) {
      const h = document.documentElement;
      const scrolled = h.scrollHeight > h.clientHeight ? (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 : 0;
      scrollProgress.style.width = scrolled + '%';
    }
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
    if (backToTop) backToTop.classList.toggle('show', window.scrollY > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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

  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) setTimeout(() => window.scrollTo({ top: target.offsetTop - 90, behavior: 'smooth' }), 200);
  }

  initPageBehaviors();
}

// ===== Guarded so the same script.js works across every page =====
function initPageBehaviors() {

  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  const counters = document.querySelectorAll('.docket-num');
  if (counters.length) {
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
  }

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.4}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsWrap = document.getElementById('sliderDots');
  if (slides.length && dotsWrap) {
    let current = 0;
    let sliderTimer;
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('.dot');
    function goToSlide(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
      resetSliderTimer();
    }
    function resetSliderTimer() {
      clearInterval(sliderTimer);
      sliderTimer = setInterval(() => goToSlide(current + 1), 6000);
    }
    const nextBtn = document.getElementById('nextSlide');
    const prevBtn = document.getElementById('prevSlide');
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(current + 1));
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(current - 1));
    resetSliderTimer();
  }

  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
  const faqSearch = document.getElementById('faqSearch');
  if (faqSearch) {
    faqSearch.addEventListener('input', () => {
      const q = faqSearch.value.trim().toLowerCase();
      faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.hidden = q.length > 0 && !text.includes(q);
      });
    });
  }

  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterables = document.querySelectorAll('[data-category]');
  const insightSearch = document.getElementById('insightSearch');

  function applyFilters() {
    const activeBtn = document.querySelector('.filter-btn.active');
    const category = activeBtn ? activeBtn.dataset.filter : 'all';
    const q = insightSearch ? insightSearch.value.trim().toLowerCase() : '';
    let visibleCount = 0;
    filterables.forEach(card => {
      const matchesCategory = category === 'all' || card.dataset.category === category;
      const matchesSearch = !q || card.textContent.toLowerCase().includes(q);
      const show = matchesCategory && matchesSearch;
      card.hidden = !show;
      if (show) visibleCount++;
    });
    const noResults = document.getElementById('noResults');
    if (noResults) noResults.hidden = visibleCount > 0;
  }

  if (filterBtns.length && filterables.length) {
    filterBtns.forEach(btn => btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    }));
  }
  if (insightSearch) insightSearch.addEventListener('input', applyFilters);

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      input.value = '';
      input.placeholder = 'Subscribed ✓';
      setTimeout(() => { input.placeholder = 'Your email'; }, 3000);
    });
  }

  const form = document.getElementById('consultationForm');
  const submitBtn = document.getElementById('submitBtn');
  const dateField = document.getElementById('preferredDate');
  if (dateField) dateField.min = new Date().toISOString().split('T')[0];

  if (form && submitBtn) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const service = document.getElementById('service').value;
      const message = document.getElementById('message').value.trim();
      if (!name || !email || !service || !message) return;

      // Front-end-only demo state. To actually deliver messages / bookings,
      // POST this data to the backend (see backend/routes/contact.js and appointments.js).
      submitBtn.disabled = true;
      form.classList.add('sent');
      setTimeout(() => {
        form.reset();
        form.classList.remove('sent');
        submitBtn.disabled = false;
      }, 2600);
    });
  }
}
