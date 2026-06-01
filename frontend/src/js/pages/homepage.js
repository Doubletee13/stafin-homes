/**
 * Homepage Logic
 * Hero slideshow and testimonials auto-rotation
 */

class HeroSlideshow {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.dots = document.querySelectorAll('.hero-dot');
        this.current = 0;
        this.total = this.slides.length;
        this.interval = null;

        if (this.total === 0) return;

        this.init();
    }

    init() {
        // Arrows
        document.getElementById('hero-prev')?.addEventListener('click', () => {
            this.goTo((this.current - 1 + this.total) % this.total);
            this.resetInterval();
        });
        document.getElementById('hero-next')?.addEventListener('click', () => {
            this.goTo((this.current + 1) % this.total);
            this.resetInterval();
        });

        // Dots
        this.dots.forEach(dot => {
            dot.addEventListener('click', () => {
                this.goTo(parseInt(dot.dataset.dot));
                this.resetInterval();
            });
        });

        this.updateDots();
        this.startInterval();
    }

    goTo(index) {
        this.slides[this.current]?.classList.remove('active');
        this.current = index;
        this.slides[this.current]?.classList.add('active');
        this.updateDots();
    }

    updateDots() {
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('bg-accent', i === this.current);
            dot.classList.toggle('w-8', i === this.current);
            dot.classList.toggle('bg-white/50', i !== this.current);
            dot.classList.toggle('w-3', i !== this.current);
        });
    }

    startInterval() {
        this.interval = setInterval(() => {
            this.goTo((this.current + 1) % this.total);
        }, 5000);
    }

    resetInterval() {
        clearInterval(this.interval);
        this.startInterval();
    }
}

class TestimonialCarousel {
    constructor() {
        this.cards = document.querySelectorAll('.testimonial-card');
        this.dots = document.querySelectorAll('.testimonial-dot');
        this.current = 0;
        this.total = this.cards.length;
        this.interval = null;

        if (this.total === 0) return;

        this.init();
    }

    init() {
        this.dots.forEach(dot => {
            dot.addEventListener('click', () => {
                this.goTo(parseInt(dot.dataset.tdot));
                this.resetInterval();
            });
        });

        this.updateDots();
        this.startInterval();
    }

    goTo(index) {
        this.cards[this.current]?.classList.remove('active');
        this.current = index;
        this.cards[this.current]?.classList.add('active');
        this.updateDots();
    }

    updateDots() {
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('bg-accent', i === this.current);
            dot.classList.toggle('w-8', i === this.current);
            dot.classList.toggle('bg-gray-300', i !== this.current);
            dot.classList.toggle('w-3', i !== this.current);
        });
    }

    startInterval() {
        this.interval = setInterval(() => {
            this.goTo((this.current + 1) % this.total);
        }, 4000);
    }

    resetInterval() {
        clearInterval(this.interval);
        this.startInterval();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HeroSlideshow();
    new TestimonialCarousel();
});
