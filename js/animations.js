document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    // menuToggle.addEventListener('click', function() {
    //     mainNav.classList.toggle('active');
    //     menuToggle.classList.toggle('active');
    // });
    
    // Scroll animations
    const animateElements = document.querySelectorAll('[data-animate]');
    
    function checkAnimation() {
        const windowHeight = window.innerHeight;
        const windowTop = window.scrollY;
        const windowBottom = windowTop + windowHeight;
        
        animateElements.forEach(element => {
            const elementHeight = element.offsetHeight;
            const elementTop = element.offsetTop;
            const elementBottom = elementTop + elementHeight;
            
            // Check if element is in viewport
            if (elementBottom >= windowTop && elementTop <= windowBottom) {
                element.classList.add('animate');
            }
        });
    }
    
    // Initial check
    checkAnimation();
    
    // Check on scroll
    window.addEventListener('scroll', function() {
        checkAnimation();
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});