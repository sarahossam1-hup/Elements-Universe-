
 // ==========================================
 // ELEMENTS UNIVERSE
 // COMPLETE RESPONSIVE JAVASCRIPT
 // ==========================================


// ==========================================
// 1. API & GLOBAL VARIABLES
// ==========================================

const API_URL =
    "https://api.periodictableofelements.org/elements/";

const table = document.getElementById("periodicTable");
const searchInput = document.getElementById("searchInput");
const sphereContainer = document.getElementById("atomSphere");

let elements = [];

let scene = null;
let camera = null;
let renderer = null;
let sphere = null;

let animationId = null;
let resizeObserver = null;

let isDragging = false;
let moved = false;

let previousX = 0;
let previousY = 0;

let rotationVelocity = 0.0025;

const sphereRadius = 4;

let requestVersion = 0;


// ==========================================
// 2. CREATE MODAL
// ==========================================

const modal = document.createElement("div");

modal.id = "elementModal";
modal.className = "element-modal";

document.body.appendChild(modal);


// ==========================================
// 3. SAFE HTML FUNCTIONS
// ==========================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    })[char]);

}


function safeValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "Not available";

    }

    if (Array.isArray(value)) {

        return value.join(", ");

    }

    if (typeof value === "boolean") {

        return value ? "Yes" : "No";

    }

    return String(value);

}


function getElementNumber(element) {

    return Number(element.atomic_number);

}


// ==========================================
// 4. LOAD ALL ELEMENTS
// ==========================================

async function loadElements() {

    table.innerHTML = "<p>Loading elements...</p>";

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {

            throw new Error("Failed to load elements");

        }

        const data = await response.json();

        if (!Array.isArray(data)) {

            throw new Error("Invalid API response");

        }

        elements = data;

const atomicNumbers = elements.map(
    element => Number(element.atomic_number)
);

const uniqueNumbers = new Set(atomicNumbers);

const missingElements = [];

for (let i = 1; i <= 118; i++) {
    if (!uniqueNumbers.has(i)) {
        missingElements.push(i);
    }
}

const duplicates = atomicNumbers.filter(
    (number, index) => atomicNumbers.indexOf(number) !== index
);

console.log("Total Elements:", elements.length);
console.log("Unique Elements:", uniqueNumbers.size);
console.log("Missing Elements:", missingElements);
console.log("Duplicate Elements:", duplicates);

if (
    elements.length === 118 &&
    uniqueNumbers.size === 118 &&
    missingElements.length === 0 &&
    duplicates.length === 0
) {
    console.log("SUCCESS: All 118 elements loaded!");
} else {
    console.warn("WARNING: Element data is incomplete!");
}
        displayElements(elements);

        createLegend(elements);

        createElementSphere();

    } catch (error) {

        table.innerHTML = `
            <p>
                Unable to load elements.
                Check your internet connection.
            </p>
        `;

        console.error("Loading Error:", error);

    }

}


// ==========================================
// 5. DISPLAY PERIODIC TABLE
// ==========================================

function displayElements(data) {

    table.innerHTML = "";

    if (!data.length) {

        table.innerHTML = `
            <p style="
                grid-column: 1 / -1;
                text-align: center;
                color: #9ba9bd;
            ">
                No elements found.
            </p>
        `;

        return;

    }

    data.forEach(element => {

        const card = document.createElement("div");

        card.className = "element";

        card.style.setProperty(
            "--element-color",
            element.category_color || "#00d9ff"
        );

        const column = Number(element.grid_column);
        const row = Number(element.grid_row);

        if (Number.isFinite(column) && column > 0) {

            card.style.gridColumn = column;

        }

        if (Number.isFinite(row) && row > 0) {

            card.style.gridRow = row;

        }

        card.dataset.number = getElementNumber(element);

        card.innerHTML = `

            <span class="atomic-number">
                ${escapeHTML(element.atomic_number)}
            </span>

            <h3>${escapeHTML(element.symbol)}</h3>

            <p>${escapeHTML(element.name)}</p>

            <small>${escapeHTML(safeValue(element.atomic_mass))}</small>

        `;

        table.appendChild(card);

    });

}


// ==========================================
// 6. CATEGORY LEGEND
// ==========================================

function createLegend(data) {

    const section = document.querySelector(".periodic-section");

    if (!section) return;

    let legend = document.querySelector(".category-legend");

    if (!legend) {

        legend = document.createElement("div");

        legend.className = "category-legend";

        section.insertBefore(legend, table);

    }

    const categories = new Map();

    data.forEach(element => {

        const category = element.category || "Other";

        if (!categories.has(category)) {

            categories.set(
                category,
                element.category_color || "#00d9ff"
            );

        }

    });

    legend.innerHTML = "";

    categories.forEach((color, category) => {

        const item = document.createElement("span");

        const icon = document.createElement("i");

        icon.style.background = color;

        icon.style.boxShadow = `0 0 12px ${color}`;

        item.appendChild(icon);

        item.appendChild(
            document.createTextNode(
                category.replaceAll("_", " ")
            )
        );

        legend.appendChild(item);

    });

}


// ==========================================
// 7. SEARCH ELEMENTS
// ==========================================

searchInput.addEventListener("input", function () {

    const query = this.value.toLowerCase().trim();

    const filtered = elements.filter(element => {

        const name = String(element.name || "").toLowerCase();

        const symbol = String(element.symbol || "").toLowerCase();

        const category = String(
            element.category || ""
        ).toLowerCase();

        const number = String(element.atomic_number || "");

        return (

            name.includes(query) ||

            symbol.includes(query) ||

            number.includes(query) ||

            category.includes(query)

        );

    });

    displayElements(filtered);

});


// ==========================================
// 8. ELEMENT CLICK EVENT
// ==========================================

table.addEventListener("click", function (event) {

    const card = event.target.closest(".element");

    if (!card) return;

    const number = Number(card.dataset.number);

    const element = elements.find(
        el => getElementNumber(el) === number
    );

    if (element) {

        showElementDetails(element);

    }

});


// ==========================================
// 9. SHOW ELEMENT DETAILS
// ==========================================

async function showElementDetails(element) {

    const currentRequest = ++requestVersion;

    modal.classList.add("active");

    modal.innerHTML = `

        <div class="modal-content">

            <button class="close-btn"
                aria-label="Close details">×</button>

            <p>Loading element information...</p>

        </div>

    `;

    try {

        const response = await fetch(
            API_URL + getElementNumber(element) + "/"
        );

        if (!response.ok) {

            throw new Error("Unable to load element details");

        }

        const data = await response.json();

        if (currentRequest !== requestVersion) return;

        renderDetails(data);

    } catch (error) {

        if (currentRequest !== requestVersion) return;

        const content = modal.querySelector(".modal-content");

        if (content) {

            content.innerHTML = `

                <button class="close-btn"
                    aria-label="Close details">×</button>

                <p>Could not load additional information.</p>

            `;

        }

        console.error("Details Error:", error);

    }

}


// ==========================================
// 10. RENDER ELEMENT INFORMATION
// ==========================================

function renderDetails(data) {

    const physicalProperties = [

        ["Atomic Mass", data.atomic_mass, "u"],

        ["Density", data.density, ""],

        ["Melting Point", data.melting_point, "K"],

        ["Boiling Point", data.boiling_point, "K"],

        ["Physical State", data.state_at_room_temp, ""],

        ["Atomic Radius", data.atomic_radius, "pm"]

    ];

    const chemicalProperties = [

        ["Electronegativity", data.electronegativity, ""],

        ["Oxidation States", data.oxidation_states, ""],

        [
            "Electron Configuration",
            data.electron_configuration_semantic,
            ""
        ],

        ["Electron Affinity", data.electron_affinity, ""],

        ["Ionization Energy", data.ionization_energy, "kJ/mol"],

        ["Block", data.block, ""]

    ];


    function createProperties(properties) {

        return properties.map(([label, value, unit]) => {

            const available =
                value !== null &&
                value !== undefined &&
                value !== "";

            return `

                <div class="detail-box">

                    <span>${escapeHTML(label)}</span>

                    <strong>

                        ${escapeHTML(safeValue(value))}

                        ${available
                            ? " " + escapeHTML(unit)
                            : ""}

                    </strong>

                </div>

            `;

        }).join("");

    }


    modal.innerHTML = `

        <div class="modal-content full-details">

            <button class="close-btn"
                aria-label="Close details">×</button>

            <div class="element-symbol">

                ${escapeHTML(data.symbol)}

            </div>

            <h2>${escapeHTML(data.name)}</h2>

            <p class="element-category">

                ${escapeHTML(safeValue(data.category))}

            </p>

            <div class="basic-info">

                <p>
                    Atomic Number:
                    ${escapeHTML(data.atomic_number)}
                </p>

                <p>
                    Group:
                    ${escapeHTML(safeValue(data.group_number))}
                </p>

                <p>
                    Period:
                    ${escapeHTML(safeValue(data.period))}
                </p>

            </div>

            <h3 class="details-heading">
                Physical Properties
            </h3>

            <div class="details-grid">

                ${createProperties(physicalProperties)}

            </div>

            <h3 class="details-heading">
                Chemical Properties
            </h3>

            <div class="details-grid">

                ${createProperties(chemicalProperties)}

            </div>

            <h3 class="details-heading">
                Atomic Structure
            </h3>

            <div class="detail-box">

                <span>Electrons Per Shell</span>

                <strong>
                    ${escapeHTML(safeValue(data.electrons_per_shell))}
                </strong>

            </div>

            <h3 class="details-heading">
                Discovery Information
            </h3>

            <div class="details-grid">

                <div class="detail-box">

                    <span>Discovery Year</span>

                    <strong>
                        ${escapeHTML(safeValue(data.discovery_year))}
                    </strong>

                </div>

                <div class="detail-box">

                    <span>Discovered By</span>

                    <strong>
                        ${escapeHTML(safeValue(data.discovered_by))}
                    </strong>

                </div>

            </div>

        </div>

    `;

}


// ==========================================
// 11. CLOSE MODAL
// ==========================================

function closeElementDetails() {

    modal.classList.remove("active");

    requestVersion++;

}

window.closeElementDetails = closeElementDetails;


modal.addEventListener("click", function (event) {

    if (
        event.target === modal ||
        event.target.closest(".close-btn")
    ) {

        closeElementDetails();

    }

});


document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeElementDetails();

    }

});


// ==========================================
// 12. CREATE 3D ELEMENT SPHERE
// ==========================================

function createElementSphere() {

    if (!sphereContainer || !window.THREE) {

        console.error(
            "Three.js or atomSphere container missing"
        );

        return;

    }

    if (renderer) return;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        45,
        1,
        0.1,
        1000
    );

    camera.position.z = 12;


    // ======================================
    // WEBGL RENDERER
    // ======================================

    renderer = new THREE.WebGLRenderer({

        antialias: true,

        alpha: true

    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.75)
    );

    renderer.setSize(
        sphereContainer.clientWidth || 1,
        sphereContainer.clientHeight || 1
    );

    sphereContainer.appendChild(renderer.domElement);


    // ======================================
    // MAIN SPHERE GROUP
    // ======================================

    sphere = new THREE.Group();

    scene.add(sphere);


    // ======================================
    // ELEMENT DISTRIBUTION
    // ======================================

    const positions = [];

    const goldenAngle =
        Math.PI * (3 - Math.sqrt(5));

    elements.forEach((element, i) => {

        const total = elements.length;

        const y = 1 - (i / (total - 1)) * 2;

        const radius = Math.sqrt(1 - y * y);

        const angle = goldenAngle * i;

        const x = Math.cos(angle) * radius;

        const z = Math.sin(angle) * radius;


        const position = new THREE.Vector3(

            x * sphereRadius,

            y * sphereRadius,

            z * sphereRadius

        );

        positions.push(position);


        // ==================================
        // ELEMENT POINT
        // ==================================

        const pointGeometry = new THREE.SphereGeometry(
            0.045,
            12,
            12
        );

        const pointMaterial = new THREE.MeshBasicMaterial({

            color: element.category_color || "#00d9ff"

        });

        const point = new THREE.Mesh(
            pointGeometry,
            pointMaterial
        );

        point.position.copy(position);

        sphere.add(point);


        // ==================================
        // ELEMENT SYMBOL TEXTURE
        // ==================================

        const canvas = document.createElement("canvas");

        canvas.width = 256;

        canvas.height = 256;

        const context = canvas.getContext("2d");

        context.clearRect(0, 0, 256, 256);

        context.fillStyle =
            element.category_color || "#00d9ff";

        context.font = "bold 95px Arial";

        context.textAlign = "center";

        context.textBaseline = "middle";

        context.shadowColor = context.fillStyle;

        context.shadowBlur = 20;

        context.fillText(
            element.symbol,
            128,
            128
        );


        const texture = new THREE.CanvasTexture(canvas);

        const spriteMaterial = new THREE.SpriteMaterial({

            map: texture,

            transparent: true,

            depthWrite: false

        });

        const sprite = new THREE.Sprite(spriteMaterial);

        sprite.position.copy(
            position.clone().multiplyScalar(1.07)
        );

        sprite.scale.set(0.65, 0.65, 1);

        sprite.userData.element = element;

        sphere.add(sprite);

    });


    // ======================================
    // CONNECTION LINES
    // ======================================

    const linePositions = [];

    for (let i = 0; i < positions.length; i++) {

        for (let j = i + 1; j < positions.length; j++) {

            const distance = positions[i].distanceTo(
                positions[j]
            );

            if (distance < 1.3) {

                linePositions.push(

                    positions[i].x,
                    positions[i].y,
                    positions[i].z,

                    positions[j].x,
                    positions[j].y,
                    positions[j].z

                );

            }

        }

    }


    const lineGeometry = new THREE.BufferGeometry();

    lineGeometry.setAttribute(

        "position",

        new THREE.Float32BufferAttribute(
            linePositions,
            3
        )

    );


    const lineMaterial = new THREE.LineBasicMaterial({

        color: 0x00d9ff,

        transparent: true,

        opacity: 0.12

    });


    const lines = new THREE.LineSegments(
        lineGeometry,
        lineMaterial
    );

    sphere.add(lines);


    // ======================================
    // OUTER GLOW SPHERE
    // ======================================

    const glowGeometry = new THREE.SphereGeometry(
        sphereRadius,
        32,
        32
    );

    const glowMaterial = new THREE.MeshBasicMaterial({

        color: 0x00d9ff,

        wireframe: true,

        transparent: true,

        opacity: 0.035

    });

    const glow = new THREE.Mesh(
        glowGeometry,
        glowMaterial
    );

    sphere.add(glow);


    // ======================================
    // DRAG & TOUCH CONTROLS
    // ======================================

    const canvasElement = renderer.domElement;

    canvasElement.style.cursor = "grab";

    canvasElement.style.touchAction = "none";


    canvasElement.addEventListener("pointerdown", event => {

        isDragging = true;

        moved = false;

        previousX = event.clientX;

        previousY = event.clientY;

        canvasElement.style.cursor = "grabbing";

        canvasElement.setPointerCapture(event.pointerId);

    });


    canvasElement.addEventListener("pointermove", event => {

        if (!isDragging) return;

        const deltaX = event.clientX - previousX;

        const deltaY = event.clientY - previousY;

        if (
            Math.abs(deltaX) > 2 ||
            Math.abs(deltaY) > 2
        ) {

            moved = true;

        }

        sphere.rotation.y += deltaX * 0.005;

        sphere.rotation.x += deltaY * 0.005;

        previousX = event.clientX;

        previousY = event.clientY;

    });


    function stopDragging() {

        isDragging = false;

        canvasElement.style.cursor = "grab";

    }


    canvasElement.addEventListener(
        "pointerup",
        stopDragging
    );

    canvasElement.addEventListener(
        "pointercancel",
        stopDragging
    );

    canvasElement.addEventListener(
        "lostpointercapture",
        stopDragging
    );


    // ======================================
    // CLICK ELEMENT ON SPHERE
    // ======================================

    const raycaster = new THREE.Raycaster();

    raycaster.params.Sprite.threshold = 0.15;

    const mouse = new THREE.Vector2();


    canvasElement.addEventListener("click", event => {

        if (moved) {

            moved = false;

            return;

        }

        const rect = canvasElement.getBoundingClientRect();

        mouse.x =
            ((event.clientX - rect.left) / rect.width) * 2 - 1;

        mouse.y =
            -((event.clientY - rect.top) / rect.height) * 2 + 1;


        raycaster.setFromCamera(mouse, camera);


        const sprites = sphere.children.filter(child =>

            child.isSprite && child.userData.element

        );


        const intersects = raycaster.intersectObjects(sprites);


        if (intersects.length > 0) {

            const selectedElement =
                intersects[0].object.userData.element;

            showElementDetails(selectedElement);

        }

    });


    // ======================================
    // RESPONSIVE RESIZE OBSERVER
    // ======================================

    resizeSphere();

    if ("ResizeObserver" in window) {

        resizeObserver = new ResizeObserver(() => {

            resizeSphere();

        });

        resizeObserver.observe(sphereContainer);

    } else {

        window.addEventListener("resize", resizeSphere);

    }


    // ======================================
    // START ANIMATION
    // ======================================

    animateSphere();

}


// ==========================================
// 13. SPHERE ANIMATION
// ==========================================

function animateSphere() {

    animationId = requestAnimationFrame(animateSphere);

    if (!renderer || !scene || !camera) return;

    if (!isDragging && sphere) {

        sphere.rotation.y += rotationVelocity;

        sphere.rotation.x += 0.0003;

    }

    renderer.render(scene, camera);

}


// ==========================================
// 14. RESPONSIVE SPHERE RESIZE
// ==========================================

function resizeSphere() {

    if (!renderer || !sphereContainer || !camera) return;

    const width = sphereContainer.clientWidth;

    const height = sphereContainer.clientHeight;

    if (!width || !height) return;

    const aspect = width / height;

    camera.aspect = aspect;

    const verticalAngle = THREE.MathUtils.degToRad(
        camera.fov / 2
    );

    const effectiveAngle = Math.atan(

        Math.tan(verticalAngle) * Math.min(1, aspect)

    );

    // Calculate camera distance dynamically

    camera.position.z =
        (sphereRadius * 1.18) / Math.sin(effectiveAngle);

    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.75)
    );

    renderer.setSize(
        width,
        height,
        false
    );

}


// ==========================================
// 15. START APPLICATION
// ==========================================

loadElements();



document.addEventListener("DOMContentLoaded", () => {
    const creatorName = "SARAH HOSSAM LOTFY";
    const nameElement = document.getElementById("sarah-name");

    if (!nameElement) return;

    let index = 0;
    nameElement.textContent = "";

    function typeName() {
        if (index < creatorName.length) {
            nameElement.textContent += creatorName[index];
            index++;

            setTimeout(typeName, 150);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            typeName();
            observer.disconnect();
        }
    });

    observer.observe(nameElement);
});
