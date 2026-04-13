const slides = {
  grid: {
    title: "Browse in an artwork-led grid",
    body:
      "The main library view balances huge album covers, understated search, and a floating mini-player so the interface stays visually quiet until the music needs attention.",
    caption: "Grid view with floating playback chrome",
    image: "https://raw.githubusercontent.com/SrikarC6/PureVibes/main/assets/default-grid-view.png",
    alt: "PureVibes grid view with rounded album cards and floating playback controls",
    points: [
      "Rounded album cards with soft borders and native-feeling depth",
      "Monospaced support text keeps metadata readable without competing for focus",
      "Playback controls stay docked like a polished desktop utility, not a web widget",
    ],
  },
  album: {
    title: "Go deep on the album without losing the room",
    body:
      "The detail view stretches into a wide glass panel with oversized cover art, Baskerville headlines, readable track metadata, and a clear primary action for album playback.",
    caption: "Album detail overlay with track listing",
    image: "https://raw.githubusercontent.com/SrikarC6/PureVibes/main/assets/album-view.png",
    alt: "PureVibes album detail overlay showing cover art and tracks",
    points: [
      "Large-format cover treatment mirrors the browsing rhythm instead of switching visual language",
      "Track rows mix serif titles with monospaced artist metadata for fast scanning",
      "Call-to-action buttons stay bold and minimal, matching the rest of the app chrome",
    ],
  },
  queue: {
    title: "Queue controls float in like a proper native utility",
    body:
      "The queue popup uses translucent material, layered artwork, and understated controls so playlist management feels integrated instead of bolted onto the side.",
    caption: "Queue popup with glass material and current-track highlight",
    image: "https://raw.githubusercontent.com/SrikarC6/PureVibes/main/assets/queue-menu.png",
    alt: "PureVibes floating queue popup with up-next list",
    points: [
      "Glass panel styling keeps utility UI lightweight over the main library",
      "Current-track emphasis uses accent color and subtle motion instead of heavy chrome",
      "Drag-and-drop queue management stays accessible without overwhelming the layout",
    ],
  },
  favorites: {
    title: "Favorites stay curated, not cluttered",
    body:
      "Saved albums inherit the same dark grid system, search posture, and bottom-player layout, so the favorites view feels like a focused mode rather than a separate app.",
    caption: "Favorites view carrying the same PureVibes rhythm",
    image: "https://raw.githubusercontent.com/SrikarC6/PureVibes/main/assets/favorites-view.png",
    alt: "PureVibes favorites view with saved albums and player bar",
    points: [
      "Shared layout language makes switching views feel instant and familiar",
      "Search, artwork density, and metadata remain consistent across the library",
      "Floating player chrome anchors every mode with the same visual confidence",
    ],
  },
  welcome: {
    title: "First launch is stark, calm, and unmistakably PureVibes",
    body:
      "The onboarding screen strips everything back to the OLED-black grid, a glowing wordmark, and a single button to open a music folder. It sets the tone immediately.",
    caption: "Welcome screen with signature wordmark and CTA",
    image: "https://raw.githubusercontent.com/SrikarC6/PureVibes/main/assets/welcome-screen.png",
    alt: "PureVibes welcome screen with blue glow and open directory button",
    points: [
      "The entry state uses negative space instead of busy onboarding copy",
      "Blue glow, serif wordmark, and monospaced action text establish the design system fast",
      "A single focused action keeps the app feeling native and decisive from the first click",
    ],
  },
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -10% 0px",
  },
);

document.querySelectorAll("[data-reveal]").forEach((node) => {
  if (reduceMotion.matches) {
    node.classList.add("is-visible");
  } else {
    revealObserver.observe(node);
  }
});

const yearNode = document.querySelector("[data-year]");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const shotImage = document.querySelector("#shot-image");
const shotTitle = document.querySelector("#shot-title");
const shotBody = document.querySelector("#shot-body");
const shotCaption = document.querySelector("[data-shot-caption]");
const shotPoints = document.querySelector("#shot-points");
const shotTabs = [...document.querySelectorAll("[data-shot]")];

let activeSlide = "grid";
let autoRotateHandle = null;

function renderPoints(points) {
  shotPoints.replaceChildren();

  points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    shotPoints.append(item);
  });
}

async function preloadImage(src) {
  const image = new Image();
  image.src = src;

  if ("decode" in image) {
    try {
      await image.decode();
    } catch {
      // Ignore decode failures and let the browser continue with a normal paint.
    }
  }

  return image;
}

async function setSlide(id, { userInitiated = false } = {}) {
  const slide = slides[id];

  if (!slide || activeSlide === id) {
    return;
  }

  activeSlide = id;
  shotTabs.forEach((tab) => {
    const isActive = tab.dataset.shot === id;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  shotImage.classList.add("is-swapping");
  await preloadImage(slide.image);

  shotImage.src = slide.image;
  shotImage.alt = slide.alt;
  shotTitle.textContent = slide.title;
  shotBody.textContent = slide.body;
  shotCaption.textContent = slide.caption;
  renderPoints(slide.points);

  requestAnimationFrame(() => {
    shotImage.classList.remove("is-swapping");
  });

  if (userInitiated) {
    restartAutoRotate();
  }
}

function moveFocus(currentIndex, direction) {
  const nextIndex = (currentIndex + direction + shotTabs.length) % shotTabs.length;
  shotTabs[nextIndex].focus();
  setSlide(shotTabs[nextIndex].dataset.shot, { userInitiated: true });
}

shotTabs.forEach((tab, index) => {
  tab.tabIndex = index === 0 ? 0 : -1;

  tab.addEventListener("click", () => {
    setSlide(tab.dataset.shot, { userInitiated: true });
  });

  tab.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(index, 1);
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocus(index, -1);
    }
  });
});

function startAutoRotate() {
  if (reduceMotion.matches || shotTabs.length < 2) {
    return;
  }

  autoRotateHandle = window.setInterval(() => {
    const currentIndex = shotTabs.findIndex((tab) => tab.dataset.shot === activeSlide);
    const nextIndex = (currentIndex + 1) % shotTabs.length;
    setSlide(shotTabs[nextIndex].dataset.shot);
  }, 7000);
}

function stopAutoRotate() {
  if (autoRotateHandle !== null) {
    window.clearInterval(autoRotateHandle);
    autoRotateHandle = null;
  }
}

function restartAutoRotate() {
  stopAutoRotate();
  startAutoRotate();
}

document.querySelector(".showcase__layout")?.addEventListener("mouseenter", stopAutoRotate);
document.querySelector(".showcase__layout")?.addEventListener("mouseleave", startAutoRotate);
startAutoRotate();

document.querySelectorAll("[data-tilt-root]").forEach((root) => {
  if (reduceMotion.matches) {
    return;
  }

  const updatePointer = (event) => {
    const bounds = root.getBoundingClientRect();
    const normalizedX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const normalizedY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

    root.style.setProperty("--pointer-x", normalizedX.toFixed(3));
    root.style.setProperty("--pointer-y", normalizedY.toFixed(3));
  };

  const resetPointer = () => {
    root.style.setProperty("--pointer-x", "0");
    root.style.setProperty("--pointer-y", "0");
  };

  root.addEventListener("pointermove", updatePointer);
  root.addEventListener("pointerleave", resetPointer);
});
