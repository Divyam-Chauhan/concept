import './style.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Constants
const TOTAL_FRAMES = 253;
const images = [];

// DOM Elements
const loaderScreen = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderText = document.getElementById('loader-text');

/**
 * Pads a number with leading zeros
 */
function padNumber(num, length = 3) {
  return num.toString().padStart(length, '0');
}

/**
 * Extracts the background color from the first frame
 * Loads the frame into an offscreen canvas and reads the pixel data from the top-left edge
 */
function extractBackgroundColor() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Read pixel data from the top-left edge (x: 5, y: 5 to avoid any weird compression edge artifacts)
        const pixelData = ctx.getImageData(5, 5, 1, 1).data;
        const hexColor = `#${padNumber(pixelData[0].toString(16), 2)}${padNumber(pixelData[1].toString(16), 2)}${padNumber(pixelData[2].toString(16), 2)}`;

        // Dynamically apply this color to the body background
        document.body.style.backgroundColor = hexColor;
        loaderScreen.style.backgroundColor = hexColor; // Update loader to match seamlessly

        resolve(hexColor);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = '/frames/ezgif-frame-001.jpg';
  });
}

/**
 * Preloads all 253 frames securely into the 'images' array
 */
function preloadImages() {
  return new Promise((resolve) => {
    let loadedCount = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = padNumber(i);
      const src = `/frames/ezgif-frame-${frameNum}.jpg`;

      img.onload = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);

        // Update loader UI
        if (loaderBar) loaderBar.style.width = `${percent}%`;
        if (loaderText) loaderText.textContent = `${percent}%`;

        if (loadedCount === TOTAL_FRAMES) {
          resolve(images);
        }
      };

      img.onerror = () => {
        console.warn(`Failed to load frame ${i}`);
        loadedCount++; // Still increment to prevent infinite hanging
        if (loadedCount === TOTAL_FRAMES) resolve(images);
      };

      img.src = src;
      images.push(img);
    }
  });
}

/**
 * Initialize application
 */
async function init() {
  try {
    // 1. Extract dynamic background color
    await extractBackgroundColor();

    // 2. Preload all image assets
    await preloadImages();

    // 3. Fade out the loader screen
    setTimeout(() => {
      if (loaderScreen) {
        loaderScreen.style.opacity = '0';
        setTimeout(() => {
          loaderScreen.style.display = 'none';
          document.body.classList.remove('overflow-hidden'); // Allow scrolling now
          onAppReady();
        }, 1000);
      }
    }, 500); // Small buffer before fading

  } catch (error) {
    console.error('Initialization error:', error);
    // Even if error, fade out loader
    if (loaderText) loaderText.textContent = "Error initializing";
  }
}

/**
 * Called after preloading completes and loader fades out
 */
function onAppReady() {
  console.log("App ready. All images loaded:", images.length);

  // Initialize Lenis for smooth scrolling
  const lenis = new Lenis({
    lerp: 0.05,
    smoothWheel: true
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Setup Canvas
  const canvas = document.getElementById('hero-canvas');
  if (canvas && images.length > 0) {
    const ctx = canvas.getContext('2d');

    let currentFrameIndex = -1;

    // Set initial canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Force a redraw of the current frame when resizing
      if (currentFrameIndex >= 0 && images[currentFrameIndex]) {
        drawCover(images[currentFrameIndex]);
      } else if (images[0]) {
        drawCover(images[0]);
      }
    };

    // Function to draw image covering the canvas
    const drawCover = (img) => {
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;

      let drawW = canvas.width;
      let drawH = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawW = canvas.height * imgRatio;
        offsetX = (canvas.width - drawW) / 2;
      } else {
        drawH = canvas.width / imgRatio;
        offsetY = (canvas.height - drawH) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    // Initialize size
    resizeCanvas();

    // Draw the first frame
    currentFrameIndex = 0;
    drawCover(images[0]);

    // Elements for typography stages
    const stage1 = document.getElementById('stage-1');
    const stage2 = document.getElementById('stage-2');
    const stage3 = document.getElementById('stage-3');
    const stage4 = document.getElementById('stage-4');

    // Helper for interpolating opacity based on scroll progress bounds
    const calculateOpacity = (progress, startIn, endIn, startOut, endOut) => {
      if (progress < startIn || progress > endOut) return 0;
      if (progress >= endIn && progress <= startOut) return 1;
      if (progress >= startIn && progress < endIn) {
        return (progress - startIn) / (endIn - startIn);
      }
      if (progress > startOut && progress <= endOut) {
        return 1 - ((progress - startOut) / (endOut - startOut));
      }
      return 0;
    };

    const calculateTransformY = (progress, startIn, endIn, startOut, endOut) => {
      if (progress < startIn || progress > endOut) return 20; // 20px down initially
      if (progress >= endIn && progress <= startOut) return 0;
      if (progress >= startIn && progress < endIn) {
        return 20 - (20 * ((progress - startIn) / (endIn - startIn)));
      }
      if (progress > startOut && progress <= endOut) {
        return -20 * ((progress - startOut) / (endOut - startOut)); // Slide up on exit
      }
      return 20;
    };

    // Update canvas size on window resize
    window.addEventListener('resize', () => {
      resizeCanvas();
    });

    // Setup GSAP ScrollTrigger to scrub through the 253 frames
    const appContainer = document.getElementById('app');

    ScrollTrigger.create({
      trigger: appContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0, // 0 for immediate scrub (Lenis already handles the smoothing)
      onUpdate: (self) => {
        // Calculate the current frame index based on the 0-1 progress
        const frameIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(self.progress * TOTAL_FRAMES)
        );

        // Only draw if the frame actually changed to prevent redundant draws
        if (frameIndex !== currentFrameIndex) {
          currentFrameIndex = frameIndex;

          // Use requestAnimationFrame to ensure the draw happens at the right time
          requestAnimationFrame(() => {
            if (images[currentFrameIndex]) {
              drawCover(images[currentFrameIndex]);
            }
          });
        }

        // --- TEXT LAYER ORCHESTRATION ---
        const p = self.progress;

        // Stage 1 (0 to 15%)
        if (stage1) {
          stage1.style.opacity = calculateOpacity(p, 0.0, 0.03, 0.12, 0.15);
          stage1.style.transform = `translateY(${calculateTransformY(p, 0.0, 0.03, 0.12, 0.15)}px)`;
          stage1.style.pointerEvents = (p >= 0.0 && p <= 0.15) ? 'auto' : 'none';
        }

        // Stage 2 (15 to 40%)
        if (stage2) {
          stage2.style.opacity = calculateOpacity(p, 0.15, 0.18, 0.37, 0.40);
          stage2.style.transform = `translateY(${calculateTransformY(p, 0.15, 0.18, 0.37, 0.40)}px)`;
          stage2.style.pointerEvents = (p >= 0.15 && p <= 0.40) ? 'auto' : 'none';
        }

        // Stage 3 (40 to 60%)
        if (stage3) {
          stage3.style.opacity = calculateOpacity(p, 0.40, 0.43, 0.57, 0.60);
          stage3.style.transform = `translateY(${calculateTransformY(p, 0.40, 0.43, 0.57, 0.60)}px)`;
          stage3.style.pointerEvents = (p >= 0.40 && p <= 0.60) ? 'auto' : 'none';
        }

        // Stage 4 (85 to 100%) - Appears later when the car is almost fully assembled
        if (stage4) {
          stage4.style.opacity = calculateOpacity(p, 0.85, 0.88, 1.0, 1.1); // No fade out at the end, stays on screen
          stage4.style.transform = `translateY(${calculateTransformY(p, 0.85, 0.88, 1.0, 1.1)}px)`;
          stage4.style.pointerEvents = (p >= 0.85 && p <= 1.0) ? 'auto' : 'none';
        }

      }
    });

    // Button Interactivity
    const igniteBtn = document.getElementById('ignite-btn');
    if (igniteBtn) {
      let engineBuffer = null;

      // Load and decode the audio file asynchronously
      fetch('/engine%20start.m4a')
        .then(response => response.arrayBuffer())
        .then(data => audioCtx.decodeAudioData(data))
        .then(buffer => { engineBuffer = buffer; })
        .catch(err => console.warn("Failed to load engine start audio:", err));

      igniteBtn.addEventListener('click', () => {
        if (engineBuffer && audioCtx) {
          if (audioCtx.state === 'suspended') {
            audioCtx.resume();
          }

          const source = audioCtx.createBufferSource();
          source.buffer = engineBuffer;

          const gainNode = audioCtx.createGain();
          const duration = engineBuffer.duration;

          // Fade parameters (last 2 seconds)
          const fadeDuration = 2;
          const fadeStartTime = duration - fadeDuration;

          // Audio envelope
          gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
          if (fadeStartTime > 0) {
            gainNode.gain.setValueAtTime(1, audioCtx.currentTime + fadeStartTime);
            gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + duration);
          } else {
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
          }

          source.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          source.start(0);

          // Trigger a visceral screen shake to match the aggression
          document.body.style.transition = "transform 0.05s ease-in-out";
          document.body.style.transform = "scale(1.02) translateY(5px)";
          setTimeout(() => { document.body.style.transform = "scale(1.01) translateY(-5px)"; }, 50);
          setTimeout(() => { document.body.style.transform = "scale(1) translateY(0)"; }, 100);
        }

        lenis.scrollTo('#features', { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      });
    }

  }
}

// Start sequence
init();

/**
 * Phase 6: Intersection Observer for Feature Cards
 * Handles the crossfading of the sticky left-column graphics
 */
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll('.feature-card');
  const graphics = {
    1: document.getElementById('graphic-1'),
    2: document.getElementById('graphic-2'),
    3: document.getElementById('graphic-3'),
    4: document.getElementById('graphic-4'),
  };

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5 // Trigger when card is 50% visible in the viewport
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Get the index of the currently intersecting card
        const activeIndex = entry.target.getAttribute('data-index');

        // Fade all graphics out
        Object.values(graphics).forEach(graphic => {
          if (graphic) {
            graphic.classList.remove('opacity-100');
            graphic.classList.add('opacity-0');
          }
        });

        // Wait for the fade-out transition (e.g. 700ms from duration-700) to clear ghosting,
        // before fading in the new graphic. Using 300ms to make it feel responsive but clean.
        setTimeout(() => {
          const activeGraphic = graphics[activeIndex];
          if (activeGraphic) {
            activeGraphic.classList.remove('opacity-0');
            activeGraphic.classList.add('opacity-100');
          }
        }, 300);
      }
    });
  }, observerOptions);

  // Observe all feature cards
  cards.forEach(card => observer.observe(card));
});

/**
 * Phase 9: Audio UI Interactions
 * Synthesizes a premium, subtle "pop" sound using Web Audio API on hover
 */
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
if (AudioContextClass) {
  const audioCtx = new AudioContextClass();

  function playInteractionSound() {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    try {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';

      // High to low frequency sweep gives that premium "pop/click" tactile feel
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);

      // Sharp volume envelope
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio interaction failed", e);
    }
  }

  // Attach to interaction nodes (module scripts execute after DOM parsing)
  const attachInteractionSounds = () => {
    document.querySelectorAll('.interaction-node').forEach(node => {
      node.addEventListener('mouseenter', playInteractionSound);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachInteractionSounds);
  } else {
    attachInteractionSounds();
  }

  // Forcefully unlock AudioContext on first user interaction to bypass autoplay policies
  const unlockAudio = () => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
  };

  document.addEventListener('click', unlockAudio);
  document.addEventListener('touchstart', unlockAudio);
  document.addEventListener('keydown', unlockAudio);
}
