// ============================================================
// BOOSTBALL v0.6.1 — FLIGHT SCHOOL DETENTION
// PART 1 / 3
//
// Bigger ball.
// Rebuilt aerial foundation.
// Slower dodges.
// Real orientation-aware landings.
// Camera repair foundation.
// Goal-physics repair foundation.
// Speed remains unchanged.
//
// The microwave has been sent back to flight school.
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

scene.background =
    new THREE.Color(0x07111f);

scene.fog =
    new THREE.Fog(
        0x07111f,
        145,
        235
    );


// ============================================================
// GRAPHICS / PERFORMANCE
// ============================================================

const GRAPHICS_STORAGE_KEY =
    "boostball-graphics-v061";

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

const cameraTarget =
    new THREE.Vector3();

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

scene.add(sun);


// ============================================================
// ARENA CONSTANTS
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


// ============================================================
// v0.6.1 BALL SIZE
// ============================================================
//
// v0.6:
// 1.8
//
// v0.6.1:
// 2.6
//
// This puts the centre of the ball much closer to the height
// of the car during a normal jump, instead of making the ball
// look like a football sitting beside a microwave.
// ============================================================

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

scene.add(field);


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

    scene.add(line);

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

const circleRadius =
    10;

for (
    let i = 0;
    i <= 48;
    i++
) {

    const angle =
        (i / 48) *
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

scene.add(circle);


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


function createSideWall(z) {

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

    scene.add(wall);
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

function createEndWallPieces(x) {

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

        scene.add(wall);
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


    // --------------------------------------------------------
    // BACK WALL
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

    scene.add(back);


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

    scene.add(roof);


    // --------------------------------------------------------
    // INSIDE SIDE WALLS
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

        scene.add(post);
    }


    // --------------------------------------------------------
    // CROSSBAR
    // --------------------------------------------------------

    const crossbar =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.65,
                0.65,
                GOAL_WIDTH + 0.65
            ),

            postMaterial
        );

    crossbar.position.set(

        side *
        HALF_LENGTH,

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

scene.add(car);


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

body.position.y =
    0.95;

body.castShadow =
    true;

body.receiveShadow =
    true;

car.add(body);


// ============================================================
// CAR NOSE
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
    0.78,
    0
);

nose.castShadow =
    true;

car.add(nose);


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
    1.75,
    0
);

cabin.castShadow =
    true;

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

    car.add(wheel);

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

scene.add(ball);

const ballVelocity =
    new THREE.Vector3();


// ============================================================
// GRAPHICS PRESET
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
// PHYSICS CONSTANTS
// ============================================================
//
// IMPORTANT:
// Driving speeds are intentionally unchanged from v0.6.
// You said the speed finally feels right.
// WE ARE NOT TOUCHING THE SPEED.
// ============================================================

const ACCELERATION = 29;

const REVERSE_ACCELERATION =
    18;

const BRAKING = 34;


const DRIVE_TOP_SPEED =
    29;

const REVERSE_TOP_SPEED =
    15;


const BOOST_TOP_SPEED =
    45;

const ABSOLUTE_SPEED_LIMIT =
    48;


const BOOST_ACCELERATION =
    43;

const BOOST_USAGE =
    33;


const NORMAL_GRIP =
    7;

const POWERSLIDE_GRIP =
    1.15;


const COAST_DRAG =
    0.18;

const POWERED_DRAG =
    0.06;


const GRAVITY =
    27;


const LOW_SPEED_STEER =
    2.65;

const HIGH_SPEED_STEER =
    1.65;


const POWERSLIDE_STEER_MULTIPLIER =
    1.35;


// ============================================================
// JUMP SYSTEM
// ============================================================
//
// Higher base jump remains from v0.6.
// Holding jump adds lift.
// Second jump becomes either:
// - neutral double jump
// - directional dodge
// ============================================================

const JUMP_IMPULSE =
    13.5;

const JUMP_HOLD_FORCE =
    18;

const JUMP_HOLD_TIME =
    0.20;


const DOUBLE_JUMP_IMPULSE =
    10.5;

const DODGE_HORIZONTAL_IMPULSE =
    18;

const DODGE_VERTICAL_IMPULSE =
    5.5;


// ============================================================
// v0.6.1 DODGE TUNING
// ============================================================
//
// v0.6:
// duration 0.42
// rotation speed 11
//
// That was basically:
// "PRESS JUMP -> BECOME CEILING FAN"
//
// v0.6.1 slows the visual rotation down.
// ============================================================

const DODGE_DURATION =
    0.56;

const DODGE_ROTATION_SPEED =
    7.2;


// After the powered flip finishes, its forced rotational
// movement fades out over roughly half a second.
//
// IMPORTANT:
// This does NOT stop the car's flight velocity.
// It only settles the extra dodge rotation.

const DODGE_SETTLE_TIME =
    0.50;

const DODGE_SETTLE_DAMPING =
    8.5;


// ============================================================
// AERIAL CONSTANTS
// ============================================================
//
// Slightly stronger than v0.6.
// The important fix is not merely speed, though:
// Part 2 will apply these rotations correctly in LOCAL space.
// ============================================================

const AIR_PITCH_SPEED =
    3.15;

const AIR_YAW_SPEED =
    2.65;

const AIR_ROLL_SPEED =
    3.25;


// ============================================================
// CAR STATE
// ============================================================

const carVelocity =
    new THREE.Vector3();

let verticalVelocity =
    0;

let carRotation =
    0;

let grounded =
    true;

let boostAmount =
    33;


let jumpHeldTime =
    0;

let firstJumpUsed =
    false;

let secondJumpUsed =
    false;


// ============================================================
// DODGE STATE
// ============================================================

let dodgeActive =
    false;

let dodgeTimer =
    0;


// v0.6.1:
// Dodge rotation doesn't instantly vanish when the animation
// ends. It fades naturally.

let dodgeSettleTimer =
    0;

let dodgeAngularSpeed =
    0;


const dodgeAxis =
    new THREE.Vector3();


// ============================================================
// LANDING STATE
// ============================================================
//
// v0.6 forced the car upright whenever Y reached the floor.
//
// v0.6.1 DOES NOT.
//
// We track whether the car is actually sitting on its wheels.
// Roof/side contact will keep its orientation.
// ============================================================

let wheelContact =
    true;

let groundContact =
    true;

let landingCooldown =
    0;


// Approximate collision dimensions.
// We're still using lightweight custom physics rather than
// a full rigid-body physics engine.

const CAR_HALF_LENGTH =
    2.45;

const CAR_HALF_WIDTH =
    1.35;

const CAR_HALF_HEIGHT =
    1.15;


// ============================================================
// ORIENTATION
// ============================================================

const carQuaternion =
    new THREE.Quaternion();

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

const tempWorldAxis =
    new THREE.Vector3();

const tempContactPoint =
    new THREE.Vector3();


// ============================================================
// QUATERNION HELPERS
// ============================================================

function getCarForward(
    target = tempForward
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
    target = tempUp
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
    target = tempRight
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

    reset:
        "r",

    menu:
        "tab"
};


const CONTROL_STORAGE_KEY =
    "boostball-controls-v042";


const controls = {
    ...DEFAULT_CONTROLS
};


// ============================================================
// LOAD CONTROLS
// ============================================================

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

    } catch (error) {

        console.warn(
            "Could not load controls:",
            error
        );
    }
}


// ============================================================
// SAVE CONTROLS
// ============================================================

function saveControls() {

    try {

        localStorage.setItem(

            CONTROL_STORAGE_KEY,

            JSON.stringify(
                controls
            )
        );

    } catch (error) {

        console.warn(
            "Could not save controls:",
            error
        );
    }
}


// ============================================================
// RESET CONTROLS
// ============================================================

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

let menuOpen =
    false;

let rebindingAction =
    null;

let controlNotice =
    "";


// ============================================================
// NORMALIZE KEY
// ============================================================

function normalizeKey(event) {

    if (
        event.key === " "
    ) {
        return " ";
    }

    return event.key
        .toLowerCase();
}


// ============================================================
// BROWSER SHORTCUT PROTECTION
// ============================================================

function browserShortcutActive(
    event
) {

    return (

        event.altKey ||

        event.metaKey ||

        (
            event.ctrlKey &&

            event.key
                .toLowerCase() !==
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
        key !== "control"
    ) {
        return true;
    }


    return false;
}


// ============================================================
// CONTROLLER SUPPORT
// ============================================================
//
// Standard browser Gamepad API.
//
// Current PS5 layout:
//
// Left stick:
// steering / aerial pitch + yaw
//
// R2:
// throttle
//
// L2:
// brake / reverse
//
// Cross:
// jump / dodge
//
// Square:
// powerslide / air roll
//
// Circle:
// ball cam
//
// L1:
// boost
//
// R1:
// intentionally RESERVED for the future scoreboard.
// ============================================================

const controllerState = {

    connected:
        false,

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

    ballCamPressed:
        false
};


let previousControllerJump =
    false;

let previousControllerBallCam =
    false;


const GAMEPAD_DEADZONE =
    0.14;


// ============================================================
// CLEAR INPUT
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

    controllerState.ballCamPressed =
        false;
}


// ============================================================
// GAMEPAD HELPERS
// ============================================================

function applyDeadzone(
    value
) {

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
        )
        /
        (
            1 -
            GAMEPAD_DEADZONE
        )
    );
}


function buttonValue(
    gamepad,
    index
) {

    const button =
        gamepad.buttons[
            index
        ];


    if (!button) {
        return 0;
    }


    return button.value;
}


function buttonPressed(
    gamepad,
    index
) {

    const button =
        gamepad.buttons[
            index
        ];


    return Boolean(
        button &&
        button.pressed
    );
}


// ============================================================
// UPDATE CONTROLLER
// ============================================================

function updateController() {

    const gamepads =
        navigator.getGamepads
            ? navigator.getGamepads()
            : [];


    let gamepad =
        null;


    for (
        const candidate
        of gamepads
    ) {

        if (
            candidate &&
            candidate.connected
        ) {

            gamepad =
                candidate;

            break;
        }
    }


    if (!gamepad) {

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

        controllerState.ballCamPressed =
            false;


        previousControllerJump =
            false;

        previousControllerBallCam =
            false;

        return;
    }


    controllerState.connected =
        true;


    // --------------------------------------------------------
    // LEFT STICK
    // --------------------------------------------------------

    controllerState.steerX =
        applyDeadzone(
            gamepad.axes[0] ||
            0
        );


    controllerState.steerY =
        applyDeadzone(
            gamepad.axes[1] ||
            0
        );


    // --------------------------------------------------------
    // TRIGGERS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // CROSS — JUMP
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // L1 — BOOST
    // --------------------------------------------------------

    controllerState.boost =
        buttonPressed(
            gamepad,
            4
        );


    // --------------------------------------------------------
    // SQUARE — POWERSLIDE / AIR ROLL
    // --------------------------------------------------------

    controllerState.powerslide =
        buttonPressed(
            gamepad,
            2
        );


    // --------------------------------------------------------
    // CIRCLE — BALL CAM
    // --------------------------------------------------------

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


function boostHeld() {

    return Boolean(

        keys[
            controls.boost
        ]

        ||

        controllerState.boost
    );
}


function powerslideHeld() {

    return Boolean(

        keys[
            controls.powerslide
        ]

        ||

        controllerState.powerslide
    );
}


function jumpHeld() {

    return Boolean(

        keys[
            controls.jump
        ]

        ||

        controllerState.jump
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


let blueScore =
    0;

let orangeScore =
    0;


let gameTime =
    300;

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

    goals:
        0,

    shots:
        0,

    saves:
        0,

    score:
        0
};


function resetMatchStats() {

    matchStats.goals =
        0;

    matchStats.shots =
        0;

    matchStats.saves =
        0;

    matchStats.score =
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
        // CONTROL REBINDING
        // ----------------------------------------------------

        if (
            rebindingAction
        ) {

            if (
                key ===
                "escape"
            ) {

                event.preventDefault();

                rebindingAction =
                    null;

                controlNotice =
                    "Binding cancelled.";

                updateMenu();

                return;
            }


            if (
                isProtectedBinding(
                    event
                )
            ) {

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

                rebindingAction =
                    null;

                updateMenu();

                return;
            }


            if (
                key === "tab"
            ) {

                event.preventDefault();

                controlNotice =
                    "TAB is reserved for the Boostball menu.";

                updateMenu();

                return;
            }


            const duplicateAction =
                Object.keys(
                    controls
                )
                .find(
                    action =>
                        action !==
                            rebindingAction
                        &&
                        controls[action] ===
                            key
                );


            if (
                duplicateAction
            ) {

                event.preventDefault();

                controlNotice =
                    `${readableKey(key)} is already bound to ${readableAction(duplicateAction)}.`;

                updateMenu();

                return;
            }


            event.preventDefault();


            controls[
                rebindingAction
            ] = key;


            controlNotice =
                `${readableAction(rebindingAction)} → ${readableKey(key)}`;


            rebindingAction =
                null;


            saveControls();

            clearHeldInputs();

            updateMenu();

            return;
        }


        // ----------------------------------------------------
        // BROWSER / WINDOWS SHORTCUTS
        // ----------------------------------------------------

        if (
            browserShortcutActive(
                event
            )
        ) {

            return;
        }


        // ----------------------------------------------------
        // TAB MENU
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


            clearHeldInputs();


            controlNotice =
                "";


            updateMenu();


            pressed[key] =
                true;


            return;
        }


        if (
            menuOpen
        ) {

            if (
                key === " "
                ||
                key.startsWith(
                    "arrow"
                )
            ) {

                event.preventDefault();
            }

            return;
        }


        // ----------------------------------------------------
        // GAMEPLAY INPUT
        // ----------------------------------------------------

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
                &&
                matchState !==
                    MATCH_STATE.RESULTS
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


// ============================================================
// WINDOW BLUR
// ============================================================

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


        if (
            typeof resetFrameClock ===
            "function"
        ) {

            resetFrameClock();
        }
    }
);


// ============================================================
// END OF v0.6.1 PART 1 / 3
//
// DO NOT ADD A CLOSING BRACKET.
// DO NOT RUN YET.
//
// ============================================================
// BOOSTBALL v0.6.1 — FLIGHT SCHOOL DETENTION
// PART 2 / 3
//
// Boost pads.
// UI.
// Jump / dodge.
// Rebuilt aerials.
// Orientation-aware landings.
// Ball physics.
// Goal magnet extermination.
// ============================================================


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


    // --------------------------------------------------------
    // PERMANENT FLOOR DECAL
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // INNER FLOOR MARKER
    // --------------------------------------------------------

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

                transparent:
                    true,

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


    // --------------------------------------------------------
    // PICKUP
    // --------------------------------------------------------

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

        active:
            true,

        timer:
            0,

        pickupRadiusSq:
            pickupRadius *
            pickupRadius
    });
}


// ============================================================
// SMALL BOOST PADS
// ============================================================

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


// ============================================================
// BIG BOOST PADS
// ============================================================

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

            color:
                colour,

            transparent:
                true,

            opacity:
                0.75,

            blending:
                THREE.AdditiveBlending,

            depthWrite:
                false
        });


    const sphere =
        new THREE.Mesh(
            explosionSphereGeometry,
            sphereMaterial
        );


    const ringMaterial =
        new THREE.MeshBasicMaterial({

            color:
                colour,

            transparent:
                true,

            opacity:
                0.85,

            blending:
                THREE.AdditiveBlending,

            side:
                THREE.DoubleSide,

            depthWrite:
                false
        });


    const ring =
        new THREE.Mesh(
            explosionRingGeometry,
            ringMaterial
        );


    ring.rotation.y =
        Math.PI / 2;


    group.add(
        sphere
    );

    group.add(
        ring
    );


    scene.add(
        group
    );


    goalExplosions.push({

        group,
        sphere,
        ring,

        sphereMaterial,
        ringMaterial,

        age:
            0,

        lifetime:
            1.15
    });
}


// ============================================================
// HUD
// ============================================================

const hud =
    document.getElementById(
        "hud"
    );


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


let previousScore =
    "";

let previousTimer =
    "";

let previousBoost =
    "";

let previousCamera =
    "";

let previousGoalMessage =
    "";

let previousHint =
    "";


// ============================================================
// PERFORMANCE DISPLAY
// ============================================================

const performanceDisplay =
    document.createElement(
        "div"
    );


performanceDisplay.style.cssText = `

    position:absolute;

    right:12px;
    top:12px;

    padding:7px 10px;

    border-radius:7px;

    background:
        rgba(0,0,0,0.42);

    color:white;

    font:12px monospace;

    z-index:25;

    pointer-events:none;

    opacity:0.78;
`;


document.body.appendChild(
    performanceDisplay
);


let diagnosticFrames =
    0;

let diagnosticTime =
    0;

let measuredFPS =
    0;


// ============================================================
// RESULTS SCREEN
// ============================================================

const resultsScreen =
    document.createElement(
        "div"
    );


resultsScreen.style.cssText = `

    position:absolute;

    inset:0;

    display:none;

    align-items:center;

    justify-content:center;

    z-index:45;

    color:white;

    font-family:
        Arial,
        sans-serif;

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
    document.createElement(
        "div"
    );


celebrationBanner.style.cssText = `

    position:absolute;

    left:50%;

    top:28%;

    transform:
        translateX(-50%);

    display:none;

    text-align:center;

    color:white;

    z-index:35;

    pointer-events:none;

    font-family:
        Arial,
        sans-serif;

    text-shadow:
        0 4px 20px
        rgba(0,0,0,0.8);
`;


document.body.appendChild(
    celebrationBanner
);


// ============================================================
// MENU
// ============================================================

const menu =
    document.createElement(
        "div"
    );


menu.style.cssText = `

    position:absolute;

    inset:0;

    display:none;

    align-items:center;

    justify-content:center;

    background:
        rgba(2,6,14,0.86);

    z-index:50;

    color:white;

    font-family:
        Arial,
        sans-serif;
`;


document.body.appendChild(
    menu
);


// ============================================================
// UI HELPERS
// ============================================================

function readableKey(
    key
) {

    if (
        key === " "
    ) {

        return "SPACE";
    }


    if (
        key === "control"
    ) {

        return "CTRL";
    }


    if (
        key === "shift"
    ) {

        return "SHIFT";
    }


    if (
        key === "tab"
    ) {

        return "TAB";
    }


    return key
        .toUpperCase();
}


function readableAction(
    action
) {

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


    return names[action] ||
        action;
}


// ============================================================
// MENU UI
// ============================================================

function updateMenu() {

    if (
        !menuOpen
    ) {

        menu.style.display =
            "none";

        return;
    }


    menu.style.display =
        "flex";


    const controlRows =
        Object.keys(
            controls
        )
        .map(
            action => {

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
                            border:
                                1px solid
                                rgba(255,255,255,0.12);
                            border-radius:7px;
                            background:
                                rgba(255,255,255,0.06);
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
                                        controls[
                                            action
                                        ]
                                    )
                            }

                        </strong>

                    </button>
                `;
            }
        )
        .join("");


    const graphicsButtons =
        Object.keys(
            GRAPHICS_PRESETS
        )
        .map(
            name => {

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
            }
        )
        .join("");


    menu.innerHTML = `

        <div style="
            width:min(560px,90vw);
            max-height:90vh;
            overflow:auto;
            padding:24px;
            border-radius:14px;
            background:
                rgba(7,17,31,0.96);
            border:
                1px solid
                rgba(255,255,255,0.12);
            box-shadow:
                0 20px 60px
                rgba(0,0,0,0.5);
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
                v0.6.1 · FLIGHT SCHOOL DETENTION
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
                    border:
                        1px solid
                        rgba(255,255,255,0.15);
                    background:
                        rgba(255,255,255,0.06);
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
                background:
                    rgba(255,255,255,0.04);
                font-size:13px;
                line-height:1.5;
                opacity:0.8;
            ">

                PS5 controller support is active.
                Left stick controls steering/aerials,
                R2 accelerates,
                L2 brakes/reverses,
                Cross jumps,
                Square powerslides/air-rolls,
                Circle toggles Ball Cam,
                and L1 boosts.

                <br><br>

                R1 remains reserved for the future
                multiplayer scoreboard.

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
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const action =
                            button.dataset.bind;


                        if (
                            action === "menu"
                        ) {

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
            }
        );


    const resetButton =
        menu.querySelector(
            "#resetBindings"
        );


    if (
        resetButton
    ) {

        resetButton.onclick =
            () => {

                resetControls();

                rebindingAction =
                    null;

                controlNotice =
                    "Keyboard controls reset.";

                updateMenu();
            };
    }


    menu
        .querySelectorAll(
            "[data-graphics]"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

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
            }
        );
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
            background:
                rgba(5,12,24,0.94);
            border:
                1px solid
                rgba(255,255,255,0.13);
            box-shadow:
                0 25px 80px
                rgba(0,0,0,0.55);
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
                font-size:
                    clamp(36px,7vw,70px);
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
                background:
                    rgba(255,255,255,0.045);
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
                    font-size:15px;
                ">

                    <strong>
                        YOU
                    </strong>

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
                margin-top:24px;
            ">

                <button
                    id="playAgainButton"
                    style="
                        padding:12px 20px;
                        border:none;
                        border-radius:8px;
                        background:#168cff;
                        color:white;
                        font-size:15px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    PLAY AGAIN
                </button>

                <button
                    id="freePlayButton"
                    style="
                        padding:12px 20px;
                        border:
                            1px solid
                            rgba(255,255,255,0.18);
                        border-radius:8px;
                        background:
                            rgba(255,255,255,0.07);
                        color:white;
                        font-size:15px;
                        cursor:pointer;
                    "
                >
                    FREE PLAY
                </button>

                <button
                    id="mainMenuButton"
                    style="
                        padding:12px 20px;
                        border:
                            1px solid
                            rgba(255,255,255,0.18);
                        border-radius:8px;
                        background:
                            rgba(255,255,255,0.07);
                        color:white;
                        font-size:15px;
                        cursor:pointer;
                    "
                >
                    MAIN MENU
                </button>

            </div>

            <div style="
                margin-top:20px;
                text-align:center;
                opacity:0.45;
                font-size:12px;
            ">
                Multiplayer, lobbies and the live scoreboard
                arrive later.
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


    playAgainButton.onclick =
        () => {

            startNewMatch();
        };


    freePlayButton.onclick =
        () => {

            startFreePlay();
        };


    mainMenuButton.onclick =
        () => {

            resultsScreen.style.display =
                "none";

            menuOpen =
                true;

            updateMenu();
        };
}


// ============================================================
// CELEBRATION GUI
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
            font-size:
                clamp(36px,7vw,76px);
            font-weight:900;
            letter-spacing:3px;
            color:${colour};
        ">
            ${matchResult}
        </div>

        <div style="
            margin-top:8px;
            font-size:18px;
            opacity:0.78;
        ">
            FINAL
            &nbsp;
            ${blueScore}
            –
            ${orangeScore}
        </div>

        <div
            id="celebrationCountdown"
            style="
                margin-top:10px;
                font-size:13px;
                opacity:0.52;
            "
        >
            Results in 5
        </div>
    `;
}


// ============================================================
// PERFORM JUMP
// ============================================================

function performJump() {

    // --------------------------------------------------------
    // FIRST JUMP
    // --------------------------------------------------------

    if (
        grounded
    ) {

        grounded =
            false;

        groundContact =
            false;

        wheelContact =
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
                JUMP_IMPULSE
            );


        landingCooldown =
            0.08;


        return;
    }


    // --------------------------------------------------------
    // SECOND JUMP ALREADY USED
    // --------------------------------------------------------

    if (
        !firstJumpUsed ||
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


    const directionalAmount =
        Math.hypot(
            steer,
            pitch
        );


    // --------------------------------------------------------
    // NEUTRAL DOUBLE JUMP
    // --------------------------------------------------------

    if (
        directionalAmount <
        0.25
    ) {

        verticalVelocity +=
            DOUBLE_JUMP_IMPULSE;


        dodgeActive =
            false;

        dodgeTimer =
            0;

        dodgeSettleTimer =
            0;

        dodgeAngularSpeed =
            0;


        return;
    }


    // ========================================================
    // DIRECTIONAL DODGE
    // ========================================================

    // Current car-local horizontal axes.

    getCarForward(
        tempForward
    );

    getCarRight(
        tempRight
    );


    // --------------------------------------------------------
    // DODGE DIRECTION
    // --------------------------------------------------------
    //
    // W / stick up:
    // forward dodge
    //
    // S / stick down:
    // backwards dodge
    //
    // A/D:
    // side dodge
    // --------------------------------------------------------

    tempDirection
        .set(
            0,
            0,
            0
        );


    tempDirection.addScaledVector(
        tempForward,
        -pitch
    );


    tempDirection.addScaledVector(
        tempRight,
        steer
    );


    // Remove vertical contribution from the impulse.
    // Dodge momentum itself remains mostly horizontal.

    tempDirection.y =
        0;


    if (
        tempDirection.lengthSq() <
        0.001
    ) {

        tempDirection.copy(
            tempForward
        );

        tempDirection.y =
            0;
    }


    if (
        tempDirection.lengthSq() >
        0.001
    ) {

        tempDirection.normalize();
    }


    carVelocity.x +=
        tempDirection.x *
        DODGE_HORIZONTAL_IMPULSE;


    carVelocity.z +=
        tempDirection.z *
        DODGE_HORIZONTAL_IMPULSE;


    verticalVelocity +=
        DODGE_VERTICAL_IMPULSE;


    // --------------------------------------------------------
    // DODGE ROTATION AXIS
    // --------------------------------------------------------
    //
    // We build the axis in WORLD SPACE.
    //
    // This fixes the v0.6 problem where a world-space axis
    // was effectively treated as a local-space axis.
    // --------------------------------------------------------

    dodgeAxis
        .crossVectors(
            tempDirection,
            Y_AXIS
        );


    if (
        dodgeAxis.lengthSq() <
        0.001
    ) {

        dodgeAxis.copy(
            tempRight
        );
    }


    dodgeAxis.normalize();


    dodgeActive =
        true;


    dodgeTimer =
        DODGE_DURATION;


    dodgeSettleTimer =
        DODGE_SETTLE_TIME;


    dodgeAngularSpeed =
        DODGE_ROTATION_SPEED;
}


// ============================================================
// WORLD-AXIS ROTATION
// ============================================================
//
// Pre-multiplying applies a rotation around a WORLD axis.
// Used for dodge animation.
// ============================================================

function rotateCarWorld(
    axis,
    angle
) {

    rotationQuaternion
        .setFromAxisAngle(
            axis,
            angle
        );


    car.quaternion
        .premultiply(
            rotationQuaternion
        );


    car.quaternion
        .normalize();
}


// ============================================================
// LOCAL-AXIS ROTATION
// ============================================================
//
// Post-multiplying applies the rotation relative to the car's
// CURRENT orientation.
//
// This is what v0.6 aerial controls needed.
// ============================================================

function rotateCarLocal(
    axis,
    angle
) {

    rotationQuaternion
        .setFromAxisAngle(
            axis,
            angle
        );


    car.quaternion
        .multiply(
            rotationQuaternion
        );


    car.quaternion
        .normalize();
}


// ============================================================
// REBUILT AERIAL CONTROLS
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


    // ========================================================
    // PLAYER CONTROL DURING DODGE
    // ========================================================
    //
    // The powered flip gets priority while it is active.
    //
    // We still allow a reduced amount of pitch/yaw/roll so the
    // car doesn't feel completely disconnected from the player.
    // ========================================================

    const controlScale =
        dodgeActive
            ? 0.30
            : 1;


    // --------------------------------------------------------
    // PITCH
    // --------------------------------------------------------
    //
    // W / stick forward:
    // nose down
    //
    // S / stick backward:
    // nose up
    // --------------------------------------------------------

    if (
        Math.abs(pitch) >
        0.001
    ) {

        rotateCarLocal(

            LOCAL_RIGHT,

            pitch *
            AIR_PITCH_SPEED *
            controlScale *
            dt
        );
    }


    // --------------------------------------------------------
    // YAW OR AIR ROLL
    // --------------------------------------------------------

    if (
        airRoll
    ) {

        if (
            Math.abs(yaw) >
            0.001
        ) {

            rotateCarLocal(

                LOCAL_FORWARD,

                -yaw *
                AIR_ROLL_SPEED *
                controlScale *
                dt
            );
        }

    } else {

        if (
            Math.abs(yaw) >
            0.001
        ) {

            rotateCarLocal(

                LOCAL_UP,

                -yaw *
                AIR_YAW_SPEED *
                controlScale *
                dt
            );
        }
    }


    // ========================================================
    // ACTIVE DODGE ROTATION
    // ========================================================

    if (
        dodgeActive
    ) {

        const dodgeProgress =
            THREE.MathUtils.clamp(

                dodgeTimer /
                DODGE_DURATION,

                0,
                1
            );


        // Ease down slightly toward the end of the flip.

        const speedScale =
            0.65 +
            0.35 *
            dodgeProgress;


        rotateCarWorld(

            dodgeAxis,

            dodgeAngularSpeed *
            speedScale *
            dt
        );


        dodgeTimer -=
            dt;


        if (
            dodgeTimer <= 0
        ) {

            dodgeTimer =
                0;


            dodgeActive =
                false;


            dodgeSettleTimer =
                DODGE_SETTLE_TIME;
        }
    }


    // ========================================================
    // POST-DODGE ROTATIONAL SETTLING
    // ========================================================
    //
    // User request:
    // roughly half a second after the dodge, stop the extra
    // flip movement while preserving flight momentum.
    //
    // The car's X/Y/Z velocity is NOT modified here.
    // ========================================================

    else if (
        dodgeSettleTimer > 0
        &&
        dodgeAngularSpeed >
            0.01
    ) {

        const settleFraction =
            THREE.MathUtils.clamp(

                dodgeSettleTimer /
                DODGE_SETTLE_TIME,

                0,
                1
            );


        rotateCarWorld(

            dodgeAxis,

            dodgeAngularSpeed *
            settleFraction *
            0.32 *
            dt
        );


        dodgeAngularSpeed *=
            Math.exp(
                -DODGE_SETTLE_DAMPING *
                dt
            );


        dodgeSettleTimer -=
            dt;


        if (
            dodgeSettleTimer <= 0
        ) {

            dodgeSettleTimer =
                0;

            dodgeAngularSpeed =
                0;
        }
    }
}


// ============================================================
// HORIZONTAL SPEED SAFETY
// ============================================================

function limitHorizontalSpeed() {

    const speedSq =
        carVelocity.x *
        carVelocity.x
        +
        carVelocity.z *
        carVelocity.z;


    const maxSq =
        ABSOLUTE_SPEED_LIMIT *
        ABSOLUTE_SPEED_LIMIT;


    if (
        speedSq <= maxSq
    ) {

        return;
    }


    const speed =
        Math.sqrt(
            speedSq
        );


    const scale =
        ABSOLUTE_SPEED_LIMIT /
        speed;


    carVelocity.x *=
        scale;

    carVelocity.z *=
        scale;
}


// ============================================================
// CAR ARENA COLLISION
// ============================================================

function handleCarArenaCollision() {

    const sideLimit =
        HALF_WIDTH -
        CAR_HALF_WIDTH;


    if (
        car.position.z >
        sideLimit
    ) {

        car.position.z =
            sideLimit;

        if (
            carVelocity.z > 0
        ) {

            carVelocity.z *=
                -0.35;
        }
    }


    if (
        car.position.z <
        -sideLimit
    ) {

        car.position.z =
            -sideLimit;

        if (
            carVelocity.z < 0
        ) {

            carVelocity.z *=
                -0.35;
        }
    }


    // --------------------------------------------------------
    // END WALL / GOAL OPENING
    // --------------------------------------------------------

    const insideGoalWidth =
        Math.abs(
            car.position.z
        ) <
        (
            GOAL_WIDTH / 2 -
            CAR_HALF_WIDTH
        );


    const belowGoalHeight =
        car.position.y +
        CAR_HALF_HEIGHT <
        GOAL_HEIGHT;


    const canEnterGoal =
        insideGoalWidth &&
        belowGoalHeight;


    const endLimit =
        HALF_LENGTH -
        CAR_HALF_LENGTH;


    if (
        !canEnterGoal
    ) {

        if (
            car.position.x >
            endLimit
        ) {

            car.position.x =
                endLimit;


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
            -endLimit
        ) {

            car.position.x =
                -endLimit;


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
    // INSIDE GOAL
    // --------------------------------------------------------

    const goalBackLimit =
        HALF_LENGTH +
        GOAL_DEPTH -
        CAR_HALF_LENGTH;


    if (
        car.position.x >
        goalBackLimit
    ) {

        car.position.x =
            goalBackLimit;


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
        -goalBackLimit
    ) {

        car.position.x =
            -goalBackLimit;


        if (
            carVelocity.x <
            0
        ) {

            carVelocity.x *=
                -0.35;
        }
    }
}


// ============================================================
// WHEEL SPIN
// ============================================================

function spinWheels(
    dt
) {

    const horizontalSpeed =
        Math.hypot(
            carVelocity.x,
            carVelocity.z
        );


    const spin =
        horizontalSpeed *
        dt *
        1.65;


    for (
        const wheel
        of wheels
    ) {

        wheel.rotation.z -=
            spin;
    }
}


// ============================================================
// ORIENTATION / GROUND CONTACT HELPERS
// ============================================================

function calculateLowestCarPoint() {

    // Approximate oriented-box support height.
    //
    // This tells us how far the car extends beneath its centre
    // for its CURRENT orientation.

    getCarRight(
        tempRight
    );

    getCarUp(
        tempUp
    );

    getCarForward(
        tempForward
    );


    return (

        Math.abs(
            tempForward.y
        ) *
        CAR_HALF_LENGTH

        +

        Math.abs(
            tempUp.y
        ) *
        CAR_HALF_HEIGHT

        +

        Math.abs(
            tempRight.y
        ) *
        CAR_HALF_WIDTH
    );
}


// ============================================================
// LANDING / FLOOR CONTACT
// ============================================================

function handleCarFloorContact(
    dt
) {

    if (
        landingCooldown > 0
    ) {

        landingCooldown -=
            dt;
    }


    const supportHeight =
        calculateLowestCarPoint();


    if (
        car.position.y >
        supportHeight
    ) {

        groundContact =
            false;

        wheelContact =
            false;

        grounded =
            false;

        return;
    }


    // --------------------------------------------------------
    // FLOOR CONTACT
    // --------------------------------------------------------

    car.position.y =
        supportHeight;


    if (
        verticalVelocity < 0
    ) {

        // A little impact absorption instead of infinite bounce.

        if (
            verticalVelocity <
            -10
        ) {

            verticalVelocity *=
                -0.08;

        } else {

            verticalVelocity =
                0;
        }
    }


    groundContact =
        true;


    // --------------------------------------------------------
    // DETERMINE WHICH SIDE OF CAR HIT THE FLOOR
    // --------------------------------------------------------

    getCarUp(
        tempUp
    );


    // Wheels-down orientation.
    //
    // 1 = perfectly upright.
    // 0 = sideways.
    // -1 = upside-down.

    const uprightAmount =
        tempUp.dot(
            Y_AXIS
        );


    wheelContact =
        uprightAmount >
        0.55;


    // ========================================================
    // CLEAN WHEELS-DOWN LANDING
    // ========================================================

    if (
        wheelContact &&
        landingCooldown <= 0
    ) {

        grounded =
            true;


        dodgeActive =
            false;

        dodgeTimer =
            0;

        dodgeSettleTimer =
            0;

        dodgeAngularSpeed =
            0;


        firstJumpUsed =
            false;

        secondJumpUsed =
            false;

        jumpHeldTime =
            0;


        // ----------------------------------------------------
        // IMPORTANT:
        // We DO NOT snap orientation upright.
        //
        // We only derive the ground-driving yaw from whatever
        // orientation the player actually landed with.
        // ----------------------------------------------------

        getCarForward(
            tempForward
        );


        tempForward.y =
            0;


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


        return;
    }


    // ========================================================
    // SIDE / ROOF LANDING
    // ========================================================
    //
    // No magic upright snap.
    //
    // The car stays exactly as it landed.
    // ========================================================

    grounded =
        false;


    // Prevent the car from continuously falling through the
    // floor while the player tries to recover.

    if (
        verticalVelocity < 0
    ) {

        verticalVelocity =
            0;
    }


    // Small damping prevents endless floor skating while
    // upside-down without instantly deleting momentum.

    carVelocity.x *=
        Math.exp(
            -1.2 *
            dt
        );


    carVelocity.z *=
        Math.exp(
            -1.2 *
            dt
        );
}


// ============================================================
// GROUNDED CAR PHYSICS
// ============================================================

function updateGroundPhysics(
    dt
) {

    const throttle =
        throttleInput();


    const reverse =
        reverseInput();


    const steer =
        steeringInput();


    const boosting =
        boostHeld() &&
        boostAmount > 0;


    const powersliding =
        powerslideHeld();


    // Ground driving uses yaw orientation.

    tempForward.set(

        Math.cos(
            carRotation
        ),

        0,

        -Math.sin(
            carRotation
        )
    );


    tempRight.set(

        -tempForward.z,

        0,

        tempForward.x
    );


    let forwardSpeed =
        carVelocity.dot(
            tempForward
        );


    const planarSpeed =
        Math.hypot(
            carVelocity.x,
            carVelocity.z
        );


    // ========================================================
    // THROTTLE
    // ========================================================

    if (
        throttle > 0
    ) {

        if (
            forwardSpeed <
            DRIVE_TOP_SPEED
        ) {

            const speedFraction =
                THREE.MathUtils.clamp(

                    forwardSpeed /
                    DRIVE_TOP_SPEED,

                    0,
                    1
                );


            const accelerationScale =
                1 -
                speedFraction *
                0.35;


            carVelocity.addScaledVector(

                tempForward,

                ACCELERATION *
                throttle *
                accelerationScale *
                dt
            );
        }
    }


    // ========================================================
    // BRAKE / REVERSE
    // ========================================================

    if (
        reverse > 0
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


    // ========================================================
    // BOOST
    // ========================================================

    if (
        boosting
    ) {

        carVelocity.addScaledVector(

            tempForward,

            BOOST_ACCELERATION *
            dt
        );


        boostAmount -=
            BOOST_USAGE *
            dt;


        if (
            boostAmount < 0
        ) {

            boostAmount =
                0;
        }
    }


    // ========================================================
    // STEERING
    // ========================================================

    if (
        Math.abs(steer) >
        0.001
    ) {

        const speedRatio =
            THREE.MathUtils.clamp(

                planarSpeed /
                DRIVE_TOP_SPEED,

                0,
                1
            );


        const steerSpeed =
            THREE.MathUtils.lerp(

                LOW_SPEED_STEER,

                HIGH_SPEED_STEER,

                speedRatio
            );


        const steerMultiplier =
            powersliding
                ? POWERSLIDE_STEER_MULTIPLIER
                : 1;


        carRotation -=

            steer *

            steerSpeed *

            steerMultiplier *

            dt;
    }


    // ========================================================
    // LATERAL GRIP
    // ========================================================

    forwardSpeed =
        carVelocity.dot(
            tempForward
        );


    const sidewaysSpeed =
        carVelocity.dot(
            tempRight
        );


    const grip =
        powersliding
            ? POWERSLIDE_GRIP
            : NORMAL_GRIP;


    carVelocity.addScaledVector(

        tempRight,

        -sidewaysSpeed *
        (
            1 -
            Math.exp(
                -grip *
                dt
            )
        )
    );


    // ========================================================
    // DRAG
    // ========================================================

    const powered =
        throttle > 0 ||
        reverse > 0 ||
        boosting;


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


    // ========================================================
    // GROUND ORIENTATION
    // ========================================================
    //
    // Only while actually on the wheels do we align the car
    // with ground-driving yaw.
    //
    // This does NOT happen on roof/side contact.
    // ========================================================

    car.quaternion.setFromAxisAngle(
        Y_AXIS,
        carRotation
    );


    car.position.y =
        CAR_HALF_HEIGHT;


    verticalVelocity =
        0;
}


// ============================================================
// AIRBORNE CAR PHYSICS
// ============================================================

function updateAirPhysics(
    dt
) {

    updateAerialControls(
        dt
    );


    // ========================================================
    // HELD FIRST JUMP
    // ========================================================

    if (
        jumpHeld()
        &&
        firstJumpUsed
        &&
        !secondJumpUsed
        &&
        jumpHeldTime <
            JUMP_HOLD_TIME
    ) {

        verticalVelocity +=
            JUMP_HOLD_FORCE *
            dt;


        jumpHeldTime +=
            dt;
    }


    // ========================================================
    // 3D AIR BOOST
    // ========================================================

    if (
        boostHeld()
        &&
        boostAmount > 0
    ) {

        getCarForward(
            tempForward
        );


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


        if (
            boostAmount < 0
        ) {

            boostAmount =
                0;
        }
    }


    // ========================================================
    // GRAVITY
    // ========================================================

    verticalVelocity -=
        GRAVITY *
        dt;


    // Safety against physics explosions.

    verticalVelocity =
        THREE.MathUtils.clamp(
            verticalVelocity,
            -45,
            45
        );
}


// ============================================================
// UPDATE CAR
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
        &&
        matchState !==
            MATCH_STATE.CELEBRATION
    ) {

        return;
    }


    if (
        !timerStarted
        &&
        (
            matchState ===
                MATCH_STATE.PLAYING
            ||
            matchState ===
                MATCH_STATE.OVERTIME
        )
    ) {

        timerStarted =
            true;
    }


    // ========================================================
    // GROUND / AIR
    // ========================================================

    if (
        grounded &&
        wheelContact
    ) {

        updateGroundPhysics(
            dt
        );

    } else {

        updateAirPhysics(
            dt
        );
    }


    // ========================================================
    // SPEED SAFETY
    // ========================================================

    limitHorizontalSpeed();


    // ========================================================
    // INTEGRATE POSITION
    // ========================================================

    car.position.x +=
        carVelocity.x *
        dt;


    car.position.z +=
        carVelocity.z *
        dt;


    if (
        !grounded
    ) {

        car.position.y +=
            verticalVelocity *
            dt;
    }


    // ========================================================
    // ARENA
    // ========================================================

    handleCarArenaCollision();


    // ========================================================
    // FLOOR CONTACT
    // ========================================================

    if (
        !grounded ||
        !wheelContact
    ) {

        handleCarFloorContact(
            dt
        );
    }


    spinWheels(
        dt
    );
}


// ============================================================
// BALL FLOOR PHYSICS
// ============================================================

function collideBallWithFloor() {

    if (
        ball.position.y >=
        BALL_RADIUS
    ) {

        return;
    }


    ball.position.y =
        BALL_RADIUS;


    if (
        ballVelocity.y < 0
    ) {

        ballVelocity.y *=
            -0.52;


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
}


// ============================================================
// BALL SIDE WALLS
// ============================================================

function collideBallWithSideWalls() {

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
            ballVelocity.z > 0
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
            ballVelocity.z < 0
        ) {

            ballVelocity.z *=
                -0.68;
        }
    }
}


// ============================================================
// BALL END WALL / GOAL PHYSICS
// ============================================================
//
// THIS IS THE v0.6.1 GOAL-MAGNET FIX.
//
// The old behaviour could effectively treat the entire goal
// mouth as a special collision region too early.
//
// This version:
//
// 1. Never changes the ball's Z coordinate merely because it
//    is near the goal.
//
// 2. Never redirects the ball toward the centre of the goal.
//
// 3. Only lets the ball pass the end wall if the WHOLE sphere
//    physically fits through the rectangular opening.
//
// 4. Only applies goal interior collisions AFTER the sphere has
//    actually crossed the goal line.
//
// The ball therefore keeps the trajectory physics gave it.
// ============================================================

function collideBallWithEnds() {

    const absX =
        Math.abs(
            ball.position.x
        );


    const side =
        Math.sign(
            ball.position.x
        ) || 1;


    // --------------------------------------------------------
    // TRUE SPHERE CLEARANCE THROUGH GOAL OPENING
    // --------------------------------------------------------

    const goalHalfWidth =
        GOAL_WIDTH / 2;


    const fitsGoalWidth =
        Math.abs(
            ball.position.z
        ) +
        BALL_RADIUS
        <
        goalHalfWidth;


    const fitsGoalHeight =
        ball.position.y +
        BALL_RADIUS
        <
        GOAL_HEIGHT;


    const insideOpening =
        fitsGoalWidth &&
        fitsGoalHeight;


    // --------------------------------------------------------
    // STILL INSIDE FIELD
    // --------------------------------------------------------

    if (
        absX <=
        HALF_LENGTH -
        BALL_RADIUS
    ) {

        return;
    }


    // ========================================================
    // END WALL COLLISION
    // ========================================================
    //
    // If the ball does NOT physically fit through the goal,
    // the end wall remains solid.
    // ========================================================

    if (
        !insideOpening
    ) {

        const endLimit =
            HALF_LENGTH -
            BALL_RADIUS;


        ball.position.x =
            side *
            endLimit;


        if (
            ballVelocity.x *
            side >
            0
        ) {

            ballVelocity.x *=
                -0.68;
        }


        return;
    }


    // ========================================================
    // BALL IS ALLOWED THROUGH GOAL OPENING
    // ========================================================

    const beyondGoalLine =
        absX >
        HALF_LENGTH;


    if (
        !beyondGoalLine
    ) {

        return;
    }


    // --------------------------------------------------------
    // GOAL SIDE WALLS
    // --------------------------------------------------------

    const insideSideLimit =
        goalHalfWidth -
        BALL_RADIUS;


    if (
        ball.position.z >
        insideSideLimit
    ) {

        ball.position.z =
            insideSideLimit;


        if (
            ballVelocity.z >
            0
        ) {

            ballVelocity.z *=
                -0.55;
        }
    }


    if (
        ball.position.z <
        -insideSideLimit
    ) {

        ball.position.z =
            -insideSideLimit;


        if (
            ballVelocity.z <
            0
        ) {

            ballVelocity.z *=
                -0.55;
        }
    }


    // --------------------------------------------------------
    // GOAL ROOF
    // --------------------------------------------------------

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
                -0.50;
        }
    }


    // --------------------------------------------------------
    // GOAL BACK WALL
    // --------------------------------------------------------

    const backLimit =
        HALF_LENGTH +
        GOAL_DEPTH -
        BALL_RADIUS;


    if (
        absX >
        backLimit
    ) {

        ball.position.x =
            side *
            backLimit;


        if (
            ballVelocity.x *
            side >
            0
        ) {

            ballVelocity.x *=
                -0.55;
        }
    }
}


// ============================================================
// BALL SPEED SAFETY
// ============================================================

function limitBallSpeed() {

    const speed =
        ballVelocity.length();


    const maxBallSpeed =
        70;


    if (
        speed >
        maxBallSpeed
    ) {

        ballVelocity.multiplyScalar(

            maxBallSpeed /
            speed
        );
    }
}


// ============================================================
// UPDATE BALL
// ============================================================

function updateBall(
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
        &&
        matchState !==
            MATCH_STATE.CELEBRATION
    ) {

        return;
    }


    // --------------------------------------------------------
    // GRAVITY
    // --------------------------------------------------------

    ballVelocity.y -=
        21 *
        dt;


    // --------------------------------------------------------
    // POSITION
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
    // FLOOR
    // --------------------------------------------------------

    collideBallWithFloor();


    // Ground friction.

    if (
        ball.position.y <=
        BALL_RADIUS + 0.02
    ) {

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
    // WALLS
    // --------------------------------------------------------

    collideBallWithSideWalls();

    collideBallWithEnds();


    // --------------------------------------------------------
    // SAFETY
    // --------------------------------------------------------

    limitBallSpeed();
}


// ============================================================
// CAR / BALL COLLISION
// ============================================================

function handleCarBallCollision() {

    // Lightweight approximation:
    // treat the car as a collision sphere centred slightly
    // above its group origin.

    tempBallDifference
        .copy(
            ball.position
        )
        .sub(
            car.position
        );


    tempBallDifference.y -=
        0.9;


    const carCollisionRadius =
        2.55;


    const collisionDistance =
        carCollisionRadius +
        BALL_RADIUS;


    const distanceSq =
        tempBallDifference
            .lengthSq();


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
            0.2,
            0
        );

        distance =
            tempBallDifference
                .length();
    }


    tempBallDifference.divideScalar(
        distance
    );


    // --------------------------------------------------------
    // SEPARATE BALL FROM CAR
    // --------------------------------------------------------

    const penetration =
        collisionDistance -
        distance;


    ball.position.addScaledVector(

        tempBallDifference,

        penetration +
        0.02
    );


    // --------------------------------------------------------
    // IMPACT SPEED
    // --------------------------------------------------------

    tempVelocity.set(

        carVelocity.x,

        verticalVelocity,

        carVelocity.z
    );


    const relativeVelocity =
        tempVelocity
            .sub(
                ballVelocity
            );


    const closingSpeed =
        relativeVelocity.dot(
            tempBallDifference
        );


    if (
        closingSpeed <= 0
    ) {

        return;
    }


    const impact =
        Math.min(
            closingSpeed *
            1.15 +
            4,
            38
        );


    ballVelocity.addScaledVector(

        tempBallDifference,

        impact
    );


    // Give some car momentum directly to the ball.

    ballVelocity.x +=
        carVelocity.x *
        0.22;


    ballVelocity.z +=
        carVelocity.z *
        0.22;


    ballVelocity.y +=
        Math.max(
            verticalVelocity,
            0
        ) *
        0.18;


    limitBallSpeed();
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
        // ACTIVE
        // ----------------------------------------------------

        if (
            pad.active
        ) {

            pad.pickup.rotation.y +=
                dt *
                (
                    pad.big
                        ? 1.5
                        : 2
                );


            pad.orb.rotation.x +=
                dt *
                1.7;


            // Cheap squared-distance test.

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
                distanceSq <=
                pad.pickupRadiusSq
                &&
                car.position.y <
                3.5
            ) {

                if (
                    pad.big
                ) {

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


                pad.pickup.visible =
                    false;
            }


            continue;
        }


        // ----------------------------------------------------
        // RESPAWN
        // ----------------------------------------------------

        pad.timer -=
            dt;


        if (
            pad.timer <= 0
        ) {

            pad.timer =
                0;


            pad.active =
                true;


            pad.pickup.visible =
                true;
        }
    }
}


// ============================================================
// UPDATE GOAL EXPLOSIONS
// ============================================================

function updateGoalExplosions(
    dt
) {

    for (
        let i =
            goalExplosions.length - 1;

        i >= 0;

        i--
    ) {

        const explosion =
            goalExplosions[i];


        explosion.age +=
            dt;


        const progress =
            explosion.age /
            explosion.lifetime;


        const sphereScale =
            1 +
            progress *
            13;


        const ringScale =
            1 +
            progress *
            17;


        explosion.sphere.scale.setScalar(
            sphereScale
        );


        explosion.ring.scale.setScalar(
            ringScale
        );


        explosion.sphereMaterial.opacity =
            Math.max(
                0,
                0.75 *
                (
                    1 -
                    progress
                )
            );


        explosion.ringMaterial.opacity =
            Math.max(
                0,
                0.85 *
                (
                    1 -
                    progress
                )
            );


        if (
            progress >= 1
        ) {

            scene.remove(
                explosion.group
            );


            explosion.sphereMaterial
                .dispose();


            explosion.ringMaterial
                .dispose();


            goalExplosions.splice(
                i,
                1
            );
        }
    }
}


// ============================================================
// RESET CAR ORIENTATION
// ============================================================

function resetCarOrientation() {

    carRotation =
        0;


    car.quaternion.identity();


    carQuaternion.identity();


    grounded =
        true;


    groundContact =
        true;


    wheelContact =
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


    dodgeSettleTimer =
        0;


    dodgeAngularSpeed =
        0;


    dodgeAxis.set(
        0,
        0,
        0
    );


    landingCooldown =
        0;
}


// ============================================================
// RESET KICKOFF
// ============================================================

function resetKickoff() {

    car.position.set(
        -35,
        CAR_HALF_HEIGHT,
        0
    );


    carVelocity.set(
        0,
        0,
        0
    );


    verticalVelocity =
        0;


    resetCarOrientation();


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


    boostAmount =
        matchState ===
            MATCH_STATE.FREEPLAY
            ? 100
            : 33;


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
// CONTROLLER ONE-SHOT ACTIONS
// ============================================================

function processControllerActions() {

    if (
        controllerState.jumpPressed
        &&
        !goalPause
        &&
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
// END OF v0.6.1 PART 2 / 3
//
// PART 3 GOES DIRECTLY UNDER THIS LINE.
//
// Part 3 contains:
// - goal detection/scoring
// - timer/overtime
// - celebration/results
// - free play/new match
// - rebuilt Ball Cam
// - rebuilt Car Cam
// - HUD updates
// - fixed frame limiter
// - startup
//
// DO NOT RUN YET.
// ============================================================
// ============================================================
// BOOSTBALL v0.6.1 — FLIGHT SCHOOL DETENTION
// PART 3 / 3
//
// Goal scoring.
// Match timer.
// Overtime.
// Celebration/results.
// Free play.
// Camera rebuild.
// HUD.
// Performance diagnostics.
// Fixed frame limiter.
// Startup.
//
// THIS COMPLETES v0.6.1.
// ============================================================


// ============================================================
// GOAL DETECTION
// ============================================================
//
// IMPORTANT:
//
// Goal detection is separate from goal collision.
//
// The ball is only considered scored once its CENTRE has
// actually crossed the goal line.
//
// Nothing here changes ball velocity or position.
// Therefore this function cannot "pull" the ball into the net.
// ============================================================

function checkGoals() {

    if (
        goalPause
        ||
        matchState ===
            MATCH_STATE.CELEBRATION
        ||
        matchState ===
            MATCH_STATE.RESULTS
    ) {

        return;
    }


    // --------------------------------------------------------
    // FREE PLAY
    // --------------------------------------------------------
    //
    // Free Play goals simply reset after a short pause.
    // No score is added.
    // --------------------------------------------------------

    const insideGoalWidth =
        Math.abs(
            ball.position.z
        ) <
        (
            GOAL_WIDTH / 2 -
            BALL_RADIUS * 0.15
        );


    const belowCrossbar =
        ball.position.y <
        (
            GOAL_HEIGHT -
            BALL_RADIUS * 0.10
        );


    if (
        !insideGoalWidth ||
        !belowCrossbar
    ) {

        return;
    }


    // ========================================================
    // ORANGE END
    // ========================================================

    if (
        ball.position.x >
        HALF_LENGTH +
        BALL_RADIUS * 0.10
    ) {

        if (
            matchState ===
            MATCH_STATE.FREEPLAY
        ) {

            freePlayGoal(
                1
            );

        } else {

            scoreGoal(
                "blue",
                1
            );
        }


        return;
    }


    // ========================================================
    // BLUE END
    // ========================================================

    if (
        ball.position.x <
        -HALF_LENGTH -
        BALL_RADIUS * 0.10
    ) {

        if (
            matchState ===
            MATCH_STATE.FREEPLAY
        ) {

            freePlayGoal(
                -1
            );

        } else {

            scoreGoal(
                "orange",
                -1
            );
        }
    }
}


// ============================================================
// FREE PLAY GOAL
// ============================================================

function freePlayGoal(
    side
) {

    goalPause =
        true;


    goalPauseTimer =
        1.15;


    goalText =
        "GOAL!";


    createGoalExplosion(

        side,

        side > 0
            ? "blue"
            : "orange"
    );
}


// ============================================================
// SCORE GOAL
// ============================================================

function scoreGoal(
    team,
    side
) {

    if (
        team === "blue"
    ) {

        blueScore++;


        matchStats.goals++;


        matchStats.score +=
            100;

    } else {

        orangeScore++;
    }


    createGoalExplosion(
        side,
        team
    );


    // ========================================================
    // GOLDEN-GOAL OVERTIME
    // ========================================================

    if (
        matchState ===
        MATCH_STATE.OVERTIME
    ) {

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
        team === "blue"
            ? "BLUE SCORES!"
            : "ORANGE SCORES!";
}


// ============================================================
// MATCH TIMER
// ============================================================

function updateMatch(
    dt
) {

    if (
        menuOpen
        ||
        goalPause
        ||
        !timerStarted
        ||
        matchState ===
            MATCH_STATE.CELEBRATION
        ||
        matchState ===
            MATCH_STATE.RESULTS
        ||
        matchState ===
            MATCH_STATE.FREEPLAY
    ) {

        return;
    }


    // Overtime is untimed.

    if (
        matchState ===
        MATCH_STATE.OVERTIME
    ) {

        return;
    }


    gameTime -=
        dt;


    if (
        gameTime > 0
    ) {

        return;
    }


    gameTime =
        0;


    // ========================================================
    // MATCH WINNER
    // ========================================================

    if (
        blueScore >
        orangeScore
    ) {

        endMatch(
            "blue"
        );

        return;
    }


    if (
        orangeScore >
        blueScore
    ) {

        endMatch(
            "orange"
        );

        return;
    }


    // ========================================================
    // OVERTIME
    // ========================================================

    matchState =
        MATCH_STATE.OVERTIME;


    goalText =
        "OVERTIME";
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
        goalPauseTimer > 0
    ) {

        return;
    }


    goalPauseTimer =
        0;


    goalPause =
        false;


    const wasOvertime =
        matchState ===
        MATCH_STATE.OVERTIME;


    const wasFreePlay =
        matchState ===
        MATCH_STATE.FREEPLAY;


    resetKickoff();


    if (
        wasFreePlay
    ) {

        boostAmount =
            100;

        goalText =
            "";

        return;
    }


    if (
        wasOvertime
    ) {

        goalText =
            "OVERTIME";
    }
}


// ============================================================
// END MATCH
// ============================================================

function endMatch(
    winner
) {

    winningTeam =
        winner;


    matchResult =
        winner === "blue"
            ? "BLUE WINS"
            : "ORANGE WINS";


    matchState =
        MATCH_STATE.CELEBRATION;


    celebrationTimer =
        CELEBRATION_DURATION;


    goalPause =
        false;


    goalPauseTimer =
        0;


    goalText =
        "";


    showCelebration();
}


// ============================================================
// UPDATE CELEBRATION
// ============================================================

let previousCelebrationSecond =
    -1;


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


    const displayedSecond =
        Math.max(
            0,
            Math.ceil(
                celebrationTimer
            )
        );


    // Only touch the DOM if the displayed number changes.

    if (
        displayedSecond !==
        previousCelebrationSecond
    ) {

        previousCelebrationSecond =
            displayedSecond;


        const countdown =
            document.getElementById(
                "celebrationCountdown"
            );


        if (
            countdown
        ) {

            countdown.textContent =
                `Results in ${displayedSecond}`;
        }
    }


    if (
        celebrationTimer > 0
    ) {

        return;
    }


    celebrationTimer =
        0;


    previousCelebrationSecond =
        -1;


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


    verticalVelocity =
        0;


    ballVelocity.set(
        0,
        0,
        0
    );


    showResultsScreen();
}


// ============================================================
// START NEW MATCH
// ============================================================

function startNewMatch() {

    resultsScreen.style.display =
        "none";


    celebrationBanner.style.display =
        "none";


    menuOpen =
        false;


    updateMenu();


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


    matchState =
        MATCH_STATE.PLAYING;


    goalPause =
        false;


    goalPauseTimer =
        0;


    goalText =
        "";


    celebrationTimer =
        0;


    previousCelebrationSecond =
        -1;


    resetMatchStats();


    resetKickoff();


    previousScore =
        "";

    previousTimer =
        "";

    previousBoost =
        "";

    previousCamera =
        "";

    previousGoalMessage =
        "";

    previousHint =
        "";


    clearHeldInputs();


    resetFrameClock();
}


// ============================================================
// START FREE PLAY
// ============================================================

function startFreePlay() {

    resultsScreen.style.display =
        "none";


    celebrationBanner.style.display =
        "none";


    menuOpen =
        false;


    updateMenu();


    matchState =
        MATCH_STATE.FREEPLAY;


    winningTeam =
        null;


    matchResult =
        "";


    goalPause =
        false;


    goalPauseTimer =
        0;


    goalText =
        "";


    timerStarted =
        false;


    gameTime =
        300;


    resetMatchStats();


    resetKickoff();


    boostAmount =
        100;


    clearHeldInputs();


    resetFrameClock();
}


// ============================================================
// CAMERA HELPERS
// ============================================================

function exponentialSmoothing(
    speed,
    dt
) {

    return 1 -
        Math.exp(
            -speed *
            dt
        );
}


// ============================================================
// BALL CAM
// ============================================================
//
// v0.6.1 CAMERA REBUILD:
//
// The camera remains anchored to the CAR.
//
// The ball controls where we LOOK,
// not where the camera magically teleports.
//
// This fixes the ancient v0.1-style feeling where the camera
// seemed to wander off by itself.
//
// We also keep a fallback direction for when the ball is very
// close to the car, preventing unstable vector flips.
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


function updateBallCamera(
    dt
) {

    // --------------------------------------------------------
    // CAR FORWARD
    // --------------------------------------------------------

    getCarForward(
        tempForward
    );


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

            -Math.sin(
                carRotation
            )
        );

    } else {

        tempForward.normalize();
    }


    // --------------------------------------------------------
    // CAR -> BALL HORIZONTAL DIRECTION
    // --------------------------------------------------------

    tempCarToBall
        .copy(
            ball.position
        )
        .sub(
            car.position
        );


    const horizontalBallDistance =
        Math.hypot(

            tempCarToBall.x,

            tempCarToBall.z
        );


    tempCarToBall.y =
        0;


    if (
        horizontalBallDistance >
        1.25
    ) {

        tempCarToBall.normalize();


        // ----------------------------------------------------
        // CAMERA DIRECTION
        // ----------------------------------------------------
        //
        // Mostly follows ball direction but retains enough of
        // the car's forward direction to remain readable.
        // ----------------------------------------------------

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


            // Prevent a sudden 180° direction inversion.
            //
            // If the new direction is violently opposite the
            // previous one, smoothly favour the old direction
            // for this frame.

            const directionDot =
                ballCamDirection.dot(
                    previousBallCamDirection
                );


            if (
                directionDot <
                -0.55
            ) {

                ballCamDirection
                    .addScaledVector(
                        previousBallCamDirection,
                        0.8
                    );


                if (
                    ballCamDirection.lengthSq() >
                    0.001
                ) {

                    ballCamDirection.normalize();
                }
            }
        }

    } else {

        // Ball almost directly underneath/above the car.
        //
        // Keep the last stable direction instead of allowing
        // normalize() to create camera nonsense.

        ballCamDirection.copy(
            previousBallCamDirection
        );
    }


    // --------------------------------------------------------
    // SMOOTH DIRECTION
    // --------------------------------------------------------

    const directionBlend =
        exponentialSmoothing(
            10,
            dt
        );


    previousBallCamDirection
        .lerp(
            ballCamDirection,
            directionBlend
        );


    if (
        previousBallCamDirection
            .lengthSq() >
        0.001
    ) {

        previousBallCamDirection
            .normalize();
    }


    // --------------------------------------------------------
    // CAMERA DISTANCE
    // --------------------------------------------------------

    const cameraDistance =
        THREE.MathUtils.clamp(

            12.5 +
            horizontalBallDistance *
            0.025,

            12.5,

            15
        );


    // --------------------------------------------------------
    // DESIRED CAMERA POSITION
    // --------------------------------------------------------

    tempCameraPosition
        .copy(
            car.position
        );


    tempCameraPosition
        .addScaledVector(

            previousBallCamDirection,

            -cameraDistance
        );


    tempCameraPosition.y +=
        6.6;


    // --------------------------------------------------------
    // DESIRED LOOK TARGET
    // --------------------------------------------------------
    //
    // Mostly ball.
    // Slight amount of car keeps the view readable at extreme
    // ball distances.
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // FRAME-RATE-INDEPENDENT SMOOTHING
    // --------------------------------------------------------

    const positionBlend =
        exponentialSmoothing(
            8.5,
            dt
        );


    const lookBlend =
        exponentialSmoothing(
            11,
            dt
        );


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
// CAR CAM
// ============================================================

function updateCarCamera(
    dt
) {

    // Car Cam deliberately uses the car's actual orientation
    // while airborne.
    //
    // However, we flatten the rear direction slightly so the
    // camera doesn't rotate completely upside-down with the
    // vehicle and become impossible to use.

    getCarForward(
        tempForward
    );


    tempHorizontal.set(

        tempForward.x,

        0,

        tempForward.z
    );


    if (
        tempHorizontal.lengthSq() <
        0.001
    ) {

        tempHorizontal.set(

            Math.cos(
                carRotation
            ),

            0,

            -Math.sin(
                carRotation
            )
        );

    } else {

        tempHorizontal.normalize();
    }


    tempCameraPosition
        .copy(
            car.position
        )
        .addScaledVector(
            tempHorizontal,
            -13
        );


    tempCameraPosition.y +=
        6.8;


    tempCameraLook
        .copy(
            car.position
        )
        .addScaledVector(
            tempHorizontal,
            4.5
        );


    tempCameraLook.y +=
        1.15;


    const positionBlend =
        exponentialSmoothing(
            9,
            dt
        );


    const lookBlend =
        exponentialSmoothing(
            11,
            dt
        );


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
// UPDATE CAMERA
// ============================================================

let previousBallCamMode =
    ballCam;


function updateCamera(
    dt
) {

    // Reset camera smoothing when switching modes.
    //
    // This prevents the old camera's position/look vector from
    // dragging the new camera around for several frames.

    if (
        ballCam !==
        previousBallCamMode
    ) {

        cameraInitialized =
            false;


        previousBallCamMode =
            ballCam;


        getCarForward(
            tempForward
        );


        tempForward.y =
            0;


        if (
            tempForward.lengthSq() >
            0.001
        ) {

            tempForward.normalize();


            previousBallCamDirection
                .copy(
                    tempForward
                );


            ballCamDirection
                .copy(
                    tempForward
                );
        }
    }


    if (
        ballCam
    ) {

        updateBallCamera(
            dt
        );

    } else {

        updateCarCamera(
            dt
        );
    }
}


// ============================================================
// FORMAT TIMER
// ============================================================

function formatTime(
    seconds
) {

    const safeSeconds =
        Math.max(
            0,
            seconds
        );


    const minutes =
        Math.floor(
            safeSeconds /
            60
        );


    const remainingSeconds =
        Math.floor(
            safeSeconds %
            60
        );


    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(
            2,
            "0"
        )}`;
}


// ============================================================
// UPDATE HUD
// ============================================================

function updateHUD() {

    // --------------------------------------------------------
    // SCORE
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // TIMER / MATCH STATE
    // --------------------------------------------------------

    let timerText;


    if (
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

    } else if (
        matchState ===
        MATCH_STATE.RESULTS
        ||
        matchState ===
        MATCH_STATE.CELEBRATION
    ) {

        timerText =
            "FINAL";

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


    // --------------------------------------------------------
    // BOOST
    // --------------------------------------------------------

    const boostText =
        `BOOST: ${Math.round(boostAmount)}`;


    if (
        boostText !==
        previousBoost
    ) {

        boostElement.textContent =
            boostText;


        previousBoost =
            boostText;
    }


    // --------------------------------------------------------
    // CAMERA
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // GOAL MESSAGE
    // --------------------------------------------------------

    if (
        goalText !==
        previousGoalMessage
    ) {

        goalMessageElement.textContent =
            goalText;


        previousGoalMessage =
            goalText;
    }


    // --------------------------------------------------------
    // HINT
    // --------------------------------------------------------

    let hintText =
        "TAB — Menu";


    if (
        controllerState.connected
    ) {

        hintText =
            "PS5 Controller Connected · TAB — Menu";
    }


    if (
        matchState ===
        MATCH_STATE.FREEPLAY
    ) {

        hintText =
            controllerState.connected
                ? "FREE PLAY · PS5 Controller Connected · TAB — Menu"
                : "FREE PLAY · TAB — Menu";
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
// PERFORMANCE DISPLAY
// ============================================================

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

        measuredFPS =
            Math.round(

                diagnosticFrames /
                diagnosticTime
            );


        diagnosticFrames =
            0;


        diagnosticTime =
            0;


        const preset =
            GRAPHICS_PRESETS[
                graphicsPreset
            ];


        performanceDisplay.textContent =
            `${measuredFPS} FPS · ${preset.label}`;
    }
}


// ============================================================
// WINDOW RESIZE
// ============================================================

function handleResize() {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}


window.addEventListener(
    "resize",
    handleResize
);


// ============================================================
// FIXED FRAME LIMITER
// ============================================================
//
// v0.6 used:
//
// nextRenderTime = timestamp + frameInterval
//
// On a 60 Hz display, browser frame timing can be something
// like 16.66 ms while the exact target is 16.666... ms.
//
// That tiny difference could cause every OTHER frame to be
// rejected, accidentally turning the 60 FPS setting into
// roughly 30 FPS.
//
// v0.6.1 uses accumulated elapsed time with a small tolerance.
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


    // ========================================================
    // HIDDEN TAB
    // ========================================================

    if (
        !pageVisible
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


    // ========================================================
    // FIRST FRAME
    // ========================================================

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
            1 /
            preset.fps
        );


        updateHUD();


        renderer.render(
            scene,
            camera
        );


        return;
    }


    // ========================================================
    // FRAME CAP
    // ========================================================

    const renderElapsed =
        timestamp -
        previousRenderTime;


    // Half-millisecond tolerance prevents a 60 Hz monitor's
    // 16.66 ms callback from missing a 16.666 ms target.

    if (
        renderElapsed <
        frameInterval -
        0.5
    ) {

        return;
    }


    // Keep timing aligned rather than simply scheduling the
    // next frame from "now".

    previousRenderTime =
        timestamp -
        (
            renderElapsed %
            frameInterval
        );


    // ========================================================
    // DELTA TIME
    // ========================================================

    let dt =
        (
            timestamp -
            previousFrameTime
        ) /
        1000;


    previousFrameTime =
        timestamp;


    // Protect physics from giant tab-switch/update spikes.

    dt =
        THREE.MathUtils.clamp(
            dt,
            0.001,
            0.033
        );


    // ========================================================
    // CONTROLLER
    // ========================================================

    updateController();


    if (
        !menuOpen
    ) {

        processControllerActions();
    }


    // ========================================================
    // GAMEPLAY
    // ========================================================

    if (
        !menuOpen
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


        handleCarBallCollision();


        if (
            matchState ===
            MATCH_STATE.FREEPLAY
        ) {

            boostAmount =
                100;

        } else {

            updateBoostPads(
                dt
            );
        }


        checkGoals();


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


    // ========================================================
    // EFFECTS
    // ========================================================

    if (
        goalExplosions.length >
        0
    ) {

        updateGoalExplosions(
            dt
        );
    }


    // ========================================================
    // CAMERA / HUD
    // ========================================================

    updateCamera(
        dt
    );


    updateHUD();


    updatePerformanceDisplay(
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


updateHUD();


updateMenu();


requestAnimationFrame(
    animate
);


// ============================================================
// BOOSTBALL v0.6.1 — FLIGHT SCHOOL DETENTION
//
// COMPLETE.
//
// v0.6.1 CHANGES:
//
// - Ball radius:
//      1.8 -> 2.6
//
// - Goal-mouth collision rebuilt.
//   No intentional centring, snapping or magnetic behaviour.
//
// - Aerial pitch/yaw/roll rebuilt around actual local axes.
//
// - Dodge rotation now uses a correct world-space axis.
//
// - Dodge animation slowed down.
//
// - Post-dodge forced rotation fades out over ~0.5 seconds.
//
// - Dodge settling does NOT delete the car's flight velocity.
//
// - Sideways / upside-down landings preserve orientation.
//
// - Wheels-down landings no longer visually snap upright.
//
// - Ball Cam rebuilt around the car.
//
// - Car Cam smoothing rebuilt.
//
// - Camera switching resets smoothing state.
//
// - Frame limiter repaired to avoid accidental 30 FPS on the
//   60 FPS presets.
//
// - Celebration countdown avoids pointless per-frame DOM writes.
//
// - Free Play goals now reset properly.
//
// - Driving speed intentionally unchanged.
//
//
// v0.7:
//
// Lobbies.
// Multiplayer.
// Live scoreboard.
// R1 scoreboard bind.
// Player names.
// Ping.
// Proper multiplayer stats.
//
//
// The microwave has completed remedial flight school.
// Whether it PASSED is now your problem.
// ============================================================
