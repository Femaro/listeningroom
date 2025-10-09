# 🎨 Listening Room Design System

## Brand Colors

### Primary Palette

#### Teal (Primary)
```jsx
// Light backgrounds
className="bg-teal-50"     // #f0fdfa
className="bg-teal-100"    // #ccfbf1
className="bg-teal-200"    // #99f6e4

// Medium tones
className="bg-teal-500"    // #14b8a6 ⭐ Main brand color
className="bg-teal-600"    // #0d9488

// Dark tones
className="bg-teal-700"    // #0f766e
```

#### Blue (Secondary)
```jsx
// Light backgrounds
className="bg-blue-50"     // #eff6ff
className="bg-blue-100"    // #dbeafe

// Medium tones
className="bg-blue-500"    // #3b82f6
className="bg-blue-600"    // #2563eb ⭐ Secondary brand

// Dark tones
className="bg-blue-700"    // #1d4ed8
```

#### Emerald (Tertiary)
```jsx
// Light backgrounds
className="bg-emerald-50"  // #ecfdf5
className="bg-emerald-100" // #d1fae5

// Medium tones
className="bg-emerald-500" // #10b981
className="bg-emerald-600" // #059669

// Success/active states
className="bg-green-500"   // #22c55e
```

#### Orange (Accent)
```jsx
// Light backgrounds
className="bg-orange-50"   // #fff7ed
className="bg-orange-100"  // #ffedd5

// Medium tones - for donate, attention
className="bg-orange-600"  // #ea580c ⭐ Donate button
className="bg-orange-700"  // #c2410c
```

### Gradient Combinations

#### Primary Gradient (Most Used)
```jsx
className="bg-gradient-to-r from-teal-500 to-blue-600"
className="bg-gradient-to-br from-teal-500 to-blue-600"
```
**Use for:** Main CTAs, user avatars, primary headers

#### Background Gradient
```jsx
className="bg-gradient-to-br from-teal-50 via-blue-50 to-emerald-50"
```
**Use for:** Page backgrounds, main containers

#### Light Card Gradient
```jsx
className="bg-gradient-to-br from-teal-100 to-blue-100"
```
**Use for:** Card backgrounds, content areas

#### Secondary Participant Gradient
```jsx
className="bg-gradient-to-br from-blue-500 to-purple-600"
className="bg-gradient-to-br from-purple-500 to-pink-600"
```
**Use for:** Other participants, secondary elements

#### Info Card Gradient
```jsx
className="bg-gradient-to-br from-teal-50 to-blue-50"
```
**Use for:** Information panels, help sections

#### Danger Gradient
```jsx
className="bg-gradient-to-r from-red-500 to-rose-600"
```
**Use for:** Delete, end session, destructive actions

---

## Component Patterns

### 1. Glassmorphism Card
```jsx
<div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 
                shadow-2xl border border-white/50 
                transform transition-all duration-300 hover:shadow-3xl">
  {/* Content */}
</div>
```
**Use for:** Main content cards, modals, panels

### 2. Gradient Button (Primary CTA)
```jsx
<button className="bg-gradient-to-r from-teal-500 to-blue-600 
                   hover:from-teal-600 hover:to-blue-700 
                   text-white px-8 py-4 rounded-2xl font-semibold 
                   transition-all duration-200 shadow-lg hover:shadow-xl 
                   transform hover:-translate-y-0.5 
                   flex items-center space-x-2">
  <span>Button Text</span>
  <Icon className="w-5 h-5" />
</button>
```

### 3. Danger Button
```jsx
<button className="bg-gradient-to-r from-red-500 to-rose-600 
                   hover:from-red-600 hover:to-rose-700 
                   text-white px-6 py-2.5 rounded-xl font-medium 
                   transition-all duration-200 shadow-lg hover:shadow-xl 
                   transform hover:-translate-y-0.5">
  Leave Session
</button>
```

### 4. Secondary Button
```jsx
<button className="bg-white text-gray-700 hover:bg-gray-50 
                   border-2 border-gray-200 px-6 py-2.5 
                   rounded-xl font-medium transition-all duration-200 
                   shadow-sm hover:shadow-md">
  Cancel
</button>
```

### 5. Icon Container
```jsx
<div className="bg-gradient-to-br from-teal-500 to-blue-600 
                p-3 rounded-2xl shadow-lg">
  <Icon className="w-6 h-6 text-white" />
</div>
```

### 6. User Avatar (You)
```jsx
<div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-blue-600 
                rounded-full flex items-center justify-center 
                shadow-xl ring-4 ring-white/50">
  <span className="text-3xl font-bold text-white">
    {initial}
  </span>
</div>
```

### 7. User Avatar (Other)
```jsx
<div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 
                rounded-full flex items-center justify-center 
                shadow-xl ring-4 ring-white/50">
  <span className="text-3xl font-bold text-white">
    {initial}
  </span>
</div>
```

### 8. Status Badge (Active)
```jsx
<div className="px-3 py-1 rounded-full bg-green-100 text-green-700 
                text-xs font-medium">
  Active
</div>
```

### 9. Status Badge (Muted)
```jsx
<div className="px-3 py-1 rounded-full bg-red-100 text-red-700 
                text-xs font-medium">
  Muted
</div>
```

### 10. Live Indicator
```jsx
<div className="flex items-center space-x-2">
  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
  <span className="text-xs font-medium text-gray-600">Active now</span>
</div>
```

### 11. Input Field
```jsx
<input
  type="text"
  className="w-full bg-white border-2 border-gray-200 text-gray-900 
             px-6 py-4 rounded-2xl focus:ring-2 focus:ring-teal-500 
             focus:border-teal-500 focus:outline-none 
             transition-all duration-200 placeholder-gray-400"
  placeholder="Type your message..."
/>
```

### 12. Gradient Text
```jsx
<h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 
               bg-clip-text text-transparent">
  Heading Text
</h1>
```

### 13. Info Card
```jsx
<div className="bg-gradient-to-br from-teal-50 to-blue-50 
                rounded-2xl p-6 border border-teal-100">
  <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
    <Shield className="w-5 h-5 text-teal-600" />
    <span>Card Title</span>
  </h4>
  {/* Card Content */}
</div>
```

### 14. Message Bubble (Yours)
```jsx
<div className="px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm 
                transform transition-all duration-200 hover:scale-[1.02] 
                bg-gradient-to-br from-teal-500 to-blue-600 text-white 
                rounded-tr-sm">
  <p className="text-sm leading-relaxed">{message}</p>
  <p className="text-xs mt-2 text-teal-100">{time}</p>
</div>
```

### 15. Message Bubble (Others)
```jsx
<div className="px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm 
                transform transition-all duration-200 hover:scale-[1.02] 
                bg-white/90 text-gray-800 border border-gray-200 
                rounded-tl-sm">
  <p className="text-sm leading-relaxed">{message}</p>
  <p className="text-xs mt-2 text-gray-500">{time}</p>
</div>
```

---

## Typography

### Font Family
```jsx
className="font-sans"  // Inter (default)
```

### Headings
```jsx
// Page Title
className="text-3xl font-bold text-gray-900"

// Section Title
className="text-2xl font-bold text-gray-800"

// Card Title
className="text-xl font-bold text-gray-800"

// Subtitle
className="text-lg font-semibold text-gray-700"
```

### Body Text
```jsx
// Regular
className="text-base text-gray-700"

// Small
className="text-sm text-gray-600"

// Extra Small
className="text-xs text-gray-500"
```

### Font Weights
```jsx
className="font-medium"    // 500
className="font-semibold"  // 600
className="font-bold"      // 700
```

---

## Spacing Scale

### Padding
```jsx
className="p-2"   // 8px
className="p-3"   // 12px
className="p-4"   // 16px
className="p-6"   // 24px ⭐ Standard card padding
className="p-8"   // 32px ⭐ Large card padding
```

### Margin
```jsx
className="mb-2"  // 8px
className="mb-3"  // 12px
className="mb-4"  // 16px ⭐ Standard bottom margin
className="mb-6"  // 24px
className="mb-8"  // 32px ⭐ Section spacing
```

### Gap (Flexbox/Grid)
```jsx
className="space-x-2"  // 8px horizontal
className="space-x-4"  // 16px horizontal ⭐ Standard
className="space-x-6"  // 24px horizontal

className="space-y-4"  // 16px vertical ⭐ Standard
className="space-y-6"  // 24px vertical
className="space-y-8"  // 32px vertical
```

---

## Border Radius

```jsx
className="rounded-lg"    // 8px - Small elements
className="rounded-xl"    // 12px - Buttons
className="rounded-2xl"   // 16px - Cards ⭐ Standard
className="rounded-3xl"   // 24px - Large cards ⭐ Feature cards
className="rounded-full"  // 9999px - Avatars, badges
```

---

## Shadows

```jsx
className="shadow-sm"     // Subtle - Headers
className="shadow-lg"     // Standard - Cards
className="shadow-xl"     // Enhanced - Hover state
className="shadow-2xl"    // Maximum - Modals ⭐ Feature cards
```

---

## Animation Patterns

### Hover Effects
```jsx
// Button lift
className="transform hover:-translate-y-0.5 transition-all duration-200"

// Card lift
className="transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"

// Subtle scale
className="transform hover:scale-[1.02] transition-all duration-200"

// Shadow growth
className="shadow-lg hover:shadow-xl transition-shadow duration-200"
```

### Loading States
```jsx
// Pulse
className="animate-pulse"

// Spin
className="animate-spin"

// Custom fade in
className="animate-fadeIn"
```

---

## Responsive Breakpoints

```jsx
// Mobile first approach
className="text-sm md:text-base lg:text-lg"
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="p-4 md:p-6 lg:p-8"
className="hidden md:flex"
className="flex md:hidden"
```

**Breakpoints:**
- `sm`: 640px
- `md`: 768px ⭐ Most used
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## Accessibility

### Focus States
```jsx
className="focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none"
```

### Touch Targets
```jsx
// Minimum 44x44px
className="p-3"  // 12px padding + content = minimum 44px
```

### Color Contrast
- ✅ Text on white: Use gray-700 or darker
- ✅ Text on teal-500: Use white
- ✅ Text on blue-600: Use white
- ✅ Ensure 4.5:1 ratio minimum

---

## Background Patterns

### Decorative Floating Elements
```jsx
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute -top-24 -left-24 w-96 h-96 
                  bg-gradient-to-br from-teal-200 to-blue-200 
                  rounded-full opacity-20 blur-3xl"></div>
  <div className="absolute -bottom-24 -right-24 w-96 h-96 
                  bg-gradient-to-br from-emerald-200 to-teal-200 
                  rounded-full opacity-20 blur-3xl"></div>
</div>
```

### Background Images (Subtle)
```jsx
<div className="absolute inset-0 opacity-10">
  <img 
    src="https://images.unsplash.com/photo-XXX?w=500&h=300&fit=crop" 
    alt="" 
    className="w-full h-full object-cover"
  />
</div>
```

---

## Layout Patterns

### Page Container
```jsx
<div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-emerald-50">
  {/* Content */}
</div>
```

### Content Container
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Glassmorphism Header
```jsx
<div className="bg-white/80 backdrop-blur-md px-6 py-5 
                border-b border-white/20 shadow-sm sticky top-0 z-50">
  {/* Header content */}
</div>
```

---

## Icon Sizes

```jsx
className="w-4 h-4"   // Small icons in text
className="w-5 h-5"   // Standard icons ⭐
className="w-6 h-6"   // Large icons in buttons ⭐
className="w-8 h-8"   // Feature icons
className="w-10 h-10" // Hero icons
```

---

## Common Combinations

### Card with Icon Header
```jsx
<div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 
                shadow-2xl border border-white/50">
  <div className="flex items-center space-x-3 mb-6">
    <div className="bg-gradient-to-br from-teal-500 to-blue-600 
                    p-3 rounded-2xl">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h3 className="text-xl font-bold text-gray-800">Title</h3>
      <p className="text-sm text-gray-600">Subtitle</p>
    </div>
  </div>
  {/* Card content */}
</div>
```

---

## Quick Reference: Copy & Paste

### Standard Card
```jsx
<div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/50">
```

### Primary Button
```jsx
<button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
```

### Input Field
```jsx
<input className="w-full bg-white border-2 border-gray-200 text-gray-900 px-6 py-4 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all duration-200 placeholder-gray-400" />
```

### Page Background
```jsx
<div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-emerald-50">
```

---

**Last Updated:** October 2025
**Version:** 1.0
**Maintained by:** Listening Room Design Team

