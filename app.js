/* Microinteractions — scroll reveal, stat count-up, nav shadow.
   Degrades safely: if JS is off or reduced-motion is on, content shows normally
   (the .js-anim class that hides reveal targets is only added when motion is allowed). */
(function () {
  'use strict';

  // ---- Nav shadow on scroll (runs regardless of motion preference) ----
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!motionOK) return; // skip reveal + count-up; everything is already visible

  var toArray = function (nl) { return Array.prototype.slice.call(nl); };

  // ---- Scroll reveal ----
  var revealSel = '.hero h1, .hero .lede, .hero .meta, .hero .stats, .featured, ' +
    '.case-card, .more > a, .testimonial, .block, .exp, .phase, .band, .reflect, ' +
    '.proj, .hero-fig, .next-nav, .intro, .principles, .xp';
  var revealEls = toArray(document.querySelectorAll(revealSel));

  // gentle stagger for sibling groups
  ['.hero', '.case-grid', '.more'].forEach(function (sel) {
    toArray(document.querySelectorAll(sel)).forEach(function (group) {
      toArray(group.children).forEach(function (child, i) {
        child.style.transitionDelay = (i * 80) + 'ms';
      });
    });
  });

  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ---- Stat count-up ----
  function animateCount(el) {
    var raw = el.textContent.trim();
    var m = raw.match(/-?\d[\d,]*(\.\d+)?/); // first number in the string
    if (!m) return;
    var numStr = m[0];
    var prefix = raw.slice(0, m.index);
    var suffix = raw.slice(m.index + numStr.length);
    var hasComma = numStr.indexOf(',') !== -1;
    var clean = numStr.replace(/,/g, '');
    var decimals = (clean.split('.')[1] || '').length;
    var target = parseFloat(clean);
    if (isNaN(target)) return;

    function fmt(v) {
      var s = v.toFixed(decimals);
      if (hasComma) {
        var parts = s.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        s = parts.join('.');
      }
      return prefix + s + suffix;
    }

    var dur = 1100, t0 = null;
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target);
    }
    el.textContent = fmt(0);
    requestAnimationFrame(tick);
  }

  var numEls = toArray(document.querySelectorAll('.stat .n, .band-grid .n, .metrics .n'));
  if ('IntersectionObserver' in window && numEls.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    numEls.forEach(function (el) { co.observe(el); });
  }
})();
