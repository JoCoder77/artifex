document.addEventListener('DOMContentLoaded', () => {
    // Logo Parallax Effect
    const logoContainer = document.getElementById('logo-trigger');
    const logoImg = document.querySelector('.hero-logo-img');

    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        
        if (logoImg) {
            logoImg.style.transform = `translate(${x}px, ${y}px) rotateX(${-y/2}deg) rotateY(${x/2}deg)`;
        }
    });

    // Reveal on Scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .bento-item').forEach(el => {
        el.classList.add('reveal'); // Ensure all targeted items have reveal class
        observer.observe(el);
    });


    // Smart Navbar Hide Logic (Observer-based)
    const navbar = document.querySelector('.navbar');
    const heroTitle = document.querySelector('.display-text');

    if (navbar && heroTitle) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navbar.classList.remove('nav-hidden');
                } else {
                    navbar.classList.add('nav-hidden');
                }
            });
        }, {
            threshold: 0,
            rootMargin: "-80px 0px 0px 0px" // Account for nav height
        });

        navObserver.observe(heroTitle);
    }
});
