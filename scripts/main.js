/**
 * Nirvaan Kohli — Main Script
 * Lenis smooth scroll + scroll animations
 */

(function() {
  'use strict';

  // ============================================
  // Lenis Smooth Scroll (overclock.co style)
  // ============================================
  
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // ============================================
  // Scroll Progress Bar
  // ============================================
  
  const progressBar = document.getElementById('scroll-progress');
  
  lenis.on('scroll', ({ scroll, limit }) => {
    const progress = (scroll / limit) * 100;
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
  });

  // ============================================
  // Scroll-triggered animations
  // ============================================
  
  const animatedElements = document.querySelectorAll('[data-scroll-animate]');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => {
    scrollObserver.observe(el);
  });

  // ============================================
  // Fade-in on scroll (legacy support)
  // ============================================
  
  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  });

  document.querySelectorAll('.fade-in').forEach(el => {
    fadeInObserver.observe(el);
  });

  // ============================================
  // Active navigation link
  // ============================================
  
  function setActiveNavLink() {
    const path = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link');
    
    navLinks.forEach(link => {
      link.classList.remove('nav__link--active');
      const href = link.getAttribute('href');
      
      if (path === href || 
          (href !== '/' && path.startsWith(href)) ||
          (href === '/' && path === '/')) {
        link.classList.add('nav__link--active');
      }
    });
  }

  setActiveNavLink();

  // ============================================
  // Smooth scroll for anchor links
  // ============================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, {
          offset: -80,
          duration: 1.5
        });
      }
    });
  });

})();
