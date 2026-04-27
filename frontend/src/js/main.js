console.log("Frontend initialized");

// Basic dynamic component loading stub for Vanilla JS
async function loadComponents() {
    try {
        const navbar = await fetch('/src/components/navbar.html').then(res => res.text());
        const footer = await fetch('/src/components/footer.html').then(res => res.text());

        const navElem = document.getElementById('navbar');
        const footerElem = document.getElementById('footer');

        if (navElem) navElem.innerHTML = navbar;
        if (footerElem) footerElem.innerHTML = footer;
    } catch (error) {
        console.error("Error loading components:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadComponents);
