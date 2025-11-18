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

let aboutIntroTyped = false;
const ABOUT_INTRO_TEXT =
    "VR & game developer crafting cozy, immersive spaces you can step into.";


const ASSET_BASE = import.meta.env.BASE_URL;

// ✅ ADD THIS RIGHT HERE:
const manager = new THREE.LoadingManager();


/**  -------------------------- Audio setup -------------------------- */

// Background Music
let pianoDebounceTimer = null;
let isMusicFaded = false;
const MUSIC_FADE_TIME = 500;
const PIANO_TIMEOUT = 2000;
const BACKGROUND_MUSIC_VOLUME = 0.3;
const FADED_VOLUME = 0;

const backgroundMusic = new Howl({
  src: ["/audio/music/Lofi.ogg"],
  loop: true,
  volume: 0.3,
});

const fadeOutBackgroundMusic = () => {
  if (!isMuted && !isMusicFaded) {
    backgroundMusic.fade(
      backgroundMusic.volume(),
      FADED_VOLUME,
      MUSIC_FADE_TIME
    );
    isMusicFaded = true;
  }
};

const fadeInBackgroundMusic = () => {
  if (!isMuted && isMusicFaded) {
    backgroundMusic.fade(
      FADED_VOLUME,
      BACKGROUND_MUSIC_VOLUME,
      MUSIC_FADE_TIME
    );
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
    src: [`/audio/sfx/piano/${soundKey}.ogg`],
    preload: true,
    volume: 0.3,
  });
});

// Button
const buttonSounds = {
  click: new Howl({
    src: ["/audio/sfx/click/bubble.ogg"],
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

    if (modal.classList.contains("about")) {
        document.body.classList.add("about-open");

        // 📝 Trigger typewriter only once
        if (!aboutIntroTyped) {
            const typedEl = modal.querySelector(".about-typed-line");
            if (typedEl) {
                aboutIntroTyped = true;
                typeAboutIntro(typedEl);
            }
        }
    }
};




const hideModal = (modal) => {
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

            // 🌸 Remove special background when About closes
            if (modal.classList.contains("about")) {
                document.body.classList.remove("about-open");
            }
        },
    });
};




// -------------------------- ABOUT INTRO TYPEWRITER -------------------------- //
function typeAboutIntro(targetEl) {
    targetEl.textContent = "";
    const chars = ABOUT_INTRO_TEXT.split("");
    let index = 0;

    const step = () => {
        if (index > chars.length) return;
        targetEl.textContent = chars.slice(0, index).join("");
        index++;

        // cute variable speed
        const delay = gsap.utils.random(25, 55);
        setTimeout(step, delay);
    };

    step();
}


// -------------------------- About modal tabs -------------------------- //
const aboutTabButtons = document.querySelectorAll(".about-tab-button");
const aboutTabContents = document.querySelectorAll(".about-tab-content");

if (aboutTabButtons.length && aboutTabContents.length) {
    aboutTabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-tab");

            // little press animation
            gsap.fromTo(
                button,
                { scale: 0.96 },
                { scale: 1, duration: 0.15, ease: "power2.out" }
            );

            // update active button
            aboutTabButtons.forEach((btn) => btn.classList.remove("is-active"));
            button.classList.add("is-active");

            // update visible content
            aboutTabContents.forEach((section) => {
                if (section.id === targetId) {
                    section.classList.add("is-active");
                } else {
                    section.classList.remove("is-active");
                }
            });
        });
    });
}

// -------------------------- ABOUT PERSONA SWITCH -------------------------- //
const personaButtons = document.querySelectorAll(".persona-btn");
const personaTextEl = document.querySelector(".persona-text");

if (personaButtons.length && personaTextEl) {
    const personaCopy = {
        dev: `As a developer, I love solving interaction problems — especially in VR. Things like “how should this feel in someone’s hands?” or “what feedback tells the player they did the right thing?” are the kind of questions I enjoy turning into code.`,
        creator: `As a creator, I’m obsessed with mood, pacing, and the little details people don’t always notice at first — sounds, particles, camera framing, tiny story hints that make a space feel lived-in and emotionally grounded.`,
        gamer: `As a gamer-at-heart, I think a lot about how it feels to be on the other side of the screen. I love designing experiences that pull people in the same way my favourite games, films, and stories pull me in.`,
    };

    personaButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-persona");

            // update active button state
            personaButtons.forEach((b) => b.classList.remove("is-active"));
            btn.classList.add("is-active");

            // small click animation
            gsap.fromTo(
                btn,
                { scale: 0.94 },
                { scale: 1, duration: 0.15, ease: "power2.out" }
            );

            // fade text out, swap, fade in
            if (key && personaCopy[key]) {
                gsap.to(personaTextEl, {
                    opacity: 0,
                    y: 4,
                    duration: 0.15,
                    onComplete: () => {
                        personaTextEl.textContent = personaCopy[key];
                        gsap.to(personaTextEl, {
                            opacity: 1,
                            y: 0,
                            duration: 0.2,
                            ease: "power2.out",
                        });
                    },
                });
            }
        });
    });
}


// -------------------------- ABOUT SKILL HOVER COLORS -------------------------- //
const aboutModalEl = document.querySelector(".about.modal");
const aboutChips = document.querySelectorAll(".about-chip");

if (aboutModalEl && aboutChips.length) {
    const defaultAboutBg = window.getComputedStyle(aboutModalEl).backgroundColor;

    aboutChips.forEach((chip) => {
        chip.addEventListener("mouseenter", () => {
            const color = chip.getAttribute("data-color");
            if (!color) return;

            // cancel any previous background tweens before starting a new one
            gsap.to(aboutModalEl, {
                backgroundColor: color,
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto",
            });
        });

        chip.addEventListener("mouseleave", () => {
            gsap.to(aboutModalEl, {
                backgroundColor: defaultAboutBg,
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto",
            });
        });
    });
}

// -------------------------- ABOUT FUN FACT HOVERS -------------------------- //
const funfactChips = document.querySelectorAll(".funfact-chip");
const funfactText = document.querySelector(".funfact-text");

if (funfactChips.length && funfactText) {
    const defaultFact = funfactText.textContent;

    funfactChips.forEach((chip) => {
        chip.addEventListener("mouseenter", () => {
            const fact = chip.getAttribute("data-fact");
            if (!fact) return;

            gsap.to(funfactText, {
                opacity: 0,
                y: 3,
                duration: 0.15,
                onComplete: () => {
                    funfactText.textContent = fact;
                    gsap.to(funfactText, {
                        opacity: 1,
                        y: 0,
                        duration: 0.2,
                        ease: "power2.out",
                    });
                },
            });
        });

        chip.addEventListener("mouseleave", () => {
            gsap.to(funfactText, {
                opacity: 0,
                y: 3,
                duration: 0.15,
                onComplete: () => {
                    funfactText.textContent = defaultFact;
                    gsap.to(funfactText, {
                        opacity: 1,
                        y: 0,
                        duration: 0.2,
                        ease: "power2.out",
                    });
                },
            });
        });
    });
}


// -------------------------- About image parallax -------------------------- //
const aboutModal = document.querySelector(".about.modal");
const aboutImage = aboutModal?.querySelector(".base-image");

if (aboutModal && aboutImage) {
    aboutModal.addEventListener("mousemove", (event) => {
        const rect = aboutModal.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

        gsap.to(aboutImage, {
            rotationY: x * 6, // left/right tilt
            rotationX: -y * 6, // up/down tilt
            x: x * 10, // small slide
            y: y * 10,
            transformPerspective: 600,
            transformOrigin: "center center",
            duration: 0.3,
            ease: "power2.out",
        });
    });

    aboutModal.addEventListener("mouseleave", () => {
        gsap.to(aboutImage, {
            rotationX: 0,
            rotationY: 0,
            x: 0,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
        });
    });
}

// -------------------------- ABOUT CUSTOM CURSOR -------------------------- //
const aboutModalForCursor = document.querySelector(".about.modal");
const aboutCursor = document.querySelector(".about-cursor");

if (aboutModalForCursor && aboutCursor) {
    aboutModalForCursor.addEventListener("mousemove", (event) => {
        gsap.to(aboutCursor, {
            x: event.clientX,
            y: event.clientY,
            duration: 0.12,
            ease: "power2.out",
            overwrite: "auto",
        });
    });

    aboutModalForCursor.addEventListener("mouseleave", () => {
        gsap.to(aboutCursor, {
            opacity: 0,
            duration: 0.18,
            ease: "power2.out",
        });
    });
}


// -------------------------- ABOUT SCROLL PROGRESS -------------------------- //
const aboutScrollWrapper = document.querySelector(
    ".about.modal .modal-content-wrapper"
);
const aboutScrollBar = document.querySelector(".about-scroll-bar");

if (aboutScrollWrapper && aboutScrollBar) {
    const updateAboutScroll = () => {
        const maxScroll =
            aboutScrollWrapper.scrollHeight - aboutScrollWrapper.clientHeight;
        const progress = maxScroll > 0 ? aboutScrollWrapper.scrollTop / maxScroll : 0;

        gsap.to(aboutScrollBar, {
            width: `${progress * 100}%`,
            duration: 0.2,
            ease: "power2.out",
            overwrite: "auto",
        });
    };

    aboutScrollWrapper.addEventListener("scroll", updateAboutScroll);
    // set initial state
    updateAboutScroll();
}

// -------------------------- ABOUT VIBE & THEME DICE -------------------------- //
const vibeButton = document.querySelector(".vibe-button");
const vibeLine = document.querySelector(".vibe-line");
const themeDiceButton = document.querySelector(".vibe-theme-button");
const themeLine = document.querySelector(".vibe-theme-line");
const aboutModalRoot = document.querySelector(".about.modal");
const overlayEl = document.querySelector(".overlay");

if (vibeButton && vibeLine && aboutModalRoot) {
    const vibeSentences = [
        "polishing tiny interactions and overthinking particles.",
        "turning VR training into something that feels like a game.",
        "tweaking hand interactions until they finally feel natural.",
        "daydreaming about cozy balcony gardens and liminal rooms.",
        "balancing C# scripts with way too many Notion pages.",
        "saving reference screenshots ‘for later’… again.",
        "testing physics by throwing things around in play mode.",
        "adding one more sound effect because it needs more juice.",
        "connecting tiny story beats to simple interactions.",
        "imagining how a stranger will feel the first time they load this scene.",
        "giving UI elements personalities and moods in my head.",
        "rewatching favourite scenes just to study pacing and framing.",
    ];

    function runVibeVisualEffect() {
        const effects = [];

        // 1) jelly wobble of the about window
        effects.push(() => {
            gsap.fromTo(
                aboutModalRoot,
                { x: 0, y: 0, rotation: 0 },
                {
                    x: gsap.utils.random(-5, 5),
                    y: gsap.utils.random(-3, 3),
                    rotation: gsap.utils.random(-1.5, 1.5),
                    duration: 0.08,
                    repeat: 6,
                    yoyo: true,
                    ease: "power1.inOut",
                }
            );
        });

        // 2) soft glow pulse around the modal
        effects.push(() => {
            const originalBoxShadow = window.getComputedStyle(
                aboutModalRoot
            ).boxShadow;
            gsap.to(aboutModalRoot, {
                boxShadow: "0 0 40px rgba(255,214,236,0.95)",
                duration: 0.25,
                yoyo: true,
                repeat: 1,
                ease: "power2.out",
                onComplete: () => {
                    aboutModalRoot.style.boxShadow = originalBoxShadow;
                },
            });
        });

        // 3) vignette pulse using the overlay
        if (overlayEl) {
            effects.push(() => {
                const originalBg = window.getComputedStyle(
                    overlayEl
                ).backgroundColor;
                gsap.fromTo(
                    overlayEl,
                    { backgroundColor: "rgba(0,0,0,0.25)" },
                    {
                        backgroundColor: "rgba(0,0,0,0.55)",
                        duration: 0.2,
                        yoyo: true,
                        repeat: 1,
                        ease: "power1.inOut",
                        onComplete: () => {
                            overlayEl.style.backgroundColor = originalBg;
                        },
                    }
                );
            });
        }

        // 4) XP +5 floating badge
        effects.push(() => {
            const badge = document.createElement("div");
            badge.textContent = "XP +5";
            badge.style.position = "fixed";
            badge.style.top = "16%";
            badge.style.right = "14%";
            badge.style.zIndex = "10001";
            badge.style.padding = "6px 14px";
            badge.style.borderRadius = "999px";
            badge.style.background =
                "linear-gradient(135deg, #ffd6ec, #e4d6ff)";
            badge.style.color = "#3b1c52";
            badge.style.fontFamily =
                "Motley Forces, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
            badge.style.fontSize = "14px";
            badge.style.boxShadow = "0 8px 20px rgba(0,0,0,0.25)";
            badge.style.pointerEvents = "none";
            badge.style.opacity = "0";
            badge.style.transform = "translateY(8px)";

            document.body.appendChild(badge);

            gsap.to(badge, {
                opacity: 1,
                y: -4,
                duration: 0.25,
                ease: "power2.out",
            });

            gsap.to(badge, {
                opacity: 0,
                y: -24,
                duration: 0.45,
                delay: 0.9,
                ease: "power2.in",
                onComplete: () => badge.remove(),
            });
        });

        // 5) quick cinematic bars
        effects.push(() => {
            const topBar = document.createElement("div");
            const bottomBar = document.createElement("div");
            [topBar, bottomBar].forEach((bar) => {
                bar.style.position = "fixed";
                bar.style.left = "0";
                bar.style.width = "100vw";
                bar.style.height = "10vh";
                bar.style.background = "rgba(0,0,0,0.9)";
                bar.style.zIndex = "10000";
                bar.style.pointerEvents = "none";
            });
            topBar.style.top = "-10vh";
            bottomBar.style.bottom = "-10vh";

            document.body.appendChild(topBar);
            document.body.appendChild(bottomBar);

            gsap.to(topBar, {
                top: "0",
                duration: 0.25,
                ease: "power2.out",
            });
            gsap.to(bottomBar, {
                bottom: "0",
                duration: 0.25,
                ease: "power2.out",
            });

            gsap.to([topBar, bottomBar], {
                opacity: 0,
                duration: 0.4,
                delay: 1,
                ease: "power2.in",
                onComplete: () => {
                    topBar.remove();
                    bottomBar.remove();
                },
            });
        });

        if (!effects.length) return;
        const effect = effects[Math.floor(Math.random() * effects.length)];
        if (typeof effect === "function") effect();
    }

    vibeButton.addEventListener("click", () => {
        const current = vibeLine.textContent || "";
        let next = current;
        let safety = 0;

        while (next === current && safety < 25) {
            const choice =
                vibeSentences[Math.floor(Math.random() * vibeSentences.length)];
            next = "Currently: " + choice;
            safety++;
        }

        gsap.fromTo(
            vibeButton,
            { scale: 0.95 },
            { scale: 1, duration: 0.18, ease: "power2.out" }
        );

        gsap.to(vibeLine, {
            opacity: 0,
            y: 4,
            duration: 0.15,
            onComplete: () => {
                vibeLine.textContent = next;
                gsap.to(vibeLine, {
                    opacity: 1,
                    y: 0,
                    duration: 0.22,
                    ease: "power2.out",
                });
            },
        });

        runVibeVisualEffect();
    });
}

if (themeDiceButton && themeLine && aboutModalRoot) {
    const themeRolls = [
        {
            id: "fantasy",
            label: "Fantasy",
            text: "Fantasy: violet fire vibes, quiet magic, and little runes hidden in the details.",
        },
        {
            id: "aesthetic",
            label: "Aesthetic",
            text: "Aesthetic: soft gradients, cozy light, clean UI and tiny sparkles of chaos.",
        },
        {
            id: "developer",
            label: "Developer",
            text: "Developer: build logs, debug cubes, refactors, and ‘what if we tried this?’ energy.",
        },
        {
            id: "story",
            label: "Story / Immersion",
            text: "Story / Immersion: pacing, atmosphere, subtle sound cues and feelings-first design.",
        },
        {
            id: "gamer",
            label: "Gamer",
            text: "Gamer: XP popups, loot energy, little secrets and ‘one more run’ vibes.",
        },
    ];

    function runThemeEffect(themeId) {
        if (!aboutModalRoot) return;

        if (themeId === "fantasy") {
            // glowing magic ring in the center
            const ring = document.createElement("div");
            ring.style.position = "fixed";
            ring.style.left = "50%";
            ring.style.top = "50%";
            ring.style.transform = "translate(-50%, -50%)";
            ring.style.width = "260px";
            ring.style.height = "260px";
            ring.style.borderRadius = "999px";
            ring.style.border = "2px solid rgba(186, 140, 255, 0.9)";
            ring.style.boxShadow =
                "0 0 30px rgba(173, 127, 255, 0.9), 0 0 60px rgba(120, 88, 200, 0.8)";
            ring.style.zIndex = "10001";
            ring.style.pointerEvents = "none";
            ring.style.opacity = "0";

            document.body.appendChild(ring);

            gsap.to(ring, {
                opacity: 1,
                duration: 0.25,
                ease: "power2.out",
            });
            gsap.to(ring, {
                opacity: 0,
                scale: 1.06,
                duration: 0.7,
                delay: 0.6,
                ease: "power2.inOut",
                onComplete: () => ring.remove(),
            });
        } else if (themeId === "aesthetic") {
            // pastel gradient flash on the about window
            const originalBg = window.getComputedStyle(
                aboutModalRoot
            ).backgroundImage;
            gsap.to(aboutModalRoot, {
                backgroundImage:
                    "linear-gradient(135deg, rgba(255,214,236,0.95), rgba(228,214,255,0.98))",
                duration: 0.3,
                ease: "power2.out",
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    aboutModalRoot.style.backgroundImage = originalBg;
                },
            });
        } else if (themeId === "developer") {
            // dev console toast
            const toast = document.createElement("div");
            toast.textContent = "build succeeded: 0 errors, 3 warnings (all vibes)";
            toast.style.position = "fixed";
            toast.style.top = "18px";
            toast.style.left = "50%";
            toast.style.transform = "translateX(-50%)";
            toast.style.padding = "8px 16px";
            toast.style.borderRadius = "8px";
            toast.style.background = "#111827ee";
            toast.style.color = "#e5e7eb";
            toast.style.fontFamily =
                "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
            toast.style.fontSize = "13px";
            toast.style.zIndex = "10002";
            toast.style.opacity = "0";

            document.body.appendChild(toast);

            gsap.to(toast, {
                opacity: 1,
                y: 4,
                duration: 0.2,
                ease: "power2.out",
            });
            gsap.to(toast, {
                opacity: 0,
                y: -4,
                duration: 0.35,
                delay: 1.3,
                ease: "power2.in",
                onComplete: () => toast.remove(),
            });
        } else if (themeId === "story") {
            // cinematic black bars (storytelling / immersion)
            const topBar = document.createElement("div");
            const bottomBar = document.createElement("div");
            [topBar, bottomBar].forEach((bar) => {
                bar.style.position = "fixed";
                bar.style.left = "0";
                bar.style.width = "100vw";
                bar.style.height = "14vh";
                bar.style.background = "rgba(0,0,0,0.95)";
                bar.style.zIndex = "10000";
                bar.style.pointerEvents = "none";
            });
            topBar.style.top = "-14vh";
            bottomBar.style.bottom = "-14vh";

            document.body.appendChild(topBar);
            document.body.appendChild(bottomBar);

            gsap.to(topBar, {
                top: "0",
                duration: 0.28,
                ease: "power2.out",
            });
            gsap.to(bottomBar, {
                bottom: "0",
                duration: 0.28,
                ease: "power2.out",
            });

            gsap.to([topBar, bottomBar], {
                opacity: 0,
                duration: 0.4,
                delay: 1.1,
                ease: "power2.in",
                onComplete: () => {
                    topBar.remove();
                    bottomBar.remove();
                },
            });
        } else if (themeId === "gamer") {
            // gamer-style level up popup
            const popup = document.createElement("div");
            popup.textContent = "LEVEL UP: Immersive Dev +1";
            popup.style.position = "fixed";
            popup.style.bottom = "13%";
            popup.style.left = "50%";
            popup.style.transform = "translateX(-50%)";
            popup.style.padding = "10px 18px";
            popup.style.borderRadius = "999px";
            popup.style.background =
                "linear-gradient(135deg, #22c55e, #4ade80)";
            popup.style.color = "#022c22";
            popup.style.fontFamily =
                "Motley Forces, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
            popup.style.fontSize = "15px";
            popup.style.zIndex = "10002";
            popup.style.opacity = "0";
            popup.style.boxShadow = "0 10px 22px rgba(0,0,0,0.35)";

            document.body.appendChild(popup);

            gsap.to(popup, {
                opacity: 1,
                y: -4,
                duration: 0.22,
                ease: "power2.out",
            });
            gsap.to(popup, {
                opacity: 0,
                y: -26,
                duration: 0.4,
                delay: 1.1,
                ease: "power2.in",
                onComplete: () => popup.remove(),
            });
        }
    }

    themeDiceButton.addEventListener("click", () => {
        const choice =
            themeRolls[Math.floor(Math.random() * themeRolls.length)];

        gsap.fromTo(
            themeDiceButton,
            { scale: 0.95 },
            { scale: 1, duration: 0.18, ease: "power2.out" }
        );

        gsap.to(themeLine, {
            opacity: 0,
            y: 3,
            duration: 0.14,
            onComplete: () => {
                themeLine.textContent = `Theme: ${choice.text}`;
                gsap.to(themeLine, {
                    opacity: 1,
                    y: 0,
                    duration: 0.22,
                    ease: "power2.out",
                });
            },
        });

        runThemeEffect(choice.id);
    });
}


/**  -------------------------- Loading Screen & Intro Animation -------------------------- */

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
        loadingScreenButton.textContent = "Welcome to Lea’s Portflio 🌙";

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
        playIntroAnimation();
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
        const textureLoader = new THREE.TextureLoader(manager);

// --- Poster Textures ---
const frame1Texture = textureLoader.load("/images/image1.webp");
frame1Texture.flipY = false;
frame1Texture.colorSpace = THREE.SRGBColorSpace;

const frame2Texture = textureLoader.load("/images/image2.webp");
frame2Texture.flipY = false;
frame2Texture.colorSpace = THREE.SRGBColorSpace;

const frame3Texture = textureLoader.load("/images/image3.webp");
frame3Texture.flipY = false;
frame3Texture.colorSpace = THREE.SRGBColorSpace;


const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader(manager);
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
  .setPath("textures/skybox/")
  .load(["px.webp", "nx.webp", "py.webp", "ny.webp", "pz.webp", "nz.webp"]);

const textureMap = {
  First: {
    day: "/textures/room/day/first_texture_set_day.webp",
    night: "/textures/room/night/first_texture_set_night.webp",
  },
  Second: {
    day: "/textures/room/day/second_texture_set_day.webp",
    night: "/textures/room/night/second_texture_set_night.webp",
  },
  Third: {
    day: "/textures/room/day/third_texture_set_day.webp",
    night: "/textures/room/night/third_texture_set_night.webp",
  },
  Fourth: {
    day: "/textures/room/day/fourth_texture_set_day.webp",
    night: "/textures/room/night/fourth_texture_set_night.webp",
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

const perlinTexture = textureLoader.load("/shaders/perlin.png");
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
videoElement.src = "/textures/video/Screen.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

/**  -------------------------- Model and Mesh Setup -------------------------- */

// LOL DO NOT DO THIS USE A FUNCTION TO AUTOMATE THIS PROCESS HAHAHAAHAHAHAHAHAHA
let fish;
let coffeePosition;
let hourHand;
let minuteHand;
let chairTop;
const xAxisFans = [];
const yAxisFans = [];
let plank1,
  plank2,
  workBtn,
  aboutBtn,
  contactBtn,
  boba,
  github,
  youtube,
  twitter;

let letter1, letter2, letter3, letter4, letter5, letter6, letter7, letter8;

let C1_Key,
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
  B1_Key;
let C2_Key,
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
  B2_Key;

let flower1, flower2, flower3, flower4, flower5;

let box1, box2, box3;

let lamp;

let slippers1, slippers2;

let egg1, egg2, egg3;

let frame1, frame2, frame3;

const useOriginalMeshObjects = ["Bulb", "Cactus", "Kirby"];

const objectsNeedingHitboxes = [];

const objectsWithIntroAnimations = [
  "Hanging_Plank_1",
  "Hanging_Plank_2",
  "My_Work_Button",
  "About_Button",
  "Contact_Button",
  "Boba",
  "GitHub",
  "YouTube",
  "Twitter",
  "Name_Letter_1",
  "Name_Letter_2",
  "Name_Letter_3",
  "Name_Letter_4",
  "Name_Letter_5",
  "Name_Letter_6",
  "Name_Letter_7",
  "Name_Letter_8",
  "Flower_1",
  "Flower_2",
  "Flower_3",
  "Flower_4",
  "Flower_5",
  "Box_1",
  "Box_2",
  "Box_3",
  "Lamp",
  "Slipper_1",
  "Slipper_2",
  "Fish_Fourth",
  "Egg_1",
  "Egg_2",
  "Egg_3",
  "Frame_1",
  "Frame_2",
  "Frame_3",
  "C1_Key",
  "C#1_Key",
  "D1_Key",
  "D#1_Key",
  "E1_Key",
  "F1_Key",
  "F#1_Key",
  "G1_Key",
  "G#1_Key",
  "A1_Key",
  "A#1_Key",
  "B1_Key",
  "C2_Key",
  "C#2_Key",
  "D2_Key",
  "D#2_Key",
  "E2_Key",
  "F2_Key",
  "F#2_Key",
  "G2_Key",
  "G#2_Key",
  "A2_Key",
  "A#2_Key",
  "B2_Key",
];

function hasIntroAnimation(objectName) {
  return objectsWithIntroAnimations.some((animatedName) =>
    objectName.includes(animatedName)
  );
}

loader.load("/models/Room_Portfolio.glb", (glb) => {
    glb.scene.traverse((child) => {
        if (!child.isMesh) return;

        // ------------------ Special refs / initial data ------------------
        if (child.name.includes("Fish_Fourth")) {
            fish = child;
            child.position.x += 0.04;
            child.position.z -= 0.03;
            child.userData.initialPosition = new THREE.Vector3().copy(child.position);
            child.scale.set(0, 0, 0);
        }

        if (child.name.includes("Chair_Top")) {
            chairTop = child;
            child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
        }

        if (child.name.includes("Hour_Hand")) {
            hourHand = child;
            child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
        }

        if (child.name.includes("Minute_Hand")) {
            minuteHand = child;
            child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
        }

        if (child.name.includes("Coffee")) {
            coffeePosition = child.position.clone();
        }

        if (child.name.includes("Hover") || child.name.includes("Key")) {
            child.userData.initialScale = new THREE.Vector3().copy(child.scale);
            child.userData.initialPosition = new THREE.Vector3().copy(child.position);
            child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
        }

        // ------------------ Intro-animated objects ------------------
        if (child.name.includes("Hanging_Plank_1")) {
            plank1 = child;
            child.scale.set(0, 0, 1);
        } else if (child.name.includes("Hanging_Plank_2")) {
            plank2 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("My_Work_Button")) {
            workBtn = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("About_Button")) {
            aboutBtn = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Contact_Button")) {
            contactBtn = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Boba")) {
            boba = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("GitHub")) {
            github = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("YouTube")) {
            youtube = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Twitter")) {
            twitter = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Name_Letter_1")) {
            letter1 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Name_Letter_2")) {
            letter2 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Name_Letter_3")) {
            letter3 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Name_Letter_4")) {
            letter4 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Name_Letter_5")) {
            letter5 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Name_Letter_6")) {
            letter6 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Name_Letter_7")) {
            letter7 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Name_Letter_8")) {
            letter8 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Flower_1")) {
            flower1 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Flower_2")) {
            flower2 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Flower_3")) {
            flower3 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Flower_4")) {
            flower4 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Flower_5")) {
            flower5 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Box_1")) {
            box1 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Box_2")) {
            box2 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Box_3")) {
            box3 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Lamp")) {
            lamp = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Slipper_1")) {
            slippers1 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Slipper_2")) {
            slippers2 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Egg_1")) {
            egg1 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Egg_2")) {
            egg2 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Egg_3")) {
            egg3 = child;
            child.scale.set(0, 0, 0);
        } else if (child.name.includes("Frame_1")) {
            frame1 = child;
            child.scale.set(0, 0, 0);
            child.userData.isPosterFrame = true;
        } else if (child.name.includes("Frame_2")) {
            frame2 = child;
            child.scale.set(0, 0, 0);
            child.userData.isPosterFrame = true;
        } else if (child.name.includes("Frame_3")) {
            frame3 = child;
            child.scale.set(0, 0, 0);
            child.userData.isPosterFrame = true;
        }

        // ------------------ Piano keys ------------------
        Object.keys(pianoKeyMap).forEach((keyName) => {
            if (child.name.includes(keyName)) {
                const varName = keyName.replace("#", "s").split("_")[0] + "_Key";
                // eslint-disable-next-line no-eval
                eval(`${varName} = child`);
                child.scale.set(0, 0, 0);
                child.userData.initialPosition = new THREE.Vector3().copy(
                    child.position
                );
                child.userData.initialScale = new THREE.Vector3().copy(child.scale);
                child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
            }
        });

        // ------------------ Materials (including posters) ------------------
        // ------------------ Poster materials ------------------
        if (
            child.name.includes("Picture") ||
            child.name.includes("Print") ||
            child.name.includes("Image") ||
            child.name.includes("Poster") ||
            child.name.includes("Photo")
        ) {
            if (child.name.includes("Frame_1")) {
                child.material = new THREE.MeshBasicMaterial({
                    map: frame1Texture,
                });
            }
            else if (child.name.includes("Frame_2")) {
                child.material = new THREE.MeshBasicMaterial({
                    map: frame2Texture,
                });
            }
            else if (child.name.includes("Frame_3")) {
                child.material = new THREE.MeshBasicMaterial({
                    map: frame3Texture,
                });
            }
        }

 else if (child.name.includes("Water")) {
            child.material = new THREE.MeshBasicMaterial({
                color: 0x558bc8,
                transparent: true,
                opacity: 0.4,
                depthWrite: false,
            });
        } else if (child.name.includes("Glass")) {
            child.material = glassMaterial;
        } else if (child.name.includes("Bubble")) {
            child.material = whiteMaterial;
        } else if (child.name.includes("Screen")) {
            child.material = new THREE.MeshBasicMaterial({
                map: videoTexture,
                transparent: true,
                opacity: 0.9,
            });
        } else {
            Object.keys(textureMap).forEach((key) => {
                if (child.name.includes(key)) {
                    child.material = roomMaterials[key];

                    if (child.name.includes("Fan")) {
                        if (child.name.includes("Fan_2") || child.name.includes("Fan_4")) {
                            xAxisFans.push(child);
                        } else {
                            yAxisFans.push(child);
                        }
                    }
                }
            });
        }

        // ------------------ Raycaster hitboxes ------------------
        if (child.name.includes("Raycaster")) {
            if (hasIntroAnimation(child.name)) {
                child.userData.originalScale = new THREE.Vector3(1, 1, 1);
                objectsNeedingHitboxes.push(child);
            } else {
                const raycastObject = createStaticHitbox(child);

                if (raycastObject !== child) {
                    scene.add(raycastObject);
                }

                raycasterObjects.push(raycastObject);
                hitboxToObjectMap.set(raycastObject, child);
            }
        }
    });

    if (coffeePosition) {
        smoke.position.set(
            coffeePosition.x,
            coffeePosition.y + 0.2,
            coffeePosition.z
        );
    }

    scene.add(glb.scene);
});


/**  -------------------------- Raycaster setup -------------------------- */

const raycasterObjects = [];
let currentIntersects = [];
let currentHoveredObject = null;

const socialLinks = {
    GitHub: "https://github.com/LeaBogovic",
    YouTube: "https://www.youtube.com/watch?v=OqryGDjhtSA",
  Twitter: "https://www.twitter.com/",
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const hitboxToObjectMap = new Map();

function shouldUseOriginalMesh(objectName) {
  return useOriginalMeshObjects.some((meshName) =>
    objectName.includes(meshName)
  );
}

function createStaticHitbox(originalObject) {
  // Check if we should use original mesh
  if (shouldUseOriginalMesh(originalObject.name)) {
    if (!originalObject.userData.initialScale) {
      originalObject.userData.initialScale = new THREE.Vector3().copy(
        originalObject.scale
      );
    }
    if (!originalObject.userData.initialPosition) {
      originalObject.userData.initialPosition = new THREE.Vector3().copy(
        originalObject.position
      );
    }
    if (!originalObject.userData.initialRotation) {
      originalObject.userData.initialRotation = new THREE.Euler().copy(
        originalObject.rotation
      );
    }

    originalObject.userData.originalObject = originalObject;
    return originalObject;
  }

  if (!originalObject.userData.initialScale) {
    originalObject.userData.initialScale = new THREE.Vector3().copy(
      originalObject.scale
    );
  }
  if (!originalObject.userData.initialPosition) {
    originalObject.userData.initialPosition = new THREE.Vector3().copy(
      originalObject.position
    );
  }
  if (!originalObject.userData.initialRotation) {
    originalObject.userData.initialRotation = new THREE.Euler().copy(
      originalObject.rotation
    );
  }

  const currentScale = originalObject.scale.clone();
  const hasZeroScale =
    currentScale.x === 0 || currentScale.y === 0 || currentScale.z === 0;

  if (hasZeroScale && originalObject.userData.originalScale) {
    originalObject.scale.copy(originalObject.userData.originalScale);
  }

  const box = new THREE.Box3().setFromObject(originalObject);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  if (hasZeroScale) {
    originalObject.scale.copy(currentScale);
  }

  let hitboxGeometry;
  let sizeMultiplier = { x: 1.1, y: 1.75, z: 1.1 };

  hitboxGeometry = new THREE.BoxGeometry(
    size.x * sizeMultiplier.x,
    size.y * sizeMultiplier.y,
    size.z * sizeMultiplier.z
  );

  const hitboxMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    visible: false,
  });

  const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
  hitbox.position.copy(center);
  hitbox.name = originalObject.name + "_Hitbox";
  hitbox.userData.originalObject = originalObject;

  if (originalObject.name.includes("Headphones")) {
    hitbox.rotation.x = 0;
    hitbox.rotation.y = Math.PI / 4;
    hitbox.rotation.z = 0;
  }

  return hitbox;
}

function createDelayedHitboxes() {
  objectsNeedingHitboxes.forEach((child) => {
    const raycastObject = createStaticHitbox(child);

    if (raycastObject !== child) {
      scene.add(raycastObject);
    }

    raycasterObjects.push(raycastObject);
    hitboxToObjectMap.set(raycastObject, child);
  });

  objectsNeedingHitboxes.length = 0;
}

function handleRaycasterInteraction() {
  if (currentIntersects.length > 0) {
    const hitbox = currentIntersects[0].object;
    const object = hitboxToObjectMap.get(hitbox);

    if (object.name.includes("Button")) {
      buttonSounds.click.play();
    }

    Object.entries(pianoKeyMap).forEach(([keyName, soundKey]) => {
      if (object.name.includes(keyName)) {
        if (pianoDebounceTimer) {
          clearTimeout(pianoDebounceTimer);
        }

        fadeOutBackgroundMusic();

        pianoSounds[soundKey].play();

        pianoDebounceTimer = setTimeout(() => {
          fadeInBackgroundMusic();
        }, PIANO_TIMEOUT);

        gsap.to(object.rotation, {
          x: object.userData.initialRotation.x + Math.PI / 42,
          duration: 0.4,
          ease: "back.out(2)",
          onComplete: () => {
            gsap.to(object.rotation, {
              x: object.userData.initialRotation.x,
              duration: 0.25,
              ease: "back.out(2)",
            });
          },
        });
      }
    });

    Object.entries(socialLinks).forEach(([key, url]) => {
      if (object.name.includes(key)) {
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if (object.name.includes("Work_Button")) {
      showModal(modals.work);
    } else if (object.name.includes("About_Button")) {
      showModal(modals.about);
    } else if (object.name.includes("Contact_Button")) {
      showModal(modals.contact);
    }
  }
}

function playHoverAnimation(objectHitbox, isHovering) {
    let scale = 1.1; // smaller than 1.4, feels more refined
    const object = hitboxToObjectMap.get(objectHitbox);
    gsap.killTweensOf(object.scale);
    gsap.killTweensOf(object.rotation);
    gsap.killTweensOf(object.position);

  if (object.name.includes("Coffee")) {
    gsap.killTweensOf(smoke.scale);
    if (isHovering) {
      gsap.to(smoke.scale, {
        x: 1.4,
        y: 1.4,
        z: 1.4,
        duration: 0.5,
        ease: "back.out(2)",
      });
    } else {
      gsap.to(smoke.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: "back.out(2)",
      });
    }
  }

  if (object.name.includes("Fish")) {
    scale = 1.2;
  }

    if (isHovering) {
        gsap.to(object.scale, {
            x: object.userData.initialScale.x * scale,
            y: object.userData.initialScale.y * scale,
            z: object.userData.initialScale.z * scale,
            duration: 0.35,
            ease: "power2.out",
        });

    if (object.name.includes("About_Button")) {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x - Math.PI / 10,
        duration: 0.5,
        ease: "back.out(2)",
      });
    } else if (
      object.name.includes("Contact_Button") ||
      object.name.includes("My_Work_Button") ||
      object.name.includes("GitHub") ||
      object.name.includes("YouTube") ||
      object.name.includes("Twitter")
    ) {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x + Math.PI / 10,
        duration: 0.5,
        ease: "back.out(2)",
      });
    }

    if (object.name.includes("Boba") || object.name.includes("Name_Letter")) {
      gsap.to(object.position, {
        y: object.userData.initialPosition.y + 0.2,
        duration: 0.5,
        ease: "back.out(2)",
      });
    }
  } else {
    // Reset scale for all objects
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: "back.out(2)",
    });

    if (
      object.name.includes("About_Button") ||
      object.name.includes("Contact_Button") ||
      object.name.includes("My_Work_Button") ||
      object.name.includes("GitHub") ||
      object.name.includes("YouTube") ||
      object.name.includes("Twitter")
    ) {
      gsap.to(object.rotation, {
        x: object.userData.initialRotation.x,
        duration: 0.3,
        ease: "back.out(2)",
      });
    }

    if (object.name.includes("Boba") || object.name.includes("Name_Letter")) {
      gsap.to(object.position, {
        y: object.userData.initialPosition.y,
        duration: 0.3,
        ease: "back.out(2)",
      });
    }
  }
}

window.addEventListener("mousemove", (e) => {
  touchHappened = false;
  pointer.x = (e.clientX / sizes.width) * 2 - 1;
  pointer.y = -(e.clientY / sizes.height) * 2 + 1;
});

window.addEventListener(
  "touchstart",
  (e) => {
    if (isModalOpen) return;
    e.preventDefault();
    pointer.x = (e.touches[0].clientX / sizes.width) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / sizes.height) * 2 + 1;
  },
  { passive: false }
);

window.addEventListener(
  "touchend",
  (e) => {
    if (isModalOpen) return;
    e.preventDefault();
    handleRaycasterInteraction();
  },
  { passive: false }
);

window.addEventListener("click", handleRaycasterInteraction);

// Other Event Listeners
const themeToggleButton = document.querySelector(".theme-toggle-button");
const muteToggleButton = document.querySelector(".mute-toggle-button");
const sunSvg = document.querySelector(".sun-svg");
const moonSvg = document.querySelector(".moon-svg");
const soundOffSvg = document.querySelector(".sound-off-svg");
const soundOnSvg = document.querySelector(".sound-on-svg");

const updateMuteState = (muted) => {
  if (muted) {
    backgroundMusic.volume(0);
  } else {
    backgroundMusic.volume(BACKGROUND_MUSIC_VOLUME);
  }

  buttonSounds.click.mute(muted);
  Object.values(pianoSounds).forEach((sound) => {
    sound.mute(muted);
  });
};

const handleMuteToggle = (e) => {
  e.preventDefault();

  isMuted = !isMuted;
  updateMuteState(isMuted);
  buttonSounds.click.play();

  if (!backgroundMusic.playing()) {
    backgroundMusic.play();
  }

  gsap.to(muteToggleButton, {
    rotate: -45,
    scale: 5,
    duration: 0.5,
    ease: "back.out(2)",
    onStart: () => {
      if (!isMuted) {
        soundOffSvg.style.display = "none";
        soundOnSvg.style.display = "block";
      } else {
        soundOnSvg.style.display = "none";
        soundOffSvg.style.display = "block";
      }

      gsap.to(muteToggleButton, {
        rotate: 0,
        scale: 1,
        duration: 0.5,
        ease: "back.out(2)",
        onComplete: () => {
          gsap.set(muteToggleButton, {
            clearProps: "all",
          });
        },
      });
    },
  });
};

let isMuted = false;
muteToggleButton.addEventListener(
  "click",
  (e) => {
    if (touchHappened) return;
    handleMuteToggle(e);
  },
  { passive: false }
);

muteToggleButton.addEventListener(
  "touchend",
  (e) => {
    touchHappened = true;
    handleMuteToggle(e);
  },
  { passive: false }
);

// Themeing stuff
const toggleFavicons = () => {
  const isDark = document.body.classList.contains("dark-theme");
  const theme = isDark ? "light" : "dark";

  document.querySelector(
    'link[sizes="96x96"]'
  ).href = `media/${theme}-favicon/favicon-96x96.png`;
  document.querySelector(
    'link[type="image/svg+xml"]'
  ).href = `/media/${theme}-favicon/favicon.svg`;
  document.querySelector(
    'link[rel="shortcut icon"]'
  ).href = `media/${theme}-favicon/favicon.ico`;
  document.querySelector(
    'link[rel="apple-touch-icon"]'
  ).href = `media/${theme}-favicon/apple-touch-icon.png`;
  document.querySelector(
    'link[rel="manifest"]'
  ).href = `media/${theme}-favicon/site.webmanifest`;
};

let isNightMode = false;

const handleThemeToggle = (e) => {
  e.preventDefault();
  toggleFavicons();

  const isDark = document.body.classList.contains("dark-theme");
  document.body.classList.remove(isDark ? "dark-theme" : "light-theme");
  document.body.classList.add(isDark ? "light-theme" : "dark-theme");

  isNightMode = !isNightMode;
  buttonSounds.click.play();

  gsap.to(themeToggleButton, {
    rotate: 45,
    scale: 5,
    duration: 0.5,
    ease: "back.out(2)",
    onStart: () => {
      if (isNightMode) {
        sunSvg.style.display = "none";
        moonSvg.style.display = "block";
      } else {
        moonSvg.style.display = "none";
        sunSvg.style.display = "block";
      }

      gsap.to(themeToggleButton, {
        rotate: 0,
        scale: 1,
        duration: 0.5,
        ease: "back.out(2)",
        onComplete: () => {
          gsap.set(themeToggleButton, {
            clearProps: "all",
          });
        },
      });
    },
  });

  Object.values(roomMaterials).forEach((material) => {
    gsap.to(material.uniforms.uMixRatio, {
      value: isNightMode ? 1 : 0,
      duration: 1.5,
      ease: "power2.inOut",
    });
  });
};

// Click event listener
themeToggleButton.addEventListener(
  "click",
  (e) => {
    if (touchHappened) return;
    handleThemeToggle(e);
  },
  { passive: false }
);

themeToggleButton.addEventListener(
  "touchend",
  (e) => {
    touchHappened = true;
    handleThemeToggle(e);
  },
  { passive: false }
);

/**  -------------------------- Render and Animations Stuff -------------------------- */
const clock = new THREE.Clock();

const updateClockHands = () => {
  if (!hourHand || !minuteHand) return;

  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const minuteAngle = (minutes + seconds / 60) * ((Math.PI * 2) / 60);

  const hourAngle = (hours + minutes / 60) * ((Math.PI * 2) / 12);

  minuteHand.rotation.x = -minuteAngle;
  hourHand.rotation.x = -hourAngle;
};

const render = (timestamp) => {
  const elapsedTime = clock.getElapsedTime();

  // Update Shader Univform
  smokeMaterial.uniforms.uTime.value = elapsedTime;

  //Update Orbit Controls
  controls.update();

  // Update Clock hand rotation
  updateClockHands();

  // Fan rotate animation
  xAxisFans.forEach((fan) => {
    fan.rotation.x -= 0.04;
  });

  yAxisFans.forEach((fan) => {
    fan.rotation.y -= 0.04;
  });

  // Chair rotate animation
  if (chairTop) {
    const time = timestamp * 0.001;
    const baseAmplitude = Math.PI / 8;

    const rotationOffset =
      baseAmplitude *
      Math.sin(time * 0.5) *
      (1 - Math.abs(Math.sin(time * 0.5)) * 0.3);

    chairTop.rotation.y = chairTop.userData.initialRotation.y + rotationOffset;
  }

  // Fish up and down animation
  if (fish) {
    const time = timestamp * 0.0015;
    const amplitude = 0.12;
    const position =
      amplitude * Math.sin(time) * (1 - Math.abs(Math.sin(time)) * 0.1);
    fish.position.y = fish.userData.initialPosition.y + position;
  }

  // Raycaster
  if (!isModalOpen) {
    raycaster.setFromCamera(pointer, camera);

    // Get all the objects the raycaster is currently shooting through / intersecting with
    currentIntersects = raycaster.intersectObjects(raycasterObjects);

    for (let i = 0; i < currentIntersects.length; i++) {}

    if (currentIntersects.length > 0) {
      const currentIntersectObject = currentIntersects[0].object;

      if (currentIntersectObject.name.includes("Hover")) {
        if (currentIntersectObject !== currentHoveredObject) {
          if (currentHoveredObject) {
            playHoverAnimation(currentHoveredObject, false);
          }

          currentHoveredObject = currentIntersectObject;
          playHoverAnimation(currentIntersectObject, true);
        }
      }

      if (currentIntersectObject.name.includes("Pointer")) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }
    } else {
      if (currentHoveredObject) {
        playHoverAnimation(currentHoveredObject, false);
        currentHoveredObject = null;
      }
      document.body.style.cursor = "default";
    }
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(render);
};

render();
