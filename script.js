document.addEventListener('DOMContentLoaded', () => {
    const siteHeader = document.getElementById('site-header') || document.querySelector('.site-header') || document.getElementById('navbar');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuWrap = document.getElementById('navbar-menu-wrap');
    const appointmentForm = document.getElementById('appointment-form');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const opdStatusText = document.getElementById('opd-status-text');

    // 1. Dynamic Live OPD Status Calculation
    function updateOPDStatus() {
        if (!opdStatusText) return;
        const now = new Date();
        const day = now.getDay(); // 0 is Sunday
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours + minutes / 60;

        if (day === 0) {
            opdStatusText.textContent = "Clinic Closed Today (Sunday Holiday - No OPD & Emergency)";
            const dot = document.querySelector('.status-dot');
            if (dot) {
                dot.style.backgroundColor = '#EF4444';
                dot.style.boxShadow = '0 0 0 0 rgba(239, 68, 68, 0.7)';
            }
            return;
        }

        // Mon - Sat: 10:00 AM - 1:00 PM (10.0 to 13.0) & 4:30 PM - 9:00 PM (16.5 to 21.0)
        if (currentTime >= 10.0 && currentTime <= 13.0) {
            opdStatusText.textContent = "Morning OPD Active Now | Kuvempunagar (Until 1:00 PM)";
        } else if (currentTime > 13.0 && currentTime < 16.5) {
            opdStatusText.textContent = "Evening OPD Starts at 4:30 PM | Kuvempunagar";
        } else if (currentTime >= 16.5 && currentTime <= 21.0) {
            opdStatusText.textContent = "Evening OPD Active Now | Kuvempunagar (Until 9:00 PM)";
        } else {
            opdStatusText.textContent = "Morning OPD Active at 10:00 AM | Kuvempunagar";
        }
    }
    updateOPDStatus();

    // 2. Sticky Header on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            if (siteHeader) siteHeader.classList.add('scrolled');
        } else {
            if (siteHeader) siteHeader.classList.remove('scrolled');
        }
    });

    // 3. Mobile Menu Toggle
    if (mobileMenu && menuWrap) {
        mobileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            menuWrap.classList.toggle('active');
            mobileMenu.classList.toggle('is-active');
            document.body.classList.toggle('mobile-menu-open');
        });

        // Auto close when any nav link is tapped on mobile
        const navLinks = menuWrap.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuWrap.classList.remove('active');
                mobileMenu.classList.remove('is-active');
                document.body.classList.remove('mobile-menu-open');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (menuWrap.classList.contains('active') && !menuWrap.contains(e.target) && !mobileMenu.contains(e.target)) {
                menuWrap.classList.remove('active');
                mobileMenu.classList.remove('is-active');
                document.body.classList.remove('mobile-menu-open');
            }
        });
    }

    // 4. Dark / Light Theme Toggle System
    function initTheme() {
        const savedTheme = localStorage.getItem('srinivasa-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function updateThemeIcon(theme) {
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'fa-solid fa-sun';
            } else {
                icon.className = 'fa-solid fa-moon';
            }
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('srinivasa-theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
    initTheme();

    // 5. FAQ Accordion Toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                // Close all others
                faqItems.forEach(other => other.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // 6. Scroll Reveal Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-up, .animate-fade, .service-box, .facility-card, .review-card');
    animatedElements.forEach(el => observer.observe(el));

    // 7. Clinical Concierge Booking Form Handling
    if (appointmentForm) {
        // A. Setup Date Picker min & default today (skipping Sundays)
        const dateInput = document.getElementById('rf-date');
        const dateNotice = document.getElementById('rf-date-notice');

        function getNextValidDate(d) {
            const date = new Date(d);
            // If Sunday (0), move forward to Monday (+1 day)
            if (date.getDay() === 0) {
                date.setDate(date.getDate() + 1);
            }
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }

        if (dateInput) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayStr = `${yyyy}-${mm}-${dd}`;
            dateInput.min = todayStr;
            if (!dateInput.value) {
                dateInput.value = getNextValidDate(today);
            }

            // Sunday holiday validator
            const validateSundayDate = () => {
                if (!dateInput.value) return;
                const chosen = new Date(dateInput.value + 'T00:00:00');
                if (!isNaN(chosen.getTime()) && chosen.getDay() === 0) {
                    if (dateNotice) dateNotice.classList.add('show');
                    // Automatically adjust date to Monday
                    setTimeout(() => {
                        dateInput.value = getNextValidDate(chosen);
                    }, 1400);
                } else {
                    if (dateNotice) dateNotice.classList.remove('show');
                }
            };

            dateInput.addEventListener('change', validateSundayDate);
            dateInput.addEventListener('input', validateSundayDate);
        }

        // B. Time Slot Selection Card Toggle
        const slotCards = document.querySelectorAll('.rf-slot-card');
        slotCards.forEach(card => {
            card.addEventListener('click', () => {
                slotCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            });
        });

        // C. Enhanced Custom Dropdowns Logic
        const customDropdowns = document.querySelectorAll('.custom-dropdown');
        const timingText = document.getElementById('rf-timing-text');

        customDropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.dropdown-menu');
            const selectedText = dropdown.querySelector('.dropdown-selected-text');
            const targetInputId = dropdown.getAttribute('data-target');
            const targetInput = document.getElementById(targetInputId);
            const items = dropdown.querySelectorAll('.dropdown-item');

            if (!trigger || !menu) return;

            // Toggle Open/Close
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = dropdown.classList.contains('open');
                // Close all other dropdowns first
                customDropdowns.forEach(d => {
                    d.classList.remove('open');
                    d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
                });
                if (!isOpen) {
                    dropdown.classList.add('open');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });

            // Keyboard accessibility
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    trigger.click();
                } else if (e.key === 'Escape') {
                    dropdown.classList.remove('open');
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });

            // Option Selection
            items.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const val = item.getAttribute('data-value');

                    // Update UI text & active classes
                    items.forEach(i => {
                        i.classList.remove('selected');
                        i.removeAttribute('aria-selected');
                    });
                    item.classList.add('selected');
                    item.setAttribute('aria-selected', 'true');
                    const displayVal = item.getAttribute('data-display') || val;
                    if (selectedText) {
                        selectedText.textContent = displayVal;
                    }

                    // Update underlying input
                    if (targetInput) {
                        targetInput.value = val;
                        targetInput.dispatchEvent(new Event('change'));
                    }

                    // Dynamic Doctor Timing updates
                    if (targetInputId === 'rf-doctor' && timingText) {
                        if (val.includes('Sheshadri')) {
                            timingText.textContent = 'Dr. Sheshadri: 10:00 AM – 1:00 PM & 4:30 PM – 9:00 PM';
                        } else if (val.includes('Vatsala')) {
                            timingText.textContent = 'Dr. Vatsala: 10:00 AM – 1:00 PM & 4:30 PM – 9:00 PM';
                        } else {
                            timingText.textContent = 'OPD: 10:00 AM – 1:00 PM & 4:30 PM – 9:00 PM';
                        }
                    }

                    dropdown.classList.remove('open');
                    trigger.setAttribute('aria-expanded', 'false');
                });
            });
        });

        // Close dropdowns on click outside
        document.addEventListener('click', () => {
            customDropdowns.forEach(d => {
                d.classList.remove('open');
                d.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
            });
        });

        // D. Form Submission with Validation and WhatsApp Pass
        const submitBtn = document.getElementById('rf-submit-btn') || appointmentForm.querySelector('button[type="submit"]');
        const successBanner = document.getElementById('rf-success-banner');
        const successMsg = document.getElementById('rf-success-msg');
        const whatsappLink = document.getElementById('rf-whatsapp-link');

        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('rf-name');
            const phoneInput = document.getElementById('rf-phone');
            const deptInput = document.getElementById('rf-dept');
            const doctorInput = document.getElementById('rf-doctor');
            const chosenDateInput = document.getElementById('rf-date');
            const chosenSlot = document.querySelector('input[name="time_slot"]:checked');
            const messageInput = document.getElementById('rf-message');

            if (!nameInput.value.trim()) {
                nameInput.focus();
                return;
            }
            if (!phoneInput.value.trim()) {
                phoneInput.focus();
                return;
            }

            // Sunday Holiday validation: Block submission if a Sunday is selected
            if (chosenDateInput && chosenDateInput.value) {
                const selectedDate = new Date(chosenDateInput.value + 'T00:00:00');
                if (selectedDate.getDay() === 0) {
                    if (dateNotice) {
                        dateNotice.classList.add('show');
                        dateNotice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                    chosenDateInput.focus();
                    return;
                }
            }

            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Processing Consultation...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;

                const patientName = nameInput.value.trim();
                const patientPhone = phoneInput.value.trim();
                const patientDept = deptInput ? deptInput.value : 'General';
                const patientDoctor = doctorInput ? doctorInput.value : 'Specialist';
                const patientDate = chosenDateInput ? chosenDateInput.value : 'Upcoming';
                const patientSlot = chosenSlot ? chosenSlot.value : 'Morning';
                const patientMsg = messageInput ? messageInput.value.trim() : '';

                if (successBanner) {
                    successBanner.classList.add('show');
                    if (successMsg) {
                        successMsg.textContent = `Thank you, ${patientName}! Your priority consultation with ${patientDoctor.split('(')[0].trim()} on ${patientDate} (${patientSlot}) is registered.`;
                    }
                    if (whatsappLink) {
                        const waText = encodeURIComponent(
                            `Hello Srinivasa Dental Clinic, I have submitted an appointment request.\n\n` +
                            `*Patient Name:* ${patientName}\n` +
                            `*Phone:* ${patientPhone}\n` +
                            `*Department:* ${patientDept}\n` +
                            `*Preferred Doctor:* ${patientDoctor}\n` +
                            `*Date:* ${patientDate}\n` +
                            `*Slot:* ${patientSlot}` +
                            (patientMsg ? `\n*Concern:* ${patientMsg}` : '')
                        );
                        whatsappLink.href = `https://wa.me/919448046136?text=${waText}`;
                    }
                    successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }

                appointmentForm.reset();
                // Restore default date (skipping Sunday)
                if (dateInput) {
                    dateInput.value = getNextValidDate(new Date());
                }
                if (dateNotice) {
                    dateNotice.classList.remove('show');
                }
                // Restore first active slot
                slotCards.forEach((c, idx) => {
                    if (idx === 0) {
                        c.classList.add('active');
                        const radio = c.querySelector('input[type="radio"]');
                        if (radio) radio.checked = true;
                    } else {
                        c.classList.remove('active');
                    }
                });
            }, 900);
        });
    }

    // 8. Smooth Scroll for in-page anchors & close mobile menu
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });

                if (menuWrap && menuWrap.classList.contains('active')) {
                    menuWrap.classList.remove('active');
                    if (mobileMenu) mobileMenu.classList.remove('is-active');
                }
            }
        });
    });

    // 9. Synergy Mobile Carousel System
    const synergyTrack = document.getElementById('synergy-track');
    const synergyTabs = document.querySelectorAll('.synergy-tab-btn');
    const synergyDots = document.querySelectorAll('.synergy-dot');
    const synergyPrev = document.getElementById('synergy-prev');
    const synergyNext = document.getElementById('synergy-next');

    if (synergyTrack) {
        function getSynergyCards() {
            return synergyTrack.querySelectorAll('.synergy-card');
        }

        function scrollToSynergySlide(index) {
            const cards = getSynergyCards();
            if (cards[index]) {
                const cardLeft = cards[index].offsetLeft - synergyTrack.offsetLeft;
                synergyTrack.scrollTo({
                    left: cardLeft,
                    behavior: 'smooth'
                });
                updateSynergyUI(index);
            }
        }

        function updateSynergyUI(index) {
            synergyTabs.forEach((tab, i) => {
                tab.classList.toggle('active', i === index);
            });
            synergyDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        synergyTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const idx = parseInt(tab.getAttribute('data-index'), 10) || 0;
                scrollToSynergySlide(idx);
            });
        });

        synergyDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.getAttribute('data-index'), 10) || 0;
                scrollToSynergySlide(idx);
            });
        });

        if (synergyPrev) {
            synergyPrev.addEventListener('click', () => {
                scrollToSynergySlide(0);
            });
        }

        if (synergyNext) {
            synergyNext.addEventListener('click', () => {
                scrollToSynergySlide(1);
            });
        }

        // Detect touch swipe / scroll position change
        let scrollTimeout;
        synergyTrack.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollLeft = synergyTrack.scrollLeft;
                const totalWidth = synergyTrack.scrollWidth - synergyTrack.clientWidth;
                if (totalWidth > 0) {
                    const ratio = scrollLeft / totalWidth;
                    const activeIndex = ratio > 0.5 ? 1 : 0;
                    updateSynergyUI(activeIndex);
                }
            }, 60);
        }, { passive: true });

        // Auto-select doctor in booking form when clicking card CTA
        document.querySelectorAll('.btn-synergy-book').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const docKey = btn.getAttribute('data-select-doc');
                const doctorDropdown = document.getElementById('dropdown-doctor');
                if (doctorDropdown) {
                    const targetMatch = docKey === 'sheshadri' ? 'Sheshadri' : 'Vatsala';
                    const targetItem = doctorDropdown.querySelector(`.dropdown-item[data-value*="${targetMatch}"]`);
                    if (targetItem) {
                        targetItem.click();
                    }
                }
            });
        });
    }

    // 10. Hero Auto Carousel System
    const heroCarousel = document.getElementById('hero-carousel');
    if (heroCarousel) {
        const slides = heroCarousel.querySelectorAll('.hero-slide');
        const dots = heroCarousel.querySelectorAll('.hero-dot');
        const prevBtn = document.getElementById('hero-carousel-prev');
        const nextBtn = document.getElementById('hero-carousel-next');
        let currentSlide = 0;
        let carouselInterval = null;
        const autoDelay = 4200; // 4.2 seconds smooth auto transition

        function showSlide(index) {
            if (index < 0) {
                currentSlide = slides.length - 1;
            } else if (index >= slides.length) {
                currentSlide = 0;
            } else {
                currentSlide = index;
            }

            const track = document.getElementById('hero-carousel-track');
            if (track) {
                track.style.transform = `translateX(-${currentSlide * 100}%)`;
            }

            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === currentSlide);
            });

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        function startAutoPlay() {
            stopAutoPlay();
            carouselInterval = setInterval(nextSlide, autoDelay);
        }

        function stopAutoPlay() {
            if (carouselInterval) {
                clearInterval(carouselInterval);
                carouselInterval = null;
            }
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                nextSlide();
                startAutoPlay();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                prevSlide();
                startAutoPlay();
            });
        }

        dots.forEach((dot) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetIdx = parseInt(dot.getAttribute('data-slide'), 10) || 0;
                showSlide(targetIdx);
                startAutoPlay();
            });
        });

        // Pause on mouse hover
        heroCarousel.addEventListener('mouseenter', stopAutoPlay);
        heroCarousel.addEventListener('mouseleave', startAutoPlay);

        // Mobile touch swipe gestures
        let touchStartX = 0;
        let touchEndX = 0;

        heroCarousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        }, { passive: true });

        heroCarousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 40;
            if (touchEndX < touchStartX - swipeThreshold) {
                nextSlide();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                prevSlide();
            }
            startAutoPlay();
        }, { passive: true });

        // Start autoplay on page load
        startAutoPlay();
    }
});

