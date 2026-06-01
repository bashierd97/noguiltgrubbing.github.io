(function () {
    'use strict';

    var html = document.documentElement;
    var mq   = window.matchMedia('(prefers-color-scheme: dark)');

    // ── Dark mode toggle ───────────────────────────────────
    var themeBtn = document.querySelector('.theme-toggle');

    function isDark() {
        return html.classList.contains('dark-mode') ||
               (!html.classList.contains('light-mode') && mq.matches);
    }

    function syncIcon() {
        if (!themeBtn) return;
        themeBtn.textContent = isDark() ? '☀️' : '🌙';
        themeBtn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
    }

    // Apply saved preference before first paint
    var saved = localStorage.getItem('ngg-theme');
    if (saved === 'dark')  html.classList.add('dark-mode');
    if (saved === 'light') html.classList.add('light-mode');
    syncIcon();

    // Follow OS changes only when user has no manual preference
    mq.addEventListener('change', function () {
        if (!localStorage.getItem('ngg-theme')) syncIcon();
    });

    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            var dark = isDark();
            html.classList.remove('dark-mode', 'light-mode');
            html.classList.add(dark ? 'light-mode' : 'dark-mode');
            localStorage.setItem('ngg-theme', dark ? 'light' : 'dark');
            syncIcon();
        });
    }

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
            if (!toggle.contains(e.target) && !menu.contains(e.target) &&
                !(themeBtn && themeBtn.contains(e.target))) {
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
        var cardObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        document.querySelectorAll('.card').forEach(function (el, i) {
            el.classList.add('fade-in');
            el.style.transitionDelay = (i % 4 * 70) + 'ms';
            cardObserver.observe(el);
        });

        // ── Active subnav section highlight ───────────────
        var subnav = document.querySelector('.page-subnav');
        if (subnav) {
            var subLinks = Array.from(subnav.querySelectorAll('a[href^="#"]'));
            var subSections = subLinks.map(function (a) {
                return document.querySelector(a.getAttribute('href'));
            }).filter(Boolean);

            var sectionObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        subLinks.forEach(function (a) { a.classList.remove('active'); });
                        var link = subnav.querySelector('a[href="#' + entry.target.id + '"]');
                        if (link) link.classList.add('active');
                    }
                });
            }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });

            subSections.forEach(function (s) { sectionObserver.observe(s); });
        }
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
