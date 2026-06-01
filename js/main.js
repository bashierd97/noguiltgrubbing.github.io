(function () {
    'use strict';

    var html    = document.documentElement;
    var mq      = window.matchMedia('(prefers-color-scheme: dark)');
    var page    = window.location.pathname.split('/').pop() || 'index.html';

    // ── Progress bar ───────────────────────────────────────
    var bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.setAttribute('aria-hidden', 'true');
    document.body.prepend(bar);

    window.addEventListener('scroll', function () {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (docH > 0 ? (window.scrollY / docH) * 100 : 0) + '%';
    }, { passive: true });

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

    var saved = localStorage.getItem('ngg-theme');
    if (saved === 'dark')  html.classList.add('dark-mode');
    if (saved === 'light') html.classList.add('light-mode');
    syncIcon();

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

    // ── Scroll animations + subnav highlight ──────────────
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

        // Active subnav section
        var subnav = document.querySelector('.page-subnav');
        if (subnav) {
            var subLinks    = Array.from(subnav.querySelectorAll('a[href^="#"]'));
            var subSections = subLinks.map(function (a) {
                return document.querySelector(a.getAttribute('href'));
            }).filter(Boolean);

            var secObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        subLinks.forEach(function (a) { a.classList.remove('active'); });
                        var link = subnav.querySelector('a[href="#' + entry.target.id + '"]');
                        if (link) link.classList.add('active');
                    }
                });
            }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });

            subSections.forEach(function (s) { secObserver.observe(s); });
        }

        // Animated stat counters (About page)
        var statEls = document.querySelectorAll('.stat-num');
        if (statEls.length) {
            var statObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        statObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            statEls.forEach(function (el) { statObserver.observe(el); });
        }
    }

    function animateCounter(el) {
        var original = el.textContent.trim();
        var match    = original.match(/^(\d+)(.*)/);
        if (!match) return;
        var target   = parseInt(match[1], 10);
        var suffix   = match[2];
        var duration = 1200;
        var start    = null;
        function tick(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
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

    // ── Swap search (substitutions.html) ──────────────────
    var searchInput = document.getElementById('swap-search');
    if (searchInput) {
        var cards      = document.querySelectorAll('#categories .card');
        var noResults  = document.getElementById('no-results');

        searchInput.addEventListener('input', function () {
            var q       = this.value.toLowerCase().trim();
            var visible = 0;
            cards.forEach(function (card) {
                var show = q === '' || card.textContent.toLowerCase().includes(q);
                card.style.display = show ? '' : 'none';
                if (show) visible++;
            });
            if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
        });
    }

    // ── Copy shopping list (meal-planning.html) ────────────
    var copyBtn = document.getElementById('copy-list-btn');
    if (copyBtn && navigator.clipboard) {
        copyBtn.addEventListener('click', function () {
            var text = [
                'SHOPPING LIST — No Guilt Grubbing',
                '',
                'SECTIONS',
                '  ☐ Produce',
                '  ☐ Proteins (meat / eggs / plant)',
                '  ☐ Dry goods',
                '  ☐ Dairy / alternatives',
                '  ☐ Frozen',
                '',
                'PRO TIPS',
                '  • Check pantry & freezer first',
                '  • Buy versatile bases (rice, quinoa, greens)',
                '  • Plan for leftovers as a future meal',
                '',
                '— noguiltgrubbing.github.io'
            ].join('\n');

            navigator.clipboard.writeText(text).then(function () {
                copyBtn.textContent = '✅ Copied to clipboard!';
                setTimeout(function () { copyBtn.textContent = '📋 Copy shopping list'; }, 2500);
            });
        });
    }

    // ── "Tried it!" tracker ────────────────────────────────
    var triedPages = { 'breakfast.html': 1, 'entrees.html': 1, 'desserts.html': 1, 'snacks.html': 1 };
    if (triedPages[page]) {
        var KEY   = 'ngg-tried-' + page;
        var tried = JSON.parse(localStorage.getItem(KEY) || '[]');

        document.querySelectorAll('.card').forEach(function (card, i) {
            var btn = document.createElement('button');
            var active = tried.indexOf(i) !== -1;
            btn.className  = 'tried-btn' + (active ? ' tried-btn--active' : '');
            btn.textContent = active ? '✓ Tried it!' : 'Mark as tried';
            btn.setAttribute('aria-pressed', String(active));

            btn.addEventListener('click', function () {
                var idx = tried.indexOf(i);
                if (idx === -1) {
                    tried.push(i);
                    btn.classList.add('tried-btn--active');
                    btn.textContent = '✓ Tried it!';
                    btn.setAttribute('aria-pressed', 'true');
                } else {
                    tried.splice(idx, 1);
                    btn.classList.remove('tried-btn--active');
                    btn.textContent = 'Mark as tried';
                    btn.setAttribute('aria-pressed', 'false');
                }
                localStorage.setItem(KEY, JSON.stringify(tried));
            });

            card.appendChild(btn);
        });
    }
})();
