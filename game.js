// ============================================================
// BOOSTBALL v0.4 — NEWTON'S REVENGE
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ============================================================
// BASIC SETUP
// ============================================================

const canvas = document.getElementById("game");

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 140, 240);

const camera = new THREE.PerspectiveCamera(
    72,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

camera.position.set(-14, 7, 0);

// ============================================================
// LIGHTING
// ============================================================

scene.add(
    new THREE.HemisphereLight(
        0xd8f2ff,
        0x16351d,
        2.4
    )
);

const sun = new THREE.DirectionalLight(
    0xffffff,
    3
);

sun.position.set(-35, 60, 30);
sun.castShadow = true;

sun.shadow.mapSize.set(2048, 2048);

sun.shadow.camera.left = -120;
sun.shadow.camera.right = 120;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;

scene.add(sun);

// ============================================================
// ARENA
// ============================================================

const FIELD_LENGTH = 154;
const FIELD_WIDTH = 92;

const HALF_LENGTH = FIELD_LENGTH / 2;
const HALF_WIDTH = FIELD_WIDTH / 2;

const WALL_HEIGHT = 15;

const GOAL_WIDTH = 29;
const GOAL_HEIGHT = 13;
const GOAL_DEPTH = 12;

const BALL_RADIUS = 1.8;

// ============================================================
// FIELD
// ============================================================

const field = new THREE.Mesh(
    new THREE.PlaneGeometry(
        FIELD_LENGTH,
        FIELD_WIDTH
    ),
    new THREE.MeshStandardMaterial({
        color: 0x248c50,
        roughness: 0.95
    })
);

field.rotation.x = -Math.PI / 2;
field.receiveShadow = true;

scene.add(field);

// ============================================================
// FIELD MARKINGS
// ============================================================

const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85
});

function groundLine(width, depth, x, z) {

    const line = new THREE.Mesh(
        new THREE.PlaneGeometry(width, depth),
        lineMaterial
    );

    line.rotation.x = -Math.PI / 2;

    line.position.set(
        x,
        0.025,
        z
    );

    scene.add(line);

}

// Halfway line
groundLine(0.22, FIELD_WIDTH, 0, 0);

// Centre circle

const circlePoints = [];

for (let i = 0; i <= 100; i++) {

    const angle =
        i / 100 *
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
            .setFromPoints(circlePoints),

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
        opacity: 0.20,
        roughness: 0.25
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

    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            height,
            depth
        ),
        material
    );

    wall.position.set(x, y, z);

    wall.receiveShadow = true;

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
    (FIELD_WIDTH - GOAL_WIDTH) / 2;

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

createEndWalls(-HALF_LENGTH);
createEndWalls(HALF_LENGTH);

// ============================================================
// GOALS
// ============================================================

function createGoal(side, colour) {

    const mouthX =
        side * HALF_LENGTH;

    const centreX =
        mouthX +
        side * GOAL_DEPTH / 2;

    const backX =
        mouthX +
        side * GOAL_DEPTH;

    const transparent =
        new THREE.MeshStandardMaterial({
            color: colour,
            transparent: true,
            opacity: 0.32
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
    for (const z of [
        -GOAL_WIDTH / 2,
        GOAL_WIDTH / 2
    ]) {

        const post = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.8,
                GOAL_HEIGHT,
                0.8
            ),
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
    const crossbar = new THREE.Mesh(
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

createGoal(-1, 0x168cff);
createGoal(1, 0xff7417);

// ============================================================
// CAR
// ============================================================

const car = new THREE.Group();

const bodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x168cff,
        roughness: 0.35,
        metalness: 0.25
    });

const body = new THREE.Mesh(
    new THREE.BoxGeometry(
        4.4,
        1.1,
        2.35
    ),
    bodyMaterial
);

body.position.y = 1;
body.castShadow = true;

car.add(body);

const nose = new THREE.Mesh(
    new THREE.BoxGeometry(
        1.2,
        0.55,
        2.15
    ),
    new THREE.MeshStandardMaterial({
        color: 0x0870d5
    })
);

nose.position.set(2.15, 0.72, 0);
nose.castShadow = true;

car.add(nose);

const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(
        1.9,
        0.85,
        1.75
    ),
    new THREE.MeshStandardMaterial({
        color: 0xa4ecff,
        roughness: 0.2
    })
);

cabin.position.set(-0.25, 1.72, 0);
cabin.castShadow = true;

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
        20
    );

// Bake the orientation directly into geometry.
wheelGeometry.rotateX(Math.PI / 2);

const wheelMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.9
    });

function createWheel(x, z) {

    const wheel = new THREE.Mesh(
        wheelGeometry.clone(),
        wheelMaterial
    );

    wheel.position.set(x, 0.55, z);

    wheel.castShadow = true;

    car.add(wheel);

    wheels.push(wheel);

}

createWheel(-1.35, -1.2);
createWheel(-1.35, 1.2);
createWheel(1.35, -1.2);
createWheel(1.35, 1.2);

scene.add(car);

// ============================================================
// BALL
// ============================================================

const ball = new THREE.Mesh(
    new THREE.SphereGeometry(
        BALL_RADIUS,
        32,
        24
    ),
    new THREE.MeshStandardMaterial({
        color: 0xf7f7f7,
        roughness: 0.5
    })
);

ball.castShadow = true;

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

const POWERSLIDE_STEER_MULTIPLIER = 1.35;

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
            event.key.toLowerCase();

        // TAB MENU
        if (
            key === controls.menu &&
            !pressed[key]
        ) {

            event.preventDefault();

            menuOpen = !menuOpen;

            updateMenu();

            pressed[key] = true;

            return;

        }

        if (menuOpen) {

            event.preventDefault();
            return;

        }

        keys[key] = true;

        if (!pressed[key]) {

            pressed[key] = true;

            if (
                key === controls.jump &&
                !goalPause
            ) {

                jump();

            }

            if (
                key === controls.ballCam
            ) {

                ballCam = !ballCam;

            }

            if (
                key === controls.reset
            ) {

                resetKickoff();

            }

        }

        if (
            key === " " ||
            key === "tab" ||
            key.startsWith("arrow")
        ) {

            event.preventDefault();

        }

    }
);

window.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();

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
        opacity: 0.65,
        side: THREE.DoubleSide
    });

const decalMaterialBig =
    new THREE.MeshBasicMaterial({
        color: 0xff8c18,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });

const pickupMaterialSmall =
    new THREE.MeshStandardMaterial({
        color: 0xffc72c,
        emissive: 0x6a3a00,
        emissiveIntensity: 1.4
    });

const pickupMaterialBig =
    new THREE.MeshStandardMaterial({
        color: 0xff8c18,
        emissive: 0x7d2900,
        emissiveIntensity: 2
    });

function createBoostPad(x, z, big = false) {

    // --------------------------------------------------------
    // PERMANENT FLOOR DECAL
    // --------------------------------------------------------

    const decal = new THREE.Mesh(
        new THREE.RingGeometry(
            big ? 1.35 : 0.8,
            big ? 2.1 : 1.35,
            32
        ),
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
    const marker = new THREE.Mesh(
        new THREE.CircleGeometry(
            big ? 1.1 : 0.62,
            24
        ),
        new THREE.MeshBasicMaterial({
            color: big
                ? 0x7c4915
                : 0x75621d,
            transparent: true,
            opacity: 0.55,
            side: THREE.DoubleSide
        })
    );

    marker.rotation.x =
        -Math.PI / 2;

    marker.position.set(
        x,
        0.041,
        z
    );

    scene.add(marker);

    // --------------------------------------------------------
    // PICKUP
    // --------------------------------------------------------

    const pickup =
        new THREE.Group();

    pickup.position.set(
        x,
        0.1,
        z
    );

    const ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                big ? 1.35 : 0.8,
                big ? 0.15 : 0.1,
                10,
                28
            ),
            big
                ? pickupMaterialBig
                : pickupMaterialSmall
        );

    ring.rotation.x =
        Math.PI / 2;

    ring.position.y =
        big ? 0.45 : 0.28;

    pickup.add(ring);

    const orb =
        new THREE.Mesh(
            new THREE.OctahedronGeometry(
                big ? 0.72 : 0.38
            ),
            big
                ? pickupMaterialBig
                : pickupMaterialSmall
        );

    orb.position.y =
        big ? 1.15 : 0.7;

    pickup.add(orb);

    scene.add(pickup);

    boostPads.push({

        pickup,
        orb,

        x,
        z,

        big,

        active: true,
        timer: 0

    });

}

// ============================================================
// SPACED PAD LAYOUT
// ============================================================

// Small midfield
createBoostPad(0, 0);
createBoostPad(0, 25);
createBoostPad(0, -25);

// Blue half
createBoostPad(-27, 13);
createBoostPad(-27, -13);

createBoostPad(-52, 0);

createBoostPad(-56, 27);
createBoostPad(-56, -27);

// Orange half
createBoostPad(27, 13);
createBoostPad(27, -13);

createBoostPad(52, 0);

createBoostPad(56, 27);
createBoostPad(56, -27);

// Big pads
createBoostPad(-65, 38, true);
createBoostPad(-65, -38, true);

createBoostPad(65, 38, true);
createBoostPad(65, -38, true);

createBoostPad(0, 39, true);
createBoostPad(0, -39, true);

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

let lastTime =
    performance.now();

// ============================================================
// HUD + MENU
// ============================================================

const hud =
    document.getElementById("hud");

hud.innerHTML = `

    <h1>BOOSTBALL</h1>

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
        style="
            font-size:12px;
            opacity:0.55;
        "
    >
        TAB — Menu
    </p>

`;

const menu =
    document.createElement("div");

menu.id = "boostball-menu";

menu.style.cssText = `

    display:none;

    position:absolute;

    left:50%;
    top:50%;

    transform:translate(-50%, -50%);

    width:min(520px, 85vw);

    padding:28px 34px;

    color:white;

    background:
        rgba(5, 12, 25, 0.94);

    border:
        1px solid rgba(255,255,255,0.25);

    border-radius:18px;

    box-shadow:
        0 18px 60px rgba(0,0,0,0.5);

    z-index:100;

    font-family:Arial,sans-serif;

`;

document.body.appendChild(menu);

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
            CONTROLS
        </div>

        ${menuRow(
            "Drive Forward",
            readableKey(controls.throttle)
        )}

        ${menuRow(
            "Reverse / Brake",
            readableKey(controls.reverse)
        )}

        ${menuRow(
            "Steer Left",
            readableKey(controls.left)
        )}

        ${menuRow(
            "Steer Right",
            readableKey(controls.right)
        )}

        ${menuRow(
            "Jump",
            readableKey(controls.jump)
        )}

        ${menuRow(
            "Boost",
            readableKey(controls.boost)
        )}

        ${menuRow(
            "Powerslide",
            readableKey(controls.powerslide)
        )}

        ${menuRow(
            "Ball Cam",
            readableKey(controls.ballCam)
        )}

        ${menuRow(
            "Reset",
            readableKey(controls.reset)
        )}

        <div style="
            margin-top:25px;
            padding-top:18px;
            border-top:
                1px solid rgba(255,255,255,0.15);

            text-align:center;
            opacity:0.6;
            font-size:13px;
        ">
            Press TAB to return to the match
        </div>

    `;

}

function menuRow(name, key) {

    return `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;

            padding:9px 0;

            border-bottom:
                1px solid rgba(255,255,255,0.07);
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
// RESET
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
// CAR PHYSICS
// ============================================================

function updateCar(dt) {

    const forward =
        new THREE.Vector3(
            Math.cos(carRotation),
            0,
            -Math.sin(carRotation)
        );

    const right =
        new THREE.Vector3(
            Math.sin(carRotation),
            0,
            Math.cos(carRotation)
        );

    let forwardSpeed =
        carVelocity.dot(forward);

    const planarSpeed =
        Math.hypot(
            carVelocity.x,
            carVelocity.z
        );

    const throttle =
        keys[controls.throttle];

    const reverse =
        keys[controls.reverse];

    const boosting =
        keys[controls.boost] &&
        boostAmount > 0;

    const powersliding =
        keys[controls.powerslide] &&
        grounded;

    // ========================================================
    // GROUND ENGINE
    // ========================================================

    if (grounded) {

        // Forward throttle
        if (throttle) {

            // Engine stops adding normal power once the car
            // reaches normal top speed.
            //
            // IMPORTANT:
            // We DO NOT clamp existing velocity.

            if (
                forwardSpeed <
                DRIVE_TOP_SPEED
            ) {

                carVelocity.addScaledVector(
                    forward,
                    ACCELERATION * dt
                );

            }

        }

        // Brake / reverse
        if (reverse) {

            if (forwardSpeed > 1.5) {

                carVelocity.addScaledVector(
                    forward,
                    -BRAKING * dt
                );

            }

            else if (
                forwardSpeed >
                -REVERSE_TOP_SPEED
            ) {

                carVelocity.addScaledVector(
                    forward,
                    -REVERSE_ACCELERATION * dt
                );

            }

        }

        // ====================================================
        // TYRE GRIP
        // ====================================================

        const sidewaysSpeed =
            carVelocity.dot(right);

        const grip =
            powersliding
                ? POWERSLIDE_GRIP
                : NORMAL_GRIP;

        const gripAmount =
            1 -
            Math.exp(
                -grip * dt
            );

        carVelocity.addScaledVector(
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
                -drag * dt
            );

        carVelocity.x *= dragFactor;
        carVelocity.z *= dragFactor;

    }

    // ========================================================
    // BOOST
    // ========================================================

    // Boost is genuine thrust.
    //
    // This intentionally works in the air.
    //
    // Normal W/S DOES NOT.

    if (boosting) {

        const currentSpeed =
            Math.hypot(
                carVelocity.x,
                carVelocity.z
            );

        if (
            currentSpeed <
            BOOST_TOP_SPEED
        ) {

            carVelocity.addScaledVector(
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

    if (keys[controls.left])
        steering += 1;

    if (keys[controls.right])
        steering -= 1;

    if (grounded) {

        const speed =
            Math.hypot(
                carVelocity.x,
                carVelocity.z
            );

        if (speed > 0.3) {

            const speedFactor =
                THREE.MathUtils.clamp(
                    speed /
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

    }

    // ========================================================
    // AIR PHYSICS
    // ========================================================

    else {

        // NO W/S horizontal acceleration here.
        //
        // Your X/Z momentum is preserved.
        //
        // If you jumped going forward, you continue forward
        // even if you press reverse in mid-air.

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
        carVelocity.dot(forward);

    const spin =
        forwardSpeed *
        dt /
        0.55;

    for (const wheel of wheels) {

        wheel.rotation.z -=
            spin;

    }

}

// ============================================================
// CAR ARENA COLLISION
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
            -Math.abs(carVelocity.z) *
            0.28;

    }

    if (
        car.position.z <
        -HALF_WIDTH + RADIUS
    ) {

        car.position.z =
            -HALF_WIDTH + RADIUS;

        carVelocity.z =
            Math.abs(carVelocity.z) *
            0.28;

    }

    const insideGoal =
        Math.abs(car.position.z) <
        GOAL_WIDTH / 2 -
        RADIUS / 2;

    // Normal end wall

    if (!insideGoal) {

        if (
            car.position.x >
            HALF_LENGTH - RADIUS
        ) {

            car.position.x =
                HALF_LENGTH - RADIUS;

            carVelocity.x =
                -Math.abs(carVelocity.x) *
                0.28;

        }

        if (
            car.position.x <
            -HALF_LENGTH + RADIUS
        ) {

            car.position.x =
                -HALF_LENGTH + RADIUS;

            carVelocity.x =
                Math.abs(carVelocity.x) *
                0.28;

        }

    }

    // Orange goal interior

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
                -Math.abs(carVelocity.z) *
                0.25;

        }

        if (
            car.position.z <
            -sideLimit
        ) {

            car.position.z =
                -sideLimit;

            carVelocity.z =
                Math.abs(carVelocity.z) *
                0.25;

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
                -Math.abs(carVelocity.x) *
                0.25;

        }

    }

    // Blue goal interior

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
                -Math.abs(carVelocity.z) *
                0.25;

        }

        if (
            car.position.z <
            -sideLimit
        ) {

            car.position.z =
                -sideLimit;

            carVelocity.z =
                Math.abs(carVelocity.z) *
                0.25;

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
                Math.abs(carVelocity.x) *
                0.25;

        }

    }

}

// ============================================================
// BALL PHYSICS
// ============================================================

function updateBall(dt) {

    ballVelocity.y -=
        21 * dt;

    ball.position.addScaledVector(
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
            Math.abs(ballVelocity.y) <
            2.4
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
            ) *
            0.68;

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
            ) *
            0.68;

    }

    collideBallWithEnds();

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
// BALL END COLLISION
// ============================================================

function collideBallWithEnds() {

    const insideGoal =
        Math.abs(ball.position.z) <
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

            if (
                ball.position.x >
                HALF_LENGTH +
                BALL_RADIUS * 0.35
            ) {

                scoreGoal("blue");

            }

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
                    ) *
                    0.5;

            }

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
                    ) *
                    0.5;

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
                    ) *
                    0.5;

            }

        } else {

            ball.position.x =
                HALF_LENGTH -
                BALL_RADIUS;

            ballVelocity.x =
                -Math.abs(
                    ballVelocity.x
                ) *
                0.68;

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

            if (
                ball.position.x <
                -HALF_LENGTH -
                BALL_RADIUS * 0.35
            ) {

                scoreGoal("orange");

            }

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
                    ) *
                    0.5;

            }

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
                    ) *
                    0.5;

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
                    ) *
                    0.5;

            }

        } else {

            ball.position.x =
                -HALF_LENGTH +
                BALL_RADIUS;

            ballVelocity.x =
                Math.abs(
                    ballVelocity.x
                ) *
                0.68;

        }

    }

}

// ============================================================
// CAR / BALL COLLISION
// ============================================================

function updateCarBallCollision() {

    const carCentre =
        car.position
            .clone()
            .add(
                new THREE.Vector3(
                    0,
                    1.1,
                    0
                )
            );

    const delta =
        ball.position
            .clone()
            .sub(carCentre);

    const distance =
        delta.length();

    const collisionDistance =
        BALL_RADIUS +
        2.25;

    if (
        distance <
        collisionDistance &&
        distance >
        0.001
    ) {

        const normal =
            delta.normalize();

        ball.position.copy(
            carCentre
                .clone()
                .addScaledVector(
                    normal,
                    collisionDistance
                )
        );

        // Relative movement into ball

        const speedIntoBall =
            Math.max(
                0,
                carVelocity.dot(normal)
            );

        const impulse =
            7.5 +
            speedIntoBall *
            1.05;

        ballVelocity.addScaledVector(
            normal,
            impulse
        );

        ballVelocity.addScaledVector(
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

        carVelocity.multiplyScalar(
            0.96
        );

    }

}

// ============================================================
// BOOST PAD UPDATE
// ============================================================

function updateBoostPads(dt) {

    for (const pad of boostPads) {

        if (!pad.active) {

            pad.timer -= dt;

            if (
                pad.timer <= 0
            ) {

                pad.active = true;
                pad.pickup.visible = true;

            }

            continue;

        }

        pad.orb.rotation.x +=
            dt * 1.4;

        pad.orb.rotation.y +=
            dt * 2.6;

        const dx =
            car.position.x -
            pad.x;

        const dz =
            car.position.z -
            pad.z;

        const distance =
            Math.hypot(dx, dz);

        if (
            distance <
            (
                pad.big
                    ? 2.8
                    : 2
            ) &&
            car.position.y <
            2.5
        ) {

            if (pad.big) {

                boostAmount = 100;

                pad.timer = 10;

            } else {

                boostAmount =
                    Math.min(
                        100,
                        boostAmount + 12
                    );

                pad.timer = 4;

            }

            pad.active = false;

            // Decal stays.
            // Pickup disappears.
            pad.pickup.visible = false;

        }

    }

}

// ============================================================
// GOALS
// ============================================================

function scoreGoal(team) {

    if (goalPause)
        return;

    goalPause = true;
    goalPauseTimer = 2;

    if (team === "blue") {

        blueScore++;

        goalText =
            "BLUE SCORES!";

    } else {

        orangeScore++;

        goalText =
            "ORANGE SCORES!";

    }

    carVelocity.set(0, 0, 0);

}

function updateGoalPause(dt) {

    goalPauseTimer -= dt;

    if (
        goalPauseTimer <= 0
    ) {

        resetKickoff();

    }

}

// ============================================================
// CAMERA
// ============================================================

const cameraTarget =
    new THREE.Vector3();

function updateCamera(dt) {

    const forward =
        new THREE.Vector3(
            Math.cos(carRotation),
            0,
            -Math.sin(carRotation)
        );

    let desiredPosition;
    let desiredTarget;

    // ========================================================
    // BALL CAM
    // ========================================================

    if (ballCam) {

        const toBall =
            ball.position
                .clone()
                .sub(car.position);

        const ballDistance =
            toBall.length();

        toBall.y = 0;

        if (
            toBall.lengthSq() <
            0.01
        ) {

            toBall.copy(forward);

        } else {

            toBall.normalize();

        }

        // Slightly adaptive distance,
        // but don't zoom into another postcode.

        const cameraDistance =
            THREE.MathUtils.clamp(
                11.5 +
                ballDistance * 0.018,
                11.5,
                14
            );

        desiredPosition =
            car.position
                .clone()
                .addScaledVector(
                    toBall,
                    -cameraDistance
                );

        desiredPosition.y +=
            6.4;

        desiredTarget =
            ball.position.clone();

        // Blend some car position into target.
        // This helps keep the car visually anchored.

        desiredTarget.lerp(
            car.position
                .clone()
                .add(
                    new THREE.Vector3(
                        0,
                        1.2,
                        0
                    )
                ),
            0.13
        );

    }

    // ========================================================
    // CAR CAM
    // ========================================================

    else {

        desiredPosition =
            car.position
                .clone()
                .addScaledVector(
                    forward,
                    -13
                );

        desiredPosition.y +=
            6.8;

        desiredTarget =
            car.position
                .clone()
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
            -7.5 * dt
        );

    const targetSmooth =
        1 -
        Math.exp(
            -11 * dt
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

    document.getElementById(
        "score"
    ).textContent =
        `Blue ${blueScore} - ${orangeScore} Orange`;

    document.getElementById(
        "boost"
    ).textContent =
        `BOOST: ${Math.ceil(boostAmount)}`;

    document.getElementById(
        "cameraMode"
    ).textContent =
        ballCam
            ? "BALL CAM"
            : "CAR CAM";

    document.getElementById(
        "goalMessage"
    ).textContent =
        goalPause
            ? goalText
            : "";

    const minutes =
        Math.floor(
            gameTime / 60
        );

    const seconds =
        Math.floor(
            gameTime % 60
        )
        .toString()
        .padStart(2, "0");

    document.getElementById(
        "timer"
    ).textContent =
        `${minutes}:${seconds}`;

}

// ============================================================
// TIMER
// ============================================================

function updateTimer(dt) {

    if (
        gameTime > 0
    ) {

        gameTime -= dt;

        gameTime =
            Math.max(
                0,
                gameTime
            );

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

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);

// ============================================================
// MAIN LOOP
// ============================================================

function animate(time) {

    requestAnimationFrame(
        animate
    );

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

    // TAB genuinely pauses game simulation.

    if (!menuOpen) {

        if (!goalPause) {

            updateCar(dt);

            updateBall(dt);

            updateCarBallCollision();

            updateBoostPads(dt);

            updateTimer(dt);

        } else {

            updateGoalPause(dt);

        }

        updateCamera(dt);

    }

    updateHUD();

    renderer.render(
        scene,
        camera
    );

}

// ============================================================
// START
// ============================================================

resetKickoff();

cameraTarget.copy(
    car.position
);

updateHUD();

requestAnimationFrame(
    animate
);
