// BOOSTBALL v0.1
// Basic 3D prototype

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// --------------------------------------------------
// SETUP
// --------------------------------------------------

const canvas = document.getElementById("game");

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x07111f);

// Camera
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// --------------------------------------------------
// LIGHTS
// --------------------------------------------------

const ambientLight = new THREE.HemisphereLight(
    0xffffff,
    0x224422,
    2.5
);

scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0xffffff, 3);

sun.position.set(20, 40, 10);

scene.add(sun);

// --------------------------------------------------
// FIELD
// --------------------------------------------------

const fieldGeometry = new THREE.PlaneGeometry(80, 50);

const fieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x187a42,
    roughness: 0.9
});

const field = new THREE.Mesh(
    fieldGeometry,
    fieldMaterial
);

field.rotation.x = -Math.PI / 2;

scene.add(field);

// Centre line
const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
});

const centreLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.25, 50),
    lineMaterial
);

centreLine.rotation.x = -Math.PI / 2;
centreLine.position.y = 0.02;

scene.add(centreLine);

// --------------------------------------------------
// CAR
// --------------------------------------------------

const car = new THREE.Group();

const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.2, 2.2),
    new THREE.MeshStandardMaterial({
        color: 0x168cff
    })
);

carBody.position.y = 1;

car.add(carBody);

// Cabin
const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.9, 1.8),
    new THREE.MeshStandardMaterial({
        color: 0x8fdcff
    })
);

cabin.position.set(-0.3, 1.9, 0);

car.add(cabin);

// Wheels

const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111
});

function createWheel(x, z) {

    const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.55,
            0.55,
            0.45,
            16
        ),
        wheelMaterial
    );

    wheel.rotation.x = Math.PI / 2;

    wheel.position.set(
        x,
        0.55,
        z
    );

    car.add(wheel);
}

createWheel(-1.2, -1.2);
createWheel(-1.2, 1.2);
createWheel(1.2, -1.2);
createWheel(1.2, 1.2);

scene.add(car);

// Starting position
car.position.set(
    -20,
    0,
    0
);

// --------------------------------------------------
// BALL
// --------------------------------------------------

const ball = new THREE.Mesh(
    new THREE.SphereGeometry(
        1.8,
        32,
        32
    ),
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5
    })
);

ball.position.set(
    0,
    1.8,
    0
);

scene.add(ball);

// --------------------------------------------------
// GOALS
// --------------------------------------------------

function createGoal(x, colour) {

    const goalMaterial = new THREE.MeshStandardMaterial({
        color: colour,
        transparent: true,
        opacity: 0.5
    });

    const back = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.5,
            7,
            15
        ),
        goalMaterial
    );

    back.position.set(
        x,
        3.5,
        0
    );

    scene.add(back);
}

createGoal(-42, 0x168cff);
createGoal(42, 0xff7417);

// --------------------------------------------------
// CONTROLS
// --------------------------------------------------

const keys = {};

window.addEventListener(
    "keydown",
    function(event) {

        keys[event.key.toLowerCase()] = true;

    }
);

window.addEventListener(
    "keyup",
    function(event) {

        keys[event.key.toLowerCase()] = false;

    }
);

// --------------------------------------------------
// CAR MOVEMENT
// --------------------------------------------------

let speed = 0;
let rotationSpeed = 0;

const normalMaxSpeed = 0.45;
const boostMaxSpeed = 0.8;

function updateCar() {

    // Accelerate
    if (keys["w"] || keys["arrowup"]) {

        speed += 0.012;

    }

    // Reverse
    if (keys["s"] || keys["arrowdown"]) {

        speed -= 0.009;

    }

    // Friction
    speed *= 0.96;

    let maxSpeed = normalMaxSpeed;

    // BOOST
    if (keys["shift"]) {

        maxSpeed = boostMaxSpeed;

        if (speed > 0) {

            speed += 0.018;

        }

    }

    speed = Math.max(
        -0.25,
        Math.min(
            speed,
            maxSpeed
        )
    );

    // Steering
    if (Math.abs(speed) > 0.01) {

        if (keys["a"] || keys["arrowleft"]) {

            rotationSpeed += 0.0025;

        }

        if (keys["d"] || keys["arrowright"]) {

            rotationSpeed -= 0.0025;

        }

    }

    rotationSpeed *= 0.85;

    car.rotation.y += rotationSpeed;

    // Direction car is facing
    const direction = new THREE.Vector3(
        Math.cos(car.rotation.y),
        0,
        -Math.sin(car.rotation.y)
    );

    car.position.addScaledVector(
        direction,
        speed
    );

    // Keep car on pitch
    car.position.x = THREE.MathUtils.clamp(
        car.position.x,
        -38,
        38
    );

    car.position.z = THREE.MathUtils.clamp(
        car.position.z,
        -23,
        23
    );
}

// --------------------------------------------------
// BALL COLLISION
// --------------------------------------------------

let ballVelocity = new THREE.Vector3();

function updateBall() {

    const distance = car.position.distanceTo(
        ball.position
    );

    // Car hits ball
    if (distance < 4) {

        const hitDirection = ball.position
            .clone()
            .sub(car.position)
            .normalize();

        ballVelocity.addScaledVector(
            hitDirection,
            Math.abs(speed) * 1.8 + 0.12
        );

    }

    ball.position.add(ballVelocity);

    // Ball friction
    ballVelocity.multiplyScalar(0.985);

    // Side walls
    if (ball.position.z > 23) {

        ball.position.z = 23;
        ballVelocity.z *= -0.8;

    }

    if (ball.position.z < -23) {

        ball.position.z = -23;
        ballVelocity.z *= -0.8;

    }

    // End walls
    if (ball.position.x > 39) {

        ball.position.x = 39;
        ballVelocity.x *= -0.8;

    }

    if (ball.position.x < -39) {

        ball.position.x = -39;
        ballVelocity.x *= -0.8;

    }

    // Rotate ball while moving
    ball.rotation.z -= ballVelocity.x * 0.15;
    ball.rotation.x += ballVelocity.z * 0.15;
}

// --------------------------------------------------
// CAMERA
// --------------------------------------------------

function updateCamera() {

    const backwards = new THREE.Vector3(
        -Math.cos(car.rotation.y),
        0,
        Math.sin(car.rotation.y)
    );

    const desiredPosition = car.position
        .clone()
        .addScaledVector(
            backwards,
            11
        );

    desiredPosition.y += 6;

    camera.position.lerp(
        desiredPosition,
        0.12
    );

    const lookPosition = car.position.clone();

    lookPosition.y += 1.5;

    camera.lookAt(
        lookPosition
    );
}

// --------------------------------------------------
// RESIZE
// --------------------------------------------------

window.addEventListener(
    "resize",
    function() {

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

// --------------------------------------------------
// GAME LOOP
// --------------------------------------------------

function animate() {

    requestAnimationFrame(animate);

    updateCar();
    updateBall();
    updateCamera();

    renderer.render(
        scene,
        camera
    );
}

updateCamera();

animate();
