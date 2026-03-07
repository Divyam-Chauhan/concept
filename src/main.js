import './style.css';

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
  // Canvas preparation and GSAP hooks will go here in next phases.
}

// Start sequence
init();
