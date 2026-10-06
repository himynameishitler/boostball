// ============================================================
// BOOSTBALL v0.6 — REBUILT TO FLY
//
// Performance rebuild.
// Camera rebuild.
// Aerial rebuild.
// Jump/dodge rebuild.
// Controller foundation.
// Proper post-match flow.
//
// The microwave has entered flight school.
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// BASIC SETUP
// ============================================================

const canvas = document.getElementById("game");

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance"
});

renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 145, 235);


// ============================================================
// GRAPHICS / PERFORMANCE
// ============================================================

const GRAPHICS_STORAGE_KEY = "boostball-graphics-v06";

const GRAPHICS_PRESETS = {
    performance: {
        label: "Performance",
        pixelRatio: 0.65,
        shadows: false,
        fps: 30
    },

    balanced: {
        label: "Balanced",
        pixelRatio: 0.85,
        shadows: true,
        fps: 60
    },

    quality: {
        label: "Quality",
        pixelRatio: 1,
        shadows: true,
        fps: 60
    }
};

let graphicsPreset =
    localStorage.getItem(GRAPHICS_STORAGE_KEY) || "balanced";

if (!GRAPHICS_PRESETS[graphicsPreset]) {
    graphicsPreset = "balanced";
}


// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    72,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(-12, 7, 0);

const cameraTarget = new THREE.Vector3();


// ============================================================
// LIGHTING
// ============================================================

const hemisphereLight = new THREE.HemisphereLight(
    0x9fc8ff,
    0x1a241c,
    2.25
);

scene.add(hemisphereLight);

const sun = new THREE.DirectionalLight(0xffffff, 2.7);

sun.position.set(-40, 80, 35);
sun.castShadow = true;

sun.shadow.mapSize.set(768, 768);

sun.shadow.camera.left = -90;
sun.shadow.camera.right = 90;
sun.shadow.camera.top = 65;
sun.shadow.camera.bottom = -65;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 180;

scene.add(sun);


// ============================================================
// ARENA CONSTANTS
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
    new THREE.PlaneGeometry(FIELD_LENGTH, FIELD_WIDTH),
    new THREE.MeshStandardMaterial({
        color: 0x15752c,
        roughness: 0.95,
        metalness: 0
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
    opacity: 0.72
});

function createFieldLine(width, depth, x, z) {
    const line = new THREE.Mesh(
        new THREE.PlaneGeometry(width, depth),
        lineMaterial
    );

    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.015, z);

    scene.add(line);

    return line;
}

createFieldLine(0.22, FIELD_WIDTH, 0, 0);

createFieldLine(
    0.18,
    GOAL_WIDTH + 10,
    HALF_LENGTH - 18,
    0
);

createFieldLine(
    0.18,
    GOAL_WIDTH + 10,
    -HALF_LENGTH + 18,
    0
);


// ============================================================
// CENTRE CIRCLE
// ============================================================

const circlePoints = [];
const circleRadius = 10;

for (let i = 0; i <= 48; i++) {
    const angle = (i / 48) * Math.PI * 2;

    circlePoints.push(
        new THREE.Vector3(
            Math.cos(angle) * circleRadius,
            0.025,
            Math.sin(angle) * circleRadius
        )
    );
}

const circleGeometry =
    new THREE.BufferGeometry().setFromPoints(circlePoints);

const circle = new THREE.Line(
    circleGeometry,
    new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.72
    })
);

scene.add(circle);


// ============================================================
// WALLS
// ============================================================

const wallMaterial = new THREE.MeshBasicMaterial({
    color: 0x80b8dd,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false
});

function createSideWall(z) {
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(
            FIELD_LENGTH,
            WALL_HEIGHT,
            0.5
        ),
        wallMaterial
    );

    wall.position.set(
        0,
        WALL_HEIGHT / 2,
        z
    );

    scene.add(wall);
}

createSideWall(HALF_WIDTH);
createSideWall(-HALF_WIDTH);


function createEndWallPieces(x) {
    const sideWidth =
        (FIELD_WIDTH - GOAL_WIDTH) / 2;

    for (const direction of [-1, 1]) {
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.5,
                WALL_HEIGHT,
                sideWidth
            ),
            wallMaterial
        );

        wall.position.set(
            x,
            WALL_HEIGHT / 2,
            direction *
                (
                    GOAL_WIDTH / 2 +
                    sideWidth / 2
                )
        );

        scene.add(wall);
    }

    const topHeight =
        WALL_HEIGHT - GOAL_HEIGHT;

    if (topHeight > 0) {
        const topWall = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.5,
                topHeight,
                GOAL_WIDTH
            ),
            wallMaterial
        );

        topWall.position.set(
            x,
            GOAL_HEIGHT + topHeight / 2,
            0
        );

        scene.add(topWall);
    }
}

createEndWallPieces(HALF_LENGTH);
createEndWallPieces(-HALF_LENGTH);


// ============================================================
// GOALS
// ============================================================

function createGoal(side, colour) {
    const centreX =
        side *
        (
            HALF_LENGTH +
            GOAL_DEPTH / 2
        );

    const goalMaterial =
        new THREE.MeshBasicMaterial({
            color: colour,
            transparent: true,
            opacity: 0.11,
            side: THREE.DoubleSide,
            depthWrite: false
        });

    const postMaterial =
        new THREE.MeshStandardMaterial({
            color: colour,
            roughness: 0.4,
            metalness: 0.2
        });

    const back = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.4,
            GOAL_HEIGHT,
            GOAL_WIDTH
        ),
        goalMaterial
    );

    back.position.set(
        side * (HALF_LENGTH + GOAL_DEPTH),
        GOAL_HEIGHT / 2,
        0
    );

    scene.add(back);

    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(
            GOAL_DEPTH,
            0.35,
            GOAL_WIDTH
        ),
        goalMaterial
    );

    roof.position.set(
        centreX,
        GOAL_HEIGHT,
        0
    );

    scene.add(roof);

    for (const zDirection of [-1, 1]) {
        const sideWall = new THREE.Mesh(
            new THREE.BoxGeometry(
                GOAL_DEPTH,
                GOAL_HEIGHT,
                0.35
            ),
            goalMaterial
        );

        sideWall.position.set(
            centreX,
            GOAL_HEIGHT / 2,
            zDirection * GOAL_WIDTH / 2
        );

        scene.add(sideWall);
    }

    for (const zDirection of [-1, 1]) {
        const post = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.65,
                GOAL_HEIGHT,
                0.65
            ),
            postMaterial
        );

        post.position.set(
            side * HALF_LENGTH,
            GOAL_HEIGHT / 2,
            zDirection * GOAL_WIDTH / 2
        );

        post.castShadow = true;

        scene.add(post);
    }

    const crossbar = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.65,
            0.65,
            GOAL_WIDTH + 0.65
        ),
        postMaterial
    );

    crossbar.position.set(
        side * HALF_LENGTH,
        GOAL_HEIGHT,
        0
    );

    crossbar.castShadow = true;

    scene.add(crossbar);
}

createGoal(1, 0xff7a16);
createGoal(-1, 0x168cff);


// ============================================================
// CAR
// ============================================================

const car = new THREE.Group();

scene.add(car);

const body = new THREE.Mesh(
    new THREE.BoxGeometry(
        4.4,
        1.1,
        2.35
    ),
    new THREE.MeshStandardMaterial({
        color: 0x168cff,
        roughness: 0.35,
        metalness: 0.25
    })
);

body.position.y = 0.95;
body.castShadow = true;
body.receiveShadow = true;

car.add(body);

const nose = new THREE.Mesh(
    new THREE.BoxGeometry(
        1.2,
        0.65,
        2.05
    ),
    new THREE.MeshStandardMaterial({
        color: 0x0875db,
        roughness: 0.38,
        metalness: 0.2
    })
);

nose.position.set(
    2.25,
    0.78,
    0
);

nose.castShadow = true;

car.add(nose);

const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(
        1.85,
        0.85,
        1.85
    ),
    new THREE.MeshStandardMaterial({
        color: 0x183149,
        roughness: 0.25,
        metalness: 0.15
    })
);

cabin.position.set(
    -0.35,
    1.75,
    0
);

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
        0.42,
        12
    );

wheelGeometry.rotateX(
    Math.PI / 2
);

const wheelMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.9,
        metalness: 0.05
    });

function addWheel(x, z) {
    const wheel = new THREE.Mesh(
        wheelGeometry,
        wheelMaterial
    );

    wheel.position.set(
        x,
        0.55,
        z
    );

    wheel.castShadow = true;

    car.add(wheel);
    wheels.push(wheel);
}

addWheel(1.35, 1.25);
addWheel(1.35, -1.25);
addWheel(-1.35, 1.25);
addWheel(-1.35, -1.25);


// ============================================================
// BALL
// ============================================================

const ball = new THREE.Mesh(
    new THREE.SphereGeometry(
        BALL_RADIUS,
        20,
        14
    ),
    new THREE.MeshStandardMaterial({
        color: 0xf4f4f4,
        roughness: 0.55,
        metalness: 0.05
    })
);

ball.castShadow = true;
ball.receiveShadow = true;

scene.add(ball);

const ballVelocity =
    new THREE.Vector3();


// ============================================================
// APPLY GRAPHICS
// ============================================================

function applyGraphicsPreset() {
    const preset =
        GRAPHICS_PRESETS[graphicsPreset];

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            preset.pixelRatio
        )
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled =
        preset.shadows;

    sun.castShadow =
        preset.shadows;

    body.castShadow =
        preset.shadows;

    cabin.castShadow =
        preset.shadows;

    nose.castShadow =
        preset.shadows;

    ball.castShadow =
        preset.shadows;

    field.receiveShadow =
        preset.shadows;

    for (const wheel of wheels) {
        wheel.castShadow =
            preset.shadows;
    }

    localStorage.setItem(
        GRAPHICS_STORAGE_KEY,
        graphicsPreset
    );
}


// ============================================================
// PHYSICS CONSTANTS
// ============================================================

const ACCELERATION = 29;
const REVERSE_ACCELERATION = 18;
const BRAKING = 34;

const DRIVE_TOP_SPEED = 29;
const REVERSE_TOP_SPEED = 15;

const BOOST_TOP_SPEED = 45;
const ABSOLUTE_SPEED_LIMIT = 48;

const BOOST_ACCELERATION = 43;
const BOOST_USAGE = 33;

const NORMAL_GRIP = 7;
const POWERSLIDE_GRIP = 1.15;

const COAST_DRAG = 0.18;
const POWERED_DRAG = 0.06;

const GRAVITY = 27;

const LOW_SPEED_STEER = 2.65;
const HIGH_SPEED_STEER = 1.65;

const POWERSLIDE_STEER_MULTIPLIER =
    1.35;


// ============================================================
// v0.6 JUMP SYSTEM
// ============================================================

// Higher than v0.5's old 11-unit jump.

const JUMP_IMPULSE = 13.5;

// Holding jump gives extra lift briefly.

const JUMP_HOLD_FORCE = 18;
const JUMP_HOLD_TIME = 0.20;

// Second jump / dodge.

const DOUBLE_JUMP_IMPULSE = 10.5;
const DODGE_HORIZONTAL_IMPULSE = 18;
const DODGE_VERTICAL_IMPULSE = 5.5;

const DODGE_DURATION = 0.42;
const DODGE_ROTATION_SPEED = 11;


// ============================================================
// AERIAL CONSTANTS
// ============================================================

const AIR_PITCH_SPEED = 2.6;
const AIR_YAW_SPEED = 2.25;
const AIR_ROLL_SPEED = 2.8;


// ============================================================
// CAR STATE
// ============================================================

const carVelocity =
    new THREE.Vector3();

let verticalVelocity = 0;

let carRotation = 0;

let grounded = true;

let boostAmount = 33;

let jumpHeldTime = 0;
let firstJumpUsed = false;
let secondJumpUsed = false;

let dodgeActive = false;
let dodgeTimer = 0;

const dodgeAxis =
    new THREE.Vector3();


// ============================================================
// ORIENTATION
// ============================================================

const carQuaternion =
    new THREE.Quaternion();

const rotationQuaternion =
    new THREE.Quaternion();

const Y_AXIS =
    new THREE.Vector3(0, 1, 0);

const LOCAL_FORWARD =
    new THREE.Vector3(1, 0, 0);

const LOCAL_UP =
    new THREE.Vector3(0, 1, 0);

const LOCAL_RIGHT =
    new THREE.Vector3(0, 0, 1);


// ============================================================
// REUSABLE VECTORS
// ============================================================

const tempForward =
    new THREE.Vector3();

const tempRight =
    new THREE.Vector3();

const tempUp =
    new THREE.Vector3();

const tempVelocity =
    new THREE.Vector3();

const tempDirection =
    new THREE.Vector3();

const tempBallDifference =
    new THREE.Vector3();

const tempCameraPosition =
    new THREE.Vector3();

const tempCameraLook =
    new THREE.Vector3();

const tempCarToBall =
    new THREE.Vector3();

const tempHorizontal =
    new THREE.Vector3();


// ============================================================
// KEYBOARD CONTROLS
// ============================================================

const DEFAULT_CONTROLS = {
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

const CONTROL_STORAGE_KEY =
    "boostball-controls-v042";

const controls = {
    ...DEFAULT_CONTROLS
};

function loadControls() {
    try {
        const saved =
            JSON.parse(
                localStorage.getItem(
                    CONTROL_STORAGE_KEY
                )
            );

        if (!saved) {
            return;
        }

        for (
            const action of
            Object.keys(DEFAULT_CONTROLS)
        ) {
            if (
                typeof saved[action] ===
                "string"
            ) {
                controls[action] =
                    saved[action];
            }
        }

    } catch (error) {
        console.warn(
            "Could not load controls:",
            error
        );
    }
}

function saveControls() {
    try {
        localStorage.setItem(
            CONTROL_STORAGE_KEY,
            JSON.stringify(controls)
        );

    } catch (error) {
        console.warn(
            "Could not save controls:",
            error
        );
    }
}

function resetControls() {
    Object.assign(
        controls,
        DEFAULT_CONTROLS
    );

    saveControls();
}

loadControls();


// ============================================================
// KEYBOARD INPUT STATE
// ============================================================

const keys = {};
const pressed = {};

let menuOpen = false;

let rebindingAction = null;

let controlNotice = "";

function normalizeKey(event) {
    if (event.key === " ") {
        return " ";
    }

    return event.key.toLowerCase();
}

function clearHeldInputs() {
    for (const key in keys) {
        keys[key] = false;
    }

    for (const key in pressed) {
        pressed[key] = false;
    }

    controllerState.jump = false;
    controllerState.boost = false;
    controllerState.powerslide = false;
}

function browserShortcutActive(event) {
    return (
        event.altKey ||
        event.metaKey ||
        (
            event.ctrlKey &&
            event.key.toLowerCase() !==
                "control"
        )
    );
}

function isProtectedBinding(event) {
    const key =
        normalizeKey(event);

    if (
        event.altKey ||
        event.metaKey
    ) {
        return true;
    }

    if (
        event.ctrlKey &&
        key !== "control"
    ) {
        return true;
    }

    return false;
}


// ============================================================
// CONTROLLER SUPPORT
// ============================================================

// v0.6 introduces native Gamepad API input.
//
// These are deliberately kept separate from keyboard controls.
// Later we can build full controller rebinding into the menu.
//
// Standard Gamepad mapping:
// Left stick = steering / aerial pitch + yaw
// R2 = throttle
// L2 = brake / reverse
// X / Cross = jump
// Square = powerslide / air roll
// Circle = ball cam
// L1 = boost for the current test layout
//
// R1 is intentionally NOT used for boost.
// It is being reserved for the future scoreboard.

const controllerState = {
    connected: false,

    steerX: 0,
    steerY: 0,

    throttle: 0,
    reverse: 0,

    jump: false,
    jumpPressed: false,

    boost: false,
    powerslide: false,

    ballCamPressed: false
};

let previousControllerJump = false;
let previousControllerBallCam = false;

const GAMEPAD_DEADZONE = 0.14;

function applyDeadzone(value) {
    if (
        Math.abs(value) <
        GAMEPAD_DEADZONE
    ) {
        return 0;
    }

    const sign =
        Math.sign(value);

    return sign *
        (
            (
                Math.abs(value) -
                GAMEPAD_DEADZONE
            ) /
            (
                1 -
                GAMEPAD_DEADZONE
            )
        );
}

function buttonValue(gamepad, index) {
    const button =
        gamepad.buttons[index];

    if (!button) {
        return 0;
    }

    return button.value;
}

function buttonPressed(gamepad, index) {
    const button =
        gamepad.buttons[index];

    return Boolean(
        button &&
        button.pressed
    );
}

function updateController() {
    const gamepads =
        navigator.getGamepads
            ? navigator.getGamepads()
            : [];

    let gamepad = null;

    for (const candidate of gamepads) {
        if (
            candidate &&
            candidate.connected
        ) {
            gamepad = candidate;
            break;
        }
    }

    if (!gamepad) {
        controllerState.connected =
            false;

        controllerState.steerX = 0;
        controllerState.steerY = 0;
        controllerState.throttle = 0;
        controllerState.reverse = 0;
        controllerState.jump = false;
        controllerState.jumpPressed = false;
        controllerState.boost = false;
        controllerState.powerslide = false;
        controllerState.ballCamPressed =
            false;

        previousControllerJump = false;
        previousControllerBallCam = false;

        return;
    }

    controllerState.connected = true;

    controllerState.steerX =
        applyDeadzone(
            gamepad.axes[0] || 0
        );

    controllerState.steerY =
        applyDeadzone(
            gamepad.axes[1] || 0
        );

    // Standard mapping:
    // button 7 = R2
    // button 6 = L2

    controllerState.throttle =
        buttonValue(
            gamepad,
            7
        );

    controllerState.reverse =
        buttonValue(
            gamepad,
            6
        );

    // Cross / X

    const jumpNow =
        buttonPressed(
            gamepad,
            0
        );

    controllerState.jump =
        jumpNow;

    controllerState.jumpPressed =
        jumpNow &&
        !previousControllerJump;

    previousControllerJump =
        jumpNow;

    // L1 test boost binding.

    controllerState.boost =
        buttonPressed(
            gamepad,
            4
        );

    // Square.

    controllerState.powerslide =
        buttonPressed(
            gamepad,
            2
        );

    // Circle.

    const ballCamNow =
        buttonPressed(
            gamepad,
            1
        );

    controllerState.ballCamPressed =
        ballCamNow &&
        !previousControllerBallCam;

    previousControllerBallCam =
        ballCamNow;
}


// ============================================================
// INPUT HELPERS
// ============================================================

function throttleInput() {
    const keyboard =
        keys[controls.throttle]
            ? 1
            : 0;

    return Math.max(
        keyboard,
        controllerState.throttle
    );
}

function reverseInput() {
    const keyboard =
        keys[controls.reverse]
            ? 1
            : 0;

    return Math.max(
        keyboard,
        controllerState.reverse
    );
}

function steeringInput() {
    let value =
        controllerState.steerX;

    if (keys[controls.left]) {
        value -= 1;
    }

    if (keys[controls.right]) {
        value += 1;
    }

    return THREE.MathUtils.clamp(
        value,
        -1,
        1
    );
}

function aerialPitchInput() {
    let value =
        controllerState.steerY;

    if (keys[controls.throttle]) {
        value -= 1;
    }

    if (keys[controls.reverse]) {
        value += 1;
    }

    return THREE.MathUtils.clamp(
        value,
        -1,
        1
    );
}

function boostHeld() {
    return Boolean(
        keys[controls.boost] ||
        controllerState.boost
    );
}

function powerslideHeld() {
    return Boolean(
        keys[controls.powerslide] ||
        controllerState.powerslide
    );
}

function jumpHeld() {
    return Boolean(
        keys[controls.jump] ||
        controllerState.jump
    );
}


// ============================================================
// MATCH STATE
// ============================================================

const MATCH_STATE = {
    PLAYING: "playing",
    OVERTIME: "overtime",
    CELEBRATION: "celebration",
    RESULTS: "results",
    FREEPLAY: "freeplay"
};

let matchState =
    MATCH_STATE.PLAYING;

let blueScore = 0;
let orangeScore = 0;

let gameTime = 300;
let timerStarted = false;

let ballCam = true;

let goalPause = false;
let goalPauseTimer = 0;

let goalText = "";

let winningTeam = null;
let matchResult = "";

const CELEBRATION_DURATION = 5;

let celebrationTimer = 0;


// ============================================================
// SIMPLE MATCH STATS
// ============================================================

const matchStats = {
    goals: 0,
    shots: 0,
    saves: 0,
    score: 0
};

function resetMatchStats() {
    matchStats.goals = 0;
    matchStats.shots = 0;
    matchStats.saves = 0;
    matchStats.score = 0;
}


// ============================================================
// KEYBOARD EVENTS
// ============================================================

window.addEventListener(
    "keydown",
    event => {
        const key =
            normalizeKey(event);

        // ----------------------------------------------------
        // CONTROL REBINDING
        // ----------------------------------------------------

        if (rebindingAction) {
            if (key === "escape") {
                event.preventDefault();

                rebindingAction = null;
                controlNotice =
                    "Binding cancelled.";

                updateMenu();

                return;
            }

            if (isProtectedBinding(event)) {
                controlNotice =
                    "That shortcut belongs to your browser or operating system.";

                updateMenu();

                return;
            }

            if (
                rebindingAction ===
                "menu"
            ) {
                controlNotice =
                    "TAB stays as the menu key.";

                rebindingAction = null;

                updateMenu();

                return;
            }

            if (key === "tab") {
                event.preventDefault();

                controlNotice =
                    "TAB is reserved for the Boostball menu.";

                updateMenu();

                return;
            }

            const duplicateAction =
                Object.keys(controls).find(
                    action =>
                        action !==
                            rebindingAction &&
                        controls[action] === key
                );

            if (duplicateAction) {
                event.preventDefault();

                controlNotice =
                    `${readableKey(key)} is already bound to ${readableAction(duplicateAction)}.`;

                updateMenu();

                return;
            }

            event.preventDefault();

            controls[rebindingAction] =
                key;

            controlNotice =
                `${readableAction(rebindingAction)} → ${readableKey(key)}`;

            rebindingAction = null;

            saveControls();
            clearHeldInputs();
            updateMenu();

            return;
        }

        // ----------------------------------------------------
        // LET BROWSER / WINDOWS SHORTCUTS WORK
        // ----------------------------------------------------

        if (browserShortcutActive(event)) {
            return;
        }

        // ----------------------------------------------------
        // MENU
        // ----------------------------------------------------

        if (
            key === controls.menu &&
            !pressed[key]
        ) {
            event.preventDefault();

            menuOpen =
                !menuOpen;

            clearHeldInputs();

            controlNotice = "";

            updateMenu();

            pressed[key] = true;

            return;
        }

        if (menuOpen) {
            if (
                key === " " ||
                key.startsWith("arrow")
            ) {
                event.preventDefault();
            }

            return;
        }

        // ----------------------------------------------------
        // GAMEPLAY
        // ----------------------------------------------------

        keys[key] = true;

        if (!pressed[key]) {
            pressed[key] = true;

            if (
                key === controls.jump &&
                !goalPause &&
                matchState !==
                    MATCH_STATE.RESULTS
            ) {
                performJump();
            }

            if (
                key === controls.ballCam
            ) {
                ballCam = !ballCam;
            }

            if (
                key === controls.reset
            ) {
                if (
                    matchState ===
                    MATCH_STATE.RESULTS
                ) {
                    startNewMatch();
                } else {
                    resetKickoff();
                }
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
            normalizeKey(event);

        keys[key] = false;
        pressed[key] = false;
    }
);


window.addEventListener(
    "blur",
    () => {
        clearHeldInputs();
    }
);


// ============================================================
// PAGE VISIBILITY / CPU PROTECTION
// ============================================================

let pageVisible =
    !document.hidden;

document.addEventListener(
    "visibilitychange",
    () => {
        pageVisible =
            !document.hidden;

        clearHeldInputs();

        // Part 2 declares these timing variables.
        // Resetting them prevents a massive dt after tabbing back.

        if (
            typeof resetFrameClock ===
            "function"
        ) {
            resetFrameClock();
        }
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
        opacity: 0.58,
        side: THREE.DoubleSide
    });

const decalMaterialBig =
    new THREE.MeshBasicMaterial({
        color: 0xff8c18,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide
    });

const smallRingGeometry =
    new THREE.RingGeometry(
        1.15,
        1.55,
        16
    );

const bigRingGeometry =
    new THREE.RingGeometry(
        1.65,
        2.15,
        20
    );

const smallCircleGeometry =
    new THREE.CircleGeometry(
        0.55,
        12
    );

const bigCircleGeometry =
    new THREE.CircleGeometry(
        0.8,
        16
    );

const smallTorusGeometry =
    new THREE.TorusGeometry(
        0.72,
        0.15,
        6,
        12
    );

const bigTorusGeometry =
    new THREE.TorusGeometry(
        1.05,
        0.2,
        6,
        14
    );

const smallOrbGeometry =
    new THREE.OctahedronGeometry(
        0.45,
        0
    );

const bigOrbGeometry =
    new THREE.OctahedronGeometry(
        0.7,
        0
    );

const smallPickupMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffd34f,
        emissive: 0x7f4c00,
        emissiveIntensity: 0.65,
        roughness: 0.4
    });

const bigPickupMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xff9d25,
        emissive: 0x9a3900,
        emissiveIntensity: 0.8,
        roughness: 0.35
    });

function createBoostPad(
    x,
    z,
    big = false
) {
    const group =
        new THREE.Group();

    group.position.set(
        x,
        0,
        z
    );

    scene.add(group);

    const decal =
        new THREE.Mesh(
            big
                ? bigRingGeometry
                : smallRingGeometry,

            big
                ? decalMaterialBig
                : decalMaterialSmall
        );

    decal.rotation.x =
        -Math.PI / 2;

    decal.position.y =
        0.025;

    group.add(decal);

    const inner =
        new THREE.Mesh(
            big
                ? bigCircleGeometry
                : smallCircleGeometry,

            new THREE.MeshBasicMaterial({
                color:
                    big
                        ? 0xff7a00
                        : 0xd8aa28,

                transparent: true,

                opacity:
                    big
                        ? 0.32
                        : 0.25,

                side:
                    THREE.DoubleSide
            })
        );

    inner.rotation.x =
        -Math.PI / 2;

    inner.position.y =
        0.028;

    group.add(inner);

    const pickup =
        new THREE.Group();

    pickup.position.y =
        big
            ? 1.2
            : 0.85;

    group.add(pickup);

    const ring =
        new THREE.Mesh(
            big
                ? bigTorusGeometry
                : smallTorusGeometry,

            big
                ? bigPickupMaterial
                : smallPickupMaterial
        );

    ring.rotation.x =
        Math.PI / 2;

    pickup.add(ring);

    const orb =
        new THREE.Mesh(
            big
                ? bigOrbGeometry
                : smallOrbGeometry,

            big
                ? bigPickupMaterial
                : smallPickupMaterial
        );

    pickup.add(orb);

    const pickupRadius =
        big
            ? 3
            : 2.25;

    boostPads.push({
        x,
        z,
        big,

        group,
        pickup,
        orb,

        active: true,

        timer: 0,

        pickupRadiusSq:
            pickupRadius *
            pickupRadius
    });
}


// Small pads

createBoostPad(0, 0);
createBoostPad(0, 25);
createBoostPad(0, -25);

createBoostPad(-27, 13);
createBoostPad(-27, -13);

createBoostPad(-52, 0);

createBoostPad(-56, 27);
createBoostPad(-56, -27);

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
// GOAL EXPLOSIONS
// ============================================================

const goalExplosions = [];

const explosionSphereGeometry =
    new THREE.SphereGeometry(
        1,
        10,
        7
    );

const explosionRingGeometry =
    new THREE.RingGeometry(
        1,
        1.35,
        24
    );

function createGoalExplosion(
    side,
    team
) {
    const colour =
        team === "blue"
            ? 0x168cff
            : 0xff7a16;

    const group =
        new THREE.Group();

    group.position.set(
        side *
            (
                HALF_LENGTH +
                2
            ),
        5,
        0
    );

    const sphereMaterial =
        new THREE.MeshBasicMaterial({
            color: colour,
            transparent: true,
            opacity: 0.75,
            blending:
                THREE.AdditiveBlending,
            depthWrite: false
        });

    const sphere =
        new THREE.Mesh(
            explosionSphereGeometry,
            sphereMaterial
        );

    const ringMaterial =
        new THREE.MeshBasicMaterial({
            color: colour,
            transparent: true,
            opacity: 0.85,
            blending:
                THREE.AdditiveBlending,
            side:
                THREE.DoubleSide,
            depthWrite: false
        });

    const ring =
        new THREE.Mesh(
            explosionRingGeometry,
            ringMaterial
        );

    ring.rotation.y =
        Math.PI / 2;

    group.add(sphere);
    group.add(ring);

    scene.add(group);

    goalExplosions.push({
        group,
        sphere,
        ring,
        sphereMaterial,
        ringMaterial,

        age: 0,
        lifetime: 1.15
    });
}


// ============================================================
// HUD
// ============================================================

const hud =
    document.getElementById("hud");

hud.innerHTML = `
    <h1 style="
        margin:0;
        font-size:28px;
        letter-spacing:2px;
    ">
        BOOSTBALL
    </h1>

    <div
        id="score"
        style="
            margin-top:5px;
            font-size:20px;
        "
    >
        Blue 0 - 0 Orange
    </div>

    <div
        id="timer"
        style="
            margin-top:4px;
            font-size:18px;
            font-weight:bold;
        "
    >
        5:00
    </div>

    <div
        id="boost"
        style="
            margin-top:5px;
            font-size:16px;
        "
    >
        BOOST: 33
    </div>

    <div
        id="cameraMode"
        style="
            margin-top:3px;
            font-size:13px;
            opacity:0.75;
        "
    >
        BALL CAM
    </div>

    <div
        id="goalMessage"
        style="
            margin-top:12px;
            font-size:28px;
            font-weight:bold;
            min-height:34px;
        "
    ></div>

    <div
        id="matchHint"
        style="
            margin-top:8px;
            font-size:12px;
            opacity:0.6;
        "
    >
        TAB — Menu
    </div>
`;

const scoreElement =
    document.getElementById("score");

const timerElement =
    document.getElementById("timer");

const boostElement =
    document.getElementById("boost");

const cameraModeElement =
    document.getElementById("cameraMode");

const goalMessageElement =
    document.getElementById("goalMessage");

const matchHintElement =
    document.getElementById("matchHint");

let previousScore = "";
let previousTimer = "";
let previousBoost = "";
let previousCamera = "";
let previousGoalMessage = "";
let previousHint = "";


// ============================================================
// PERFORMANCE DISPLAY
// ============================================================

const performanceDisplay =
    document.createElement("div");

performanceDisplay.style.cssText = `
    position:absolute;
    right:12px;
    top:12px;
    padding:7px 10px;
    border-radius:7px;
    background:rgba(0,0,0,0.42);
    color:white;
    font:12px monospace;
    z-index:25;
    pointer-events:none;
    opacity:0.78;
`;

document.body.appendChild(
    performanceDisplay
);

let diagnosticFrames = 0;
let diagnosticTime = 0;
let measuredFPS = 0;

function updatePerformanceDisplay(dt) {
    diagnosticFrames++;
    diagnosticTime += dt;

    if (diagnosticTime < 0.5) {
        return;
    }

    measuredFPS =
        Math.round(
            diagnosticFrames /
            diagnosticTime
        );

    diagnosticFrames = 0;
    diagnosticTime = 0;

    const preset =
        GRAPHICS_PRESETS[
            graphicsPreset
        ];

    performanceDisplay.textContent =
        `${measuredFPS} FPS · ${preset.label.toUpperCase()}`;
}


// ============================================================
// RESULTS SCREEN
// ============================================================

const resultsScreen =
    document.createElement("div");

resultsScreen.style.cssText = `
    position:absolute;
    inset:0;
    display:none;
    align-items:center;
    justify-content:center;
    z-index:45;
    color:white;
    font-family:Arial,sans-serif;
    background:
        linear-gradient(
            135deg,
            rgba(3,8,17,0.92),
            rgba(8,20,38,0.90)
        );
`;

document.body.appendChild(
    resultsScreen
);


// ============================================================
// CELEBRATION BANNER
// ============================================================

const celebrationBanner =
    document.createElement("div");

celebrationBanner.style.cssText = `
    position:absolute;
    left:50%;
    top:28%;
    transform:translateX(-50%);
    display:none;
    text-align:center;
    color:white;
    z-index:35;
    pointer-events:none;
    font-family:Arial,sans-serif;
    text-shadow:0 4px 20px rgba(0,0,0,0.8);
`;

document.body.appendChild(
    celebrationBanner
);


// ============================================================
// MENU
// ============================================================

const menu =
    document.createElement("div");

menu.style.cssText = `
    position:absolute;
    inset:0;
    display:none;
    align-items:center;
    justify-content:center;
    background:rgba(2,6,14,0.86);
    z-index:50;
    color:white;
    font-family:Arial,sans-serif;
`;

document.body.appendChild(menu);


// ============================================================
// UI HELPERS
// ============================================================

function readableKey(key) {
    if (key === " ") {
        return "SPACE";
    }

    if (key === "control") {
        return "CTRL";
    }

    if (key === "shift") {
        return "SHIFT";
    }

    if (key === "tab") {
        return "TAB";
    }

    return key.toUpperCase();
}

function readableAction(action) {
    const names = {
        throttle:
            "Forward / Air Pitch",

        reverse:
            "Reverse / Air Pitch",

        left:
            "Steer / Air Yaw Left",

        right:
            "Steer / Air Yaw Right",

        jump:
            "Jump / Dodge",

        boost:
            "Boost",

        powerslide:
            "Powerslide / Air Roll",

        ballCam:
            "Ball Cam",

        reset:
            "Reset / Rematch",

        menu:
            "Menu"
    };

    return names[action] || action;
}


// ============================================================
// MENU UI
// ============================================================

function updateMenu() {
    if (!menuOpen) {
        menu.style.display =
            "none";

        return;
    }

    menu.style.display =
        "flex";

    const controlRows =
        Object.keys(controls)
            .map(action => {
                const waiting =
                    rebindingAction ===
                    action;

                return `
                    <button
                        data-bind="${action}"
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:35px;
                            width:100%;
                            padding:10px 12px;
                            margin:4px 0;
                            border:1px solid rgba(255,255,255,0.12);
                            border-radius:7px;
                            background:rgba(255,255,255,0.06);
                            color:white;
                            cursor:pointer;
                            font-size:14px;
                        "
                    >
                        <span>
                            ${readableAction(action)}
                        </span>

                        <strong>
                            ${
                                waiting
                                    ? "PRESS A KEY..."
                                    : readableKey(
                                        controls[action]
                                    )
                            }
                        </strong>
                    </button>
                `;
            })
            .join("");

    const graphicsButtons =
        Object.keys(
            GRAPHICS_PRESETS
        )
            .map(name => {
                const active =
                    name ===
                    graphicsPreset;

                return `
                    <button
                        data-graphics="${name}"
                        style="
                            padding:9px 13px;
                            border-radius:7px;
                            border:
                                1px solid
                                ${
                                    active
                                        ? "#4aa6ff"
                                        : "rgba(255,255,255,0.15)"
                                };
                            background:
                                ${
                                    active
                                        ? "rgba(74,166,255,0.22)"
                                        : "rgba(255,255,255,0.06)"
                                };
                            color:white;
                            cursor:pointer;
                        "
                    >
                        ${
                            GRAPHICS_PRESETS[
                                name
                            ].label
                        }
                    </button>
                `;
            })
            .join("");

    menu.innerHTML = `
        <div style="
            width:min(560px,90vw);
            max-height:90vh;
            overflow:auto;
            padding:24px;
            border-radius:14px;
            background:rgba(7,17,31,0.96);
            border:1px solid rgba(255,255,255,0.12);
            box-shadow:0 20px 60px rgba(0,0,0,0.5);
        ">

            <div style="
                font-size:30px;
                font-weight:900;
                letter-spacing:2px;
            ">
                BOOSTBALL
            </div>

            <div style="
                margin-top:3px;
                opacity:0.6;
                font-size:13px;
            ">
                v0.6 · REBUILT TO FLY
            </div>

            <div style="
                margin-top:22px;
                font-weight:bold;
            ">
                CONTROLS
            </div>

            <div style="
                margin-top:8px;
            ">
                ${controlRows}
            </div>

            <button
                id="resetBindings"
                style="
                    margin-top:8px;
                    padding:9px 12px;
                    border-radius:7px;
                    border:1px solid rgba(255,255,255,0.15);
                    background:rgba(255,255,255,0.06);
                    color:white;
                    cursor:pointer;
                "
            >
                Reset Keyboard Controls
            </button>

            <div style="
                margin-top:24px;
                font-weight:bold;
            ">
                GRAPHICS
            </div>

            <div style="
                display:flex;
                flex-wrap:wrap;
                gap:8px;
                margin-top:10px;
            ">
                ${graphicsButtons}
            </div>

            <div style="
                margin-top:20px;
                padding:12px;
                border-radius:8px;
                background:rgba(255,255,255,0.04);
                font-size:13px;
                line-height:1.5;
                opacity:0.8;
            ">
                PS5 controller support is active.
                Left stick controls steering/aerials,
                R2 accelerates, L2 brakes/reverses,
                Cross jumps, Square powerslides/air-rolls,
                Circle toggles Ball Cam and L1 boosts.
                R1 is reserved for the future multiplayer scoreboard.
            </div>

            <div style="
                min-height:20px;
                margin-top:14px;
                font-size:13px;
                color:#7fc1ff;
            ">
                ${controlNotice}
            </div>

            <div style="
                margin-top:14px;
                opacity:0.55;
                font-size:12px;
            ">
                TAB — Close Menu
            </div>

        </div>
    `;

    menu
        .querySelectorAll(
            "[data-bind]"
        )
        .forEach(button => {
            button.onclick = () => {
                const action =
                    button.dataset.bind;

                if (action === "menu") {
                    controlNotice =
                        "TAB stays as the menu key.";

                    updateMenu();

                    return;
                }

                rebindingAction =
                    action;

                controlNotice =
                    `Press a key for ${readableAction(action)}. ESC cancels.`;

                updateMenu();
            };
        });

    const resetButton =
        menu.querySelector(
            "#resetBindings"
        );

    if (resetButton) {
        resetButton.onclick = () => {
            resetControls();

            rebindingAction = null;

            controlNotice =
                "Keyboard controls reset.";

            updateMenu();
        };
    }

    menu
        .querySelectorAll(
            "[data-graphics]"
        )
        .forEach(button => {
            button.onclick = () => {
                graphicsPreset =
                    button.dataset.graphics;

                applyGraphicsPreset();

                controlNotice =
                    `Graphics → ${GRAPHICS_PRESETS[graphicsPreset].label}`;

                updateMenu();

                if (
                    typeof resetFrameClock ===
                    "function"
                ) {
                    resetFrameClock();
                }
            };
        });
}


// ============================================================
// RESULTS GUI
// ============================================================

function showResultsScreen() {
    const colour =
        winningTeam === "blue"
            ? "#4aa6ff"
            : "#ff963f";

    resultsScreen.style.display =
        "flex";

    resultsScreen.innerHTML = `
        <div style="
            width:min(720px,92vw);
            padding:30px;
            border-radius:18px;
            background:rgba(5,12,24,0.94);
            border:1px solid rgba(255,255,255,0.13);
            box-shadow:0 25px 80px rgba(0,0,0,0.55);
        ">

            <div style="
                text-align:center;
                opacity:0.62;
                letter-spacing:4px;
                font-size:13px;
            ">
                FINAL
            </div>

            <div style="
                margin-top:8px;
                text-align:center;
                font-size:clamp(36px,7vw,70px);
                font-weight:900;
                color:${colour};
                letter-spacing:3px;
            ">
                ${matchResult}
            </div>

            <div style="
                margin-top:6px;
                text-align:center;
                font-size:34px;
                font-weight:bold;
            ">
                ${blueScore}
                &nbsp;–&nbsp;
                ${orangeScore}
            </div>

            <div style="
                margin-top:28px;
                padding:16px;
                border-radius:10px;
                background:rgba(255,255,255,0.045);
            ">

                <div style="
                    display:grid;
                    grid-template-columns:
                        1fr repeat(4,70px);
                    gap:10px;
                    font-size:13px;
                    opacity:0.65;
                    margin-bottom:10px;
                ">
                    <span>PLAYER</span>
                    <span>SCORE</span>
                    <span>GOALS</span>
                    <span>SHOTS</span>
                    <span>SAVES</span>
                </div>

                <div style="
                    display:grid;
                    grid-template-columns:
                        1fr repeat(4,70px);
                    gap:10px;
                    align-items:center;
                    font-weight:bold;
                ">
                    <span style="color:#4aa6ff;">
                        YOU
                    </span>

                    <span>
                        ${matchStats.score}
                    </span>

                    <span>
                        ${matchStats.goals}
                    </span>

                    <span>
                        ${matchStats.shots}
                    </span>

                    <span>
                        ${matchStats.saves}
                    </span>
                </div>

            </div>

            <div style="
                display:flex;
                flex-wrap:wrap;
                justify-content:center;
                gap:10px;
                margin-top:28px;
            ">

                <button
                    id="playAgainButton"
                    style="
                        padding:13px 22px;
                        border:0;
                        border-radius:8px;
                        background:#168cff;
                        color:white;
                        font-weight:bold;
                        cursor:pointer;
                        font-size:15px;
                    "
                >
                    PLAY AGAIN
                </button>

                <button
                    id="freePlayButton"
                    style="
                        padding:13px 22px;
                        border:1px solid rgba(255,255,255,0.18);
                        border-radius:8px;
                        background:rgba(255,255,255,0.07);
                        color:white;
                        font-weight:bold;
                        cursor:pointer;
                        font-size:15px;
                    "
                >
                    FREE PLAY
                </button>

                <button
                    id="mainMenuButton"
                    style="
                        padding:13px 22px;
                        border:1px solid rgba(255,255,255,0.18);
                        border-radius:8px;
                        background:rgba(255,255,255,0.07);
                        color:white;
                        font-weight:bold;
                        cursor:pointer;
                        font-size:15px;
                    "
                >
                    MAIN MENU
                </button>

            </div>

            <div style="
                margin-top:18px;
                text-align:center;
                opacity:0.45;
                font-size:12px;
            ">
                Replays · Ranks · Report/Block · Multiplayer
                coming in later updates
            </div>

        </div>
    `;

    const playAgainButton =
        document.getElementById(
            "playAgainButton"
        );

    const freePlayButton =
        document.getElementById(
            "freePlayButton"
        );

    const mainMenuButton =
        document.getElementById(
            "mainMenuButton"
        );

    playAgainButton.onclick = () => {
        startNewMatch();
    };

    freePlayButton.onclick = () => {
        startFreePlay();
    };

    mainMenuButton.onclick = () => {
        resultsScreen.style.display =
            "none";

        menuOpen = true;

        updateMenu();
    };
}


// ============================================================
// CELEBRATION UI
// ============================================================

function showCelebration() {
    const colour =
        winningTeam === "blue"
            ? "#4aa6ff"
            : "#ff963f";

    celebrationBanner.style.display =
        "block";

    celebrationBanner.innerHTML = `
        <div style="
            font-size:clamp(38px,7vw,72px);
            font-weight:900;
            letter-spacing:4px;
            color:${colour};
        ">
            ${matchResult}
        </div>

        <div
            id="celebrationCountdown"
            style="
                margin-top:8px;
                font-size:16px;
                letter-spacing:2px;
                opacity:0.8;
            "
        >
            CELEBRATE
        </div>
    `;
}


// ============================================================
// END PART 1
// PART 2 GOES DIRECTLY BELOW THIS LINE
// ============================================================
// ============================================================
// BOOSTBALL v0.6 — PART 2
// PHYSICS / CAMERA / MATCH / MAIN LOOP
// ============================================================


// ============================================================
// JUMP / DOUBLE JUMP / DODGE
// ============================================================

function performJump() {

    if (
        matchState === MATCH_STATE.RESULTS
    ) {
        return;
    }

    // First jump.
    if (grounded) {

        grounded = false;

        firstJumpUsed = true;
        secondJumpUsed = false;

        jumpHeldTime = 0;

        verticalVelocity =
            Math.max(
                verticalVelocity,
                JUMP_IMPULSE
            );

        return;
    }


    // Second jump has already been spent.
    if (
        !firstJumpUsed ||
        secondJumpUsed
    ) {
        return;
    }


    secondJumpUsed = true;

    const steer =
        steeringInput();

    const pitch =
        aerialPitchInput();


    // --------------------------------------------------------
    // NEUTRAL DOUBLE JUMP
    // --------------------------------------------------------

    if (
        Math.abs(steer) < 0.25 &&
        Math.abs(pitch) < 0.25
    ) {

        verticalVelocity +=
            DOUBLE_JUMP_IMPULSE;

        return;
    }


    // --------------------------------------------------------
    // DIRECTIONAL DODGE
    // --------------------------------------------------------

    dodgeActive = true;
    dodgeTimer = 0;

    tempForward
        .copy(LOCAL_FORWARD)
        .applyQuaternion(
            car.quaternion
        );

    tempForward.y = 0;

    if (
        tempForward.lengthSq() <
        0.0001
    ) {

        tempForward.set(
            Math.cos(carRotation),
            0,
            -Math.sin(carRotation)
        );

    } else {

        tempForward.normalize();
    }


    tempRight
        .set(
            -tempForward.z,
            0,
            tempForward.x
        );


    // Stick up = forward dodge.
    // Stick down = backwards dodge.

    tempDirection
        .set(0, 0, 0)
        .addScaledVector(
            tempForward,
            -pitch
        )
        .addScaledVector(
            tempRight,
            steer
        );


    if (
        tempDirection.lengthSq() <
        0.001
    ) {

        tempDirection.copy(
            tempForward
        );
    }

    tempDirection.normalize();


    carVelocity.addScaledVector(
        tempDirection,
        DODGE_HORIZONTAL_IMPULSE
    );


    verticalVelocity +=
        DODGE_VERTICAL_IMPULSE;


    // Axis perpendicular to dodge direction.
    // Used for the visual flip.

    dodgeAxis.set(
        tempDirection.z,
        0,
        -tempDirection.x
    );

    if (
        dodgeAxis.lengthSq() >
        0.001
    ) {

        dodgeAxis.normalize();
    }
}


// ============================================================
// LOCAL-AXIS AERIAL ROTATION
// ============================================================

function rotateCarLocal(
    axis,
    angle
) {

    if (
        Math.abs(angle) <
        0.000001
    ) {
        return;
    }

    rotationQuaternion.setFromAxisAngle(
        axis,
        angle
    );

    car.quaternion.multiply(
        rotationQuaternion
    );

    car.quaternion.normalize();
}


function updateAerialControls(dt) {

    if (grounded) {
        return;
    }


    const pitch =
        aerialPitchInput();

    const yaw =
        steeringInput();

    const airRoll =
        powerslideHeld();


    // --------------------------------------------------------
    // PITCH
    // Local Z axis.
    // --------------------------------------------------------

    if (
        Math.abs(pitch) >
        0.001
    ) {

        rotateCarLocal(
            LOCAL_RIGHT,
            pitch *
                AIR_PITCH_SPEED *
                dt
        );
    }


    // --------------------------------------------------------
    // YAW / AIR ROLL
    // --------------------------------------------------------

    if (
        Math.abs(yaw) >
        0.001
    ) {

        if (airRoll) {

            // Holding powerslide converts horizontal input
            // into local-axis roll.

            rotateCarLocal(
                LOCAL_FORWARD,
                -yaw *
                    AIR_ROLL_SPEED *
                    dt
            );

        } else {

            // Yaw around the car's local up axis.

            rotateCarLocal(
                LOCAL_UP,
                -yaw *
                    AIR_YAW_SPEED *
                    dt
            );
        }
    }


    // --------------------------------------------------------
    // ACTIVE DODGE ROTATION
    // --------------------------------------------------------

    if (dodgeActive) {

        dodgeTimer += dt;

        rotateCarLocal(
            dodgeAxis,
            DODGE_ROTATION_SPEED *
                dt
        );

        if (
            dodgeTimer >=
            DODGE_DURATION
        ) {

            dodgeActive = false;
            dodgeTimer = 0;
        }
    }
}


// ============================================================
// SPEED SAFETY
// ============================================================

function limitCarSpeed() {

    const horizontalSpeedSq =
        carVelocity.x *
            carVelocity.x +
        carVelocity.z *
            carVelocity.z;


    const maxSpeed =
        ABSOLUTE_SPEED_LIMIT;


    if (
        horizontalSpeedSq >
        maxSpeed * maxSpeed
    ) {

        const speed =
            Math.sqrt(
                horizontalSpeedSq
            );

        const scale =
            maxSpeed /
            speed;

        carVelocity.x *=
            scale;

        carVelocity.z *=
            scale;
    }


    // Vertical safety net.
    // Prevents collision weirdness from launching the car
    // into another postcode.

    verticalVelocity =
        THREE.MathUtils.clamp(
            verticalVelocity,
            -45,
            45
        );
}


// ============================================================
// CAR / ARENA COLLISION
// ============================================================

function handleCarArenaCollision() {

    const carRadiusX = 2.25;
    const carRadiusZ = 1.25;


    // --------------------------------------------------------
    // SIDE WALLS
    // --------------------------------------------------------

    const maxZ =
        HALF_WIDTH -
        carRadiusZ;


    if (
        car.position.z >
        maxZ
    ) {

        car.position.z =
            maxZ;

        if (
            carVelocity.z >
            0
        ) {

            carVelocity.z *=
                -0.25;
        }
    }


    if (
        car.position.z <
        -maxZ
    ) {

        car.position.z =
            -maxZ;

        if (
            carVelocity.z <
            0
        ) {

            carVelocity.z *=
                -0.25;
        }
    }


    // --------------------------------------------------------
    // END WALLS / GOAL OPENINGS
    // --------------------------------------------------------

    const insideGoalOpening =
        Math.abs(
            car.position.z
        ) <
        GOAL_WIDTH / 2 -
        carRadiusZ;


    const lowEnoughForGoal =
        car.position.y <
        GOAL_HEIGHT -
        1;


    const canEnterGoal =
        insideGoalOpening &&
        lowEnoughForGoal;


    if (!canEnterGoal) {

        const maxX =
            HALF_LENGTH -
            carRadiusX;


        if (
            car.position.x >
            maxX
        ) {

            car.position.x =
                maxX;

            if (
                carVelocity.x >
                0
            ) {

                carVelocity.x *=
                    -0.25;
            }
        }


        if (
            car.position.x <
            -maxX
        ) {

            car.position.x =
                -maxX;

            if (
                carVelocity.x <
                0
            ) {

                carVelocity.x *=
                    -0.25;
            }
        }

        return;
    }


    // --------------------------------------------------------
    // INSIDE GOAL
    // --------------------------------------------------------

    const goalLimit =
        HALF_LENGTH +
        GOAL_DEPTH -
        carRadiusX;


    if (
        car.position.x >
        goalLimit
    ) {

        car.position.x =
            goalLimit;

        if (
            carVelocity.x >
            0
        ) {

            carVelocity.x *=
                -0.25;
        }
    }


    if (
        car.position.x <
        -goalLimit
    ) {

        car.position.x =
            -goalLimit;

        if (
            carVelocity.x <
            0
        ) {

            carVelocity.x *=
                -0.25;
        }
    }
}


// ============================================================
// GROUND CAR PHYSICS
// ============================================================

function updateGroundCar(dt) {

    const throttle =
        throttleInput();

    const reverse =
        reverseInput();

    const steer =
        steeringInput();

    const powerslide =
        powerslideHeld();


    tempForward.set(
        Math.cos(carRotation),
        0,
        -Math.sin(carRotation)
    );


    tempRight.set(
        -tempForward.z,
        0,
        tempForward.x
    );


    const forwardSpeed =
        carVelocity.dot(
            tempForward
        );


    // --------------------------------------------------------
    // THROTTLE
    // --------------------------------------------------------

    if (
        throttle > 0
    ) {

        if (
            forwardSpeed <
            -1
        ) {

            carVelocity.addScaledVector(
                tempForward,
                BRAKING *
                    throttle *
                    dt
            );

        } else if (
            forwardSpeed <
            DRIVE_TOP_SPEED
        ) {

            const accelerationScale =
                THREE.MathUtils.clamp(
                    1 -
                    Math.max(
                        0,
                        forwardSpeed
                    ) /
                    DRIVE_TOP_SPEED,
                    0.12,
                    1
                );


            carVelocity.addScaledVector(
                tempForward,
                ACCELERATION *
                    accelerationScale *
                    throttle *
                    dt
            );
        }
    }


    // --------------------------------------------------------
    // REVERSE / BRAKE
    // --------------------------------------------------------

    if (
        reverse > 0
    ) {

        if (
            forwardSpeed >
            1
        ) {

            carVelocity.addScaledVector(
                tempForward,
                -BRAKING *
                    reverse *
                    dt
            );

        } else if (
            forwardSpeed >
            -REVERSE_TOP_SPEED
        ) {

            carVelocity.addScaledVector(
                tempForward,
                -REVERSE_ACCELERATION *
                    reverse *
                    dt
            );
        }
    }


    // --------------------------------------------------------
    // BOOST
    // --------------------------------------------------------

    if (
        boostHeld() &&
        boostAmount > 0
    ) {

        carVelocity.addScaledVector(
            tempForward,
            BOOST_ACCELERATION *
                dt
        );

        boostAmount -=
            BOOST_USAGE *
            dt;

        boostAmount =
            Math.max(
                0,
                boostAmount
            );
    }


    // --------------------------------------------------------
    // STEERING
    // --------------------------------------------------------

    const horizontalSpeed =
        Math.sqrt(
            carVelocity.x *
                carVelocity.x +
            carVelocity.z *
                carVelocity.z
        );


    if (
        Math.abs(steer) >
            0.001 &&
        horizontalSpeed >
            0.2
    ) {

        const speedRatio =
            THREE.MathUtils.clamp(
                horizontalSpeed /
                    DRIVE_TOP_SPEED,
                0,
                1
            );


        let steeringSpeed =
            THREE.MathUtils.lerp(
                LOW_SPEED_STEER,
                HIGH_SPEED_STEER,
                speedRatio
            );


        if (powerslide) {

            steeringSpeed *=
                POWERSLIDE_STEER_MULTIPLIER;
        }


        // Reverse steering direction when actually reversing.

        const movementDirection =
            forwardSpeed >= 0
                ? 1
                : -1;


        carRotation -=
            steer *
            steeringSpeed *
            movementDirection *
            dt;
    }


    // --------------------------------------------------------
    // GRIP
    // --------------------------------------------------------

    tempForward.set(
        Math.cos(carRotation),
        0,
        -Math.sin(carRotation)
    );


    tempRight.set(
        -tempForward.z,
        0,
        tempForward.x
    );


    const sidewaysSpeed =
        carVelocity.dot(
            tempRight
        );


    const grip =
        powerslide
            ? POWERSLIDE_GRIP
            : NORMAL_GRIP;


    const sidewaysRemoval =
        1 -
        Math.exp(
            -grip *
            dt
        );


    carVelocity.addScaledVector(
        tempRight,
        -sidewaysSpeed *
            sidewaysRemoval
    );


    // --------------------------------------------------------
    // DRAG
    // --------------------------------------------------------

    const powered =
        throttle > 0 ||
        reverse > 0 ||
        (
            boostHeld() &&
            boostAmount > 0
        );


    const drag =
        powered
            ? POWERED_DRAG
            : COAST_DRAG;


    const dragMultiplier =
        Math.exp(
            -drag *
            dt
        );


    carVelocity.x *=
        dragMultiplier;

    carVelocity.z *=
        dragMultiplier;


    // --------------------------------------------------------
    // GROUND ORIENTATION
    // --------------------------------------------------------

    car.quaternion.setFromAxisAngle(
        Y_AXIS,
        carRotation
    );
}


// ============================================================
// AIRBORNE CAR PHYSICS
// ============================================================

function updateAirCar(dt) {

    updateAerialControls(dt);


    // --------------------------------------------------------
    // VARIABLE HEIGHT JUMP
    // --------------------------------------------------------

    if (
        jumpHeld() &&
        jumpHeldTime <
            JUMP_HOLD_TIME &&
        firstJumpUsed
    ) {

        verticalVelocity +=
            JUMP_HOLD_FORCE *
            dt;

        jumpHeldTime +=
            dt;

    } else {

        jumpHeldTime =
            JUMP_HOLD_TIME;
    }


    // --------------------------------------------------------
    // 3D AERIAL BOOST
    // --------------------------------------------------------

    if (
        boostHeld() &&
        boostAmount > 0
    ) {

        tempForward
            .copy(
                LOCAL_FORWARD
            )
            .applyQuaternion(
                car.quaternion
            )
            .normalize();


        carVelocity.x +=
            tempForward.x *
            BOOST_ACCELERATION *
            dt;


        verticalVelocity +=
            tempForward.y *
            BOOST_ACCELERATION *
            dt;


        carVelocity.z +=
            tempForward.z *
            BOOST_ACCELERATION *
            dt;


        boostAmount -=
            BOOST_USAGE *
            dt;


        boostAmount =
            Math.max(
                0,
                boostAmount
            );
    }


    verticalVelocity -=
        GRAVITY *
        dt;
}


// ============================================================
// LANDING
// ============================================================

function landCar() {

    car.position.y = 0;

    verticalVelocity = 0;

    grounded = true;

    firstJumpUsed = false;
    secondJumpUsed = false;

    jumpHeldTime = 0;

    dodgeActive = false;
    dodgeTimer = 0;


    // Keep the direction the car was generally facing
    // rather than snapping to some ancient yaw value.

    tempForward
        .copy(
            LOCAL_FORWARD
        )
        .applyQuaternion(
            car.quaternion
        );


    tempForward.y = 0;


    if (
        tempForward.lengthSq() >
        0.001
    ) {

        tempForward.normalize();

        carRotation =
            Math.atan2(
                -tempForward.z,
                tempForward.x
            );
    }


    car.quaternion.setFromAxisAngle(
        Y_AXIS,
        carRotation
    );
}


// ============================================================
// MAIN CAR UPDATE
// ============================================================

function updateCar(dt) {

    if (
        matchState ===
        MATCH_STATE.RESULTS
    ) {
        return;
    }


    if (
        goalPause &&
        matchState !==
        MATCH_STATE.CELEBRATION
    ) {
        return;
    }


    if (!timerStarted) {

        if (
            matchState ===
                MATCH_STATE.PLAYING ||
            matchState ===
                MATCH_STATE.OVERTIME
        ) {

            timerStarted = true;
        }
    }


    if (grounded) {

        updateGroundCar(dt);

    } else {

        updateAirCar(dt);
    }


    limitCarSpeed();


    car.position.x +=
        carVelocity.x *
        dt;


    car.position.z +=
        carVelocity.z *
        dt;


    if (!grounded) {

        car.position.y +=
            verticalVelocity *
            dt;


        if (
            car.position.y <= 0 &&
            verticalVelocity <= 0
        ) {

            landCar();
        }
    }


    handleCarArenaCollision();


    // --------------------------------------------------------
    // WHEEL SPIN
    // --------------------------------------------------------

    tempForward.set(
        Math.cos(carRotation),
        0,
        -Math.sin(carRotation)
    );


    const wheelSpeed =
        carVelocity.dot(
            tempForward
        );


    const wheelSpin =
        wheelSpeed *
        dt /
        0.55;


    for (
        const wheel of wheels
    ) {

        wheel.rotation.z -=
            wheelSpin;
    }
}


// ============================================================
// BALL PHYSICS
// ============================================================

function updateBall(dt) {

    if (
        matchState ===
        MATCH_STATE.RESULTS
    ) {
        return;
    }


    if (
        goalPause &&
        matchState !==
        MATCH_STATE.CELEBRATION
    ) {
        return;
    }


    ballVelocity.y -=
        21 *
        dt;


    ball.position.addScaledVector(
        ballVelocity,
        dt
    );


    // --------------------------------------------------------
    // FLOOR
    // --------------------------------------------------------

    if (
        ball.position.y <
        BALL_RADIUS
    ) {

        ball.position.y =
            BALL_RADIUS;


        if (
            ballVelocity.y <
            0
        ) {

            ballVelocity.y *=
                -0.52;
        }


        if (
            Math.abs(
                ballVelocity.y
            ) <
            2.4
        ) {

            ballVelocity.y = 0;
        }


        const groundFriction =
            Math.exp(
                -0.22 *
                dt
            );


        ballVelocity.x *=
            groundFriction;

        ballVelocity.z *=
            groundFriction;
    }


    // --------------------------------------------------------
    // SIDE WALLS
    // --------------------------------------------------------

    const sideLimit =
        HALF_WIDTH -
        BALL_RADIUS;


    if (
        ball.position.z >
        sideLimit
    ) {

        ball.position.z =
            sideLimit;

        if (
            ballVelocity.z >
            0
        ) {

            ballVelocity.z *=
                -0.68;
        }
    }


    if (
        ball.position.z <
        -sideLimit
    ) {

        ball.position.z =
            -sideLimit;

        if (
            ballVelocity.z <
            0
        ) {

            ballVelocity.z *=
                -0.68;
        }
    }


    // --------------------------------------------------------
    // END WALLS / GOALS
    // --------------------------------------------------------

    const inGoalWidth =
        Math.abs(
            ball.position.z
        ) <
        GOAL_WIDTH / 2 -
        BALL_RADIUS *
        0.25;


    const belowCrossbar =
        ball.position.y <
        GOAL_HEIGHT -
        BALL_RADIUS *
        0.2;


    const canEnterGoal =
        inGoalWidth &&
        belowCrossbar;


    if (!canEnterGoal) {

        const endLimit =
            HALF_LENGTH -
            BALL_RADIUS;


        if (
            ball.position.x >
            endLimit
        ) {

            ball.position.x =
                endLimit;

            if (
                ballVelocity.x >
                0
            ) {

                ballVelocity.x *=
                    -0.68;
            }
        }


        if (
            ball.position.x <
            -endLimit
        ) {

            ball.position.x =
                -endLimit;

            if (
                ballVelocity.x <
                0
            ) {

                ballVelocity.x *=
                    -0.68;
            }
        }

    } else {

        const goalBackLimit =
            HALF_LENGTH +
            GOAL_DEPTH -
            BALL_RADIUS;


        if (
            ball.position.x >
            goalBackLimit
        ) {

            ball.position.x =
                goalBackLimit;

            if (
                ballVelocity.x >
                0
            ) {

                ballVelocity.x *=
                    -0.5;
            }
        }


        if (
            ball.position.x <
            -goalBackLimit
        ) {

            ball.position.x =
                -goalBackLimit;

            if (
                ballVelocity.x <
                0
            ) {

                ballVelocity.x *=
                    -0.5;
            }
        }


        // Goal side walls.

        const goalSideLimit =
            GOAL_WIDTH / 2 -
            BALL_RADIUS;


        if (
            ball.position.z >
            goalSideLimit
        ) {

            ball.position.z =
                goalSideLimit;

            if (
                ballVelocity.z >
                0
            ) {

                ballVelocity.z *=
                    -0.6;
            }
        }


        if (
            ball.position.z <
            -goalSideLimit
        ) {

            ball.position.z =
                -goalSideLimit;

            if (
                ballVelocity.z <
                0
            ) {

                ballVelocity.z *=
                    -0.6;
            }
        }


        // Goal roof.

        const roofLimit =
            GOAL_HEIGHT -
            BALL_RADIUS;


        if (
            ball.position.y >
            roofLimit
        ) {

            ball.position.y =
                roofLimit;

            if (
                ballVelocity.y >
                0
            ) {

                ballVelocity.y *=
                    -0.5;
            }
        }
    }


    // --------------------------------------------------------
    // BALL SPEED SAFETY
    // --------------------------------------------------------

    const ballSpeedSq =
        ballVelocity.lengthSq();


    const ballMaxSpeed = 70;


    if (
        ballSpeedSq >
        ballMaxSpeed *
        ballMaxSpeed
    ) {

        ballVelocity.setLength(
            ballMaxSpeed
        );
    }
}


// ============================================================
// CAR / BALL COLLISION
// ============================================================

function handleCarBallCollision() {

    if (
        matchState ===
        MATCH_STATE.RESULTS
    ) {
        return;
    }


    tempBallDifference
        .copy(
            ball.position
        )
        .sub(
            car.position
        );


    tempBallDifference.y -=
        0.9;


    const collisionDistance =
        BALL_RADIUS +
        2.35;


    const distanceSq =
        tempBallDifference.lengthSq();


    if (
        distanceSq >
        collisionDistance *
        collisionDistance
    ) {
        return;
    }


    let distance =
        Math.sqrt(
            distanceSq
        );


    if (
        distance <
        0.001
    ) {

        tempBallDifference.set(
            1,
            0.15,
            0
        );

        distance = 1;
    }


    tempBallDifference.divideScalar(
        distance
    );


    const overlap =
        collisionDistance -
        distance;


    ball.position.addScaledVector(
        tempBallDifference,
        overlap *
        0.75
    );


    const horizontalSpeed =
        Math.sqrt(
            carVelocity.x *
                carVelocity.x +
            carVelocity.z *
                carVelocity.z
        );


    let impactStrength =
        7 +
        horizontalSpeed *
        0.8;


    if (!grounded) {

        impactStrength +=
            Math.abs(
                verticalVelocity
            ) *
            0.3;
    }


    impactStrength =
        Math.min(
            impactStrength,
            38
        );


    ballVelocity.addScaledVector(
        tempBallDifference,
        impactStrength
    );


    ballVelocity.x +=
        carVelocity.x *
        0.32;


    ballVelocity.z +=
        carVelocity.z *
        0.32;


    ballVelocity.y +=
        Math.max(
            1.5,
            tempBallDifference.y *
                impactStrength *
                0.5
        );


    carVelocity.x -=
        tempBallDifference.x *
        1.25;


    carVelocity.z -=
        tempBallDifference.z *
        1.25;
}


// ============================================================
// BOOST PADS
// ============================================================

function updateBoostPads(dt) {

    if (
        matchState ===
        MATCH_STATE.RESULTS
    ) {
        return;
    }


    for (
        const pad of boostPads
    ) {

        if (pad.active) {

            // Slower decorative animation than v0.5.
            // Less pointless work, still looks alive.

            pad.pickup.rotation.y +=
                dt *
                (
                    pad.big
                        ? 1.35
                        : 1.7
                );


            pad.orb.rotation.x +=
                dt *
                1.1;


            const dx =
                car.position.x -
                pad.x;


            const dz =
                car.position.z -
                pad.z;


            const distanceSq =
                dx * dx +
                dz * dz;


            if (
                distanceSq <
                pad.pickupRadiusSq
            ) {

                if (pad.big) {

                    boostAmount = 100;

                } else {

                    boostAmount =
                        Math.min(
                            100,
                            boostAmount +
                            12
                        );
                }


                pad.active = false;


                pad.timer =
                    pad.big
                        ? 10
                        : 4;


                pad.pickup.visible =
                    false;
            }

        } else {

            pad.timer -= dt;


            if (
                pad.timer <= 0
            ) {

                pad.active = true;

                pad.timer = 0;

                pad.pickup.visible =
                    true;
            }
        }
    }
}


// ============================================================
// GOAL EXPLOSIONS
// ============================================================

function updateGoalExplosions(dt) {

    if (
        goalExplosions.length ===
        0
    ) {
        return;
    }


    for (
        let i =
            goalExplosions.length - 1;

        i >= 0;

        i--
    ) {

        const explosion =
            goalExplosions[i];


        explosion.age += dt;


        const progress =
            THREE.MathUtils.clamp(
                explosion.age /
                explosion.lifetime,
                0,
                1
            );


        explosion.sphere.scale.setScalar(
            1 +
            progress *
            11
        );


        explosion.ring.scale.setScalar(
            1 +
            progress *
            14
        );


        explosion.sphereMaterial.opacity =
            0.75 *
            (
                1 -
                progress
            );


        explosion.ringMaterial.opacity =
            0.85 *
            (
                1 -
                progress
            );


        if (
            progress >= 1
        ) {

            scene.remove(
                explosion.group
            );


            explosion.sphereMaterial.dispose();
            explosion.ringMaterial.dispose();


            goalExplosions.splice(
                i,
                1
            );
        }
    }
}


// ============================================================
// GOAL DETECTION
// ============================================================

function checkGoals() {

    if (
        goalPause ||
        matchState ===
            MATCH_STATE.CELEBRATION ||
        matchState ===
            MATCH_STATE.RESULTS ||
        matchState ===
            MATCH_STATE.FREEPLAY
    ) {
        return;
    }


    const inGoalWidth =
        Math.abs(
            ball.position.z
        ) <
        GOAL_WIDTH / 2;


    const belowGoalHeight =
        ball.position.y <
        GOAL_HEIGHT;


    if (
        !inGoalWidth ||
        !belowGoalHeight
    ) {
        return;
    }


    // Blue scores in Orange goal.

    if (
        ball.position.x >
        HALF_LENGTH +
        BALL_RADIUS *
        0.15
    ) {

        scoreGoal(
            "blue",
            1
        );

        return;
    }


    // Orange scores in Blue goal.

    if (
        ball.position.x <
        -HALF_LENGTH -
        BALL_RADIUS *
        0.15
    ) {

        scoreGoal(
            "orange",
            -1
        );
    }
}


// ============================================================
// SCORE GOAL
// ============================================================

function scoreGoal(
    team,
    goalSide
) {

    if (
        matchState ===
            MATCH_STATE.CELEBRATION ||
        matchState ===
            MATCH_STATE.RESULTS
    ) {
        return;
    }


    if (team === "blue") {

        blueScore++;

        // The current single-player car is Blue.

        matchStats.goals++;
        matchStats.score += 100;

    } else {

        orangeScore++;
    }


    createGoalExplosion(
        goalSide,
        team
    );


    // Golden goal.

    if (
        matchState ===
        MATCH_STATE.OVERTIME
    ) {

        endMatch(team);

        return;
    }


    goalPause = true;
    goalPauseTimer = 2.25;


    goalText =
        team === "blue"
            ? "BLUE SCORES!"
            : "ORANGE SCORES!";
}


// ============================================================
// MATCH TIMER
// ============================================================

function updateMatch(dt) {

    if (
        menuOpen ||
        goalPause ||
        !timerStarted ||
        matchState ===
            MATCH_STATE.CELEBRATION ||
        matchState ===
            MATCH_STATE.RESULTS ||
        matchState ===
            MATCH_STATE.FREEPLAY
    ) {
        return;
    }


    if (
        matchState ===
        MATCH_STATE.OVERTIME
    ) {
        return;
    }


    gameTime -= dt;


    if (
        gameTime >
        0
    ) {
        return;
    }


    gameTime = 0;


    if (
        blueScore >
        orangeScore
    ) {

        endMatch("blue");

        return;
    }


    if (
        orangeScore >
        blueScore
    ) {

        endMatch("orange");

        return;
    }


    matchState =
        MATCH_STATE.OVERTIME;


    goalText =
        "OVERTIME";
}


// ============================================================
// GOAL PAUSE
// ============================================================

function updateGoalPause(dt) {

    if (!goalPause) {
        return;
    }


    if (
        matchState ===
        MATCH_STATE.CELEBRATION
    ) {
        return;
    }


    goalPauseTimer -= dt;


    if (
        goalPauseTimer >
        0
    ) {
        return;
    }


    goalPause = false;
    goalPauseTimer = 0;


    resetKickoff();


    if (
        matchState ===
        MATCH_STATE.OVERTIME
    ) {

        goalText =
            "OVERTIME";

    } else {

        goalText = "";
    }
}


// ============================================================
// MATCH END / CELEBRATION
// ============================================================

function endMatch(team) {

    winningTeam = team;


    matchResult =
        team === "blue"
            ? "BLUE WINS!"
            : "ORANGE WINS!";


    matchState =
        MATCH_STATE.CELEBRATION;


    celebrationTimer =
        CELEBRATION_DURATION;


    goalPause = false;
    goalPauseTimer = 0;

    goalText = "";


    resultsScreen.style.display =
        "none";


    showCelebration();
}


// ============================================================
// CELEBRATION
// ============================================================

function updateCelebration(dt) {

    if (
        matchState !==
        MATCH_STATE.CELEBRATION
    ) {
        return;
    }


    celebrationTimer -= dt;


    const countdown =
        document.getElementById(
            "celebrationCountdown"
        );


    if (countdown) {

        countdown.textContent =
            `RESULTS IN ${Math.max(
                1,
                Math.ceil(
                    celebrationTimer
                )
            )}`;
    }


    if (
        celebrationTimer >
        0
    ) {
        return;
    }


    celebrationTimer = 0;


    matchState =
        MATCH_STATE.RESULTS;


    celebrationBanner.style.display =
        "none";


    clearHeldInputs();


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


    showResultsScreen();
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


    car.quaternion.setFromAxisAngle(
        Y_AXIS,
        carRotation
    );


    carVelocity.set(
        0,
        0,
        0
    );


    verticalVelocity = 0;

    grounded = true;


    firstJumpUsed = false;
    secondJumpUsed = false;

    jumpHeldTime = 0;

    dodgeActive = false;
    dodgeTimer = 0;


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

    timerStarted = false;


    matchState =
        MATCH_STATE.PLAYING;


    winningTeam = null;
    matchResult = "";


    celebrationTimer = 0;


    celebrationBanner.style.display =
        "none";


    resultsScreen.style.display =
        "none";


    menuOpen = false;

    menu.style.display =
        "none";


    resetMatchStats();

    resetKickoff();


    previousScore = "";
    previousTimer = "";
    previousBoost = "";
    previousCamera = "";
    previousGoalMessage = "";
    previousHint = "";


    resetFrameClock();

    updateHUD();
}


// ============================================================
// FREE PLAY
// ============================================================

function startFreePlay() {

    matchState =
        MATCH_STATE.FREEPLAY;


    winningTeam = null;
    matchResult = "";


    timerStarted = false;

    goalPause = false;

    goalText = "";


    celebrationBanner.style.display =
        "none";


    resultsScreen.style.display =
        "none";


    resetKickoff();


    boostAmount = 100;


    resetFrameClock();

    updateHUD();
}


// ============================================================
// CONTROLLER ONE-SHOT ACTIONS
// ============================================================

function processControllerActions() {

    if (
        controllerState.jumpPressed &&
        !goalPause &&
        matchState !==
            MATCH_STATE.RESULTS
    ) {

        performJump();
    }


    if (
        controllerState.ballCamPressed
    ) {

        ballCam =
            !ballCam;
    }
}


// ============================================================
// BALL CAM — v0.6 REBUILD
// ============================================================

function updateBallCamera(dt) {

    // Horizontal direction from car to ball.

    tempCarToBall
        .copy(
            ball.position
        )
        .sub(
            car.position
        );


    tempCarToBall.y = 0;


    const ballDistance =
        tempCarToBall.length();


    if (
        ballDistance >
        0.01
    ) {

        tempCarToBall.divideScalar(
            ballDistance
        );

    } else {

        tempCarToBall.set(
            Math.cos(carRotation),
            0,
            -Math.sin(carRotation)
        );
    }


    // --------------------------------------------------------
    // CAMERA DIRECTION
    // --------------------------------------------------------
    //
    // Pure "behind the ball" cameras can rotate too violently
    // when the ball crosses the car.
    //
    // Pure "behind the car" cameras caused the old v0.1 feel.
    //
    // Blend them.

    tempForward.set(
        Math.cos(carRotation),
        0,
        -Math.sin(carRotation)
    );


    tempDirection
        .copy(
            tempForward
        )
        .multiplyScalar(
            0.38
        )
        .addScaledVector(
            tempCarToBall,
            0.62
        );


    if (
        tempDirection.lengthSq() <
        0.001
    ) {

        tempDirection.copy(
            tempForward
        );

    } else {

        tempDirection.normalize();
    }


    const cameraDistance =
        THREE.MathUtils.clamp(
            12.5 +
            ballDistance *
            0.018,
            12.5,
            15
        );


    tempCameraPosition
        .copy(
            car.position
        )
        .addScaledVector(
            tempDirection,
            -cameraDistance
        );


    tempCameraPosition.y =
        car.position.y +
        6.6;


    const cameraSmoothing =
        1 -
        Math.exp(
            -8 *
            dt
        );


    camera.position.lerp(
        tempCameraPosition,
        cameraSmoothing
    );


    // Look primarily at ball, but keep a little car influence
    // so close-range camera movement is less violent.

    tempCameraLook
        .copy(
            ball.position
        )
        .multiplyScalar(
            0.92
        )
        .addScaledVector(
            car.position,
            0.08
        );


    tempCameraLook.y +=
        0.45;


    camera.lookAt(
        tempCameraLook
    );
}


// ============================================================
// CAR CAM
// ============================================================

function updateCarCamera(dt) {

    tempForward.set(
        Math.cos(carRotation),
        0,
        -Math.sin(carRotation)
    );


    tempCameraPosition
        .copy(
            car.position
        )
        .addScaledVector(
            tempForward,
            -13
        );


    tempCameraPosition.y =
        car.position.y +
        6.8;


    camera.position.lerp(
        tempCameraPosition,
        1 -
        Math.exp(
            -7 *
            dt
        )
    );


    tempCameraLook.copy(
        car.position
    );


    tempCameraLook.y +=
        1.25;


    camera.lookAt(
        tempCameraLook
    );
}


// ============================================================
// CAMERA
// ============================================================

function updateCamera(dt) {

    if (
        matchState ===
        MATCH_STATE.RESULTS
    ) {

        // Static-ish cinematic angle behind the results GUI.

        tempCameraPosition.set(
            car.position.x - 10,
            6.5,
            car.position.z + 9
        );


        camera.position.lerp(
            tempCameraPosition,
            1 -
            Math.exp(
                -2.5 *
                dt
            )
        );


        tempCameraLook.copy(
            car.position
        );

        tempCameraLook.y +=
            1;


        camera.lookAt(
            tempCameraLook
        );

        return;
    }


    if (ballCam) {

        updateBallCamera(dt);

    } else {

        updateCarCamera(dt);
    }
}


// ============================================================
// HUD
// ============================================================

function formatTime(seconds) {

    const safeSeconds =
        Math.max(
            0,
            Math.ceil(
                seconds
            )
        );


    const minutes =
        Math.floor(
            safeSeconds /
            60
        );


    const remainingSeconds =
        safeSeconds %
        60;


    return (
        `${minutes}:` +
        remainingSeconds
            .toString()
            .padStart(
                2,
                "0"
            )
    );
}


function updateHUD() {

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


    let timerText = "";


    if (
        matchState ===
        MATCH_STATE.RESULTS
    ) {

        timerText =
            "FINAL";

    } else if (
        matchState ===
        MATCH_STATE.CELEBRATION
    ) {

        timerText =
            "FINAL";

    } else if (
        matchState ===
        MATCH_STATE.OVERTIME
    ) {

        timerText =
            "OVERTIME";

    } else if (
        matchState ===
        MATCH_STATE.FREEPLAY
    ) {

        timerText =
            "FREE PLAY";

    } else {

        timerText =
            formatTime(
                gameTime
            );
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


    const boostText =
        matchState ===
        MATCH_STATE.FREEPLAY

            ? "BOOST: ∞"

            : `BOOST: ${Math.round(
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


    if (
        goalText !==
        previousGoalMessage
    ) {

        goalMessageElement.textContent =
            goalText;

        previousGoalMessage =
            goalText;
    }


    let hintText =
        "TAB — Menu";


    if (
        controllerState.connected
    ) {

        hintText =
            "CONTROLLER CONNECTED · TAB — Menu";
    }


    if (
        matchState ===
        MATCH_STATE.CELEBRATION
    ) {

        hintText =
            "CELEBRATION — KEEP DRIVING";
    }


    if (
        matchState ===
        MATCH_STATE.FREEPLAY
    ) {

        hintText =
            "FREE PLAY · R — Reset · TAB — Menu";
    }


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
// WINDOW RESIZE
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
// FRAME CLOCK / PERFORMANCE
// ============================================================

let previousFrameTime = null;
let nextRenderTime = 0;


function resetFrameClock() {

    previousFrameTime = null;
    nextRenderTime = 0;
}


// ============================================================
// CPU-SAFE MAIN LOOP
// ============================================================

function animate(timestamp) {

    requestAnimationFrame(
        animate
    );


    // --------------------------------------------------------
    // HIDDEN TAB = DO NOTHING
    // --------------------------------------------------------

    if (!pageVisible) {

        previousFrameTime = null;
        nextRenderTime = 0;

        return;
    }


    const preset =
        GRAPHICS_PRESETS[
            graphicsPreset
        ];


    const frameInterval =
        1000 /
        preset.fps;


    // --------------------------------------------------------
    // FIRST FRAME
    // --------------------------------------------------------

    if (
        previousFrameTime ===
        null
    ) {

        previousFrameTime =
            timestamp;


        nextRenderTime =
            timestamp;


        updateCamera(
            1 / preset.fps
        );


        updateHUD();


        renderer.render(
            scene,
            camera
        );


        return;
    }


    // --------------------------------------------------------
    // FPS LIMIT
    // --------------------------------------------------------

    if (
        timestamp <
        nextRenderTime
    ) {

        return;
    }


    let dt =
        (
            timestamp -
            previousFrameTime
        ) /
        1000;


    previousFrameTime =
        timestamp;


    dt =
        THREE.MathUtils.clamp(
            dt,
            0.001,
            0.033
        );


    nextRenderTime =
        timestamp +
        frameInterval;


    // --------------------------------------------------------
    // INPUT
    // --------------------------------------------------------

    updateController();


    if (!menuOpen) {

        processControllerActions();
    }


    // --------------------------------------------------------
    // GAMEPLAY
    // --------------------------------------------------------

    if (!menuOpen) {

        if (
            matchState !==
            MATCH_STATE.RESULTS
        ) {

            updateCar(dt);

            updateBall(dt);

            handleCarBallCollision();


            if (
                matchState ===
                MATCH_STATE.FREEPLAY
            ) {

                // Infinite boost.

                boostAmount = 100;

            } else {

                updateBoostPads(dt);
            }


            checkGoals();

            updateMatch(dt);

            updateGoalPause(dt);

            updateCelebration(dt);
        }
    }


    // Goal effects only consume CPU while they exist.

    if (
        goalExplosions.length >
        0
    ) {

        updateGoalExplosions(dt);
    }


    // --------------------------------------------------------
    // CAMERA / UI
    // --------------------------------------------------------

    updateCamera(dt);

    updateHUD();

    updatePerformanceDisplay(dt);


    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    renderer.render(
        scene,
        camera
    );
}


// ============================================================
// STARTUP
// ============================================================

applyGraphicsPreset();

resetMatchStats();

resetKickoff();

cameraTarget.copy(
    car.position
);

updateHUD();

updateMenu();

requestAnimationFrame(
    animate
);


// ============================================================
// BOOSTBALL v0.6 — REBUILT TO FLY
//
// - Rebuilt aerial rotation around the car's local axes.
// - Added stronger jump.
// - Added hold-to-jump-higher behaviour.
// - Added neutral double jump.
// - Added directional dodges.
// - Added native Gamepad API support.
// - Added initial DualSense controls.
// - Reserved R1 for the future multiplayer scoreboard.
// - Rebuilt Ball Cam.
// - Added hard safety limits for random speed spikes.
// - Reduced geometry/render workload.
// - Reduced Balanced render resolution.
// - Reduced shadow workload.
// - Hidden tabs now sleep.
// - Results screen stops normal gameplay simulation.
// - Added 5-second controllable post-match celebration.
// - Added proper results GUI.
// - Added Play Again.
// - Added Free Play.
// - Added Main Menu.
// - Added basic match-stat foundation.
// - Kept the ball at the correct 1.8 radius.
// - Kept the arena dimensions.
// - Kept keyboard rebinding.
// - Kept browser shortcuts available.
//
// v0.7:
// Multiplayer.
// Lobbies.
// In-match scoreboard.
// Friends discovering that the creator has admin buttons.
//
// The microwave has learned to fly.
// The Dell has requested workers' compensation.
// ============================================================
