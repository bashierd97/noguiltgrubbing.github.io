(function () {
    'use strict';

    // ── Hamburger nav ──────────────────────────────────────
    var toggle = document.querySelector('.nav-toggle');
    var menu   = document.getElementById('nav-menu');
    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            var open = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!open));
            toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
            menu.classList.toggle('is-open', !open);
        });
        document.addEventListener('click', function (e) {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Open menu');
                menu.classList.remove('is-open');
            }
        });
        menu.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Open menu');
                menu.classList.remove('is-open');
            });
        });
    }

    // ── Scroll-triggered card animations ──────────────────
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        document.querySelectorAll('.card').forEach(function (el, i) {
            el.classList.add('fade-in');
            el.style.transitionDelay = (i % 4 * 70) + 'ms';
            observer.observe(el);
        });
    }

    // ── Back to top ────────────────────────────────────────
    var backBtn = document.createElement('button');
    backBtn.className = 'back-to-top';
    backBtn.setAttribute('aria-label', 'Back to top');
    backBtn.textContent = '↑';
    document.body.appendChild(backBtn);

    window.addEventListener('scroll', function () {
        backBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();
