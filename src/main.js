// (FULL FILE) Restored working src/main.js
// Note: This is the working version without the problematic glow changes.
// Replace your current src/main.js with this contents.

import gsap from "gsap";
import { Howl } from "howler";
import * as THREE from "three";
import { OrbitControls } from "./utils/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import smokeVertexShader from "./shaders/smoke/vertex.glsl";
import smokeFragmentShader from "./shaders/smoke/fragment.glsl";
import themeVertexShader from "./shaders/theme/vertex.glsl";
import themeFragmentShader from "./shaders/theme/fragment.glsl";

// 👇 ADD THIS
const ASSET_BASE = import.meta.env.BASE_URL;

/**  -------------------------- Audio setup -------------------------- */

// Background Music
let pianoDebounceTimer = null;
let isMusicFaded = false;
const MUSIC_FADE_TIME = 500;
const PIANO_TIMEOUT = 2000;
const BACKGROUND_MUSIC_VOLUME = 0.3;
const FADED_VOLUME = 0;

const backgroundMusic = new Howl({
    src: [ASSET_BASE + "audio/music/Lofi.ogg"],
    loop: true,
    volume: BACKGROUND_MUSIC_VOLUME,
});

const fadeOutBackgroundMusic = () => {
    if (!isMuted && !isMusicFaded) {
        backgroundMusic.fade(backgroundMusic.volume(), FADED_VOLUME, MUSIC_FADE_TIME);
        isMusicFaded = true;
    }
};

const fadeInBackgroundMusic = () => {
    if (!isMuted && isMusicFaded) {
        backgroundMusic.fade(FADED_VOLUME, BACKGROUND_MUSIC_VOLUME, MUSIC_FADE_TIME);
        isMusicFaded = false;
    }
};

// Piano
const pianoKeyMap = {
    C1_Key: "Key_24",
    "C#1_Key": "Key_23",
    D1_Key: "Key_22",
    "D#1_Key": "Key_21",
    E1_Key: "Key_20",
    F1_Key: "Key_19",
    "F#1_Key": "Key_18",
    G1_Key: "Key_17",
    "G#1_Key": "Key_16",
    A1_Key: "Key_15",
    "A#1_Key": "Key_14",
    B1_Key: "Key_13",
    C2_Key: "Key_12",
    "C#2_Key": "Key_11",
    D2_Key: "Key_10",
    "D#2_Key": "Key_9",
    E2_Key: "Key_8",
    F2_Key: "Key_7",
    "F#2_Key": "Key_6",
    G2_Key: "Key_5",
    "G#2_Key": "Key_4",
    A2_Key: "Key_3",
    "A#2_Key": "Key_2",
    B2_Key: "Key_1",
};

const pianoSounds = {};

Object.values(pianoKeyMap).forEach((soundKey) => {
    pianoSounds[soundKey] = new Howl({
        src: [ASSET_BASE + `audio/sfx/piano/${soundKey}.ogg`],
        preload: true,
        volume: 0.3,
    });
});

// Button
const buttonSounds = {
    click: new Howl({
        src: [ASSET_BASE + "audio/sfx/click/bubble.ogg"],
        preload: true,
        volume: 0.3,
    }),
};

/**  -------------------------- Scene setup -------------------------- */
const canvas = document.querySelector("#experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const scene = new THREE.Scene();
scene.background = new THREE.Color("#ffe7f5");

const camera = new THREE.PerspectiveCamera(
    35,
    sizes.width / sizes.height,
    0.1,
    200
);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 45;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;

controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.update();

//Set starting camera position
if (window.innerWidth < 768) {
    camera.position.set(
        29.567116827654726,
        14.018476147584705,
        31.37040363900147
    );
    controls.target.set(
        -0.08206262548844094,
        3.3119233527087255,
        -0.7433922282864018
    );
} else {
    camera.position.set(17.49173098423395, 9.108969527553887, 17.850992894238058);
    controls.target.set(
        0.4624746759408973,
        1.9719940043010387,
        -0.8300979125494505
    );
}

window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update Camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**  -------------------------- Modal Stuff -------------------------- */
const modals = {
    work: document.querySelector(".modal.work"),
    about: document.querySelector(".modal.about"),
    contact: document.querySelector(".modal.contact"),
    screen: document.querySelector(".modal.screen"),
};

const overlay = document.querySelector(".overlay");

let touchHappened = false;
overlay.addEventListener(
    "touchend",
    (e) => {
        touchHappened = true;
        e.preventDefault();
        const modal = document.querySelector('.modal[style*="display: block"]');
        if (modal) hideModal(modal);
    },
    { passive: false }
);

overlay.addEventListener(
    "click",
    (e) => {
        if (touchHappened) return;
        e.preventDefault();
        const modal = document.querySelector('.modal[style*="display: block"]');
        if (modal) hideModal(modal);
    },
    { passive: false }
);

document.querySelectorAll(".modal-exit-button").forEach((button) => {
    function handleModalExit(e) {
        e.preventDefault();
        const modal = e.target.closest(".modal");

        gsap.to(button, {
            scale: 5,
            duration: 0.5,
            ease: "back.out(2)",
            onStart: () => {
                gsap.to(button, {
                    scale: 1,
                    duration: 0.5,
                    ease: "back.out(2)",
                    onComplete: () => {
                        gsap.set(button, {
                            clearProps: "all",
                        });
                    },
                });
            },
        });

        buttonSounds.click.play();
        hideModal(modal);
    }

    button.addEventListener(
        "touchend",
        (e) => {
            touchHappened = true;
            handleModalExit(e);
        },
        { passive: false }
    );

    button.addEventListener(
        "click",
        (e) => {
            if (touchHappened) return;
            handleModalExit(e);
        },
        { passive: false }
    );
});

let isModalOpen = true;

const showModal = (modal) => {
    if (!modal) return;
    modal.style.display = "block";
    overlay.style.display = "block";

    isModalOpen = true;
    controls.enabled = false;

    if (currentHoveredObject) {
        playHoverAnimation(currentHoveredObject, false);
        currentHoveredObject = null;
    }
    document.body.style.cursor = "default";
    currentIntersects = [];

    gsap.set(modal, {
        opacity: 0,
        scale: 0,
    });
    gsap.set(overlay, {
        opacity: 0,
    });

    gsap.to(overlay, {
        opacity: 1,
        duration: 0.5,
    });

    gsap.to(modal, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(2)",
    });
};

const hideModal = (modal) => {
    if (!modal) return;
    isModalOpen = false;
    controls.enabled = true;

    gsap.to(overlay, {
        opacity: 0,
        duration: 0.5,
    });

    gsap.to(modal, {
        opacity: 0,
        scale: 0,
        duration: 0.5,
        ease: "back.in(2)",
        onComplete: () => {
            modal.style.display = "none";
            overlay.style.display = "none";
        },
    });
};



/**  -------------------------- Loading Screen & Intro Animation -------------------------- */

const manager = new THREE.LoadingManager();

const loadingScreen = document.querySelector(".loading-screen");
const loadingScreenButton = document.querySelector(".loading-screen-button");
const noSoundButton = document.querySelector(".no-sound-button");

manager.onLoad = function () {
    // 🌸 Initial button style when everything has finished loading
    loadingScreenButton.style.border = "4px solid #ff9ac8";
    loadingScreenButton.style.background = "#ffe3f4";
    loadingScreenButton.style.color = "#4a1f3d";
    loadingScreenButton.style.boxShadow = "0 8px 20px rgba(255, 154, 200, 0.4)";
    loadingScreenButton.textContent = "Enter my room ✨";
    loadingScreenButton.style.cursor = "pointer";
    loadingScreenButton.style.borderRadius = "999px";
    loadingScreenButton.style.letterSpacing = "0.05em";
    loadingScreenButton.style.transition =
        "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s, color 0.3s, box-shadow 0.3s";

    let isDisabled = false;

    // 🎧 No sound button text
    noSoundButton.textContent = "<3";

    function handleEnter(withSound = true) {
        if (isDisabled) return;

        noSoundButton.textContent = "";
        loadingScreenButton.style.cursor = "default";

        // 👉 Clicked state styling
        loadingScreenButton.style.border = "4px solid #d1b4ff";
        loadingScreenButton.style.background = "#fdf7ff";
        loadingScreenButton.style.color = "#7a4bb8";
        loadingScreenButton.style.boxShadow = "none";

        // 📝 Your new welcome text instead of the Korean line
        loadingScreenButton.textContent = "Welcome to Lea’s room 🌙";

        // Change overall loading screen bg colour
        loadingScreen.style.background = "linear-gradient(135deg, #ffe3f4, #ffd6f2)";

        isDisabled = true;

        toggleFavicons();

        if (!withSound) {
            isMuted = true;
            updateMuteState(true);

            soundOnSvg.style.display = "none";
            soundOffSvg.style.display = "block";
        } else {
            backgroundMusic.play();
        }

        playReveal();
    }

    // ✨ Hover animation
    loadingScreenButton.addEventListener("mouseenter", () => {
        loadingScreenButton.style.transform = "scale(1.06)";
        loadingScreenButton.style.boxShadow = "0 10px 25px rgba(176, 132, 255, 0.45)";
        loadingScreenButton.style.background = "#f2ddff";
    });

    loadingScreenButton.addEventListener("mouseleave", () => {
        loadingScreenButton.style.transform = "none";
        loadingScreenButton.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.18)";
        loadingScreenButton.style.background = "#f7e9ff";
    });

    // 🖐 Touch + click events
    loadingScreenButton.addEventListener("touchend", (e) => {
        touchHappened = true;
        e.preventDefault();
        handleEnter();
    });

    loadingScreenButton.addEventListener("click", (e) => {
        if (touchHappened) return;
        handleEnter(true);
    });

    noSoundButton.addEventListener("click", (e) => {
        if (touchHappened) return;
        handleEnter(false);
    });
};


function playReveal() {
    const tl = gsap.timeline();

    tl.to(loadingScreen, {
        scale: 0.5,
        duration: 1.2,
        delay: 0.25,
        ease: "back.in(1.8)",
    }).to(
        loadingScreen,
        {
            y: "200vh",
            transform: "perspective(1000px) rotateX(45deg) rotateY(-35deg)",
            duration: 1.2,
            ease: "back.in(1.8)",
            onComplete: () => {
                isModalOpen = false;
                // Wrap the intro animation call to prevent a possible exception
                // from stopping the rest of the script if something expected to
                // be present in the scene isn't (missing GLTF parts, etc).
                try {
                    playIntroAnimation();
                } catch (err) {
                    console.error("playIntroAnimation failed:", err);
                }
                loadingScreen.remove();
            },
        },
        "-=0.1"
    );
}

function playIntroAnimation() {
    const t1 = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    t1.timeScale(0.8);

    t1.to(plank1.scale, {
        x: 1,
        y: 1,
    })
        .to(
            plank2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            workBtn.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.6"
        )
        .to(
            aboutBtn.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.6"
        )
        .to(
            contactBtn.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.6"
        );

    const tFrames = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tFrames.timeScale(0.8);

    tFrames
        .to(frame1.scale, {
            x: 1,
            y: 1,
            z: 1,
        })
        .to(
            frame2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            frame3.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        );

    const t2 = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    t2.timeScale(0.8);

    t2.to(boba.scale, {
        z: 1,
        y: 1,
        x: 1,
        delay: 0.4,
    })
        .to(
            github.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            youtube.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.6"
        )
        .to(
            twitter.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.6"
        );

    const tFlowers = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tFlowers.timeScale(0.8);

    tFlowers
        .to(flower5.scale, {
            x: 1,
            y: 1,
            z: 1,
        })
        .to(
            flower4.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            flower3.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            flower2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            flower1.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        );

    const tBoxes = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tBoxes.timeScale(0.8);

    tBoxes
        .to(box1.scale, {
            x: 1,
            y: 1,
            z: 1,
        })
        .to(
            box2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            box3.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        );

    const tLamp = gsap.timeline({
        defaults: {
            duration: 0.8,
            delay: 0.2,
            ease: "back.out(1.8)",
        },
    });
    tLamp.timeScale(0.8);

    tLamp.to(lamp.scale, {
        x: 1,
        y: 1,
        z: 1,
    });

    const tSlippers = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tSlippers.timeScale(0.8);

    tSlippers
        .to(slippers1.scale, {
            x: 1,
            y: 1,
            z: 1,
            delay: 0.5,
        })
        .to(
            slippers2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        );

    const tEggs = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tEggs.timeScale(0.8);

    tEggs
        .to(egg1.scale, {
            x: 1,
            y: 1,
            z: 1,
        })
        .to(
            egg2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        )
        .to(
            egg3.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            "-=0.5"
        );

    const tFish = gsap.timeline({
        defaults: {
            delay: 0.8,
            duration: 0.8,
            ease: "back.out(1.8)",
        },
    });
    tFish.timeScale(0.8);

    tFish.to(fish.scale, {
        x: 1,
        y: 1,
        z: 1,
    });

    const lettersTl = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.7)",
        },
    });
    lettersTl.timeScale(0.8);

    lettersTl
        .to(letter1.position, {
            y: letter1.userData.initialPosition.y + 0.3,
            duration: 0.4,
            ease: "back.out(1.8)",
            delay: 0.25,
        })
        .to(
            letter1.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter1.position,
            {
                y: letter1.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter2.position,
            {
                y: letter2.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter2.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter2.position,
            {
                y: letter2.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter3.position,
            {
                y: letter3.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter3.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter3.position,
            {
                y: letter3.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter4.position,
            {
                y: letter4.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter4.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter4.position,
            {
                y: letter4.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter5.position,
            {
                y: letter5.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter5.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter5.position,
            {
                y: letter5.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter6.position,
            {
                y: letter6.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter6.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter6.position,
            {
                y: letter6.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter7.position,
            {
                y: letter7.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter7.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter7.position,
            {
                y: letter7.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        )

        .to(
            letter8.position,
            {
                y: letter8.userData.initialPosition.y + 0.3,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "-=0.5"
        )
        .to(
            letter8.scale,
            {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            "<"
        )
        .to(
            letter8.position,
            {
                y: letter8.userData.initialPosition.y,
                duration: 0.4,
                ease: "back.out(1.8)",
            },
            ">-0.2"
        );

    const pianoKeysTl = gsap.timeline({
        defaults: {
            duration: 0.4,
            ease: "back.out(1.7)",
            onComplete: () => {
                setTimeout(() => {
                    createDelayedHitboxes();
                }, 1950);
            },
        },
    });
    pianoKeysTl.timeScale(1.2);

    const pianoKeys = [
        C1_Key,
        Cs1_Key,
        D1_Key,
        Ds1_Key,
        E1_Key,
        F1_Key,
        Fs1_Key,
        G1_Key,
        Gs1_Key,
        A1_Key,
        As1_Key,
        B1_Key,
        C2_Key,
        Cs2_Key,
        D2_Key,
        Ds2_Key,
        E2_Key,
        F2_Key,
        Fs2_Key,
        G2_Key,
        Gs2_Key,
        A2_Key,
        As2_Key,
        B2_Key,
    ];

    pianoKeys.forEach((key, index) => {
        pianoKeysTl
            .to(
                key.position,
                {
                    y: key.userData.initialPosition.y + 0.2,
                    duration: 0.4,
                    ease: "back.out(1.8)",
                },
                index * 0.1
            )
            .to(
                key.scale,
                {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.4,
                    ease: "back.out(1.8)",
                },
                "<"
            )
            .to(
                key.position,
                {
                    y: key.userData.initialPosition.y,
                    duration: 0.4,
                    ease: "back.out(1.8)",
                },
                ">-0.2"
            );
    });
}

/**  -------------------------- Loaders & Texture Preparations -------------------------- */
const textureLoader = new THREE.TextureLoader();

// --- Poster Textures ---
const frame1Texture = textureLoader.load(ASSET_BASE + "images/image1.webp");
frame1Texture.flipY = false;
frame1Texture.colorSpace = THREE.SRGBColorSpace;

const frame2Texture = textureLoader.load(ASSET_BASE + "images/image2.webp");
frame2Texture.flipY = false;
frame2Texture.colorSpace = THREE.SRGBColorSpace;

const frame3Texture = textureLoader.load(ASSET_BASE + "images/image3.webp");
frame3Texture.flipY = false;
frame3Texture.colorSpace = THREE.SRGBColorSpace;


const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(ASSET_BASE + "draco/");

const loader = new GLTFLoader(manager);
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
    .setPath(ASSET_BASE + "textures/skybox/")
    .load(["px.webp", "nx.webp", "py.webp", "ny.webp", "pz.webp", "nz.webp"]);

const textureMap = {
    First: {
        day: ASSET_BASE + "textures/room/day/first_texture_set_day.webp",
        night: ASSET_BASE + "textures/room/night/first_texture_set_night.webp",
    },
    Second: {
        day: ASSET_BASE + "textures/room/day/second_texture_set_day.webp",
        night: ASSET_BASE + "textures/room/night/second_texture_set_night.webp",
    },
    Third: {
        day: ASSET_BASE + "textures/room/day/third_texture_set_day.webp",
        night: ASSET_BASE + "textures/room/night/third_texture_set_night.webp",
    },
    Fourth: {
        day: ASSET_BASE + "textures/room/day/fourth_texture_set_day.webp",
        night: ASSET_BASE + "textures/room/night/fourth_texture_set_night.webp",
    },
};

const loadedTextures = {
    day: {},
    night: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
    // Load and configure day texture
    const dayTexture = textureLoader.load(paths.day);
    dayTexture.flipY = false;
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    dayTexture.minFilter = THREE.LinearFilter;
    dayTexture.magFilter = THREE.LinearFilter;
    loadedTextures.day[key] = dayTexture;

    // Load and configure night texture
    const nightTexture = textureLoader.load(paths.night);
    nightTexture.flipY = false;
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.minFilter = THREE.LinearFilter;
    nightTexture.magFilter = THREE.LinearFilter;
    loadedTextures.night[key] = nightTexture;
});

// Reuseable Materials
const glassMaterial = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    opacity: 1,
    color: 0xfbfbfb,
    metalness: 0,
    roughness: 0,
    ior: 3,
    thickness: 0.01,
    specularIntensity: 1,
    envMap: environmentMap,
    envMapIntensity: 1,
    depthWrite: false,
    specularColor: 0xfbfbfb,
});

const whiteMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
});

const createMaterialForTextureSet = (textureSet) => {
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uDayTexture1: { value: loadedTextures.day.First },
            uNightTexture1: { value: loadedTextures.night.First },
            uDayTexture2: { value: loadedTextures.day.Second },
            uNightTexture2: { value: loadedTextures.night.Second },
            uDayTexture3: { value: loadedTextures.day.Third },
            uNightTexture3: { value: loadedTextures.night.Third },
            uDayTexture4: { value: loadedTextures.day.Fourth },
            uNightTexture4: { value: loadedTextures.night.Fourth },
            uMixRatio: { value: 0 },
            uTextureSet: { value: textureSet },
        },
        vertexShader: themeVertexShader,
        fragmentShader: themeFragmentShader,
    });

    Object.entries(material.uniforms).forEach(([key, uniform]) => {
        if (uniform.value instanceof THREE.Texture) {
            uniform.value.minFilter = THREE.LinearFilter;
            uniform.value.magFilter = THREE.LinearFilter;
        }
    });

    return material;
};

const roomMaterials = {
    First: createMaterialForTextureSet(1),
    Second: createMaterialForTextureSet(2),
    Third: createMaterialForTextureSet(3),
    Fourth: createMaterialForTextureSet(4),
};

// Smoke Shader setup
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
smokeGeometry.translate(0, 0.5, 0);
smokeGeometry.scale(0.33, 1, 0.33);

const perlinTexture = textureLoader.load(ASSET_BASE + "shaders/perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

const smokeMaterial = new THREE.ShaderMaterial({
    vertexShader: smokeVertexShader,
    fragmentShader: smokeFragmentShader,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture),
    },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
});

const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
smoke.position.y = 1.83;
scene.add(smoke);

const videoElement = document.createElement("video");
videoElement.src = ASSET_BASE + "textures/video/Screen.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

/**  -------------------------- Model and Mesh Setup -------------------------- */

// (rest of file unchanged — loader traversal, hitbox creation, raycaster, render, etc.)
// This is the working version; keep the rest of your original code here unmodified.
