// ============================================================
//                     BOOSTBALL v0.3
//                  THE SECOND BEAST
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ============================================================
// RENDERER / SCENE
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
scene.fog = new THREE.Fog(0x07111f, 100, 190);

// ============================================================
// CAMERA
// ============================================================

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

const hemisphere = new THREE.HemisphereLight(
    0xd8f2ff,
    0x16351d,
    2.4
);

scene.add(hemisphere);

const sun = new THREE.DirectionalLight(
    0xffffff,
    3
);

sun.position.set(-30, 50, 25);
sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -100;
sun.shadow.camera.right = 100;
sun.shadow.camera.top = 70;
sun.shadow.camera.bottom = -70;

scene.add(sun);

// ============================================================
// ARENA CONSTANTS
// ============================================================

const FIELD_LENGTH = 120;
const FIELD_WIDTH = 72;

const HALF_LENGTH = FIELD_LENGTH / 2;
const HALF_WIDTH = FIELD_WIDTH / 2;

const WALL_HEIGHT = 7;

const GOAL_WIDTH = 22;
const GOAL_HEIGHT = 10;
const GOAL_DEPTH = 9;

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
// FIELD LINES
// ============================================================

const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
});

const centreLine = new THREE.Mesh(
    new THREE.PlaneGeometry(
        0.22,
        FIELD_WIDTH
    ),
    lineMaterial
);

centreLine.rotation.x = -Math.PI / 2;
centreLine.position.y = 0.03;

scene.add(centreLine);

// Centre circle

const circlePoints = [];

for (let i = 0; i <= 100; i++) {

    const angle =
        (i / 100) *
        Math.PI *
        2;

    circlePoints.push(
        new THREE.Vector3(
            Math.cos(angle) * 9,
            0.04,
            Math.sin(angle) * 9
        )
    );

}

const circleGeometry =
    new THREE.BufferGeometry()
        .setFromPoints(circlePoints);

const centreCircle =
    new THREE.Line(
        circleGeometry,
        new THREE.LineBasicMaterial({
            color: 0xffffff
        })
    );

scene.add(centreCircle);

// ============================================================
// ARENA WALLS
// ============================================================

const glassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x9adfff,
        transparent: true,
        opacity: 0.16,
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

// Long side walls

createWall(
    FIELD_LENGTH + 1,
    WALL_HEIGHT,
    0.5,
    0,
    WALL_HEIGHT / 2,
    HALF_WIDTH
);

createWall(
    FIELD_LENGTH + 1,
    WALL_HEIGHT,
    0.5,
    0,
    WALL_HEIGHT / 2,
    -HALF_WIDTH
);

// ============================================================
// END WALLS AROUND GOALS
// ============================================================

const sideOfGoalWidth =
    (FIELD_WIDTH - GOAL_WIDTH) / 2;

function createEndWallPieces(x) {

    const leftZ =
        GOAL_WIDTH / 2 +
        sideOfGoalWidth / 2;

    const rightZ =
        -GOAL_WIDTH / 2 -
        sideOfGoalWidth / 2;

    createWall(
        0.5,
        WALL_HEIGHT,
        sideOfGoalWidth,
        x,
        WALL_HEIGHT / 2,
        leftZ
    );

    createWall(
        0.5,
        WALL_HEIGHT,
        sideOfGoalWidth,
        x,
        WALL_HEIGHT / 2,
        rightZ
    );

}

createEndWallPieces(-HALF_LENGTH);
createEndWallPieces(HALF_LENGTH);

// ============================================================
// GOALS
// ============================================================

function createGoal(side, colour) {

    const goalX =
        side * HALF_LENGTH;

    const backX =
        goalX +
        side * GOAL_DEPTH;

    const goalMaterial =
        new THREE.MeshStandardMaterial({
            color: colour,
            transparent: true,
            opacity: 0.30
        });

    const solidGoalMaterial =
        new THREE.MeshStandardMaterial({
            color: colour,
            transparent: true,
            opacity: 0.45
        });

    // Back wall

    createWall(
        0.6,
        GOAL_HEIGHT,
        GOAL_WIDTH,
        backX,
        GOAL_HEIGHT / 2,
        0,
        goalMaterial
    );

    // Roof

    createWall(
        GOAL_DEPTH,
        0.5,
        GOAL_WIDTH,
        goalX + side * GOAL_DEPTH / 2,
        GOAL_HEIGHT,
        0,
        goalMaterial
    );

    // Side wall 1

    createWall(
        GOAL_DEPTH,
        GOAL_HEIGHT,
        0.5,
        goalX + side * GOAL_DEPTH / 2,
        GOAL_HEIGHT / 2,
        GOAL_WIDTH / 2,
        goalMaterial
    );

    // Side wall 2

    createWall(
        GOAL_DEPTH,
        GOAL_HEIGHT,
        0.5,
        goalX + side * GOAL_DEPTH / 2,
        GOAL_HEIGHT / 2,
        -GOAL_WIDTH / 2,
        goalMaterial
    );

    // Posts

    for (const z of [
        -GOAL_WIDTH / 2,
        GOAL_WIDTH / 2
    ]) {

        const post = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.65,
                GOAL_HEIGHT,
                0.65
            ),
            solidGoalMaterial
        );

        post.position.set(
            goalX,
            GOAL_HEIGHT / 2,
            z
        );

        scene.add(post);

    }

    // Crossbar

    const crossbar = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.65,
            0.65,
            GOAL_WIDTH
        ),
        solidGoalMaterial
    );

    crossbar.position.set(
        goalX,
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

// Nose

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

nose.position.set(
    2.15,
    0.72,
    0
);

nose.castShadow = true;

car.add(nose);

// Cabin

const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(
        1.9,
        0.85,
        1.75
    ),
    new THREE.MeshStandardMaterial({
        color: 0xa4ecff,
        roughness: 0.2,
        metalness: 0.15
    })
);

cabin.position.set(
    -0.25,
    1.72,
    0
);

cabin.castShadow = true;

car.add(cabin);

// ============================================================
// WHEELS
// ============================================================

const wheels = [];

const wheelMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.9
    });

function createWheel(x, z) {

    const wheelHolder =
        new THREE.Group();

    wheelHolder.position.set(
        x,
        0.55,
        z
    );

    const wheel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.55,
                0.55,
                0.45,
                20
            ),
            wheelMaterial
        );

    // Axle goes across the car
    wheel.rotation.x =
        Math.PI / 2;

    wheel.castShadow = true;

    wheelHolder.add(wheel);
    car.add(wheelHolder);

    wheels.push({
        holder: wheelHolder,
        mesh: wheel
    });

}

createWheel(-1.35, -1.2);
createWheel(-1.35, 1.2);
createWheel(1.35, -1.2);
createWheel(1.35, 1.2);

scene.add(car);

// ============================================================
// CAR PHYSICS
// ============================================================

const carVelocity =
    new THREE.Vector3();

let carRotation = 0;

let verticalVelocity = 0;

let grounded = true;

let boostAmount = 33;

const acceleration = 30;
const reverseAcceleration = 18;
const brakingPower = 38;

const maxSpeed = 28;
const boostMaxSpeed = 43;
const boostAcceleration = 50;

const rollingResistance = 0.985;

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
        roughness: 0.45
    })
);

ball.castShadow = true;

scene.add(ball);

const ballVelocity =
    new THREE.Vector3();

// ============================================================
// BOOST PADS
// ============================================================

const boostPads = [];

const smallPadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xffc72c,
        emissive: 0x6a3a00,
        emissiveIntensity: 1.4
    });

const bigPadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xff8c18,
        emissive: 0x7d2900,
        emissiveIntensity: 1.8
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
        0.12,
        z
    );

    const base =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                big ? 1.65 : 1.05,
                big ? 1.65 : 1.05,
                0.18,
                24
            ),
            big
                ? bigPadMaterial
                : smallPadMaterial
        );

    group.add(base);

    const orb =
        new THREE.Mesh(
            new THREE.OctahedronGeometry(
                big ? 0.75 : 0.42
            ),
            big
                ? bigPadMaterial
                : smallPadMaterial
        );

    orb.position.y =
        big ? 1.15 : 0.72;

    group.add(orb);

    scene.add(group);

    boostPads.push({
        group,
        orb,
        big,
        active: true,
        respawnTimer: 0
    });

}

// ------------------------------------------------------------
// Small pads
// ------------------------------------------------------------

// Centre line
createBoostPad(0, 0);
createBoostPad(0, 18);
createBoostPad(0, -18);

// Blue half
createBoostPad(-22, 0);
createBoostPad(-22, 20);
createBoostPad(-22, -20);

createBoostPad(-42, 10);
createBoostPad(-42, -10);

// Orange half
createBoostPad(22, 0);
createBoostPad(22, 20);
createBoostPad(22, -20);

createBoostPad(42, 10);
createBoostPad(42, -10);

// Diagonal pads
createBoostPad(-12, 10);
createBoostPad(-12, -10);

createBoostPad(12, 10);
createBoostPad(12, -10);

// ------------------------------------------------------------
// BIG pads
// ------------------------------------------------------------

createBoostPad(-48, 29, true);
createBoostPad(-48, -29, true);

createBoostPad(48, 29, true);
createBoostPad(48, -29, true);

// Midfield big pads
createBoostPad(0, 30, true);
createBoostPad(0, -30, true);

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
// HUD
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

    <p id="cameraMode"
       style="font-size:14px;">
        BALL CAM
    </p>

    <div
        id="goalMessage"
        style="
            font-size:48px;
            font-weight:bold;
            margin-top:20px;
            min-height:60px;
        ">
    </div>

    <p style="
        font-size:13px;
        opacity:0.7;
    ">
        WASD Drive • Space Jump • Shift Boost • C Camera • R Reset
    </p>
`;

// ============================================================
// INPUT
// ============================================================

const keys = {};
const pressed = {};

window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();

        keys[key] = true;

        if (!pressed[key]) {

            pressed[key] = true;

            if (
                key === " " &&
                !goalPause
            ) {

                jump();

            }

            if (key === "c") {

                ballCam =
                    !ballCam;

            }

            if (key === "r") {

                resetKickoff();

            }

        }

        if (
            key === " " ||
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
// JUMP
// ============================================================

function jump() {

    if (!grounded) {
        return;
    }

    verticalVelocity = 11;

    grounded = false;

}

// ============================================================
// KICKOFF RESET
// ============================================================

function resetKickoff() {

    car.position.set(
        -28,
        0,
        0
    );

    carRotation = 0;

    car.rotation.set(
        0,
        carRotation,
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
// CAR UPDATE
// ============================================================

function updateCar(dt) {

    const forward =
        new THREE.Vector3(
            Math.cos(carRotation),
            0,
            -Math.sin(carRotation)
        );

    let forwardSpeed =
        carVelocity.dot(forward);

    // --------------------------------------------------------
    // ACCELERATION
    // --------------------------------------------------------

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        carVelocity.addScaledVector(
            forward,
            acceleration * dt
        );

    }

    // --------------------------------------------------------
    // BRAKE / REVERSE
    // --------------------------------------------------------

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        if (forwardSpeed > 2) {

            carVelocity.addScaledVector(
                forward,
                -brakingPower * dt
            );

        } else {

            carVelocity.addScaledVector(
                forward,
                -reverseAcceleration * dt
            );

        }

    }

    // --------------------------------------------------------
    // BOOST
    // --------------------------------------------------------

    const boosting =
        keys["shift"] &&
        boostAmount > 0 &&
        (
            keys["w"] ||
            keys["arrowup"]
        );

    if (boosting) {

        carVelocity.addScaledVector(
            forward,
            boostAcceleration * dt
        );

        boostAmount -=
            33 * dt;

        boostAmount =
            Math.max(
                0,
                boostAmount
            );

    }

    // --------------------------------------------------------
    // SPEED LIMIT
    // --------------------------------------------------------

    let planarSpeed =
        Math.sqrt(
            carVelocity.x ** 2 +
            carVelocity.z ** 2
        );

    const speedLimit =
        boosting
            ? boostMaxSpeed
            : maxSpeed;

    if (planarSpeed > speedLimit) {

        const ratio =
            speedLimit /
            planarSpeed;

        carVelocity.x *= ratio;
        carVelocity.z *= ratio;

        planarSpeed =
            speedLimit;

    }

    // --------------------------------------------------------
    // STEERING
    // --------------------------------------------------------

    let steering = 0;

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        steering += 1;

    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        steering -= 1;

    }

    forwardSpeed =
        carVelocity.dot(forward);

    if (
        Math.abs(forwardSpeed) >
        0.35
    ) {

        const speedFactor =
            THREE.MathUtils.clamp(
                Math.abs(forwardSpeed) /
                maxSpeed,
                0,
                1
            );

        const steeringRate =
            THREE.MathUtils.lerp(
                2.45,
                1.55,
                speedFactor
            );

        const reverseDirection =
            forwardSpeed >= 0
                ? 1
                : -1;

        carRotation +=
            steering *
            steeringRate *
            reverseDirection *
            dt;

    }

    // --------------------------------------------------------
    // GROUND GRIP
    // --------------------------------------------------------

    if (grounded) {

        const right =
            new THREE.Vector3(
                Math.sin(carRotation),
                0,
                Math.cos(carRotation)
            );

        const sidewaysSpeed =
            carVelocity.dot(right);

        carVelocity.addScaledVector(
            right,
            -sidewaysSpeed *
            Math.min(
                1,
                8 * dt
            )
        );

    }

    // --------------------------------------------------------
    // FRICTION
    // --------------------------------------------------------

    const noThrottle =
        !keys["w"] &&
        !keys["s"] &&
        !keys["arrowup"] &&
        !keys["arrowdown"];

    if (noThrottle) {

        const resistance =
            Math.pow(
                rollingResistance,
                dt * 60
            );

        carVelocity.x *= resistance;
        carVelocity.z *= resistance;

    }

    // --------------------------------------------------------
    // GRAVITY
    // --------------------------------------------------------

    if (!grounded) {

        verticalVelocity -=
            27 * dt;

    }

    car.position.y +=
        verticalVelocity *
        dt;

    if (car.position.y <= 0) {

        car.position.y = 0;

        verticalVelocity = 0;

        grounded = true;

    }

    // --------------------------------------------------------
    // MOVE
    // --------------------------------------------------------

    car.position.x +=
        carVelocity.x *
        dt;

    car.position.z +=
        carVelocity.z *
        dt;

    car.rotation.y =
        carRotation;

    // --------------------------------------------------------
    // ARENA COLLISION
    // --------------------------------------------------------

    collideCarWithArena();

    // --------------------------------------------------------
    // WHEEL ROTATION
    // --------------------------------------------------------

    const wheelSpin =
        forwardSpeed *
        dt /
        0.55;

    for (const wheel of wheels) {

        // Only rotate the tyre around its axle.
        wheel.mesh.rotation.y +=
            wheelSpin;

    }

}

// ============================================================
// CAR ARENA COLLISION
// ============================================================

function collideCarWithArena() {

    const CAR_RADIUS = 2.1;

    // Side walls

    if (
        car.position.z >
        HALF_WIDTH -
        CAR_RADIUS
    ) {

        car.position.z =
            HALF_WIDTH -
            CAR_RADIUS;

        carVelocity.z =
            -Math.abs(
                carVelocity.z
            ) *
            0.25;

    }

    if (
        car.position.z <
        -HALF_WIDTH +
        CAR_RADIUS
    ) {

        car.position.z =
            -HALF_WIDTH +
            CAR_RADIUS;

        carVelocity.z =
            Math.abs(
                carVelocity.z
            ) *
            0.25;

    }

    const insideGoalWidth =
        Math.abs(
            car.position.z
        ) <
        GOAL_WIDTH / 2 -
        CAR_RADIUS / 2;

    // --------------------------------------------------------
    // NORMAL END WALL COLLISION
    // --------------------------------------------------------

    if (!insideGoalWidth) {

        if (
            car.position.x >
            HALF_LENGTH -
            CAR_RADIUS
        ) {

            car.position.x =
                HALF_LENGTH -
                CAR_RADIUS;

            carVelocity.x =
                -Math.abs(
                    carVelocity.x
                ) *
                0.25;

        }

        if (
            car.position.x <
            -HALF_LENGTH +
            CAR_RADIUS
        ) {

            car.position.x =
                -HALF_LENGTH +
                CAR_RADIUS;

            carVelocity.x =
                Math.abs(
                    carVelocity.x
                ) *
                0.25;

        }

    }

    // --------------------------------------------------------
    // INSIDE ORANGE GOAL
    // --------------------------------------------------------

    if (
        car.position.x >
        HALF_LENGTH -
        CAR_RADIUS &&
        insideGoalWidth
    ) {

        // Goal side walls

        const goalSideLimit =
            GOAL_WIDTH / 2 -
            CAR_RADIUS / 2;

        car.position.z =
            THREE.MathUtils.clamp(
                car.position.z,
                -goalSideLimit,
                goalSideLimit
            );

        // GOAL BACK WALL
        const maxGoalX =
            HALF_LENGTH +
            GOAL_DEPTH -
            CAR_RADIUS;

        if (
            car.position.x >
            maxGoalX
        ) {

            car.position.x =
                maxGoalX;

            carVelocity.x =
                -Math.abs(
                    carVelocity.x
                ) *
                0.25;

        }

    }

    // --------------------------------------------------------
    // INSIDE BLUE GOAL
    // --------------------------------------------------------

    if (
        car.position.x <
        -HALF_LENGTH +
        CAR_RADIUS &&
        insideGoalWidth
    ) {

        const goalSideLimit =
            GOAL_WIDTH / 2 -
            CAR_RADIUS / 2;

        car.position.z =
            THREE.MathUtils.clamp(
                car.position.z,
                -goalSideLimit,
                goalSideLimit
            );

        // GOAL BACK WALL
        const minGoalX =
            -HALF_LENGTH -
            GOAL_DEPTH +
            CAR_RADIUS;

        if (
            car.position.x <
            minGoalX
        ) {

            car.position.x =
                minGoalX;

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

    // Gravity

    ballVelocity.y -=
        21 * dt;

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
            -0.5
        ) {

            ballVelocity.y *=
                -0.70;

        } else {

            ballVelocity.y = 0;

        }

        const groundDrag =
            Math.pow(
                0.996,
                dt * 60
            );

        ballVelocity.x *=
            groundDrag;

        ballVelocity.z *=
            groundDrag;

    }

    // --------------------------------------------------------
    // SIDE WALLS
    // --------------------------------------------------------

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
            0.82;

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
            0.82;

    }

    collideBallWithEnds();

    // --------------------------------------------------------
    // BALL ROTATION
    // --------------------------------------------------------

    ball.rotation.z -=
        ballVelocity.x *
        dt *
        0.45;

    ball.rotation.x +=
        ballVelocity.z *
        dt *
        0.45;

}

// ============================================================
// BALL END WALL / GOAL COLLISION
// ============================================================

function collideBallWithEnds() {

    const insideGoalWidth =
        Math.abs(
            ball.position.z
        ) <
        GOAL_WIDTH / 2 -
        BALL_RADIUS * 0.4;

    const belowCrossbar =
        ball.position.y <
        GOAL_HEIGHT -
        BALL_RADIUS * 0.2;

    // ========================================================
    // ORANGE END
    // ========================================================

    if (
        ball.position.x >
        HALF_LENGTH -
        BALL_RADIUS
    ) {

        if (
            insideGoalWidth &&
            belowCrossbar
        ) {

            // GOAL DETECTION
            if (
                ball.position.x >
                HALF_LENGTH +
                BALL_RADIUS * 0.3
            ) {

                scoreGoal("blue");

            }

            // Back of orange goal

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

                ballVelocity.x =
                    -Math.abs(
                        ballVelocity.x
                    ) *
                    0.65;

            }

            // Goal side walls

            const sideLimit =
                GOAL_WIDTH / 2 -
                BALL_RADIUS;

            if (
                ball.position.z >
                sideLimit
            ) {

                ball.position.z =
                    sideLimit;

                ballVelocity.z =
                    -Math.abs(
                        ballVelocity.z
                    ) *
                    0.65;

            }

            if (
                ball.position.z <
                -sideLimit
            ) {

                ball.position.z =
                    -sideLimit;

                ballVelocity.z =
                    Math.abs(
                        ballVelocity.z
                    ) *
                    0.65;

            }

        } else {

            ball.position.x =
                HALF_LENGTH -
                BALL_RADIUS;

            ballVelocity.x =
                -Math.abs(
                    ballVelocity.x
                ) *
                0.82;

        }

    }

    // ========================================================
    // BLUE END
    // ========================================================

    if (
        ball.position.x <
        -HALF_LENGTH +
        BALL_RADIUS
    ) {

        if (
            insideGoalWidth &&
            belowCrossbar
        ) {

            if (
                ball.position.x <
                -HALF_LENGTH -
                BALL_RADIUS * 0.3
            ) {

                scoreGoal(
                    "orange"
                );

            }

            const backWall =
                -HALF_LENGTH -
                GOAL_DEPTH +
                BALL_RADIUS;

            if (
                ball.position.x <
                backWall
            ) {

                ball.position.x =
                    backWall;

                ballVelocity.x =
                    Math.abs(
                        ballVelocity.x
                    ) *
                    0.65;

            }

            const sideLimit =
                GOAL_WIDTH / 2 -
                BALL_RADIUS;

            if (
                ball.position.z >
                sideLimit
            ) {

                ball.position.z =
                    sideLimit;

                ballVelocity.z =
                    -Math.abs(
                        ballVelocity.z
                    ) *
                    0.65;

            }

            if (
                ball.position.z <
                -sideLimit
            ) {

                ball.position.z =
                    -sideLimit;

                ballVelocity.z =
                    Math.abs(
                        ballVelocity.z
                    ) *
                    0.65;

            }

        } else {

            ball.position.x =
                -HALF_LENGTH +
                BALL_RADIUS;

            ballVelocity.x =
                Math.abs(
                    ballVelocity.x
                ) *
                0.82;

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
                    1.15,
                    0
                )
            );

    const difference =
        ball.position
            .clone()
            .sub(
                carCentre
            );

    const distance =
        difference.length();

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
            difference.normalize();

        ball.position.copy(
            carCentre
                .clone()
                .addScaledVector(
                    normal,
                    collisionDistance
                )
        );

        const carSpeed =
            carVelocity.length();

        const impactStrength =
            9 +
            carSpeed *
            1.12;

        ballVelocity.addScaledVector(
            normal,
            impactStrength
        );

        ballVelocity.addScaledVector(
            carVelocity,
            0.48
        );

        // Jump hits give vertical power

        if (!grounded) {

            ballVelocity.y +=
                Math.max(
                    2,
                    verticalVelocity *
                    0.75
                );

        }

        carVelocity.multiplyScalar(
            0.94
        );

    }

}

// ============================================================
// BOOST PAD UPDATE
// ============================================================

function updateBoostPads(dt) {

    for (const pad of boostPads) {

        // ----------------------------------------------------
        // RESPAWN TIMER
        // ----------------------------------------------------

        if (!pad.active) {

            pad.respawnTimer -= dt;

            if (
                pad.respawnTimer <= 0
            ) {

                pad.active = true;

                pad.group.visible = true;

            }

            continue;

        }

        // ----------------------------------------------------
        // ANIMATION
        // ----------------------------------------------------

        pad.orb.rotation.y +=
            dt * 2.5;

        pad.orb.rotation.x +=
            dt * 1.3;

        pad.orb.position.y =
            (
                pad.big
                    ? 1.15
                    : 0.72
            ) +
            Math.sin(
                performance.now() *
                0.004
            ) *
            0.12;

        // ----------------------------------------------------
        // PICKUP
        // ----------------------------------------------------

        const dx =
            car.position.x -
            pad.group.position.x;

        const dz =
            car.position.z -
            pad.group.position.z;

        const distance =
            Math.sqrt(
                dx * dx +
                dz * dz
            );

        const pickupRadius =
            pad.big
                ? 2.6
                : 2;

        if (
            distance <
            pickupRadius &&
            car.position.y <
            2.5
        ) {

            if (pad.big) {

                boostAmount = 100;

                pad.respawnTimer = 10;

            } else {

                boostAmount =
                    Math.min(
                        100,
                        boostAmount + 12
                    );

                pad.respawnTimer = 4;

            }

            pad.active = false;

            pad.group.visible = false;

        }

    }

}

// ============================================================
// GOAL
// ============================================================

function scoreGoal(team) {

    if (goalPause) {
        return;
    }

    goalPause = true;

    goalPauseTimer = 2.0;

    if (team === "blue") {

        blueScore++;

        goalText =
            "BLUE SCORES!";

    } else {

        orangeScore++;

        goalText =
            "ORANGE SCORES!";

    }

    // Stop the car during goal pause

    carVelocity.set(
        0,
        0,
        0
    );

}

// ============================================================
// GOAL PAUSE
// ============================================================

function updateGoalPause(dt) {

    if (!goalPause) {
        return;
    }

    goalPauseTimer -= dt;

    // Let the ball continue slowly during celebration

    ballVelocity.multiplyScalar(
        Math.pow(
            0.97,
            dt * 60
        )
    );

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

    const carForward =
        new THREE.Vector3(
            Math.cos(carRotation),
            0,
            -Math.sin(carRotation)
        );

    let desiredCameraPosition;
    let desiredLookTarget;

    // ========================================================
    // BALL CAM
    // ========================================================

    if (ballCam) {

        // Horizontal direction FROM car TO ball

        const toBall =
            ball.position
                .clone()
                .sub(
                    car.position
                );

        toBall.y = 0;

        if (
            toBall.lengthSq() <
            0.01
        ) {

            toBall.copy(
                carForward
            );

        } else {

            toBall.normalize();

        }

        // Camera stays BEHIND THE CAR relative to the ball.
        // Car remains the visual anchor.

        desiredCameraPosition =
            car.position
                .clone()
                .addScaledVector(
                    toBall,
                    -12.5
                );

        desiredCameraPosition.y +=
            6.5;

        // Look mostly at ball, but slightly above car line.

        desiredLookTarget =
            ball.position
                .clone();

        desiredLookTarget.y +=
            0.35;

    }

    // ========================================================
    // CAR CAM
    // ========================================================

    else {

        desiredCameraPosition =
            car.position
                .clone()
                .addScaledVector(
                    carForward,
                    -12
                );

        desiredCameraPosition.y +=
            6;

        desiredLookTarget =
            car.position
                .clone()
                .addScaledVector(
                    carForward,
                    10
                );

        desiredLookTarget.y +=
            1.4;

    }

    // --------------------------------------------------------
    // Camera follows jumping car gently
    // --------------------------------------------------------

    desiredCameraPosition.y +=
        Math.max(
            0,
            car.position.y * 0.3
        );

    // --------------------------------------------------------
    // Smooth movement
    // --------------------------------------------------------

    const positionSmooth =
        1 -
        Math.pow(
            0.0008,
            dt
        );

    camera.position.lerp(
        desiredCameraPosition,
        positionSmooth
    );

    const targetSmooth =
        1 -
        Math.pow(
            0.0001,
            dt
        );

    cameraTarget.lerp(
        desiredLookTarget,
        targetSmooth
    );

    camera.lookAt(
        cameraTarget
    );

}

// ============================================================
// HUD UPDATE
// ============================================================

function updateHUD() {

    const score =
        document.getElementById(
            "score"
        );

    const timer =
        document.getElementById(
            "timer"
        );

    const boost =
        document.getElementById(
            "boost"
        );

    const cameraMode =
        document.getElementById(
            "cameraMode"
        );

    const goalMessage =
        document.getElementById(
            "goalMessage"
        );

    score.textContent =
        `Blue ${blueScore} - ${orangeScore} Orange`;

    boost.textContent =
        `BOOST: ${Math.ceil(boostAmount)}`;

    cameraMode.textContent =
        ballCam
            ? "BALL CAM"
            : "CAR CAM";

    goalMessage.textContent =
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
        .padStart(
            2,
            "0"
        );

    timer.textContent =
        `${minutes}:${seconds}`;

}

// ============================================================
// GAME TIMER
// ============================================================

function updateTimer(dt) {

    if (goalPause) {
        return;
    }

    if (gameTime > 0) {

        gameTime -= dt;

        if (gameTime < 0) {

            gameTime = 0;

        }

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

function animate(currentTime) {

    requestAnimationFrame(
        animate
    );

    const dt =
        Math.min(
            (
                currentTime -
                lastTime
            ) /
            1000,
            0.033
        );

    lastTime =
        currentTime;

    // --------------------------------------------------------
    // NORMAL GAMEPLAY
    // --------------------------------------------------------

    if (!goalPause) {

        updateCar(dt);

        updateBall(dt);

        updateCarBallCollision();

        updateBoostPads(dt);

        updateTimer(dt);

    }

    // --------------------------------------------------------
    // GOAL CELEBRATION
    // --------------------------------------------------------

    else {

        updateGoalPause(dt);

        updateBoostPads(dt);

    }

    updateCamera(dt);

    updateHUD();

    renderer.render(
        scene,
        camera
    );

}

// ============================================================
// BEGIN
// ============================================================

resetKickoff();

cameraTarget.copy(
    car.position
);

updateHUD();

requestAnimationFrame(
    animate
);
