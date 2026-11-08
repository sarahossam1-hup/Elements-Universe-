
/* =========================================================
   ELEMENTS UNIVERSE
   CHERNOBYL - COMPLETE 3D REACTOR EXPERIENCE
   THREE.JS r128
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const CONFIG = {
    background: 0x07111b,
    ice: 0x9bd7fa,
    metal: 0x879eaf,
    darkMetal: 0x263b4c,
    graphite: 0x394958,
    glow: 0x65baff,

    cameraDistance: 13,
    minZoom: 8,
    maxZoom: 19,

    rotationSpeed: 0.0015
};


/* =========================================================
   2. DOM ELEMENTS
   ========================================================= */

const reactorScene =
    document.getElementById("reactorScene");

const timelinePoints =
    document.querySelectorAll(".timeline-point");

const timelineTitle =
    document.getElementById("timelineTitle");

const timelineDescription =
    document.getElementById("timelineDescription");

const timelineDate =
    document.getElementById("timelineDate");

const playButton =
    document.getElementById("playReplay");

const pauseButton =
    document.getElementById("pauseReplay");

const resetButton =
    document.getElementById("resetReplay");

const progressSlider =
    document.getElementById("replayProgress");

const currentTimeDisplay =
    document.getElementById("replayCurrentTime");

const durationDisplay =
    document.getElementById("replayDuration");

const zoomInButton =
    document.getElementById("zoomInButton");

const zoomOutButton =
    document.getElementById("zoomOutButton");

const resetCameraButton =
    document.getElementById("resetCameraButton");


/* =========================================================
   3. TIMELINE DATA
   ========================================================= */

const timelineData = [
    {
        title: "Test Preparation",
        date: "25–26 APRIL 1986",
        description:
            "A turbine rundown test was being conducted as part of a planned electrical safety test."
    },
    {
        title: "Reactor Instability",
        date: "26 APRIL 1986",
        description:
            "A combination of reactor design characteristics and operating conditions led to an unstable increase in reactivity."
    },
    {
        title: "Reactor Destruction",
        date: "26 APRIL 1986",
        description:
            "The reactor suffered catastrophic destruction. The building was severely damaged and the reactor core was exposed."
    },
    {
        title: "Radioactive Release",
        date: "FOLLOWING THE ACCIDENT",
        description:
            "Radioactive materials were released into the environment, creating contamination across a wide region."
    }
];

let currentTimelineStep = 0;


/* =========================================================
   4. TIMELINE INTERACTION
   ========================================================= */

function updateTimeline(index) {

    if (index < 0 || index >= timelineData.length) {
        return;
    }

    currentTimelineStep = index;

    const event = timelineData[index];

    if (timelineTitle) {
        timelineTitle.textContent = event.title;
    }

    if (timelineDescription) {
        timelineDescription.textContent = event.description;
    }

    if (timelineDate) {
        timelineDate.textContent = event.date;
    }

    timelinePoints.forEach((point, i) => {
        point.classList.toggle("active", i === index);
    });
}

timelinePoints.forEach((point, index) => {
    point.addEventListener("click", () => {
        updateTimeline(index);
        setReplayProgress(index * 100 / 3);
    });
});


/* =========================================================
   5. THREE.JS VARIABLES
   ========================================================= */

let scene;
let camera;
let renderer;

let reactorGroup;
let reactorCore;

let animationFrame;

let isDragging = false;
let isAutoRotating = true;

let previousPointerX = 0;
let previousPointerY = 0;

let cameraDistance = CONFIG.cameraDistance;

let cameraRotationY = 0.55;
let cameraRotationX = 0.28;


/* =========================================================
   6. MATERIALS
   ========================================================= */

function createMaterials() {

    return {

        outerMetal: new THREE.MeshStandardMaterial({
            color: 0x60798d,
            metalness: 0.8,
            roughness: 0.35
        }),

        brightMetal: new THREE.MeshStandardMaterial({
            color: 0xb4c8d8,
            metalness: 0.85,
            roughness: 0.25
        }),

        darkMetal: new THREE.MeshStandardMaterial({
            color: 0x263a4a,
            metalness: 0.75,
            roughness: 0.4
        }),

        graphite: new THREE.MeshStandardMaterial({
            color: 0x455766,
            metalness: 0.35,
            roughness: 0.85
        }),

        graphiteLight: new THREE.MeshStandardMaterial({
            color: 0x728797,
            metalness: 0.4,
            roughness: 0.7
        }),

        channel: new THREE.MeshStandardMaterial({
            color: 0x9bc9e4,
            metalness: 0.7,
            roughness: 0.25,
            emissive: 0x102d42
        }),

        controlRod: new THREE.MeshStandardMaterial({
            color: 0xd0dce5,
            metalness: 0.9,
            roughness: 0.2
        }),

        glass: new THREE.MeshPhysicalMaterial({
            color: 0x5ca7d7,
            metalness: 0.4,
            roughness: 0.25,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false
        }),

        blueGlow: new THREE.MeshBasicMaterial({
            color: CONFIG.glow
        })
    };
}


/* =========================================================
   7. GEOMETRY HELPERS
   ========================================================= */

function addCylinder(
    parent,
    radiusTop,
    radiusBottom,
    height,
    material,
    x,
    y,
    z,
    radialSegments = 48
) {

    const geometry = new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments
    );

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
}


function addBox(
    parent,
    width,
    height,
    depth,
    material,
    x,
    y,
    z
) {

    const geometry = new THREE.BoxGeometry(
        width,
        height,
        depth
    );

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
}


function addRing(
    parent,
    radius,
    tube,
    material,
    x,
    y,
    z
) {

    const geometry = new THREE.TorusGeometry(
        radius,
        tube,
        12,
        96
    );

    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z);

    parent.add(mesh);

    return mesh;
}


/* =========================================================
   8. REACTOR FOUNDATION
   ========================================================= */

function createFoundation(materials) {

    const base = new THREE.Group();

    // Main foundation

    addCylinder(
        base,
        2.5,
        2.5,
        0.32,
        materials.darkMetal,
        0,
        -2.45,
        0
    );

    addCylinder(
        base,
        2.25,
        2.25,
        0.18,
        materials.brightMetal,
        0,
        -2.22,
        0
    );

    addCylinder(
        base,
        1.95,
        1.95,
        0.14,
        materials.darkMetal,
        0,
        -2.05,
        0
    );

    // Support pillars

    for (let i = 0; i < 8; i++) {

        const angle = (i / 8) * Math.PI * 2;

        const x = Math.cos(angle) * 1.95;
        const z = Math.sin(angle) * 1.95;

        addBox(
            base,
            0.22,
            1.2,
            0.22,
            materials.brightMetal,
            x,
            -1.45,
            z
        );
    }

    // Base rings

    addRing(
        base,
        2.3,
        0.035,
        materials.blueGlow,
        0,
        -2.12,
        0
    );

    reactorGroup.add(base);
}


/* =========================================================
   9. REACTOR CORE
   ========================================================= */

function createReactorCore(materials) {

    reactorCore = new THREE.Group();

    // Main graphite moderator structure

    addCylinder(
        reactorCore,
        1.65,
        1.65,
        2.45,
        materials.graphite,
        0,
        0,
        0,
        64
    );

    // Graphite blocks around the core

    const blockCount = 24;

    for (let i = 0; i < blockCount; i++) {

        const angle =
            (i / blockCount) * Math.PI * 2;

        const radius = 1.48;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const block = addBox(
            reactorCore,
            0.34,
            2.2,
            0.34,
            i % 2 === 0
                ? materials.graphiteLight
                : materials.graphite,
            x,
            0,
            z
        );

        block.rotation.y = -angle;
    }

    // Internal vertical channels

    const channelCount = 16;

    for (let i = 0; i < channelCount; i++) {

        const angle =
            (i / channelCount) * Math.PI * 2;

        const radius = 0.95;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        addCylinder(
            reactorCore,
            0.055,
            0.055,
            2.5,
            materials.channel,
            x,
            0,
            z,
            12
        );
    }

    // Central channel

    addCylinder(
        reactorCore,
        0.09,
        0.09,
        2.55,
        materials.brightMetal,
        0,
        0,
        0,
        20
    );

    // Simplified control rod representations

    const rodPositions = [
        [-0.65, -0.65],
        [0.65, -0.65],
        [-0.65, 0.65],
        [0.65, 0.65]
    ];

    rodPositions.forEach(position => {

        addCylinder(
            reactorCore,
            0.045,
            0.045,
            2.8,
            materials.controlRod,
            position[0],
            0.1,
            position[1],
            12
        );
    });

    // Top and bottom graphite plates

    addCylinder(
        reactorCore,
        1.72,
        1.72,
        0.18,
        materials.darkMetal,
        0,
        1.3,
        0
    );

    addCylinder(
        reactorCore,
        1.72,
        1.72,
        0.18,
        materials.darkMetal,
        0,
        -1.3,
        0
    );

    reactorCore.position.y = 0.15;

    reactorGroup.add(reactorCore);
}


/* =========================================================
   10. OUTER REACTOR SHIELD
   ========================================================= */

function createOuterShield(materials) {

    const shield = new THREE.Group();

    // Transparent cylindrical shell

    addCylinder(
        shield,
        2.05,
        2.05,
        3.05,
        materials.glass,
        0,
        0,
        0,
        64
    );

    // Vertical outer supports

    for (let i = 0; i < 12; i++) {

        const angle =
            (i / 12) * Math.PI * 2;

        const radius = 2.08;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        addCylinder(
            shield,
            0.045,
            0.045,
            3.15,
            materials.brightMetal,
            x,
            0,
            z,
            12
        );
    }

    // Structural rings

    addRing(
        shield,
        2.08,
        0.055,
        materials.brightMetal,
        0,
        1.53,
        0
    );

    addRing(
        shield,
        2.08,
        0.055,
        materials.brightMetal,
        0,
        -1.53,
        0
    );

    addRing(
        shield,
        2.08,
        0.035,
        materials.blueGlow,
        0,
        0,
        0
    );

    reactorGroup.add(shield);
}


/* =========================================================
   11. TOP ASSEMBLY
   ========================================================= */

function createTopAssembly(materials) {

    const top = new THREE.Group();

    // Top cover

    addCylinder(
        top,
        1.95,
        1.95,
        0.18,
        materials.outerMetal,
        0,
        1.75,
        0,
        64
    );

    addCylinder(
        top,
        1.55,
        1.55,
        0.12,
        materials.brightMetal,
        0,
        1.88,
        0,
        64
    );

    // Small structural elements

    for (let i = 0; i < 12; i++) {

        const angle =
            (i / 12) * Math.PI * 2;

        const radius = 1.65;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        addCylinder(
            top,
            0.07,
            0.07,
            0.32,
            materials.darkMetal,
            x,
            2.05,
            z,
            16
        );
    }

    // Central assembly

    addCylinder(
        top,
        0.5,
        0.5,
        0.18,
        materials.darkMetal,
        0,
        2.02,
        0
    );

    addRing(
        top,
        0.48,
        0.035,
        materials.blueGlow,
        0,
        2.13,
        0
    );

    reactorGroup.add(top);
}


/* =========================================================
   12. PIPING AND SIDE STRUCTURE
   ========================================================= */

function createPiping(materials) {

    const piping = new THREE.Group();

    // Four symmetrical side pipes

    const pipePositions = [
        [-1.85, 0.5],
        [1.85, 0.5],
        [-1.85, -0.5],
        [1.85, -0.5]
    ];

    pipePositions.forEach(position => {

        const pipe = addCylinder(
            piping,
            0.13,
            0.13,
            2.5,
            materials.outerMetal,
            position[0],
            0,
            position[1],
            24
        );

        pipe.rotation.z = Math.PI / 2;
    });

    // External technical supports

    for (let i = 0; i < 4; i++) {

        const angle =
            (i / 4) * Math.PI * 2;

        const x = Math.cos(angle) * 2.35;
        const z = Math.sin(angle) * 2.35;

        addBox(
            piping,
            0.16,
            2.5,
            0.16,
            materials.darkMetal,
            x,
            0,
            z
        );
    }

    reactorGroup.add(piping);
}


/* =========================================================
   13. COMPLETE REACTOR MODEL
   ========================================================= */

function buildReactor() {

    reactorGroup = new THREE.Group();

    const materials = createMaterials();

    createFoundation(materials);

    createReactorCore(materials);

    createOuterShield(materials);

    createTopAssembly(materials);

    createPiping(materials);

    scene.add(reactorGroup);

    // Slight initial rotation

    reactorGroup.rotation.y = 0.35;
}


/* =========================================================
   14. SCENE SETUP
   ========================================================= */

function initializeScene() {

    if (!reactorScene) {
        console.error("Reactor viewport not found.");
        return;
    }

    if (typeof THREE === "undefined") {
    showSceneError(
        "Three.js failed to load. Check your internet connection."
    );
    return;
}
    const width = Math.max(
        reactorScene.clientWidth,
        1
    );

    const height = Math.max(
        reactorScene.clientHeight,
        1
    );

    scene = new THREE.Scene();

    scene.background = null;

    camera = new THREE.PerspectiveCamera(
        38,
        width / height,
        0.1,
        100
    );

    camera.position.set(8, 5.5, 11);

    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
});

renderer.domElement.style.display = "block";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
renderer.domElement.style.touchAction = "none";
    
    
    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(width, height);

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.15;

    reactorScene.innerHTML = "";

    reactorScene.appendChild(renderer.domElement);

    addLighting();

    addEnvironment();

    buildReactor();

    setupPointerControls();

    setupZoomControls();

    animate();

    console.log("Reactor model initialized successfully.");
}


/* =========================================================
   15. LIGHTING
   ========================================================= */

function addLighting() {

    const ambient = new THREE.AmbientLight(
        0xa7c6dc,
        1.2
    );

    scene.add(ambient);


    const mainLight = new THREE.DirectionalLight(
        0xe4f4ff,
        2
    );

    mainLight.position.set(6, 10, 8);

    mainLight.castShadow = true;

    scene.add(mainLight);


    const blueLight = new THREE.PointLight(
        0x4cafff,
        1.7,
        14
    );

    blueLight.position.set(-5, 2, 4);

    scene.add(blueLight);


    const backLight = new THREE.PointLight(
        0x7dbce9,
        1.5,
        12
    );

    backLight.position.set(2, 5, -6);

    scene.add(backLight);
}


/* =========================================================
   16. ENVIRONMENT
   ========================================================= */

function addEnvironment() {

    // Ground platform

    const groundGeometry =
        new THREE.CircleGeometry(5.5, 80);

    const groundMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x0c1a27,
            metalness: 0.7,
            roughness: 0.55
        });

    const ground = new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;

    ground.position.y = -2.65;

    ground.receiveShadow = true;

    scene.add(ground);


    // Platform rings

    const ringMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x427fa7,
            transparent: true,
            opacity: 0.4
        });

    const ring1 = new THREE.Mesh(
        new THREE.RingGeometry(3.1, 3.12, 100),
        ringMaterial
    );

    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = -2.62;

    scene.add(ring1);


    const ring2 = new THREE.Mesh(
        new THREE.RingGeometry(4.1, 4.12, 100),
        ringMaterial
    );

    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = -2.63;

    scene.add(ring2);
}


/* =========================================================
   17. CAMERA CONTROLS
   ========================================================= */

function updateCamera() {

    if (!camera) return;

    const x =
        cameraDistance *
        Math.sin(cameraRotationY) *
        Math.cos(cameraRotationX);

    const y =
        cameraDistance *
        Math.sin(cameraRotationX);

    const z =
        cameraDistance *
        Math.cos(cameraRotationY) *
        Math.cos(cameraRotationX);

    camera.position.set(x, y, z);

    camera.lookAt(0, 0, 0);
}


function setupPointerControls() {

    if (!renderer) return;

    const canvas = renderer.domElement;

    canvas.addEventListener("pointerdown", event => {

        isDragging = true;
        isAutoRotating = false;

        previousPointerX = event.clientX;
        previousPointerY = event.clientY;

        canvas.setPointerCapture(event.pointerId);
    });


    canvas.addEventListener("pointermove", event => {

        if (!isDragging) return;

        const deltaX =
            event.clientX - previousPointerX;

        const deltaY =
            event.clientY - previousPointerY;

        cameraRotationY += deltaX * 0.006;

        cameraRotationX += deltaY * 0.004;

        cameraRotationX = Math.max(
            -0.9,
            Math.min(0.9, cameraRotationX)
        );

        previousPointerX = event.clientX;
        previousPointerY = event.clientY;

        updateCamera();
    });


    function stopDragging() {
        isDragging = false;
    }

    canvas.addEventListener("pointerup", stopDragging);

    canvas.addEventListener("pointercancel", stopDragging);

    canvas.addEventListener("wheel", event => {

        event.preventDefault();

        cameraDistance += event.deltaY * 0.01;

        cameraDistance = Math.max(
            CONFIG.minZoom,
            Math.min(CONFIG.maxZoom, cameraDistance)
        );

        updateCamera();

    }, { passive: false });

    updateCamera();
}


/* =========================================================
   18. ZOOM BUTTONS
   ========================================================= */

function setupZoomControls() {

    if (zoomInButton) {

        zoomInButton.addEventListener("click", () => {

            cameraDistance = Math.max(
                CONFIG.minZoom,
                cameraDistance - 1
            );

            updateCamera();
        });
    }


    if (zoomOutButton) {

        zoomOutButton.addEventListener("click", () => {

            cameraDistance = Math.min(
                CONFIG.maxZoom,
                cameraDistance + 1
            );

            updateCamera();
        });
    }


    if (resetCameraButton) {

        resetCameraButton.addEventListener("click", () => {

            cameraDistance = CONFIG.cameraDistance;

            cameraRotationY = 0.55;
            cameraRotationX = 0.28;

            isAutoRotating = true;

            updateCamera();
        });
    }
}


/* =========================================================
   19. ANIMATION LOOP
   ========================================================= */

function animate() {

    animationFrame = requestAnimationFrame(animate);

    if (reactorGroup && isAutoRotating && !isDragging) {

        reactorGroup.rotation.y +=
            CONFIG.rotationSpeed;
    }

    if (renderer && scene && camera) {

        renderer.render(scene, camera);
    }
}


/* =========================================================
   20. RESPONSIVE RESIZE
   ========================================================= */

function resizeScene() {

    if (!renderer || !camera || !reactorScene) {
        return;
    }

    const width = Math.max(
        reactorScene.clientWidth,
        1
    );

    const height = Math.max(
        reactorScene.clientHeight,
        1
    );

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

window.addEventListener("resize", resizeScene);


/* =========================================================
   21. REPLAY SYSTEM
   ========================================================= */

const replayDuration = 192;

let replayTime = 0;
let replayPlaying = false;
let replayLastFrame = 0;


function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60);

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}


function setReplayProgress(value) {

    const percentage = Math.max(
        0,
        Math.min(100, Number(value) || 0)
    );

    replayTime =
        (percentage / 100) * replayDuration;

    if (progressSlider) {
        progressSlider.value = percentage;
    }

    if (currentTimeDisplay) {
        currentTimeDisplay.textContent =
            formatTime(replayTime);
    }

    const step = Math.min(
        3,
        Math.floor(percentage / 25)
    );

    updateTimeline(step);
}


function updateReplay(timestamp) {

    if (!replayPlaying) return;

    if (!replayLastFrame) {
        replayLastFrame = timestamp;
    }

    const delta =
        (timestamp - replayLastFrame) / 1000;

    replayLastFrame = timestamp;

    replayTime += delta;

    if (replayTime >= replayDuration) {

        replayTime = replayDuration;

        replayPlaying = false;

        replayLastFrame = 0;
    }

    const percentage =
        (replayTime / replayDuration) * 100;

    if (progressSlider) {
        progressSlider.value = percentage;
    }

    if (currentTimeDisplay) {
        currentTimeDisplay.textContent =
            formatTime(replayTime);
    }

    const step = Math.min(
        3,
        Math.floor(percentage / 25)
    );

    updateTimeline(step);

    if (replayPlaying) {
        requestAnimationFrame(updateReplay);
    }
}


if (durationDisplay) {
    durationDisplay.textContent =
        formatTime(replayDuration);
}


if (playButton) {

    playButton.addEventListener("click", () => {

        if (replayTime >= replayDuration) {
            replayTime = 0;
        }

        if (!replayPlaying) {

            replayPlaying = true;
            replayLastFrame = 0;

            requestAnimationFrame(updateReplay);
        }
    });
}


if (pauseButton) {

    pauseButton.addEventListener("click", () => {

        replayPlaying = false;
        replayLastFrame = 0;
    });
}


if (resetButton) {

    resetButton.addEventListener("click", () => {

        replayPlaying = false;
        replayLastFrame = 0;

        setReplayProgress(0);
    });
}


if (progressSlider) {

    progressSlider.addEventListener("input", event => {

        replayPlaying = false;
        replayLastFrame = 0;

        setReplayProgress(event.target.value);
    });
}


/* =========================================================
   22. SEARCH
   ========================================================= */

const searchInput =
    document.getElementById("archiveSearch");

if (searchInput) {

    searchInput.addEventListener("keydown", event => {

        if (event.key !== "Enter") return;

        const query =
            searchInput.value.trim().toLowerCase();

        if (!query) return;

        const sections = [
            ...document.querySelectorAll(
                "main section[id]"
            )
        ];

        const match = sections.find(section => {

            const text =
                section.innerText.toLowerCase();

            return text.includes(query);
        });

        if (match) {

            match.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } else {

            searchInput.setCustomValidity(
                "No matching section found."
            );

            searchInput.reportValidity();

            searchInput.addEventListener(
                "input",
                () => searchInput.setCustomValidity(""),
                { once: true }
            );
        }
    });
}


/* =========================================================
   23. FULLSCREEN
   ========================================================= */

const fullscreenButton =
    document.getElementById("fullscreenButton");

if (fullscreenButton) {

    fullscreenButton.addEventListener("click", async () => {

        try {

            if (!document.fullscreenElement) {

                await document.documentElement.requestFullscreen();

            } else {

                await document.exitFullscreen();
            }

        } catch (error) {

            console.error(
                "Fullscreen is not available:",
                error
            );
        }
    });
}


/* =========================================================
   24. MOBILE MENU
   ========================================================= */

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const mainNav =
    document.querySelector(".main-nav");

if (mobileMenuButton && mainNav) {

    mobileMenuButton.addEventListener("click", () => {

        const isVisible =
            mainNav.classList.toggle("mobile-visible");

        mobileMenuButton.textContent =
            isVisible ? "✕" : "☰";
    });


    mainNav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            mainNav.classList.remove("mobile-visible");

            mobileMenuButton.textContent = "☰";
        });
    });
}


/* =========================================================
   25. SCENE ERROR HANDLING
   ========================================================= */

function showSceneError(message) {

    if (!reactorScene) return;

    reactorScene.innerHTML = "";

    const error = document.createElement("div");

    error.className = "scene-loading";

    error.textContent = message;

    reactorScene.appendChild(error);

    console.error(message);
}


/* =========================================================
   26. INITIALIZATION
   ========================================================= */

function initializePage() {

    updateTimeline(0);

    initializeScene();

    console.log(
        "ELEMENTS UNIVERSE / CHERNOBYL EXPERIENCE READY"
    );
}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializePage,
        { once: true }
    );

} else {

    initializePage();
}
