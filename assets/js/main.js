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
    
    // Check system preference first, then localStorage, default to 'light'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    const currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.classList.toggle('dark', currentTheme === 'dark');
    
    // Set initial icon
    updateIcon(currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
        
        // Update body class and data attribute
        document.body.classList.toggle('dark');
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Store preference
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        updateIcon(newTheme);
    });
    
    function updateIcon(theme) {
        const icon = document.getElementById('theme-toggle');
        if (!icon) return;
        
        // Always start fresh by removing both classes
        icon.classList.remove('bi-sun', 'bi-moon-stars');
        
        // Add appropriate icon class
        icon.classList.add(theme === 'dark' ? 'bi-moon-stars' : 'bi-sun');
    }
});