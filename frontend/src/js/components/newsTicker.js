/**
 * News Ticker Component
 * Fetches dynamic real estate news from NewsData.io and populates the ticker.
 */
window.initializeNewsTicker = async function () {
    const tickerContent = document.getElementById('news-ticker-content');
    if (!tickerContent) return;

    const fallbackNews = [
        "CBN announces new mortgage rates for first-time home buyers in Nigeria.",
        "Lagos State Government completes new affordable housing scheme in Ikorodu.",
        "Real estate sector in Abuja sees 15% growth in commercial property investments.",
        "New luxury apartments launched in Victoria Island, attracting diaspora investors."
    ];

    const displayNews = (newsArray) => {
        const filtered = newsArray.filter(Boolean).slice(0, 12); // cap at 12 headlines
        const newsItemsHTML = filtered.map(news =>
            `<span class="mx-6 text-sm font-medium hover:text-white transition-colors cursor-pointer">${news}</span>`
        ).join(' &#8226; ');
        // Duplicate for seamless infinite scroll
        tickerContent.innerHTML = newsItemsHTML + ' &#8226; ' + newsItemsHTML;
    };

    try {
        // Fetch from our backend proxy endpoint
        const API_URL = "http://localhost:8000/news/ticker"; // Falls back gracefully if backend builds differently

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data && data.results && data.results.length > 0) {
                const headlines = data.results.map(item => item.title);
                displayNews(headlines);
                return;
            }
        }

        // Fallback if API returned no results or a non-ok status
        displayNews(fallbackNews);

    } catch (error) {
        console.warn("NewsData API fetch failed. Using fallback news.", error.message || error);
        displayNews(fallbackNews);
    }
};
