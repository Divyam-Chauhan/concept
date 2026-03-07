# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [ ] A fully functional Vite build that compiles without errors.
- [ ] A 100vh sticky canvas that accurately plays forward and backward through the 253 frames tied directly to scroll progress.
- [ ] Zero flickering during scroll (all images preloaded into memory).
- [ ] Four distinct text reveal stages appearing and disappearing at the correct scroll thresholds.
- [ ] Design perfectly matches the high-end, high-contrast aesthetic requirements.

## Phases

### Phase 1: Foundation & Assets
**Status**: ⬜ Not Started
**Objective**: Set up the core project structure, CSS variables (extracting the background color), typography, and asset preloading logic.

### Phase 2: Canvas & Scroll Architecture
**Status**: ⬜ Not Started
**Objective**: Implement the sticky canvas layout, the scroll track, and Lenis smooth scrolling integration.

### Phase 3: Animation Logic & GSAP
**Status**: ⬜ Not Started
**Objective**: Bind the scroll progress to the array index of the preloaded image frames on the canvas. 

### Phase 4: Content Layers & Orchestration
**Status**: ⬜ Not Started
**Objective**: Add the four stages of text content and animate their opacity/translation based on GSAP ScrollTriggers.

### Phase 5: Polish & V1 Release
**Status**: ⬜ Not Started
**Objective**: Final performance optimization, cross-browser checks, and verifying the production build (`npm run build`).
