/* ================================================
   SHAID TIWARI — Portfolio
   Animation & Interaction Engine
   ================================================ */

(() => {
  'use strict';

  const lerp = (a, b, t) => a + (b - a) * t;
  const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

  // ──────────────────────────────────────
  // Film Grain Generator
  // ──────────────────────────────────────

  function createGrain() {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.random() * 255;
      imageData.data[i] = v;
      imageData.data[i + 1] = v;
      imageData.data[i + 2] = v;
      imageData.data[i + 3] = 20;
    }
    ctx.putImageData(imageData, 0, 0);
    const grainEl = document.querySelector('.grain');
    if (grainEl) {
      grainEl.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`;
      grainEl.style.backgroundRepeat = 'repeat';
      grainEl.style.opacity = '1';
    }
  }

  // ──────────────────────────────────────
  // Smooth Scroll (Lenis)
  // ──────────────────────────────────────

  let lenis;

  function initSmoothScroll() {
    const p = document.body.dataset.page;
    if (p === 'contact' || p === 'about') return;
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href === '#') {
          lenis.scrollTo(0);
        } else {
          const target = document.querySelector(href);
          if (target) lenis.scrollTo(target, { offset: -50 });
        }
        closeMobileMenu();
      });
    });
  }

  // ──────────────────────────────────────
  // Custom Cursor
  // ──────────────────────────────────────

  function initCursor() {
    if (isTouchDevice()) return;

    const dot = document.getElementById('cursorDot');
    const outline = document.getElementById('cursorOutline');
    if (!dot || !outline) return;

    let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0, visible = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        outline.style.opacity = '1';
      }
    });

    document.addEventListener('mouseleave', () => {
      visible = false;
      dot.style.opacity = '0';
      outline.style.opacity = '0';
    });

    document.querySelectorAll('a, button, .project-card, .skill-category, .cert-item, .magnetic-el').forEach(el => {
      el.addEventListener('mouseenter', () => outline.classList.add('hovering'));
      el.addEventListener('mouseleave', () => outline.classList.remove('hovering'));
    });

    function updateCursor() {
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      outlineX = lerp(outlineX, mouseX, 0.12);
      outlineY = lerp(outlineY, mouseY, 0.12);
      outline.style.left = outlineX + 'px';
      outline.style.top = outlineY + 'px';
      requestAnimationFrame(updateCursor);
    }
    updateCursor();
  }

  // ──────────────────────────────────────
  // Page Transitions
  // ──────────────────────────────────────

  function initPageTransitions() {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || link.target === '_blank') return;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        closeMobileMenu();
        sessionStorage.setItem('pageTransition', 'true');
        gsap.to('main', {
          opacity: 0,
          y: -20,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => { window.location.href = href; }
        });
      });
    });
  }

  // ──────────────────────────────────────
  // Preloader / Page Entry
  // ──────────────────────────────────────

  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const isNavigation = sessionStorage.getItem('pageTransition') === 'true';

    if (isNavigation) {
      // ── Arriving from a nav click ──
      sessionStorage.removeItem('pageTransition');
      if (preloader) preloader.style.display = 'none';
      document.body.style.overflow = '';

      // Hide main and ALL content elements immediately before any paint
      gsap.set('main', { opacity: 0, y: 20 });
      hideContentElements();

      // Fade main in and start animations mid-fade so content appears with the fade
      gsap.to('main', {
        opacity: 1, y: 0,
        duration: 0.45,
        ease: 'power2.out',
        delay: 0.05,
      });
      gsap.delayedCall(0.15, startAnimations);
      return;
    }

    if (!preloader) {
      // ── Subpage direct load ──
      hideContentElements();
      document.body.style.overflow = '';
      gsap.delayedCall(0.15, startAnimations);
      return;
    }

    // ── Homepage: full preloader ──
    hideContentElements();
    const counterEl = preloader.querySelector('.counter-number');
    const progressBar = preloader.querySelector('.preloader-progress');
    const counter = { value: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        preloader.style.display = 'none';
        document.body.style.overflow = '';
        startAnimations();
      }
    });

    document.fonts.ready.then(() => {
      tl.to(counter, {
        value: 100, duration: 1.8, ease: 'power2.inOut',
        onUpdate: () => {
          const val = Math.round(counter.value);
          if (counterEl) counterEl.textContent = val;
          if (progressBar) progressBar.style.width = val + '%';
        }
      })
      .to(preloader, { yPercent: -100, duration: 0.9, ease: 'power3.inOut', delay: 0.2 });
    });
  }

  // Hide ALL elements that will be animated in — called before any fade begins
  // Uses visibility:hidden so layout is preserved but nothing is seen
  function hideContentElements() {
    const page = document.body.dataset.page;

    if (page === 'home') {
      gsap.set('.hero-name .line', { yPercent: 105 });
      gsap.set('.hero-meta', { autoAlpha: 0, y: 30 });
      gsap.set('.scroll-indicator', { autoAlpha: 0, y: 20 });
      return;
    }

    if (page === 'contact' || page === 'about') {
      // Slideshow: hide all slides except first, prep slide 1 content
      gsap.set('.slide:not([data-slide="0"])', { autoAlpha: 0, y: '100%' });
      gsap.set('.slide--hero .line', { yPercent: 105 });
      gsap.set('.slide-label, .slide-hero-subtitle, .slide-scroll-hint', { autoAlpha: 0, y: 30 });
      gsap.set('.slide-nav', { autoAlpha: 0 });
      return;
    }

    // Page hero (all subpages except contact/about)
    gsap.set('.page-hero-title .line', { yPercent: 105 });
    gsap.set('.page-hero-label', { autoAlpha: 0, y: 20 });

    // All scroll-animated content
    if (page === 'experience') {
      gsap.set(['.timeline-card', '.timeline-date', '.timeline-marker', '.timeline-line'], { autoAlpha: 0 });
    } else if (page === 'projects') {
      gsap.set(['.project-card', '.skill-category', '#projects .section-label', '#skills .section-label'], { autoAlpha: 0, y: 30 });
    }
  }

  // ──────────────────────────────────────
  // Master Animation Controller
  // ──────────────────────────────────────

  function startAnimations() {
    const page = document.body.dataset.page;

    if (page === 'home') {
      animateHero();
      animateMarquee();
    } else {
      if (page !== 'contact') animatePageHero();
      if (page === 'about') { animateAbout(); animateEducation(); }
      else if (page === 'experience') { animateTimeline(); }
      else if (page === 'projects') { animateProjects(); animateSkills(); }
      else if (page === 'contact') { animateContact(); }
    }
  }

  // ──────────────────────────────────────
  // Hero Animation
  // ──────────────────────────────────────

  function animateHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero-name .line', { yPercent: 0, duration: 1.4, stagger: 0.2 })
      .to('.hero-meta', { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
      .to('.scroll-indicator', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');

    gsap.to('.hero-name', {
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
      yPercent: 25, opacity: 0.15,
    });
    gsap.to('.scroll-indicator', {
      scrollTrigger: { trigger: '#hero', start: '10% top', end: '25% top', scrub: true },
      autoAlpha: 0,
    });
  }

  // ──────────────────────────────────────
  // Page Hero Animation
  // ──────────────────────────────────────

  function animatePageHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.page-hero-title .line', { yPercent: 0, duration: 1.2, stagger: 0.15 })
      .to('.page-hero-label', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.8');
  }

  // ──────────────────────────────────────
  // Marquee
  // ──────────────────────────────────────

  function animateMarquee() {
    gsap.from('.companies-section', {
      scrollTrigger: { trigger: '.companies-section', start: 'top 95%' },
      autoAlpha: 0, duration: 1, ease: 'power2.out',
    });

    const section = document.querySelector('.companies-section');
    const content = document.querySelector('.companies-section .marquee-content');
    if (!section || !content) return;

    section.classList.add('is-moving');
    const marquee = gsap.to('.companies-section .marquee-track', {
      x: -content.offsetWidth, duration: 15, ease: 'none', repeat: -1,
    });

    section.querySelectorAll('.company-name').forEach(name => {
      name.addEventListener('mouseenter', () => { gsap.to(marquee, { timeScale: 0, duration: 0.5, ease: 'power2.out' }); section.classList.remove('is-moving'); });
      name.addEventListener('mouseleave', () => { gsap.to(marquee, { timeScale: 1, duration: 0.5, ease: 'power2.in' }); section.classList.add('is-moving'); });
    });
  }

  // ──────────────────────────────────────
  // About Section
  // ──────────────────────────────────────

  function animateAbout() {
    gsap.to('#about .section-label', {
      scrollTrigger: { trigger: '#about .section-label', start: 'top 88%', once: true },
      autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out',
    });
    gsap.to('.about-heading h2', {
      scrollTrigger: { trigger: '.about-heading', start: 'top 82%', once: true },
      autoAlpha: 1, y: 0, duration: 1.2, ease: 'power3.out',
    });
    gsap.to('.about-body p', {
      scrollTrigger: { trigger: '.about-body', start: 'top 82%', once: true },
      autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.2,
    });
    gsap.to('.about-stats .stat', {
      scrollTrigger: { trigger: '.about-stats', start: 'top 85%', once: true },
      autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12,
    });

    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const counter = { value: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
          gsap.to(counter, {
            value: target, duration: 1.8, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(counter.value); }
          });
        }
      });
    });
  }

  // ──────────────────────────────────────
  // Timeline Animation (Experience Page)
  // ──────────────────────────────────────

  function animateTimeline() {
    gsap.to('.timeline-line', {
      scrollTrigger: { trigger: '.timeline', start: 'top 85%', once: true },
      autoAlpha: 1, scaleY: 1, transformOrigin: 'top', duration: 1.5, ease: 'power3.out',
    });

    document.querySelectorAll('.timeline-item').forEach((item) => {
      const trigger = { trigger: item, start: 'top 85%', once: true };

      gsap.to(item.querySelector('.timeline-marker'), {
        scrollTrigger: trigger, autoAlpha: 1, scale: 1,
        duration: 0.5, ease: 'back.out(2)', delay: 0.2,
      });
      gsap.to(item.querySelector('.timeline-date'), {
        scrollTrigger: trigger, autoAlpha: 1, x: 0,
        duration: 0.6, ease: 'power3.out',
      });
      gsap.to(item.querySelector('.timeline-card'), {
        scrollTrigger: trigger, autoAlpha: 1, y: 0,
        duration: 0.8, ease: 'power3.out', delay: 0.15,
      });
    });
  }

  // ──────────────────────────────────────
  // Projects Section
  // ──────────────────────────────────────

  function animateProjects() {
    gsap.to('#projects .section-label', {
      scrollTrigger: { trigger: '#projects .section-label', start: 'top 88%', once: true },
      autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out',
    });

    document.querySelectorAll('.project-card').forEach((card) => {
      gsap.to(card, {
        scrollTrigger: { trigger: card, start: 'top 87%', once: true },
        autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out',
      });
    });

    if (!isTouchDevice()) {
      document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
          card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
        });
      });
    }
  }

  // ──────────────────────────────────────
  // Skills Section
  // ──────────────────────────────────────

  function animateSkills() {
    gsap.to('#skills .section-label', {
      scrollTrigger: { trigger: '#skills .section-label', start: 'top 88%', once: true },
      autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out',
    });
    gsap.to('.skill-category', {
      scrollTrigger: { trigger: '.skills-grid', start: 'top 82%', once: true },
      autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out',
      stagger: { amount: 0.6, grid: [2, 4], from: 'start' },
    });
  }

  // ──────────────────────────────────────
  // Education Section
  // ──────────────────────────────────────

  function animateEducation() {
    gsap.to('#education .section-label', {
      scrollTrigger: { trigger: '#education .section-label', start: 'top 88%', once: true },
      autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out',
    });
    gsap.to('.education-degree', {
      scrollTrigger: { trigger: '.education-grid', start: 'top 82%', once: true },
      autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out',
    });
    gsap.to('.cert-item', {
      scrollTrigger: { trigger: '.certifications', start: 'top 85%', once: true },
      autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.15,
    });
  }

  // ──────────────────────────────────────
  // Contact Section — Full-Page Slideshow
  // ──────────────────────────────────────

  function animateContact() {
    // Entrance animation for Slide 1
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.slide--hero .line', { yPercent: 0, duration: 1.2, stagger: 0.15 })
      .to('.slide-label', { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.8')
      .to('.slide-hero-subtitle', { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.5')
      .to('.slide-scroll-hint', { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to('.slide-nav', { autoAlpha: 1, duration: 0.6 }, '-=0.4');

    initSlideshow();
  }

  function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slide-nav-dot');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let isAnimating = false;
    const DURATION = 1.0;

    // Spotlight effect on contact cards
    if (!isTouchDevice()) {
      document.querySelectorAll('.slide-contact-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
          card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
        });
      });
    }

    function goToSlide(index, direction) {
      if (isAnimating || index === currentSlide || index < 0 || index >= totalSlides) return;
      isAnimating = true;

      const current = slides[currentSlide];
      const next = slides[index];
      const dir = direction || (index > currentSlide ? 1 : -1);

      // Kill any existing tweens on both slides to prevent conflicts
      gsap.killTweensOf(current);
      gsap.killTweensOf(next);

      // Update dots
      dots[currentSlide].classList.remove('active');
      dots[index].classList.add('active');

      // Prepare next slide offscreen
      gsap.set(next, { autoAlpha: 1, y: dir === 1 ? '100%' : '-100%' });
      next.classList.add('is-active');

      // Hide scroll hint on slide 1 when leaving
      if (currentSlide === 0) {
        gsap.to('.slide-scroll-hint', { autoAlpha: 0, duration: 0.3 });
      }

      // Animate out current
      gsap.to(current, {
        y: dir === 1 ? '-30%' : '30%',
        autoAlpha: 0,
        duration: DURATION,
        ease: 'power3.inOut',
      });

      // Animate in next
      gsap.to(next, {
        y: '0%',
        autoAlpha: 1,
        duration: DURATION,
        ease: 'power3.inOut',
        onComplete: () => {
          current.classList.remove('is-active');
          gsap.set(current, { autoAlpha: 0 });
          currentSlide = index;
          isAnimating = false;
          animateSlideContent(index);
        }
      });

      // Parallax on inner content
      const inner = next.querySelector('.slide-inner');
      if (inner) {
        gsap.fromTo(inner,
          { y: dir === 1 ? 60 : -60 },
          { y: 0, duration: DURATION * 1.1, ease: 'power3.out' }
        );
      }
    }

    function animateSlideContent(index) {
      if (index === 1) {
        gsap.fromTo('.slide-contact-card',
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1 }
        );
      } else if (index === 2) {
        gsap.fromTo('.slide--form .form-group, .slide--form .form-row, .slide--form .form-submit, .slide--form .slide-section-label',
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08 }
        );
      }
    }

    // Wheel navigation (debounced)
    let wheelCooldown = false;
    document.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (wheelCooldown || isAnimating) return;
      wheelCooldown = true;
      setTimeout(() => { wheelCooldown = false; }, 800);

      const dir = e.deltaY > 0 ? 1 : -1;
      goToSlide(currentSlide + dir, dir);
    }, { passive: false });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (isAnimating) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToSlide(currentSlide + 1, 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToSlide(currentSlide - 1, -1);
      }
    });

    // Touch swipe navigation
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        goToSlide(currentSlide + (diff > 0 ? 1 : -1), diff > 0 ? 1 : -1);
      }
    }, { passive: true });

    // Dot click navigation
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const target = parseInt(dot.dataset.target, 10);
        goToSlide(target);
      });
    });
  }

  // ──────────────────────────────────────
  // Magnetic Elements
  // ──────────────────────────────────────

  function initMagnetics() {
    if (isTouchDevice()) return;

    document.querySelectorAll('.magnetic-el').forEach(el => {
      const strength = parseFloat(el.dataset.strength) || 20;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * (strength / 100), y: y * (strength / 100), duration: 0.4, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  // ──────────────────────────────────────
  // Navigation
  // ──────────────────────────────────────

  function initNav() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScrollY = 0, scrollDelta = 0;
    const THRESHOLD = 80;

    function updateNav() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const diff = scrollY - lastScrollY;
      scrollDelta = diff > 0 ? Math.max(0, scrollDelta) + diff : Math.min(0, scrollDelta) + diff;

      if (scrollDelta > THRESHOLD && scrollY > 200) { header.classList.add('hidden'); scrollDelta = 0; }
      if (scrollDelta < -THRESHOLD) { header.classList.remove('hidden'); scrollDelta = 0; }
      if (scrollY < 100) header.classList.remove('hidden');
      header.classList.toggle('scrolled', scrollY > 50);
      lastScrollY = scrollY;
    }

    window.addEventListener('scroll', updateNav, { passive: true });
  }

  // ──────────────────────────────────────
  // Mobile Menu
  // ──────────────────────────────────────

  let mobileMenuOpen = false;

  function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => mobileMenuOpen ? closeMobileMenu() : openMobileMenu());
  }

  function openMobileMenu() {
    mobileMenuOpen = true;
    document.querySelector('.nav-toggle')?.classList.add('active');
    document.getElementById('mobileMenu')?.classList.add('open');
    if (lenis) lenis.stop();
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
    document.querySelector('.nav-toggle')?.classList.remove('active');
    const menu = document.getElementById('mobileMenu');
    if (menu) {
      menu.classList.remove('open');
      menu.querySelectorAll('.mobile-link').forEach(link => { link.style.transitionDelay = '0s'; });
    }
    if (lenis) lenis.start();
  }

  // ──────────────────────────────────────
  // Initialization
  // ──────────────────────────────────────

  function init() {
    document.body.style.overflow = 'hidden';
    // Remove CSS pre-hide immediately — GSAP takes over opacity via inline styles
    document.documentElement.removeAttribute('data-transitioning');
    gsap.registerPlugin(ScrollTrigger);
    initSmoothScroll();
    createGrain();
    initCursor();
    initNav();
    initMobileMenu();
    initMagnetics();
    initPreloader();
    initPageTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
