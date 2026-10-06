// ============================================================
//                     BOOSTBALL v0.2
//              Extremely Legal Car Football
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
scene.fog = new THREE.Fog(0x07111f, 70, 130);

// ============================================================
// CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    72,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

camera.position.set(-15, 7, 0);

// ============================================================
// LIGHTING
// ============================================================

const skyLight = new THREE.HemisphereLight(
    0xcceeff,
    0x17331f,
    2.5
);

scene.add(skyLight);

const sun = new THREE.DirectionalLight(
    0xffffff,
    3
);

sun.position.set(
    -15,
    35,
    20
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -60;
sun.shadow.camera.right = 60;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;

scene.add(sun);

// ============================================================
// ARENA
// ============================================================

const FIELD_LENGTH = 84;
const FIELD_WIDTH = 52;

const HALF_LENGTH = FIELD_LENGTH / 2;
const HALF_WIDTH = FIELD_WIDTH / 2;

const field = new THREE.Mesh(
    new THREE.PlaneGeometry(
        FIELD_LENGTH,
        FIELD_WIDTH
    ),
    new THREE.MeshStandardMaterial({
        color: 0x248c50,
        roughness: 0.9
    })
);

field.rotation.x = -Math.PI / 2;

field.receiveShadow = true;

scene.add(field);

// ------------------------------------------------------------
// Field lines
// ------------------------------------------------------------

const whiteMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
});

const centreLine = new THREE.Mesh(
    new THREE.PlaneGeometry(
        0.18,
        FIELD_WIDTH
    ),
    whiteMaterial
);

centreLine.rotation.x = -Math.PI / 2;

centreLine.position.y = 0.025;

scene.add(centreLine);

// Centre circle

const circlePoints = [];

for (let i = 0; i <= 80; i++) {

    const angle =
        (i / 80) *
        Math.PI *
        2;

    circlePoints.push(
        new THREE.Vector3(
            Math.cos(angle) * 7,
            0.04,
            Math.sin(angle) * 7
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

const wallMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x91c6df,
        transparent: true,
        opacity: 0.18
    });

function createWall(
    width,
    height,
    depth,
    x,
    y,
    z
) {

    const wall =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            wallMaterial
        );

    wall.position.set(
        x,
        y,
        z
    );

    scene.add(wall);

}

// Side walls

createWall(
    FIELD_LENGTH,
    5,
    0.5,
    0,
    2.5,
    HALF_WIDTH
);

createWall(
    FIELD_LENGTH,
    5,
    0.5,
    0,
    2.5,
    -HALF_WIDTH
);

// ============================================================
// GOALS
// ============================================================

const GOAL_WIDTH = 16;
const GOAL_HEIGHT = 8;
const GOAL_DEPTH = 6;

function createGoal(x, colour) {

    const material =
        new THREE.MeshStandardMaterial({
            color: colour,
            transparent: true,
            opacity: 0.35
        });

    const back =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.4,
                GOAL_HEIGHT,
                GOAL_WIDTH
            ),
            material
        );

    back.position.set(
        x,
        GOAL_HEIGHT / 2,
        0
    );

    scene.add(back);

    const top =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                GOAL_DEPTH,
                0.4,
                GOAL_WIDTH
            ),
            material
        );

    top.position.set(
        x +
        (
            x > 0
                ? GOAL_DEPTH / 2
                : -GOAL_DEPTH / 2
        ),
        GOAL_HEIGHT,
        0
    );

    scene.add(top);

    // Goal posts

    for (const side of [-1, 1]) {

        const post =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.5,
                    GOAL_HEIGHT,
                    0.5
                ),
                new THREE.MeshStandardMaterial({
                    color: colour
                })
            );

        post.position.set(
            x,
            GOAL_HEIGHT / 2,
            side * GOAL_WIDTH / 2
        );

        scene.add(post);

    }

}

createGoal(
    -HALF_LENGTH - GOAL_DEPTH,
    0x168cff
);

createGoal(
    HALF_LENGTH + GOAL_DEPTH,
    0xff7417
);

// ============================================================
// CAR
// ============================================================

const car = new THREE.Group();

// Main body

const carBody =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            4.2,
            1.1,
            2.3
        ),
        new THREE.MeshStandardMaterial({
            color: 0x168cff,
            roughness: 0.35,
            metalness: 0.25
        })
    );

carBody.position.y = 1;

carBody.castShadow = true;

car.add(carBody);

// Nose

const nose =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            1.1,
            0.55,
            2.15
        ),
        new THREE.MeshStandardMaterial({
            color: 0x0870d5
        })
    );

nose.position.set(
    2,
    0.75,
    0
);

car.add(nose);

// Cabin

const cabin =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            1.9,
            0.85,
            1.8
        ),
        new THREE.MeshStandardMaterial({
            color: 0xa4ecff,
            roughness: 0.2,
            metalness: 0.2
        })
    );

cabin.position.set(
    -0.35,
    1.75,
    0
);

car.add(cabin);

// ============================================================
// WHEELS
// ============================================================

const wheels = [];

const wheelMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 0.9
    });

function createWheel(x, z) {

    const wheel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.55,
                0.55,
                0.5,
                20
            ),
            wheelMaterial
        );

    wheel.rotation.x =
        Math.PI / 2;

    wheel.position.set(
        x,
        0.55,
        z
    );

    wheel.castShadow = true;

    car.add(wheel);

    wheels.push(wheel);

}

createWheel(-1.25, -1.2);
createWheel(-1.25, 1.2);
createWheel(1.25, -1.2);
createWheel(1.25, 1.2);

scene.add(car);

// ============================================================
// CAR PHYSICS
// ============================================================

const carVelocity =
    new THREE.Vector3();

let carRotation = 0;

let verticalVelocity = 0;

let grounded = true;

let boostAmount = 100;

const CAR_HEIGHT = 0;

const acceleration = 28;

const reverseAcceleration = 18;

const maxSpeed = 25;

const boostMaxSpeed = 39;

const boostAcceleration = 48;

const brakingPower = 34;

const rollingResistance = 0.985;

// ============================================================
// BALL
// ============================================================

const BALL_RADIUS = 1.8;

const ball =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            BALL_RADIUS,
            32,
            24
        ),
        new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.5
        })
    );

ball.castShadow = true;

scene.add(ball);

const ballVelocity =
    new THREE.Vector3();

// ============================================================
// GAME STATE
// ============================================================

let blueScore = 0;
let orangeScore = 0;

let ballCam = false;

let gameTime = 300;

let lastTime =
    performance.now();

let goalCooldown = false;

// ============================================================
// HUD
// ============================================================

const oldHUD =
    document.getElementById("hud");

oldHUD.innerHTML = `
    <h1>BOOSTBALL</h1>

    <p id="score">
        Blue 0 - 0 Orange
    </p>

    <p id="timer">
        5:00
    </p>

    <p id="boost">
        BOOST: 100
    </p>

    <p style="
        font-size:14px;
        opacity:0.75;
    ">
        WASD Drive • Space Jump • Shift Boost • C Ball Cam • R Reset
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

            if (key === " ") {

                jump();

            }

            if (key === "c") {

                ballCam = !ballCam;

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

    verticalVelocity = 10.5;

    grounded = false;

}

// ============================================================
// RESET
// ============================================================

function resetKickoff() {

    car.position.set(
        -20,
        CAR_HEIGHT,
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

    boostAmount = 100;

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

    const forwardSpeed =
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
    // REVERSE / BRAKING
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
        boostAmount > 0;

    if (boosting) {

        carVelocity.addScaledVector(
            forward,
            boostAcceleration * dt
        );

        boostAmount -=
            32 * dt;

        boostAmount =
            Math.max(
                0,
                boostAmount
            );

    } else {

        // Slowly regenerate for now

        boostAmount +=
            7 * dt;

        boostAmount =
            Math.min(
                100,
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

    if (
        planarSpeed >
        speedLimit
    ) {

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

    if (
        Math.abs(forwardSpeed) >
        0.4
    ) {

        // More responsive at low speed,
        // slightly less twitchy at high speed.

        const speedFactor =
            THREE.MathUtils.clamp(
                Math.abs(forwardSpeed) /
                15,
                0.25,
                1
            );

        let steerRate =
            THREE.MathUtils.lerp(
                2.3,
                1.5,
                speedFactor
            );

        // Reverse steering direction
        if (forwardSpeed < 0) {

            steerRate *= -1;

        }

        carRotation +=
            steering *
            steerRate *
            dt;

    }

    // --------------------------------------------------------
    // GRIP
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

        // Remove most sideways sliding
        carVelocity.addScaledVector(
            right,
            -sidewaysSpeed *
            Math.min(
                1,
                7 * dt
            )
        );

    }

    // --------------------------------------------------------
    // FRICTION
    // --------------------------------------------------------

    if (
        !keys["w"] &&
        !keys["s"] &&
        !keys["arrowup"] &&
        !keys["arrowdown"]
    ) {

        carVelocity.x *=
            Math.pow(
                rollingResistance,
                dt * 60
            );

        carVelocity.z *=
            Math.pow(
                rollingResistance,
                dt * 60
            );

    }

    // --------------------------------------------------------
    // GRAVITY
    // --------------------------------------------------------

    if (!grounded) {

        verticalVelocity -=
            25 * dt;

    }

    car.position.y +=
        verticalVelocity * dt;

    if (
        car.position.y <=
        CAR_HEIGHT
    ) {

        car.position.y =
            CAR_HEIGHT;

        verticalVelocity = 0;

        grounded = true;

    }

    // --------------------------------------------------------
    // MOVE CAR
    // --------------------------------------------------------

    car.position.x +=
        carVelocity.x * dt;

    car.position.z +=
        carVelocity.z * dt;

    car.rotation.y =
        carRotation;

    // --------------------------------------------------------
    // WALL COLLISION
    // --------------------------------------------------------

    const wallPadding = 2.1;

    if (
        car.position.z >
        HALF_WIDTH -
        wallPadding
    ) {

        car.position.z =
            HALF_WIDTH -
            wallPadding;

        carVelocity.z *= -0.35;

    }

    if (
        car.position.z <
        -HALF_WIDTH +
        wallPadding
    ) {

        car.position.z =
            -HALF_WIDTH +
            wallPadding;

        carVelocity.z *= -0.35;

    }

    // End walls, except goal opening

    const inGoalOpening =
        Math.abs(
            car.position.z
        ) <
        GOAL_WIDTH / 2 -
        1;

    if (
        car.position.x >
        HALF_LENGTH -
        wallPadding &&
        !inGoalOpening
    ) {

        car.position.x =
            HALF_LENGTH -
            wallPadding;

        carVelocity.x *= -0.35;

    }

    if (
        car.position.x <
        -HALF_LENGTH +
        wallPadding &&
        !inGoalOpening
    ) {

        car.position.x =
            -HALF_LENGTH +
            wallPadding;

        carVelocity.x *= -0.35;

    }

    // --------------------------------------------------------
    // WHEEL ANIMATION
    // --------------------------------------------------------

    for (
        const wheel
        of wheels
    ) {

        wheel.rotation.z -=
            forwardSpeed *
            dt *
            1.5;

    }

}

// ============================================================
// BALL UPDATE
// ============================================================

function updateBall(dt) {

    // Gravity

    ballVelocity.y -=
        20 * dt;

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
                -0.72;

        }

        // Ground rolling resistance

        ballVelocity.x *=
            Math.pow(
                0.995,
                dt * 60
            );

        ballVelocity.z *=
            Math.pow(
                0.995,
                dt * 60
            );

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

    // --------------------------------------------------------
    // END WALLS / GOALS
    // --------------------------------------------------------

    const insideGoalWidth =
        Math.abs(
            ball.position.z
        ) <
        GOAL_WIDTH / 2 -
        BALL_RADIUS / 2;

    const belowCrossbar =
        ball.position.y <
        GOAL_HEIGHT;

    if (
        ball.position.x >
        HALF_LENGTH
    ) {

        if (
            insideGoalWidth &&
            belowCrossbar
        ) {

            if (
                ball.position.x >
                HALF_LENGTH + 3
            ) {

                scoreGoal("blue");

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

    if (
        ball.position.x <
        -HALF_LENGTH
    ) {

        if (
            insideGoalWidth &&
            belowCrossbar
        ) {

            if (
                ball.position.x <
                -HALF_LENGTH - 3
            ) {

                scoreGoal(
                    "orange"
                );

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

    // --------------------------------------------------------
    // BALL ROTATION
    // --------------------------------------------------------

    ball.rotation.z -=
        ballVelocity.x *
        dt *
        0.5;

    ball.rotation.x +=
        ballVelocity.z *
        dt *
        0.5;

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
            .sub(
                carCentre
            );

    const distance =
        delta.length();

    const collisionDistance =
        BALL_RADIUS +
        2.3;

    if (
        distance <
        collisionDistance &&
        distance >
        0.001
    ) {

        const normal =
            delta.normalize();

        // Push ball outside car
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

        const hitStrength =
            10 +
            carSpeed *
            1.15;

        ballVelocity.addScaledVector(
            normal,
            hitStrength
        );

        ballVelocity.addScaledVector(
            carVelocity,
            0.55
        );

        // Jumping into ball gives it lift

        if (!grounded) {

            ballVelocity.y +=
                Math.max(
                    2,
                    verticalVelocity *
                    0.7
                );

        }

        // Car loses a tiny amount of speed

        carVelocity.multiplyScalar(
            0.93
        );

    }

}

// ============================================================
// GOAL SCORING
// ============================================================

function scoreGoal(team) {

    if (goalCooldown) {
        return;
    }

    goalCooldown = true;

    if (
        team === "blue"
    ) {

        blueScore++;

    } else {

        orangeScore++;

    }

    updateHUD();

    setTimeout(
        () => {

            resetKickoff();

            goalCooldown = false;

        },
        900
    );

}

// ============================================================
// CAMERA
// ============================================================

function updateCamera(dt) {

    const forward =
        new THREE.Vector3(
            Math.cos(carRotation),
            0,
            -Math.sin(carRotation)
        );

    let target;

    if (ballCam) {

        target =
            ball.position
                .clone();

    } else {

        target =
            car.position
                .clone()
                .addScaledVector(
                    forward,
                    8
                );

        target.y += 1.5;

    }

    const backwards =
        forward
            .clone()
            .multiplyScalar(-1);

    const desiredCameraPosition =
        car.position
            .clone()
            .addScaledVector(
                backwards,
                11.5
            );

    desiredCameraPosition.y +=
        6.2;

    // Pull camera slightly higher if jumping

    desiredCameraPosition.y +=
        Math.max(
            0,
            car.position.y *
            0.25
        );

    const smoothing =
        1 -
        Math.pow(
            0.001,
            dt
        );

    camera.position.lerp(
        desiredCameraPosition,
        smoothing
    );

    // BALL CAM
    if (ballCam) {

        const directionToBall =
            ball.position
                .clone()
                .sub(
                    camera.position
                );

        // Keep ball visible without looking
        // straight into the ground.

        target =
            camera.position
                .clone()
                .add(
                    directionToBall
                );

    }

    camera.lookAt(target);

}

// ============================================================
// HUD
// ============================================================

function updateHUD() {

    const score =
        document.getElementById(
            "score"
        );

    const boost =
        document.getElementById(
            "boost"
        );

    const timer =
        document.getElementById(
            "timer"
        );

    score.textContent =
        `Blue ${blueScore} - ${orangeScore} Orange`;

    boost.textContent =
        `BOOST: ${Math.round(boostAmount)}`;

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
// TIMER
// ============================================================

function updateTimer(dt) {

    gameTime -= dt;

    if (
        gameTime <
        0
    ) {

        gameTime = 0;

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
// MAIN GAME LOOP
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

    updateCar(dt);

    updateBall(dt);

    updateCarBallCollision();

    updateCamera(dt);

    updateTimer(dt);

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

updateHUD();

requestAnimationFrame(
    animate
);
