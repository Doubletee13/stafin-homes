/**
 * Media Carousel Component
 * Renders a carousel supporting images and video items from the unified media[] format.
 * Features: left/right navigation, infinite looping, video pause on navigate, fallback placeholder.
 *
 * @param {Array<{type: 'image'|'video', url: string}>} media - Array of media items
 * @param {string} propertyTitle - Title for accessibility alt text
 * @returns {HTMLElement} carousel DOM element
 */

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=60';

function createMediaCarousel(media, propertyTitle) {
    const validMedia = Array.isArray(media) ? media.filter(m => m && m.url) : [];

    const wrapper = document.createElement('div');
    wrapper.className = 'media-carousel relative h-96 overflow-hidden bg-gray-900 select-none';
    wrapper.setAttribute('aria-label', 'Property media carousel');
    wrapper.setAttribute('role', 'region');

    // ── Empty / fallback state ──────────────────────────────────────────────
    if (validMedia.length === 0) {
        wrapper.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-400">
                <svg class="w-16 h-16 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p class="text-sm">No media available</p>
            </div>
        `;
        return wrapper;
    }

    // ── Build slide elements ────────────────────────────────────────────────
    let currentIndex = 0;

    const slidesContainer = document.createElement('div');
    slidesContainer.className = 'slides-container w-full h-full';

    const slides = validMedia.map((item, i) => {
        const slide = document.createElement('div');
        slide.className = `carousel-slide absolute inset-0 transition-opacity duration-400 ${i === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`;
        slide.setAttribute('data-index', i);

        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.url;
            video.controls = true;
            video.className = 'w-full h-full object-contain bg-black';
            video.setAttribute('aria-label', `${propertyTitle} - Video ${i + 1}`);
            video.preload = 'metadata';
            slide.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.url;
            img.alt = `${propertyTitle} - Photo ${i + 1}`;
            img.className = 'w-full h-full object-cover';
            img.onerror = () => { img.src = FALLBACK_IMAGE_URL; };
            slide.appendChild(img);
        }
        return slide;
    });

    slides.forEach(s => slidesContainer.appendChild(s));
    wrapper.appendChild(slidesContainer);

    // ── Counter badge ───────────────────────────────────────────────────────
    const counter = document.createElement('div');
    counter.className = 'absolute bottom-3 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-20';
    counter.textContent = `1 / ${validMedia.length}`;
    wrapper.appendChild(counter);

    // ── Navigation dots ─────────────────────────────────────────────────────
    if (validMedia.length > 1) {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20';
        const dots = validMedia.map((_, i) => {
            const dot = document.createElement('button');
            dot.className = `w-2 h-2 rounded-full transition-all ${i === 0 ? 'bg-white scale-125' : 'bg-white/50'}`;
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            return dot;
        });
        dots.forEach(d => dotsContainer.appendChild(d));
        wrapper.appendChild(dotsContainer);

        // ── Navigate function ───────────────────────────────────────────────
        function goTo(index) {
            // Pause any playing video on the current slide
            const currentSlide = slides[currentIndex];
            const video = currentSlide.querySelector('video');
            if (video) video.pause();

            // Update visibility
            slides[currentIndex].classList.replace('opacity-100', 'opacity-0');
            slides[currentIndex].classList.replace('z-10', 'z-0');

            currentIndex = (index + validMedia.length) % validMedia.length;

            slides[currentIndex].classList.replace('opacity-0', 'opacity-100');
            slides[currentIndex].classList.replace('z-0', 'z-10');

            // Update dots
            dots.forEach((d, i) => {
                d.className = `w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`;
            });

            // Update counter
            counter.textContent = `${currentIndex + 1} / ${validMedia.length}`;
        }

        // ── Left / Right buttons ────────────────────────────────────────────
        const prevBtn = document.createElement('button');
        prevBtn.className = 'absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 text-white rounded-full w-10 h-10 flex items-center justify-center transition';
        prevBtn.setAttribute('aria-label', 'Previous media');
        prevBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>`;
        prevBtn.addEventListener('click', () => goTo(currentIndex - 1));

        const nextBtn = document.createElement('button');
        nextBtn.className = 'absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/75 text-white rounded-full w-10 h-10 flex items-center justify-center transition';
        nextBtn.setAttribute('aria-label', 'Next media');
        nextBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;
        nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

        wrapper.appendChild(prevBtn);
        wrapper.appendChild(nextBtn);

        // ── Keyboard navigation ─────────────────────────────────────────────
        wrapper.setAttribute('tabindex', '0');
        wrapper.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
            if (e.key === 'ArrowRight') goTo(currentIndex + 1);
        });
    }

    return wrapper;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createMediaCarousel };
}
if (typeof window !== 'undefined') {
    window.createMediaCarousel = createMediaCarousel;
}
