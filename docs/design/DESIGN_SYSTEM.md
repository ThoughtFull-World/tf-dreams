# ThoughtFull Dreams — Design System 2.0

## Design Philosophy

**Dynamic Minimalism** — A modern evolution of minimalism that combines clean, functional design with immersive, engaging details. The interface feels alive through strategic use of microinteractions, glassmorphism, and 3D-inspired elements.

---

## Core Principles

### 1. **Glassmorphism (Liquid Glass)**
Inspired by Apple's design language, we use frosted glass effects throughout:
- **Backdrop blur** for depth and layering
- **Semi-transparency** to let vibrant backgrounds show through
- **Subtle borders** with white/translucent edges
- **Layered shadows** for floating effect

### 2. **Strategic Color Pops**
While maintaining a soft pastel foundation, we use **electric accents** to guide attention:
- Primary actions use vibrant gradients (purple → blue)
- Hover states amplify color intensity
- Glowing effects on interactive elements

### 3. **Microinteractions**
Every interaction tells a story:
- **Button hover** → Scale up + lift (y: -2px)
- **Button press** → Scale down (0.96)
- **Icons** → Rotate 360° on hover
- **Shimmer effects** → Sweep across primary buttons
- **Spring animations** → Natural, bouncy feel (stiffness: 300)

### 4. **3D Depth & Immersion**
Creating depth without overwhelming:
- **Layered shadows** (float, glow, glass)
- **Floating orbs** in background
- **Animated gradients** that pulse and shift
- **Perspective transforms** on hover
- **Multi-layer blur effects** for depth

### 5. **Expressive Typography**
Using **Space Grotesk** for headlines (bold, geometric, modern):
- Headlines: Black weight (900)
- Gradient text for emphasis
- Inter for body text
- Clear hierarchy with size jumps

---

## Color System

### Pastel Foundation (Dream Palette)
```css
mint:     #B6F0DE  /* Calming, fresh */
lavender: #D8C4F3  /* Dreamy, soft */
peach:    #FFD7C2  /* Warm, inviting */
sky:      #BDE0FE  /* Airy, light */
rose:     #FFB5E8  /* Playful, sweet */
amber:    #FFE5B4  /* Golden, hopeful */
```

### Electric Accents (Action Colors)
```css
purple:   #7B2FF7  /* Primary action */
blue:     #0066FF  /* Secondary action */
pink:     #FF2D87  /* Energy, passion */
cyan:     #00D9FF  /* Fresh, modern */
```

### Usage Guidelines
- **Backgrounds**: Mesh gradient (radial overlays of pastels)
- **CTAs**: Electric purple → blue gradient
- **Hover states**: Amplify saturation + add glow
- **Glass cards**: White with 70% opacity + blur(20px)
- **Dark glass**: White with 10% opacity + blur(20px)

---

## Typography

### Font Stack
```css
Headlines: Space Grotesk (variable font)
Body:      Inter (variable font)
Monospace: System mono (for tokens/code)
```

### Scale
```
Display:  text-6xl (60px) / text-7xl (72px)
H1:       text-5xl (48px)
H2:       text-3xl (30px)
Body:     text-lg (18px) / text-xl (20px)
Small:    text-sm (14px)
```

### Weight
```
Black:     900  (headlines only)
Bold:      700  (buttons, labels)
Semibold:  600  (emphasis)
Medium:    500  (subheadings)
Regular:   400  (body)
```

---

## Shadows & Effects

### Shadow System
```css
soft:        0 10px 30px rgba(0,0,0,0.06)      /* Subtle elevation */
glass:       0 8px 32px rgba(31,38,135,0.15)   /* Glass cards */
float:       0 20px 60px rgba(0,0,0,0.1)       /* Floating elements */
glow:        0 0 20px rgba(123,47,247,0.3)     /* Active elements */
glow-sm:     0 0 10px rgba(123,47,247,0.2)     /* Subtle glow */
inner-glow:  inset 0 0 20px rgba(255,255,255,0.1)  /* Inner shine */
```

### Glass Effect Classes
```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-dark {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

---

## Animation System

### Timing Functions
```css
Spring:    type: "spring", stiffness: 300, damping: 20
Ease Out:  cubic-bezier(0.4, 0, 0.6, 1)
Linear:    linear (for infinite animations)
```

### Common Animations
```css
float:       6s ease-in-out infinite (translateY)
pulse-slow:  4s cubic-bezier infinite (opacity/scale)
shimmer:     2s linear infinite (background position)
```

### Microinteraction Patterns

**Button Interactions:**
```jsx
whileHover={{ scale: 1.02, y: -2 }}
whileTap={{ scale: 0.96 }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}
```

**Icon Spin:**
```jsx
whileHover={{ rotate: 360, scale: 1.2 }}
transition={{ duration: 0.5 }}
```

**Shimmer Sweep:**
```jsx
whileHover={{ x: "100%" }}
transition={{ duration: 0.6 }}
// Applied to gradient overlay
```

**Glow Pulse:**
```jsx
animate={{ opacity: [0.3, 0.7, 0.3] }}
transition={{ duration: 2, repeat: Infinity }}
```

---

## Component Patterns

### Button
3 variants with distinct personalities:

**Primary** (Electric Gradient)
- Gradient background (purple → blue)
- Glow shadow on hover
- Shimmer effect sweep
- Icon rotation on hover
- Use for: Primary actions (Start Recording, Generate)

**Secondary** (Glass)
- Frosted glass with blur
- Subtle hover state
- Use for: Alternative actions

**Glass Dark**
- Dark translucent glass
- Backdrop blur
- White text
- Use for: On-video overlays, dark backgrounds

### Card System

**Main Glass Cards:**
```css
glass rounded-4xl shadow-float p-10
+ inner-glow effect
+ animated gradient borders
```

**Info Cards:**
```css
glass-dark rounded-2xl p-6
+ decorative blur orbs in corners
```

### Progress Visualization

**Step Cards:**
- Active: glass-dark + animated gradient glow
- Completed: glass + checkmark with spring animation
- Pending: subtle white/30 background

**Icon Treatment:**
- 3D rotation on active step (rotateY: 360°)
- Scale pulse animation
- Gradient glow around icon

### Recording Orb

**Visual Layers:**
1. Pulsing rings (audio-reactive)
2. Main glass orb (glass-dark)
3. Inner gradient glow
4. Progress ring (SVG)
5. Icon (microphone emoji)

**Audio Visualization:**
- Waveform bars (20 bars, gradient colored)
- Real-time audio level detection
- Pulse frequency tied to audio input

---

## Layout Architecture

### Background System
```
Layer 1: Mesh gradient (radial pastel overlays)
Layer 2: Animated gradient overlay (purple/cyan fade)
Layer 3: Floating blur orbs (purple, cyan)
Layer 4: Content (z-10)
```

### Spacing Scale
```
4px  → gap-1
8px  → gap-2
12px → gap-3
16px → gap-4
24px → gap-6
32px → gap-8
48px → gap-12
```

### Border Radius
```
1rem   → rounded-xl
1.5rem → rounded-2xl
2rem   → rounded-3xl
2.5rem → rounded-4xl
```

---

## Accessibility

### Contrast
- All text meets WCAG AA standards
- Glass overlays maintain 4.5:1 minimum contrast
- Electric colors tested for colorblind safety

### Motion
- Animations use `prefers-reduced-motion` (TODO: implement)
- No parallax scrolling (motion sickness)
- Hover effects have click equivalents on mobile

### Touch Targets
- Minimum 44×44px (iOS guideline)
- Buttons use py-4 (16px vertical padding)
- Generous spacing around interactive elements

---

## Responsive Behavior

### Breakpoints
```css
sm:  640px
md:  768px
lg:  1024px
```

### Mobile-First Approach
- Base styles target mobile (375px)
- Glass effects reduce blur on low-end devices
- Animations scale down complexity on mobile
- Touch-friendly spacing (larger gaps)

### Typography Scaling
```
Mobile:  text-5xl → Desktop: text-6xl/7xl
Mobile:  text-2xl → Desktop: text-3xl
```

---

## Performance Optimizations

### GPU Acceleration
- `backdrop-filter` uses GPU
- `transform` properties use GPU
- `will-change: transform` on animated elements

### Animation Strategy
- Use `transform` over position changes
- Limit simultaneous animations
- `AnimatePresence` for mount/unmount
- `layout` prop sparingly (expensive)

### Asset Strategy
- SVG for icons/logo (scalable, small)
- No large images yet (waiting for video)
- Web fonts with preload hint

---

## Implementation Examples

### Creating a New Glass Card
```tsx
<motion.div
  className="glass rounded-3xl shadow-float p-8"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  whileHover={{ scale: 1.02 }}
>
  {/* Inner glow */}
  <div className="absolute inset-0 shadow-inner-glow rounded-3xl pointer-events-none" />
  
  {/* Content */}
  <div className="relative z-10">
    Your content here
  </div>
</motion.div>
```

### Adding Glow Effect
```tsx
{/* Element with glow */}
<div className="relative">
  {/* Your element */}
  <div className="glass-dark rounded-2xl p-6">
    Content
  </div>
  
  {/* Glow layer */}
  <motion.div
    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-electric-purple to-electric-blue opacity-50 blur-xl -z-10"
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 2, repeat: Infinity }}
  />
</div>
```

### Floating Particle Effect
```tsx
{[...Array(8)].map((_, i) => (
  <motion.div
    key={i}
    className="absolute w-2 h-2 bg-white/40 rounded-full"
    style={{
      left: `${15 + i * 12}%`,
      top: `${30 + (i % 3) * 20}%`,
    }}
    animate={{ 
      y: [0, -30, 0],
      opacity: [0.2, 0.8, 0.2],
    }}
    transition={{ 
      duration: 3 + i * 0.5, 
      repeat: Infinity,
      delay: i * 0.3,
    }}
  />
))}
```

---

## Design Inspiration

**Reference Projects:**
- Apple iOS Control Center (glassmorphism)
- Stripe Checkout (clean microinteractions)
- Linear (smooth spring animations)
- Vercel (gradient text, subtle depth)
- Framer (3D transforms, layering)

**Key Differentiators:**
- Dream-like pastel foundation (vs corporate blues)
- More playful, emotional (vs purely functional)
- Audio-reactive elements (unique to our use case)
- Emoji integration (warmth, personality)

---

## Future Enhancements

### Phase 2 (Post-MVP)
- [ ] Real video playback with custom controls
- [ ] Audio waveform visualization on share page
- [ ] Scroll-triggered animations
- [ ] Dark mode toggle
- [ ] Accessibility: reduced motion support
- [ ] Haptic feedback on mobile
- [ ] Share to social with OG preview

### Advanced Interactions
- [ ] Drag to record (alternative to click)
- [ ] Gesture controls (swipe to navigate steps)
- [ ] Voice feedback ("Recording started...")
- [ ] Confetti on dream completion
- [ ] Particle trails following cursor

---

**Last Updated:** October 2025  
**Design Version:** 2.0 (Dynamic Minimalism)  
**Status:** ✅ Fully Implemented

