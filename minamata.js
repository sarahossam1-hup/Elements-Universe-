
// MINAMATA CASE PAGE

// Pollution journey interactive steps
const journeyData = [
  {
    number: "01",
    title: "Industrial Wastewater",
    text: "Methylmercury was produced as a by-product during chemical manufacturing at the Chisso factory. Industrial wastewater carried the contaminant into the surrounding environment."
  },
  {
    number: "02",
    title: "Contaminated Water",
    text: "The methylmercury entered the aquatic environment around Minamata Bay, exposing organisms living in the water to the contaminant."
  },
  {
    number: "03",
    title: "Fish & Shellfish",
    text: "Fish and shellfish absorbed methylmercury. As it moved through the food web, the substance accumulated in aquatic organisms."
  },
  {
    number: "04",
    title: "Human Exposure",
    text: "People who regularly consumed contaminated seafood were exposed to methylmercury, which can damage the nervous system."
  }
];

let currentStep = 0;

const journeyButtons = document.querySelectorAll(".journey-step");
const detailNumber = document.getElementById("detailNumber");
const detailTitle = document.getElementById("detailTitle");
const detailText = document.getElementById("detailText");
const progressBar = document.getElementById("progressBar");
const prevButton = document.getElementById("prevStep");
const nextButton = document.getElementById("nextStep");

function updateJourney(step) {
  currentStep = step;

  const data = journeyData[currentStep];

  detailNumber.textContent = data.number;
  detailTitle.textContent = data.title;
  detailText.textContent = data.text;

  progressBar.style.width = `${((currentStep + 1) / journeyData.length) * 100}%`;

  journeyButtons.forEach((button, index) => {
    button.classList.toggle("active", index === currentStep);
  });

  prevButton.disabled = currentStep === 0;
  nextButton.disabled = currentStep === journeyData.length - 1;

  nextButton.textContent =
    currentStep === journeyData.length - 1
      ? "Journey Complete"
      : "Next Step →";
}

journeyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateJourney(Number(button.dataset.step));
  });
});

prevButton.addEventListener("click", () => {
  if (currentStep > 0) {
    updateJourney(currentStep - 1);
  }
});

nextButton.addEventListener("click", () => {
  if (currentStep < journeyData.length - 1) {
    updateJourney(currentStep + 1);
  }
});

updateJourney(0);


// Scroll reveal animation
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observerInstance.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  revealElements.forEach((element) => {
    observer.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}


// Smooth navigation for internal links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (targetId.length > 1) {
      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }
  });
});


// Image fallback: show a styled placeholder if an external image fails
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", () => {
    img.style.display = "none";

    const parent = img.parentElement;
    if (parent && !parent.querySelector(".image-fallback")) {
      const fallback = document.createElement("div");
      fallback.className = "image-fallback";
      fallback.textContent = "MINAMATA · HISTORICAL ARCHIVE";
      fallback.style.cssText = `
        width: 100%;
        height: 100%;
        min-height: 220px;
        display: grid;
        place-items: center;
        color: #65d5c6;
        background: linear-gradient(135deg, #102d32, #07191d);
        letter-spacing: 3px;
        font-size: 11px;
        text-align: center;
      `;
      parent.appendChild(fallback);
    }
  });
});
