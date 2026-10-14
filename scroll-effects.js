"use strict";
(() => {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  if (!("IntersectionObserver" in window)) return;

  const targets = new Set();
  function collect(selector, variant) {
    document.querySelectorAll(selector).forEach(element => {
      element.classList.add("scroll-reveal");
      if (variant) element.dataset.motion = variant;
      targets.add(element);
    });
  }
  collect(".section-title, .contact > h2", "heading");
  collect(".school-photo-spread, .learner-profile-photo, .section-photo", "photo");
  collect(".beginner-highlight, .about-proof-stats, .learning-path, .learning-item, .internship-note, .schedule-note, .career-row, .support-item, .quiet-cta, .course-detail, .seminar-group, .teacher, .voice, .faq-item, .admission-step, .access");
  collect(".icon-benefits > a, .photo-stories > a", "photo");

  // Stagger siblings without delaying the rest of a long section.
  document.querySelectorAll(".icon-benefits, .photo-stories, .learning-path, .school-facts").forEach(group => {
    Array.from(group.children).forEach((element, index) => {
      if (targets.has(element)) element.style.setProperty("--reveal-delay", `${Math.min(index * 75, 150)}ms`);
    });
  });
  document.querySelectorAll(".career-row, .support-item, .admission-step").forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${(index % 3) * 60}ms`);
  });

  let observer;
  let frame = 0;
  let heroVisible = false;
  const hero = document.querySelector(".hero-photo");
  const heroImage = hero && hero.querySelector("img");

  function reveal(element, immediate = false) {
    if (immediate) element.classList.add("motion-immediate");
    element.classList.remove("is-pending");
    if (observer) observer.unobserve(element);
  }
  function updateHero() {
    frame = 0;
    if (preference.matches || !heroImage || !heroVisible || document.hidden) return;
    const bounds = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - bounds.top) / (innerHeight + bounds.height)));
    heroImage.style.setProperty("--hero-shift", `${((progress - .5) * 24).toFixed(2)}px`);
  }
  function queueHero() {
    if (!frame && heroVisible && !preference.matches) frame = requestAnimationFrame(updateHero);
  }
  const heroObserver = hero && new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    queueHero();
  });
  if (heroObserver) heroObserver.observe(hero);

  function configure() {
    if (observer) observer.disconnect();
    if (preference.matches) {
      targets.forEach(element => reveal(element, true));
      if (heroImage) {
        heroImage.classList.remove("scroll-hero-image");
        heroImage.style.removeProperty("--hero-shift");
      }
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      return;
    }
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, { rootMargin: "0px 0px -32px 0px", threshold: 0 });
    targets.forEach(element => {
      element.classList.remove("motion-immediate");
      // Visible content and restored/deep-linked positions stay readable immediately.
      if (element.getBoundingClientRect().top < innerHeight) return;
      element.classList.add("is-pending");
      observer.observe(element);
    });
    if (heroImage) heroImage.classList.add("scroll-hero-image");
    queueHero();
  }
  document.addEventListener("focusin", event => {
    targets.forEach(element => {
      if (element.contains(event.target)) reveal(element, true);
    });
  });
  addEventListener("pageshow", () => {
    targets.forEach(element => {
      if (element.getBoundingClientRect().top < innerHeight) reveal(element, true);
    });
    queueHero();
  });
  addEventListener("scroll", queueHero, { passive: true });
  addEventListener("resize", queueHero, { passive: true });
  document.addEventListener("visibilitychange", queueHero);
  preference.addEventListener("change", configure);
  configure();
})();
