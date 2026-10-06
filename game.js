// ============================================================
// BOOSTBALL v0.6.3 — TRACTION CONTROL
//
// PART 1 / 4
//
// - Performance-focused handling rebuild.
// - Stronger ground traction.
// - Larger arena.
// - Controller hot-plug support.
// - Expanded DualSense controls.
// - Optional live controller visualiser.
// - Top-centre scoreboard.
// - Better aerial / dodge foundation.
// - Original engine speeds preserved.
//
// DO NOT RUN YET.
// PARTS 2, 3 AND 4 GO DIRECTLY BELOW THIS.
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// VERSION
// ============================================================

const GAME_VERSION = "v0.6.3";
const GAME_CODENAME = "TRACTION CONTROL";


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
        170,
        285
    );


// ============================================================
// VERSION BADGE
// ============================================================

const versionBadge =
    document.createElement("div");

versionBadge.textContent =
    `BOOSTBALL · ${GAME_VERSION}`;

versionBadge.title =
    GAME_CODENAME;

versionBadge.style.cssText = `
    position:fixed;
    top:10px;
    left:12px;
    z-index:100;

    padding:6px 9px;

    border-radius:7px;

    background:
        rgba(0,0,0,0.42);

    border:
        1px solid
        rgba(255,255,255,0.10);

    color:
        rgba(255,255,255,0.78);

    font:
        12px Arial,
        sans-serif;

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
    "boostball-graphics-v063";

const GRAPHICS_PRESETS = {

    performance: {
        label: "Performance",
        pixelRatio: 0.65,
        shadows: false,
        fps: 30
    },

    balanced: {
        label: "Balanced",
        pixelRatio: 0.82,
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
        2.6
    );


sun.position.set(
    -45,
    85,
    40
);


sun.castShadow =
    true;


sun.shadow.mapSize.set(
    768,
    768
);


sun.shadow.camera.left =
    -110;

sun.shadow.camera.right =
    110;

sun.shadow.camera.top =
    75;

sun.shadow.camera.bottom =
    -75;

sun.shadow.camera.near =
    1;

sun.shadow.camera.far =
    220;


scene.add(
    sun
);


// ============================================================
// ARENA
// ============================================================
//
// v0.6.2:
// 154 x 92
//
// v0.6.3:
// 190 x 112
//
// Car speed is NOT increased to compensate.
// The field is genuinely larger.
// ============================================================

const FIELD_LENGTH = 190;
const FIELD_WIDTH = 112;

const HALF_LENGTH =
    FIELD_LENGTH / 2;

const HALF_WIDTH =
    FIELD_WIDTH / 2;


const WALL_HEIGHT = 16;


const GOAL_WIDTH = 31;
const GOAL_HEIGHT = 14;
const GOAL_DEPTH = 13;


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
        opacity: 0.68
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


// Centre line.

createFieldLine(
    0.22,
    FIELD_WIDTH,
    0,
    0
);


// Goal-area markings.

createFieldLine(
    0.18,
    GOAL_WIDTH + 12,
    HALF_LENGTH - 22,
    0
);


createFieldLine(
    0.18,
    GOAL_WIDTH + 12,
    -HALF_LENGTH + 22,
    0
);


// ============================================================
// CENTRE CIRCLE
// ============================================================

const circlePoints = [];

const circleRadius = 11;


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
            opacity: 0.68
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

        side:
            THREE.DoubleSide,

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


// ============================================================
// END WALLS
// ============================================================

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

            color:
                colour,

            transparent:
                true,

            opacity:
                0.11,

            side:
                THREE.DoubleSide,

            depthWrite:
                false
        });


    const postMaterial =
        new THREE.MeshStandardMaterial({

            color:
                colour,

            roughness:
                0.4,

            metalness:
                0.2
        });


    // --------------------------------------------------------
    // BACK
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // ROOF
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // GOAL SIDE WALLS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // POSTS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // CROSSBAR
    // --------------------------------------------------------

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
// CAR
// ============================================================

const car =
    new THREE.Group();


scene.add(
    car
);


// ============================================================
// CAR BODY
// ============================================================

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


// IMPORTANT:
//
// Wheel radius = 0.55.
//
// Wheel centres are at local Y = 0.
//
// Car's grounded world Y will therefore be 0.55.
//
// Body is placed relative to that.
//
// This removes the visual floating gap from v0.6.2.

body.position.y =
    0.40;


body.castShadow =
    true;


body.receiveShadow =
    true;


car.add(
    body
);


// ============================================================
// NOSE
// ============================================================

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
    0.23,
    0
);


nose.castShadow =
    true;


car.add(
    nose
);


// ============================================================
// CABIN
// ============================================================

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
    1.20,
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


const WHEEL_RADIUS =
    0.55;


const wheelGeometry =
    new THREE.CylinderGeometry(
        WHEEL_RADIUS,
        WHEEL_RADIUS,
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


    // Wheel centre is exactly one wheel radius
    // above the field when car.position.y =
    // GROUNDED_CAR_HEIGHT.

    wheel.position.set(
        x,
        0,
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


const GROUNDED_CAR_HEIGHT =
    WHEEL_RADIUS;


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
// SACRED ENGINE NUMBERS
// ============================================================
//
// These are the v0.6 / v0.6.2 values.
//
// DO.
// NOT.
// TOUCH.
//
// v0.6.3 changes traction and control response,
// NOT the car's intended straight-line speed.
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
// v0.6.3 HANDLING CONSTANTS
// ============================================================
//
// The old rigid-body contact system is being removed.
//
// Instead:
// - translation stays simple,
// - gravity stays real,
// - orientation is controlled,
// - ground traction is deliberately game-like.
//
// This should be cheaper AND more responsive.
// ============================================================

const GRAVITY =
    27;


// Stronger lateral tyre correction.
//
// This does NOT alter forward top speed.

const GROUND_LATERAL_GRIP =
    15.5;


const GROUND_LATERAL_GRIP_SLIDE =
    2.15;


// How quickly the car settles into its intended
// ground direction.

const GROUND_FORWARD_RESPONSE =
    9.5;


// Ground steering response multiplier.
//
// Again: this doesn't increase the constants above.
// It reduces the sluggishness introduced in v0.6.2.

const STEERING_RESPONSE =
    1.16;


// ============================================================
// AERIAL CONSTANTS
// ============================================================

const AIR_PITCH_SPEED =
    3.15;


const AIR_YAW_SPEED =
    2.55;


const AIR_ROLL_SPEED =
    3.45;


const AIR_ROTATION_RESPONSE =
    9.5;


// ============================================================
// JUMP
// ============================================================

const JUMP_IMPULSE =
    13.5;


const JUMP_HOLD_FORCE =
    18;


const JUMP_HOLD_TIME =
    0.20;


const DOUBLE_JUMP_IMPULSE =
    10.5;


// ============================================================
// DODGE / FLIP
// ============================================================

const DODGE_HORIZONTAL_IMPULSE =
    18;


const DODGE_VERTICAL_IMPULSE =
    5.5;


// How long the flip animation/control lock lasts.

const DODGE_DURATION =
    0.58;


// Normal aerial controls don't immediately fight
// the dodge.

const DODGE_INPUT_LOCK_TIME =
    0.43;


// Rotation speed of visual dodge.

const DODGE_ROTATION_SPEED =
    Math.PI * 2.15;


// Opposite pitch during a forward/backward dodge
// can cancel the rotational portion.

const FLIP_CANCEL_STRENGTH =
    8.5;


// ============================================================
// RECOVERY
// ============================================================
//
// If the car is on its roof/side and touching the
// ground, Jump helps roll it upright.
// ============================================================

const RECOVERY_ROLL_SPEED =
    5.8;


const RECOVERY_POP =
    5.3;


// ============================================================
// CAR STATE
// ============================================================

const carVelocity =
    new THREE.Vector3();


let verticalVelocity =
    0;


let carRotation =
    0;


let boostAmount =
    33;


let grounded =
    true;


let groundContact =
    true;


let jumpHeldTime =
    0;


let firstJumpUsed =
    false;


let secondJumpUsed =
    false;


// ============================================================
// AIR ROTATION STATE
// ============================================================

let airPitchVelocity =
    0;


let airYawVelocity =
    0;


let airRollVelocity =
    0;


// ============================================================
// DODGE STATE
// ============================================================

let dodgeActive =
    false;


let dodgeTimer =
    0;


let dodgePitchDirection =
    0;


let dodgeSideDirection =
    0;


let dodgeRotationRemaining =
    0;


let flipCancelled =
    false;


// ============================================================
// ORIENTATION
// ============================================================

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


const WORLD_UP =
    new THREE.Vector3(
        0,
        1,
        0
    );


const tempQuaternion =
    new THREE.Quaternion();


const tempQuaternion2 =
    new THREE.Quaternion();


const tempEuler =
    new THREE.Euler(
        0,
        0,
        0,
        "YXZ"
    );


// ============================================================
// SCRATCH VECTORS
// ============================================================
//
// Reused every frame.
//
// v0.6.2 created a lot more temporary physics
// objects during its contact calculations.
// ============================================================

const tempForward =
    new THREE.Vector3();


const tempFlatForward =
    new THREE.Vector3();


const tempRight =
    new THREE.Vector3();


const tempUp =
    new THREE.Vector3();


const tempVelocity =
    new THREE.Vector3();


const tempDirection =
    new THREE.Vector3();


const tempHorizontal =
    new THREE.Vector3();


const tempBallDifference =
    new THREE.Vector3();


const tempCarToBall =
    new THREE.Vector3();


const tempCameraPosition =
    new THREE.Vector3();


const tempCameraLook =
    new THREE.Vector3();


const tempAxis =
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

    throttle:
        "w",

    reverse:
        "s",

    left:
        "a",

    right:
        "d",

    jump:
        " ",

    boost:
        "shift",

    powerslide:
        "control",

    ballCam:
        "c",

    airRollLeft:
        "q",

    airRollRight:
        "e",

    scoreboard:
        "b",

    reset:
        "r",

    menu:
        "tab"
};


const CONTROL_STORAGE_KEY =
    "boostball-controls-v063";


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
// CONTROLLER DEFAULTS
// ============================================================
//
// YOUR DUALSENSE LAYOUT:
//
// Cross       = Jump
// Square      = Scoreboard
// Triangle    = Ball Cam
// Circle      = currently unassigned
//
// L1          = Air Roll Left
//
// R1          = Powerslide
//             + Air Roll Right
//
// L2          = Brake / Reverse
// R2          = Accelerate
//
// Options     = Menu
//
// D-pad 12-15 deliberately reserved for Quick Chat.
//
// Boost is currently UNBOUND by default.
// It can be assigned in Settings.
//
// This is intentional because the requested physical
// layout did not specify a boost button.
// ============================================================

const DEFAULT_CONTROLLER_BINDINGS = {

    jump:
        0,

    scoreboard:
        2,

    ballCam:
        3,

    powerslide:
        5,

    airRollRight:
        5,

    airRollLeft:
        4,

    reverse:
        6,

    throttle:
        7,

    menu:
        9,

    reset:
        10,

    boost:
        null
};


const CONTROLLER_STORAGE_KEY =
    "boostball-controller-v063";


const controllerBindings = {
    ...DEFAULT_CONTROLLER_BINDINGS
};


// ============================================================
// LOAD CONTROLLER BINDINGS
// ============================================================

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

            const value =
                saved[action];


            if (
                Number.isInteger(
                    value
                )
                ||
                value === null
            ) {

                controllerBindings[
                    action
                ] =
                    value;
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

    0:
        "Cross",

    1:
        "Circle",

    2:
        "Square",

    3:
        "Triangle",

    4:
        "L1",

    5:
        "R1",

    6:
        "L2",

    7:
        "R2",

    8:
        "Create",

    9:
        "Options",

    10:
        "L3",

    11:
        "R3",

    12:
        "D-Pad Up",

    13:
        "D-Pad Down",

    14:
        "D-Pad Left",

    15:
        "D-Pad Right"
};


function readableControllerButton(
    index
) {

    if (
        index === null
        ||
        index === undefined
    ) {

        return "UNBOUND";
    }


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

    connected:
        false,

    index:
        null,

    id:
        "",

    mapping:
        "",

    buttonCount:
        0,

    axisCount:
        0,

    steerX:
        0,

    steerY:
        0,

    throttle:
        0,

    reverse:
        0,

    jump:
        false,

    jumpPressed:
        false,

    boost:
        false,

    powerslide:
        false,

    ballCam:
        false,

    ballCamPressed:
        false,

    scoreboard:
        false,

    airRollLeft:
        false,

    airRollRight:
        false,

    menu:
        false,

    menuPressed:
        false,

    reset:
        false,

    resetPressed:
        false
};


const GAMEPAD_DEADZONE =
    0.14;


let previousControllerButtons =
    [];


// ============================================================
// CONTROLLER HOT-PLUG STATE
// ============================================================
//
// IMPORTANT:
//
// v0.6.2 could work after reloading because the browser
// had already exposed the controller by startup.
//
// v0.6.3 NEVER relies solely on the connection event.
//
// navigator.getGamepads() is polled continuously.
//
// If a controller appears after the game has already loaded,
// it can be selected without refreshing the page.
// ============================================================

let preferredGamepadIndex =
    null;


let lastGamepadScan =
    0;


let controllerNotice =
    "";


// ============================================================
// CONTROLLER REMAPPING STATE
// ============================================================

let controllerRebindingAction =
    null;


const controllerRebindBlockedButtons =
    new Set();


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


// ============================================================
// PHYSICAL GAMEPAD ACTIVITY
// ============================================================

function gamepadHasActivity(
    gamepad
) {

    if (
        !gamepad
    ) {

        return false;
    }


    for (
        let i = 0;
        i < gamepad.buttons.length;
        i++
    ) {

        const button =
            gamepad.buttons[i];


        if (
            button.pressed
            ||
            button.value >
                0.18
        ) {

            return true;
        }
    }


    for (
        let i = 0;
        i < gamepad.axes.length;
        i++
    ) {

        if (
            Math.abs(
                gamepad.axes[i]
            ) >
            0.20
        ) {

            return true;
        }
    }


    return false;
}


// ============================================================
// ACTIVE GAMEPAD SEARCH
// ============================================================

function getActiveGamepad() {

    if (
        !navigator.getGamepads
    ) {

        return null;
    }


    const gamepads =
        navigator.getGamepads();


    // --------------------------------------------------------
    // KEEP CURRENT CONTROLLER IF IT STILL EXISTS
    // --------------------------------------------------------

    if (
        preferredGamepadIndex !==
            null
    ) {

        const preferred =
            gamepads[
                preferredGamepadIndex
            ];


        if (
            preferred
            &&
            preferred.connected
        ) {

            return preferred;
        }


        preferredGamepadIndex =
            null;
    }


    // --------------------------------------------------------
    // FIRST TRY TO FIND THE CONTROLLER BEING USED RIGHT NOW
    // --------------------------------------------------------

    let fallback =
        null;


    for (
        let i = 0;
        i < gamepads.length;
        i++
    ) {

        const gamepad =
            gamepads[i];


        if (
            !gamepad
            ||
            !gamepad.connected
        ) {

            continue;
        }


        if (
            fallback ===
            null
        ) {

            fallback =
                gamepad;
        }


        if (
            gamepadHasActivity(
                gamepad
            )
        ) {

            preferredGamepadIndex =
                gamepad.index;


            return gamepad;
        }
    }


    // --------------------------------------------------------
    // CONNECTED BUT IDLE
    // --------------------------------------------------------

    if (
        fallback
    ) {

        preferredGamepadIndex =
            fallback.index;


        return fallback;
    }


    return null;
}


// ============================================================
// BUTTON VALUE
// ============================================================

function buttonValue(
    gamepad,
    index
) {

    if (
        index === null
        ||
        index === undefined
    ) {

        return 0;
    }


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


// ============================================================
// BUTTON HELD
// ============================================================

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
// RAW BUTTON EDGE
// ============================================================

function rawButtonPressed(
    gamepad,
    index
) {

    if (
        !gamepad?.buttons?.[
            index
        ]
    ) {

        return false;
    }


    const now =
        gamepad.buttons[
            index
        ].pressed
        ||
        gamepad.buttons[
            index
        ].value >
            0.55;


    const before =
        previousControllerButtons[
            index
        ] === true;


    return (
        now &&
        !before
    );
}


// ============================================================
// CONTROLLER VISUALISER SETTING
// ============================================================

const CONTROLLER_DISPLAY_STORAGE_KEY =
    "boostball-controller-display-v063";


let controllerDisplayEnabled =
    localStorage.getItem(
        CONTROLLER_DISPLAY_STORAGE_KEY
    ) !== "off";


function setControllerDisplayEnabled(
    enabled
) {

    controllerDisplayEnabled =
        !!enabled;


    localStorage.setItem(

        CONTROLLER_DISPLAY_STORAGE_KEY,

        controllerDisplayEnabled
            ? "on"
            : "off"
    );


    updateControllerDisplayVisibility();
}


// ============================================================
// CONTROLLER VISUALISER ROOT
// ============================================================
//
// This represents PHYSICAL controller input,
// not gameplay bindings.
//
// Square lights up when Square is physically pressed,
// even if Square has been rebound to something else.
//
// This makes it useful as an input debugger too.
// ============================================================

const controllerDisplay =
    document.createElement(
        "div"
    );


controllerDisplay.id =
    "controllerInputDisplay";


controllerDisplay.style.cssText = `
    position:fixed;

    left:16px;
    bottom:16px;

    width:190px;
    height:118px;

    z-index:55;

    pointer-events:none;
    user-select:none;

    opacity:0;

    transform:
        scale(0.96);

    transform-origin:
        bottom left;

    transition:
        opacity 0.18s ease,
        transform 0.18s ease;

    font-family:
        Arial,
        sans-serif;
`;


document.body.appendChild(
    controllerDisplay
);


// ============================================================
// CONTROLLER VISUALISER SVG
// ============================================================

controllerDisplay.innerHTML = `
<svg
    viewBox="0 0 190 118"
    width="190"
    height="118"
    aria-hidden="true"
>
    <defs>
        <filter id="bbControllerGlow">
            <feGaussianBlur
                stdDeviation="2.2"
                result="blur"
            />
            <feMerge>
                <feMergeNode
                    in="blur"
                />
                <feMergeNode
                    in="SourceGraphic"
                />
            </feMerge>
        </filter>
    </defs>

    <!-- controller shell -->

    <path
        d="
            M46 24
            C30 24 21 34 17 50
            L8 88
            C5 102 16 111 27 103
            L49 83
            C58 88 69 91 95 91
            C121 91 132 88 141 83
            L163 103
            C174 111 185 102 182 88
            L173 50
            C169 34 160 24 144 24
            C129 24 121 31 112 31
            L78 31
            C69 31 61 24 46 24
            Z
        "
        fill="rgba(12,18,29,0.82)"
        stroke="rgba(255,255,255,0.52)"
        stroke-width="2"
    />

    <!-- touch pad -->

    <rect
        x="73"
        y="34"
        width="44"
        height="25"
        rx="5"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.25)"
    />

    <!-- create/options -->

    <circle
        id="pad-b8"
        cx="64"
        cy="40"
        r="4"
        fill="rgba(255,255,255,0.18)"
    />

    <circle
        id="pad-b9"
        cx="126"
        cy="40"
        r="4"
        fill="rgba(255,255,255,0.18)"
    />

    <!-- d-pad -->

    <rect
        id="pad-b12"
        x="42"
        y="42"
        width="9"
        height="14"
        rx="2"
        fill="rgba(255,255,255,0.20)"
    />

    <rect
        id="pad-b13"
        x="42"
        y="62"
        width="9"
        height="14"
        rx="2"
        fill="rgba(255,255,255,0.20)"
    />

    <rect
        id="pad-b14"
        x="32"
        y="52"
        width="14"
        height="9"
        rx="2"
        fill="rgba(255,255,255,0.20)"
    />

    <rect
        id="pad-b15"
        x="47"
        y="52"
        width="14"
        height="9"
        rx="2"
        fill="rgba(255,255,255,0.20)"
    />

    <!-- face buttons -->

    <circle
        id="pad-b3"
        cx="145"
        cy="43"
        r="7"
        fill="rgba(255,255,255,0.14)"
        stroke="rgba(255,255,255,0.42)"
    />

    <text
        x="145"
        y="46"
        text-anchor="middle"
        font-size="8"
        fill="white"
    >△</text>

    <circle
        id="pad-b1"
        cx="159"
        cy="57"
        r="7"
        fill="rgba(255,255,255,0.14)"
        stroke="rgba(255,255,255,0.42)"
    />

    <text
        x="159"
        y="60"
        text-anchor="middle"
        font-size="8"
        fill="white"
    >○</text>

    <circle
        id="pad-b0"
        cx="145"
        cy="71"
        r="7"
        fill="rgba(255,255,255,0.14)"
        stroke="rgba(255,255,255,0.42)"
    />

    <text
        x="145"
        y="74"
        text-anchor="middle"
        font-size="8"
        fill="white"
    >×</text>

    <circle
        id="pad-b2"
        cx="131"
        cy="57"
        r="7"
        fill="rgba(255,255,255,0.14)"
        stroke="rgba(255,255,255,0.42)"
    />

    <text
        x="131"
        y="60"
        text-anchor="middle"
        font-size="8"
        fill="white"
    >□</text>

    <!-- left stick base -->

    <circle
        cx="69"
        cy="74"
        r="12"
        fill="rgba(0,0,0,0.40)"
        stroke="rgba(255,255,255,0.22)"
    />

    <!-- moving left stick -->

    <circle
        id="pad-left-stick"
        cx="69"
        cy="74"
        r="7"
        fill="rgba(255,255,255,0.28)"
        stroke="rgba(255,255,255,0.60)"
    />

    <!-- right stick -->

    <circle
        cx="116"
        cy="77"
        r="11"
        fill="rgba(0,0,0,0.40)"
        stroke="rgba(255,255,255,0.22)"
    />

    <circle
        id="pad-right-stick"
        cx="116"
        cy="77"
        r="6"
        fill="rgba(255,255,255,0.25)"
        stroke="rgba(255,255,255,0.55)"
    />

    <!-- L1 / R1 -->

    <rect
        id="pad-b4"
        x="29"
        y="17"
        width="35"
        height="8"
        rx="4"
        fill="rgba(255,255,255,0.16)"
    />

    <text
        x="46.5"
        y="15"
        text-anchor="middle"
        font-size="7"
        fill="rgba(255,255,255,0.72)"
    >L1</text>

    <rect
        id="pad-b5"
        x="126"
        y="17"
        width="35"
        height="8"
        rx="4"
        fill="rgba(255,255,255,0.16)"
    />

    <text
        x="143.5"
        y="15"
        text-anchor="middle"
        font-size="7"
        fill="rgba(255,255,255,0.72)"
    >R1</text>

    <!-- trigger backgrounds -->

    <rect
        x="31"
        y="5"
        width="31"
        height="7"
        rx="3"
        fill="rgba(255,255,255,0.10)"
    />

    <rect
        x="128"
        y="5"
        width="31"
        height="7"
        rx="3"
        fill="rgba(255,255,255,0.10)"
    />

    <!-- analogue trigger fills -->

    <rect
        id="pad-l2-fill"
        x="31"
        y="5"
        width="0"
        height="7"
        rx="3"
        fill="rgba(80,170,255,0.95)"
    />

    <rect
        id="pad-r2-fill"
        x="128"
        y="5"
        width="0"
        height="7"
        rx="3"
        fill="rgba(255,145,55,0.95)"
    />

    <text
        x="46.5"
        y="4"
        text-anchor="middle"
        font-size="7"
        fill="rgba(255,255,255,0.72)"
    >L2</text>

    <text
        x="143.5"
        y="4"
        text-anchor="middle"
        font-size="7"
        fill="rgba(255,255,255,0.72)"
    >R2</text>

    <!-- connection dot -->

    <circle
        id="pad-connected-dot"
        cx="95"
        cy="104"
        r="3"
        fill="rgba(255,255,255,0.18)"
    />
</svg>
`;


// ============================================================
// CONTROLLER DISPLAY REFERENCES
// ============================================================

const controllerDisplayButtons =
    [];


for (
    let i = 0;
    i <= 15;
    i++
) {

    controllerDisplayButtons[i] =
        document.getElementById(
            `pad-b${i}`
        );
}


const controllerDisplayLeftStick =
    document.getElementById(
        "pad-left-stick"
    );


const controllerDisplayRightStick =
    document.getElementById(
        "pad-right-stick"
    );


const controllerDisplayL2 =
    document.getElementById(
        "pad-l2-fill"
    );


const controllerDisplayR2 =
    document.getElementById(
        "pad-r2-fill"
    );


const controllerDisplayDot =
    document.getElementById(
        "pad-connected-dot"
    );


// ============================================================
// CONTROLLER DISPLAY VISIBILITY
// ============================================================

function updateControllerDisplayVisibility() {

    const visible =
        controllerDisplayEnabled
        &&
        controllerState.connected;


    controllerDisplay.style.opacity =
        visible
            ? "0.82"
            : "0";


    controllerDisplay.style.transform =
        visible
            ? "scale(1)"
            : "scale(0.96)";
}


// ============================================================
// UPDATE PHYSICAL CONTROLLER DISPLAY
// ============================================================

function updateControllerDisplay(
    gamepad
) {

    if (
        !controllerDisplayEnabled
        ||
        !gamepad
    ) {

        updateControllerDisplayVisibility();

        return;
    }


    updateControllerDisplayVisibility();


    // --------------------------------------------------------
    // DIGITAL BUTTONS
    // --------------------------------------------------------

    for (
        let i = 0;
        i < controllerDisplayButtons.length;
        i++
    ) {

        const element =
            controllerDisplayButtons[i];


        if (
            !element
        ) {

            continue;
        }


        const value =
            buttonValue(
                gamepad,
                i
            );


        const active =
            value >
            0.18;


        element.style.fill =
            active
                ? "rgba(90,185,255,0.96)"
                : "rgba(255,255,255,0.18)";


        element.style.filter =
            active
                ? "url(#bbControllerGlow)"
                : "";
    }


    // --------------------------------------------------------
    // LEFT STICK
    // --------------------------------------------------------

    const leftX =
        applyDeadzone(
            gamepad.axes[0] || 0
        );


    const leftY =
        applyDeadzone(
            gamepad.axes[1] || 0
        );


    controllerDisplayLeftStick
        .setAttribute(
            "cx",
            String(
                69 +
                leftX * 6
            )
        );


    controllerDisplayLeftStick
        .setAttribute(
            "cy",
            String(
                74 +
                leftY * 6
            )
        );


    // --------------------------------------------------------
    // RIGHT STICK
    // --------------------------------------------------------

    const rightX =
        applyDeadzone(
            gamepad.axes[2] || 0
        );


    const rightY =
        applyDeadzone(
            gamepad.axes[3] || 0
        );


    controllerDisplayRightStick
        .setAttribute(
            "cx",
            String(
                116 +
                rightX * 5
            )
        );


    controllerDisplayRightStick
        .setAttribute(
            "cy",
            String(
                77 +
                rightY * 5
            )
        );


    // --------------------------------------------------------
    // ANALOGUE TRIGGERS
    // --------------------------------------------------------

    const l2 =
        buttonValue(
            gamepad,
            6
        );


    const r2 =
        buttonValue(
            gamepad,
            7
        );


    controllerDisplayL2
        .setAttribute(
            "width",
            String(
                31 * l2
            )
        );


    controllerDisplayR2
        .setAttribute(
            "width",
            String(
                31 * r2
            )
        );


    controllerDisplayDot.style.fill =
        "rgba(70,255,145,0.95)";
}


// ============================================================
// CONTROLLER CONNECTION EVENTS
// ============================================================
//
// These are helpful for immediately noticing a new pad.
//
// They are NOT the only controller detection mechanism.
// Continuous polling in updateController() is the authority.
// ============================================================

window.addEventListener(
    "gamepadconnected",
    event => {

        preferredGamepadIndex =
            event.gamepad.index;


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


        updateControllerDisplayVisibility();
    }
);


window.addEventListener(
    "gamepaddisconnected",
    event => {

        if (
            preferredGamepadIndex ===
            event.gamepad.index
        ) {

            preferredGamepadIndex =
                null;
        }


        if (
            controllerState.index ===
            event.gamepad.index
        ) {

            controllerState.index =
                null;


            controllerState.connected =
                false;
        }


        controllerNotice =
            "Controller disconnected";


        updateControllerDisplayVisibility();
    }
);


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
// END PART 1 / 4
//
// PART 2 GOES DIRECTLY BELOW THIS LINE.
//
// PART 2:
// - full controller polling
// - controller remapping
// - keyboard input
// - settings menu
// - controller diagnostics
// - top scoreboard
// - boost pads
//
// ============================================================
// BOOSTBALL v0.6.3 — TRACTION CONTROL
//
// PART 2 / 4
//
// - Full controller polling
// - Hot-plug controller detection
// - Controller remapping
// - Keyboard input
// - Input combination
// - Settings/menu
// - Controller diagnostics
// - Top-centre scoreboard
// - Detailed scoreboard
// - Boost HUD
// - Boost pads
//
// PASTE DIRECTLY BELOW PART 1.
// DO NOT RUN UNTIL PARTS 3 AND 4 ARE ADDED.
// ============================================================


// ============================================================
// KEYBOARD STATE
// ============================================================

const keys =
    Object.create(null);


let keyboardRebindingAction =
    null;


let menuOpen =
    false;


let ballCamEnabled =
    true;


let previousKeyboardBallCam =
    false;


let previousKeyboardJump =
    false;


let previousKeyboardMenu =
    false;


let previousKeyboardReset =
    false;


// ============================================================
// KEY NORMALISATION
// ============================================================

function normalizeKey(
    key
) {

    if (
        key === " "
        ||
        key === "Spacebar"
    ) {

        return " ";
    }


    return key.toLowerCase();
}


// ============================================================
// READABLE KEY NAME
// ============================================================

function readableKey(
    key
) {

    const names = {

        " ":
            "SPACE",

        shift:
            "SHIFT",

        control:
            "CTRL",

        alt:
            "ALT",

        tab:
            "TAB",

        escape:
            "ESC",

        arrowup:
            "↑",

        arrowdown:
            "↓",

        arrowleft:
            "←",

        arrowright:
            "→"
    };


    return (
        names[key]
        ||
        key.toUpperCase()
    );
}


// ============================================================
// PREVENT BROWSER SHORTCUTS FOR ACTIVE GAME KEYS
// ============================================================

function shouldPreventKey(
    key
) {

    if (
        keyboardRebindingAction
    ) {

        return true;
    }


    if (
        key === " "
        ||
        key === "tab"
    ) {

        return true;
    }


    for (
        const action
        of Object.keys(
            controls
        )
    ) {

        if (
            controls[action] ===
            key
        ) {

            return true;
        }
    }


    return false;
}


// ============================================================
// KEY DOWN
// ============================================================

window.addEventListener(
    "keydown",
    event => {

        const key =
            normalizeKey(
                event.key
            );


        if (
            keyboardRebindingAction
        ) {

            event.preventDefault();


            if (
                key === "escape"
            ) {

                keyboardRebindingAction =
                    null;


                controllerNotice =
                    "Keyboard binding cancelled";


                rebuildMenu();

                return;
            }


            controls[
                keyboardRebindingAction
            ] =
                key;


            saveControls();


            controllerNotice =
                `${
                    keyboardActionLabels[
                        keyboardRebindingAction
                    ]
                    ||
                    keyboardRebindingAction
                } → ${readableKey(key)}`;


            keyboardRebindingAction =
                null;


            rebuildMenu();

            return;
        }


        if (
            shouldPreventKey(
                key
            )
        ) {

            event.preventDefault();
        }


        keys[key] =
            true;
    }
);


// ============================================================
// KEY UP
// ============================================================

window.addEventListener(
    "keyup",
    event => {

        const key =
            normalizeKey(
                event.key
            );


        if (
            shouldPreventKey(
                key
            )
        ) {

            event.preventDefault();
        }


        keys[key] =
            false;
    }
);


// ============================================================
// CLEAR KEYBOARD WHEN WINDOW LOSES FOCUS
// ============================================================

window.addEventListener(
    "blur",
    () => {

        for (
            const key
            of Object.keys(
                keys
            )
        ) {

            keys[key] =
                false;
        }


        previousKeyboardJump =
            false;


        previousKeyboardBallCam =
            false;


        previousKeyboardMenu =
            false;


        previousKeyboardReset =
            false;
    }
);


// ============================================================
// KEY HELD
// ============================================================

function keyHeld(
    action
) {

    const key =
        controls[action];


    return (
        !!key
        &&
        keys[key] === true
    );
}


// ============================================================
// KEYBOARD ACTION LABELS
// ============================================================

const keyboardActionLabels = {

    throttle:
        "Drive",

    reverse:
        "Brake / Reverse",

    left:
        "Steer Left",

    right:
        "Steer Right",

    jump:
        "Jump / Dodge",

    boost:
        "Boost",

    powerslide:
        "Powerslide",

    ballCam:
        "Ball Cam",

    airRollLeft:
        "Air Roll Left",

    airRollRight:
        "Air Roll Right",

    scoreboard:
        "Scoreboard",

    reset:
        "Reset Shot",

    menu:
        "Menu"
};


// ============================================================
// CONTROLLER ACTION LABELS
// ============================================================

const controllerActionLabels = {

    jump:
        "Jump / Dodge",

    scoreboard:
        "Scoreboard",

    ballCam:
        "Ball Cam",

    powerslide:
        "Powerslide",

    airRollRight:
        "Air Roll Right",

    airRollLeft:
        "Air Roll Left",

    reverse:
        "Brake / Reverse",

    throttle:
        "Drive",

    menu:
        "Menu",

    reset:
        "Reset Shot",

    boost:
        "Boost"
};


// ============================================================
// CONTROLLER ACTION ORDER
// ============================================================

const controllerActionOrder = [

    "jump",

    "boost",

    "powerslide",

    "airRollLeft",

    "airRollRight",

    "ballCam",

    "scoreboard",

    "throttle",

    "reverse",

    "reset",

    "menu"
];


// ============================================================
// KEYBOARD ACTION ORDER
// ============================================================

const keyboardActionOrder = [

    "throttle",

    "reverse",

    "left",

    "right",

    "jump",

    "boost",

    "powerslide",

    "airRollLeft",

    "airRollRight",

    "ballCam",

    "scoreboard",

    "reset",

    "menu"
];


// ============================================================
// BEGIN KEYBOARD REBIND
// ============================================================

function beginKeyboardRebind(
    action
) {

    keyboardRebindingAction =
        action;


    controllerRebindingAction =
        null;


    controllerNotice =
        `Press a key for ${
            keyboardActionLabels[action]
        }`;


    rebuildMenu();
}


// ============================================================
// BEGIN CONTROLLER REBIND
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
            "No controller detected. Press a controller button and try again.";


        rebuildMenu();

        return;
    }


    keyboardRebindingAction =
        null;


    controllerRebindingAction =
        action;


    controllerRebindBlockedButtons
        .clear();


    // Anything already held when the remapper opens
    // cannot immediately become the new binding.

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

            controllerRebindBlockedButtons
                .add(
                    i
                );
        }
    }


    controllerNotice =
        `Press a controller button for ${
            controllerActionLabels[action]
        }`;


    rebuildMenu();
}


// ============================================================
// UNBIND CONTROLLER ACTION
// ============================================================

function unbindControllerAction(
    action
) {

    controllerBindings[action] =
        null;


    saveControllerBindings();


    controllerNotice =
        `${
            controllerActionLabels[action]
        } unbound`;


    rebuildMenu();
}


// ============================================================
// COMPLETE CONTROLLER REBIND
// ============================================================
//
// Multiple actions ARE allowed on one physical button.
//
// That's important because your default R1 performs:
//
// Powerslide + Air Roll Right.
//
// We therefore DO NOT force-swap conflicting actions.
// ============================================================

function completeControllerRebind(
    buttonIndex
) {

    if (
        !controllerRebindingAction
    ) {

        return;
    }


    const action =
        controllerRebindingAction;


    controllerBindings[action] =
        buttonIndex;


    saveControllerBindings();


    controllerNotice =
        `${
            controllerActionLabels[action]
        } → ${
            readableControllerButton(
                buttonIndex
            )
        }`;


    controllerRebindingAction =
        null;


    controllerRebindBlockedButtons
        .clear();


    rebuildMenu();
}


// ============================================================
// CONTROLLER REBIND CAPTURE
// ============================================================

function updateControllerRebinding(
    gamepad
) {

    if (
        !controllerRebindingAction
        ||
        !gamepad
    ) {

        return;
    }


    for (
        let i = 0;
        i < gamepad.buttons.length;
        i++
    ) {

        const button =
            gamepad.buttons[i];


        const held =
            button.pressed
            ||
            button.value >
                0.55;


        if (
            !held
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


        completeControllerRebind(
            i
        );


        break;
    }
}


// ============================================================
// CLEAR CONTROLLER GAMEPLAY STATE
// ============================================================

function clearControllerGameplayState() {

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


    controllerState.airRollLeft =
        false;


    controllerState.airRollRight =
        false;


    controllerState.menu =
        false;


    controllerState.menuPressed =
        false;


    controllerState.reset =
        false;


    controllerState.resetPressed =
        false;
}


// ============================================================
// UPDATE CONTROLLER
// ============================================================
//
// Called EVERY FRAME.
//
// This is the important no-reload fix.
//
// We don't keep a stale Gamepad object.
// navigator.getGamepads() gives us the current one every frame.
// ============================================================

function updateController() {

    const gamepad =
        getActiveGamepad();


    if (
        !gamepad
    ) {

        const wasConnected =
            controllerState.connected;


        controllerState.connected =
            false;


        controllerState.index =
            null;


        controllerState.id =
            "";


        controllerState.mapping =
            "";


        controllerState.buttonCount =
            0;


        controllerState.axisCount =
            0;


        clearControllerGameplayState();


        previousControllerButtons =
            [];


        if (
            wasConnected
        ) {

            controllerNotice =
                "Controller disconnected";
        }


        updateControllerDisplayVisibility();


        return;
    }


    // --------------------------------------------------------
    // CONNECTION INFO
    // --------------------------------------------------------

    const newlyDetected =
        !controllerState.connected
        ||
        controllerState.index !==
            gamepad.index;


    controllerState.connected =
        true;


    controllerState.index =
        gamepad.index;


    controllerState.id =
        gamepad.id || "Gamepad";


    controllerState.mapping =
        gamepad.mapping || "raw";


    controllerState.buttonCount =
        gamepad.buttons.length;


    controllerState.axisCount =
        gamepad.axes.length;


    preferredGamepadIndex =
        gamepad.index;


    if (
        newlyDetected
    ) {

        controllerNotice =
            `Controller detected: ${
                gamepad.id || "Gamepad"
            }`;


        previousControllerButtons =
            new Array(
                gamepad.buttons.length
            ).fill(
                false
            );


        if (
            menuOpen
        ) {

            rebuildMenu();
        }
    }


    // --------------------------------------------------------
    // LIVE PHYSICAL CONTROLLER DISPLAY
    // --------------------------------------------------------

    updateControllerDisplay(
        gamepad
    );


    // --------------------------------------------------------
    // REMAPPER
    // --------------------------------------------------------

    updateControllerRebinding(
        gamepad
    );


    // --------------------------------------------------------
    // LEFT STICK
    // --------------------------------------------------------

    controllerState.steerX =
        applyDeadzone(
            gamepad.axes[0] || 0
        );


    controllerState.steerY =
        applyDeadzone(
            gamepad.axes[1] || 0
        );


    // --------------------------------------------------------
    // ANALOGUE THROTTLE / REVERSE
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // JUMP
    // --------------------------------------------------------

    const jumpIndex =
        controllerBindings.jump;


    controllerState.jump =
        buttonHeld(
            gamepad,
            jumpIndex
        );


    controllerState.jumpPressed =
        jumpIndex !== null
        &&
        rawButtonPressed(
            gamepad,
            jumpIndex
        );


    // --------------------------------------------------------
    // BOOST
    // --------------------------------------------------------

    controllerState.boost =
        buttonHeld(

            gamepad,

            controllerBindings
                .boost
        );


    // --------------------------------------------------------
    // POWERSLIDE
    // --------------------------------------------------------

    controllerState.powerslide =
        buttonHeld(

            gamepad,

            controllerBindings
                .powerslide
        );


    // --------------------------------------------------------
    // DIRECTIONAL AIR ROLL
    // --------------------------------------------------------

    controllerState.airRollLeft =
        buttonHeld(

            gamepad,

            controllerBindings
                .airRollLeft
        );


    controllerState.airRollRight =
        buttonHeld(

            gamepad,

            controllerBindings
                .airRollRight
        );


    // --------------------------------------------------------
    // BALL CAM
    // --------------------------------------------------------

    const ballCamIndex =
        controllerBindings.ballCam;


    controllerState.ballCam =
        buttonHeld(
            gamepad,
            ballCamIndex
        );


    controllerState.ballCamPressed =
        ballCamIndex !== null
        &&
        rawButtonPressed(
            gamepad,
            ballCamIndex
        );


    // --------------------------------------------------------
    // SCOREBOARD
    // --------------------------------------------------------

    controllerState.scoreboard =
        buttonHeld(

            gamepad,

            controllerBindings
                .scoreboard
        );


    // --------------------------------------------------------
    // MENU / OPTIONS
    // --------------------------------------------------------

    const menuIndex =
        controllerBindings.menu;


    controllerState.menu =
        buttonHeld(
            gamepad,
            menuIndex
        );


    controllerState.menuPressed =
        menuIndex !== null
        &&
        rawButtonPressed(
            gamepad,
            menuIndex
        );


    // --------------------------------------------------------
    // RESET
    // --------------------------------------------------------

    const resetIndex =
        controllerBindings.reset;


    controllerState.reset =
        buttonHeld(
            gamepad,
            resetIndex
        );


    controllerState.resetPressed =
        resetIndex !== null
        &&
        rawButtonPressed(
            gamepad,
            resetIndex
        );


    // --------------------------------------------------------
    // STORE RAW BUTTON STATE FOR NEXT FRAME
    // --------------------------------------------------------

    if (
        previousControllerButtons.length !==
        gamepad.buttons.length
    ) {

        previousControllerButtons =
            new Array(
                gamepad.buttons.length
            ).fill(
                false
            );
    }


    for (
        let i = 0;
        i < gamepad.buttons.length;
        i++
    ) {

        previousControllerButtons[i] =
            gamepad.buttons[i].pressed
            ||
            gamepad.buttons[i].value >
                0.55;
    }
}


// ============================================================
// COMBINED GAMEPLAY INPUT
// ============================================================

const inputState = {

    throttle:
        0,

    reverse:
        0,

    steer:
        0,

    pitch:
        0,

    jump:
        false,

    jumpPressed:
        false,

    boost:
        false,

    powerslide:
        false,

    airRollLeft:
        false,

    airRollRight:
        false,

    scoreboard:
        false
};


// ============================================================
// UPDATE COMBINED INPUT
// ============================================================

function updateInputState() {

    // --------------------------------------------------------
    // KEYBOARD ANALOGUE-LIKE VALUES
    // --------------------------------------------------------

    const keyboardThrottle =
        keyHeld(
            "throttle"
        )
            ? 1
            : 0;


    const keyboardReverse =
        keyHeld(
            "reverse"
        )
            ? 1
            : 0;


    const keyboardLeft =
        keyHeld(
            "left"
        )
            ? 1
            : 0;


    const keyboardRight =
        keyHeld(
            "right"
        )
            ? 1
            : 0;


    const keyboardSteer =
        keyboardRight -
        keyboardLeft;


    // IMPORTANT:
    //
    // W / stick-forward = NOSE DOWN.
    // S / stick-backward = NOSE UP.
    //
    // The keyboard throttle/reverse keys double as
    // aerial pitch when airborne.

    const keyboardPitch =
        keyboardReverse -
        keyboardThrottle;


    // --------------------------------------------------------
    // JUMP EDGE
    // --------------------------------------------------------

    const keyboardJump =
        keyHeld(
            "jump"
        );


    const keyboardJumpPressed =
        keyboardJump
        &&
        !previousKeyboardJump;


    previousKeyboardJump =
        keyboardJump;


    // --------------------------------------------------------
    // BALL CAM EDGE
    // --------------------------------------------------------

    const keyboardBallCam =
        keyHeld(
            "ballCam"
        );


    const keyboardBallCamPressed =
        keyboardBallCam
        &&
        !previousKeyboardBallCam;


    previousKeyboardBallCam =
        keyboardBallCam;


    if (
        keyboardBallCamPressed
        ||
        controllerState.ballCamPressed
    ) {

        ballCamEnabled =
            !ballCamEnabled;
    }


    // --------------------------------------------------------
    // MENU EDGE
    // --------------------------------------------------------

    const keyboardMenu =
        keyHeld(
            "menu"
        );


    const keyboardMenuPressed =
        keyboardMenu
        &&
        !previousKeyboardMenu;


    previousKeyboardMenu =
        keyboardMenu;


    if (
        keyboardMenuPressed
        ||
        controllerState.menuPressed
    ) {

        toggleMenu();
    }


    // --------------------------------------------------------
    // RESET EDGE
    // --------------------------------------------------------

    const keyboardReset =
        keyHeld(
            "reset"
        );


    const keyboardResetPressed =
        keyboardReset
        &&
        !previousKeyboardReset;


    previousKeyboardReset =
        keyboardReset;


    if (
        keyboardResetPressed
        ||
        controllerState.resetPressed
    ) {

        requestResetShot();
    }


    // --------------------------------------------------------
    // COMBINE CONTROLLER + KEYBOARD
    // --------------------------------------------------------

    inputState.throttle =
        Math.max(
            keyboardThrottle,
            controllerState.throttle
        );


    inputState.reverse =
        Math.max(
            keyboardReverse,
            controllerState.reverse
        );


    inputState.steer =
        Math.abs(
            controllerState.steerX
        ) >
        Math.abs(
            keyboardSteer
        )
            ?
            controllerState.steerX
            :
            keyboardSteer;


    inputState.pitch =
        Math.abs(
            controllerState.steerY
        ) >
        Math.abs(
            keyboardPitch
        )
            ?
            controllerState.steerY
            :
            keyboardPitch;


    inputState.jump =
        keyboardJump
        ||
        controllerState.jump;


    inputState.jumpPressed =
        keyboardJumpPressed
        ||
        controllerState.jumpPressed;


    inputState.boost =
        keyHeld(
            "boost"
        )
        ||
        controllerState.boost;


    inputState.powerslide =
        keyHeld(
            "powerslide"
        )
        ||
        controllerState.powerslide;


    inputState.airRollLeft =
        keyHeld(
            "airRollLeft"
        )
        ||
        controllerState.airRollLeft;


    inputState.airRollRight =
        keyHeld(
            "airRollRight"
        )
        ||
        controllerState.airRollRight;


    inputState.scoreboard =
        keyHeld(
            "scoreboard"
        )
        ||
        controllerState.scoreboard;
}


// ============================================================
// MENU OVERLAY
// ============================================================

const menuOverlay =
    document.createElement(
        "div"
    );


menuOverlay.style.cssText = `
    position:fixed;

    inset:0;

    z-index:80;

    display:none;

    align-items:center;
    justify-content:center;

    background:
        rgba(3,8,16,0.82);

    backdrop-filter:
        blur(7px);

    font-family:
        Arial,
        sans-serif;

    color:white;
`;


document.body.appendChild(
    menuOverlay
);


// ============================================================
// MENU CARD
// ============================================================

const menuCard =
    document.createElement(
        "div"
    );


menuCard.style.cssText = `
    width:
        min(920px, 92vw);

    max-height:
        86vh;

    overflow-y:auto;

    box-sizing:border-box;

    padding:
        26px 28px 30px;

    border-radius:
        18px;

    border:
        1px solid
        rgba(255,255,255,0.13);

    background:
        linear-gradient(
            180deg,
            rgba(18,31,49,0.98),
            rgba(8,14,24,0.98)
        );

    box-shadow:
        0 24px 70px
        rgba(0,0,0,0.55);
`;


menuOverlay.appendChild(
    menuCard
);


// ============================================================
// MENU HELPERS
// ============================================================

function menuButtonStyle(
    active = false
) {

    return `
        appearance:none;

        min-width:115px;

        padding:
            9px 12px;

        border-radius:
            8px;

        border:
            1px solid
            ${
                active
                    ?
                    "rgba(80,180,255,0.75)"
                    :
                    "rgba(255,255,255,0.15)"
            };

        background:
            ${
                active
                    ?
                    "rgba(40,130,220,0.30)"
                    :
                    "rgba(255,255,255,0.07)"
            };

        color:white;

        font:
            600 13px
            Arial,
            sans-serif;

        cursor:pointer;
    `;
}


function menuSectionTitle(
    text
) {

    return `
        <h2
            style="
                margin:
                    26px 0 10px;

                font-size:
                    18px;

                letter-spacing:
                    0.4px;
            "
        >
            ${text}
        </h2>
    `;
}


// ============================================================
// MENU REBUILD
// ============================================================
//
// This runs ONLY when the menu changes.
//
// We deliberately do NOT rebuild the entire settings menu
// every animation frame like a possessed microwave.
// ============================================================

function rebuildMenu() {

    if (
        !menuOpen
    ) {

        return;
    }


    const controllerConnected =
        controllerState.connected;


    const mappingText =
        controllerConnected
            ?
            (
                controllerState.mapping ===
                "standard"
                    ?
                    "STANDARD"
                    :
                    (
                        controllerState.mapping
                        ||
                        "RAW"
                    ).toUpperCase()
            )
            :
            "—";


    let html = `
        <div
            style="
                display:flex;
                align-items:flex-start;
                justify-content:space-between;
                gap:20px;
            "
        >

            <div>
                <div
                    style="
                        font-size:12px;
                        letter-spacing:2px;
                        color:rgba(255,255,255,0.56);
                    "
                >
                    BOOSTBALL
                </div>

                <h1
                    style="
                        margin:4px 0 4px;
                        font-size:32px;
                    "
                >
                    Settings
                </h1>

                <div
                    style="
                        color:rgba(255,255,255,0.58);
                        font-size:13px;
                    "
                >
                    ${GAME_VERSION}
                    ·
                    ${GAME_CODENAME}
                </div>
            </div>

            <button
                id="menuCloseButton"
                style="${menuButtonStyle()}"
            >
                Resume
            </button>

        </div>
    `;


    // --------------------------------------------------------
    // GRAPHICS
    // --------------------------------------------------------

    html +=
        menuSectionTitle(
            "Graphics"
        );


    html += `
        <div
            style="
                display:flex;
                flex-wrap:wrap;
                gap:8px;
            "
        >
    `;


    for (
        const [
            presetKey,
            preset
        ]
        of Object.entries(
            GRAPHICS_PRESETS
        )
    ) {

        html += `
            <button
                class="graphicsPresetButton"
                data-preset="${presetKey}"
                style="${
                    menuButtonStyle(
                        graphicsPreset ===
                        presetKey
                    )
                }"
            >
                ${preset.label}
            </button>
        `;
    }


    html += `
        </div>
    `;


    // --------------------------------------------------------
    // CONTROLLER STATUS
    // --------------------------------------------------------

    html +=
        menuSectionTitle(
            "Controller"
        );


    html += `
        <div
            style="
                padding:14px 15px;

                border-radius:10px;

                background:
                    rgba(255,255,255,0.055);

                border:
                    1px solid
                    rgba(255,255,255,0.09);

                line-height:1.55;

                font-size:13px;
            "
        >

            <div>
                <strong>Status:</strong>

                <span
                    id="controllerDiagnosticStatus"
                    style="
                        color:
                            ${
                                controllerConnected
                                    ?
                                    "#72ffac"
                                    :
                                    "#ffad72"
                            };
                    "
                >
                    ${
                        controllerConnected
                            ?
                            "CONNECTED"
                            :
                            "NOT DETECTED"
                    }
                </span>
            </div>

            <div>
                <strong>Device:</strong>
                <span
                    id="controllerDiagnosticId"
                >
                    ${
                        controllerConnected
                            ?
                            controllerState.id
                            :
                            "Press any controller button"
                    }
                </span>
            </div>

            <div>
                <strong>Mapping:</strong>
                <span
                    id="controllerDiagnosticMapping"
                >
                    ${mappingText}
                </span>
            </div>

            <div>
                <strong>Buttons / axes:</strong>
                <span
                    id="controllerDiagnosticCounts"
                >
                    ${
                        controllerConnected
                            ?
                            `${controllerState.buttonCount} / ${controllerState.axisCount}`
                            :
                            "—"
                    }
                </span>
            </div>

            <div
                style="
                    margin-top:7px;
                    color:rgba(255,255,255,0.58);
                "
            >
                Live input:
                <span
                    id="controllerDiagnosticLive"
                >
                    —
                </span>
            </div>

        </div>
    `;


    // --------------------------------------------------------
    // CONTROLLER VISUALISER TOGGLE
    // --------------------------------------------------------

    html += `
        <div
            style="
                margin-top:10px;

                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:16px;

                padding:
                    11px 14px;

                border-radius:
                    10px;

                background:
                    rgba(255,255,255,0.04);
            "
        >

            <div>
                <strong>
                    Controller Input Display
                </strong>

                <div
                    style="
                        margin-top:3px;
                        font-size:12px;
                        color:rgba(255,255,255,0.55);
                    "
                >
                    Shows the little live controller
                    in the bottom-left.
                </div>
            </div>

            <button
                id="controllerDisplayToggle"
                style="${
                    menuButtonStyle(
                        controllerDisplayEnabled
                    )
                }"
            >
                ${
                    controllerDisplayEnabled
                        ?
                        "ON"
                        :
                        "OFF"
                }
            </button>

        </div>
    `;


    // --------------------------------------------------------
    // CONTROLLER BINDINGS
    // --------------------------------------------------------

    html += `
        <div
            style="
                margin-top:12px;
                display:grid;
                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(250px,1fr)
                    );
                gap:8px;
            "
        >
    `;


    for (
        const action
        of controllerActionOrder
    ) {

        const waiting =
            controllerRebindingAction ===
            action;


        html += `
            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:10px;

                    padding:
                        9px 10px;

                    border-radius:
                        9px;

                    background:
                        rgba(255,255,255,0.045);

                    border:
                        1px solid
                        ${
                            waiting
                                ?
                                "rgba(80,180,255,0.70)"
                                :
                                "rgba(255,255,255,0.06)"
                        };
                "
            >

                <span
                    style="
                        font-size:13px;
                    "
                >
                    ${
                        controllerActionLabels[
                            action
                        ]
                    }
                </span>

                <div
                    style="
                        display:flex;
                        gap:5px;
                    "
                >

                    <button
                        class="controllerBindButton"
                        data-action="${action}"
                        style="${
                            menuButtonStyle(
                                waiting
                            )
                        }"
                    >
                        ${
                            waiting
                                ?
                                "PRESS BUTTON…"
                                :
                                readableControllerButton(
                                    controllerBindings[
                                        action
                                    ]
                                )
                        }
                    </button>

                    <button
                        class="controllerUnbindButton"
                        data-action="${action}"
                        title="Unbind"
                        style="
                            ${menuButtonStyle()}
                            min-width:38px;
                            width:38px;
                        "
                    >
                        ×
                    </button>

                </div>

            </div>
        `;
    }


    html += `
        </div>
    `;


    html += `
        <div
            style="
                margin-top:10px;
                display:flex;
                gap:8px;
                flex-wrap:wrap;
            "
        >

            <button
                id="resetControllerBindingsButton"
                style="${menuButtonStyle()}"
            >
                Reset Controller
            </button>

        </div>
    `;


    // --------------------------------------------------------
    // RESERVED QUICK CHAT
    // --------------------------------------------------------

    html += `
        <div
            style="
                margin-top:10px;

                padding:
                    10px 12px;

                border-radius:
                    9px;

                background:
                    rgba(255,170,40,0.08);

                border:
                    1px solid
                    rgba(255,170,40,0.16);

                color:
                    rgba(255,255,255,0.64);

                font-size:
                    12px;
            "
        >
            D-Pad Up / Down / Left / Right are reserved
            for the later Quick Chat update.
        </div>
    `;


    // --------------------------------------------------------
    // KEYBOARD
    // --------------------------------------------------------

    html +=
        menuSectionTitle(
            "Keyboard"
        );


    html += `
        <div
            style="
                display:grid;

                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(220px,1fr)
                    );

                gap:8px;
            "
        >
    `;


    for (
        const action
        of keyboardActionOrder
    ) {

        const waiting =
            keyboardRebindingAction ===
            action;


        html += `
            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:10px;

                    padding:
                        9px 10px;

                    border-radius:
                        9px;

                    background:
                        rgba(255,255,255,0.045);
                "
            >

                <span
                    style="
                        font-size:13px;
                    "
                >
                    ${
                        keyboardActionLabels[
                            action
                        ]
                    }
                </span>

                <button
                    class="keyboardBindButton"
                    data-action="${action}"
                    style="${
                        menuButtonStyle(
                            waiting
                        )
                    }"
                >
                    ${
                        waiting
                            ?
                            "PRESS KEY…"
                            :
                            readableKey(
                                controls[action]
                            )
                    }
                </button>

            </div>
        `;
    }


    html += `
        </div>

        <div
            style="
                margin-top:10px;
            "
        >
            <button
                id="resetKeyboardBindingsButton"
                style="${menuButtonStyle()}"
            >
                Reset Keyboard
            </button>
        </div>
    `;


    // --------------------------------------------------------
    // NOTICE
    // --------------------------------------------------------

    if (
        controllerNotice
    ) {

        html += `
            <div
                style="
                    margin-top:20px;

                    padding:
                        10px 12px;

                    border-radius:
                        9px;

                    background:
                        rgba(65,145,255,0.10);

                    border:
                        1px solid
                        rgba(65,145,255,0.20);

                    color:
                        rgba(255,255,255,0.78);

                    font-size:
                        12px;
                "
            >
                ${controllerNotice}
            </div>
        `;
    }


    menuCard.innerHTML =
        html;


    bindMenuEvents();
}


// ============================================================
// MENU EVENTS
// ============================================================

function bindMenuEvents() {

    document
        .getElementById(
            "menuCloseButton"
        )
        ?.addEventListener(
            "click",
            () => {

                toggleMenu(
                    false
                );
            }
        );


    // --------------------------------------------------------
    // GRAPHICS
    // --------------------------------------------------------

    for (
        const button
        of menuCard.querySelectorAll(
            ".graphicsPresetButton"
        )
    ) {

        button.addEventListener(
            "click",
            () => {

                graphicsPreset =
                    button.dataset.preset;


                applyGraphicsPreset();


                rebuildMenu();
            }
        );
    }


    // --------------------------------------------------------
    // CONTROLLER DISPLAY
    // --------------------------------------------------------

    document
        .getElementById(
            "controllerDisplayToggle"
        )
        ?.addEventListener(
            "click",
            () => {

                setControllerDisplayEnabled(
                    !controllerDisplayEnabled
                );


                rebuildMenu();
            }
        );


    // --------------------------------------------------------
    // CONTROLLER REBIND
    // --------------------------------------------------------

    for (
        const button
        of menuCard.querySelectorAll(
            ".controllerBindButton"
        )
    ) {

        button.addEventListener(
            "click",
            () => {

                beginControllerRebind(
                    button.dataset.action
                );
            }
        );
    }


    // --------------------------------------------------------
    // CONTROLLER UNBIND
    // --------------------------------------------------------

    for (
        const button
        of menuCard.querySelectorAll(
            ".controllerUnbindButton"
        )
    ) {

        button.addEventListener(
            "click",
            () => {

                unbindControllerAction(
                    button.dataset.action
                );
            }
        );
    }


    // --------------------------------------------------------
    // RESET CONTROLLER
    // --------------------------------------------------------

    document
        .getElementById(
            "resetControllerBindingsButton"
        )
        ?.addEventListener(
            "click",
            () => {

                resetControllerBindings();


                controllerNotice =
                    "Controller bindings reset";


                rebuildMenu();
            }
        );


    // --------------------------------------------------------
    // KEYBOARD REBIND
    // --------------------------------------------------------

    for (
        const button
        of menuCard.querySelectorAll(
            ".keyboardBindButton"
        )
    ) {

        button.addEventListener(
            "click",
            () => {

                beginKeyboardRebind(
                    button.dataset.action
                );
            }
        );
    }


    // --------------------------------------------------------
    // RESET KEYBOARD
    // --------------------------------------------------------

    document
        .getElementById(
            "resetKeyboardBindingsButton"
        )
        ?.addEventListener(
            "click",
            () => {

                resetControls();


                controllerNotice =
                    "Keyboard bindings reset";


                rebuildMenu();
            }
        );
}


// ============================================================
// TOGGLE MENU
// ============================================================

function toggleMenu(
    force
) {

    menuOpen =
        typeof force ===
        "boolean"
            ?
            force
            :
            !menuOpen;


    menuOverlay.style.display =
        menuOpen
            ?
            "flex"
            :
            "none";


    if (
        menuOpen
    ) {

        controllerNotice =
            controllerState.connected
                ?
                "Controller ready"
                :
                "Press any controller button if it is not detected";


        rebuildMenu();

    } else {

        keyboardRebindingAction =
            null;


        controllerRebindingAction =
            null;


        controllerRebindBlockedButtons
            .clear();
    }
}


// ============================================================
// LIVE CONTROLLER DIAGNOSTICS
// ============================================================
//
// Update existing text nodes at a low rate.
// Do NOT rebuild the menu every frame.
// ============================================================

let controllerDiagnosticTimer =
    0;


function updateControllerDiagnostics(
    dt
) {

    if (
        !menuOpen
    ) {

        return;
    }


    controllerDiagnosticTimer -=
        dt;


    if (
        controllerDiagnosticTimer >
        0
    ) {

        return;
    }


    controllerDiagnosticTimer =
        0.10;


    const status =
        document.getElementById(
            "controllerDiagnosticStatus"
        );


    const id =
        document.getElementById(
            "controllerDiagnosticId"
        );


    const mapping =
        document.getElementById(
            "controllerDiagnosticMapping"
        );


    const counts =
        document.getElementById(
            "controllerDiagnosticCounts"
        );


    const live =
        document.getElementById(
            "controllerDiagnosticLive"
        );


    if (
        status
    ) {

        status.textContent =
            controllerState.connected
                ?
                "CONNECTED"
                :
                "NOT DETECTED";


        status.style.color =
            controllerState.connected
                ?
                "#72ffac"
                :
                "#ffad72";
    }


    if (
        id
    ) {

        id.textContent =
            controllerState.connected
                ?
                controllerState.id
                :
                "Press any controller button";
    }


    if (
        mapping
    ) {

        mapping.textContent =
            controllerState.connected
                ?
                (
                    controllerState.mapping
                    ||
                    "raw"
                ).toUpperCase()
                :
                "—";
    }


    if (
        counts
    ) {

        counts.textContent =
            controllerState.connected
                ?
                `${
                    controllerState.buttonCount
                } / ${
                    controllerState.axisCount
                }`
                :
                "—";
    }


    if (
        live
    ) {

        if (
            !controllerState.connected
        ) {

            live.textContent =
                "—";

        } else {

            live.textContent =
                `Stick ${
                    controllerState.steerX
                        .toFixed(2)
                }, ${
                    controllerState.steerY
                        .toFixed(2)
                } · L2 ${
                    controllerState.reverse
                        .toFixed(2)
                } · R2 ${
                    controllerState.throttle
                        .toFixed(2)
                }`;
        }
    }
}


// ============================================================
// HUD ROOT
// ============================================================
//
// Hide the original HTML HUD.
//
// v0.6.3 supplies its own permanent top-centre scoreboard.
// ============================================================

const originalHud =
    document.getElementById(
        "hud"
    );


if (
    originalHud
) {

    originalHud.style.display =
        "none";
}


// ============================================================
// TOP SCOREBOARD
// ============================================================

const topScoreboard =
    document.createElement(
        "div"
    );


topScoreboard.style.cssText = `
    position:fixed;

    top:14px;
    left:50%;

    transform:
        translateX(-50%);

    z-index:50;

    display:flex;
    align-items:stretch;

    min-width:292px;

    height:52px;

    overflow:hidden;

    border-radius:7px;

    box-shadow:
        0 8px 25px
        rgba(0,0,0,0.30);

    font-family:
        Arial,
        sans-serif;

    pointer-events:none;
    user-select:none;
`;


topScoreboard.innerHTML = `
    <div
        id="topBlueScore"
        style="
            width:82px;

            display:flex;
            align-items:center;
            justify-content:center;

            background:
                linear-gradient(
                    180deg,
                    #2498ff,
                    #0868ca
                );

            color:white;

            font-size:27px;
            font-weight:800;
        "
    >
        0
    </div>

    <div
        style="
            width:128px;

            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;

            background:
                rgba(7,13,22,0.94);

            border-top:
                1px solid
                rgba(255,255,255,0.12);

            border-bottom:
                1px solid
                rgba(255,255,255,0.08);

            box-sizing:border-box;
        "
    >

        <div
            id="topMatchClock"
            style="
                color:white;
                font-size:20px;
                font-weight:750;
                line-height:20px;
            "
        >
            5:00
        </div>

        <div
            id="topMatchState"
            style="
                margin-top:3px;

                color:
                    rgba(255,255,255,0.52);

                font-size:9px;
                font-weight:700;
                letter-spacing:1.5px;
            "
        >
            MATCH
        </div>

    </div>

    <div
        id="topOrangeScore"
        style="
            width:82px;

            display:flex;
            align-items:center;
            justify-content:center;

            background:
                linear-gradient(
                    180deg,
                    #ff9c2d,
                    #e76808
                );

            color:white;

            font-size:27px;
            font-weight:800;
        "
    >
        0
    </div>
`;


document.body.appendChild(
    topScoreboard
);


const topBlueScore =
    document.getElementById(
        "topBlueScore"
    );


const topOrangeScore =
    document.getElementById(
        "topOrangeScore"
    );


const topMatchClock =
    document.getElementById(
        "topMatchClock"
    );


const topMatchState =
    document.getElementById(
        "topMatchState"
    );


// ============================================================
// DETAILED SCOREBOARD
// ============================================================
//
// Holding Square by default opens this directly BELOW
// the permanent top scoreboard instead of dumping a giant
// panel into the middle of the screen.
// ============================================================

const detailedScoreboard =
    document.createElement(
        "div"
    );


detailedScoreboard.style.cssText = `
    position:fixed;

    top:75px;
    left:50%;

    transform:
        translateX(-50%)
        translateY(-5px);

    width:
        min(590px, 88vw);

    z-index:49;

    box-sizing:border-box;

    padding:
        12px 14px;

    border-radius:
        9px;

    background:
        rgba(5,11,20,0.90);

    border:
        1px solid
        rgba(255,255,255,0.11);

    box-shadow:
        0 12px 35px
        rgba(0,0,0,0.35);

    color:white;

    font-family:
        Arial,
        sans-serif;

    pointer-events:none;

    opacity:0;

    visibility:hidden;

    transition:
        opacity 0.10s ease,
        transform 0.10s ease;
`;


detailedScoreboard.innerHTML = `
    <div
        style="
            display:grid;

            grid-template-columns:
                1fr
                72px
                72px;

            gap:8px;

            padding:
                0 10px 7px;

            color:
                rgba(255,255,255,0.45);

            font-size:10px;

            font-weight:700;

            letter-spacing:1px;
        "
    >
        <div>PLAYER</div>
        <div style="text-align:center;">GOALS</div>
        <div style="text-align:center;">SCORE</div>
    </div>

    <div
        style="
            display:grid;

            grid-template-columns:
                1fr
                72px
                72px;

            gap:8px;

            align-items:center;

            padding:
                10px;

            border-radius:
                7px;

            background:
                linear-gradient(
                    90deg,
                    rgba(22,140,255,0.30),
                    rgba(22,140,255,0.06)
                );

            border-left:
                4px solid
                #168cff;
        "
    >
        <div
            style="
                font-weight:700;
            "
        >
            YOU
        </div>

        <div
            id="detailGoals"
            style="
                text-align:center;
                font-weight:700;
            "
        >
            0
        </div>

        <div
            id="detailPlayerScore"
            style="
                text-align:center;
                font-weight:700;
            "
        >
            0
        </div>
    </div>
`;


document.body.appendChild(
    detailedScoreboard
);


const detailGoals =
    document.getElementById(
        "detailGoals"
    );


const detailPlayerScore =
    document.getElementById(
        "detailPlayerScore"
    );


// ============================================================
// SCOREBOARD VISIBILITY
// ============================================================

function updateDetailedScoreboard() {

    const visible =
        inputState.scoreboard
        &&
        !menuOpen;


    detailedScoreboard.style.opacity =
        visible
            ? "1"
            : "0";


    detailedScoreboard.style.visibility =
        visible
            ? "visible"
            : "hidden";


    detailedScoreboard.style.transform =
        visible
            ?
            "translateX(-50%) translateY(0)"
            :
            "translateX(-50%) translateY(-5px)";
}


// ============================================================
// BOOST HUD
// ============================================================

const boostHud =
    document.createElement(
        "div"
    );


boostHud.style.cssText = `
    position:fixed;

    right:24px;
    bottom:22px;

    z-index:50;

    width:94px;
    height:94px;

    border-radius:50%;

    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction:column;

    background:
        radial-gradient(
            circle,
            rgba(14,26,40,0.90) 0%,
            rgba(5,10,18,0.96) 68%
        );

    border:
        3px solid
        rgba(255,166,46,0.70);

    box-shadow:
        0 0 25px
        rgba(255,140,20,0.17);

    color:white;

    font-family:
        Arial,
        sans-serif;

    pointer-events:none;
    user-select:none;
`;


boostHud.innerHTML = `
    <div
        id="boostNumber"
        style="
            font-size:30px;
            font-weight:800;
            line-height:28px;
        "
    >
        33
    </div>

    <div
        style="
            margin-top:5px;

            font-size:9px;

            letter-spacing:1.6px;

            color:
                rgba(255,255,255,0.56);
        "
    >
        BOOST
    </div>
`;


document.body.appendChild(
    boostHud
);


const boostNumber =
    document.getElementById(
        "boostNumber"
    );


// ============================================================
// BOOST PADS
// ============================================================

const boostPads = [];


// Bigger than the visible pad.
//
// v0.6.2 made the player hit them too precisely.

const SMALL_PAD_PICKUP_RADIUS =
    4.35;


const BIG_PAD_PICKUP_RADIUS =
    5.65;


const SMALL_PAD_AMOUNT =
    12;


const BIG_PAD_AMOUNT =
    100;


const SMALL_PAD_RESPAWN =
    4;


const BIG_PAD_RESPAWN =
    10;


// ============================================================
// PAD GEOMETRY
// ============================================================

const smallPadGeometry =
    new THREE.CylinderGeometry(
        1.45,
        1.45,
        0.14,
        16
    );


const bigPadGeometry =
    new THREE.CylinderGeometry(
        2.05,
        2.05,
        0.18,
        20
    );


const smallPadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffb22d,
        emissive: 0x7a3500,
        emissiveIntensity: 1.1,
        roughness: 0.38,
        metalness: 0.08
    });


const bigPadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffd55c,
        emissive: 0xb85b00,
        emissiveIntensity: 1.35,
        roughness: 0.32,
        metalness: 0.10
    });


// ============================================================
// CREATE BOOST PAD
// ============================================================

function createBoostPad(
    x,
    z,
    big = false
) {

    const mesh =
        new THREE.Mesh(

            big
                ?
                bigPadGeometry
                :
                smallPadGeometry,

            big
                ?
                bigPadMaterial.clone()
                :
                smallPadMaterial.clone()
        );


    mesh.position.set(
        x,
        big
            ? 0.10
            : 0.08,
        z
    );


    mesh.receiveShadow =
        false;


    mesh.castShadow =
        false;


    scene.add(
        mesh
    );


    const pad = {

        x,
        z,

        big,

        mesh,

        active:
            true,

        timer:
            0,

        pickupRadius:
            big
                ?
                BIG_PAD_PICKUP_RADIUS
                :
                SMALL_PAD_PICKUP_RADIUS,

        amount:
            big
                ?
                BIG_PAD_AMOUNT
                :
                SMALL_PAD_AMOUNT,

        respawn:
            big
                ?
                BIG_PAD_RESPAWN
                :
                SMALL_PAD_RESPAWN
    };


    boostPads.push(
        pad
    );


    return pad;
}


// ============================================================
// BIG CORNER PADS
// ============================================================

createBoostPad(
    HALF_LENGTH - 14,
    HALF_WIDTH - 11,
    true
);


createBoostPad(
    HALF_LENGTH - 14,
    -HALF_WIDTH + 11,
    true
);


createBoostPad(
    -HALF_LENGTH + 14,
    HALF_WIDTH - 11,
    true
);


createBoostPad(
    -HALF_LENGTH + 14,
    -HALF_WIDTH + 11,
    true
);


// ============================================================
// MIDFIELD BIG PADS
// ============================================================

createBoostPad(
    0,
    HALF_WIDTH - 9,
    true
);


createBoostPad(
    0,
    -HALF_WIDTH + 9,
    true
);


// ============================================================
// SMALL PAD LANES
// ============================================================

const smallPadPositions = [

    [-68, -29],
    [-68, 29],

    [-48, -15],
    [-48, 15],

    [-29, -31],
    [-29, 31],

    [-17, -11],
    [-17, 11],

    [0, -25],
    [0, 25],

    [17, -11],
    [17, 11],

    [29, -31],
    [29, 31],

    [48, -15],
    [48, 15],

    [68, -29],
    [68, 29]
];


for (
    const [
        x,
        z
    ]
    of smallPadPositions
) {

    createBoostPad(
        x,
        z,
        false
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

        // ----------------------------------------------------
        // RESPAWN
        // ----------------------------------------------------

        if (
            !pad.active
        ) {

            pad.timer -=
                dt;


            if (
                pad.timer <= 0
            ) {

                pad.active =
                    true;


                pad.mesh.visible =
                    true;
            }


            continue;
        }


        // ----------------------------------------------------
        // CHEAP DISTANCE TEST
        // ----------------------------------------------------

        const dx =
            car.position.x -
            pad.x;


        const dz =
            car.position.z -
            pad.z;


        const distanceSquared =
            dx * dx +
            dz * dz;


        const pickupRadiusSquared =
            pad.pickupRadius *
            pad.pickupRadius;


        if (
            distanceSquared >
            pickupRadiusSquared
        ) {

            continue;
        }


        // Don't grab pads while flying ten metres above them.

        if (
            car.position.y >
            4.0
        ) {

            continue;
        }


        // ----------------------------------------------------
        // PICKUP
        // ----------------------------------------------------

        if (
            boostAmount >= 100
        ) {

            continue;
        }


        boostAmount =
            Math.min(
                100,

                boostAmount +
                pad.amount
            );


        pad.active =
            false;


        pad.timer =
            pad.respawn;


        pad.mesh.visible =
            false;
    }
}


// ============================================================
// BOOST PAD ANIMATION
// ============================================================

function animateBoostPads(
    elapsed
) {

    // Only a tiny visual animation.
    // No per-pad physics allocations.

    for (
        let i = 0;
        i < boostPads.length;
        i++
    ) {

        const pad =
            boostPads[i];


        if (
            !pad.active
        ) {

            continue;
        }


        pad.mesh.rotation.y =
            elapsed *
            (
                pad.big
                    ? 0.65
                    : 0.45
            );
    }
}


// ============================================================
// GAME STATE CONSTANTS
// ============================================================

const GAME_STATE = {

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


// ============================================================
// MATCH STATE
// ============================================================

let gameState =
    GAME_STATE.PLAYING;


let blueScore =
    0;


let orangeScore =
    0;


let playerGoals =
    0;


let playerScore =
    0;


let matchTime =
    5 * 60;


let celebrationTimer =
    0;


let lastScoringTeam =
    null;


// ============================================================
// CLOCK FORMAT
// ============================================================

function formatClock(
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
        `${minutes}:${
            String(secs)
                .padStart(
                    2,
                    "0"
                )
        }`
    );
}


// ============================================================
// UPDATE TOP SCOREBOARD
// ============================================================

function updateTopScoreboard() {

    topBlueScore.textContent =
        String(
            blueScore
        );


    topOrangeScore.textContent =
        String(
            orangeScore
        );


    if (
        gameState ===
        GAME_STATE.OVERTIME
    ) {

        topMatchClock.textContent =
            "OT";


        topMatchState.textContent =
            "GOLDEN GOAL";

    } else if (
        gameState ===
        GAME_STATE.FREEPLAY
    ) {

        topMatchClock.textContent =
            "∞";


        topMatchState.textContent =
            "FREE PLAY";

    } else if (
        gameState ===
        GAME_STATE.RESULTS
    ) {

        topMatchClock.textContent =
            "0:00";


        topMatchState.textContent =
            "FINAL";

    } else {

        topMatchClock.textContent =
            formatClock(
                matchTime
            );


        topMatchState.textContent =
            gameState ===
            GAME_STATE.CELEBRATION
                ?
                "GOAL"
                :
                "MATCH";
    }


    detailGoals.textContent =
        String(
            playerGoals
        );


    detailPlayerScore.textContent =
        String(
            playerScore
        );


    boostNumber.textContent =
        String(
            Math.round(
                boostAmount
            )
        );
}


// ============================================================
// RESET REQUEST
// ============================================================
//
// Actual resetCar/resetBall functions are in Part 3.
//
// This wrapper is safe to call from the input system now;
// the function declarations are hoisted once all four parts
// are pasted together.
// ============================================================

function requestResetShot() {

    if (
        gameState ===
        GAME_STATE.RESULTS
    ) {

        return;
    }


    resetCar();


    resetBall();
}


// ============================================================
// INITIAL UI STATE
// ============================================================

applyGraphicsPreset();


updateControllerDisplayVisibility();


updateTopScoreboard();


// ============================================================
// END PART 2 / 4
//
// PART 3 GOES DIRECTLY BELOW.
//
// PART 3:
// - car reset / ball reset
// - responsive ground handling
// - powerslide
// - jumping
// - double jump
// - directional dodges
// - flip cancelling
// - recovery when upside-down
// - directional air roll
// - boost
// - arena collisions
// - ball physics
// - car-ball collision
//
// DO NOT RUN YET.
// ============================================================
// ============================================================
// BOOSTBALL v0.6.3 — TRACTION CONTROL
//
// PART 3 / 4
//
// - Car / ball reset
// - Ground traction rebuild
// - Steering
// - Powerslide
// - Jump + variable jump
// - Double jump
// - Directional dodge
// - Flip cancel
// - Upside-down recovery
// - Aerial pitch / yaw
// - Directional air roll
// - Boost
// - Car arena collision
// - Ball physics
// - Car-ball collision
//
// PASTE DIRECTLY BELOW PART 2.
// ============================================================


// ============================================================
// RESET CAR
// ============================================================

function resetCar() {

    car.position.set(
        -28,
        GROUNDED_CAR_HEIGHT,
        0
    );


    car.quaternion.identity();


    carRotation =
        0;


    carVelocity.set(
        0,
        0,
        0
    );


    verticalVelocity =
        0;


    grounded =
        true;


    groundContact =
        true;


    jumpHeldTime =
        0;


    firstJumpUsed =
        false;


    secondJumpUsed =
        false;


    airPitchVelocity =
        0;


    airYawVelocity =
        0;


    airRollVelocity =
        0;


    dodgeActive =
        false;


    dodgeTimer =
        0;


    dodgePitchDirection =
        0;


    dodgeSideDirection =
        0;


    dodgeRotationRemaining =
        0;


    flipCancelled =
        false;
}


// ============================================================
// RESET BALL
// ============================================================

function resetBall() {

    ball.position.set(
        0,
        BALL_RADIUS + 0.05,
        0
    );


    ballVelocity.set(
        0,
        0,
        0
    );
}


// ============================================================
// KICKOFF RESET
// ============================================================

function resetKickoff() {

    resetCar();


    resetBall();


    boostAmount =
        33;
}


// ============================================================
// HORIZONTAL SPEED HELPERS
// ============================================================

function getHorizontalSpeed() {

    return Math.sqrt(
        carVelocity.x *
            carVelocity.x
        +
        carVelocity.z *
            carVelocity.z
    );
}


// ============================================================
// FLAT CAR FORWARD
// ============================================================

function getFlatCarForward(
    target
) {

    getCarForward(
        target
    );


    target.y =
        0;


    if (
        target.lengthSq() <
        0.0001
    ) {

        target.set(
            Math.cos(
                carRotation
            ),
            0,
            Math.sin(
                carRotation
            )
        );

    } else {

        target.normalize();
    }


    return target;
}


// ============================================================
// FLAT CAR RIGHT
// ============================================================

function getFlatCarRight(
    target
) {

    getFlatCarForward(
        tempFlatForward
    );


    target.set(
        -tempFlatForward.z,
        0,
        tempFlatForward.x
    );


    return target;
}


// ============================================================
// CLAMP HORIZONTAL SPEED
// ============================================================

function clampHorizontalSpeed(
    maximum
) {

    const speedSquared =
        carVelocity.x *
            carVelocity.x
        +
        carVelocity.z *
            carVelocity.z;


    const maximumSquared =
        maximum *
        maximum;


    if (
        speedSquared <=
        maximumSquared
    ) {

        return;
    }


    const speed =
        Math.sqrt(
            speedSquared
        );


    if (
        speed <=
        0.0001
    ) {

        return;
    }


    const scale =
        maximum /
        speed;


    carVelocity.x *=
        scale;


    carVelocity.z *=
        scale;
}


// ============================================================
// MOVE VALUE TOWARD TARGET
// ============================================================

function moveToward(
    current,
    target,
    amount
) {

    if (
        current <
        target
    ) {

        return Math.min(
            current + amount,
            target
        );
    }


    if (
        current >
        target
    ) {

        return Math.max(
            current - amount,
            target
        );
    }


    return target;
}


// ============================================================
// SMOOTH VALUE
// ============================================================

function dampValue(
    current,
    target,
    response,
    dt
) {

    const blend =
        1 -
        Math.exp(
            -response *
            dt
        );


    return (
        current +
        (
            target -
            current
        ) *
        blend
    );
}


// ============================================================
// APPLY WORLD-SPACE ROTATION
// ============================================================

function rotateCarAroundWorldAxis(
    axis,
    angle
) {

    if (
        Math.abs(
            angle
        ) <
        0.000001
    ) {

        return;
    }


    tempQuaternion
        .setFromAxisAngle(
            axis,
            angle
        );


    car.quaternion
        .premultiply(
            tempQuaternion
        )
        .normalize();
}


// ============================================================
// APPLY LOCAL-SPACE ROTATION
// ============================================================

function rotateCarAroundLocalAxis(
    localAxis,
    angle
) {

    if (
        Math.abs(
            angle
        ) <
        0.000001
    ) {

        return;
    }


    tempAxis
        .copy(
            localAxis
        )
        .applyQuaternion(
            car.quaternion
        )
        .normalize();


    rotateCarAroundWorldAxis(
        tempAxis,
        angle
    );
}


// ============================================================
// CAR UPRIGHT AMOUNT
// ============================================================

function getCarUprightAmount() {

    getCarUp(
        tempUp
    );


    return tempUp.dot(
        WORLD_UP
    );
}


// ============================================================
// GROUND CONTACT TEST
// ============================================================
//
// This is intentionally MUCH cheaper than v0.6.2's
// multi-point spring system.
//
// We're building a car-soccer game, not sending the microwave
// to Nürburgring suspension engineering school.
// ============================================================

function detectGroundContact() {

    const uprightAmount =
        getCarUprightAmount();


    const lowEnough =
        car.position.y <=
        GROUNDED_CAR_HEIGHT +
            0.24;


    const wheelsFacingGround =
        uprightAmount >
        0.40;


    groundContact =
        lowEnough;


    grounded =
        lowEnough
        &&
        wheelsFacingGround
        &&
        verticalVelocity <=
            2.0;


    return grounded;
}


// ============================================================
// SNAP CAR UPRIGHT ON NORMAL LANDING
// ============================================================

function settleCarToGround(
    dt
) {

    if (
        !grounded
    ) {

        return;
    }


    // --------------------------------------------------------
    // FLOOR POSITION
    // --------------------------------------------------------

    car.position.y =
        GROUNDED_CAR_HEIGHT;


    if (
        verticalVelocity <
        0
    ) {

        verticalVelocity =
            0;
    }


    // --------------------------------------------------------
    // KEEP YAW, REMOVE AIRBORNE PITCH/ROLL
    // --------------------------------------------------------

    getFlatCarForward(
        tempFlatForward
    );


    carRotation =
        Math.atan2(
            tempFlatForward.z,
            tempFlatForward.x
        );


    tempQuaternion
        .setFromAxisAngle(
            WORLD_UP,
            -carRotation
        );


    // Our model's local +X is forward.
    //
    // THREE yaw direction requires negative angle here
    // to align +X with the flat-forward vector.

    const blend =
        1 -
        Math.exp(
            -16 *
            dt
        );


    car.quaternion.slerp(
        tempQuaternion,
        blend
    );


    airPitchVelocity =
        dampValue(
            airPitchVelocity,
            0,
            14,
            dt
        );


    airYawVelocity =
        dampValue(
            airYawVelocity,
            0,
            14,
            dt
        );


    airRollVelocity =
        dampValue(
            airRollVelocity,
            0,
            14,
            dt
        );
}


// ============================================================
// GROUND DRIVING
// ============================================================

function updateGroundDriving(
    dt
) {

    getFlatCarForward(
        tempForward
    );


    getFlatCarRight(
        tempRight
    );


    // --------------------------------------------------------
    // BREAK VELOCITY INTO FORWARD + SIDEWAYS COMPONENTS
    // --------------------------------------------------------

    let forwardSpeed =
        carVelocity.dot(
            tempForward
        );


    let lateralSpeed =
        carVelocity.dot(
            tempRight
        );


    const throttle =
        inputState.throttle;


    const reverse =
        inputState.reverse;


    const powersliding =
        inputState.powerslide;


    // --------------------------------------------------------
    // DRIVE / BRAKE / REVERSE
    // --------------------------------------------------------

    if (
        throttle >
        0.01
    ) {

        if (
            forwardSpeed <
            -0.5
        ) {

            // Braking while rolling backwards.

            forwardSpeed =
                moveToward(
                    forwardSpeed,
                    0,
                    BRAKING *
                        throttle *
                        dt
                );

        } else {

            forwardSpeed +=
                ACCELERATION *
                throttle *
                dt;


            if (
                !inputState.boost
            ) {

                forwardSpeed =
                    Math.min(
                        forwardSpeed,
                        DRIVE_TOP_SPEED
                    );
            }
        }
    }


    if (
        reverse >
        0.01
    ) {

        if (
            forwardSpeed >
            0.5
        ) {

            // Brake first when travelling forwards.

            forwardSpeed =
                moveToward(
                    forwardSpeed,
                    0,
                    BRAKING *
                        reverse *
                        dt
                );

        } else {

            forwardSpeed -=
                REVERSE_ACCELERATION *
                reverse *
                dt;


            forwardSpeed =
                Math.max(
                    forwardSpeed,
                    -REVERSE_TOP_SPEED
                );
        }
    }


    // --------------------------------------------------------
    // COAST DRAG
    // --------------------------------------------------------

    if (
        throttle <=
            0.01
        &&
        reverse <=
            0.01
    ) {

        const dragAmount =
            COAST_DRAG *
            Math.max(
                1,
                Math.abs(
                    forwardSpeed
                )
            ) *
            dt;


        forwardSpeed =
            moveToward(
                forwardSpeed,
                0,
                dragAmount
            );

    } else {

        const poweredDrag =
            POWERED_DRAG *
            Math.abs(
                forwardSpeed
            ) *
            dt;


        if (
            Math.abs(
                forwardSpeed
            ) >
            DRIVE_TOP_SPEED
            &&
            !inputState.boost
        ) {

            forwardSpeed =
                moveToward(
                    forwardSpeed,
                    Math.sign(
                        forwardSpeed
                    ) *
                    DRIVE_TOP_SPEED,
                    poweredDrag
                );
        }
    }


    // --------------------------------------------------------
    // TYRE GRIP
    // --------------------------------------------------------
    //
    // THIS is the big v0.6.2 ice-rink fix.
    //
    // Normal driving destroys sideways velocity quickly.
    // Powerslide deliberately allows it to survive.
    // --------------------------------------------------------

    const grip =
        powersliding
            ?
            GROUND_LATERAL_GRIP_SLIDE
            :
            GROUND_LATERAL_GRIP;


    const lateralRetention =
        Math.exp(
            -grip *
            dt
        );


    lateralSpeed *=
        lateralRetention;


    // --------------------------------------------------------
    // REBUILD HORIZONTAL VELOCITY
    // --------------------------------------------------------

    carVelocity.x =
        tempForward.x *
            forwardSpeed
        +
        tempRight.x *
            lateralSpeed;


    carVelocity.z =
        tempForward.z *
            forwardSpeed
        +
        tempRight.z *
            lateralSpeed;


    // --------------------------------------------------------
    // STEERING
    // --------------------------------------------------------

    const absoluteSpeed =
        Math.abs(
            forwardSpeed
        );


    const speedFraction =
        THREE.MathUtils.clamp(
            absoluteSpeed /
                DRIVE_TOP_SPEED,
            0,
            1
        );


    const steerRate =
        THREE.MathUtils.lerp(
            LOW_SPEED_STEER,
            HIGH_SPEED_STEER,
            speedFraction
        );


    let steeringMultiplier =
        STEERING_RESPONSE;


    if (
        powersliding
    ) {

        steeringMultiplier *=
            POWERSLIDE_STEER_MULTIPLIER;
    }


    // Reverse steering should naturally invert.

    let movementDirection =
        1;


    if (
        forwardSpeed <
        -0.5
    ) {

        movementDirection =
            -1;
    }


    // Very low-speed steering is reduced so the car
    // doesn't rotate on the spot like a supermarket trolley.

    const lowSpeedAuthority =
        THREE.MathUtils.clamp(
            absoluteSpeed / 4.0,
            0.18,
            1
        );


    const yawChange =
        -inputState.steer *
        steerRate *
        steeringMultiplier *
        movementDirection *
        lowSpeedAuthority *
        dt;


    carRotation +=
        yawChange;


    // --------------------------------------------------------
    // GROUND QUATERNION
    // --------------------------------------------------------

    tempQuaternion
        .setFromAxisAngle(
            WORLD_UP,
            -carRotation
        );


    car.quaternion.copy(
        tempQuaternion
    );


    // --------------------------------------------------------
    // ROTATE VELOCITY WITH THE CAR SLIGHTLY
    // --------------------------------------------------------
    //
    // This gives the steering immediate bite instead of
    // turning the model while momentum continues straight.
    // --------------------------------------------------------

    if (
        Math.abs(
            yawChange
        ) >
        0.00001
    ) {

        const velocityTurnAmount =
            powersliding
                ?
                yawChange * 0.22
                :
                yawChange * 0.72;


        const cos =
            Math.cos(
                velocityTurnAmount
            );


        const sin =
            Math.sin(
                velocityTurnAmount
            );


        const oldX =
            carVelocity.x;


        const oldZ =
            carVelocity.z;


        carVelocity.x =
            oldX * cos -
            oldZ * sin;


        carVelocity.z =
            oldX * sin +
            oldZ * cos;
    }
}


// ============================================================
// BOOST
// ============================================================

function updateBoost(
    dt
) {

    if (
        !inputState.boost
        ||
        boostAmount <=
            0
    ) {

        return;
    }


    getCarForward(
        tempForward
    );


    // --------------------------------------------------------
    // BOOST ACCELERATION
    // --------------------------------------------------------

    carVelocity.x +=
        tempForward.x *
        BOOST_ACCELERATION *
        dt;


    carVelocity.z +=
        tempForward.z *
        BOOST_ACCELERATION *
        dt;


    // Aerial boost also pushes vertically if the nose
    // is actually pointing vertically.

    if (
        !grounded
    ) {

        verticalVelocity +=
            tempForward.y *
            BOOST_ACCELERATION *
            dt;
    }


    boostAmount -=
        BOOST_USAGE *
        dt;


    if (
        boostAmount <
        0
    ) {

        boostAmount =
            0;
    }


    // --------------------------------------------------------
    // BOOST SPEED LIMIT
    // --------------------------------------------------------

    clampHorizontalSpeed(
        BOOST_TOP_SPEED
    );
}


// ============================================================
// BEGIN JUMP
// ============================================================

function beginFirstJump() {

    grounded =
        false;


    groundContact =
        false;


    firstJumpUsed =
        true;


    secondJumpUsed =
        false;


    jumpHeldTime =
        0;


    verticalVelocity =
        Math.max(
            verticalVelocity,
            0
        )
        +
        JUMP_IMPULSE;


    // Tiny immediate separation from ground.

    car.position.y +=
        0.06;
}


// ============================================================
// BEGIN DOUBLE JUMP
// ============================================================

function beginDoubleJump() {

    if (
        secondJumpUsed
    ) {

        return;
    }


    secondJumpUsed =
        true;


    verticalVelocity =
        Math.max(
            verticalVelocity,
            0
        )
        +
        DOUBLE_JUMP_IMPULSE;
}


// ============================================================
// BEGIN DODGE
// ============================================================

function beginDodge(
    pitchDirection,
    sideDirection
) {

    if (
        secondJumpUsed
    ) {

        return;
    }


    secondJumpUsed =
        true;


    dodgeActive =
        true;


    dodgeTimer =
        0;


    flipCancelled =
        false;


    // --------------------------------------------------------
    // NORMALISE DODGE INPUT
    // --------------------------------------------------------

    const magnitude =
        Math.sqrt(
            pitchDirection *
                pitchDirection
            +
            sideDirection *
                sideDirection
        );


    if (
        magnitude >
        1
    ) {

        pitchDirection /=
            magnitude;


        sideDirection /=
            magnitude;
    }


    dodgePitchDirection =
        pitchDirection;


    dodgeSideDirection =
        sideDirection;


    // --------------------------------------------------------
    // TRANSLATIONAL IMPULSE
    // --------------------------------------------------------

    getFlatCarForward(
        tempForward
    );


    getFlatCarRight(
        tempRight
    );


    tempDirection.set(
        0,
        0,
        0
    );


    tempDirection.addScaledVector(
        tempForward,
        -pitchDirection
    );


    tempDirection.addScaledVector(
        tempRight,
        sideDirection
    );


    if (
        tempDirection.lengthSq() <
        0.01
    ) {

        tempDirection.copy(
            tempForward
        );
    }


    tempDirection.normalize();


    carVelocity.x +=
        tempDirection.x *
        DODGE_HORIZONTAL_IMPULSE;


    carVelocity.z +=
        tempDirection.z *
        DODGE_HORIZONTAL_IMPULSE;


    verticalVelocity =
        Math.max(
            verticalVelocity,
            0
        )
        +
        DODGE_VERTICAL_IMPULSE;


    clampHorizontalSpeed(
        ABSOLUTE_SPEED_LIMIT
    );


    // --------------------------------------------------------
    // ROTATIONAL AMOUNT
    // --------------------------------------------------------

    dodgeRotationRemaining =
        Math.PI * 2;
}


// ============================================================
// UPDATE DODGE
// ============================================================

function updateDodge(
    dt
) {

    if (
        !dodgeActive
    ) {

        return;
    }


    dodgeTimer +=
        dt;


    // --------------------------------------------------------
    // FLIP CANCEL
    // --------------------------------------------------------
    //
    // If doing a front/back flip, moving the stick in the
    // opposite pitch direction reduces the remaining pitch
    // rotation.
    //
    // It DOES NOT delete translational momentum.
    // --------------------------------------------------------

    if (
        Math.abs(
            dodgePitchDirection
        ) >
        0.35
    ) {

        const oppositePitch =
            Math.sign(
                inputState.pitch
            ) ===
            -Math.sign(
                dodgePitchDirection
            )
            &&
            Math.abs(
                inputState.pitch
            ) >
            0.45;


        if (
            oppositePitch
        ) {

            flipCancelled =
                true;


            dodgeRotationRemaining =
                Math.max(
                    0,
                    dodgeRotationRemaining -
                        FLIP_CANCEL_STRENGTH *
                        dt
                );
        }
    }


    // --------------------------------------------------------
    // DODGE ROTATION
    // --------------------------------------------------------

    let rotationThisFrame =
        Math.min(
            DODGE_ROTATION_SPEED *
                dt,
            dodgeRotationRemaining
        );


    if (
        flipCancelled
    ) {

        rotationThisFrame *=
            0.25;
    }


    if (
        rotationThisFrame >
        0
    ) {

        // ----------------------------------------------------
        // FORWARD / BACK FLIP
        // ----------------------------------------------------

        if (
            Math.abs(
                dodgePitchDirection
            ) >
            0.05
        ) {

            getCarRight(
                tempAxis
            );


            rotateCarAroundWorldAxis(

                tempAxis,

                rotationThisFrame *
                dodgePitchDirection
            );
        }


        // ----------------------------------------------------
        // SIDE FLIP
        // ----------------------------------------------------

        if (
            Math.abs(
                dodgeSideDirection
            ) >
            0.05
        ) {

            getCarForward(
                tempAxis
            );


            rotateCarAroundWorldAxis(

                tempAxis,

                -rotationThisFrame *
                dodgeSideDirection
            );
        }


        dodgeRotationRemaining -=
            rotationThisFrame;
    }


    // --------------------------------------------------------
    // END DODGE
    // --------------------------------------------------------

    if (
        dodgeTimer >=
        DODGE_DURATION
        ||
        dodgeRotationRemaining <=
            0.01
    ) {

        dodgeActive =
            false;


        dodgeTimer =
            0;


        dodgeRotationRemaining =
            0;
    }
}


// ============================================================
// UPSIDE-DOWN / SIDE RECOVERY
// ============================================================

function attemptGroundRecovery() {

    if (
        !groundContact
        ||
        grounded
    ) {

        return false;
    }


    const uprightAmount =
        getCarUprightAmount();


    // Already mostly upright?
    // Let normal landing logic handle it.

    if (
        uprightAmount >
        0.45
    ) {

        return false;
    }


    // --------------------------------------------------------
    // CHOOSE RECOVERY ROLL DIRECTION
    // --------------------------------------------------------

    let recoveryDirection =
        inputState.steer;


    if (
        Math.abs(
            recoveryDirection
        ) <
        0.15
    ) {

        getCarRight(
            tempRight
        );


        recoveryDirection =
            tempRight.y >=
                0
                ?
                1
                :
                -1;
    }


    getCarForward(
        tempAxis
    );


    rotateCarAroundWorldAxis(

        tempAxis,

        recoveryDirection *
        RECOVERY_ROLL_SPEED *
        0.11
    );


    verticalVelocity =
        Math.max(
            verticalVelocity,
            RECOVERY_POP
        );


    car.position.y +=
        0.12;


    groundContact =
        false;


    return true;
}


// ============================================================
// JUMP INPUT
// ============================================================

function updateJump(
    dt
) {

    // --------------------------------------------------------
    // NEW JUMP PRESS
    // --------------------------------------------------------

    if (
        inputState.jumpPressed
    ) {

        // ----------------------------------------------------
        // UPSIDE-DOWN RECOVERY
        // ----------------------------------------------------

        if (
            attemptGroundRecovery()
        ) {

            return;
        }


        // ----------------------------------------------------
        // FIRST JUMP
        // ----------------------------------------------------

        if (
            grounded
        ) {

            beginFirstJump();

            return;
        }


        // ----------------------------------------------------
        // SECOND JUMP / DODGE
        // ----------------------------------------------------

        if (
            firstJumpUsed
            &&
            !secondJumpUsed
        ) {

            const dodgePitch =
                inputState.pitch;


            const dodgeSide =
                inputState.steer;


            const dodgeMagnitude =
                Math.sqrt(
                    dodgePitch *
                        dodgePitch
                    +
                    dodgeSide *
                        dodgeSide
                );


            if (
                dodgeMagnitude >
                0.38
            ) {

                beginDodge(
                    dodgePitch,
                    dodgeSide
                );

            } else {

                beginDoubleJump();
            }
        }
    }


    // --------------------------------------------------------
    // VARIABLE JUMP HEIGHT
    // --------------------------------------------------------

    if (
        inputState.jump
        &&
        firstJumpUsed
        &&
        jumpHeldTime <
            JUMP_HOLD_TIME
        &&
        !secondJumpUsed
    ) {

        verticalVelocity +=
            JUMP_HOLD_FORCE *
            dt;


        jumpHeldTime +=
            dt;
    }
}


// ============================================================
// AERIAL CONTROL
// ============================================================

function updateAerialControl(
    dt
) {

    if (
        grounded
    ) {

        return;
    }


    // --------------------------------------------------------
    // DODGE INPUT LOCK
    // --------------------------------------------------------

    const dodgeLocked =
        dodgeActive
        &&
        dodgeTimer <
            DODGE_INPUT_LOCK_TIME;


    if (
        dodgeLocked
    ) {

        return;
    }


    // --------------------------------------------------------
    // PITCH
    // --------------------------------------------------------
    //
    // Stick forward / W:
    // inputState.pitch is negative.
    //
    // Negative pitch velocity = nose DOWN.
    // --------------------------------------------------------

    const targetPitch =
        inputState.pitch *
        AIR_PITCH_SPEED;


    airPitchVelocity =
        dampValue(
            airPitchVelocity,
            targetPitch,
            AIR_ROTATION_RESPONSE,
            dt
        );


    // --------------------------------------------------------
    // YAW
    // --------------------------------------------------------

    const targetYaw =
        -inputState.steer *
        AIR_YAW_SPEED;


    airYawVelocity =
        dampValue(
            airYawVelocity,
            targetYaw,
            AIR_ROTATION_RESPONSE,
            dt
        );


    // --------------------------------------------------------
    // DIRECTIONAL AIR ROLL
    // --------------------------------------------------------

    let rollInput =
        0;


    if (
        inputState.airRollLeft
    ) {

        rollInput -=
            1;
    }


    if (
        inputState.airRollRight
    ) {

        rollInput +=
            1;
    }


    const targetRoll =
        rollInput *
        AIR_ROLL_SPEED;


    airRollVelocity =
        dampValue(
            airRollVelocity,
            targetRoll,
            AIR_ROTATION_RESPONSE,
            dt
        );


    // --------------------------------------------------------
    // APPLY PITCH
    // --------------------------------------------------------

    if (
        Math.abs(
            airPitchVelocity
        ) >
        0.0001
    ) {

        getCarRight(
            tempAxis
        );


        rotateCarAroundWorldAxis(

            tempAxis,

            airPitchVelocity *
            dt
        );
    }


    // --------------------------------------------------------
    // APPLY YAW
    // --------------------------------------------------------

    if (
        Math.abs(
            airYawVelocity
        ) >
        0.0001
    ) {

        getCarUp(
            tempAxis
        );


        rotateCarAroundWorldAxis(

            tempAxis,

            airYawVelocity *
            dt
        );
    }


    // --------------------------------------------------------
    // APPLY ROLL
    // --------------------------------------------------------

    if (
        Math.abs(
            airRollVelocity
        ) >
        0.0001
    ) {

        getCarForward(
            tempAxis
        );


        rotateCarAroundWorldAxis(

            tempAxis,

            airRollVelocity *
            dt
        );
    }


    // --------------------------------------------------------
    // AIR INPUT RELEASE DAMPING
    // --------------------------------------------------------

    if (
        Math.abs(
            inputState.pitch
        ) <
        0.05
    ) {

        airPitchVelocity =
            dampValue(
                airPitchVelocity,
                0,
                4.5,
                dt
            );
    }


    if (
        Math.abs(
            inputState.steer
        ) <
        0.05
    ) {

        airYawVelocity =
            dampValue(
                airYawVelocity,
                0,
                4.5,
                dt
            );
    }


    if (
        rollInput ===
        0
    ) {

        airRollVelocity =
            dampValue(
                airRollVelocity,
                0,
                5.0,
                dt
            );
    }
}


// ============================================================
// GRAVITY
// ============================================================

function updateCarGravity(
    dt
) {

    if (
        grounded
    ) {

        return;
    }


    verticalVelocity -=
        GRAVITY *
        dt;
}


// ============================================================
// CAR POSITION INTEGRATION
// ============================================================

function integrateCarPosition(
    dt
) {

    car.position.x +=
        carVelocity.x *
        dt;


    car.position.z +=
        carVelocity.z *
        dt;


    car.position.y +=
        verticalVelocity *
        dt;
}


// ============================================================
// CAR FLOOR COLLISION
// ============================================================

function resolveCarFloorCollision() {

    // --------------------------------------------------------
    // NORMAL WHEEL LANDING
    // --------------------------------------------------------

    const uprightAmount =
        getCarUprightAmount();


    if (
        car.position.y <=
        GROUNDED_CAR_HEIGHT
        &&
        uprightAmount >
        0.40
    ) {

        car.position.y =
            GROUNDED_CAR_HEIGHT;


        if (
            verticalVelocity <
            0
        ) {

            verticalVelocity =
                0;
        }


        groundContact =
            true;


        grounded =
            true;


        firstJumpUsed =
            false;


        secondJumpUsed =
            false;


        jumpHeldTime =
            0;


        dodgeActive =
            false;


        dodgeTimer =
            0;


        dodgeRotationRemaining =
            0;


        return;
    }


    // --------------------------------------------------------
    // ROOF / SIDE CONTACT
    // --------------------------------------------------------
    //
    // Don't let the centre of the car fall through the field.
    // Keep enough height for recovery.
    // --------------------------------------------------------

    const minimumChassisHeight =
        0.68;


    if (
        car.position.y <
        minimumChassisHeight
    ) {

        car.position.y =
            minimumChassisHeight;


        if (
            verticalVelocity <
            0
        ) {

            verticalVelocity *=
                -0.08;
        }


        groundContact =
            true;


        grounded =
            false;


        // Friction while scraping roof/side.

        carVelocity.x *=
            0.985;


        carVelocity.z *=
            0.985;

    } else {

        groundContact =
            false;
    }
}


// ============================================================
// CAR SIDE WALL COLLISION
// ============================================================

function resolveCarSideWalls() {

    const carRadius =
        1.45;


    const maximumZ =
        HALF_WIDTH -
        carRadius;


    if (
        car.position.z >
        maximumZ
    ) {

        car.position.z =
            maximumZ;


        if (
            carVelocity.z >
            0
        ) {

            carVelocity.z *=
                -0.35;
        }
    }


    if (
        car.position.z <
        -maximumZ
    ) {

        car.position.z =
            -maximumZ;


        if (
            carVelocity.z <
            0
        ) {

            carVelocity.z *=
                -0.35;
        }
    }
}


// ============================================================
// IS CAR INSIDE GOAL OPENING
// ============================================================

function carFitsGoalOpening() {

    const halfCarWidth =
        1.35;


    const insideWidth =
        Math.abs(
            car.position.z
        )
        +
        halfCarWidth
        <
        GOAL_WIDTH / 2;


    const underCrossbar =
        car.position.y <
        GOAL_HEIGHT -
            1.0;


    return (
        insideWidth
        &&
        underCrossbar
    );
}


// ============================================================
// CAR END WALL / GOAL COLLISION
// ============================================================

function resolveCarEndWalls() {

    const carRadius =
        2.15;


    const fitsGoal =
        carFitsGoalOpening();


    // --------------------------------------------------------
    // REGULAR END WALL
    // --------------------------------------------------------

    if (
        !fitsGoal
    ) {

        const maximumX =
            HALF_LENGTH -
            carRadius;


        if (
            car.position.x >
            maximumX
        ) {

            car.position.x =
                maximumX;


            if (
                carVelocity.x >
                0
            ) {

                carVelocity.x *=
                    -0.35;
            }
        }


        if (
            car.position.x <
            -maximumX
        ) {

            car.position.x =
                -maximumX;


            if (
                carVelocity.x <
                0
            ) {

                carVelocity.x *=
                    -0.35;
            }
        }


        return;
    }


    // --------------------------------------------------------
    // INSIDE GOAL DEPTH
    // --------------------------------------------------------

    const maximumGoalX =
        HALF_LENGTH +
        GOAL_DEPTH -
        carRadius;


    if (
        car.position.x >
        maximumGoalX
    ) {

        car.position.x =
            maximumGoalX;


        if (
            carVelocity.x >
            0
        ) {

            carVelocity.x *=
                -0.30;
        }
    }


    if (
        car.position.x <
        -maximumGoalX
    ) {

        car.position.x =
            -maximumGoalX;


        if (
            carVelocity.x <
            0
        ) {

            carVelocity.x *=
                -0.30;
        }
    }
}


// ============================================================
// CAR GOAL SIDE WALLS
// ============================================================

function resolveCarGoalSides() {

    const insidePositiveGoal =
        car.position.x >
        HALF_LENGTH -
            0.5;


    const insideNegativeGoal =
        car.position.x <
        -HALF_LENGTH +
            0.5;


    if (
        !insidePositiveGoal
        &&
        !insideNegativeGoal
    ) {

        return;
    }


    const carHalfWidth =
        1.30;


    const maximumGoalZ =
        GOAL_WIDTH / 2 -
        carHalfWidth;


    if (
        car.position.z >
        maximumGoalZ
    ) {

        car.position.z =
            maximumGoalZ;


        if (
            carVelocity.z >
            0
        ) {

            carVelocity.z *=
                -0.30;
        }
    }


    if (
        car.position.z <
        -maximumGoalZ
    ) {

        car.position.z =
            -maximumGoalZ;


        if (
            carVelocity.z <
            0
        ) {

            carVelocity.z *=
                -0.30;
        }
    }
}


// ============================================================
// CAR ARENA COLLISION
// ============================================================

function resolveCarArenaCollision() {

    resolveCarSideWalls();


    resolveCarEndWalls();


    resolveCarGoalSides();
}


// ============================================================
// UPDATE CAR
// ============================================================

function updateCar(
    dt
) {

    // --------------------------------------------------------
    // CURRENT GROUND STATE
    // --------------------------------------------------------

    detectGroundContact();


    // --------------------------------------------------------
    // JUMP
    // --------------------------------------------------------

    updateJump(
        dt
    );


    // --------------------------------------------------------
    // DRIVING / AERIAL
    // --------------------------------------------------------

    if (
        grounded
    ) {

        updateGroundDriving(
            dt
        );

    } else {

        updateAerialControl(
            dt
        );
    }


    // --------------------------------------------------------
    // DODGE
    // --------------------------------------------------------

    updateDodge(
        dt
    );


    // --------------------------------------------------------
    // BOOST
    // --------------------------------------------------------

    updateBoost(
        dt
    );


    // --------------------------------------------------------
    // ABSOLUTE EMERGENCY SPEED CAP
    // --------------------------------------------------------

    clampHorizontalSpeed(
        ABSOLUTE_SPEED_LIMIT
    );


    // --------------------------------------------------------
    // GRAVITY
    // --------------------------------------------------------

    updateCarGravity(
        dt
    );


    // --------------------------------------------------------
    // INTEGRATE
    // --------------------------------------------------------

    integrateCarPosition(
        dt
    );


    // --------------------------------------------------------
    // COLLISIONS
    // --------------------------------------------------------

    resolveCarFloorCollision();


    resolveCarArenaCollision();


    // --------------------------------------------------------
    // NORMAL GROUND SETTLE
    // --------------------------------------------------------

    if (
        grounded
    ) {

        settleCarToGround(
            dt
        );
    }
}


// ============================================================
// BALL CONSTANTS
// ============================================================

const BALL_GRAVITY =
    25;


const BALL_BOUNCE =
    0.67;


const BALL_WALL_BOUNCE =
    0.76;


const BALL_GROUND_DRAG =
    0.992;


const BALL_AIR_DRAG =
    0.999;


const BALL_MAX_SPEED =
    58;


// ============================================================
// CLAMP BALL SPEED
// ============================================================

function clampBallSpeed() {

    const speedSquared =
        ballVelocity.lengthSq();


    const maximumSquared =
        BALL_MAX_SPEED *
        BALL_MAX_SPEED;


    if (
        speedSquared <=
        maximumSquared
    ) {

        return;
    }


    ballVelocity.multiplyScalar(

        BALL_MAX_SPEED /
        Math.sqrt(
            speedSquared
        )
    );
}


// ============================================================
// BALL FLOOR
// ============================================================

function resolveBallFloor() {

    if (
        ball.position.y >=
        BALL_RADIUS
    ) {

        return;
    }


    ball.position.y =
        BALL_RADIUS;


    if (
        ballVelocity.y <
        0
    ) {

        ballVelocity.y *=
            -BALL_BOUNCE;


        if (
            Math.abs(
                ballVelocity.y
            ) <
            0.75
        ) {

            ballVelocity.y =
                0;
        }
    }


    ballVelocity.x *=
        BALL_GROUND_DRAG;


    ballVelocity.z *=
        BALL_GROUND_DRAG;
}


// ============================================================
// BALL SIDE WALLS
// ============================================================

function resolveBallSideWalls() {

    const maximumZ =
        HALF_WIDTH -
        BALL_RADIUS;


    if (
        ball.position.z >
        maximumZ
    ) {

        ball.position.z =
            maximumZ;


        if (
            ballVelocity.z >
            0
        ) {

            ballVelocity.z *=
                -BALL_WALL_BOUNCE;
        }
    }


    if (
        ball.position.z <
        -maximumZ
    ) {

        ball.position.z =
            -maximumZ;


        if (
            ballVelocity.z <
            0
        ) {

            ballVelocity.z *=
                -BALL_WALL_BOUNCE;
        }
    }
}


// ============================================================
// BALL FITS GOAL OPENING
// ============================================================
//
// IMPORTANT:
//
// There is NO z-centering force.
//
// No magnet.
// No attraction.
// No "helping" the ball enter.
//
// The goal is just an opening in the wall.
// ============================================================

function ballFitsGoalOpening() {

    const fitsGoalWidth =
        Math.abs(
            ball.position.z
        )
        +
        BALL_RADIUS
        <
        GOAL_WIDTH / 2;


    const fitsGoalHeight =
        ball.position.y +
        BALL_RADIUS
        <
        GOAL_HEIGHT;


    return (
        fitsGoalWidth
        &&
        fitsGoalHeight
    );
}


// ============================================================
// BALL END WALLS
// ============================================================

function resolveBallEndWalls() {

    const opening =
        ballFitsGoalOpening();


    // --------------------------------------------------------
    // NOT IN GOAL OPENING
    // --------------------------------------------------------

    if (
        !opening
    ) {

        const maximumX =
            HALF_LENGTH -
            BALL_RADIUS;


        if (
            ball.position.x >
            maximumX
        ) {

            ball.position.x =
                maximumX;


            if (
                ballVelocity.x >
                0
            ) {

                ballVelocity.x *=
                    -BALL_WALL_BOUNCE;
            }
        }


        if (
            ball.position.x <
            -maximumX
        ) {

            ball.position.x =
                -maximumX;


            if (
                ballVelocity.x <
                0
            ) {

                ballVelocity.x *=
                    -BALL_WALL_BOUNCE;
            }
        }


        return;
    }


    // --------------------------------------------------------
    // BALL IS ALLOWED INTO GOAL
    // --------------------------------------------------------

    const maximumGoalX =
        HALF_LENGTH +
        GOAL_DEPTH -
        BALL_RADIUS;


    if (
        ball.position.x >
        maximumGoalX
    ) {

        ball.position.x =
            maximumGoalX;


        if (
            ballVelocity.x >
            0
        ) {

            ballVelocity.x *=
                -BALL_WALL_BOUNCE;
        }
    }


    if (
        ball.position.x <
        -maximumGoalX
    ) {

        ball.position.x =
            -maximumGoalX;


        if (
            ballVelocity.x <
            0
        ) {

            ballVelocity.x *=
                -BALL_WALL_BOUNCE;
        }
    }
}


// ============================================================
// BALL GOAL SIDE WALLS
// ============================================================

function resolveBallGoalSides() {

    const insideGoalDepth =
        Math.abs(
            ball.position.x
        ) >
        HALF_LENGTH;


    if (
        !insideGoalDepth
    ) {

        return;
    }


    const maximumZ =
        GOAL_WIDTH / 2 -
        BALL_RADIUS;


    if (
        ball.position.z >
        maximumZ
    ) {

        ball.position.z =
            maximumZ;


        if (
            ballVelocity.z >
            0
        ) {

            ballVelocity.z *=
                -BALL_WALL_BOUNCE;
        }
    }


    if (
        ball.position.z <
        -maximumZ
    ) {

        ball.position.z =
            -maximumZ;


        if (
            ballVelocity.z <
            0
        ) {

            ballVelocity.z *=
                -BALL_WALL_BOUNCE;
        }
    }


    // --------------------------------------------------------
    // GOAL ROOF
    // --------------------------------------------------------

    const maximumY =
        GOAL_HEIGHT -
        BALL_RADIUS;


    if (
        ball.position.y >
        maximumY
    ) {

        ball.position.y =
            maximumY;


        if (
            ballVelocity.y >
            0
        ) {

            ballVelocity.y *=
                -BALL_WALL_BOUNCE;
        }
    }
}


// ============================================================
// UPDATE BALL
// ============================================================

function updateBall(
    dt
) {

    // --------------------------------------------------------
    // GRAVITY
    // --------------------------------------------------------

    ballVelocity.y -=
        BALL_GRAVITY *
        dt;


    // --------------------------------------------------------
    // LIGHT AIR DRAG
    // --------------------------------------------------------

    const drag =
        Math.pow(
            BALL_AIR_DRAG,
            dt * 60
        );


    ballVelocity.multiplyScalar(
        drag
    );


    // --------------------------------------------------------
    // INTEGRATE
    // --------------------------------------------------------

    ball.position.x +=
        ballVelocity.x *
        dt;


    ball.position.y +=
        ballVelocity.y *
        dt;


    ball.position.z +=
        ballVelocity.z *
        dt;


    // --------------------------------------------------------
    // COLLISIONS
    // --------------------------------------------------------

    resolveBallFloor();


    resolveBallSideWalls();


    resolveBallEndWalls();


    resolveBallGoalSides();


    clampBallSpeed();
}


// ============================================================
// CAR / BALL COLLISION CONSTANTS
// ============================================================

const CAR_BALL_RADIUS_X =
    2.65;


const CAR_BALL_RADIUS_Y =
    1.35;


const CAR_BALL_RADIUS_Z =
    1.60;


const CAR_BALL_HIT_STRENGTH =
    1.20;


const CAR_BALL_MIN_IMPULSE =
    5.0;


// ============================================================
// CAR / BALL COLLISION
// ============================================================
//
// Ellipsoid-style approximation.
//
// Much cheaper than a detailed mesh collider and gives the
// car a useful nose/body hitbox for aerial shots.
// ============================================================

function resolveCarBallCollision() {

    // --------------------------------------------------------
    // BALL RELATIVE TO CAR
    // --------------------------------------------------------

    tempBallDifference
        .copy(
            ball.position
        )
        .sub(
            car.position
        );


    // Transform into local car space.

    tempQuaternion
        .copy(
            car.quaternion
        )
        .invert();


    tempBallDifference
        .applyQuaternion(
            tempQuaternion
        );


    // --------------------------------------------------------
    // EXPANDED CAR ELLIPSOID
    // --------------------------------------------------------

    const radiusX =
        CAR_BALL_RADIUS_X +
        BALL_RADIUS;


    const radiusY =
        CAR_BALL_RADIUS_Y +
        BALL_RADIUS;


    const radiusZ =
        CAR_BALL_RADIUS_Z +
        BALL_RADIUS;


    const nx =
        tempBallDifference.x /
        radiusX;


    const ny =
        tempBallDifference.y /
        radiusY;


    const nz =
        tempBallDifference.z /
        radiusZ;


    const normalizedDistanceSquared =
        nx * nx +
        ny * ny +
        nz * nz;


    if (
        normalizedDistanceSquared >=
        1
    ) {

        return;
    }


    // --------------------------------------------------------
    // LOCAL CONTACT NORMAL
    // --------------------------------------------------------

    tempDirection.set(
        nx /
            radiusX,

        ny /
            radiusY,

        nz /
            radiusZ
    );


    if (
        tempDirection.lengthSq() <
        0.0001
    ) {

        tempDirection.set(
            1,
            0.25,
            0
        );
    }


    tempDirection.normalize();


    // Convert contact normal to world space.

    tempDirection
        .applyQuaternion(
            car.quaternion
        )
        .normalize();


    // --------------------------------------------------------
    // PUSH BALL OUT
    // --------------------------------------------------------

    const normalizedDistance =
        Math.sqrt(
            normalizedDistanceSquared
        );


    const penetration =
        1 -
        normalizedDistance;


    const approximateRadius =
        Math.min(
            radiusX,
            radiusY,
            radiusZ
        );


    ball.position.addScaledVector(

        tempDirection,

        penetration *
        approximateRadius *
        0.85
    );


    // --------------------------------------------------------
    // RELATIVE VELOCITY
    // --------------------------------------------------------

    tempVelocity.set(
        carVelocity.x,
        verticalVelocity,
        carVelocity.z
    );


    tempVelocity.sub(
        ballVelocity
    );


    const closingSpeed =
        tempVelocity.dot(
            tempDirection
        );


    // --------------------------------------------------------
    // HIT IMPULSE
    // --------------------------------------------------------

    let impulse =
        Math.max(
            CAR_BALL_MIN_IMPULSE,
            closingSpeed *
                CAR_BALL_HIT_STRENGTH
        );


    // Nose/front contact gets a little extra punch.

    getCarForward(
        tempForward
    );


    const frontness =
        Math.max(
            0,
            tempDirection.dot(
                tempForward
            )
        );


    impulse *=
        1 +
        frontness *
            0.24;


    ballVelocity.addScaledVector(
        tempDirection,
        impulse
    );


    // Transfer a little of the car's velocity too.

    ballVelocity.x +=
        carVelocity.x *
        0.17;


    ballVelocity.z +=
        carVelocity.z *
        0.17;


    ballVelocity.y +=
        Math.max(
            0,
            verticalVelocity
        ) *
        0.15;


    // Tiny recoil prevents the car from passing
    // straight through the ball.

    carVelocity.x -=
        tempDirection.x *
        impulse *
        0.055;


    carVelocity.z -=
        tempDirection.z *
        impulse *
        0.055;


    if (
        tempDirection.y >
        0
    ) {

        verticalVelocity -=
            tempDirection.y *
            impulse *
            0.025;
    }


    clampBallSpeed();
}


// ============================================================
// BALL SPIN VISUAL
// ============================================================

function updateBallVisualRotation(
    dt
) {

    const horizontalSpeed =
        Math.sqrt(
            ballVelocity.x *
                ballVelocity.x
            +
            ballVelocity.z *
                ballVelocity.z
        );


    if (
        horizontalSpeed <
        0.01
    ) {

        return;
    }


    // Rotation axis perpendicular to movement.

    tempAxis.set(
        ballVelocity.z,
        0,
        -ballVelocity.x
    );


    if (
        tempAxis.lengthSq() <
        0.0001
    ) {

        return;
    }


    tempAxis.normalize();


    tempQuaternion
        .setFromAxisAngle(

            tempAxis,

            horizontalSpeed /
            BALL_RADIUS *
            dt
        );


    ball.quaternion
        .premultiply(
            tempQuaternion
        )
        .normalize();
}


// ============================================================
// GOAL DETECTION
// ============================================================
//
// Centre crossing decides the goal.
//
// Again: NO GOAL MAGNET.
// ============================================================

function checkForGoal() {

    if (
        gameState !==
            GAME_STATE.PLAYING
        &&
        gameState !==
            GAME_STATE.OVERTIME
        &&
        gameState !==
            GAME_STATE.FREEPLAY
    ) {

        return;
    }


    const insideGoalWidth =
        Math.abs(
            ball.position.z
        )
        <
        GOAL_WIDTH / 2 -
            BALL_RADIUS *
            0.15;


    const belowCrossbar =
        ball.position.y
        <
        GOAL_HEIGHT -
            BALL_RADIUS *
            0.10;


    if (
        !insideGoalWidth
        ||
        !belowCrossbar
    ) {

        return;
    }


    // --------------------------------------------------------
    // ORANGE GOAL
    // Blue scores.
    // --------------------------------------------------------

    if (
        ball.position.x >
        HALF_LENGTH +
            BALL_RADIUS *
            0.10
    ) {

        registerGoal(
            "blue"
        );


        return;
    }


    // --------------------------------------------------------
    // BLUE GOAL
    // Orange scores.
    // --------------------------------------------------------

    if (
        ball.position.x <
        -HALF_LENGTH -
            BALL_RADIUS *
            0.10
    ) {

        registerGoal(
            "orange"
        );
    }
}


// ============================================================
// REGISTER GOAL
// ============================================================
//
// Full celebration/results flow continues in Part 4.
// ============================================================

function registerGoal(
    team
) {

    if (
        gameState ===
        GAME_STATE.CELEBRATION
        ||
        gameState ===
        GAME_STATE.RESULTS
    ) {

        return;
    }


    lastScoringTeam =
        team;


    if (
        team ===
        "blue"
    ) {

        blueScore++;


        playerGoals++;


        playerScore +=
            100;

    } else {

        orangeScore++;
    }


    updateTopScoreboard();


    // --------------------------------------------------------
    // FREE PLAY
    // --------------------------------------------------------

    if (
        gameState ===
        GAME_STATE.FREEPLAY
    ) {

        resetKickoff();

        return;
    }


    // --------------------------------------------------------
    // OVERTIME = GOLDEN GOAL
    // --------------------------------------------------------

    if (
        gameState ===
        GAME_STATE.OVERTIME
    ) {

        gameState =
            GAME_STATE.CELEBRATION;


        celebrationTimer =
            5;


        return;
    }


    // --------------------------------------------------------
    // NORMAL GOAL
    // --------------------------------------------------------

    gameState =
        GAME_STATE.CELEBRATION;


    celebrationTimer =
        5;
}


// ============================================================
// INITIAL RESET
// ============================================================

resetKickoff();


// ============================================================
// END PART 3 / 4
//
// PART 4 GOES DIRECTLY BELOW THIS.
//
// PART 4:
// - match timer
// - overtime
// - goal celebration
// - restored polished end screen
// - play again / free play
// - camera rebuild
// - ball cam
// - HUD updating
// - performance/FPS display
// - fixed timestep/frame handling
// - complete main loop
// - startup
//
// THEN THE BEAST CAN ACTUALLY RUN.
// ============================================================
// ============================================================
// BOOSTBALL v0.6.3 — TRACTION CONTROL
//
// PART 4 / 4
//
// - Match timer
// - Overtime
// - Goal celebrations
// - Results screen
// - Play Again / Free Play
// - Camera
// - Ball Cam
// - HUD
// - FPS display
// - Resize handling
// - Main game loop
//
// THIS IS THE FINAL PART.
// ============================================================


// ============================================================
// GOAL MESSAGE
// ============================================================

const goalMessage =
    document.createElement("div");

goalMessage.style.cssText = `
    position:fixed;
    left:50%;
    top:31%;
    transform:translate(-50%,-50%) scale(.92);
    z-index:60;

    color:white;
    font-family:Arial,sans-serif;
    font-size:52px;
    font-weight:900;
    letter-spacing:4px;

    text-shadow:
        0 3px 8px rgba(0,0,0,.8),
        0 0 25px rgba(255,255,255,.2);

    opacity:0;
    visibility:hidden;
    pointer-events:none;

    transition:
        opacity .18s ease,
        transform .18s ease;
`;

document.body.appendChild(
    goalMessage
);


function showGoalMessage(team) {

    goalMessage.textContent =
        team === "blue"
            ? "BLUE SCORES!"
            : "ORANGE SCORES!";


    goalMessage.style.color =
        team === "blue"
            ? "#5db8ff"
            : "#ffad50";


    goalMessage.style.opacity =
        "1";


    goalMessage.style.visibility =
        "visible";


    goalMessage.style.transform =
        "translate(-50%,-50%) scale(1)";
}


function hideGoalMessage() {

    goalMessage.style.opacity =
        "0";


    goalMessage.style.visibility =
        "hidden";


    goalMessage.style.transform =
        "translate(-50%,-50%) scale(.92)";
}


// ============================================================
// RESULTS SCREEN
// ============================================================

const resultsOverlay =
    document.createElement("div");

resultsOverlay.style.cssText = `
    position:fixed;
    inset:0;

    z-index:100;

    display:none;
    align-items:center;
    justify-content:center;

    background:
        radial-gradient(
            circle at center,
            rgba(13,25,42,.72),
            rgba(2,6,12,.94)
        );

    backdrop-filter:blur(8px);

    font-family:Arial,sans-serif;
    color:white;
`;

document.body.appendChild(
    resultsOverlay
);


const resultsCard =
    document.createElement("div");

resultsCard.style.cssText = `
    width:min(620px,88vw);

    padding:30px 32px 28px;

    box-sizing:border-box;

    border-radius:18px;

    background:
        linear-gradient(
            180deg,
            rgba(20,34,54,.98),
            rgba(7,13,23,.98)
        );

    border:
        1px solid rgba(255,255,255,.13);

    box-shadow:
        0 30px 90px rgba(0,0,0,.6);

    text-align:center;
`;

resultsOverlay.appendChild(
    resultsCard
);


// ============================================================
// SHOW RESULTS
// ============================================================

function showResults() {

    gameState =
        GAME_STATE.RESULTS;


    hideGoalMessage();


    const blueWon =
        blueScore > orangeScore;


    const orangeWon =
        orangeScore > blueScore;


    const winnerText =
        blueWon
            ? "BLUE WINS"
            : orangeWon
                ? "ORANGE WINS"
                : "DRAW";


    const winnerColor =
        blueWon
            ? "#52adff"
            : orangeWon
                ? "#ff9b3d"
                : "#ffffff";


    resultsCard.innerHTML = `
        <div
            style="
                font-size:11px;
                font-weight:800;
                letter-spacing:3px;
                color:rgba(255,255,255,.48);
            "
        >
            FINAL
        </div>

        <div
            style="
                margin-top:8px;

                font-size:38px;
                font-weight:900;

                color:${winnerColor};

                letter-spacing:1px;
            "
        >
            ${winnerText}
        </div>

        <div
            style="
                display:flex;
                align-items:center;
                justify-content:center;

                gap:20px;

                margin-top:22px;
            "
        >

            <div
                style="
                    width:110px;

                    padding:15px;

                    border-radius:10px;

                    background:
                        rgba(25,145,255,.16);

                    border:
                        1px solid
                        rgba(60,170,255,.25);
                "
            >

                <div
                    style="
                        font-size:11px;
                        letter-spacing:1px;
                        color:#68bdff;
                    "
                >
                    BLUE
                </div>

                <div
                    style="
                        margin-top:4px;

                        font-size:46px;
                        font-weight:900;
                    "
                >
                    ${blueScore}
                </div>

            </div>


            <div
                style="
                    color:
                        rgba(255,255,255,.32);

                    font-size:24px;
                    font-weight:700;
                "
            >
                —
            </div>


            <div
                style="
                    width:110px;

                    padding:15px;

                    border-radius:10px;

                    background:
                        rgba(255,130,25,.16);

                    border:
                        1px solid
                        rgba(255,150,60,.25);
                "
            >

                <div
                    style="
                        font-size:11px;
                        letter-spacing:1px;
                        color:#ffae59;
                    "
                >
                    ORANGE
                </div>

                <div
                    style="
                        margin-top:4px;

                        font-size:46px;
                        font-weight:900;
                    "
                >
                    ${orangeScore}
                </div>

            </div>

        </div>


        <div
            style="
                display:grid;

                grid-template-columns:
                    1fr 1fr;

                gap:10px;

                margin-top:22px;
            "
        >

            <div
                style="
                    padding:12px;

                    border-radius:9px;

                    background:
                        rgba(255,255,255,.055);
                "
            >
                <div
                    style="
                        font-size:10px;
                        letter-spacing:1px;
                        color:rgba(255,255,255,.45);
                    "
                >
                    GOALS
                </div>

                <div
                    style="
                        margin-top:4px;
                        font-size:23px;
                        font-weight:800;
                    "
                >
                    ${playerGoals}
                </div>
            </div>


            <div
                style="
                    padding:12px;

                    border-radius:9px;

                    background:
                        rgba(255,255,255,.055);
                "
            >
                <div
                    style="
                        font-size:10px;
                        letter-spacing:1px;
                        color:rgba(255,255,255,.45);
                    "
                >
                    SCORE
                </div>

                <div
                    style="
                        margin-top:4px;
                        font-size:23px;
                        font-weight:800;
                    "
                >
                    ${playerScore}
                </div>
            </div>

        </div>


        <div
            style="
                display:flex;
                justify-content:center;

                gap:10px;

                margin-top:24px;
            "
        >

            <button
                id="resultsPlayAgain"
                style="
                    border:0;

                    padding:12px 23px;

                    border-radius:9px;

                    background:
                        linear-gradient(
                            180deg,
                            #269cff,
                            #0870d6
                        );

                    color:white;

                    font-size:14px;
                    font-weight:800;

                    cursor:pointer;
                "
            >
                PLAY AGAIN
            </button>


            <button
                id="resultsFreePlay"
                style="
                    padding:12px 23px;

                    border-radius:9px;

                    border:
                        1px solid
                        rgba(255,255,255,.18);

                    background:
                        rgba(255,255,255,.07);

                    color:white;

                    font-size:14px;
                    font-weight:700;

                    cursor:pointer;
                "
            >
                FREE PLAY
            </button>

        </div>


        <div
            style="
                margin-top:18px;

                font-size:10px;

                letter-spacing:1.5px;

                color:
                    rgba(255,255,255,.27);
            "
        >
            BOOSTBALL ${GAME_VERSION}
        </div>
    `;


    resultsOverlay.style.display =
        "flex";


    document
        .getElementById("resultsPlayAgain")
        ?.addEventListener(
            "click",
            startNewMatch
        );


    document
        .getElementById("resultsFreePlay")
        ?.addEventListener(
            "click",
            startFreePlay
        );


    updateTopScoreboard();
}


// ============================================================
// HIDE RESULTS
// ============================================================

function hideResults() {

    resultsOverlay.style.display =
        "none";
}


// ============================================================
// START NEW MATCH
// ============================================================

function startNewMatch() {

    hideResults();
    hideGoalMessage();


    blueScore =
        0;


    orangeScore =
        0;


    playerGoals =
        0;


    playerScore =
        0;


    matchTime =
        300;


    celebrationTimer =
        0;


    lastScoringTeam =
        null;


    gameState =
        GAME_STATE.PLAYING;


    resetKickoff();


    updateTopScoreboard();
}


// ============================================================
// START FREE PLAY
// ============================================================

function startFreePlay() {

    hideResults();
    hideGoalMessage();


    blueScore =
        0;


    orangeScore =
        0;


    playerGoals =
        0;


    playerScore =
        0;


    gameState =
        GAME_STATE.FREEPLAY;


    celebrationTimer =
        0;


    resetKickoff();


    boostAmount =
        100;


    updateTopScoreboard();
}


// ============================================================
// ENTER OVERTIME
// ============================================================

function enterOvertime() {

    gameState =
        GAME_STATE.OVERTIME;


    matchTime =
        0;


    resetKickoff();


    updateTopScoreboard();
}


// ============================================================
// FINISH MATCH
// ============================================================

function finishMatch() {

    if (
        blueScore === orangeScore
    ) {

        enterOvertime();

    } else {

        showResults();
    }
}


// ============================================================
// END GOAL CELEBRATION
// ============================================================

function finishGoalCelebration() {

    hideGoalMessage();


    // Overtime goal immediately ends the match.

    if (
        matchTime <= 0
        &&
        blueScore !== orangeScore
    ) {

        showResults();

        return;
    }


    resetKickoff();


    gameState =
        GAME_STATE.PLAYING;


    updateTopScoreboard();
}


// ============================================================
// MATCH FLOW
// ============================================================

function updateMatch(
    dt
) {

    // --------------------------------------------------------
    // FREE PLAY
    // --------------------------------------------------------

    if (
        gameState ===
        GAME_STATE.FREEPLAY
    ) {

        return;
    }


    // --------------------------------------------------------
    // PLAYING
    // --------------------------------------------------------

    if (
        gameState ===
        GAME_STATE.PLAYING
    ) {

        matchTime -=
            dt;


        if (
            matchTime <= 0
        ) {

            matchTime =
                0;


            finishMatch();
        }


        return;
    }


    // --------------------------------------------------------
    // CELEBRATION
    // --------------------------------------------------------

    if (
        gameState ===
        GAME_STATE.CELEBRATION
    ) {

        celebrationTimer -=
            dt;


        if (
            celebrationTimer <= 0
        ) {

            celebrationTimer =
                0;


            finishGoalCelebration();
        }
    }
}


// ============================================================
// GOAL MESSAGE STATE
// ============================================================

let previousGameState =
    gameState;


function updateGoalPresentation() {

    if (
        gameState ===
            GAME_STATE.CELEBRATION
        &&
        previousGameState !==
            GAME_STATE.CELEBRATION
    ) {

        showGoalMessage(
            lastScoringTeam
        );
    }


    previousGameState =
        gameState;
}


// ============================================================
// CAMERA
// ============================================================

const cameraPositionTarget =
    new THREE.Vector3();


const cameraV063LookTarget =
    new THREE.Vector3();


const cameraForward =
    new THREE.Vector3();


const cameraBallDirection =
    new THREE.Vector3();


const cameraDesiredDirection =
    new THREE.Vector3();


const cameraSmoothedLook =
    new THREE.Vector3();


let cameraInitialised =
    false;


// ============================================================
// CAMERA UPDATE
// ============================================================

function updateCamera(
    dt
) {

    // --------------------------------------------------------
    // FLAT CAR FORWARD
    // --------------------------------------------------------

    getFlatCarForward(
        cameraForward
    );


    // --------------------------------------------------------
    // BALL CAM
    // --------------------------------------------------------

    if (
        ballCamEnabled
    ) {

        cameraBallDirection
            .copy(
                ball.position
            )
            .sub(
                car.position
            );


        cameraBallDirection.y =
            0;


        if (
            cameraBallDirection.lengthSq() >
            0.001
        ) {

            cameraBallDirection.normalize();

        } else {

            cameraBallDirection.copy(
                cameraForward
            );
        }


        // Mostly look toward ball,
        // but retain some car direction so camera
        // doesn't become violently disconnected.

        cameraDesiredDirection
            .copy(
                cameraForward
            )
            .multiplyScalar(
                0.28
            )
            .addScaledVector(
                cameraBallDirection,
                0.72
            )
            .normalize();

    } else {

        cameraDesiredDirection.copy(
            cameraForward
        );
    }


    // --------------------------------------------------------
    // CAMERA POSITION
    // --------------------------------------------------------

    cameraPositionTarget
        .copy(
            car.position
        )
        .addScaledVector(
            cameraDesiredDirection,
            -10.8
        );


    cameraPositionTarget.y +=
        5.3;


    // Slightly farther camera at high speed.

    const speed =
        getHorizontalSpeed();


    const speedExtra =
        THREE.MathUtils.clamp(
            speed / BOOST_TOP_SPEED,
            0,
            1
        );


    cameraPositionTarget.addScaledVector(
        cameraDesiredDirection,
        -speedExtra * 1.7
    );


    // --------------------------------------------------------
    // LOOK TARGET
    // --------------------------------------------------------

    if (
        ballCamEnabled
    ) {

        cameraV063LookTarget
            .copy(
                ball.position
            );


        cameraV063LookTarget.y +=
            0.45;

    } else {

        cameraV063LookTarget
            .copy(
                car.position
            )
            .addScaledVector(
                cameraForward,
                10
            );


        cameraV063LookTarget.y +=
            1.25;
    }


    // --------------------------------------------------------
    // INITIAL CAMERA SNAP
    // --------------------------------------------------------

    if (
        !cameraInitialised
    ) {

        camera.position.copy(
            cameraPositionTarget
        );


        cameraSmoothedLook.copy(
            cameraV063LookTarget
        );


        cameraInitialised =
            true;
    }


    // --------------------------------------------------------
    // SMOOTHING
    // --------------------------------------------------------

    const positionBlend =
        1 -
        Math.exp(
            -8.5 * dt
        );


    const lookBlend =
        1 -
        Math.exp(
            -10.5 * dt
        );


    camera.position.lerp(
        cameraPositionTarget,
        positionBlend
    );


    cameraSmoothedLook.lerp(
        cameraV063LookTarget,
        lookBlend
    );


    camera.lookAt(
        cameraSmoothedLook
    );
}


// ============================================================
// FPS DISPLAY
// ============================================================

const performanceDisplay =
    document.createElement("div");

performanceDisplay.style.cssText = `
    position:fixed;

    top:10px;
    left:12px;

    z-index:40;

    padding:5px 7px;

    border-radius:5px;

    background:rgba(0,0,0,.28);

    color:rgba(255,255,255,.5);

    font:
        10px Arial,
        sans-serif;

    pointer-events:none;
    user-select:none;
`;

performanceDisplay.textContent =
    `${GAME_VERSION} · -- FPS`;

document.body.appendChild(
    performanceDisplay
);


let fpsFrames =
    0;


let fpsTimer =
    0;


function updatePerformanceDisplay(
    dt
) {

    fpsFrames++;


    fpsTimer +=
        dt;


    if (
        fpsTimer <
        0.5
    ) {

        return;
    }


    const fps =
        Math.round(
            fpsFrames /
            fpsTimer
        );


    performanceDisplay.textContent =
        `${GAME_VERSION} · ${fps} FPS`;


    fpsFrames =
        0;


    fpsTimer =
        0;
}


// ============================================================
// RESIZE
// ============================================================

function resizeGame() {

    const width =
        window.innerWidth;


    const height =
        window.innerHeight;


    camera.aspect =
        width /
        Math.max(
            1,
            height
        );


    camera.updateProjectionMatrix();


    renderer.setSize(
        width,
        height,
        false
    );
}


window.addEventListener(
    "resize",
    resizeGame
);


resizeGame();


// ============================================================
// PHYSICS SETTINGS
// ============================================================
//
// Clamp huge frame times so tabbing away doesn't cause
// the car to wake up in New Zealand.
// ============================================================

const MAX_FRAME_DT =
    1 / 20;


const MAX_PHYSICS_STEP =
    1 / 60;


// ============================================================
// PHYSICS FRAME
// ============================================================

function updatePhysics(
    dt
) {

    // Split only genuinely slow frames.
    //
    // Usually this is ONE step at 60 FPS.
    // Unlike v0.6.2 we're not running expensive suspension
    // contact calculations multiple times per frame.

    const steps =
        Math.max(
            1,
            Math.ceil(
                dt /
                MAX_PHYSICS_STEP
            )
        );


    const step =
        dt /
        steps;


    for (
        let i = 0;
        i < steps;
        i++
    ) {

        // During goal celebration:
        // keep physics alive briefly so the ball/car
        // don't instantly freeze.

        if (
            gameState ===
                GAME_STATE.PLAYING
            ||
            gameState ===
                GAME_STATE.OVERTIME
            ||
            gameState ===
                GAME_STATE.FREEPLAY
            ||
            gameState ===
                GAME_STATE.CELEBRATION
        ) {

            updateCar(
                step
            );


            updateBall(
                step
            );


            resolveCarBallCollision();


            updateBallVisualRotation(
                step
            );


            updateBoostPads(
                step
            );


            checkForGoal();
        }


        updateMatch(
            step
        );
    }
}


// ============================================================
// MAIN LOOP
// ============================================================

let lastFrameTime =
    performance.now();


let elapsedGameTime =
    0;


function gameLoop(
    now
) {

    requestAnimationFrame(
        gameLoop
    );


    // --------------------------------------------------------
    // DELTA TIME
    // --------------------------------------------------------

    let dt =
        (
            now -
            lastFrameTime
        ) /
        1000;


    lastFrameTime =
        now;


    if (
        !Number.isFinite(
            dt
        )
        ||
        dt <= 0
    ) {

        dt =
            1 / 60;
    }


    dt =
        Math.min(
            dt,
            MAX_FRAME_DT
        );


    elapsedGameTime +=
        dt;


    // --------------------------------------------------------
    // CONTROLLER
    // --------------------------------------------------------
    //
    // ALWAYS POLL.
    //
    // Even if the menu is open.
    // Even if the controller was connected after loading.
    //
    // This is the v0.6.3 hot-plug fix.
    // --------------------------------------------------------

    updateController();


    // --------------------------------------------------------
    // INPUT
    // --------------------------------------------------------

    updateInputState();


    // --------------------------------------------------------
    // CONTROLLER DIAGNOSTIC
    // --------------------------------------------------------

    updateControllerDiagnostics(
        dt
    );


    // --------------------------------------------------------
    // PHYSICS
    // --------------------------------------------------------

    if (
        !menuOpen
        &&
        gameState !==
            GAME_STATE.RESULTS
    ) {

        updatePhysics(
            dt
        );
    }


    // --------------------------------------------------------
    // PRESENTATION
    // --------------------------------------------------------

    updateGoalPresentation();


    updateDetailedScoreboard();


    updateTopScoreboard();


    animateBoostPads(
        elapsedGameTime
    );


    updateCamera(
        dt
    );


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
// GAMEPAD CONNECTION EVENTS
// ============================================================
//
// Polling is still authoritative.
//
// These events simply make the UI respond immediately when
// Chrome tells us something was plugged in.
// ============================================================

window.addEventListener(
    "gamepadconnected",
    event => {

        preferredGamepadIndex =
            event.gamepad.index;


        controllerNotice =
            `Controller connected: ${
                event.gamepad.id ||
                "Gamepad"
            }`;


        // IMPORTANT:
        // Don't store event.gamepad as the permanent controller.
        // updateController() fetches the current object.


        if (
            menuOpen
        ) {

            rebuildMenu();
        }
    }
);


window.addEventListener(
    "gamepaddisconnected",
    event => {

        if (
            preferredGamepadIndex ===
            event.gamepad.index
        ) {

            preferredGamepadIndex =
                null;
        }


        controllerNotice =
            "Controller disconnected";


        if (
            menuOpen
        ) {

            rebuildMenu();
        }
    }
);


// ============================================================
// INITIAL CAMERA
// ============================================================

cameraInitialised =
    false;


updateCamera(
    1 / 60
);


// ============================================================
// INITIAL CONTROLLER SCAN
// ============================================================
//
// This doesn't require the controller to exist yet.
//
// If Chrome exposes one later, updateController() finds it
// during the normal frame loop.
// ============================================================

updateController();


// ============================================================
// INITIAL HUD
// ============================================================

updateTopScoreboard();


updateControllerDisplayVisibility();


// ============================================================
// START
// ============================================================

requestAnimationFrame(
    gameLoop
);


// ============================================================
//
// BOOSTBALL v0.6.3 — TRACTION CONTROL
//
// COMPLETE.
//
// PARTS 1 + 2 + 3 + 4
// together form game.js.
//
// FIX TARGETS:
//
// ✓ Much stronger traction
// ✓ Less ice-like handling
// ✓ Powerslide remains loose
// ✓ Original speed constants preserved
// ✓ Cheaper physics
// ✓ Less CPU-heavy than v0.6.2
// ✓ Bigger arena
// ✓ Larger boost pickup areas
// ✓ Wheels visually touch ground
// ✓ Variable jump
// ✓ Double jump
// ✓ Directional dodge
// ✓ Flip input lock
// ✓ Flip cancelling
// ✓ Easy upside-down recovery
// ✓ Directional air roll
// ✓ L1 Air Roll Left
// ✓ R1 Powerslide + Air Roll Right
// ✓ X Jump
// ✓ Square Scoreboard
// ✓ Triangle Ball Cam
// ✓ R2 Drive
// ✓ L2 Brake / Reverse
// ✓ Options Menu
// ✓ D-Pad reserved for Quick Chat
// ✓ Remappable controller controls
// ✓ Controller hot-plug polling
// ✓ No reload SHOULD be required
// ✓ Optional live controller visualiser
// ✓ Top-centre scoreboard
// ✓ Hold scoreboard expands underneath
// ✓ Restored polished results screen
// ✓ Ball has no goal magnet
//
// NOW TEST THE MICROWAVE.
//
// ============================================================
// DO NOT RUN YET.
// ============================================================
