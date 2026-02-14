(function () {
    'use strict';

    // ---- Mobile Menu ----
    var menuBtn = document.getElementById('mobile-menu-btn');
    var nav = document.getElementById('nav');

    function openMenu() {
        nav.classList.add('open');
        menuBtn.classList.add('active');
        document.body.classList.add('menu-open');
    }

    function closeMenu() {
        nav.classList.remove('open');
        menuBtn.classList.remove('active');
        document.body.classList.remove('menu-open');
    }

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function () {
            if (nav.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        document.addEventListener('click', function (e) {
            if (nav.classList.contains('open') &&
                !nav.contains(e.target) && !menuBtn.contains(e.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                closeMenu();
            }
        });
    }
})();
