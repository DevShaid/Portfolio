/* ================================================
   SHAID TIWARI — Portfolio
   Animation & Interaction Engine
   ================================================ */

(() => {
  'use strict';

  // ──────────────────────────────────────
  // Utilities
  // ──────────────────────────────────────

  const lerp = (a, b, t) => a + (b - a) * t;
  const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

  function splitTextIntoChars(element) {
    const text = element.textContent;
    element.setAttribute('aria-label', text);
    element.innerHTML = text.split('').map(char =>
      char === ' '
        ? ' '
        : `<span class="char-wrap"><span class="char">${char}</span></span>`
    ).join('');
    return element.querySelectorAll('.char');
  }

  function splitTextIntoWords(element) {
    const html = element.innerHTML;
    const words = html.split(/\s+/).filter(Boolean);
    element.innerHTML = words.map(word =>
      word.startsWith('<br') ? word : `<span class="word-wrap"><span class="word">${word}</span></span>`
    ).join(' ');
    return element.querySelectorAll('.word');
  }

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
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Anchor links smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href === '#') {
          lenis.scrollTo(0);
        } else {
          const target = document.querySelector(href);
          if (target) {
            lenis.scrollTo(target, { offset: -50 });
          }
        }
        closeMobileMenu();
      });
    });
  }

  // ──────────────────────────────────────
  // GSAP & ScrollTrigger Setup
  // ──────────────────────────────────────

  function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ──────────────────────────────────────
  // Custom Cursor
  // ──────────────────────────────────────

  function initCursor() {
    if (isTouchDevice()) return;

    const dot = document.getElementById('cursorDot');
    const outline = document.getElementById('cursorOutline');
    if (!dot || !outline) return;

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    let visible = false;

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

    const hoverables = document.querySelectorAll('a, button, .project-card, .skill-category, .cert-item, .magnetic-el');
    hoverables.forEach(el => {
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
  // Preloader
  // ──────────────────────────────────────

  function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) {
      // Subpages: set initial states for page hero, then animate
      gsap.set('.page-hero-title .line', { yPercent: 105 });
      gsap.set('.page-hero-label', { opacity: 0, y: 20 });
      document.body.style.overflow = '';
      gsap.delayedCall(0.15, startAnimations);
      return;
    }

    const counterEl = preloader.querySelector('.counter-number');
    const progressBar = preloader.querySelector('.preloader-progress');
    const counter = { value: 0 };

    // Hide everything before preloader finishes
    gsap.set('.hero-name .line', { yPercent: 105 });
    gsap.set('.hero-meta', { opacity: 0, y: 30 });
    gsap.set('.scroll-indicator', { opacity: 0, y: 20 });

    const tl = gsap.timeline({
      onComplete: () => {
        preloader.style.display = 'none';
        document.body.style.overflow = '';
        startAnimations();
      }
    });

    document.fonts.ready.then(() => {
      tl.to(counter, {
        value: 100,
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          const val = Math.round(counter.value);
          if (counterEl) counterEl.textContent = val;
          if (progressBar) progressBar.style.width = val + '%';
        }
      })
      .to(preloader, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power3.inOut',
        delay: 0.2
      });
    });
  }

  // ──────────────────────────────────────
  // Master Animation Controller
  // ──────────────────────────────────────

  function startAnimations() {
    const page = document.body.dataset.page;

    if (page === 'home') {
      animateHero();
      animateMarquee();
      animateSkills();
    } else {
      animatePageHero();

      if (page === 'about') {
        animateAbout();
        animateEducation();
      } else if (page === 'experience') {
        animateTimeline();
      } else if (page === 'projects') {
        animateProjects();
      } else if (page === 'contact') {
        animateContact();
      }
    }
  }

  // ──────────────────────────────────────
  // Hero Animation
  // ──────────────────────────────────────

  function animateHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Slide up hero name lines from behind mask
    tl.to('.hero-name .line', {
      yPercent: 0,
      duration: 1.4,
      stagger: 0.2,
      ease: 'power4.out',
    })
    // Fade in meta (roles + tagline)
    .to('.hero-meta', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.7')
    // Fade in scroll indicator
    .to('.scroll-indicator', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.5');

    // Parallax: hero name moves up and fades as you scroll
    gsap.to('.hero-name', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
      yPercent: 25,
      opacity: 0.15,
    });

    // Scroll indicator fades out
    gsap.to('.scroll-indicator', {
      scrollTrigger: {
        trigger: '#hero',
        start: '10% top',
        end: '25% top',
        scrub: true,
      },
      opacity: 0,
    });
  }

  // ──────────────────────────────────────
  // Page Hero Animation (Subpages)
  // ──────────────────────────────────────

  function animatePageHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.to('.page-hero-title .line', {
      yPercent: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power4.out',
    })
    .to('.page-hero-label', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.8');
  }

  // ──────────────────────────────────────
  // Marquee
  // ──────────────────────────────────────

  function animateMarquee() {
    gsap.from('.companies-section', {
      scrollTrigger: {
        trigger: '.companies-section',
        start: 'top 95%',
      },
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
    });
  }

  // ──────────────────────────────────────
  // About Section
  // ──────────────────────────────────────

  function animateAbout() {
    // Section label
    gsap.from('#about .section-label', {
      scrollTrigger: { trigger: '#about .section-label', start: 'top 88%' },
      opacity: 0,
      x: -40,
      duration: 0.8,
      ease: 'power3.out',
    });

    // Heading — dramatic clip-path reveal
    gsap.from('.about-heading h2', {
      scrollTrigger: { trigger: '.about-heading', start: 'top 82%' },
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power3.out',
    });

    // Body paragraphs — fade up one by one
    gsap.from('.about-body p', {
      scrollTrigger: { trigger: '.about-body', start: 'top 82%' },
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.2,
    });

    // Stats — staggered entrance
    gsap.from('.about-stats .stat', {
      scrollTrigger: { trigger: '.about-stats', start: 'top 85%' },
      opacity: 0,
      y: 50,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
    });

    // Stat number counting
    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const counter = { value: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            value: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(counter.value);
            }
          });
        }
      });
    });
  }

  // ──────────────────────────────────────
  // Experience Section
  // ──────────────────────────────────────

  function animateExperience() {
    // Section label
    gsap.from('#experience .section-label', {
      scrollTrigger: { trigger: '#experience .section-label', start: 'top 88%' },
      opacity: 0,
      x: -40,
      duration: 0.8,
      ease: 'power3.out',
    });

    // Each experience item
    document.querySelectorAll('.experience-item').forEach((item) => {
      const trigger = { trigger: item, start: 'top 85%' };

      // Border line draws in
      gsap.from(item.querySelector('.exp-border-anim'), {
        scrollTrigger: trigger,
        scaleX: 0,
        duration: 1,
        ease: 'power3.inOut',
      });

      // Whole item fades up (children inherit visibility)
      gsap.from(item, {
        scrollTrigger: trigger,
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
      });

      // Bullet points slide in (x only, no opacity — parent handles visibility)
      gsap.from(item.querySelectorAll('.exp-details li'), {
        scrollTrigger: trigger,
        x: -20,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.04,
        delay: 0.3,
      });
    });
  }

  // ──────────────────────────────────────
  // Timeline Animation (Experience Page)
  // ──────────────────────────────────────

  function animateTimeline() {
    // Timeline line grows downward
    gsap.from('.timeline-line', {
      scrollTrigger: { trigger: '.timeline', start: 'top 85%' },
      scaleY: 0,
      transformOrigin: 'top',
      duration: 1.5,
      ease: 'power3.out',
    });

    // Each timeline item
    document.querySelectorAll('.timeline-item').forEach((item) => {
      const trigger = { trigger: item, start: 'top 85%' };

      // Marker pops in
      gsap.from(item.querySelector('.timeline-marker'), {
        scrollTrigger: trigger,
        scale: 0,
        duration: 0.5,
        ease: 'back.out(2)',
        delay: 0.2,
      });

      // Date fades in
      gsap.from(item.querySelector('.timeline-date'), {
        scrollTrigger: trigger,
        opacity: 0,
        x: -20,
        duration: 0.6,
        ease: 'power3.out',
      });

      // Card slides up and fades in
      gsap.from(item.querySelector('.timeline-card'), {
        scrollTrigger: trigger,
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.15,
      });

      // Bullet points slide in (x only — card handles opacity)
      gsap.from(item.querySelectorAll('.timeline-details li'), {
        scrollTrigger: trigger,
        x: -20,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.04,
        delay: 0.4,
      });
    });
  }

  // ──────────────────────────────────────
  // Projects Section
  // ──────────────────────────────────────

  function animateProjects() {
    // Section label
    gsap.from('#projects .section-label', {
      scrollTrigger: { trigger: '#projects .section-label', start: 'top 88%' },
      opacity: 0,
      x: -40,
      duration: 0.8,
      ease: 'power3.out',
    });

    // Each project card
    document.querySelectorAll('.project-card').forEach((card, i) => {
      const trigger = { trigger: card, start: 'top 87%' };

      // Card slides up and fades in
      gsap.from(card, {
        scrollTrigger: trigger,
        opacity: 0,
        y: 70,
        duration: 1,
        ease: 'power3.out',
      });

      // Tags scale in (no opacity — parent handles it)
      gsap.from(card.querySelectorAll('.project-tags span'), {
        scrollTrigger: trigger,
        scale: 0.8,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.05,
        delay: 0.35,
      });
    });

    // Spotlight effect on hover
    if (!isTouchDevice()) {
      document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--mouse-x', x + '%');
          card.style.setProperty('--mouse-y', y + '%');
        });
      });
    }
  }

  // ──────────────────────────────────────
  // Skills Section
  // ──────────────────────────────────────

  function animateSkills() {
    // Section label
    gsap.from('#skills .section-label', {
      scrollTrigger: { trigger: '#skills .section-label', start: 'top 88%' },
      opacity: 0,
      x: -40,
      duration: 0.8,
      ease: 'power3.out',
    });

    // Skill categories — staggered grid reveal
    gsap.from('.skill-category', {
      scrollTrigger: { trigger: '.skills-grid', start: 'top 82%' },
      opacity: 0,
      y: 50,
      scale: 0.95,
      duration: 0.7,
      ease: 'power3.out',
      stagger: {
        amount: 0.6,
        grid: [2, 4],
        from: 'start',
      },
    });

    // Individual skill items slide up (no opacity — parent handles visibility)
    document.querySelectorAll('.skill-category').forEach(cat => {
      gsap.from(cat.querySelectorAll('.skill-items span'), {
        scrollTrigger: { trigger: cat, start: 'top 80%' },
        y: 12,
        scale: 0.9,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.03,
        delay: 0.3,
      });
    });
  }

  // ──────────────────────────────────────
  // Education Section
  // ──────────────────────────────────────

  function animateEducation() {
    // Section label
    gsap.from('#education .section-label', {
      scrollTrigger: { trigger: '#education .section-label', start: 'top 88%' },
      opacity: 0,
      x: -40,
      duration: 0.8,
      ease: 'power3.out',
    });

    // Degree
    gsap.from('.education-degree', {
      scrollTrigger: { trigger: '.education-grid', start: 'top 82%' },
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power3.out',
    });

    // Certification items stagger in
    gsap.from('.cert-item', {
      scrollTrigger: { trigger: '.certifications', start: 'top 85%' },
      opacity: 0,
      x: 30,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.15,
    });
  }

  // ──────────────────────────────────────
  // Contact Section
  // ──────────────────────────────────────

  function animateContact() {
    // Intro text
    gsap.from('.contact-intro', {
      scrollTrigger: { trigger: '.contact-intro', start: 'top 88%' },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
    });

    // Contact links stagger in
    gsap.from('.contact-links-list .contact-link', {
      scrollTrigger: { trigger: '.contact-links-list', start: 'top 88%' },
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.1,
    });

    // Form groups stagger in
    gsap.from('.form-group', {
      scrollTrigger: { trigger: '.contact-form', start: 'top 85%' },
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.1,
    });

    // Submit button
    gsap.from('.form-submit', {
      scrollTrigger: { trigger: '.form-submit', start: 'top 92%' },
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out',
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
        gsap.to(el, {
          x: x * (strength / 100),
          y: y * (strength / 100),
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  // ──────────────────────────────────────
  // Navigation (fixed: scroll threshold)
  // ──────────────────────────────────────

  function initNav() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScrollY = 0;
    let scrollDelta = 0;
    const THRESHOLD = 80; // px of scroll before toggling

    function updateNav() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const diff = scrollY - lastScrollY;

      // Accumulate scroll delta in current direction
      if (diff > 0) {
        scrollDelta = Math.max(0, scrollDelta) + diff;
      } else {
        scrollDelta = Math.min(0, scrollDelta) + diff;
      }

      // Only hide after scrolling down more than threshold
      if (scrollDelta > THRESHOLD && scrollY > 200) {
        header.classList.add('hidden');
        scrollDelta = 0;
      }
      // Only show after scrolling up more than threshold
      if (scrollDelta < -THRESHOLD) {
        header.classList.remove('hidden');
        scrollDelta = 0;
      }

      // Always show at top
      if (scrollY < 100) {
        header.classList.remove('hidden');
      }

      // Background on scroll
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

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

    toggle.addEventListener('click', () => {
      mobileMenuOpen ? closeMobileMenu() : openMobileMenu();
    });
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
      menu.querySelectorAll('.mobile-link').forEach(link => {
        link.style.transitionDelay = '0s';
      });
    }
    if (lenis) lenis.start();
  }

  // ──────────────────────────────────────
  // Initialization
  // ──────────────────────────────────────

  function init() {
    document.body.style.overflow = 'hidden';

    initGSAP();
    initSmoothScroll();
    createGrain();
    initCursor();
    initNav();
    initMobileMenu();
    initMagnetics();
    initPreloader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
