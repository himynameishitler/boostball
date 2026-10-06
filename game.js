// ============================================================
// BOOSTBALL v0.6.2 — RIGID BODY DETENTION
//
// Rigid-body-ish car physics rebuild.
// Persistent version badge.
// Keyboard remapping.
// PS5 / Gamepad remapping.
// Larger ball.
// Existing ground-speed tuning preserved.
//
// PART 1 / 3
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// VERSION
// ============================================================

const GAME_VERSION = "v0.6.2";
const GAME_CODENAME = "RIGID BODY DETENTION";


// ============================================================
// BASIC SETUP
// ============================================================

const canvas =
    document.getElementById("game");

const renderer =
    new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance"
    });

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x07111f);

scene.fog =
    new THREE.Fog(
        0x07111f,
        145,
        235
    );


// ============================================================
// VERSION BADGE
// ============================================================

const versionBadge =
    document.createElement("div");

versionBadge.textContent =
    `BOOSTBALL · ${GAME_VERSION}`;

versionBadge.style.cssText = `
    position:fixed;
    top:10px;
    left:12px;
    z-index:100;
    padding:6px 9px;
    border-radius:7px;
    background:rgba(0,0,0,0.42);
    border:1px solid rgba(255,255,255,0.10);
    color:rgba(255,255,255,0.78);
    font:12px Arial,sans-serif;
    letter-spacing:1px;
    pointer-events:none;
    user-select:none;
`;

document.body.appendChild(
    versionBadge
);


// ============================================================
// GRAPHICS
// ============================================================

const GRAPHICS_STORAGE_KEY =
    "boostball-graphics-v062";

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
    localStorage.getItem(
        GRAPHICS_STORAGE_KEY
    ) || "balanced";

if (
    !GRAPHICS_PRESETS[
        graphicsPreset
    ]
) {
    graphicsPreset =
        "balanced";
}


// ============================================================
// CAMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(
        72,
        window.innerWidth /
            window.innerHeight,
        0.1,
        1000
    );

camera.position.set(
    -12,
    7,
    0
);

const cameraLookTarget =
    new THREE.Vector3();

let cameraInitialized =
    false;


// ============================================================
// LIGHTING
// ============================================================

const hemisphereLight =
    new THREE.HemisphereLight(
        0x9fc8ff,
        0x1a241c,
        2.25
    );

scene.add(
    hemisphereLight
);

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2.7
    );

sun.position.set(
    -40,
    80,
    35
);

sun.castShadow = true;

sun.shadow.mapSize.set(
    768,
    768
);

sun.shadow.camera.left =
    -90;

sun.shadow.camera.right =
    90;

sun.shadow.camera.top =
    65;

sun.shadow.camera.bottom =
    -65;

sun.shadow.camera.near =
    1;

sun.shadow.camera.far =
    180;

scene.add(
    sun
);


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

// v0.6.1 larger ball retained.

const BALL_RADIUS = 2.6;


// ============================================================
// FIELD
// ============================================================

const field =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            FIELD_LENGTH,
            FIELD_WIDTH
        ),

        new THREE.MeshStandardMaterial({
            color: 0x15752c,
            roughness: 0.95,
            metalness: 0
        })
    );

field.rotation.x =
    -Math.PI / 2;

field.receiveShadow =
    true;

scene.add(
    field
);


// ============================================================
// FIELD MARKINGS
// ============================================================

const lineMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.72
    });

function createFieldLine(
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
        0.015,
        z
    );

    scene.add(
        line
    );

    return line;
}

createFieldLine(
    0.22,
    FIELD_WIDTH,
    0,
    0
);

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

for (
    let i = 0;
    i <= 48;
    i++
) {

    const angle =
        (
            i / 48
        ) *
        Math.PI *
        2;

    circlePoints.push(

        new THREE.Vector3(
            Math.cos(angle) *
                circleRadius,
            0.025,
            Math.sin(angle) *
                circleRadius
        )
    );
}

const circleGeometry =
    new THREE.BufferGeometry()
        .setFromPoints(
            circlePoints
        );

const circle =
    new THREE.Line(

        circleGeometry,

        new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.72
        })
    );

scene.add(
    circle
);


// ============================================================
// WALLS
// ============================================================

const wallMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x80b8dd,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false
    });

function createSideWall(
    z
) {

    const wall =
        new THREE.Mesh(

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

    scene.add(
        wall
    );
}

createSideWall(
    HALF_WIDTH
);

createSideWall(
    -HALF_WIDTH
);


function createEndWallPieces(
    x
) {

    const sideWidth =
        (
            FIELD_WIDTH -
            GOAL_WIDTH
        ) / 2;

    for (
        const direction
        of [-1, 1]
    ) {

        const wall =
            new THREE.Mesh(

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

        scene.add(
            wall
        );
    }

    const topHeight =
        WALL_HEIGHT -
        GOAL_HEIGHT;

    if (
        topHeight > 0
    ) {

        const topWall =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.5,
                    topHeight,
                    GOAL_WIDTH
                ),

                wallMaterial
            );

        topWall.position.set(
            x,
            GOAL_HEIGHT +
                topHeight / 2,
            0
        );

        scene.add(
            topWall
        );
    }
}

createEndWallPieces(
    HALF_LENGTH
);

createEndWallPieces(
    -HALF_LENGTH
);


// ============================================================
// GOALS
// ============================================================

function createGoal(
    side,
    colour
) {

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

    const back =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.4,
                GOAL_HEIGHT,
                GOAL_WIDTH
            ),

            goalMaterial
        );

    back.position.set(
        side *
        (
            HALF_LENGTH +
            GOAL_DEPTH
        ),
        GOAL_HEIGHT / 2,
        0
    );

    scene.add(
        back
    );


    const roof =
        new THREE.Mesh(

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

    scene.add(
        roof
    );


    for (
        const zDirection
        of [-1, 1]
    ) {

        const sideWall =
            new THREE.Mesh(

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
            zDirection *
                GOAL_WIDTH / 2
        );

        scene.add(
            sideWall
        );
    }


    for (
        const zDirection
        of [-1, 1]
    ) {

        const post =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.65,
                    GOAL_HEIGHT,
                    0.65
                ),

                postMaterial
            );

        post.position.set(
            side *
                HALF_LENGTH,
            GOAL_HEIGHT / 2,
            zDirection *
                GOAL_WIDTH / 2
        );

        post.castShadow =
            true;

        scene.add(
            post
        );
    }


    const crossbar =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.65,
                0.65,
                GOAL_WIDTH +
                    0.65
            ),

            postMaterial
        );

    crossbar.position.set(
        side * HALF_LENGTH,
        GOAL_HEIGHT,
        0
    );

    crossbar.castShadow =
        true;

    scene.add(
        crossbar
    );
}

createGoal(
    1,
    0xff7a16
);

createGoal(
    -1,
    0x168cff
);


// ============================================================
// CAR MODEL
// ============================================================

const car =
    new THREE.Group();

scene.add(
    car
);

const body =
    new THREE.Mesh(

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

body.position.y =
    0.95;

body.castShadow =
    true;

body.receiveShadow =
    true;

car.add(
    body
);


const nose =
    new THREE.Mesh(

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

nose.castShadow =
    true;

car.add(
    nose
);


const cabin =
    new THREE.Mesh(

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

cabin.castShadow =
    true;

car.add(
    cabin
);


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

function addWheel(
    x,
    z
) {

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
        true;

    car.add(
        wheel
    );

    wheels.push(
        wheel
    );
}

addWheel(
    1.35,
    1.25
);

addWheel(
    1.35,
    -1.25
);

addWheel(
    -1.35,
    1.25
);

addWheel(
    -1.35,
    -1.25
);


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
            color: 0xf4f4f4,
            roughness: 0.55,
            metalness: 0.05
        })
    );

ball.castShadow =
    true;

ball.receiveShadow =
    true;

scene.add(
    ball
);

const ballVelocity =
    new THREE.Vector3();


// ============================================================
// GRAPHICS APPLICATION
// ============================================================

function applyGraphicsPreset() {

    const preset =
        GRAPHICS_PRESETS[
            graphicsPreset
        ];

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

    for (
        const wheel
        of wheels
    ) {

        wheel.castShadow =
            preset.shadows;
    }

    localStorage.setItem(
        GRAPHICS_STORAGE_KEY,
        graphicsPreset
    );
}


// ============================================================
// ORIGINAL SPEED / ENGINE TUNING
// ============================================================
//
// DO NOT "FIX" THESE.
//
// User liked v0.6 ground speed.
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

const LOW_SPEED_STEER = 2.65;
const HIGH_SPEED_STEER = 1.65;

const POWERSLIDE_STEER_MULTIPLIER =
    1.35;


// ============================================================
// NEW RIGID BODY CONSTANTS
// ============================================================

// Gravity acts ALL THE TIME.

const GRAVITY = 27;


// Approximate mass.
//
// We don't need real kilograms.
// The important bit is consistent force / torque behaviour.

const CAR_MASS = 1;


// Approximate half extents.

const CAR_HALF_LENGTH = 2.45;
const CAR_HALF_HEIGHT = 1.15;
const CAR_HALF_WIDTH = 1.35;


// Approximate inertia.
//
// Long cars resist pitch/yaw differently from roll.

const CAR_INERTIA =
    new THREE.Vector3(
        2.2,
        2.8,
        1.7
    );


// Suspension/contact.

const SUSPENSION_STIFFNESS = 95;
const SUSPENSION_DAMPING = 12;

const CHASSIS_CONTACT_STIFFNESS = 125;
const CHASSIS_CONTACT_DAMPING = 15;

const CONTACT_FRICTION = 4.5;

const ROOF_FRICTION = 1.4;


// Angular behaviour.

const AIR_PITCH_ACCEL = 11.5;
const AIR_YAW_ACCEL = 8.5;
const AIR_ROLL_ACCEL = 12;

const AIR_ANGULAR_DAMPING = 1.15;

const GROUND_ANGULAR_DAMPING = 5.5;


// Jump.

const JUMP_IMPULSE = 13.5;
const JUMP_HOLD_FORCE = 18;
const JUMP_HOLD_TIME = 0.20;

const DOUBLE_JUMP_IMPULSE = 10.5;

const DODGE_HORIZONTAL_IMPULSE = 18;
const DODGE_VERTICAL_IMPULSE = 5.5;

// Angular impulse instead of forced animation.

const DODGE_PITCH_IMPULSE = 7.3;
const DODGE_ROLL_IMPULSE = 7.0;


// ============================================================
// CAR RIGID-BODY STATE
// ============================================================

// ALL translation is now one vector.
//
// No separate verticalVelocity.

const carVelocity =
    new THREE.Vector3();


// Angular velocity is stored in LOCAL car axes:
//
// X = roll around forward axis
// Y = yaw around up axis
// Z = pitch around right axis

const angularVelocity =
    new THREE.Vector3();


let carRotation = 0;

let boostAmount = 33;

let jumpHeldTime = 0;

let firstJumpUsed = false;
let secondJumpUsed = false;

let wheelContactCount = 0;
let chassisContactCount = 0;

let hasWheelContact = true;
let hasAnyGroundContact = true;

let landingCooldown = 0;


// ============================================================
// ORIENTATION
// ============================================================

const rotationQuaternion =
    new THREE.Quaternion();

const Y_AXIS =
    new THREE.Vector3(
        0,
        1,
        0
    );

const LOCAL_FORWARD =
    new THREE.Vector3(
        1,
        0,
        0
    );

const LOCAL_UP =
    new THREE.Vector3(
        0,
        1,
        0
    );

const LOCAL_RIGHT =
    new THREE.Vector3(
        0,
        0,
        1
    );


// ============================================================
// CONTACT POINTS
// ============================================================
//
// Local-space locations relative to the car origin.
//
// Wheels get springier suspension.
//
// Chassis points stop the microwave hovering when balanced on
// its nose / side / roof.
// ============================================================

const wheelContactPoints = [

    new THREE.Vector3(
        1.45,
        -0.52,
        1.18
    ),

    new THREE.Vector3(
        1.45,
        -0.52,
        -1.18
    ),

    new THREE.Vector3(
        -1.45,
        -0.52,
        1.18
    ),

    new THREE.Vector3(
        -1.45,
        -0.52,
        -1.18
    )
];


const chassisContactPoints = [

    // Front underside
    new THREE.Vector3(
        2.40,
        -0.38,
        0
    ),

    // Rear underside
    new THREE.Vector3(
        -2.35,
        -0.38,
        0
    ),

    // Left underside
    new THREE.Vector3(
        0,
        -0.35,
        1.28
    ),

    // Right underside
    new THREE.Vector3(
        0,
        -0.35,
        -1.28
    ),

    // Roof
    new THREE.Vector3(
        0,
        2.15,
        0
    ),

    // Front upper bumper
    new THREE.Vector3(
        2.35,
        0.85,
        0
    ),

    // Rear upper
    new THREE.Vector3(
        -2.25,
        1.15,
        0
    ),

    // Upper side contacts
    new THREE.Vector3(
        0,
        0.9,
        1.25
    ),

    new THREE.Vector3(
        0,
        0.9,
        -1.25
    )
];


// ============================================================
// SCRATCH OBJECTS
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

const tempWorldPoint =
    new THREE.Vector3();

const tempRelativePoint =
    new THREE.Vector3();

const tempPointVelocity =
    new THREE.Vector3();

const tempForce =
    new THREE.Vector3();

const tempTorque =
    new THREE.Vector3();

const tempAngularWorld =
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
// CAR AXES
// ============================================================

function getCarForward(
    target
) {

    return target
        .copy(
            LOCAL_FORWARD
        )
        .applyQuaternion(
            car.quaternion
        )
        .normalize();
}


function getCarUp(
    target
) {

    return target
        .copy(
            LOCAL_UP
        )
        .applyQuaternion(
            car.quaternion
        )
        .normalize();
}


function getCarRight(
    target
) {

    return target
        .copy(
            LOCAL_RIGHT
        )
        .applyQuaternion(
            car.quaternion
        )
        .normalize();
}


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

        if (
            !saved
        ) {

            return;
        }

        for (
            const action
            of Object.keys(
                DEFAULT_CONTROLS
            )
        ) {

            if (
                typeof saved[action] ===
                "string"
            ) {

                controls[action] =
                    saved[action];
            }
        }

    } catch (
        error
    ) {

        console.warn(
            "Could not load keyboard controls:",
            error
        );
    }
}


function saveControls() {

    try {

        localStorage.setItem(

            CONTROL_STORAGE_KEY,

            JSON.stringify(
                controls
            )
        );

    } catch (
        error
    ) {

        console.warn(
            "Could not save keyboard controls:",
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
// CONTROLLER BINDINGS
// ============================================================
//
// Standard Gamepad button indices used by DualSense:
//
// 0  = Cross
// 1  = Circle
// 2  = Square
// 3  = Triangle
// 4  = L1
// 5  = R1
// 6  = L2
// 7  = R2
// 8  = Create
// 9  = Options
// 10 = L3
// 11 = R3
// 12 = D-pad Up
// 13 = D-pad Down
// 14 = D-pad Left
// 15 = D-pad Right
//
// Sticks remain analogue axes.
// ============================================================

const DEFAULT_CONTROLLER_BINDINGS = {

    jump: 0,

    ballCam: 1,

    powerslide: 2,

    boost: 4,

    scoreboard: 5,

    reverse: 6,

    throttle: 7
};


const CONTROLLER_STORAGE_KEY =
    "boostball-controller-v062";


const controllerBindings = {
    ...DEFAULT_CONTROLLER_BINDINGS
};


function loadControllerBindings() {

    try {

        const saved =
            JSON.parse(

                localStorage.getItem(
                    CONTROLLER_STORAGE_KEY
                )
            );


        if (
            !saved
        ) {

            return;
        }


        for (
            const action
            of Object.keys(
                DEFAULT_CONTROLLER_BINDINGS
            )
        ) {

            if (
                Number.isInteger(
                    saved[action]
                )
            ) {

                controllerBindings[action] =
                    saved[action];
            }
        }

    } catch (
        error
    ) {

        console.warn(
            "Could not load controller bindings:",
            error
        );
    }
}


function saveControllerBindings() {

    try {

        localStorage.setItem(

            CONTROLLER_STORAGE_KEY,

            JSON.stringify(
                controllerBindings
            )
        );

    } catch (
        error
    ) {

        console.warn(
            "Could not save controller bindings:",
            error
        );
    }
}


function resetControllerBindings() {

    Object.assign(

        controllerBindings,

        DEFAULT_CONTROLLER_BINDINGS
    );


    saveControllerBindings();
}


loadControllerBindings();


// ============================================================
// CONTROLLER BUTTON NAMES
// ============================================================

const CONTROLLER_BUTTON_NAMES = {

    0: "Cross",
    1: "Circle",
    2: "Square",
    3: "Triangle",

    4: "L1",
    5: "R1",

    6: "L2",
    7: "R2",

    8: "Create",
    9: "Options",

    10: "L3",
    11: "R3",

    12: "D-Pad Up",
    13: "D-Pad Down",
    14: "D-Pad Left",
    15: "D-Pad Right"
};


function readableControllerButton(
    index
) {

    return (
        CONTROLLER_BUTTON_NAMES[
            index
        ]
        ||
        `Button ${index}`
    );
}


// ============================================================
// CONTROLLER STATE
// ============================================================

const controllerState = {

    connected: false,

    index: null,

    steerX: 0,
    steerY: 0,

    throttle: 0,
    reverse: 0,

    jump: false,
    jumpPressed: false,

    boost: false,

    powerslide: false,

    ballCam: false,
    ballCamPressed: false,

    scoreboard: false
};


const GAMEPAD_DEADZONE =
    0.14;


let previousControllerButtons =
    [];


// ============================================================
// CONTROLLER REBINDING STATE
// ============================================================

let controllerRebindingAction =
    null;


// When rebinding starts, ignore buttons that were already held.
// Otherwise clicking the menu with Cross could instantly bind
// Cross before the player has a chance to choose anything.

let controllerRebindBlockedButtons =
    new Set();


let controllerNotice =
    "";


// ============================================================
// GAMEPAD HELPERS
// ============================================================

function applyDeadzone(
    value,
    deadzone =
        GAMEPAD_DEADZONE
) {

    const magnitude =
        Math.abs(
            value
        );

    if (
        magnitude <=
        deadzone
    ) {

        return 0;
    }

    const scaled =
        (
            magnitude -
            deadzone
        )
        /
        (
            1 -
            deadzone
        );

    return (
        Math.sign(value) *
        scaled
    );
}


function getActiveGamepad() {

    const gamepads =
        navigator.getGamepads
            ? navigator.getGamepads()
            : [];


    if (
        controllerState.index !==
            null
        &&
        gamepads[
            controllerState.index
        ]
        &&
        gamepads[
            controllerState.index
        ].connected
    ) {

        return gamepads[
            controllerState.index
        ];
    }


    for (
        const gamepad
        of gamepads
    ) {

        if (
            gamepad &&
            gamepad.connected
        ) {

            controllerState.index =
                gamepad.index;

            return gamepad;
        }
    }


    controllerState.index =
        null;

    return null;
}


function buttonValue(
    gamepad,
    index
) {

    const button =
        gamepad?.buttons?.[
            index
        ];


    if (
        !button
    ) {

        return 0;
    }


    return Math.max(
        button.value || 0,
        button.pressed
            ? 1
            : 0
    );
}


function buttonHeld(
    gamepad,
    index
) {

    return (
        buttonValue(
            gamepad,
            index
        ) >
        0.45
    );
}


// ============================================================
// START CONTROLLER REBIND
// ============================================================

function beginControllerRebind(
    action
) {

    const gamepad =
        getActiveGamepad();


    if (
        !gamepad
    ) {

        controllerNotice =
            "Connect or press a button on your controller first.";

        return;
    }


    controllerRebindingAction =
        action;


    controllerNotice =
        `Press a controller button for ${readableAction(action)}…`;


    controllerRebindBlockedButtons =
        new Set();


    for (
        let i = 0;
        i < gamepad.buttons.length;
        i++
    ) {

        if (
            gamepad.buttons[i].pressed
            ||
            gamepad.buttons[i].value >
                0.45
        ) {

            controllerRebindBlockedButtons.add(
                i
            );
        }
    }
}


// ============================================================
// CANCEL CONTROLLER REBIND
// ============================================================

function cancelControllerRebind() {

    controllerRebindingAction =
        null;

    controllerRebindBlockedButtons
        .clear();

    controllerNotice =
        "Controller remap cancelled.";
}


// ============================================================
// ASSIGN CONTROLLER BUTTON
// ============================================================

function assignControllerButton(
    action,
    buttonIndex
) {

    // --------------------------------------------------------
    // ROCKET-LEAGUE-LIKE SWAP
    // --------------------------------------------------------
    //
    // If the selected button is already bound to another
    // action, swap the two bindings instead of silently making
    // two actions fire from one button.
    // --------------------------------------------------------

    let conflictingAction =
        null;


    for (
        const [
            otherAction,
            otherButton
        ]
        of Object.entries(
            controllerBindings
        )
    ) {

        if (
            otherAction !==
                action
            &&
            otherButton ===
                buttonIndex
        ) {

            conflictingAction =
                otherAction;

            break;
        }
    }


    const oldButton =
        controllerBindings[
            action
        ];


    controllerBindings[
        action
    ] =
        buttonIndex;


    if (
        conflictingAction !==
            null
    ) {

        controllerBindings[
            conflictingAction
        ] =
            oldButton;


        controllerNotice =
            `${readableAction(action)} → ${readableControllerButton(buttonIndex)} · swapped with ${readableAction(conflictingAction)}`;

    } else {

        controllerNotice =
            `${readableAction(action)} → ${readableControllerButton(buttonIndex)}`;
    }


    saveControllerBindings();


    controllerRebindingAction =
        null;


    controllerRebindBlockedButtons
        .clear();
}


// ============================================================
// UPDATE CONTROLLER
// ============================================================

function updateController() {

    const gamepad =
        getActiveGamepad();


    if (
        !gamepad
    ) {

        controllerState.connected =
            false;

        controllerState.steerX =
            0;

        controllerState.steerY =
            0;

        controllerState.throttle =
            0;

        controllerState.reverse =
            0;

        controllerState.jump =
            false;

        controllerState.jumpPressed =
            false;

        controllerState.boost =
            false;

        controllerState.powerslide =
            false;

        controllerState.ballCam =
            false;

        controllerState.ballCamPressed =
            false;

        controllerState.scoreboard =
            false;

        previousControllerButtons =
            [];

        return;
    }


    controllerState.connected =
        true;


    // ========================================================
    // CONTROLLER REMAPPING CAPTURE
    // ========================================================

    if (
        controllerRebindingAction
    ) {

        for (
            let i = 0;
            i < gamepad.buttons.length;
            i++
        ) {

            const pressedNow =
                gamepad.buttons[i].pressed
                ||
                gamepad.buttons[i].value >
                    0.65;


            if (
                !pressedNow
            ) {

                controllerRebindBlockedButtons
                    .delete(
                        i
                    );

                continue;
            }


            if (
                controllerRebindBlockedButtons
                    .has(
                        i
                    )
            ) {

                continue;
            }


            const wasPressed =
                previousControllerButtons[
                    i
                ] === true;


            if (
                !wasPressed
            ) {

                assignControllerButton(
                    controllerRebindingAction,
                    i
                );

                break;
            }
        }
    }


    // ========================================================
    // LEFT STICK
    // ========================================================

    controllerState.steerX =
        applyDeadzone(
            gamepad.axes[0] || 0
        );


    controllerState.steerY =
        applyDeadzone(
            gamepad.axes[1] || 0
        );


    // ========================================================
    // ANALOGUE TRIGGERS
    // ========================================================

    controllerState.throttle =
        buttonValue(

            gamepad,

            controllerBindings
                .throttle
        );


    controllerState.reverse =
        buttonValue(

            gamepad,

            controllerBindings
                .reverse
        );


    // ========================================================
    // DIGITAL ACTIONS
    // ========================================================

    const jumpNow =
        buttonHeld(

            gamepad,

            controllerBindings
                .jump
        );


    const ballCamNow =
        buttonHeld(

            gamepad,

            controllerBindings
                .ballCam
        );


    controllerState.jumpPressed =
        jumpNow &&
        !controllerState.jump;


    controllerState.ballCamPressed =
        ballCamNow &&
        !controllerState.ballCam;


    controllerState.jump =
        jumpNow;


    controllerState.ballCam =
        ballCamNow;


    controllerState.boost =
        buttonHeld(

            gamepad,

            controllerBindings
                .boost
        );


    controllerState.powerslide =
        buttonHeld(

            gamepad,

            controllerBindings
                .powerslide
        );


    controllerState.scoreboard =
        buttonHeld(

            gamepad,

            controllerBindings
                .scoreboard
        );


    previousControllerButtons =
        gamepad.buttons.map(
            button =>
                button.pressed ||
                button.value >
                    0.65
        );
}


// ============================================================
// GAMEPAD CONNECTION EVENTS
// ============================================================

window.addEventListener(
    "gamepadconnected",
    event => {

        controllerState.index =
            event.gamepad.index;

        controllerState.connected =
            true;

        controllerNotice =
            `${event.gamepad.id || "Controller"} connected`;

        console.log(
            "Boostball controller connected:",
            event.gamepad.id
        );
    }
);


window.addEventListener(
    "gamepaddisconnected",
    event => {

        if (
            controllerState.index ===
                event.gamepad.index
        ) {

            controllerState.index =
                null;

            controllerState.connected =
                false;
        }

        if (
            controllerRebindingAction
        ) {

            cancelControllerRebind();
        }
    }
);


// ============================================================
// KEYBOARD INPUT STATE
// ============================================================

const keys = {};
const pressed = {};

let menuOpen =
    false;

let rebindingAction =
    null;

let controlNotice =
    "";


function normalizeKey(
    event
) {

    if (
        event.key === " "
    ) {

        return " ";
    }

    return event.key
        .toLowerCase();
}


function browserShortcutActive(
    event
) {

    return (

        event.altKey
        ||
        event.metaKey

        ||

        (
            event.ctrlKey
            &&
            event.key
                .toLowerCase()
                !==
                "control"
        )
    );
}


function isProtectedBinding(
    event
) {

    const key =
        normalizeKey(
            event
        );


    if (
        event.altKey ||
        event.metaKey
    ) {

        return true;
    }


    if (
        event.ctrlKey &&
        key !==
            "control"
    ) {

        return true;
    }


    return false;
}


// ============================================================
// CLEAR HELD INPUT
// ============================================================

function clearHeldInputs() {

    for (
        const key
        in keys
    ) {

        keys[key] =
            false;
    }


    for (
        const key
        in pressed
    ) {

        pressed[key] =
            false;
    }


    controllerState.jump =
        false;

    controllerState.jumpPressed =
        false;

    controllerState.boost =
        false;

    controllerState.powerslide =
        false;

    controllerState.ballCam =
        false;

    controllerState.ballCamPressed =
        false;

    controllerState.scoreboard =
        false;
}


// ============================================================
// INPUT COMBINERS
// ============================================================

function throttleInput() {

    const keyboard =
        keys[
            controls.throttle
        ]
            ? 1
            : 0;


    return Math.max(
        keyboard,
        controllerState.throttle
    );
}


function reverseInput() {

    const keyboard =
        keys[
            controls.reverse
        ]
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


    if (
        keys[
            controls.left
        ]
    ) {

        value -=
            1;
    }


    if (
        keys[
            controls.right
        ]
    ) {

        value +=
            1;
    }


    return THREE.MathUtils.clamp(
        value,
        -1,
        1
    );
}


// ============================================================
// FIXED AERIAL PITCH INPUT
// ============================================================
//
// W / stick UP = nose DOWN.
//
// S / stick DOWN = nose UP.
//
// v0.6.1 accidentally inverted this.
// ============================================================

function aerialPitchInput() {

    let value =
        controllerState.steerY;


    if (
        keys[
            controls.throttle
        ]
    ) {

        value -=
            1;
    }


    if (
        keys[
            controls.reverse
        ]
    ) {

        value +=
            1;
    }


    return THREE.MathUtils.clamp(
        value,
        -1,
        1
    );
}


function jumpHeld() {

    return (
        !!keys[
            controls.jump
        ]
        ||
        controllerState.jump
    );
}


function boostHeld() {

    return (
        !!keys[
            controls.boost
        ]
        ||
        controllerState.boost
    );
}


function powerslideHeld() {

    return (
        !!keys[
            controls.powerslide
        ]
        ||
        controllerState.powerslide
    );
}


// ============================================================
// MATCH STATE
// ============================================================

const MATCH_STATE = {

    PLAYING:
        "playing",

    OVERTIME:
        "overtime",

    CELEBRATION:
        "celebration",

    RESULTS:
        "results",

    FREEPLAY:
        "freeplay"
};


let matchState =
    MATCH_STATE.PLAYING;


let blueScore = 0;
let orangeScore = 0;

let gameTime = 300;

let timerStarted =
    false;

let ballCam =
    true;

let goalPause =
    false;

let goalPauseTimer =
    0;

let goalText =
    "";

let winningTeam =
    null;

let matchResult =
    "";

const CELEBRATION_DURATION =
    5;

let celebrationTimer =
    0;


// ============================================================
// MATCH STATS
// ============================================================

const matchStats = {

    score: 0,

    goals: 0,

    shots: 0,

    saves: 0
};


function resetMatchStats() {

    matchStats.score =
        0;

    matchStats.goals =
        0;

    matchStats.shots =
        0;

    matchStats.saves =
        0;
}


// ============================================================
// KEYBOARD EVENTS
// ============================================================

window.addEventListener(
    "keydown",
    event => {

        const key =
            normalizeKey(
                event
            );


        // ----------------------------------------------------
        // KEYBOARD REBINDING
        // ----------------------------------------------------

        if (
            rebindingAction
        ) {

            if (
                key ===
                "escape"
            ) {

                rebindingAction =
                    null;

                controlNotice =
                    "Keyboard remap cancelled.";

                updateMenu();

                return;
            }


            if (
                isProtectedBinding(
                    event
                )
            ) {

                controlNotice =
                    "That browser/system shortcut can't be used.";

                updateMenu();

                return;
            }


            let conflict =
                null;


            for (
                const [
                    action,
                    boundKey
                ]
                of Object.entries(
                    controls
                )
            ) {

                if (
                    action !==
                        rebindingAction
                    &&
                    boundKey ===
                        key
                ) {

                    conflict =
                        action;

                    break;
                }
            }


            if (
                conflict
            ) {

                controlNotice =
                    `${readableKey(key)} is already bound to ${readableAction(conflict)}.`;

                updateMenu();

                return;
            }


            controls[
                rebindingAction
            ] =
                key;


            saveControls();


            controlNotice =
                `${readableAction(rebindingAction)} → ${readableKey(key)}`;


            rebindingAction =
                null;


            updateMenu();


            event.preventDefault();

            return;
        }


        // ----------------------------------------------------
        // DON'T STEAL BROWSER SHORTCUTS
        // ----------------------------------------------------

        if (
            browserShortcutActive(
                event
            )
        ) {

            return;
        }


        // ----------------------------------------------------
        // MENU
        // ----------------------------------------------------

        if (
            key ===
                controls.menu
            &&
            !pressed[key]
        ) {

            event.preventDefault();


            menuOpen =
                !menuOpen;


            if (
                !menuOpen
            ) {

                controllerRebindingAction =
                    null;

                rebindingAction =
                    null;
            }


            clearHeldInputs();


            updateMenu();


            pressed[key] =
                true;


            return;
        }


        if (
            menuOpen
        ) {

            return;
        }


        keys[key] =
            true;


        if (
            !pressed[key]
        ) {

            pressed[key] =
                true;


            if (
                key ===
                    controls.jump
                &&
                !goalPause
            ) {

                performJump();
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
            key === " "
            ||
            key === "tab"
            ||
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
            normalizeKey(
                event
            );


        keys[key] =
            false;


        pressed[key] =
            false;
    }
);


window.addEventListener(
    "blur",
    () => {

        clearHeldInputs();
    }
);


document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden
        ) {

            clearHeldInputs();
        }
    }
);


// ============================================================
// END OF v0.6.2 PART 1 / 3
//
// DO NOT RUN YET.
//
// PART 2 ADDS:
//
// - controller remapping menu UI
// - boost pads
// - rigid-body force / torque helpers
// - four-wheel suspension
// - chassis contacts
// - gravity-induced toppling
// - new aerial torque
// - jump / double jump / dodge
// - ground driving
//
// PART 3 FINISHES BALL / GOALS / CAMERA / MATCH / LOOP.
//
// ============================================================
// BOOSTBALL v0.6.2 — RIGID BODY DETENTION
// PART 2 / 3
//
// Controller menu.
// Boost pads.
// Rigid-body contact physics.
// Suspension.
// Gravity torque.
// Aerial controls.
// Jump / double jump / dodge.
// Ground driving.
// ============================================================


// ============================================================
// READABLE CONTROL NAMES
// ============================================================

function readableAction(action) {

    const names = {
        throttle: "Accelerate",
        reverse: "Reverse / Brake",
        left: "Steer Left",
        right: "Steer Right",
        jump: "Jump",
        boost: "Boost",
        powerslide: "Powerslide / Air Roll",
        ballCam: "Ball Cam",
        reset: "Reset",
        menu: "Menu",
        scoreboard: "Scoreboard"
    };

    return (
        names[action] ||
        action
    );
}


function readableKey(key) {

    const names = {
        " ": "Space",
        shift: "Shift",
        control: "Ctrl",
        tab: "Tab",
        escape: "Esc",
        arrowup: "↑",
        arrowdown: "↓",
        arrowleft: "←",
        arrowright: "→"
    };

    return (
        names[key] ||
        key.toUpperCase()
    );
}


// ============================================================
// MENU ROOT
// ============================================================

const menu =
    document.createElement(
        "div"
    );

menu.style.cssText = `
    position:fixed;
    inset:0;
    z-index:80;

    display:none;

    background:
        rgba(3,7,15,0.82);

    backdrop-filter:
        blur(7px);

    color:white;

    font-family:
        Arial,
        sans-serif;

    overflow-y:auto;
`;

document.body.appendChild(
    menu
);


// ============================================================
// MENU HELPERS
// ============================================================

function keyboardControlRow(
    action
) {

    const waiting =
        rebindingAction ===
        action;


    return `
        <button
            data-keyboard-action="${action}"
            style="
                width:100%;
                display:flex;
                justify-content:space-between;
                align-items:center;

                padding:11px 13px;
                margin:5px 0;

                border-radius:8px;

                border:
                    1px solid
                    rgba(255,255,255,0.12);

                background:
                    ${
                        waiting
                            ?
                            "rgba(22,140,255,0.35)"
                            :
                            "rgba(255,255,255,0.055)"
                    };

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
                        ?
                        "PRESS A KEY..."
                        :
                        readableKey(
                            controls[action]
                        )
                }
            </strong>
        </button>
    `;
}


function controllerControlRow(
    action
) {

    const waiting =
        controllerRebindingAction ===
        action;


    return `
        <button
            data-controller-action="${action}"
            style="
                width:100%;

                display:flex;
                justify-content:space-between;
                align-items:center;

                padding:11px 13px;
                margin:5px 0;

                border-radius:8px;

                border:
                    1px solid
                    rgba(255,255,255,0.12);

                background:
                    ${
                        waiting
                            ?
                            "rgba(255,125,25,0.36)"
                            :
                            "rgba(255,255,255,0.055)"
                    };

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
                        ?
                        "PRESS A BUTTON..."
                        :
                        readableControllerButton(
                            controllerBindings[
                                action
                            ]
                        )
                }
            </strong>
        </button>
    `;
}


// ============================================================
// UPDATE MENU
// ============================================================

function updateMenu() {

    menu.style.display =
        menuOpen
            ?
            "block"
            :
            "none";


    if (
        !menuOpen
    ) {

        return;
    }


    const controllerStatus =
        controllerState.connected
            ?
            "CONNECTED"
            :
            "NO CONTROLLER DETECTED";


    menu.innerHTML = `

        <div
            style="
                width:min(920px,92vw);
                margin:35px auto 70px auto;
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-end;
                    gap:20px;
                    margin-bottom:22px;
                "
            >

                <div>

                    <div
                        style="
                            font-size:
                                clamp(30px,5vw,56px);

                            font-weight:900;
                            letter-spacing:3px;
                        "
                    >
                        BOOSTBALL
                    </div>

                    <div
                        style="
                            opacity:0.62;
                            margin-top:4px;
                            letter-spacing:2px;
                        "
                    >
                        ${GAME_VERSION}
                        ·
                        ${GAME_CODENAME}
                    </div>

                </div>

                <div
                    style="
                        text-align:right;
                        opacity:0.72;
                        font-size:13px;
                    "
                >
                    TAB TO RETURN
                </div>

            </div>


            <div
                style="
                    display:grid;

                    grid-template-columns:
                        repeat(
                            auto-fit,
                            minmax(290px,1fr)
                        );

                    gap:18px;
                "
            >

                <!-- KEYBOARD -->

                <section
                    style="
                        background:
                            rgba(0,0,0,0.32);

                        border:
                            1px solid
                            rgba(255,255,255,0.09);

                        border-radius:12px;

                        padding:18px;
                    "
                >

                    <h2
                        style="
                            margin:0 0 5px 0;
                        "
                    >
                        Keyboard
                    </h2>

                    <div
                        style="
                            opacity:0.58;
                            font-size:13px;
                            margin-bottom:15px;
                        "
                    >
                        Click a control,
                        then press a key.
                    </div>

                    ${keyboardControlRow("throttle")}
                    ${keyboardControlRow("reverse")}
                    ${keyboardControlRow("left")}
                    ${keyboardControlRow("right")}
                    ${keyboardControlRow("jump")}
                    ${keyboardControlRow("boost")}
                    ${keyboardControlRow("powerslide")}
                    ${keyboardControlRow("ballCam")}
                    ${keyboardControlRow("reset")}

                    <button
                        id="resetKeyboardControls"
                        style="
                            width:100%;
                            margin-top:12px;
                            padding:10px;

                            border-radius:8px;

                            border:
                                1px solid
                                rgba(255,255,255,0.15);

                            background:
                                rgba(255,255,255,0.08);

                            color:white;

                            cursor:pointer;
                        "
                    >
                        Reset Keyboard Controls
                    </button>

                    <div
                        style="
                            margin-top:10px;
                            min-height:18px;
                            opacity:0.7;
                            font-size:12px;
                        "
                    >
                        ${controlNotice}
                    </div>

                </section>


                <!-- CONTROLLER -->

                <section
                    style="
                        background:
                            rgba(0,0,0,0.32);

                        border:
                            1px solid
                            rgba(255,255,255,0.09);

                        border-radius:12px;

                        padding:18px;
                    "
                >

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            gap:12px;
                        "
                    >

                        <h2
                            style="
                                margin:0;
                            "
                        >
                            Controller
                        </h2>

                        <strong
                            style="
                                font-size:11px;
                                letter-spacing:1px;

                                color:
                                    ${
                                        controllerState.connected
                                            ?
                                            "#78e6a0"
                                            :
                                            "#ffb76b"
                                    };
                            "
                        >
                            ${controllerStatus}
                        </strong>

                    </div>


                    <div
                        style="
                            opacity:0.58;
                            font-size:13px;
                            margin:
                                5px 0 15px 0;
                        "
                    >
                        Click a control,
                        then press the button
                        you want.
                    </div>


                    ${controllerControlRow("throttle")}
                    ${controllerControlRow("reverse")}
                    ${controllerControlRow("jump")}
                    ${controllerControlRow("boost")}
                    ${controllerControlRow("powerslide")}
                    ${controllerControlRow("ballCam")}
                    ${controllerControlRow("scoreboard")}


                    <div
                        style="
                            margin-top:12px;
                            padding:10px;

                            border-radius:8px;

                            background:
                                rgba(255,255,255,0.04);

                            font-size:12px;
                            opacity:0.72;
                            line-height:1.55;
                        "
                    >
                        Left Stick:
                        steer / aerial control

                        <br>

                        R1 defaults to Scoreboard.
                    </div>


                    <button
                        id="resetControllerControls"
                        style="
                            width:100%;
                            margin-top:12px;
                            padding:10px;

                            border-radius:8px;

                            border:
                                1px solid
                                rgba(255,255,255,0.15);

                            background:
                                rgba(255,255,255,0.08);

                            color:white;

                            cursor:pointer;
                        "
                    >
                        Reset Controller Controls
                    </button>


                    <div
                        style="
                            margin-top:10px;
                            min-height:18px;
                            opacity:0.7;
                            font-size:12px;
                        "
                    >
                        ${controllerNotice}
                    </div>

                </section>


                <!-- GRAPHICS -->

                <section
                    style="
                        background:
                            rgba(0,0,0,0.32);

                        border:
                            1px solid
                            rgba(255,255,255,0.09);

                        border-radius:12px;

                        padding:18px;
                    "
                >

                    <h2
                        style="
                            margin:0 0 5px 0;
                        "
                    >
                        Graphics
                    </h2>

                    <div
                        style="
                            opacity:0.58;
                            font-size:13px;
                            margin-bottom:15px;
                        "
                    >
                        Current:
                        ${
                            GRAPHICS_PRESETS[
                                graphicsPreset
                            ].label
                        }
                    </div>


                    ${
                        Object.entries(
                            GRAPHICS_PRESETS
                        )
                        .map(
                            ([
                                id,
                                preset
                            ]) => `

                                <button
                                    data-graphics="${id}"

                                    style="
                                        width:100%;
                                        padding:11px;
                                        margin:5px 0;

                                        border-radius:8px;

                                        border:
                                            1px solid
                                            rgba(255,255,255,0.12);

                                        background:
                                            ${
                                                graphicsPreset === id
                                                    ?
                                                    "rgba(22,140,255,0.32)"
                                                    :
                                                    "rgba(255,255,255,0.055)"
                                            };

                                        color:white;
                                        cursor:pointer;
                                    "
                                >
                                    ${preset.label}
                                    ·
                                    ${preset.fps} FPS
                                </button>

                            `
                        )
                        .join("")
                    }

                </section>

            </div>

        </div>
    `;


    // --------------------------------------------------------
    // KEYBOARD BUTTONS
    // --------------------------------------------------------

    for (
        const button
        of menu.querySelectorAll(
            "[data-keyboard-action]"
        )
    ) {

        button.addEventListener(
            "click",
            () => {

                controllerRebindingAction =
                    null;

                rebindingAction =
                    button.dataset
                        .keyboardAction;

                controlNotice =
                    `Press a key for ${readableAction(rebindingAction)}…`;

                updateMenu();
            }
        );
    }


    // --------------------------------------------------------
    // CONTROLLER BUTTONS
    // --------------------------------------------------------

    for (
        const button
        of menu.querySelectorAll(
            "[data-controller-action]"
        )
    ) {

        button.addEventListener(
            "click",
            () => {

                rebindingAction =
                    null;

                beginControllerRebind(
                    button.dataset
                        .controllerAction
                );

                updateMenu();
            }
        );
    }


    // --------------------------------------------------------
    // RESET KEYBOARD
    // --------------------------------------------------------

    const resetKeyboardButton =
        document.getElementById(
            "resetKeyboardControls"
        );

    if (
        resetKeyboardButton
    ) {

        resetKeyboardButton.addEventListener(
            "click",
            () => {

                resetControls();

                rebindingAction =
                    null;

                controlNotice =
                    "Keyboard controls reset.";

                updateMenu();
            }
        );
    }


    // --------------------------------------------------------
    // RESET CONTROLLER
    // --------------------------------------------------------

    const resetControllerButton =
        document.getElementById(
            "resetControllerControls"
        );

    if (
        resetControllerButton
    ) {

        resetControllerButton.addEventListener(
            "click",
            () => {

                resetControllerBindings();

                controllerRebindingAction =
                    null;

                controllerNotice =
                    "Controller controls reset.";

                updateMenu();
            }
        );
    }


    // --------------------------------------------------------
    // GRAPHICS
    // --------------------------------------------------------

    for (
        const button
        of menu.querySelectorAll(
            "[data-graphics]"
        )
    ) {

        button.addEventListener(
            "click",
            () => {

                graphicsPreset =
                    button.dataset.graphics;

                applyGraphicsPreset();

                resetFrameClock();

                updateMenu();
            }
        );
    }
}


// ============================================================
// BOOST PADS
// ============================================================

const boostPads = [];


const smallBoostDecalMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xe2b62d,
        transparent: true,
        opacity: 0.60,
        side: THREE.DoubleSide
    });


const bigBoostDecalMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xff861c,
        transparent: true,
        opacity: 0.76,
        side: THREE.DoubleSide
    });


const smallBoostMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffd54a,
        emissive: 0x6d4c00,
        emissiveIntensity: 1.4
    });


const bigBoostMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xff8a24,
        emissive: 0x8a3300,
        emissiveIntensity: 1.7
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


    const decal =
        new THREE.Mesh(

            new THREE.RingGeometry(
                big ? 1.25 : 0.75,
                big ? 1.65 : 1.05,
                20
            ),

            big
                ?
                bigBoostDecalMaterial
                :
                smallBoostDecalMaterial
        );


    decal.rotation.x =
        -Math.PI / 2;

    decal.position.y =
        0.025;


    group.add(
        decal
    );


    const pickup =
        new THREE.Mesh(

            new THREE.OctahedronGeometry(
                big ? 0.70 : 0.40,
                0
            ),

            big
                ?
                bigBoostMaterial
                :
                smallBoostMaterial
        );


    pickup.position.y =
        big ? 0.78 : 0.46;


    group.add(
        pickup
    );


    scene.add(
        group
    );


    boostPads.push({

        group,

        pickup,

        big,

        active: true,

        respawnTimer: 0,

        amount:
            big
                ?
                100
                :
                12,

        respawnTime:
            big
                ?
                10
                :
                4
    });
}


// ============================================================
// BOOST PAD LAYOUT
// ============================================================

const boostPadLayout = [

    [-60, -37, true],
    [-60, 37, true],

    [60, -37, true],
    [60, 37, true],

    [0, -38, true],
    [0, 38, true],

    [-40, 0, false],
    [40, 0, false],

    [-20, 0, false],
    [20, 0, false],

    [0, 0, false],

    [-35, -22, false],
    [-35, 22, false],

    [35, -22, false],
    [35, 22, false],

    [-12, -28, false],
    [-12, 28, false],

    [12, -28, false],
    [12, 28, false]
];


for (
    const [
        x,
        z,
        big
    ]
    of boostPadLayout
) {

    createBoostPad(
        x,
        z,
        big
    );
}


// ============================================================
// UPDATE BOOST PADS
// ============================================================

function updateBoostPads(
    dt
) {

    for (
        const pad
        of boostPads
    ) {

        pad.pickup.rotation.y +=
            dt *
            (
                pad.big
                    ?
                    1.7
                    :
                    2.5
            );


        if (
            !pad.active
        ) {

            pad.respawnTimer -=
                dt;


            if (
                pad.respawnTimer <=
                0
            ) {

                pad.active =
                    true;

                pad.pickup.visible =
                    true;
            }

            continue;
        }


        const dx =
            car.position.x -
            pad.group.position.x;

        const dz =
            car.position.z -
            pad.group.position.z;


        const pickupRadius =
            pad.big
                ?
                2.4
                :
                1.8;


        if (
            dx * dx +
            dz * dz
            <
            pickupRadius *
            pickupRadius
            &&
            car.position.y <
                3.2
        ) {

            if (
                pad.big
            ) {

                boostAmount =
                    100;

            } else {

                boostAmount =
                    Math.min(
                        100,
                        boostAmount +
                            pad.amount
                    );
            }


            pad.active =
                false;

            pad.pickup.visible =
                false;

            pad.respawnTimer =
                pad.respawnTime;
        }
    }
}


// ============================================================
// RIGID BODY HELPERS
// ============================================================

function worldPointFromLocal(
    localPoint,
    target
) {

    return target
        .copy(
            localPoint
        )
        .applyQuaternion(
            car.quaternion
        )
        .add(
            car.position
        );
}


// ============================================================
// LOCAL ANGULAR VELOCITY -> WORLD
// ============================================================

function getWorldAngularVelocity(
    target
) {

    return target
        .copy(
            angularVelocity
        )
        .applyQuaternion(
            car.quaternion
        );
}


// ============================================================
// POINT VELOCITY
// ============================================================
//
// v(point) = linear velocity + angular velocity × radius
// ============================================================

function getPointVelocity(
    worldPoint,
    target
) {

    tempRelativePoint
        .copy(
            worldPoint
        )
        .sub(
            car.position
        );


    getWorldAngularVelocity(
        tempAngularWorld
    );


    target
        .crossVectors(
            tempAngularWorld,
            tempRelativePoint
        )
        .add(
            carVelocity
        );


    return target;
}


// ============================================================
// APPLY WORLD TORQUE
// ============================================================

function applyWorldTorque(
    worldTorque,
    dt
) {

    // Convert torque into local car space.

    tempTorque
        .copy(
            worldTorque
        );


    const inverseQuaternion =
        car.quaternion
            .clone()
            .invert();


    tempTorque.applyQuaternion(
        inverseQuaternion
    );


    angularVelocity.x +=
        (
            tempTorque.x /
            CAR_INERTIA.x
        ) *
        dt;


    angularVelocity.y +=
        (
            tempTorque.y /
            CAR_INERTIA.y
        ) *
        dt;


    angularVelocity.z +=
        (
            tempTorque.z /
            CAR_INERTIA.z
        ) *
        dt;
}


// ============================================================
// APPLY FORCE AT WORLD POINT
// ============================================================

function applyForceAtPoint(
    force,
    worldPoint,
    dt
) {

    carVelocity.addScaledVector(
        force,
        dt /
            CAR_MASS
    );


    tempRelativePoint
        .copy(
            worldPoint
        )
        .sub(
            car.position
        );


    tempTorque.crossVectors(
        tempRelativePoint,
        force
    );


    applyWorldTorque(
        tempTorque,
        dt
    );
}


// ============================================================
// INTEGRATE ORIENTATION
// ============================================================

function integrateOrientation(
    dt
) {

    const speed =
        angularVelocity.length();


    if (
        speed <
        0.000001
    ) {

        return;
    }


    tempDirection
        .copy(
            angularVelocity
        )
        .normalize();


    rotationQuaternion
        .setFromAxisAngle(
            tempDirection,
            speed * dt
        );


    // Angular velocity is LOCAL,
    // so post-multiply.

    car.quaternion
        .multiply(
            rotationQuaternion
        )
        .normalize();
}


// ============================================================
// FLOOR CONTACT FORCE
// ============================================================

function applyFloorContact(
    localPoint,
    stiffness,
    damping,
    dt,
    isWheel
) {

    worldPointFromLocal(
        localPoint,
        tempWorldPoint
    );


    if (
        tempWorldPoint.y >=
        0
    ) {

        return false;
    }


    const penetration =
        -tempWorldPoint.y;


    getPointVelocity(
        tempWorldPoint,
        tempPointVelocity
    );


    const downwardSpeed =
        Math.min(
            0,
            tempPointVelocity.y
        );


    let normalForce =
        penetration *
            stiffness
        -
        downwardSpeed *
            damping;


    normalForce =
        THREE.MathUtils.clamp(
            normalForce,
            0,
            180
        );


    tempForce.set(
        0,
        normalForce,
        0
    );


    applyForceAtPoint(
        tempForce,
        tempWorldPoint,
        dt
    );


    // --------------------------------------------------------
    // CONTACT FRICTION
    // --------------------------------------------------------

    getPointVelocity(
        tempWorldPoint,
        tempPointVelocity
    );


    tempForce.set(
        -tempPointVelocity.x,
        0,
        -tempPointVelocity.z
    );


    const frictionStrength =
        isWheel
            ?
            CONTACT_FRICTION
            :
            ROOF_FRICTION;


    tempForce.multiplyScalar(
        frictionStrength
    );


    const maxFriction =
        normalForce *
        (
            isWheel
                ?
                0.75
                :
                0.32
        );


    const frictionLength =
        tempForce.length();


    if (
        frictionLength >
            maxFriction
        &&
        frictionLength >
            0
    ) {

        tempForce.multiplyScalar(
            maxFriction /
            frictionLength
        );
    }


    applyForceAtPoint(
        tempForce,
        tempWorldPoint,
        dt
    );


    return true;
}


// ============================================================
// UPDATE GROUND CONTACTS
// ============================================================

function updateGroundContacts(
    dt
) {

    wheelContactCount =
        0;

    chassisContactCount =
        0;


    // --------------------------------------------------------
    // WHEELS
    // --------------------------------------------------------

    for (
        const point
        of wheelContactPoints
    ) {

        if (
            applyFloorContact(
                point,
                SUSPENSION_STIFFNESS,
                SUSPENSION_DAMPING,
                dt,
                true
            )
        ) {

            wheelContactCount++;
        }
    }


    // --------------------------------------------------------
    // CHASSIS
    // --------------------------------------------------------

    for (
        const point
        of chassisContactPoints
    ) {

        if (
            applyFloorContact(
                point,
                CHASSIS_CONTACT_STIFFNESS,
                CHASSIS_CONTACT_DAMPING,
                dt,
                false
            )
        ) {

            chassisContactCount++;
        }
    }


    hasWheelContact =
        wheelContactCount > 0;


    hasAnyGroundContact =
        (
            wheelContactCount +
            chassisContactCount
        ) > 0;


    // --------------------------------------------------------
    // SAFETY FLOOR
    // --------------------------------------------------------
    //
    // Contact points do the actual physics.
    // This only prevents catastrophic tunnelling through the
    // map after a huge impact.
    // --------------------------------------------------------

    if (
        car.position.y <
        -2.5
    ) {

        car.position.y =
            0.5;


        if (
            carVelocity.y <
            0
        ) {

            carVelocity.y *=
                -0.15;
        }
    }
}


// ============================================================
// GRAVITY-INDUCED TOPPLING
// ============================================================
//
// This is the bit v0.6.1 was missing.
//
// When a chassis point is touching the floor, the floor force
// is applied away from the centre of mass. That already creates
// torque.
//
// We also give near-static edge contacts a tiny gravitational
// instability so a car balanced unrealistically on one bumper
// doesn't remain there forever.
// ============================================================

function applyBalanceInstability(
    dt
) {

    if (
        !hasAnyGroundContact
    ) {

        return;
    }


    getCarUp(
        tempUp
    );


    const upright =
        tempUp.dot(
            Y_AXIS
        );


    // Properly upright cars don't need help.

    if (
        upright >
        0.94
        &&
        wheelContactCount >=
        2
    ) {

        return;
    }


    // World gravity direction.

    tempForce.set(
        0,
        -GRAVITY *
            CAR_MASS,
        0
    );


    // Centre-of-support approximation:
    // use the lowest active contact.

    let lowestY =
        Infinity;

    let found =
        false;


    for (
        const point
        of [
            ...wheelContactPoints,
            ...chassisContactPoints
        ]
    ) {

        worldPointFromLocal(
            point,
            tempWorldPoint
        );


        if (
            tempWorldPoint.y <
            0.12
            &&
            tempWorldPoint.y <
                lowestY
        ) {

            lowestY =
                tempWorldPoint.y;

            tempDirection.copy(
                tempWorldPoint
            );

            found =
                true;
        }
    }


    if (
        !found
    ) {

        return;
    }


    // Vector from support point to centre of mass.

    tempRelativePoint
        .copy(
            car.position
        )
        .sub(
            tempDirection
        );


    // Gravity around the support point.

    tempTorque.crossVectors(
        tempRelativePoint,
        tempForce
    );


    // We only need a fraction because contact-force torque is
    // already doing most of the work.

    tempTorque.multiplyScalar(
        0.34
    );


    applyWorldTorque(
        tempTorque,
        dt
    );
}


// ============================================================
// AERIAL CONTROL
// ============================================================

function updateAerialControls(
    dt
) {

    const pitch =
        aerialPitchInput();


    const yaw =
        steeringInput();


    const airRoll =
        powerslideHeld();


    // --------------------------------------------------------
    // PITCH
    // --------------------------------------------------------
    //
    // NEGATIVE pitch input = W / stick up.
    //
    // We want W = nose DOWN.
    //
    // Local Z is the car's right axis.
    // --------------------------------------------------------

    angularVelocity.z +=
        pitch *
        AIR_PITCH_ACCEL *
        dt;


    // --------------------------------------------------------
    // YAW / AIR ROLL
    // --------------------------------------------------------

    if (
        airRoll
    ) {

        // Powerslide + left/right =
        // roll around local forward axis.

        angularVelocity.x +=
            -yaw *
            AIR_ROLL_ACCEL *
            dt;

    } else {

        // Ordinary A/D =
        // local yaw.

        angularVelocity.y +=
            -yaw *
            AIR_YAW_ACCEL *
            dt;
    }


    // --------------------------------------------------------
    // AIR ROTATIONAL DRAG
    // --------------------------------------------------------

    const damping =
        Math.exp(
            -AIR_ANGULAR_DAMPING *
            dt
        );


    angularVelocity.multiplyScalar(
        damping
    );


    // Prevent absurd spin rates.

    const maxAngularSpeed =
        10.5;


    if (
        angularVelocity.length() >
        maxAngularSpeed
    ) {

        angularVelocity.setLength(
            maxAngularSpeed
        );
    }
}


// ============================================================
// JUMP / DOUBLE JUMP / DODGE
// ============================================================

function performJump() {

    if (
        matchState ===
        MATCH_STATE.RESULTS
    ) {

        return;
    }


    // --------------------------------------------------------
    // FIRST JUMP
    // --------------------------------------------------------

    if (
        hasWheelContact
        &&
        landingCooldown <=
            0
    ) {

        firstJumpUsed =
            true;

        secondJumpUsed =
            false;

        jumpHeldTime =
            0;


        getCarUp(
            tempUp
        );


        // RL-like jump follows the car's UP direction,
        // not magically world-up only.

        carVelocity.addScaledVector(
            tempUp,
            JUMP_IMPULSE
        );


        // Small guaranteed world-up component prevents a tiny
        // slope/contact error eating the jump.

        carVelocity.y =
            Math.max(
                carVelocity.y,
                8
            );


        landingCooldown =
            0.12;


        return;
    }


    // --------------------------------------------------------
    // SECOND JUMP ALREADY USED
    // --------------------------------------------------------

    if (
        !firstJumpUsed
        ||
        secondJumpUsed
    ) {

        return;
    }


    secondJumpUsed =
        true;


    const steer =
        steeringInput();


    const pitch =
        aerialPitchInput();


    // --------------------------------------------------------
    // NEUTRAL DOUBLE JUMP
    // --------------------------------------------------------

    if (
        Math.abs(
            steer
        ) <
            0.25
        &&
        Math.abs(
            pitch
        ) <
            0.25
    ) {

        getCarUp(
            tempUp
        );


        carVelocity.addScaledVector(
            tempUp,
            DOUBLE_JUMP_IMPULSE
        );


        return;
    }


    // --------------------------------------------------------
    // DODGE DIRECTION
    // --------------------------------------------------------

    getCarForward(
        tempForward
    );


    getCarRight(
        tempRight
    );


    // Input convention:
    //
    // W / stick up = pitch negative.
    //
    // Therefore -pitch is FORWARD dodge.

    tempDirection
        .set(
            0,
            0,
            0
        )
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


    carVelocity.y +=
        DODGE_VERTICAL_IMPULSE;


    // --------------------------------------------------------
    // DODGE ROTATION
    // --------------------------------------------------------
    //
    // No scripted flip animation.
    //
    // This is now an angular impulse.
    // --------------------------------------------------------

    const forwardAmount =
        -pitch;


    const sideAmount =
        steer;


    // Forward dodge:
    // rotate around local RIGHT axis.

    angularVelocity.z +=
        -forwardAmount *
        DODGE_PITCH_IMPULSE;


    // Side dodge:
    // rotate around local FORWARD axis.

    angularVelocity.x +=
        -sideAmount *
        DODGE_ROLL_IMPULSE;


    // Damp unwanted yaw during the initial dodge.

    angularVelocity.y *=
        0.55;
}


// ============================================================
// VARIABLE JUMP HOLD
// ============================================================

function updateJumpHold(
    dt
) {

    if (
        !firstJumpUsed
        ||
        jumpHeldTime >=
            JUMP_HOLD_TIME
    ) {

        return;
    }


    if (
        !jumpHeld()
    ) {

        jumpHeldTime =
            JUMP_HOLD_TIME;

        return;
    }


    getCarUp(
        tempUp
    );


    carVelocity.addScaledVector(
        tempUp,
        JUMP_HOLD_FORCE *
            dt
    );


    jumpHeldTime +=
        dt;
}


// ============================================================
// GROUND ENGINE
// ============================================================

function updateGroundDriving(
    dt
) {

    if (
        !hasWheelContact
    ) {

        return;
    }


    getCarForward(
        tempForward
    );


    // Driving force should be horizontal.

    tempForward.y =
        0;


    if (
        tempForward.lengthSq() <
        0.001
    ) {

        return;
    }


    tempForward.normalize();


    tempRight.set(
        -tempForward.z,
        0,
        tempForward.x
    );


    const throttle =
        throttleInput();


    const reverse =
        reverseInput();


    const steer =
        steeringInput();


    const forwardSpeed =
        carVelocity.dot(
            tempForward
        );


    const horizontalSpeed =
        Math.hypot(
            carVelocity.x,
            carVelocity.z
        );


    // --------------------------------------------------------
    // THROTTLE
    // --------------------------------------------------------

    if (
        throttle >
        0.01
    ) {

        if (
            forwardSpeed <
            DRIVE_TOP_SPEED
        ) {

            carVelocity.addScaledVector(

                tempForward,

                ACCELERATION *
                throttle *
                dt
            );
        }
    }


    // --------------------------------------------------------
    // BRAKE / REVERSE
    // --------------------------------------------------------

    if (
        reverse >
        0.01
    ) {

        if (
            forwardSpeed >
            1.5
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
    // STEERING
    // --------------------------------------------------------

    if (
        Math.abs(
            steer
        ) >
            0.001
        &&
        horizontalSpeed >
            0.3
    ) {

        const speedRatio =
            THREE.MathUtils.clamp(
                horizontalSpeed /
                DRIVE_TOP_SPEED,
                0,
                1
            );


        const steeringSpeed =
            THREE.MathUtils.lerp(
                LOW_SPEED_STEER,
                HIGH_SPEED_STEER,
                speedRatio
            );


        const reversing =
            forwardSpeed <
            -0.25;


        const direction =
            reversing
                ?
                -1
                :
                1;


        const slideMultiplier =
            powerslideHeld()
                ?
                POWERSLIDE_STEER_MULTIPLIER
                :
                1;


        angularVelocity.y +=

            -steer *
            steeringSpeed *
            direction *
            slideMultiplier *
            dt *
            6;
    }


    // --------------------------------------------------------
    // TYRE GRIP
    // --------------------------------------------------------

    const sidewaysSpeed =
        carVelocity.dot(
            tempRight
        );


    const grip =
        powerslideHeld()
            ?
            POWERSLIDE_GRIP
            :
            NORMAL_GRIP;


    const gripAmount =
        1 -
        Math.exp(
            -grip *
            dt
        );


    carVelocity.addScaledVector(

        tempRight,

        -sidewaysSpeed *
        gripAmount
    );


    // --------------------------------------------------------
    // DRAG
    // --------------------------------------------------------

    const powered =
        throttle >
            0.01
        ||
        reverse >
            0.01
        ||
        (
            boostHeld()
            &&
            boostAmount >
                0
        );


    const drag =
        powered
            ?
            POWERED_DRAG
            :
            COAST_DRAG;


    const dragMultiplier =
        Math.exp(
            -drag *
            dt
        );


    carVelocity.x *=
        dragMultiplier;

    carVelocity.z *=
        dragMultiplier;


    // Wheel contact resists uncontrolled pitch/roll,
    // but DOES NOT snap orientation upright.

    angularVelocity.x *=
        Math.exp(
            -GROUND_ANGULAR_DAMPING *
            dt
        );


    angularVelocity.z *=
        Math.exp(
            -GROUND_ANGULAR_DAMPING *
            dt
        );


    // Yaw gets lighter damping so steering remains responsive.

    angularVelocity.y *=
        Math.exp(
            -2.8 *
            dt
        );
}


// ============================================================
// BOOST
// ============================================================

function updateCarBoost(
    dt
) {

    if (
        !boostHeld()
        ||
        boostAmount <=
            0
    ) {

        return;
    }


    getCarForward(
        tempForward
    );


    // Ground boost remains horizontal so a tiny suspension
    // angle doesn't fire the microwave into orbit.

    if (
        hasWheelContact
    ) {

        tempForward.y =
            0;


        if (
            tempForward.lengthSq() >
            0.001
        ) {

            tempForward.normalize();
        }
    }


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


// ============================================================
// SPEED SAFETY
// ============================================================

function applyCarSpeedSafety() {

    const horizontalSpeed =
        Math.hypot(
            carVelocity.x,
            carVelocity.z
        );


    if (
        horizontalSpeed >
        ABSOLUTE_SPEED_LIMIT
    ) {

        const scale =
            ABSOLUTE_SPEED_LIMIT /
            horizontalSpeed;


        carVelocity.x *=
            scale;

        carVelocity.z *=
            scale;
    }


    carVelocity.y =
        THREE.MathUtils.clamp(
            carVelocity.y,
            -45,
            45
        );
}


// ============================================================
// ARENA COLLISION — CAR
// ============================================================

function collideCarWithArena() {

    const radius =
        1.45;


    // --------------------------------------------------------
    // SIDE WALLS
    // --------------------------------------------------------

    if (
        car.position.z >
        HALF_WIDTH -
            radius
    ) {

        car.position.z =
            HALF_WIDTH -
            radius;


        if (
            carVelocity.z >
            0
        ) {

            carVelocity.z *=
                -0.28;
        }
    }


    if (
        car.position.z <
        -HALF_WIDTH +
            radius
    ) {

        car.position.z =
            -HALF_WIDTH +
            radius;


        if (
            carVelocity.z <
            0
        ) {

            carVelocity.z *=
                -0.28;
        }
    }


    // --------------------------------------------------------
    // GOAL OPENING
    // --------------------------------------------------------

    const insideGoalWidth =
        Math.abs(
            car.position.z
        )
        <
        GOAL_WIDTH / 2 -
            radius;


    const belowCrossbar =
        car.position.y <
        GOAL_HEIGHT -
            0.7;


    const insideOpening =
        insideGoalWidth &&
        belowCrossbar;


    // --------------------------------------------------------
    // NORMAL END WALL
    // --------------------------------------------------------

    if (
        !insideOpening
    ) {

        if (
            car.position.x >
            HALF_LENGTH -
                radius
        ) {

            car.position.x =
                HALF_LENGTH -
                radius;


            if (
                carVelocity.x >
                0
            ) {

                carVelocity.x *=
                    -0.28;
            }
        }


        if (
            car.position.x <
            -HALF_LENGTH +
                radius
        ) {

            car.position.x =
                -HALF_LENGTH +
                radius;


            if (
                carVelocity.x <
                    0
            ) {

                carVelocity.x *=
                    -0.28;
            }
        }
    }


    // --------------------------------------------------------
    // ORANGE GOAL INTERIOR
    // --------------------------------------------------------

    if (
        insideOpening
        &&
        car.position.x >
        HALF_LENGTH -
            radius
    ) {

        const sideLimit =
            GOAL_WIDTH / 2 -
            radius;


        if (
            car.position.z >
            sideLimit
        ) {

            car.position.z =
                sideLimit;

            carVelocity.z =
                -Math.abs(
                    carVelocity.z
                ) *
                0.25;
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
                ) *
                0.25;
        }


        const back =
            HALF_LENGTH +
            GOAL_DEPTH -
            radius;


        if (
            car.position.x >
            back
        ) {

            car.position.x =
                back;

            carVelocity.x =
                -Math.abs(
                    carVelocity.x
                ) *
                0.25;
        }
    }


    // --------------------------------------------------------
    // BLUE GOAL INTERIOR
    // --------------------------------------------------------

    if (
        insideOpening
        &&
        car.position.x <
        -HALF_LENGTH +
            radius
    ) {

        const sideLimit =
            GOAL_WIDTH / 2 -
            radius;


        if (
            car.position.z >
            sideLimit
        ) {

            car.position.z =
                sideLimit;

            carVelocity.z =
                -Math.abs(
                    carVelocity.z
                ) *
                0.25;
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
                ) *
                0.25;
        }


        const back =
            -HALF_LENGTH -
            GOAL_DEPTH +
            radius;


        if (
            car.position.x <
            back
        ) {

            car.position.x =
                back;

            carVelocity.x =
                Math.abs(
                    carVelocity.x
                ) *
                0.25;
        }
    }
}


// ============================================================
// MAIN CAR PHYSICS
// ============================================================

function updateCar(
    dt
) {

    if (
        matchState ===
        MATCH_STATE.RESULTS
    ) {

        return;
    }


    if (
        goalPause
    ) {

        return;
    }


    if (
        !timerStarted
        &&
        matchState ===
            MATCH_STATE.PLAYING
    ) {

        timerStarted =
            true;
    }


    if (
        landingCooldown >
        0
    ) {

        landingCooldown -=
            dt;
    }


    // --------------------------------------------------------
    // GRAVITY ALWAYS EXISTS
    // --------------------------------------------------------

    carVelocity.y -=
        GRAVITY *
        dt;


    // --------------------------------------------------------
    // CONTACT FORCES
    // --------------------------------------------------------

    updateGroundContacts(
        dt
    );


    // --------------------------------------------------------
    // BALANCE / TOPPLING
    // --------------------------------------------------------

    applyBalanceInstability(
        dt
    );


    // --------------------------------------------------------
    // JUMP HOLD
    // --------------------------------------------------------

    updateJumpHold(
        dt
    );


    // --------------------------------------------------------
    // DRIVING OR AERIAL CONTROL
    // --------------------------------------------------------

    if (
        hasWheelContact
    ) {

        updateGroundDriving(
            dt
        );

    } else {

        updateAerialControls(
            dt
        );
    }


    // --------------------------------------------------------
    // BOOST
    // --------------------------------------------------------

    updateCarBoost(
        dt
    );


    // --------------------------------------------------------
    // INTEGRATE POSITION
    // --------------------------------------------------------

    applyCarSpeedSafety();


    car.position.addScaledVector(
        carVelocity,
        dt
    );


    // --------------------------------------------------------
    // INTEGRATE ROTATION
    // --------------------------------------------------------

    integrateOrientation(
        dt
    );


    // --------------------------------------------------------
    // ARENA
    // --------------------------------------------------------

    collideCarWithArena();


    // --------------------------------------------------------
    // WHEEL SPIN
    // --------------------------------------------------------

    getCarForward(
        tempForward
    );


    const wheelForwardSpeed =
        carVelocity.dot(
            tempForward
        );


    const wheelSpin =
        wheelForwardSpeed *
        dt *
        0.85;


    for (
        const wheel
        of wheels
    ) {

        wheel.rotation.z -=
            wheelSpin;
    }
}


// ============================================================
// CONTROLLER ONE-SHOT ACTIONS
// ============================================================

function updateControllerActions() {

    if (
        menuOpen
    ) {

        return;
    }


    if (
        controllerState.jumpPressed
        &&
        !goalPause
    ) {

        performJump();
    }


    if (
        controllerState.ballCamPressed
    ) {

        ballCam =
            !ballCam;

        cameraInitialized =
            false;
    }
}


// ============================================================
// END OF v0.6.2 PART 2 / 3
//
// DO NOT DEPLOY YET.
//
// PART 3 ADDS:
//
// - ball physics
// - goal collision
// - car/ball collision
// - scoring
// - overtime
// - goal explosions
// - celebration/result GUI
// - camera rebuild
// - HUD
// - scoreboard placeholder for R1
// - FPS limiter
// - reset/new match/free play
// - startup/main loop
//
// PASTE PART 3 DIRECTLY BELOW THIS.
// ============================================================
// ============================================================
// BOOSTBALL v0.6.2 — RIGID BODY DETENTION
// PART 3 / 3
//
// Ball physics.
// Goals.
// Match flow.
// Camera.
// HUD.
// Scoreboard placeholder.
// FPS limiter.
// Main loop.
// ============================================================


// ============================================================
// GOAL EXPLOSIONS
// ============================================================

const goalExplosionParticles = [];

const goalExplosionGeometry =
    new THREE.SphereGeometry(
        0.18,
        6,
        4
    );

function createGoalExplosion(
    x,
    colour
) {

    const material =
        new THREE.MeshBasicMaterial({
            color: colour,
            transparent: true,
            opacity: 1
        });


    for (
        let i = 0;
        i < 34;
        i++
    ) {

        const particle =
            new THREE.Mesh(
                goalExplosionGeometry,
                material.clone()
            );


        particle.position.set(
            x,
            3 + Math.random() * 4,
            (
                Math.random() -
                0.5
            ) * 15
        );


        scene.add(
            particle
        );


        const direction =
            new THREE.Vector3(

                (
                    Math.random() -
                    0.5
                ) * 15,

                4 +
                Math.random() * 10,

                (
                    Math.random() -
                    0.5
                ) * 16
            );


        if (
            x > 0
        ) {

            direction.x =
                -Math.abs(
                    direction.x
                );

        } else {

            direction.x =
                Math.abs(
                    direction.x
                );
        }


        goalExplosionParticles.push({

            mesh: particle,

            velocity: direction,

            life:
                0.8 +
                Math.random() *
                0.65
        });
    }
}


function updateGoalExplosions(
    dt
) {

    for (
        let i =
            goalExplosionParticles.length -
            1;
        i >= 0;
        i--
    ) {

        const particle =
            goalExplosionParticles[i];


        particle.life -=
            dt;


        particle.velocity.y -=
            11 * dt;


        particle.mesh.position
            .addScaledVector(
                particle.velocity,
                dt
            );


        particle.mesh.material.opacity =
            THREE.MathUtils.clamp(
                particle.life,
                0,
                1
            );


        if (
            particle.life <=
            0
        ) {

            scene.remove(
                particle.mesh
            );


            particle.mesh.material
                .dispose();


            goalExplosionParticles.splice(
                i,
                1
            );
        }
    }
}


// ============================================================
// BALL PHYSICS
// ============================================================

const BALL_GRAVITY = 21;

const BALL_FLOOR_RESTITUTION =
    0.52;

const BALL_WALL_RESTITUTION =
    0.68;

const BALL_GOAL_RESTITUTION =
    0.50;

const BALL_MAX_SPEED =
    70;


function updateBall(
    dt
) {

    ballVelocity.y -=
        BALL_GRAVITY *
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

            ballVelocity.y =
                -ballVelocity.y *
                BALL_FLOOR_RESTITUTION;


            if (
                Math.abs(
                    ballVelocity.y
                ) <
                2.4
            ) {

                ballVelocity.y =
                    0;
            }
        }


        const friction =
            Math.exp(
                -0.22 *
                dt
            );


        ballVelocity.x *=
            friction;

        ballVelocity.z *=
            friction;
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
                -BALL_WALL_RESTITUTION;
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
                -BALL_WALL_RESTITUTION;
        }
    }


    // --------------------------------------------------------
    // END WALL / GOAL OPENING
    // --------------------------------------------------------
    //
    // IMPORTANT:
    //
    // There is NO goal attraction here.
    //
    // The ball must physically fit through the opening.
    // Nothing changes Z to guide it toward the net.
    // --------------------------------------------------------

    const fitsGoalWidth =
        Math.abs(
            ball.position.z
        ) +
        BALL_RADIUS
        <
        GOAL_WIDTH / 2;


    const fitsGoalHeight =
        ball.position.y +
        BALL_RADIUS
        <
        GOAL_HEIGHT;


    const insideOpening =
        fitsGoalWidth &&
        fitsGoalHeight;


    // --------------------------------------------------------
    // SOLID END WALL OUTSIDE OPENING
    // --------------------------------------------------------

    if (
        !insideOpening
    ) {

        const positiveLimit =
            HALF_LENGTH -
            BALL_RADIUS;


        const negativeLimit =
            -HALF_LENGTH +
            BALL_RADIUS;


        if (
            ball.position.x >
            positiveLimit
        ) {

            ball.position.x =
                positiveLimit;


            if (
                ballVelocity.x >
                0
            ) {

                ballVelocity.x *=
                    -BALL_WALL_RESTITUTION;
            }
        }


        if (
            ball.position.x <
            negativeLimit
        ) {

            ball.position.x =
                negativeLimit;


            if (
                ballVelocity.x <
                0
            ) {

                ballVelocity.x *=
                    -BALL_WALL_RESTITUTION;
            }
        }
    }


    // --------------------------------------------------------
    // ORANGE GOAL INTERIOR
    // --------------------------------------------------------

    if (
        ball.position.x >
        HALF_LENGTH -
            BALL_RADIUS
        &&
        insideOpening
    ) {

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
                    -BALL_GOAL_RESTITUTION;
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
                    -BALL_GOAL_RESTITUTION;
            }
        }


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
                    -BALL_GOAL_RESTITUTION;
            }
        }


        const backLimit =
            HALF_LENGTH +
            GOAL_DEPTH -
            BALL_RADIUS;


        if (
            ball.position.x >
            backLimit
        ) {

            ball.position.x =
                backLimit;


            if (
                ballVelocity.x >
                0
            ) {

                ballVelocity.x *=
                    -BALL_GOAL_RESTITUTION;
            }
        }
    }


    // --------------------------------------------------------
    // BLUE GOAL INTERIOR
    // --------------------------------------------------------

    if (
        ball.position.x <
        -HALF_LENGTH +
            BALL_RADIUS
        &&
        insideOpening
    ) {

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
                    -BALL_GOAL_RESTITUTION;
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
                    -BALL_GOAL_RESTITUTION;
            }
        }


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
                    -BALL_GOAL_RESTITUTION;
            }
        }


        const backLimit =
            -HALF_LENGTH -
            GOAL_DEPTH +
            BALL_RADIUS;


        if (
            ball.position.x <
            backLimit
        ) {

            ball.position.x =
                backLimit;


            if (
                ballVelocity.x <
                0
            ) {

                ballVelocity.x *=
                    -BALL_GOAL_RESTITUTION;
            }
        }
    }


    // --------------------------------------------------------
    // SPEED CAP
    // --------------------------------------------------------

    if (
        ballVelocity.length() >
        BALL_MAX_SPEED
    ) {

        ballVelocity.setLength(
            BALL_MAX_SPEED
        );
    }
}


// ============================================================
// CAR / BALL COLLISION
// ============================================================

function collideCarWithBall() {

    const carCollisionRadius =
        2.55;


    tempBallDifference
        .copy(
            ball.position
        )
        .sub(
            car.position
        );


    const distance =
        tempBallDifference.length();


    const minimumDistance =
        carCollisionRadius +
        BALL_RADIUS;


    if (
        distance <=
            0.0001
        ||
        distance >=
            minimumDistance
    ) {

        return;
    }


    tempBallDifference.divideScalar(
        distance
    );


    const penetration =
        minimumDistance -
        distance;


    ball.position.addScaledVector(
        tempBallDifference,
        penetration *
            0.78
    );


    car.position.addScaledVector(
        tempBallDifference,
        -penetration *
            0.08
    );


    tempVelocity
        .copy(
            ballVelocity
        )
        .sub(
            carVelocity
        );


    const relativeNormalSpeed =
        tempVelocity.dot(
            tempBallDifference
        );


    if (
        relativeNormalSpeed <
        0
    ) {

        const impulse =
            -relativeNormalSpeed *
            1.18 +
            2.1;


        ballVelocity.addScaledVector(
            tempBallDifference,
            impulse
        );


        carVelocity.addScaledVector(
            tempBallDifference,
            -impulse *
                0.08
        );
    }


    const carSpeed =
        carVelocity.length();


    if (
        carSpeed >
        3
    ) {

        ballVelocity.addScaledVector(
            tempBallDifference,
            Math.min(
                12,
                carSpeed *
                    0.22
            )
        );
    }


    if (
        ballVelocity.length() >
        BALL_MAX_SPEED
    ) {

        ballVelocity.setLength(
            BALL_MAX_SPEED
        );
    }
}


// ============================================================
// GOAL CHECK
// ============================================================

function checkGoals() {

    if (
        goalPause
        ||
        matchState ===
            MATCH_STATE.RESULTS
        ||
        matchState ===
            MATCH_STATE.CELEBRATION
    ) {

        return;
    }


    const insideGoalWidth =
        Math.abs(
            ball.position.z
        )
        <
        (
            GOAL_WIDTH / 2 -
            BALL_RADIUS *
                0.15
        );


    const belowCrossbar =
        ball.position.y
        <
        (
            GOAL_HEIGHT -
            BALL_RADIUS *
                0.10
        );


    if (
        !insideGoalWidth
        ||
        !belowCrossbar
    ) {

        return;
    }


    if (
        ball.position.x >
        HALF_LENGTH +
            BALL_RADIUS *
                0.10
    ) {

        if (
            matchState ===
            MATCH_STATE.FREEPLAY
        ) {

            freePlayGoal(
                "BLUE"
            );

        } else {

            scoreGoal(
                "BLUE"
            );
        }


        return;
    }


    if (
        ball.position.x <
        -HALF_LENGTH -
            BALL_RADIUS *
                0.10
    ) {

        if (
            matchState ===
            MATCH_STATE.FREEPLAY
        ) {

            freePlayGoal(
                "ORANGE"
            );

        } else {

            scoreGoal(
                "ORANGE"
            );
        }
    }
}


// ============================================================
// FREE PLAY GOAL
// ============================================================

function freePlayGoal(
    team
) {

    goalPause =
        true;

    goalPauseTimer =
        1.15;


    goalText =
        `${team} GOAL!`;


    createGoalExplosion(

        team === "BLUE"
            ?
            HALF_LENGTH
            :
            -HALF_LENGTH,

        team === "BLUE"
            ?
            0x168cff
            :
            0xff7a16
    );
}


// ============================================================
// SCORE GOAL
// ============================================================

function scoreGoal(
    team
) {

    if (
        team ===
        "BLUE"
    ) {

        blueScore++;

        matchStats.goals++;

        matchStats.score +=
            100;

    } else {

        orangeScore++;
    }


    createGoalExplosion(

        team === "BLUE"
            ?
            HALF_LENGTH
            :
            -HALF_LENGTH,

        team === "BLUE"
            ?
            0x168cff
            :
            0xff7a16
    );


    // Golden goal.

    if (
        matchState ===
        MATCH_STATE.OVERTIME
    ) {

        goalText =
            `${team} WINS!`;

        endMatch(
            team
        );

        return;
    }


    goalPause =
        true;

    goalPauseTimer =
        2.25;

    goalText =
        `${team} SCORED!`;
}


// ============================================================
// MATCH TIMER
// ============================================================

function updateMatch(
    dt
) {

    if (
        matchState !==
            MATCH_STATE.PLAYING
    ) {

        return;
    }


    if (
        !timerStarted
        ||
        goalPause
        ||
        menuOpen
    ) {

        return;
    }


    gameTime -=
        dt;


    if (
        gameTime >
        0
    ) {

        return;
    }


    gameTime =
        0;


    if (
        blueScore ===
        orangeScore
    ) {

        matchState =
            MATCH_STATE.OVERTIME;

        goalText =
            "OVERTIME";

    } else {

        endMatch(

            blueScore >
                orangeScore
                ?
                "BLUE"
                :
                "ORANGE"
        );
    }
}


// ============================================================
// GOAL PAUSE
// ============================================================

function updateGoalPause(
    dt
) {

    if (
        !goalPause
    ) {

        return;
    }


    goalPauseTimer -=
        dt;


    if (
        goalPauseTimer >
        0
    ) {

        return;
    }


    goalPause =
        false;

    goalText =
        "";


    resetKickoff();
}


// ============================================================
// END MATCH
// ============================================================

function endMatch(
    team
) {

    winningTeam =
        team;


    matchState =
        MATCH_STATE.CELEBRATION;


    celebrationTimer =
        CELEBRATION_DURATION;


    goalPause =
        false;


    if (
        team === "BLUE"
    ) {

        matchResult =
            "BLUE WINS";

    } else {

        matchResult =
            "ORANGE WINS";
    }


    showCelebration();
}


// ============================================================
// CELEBRATION
// ============================================================

function updateCelebration(
    dt
) {

    if (
        matchState !==
            MATCH_STATE.CELEBRATION
    ) {

        return;
    }


    celebrationTimer -=
        dt;


    if (
        celebrationTimer <=
        0
    ) {

        celebrationTimer =
            0;


        matchState =
            MATCH_STATE.RESULTS;


        hideCelebration();

        showResults();
    }
}


// ============================================================
// RESET BOOST PADS
// ============================================================

function resetBoostPads() {

    for (
        const pad
        of boostPads
    ) {

        pad.active =
            true;

        pad.pickup.visible =
            true;

        pad.respawnTimer =
            0;
    }
}


// ============================================================
// RESET KICKOFF
// ============================================================

function resetKickoff() {

    car.position.set(
        -35,
        1.12,
        0
    );


    carVelocity.set(
        0,
        0,
        0
    );


    angularVelocity.set(
        0,
        0,
        0
    );


    car.quaternion.identity();


    carRotation =
        0;


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


    jumpHeldTime =
        0;

    firstJumpUsed =
        false;

    secondJumpUsed =
        false;


    wheelContactCount =
        4;

    chassisContactCount =
        0;

    hasWheelContact =
        true;

    hasAnyGroundContact =
        true;


    landingCooldown =
        0;


    if (
        matchState ===
        MATCH_STATE.FREEPLAY
    ) {

        boostAmount =
            100;

    } else {

        boostAmount =
            33;
    }


    goalPause =
        false;

    goalPauseTimer =
        0;

    goalText =
        "";


    cameraInitialized =
        false;
}


// ============================================================
// NEW MATCH
// ============================================================

function startNewMatch() {

    hideResults();

    hideCelebration();


    matchState =
        MATCH_STATE.PLAYING;


    blueScore =
        0;

    orangeScore =
        0;


    gameTime =
        300;


    timerStarted =
        false;


    winningTeam =
        null;

    matchResult =
        "";


    celebrationTimer =
        0;


    resetMatchStats();

    resetBoostPads();

    resetKickoff();
}


// ============================================================
// FREE PLAY
// ============================================================

function startFreePlay() {

    hideResults();

    hideCelebration();


    matchState =
        MATCH_STATE.FREEPLAY;


    blueScore =
        0;

    orangeScore =
        0;


    gameTime =
        300;


    timerStarted =
        false;


    winningTeam =
        null;

    matchResult =
        "";


    resetBoostPads();

    resetKickoff();


    boostAmount =
        100;
}


// ============================================================
// HUD
// ============================================================

const oldHud =
    document.getElementById(
        "hud"
    );


if (
    oldHud
) {

    oldHud.style.display =
        "none";
}


const gameHud =
    document.createElement(
        "div"
    );


gameHud.style.cssText = `
    position:fixed;
    inset:0;
    z-index:20;
    pointer-events:none;
    font-family:Arial,sans-serif;
    color:white;
`;


document.body.appendChild(
    gameHud
);


const scoreHud =
    document.createElement(
        "div"
    );


scoreHud.style.cssText = `
    position:absolute;
    top:18px;
    left:50%;
    transform:translateX(-50%);

    display:flex;
    align-items:center;
    gap:15px;

    padding:9px 15px;

    border-radius:9px;

    background:
        rgba(0,0,0,0.46);

    font-weight:bold;
`;


gameHud.appendChild(
    scoreHud
);


const boostHud =
    document.createElement(
        "div"
    );


boostHud.style.cssText = `
    position:absolute;
    right:25px;
    bottom:25px;

    width:92px;
    height:92px;

    display:flex;
    align-items:center;
    justify-content:center;

    border-radius:50%;

    background:
        rgba(0,0,0,0.48);

    border:
        3px solid
        rgba(255,255,255,0.25);

    font-size:27px;
    font-weight:900;
`;


gameHud.appendChild(
    boostHud
);


const cameraHud =
    document.createElement(
        "div"
    );


cameraHud.style.cssText = `
    position:absolute;
    left:18px;
    bottom:18px;

    padding:7px 10px;

    border-radius:7px;

    background:
        rgba(0,0,0,0.40);

    font-size:12px;
    opacity:0.8;
`;


gameHud.appendChild(
    cameraHud
);


const goalHud =
    document.createElement(
        "div"
    );


goalHud.style.cssText = `
    position:absolute;
    left:50%;
    top:33%;
    transform:
        translate(-50%,-50%);

    font-size:
        clamp(30px,6vw,70px);

    font-weight:900;

    text-shadow:
        0 3px 14px black;

    letter-spacing:4px;
`;


gameHud.appendChild(
    goalHud
);


const performanceHud =
    document.createElement(
        "div"
    );


performanceHud.style.cssText = `
    position:absolute;
    right:10px;
    top:10px;

    font-size:11px;

    opacity:0.58;

    text-align:right;
`;


gameHud.appendChild(
    performanceHud
);


// ============================================================
// SCOREBOARD OVERLAY
// ============================================================
//
// v0.7 will replace this with the actual multiplayer board.
//
// R1 defaults to this action and remains remappable.
// ============================================================

const scoreboardOverlay =
    document.createElement(
        "div"
    );


scoreboardOverlay.style.cssText = `
    position:fixed;
    z-index:60;

    left:50%;
    top:18%;

    transform:
        translateX(-50%);

    width:min(650px,85vw);

    padding:18px;

    border-radius:12px;

    background:
        rgba(4,8,16,0.88);

    border:
        1px solid
        rgba(255,255,255,0.12);

    color:white;

    font-family:
        Arial,sans-serif;

    display:none;

    pointer-events:none;
`;


document.body.appendChild(
    scoreboardOverlay
);


function updateScoreboard() {

    const keyboardScoreboard =
        false;


    const visible =
        (
            controllerState.scoreboard
            ||
            keyboardScoreboard
        )
        &&
        !menuOpen;


    scoreboardOverlay.style.display =
        visible
            ?
            "block"
            :
            "none";


    if (
        !visible
    ) {

        return;
    }


    scoreboardOverlay.innerHTML = `

        <div
            style="
                font-size:18px;
                font-weight:900;
                margin-bottom:12px;
                letter-spacing:1px;
            "
        >
            MATCH SCOREBOARD
        </div>

        <div
            style="
                display:grid;
                grid-template-columns:
                    1fr auto auto auto;
                gap:8px 18px;
                font-size:14px;
            "
        >

            <strong>Player</strong>
            <strong>Goals</strong>
            <strong>Score</strong>
            <strong>Ping</strong>

            <span
                style="
                    color:#65b6ff;
                "
            >
                You
            </span>

            <span>
                ${matchStats.goals}
            </span>

            <span>
                ${matchStats.score}
            </span>

            <span>
                —
            </span>

        </div>

        <div
            style="
                margin-top:13px;
                opacity:0.48;
                font-size:11px;
            "
        >
            Multiplayer player rows arrive in v0.7.
        </div>
    `;
}


// ============================================================
// UPDATE HUD
// ============================================================

function formatTime(
    seconds
) {

    const safe =
        Math.max(
            0,
            seconds
        );


    const minutes =
        Math.floor(
            safe / 60
        );


    const secs =
        Math.floor(
            safe % 60
        );


    return (
        `${minutes}:` +
        `${secs}`
            .padStart(
                2,
                "0"
            )
    );
}


function updateHUD() {

    const timeText =
        matchState ===
        MATCH_STATE.OVERTIME
            ?
            "OT"
            :
            formatTime(
                gameTime
            );


    scoreHud.innerHTML = `

        <span
            style="
                color:#55aaff;
                font-size:24px;
            "
        >
            ${blueScore}
        </span>

        <span
            style="
                font-size:16px;
                min-width:50px;
                text-align:center;
            "
        >
            ${timeText}
        </span>

        <span
            style="
                color:#ff962e;
                font-size:24px;
            "
        >
            ${orangeScore}
        </span>
    `;


    boostHud.textContent =
        Math.round(
            boostAmount
        );


    cameraHud.textContent =
        ballCam
            ?
            "BALL CAM"
            :
            "CAR CAM";


    goalHud.textContent =
        goalText;


    updateScoreboard();
}


// ============================================================
// RESULTS GUI
// ============================================================

const resultsScreen =
    document.createElement(
        "div"
    );


resultsScreen.style.cssText = `
    position:fixed;
    inset:0;
    z-index:90;

    display:none;

    align-items:center;
    justify-content:center;

    background:
        rgba(2,5,12,0.80);

    backdrop-filter:
        blur(8px);

    color:white;

    font-family:
        Arial,sans-serif;
`;


document.body.appendChild(
    resultsScreen
);


function showResults() {

    resultsScreen.style.display =
        "flex";


    resultsScreen.innerHTML = `

        <div
            style="
                width:min(600px,88vw);

                padding:30px;

                border-radius:16px;

                background:
                    rgba(7,14,28,0.94);

                border:
                    1px solid
                    rgba(255,255,255,0.12);

                text-align:center;
            "
        >

            <div
                style="
                    opacity:0.58;
                    letter-spacing:3px;
                    font-size:12px;
                "
            >
                FINAL
            </div>


            <div
                style="
                    margin-top:8px;

                    font-size:
                        clamp(34px,7vw,64px);

                    font-weight:900;
                "
            >
                ${matchResult}
            </div>


            <div
                style="
                    margin-top:18px;
                    font-size:28px;
                "
            >
                <span
                    style="
                        color:#55aaff;
                    "
                >
                    ${blueScore}
                </span>

                &nbsp;—&nbsp;

                <span
                    style="
                        color:#ff962e;
                    "
                >
                    ${orangeScore}
                </span>
            </div>


            <div
                style="
                    margin:24px 0;

                    display:grid;
                    grid-template-columns:
                        repeat(2,1fr);

                    gap:10px;

                    text-align:left;
                "
            >

                <div
                    style="
                        padding:12px;
                        background:
                            rgba(255,255,255,0.05);
                        border-radius:8px;
                    "
                >
                    Goals
                    <strong
                        style="
                            float:right;
                        "
                    >
                        ${matchStats.goals}
                    </strong>
                </div>


                <div
                    style="
                        padding:12px;
                        background:
                            rgba(255,255,255,0.05);
                        border-radius:8px;
                    "
                >
                    Score
                    <strong
                        style="
                            float:right;
                        "
                    >
                        ${matchStats.score}
                    </strong>
                </div>

            </div>


            <button
                id="playAgainButton"

                style="
                    padding:12px 20px;
                    margin:5px;

                    border:0;
                    border-radius:8px;

                    background:#168cff;
                    color:white;

                    font-weight:bold;
                    cursor:pointer;
                "
            >
                Play Again
            </button>


            <button
                id="freePlayButton"

                style="
                    padding:12px 20px;
                    margin:5px;

                    border:
                        1px solid
                        rgba(255,255,255,0.18);

                    border-radius:8px;

                    background:
                        rgba(255,255,255,0.08);

                    color:white;

                    font-weight:bold;
                    cursor:pointer;
                "
            >
                Free Play
            </button>


            <div
                style="
                    margin-top:17px;
                    opacity:0.42;
                    font-size:11px;
                "
            >
                BOOSTBALL ${GAME_VERSION}
            </div>

        </div>
    `;


    document
        .getElementById(
            "playAgainButton"
        )
        .addEventListener(
            "click",
            startNewMatch
        );


    document
        .getElementById(
            "freePlayButton"
        )
        .addEventListener(
            "click",
            startFreePlay
        );
}


function hideResults() {

    resultsScreen.style.display =
        "none";
}


// ============================================================
// CELEBRATION GUI
// ============================================================

const celebrationBanner =
    document.createElement(
        "div"
    );


celebrationBanner.style.cssText = `
    position:fixed;

    left:50%;
    top:24%;

    transform:
        translate(-50%,-50%);

    z-index:70;

    display:none;

    color:white;

    font:
        900 clamp(34px,7vw,76px)
        Arial,sans-serif;

    letter-spacing:4px;

    text-shadow:
        0 4px 18px black;

    pointer-events:none;
`;


document.body.appendChild(
    celebrationBanner
);


function showCelebration() {

    celebrationBanner.style.display =
        "block";


    celebrationBanner.textContent =
        matchResult;
}


function hideCelebration() {

    celebrationBanner.style.display =
        "none";
}


// ============================================================
// CAMERA STATE
// ============================================================

const ballCamDirection =
    new THREE.Vector3(
        1,
        0,
        0
    );


const previousBallCamDirection =
    new THREE.Vector3(
        1,
        0,
        0
    );


// ============================================================
// CAMERA UPDATE
// ============================================================

function updateCamera(
    dt
) {

    getCarForward(
        tempForward
    );


    // Camera ignores roll/pitch when finding horizontal behind.

    tempForward.y =
        0;


    if (
        tempForward.lengthSq() <
        0.001
    ) {

        tempForward.set(
            Math.cos(
                carRotation
            ),
            0,
            Math.sin(
                carRotation
            )
        );

    } else {

        tempForward.normalize();


        carRotation =
            Math.atan2(
                tempForward.z,
                tempForward.x
            );
    }


    // --------------------------------------------------------
    // BALL CAM
    // --------------------------------------------------------

    if (
        ballCam
    ) {

        tempCarToBall
            .copy(
                ball.position
            )
            .sub(
                car.position
            );


        tempCarToBall.y =
            0;


        const ballDistance =
            tempCarToBall.length();


        if (
            ballDistance >
            1.25
        ) {

            tempCarToBall.divideScalar(
                ballDistance
            );


            ballCamDirection
                .copy(
                    tempForward
                )
                .multiplyScalar(
                    0.28
                )
                .addScaledVector(
                    tempCarToBall,
                    0.72
                );


            if (
                ballCamDirection.lengthSq() >
                0.001
            ) {

                ballCamDirection.normalize();
            }
        }


        if (
            previousBallCamDirection.dot(
                ballCamDirection
            ) <
            -0.55
        ) {

            ballCamDirection
                .addScaledVector(
                    previousBallCamDirection,
                    0.8
                )
                .normalize();
        }


        const directionBlend =
            1 -
            Math.exp(
                -10 *
                dt
            );


        previousBallCamDirection
            .lerp(
                ballCamDirection,
                directionBlend
            )
            .normalize();


        const distance =
            THREE.MathUtils.clamp(
                12.5 +
                ballDistance *
                    0.025,
                12.5,
                15
            );


        tempCameraPosition
            .copy(
                car.position
            )
            .addScaledVector(
                previousBallCamDirection,
                -distance
            );


        tempCameraPosition.y +=
            6.6;


        tempCameraLook
            .copy(
                ball.position
            )
            .multiplyScalar(
                0.91
            )
            .addScaledVector(
                car.position,
                0.09
            );


        tempCameraLook.y +=
            0.35;

    } else {

        // ----------------------------------------------------
        // CAR CAM
        // ----------------------------------------------------

        tempCameraPosition
            .copy(
                car.position
            )
            .addScaledVector(
                tempForward,
                -13
            );


        tempCameraPosition.y +=
            6.8;


        tempCameraLook
            .copy(
                car.position
            )
            .addScaledVector(
                tempForward,
                4.5
            );


        tempCameraLook.y +=
            1.15;
    }


    if (
        !cameraInitialized
    ) {

        camera.position.copy(
            tempCameraPosition
        );


        cameraLookTarget.copy(
            tempCameraLook
        );


        cameraInitialized =
            true;

    } else {

        const positionBlend =
            1 -
            Math.exp(
                -8.5 *
                dt
            );


        const lookBlend =
            1 -
            Math.exp(
                -11 *
                dt
            );


        camera.position.lerp(
            tempCameraPosition,
            positionBlend
        );


        cameraLookTarget.lerp(
            tempCameraLook,
            lookBlend
        );
    }


    camera.lookAt(
        cameraLookTarget
    );
}


// ============================================================
// PERFORMANCE DISPLAY
// ============================================================

let diagnosticFrames =
    0;

let diagnosticTime =
    0;

let displayedFPS =
    0;


function updatePerformanceDisplay(
    dt
) {

    diagnosticFrames++;

    diagnosticTime +=
        dt;


    if (
        diagnosticTime >=
        0.5
    ) {

        displayedFPS =
            Math.round(
                diagnosticFrames /
                diagnosticTime
            );


        diagnosticFrames =
            0;

        diagnosticTime =
            0;
    }


    performanceHud.textContent =
        `${displayedFPS} FPS · ${GRAPHICS_PRESETS[graphicsPreset].label}`;
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


        cameraInitialized =
            false;
    }
);


// ============================================================
// FRAME CLOCK
// ============================================================

let previousFrameTime =
    null;

let previousRenderTime =
    null;


function resetFrameClock() {

    previousFrameTime =
        null;

    previousRenderTime =
        null;

    diagnosticFrames =
        0;

    diagnosticTime =
        0;
}


// ============================================================
// MAIN LOOP
// ============================================================

function animate(
    timestamp
) {

    requestAnimationFrame(
        animate
    );


    if (
        document.hidden
    ) {

        resetFrameClock();

        return;
    }


    const preset =
        GRAPHICS_PRESETS[
            graphicsPreset
        ];


    const frameInterval =
        1000 /
        preset.fps;


    if (
        previousRenderTime ===
        null
    ) {

        previousRenderTime =
            timestamp;

        previousFrameTime =
            timestamp;


        updateController();

        updateCamera(
            1 / preset.fps
        );

        updateHUD();

        updateMenu();

        renderer.render(
            scene,
            camera
        );

        return;
    }


    const renderElapsed =
        timestamp -
        previousRenderTime;


    if (
        renderElapsed <
        frameInterval -
            0.5
    ) {

        return;
    }


    previousRenderTime =
        timestamp -
        (
            renderElapsed %
            frameInterval
        );


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


    // --------------------------------------------------------
    // INPUT
    // --------------------------------------------------------

    updateController();


    if (
        controllerRebindingAction
    ) {

        updateMenu();
    }


    updateControllerActions();


    // --------------------------------------------------------
    // GAMEPLAY
    // --------------------------------------------------------

    if (
        !menuOpen
    ) {

        if (
            !goalPause
            &&
            matchState !==
                MATCH_STATE.RESULTS
        ) {

            updateCar(
                dt
            );


            updateBall(
                dt
            );


            collideCarWithBall();


            if (
                matchState !==
                MATCH_STATE.FREEPLAY
            ) {

                updateBoostPads(
                    dt
                );
            }


            checkGoals();
        }


        updateMatch(
            dt
        );


        updateGoalPause(
            dt
        );


        updateCelebration(
            dt
        );
    }


    // --------------------------------------------------------
    // EFFECTS
    // --------------------------------------------------------

    updateGoalExplosions(
        dt
    );


    // --------------------------------------------------------
    // CAMERA / UI
    // --------------------------------------------------------

    updateCamera(
        dt
    );


    updateHUD();


    updatePerformanceDisplay(
        dt
    );


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


cameraLookTarget.copy(
    car.position
);


previousBallCamDirection.set(
    1,
    0,
    0
);


ballCamDirection.set(
    1,
    0,
    0
);


updateController();

updateHUD();

updateMenu();


requestAnimationFrame(
    animate
);


// ============================================================
// BOOSTBALL v0.6.2 — RIGID BODY DETENTION
//
// COMPLETE.
//
// Main test targets:
//
// 1. Version badge says v0.6.2.
// 2. DualSense is detected.
// 3. TAB -> Controller -> click binding -> press button.
// 4. Controller mapping survives reload.
// 5. W / stick forward pitches nose DOWN.
// 6. S / stick backward pitches nose UP.
// 7. Normal ground speed still feels like v0.6.
// 8. Car no longer floats above the field.
// 9. Nose/side/roof contact causes physical toppling.
// 10. No automatic upright snap.
// 11. Double jump works.
// 12. Directional dodge works.
// 13. Ball remains 2.6 radius.
// 14. Goal doesn't magnetise the ball.
// 15. R1 displays temporary scoreboard by default.
//
// v0.7:
// Lobbies.
// Multiplayer.
// Proper live scoreboard.
// Player names.
// Ping.
// Goals / assists / saves / shots.
// ============================================================
// PASTE PART 2 DIRECTLY BELOW THIS.
// ============================================================
