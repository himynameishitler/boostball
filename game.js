// ============================================================
// BOOSTBALL v0.4.2 — CONTROL FREAK
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

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        1
    )
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

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

sun.shadow.camera.left =
    -95;

sun.shadow.camera.right =
    95;

sun.shadow.camera.top =
    70;

sun.shadow.camera.bottom =
    -70;

sun.shadow.camera.near =
    1;

sun.shadow.camera.far =
    180;

scene.add(
    sun
);

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

// Halfway line

createFieldLine(
    0.22,
    FIELD_WIDTH,
    0,
    0
);

// Goal area reference lines

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
    i <= 100;
    i++
) {

    const angle =
        (i / 100) *
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
            opacity: 0.75
        })
    );

scene.add(
    circle
);

// ============================================================
// WALL MATERIALS
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

const wallFrameMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x90c8e8,
        roughness: 0.45,
        metalness: 0.25
    });

// ============================================================
// SIDE WALLS
// ============================================================

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

// ============================================================
// END WALL PIECES
// ============================================================

function createEndWallPieces(x) {

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

    const x =
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

    // Back wall

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

    // Roof

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
        x,
        GOAL_HEIGHT,
        0
    );

    scene.add(
        roof
    );

    // Side walls

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
            x,
            GOAL_HEIGHT / 2,
            zDirection *
            GOAL_WIDTH / 2
        );

        scene.add(
            sideWall
        );
    }

    // Goal posts

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

    // Crossbar

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
// CONTROL BINDINGS — v0.4.2 CONTROL FREAK
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
            saved &&
            typeof saved === "object"
        ) {

            for (
                const action of
                Object.keys(
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

function normalizeKey(event) {

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

        keys[key] = false;
    }

    for (
        const key in pressed
    ) {

        pressed[key] = false;
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
        key !== "control"
    ) {

        return true;
    }

    return false;
}

window.addEventListener(
    "keydown",
    event => {

        const key =
            normalizeKey(
                event
            );

        // ====================================================
        // REBINDING MODE
        // ====================================================

        if (
            rebindingAction
        ) {

            // ESC cancels rebinding.

            if (
                key === "escape"
            ) {

                event.preventDefault();

                rebindingAction =
                    null;

                controlNotice =
                    "Binding cancelled.";

                updateMenu();

                return;
            }

            // Never steal browser / OS shortcuts such as
            // CTRL+TAB, CTRL+SHIFT+TAB or ALT+TAB.

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

            // Menu stays TAB so there is always a predictable
            // way to get in and out of the controls screen.

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

            // Don't allow TAB as another gameplay binding.

            if (
                key === "tab"
            ) {

                event.preventDefault();

                controlNotice =
                    "TAB is reserved for the Boostball menu.";

                updateMenu();

                return;
            }

            // Reject duplicate controls instead of silently
            // moving the old action somewhere else.

            const duplicateAction =
                Object.keys(
                    controls
                ).find(
                    action =>
                        action !==
                            rebindingAction &&
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

        // ====================================================
        // LEAVE BROWSER / OS SHORTCUTS ALONE
        // ====================================================

        if (
            browserShortcutActive(
                event
            )
        ) {

            return;
        }

        // ====================================================
        // TAB MENU
        // ====================================================

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

            pressed[key] =
                true;

            return;
        }

        // ====================================================
        // MENU IS OPEN
        // ====================================================

        if (
            menuOpen
        ) {

            // Keep the page from reacting to ordinary
            // gameplay keys while the menu is open.

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

        // ====================================================
        // GAMEPLAY INPUT
        // ====================================================

        keys[key] =
            true;

        if (
            !pressed[key]
        ) {

            pressed[key] =
                true;

            if (
                key ===
                    controls.jump &&
                !goalPause
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

                resetKickoff();
            }
        }

        // Prevent normal page actions only for keys that the
        // game itself needs. Modifier shortcuts were already
        // allowed above.

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

        keys[key] =
            false;

        pressed[key] =
            false;
    }
);

// If you Alt+Tab / Ctrl+Tab away while holding W,
// don't come back to a permanently accelerating car.

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
                side: THREE.DoubleSide
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
            ? 3.0
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

// ============================================================
// BOOST PAD LAYOUT
// ============================================================

// Small pads

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

// Cache HUD DOM once.

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
    background:rgba(2,6,14,0.82);
    z-index:50;
    color:white;
    font-family:Arial,sans-serif;
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

    if (
        key === "escape"
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
            "Forward",
        reverse:
            "Reverse / Brake",
        left:
            "Steer Left",
        right:
            "Steer Right",
        jump:
            "Jump",
        boost:
            "Boost",
        powerslide:
            "Powerslide",
        ballCam:
            "Ball Cam",
        reset:
            "Reset",
        menu:
            "Menu"
    };

    return (
        names[action] ||
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
        action === "menu";

    return `
        <button
            class="boostball-control-button"
            data-action="${action}"
            ${locked ? "disabled" : ""}
            style="
                width:100%;
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:20px;
                padding:11px 13px;
                margin:6px 0;
                border-radius:8px;
                border:1px solid ${
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

    menu.innerHTML = `
        <div style="
            width:min(520px,calc(100vw - 40px));
            max-height:calc(100vh - 40px);
            overflow:auto;
            box-sizing:border-box;
            padding:28px;
            border-radius:14px;
            background:rgba(9,18,31,0.97);
            border:1px solid rgba(255,255,255,0.15);
            box-shadow:0 18px 60px rgba(0,0,0,0.45);
        ">

            <div style="
                text-align:center;
                font-size:26px;
                font-weight:bold;
                letter-spacing:1px;
            ">
                BOOSTBALL
            </div>

            <div style="
                text-align:center;
                opacity:0.6;
                margin-top:4px;
                margin-bottom:18px;
            ">
                v0.4.2 · CONTROL FREAK
            </div>

            <div style="
                text-align:center;
                font-size:13px;
                opacity:0.75;
                line-height:1.5;
                margin-bottom:18px;
            ">
                Click a control, then press its new key.
                CTRL/ALT browser shortcuts stay available.
            </div>

            ${menuRow("throttle")}
            ${menuRow("reverse")}
            ${menuRow("left")}
            ${menuRow("right")}
            ${menuRow("jump")}
            ${menuRow("boost")}
            ${menuRow("powerslide")}
            ${menuRow("ballCam")}
            ${menuRow("reset")}
            ${menuRow("menu")}

            <div
                id="controlNotice"
                style="
                    min-height:20px;
                    margin-top:13px;
                    text-align:center;
                    font-size:13px;
                    color:#ffd85a;
                "
            >
                ${controlNotice}
            </div>

            <button
                id="resetControlsButton"
                style="
                    width:100%;
                    margin-top:8px;
                    padding:11px 14px;
                    border-radius:8px;
                    border:1px solid rgba(255,255,255,0.18);
                    background:rgba(255,255,255,0.08);
                    color:white;
                    cursor:pointer;
                    font-weight:bold;
                "
            >
                Reset Controls to Defaults
            </button>

            <div style="
                margin-top:22px;
                padding-top:17px;
                border-top:1px solid rgba(255,255,255,0.12);
                text-align:center;
                font-size:13px;
                opacity:0.62;
                line-height:1.6;
            ">
                TAB — Return to Match<br>
                ESC — Cancel a Rebind<br>
                Ctrl+Tab / Ctrl+Shift+Tab / Alt+Tab remain available
            </div>
        </div>
    `;

    const buttons =
        menu.querySelectorAll(
            ".boostball-control-button"
        );

    for (
        const button of buttons
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
// BOOSTBALL v0.4.2 — CONTROL FREAK
// PART 2 / 2
// Paste directly underneath Part 1
// ============================================================

// ============================================================
// REUSABLE PHYSICS VECTORS
// ============================================================

const tempA = new THREE.Vector3();
const tempB = new THREE.Vector3();
const tempC = new THREE.Vector3();
const tempD = new THREE.Vector3();

const tempForward = new THREE.Vector3();
const tempRight = new THREE.Vector3();

// ============================================================
// MATCH STATE
// ============================================================

let overtime = false;

let matchEnded = false;

let matchResult = "";

// ============================================================
// START NEW MATCH
// ============================================================

function startNewMatch() {

    blueScore = 0;

    orangeScore = 0;

    gameTime = 300;

    overtime = false;

    matchEnded = false;

    matchResult = "";

    goalPause = false;

    goalPauseTimer = 0;

    goalText = "";

    clearHeldInputs();

    resetKickoff();

    updateHUD();
}

// ============================================================
// CAR UPDATE
// ============================================================

function updateCar(dt) {

    // ========================================================
    // FORWARD DIRECTION
    // ========================================================

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

    // ========================================================
    // CURRENT LOCAL VELOCITY
    // ========================================================

    let forwardSpeed =
        carVelocity.dot(
            forward
        );

    let sidewaysSpeed =
        carVelocity.dot(
            right
        );

    const horizontalSpeed =
        Math.hypot(
            carVelocity.x,
            carVelocity.z
        );

    // ========================================================
    // INPUT STATE
    // ========================================================

    const throttleHeld =
        !!keys[
            controls.throttle
        ];

    const reverseHeld =
        !!keys[
            controls.reverse
        ];

    const leftHeld =
        !!keys[
            controls.left
        ];

    const rightHeld =
        !!keys[
            controls.right
        ];

    const boostHeld =
        !!keys[
            controls.boost
        ];

    const powerslideHeld =
        !!keys[
            controls.powerslide
        ];

    // ========================================================
    // GROUND ENGINE
    // ========================================================

    if (grounded) {

        // ----------------------------------------------------
        // FORWARD
        // ----------------------------------------------------

        if (
            throttleHeld &&
            !reverseHeld
        ) {

            if (
                forwardSpeed <
                -1
            ) {

                // W acts as braking if we're moving backwards.

                carVelocity
                    .addScaledVector(
                        forward,
                        BRAKING *
                        dt
                    );

            } else if (
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

        // ----------------------------------------------------
        // REVERSE / BRAKE
        // ----------------------------------------------------

        if (
            reverseHeld &&
            !throttleHeld
        ) {

            if (
                forwardSpeed >
                1
            ) {

                // S brakes first.

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
        // STEERING
        // ====================================================

        const steeringInput =
            (
                leftHeld
                    ? 1
                    : 0
            ) -
            (
                rightHeld
                    ? 1
                    : 0
            );

        if (
            steeringInput !== 0
        ) {

            const speedRatio =
                THREE.MathUtils.clamp(
                    horizontalSpeed /
                    DRIVE_TOP_SPEED,
                    0,
                    1
                );

            let steerRate =
                THREE.MathUtils.lerp(
                    LOW_SPEED_STEER,
                    HIGH_SPEED_STEER,
                    speedRatio
                );

            if (
                powerslideHeld
            ) {

                steerRate *=
                    POWERSLIDE_STEER_MULTIPLIER;
            }

            // Reverse steering direction while travelling
            // backwards so the controls feel car-like.

            const directionMultiplier =
                forwardSpeed < -0.5
                    ? -1
                    : 1;

            carRotation +=
                steeringInput *
                steerRate *
                directionMultiplier *
                dt;
        }

        // ====================================================
        // GRIP
        // ====================================================

        const grip =
            powerslideHeld
                ? POWERSLIDE_GRIP
                : NORMAL_GRIP;

        const sidewaysDecay =
            Math.exp(
                -grip *
                dt
            );

        sidewaysSpeed *=
            sidewaysDecay;

        forwardSpeed =
            carVelocity.dot(
                forward
            );

        carVelocity
            .copy(
                forward
            )
            .multiplyScalar(
                forwardSpeed
            )
            .addScaledVector(
                right,
                sidewaysSpeed
            );

        // ====================================================
        // DRAG
        // ====================================================

        const powered =
            throttleHeld ||
            reverseHeld ||
            boostHeld;

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
    }

    // ========================================================
    // BOOST
    // ========================================================

    // Boost works in the air too.
    //
    // v0.4.2 still uses the car's horizontal heading.
    // Full pitch/yaw/roll aerial control comes in v0.5.

    if (
        boostHeld &&
        boostAmount > 0
    ) {

        const speedAlongForward =
            carVelocity.dot(
                forward
            );

        if (
            speedAlongForward <
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

        if (
            boostAmount < 0
        ) {

            boostAmount = 0;
        }
    }

    // ========================================================
    // VERTICAL PHYSICS
    // ========================================================

    if (
        !grounded
    ) {

        verticalVelocity -=
            GRAVITY *
            dt;

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

    } else {

        car.position.y = 0;
    }

    // ========================================================
    // MOVE CAR
    // ========================================================

    car.position.x +=
        carVelocity.x *
        dt;

    car.position.z +=
        carVelocity.z *
        dt;

    // ========================================================
    // APPLY ROTATION
    // ========================================================

    car.rotation.y =
        carRotation;

    // ========================================================
    // WHEEL SPIN
    // ========================================================

    const wheelForwardSpeed =
        carVelocity.dot(
            forward
        );

    const wheelSpin =
        wheelForwardSpeed *
        dt *
        1.7;

    for (
        const wheel of wheels
    ) {

        wheel.rotation.z -=
            wheelSpin;
    }

    // ========================================================
    // ARENA COLLISION
    // ========================================================

    collideCarWithArena();
}

// ============================================================
// CAR / ARENA COLLISION
// ============================================================

function collideCarWithArena() {

    const RADIUS = 2.1;

    // ========================================================
    // SIDE WALLS
    // ========================================================

    if (
        car.position.z >
        HALF_WIDTH -
        RADIUS
    ) {

        car.position.z =
            HALF_WIDTH -
            RADIUS;

        carVelocity.z =
            -Math.abs(
                carVelocity.z
            ) *
            0.28;
    }

    if (
        car.position.z <
        -HALF_WIDTH +
        RADIUS
    ) {

        car.position.z =
            -HALF_WIDTH +
            RADIUS;

        carVelocity.z =
            Math.abs(
                carVelocity.z
            ) *
            0.28;
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

    if (
        !insideGoal
    ) {

        if (
            car.position.x >
            HALF_LENGTH -
            RADIUS
        ) {

            car.position.x =
                HALF_LENGTH -
                RADIUS;

            carVelocity.x =
                -Math.abs(
                    carVelocity.x
                ) *
                0.28;
        }

        if (
            car.position.x <
            -HALF_LENGTH +
            RADIUS
        ) {

            car.position.x =
                -HALF_LENGTH +
                RADIUS;

            carVelocity.x =
                Math.abs(
                    carVelocity.x
                ) *
                0.28;
        }
    }

    // ========================================================
    // ORANGE GOAL INTERIOR
    // ========================================================

    if (
        insideGoal &&
        car.position.x >
        HALF_LENGTH -
        RADIUS
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
                ) *
                0.25;
        }
    }

    // ========================================================
    // BLUE GOAL INTERIOR
    // ========================================================

    if (
        insideGoal &&
        car.position.x <
        -HALF_LENGTH +
        RADIUS
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
                ) *
                0.25;
        }
    }
}

// ============================================================
// BALL PHYSICS
// ============================================================

function updateBall(dt) {

    ballVelocity.y -=
        21 *
        dt;

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
            ) <
            2.4
        ) {

            ballVelocity.y = 0;

        } else {

            ballVelocity.y *=
                -0.52;
        }

        // Rolling friction.

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

    // ========================================================
    // VISUAL BALL ROTATION
    // ========================================================

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
        BALL_RADIUS *
        0.3;

    const belowGoal =
        ball.position.y <
        GOAL_HEIGHT -
        BALL_RADIUS *
        0.2;

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
                BALL_RADIUS *
                0.35
            ) {

                scoreGoal(
                    "blue"
                );

                return;
            }

            // Back wall.

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

            // Goal side walls.

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

            // End wall bounce.

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

            // Ball crossed blue goal line.

            if (
                ball.position.x <
                -HALF_LENGTH -
                BALL_RADIUS *
                0.35
            ) {

                scoreGoal(
                    "orange"
                );

                return;
            }

            // Back wall.

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

            // Goal side walls.

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

            // End wall bounce.

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
        tempA.set(
            car.position.x,
            car.position.y +
            1.1,
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
                1 /
                distance
            );

        // Push ball outside the car.

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

        if (
            !grounded
        ) {

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

        // ====================================================
        // RESPAWN COUNTDOWN
        // ====================================================

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

                pad.pickup.visible =
                    true;
            }

            continue;
        }

        // Cheap animation.

        pad.orb.rotation.y +=
            dt *
            1.6;

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
            pad.pickupRadiusSq &&
            car.position.y <
            2.5
        ) {

            if (
                pad.big
            ) {

                boostAmount = 100;

                pad.timer = 10;

            } else {

                boostAmount =
                    Math.min(
                        100,
                        boostAmount +
                        12
                    );

                pad.timer = 4;
            }

            pad.active =
                false;

            // Floor decal stays visible.
            // Floating pickup disappears.

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

    if (
        overtime
    ) {

        finishMatch(
            team
        );

        return;
    }

    // ========================================================
    // NORMAL GOAL PAUSE
    // ========================================================

    goalPause = true;

    goalPauseTimer = 2;

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

    gameTime -=
        dt;

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

    clearHeldInputs();

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

    const desiredPosition =
        tempC;

    const desiredTarget =
        tempD;

    // ========================================================
    // BALL CAM
    // ========================================================

    if (
        ballCam
    ) {

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

        desiredTarget.copy(
            ball.position
        );

        tempB.set(
            car.position.x,
            car.position.y +
            1.2,
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
    // CAMERA
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

    if (
        matchEnded
    ) {

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
        previousGoalMessage
    ) {

        goalMessageElement.textContent =
            message;

        previousGoalMessage =
            message;
    }
}

// ============================================================
// R KEY MATCH BEHAVIOUR
// ============================================================

// Part 1 already detects the reset binding.
//
// Replace the normal kickoff reset with a complete new match
// after the final whistle by watching the reset key state here.

let resetWasHeld = false;

function updateMatchReset() {

    const resetHeld =
        !!keys[
            controls.reset
        ];

    if (
        matchEnded &&
        resetHeld &&
        !resetWasHeld
    ) {

        startNewMatch();
    }

    resetWasHeld =
        resetHeld;
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

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                1
            )
        );

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);

// ============================================================
// PERFORMANCE
// ============================================================

const FPS_LIMIT = 60;

const TARGET_FRAME_MS =
    1000 /
    FPS_LIMIT;

let previousRenderTime = 0;

let lastTime =
    performance.now();

// ============================================================
// FPS COUNTER
// ============================================================

const fpsElement =
    document.createElement(
        "div"
    );

fpsElement.style.cssText = `
    position:absolute;
    top:12px;
    right:14px;
    z-index:20;
    color:white;
    font-family:monospace;
    font-size:12px;
    opacity:0.55;
    pointer-events:none;
`;

fpsElement.textContent =
    "FPS: --";

document.body.appendChild(
    fpsElement
);

let fpsAccumulator = 0;

let fpsFrames = 0;

function updateFPS(dt) {

    fpsAccumulator +=
        dt;

    fpsFrames++;

    if (
        fpsAccumulator >=
        0.5
    ) {

        const fps =
            Math.round(
                fpsFrames /
                fpsAccumulator
            );

        fpsElement.textContent =
            `FPS: ${fps}`;

        fpsAccumulator = 0;

        fpsFrames = 0;
    }
}

// ============================================================
// MAIN LOOP
// ============================================================

function animate(time) {

    requestAnimationFrame(
        animate
    );

    // ========================================================
    // 60 FPS LIMIT
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

    lastTime =
        time;

    // ========================================================
    // MATCH RESET WATCHER
    // ========================================================

    updateMatchReset();

    // ========================================================
    // SIMULATION
    // ========================================================

    if (
        !menuOpen
    ) {

        if (
            matchEnded
        ) {

            // Match frozen, but camera remains alive.

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

updateMenu();

requestAnimationFrame(
    animate
);

// ============================================================
// BOOSTBALL v0.4.2 — CONTROL FREAK
//
// CONTROLS:
// ✓ Click controls in TAB menu to rebind
// ✓ Bindings saved in localStorage
// ✓ Duplicate bindings rejected
// ✓ ESC cancels rebinding
// ✓ Reset-to-defaults button
// ✓ TAB remains the menu key
// ✓ Ctrl+Tab / Ctrl+Shift+Tab / Alt+Tab are not intercepted
// ✓ Held inputs clear when browser loses focus
//
// PERFORMANCE:
// ✓ 60 FPS target
// ✓ 1x render scale
// ✓ 1024 shadow map
// ✓ reusable Vector3 scratch objects
// ✓ shared wheel geometry
// ✓ shared boost geometry
// ✓ squared boost-pad distance checks
// ✓ reduced ball geometry
// ✓ cached HUD elements
//
// MATCH:
// ✓ 5-minute regulation
// ✓ score comparison at 0:00
// ✓ tied game enters overtime
// ✓ overtime golden goal
// ✓ winner freezes the match
//
// NEXT:
// v0.5 — THE MICROWAVE LEARNS TO FLY
// ============================================================
