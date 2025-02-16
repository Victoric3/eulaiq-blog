function toggleMobileMenu() {
    console.log("menu toggled")
    const nav = document.querySelector('.nav-menu');
    const btn = document.getElementById('mobile-menu-btn');
    const body = document.body;
    
    if (nav && btn) {
        nav.classList.toggle('active');
        btn.classList.toggle('bi-list');
        btn.classList.toggle('bi-x');
        body.classList.toggle('menu-open');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', toggleMobileMenu);
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const nav = document.querySelector('.nav-menu');
        const btn = document.getElementById('mobile-menu-btn');
        
        if (nav && btn && !nav.contains(e.target) && !btn.contains(e.target)) {
            nav.classList.remove('active');
            btn.classList.remove('bi-x');
            btn.classList.add('bi-list');
            document.body.classList.remove('menu-open');
        }
    });

    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update icon based on current theme
    updateIcon(currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon(newTheme);
    });
    
    function updateIcon(theme) {
        const icon = document.getElementById('theme-toggle');
        if (theme === 'dark') {
            icon.classList.remove('bi-sun');
            icon.classList.add('bi-moon-stars');
        } else {
            icon.classList.remove('bi-moon-stars');
            icon.classList.add('bi-sun');
        }
    }
});