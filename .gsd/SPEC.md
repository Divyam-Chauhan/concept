# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Create a high-end, immersive web experience for a concept car featuring a scroll-linked canvas animation where a 3D car disassembles and reassembles as the user scrolls down the page. The overall vibe must be premium, sleek, high-tech, and motorsport-inspired.

## Goals
1. Implement a smooth, 60fps scroll-linked canvas animation scrubbing through 253 pre-rendered frames.
2. Synchronize typography and structural reveal animations along specific scroll points using GSAP.
3. Establish a premium design system utilizing the extracted exact background hex code from the frames to achieve an invisible canvas blend.

## Non-Goals (Out of Scope)
- 3D rendering in-browser (using pre-rendered image sequence instead of Three.js/WebGL for performance and immediate fidelity).
- Creating new 3D assets.
- Implementing an e-commerce or booking flow.

## Users
Automotive enthusiasts, luxury brand consumers, and digital design aficionados expecting a state-of-the-art interactive experience.

## Constraints
- **Technical constraints**: Must use a Vite + Vanilla JS environment. Must use Lenis for smooth scrolling and GSAP for animations. No CDN links; all dependencies managed via npm.
- **Styling**: Minimalist. Use pure white or off-white for text. Employ thin lines and glassmorphism. No heavy borders. 
- **Code standards**: Write semantic HTML5 and highly optimized JS. No hash symbols for comments.
- **Deployment**: Optimized for static hosting on Cloudflare Pages (all assets bundled into `dist` via `npm run build`).

## Technical Decisions
- **Background Color**: Extracted from `ezgif-frame-001.jpg` (to be determined during implementation phase, expected very dark grey/black).
- **Typography Headings**: 'Syncopate' or 'Monument Extended'.
- **Typography Body**: 'Inter' or 'Roboto'.
- **Animation Framework**: GSAP + ScrollTrigger.
- **Scroll Hijacking**: `@studio-freight/lenis`.

## Success Criteria
- [ ] A fully functional Vite build that compiles without errors.
- [ ] A 100vh sticky canvas that accurately plays forward and backward through the 253 frames tied directly to scroll progress.
- [ ] Zero flickering during scroll (all images preloaded into memory).
- [ ] Four distinct text reveal stages appearing and disappearing at the correct scroll thresholds.
- [ ] Design perfectly matches the high-end, high-contrast aesthetic requirements.
