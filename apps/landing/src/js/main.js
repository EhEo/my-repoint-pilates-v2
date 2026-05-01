/**
 * RePoint Pilates - Main JavaScript
 * PWA-ready landing page with smooth animations and interactions
 */

// ============================================
// DOM Elements
// ============================================
const DOM = {
    loader: document.getElementById('loader'),
    header: document.getElementById('header'),
    navToggle: document.getElementById('nav-toggle'),
    navMenu: document.getElementById('nav-menu'),
    mobileMenu: document.getElementById('mobile-menu'),
    cursor: document.getElementById('cursor'),
    cursorFollower: document.getElementById('cursor-follower'),
    pricingToggle: document.getElementById('pricing-toggle'),
    pwaPrompt: document.getElementById('pwa-prompt'),
    pwaInstall: document.getElementById('pwa-install'),
    pwaClose: document.getElementById('pwa-close'),
    usersTabs: document.querySelectorAll('.users__tab'),
    usersPanels: document.querySelectorAll('.users__panel'),
    statNumbers: document.querySelectorAll('.hero__stat-number'),
    pricingAmounts: document.querySelectorAll('.pricing-card__amount'),
    ctaForm: document.getElementById('cta-form'),
    contactForm: document.getElementById('contact-form'),
};

// ============================================
// State
// ============================================
let deferredPrompt = null;
let isYearlyPricing = false;
let hasAnimatedStats = false;

// ============================================
// Utility Functions
// ============================================
const utils = {
    /**
     * Debounce function execution
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function execution
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Animate number counting
     */
    animateNumber(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    },

    /**
     * Format price with commas
     */
    formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element, threshold = 0.5) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        return (
            rect.top <= windowHeight * (1 - threshold) &&
            rect.bottom >= windowHeight * threshold
        );
    },

    /**
     * Smooth scroll to element
     */
    scrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const headerHeight = DOM.header ? DOM.header.offsetHeight : 0;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

// ============================================
// Loader
// ============================================
const loader = {
    init() {
        document.body.classList.add('loading');

        window.addEventListener('load', () => {
            setTimeout(() => {
                DOM.loader.classList.add('hidden');
                document.body.classList.remove('loading');
            }, 1500);
        });
    }
};

// ============================================
// Header
// ============================================
const header = {
    lastScroll: 0,

    init() {
        window.addEventListener('scroll', utils.throttle(() => this.onScroll(), 100));
        this.onScroll();
    },

    onScroll() {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class
        if (currentScroll > 50) {
            DOM.header.classList.add('scrolled');
        } else {
            DOM.header.classList.remove('scrolled');
        }

        this.lastScroll = currentScroll;
    }
};

// ============================================
// Mobile Navigation
// ============================================
const navigation = {
    isOpen: false,

    init() {
        DOM.navToggle.addEventListener('click', () => this.toggle());

        // Close menu on link click
        DOM.mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Handle smooth scroll for all navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                this.close();
                utils.scrollTo(href);
            });
        });
    },

    toggle() {
        this.isOpen ? this.close() : this.open();
    },

    open() {
        this.isOpen = true;
        DOM.navToggle.classList.add('active');
        DOM.mobileMenu.classList.add('active');
        document.body.classList.add('menu-open');
    },

    close() {
        this.isOpen = false;
        DOM.navToggle.classList.remove('active');
        DOM.mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
};

// ============================================
// Custom Cursor (Desktop only)
// ============================================
const cursor = {
    init() {
        // Only initialize on devices with fine pointer (mouse)
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            return;
        }

        document.addEventListener('mousemove', (e) => this.move(e));

        // Add hover effect for interactive elements
        const hoverElements = document.querySelectorAll('a, button, input, textarea, select, .users__tab');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.hover(true));
            el.addEventListener('mouseleave', () => this.hover(false));
        });
    },

    move(e) {
        DOM.cursor.style.left = `${e.clientX}px`;
        DOM.cursor.style.top = `${e.clientY}px`;
        DOM.cursorFollower.style.left = `${e.clientX}px`;
        DOM.cursorFollower.style.top = `${e.clientY}px`;
    },

    hover(isHovering) {
        if (isHovering) {
            DOM.cursor.classList.add('hover');
            DOM.cursorFollower.classList.add('hover');
        } else {
            DOM.cursor.classList.remove('hover');
            DOM.cursorFollower.classList.remove('hover');
        }
    }
};

// ============================================
// Stats Animation
// ============================================
const stats = {
    init() {
        window.addEventListener('scroll', utils.throttle(() => this.checkVisibility(), 200));
        this.checkVisibility();
    },

    checkVisibility() {
        if (hasAnimatedStats) return;

        const statsContainer = document.querySelector('.hero__stats');
        if (!statsContainer || !utils.isInViewport(statsContainer, 0.8)) return;

        hasAnimatedStats = true;

        DOM.statNumbers.forEach(el => {
            const target = parseInt(el.dataset.count, 10);
            utils.animateNumber(el, target, 2000);
        });
    }
};

// ============================================
// Users Tabs
// ============================================
const usersTabs = {
    init() {
        DOM.usersTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });
    },

    switchTab(activeTab) {
        const tabId = activeTab.dataset.tab;

        // Update tabs
        DOM.usersTabs.forEach(tab => {
            tab.classList.toggle('users__tab--active', tab === activeTab);
        });

        // Update panels
        DOM.usersPanels.forEach(panel => {
            panel.classList.toggle('users__panel--active', panel.dataset.panel === tabId);
        });
    }
};

// ============================================
// Pricing Toggle
// ============================================
const pricing = {
    init() {
        DOM.pricingToggle.addEventListener('click', () => this.toggle());
    },

    toggle() {
        isYearlyPricing = !isYearlyPricing;
        DOM.pricingToggle.classList.toggle('active', isYearlyPricing);

        DOM.pricingAmounts.forEach(el => {
            const price = isYearlyPricing ? el.dataset.yearly : el.dataset.monthly;
            el.textContent = utils.formatPrice(price);
        });
    }
};

// ============================================
// Forms
// ============================================
const forms = {
    init() {
        if (DOM.ctaForm) {
            DOM.ctaForm.addEventListener('submit', (e) => this.handleSubmit(e, 'cta'));
        }

        if (DOM.contactForm) {
            DOM.contactForm.addEventListener('submit', (e) => this.handleSubmit(e, 'contact'));
        }
    },

    handleSubmit(e, formType) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Here you would typically send the data to your server
        console.log(`${formType} form submitted:`, data);

        // Show success message
        this.showSuccess(form, formType);

        // Reset form
        form.reset();
    },

    showSuccess(form, formType) {
        const button = form.querySelector('button[type="submit"]');
        const originalHTML = button.innerHTML;

        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>${formType === 'cta' ? '신청 완료!' : '전송 완료!'}</span>
        `;
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.disabled = false;
        }, 3000);
    }
};

// ============================================
// PWA Installation
// ============================================
const pwa = {
    init() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            // Show install prompt after 3 seconds
            setTimeout(() => this.showPrompt(), 3000);
        });

        // Handle install button click
        DOM.pwaInstall.addEventListener('click', () => this.install());

        // Handle close button click
        DOM.pwaClose.addEventListener('click', () => this.hidePrompt());

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed');
            this.hidePrompt();
            deferredPrompt = null;
        });
    },

    showPrompt() {
        if (!deferredPrompt) return;
        DOM.pwaPrompt.classList.add('active');
    },

    hidePrompt() {
        DOM.pwaPrompt.classList.remove('active');
    },

    async install() {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);

        deferredPrompt = null;
        this.hidePrompt();
    }
};

// ============================================
// Intersection Observer for Animations
// ============================================
const animations = {
    init() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        const animateElements = document.querySelectorAll(
            '.feature-card, .benefit-item, .pricing-card, .contact__method'
        );

        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    }
};

// Add CSS for animated elements
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// ============================================
// Service Worker Registration
// ============================================
const serviceWorker = {
    async init() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered:', registration.scope);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }
};

// ============================================
// Initialize All Modules
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loader.init();
    header.init();
    navigation.init();
    cursor.init();
    stats.init();
    usersTabs.init();
    pricing.init();
    forms.init();
    pwa.init();
    animations.init();
    serviceWorker.init();
});

// ============================================
// Export for potential module usage
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        utils,
        loader,
        header,
        navigation,
        cursor,
        stats,
        usersTabs,
        pricing,
        forms,
        pwa,
        animations
    };
}
