// ============================================================
// BOOSTBALL v0.4.1 — MINI BEAST
// Performance + Quality Update
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ============================================================
// PERFORMANCE / QUALITY
// ============================================================

const QUALITY = {
    fpsLimit: 60,
    pixelRatio: 1,
    shadows: true,
    shadowMapSize: 1024,
    showFPS: true
};

// ============================================================
// BASIC SETUP
// ============================================================

const canvas = document.getElementById("game");

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        QUALITY.pixelRatio
    )
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled =
    QUALITY.shadows;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x07111f);

scene.fog =
    new THREE.Fog(
        0x07111f,
        145,
        235
    );

const camera =
    new THREE.PerspectiveCamera(
        72,
        window.innerWidth /
            window.innerHeight,
        0.1,
        500
    );

camera.position.set(
    -14,
    7,
    0
);

// ============================================================
// REUSABLE SCRATCH VECTORS
//
// These exist once instead of creating thousands of temporary
// Vector3 objects every minute.
// ============================================================

const tempForward =
    new THREE.Vector3();

const tempRight =
    new THREE.Vector3();

const tempA =
    new THREE.Vector3();

const tempB =
    new THREE.Vector3();

const tempC =
    new THREE.Vector3();

const tempD =
    new THREE.Vector3();

// ============================================================
// LIGHTING
// ============================================================

const hemisphere =
    new THREE.HemisphereLight(
        0xd8f2ff,
        0x16351d,
        2.25
    );

scene.add(hemisphere);

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2.8
    );

sun.position.set(
    -35,
    60,
    30
);

sun.castShadow =
    QUALITY.shadows;

sun.shadow.mapSize.set(
    QUALITY.shadowMapSize,
    QUALITY.shadowMapSize
);

// Tighter shadow volume than v0.4.
// No reason to calculate shadows three suburbs away.

sun.shadow.camera.left = -90;
sun.shadow.camera.right = 90;
sun.shadow.camera.top = 58;
sun.shadow.camera.bottom = -58;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 150;

sun.shadow.bias = -0.0003;

scene.add(sun);

// ============================================================
// ARENA
// ============================================================

const FIELD_LENGTH = 154;
const FIELD_WIDTH = 92;

const HALF_LENGTH =
    FIELD_LENGTH / 2;

const HALF_WIDTH =
    FIELD_WIDTH / 2;

const WALL_HEIGHT = 15;

const GOAL_WIDTH = 29;
const GOAL_HEIGHT = 13;
const GOAL_DEPTH = 12;

const BALL_RADIUS = 1.8;

// ============================================================
// FIELD
// ============================================================

const fieldMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x21854c,
        roughness: 0.84,
        metalness: 0
    });

const field =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            FIELD_LENGTH,
            FIELD_WIDTH
        ),
        fieldMaterial
    );

field.rotation.x =
    -Math.PI / 2;

field.receiveShadow = true;

scene.add(field);

// ============================================================
// SUBTLE FIELD STRIPES
// ============================================================

const stripeMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.022,
        depthWrite: false
    });

const STRIPE_COUNT = 10;

const stripeWidth =
    FIELD_LENGTH /
    STRIPE_COUNT;

const stripeGeometry =
    new THREE.PlaneGeometry(
        stripeWidth,
        FIELD_WIDTH
    );

for (
    let i = 0;
    i < STRIPE_COUNT;
    i += 2
) {

    const stripe =
        new THREE.Mesh(
            stripeGeometry,
            stripeMaterial
        );

    stripe.rotation.x =
        -Math.PI / 2;

    stripe.position.set(
        -HALF_LENGTH +
            stripeWidth / 2 +
            i * stripeWidth,
        0.012,
        0
    );

    scene.add(stripe);
}

// ============================================================
// FIELD MARKINGS
// ============================================================

const lineMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85
    });

function groundLine(
    width,
    depth,
    x,
    z
) {

    const line =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                width,
                depth
            ),
            lineMaterial
        );

    line.rotation.x =
        -Math.PI / 2;

    line.position.set(
        x,
        0.025,
        z
    );

    scene.add(line);

    return line;
}

// Halfway line

groundLine(
    0.22,
    FIELD_WIDTH,
    0,
    0
);

// Centre circle.
//
// v0.4 used 100 points.
// 64 is visually indistinguishable at this scale.

const circlePoints = [];

const CIRCLE_SEGMENTS = 64;

for (
    let i = 0;
    i <= CIRCLE_SEGMENTS;
    i++
) {

    const angle =
        i /
        CIRCLE_SEGMENTS *
        Math.PI *
        2;

    circlePoints.push(
        new THREE.Vector3(
            Math.cos(angle) * 10,
            0.035,
            Math.sin(angle) * 10
        )
    );
}

scene.add(
    new THREE.Line(
        new THREE.BufferGeometry()
            .setFromPoints(
                circlePoints
            ),

        new THREE.LineBasicMaterial({
            color: 0xffffff
        })
    )
);

// Goal-area reference markings

groundLine(
    16,
    0.18,
    -HALF_LENGTH + 13,
    GOAL_WIDTH / 2 + 4
);

groundLine(
    16,
    0.18,
    -HALF_LENGTH + 13,
    -GOAL_WIDTH / 2 - 4
);

groundLine(
    16,
    0.18,
    HALF_LENGTH - 13,
    GOAL_WIDTH / 2 + 4
);

groundLine(
    16,
    0.18,
    HALF_LENGTH - 13,
    -GOAL_WIDTH / 2 - 4
);

// ============================================================
// WALLS
// ============================================================

const glassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x8fdcff,
        transparent: true,
        opacity: 0.17,
        roughness: 0.3,
        depthWrite: false
    });

function createWall(
    width,
    height,
    depth,
    x,
    y,
    z,
    material = glassMaterial
) {

    const wall =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            material
        );

    wall.position.set(
        x,
        y,
        z
    );

    wall.receiveShadow = false;

    scene.add(wall);

    return wall;
}

// Side barriers

createWall(
    FIELD_LENGTH + 1,
    WALL_HEIGHT,
    0.6,
    0,
    WALL_HEIGHT / 2,
    HALF_WIDTH
);

createWall(
    FIELD_LENGTH + 1,
    WALL_HEIGHT,
    0.6,
    0,
    WALL_HEIGHT / 2,
    -HALF_WIDTH
);

// End wall pieces

const endPieceDepth =
    (
        FIELD_WIDTH -
        GOAL_WIDTH
    ) / 2;

function createEndWalls(x) {

    const offset =
        GOAL_WIDTH / 2 +
        endPieceDepth / 2;

    createWall(
        0.6,
        WALL_HEIGHT,
        endPieceDepth,
        x,
        WALL_HEIGHT / 2,
        offset
    );

    createWall(
        0.6,
        WALL_HEIGHT,
        endPieceDepth,
        x,
        WALL_HEIGHT / 2,
        -offset
    );
}

createEndWalls(
    -HALF_LENGTH
);

createEndWalls(
    HALF_LENGTH
);

// ============================================================
// GOALS
// ============================================================

function createGoal(
    side,
    colour
) {

    const mouthX =
        side *
        HALF_LENGTH;

    const centreX =
        mouthX +
        side *
        GOAL_DEPTH / 2;

    const backX =
        mouthX +
        side *
        GOAL_DEPTH;

    const transparent =
        new THREE.MeshStandardMaterial({
            color: colour,
            transparent: true,
            opacity: 0.24,
            roughness: 0.45,
            depthWrite: false
        });

    const frame =
        new THREE.MeshStandardMaterial({
            color: colour,
            roughness: 0.35
        });

    // Back

    createWall(
        0.7,
        GOAL_HEIGHT,
        GOAL_WIDTH,
        backX,
        GOAL_HEIGHT / 2,
        0,
        transparent
    );

    // Roof

    createWall(
        GOAL_DEPTH,
        0.6,
        GOAL_WIDTH,
        centreX,
        GOAL_HEIGHT,
        0,
        transparent
    );

    // Goal sides

    createWall(
        GOAL_DEPTH,
        GOAL_HEIGHT,
        0.6,
        centreX,
        GOAL_HEIGHT / 2,
        GOAL_WIDTH / 2,
        transparent
    );

    createWall(
        GOAL_DEPTH,
        GOAL_HEIGHT,
        0.6,
        centreX,
        GOAL_HEIGHT / 2,
        -GOAL_WIDTH / 2,
        transparent
    );

    // Posts

    const postGeometry =
        new THREE.BoxGeometry(
            0.8,
            GOAL_HEIGHT,
            0.8
        );

    for (
        const z of [
            -GOAL_WIDTH / 2,
            GOAL_WIDTH / 2
        ]
    ) {

        const post =
            new THREE.Mesh(
                postGeometry,
                frame
            );

        post.position.set(
            mouthX,
            GOAL_HEIGHT / 2,
            z
        );

        scene.add(post);
    }

    // Crossbar

    const crossbar =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.8,
                0.8,
                GOAL_WIDTH
            ),
            frame
        );

    crossbar.position.set(
        mouthX,
        GOAL_HEIGHT,
        0
    );

    scene.add(crossbar);
}

createGoal(
    -1,
    0x168cff
);

createGoal(
    1,
    0xff7417
);

// ============================================================
// CAR
// ============================================================

const car =
    new THREE.Group();

const bodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x168cff,
        roughness: 0.35,
        metalness: 0.25
    });

const body =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.4,
            1.1,
            2.35
        ),
        bodyMaterial
    );

body.position.y = 1;
body.castShadow =
    QUALITY.shadows;

car.add(body);

// Nose

const noseMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x0870d5,
        roughness: 0.4
    });

const nose =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            1.2,
            0.55,
            2.15
        ),
        noseMaterial
    );

nose.position.set(
    2.15,
    0.72,
    0
);

nose.castShadow =
    QUALITY.shadows;

car.add(nose);

// Cabin

const cabinMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xa4ecff,
        roughness: 0.2
    });

const cabin =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            1.9,
            0.85,
            1.75
        ),
        cabinMaterial
    );

cabin.position.set(
    -0.25,
    1.72,
    0
);

cabin.castShadow =
    QUALITY.shadows;

car.add(cabin);

// ============================================================
// WHEELS
// ============================================================

const wheels = [];

const wheelGeometry =
    new THREE.CylinderGeometry(
        0.55,
        0.55,
        0.45,
        16
    );

// Bake wheel orientation into shared geometry.

wheelGeometry.rotateX(
    Math.PI / 2
);

const wheelMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.9
    });

function createWheel(
    x,
    z
) {

    // v0.4 cloned the geometry four times.
    // Three.js meshes can safely share immutable geometry.

    const wheel =
        new THREE.Mesh(
            wheelGeometry,
            wheelMaterial
        );

    wheel.position.set(
        x,
        0.55,
        z
    );

    wheel.castShadow =
        QUALITY.shadows;

    car.add(wheel);

    wheels.push(wheel);
}

createWheel(
    -1.35,
    -1.2
);

createWheel(
    -1.35,
    1.2
);

createWheel(
    1.35,
    -1.2
);

createWheel(
    1.35,
    1.2
);

scene.add(car);

// ============================================================
// BALL
// ============================================================

const ball =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            BALL_RADIUS,
            24,
            16
        ),
        new THREE.MeshStandardMaterial({
            color: 0xf7f7f7,
            roughness: 0.5
        })
    );

ball.castShadow =
    QUALITY.shadows;

scene.add(ball);

const ballVelocity =
    new THREE.Vector3();

// ============================================================
// CAR PHYSICS
// ============================================================

const carVelocity =
    new THREE.Vector3();

let carRotation = 0;

let verticalVelocity = 0;

let grounded = true;

let boostAmount = 33;

// Engine

const ACCELERATION = 29;
const REVERSE_ACCELERATION = 18;
const BRAKING = 34;

// Speeds

const DRIVE_TOP_SPEED = 29;
const REVERSE_TOP_SPEED = 15;
const BOOST_TOP_SPEED = 45;

// Boost

const BOOST_ACCELERATION = 43;
const BOOST_USAGE = 33;

// Ground physics

const NORMAL_GRIP = 7.0;
const POWERSLIDE_GRIP = 1.15;

const COAST_DRAG = 0.18;
const POWERED_DRAG = 0.06;

// Air

const GRAVITY = 27;

// Steering

const LOW_SPEED_STEER = 2.65;
const HIGH_SPEED_STEER = 1.65;

const POWERSLIDE_STEER_MULTIPLIER =
    1.35;

// ============================================================
// CONTROL BINDINGS
// ============================================================

const controls = {

    throttle: "w",
    reverse: "s",

    left: "a",
    right: "d",

    jump: " ",
    boost: "shift",

    powerslide: "control",

    ballCam: "c",
    reset: "r",

    menu: "tab"
};

// ============================================================
// INPUT
// ============================================================

const keys = {};
const pressed = {};

let menuOpen = false;

window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key
                .toLowerCase();

        // TAB MENU

        if (
            key ===
                controls.menu &&
            !pressed[key]
        ) {

            event.preventDefault();

            menuOpen =
                !menuOpen;

            updateMenu();

            pressed[key] =
                true;

            return;
        }

        if (menuOpen) {

            event.preventDefault();

            return;
        }

        keys[key] = true;

        if (!pressed[key]) {

            pressed[key] =
                true;

            if (
                key ===
                    controls.jump &&
                !goalPause &&
                !matchEnded
            ) {

                jump();
            }

            if (
                key ===
                controls.ballCam
            ) {

                ballCam =
                    !ballCam;
            }

            if (
                key ===
                controls.reset
            ) {

                if (matchEnded) {

                    startNewMatch();

                } else {

                    resetKickoff();
                }
            }
        }

        if (
            key === " " ||
            key === "tab" ||
            key.startsWith(
                "arrow"
            )
        ) {

            event.preventDefault();
        }
    }
);

window.addEventListener(
    "keyup",
    event => {

        const key =
            event.key
                .toLowerCase();

        keys[key] = false;
        pressed[key] = false;
    }
);

// ============================================================
// BOOST PADS
// ============================================================

const boostPads = [];

const decalMaterialSmall =
    new THREE.MeshBasicMaterial({
        color: 0xd6a728,
        transparent: true,
        opacity: 0.62,
        side: THREE.DoubleSide
    });

const decalMaterialBig =
    new THREE.MeshBasicMaterial({
        color: 0xff8c18,
        transparent: true,
        opacity: 0.76,
        side: THREE.DoubleSide
    });

const markerMaterialSmall =
    new THREE.MeshBasicMaterial({
        color: 0x75621d,
        transparent: true,
        opacity: 0.52,
        side: THREE.DoubleSide
    });

const markerMaterialBig =
    new THREE.MeshBasicMaterial({
        color: 0x7c4915,
        transparent: true,
        opacity: 0.52,
        side: THREE.DoubleSide
    });

const pickupMaterialSmall =
    new THREE.MeshStandardMaterial({
        color: 0xffc72c,
        emissive: 0x6a3a00,
        emissiveIntensity: 1.2
    });

const pickupMaterialBig =
    new THREE.MeshStandardMaterial({
        color: 0xff8c18,
        emissive: 0x7d2900,
        emissiveIntensity: 1.7
    });

// Shared boost geometry.

const smallDecalGeometry =
    new THREE.RingGeometry(
        0.8,
        1.35,
        20
    );

const bigDecalGeometry =
    new THREE.RingGeometry(
        1.35,
        2.1,
        20
    );

const smallMarkerGeometry =
    new THREE.CircleGeometry(
        0.62,
        16
    );

const bigMarkerGeometry =
    new THREE.CircleGeometry(
        1.1,
        16
    );

const smallRingGeometry =
    new THREE.TorusGeometry(
        0.8,
        0.1,
        6,
        16
    );

const bigRingGeometry =
    new THREE.TorusGeometry(
        1.35,
        0.15,
        6,
        16
    );

const smallOrbGeometry =
    new THREE.OctahedronGeometry(
        0.38
    );

const bigOrbGeometry =
    new THREE.OctahedronGeometry(
        0.72
    );

function createBoostPad(
    x,
    z,
    big = false
) {

    // Permanent floor decal

    const decal =
        new THREE.Mesh(
            big
                ? bigDecalGeometry
                : smallDecalGeometry,

            big
                ? decalMaterialBig
                : decalMaterialSmall
        );

    decal.rotation.x =
        -Math.PI / 2;

    decal.position.set(
        x,
        0.04,
        z
    );

    scene.add(decal);

    // Inner marker

    const marker =
        new THREE.Mesh(
            big
                ? bigMarkerGeometry
                : smallMarkerGeometry,

            big
                ? markerMaterialBig
                : markerMaterialSmall
        );

    marker.rotation.x =
        -Math.PI / 2;

    marker.position.set(
        x,
        0.041,
        z
    );

    scene.add(marker);

    // Pickup

    const pickup =
        new THREE.Group();

    pickup.position.set(
        x,
        0.1,
        z
    );

    const ring =
        new THREE.Mesh(
            big
                ? bigRingGeometry
                : smallRingGeometry,

            big
                ? pickupMaterialBig
                : pickupMaterialSmall
        );

    ring.rotation.x =
        Math.PI / 2;

    ring.position.y =
        big
            ? 0.45
            : 0.28;

    pickup.add(ring);

    const orb =
        new THREE.Mesh(
            big
                ? bigOrbGeometry
                : smallOrbGeometry,

            big
                ? pickupMaterialBig
                : pickupMaterialSmall
        );

    orb.position.y =
        big
            ? 1.15
            : 0.7;

    pickup.add(orb);

    scene.add(pickup);

    boostPads.push({

        pickup,
        orb,

        x,
        z,

        big,

        // Squared pickup radius.
        // Avoids Math.sqrt every frame.

        pickupRadiusSq:
            big
                ? 2.8 * 2.8
                : 2 * 2,

        active: true,

        timer: 0
    });
}

// ============================================================
// SPACED PAD LAYOUT
// ============================================================

// Small midfield

createBoostPad(
    0,
    0
);

createBoostPad(
    0,
    25
);

createBoostPad(
    0,
    -25
);

// Blue half

createBoostPad(
    -27,
    13
);

createBoostPad(
    -27,
    -13
);

createBoostPad(
    -52,
    0
);

createBoostPad(
    -56,
    27
);

createBoostPad(
    -56,
    -27
);

// Orange half

createBoostPad(
    27,
    13
);

createBoostPad(
    27,
    -13
);

createBoostPad(
    52,
    0
);

createBoostPad(
    56,
    27
);

createBoostPad(
    56,
    -27
);

// Big pads

createBoostPad(
    -65,
    38,
    true
);

createBoostPad(
    -65,
    -38,
    true
);

createBoostPad(
    65,
    38,
    true
);

createBoostPad(
    65,
    -38,
    true
);

createBoostPad(
    0,
    39,
    true
);

createBoostPad(
    0,
    -39,
    true
);

// ============================================================
// GAME STATE
// ============================================================

let blueScore = 0;
let orangeScore = 0;

let gameTime = 300;

let ballCam = true;

let goalPause = false;
let goalPauseTimer = 0;

let goalText = "";

// v0.4.1 match states

let overtime = false;
let matchEnded = false;

let matchResult = "";

let lastTime =
    performance.now();

// ============================================================
// HUD + MENU
// ============================================================

const hud =
    document.getElementById(
        "hud"
    );

hud.innerHTML = `

    <h1>
        BOOSTBALL
    </h1>

    <p id="score">
        Blue 0 - 0 Orange
    </p>

    <p id="timer">
        5:00
    </p>

    <p id="boost">
        BOOST: 33
    </p>

    <p
        id="cameraMode"
        style="
            font-size:13px;
            opacity:0.8;
        "
    >
        BALL CAM
    </p>

    <div
        id="goalMessage"
        style="
            font-size:48px;
            font-weight:bold;
            margin-top:20px;
            min-height:60px;
        "
    ></div>

    <p
        id="matchHint"
        style="
            font-size:12px;
            opacity:0.55;
        "
    >
        TAB — Menu
    </p>
`;

// Cache HUD elements ONCE.

const scoreElement =
    document.getElementById(
        "score"
    );

const timerElement =
    document.getElementById(
        "timer"
    );

const boostElement =
    document.getElementById(
        "boost"
    );

const cameraModeElement =
    document.getElementById(
        "cameraMode"
    );

const goalMessageElement =
    document.getElementById(
        "goalMessage"
    );

const matchHintElement =
    document.getElementById(
        "matchHint"
    );

// Remember previous HUD strings.
//
// If nothing changed, don't poke the DOM.

let previousScore = "";
let previousTimer = "";
let previousBoost = "";
let previousCamera = "";
let previousMessage = "";
let previousHint = "";

// ============================================================
// FPS DISPLAY
// ============================================================

const fpsDisplay =
    document.createElement(
        "div"
    );

fpsDisplay.style.cssText = `

    position:absolute;

    right:15px;
    top:15px;

    padding:7px 10px;

    color:white;

    background:
        rgba(0,0,0,0.42);

    border:
        1px solid
        rgba(255,255,255,0.12);

    border-radius:7px;

    font-family:
        monospace;

    font-size:13px;

    z-index:20;

    pointer-events:none;

`;

document.body.appendChild(
    fpsDisplay
);

let fpsFrames = 0;
let fpsTimer = 0;
let displayedFPS = 0;

function updateFPS(dt) {

    if (!QUALITY.showFPS) {

        fpsDisplay.style.display =
            "none";

        return;
    }

    fpsDisplay.style.display =
        "block";

    fpsFrames++;
    fpsTimer += dt;

    if (fpsTimer >= 0.5) {

        displayedFPS =
            Math.round(
                fpsFrames /
                fpsTimer
            );

        fpsDisplay.textContent =
            `${displayedFPS} FPS`;

        fpsFrames = 0;
        fpsTimer = 0;
    }
}

// ============================================================
// MENU
// ============================================================

const menu =
    document.createElement(
        "div"
    );

menu.id =
    "boostball-menu";

menu.style.cssText = `

    display:none;

    position:absolute;

    left:50%;
    top:50%;

    transform:
        translate(-50%, -50%);

    width:
        min(520px, 85vw);

    padding:
        28px 34px;

    color:white;

    background:
        rgba(5, 12, 25, 0.94);

    border:
        1px solid
        rgba(255,255,255,0.25);

    border-radius:
        18px;

    box-shadow:
        0 18px 60px
        rgba(0,0,0,0.5);

    z-index:100;

    font-family:
        Arial,sans-serif;
`;

document.body.appendChild(
    menu
);

function readableKey(key) {

    if (key === " ")
        return "SPACE";

    if (key === "control")
        return "LEFT CTRL";

    if (key === "shift")
        return "SHIFT";

    if (key === "tab")
        return "TAB";

    return key.toUpperCase();
}

function menuRow(
    name,
    key
) {

    return `

        <div style="
            display:flex;
            justify-content:
                space-between;
            align-items:center;

            padding:9px 0;

            border-bottom:
                1px solid
                rgba(255,255,255,0.07);
        ">

            <span>
                ${name}
            </span>

            <strong>
                ${key}
            </strong>

        </div>
    `;
}

function updateMenu() {

    menu.style.display =
        menuOpen
            ? "block"
            : "none";

    if (!menuOpen)
        return;

    menu.innerHTML = `

        <div style="
            font-size:30px;
            font-weight:bold;
            margin-bottom:5px;
        ">
            BOOSTBALL
        </div>

        <div style="
            opacity:0.6;
            margin-bottom:24px;
        ">
            v0.4.1 — MINI BEAST
        </div>

        ${menuRow(
            "Drive Forward",
            readableKey(
                controls.throttle
            )
        )}

        ${menuRow(
            "Reverse / Brake",
            readableKey(
                controls.reverse
            )
        )}

        ${menuRow(
            "Steer Left",
            readableKey(
                controls.left
            )
        )}

        ${menuRow(
            "Steer Right",
            readableKey(
                controls.right
            )
        )}

        ${menuRow(
            "Jump",
            readableKey(
                controls.jump
            )
        )}

        ${menuRow(
            "Boost",
            readableKey(
                controls.boost
            )
        )}

        ${menuRow(
            "Powerslide",
            readableKey(
                controls.powerslide
            )
        )}

        ${menuRow(
            "Ball Cam",
            readableKey(
                controls.ballCam
            )
        )}

        ${menuRow(
            matchEnded
                ? "New Match"
                : "Reset Kickoff",

            readableKey(
                controls.reset
            )
        )}

        <div style="
            margin-top:22px;
            opacity:0.65;
            font-size:13px;
            line-height:1.7;
        ">
            Quality: MEDIUM<br>
            FPS Limit: 60<br>
            Shadows: ON — 1024<br>
            Render Scale: 100%
        </div>

        <div style="
            margin-top:20px;
            padding-top:18px;

            border-top:
                1px solid
                rgba(255,255,255,0.15);

            text-align:center;

            opacity:0.6;
            font-size:13px;
        ">
            Press TAB to return to the match
        </div>
    `;
}

// ============================================================
// JUMP
// ============================================================

function jump() {

    if (!grounded)
        return;

    grounded = false;

    verticalVelocity = 11;
}

// ============================================================
// RESET KICKOFF
// ============================================================

function resetKickoff() {

    car.position.set(
        -35,
        0,
        0
    );

    carRotation = 0;

    car.rotation.set(
        0,
        0,
        0
    );

    carVelocity.set(
        0,
        0,
        0
    );

    verticalVelocity = 0;

    grounded = true;

    ball.position.set(
        0,
        BALL_RADIUS,
        0
    );

    ballVelocity.set(
        0,
        0,
        0
    );

    boostAmount = 33;

    goalPause = false;
    goalPauseTimer = 0;

    goalText = "";
}

// ============================================================
// NEW MATCH
// ============================================================

function startNewMatch() {

    blueScore = 0;
    orangeScore = 0;

    gameTime = 300;

    overtime = false;
    matchEnded = false;

    matchResult = "";

    resetKickoff();

    previousScore = "";
    previousTimer = "";
    previousMessage = "";
    previousHint = "";

    updateHUD();
}

// ============================================================
// CAR PHYSICS
// ============================================================

function updateCar(dt) {

    // Reuse existing vectors instead of allocating two new
    // THREE.Vector3 objects every frame.

    const forward =
        tempForward.set(
            Math.cos(
                carRotation
            ),
            0,
            -Math.sin(
                carRotation
            )
        );

    const right =
        tempRight.set(
            Math.sin(
                carRotation
            ),
            0,
            Math.cos(
                carRotation
            )
        );

    let forwardSpeed =
        carVelocity.dot(
            forward
        );

    const planarSpeed =
        Math.hypot(
            carVelocity.x,
            carVelocity.z
        );

    const throttle =
        keys[
            controls.throttle
        ];

    const reverse =
        keys[
            controls.reverse
        ];

    const boosting =
        keys[
            controls.boost
        ] &&
        boostAmount > 0;

    const powersliding =
        keys[
            controls.powerslide
        ] &&
        grounded;

    // ========================================================
    // GROUND ENGINE
    // ========================================================

    if (grounded) {

        // Forward throttle

        if (throttle) {

            // Preserve v0.4 inertia behaviour:
            // don't hard-clamp overspeed.

            if (
                forwardSpeed <
                DRIVE_TOP_SPEED
            ) {

                carVelocity
                    .addScaledVector(
                        forward,
                        ACCELERATION *
                            dt
                    );
            }
        }

        // Brake / reverse

        if (reverse) {

            if (
                forwardSpeed >
                1.5
            ) {

                carVelocity
                    .addScaledVector(
                        forward,
                        -BRAKING *
                            dt
                    );

            } else if (
                forwardSpeed >
                -REVERSE_TOP_SPEED
            ) {

                carVelocity
                    .addScaledVector(
                        forward,
                        -REVERSE_ACCELERATION *
                            dt
                    );
            }
        }

        // ====================================================
        // TYRE GRIP
        // ====================================================

        const sidewaysSpeed =
            carVelocity.dot(
                right
            );

        const grip =
            powersliding
                ? POWERSLIDE_GRIP
                : NORMAL_GRIP;

        const gripAmount =
            1 -
            Math.exp(
                -grip *
                dt
            );

        carVelocity
            .addScaledVector(
                right,
                -sidewaysSpeed *
                    gripAmount
            );

        // ====================================================
        // GROUND DRAG
        // ====================================================

        const coasting =
            !throttle &&
            !reverse &&
            !boosting;

        const drag =
            coasting
                ? COAST_DRAG
                : POWERED_DRAG;

        const dragFactor =
            Math.exp(
                -drag *
                dt
            );

        carVelocity.x *=
            dragFactor;

        carVelocity.z *=
            dragFactor;
    }

    // ========================================================
    // BOOST
    // ========================================================

    if (boosting) {

        if (
            planarSpeed <
            BOOST_TOP_SPEED
        ) {

            carVelocity
                .addScaledVector(
                    forward,
                    BOOST_ACCELERATION *
                        dt
                );
        }

        boostAmount -=
            BOOST_USAGE *
            dt;

        boostAmount =
            Math.max(
                0,
                boostAmount
            );
    }

    // ========================================================
    // STEERING
    // ========================================================

    let steering = 0;

    if (
        keys[
            controls.left
        ]
    ) {

        steering += 1;
    }

    if (
        keys[
            controls.right
        ]
    ) {

        steering -= 1;
    }

    if (grounded) {

        if (
            planarSpeed >
            0.3
        ) {

            const speedFactor =
                THREE.MathUtils.clamp(
                    planarSpeed /
                        DRIVE_TOP_SPEED,
                    0,
                    1
                );

            let steeringRate =
                THREE.MathUtils.lerp(
                    LOW_SPEED_STEER,
                    HIGH_SPEED_STEER,
                    speedFactor
                );

            if (powersliding) {

                steeringRate *=
                    POWERSLIDE_STEER_MULTIPLIER;
            }

            const direction =
                forwardSpeed >= 0
                    ? 1
                    : -1;

            carRotation +=
                steering *
                steeringRate *
                direction *
                dt;
        }

    } else {

        // v0.4 behaviour preserved:
        // W/S does NOT change horizontal momentum in the air.

        verticalVelocity -=
            GRAVITY *
            dt;
    }

    // ========================================================
    // VERTICAL MOVEMENT
    // ========================================================

    car.position.y +=
        verticalVelocity *
        dt;

    if (
        car.position.y <= 0
    ) {

        car.position.y = 0;

        verticalVelocity = 0;

        grounded = true;
    }

    // ========================================================
    // HORIZONTAL MOVEMENT
    // ========================================================

    car.position.x +=
        carVelocity.x *
        dt;

    car.position.z +=
        carVelocity.z *
        dt;

    car.rotation.y =
        carRotation;

    collideCarWithArena();

    // ========================================================
    // WHEELS
    // ========================================================

    forwardSpeed =
        carVelocity.dot(
            forward
        );

    const spin =
        forwardSpeed *
        dt /
        0.55;

    for (
        const wheel of wheels
    ) {

        wheel.rotation.z -=
            spin;
    }
}

// ============================================================
// END OF PART 1
//
// PASTE PART 2 DIRECTLY BELOW THIS LINE.
// DO NOT ADD ANOTHER import STATEMENT.
// ============================================================
// ============================================================
// BOOSTBALL v0.4.1 — MINI BEAST
// PART 2
// Paste directly underneath Part 1
// ============================================================

// ============================================================
// CAR / ARENA COLLISION
// ============================================================

function collideCarWithArena() {

    const RADIUS = 2.1;

    // Side walls

    if (
        car.position.z >
        HALF_WIDTH - RADIUS
    ) {

        car.position.z =
            HALF_WIDTH - RADIUS;

        carVelocity.z =
            -Math.abs(
                carVelocity.z
            ) * 0.28;
    }

    if (
        car.position.z <
        -HALF_WIDTH + RADIUS
    ) {

        car.position.z =
            -HALF_WIDTH + RADIUS;

        carVelocity.z =
            Math.abs(
                carVelocity.z
            ) * 0.28;
    }

    const insideGoal =
        Math.abs(
            car.position.z
        ) <
        GOAL_WIDTH / 2 -
        RADIUS / 2;

    // ========================================================
    // NORMAL END WALLS
    // ========================================================

    if (!insideGoal) {

        if (
            car.position.x >
            HALF_LENGTH - RADIUS
        ) {

            car.position.x =
                HALF_LENGTH - RADIUS;

            carVelocity.x =
                -Math.abs(
                    carVelocity.x
                ) * 0.28;
        }

        if (
            car.position.x <
            -HALF_LENGTH + RADIUS
        ) {

            car.position.x =
                -HALF_LENGTH + RADIUS;

            carVelocity.x =
                Math.abs(
                    carVelocity.x
                ) * 0.28;
        }
    }

    // ========================================================
    // ORANGE GOAL INTERIOR
    // ========================================================

    if (
        insideGoal &&
        car.position.x >
        HALF_LENGTH - RADIUS
    ) {

        const sideLimit =
            GOAL_WIDTH / 2 -
            RADIUS / 2;

        if (
            car.position.z >
            sideLimit
        ) {

            car.position.z =
                sideLimit;

            carVelocity.z =
                -Math.abs(
                    carVelocity.z
                ) * 0.25;
        }

        if (
            car.position.z <
            -sideLimit
        ) {

            car.position.z =
                -sideLimit;

            carVelocity.z =
                Math.abs(
                    carVelocity.z
                ) * 0.25;
        }

        const back =
            HALF_LENGTH +
            GOAL_DEPTH -
            RADIUS;

        if (
            car.position.x >
            back
        ) {

            car.position.x =
                back;

            carVelocity.x =
                -Math.abs(
                    carVelocity.x
                ) * 0.25;
        }
    }

    // ========================================================
    // BLUE GOAL INTERIOR
    // ========================================================

    if (
        insideGoal &&
        car.position.x <
        -HALF_LENGTH + RADIUS
    ) {

        const sideLimit =
            GOAL_WIDTH / 2 -
            RADIUS / 2;

        if (
            car.position.z >
            sideLimit
        ) {

            car.position.z =
                sideLimit;

            carVelocity.z =
                -Math.abs(
                    carVelocity.z
                ) * 0.25;
        }

        if (
            car.position.z <
            -sideLimit
        ) {

            car.position.z =
                -sideLimit;

            carVelocity.z =
                Math.abs(
                    carVelocity.z
                ) * 0.25;
        }

        const back =
            -HALF_LENGTH -
            GOAL_DEPTH +
            RADIUS;

        if (
            car.position.x <
            back
        ) {

            car.position.x =
                back;

            carVelocity.x =
                Math.abs(
                    carVelocity.x
                ) * 0.25;
        }
    }
}

// ============================================================
// BALL PHYSICS
// ============================================================

function updateBall(dt) {

    ballVelocity.y -=
        21 * dt;

    ball.position
        .addScaledVector(
            ballVelocity,
            dt
        );

    // ========================================================
    // FLOOR
    // ========================================================

    if (
        ball.position.y <
        BALL_RADIUS
    ) {

        ball.position.y =
            BALL_RADIUS;

        // Kill tiny annoying bounces.

        if (
            Math.abs(
                ballVelocity.y
            ) < 2.4
        ) {

            ballVelocity.y = 0;

        } else {

            ballVelocity.y *=
                -0.52;
        }

        // Rolling friction

        const groundFriction =
            Math.exp(
                -0.22 * dt
            );

        ballVelocity.x *=
            groundFriction;

        ballVelocity.z *=
            groundFriction;
    }

    // ========================================================
    // SIDE WALLS
    // ========================================================

    if (
        ball.position.z >
        HALF_WIDTH -
        BALL_RADIUS
    ) {

        ball.position.z =
            HALF_WIDTH -
            BALL_RADIUS;

        ballVelocity.z =
            -Math.abs(
                ballVelocity.z
            ) * 0.68;
    }

    if (
        ball.position.z <
        -HALF_WIDTH +
        BALL_RADIUS
    ) {

        ball.position.z =
            -HALF_WIDTH +
            BALL_RADIUS;

        ballVelocity.z =
            Math.abs(
                ballVelocity.z
            ) * 0.68;
    }

    collideBallWithEnds();

    // Cheap visual rotation.

    ball.rotation.z -=
        ballVelocity.x *
        dt *
        0.4;

    ball.rotation.x +=
        ballVelocity.z *
        dt *
        0.4;
}

// ============================================================
// BALL / END COLLISION
// ============================================================

function collideBallWithEnds() {

    const insideGoal =
        Math.abs(
            ball.position.z
        ) <
        GOAL_WIDTH / 2 -
        BALL_RADIUS * 0.3;

    const belowGoal =
        ball.position.y <
        GOAL_HEIGHT -
        BALL_RADIUS * 0.2;

    // ========================================================
    // ORANGE SIDE
    // ========================================================

    if (
        ball.position.x >
        HALF_LENGTH -
        BALL_RADIUS
    ) {

        if (
            insideGoal &&
            belowGoal
        ) {

            // Ball crossed orange goal line.

            if (
                ball.position.x >
                HALF_LENGTH +
                BALL_RADIUS * 0.35
            ) {

                scoreGoal(
                    "blue"
                );

                return;
            }

            // Back wall

            const back =
                HALF_LENGTH +
                GOAL_DEPTH -
                BALL_RADIUS;

            if (
                ball.position.x >
                back
            ) {

                ball.position.x =
                    back;

                ballVelocity.x =
                    -Math.abs(
                        ballVelocity.x
                    ) * 0.5;
            }

            // Goal side walls

            const side =
                GOAL_WIDTH / 2 -
                BALL_RADIUS;

            if (
                ball.position.z >
                side
            ) {

                ball.position.z =
                    side;

                ballVelocity.z =
                    -Math.abs(
                        ballVelocity.z
                    ) * 0.5;
            }

            if (
                ball.position.z <
                -side
            ) {

                ball.position.z =
                    -side;

                ballVelocity.z =
                    Math.abs(
                        ballVelocity.z
                    ) * 0.5;
            }

        } else {

            // End wall bounce

            ball.position.x =
                HALF_LENGTH -
                BALL_RADIUS;

            ballVelocity.x =
                -Math.abs(
                    ballVelocity.x
                ) * 0.68;
        }
    }

    // ========================================================
    // BLUE SIDE
    // ========================================================

    if (
        ball.position.x <
        -HALF_LENGTH +
        BALL_RADIUS
    ) {

        if (
            insideGoal &&
            belowGoal
        ) {

            // Ball crossed blue goal line.

            if (
                ball.position.x <
                -HALF_LENGTH -
                BALL_RADIUS * 0.35
            ) {

                scoreGoal(
                    "orange"
                );

                return;
            }

            // Back wall

            const back =
                -HALF_LENGTH -
                GOAL_DEPTH +
                BALL_RADIUS;

            if (
                ball.position.x <
                back
            ) {

                ball.position.x =
                    back;

                ballVelocity.x =
                    Math.abs(
                        ballVelocity.x
                    ) * 0.5;
            }

            // Goal side walls

            const side =
                GOAL_WIDTH / 2 -
                BALL_RADIUS;

            if (
                ball.position.z >
                side
            ) {

                ball.position.z =
                    side;

                ballVelocity.z =
                    -Math.abs(
                        ballVelocity.z
                    ) * 0.5;
            }

            if (
                ball.position.z <
                -side
            ) {

                ball.position.z =
                    -side;

                ballVelocity.z =
                    Math.abs(
                        ballVelocity.z
                    ) * 0.5;
            }

        } else {

            // End wall bounce

            ball.position.x =
                -HALF_LENGTH +
                BALL_RADIUS;

            ballVelocity.x =
                Math.abs(
                    ballVelocity.x
                ) * 0.68;
        }
    }
}

// ============================================================
// CAR / BALL COLLISION
// ============================================================

function updateCarBallCollision() {

    // v0.4 created several Vector3s here every frame.
    // Reuse scratch vectors instead.

    const carCentre =
        tempA.set(
            car.position.x,
            car.position.y + 1.1,
            car.position.z
        );

    const delta =
        tempB
            .copy(
                ball.position
            )
            .sub(
                carCentre
            );

    const distanceSq =
        delta.lengthSq();

    const collisionDistance =
        BALL_RADIUS +
        2.25;

    const collisionDistanceSq =
        collisionDistance *
        collisionDistance;

    if (
        distanceSq <
            collisionDistanceSq &&
        distanceSq >
            0.000001
    ) {

        const distance =
            Math.sqrt(
                distanceSq
            );

        const normal =
            delta.multiplyScalar(
                1 / distance
            );

        // Push ball outside car.

        ball.position
            .copy(
                carCentre
            )
            .addScaledVector(
                normal,
                collisionDistance
            );

        const speedIntoBall =
            Math.max(
                0,
                carVelocity.dot(
                    normal
                )
            );

        const impulse =
            7.5 +
            speedIntoBall *
            1.05;

        ballVelocity
            .addScaledVector(
                normal,
                impulse
            );

        ballVelocity
            .addScaledVector(
                carVelocity,
                0.32
            );

        if (!grounded) {

            ballVelocity.y +=
                Math.max(
                    1.5,
                    verticalVelocity *
                        0.55
                );
        }

        carVelocity
            .multiplyScalar(
                0.96
            );
    }
}

// ============================================================
// BOOST PAD UPDATE
// ============================================================

function updateBoostPads(dt) {

    for (
        const pad of boostPads
    ) {

        // Respawn countdown

        if (!pad.active) {

            pad.timer -=
                dt;

            if (
                pad.timer <= 0
            ) {

                pad.active =
                    true;

                pad.pickup.visible =
                    true;
            }

            continue;
        }

        // v0.4 rotated on two axes.
        // One is enough to look alive.

        pad.orb.rotation.y +=
            dt *
            1.6;

        const dx =
            car.position.x -
            pad.x;

        const dz =
            car.position.z -
            pad.z;

        // Squared distance avoids Math.hypot/sqrt.

        const distanceSq =
            dx * dx +
            dz * dz;

        if (
            distanceSq <
                pad.pickupRadiusSq &&
            car.position.y <
                2.5
        ) {

            if (pad.big) {

                boostAmount =
                    100;

                pad.timer =
                    10;

            } else {

                boostAmount =
                    Math.min(
                        100,
                        boostAmount +
                            12
                    );

                pad.timer =
                    4;
            }

            pad.active =
                false;

            // Permanent floor decal stays.
            // Only floating pickup vanishes.

            pad.pickup.visible =
                false;
        }
    }
}

// ============================================================
// GOALS
// ============================================================

function scoreGoal(team) {

    if (
        goalPause ||
        matchEnded
    ) {

        return;
    }

    // Update score first.

    if (
        team === "blue"
    ) {

        blueScore++;

        goalText =
            overtime
                ? "BLUE WINS!"
                : "BLUE SCORES!";

    } else {

        orangeScore++;

        goalText =
            overtime
                ? "ORANGE WINS!"
                : "ORANGE SCORES!";
    }

    // ========================================================
    // OVERTIME = GOLDEN GOAL
    // ========================================================

    if (overtime) {

        finishMatch(
            team
        );

        return;
    }

    // Normal goal pause.

    goalPause = true;

    goalPauseTimer = 2;

    carVelocity.set(
        0,
        0,
        0
    );

    verticalVelocity = 0;
}

// ============================================================
// GOAL PAUSE
// ============================================================

function updateGoalPause(dt) {

    goalPauseTimer -=
        dt;

    if (
        goalPauseTimer <= 0
    ) {

        resetKickoff();
    }
}

// ============================================================
// MATCH TIMER
// ============================================================

function updateTimer(dt) {

    if (
        overtime ||
        matchEnded
    ) {

        return;
    }

    if (
        gameTime <= 0
    ) {

        gameTime = 0;

        resolveEndOfRegulation();

        return;
    }

    gameTime -= dt;

    if (
        gameTime <= 0
    ) {

        gameTime = 0;

        resolveEndOfRegulation();
    }
}

// ============================================================
// END OF REGULATION
// ============================================================

function resolveEndOfRegulation() {

    if (
        overtime ||
        matchEnded
    ) {

        return;
    }

    if (
        blueScore >
        orangeScore
    ) {

        finishMatch(
            "blue"
        );

        return;
    }

    if (
        orangeScore >
        blueScore
    ) {

        finishMatch(
            "orange"
        );

        return;
    }

    // ========================================================
    // TIE = OVERTIME
    // ========================================================

    overtime = true;

    goalPause = true;

    goalPauseTimer = 2;

    goalText =
        "OVERTIME!";

    // Freeze things during the transition.

    carVelocity.set(
        0,
        0,
        0
    );

    ballVelocity.set(
        0,
        0,
        0
    );

    verticalVelocity = 0;
}

// ============================================================
// FINISH MATCH
// ============================================================

function finishMatch(team) {

    matchEnded = true;

    overtime = false;

    goalPause = false;

    gameTime = 0;

    if (
        team === "blue"
    ) {

        matchResult =
            "BLUE WINS!";

    } else {

        matchResult =
            "ORANGE WINS!";
    }

    goalText =
        matchResult;

    // Stop the entire battlefield.

    carVelocity.set(
        0,
        0,
        0
    );

    ballVelocity.set(
        0,
        0,
        0
    );

    verticalVelocity = 0;

    // Clear held controls so car doesn't launch
    // immediately when a new match begins.

    for (
        const key in keys
    ) {

        keys[key] =
            false;
    }

    updateHUD();
}

// ============================================================
// CAMERA
// ============================================================

const cameraTarget =
    new THREE.Vector3();

function updateCamera(dt) {

    const forward =
        tempForward.set(
            Math.cos(
                carRotation
            ),
            0,
            -Math.sin(
                carRotation
            )
        );

    // Use scratch vectors instead of clone() chains.

    const desiredPosition =
        tempC;

    const desiredTarget =
        tempD;

    // ========================================================
    // BALL CAM
    // ========================================================

    if (ballCam) {

        const toBall =
            tempA
                .copy(
                    ball.position
                )
                .sub(
                    car.position
                );

        const ballDistance =
            toBall.length();

        toBall.y = 0;

        if (
            toBall.lengthSq() <
            0.01
        ) {

            toBall.copy(
                forward
            );

        } else {

            toBall.normalize();
        }

        // Adaptive camera distance.
        // Same basic behaviour as v0.4.

        const cameraDistance =
            THREE.MathUtils.clamp(
                11.5 +
                ballDistance *
                    0.018,
                11.5,
                14
            );

        desiredPosition
            .copy(
                car.position
            )
            .addScaledVector(
                toBall,
                -cameraDistance
            );

        desiredPosition.y +=
            6.4;

        // Start looking at ball.

        desiredTarget.copy(
            ball.position
        );

        // Blend 13% toward car centre.
        //
        // Equivalent idea to v0.4, but without creating
        // several temporary Vector3s.

        tempB.set(
            car.position.x,
            car.position.y + 1.2,
            car.position.z
        );

        desiredTarget.lerp(
            tempB,
            0.13
        );

    } else {

        // ====================================================
        // CAR CAM
        // ====================================================

        desiredPosition
            .copy(
                car.position
            )
            .addScaledVector(
                forward,
                -13
            );

        desiredPosition.y +=
            6.8;

        desiredTarget
            .copy(
                car.position
            )
            .addScaledVector(
                forward,
                11
            );

        desiredTarget.y +=
            1.5;
    }

    const cameraSmooth =
        1 -
        Math.exp(
            -7.5 *
            dt
        );

    const targetSmooth =
        1 -
        Math.exp(
            -11 *
            dt
        );

    camera.position.lerp(
        desiredPosition,
        cameraSmooth
    );

    cameraTarget.lerp(
        desiredTarget,
        targetSmooth
    );

    camera.lookAt(
        cameraTarget
    );
}

// ============================================================
// HUD
// ============================================================

function updateHUD() {

    // ========================================================
    // SCORE
    // ========================================================

    const scoreText =
        `Blue ${blueScore} - ${orangeScore} Orange`;

    if (
        scoreText !==
        previousScore
    ) {

        scoreElement.textContent =
            scoreText;

        previousScore =
            scoreText;
    }

    // ========================================================
    // BOOST
    // ========================================================

    const boostText =
        `BOOST: ${Math.ceil(
            boostAmount
        )}`;

    if (
        boostText !==
        previousBoost
    ) {

        boostElement.textContent =
            boostText;

        previousBoost =
            boostText;
    }

    // ========================================================
    // CAMERA MODE
    // ========================================================

    const cameraText =
        ballCam
            ? "BALL CAM"
            : "CAR CAM";

    if (
        cameraText !==
        previousCamera
    ) {

        cameraModeElement.textContent =
            cameraText;

        previousCamera =
            cameraText;
    }

    // ========================================================
    // TIMER
    // ========================================================

    let timerText;

    if (matchEnded) {

        timerText =
            "FINAL";

    } else if (overtime) {

        timerText =
            "OVERTIME";

    } else {

        const minutes =
            Math.floor(
                gameTime /
                60
            );

        const seconds =
            Math.floor(
                gameTime %
                60
            )
                .toString()
                .padStart(
                    2,
                    "0"
                );

        timerText =
            `${minutes}:${seconds}`;
    }

    if (
        timerText !==
        previousTimer
    ) {

        timerElement.textContent =
            timerText;

        previousTimer =
            timerText;
    }

    // ========================================================
    // LARGE MESSAGE
    // ========================================================

    let message = "";

    if (matchEnded) {

        message =
            matchResult;

    } else if (
        goalPause
    ) {

        message =
            goalText;
    }

    if (
        message !==
        previousMessage
    ) {

        goalMessageElement.textContent =
            message;

        previousMessage =
            message;
    }

    // ========================================================
    // BOTTOM HINT
    // ========================================================

    const hintText =
        matchEnded
            ? "R — New Match   •   TAB — Menu"
            : "TAB — Menu";

    if (
        hintText !==
        previousHint
    ) {

        matchHintElement.textContent =
            hintText;

        previousHint =
            hintText;
    }
}

// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera
            .updateProjectionMatrix();

        // Preserve v0.4.1 render scale.

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                QUALITY.pixelRatio
            )
        );

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);

// ============================================================
// PERFORMANCE LOOP
// ============================================================

// v0.4 ran the game at whatever refresh rate the browser
// requested.
//
// On a 120/144Hz display that meant substantially more JS,
// collision work and rendering than we currently need.

const TARGET_FRAME_MS =
    1000 /
    QUALITY.fpsLimit;

let previousRenderTime = 0;

// ============================================================
// MAIN LOOP
// ============================================================

function animate(time) {

    requestAnimationFrame(
        animate
    );

    // ========================================================
    // 60 FPS CAP
    // ========================================================

    const elapsedSinceRender =
        time -
        previousRenderTime;

    if (
        elapsedSinceRender <
        TARGET_FRAME_MS
    ) {

        return;
    }

    previousRenderTime =
        time -
        (
            elapsedSinceRender %
            TARGET_FRAME_MS
        );

    // ========================================================
    // DELTA TIME
    // ========================================================

    const dt =
        Math.min(
            (
                time -
                lastTime
            ) /
            1000,
            0.033
        );

    lastTime = time;

    // ========================================================
    // SIMULATION
    // ========================================================

    if (!menuOpen) {

        if (matchEnded) {

            // Match is frozen, but keep camera/HUD alive.

            updateCamera(
                dt
            );

        } else if (
            goalPause
        ) {

            updateGoalPause(
                dt
            );

            updateCamera(
                dt
            );

        } else {

            updateCar(
                dt
            );

            updateBall(
                dt
            );

            updateCarBallCollision();

            updateBoostPads(
                dt
            );

            updateTimer(
                dt
            );

            updateCamera(
                dt
            );
        }
    }

    // ========================================================
    // UI
    // ========================================================

    updateHUD();

    updateFPS(
        dt
    );

    // ========================================================
    // RENDER
    // ========================================================

    renderer.render(
        scene,
        camera
    );
}

// ============================================================
// START
// ============================================================

startNewMatch();

cameraTarget.copy(
    car.position
);

updateHUD();

requestAnimationFrame(
    animate
);

// ============================================================
// BOOSTBALL v0.4.1 — MINI BEAST
//
// PERFORMANCE:
// ✓ 60 FPS cap
// ✓ 1x render scale
// ✓ 1024 shadow map
// ✓ tighter shadow volume
// ✓ reusable Vector3 scratch objects
// ✓ shared wheel geometry
// ✓ shared boost geometry/materials
// ✓ cheaper boost distance checks
// ✓ fewer ball polygons
// ✓ cached HUD DOM references
// ✓ HUD only updates changed text
// ✓ cheaper boost animation
// ✓ FPS counter
//
// QUALITY:
// ✓ improved field material
// ✓ subtle field stripes
// ✓ cleaner transparency
// ✓ adjusted lighting/fog
//
// MATCH FLOW:
// ✓ 5 minute regulation
// ✓ score comparison at 0:00
// ✓ tied game enters overtime
// ✓ overtime is golden goal
// ✓ winner freezes match
// ✓ R starts new match
//
// NEXT:
// v0.5 — THE MICROWAVE LEARNS TO FLY
// ============================================================
