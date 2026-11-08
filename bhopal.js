// ===================================
// BHOPAL - ELEMENTS UNIVERSE
// ===================================


// MOBILE MENU

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");

    menuToggle.textContent =
        navLinks.classList.contains("open") ? "✕" : "☰";
});


// CLOSE MENU AFTER CLICK

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.textContent = "☰";
    });
});


// TIMELINE INTERACTION

const timelineEvents = document.querySelectorAll(".timeline-event");

const timelineTitle = document.getElementById("timelineTitle");
const timelineDate = document.getElementById("timelineDate");
const timelineDescription =
    document.getElementById("timelineDescription");

timelineEvents.forEach(event => {

    event.addEventListener("click", () => {

        // Remove active class
        timelineEvents.forEach(item => {
            item.classList.remove("active");
        });

        // Activate selected event
        event.classList.add("active");

        // Update timeline information
        timelineTitle.textContent = event.dataset.title;
        timelineDate.textContent = event.dataset.date;
        timelineDescription.textContent =
            event.dataset.description;

    });

});


// IMAGE ZOOM

const siteImage = document.getElementById("siteImage");

const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");
const zoomReset = document.getElementById("zoomReset");

let zoomLevel = 100;

function updateZoom() {
    siteImage.style.backgroundSize = `${zoomLevel}%`;
}

zoomIn.addEventListener("click", () => {

    if (zoomLevel < 180) {
        zoomLevel += 15;
        updateZoom();
    }

});

zoomOut.addEventListener("click", () => {

    if (zoomLevel > 100) {
        zoomLevel -= 15;
        updateZoom();
    }

});

zoomReset.addEventListener("click", () => {

    zoomLevel = 100;
    updateZoom();

});


// SEARCH

const searchInput = document.getElementById("searchInput");

const searchableElements = document.querySelectorAll(
    ".panel, .feature-card, .content-section"
);

searchInput.addEventListener("input", () => {

    const searchValue = searchInput.value
        .trim()
        .toLowerCase();

    searchableElements.forEach(element => {

        const content = element.textContent.toLowerCase();

        element.classList.remove("search-match");

        if (searchValue && content.includes(searchValue)) {

            element.classList.add("search-match");

            if (element.style.display === "none") {
                element.style.display = "";
            }

        }

    });

    if (searchValue) {

        const firstMatch = [...searchableElements].find(element =>
            element.textContent.toLowerCase().includes(searchValue)
        );

        if (firstMatch) {
            firstMatch.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

    }

});


// LANGUAGE BUTTON

const languageButton = document.getElementById("languageButton");

languageButton.addEventListener("click", () => {

    alert("The Arabic version of this case file is coming soon.");

});


// ACTIVE NAVIGATION

const sections = document.querySelectorAll(
    "main section[id]"
);

const navigationLinks = document.querySelectorAll(
    ".nav-links a"
);

window.addEventListener("scroll", () => {

    let currentSection = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 120;

        if (window.scrollY >= sectionTop) {
            currentSection = section.id;
        }

    });

    navigationLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }

    });

});


// CONSOLE MESSAGE

console.log(
    "%c ELEMENTS UNIVERSE ",
    "background:#e99038;color:#111;padding:8px;font-weight:bold;"
);

console.log("BHOPAL CASE 002 - Page Loaded Successfully");