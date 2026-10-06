// ============================================================
// BOOSTBALL v0.5 — THE MICROWAVE LEARNS TO FLY
//
// The car has discovered the Y axis.
// This was a mistake.
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

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


// ============================================================
// GRAPHICS SETTINGS
// ============================================================

const GRAPHICS_STORAGE_KEY =
    "boostball-graphics-v05";

const GRAPHICS_PRESETS = {

    performance: {
        label: "Performance",
        pixelRatio: 0.75,
        shadows: false,
        fps: 30
    },

    balanced: {
        label: "Balanced",
        pixelRatio: 1,
        shadows: true,
        fps: 60
    },

    quality: {
        label: "Quality",
        pixelRatio: 1.25,
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

function applyGraphicsPreset() {

    const preset =
        GRAPHICS_PRESETS[
            graphicsPreset
        ];

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            preset.pixelRatio
        )
    );

    renderer.shadowMap.enabled =
        preset.shadows;

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    if (
        typeof sun !== "undefined"
    ) {

        sun.castShadow =
            preset.shadows;
    }

    body.castShadow =
        preset.shadows;

    cabin.castShadow =
        preset.shadows;

    nose.castShadow =
        preset.shadows;

    ball.castShadow =
        preset.shadows;

    for (
        const wheel of wheels
    ) {

        wheel.castShadow =
            preset.shadows;
    }
}


// ============================================================
// SCENE
// ============================================================

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(
        0x07111f
    );

scene.fog =
    new THREE.Fog(
        0x07111f,
        140,
        240
    );


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


// ============================================================
// LIGHTING
// ============================================================

const hemisphereLight =
    new THREE.HemisphereLight(
        0x9fc8ff,
        0x1a241c,
        2.4
    );

scene.add(
    hemisphereLight
);

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

sun.position.set(
    -40,
    80,
    35
);

sun.castShadow = true;

sun.shadow.mapSize.set(
    1024,
    1024
);

sun.shadow.camera.left = -95;
sun.shadow.camera.right = 95;
sun.shadow.camera.top = 70;
sun.shadow.camera.bottom = -70;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 180;

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

const BALL_RADIUS = 1.8;


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

field.receiveShadow = true;

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
        opacity: 0.75
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
    i <= 64;
    i++
) {

    const angle =
        (
            i / 64
        ) *
        Math.PI *
        2;

    circlePoints.push(

        new THREE.Vector3(

            Math.cos(
                angle
            ) *
            circleRadius,

            0.025,

            Math.sin(
                angle
            ) *
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
            opacity: 0.75
        })

    );

scene.add(
    circle
);


// ============================================================
// WALLS
// ============================================================

const wallMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x80b8dd,
        transparent: true,
        opacity: 0.18,
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide
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

    wall.receiveShadow = true;

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
        const direction of [-1, 1]
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
        new THREE.MeshStandardMaterial({
            color: colour,
            transparent: true,
            opacity: 0.13,
            roughness: 0.55,
            metalness: 0.05,
            side: THREE.DoubleSide
        });

    const postMaterial =
        new THREE.MeshStandardMaterial({
            color: colour,
            roughness: 0.4,
            metalness: 0.25
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
        const zDirection of [-1, 1]
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
        const zDirection of [-1, 1]
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

        post.castShadow = true;

        scene.add(
            post
        );
    }


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

    crossbar.castShadow = true;

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


// Body

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

body.castShadow = true;
body.receiveShadow = true;

car.add(
    body
);


// Nose

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

nose.castShadow = true;

car.add(
    nose
);


// Cabin

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

cabin.castShadow = true;

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
        16
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

    wheel.castShadow = true;

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

ball.castShadow = true;

scene.add(
    ball
);

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


// Ground engine

const ACCELERATION = 29;
const REVERSE_ACCELERATION = 18;
const BRAKING = 34;

const DRIVE_TOP_SPEED = 29;
const REVERSE_TOP_SPEED = 15;

const BOOST_TOP_SPEED = 45;
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
// NEW v0.5 AERIAL STATE
// ============================================================

// Ground yaw is still stored in carRotation.
//
// Once airborne, pitch and roll are independent.
// Existing momentum does NOT rotate just because the car rotates.

let airPitch = 0;
let airRoll = 0;

const AIR_PITCH_SPEED = 2.15;
const AIR_YAW_SPEED = 1.85;
const AIR_ROLL_SPEED = 2.35;

const LANDING_LEVEL_SPEED = 9;


// Actual 3D orientation used by aerial boost.

const carQuaternion =
    new THREE.Quaternion();

const yawQuaternion =
    new THREE.Quaternion();

const pitchQuaternion =
    new THREE.Quaternion();

const rollQuaternion =
    new THREE.Quaternion();

const Y_AXIS =
    new THREE.Vector3(
        0,
        1,
        0
    );

const Z_AXIS =
    new THREE.Vector3(
        0,
        0,
        1
    );

const LOCAL_FORWARD =
    new THREE.Vector3(
        1,
        0,
        0
    );


// ============================================================
// CONTROLS
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


// Keep v0.4.2's storage key so everyone's existing controls
// survive the v0.5 update.

function loadControls() {

    try {

        const saved =
            JSON.parse(

                localStorage.getItem(
                    CONTROL_STORAGE_KEY
                )

            );

        if (
            saved &&
            typeof saved ===
            "object"
        ) {

            for (
                const action of
                Object.keys(
                    DEFAULT_CONTROLS
                )
            ) {

                if (
                    typeof saved[
                        action
                    ] ===
                    "string"
                ) {

                    controls[
                        action
                    ] =
                        saved[
                            action
                        ];
                }
            }
        }

    } catch (
        error
    ) {

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

            JSON.stringify(
                controls
            )

        );

    } catch (
        error
    ) {

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
// INPUT
// ============================================================

const keys = {};
const pressed = {};

let menuOpen = false;

let rebindingAction = null;

let controlNotice = "";


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


function clearHeldInputs() {

    for (
        const key in keys
    ) {

        keys[
            key
        ] = false;
    }

    for (
        const key in pressed
    ) {

        pressed[
            key
        ] = false;
    }
}


function browserShortcutActive(
    event
) {

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
// GAME STATE
// ============================================================

let blueScore = 0;

let orangeScore = 0;

let gameTime = 300;

let timerStarted = false;

let ballCam = true;

let goalPause = false;

let goalPauseTimer = 0;

let goalText = "";

let overtime = false;

let matchEnded = false;

let matchResult = "";

let winningTeam = null;

let winnerShowcase = false;

let winnerShowcaseTimer = 0;


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
        // Rebinding
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
                    "That shortcut is reserved for your browser or operating system.";

                updateMenu();

                return;
            }


            if (
                rebindingAction ===
                "menu"
            ) {

                controlNotice =
                    "TAB is kept as the menu key.";

                rebindingAction =
                    null;

                updateMenu();

                return;
            }


            if (
                key ===
                "tab"
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
                ).find(

                    action =>

                        action !==
                        rebindingAction &&

                        controls[
                            action
                        ] ===
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
        // Browser shortcuts
        // ----------------------------------------------------

        if (
            browserShortcutActive(
                event
            )
        ) {

            return;
        }


        // ----------------------------------------------------
        // Menu
        // ----------------------------------------------------

        if (
            key ===
            controls.menu &&

            !pressed[
                key
            ]
        ) {

            event.preventDefault();

            menuOpen =
                !menuOpen;

            clearHeldInputs();

            controlNotice = "";

            updateMenu();

            pressed[
                key
            ] = true;

            return;
        }


        if (
            menuOpen
        ) {

            if (
                key === " " ||
                key.startsWith(
                    "arrow"
                )
            ) {

                event.preventDefault();
            }

            return;
        }


        // ----------------------------------------------------
        // Gameplay
        // ----------------------------------------------------

        keys[
            key
        ] = true;


        if (
            !pressed[
                key
            ]
        ) {

            pressed[
                key
            ] = true;


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

                if (
                    matchEnded
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

        keys[
            key
        ] = false;

        pressed[
            key
        ] = false;
    }
);


window.addEventListener(
    "blur",
    () => {

        clearHeldInputs();
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


const smallRingGeometry =
    new THREE.RingGeometry(
        1.15,
        1.55,
        20
    );


const bigRingGeometry =
    new THREE.RingGeometry(
        1.65,
        2.15,
        24
    );


const smallCircleGeometry =
    new THREE.CircleGeometry(
        0.55,
        16
    );


const bigCircleGeometry =
    new THREE.CircleGeometry(
        0.8,
        20
    );


const smallTorusGeometry =
    new THREE.TorusGeometry(
        0.72,
        0.15,
        8,
        16
    );


const bigTorusGeometry =
    new THREE.TorusGeometry(
        1.05,
        0.2,
        8,
        18
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
        emissiveIntensity: 0.7,
        roughness: 0.4
    });


const bigPickupMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xff9d25,
        emissive: 0x9a3900,
        emissiveIntensity: 0.9,
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

    scene.add(
        group
    );


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

    group.add(
        decal
    );


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
                        ? 0.35
                        : 0.28,

                side:
                    THREE.DoubleSide

            })

        );

    inner.rotation.x =
        -Math.PI / 2;

    inner.position.y =
        0.028;

    group.add(
        inner
    );


    const pickup =
        new THREE.Group();

    pickup.position.y =
        big
            ? 1.2
            : 0.85;

    group.add(
        pickup
    );


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

    pickup.add(
        ring
    );


    const orb =
        new THREE.Mesh(

            big
                ? bigOrbGeometry
                : smallOrbGeometry,

            big
                ? bigPickupMaterial
                : smallPickupMaterial

        );

    pickup.add(
        orb
    );


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
// GOAL EXPLOSION SYSTEM
// ============================================================

// Lightweight meshes instead of hundreds of particles.
// Dell Latitude has already given its life once.

const goalExplosions = [];

const explosionSphereGeometry =
    new THREE.SphereGeometry(
        1,
        12,
        8
    );

const explosionRingGeometry =
    new THREE.RingGeometry(
        1,
        1.35,
        32
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

            opacity: 0.8,

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

            opacity: 0.9,

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

        age: 0,

        lifetime: 1.25

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


const timerElement =
    document.getElementById(
        "timer"
    );


let previousScore = "";
let previousBoost = "";
let previousCamera = "";
let previousGoalMessage = "";
let previousTimer = "";


// ============================================================
// WINNER SCREEN
// ============================================================

const winnerScreen =
    document.createElement(
        "div"
    );


winnerScreen.style.cssText = `

    position:absolute;

    inset:0;

    display:none;

    align-items:center;

    justify-content:center;

    flex-direction:column;

    z-index:40;

    color:white;

    font-family:Arial,sans-serif;

    text-align:center;

    pointer-events:none;

    background:
        linear-gradient(
            to bottom,
            rgba(3,8,17,0.08),
            rgba(3,8,17,0.72)
        );

`;


document.body.appendChild(
    winnerScreen
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
        rgba(
            2,
            6,
            14,
            0.82
        );

    z-index:50;

    color:white;

    font-family:
        Arial,
        sans-serif;

`;


document.body.appendChild(
    menu
);


function readableKey(
    key
) {

    if (
        key === " "
    ) {

        return "SPACE";
    }

    if (
        key ===
        "control"
    ) {

        return "CTRL";
    }

    if (
        key ===
        "shift"
    ) {

        return "SHIFT";
    }

    if (
        key ===
        "tab"
    ) {

        return "TAB";
    }

    if (
        key ===
        "escape"
    ) {

        return "ESC";
    }

    if (
        key.startsWith(
            "arrow"
        )
    ) {

        return key
            .replace(
                "arrow",
                "ARROW "
            )
            .toUpperCase();
    }

    return key
        .toUpperCase();
}


function readableAction(
    action
) {

    const names = {

        throttle:
            "Forward / Air Pitch Down",

        reverse:
            "Reverse / Air Pitch Up",

        left:
            "Steer / Air Yaw Left",

        right:
            "Steer / Air Yaw Right",

        jump:
            "Jump",

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

    return (
        names[
            action
        ] ||
        action
    );
}


function menuRow(
    action
) {

    const waiting =
        rebindingAction ===
        action;

    const locked =
        action ===
        "menu";


    return `

        <button

            class="
                boostball-control-button
            "

            data-action="
                ${action}
            "

            ${locked
                ? "disabled"
                : ""
            }

            style="

                width:100%;

                display:flex;

                justify-content:
                    space-between;

                align-items:center;

                gap:20px;

                padding:
                    11px 13px;

                margin:
                    6px 0;

                border-radius:
                    8px;

                border:
                    1px solid ${
                        waiting
                            ? "rgba(255,210,60,0.9)"
                            : "rgba(255,255,255,0.14)"
                    };

                background:${
                    waiting
                        ? "rgba(255,190,20,0.18)"
                        : "rgba(255,255,255,0.06)"
                };

                color:white;

                cursor:${
                    locked
                        ? "default"
                        : "pointer"
                };

                text-align:left;

                font-size:15px;

                opacity:${
                    locked
                        ? "0.65"
                        : "1"
                };

            "

        >

            <span>
                ${readableAction(
                    action
                )}
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


function updateMenu() {

    menu.style.display =
        menuOpen
            ? "flex"
            : "none";


    if (
        !menuOpen
    ) {

        rebindingAction =
            null;

        return;
    }


    const graphicsButtons =
        Object.entries(
            GRAPHICS_PRESETS
        )
        .map(
            (
                [
                    id,
                    preset
                ]
            ) => `

                <button

                    class="
                        graphics-preset-button
                    "

                    data-preset="
                        ${id}
                    "

                    style="

                        flex:1;

                        padding:
                            10px 6px;

                        border-radius:
                            8px;

                        border:
                            1px solid
                            rgba(
                                255,
                                255,
                                255,
                                0.16
                            );

                        background:${
                            graphicsPreset ===
                            id

                                ? "rgba(22,140,255,0.35)"

                                : "rgba(255,255,255,0.06)"
                        };

                        color:white;

                        cursor:pointer;

                    "

                >

                    ${preset.label}

                    <div style="
                        font-size:10px;
                        opacity:0.6;
                        margin-top:3px;
                    ">
                        ${preset.fps} FPS
                    </div>

                </button>

            `
        )
        .join("");


    menu.innerHTML = `

        <div style="

            width:
                min(
                    540px,
                    calc(
                        100vw - 40px
                    )
                );

            max-height:
                calc(
                    100vh - 40px
                );

            overflow:auto;

            box-sizing:
                border-box;

            padding:28px;

            border-radius:
                14px;

            background:
                rgba(
                    9,
                    18,
                    31,
                    0.97
                );

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.15
                );

            box-shadow:
                0 18px 60px
                rgba(
                    0,
                    0,
                    0,
                    0.45
                );

        ">


            <div style="

                text-align:center;

                font-size:26px;

                font-weight:bold;

                letter-spacing:
                    1px;

            ">

                BOOSTBALL

            </div>


            <div style="

                text-align:center;

                opacity:0.6;

                margin-top:4px;

                margin-bottom:
                    18px;

            ">

                v0.5 · THE MICROWAVE LEARNS TO FLY

            </div>


            <div style="

                font-size:12px;

                opacity:0.65;

                margin-bottom:
                    5px;

            ">

                CONTROLS

            </div>


            ${menuRow(
                "throttle"
            )}

            ${menuRow(
                "reverse"
            )}

            ${menuRow(
                "left"
            )}

            ${menuRow(
                "right"
            )}

            ${menuRow(
                "jump"
            )}

            ${menuRow(
                "boost"
            )}

            ${menuRow(
                "powerslide"
            )}

            ${menuRow(
                "ballCam"
            )}

            ${menuRow(
                "reset"
            )}

            ${menuRow(
                "menu"
            )}


            <div
                id="
                    controlNotice
                "
                style="

                    min-height:
                        20px;

                    margin-top:
                        13px;

                    text-align:
                        center;

                    font-size:
                        13px;

                    color:
                        #ffd85a;

                "
            >

                ${controlNotice}

            </div>


            <button

                id="
                    resetControlsButton
                "

                style="

                    width:100%;

                    margin-top:
                        8px;

                    padding:
                        11px 14px;

                    border-radius:
                        8px;

                    border:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.18
                        );

                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.08
                        );

                    color:white;

                    cursor:pointer;

                    font-weight:
                        bold;

                "

            >

                Reset Controls to Defaults

            </button>


            <div style="

                margin-top:
                    24px;

                padding-top:
                    18px;

                border-top:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    );

            ">


                <div style="

                    font-size:12px;

                    opacity:0.65;

                    margin-bottom:
                        8px;

                ">

                    GRAPHICS

                </div>


                <div style="

                    display:flex;

                    gap:8px;

                ">

                    ${graphicsButtons}

                </div>

            </div>


            <div style="

                margin-top:22px;

                padding-top:17px;

                border-top:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    );

                text-align:center;

                font-size:13px;

                opacity:0.62;

                line-height:1.6;

            ">

                TAB — Return to Match

                <br>

                ESC — Cancel a Rebind

                <br>

                Ctrl+Tab / Ctrl+Shift+Tab / Alt+Tab remain available

            </div>

        </div>

    `;


    const controlButtons =
        menu.querySelectorAll(
            ".boostball-control-button"
        );


    for (
        const button of
        controlButtons
    ) {

        if (
            button.disabled
        ) {

            continue;
        }


        button.addEventListener(
            "click",
            () => {

                rebindingAction =
                    button.dataset.action;


                controlNotice =
                    `Waiting for ${readableAction(rebindingAction)}... ESC cancels.`;


                clearHeldInputs();

                updateMenu();
            }
        );
    }


    const resetButton =
        document.getElementById(
            "resetControlsButton"
        );


    if (
        resetButton
    ) {

        resetButton.addEventListener(
            "click",
            () => {

                resetControls();

                rebindingAction =
                    null;

                controlNotice =
                    "Controls reset to defaults.";

                clearHeldInputs();

                updateMenu();
            }
        );
    }


    const presetButtons =
        menu.querySelectorAll(
            ".graphics-preset-button"
        );


    for (
        const button of
        presetButtons
    ) {

        button.addEventListener(
            "click",
            () => {

                graphicsPreset =
                    button.dataset.preset;


                localStorage.setItem(
                    GRAPHICS_STORAGE_KEY,
                    graphicsPreset
                );


                applyGraphicsPreset();

                controlNotice =
                    `${GRAPHICS_PRESETS[graphicsPreset].label} graphics enabled.`;


                updateMenu();
            }
        );
    }
}


// ============================================================
// JUMP
// ============================================================

function jump() {

    if (
        !grounded
    ) {

        return;
    }


    grounded = false;

    verticalVelocity = 11;


    // Start the aerial perfectly level.

    airPitch = 0;

    airRoll = 0;
}


// ============================================================
// RESET / KICKOFF
// ============================================================

function resetKickoff() {

    car.position.set(
        -35,
        0,
        0
    );


    carRotation = 0;

    airPitch = 0;

    airRoll = 0;


    car.rotation.set(
        0,
        0,
        0
    );


    car.quaternion.identity();


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
// REUSABLE PHYSICS VECTORS
// ============================================================

const tempForward =
    new THREE.Vector3();

const tempRight =
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

const tempExplosionScale =
    new THREE.Vector3();


// ============================================================
// CAR ORIENTATION
// ============================================================

function updateCarOrientation() {

    if (
        grounded
    ) {

        car.rotation.set(
            0,
            carRotation,
            0
        );

        carQuaternion.copy(
            car.quaternion
        );

        return;
    }


    yawQuaternion.setFromAxisAngle(
        Y_AXIS,
        carRotation
    );


    pitchQuaternion.setFromAxisAngle(
        Z_AXIS,
        airPitch
    );


    // Roll is around the car's local forward axis.

    rollQuaternion.setFromAxisAngle(
        LOCAL_FORWARD,
        airRoll
    );


    carQuaternion
        .copy(
            yawQuaternion
        )
        .multiply(
            pitchQuaternion
        )
        .multiply(
            rollQuaternion
        );


    car.quaternion.copy(
        carQuaternion
    );
}


// ============================================================
// AIR CONTROLS
// ============================================================

function updateAirControls(
    dt
) {

    if (
        grounded ||
        goalPause ||
        matchEnded
    ) {

        return;
    }


    // W / S no longer accelerate the car in mid-air.
    // They rotate the nose instead.

    if (
        keys[
            controls.throttle
        ]
    ) {

        airPitch +=
            AIR_PITCH_SPEED *
            dt;
    }


    if (
        keys[
            controls.reverse
        ]
    ) {

        airPitch -=
            AIR_PITCH_SPEED *
            dt;
    }


    // A / D yaw the car in the air.

    if (
        keys[
            controls.left
        ]
    ) {

        carRotation +=
            AIR_YAW_SPEED *
            dt;
    }


    if (
        keys[
            controls.right
        ]
    ) {

        carRotation -=
            AIR_YAW_SPEED *
            dt;
    }


    // Holding powerslide while steering converts A/D
    // into air roll instead of yaw.

    if (
        keys[
            controls.powerslide
        ]
    ) {

        if (
            keys[
                controls.left
            ]
        ) {

            airRoll +=
                AIR_ROLL_SPEED *
                dt;

            carRotation -=
                AIR_YAW_SPEED *
                dt;
        }


        if (
            keys[
                controls.right
            ]
        ) {

            airRoll -=
                AIR_ROLL_SPEED *
                dt;

            carRotation +=
                AIR_YAW_SPEED *
                dt;
        }
    }


    // Keep angles numerically sensible after lots of spinning.

    if (
        airPitch >
        Math.PI
    ) {

        airPitch -=
            Math.PI *
            2;
    }


    if (
        airPitch <
        -Math.PI
    ) {

        airPitch +=
            Math.PI *
            2;
    }


    if (
        airRoll >
        Math.PI
    ) {

        airRoll -=
            Math.PI *
            2;
    }


    if (
        airRoll <
        -Math.PI
    ) {

        airRoll +=
            Math.PI *
            2;
    }
}


// ============================================================
// CAR PHYSICS
// ============================================================

function updateCar(
    dt
) {

    if (
        goalPause ||
        matchEnded
    ) {

        return;
    }


    if (
        !timerStarted
    ) {

        timerStarted = true;
    }


    // --------------------------------------------------------
    // AIRBORNE
    // --------------------------------------------------------

    if (
        !grounded
    ) {

        updateAirControls(
            dt
        );


        updateCarOrientation();


        // Existing momentum stays independent of orientation.
        // Rotating the car does NOT rotate carVelocity.


        // Boost DOES use the car's actual 3D nose direction.

        if (
            keys[
                controls.boost
            ] &&
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


            if (
                boostAmount < 0
            ) {

                boostAmount = 0;
            }


            // Aerial boost can exceed ordinary driving speed,
            // but prevent completely ridiculous runaway speeds.

            const horizontalSpeedSq =
                carVelocity.x *
                carVelocity.x +
                carVelocity.z *
                carVelocity.z;


            const absoluteBoostLimit =
                BOOST_TOP_SPEED *
                1.18;


            if (
                horizontalSpeedSq >
                absoluteBoostLimit *
                absoluteBoostLimit
            ) {

                const horizontalSpeed =
                    Math.sqrt(
                        horizontalSpeedSq
                    );


                const scale =
                    absoluteBoostLimit /
                    horizontalSpeed;


                carVelocity.x *=
                    scale;

                carVelocity.z *=
                    scale;
            }
        }


        verticalVelocity -=
            GRAVITY *
            dt;


        car.position.x +=
            carVelocity.x *
            dt;


        car.position.y +=
            verticalVelocity *
            dt;


        car.position.z +=
            carVelocity.z *
            dt;


        handleCarArenaCollision();


        // Landing

        if (
            car.position.y <= 0
        ) {

            car.position.y = 0;

            verticalVelocity = 0;

            grounded = true;


            airPitch = 0;

            airRoll = 0;


            car.rotation.set(
                0,
                carRotation,
                0
            );


            car.quaternion.setFromAxisAngle(
                Y_AXIS,
                carRotation
            );
        }


        spinWheels(
            dt
        );

        return;
    }


    // --------------------------------------------------------
    // GROUNDED
    // --------------------------------------------------------

    airPitch =
        THREE.MathUtils.damp(
            airPitch,
            0,
            LANDING_LEVEL_SPEED,
            dt
        );


    airRoll =
        THREE.MathUtils.damp(
            airRoll,
            0,
            LANDING_LEVEL_SPEED,
            dt
        );


    const forwardX =
        Math.cos(
            carRotation
        );


    const forwardZ =
        -Math.sin(
            carRotation
        );


    const rightX =
        -forwardZ;


    const rightZ =
        forwardX;


    const forwardSpeed =
        carVelocity.x *
        forwardX +
        carVelocity.z *
        forwardZ;


    const sidewaysSpeed =
        carVelocity.x *
        rightX +
        carVelocity.z *
        rightZ;


    const throttleHeld =
        keys[
            controls.throttle
        ];


    const reverseHeld =
        keys[
            controls.reverse
        ];


    const powerslideHeld =
        keys[
            controls.powerslide
        ];


    let engineActive = false;


    // --------------------------------------------------------
    // FORWARD / BRAKING
    // --------------------------------------------------------

    if (
        throttleHeld
    ) {

        engineActive = true;


        if (
            forwardSpeed <
            -1
        ) {

            carVelocity.x +=
                forwardX *
                BRAKING *
                dt;


            carVelocity.z +=
                forwardZ *
                BRAKING *
                dt;

        } else if (
            forwardSpeed <
            DRIVE_TOP_SPEED
        ) {

            carVelocity.x +=
                forwardX *
                ACCELERATION *
                dt;


            carVelocity.z +=
                forwardZ *
                ACCELERATION *
                dt;
        }
    }


    // --------------------------------------------------------
    // REVERSE / BRAKING
    // --------------------------------------------------------

    if (
        reverseHeld
    ) {

        engineActive = true;


        if (
            forwardSpeed >
            1
        ) {

            carVelocity.x -=
                forwardX *
                BRAKING *
                dt;


            carVelocity.z -=
                forwardZ *
                BRAKING *
                dt;

        } else if (
            forwardSpeed >
            -REVERSE_TOP_SPEED
        ) {

            carVelocity.x -=
                forwardX *
                REVERSE_ACCELERATION *
                dt;


            carVelocity.z -=
                forwardZ *
                REVERSE_ACCELERATION *
                dt;
        }
    }


    // --------------------------------------------------------
    // BOOST
    // --------------------------------------------------------

    if (
        keys[
            controls.boost
        ] &&
        boostAmount > 0
    ) {

        engineActive = true;


        const currentForwardSpeed =
            carVelocity.x *
            forwardX +
            carVelocity.z *
            forwardZ;


        if (
            currentForwardSpeed <
            BOOST_TOP_SPEED
        ) {

            carVelocity.x +=
                forwardX *
                BOOST_ACCELERATION *
                dt;


            carVelocity.z +=
                forwardZ *
                BOOST_ACCELERATION *
                dt;
        }


        boostAmount -=
            BOOST_USAGE *
            dt;


        if (
            boostAmount < 0
        ) {

            boostAmount = 0;
        }
    }


    // --------------------------------------------------------
    // STEERING
    // --------------------------------------------------------

    const speed =
        Math.sqrt(

            carVelocity.x *
            carVelocity.x +

            carVelocity.z *
            carVelocity.z

        );


    const steeringFactor =
        THREE.MathUtils.clamp(

            speed /
            DRIVE_TOP_SPEED,

            0,
            1

        );


    let steerSpeed =
        THREE.MathUtils.lerp(

            LOW_SPEED_STEER,

            HIGH_SPEED_STEER,

            steeringFactor

        );


    if (
        powerslideHeld
    ) {

        steerSpeed *=
            POWERSLIDE_STEER_MULTIPLIER;
    }


    const directionSign =
        forwardSpeed >= 0
            ? 1
            : -1;


    if (
        speed > 0.4
    ) {

        if (
            keys[
                controls.left
            ]
        ) {

            carRotation +=
                steerSpeed *
                dt *
                directionSign;
        }


        if (
            keys[
                controls.right
            ]
        ) {

            carRotation -=
                steerSpeed *
                dt *
                directionSign;
        }
    }


    // --------------------------------------------------------
    // TYRE GRIP
    // --------------------------------------------------------

    const grip =
        powerslideHeld
            ? POWERSLIDE_GRIP
            : NORMAL_GRIP;


    const sidewaysAfterSteer =
        carVelocity.x *
        rightX +
        carVelocity.z *
        rightZ;


    const sidewaysRemoval =
        sidewaysAfterSteer *
        (
            1 -
            Math.exp(
                -grip *
                dt
            )
        );


    carVelocity.x -=
        rightX *
        sidewaysRemoval;


    carVelocity.z -=
        rightZ *
        sidewaysRemoval;


    // --------------------------------------------------------
    // DRAG
    // --------------------------------------------------------

    const drag =
        engineActive
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
    // POSITION
    // --------------------------------------------------------

    car.position.x +=
        carVelocity.x *
        dt;


    car.position.z +=
        carVelocity.z *
        dt;


    car.position.y = 0;


    car.rotation.set(
        0,
        carRotation,
        0
    );


    handleCarArenaCollision();


    spinWheels(
        dt
    );
}


// ============================================================
// WHEELS
// ============================================================

function spinWheels(
    dt
) {

    const speed =
        Math.sqrt(

            carVelocity.x *
            carVelocity.x +

            carVelocity.z *
            carVelocity.z

        );


    if (
        speed <
        0.01
    ) {

        return;
    }


    const forwardX =
        Math.cos(
            carRotation
        );


    const forwardZ =
        -Math.sin(
            carRotation
        );


    const direction =
        carVelocity.x *
        forwardX +
        carVelocity.z *
        forwardZ;


    const spin =
        speed *
        dt *
        1.7 *
        (
            direction >= 0
                ? 1
                : -1
        );


    for (
        const wheel of wheels
    ) {

        wheel.rotation.z -=
            spin;
    }
}


// ============================================================
// CAR / ARENA COLLISION
// ============================================================

function handleCarArenaCollision() {

    const carRadius = 2.1;


    if (
        car.position.z >
        HALF_WIDTH -
        carRadius
    ) {

        car.position.z =
            HALF_WIDTH -
            carRadius;


        if (
            carVelocity.z > 0
        ) {

            carVelocity.z *=
                -0.35;
        }
    }


    if (
        car.position.z <
        -HALF_WIDTH +
        carRadius
    ) {

        car.position.z =
            -HALF_WIDTH +
            carRadius;


        if (
            carVelocity.z < 0
        ) {

            carVelocity.z *=
                -0.35;
        }
    }


    const insideGoalWidth =
        Math.abs(
            car.position.z
        ) <
        GOAL_WIDTH / 2 -
        carRadius;


    const belowGoal =
        car.position.y <
        GOAL_HEIGHT -
        1;


    // Outside the goal opening, the end wall blocks the car.

    if (
        !insideGoalWidth ||
        !belowGoal
    ) {

        if (
            car.position.x >
            HALF_LENGTH -
            carRadius
        ) {

            car.position.x =
                HALF_LENGTH -
                carRadius;


            if (
                carVelocity.x > 0
            ) {

                carVelocity.x *=
                    -0.35;
            }
        }


        if (
            car.position.x <
            -HALF_LENGTH +
            carRadius
        ) {

            car.position.x =
                -HALF_LENGTH +
                carRadius;


            if (
                carVelocity.x < 0
            ) {

                carVelocity.x *=
                    -0.35;
            }
        }

        return;
    }


    // Inside the goal opening.

    const maxGoalX =
        HALF_LENGTH +
        GOAL_DEPTH -
        carRadius;


    if (
        car.position.x >
        maxGoalX
    ) {

        car.position.x =
            maxGoalX;


        if (
            carVelocity.x > 0
        ) {

            carVelocity.x *=
                -0.3;
        }
    }


    if (
        car.position.x <
        -maxGoalX
    ) {

        car.position.x =
            -maxGoalX;


        if (
            carVelocity.x < 0
        ) {

            carVelocity.x *=
                -0.3;
        }
    }
}


// ============================================================
// BALL PHYSICS
// ============================================================

function updateBall(
    dt
) {

    if (
        goalPause ||
        matchEnded
    ) {

        return;
    }


    ballVelocity.y -=
        21 *
        dt;


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

    if (
        ball.position.y <
        BALL_RADIUS
    ) {

        ball.position.y =
            BALL_RADIUS;


        if (
            ballVelocity.y < 0
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

    const maxBallZ =
        HALF_WIDTH -
        BALL_RADIUS;


    if (
        ball.position.z >
        maxBallZ
    ) {

        ball.position.z =
            maxBallZ;


        if (
            ballVelocity.z > 0
        ) {

            ballVelocity.z *=
                -0.68;
        }
    }


    if (
        ball.position.z <
        -maxBallZ
    ) {

        ball.position.z =
            -maxBallZ;


        if (
            ballVelocity.z < 0
        ) {

            ballVelocity.z *=
                -0.68;
        }
    }


    // --------------------------------------------------------
    // END WALLS / GOALS
    // --------------------------------------------------------

    const insideGoalWidth =
        Math.abs(
            ball.position.z
        ) <
        GOAL_WIDTH / 2 -
        BALL_RADIUS;


    const belowCrossbar =
        ball.position.y <
        GOAL_HEIGHT -
        BALL_RADIUS;


    if (
        !insideGoalWidth ||
        !belowCrossbar
    ) {

        const maxBallX =
            HALF_LENGTH -
            BALL_RADIUS;


        if (
            ball.position.x >
            maxBallX
        ) {

            ball.position.x =
                maxBallX;


            if (
                ballVelocity.x > 0
            ) {

                ballVelocity.x *=
                    -0.68;
            }
        }


        if (
            ball.position.x <
            -maxBallX
        ) {

            ball.position.x =
                -maxBallX;


            if (
                ballVelocity.x < 0
            ) {

                ballVelocity.x *=
                    -0.68;
            }
        }

        return;
    }


    // Ball is inside the goal mouth.

    const backWall =
        HALF_LENGTH +
        GOAL_DEPTH -
        BALL_RADIUS;


    if (
        ball.position.x >
        backWall
    ) {

        ball.position.x =
            backWall;


        if (
            ballVelocity.x > 0
        ) {

            ballVelocity.x *=
                -0.5;
        }
    }


    if (
        ball.position.x <
        -backWall
    ) {

        ball.position.x =
            -backWall;


        if (
            ballVelocity.x < 0
        ) {

            ballVelocity.x *=
                -0.5;
        }
    }


    // Goal side walls.

    const goalSide =
        GOAL_WIDTH / 2 -
        BALL_RADIUS;


    if (
        Math.abs(
            ball.position.x
        ) >
        HALF_LENGTH
    ) {

        if (
            ball.position.z >
            goalSide
        ) {

            ball.position.z =
                goalSide;


            if (
                ballVelocity.z > 0
            ) {

                ballVelocity.z *=
                    -0.55;
            }
        }


        if (
            ball.position.z <
            -goalSide
        ) {

            ball.position.z =
                -goalSide;


            if (
                ballVelocity.z < 0
            ) {

                ballVelocity.z *=
                    -0.55;
            }
        }


        // Goal roof.

        if (
            ball.position.y >
            GOAL_HEIGHT -
            BALL_RADIUS
        ) {

            ball.position.y =
                GOAL_HEIGHT -
                BALL_RADIUS;


            if (
                ballVelocity.y > 0
            ) {

                ballVelocity.y *=
                    -0.5;
            }
        }
    }
}


// ============================================================
// CAR / BALL COLLISION
// ============================================================

function handleCarBallCollision() {

    if (
        goalPause ||
        matchEnded
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


    // Approximate the car as a sphere for now.

    tempBallDifference.y -=
        0.9;


    const collisionDistance =
        BALL_RADIUS +
        2.35;


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


    // Car velocity contributes strongly to the hit,
    // but the ball does not become a railgun.

    const carHorizontalSpeed =
        Math.sqrt(

            carVelocity.x *
            carVelocity.x +

            carVelocity.z *
            carVelocity.z

        );


    let impactStrength =
        7 +
        carHorizontalSpeed *
        0.8;


    if (
        !grounded
    ) {

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


    // Tiny reaction on the car.

    carVelocity.x -=
        tempBallDifference.x *
        1.4;


    carVelocity.z -=
        tempBallDifference.z *
        1.4;
}


// ============================================================
// BOOST PADS
// ============================================================

function updateBoostPads(
    dt
) {

    if (
        matchEnded
    ) {

        return;
    }


    for (
        const pad of
        boostPads
    ) {

        if (
            pad.active
        ) {

            pad.pickup.rotation.y +=
                dt *
                (
                    pad.big
                        ? 1.8
                        : 2.4
                );


            pad.orb.rotation.x +=
                dt *
                1.7;


            pad.orb.rotation.z +=
                dt *
                1.25;


            const dx =
                car.position.x -
                pad.x;


            const dz =
                car.position.z -
                pad.z;


            const distanceSq =
                dx *
                dx +
                dz *
                dz;


            if (
                distanceSq <
                pad.pickupRadiusSq
            ) {

                if (
                    pad.big
                ) {

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

            pad.timer -=
                dt;


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
            goalExplosions[
                i
            ];


        explosion.age +=
            dt;


        const progress =
            THREE.MathUtils.clamp(

                explosion.age /
                explosion.lifetime,

                0,

                1

            );


        const sphereScale =
            1 +
            progress *
            11;


        explosion.sphere.scale.setScalar(
            sphereScale
        );


        const ringScale =
            1 +
            progress *
            14;


        explosion.ring.scale.setScalar(
            ringScale
        );


        explosion.sphereMaterial.opacity =
            0.8 *
            (
                1 -
                progress
            );


        explosion.ringMaterial.opacity =
            0.9 *
            (
                1 -
                progress
            );


        explosion.group.rotation.x +=
            dt *
            0.7;


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
// SCORING
// ============================================================

function checkGoals() {

    if (
        goalPause ||
        matchEnded
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


    // Ball crossed Orange's goal line.
    // Blue scores.

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


    // Ball crossed Blue's goal line.
    // Orange scores.

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


function scoreGoal(
    team,
    goalSide
) {

    if (
        matchEnded
    ) {

        return;
    }


    if (
        team ===
        "blue"
    ) {

        blueScore++;

    } else {

        orangeScore++;
    }


    createGoalExplosion(
        goalSide,
        team
    );


    goalPause = true;

    goalPauseTimer = 2.25;


    goalText =
        team ===
        "blue"

            ? "BLUE SCORES!"

            : "ORANGE SCORES!";


    // Golden goal.

    if (
        overtime
    ) {

        endMatch(
            team
        );
    }
}


// ============================================================
// MATCH TIMER
// ============================================================

function updateMatch(
    dt
) {

    if (
        menuOpen ||
        goalPause ||
        matchEnded ||
        !timerStarted
    ) {

        return;
    }


    if (
        overtime
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


    gameTime = 0;


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


    overtime = true;

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
        !goalPause ||
        matchEnded
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


    goalPause = false;

    goalPauseTimer = 0;

    goalText =
        overtime
            ? "OVERTIME"
            : "";


    resetKickoff();


    // resetKickoff clears goalText,
    // so restore the overtime label.

    if (
        overtime
    ) {

        goalText =
            "OVERTIME";
    }
}


// ============================================================
// MATCH END
// ============================================================

function endMatch(
    team
) {

    matchEnded = true;

    winningTeam = team;

    matchResult =
        team ===
        "blue"

            ? "BLUE WINS"

            : "ORANGE WINS";


    goalPause = false;

    goalPauseTimer = 0;


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


    winnerShowcase = true;

    winnerShowcaseTimer = 0;


    goalText = "";


    updateWinnerScreen();
}


// ============================================================
// WINNER SHOWCASE
// ============================================================

function updateWinnerScreen() {

    if (
        !matchEnded
    ) {

        winnerScreen.style.display =
            "none";

        return;
    }


    winnerScreen.style.display =
        "flex";


    const overtimeText =
        overtime

            ? `
                <div style="
                    font-size:16px;
                    letter-spacing:3px;
                    opacity:0.72;
                    margin-bottom:8px;
                ">
                    OVERTIME
                </div>
            `

            : "";


    const colour =
        winningTeam ===
        "blue"

            ? "#4aa6ff"

            : "#ff963f";


    winnerScreen.innerHTML = `

        <div style="
            margin-top:auto;
            margin-bottom:8vh;
            text-shadow:
                0 4px 20px
                rgba(0,0,0,0.75);
        ">

            ${overtimeText}

            <div style="
                font-size:
                    clamp(
                        38px,
                        7vw,
                        76px
                    );
                font-weight:900;
                letter-spacing:4px;
                color:${colour};
            ">
                ${matchResult}
            </div>

            <div style="
                margin-top:10px;
                font-size:28px;
                font-weight:bold;
            ">
                ${blueScore}
                &nbsp;–&nbsp;
                ${orangeScore}
            </div>

            <div style="
                margin-top:18px;
                font-size:14px;
                letter-spacing:2px;
                opacity:0.75;
            ">
                ${readableKey(
                    controls.reset
                )} — REMATCH
            </div>

        </div>

    `;
}


function updateWinnerShowcase(
    dt
) {

    if (
        !winnerShowcase
    ) {

        return;
    }


    winnerShowcaseTimer +=
        dt;


    // Put the car near midfield for the victory camera.

    const targetX =
        winningTeam ===
        "blue"
            ? -5
            : 5;


    car.position.x =
        THREE.MathUtils.damp(
            car.position.x,
            targetX,
            2.4,
            dt
        );


    car.position.z =
        THREE.MathUtils.damp(
            car.position.z,
            0,
            2.4,
            dt
        );


    car.position.y =
        THREE.MathUtils.damp(
            car.position.y,
            0,
            5,
            dt
        );


    carRotation +=
        dt *
        0.22;


    car.rotation.set(
        0,
        carRotation,
        0
    );


    const orbitAngle =
        winnerShowcaseTimer *
        0.28;


    tempCameraPosition.set(

        car.position.x +
        Math.cos(
            orbitAngle
        ) *
        11,

        5.8,

        car.position.z +
        Math.sin(
            orbitAngle
        ) *
        11

    );


    camera.position.lerp(
        tempCameraPosition,
        1 -
        Math.exp(
            -3 *
            dt
        )
    );


    tempCameraLook.set(

        car.position.x,

        1.1,

        car.position.z

    );


    camera.lookAt(
        tempCameraLook
    );
}


// ============================================================
// NEW MATCH / REMATCH
// ============================================================

function startNewMatch() {

    blueScore = 0;

    orangeScore = 0;


    gameTime = 300;


    timerStarted = false;


    overtime = false;

    matchEnded = false;

    matchResult = "";

    winningTeam = null;


    winnerShowcase = false;

    winnerShowcaseTimer = 0;


    winnerScreen.style.display =
        "none";


    goalText = "";


    resetKickoff();


    // The timer now waits for the next active game update.
    // Loading time is no longer stolen from the match clock.

    previousTimer = "";

    previousScore = "";

    updateHUD();
}


// ============================================================
// CAMERA
// ============================================================

function updateCamera(
    dt
) {

    if (
        winnerShowcase
    ) {

        updateWinnerShowcase(
            dt
        );

        return;
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


        const ballDistance =
            tempCarToBall.length();


        const cameraDistance =
            THREE.MathUtils.clamp(

                11.5 +
                ballDistance *
                0.035,

                11.5,

                14

            );


        tempForward.set(

            Math.cos(
                carRotation
            ),

            0,

            -Math.sin(
                carRotation
            )

        );


        tempCameraPosition
            .copy(
                car.position
            )
            .addScaledVector(
                tempForward,
                -cameraDistance
            );


        tempCameraPosition.y +=
            6.4;


        camera.position.lerp(

            tempCameraPosition,

            1 -
            Math.exp(
                -7 *
                dt
            )

        );


        tempCameraLook
            .copy(
                ball.position
            )
            .multiplyScalar(
                0.87
            )
            .addScaledVector(
                car.position,
                0.13
            );


        tempCameraLook.y +=
            0.6;


        camera.lookAt(
            tempCameraLook
        );

        return;
    }


    // --------------------------------------------------------
    // CAR CAM
    // --------------------------------------------------------

    // When airborne, the camera still follows the car's general
    // yaw rather than violently rolling with it.

    tempForward.set(

        Math.cos(
            carRotation
        ),

        0,

        -Math.sin(
            carRotation
        )

    );


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
        1.3;


    camera.lookAt(
        tempCameraLook
    );
}


// ============================================================
// HUD
// ============================================================

function formatTime(
    seconds
) {

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


    let timerText;


    if (
        matchEnded
    ) {

        timerText =
            "FINAL";

    } else if (
        overtime
    ) {

        timerText =
            "OVERTIME";

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


    if (
        goalText !==
        previousGoalMessage
    ) {

        goalMessageElement.textContent =
            goalText;

        previousGoalMessage =
            goalText;
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
// PERFORMANCE-AWARE GAME LOOP
// ============================================================

// The first frame establishes the clock.
// It does NOT subtract page loading time from the match.
//
// This fixes the legendary 4:40 kickoff.

let previousFrameTime = null;

let accumulator = 0;


function animate(
    timestamp
) {

    requestAnimationFrame(
        animate
    );


    if (
        previousFrameTime ===
        null
    ) {

        previousFrameTime =
            timestamp;


        renderer.render(
            scene,
            camera
        );


        return;
    }


    let realDelta =
        (
            timestamp -
            previousFrameTime
        ) /
        1000;


    previousFrameTime =
        timestamp;


    realDelta =
        Math.min(
            realDelta,
            0.05
        );


    const preset =
        GRAPHICS_PRESETS[
            graphicsPreset
        ];


    const targetStep =
        1 /
        preset.fps;


    accumulator +=
        realDelta;


    if (
        accumulator <
        targetStep
    ) {

        return;
    }


    // Keep the remainder so a 60 FPS preset doesn't accidentally
    // become the cursed ~30 FPS limiter from the old build.

    const dt =
        Math.min(
            accumulator,
            0.033
        );


    accumulator %=
        targetStep;


    if (
        !menuOpen
    ) {

        updateCar(
            dt
        );


        updateBall(
            dt
        );


        handleCarBallCollision();


        updateBoostPads(
            dt
        );


        checkGoals();


        updateMatch(
            dt
        );


        updateGoalPause(
            dt
        );
    }


    // Explosions and winner presentation continue visually
    // even while normal match physics is frozen.

    updateGoalExplosions(
        dt
    );


    updateCamera(
        dt
    );


    updateHUD();


    renderer.render(
        scene,
        camera
    );
}


// ============================================================
// START
// ============================================================

applyGraphicsPreset();


resetKickoff();


cameraTarget.copy(
    car.position
);


updateCarOrientation();


updateHUD();


requestAnimationFrame(
    animate
);


// ============================================================
// v0.5 PATCH NOTES
//
// - The microwave can fly.
// - W/S control aerial pitch instead of magically changing
//   horizontal momentum.
// - A/D control aerial yaw.
// - CTRL + A/D performs air roll.
// - Air boost follows the actual 3D nose of the car.
// - Rotating in mid-air does not rotate existing momentum.
// - Match clock now starts at a genuine 5:00.
// - Added lightweight goal explosions.
// - Added winner car showcase.
// - Rematch prompt uses the player's real keybind.
// - Added Performance / Balanced / Quality graphics presets.
// - Performance mode targets 30 FPS and disables shadows.
// - Existing v0.4.2 control bindings carry over.
// - Overtime remains golden goal.
//
// Known scientific discovery:
// giving a blue microwave pitch, yaw and boost was probably
// not covered by its warranty.
// ============================================================
    goalText = "";
}
