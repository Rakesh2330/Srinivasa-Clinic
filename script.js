document.addEventListener('DOMContentLoaded', () => {
    
    // 0. Video Preloader Logic
    const preloader = document.getElementById('video-preloader');
    const introVideo = document.getElementById('intro-video');
    const skipBtn = document.getElementById('skip-intro');

    if (preloader && introVideo) {
        if (window.innerWidth <= 768) {
            preloader.classList.add('hidden');
            introVideo.pause();
        } else {
            // Hide when video ends
            introVideo.addEventListener('ended', () => {
                preloader.classList.add('hidden');
            });

            // Hide when skip button is clicked
            if (skipBtn) {
                skipBtn.addEventListener('click', () => {
                    preloader.classList.add('hidden');
                    introVideo.pause();
                });
            }

            // Fallback: hide after 8 seconds just in case video fails to load/play
            setTimeout(() => {
                if (!preloader.classList.contains('hidden')) {
                    preloader.classList.add('hidden');
                }
            }, 8000);
        }
    }

    const navbar = document.getElementById('navbar');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('back-to-top');
    const isHomePage = document.querySelector('.hero-section');

    // 1. Scroll Effects (Navbar, Progress Bar, Back to Top)
    const handleScroll = () => {
        const scrollY = window.scrollY;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollY / height) * 100;

        // Sticky Navbar — always white, just add extra shadow on scroll
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Progress Bar
        if (scrollProgress) {
            scrollProgress.style.width = `${scrolled}%`;
        }

        // Back to Top
        if (backToTop) {
            if (scrollY > 500) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // 2. Back to Top Click
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 3. Mobile Menu Toggle
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenu.classList.toggle('is-active');
    });

    // 4. Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const setTheme = (theme) => {
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            }
        };

        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            setTheme('light');
        }

        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            setTheme(isDark ? 'light' : 'dark');
        });
    }

    // 5. Counter Animation
    const animateCounters = () => {
        const counters = document.querySelectorAll('.stat-number, .stat-number-dark');
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const speed = 100; // Animation steps
            const isDecimal = target % 1 !== 0;
            
            // Set initial state to 0 formatted correctly
            counter.innerText = isDecimal ? "0.0" : "0";
            
            let count = 0;
            const updateCount = () => {
                const inc = target / speed;

                if (count < target) {
                    count += inc;
                    if (count >= target) {
                        counter.innerText = isDecimal ? target.toFixed(1) : (target >= 1000 ? (target / 1000).toFixed(0) + 'k' : target);
                    } else {
                        counter.innerText = isDecimal ? count.toFixed(1) : Math.ceil(count);
                        setTimeout(updateCount, 15);
                    }
                } else {
                    counter.innerText = isDecimal ? target.toFixed(1) : (target >= 1000 ? (target / 1000).toFixed(0) + 'k' : target);
                }
            };
            updateCount();
        });
    };

    // 6. Scroll Reveal Animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                
                // Trigger counter if it's the hero stats section
                if (entry.target.classList.contains('hero-stats') || entry.target.classList.contains('hero-stats-dark')) {
                    animateCounters();
                }
                
                // If it contains children with animations, trigger them too (for simplicity)
                const children = entry.target.querySelectorAll('.animate-up, .reveal-left, .reveal-right, .scale-up');
                children.forEach(child => child.classList.add('appear'));
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-up, .animate-fade, .reveal-left, .reveal-right, .scale-up, .hero-stats, .hero-stats-dark');
    animatedElements.forEach(el => observer.observe(el));

    // Typing effect removed as requested


    // 8. 3D Tilt Effect for Service Boxes
    const cards = document.querySelectorAll('.service-box');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // 9. Smooth Scroll for all anchor links on current page
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenu.classList.remove('is-active');
                }
            }
        });
    });
});
