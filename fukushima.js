
// FUKUSHIMA CASE STUDY

const journeyData = [
  {
    number: "01",
    title: "The Earthquake",
    text: "On 11 March 2011, a magnitude 9.0 earthquake struck off the northeastern coast of Japan. The operating reactors automatically shut down as designed."
  },
  {
    number: "02",
    title: "The Tsunami",
    text: "A massive tsunami reached the Fukushima Daiichi site. Floodwater damaged important buildings and safety infrastructure, including emergency power equipment."
  },
  {
    number: "03",
    title: "Power Failure",
    text: "The flooding caused a loss of electrical power at the station. Backup systems were also affected, leaving the plant with limited ability to operate essential equipment."
  },
  {
    number: "04",
    title: "Cooling Failure",
    text: "Without sufficient power, cooling systems could not remove heat from the operating reactor cores. The temperature inside the reactors continued to rise."
  },
  {
    number: "05",
    title: "Reactor Damage",
    text: "The fuel in Units 1, 2 and 3 overheated and melted. Hydrogen explosions damaged reactor buildings, and radioactive materials were released into the environment."
  }
];

const steps = document.querySelectorAll(".journey-step");
const detailNumber = document.getElementById("detailNumber");
const detailTitle = document.getElementById("detailTitle");
const detailText = document.getElementById("detailText");
const progressBar = document.getElementById("progressBar");

const prevButton = document.getElementById("prevStep");
const nextButton = document.getElementById("nextStep");

let currentStep = 0;

function updateJourney(index) {
  currentStep = Math.max(0, Math.min(index, journeyData.length - 1));

  const data = journeyData[currentStep];

  detailNumber.textContent = data.number;
  detailTitle.textContent = data.title;
  detailText.textContent = data.text;

  progressBar.style.width =
    `${((currentStep + 1) / journeyData.length) * 100}%`;

  steps.forEach((step, i) => {
    step.classList.toggle("active", i === currentStep);
    step.setAttribute("aria-pressed", i === currentStep ? "true" : "false");
  });

  prevButton.disabled = currentStep === 0;
  nextButton.disabled = currentStep === journeyData.length - 1;

  nextButton.textContent =
    currentStep === journeyData.length - 1
      ? "Journey Complete"
      : "Next Step →";
}

// Click on journey steps
steps.forEach((step) => {
  step.addEventListener("click", () => {
    const index = Number(step.dataset.step);

    if (Number.isInteger(index)) {
      updateJourney(index);
    }
  });
});

// Next and Previous
nextButton.addEventListener("click", () => {
  if (currentStep < journeyData.length - 1) {
    updateJourney(currentStep + 1);
  }
});

prevButton.addEventListener("click", () => {
  if (currentStep > 0) {
    updateJourney(currentStep - 1);
  }
});

// Scroll reveal
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observerInstance.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

// Initial state
updateJourney(0);

// Image fallback if an external image fails
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", () => {
    img.style.display = "none";
    img.parentElement.classList.add("image-unavailable");
  });
});
