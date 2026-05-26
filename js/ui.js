/**
 * Premium UI interactions — scroll reveals, smart header, tilt, nav.
 */
(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const HEADER_OFFSET = 100;

    let revealObserver = null;
    let lastScrollY = 0;
    let headerTicking = false;

    function initScrollProgress() {
        const bar = document.querySelector('.scroll-progress');
        if (!bar) return;

        function update() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
            bar.style.transform = 'scaleX(' + progress + ')';
        }

        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    function initRevealObserver() {
        if (prefersReducedMotion) {
            document.querySelectorAll('[data-reveal]').forEach(function (el) {
                el.classList.add('is-visible');
            });
            return;
        }

        revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                });
            },
            { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
        );

        observeReveals();
    }

    function observeReveals(root) {
        if (prefersReducedMotion) {
            (root || document).querySelectorAll('[data-reveal]').forEach(function (el) {
                el.classList.add('is-visible');
            });
            initCardTilt(root);
            return;
        }

        if (!revealObserver) return;

        const scope = root || document;
        scope.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(function (el) {
            revealObserver.observe(el);
        });

        initCardTilt(root);
    }

    function initSmartHeader() {
        const header = document.getElementById('site-header') || document.querySelector('.header');
        if (!header) return;

        const SCROLL_THRESHOLD = 72;
        const MIN_DELTA = 6;

        function updateHeader() {
            const y = window.scrollY;
            const menuOpen = document.body.classList.contains('menu-open');

            header.classList.toggle('header--scrolled', y > 16);

            if (menuOpen || y < SCROLL_THRESHOLD) {
                header.classList.remove('header--hidden');
            } else if (y - lastScrollY > MIN_DELTA) {
                header.classList.add('header--hidden');
            } else if (lastScrollY - y > MIN_DELTA) {
                header.classList.remove('header--hidden');
            }

            lastScrollY = y;
            headerTicking = false;
        }

        lastScrollY = window.scrollY;
        updateHeader();

        window.addEventListener('scroll', function () {
            if (!headerTicking) {
                requestAnimationFrame(updateHeader);
                headerTicking = true;
            }
        }, { passive: true });
    }

    function initCardTilt(root) {
        if (prefersReducedMotion) return;

        const scope = root || document;
        const maxTilt = 8;

        scope.querySelectorAll('[data-tilt]:not([data-tilt-bound])').forEach(function (card) {
            card.setAttribute('data-tilt-bound', 'true');
            card.style.setProperty('--tilt-perspective', '900px');

            let rafId = null;

            function resetTilt() {
                if (rafId) cancelAnimationFrame(rafId);
                card.style.transform = '';
                card.style.boxShadow = '';
            }

            function applyTilt(e) {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(function () {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const midX = rect.width / 2;
                    const midY = rect.height / 2;
                    const rotateY = ((x - midX) / midX) * maxTilt;
                    const rotateX = ((midY - y) / midY) * maxTilt;

                    card.style.transform =
                        'perspective(var(--tilt-perspective)) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-4px) scale3d(1.01, 1.01, 1.01)';
                    card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(225, 29, 36, 0.08)';
                });
            }

            card.addEventListener('mousemove', applyTilt);
            card.addEventListener('mouseleave', resetTilt);
        });
    }

    function initActiveNav() {
        const sections = document.querySelectorAll('main section[id]');
        const links = document.querySelectorAll('.main-nav a[href^="#"]');
        if (!sections.length || !links.length) return;

        const linkMap = {};
        links.forEach(function (link) {
            const id = link.getAttribute('href').slice(1);
            if (id) linkMap[id] = link;
        });

        function setActive() {
            const scrollPos = window.scrollY + HEADER_OFFSET + 40;
            let current = '';

            sections.forEach(function (section) {
                if (section.offsetTop <= scrollPos) {
                    current = section.id;
                }
            });

            links.forEach(function (link) {
                link.classList.remove('is-active');
                link.removeAttribute('aria-current');
            });

            if (current && linkMap[current]) {
                linkMap[current].classList.add('is-active');
                linkMap[current].setAttribute('aria-current', 'page');
            }
        }

        window.addEventListener('scroll', setActive, { passive: true });
        setActive();
    }

    function initHeroParallax() {
        if (prefersReducedMotion) return;

        const orbs = document.querySelectorAll('.hero__orb');
        if (!orbs.length) return;

        let ticking = false;

        function update() {
            const y = window.scrollY;
            orbs.forEach(function (orb, i) {
                const speed = 0.03 + i * 0.015;
                orb.style.transform = 'translate3d(0, ' + (y * speed) + 'px, 0)';
            });
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    }

    function setMenuOpen(open) {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.main-nav');
        const backdrop = document.querySelector('.mobile-nav-backdrop');
        const header = document.getElementById('site-header');

        document.body.classList.toggle('menu-open', open);
        if (nav) nav.classList.toggle('active', open);
        if (toggle) {
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        }
        if (backdrop) backdrop.classList.toggle('is-visible', open);
        if (header && open) header.classList.remove('header--hidden');
    }

    function initMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.main-nav');
        const backdrop = document.querySelector('.mobile-nav-backdrop');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', function () {
            setMenuOpen(!document.body.classList.contains('menu-open'));
        });

        if (backdrop) {
            backdrop.addEventListener('click', function () {
                setMenuOpen(false);
            });
        }

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                setMenuOpen(false);
            });
        });

        window.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
                setMenuOpen(false);
            }
        });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const hash = this.getAttribute('href');
                if (!hash || hash === '#') return;

                const target = document.querySelector(hash);
                if (!target) return;

                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
                window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        });
    }

    function init() {
        initScrollProgress();
        initRevealObserver();
        initSmartHeader();
        initActiveNav();
        initHeroParallax();
        initMobileMenu();
        initSmoothScroll();
        initCardTilt();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.TechbyshUI = {
        observe: observeReveals
    };
})();
