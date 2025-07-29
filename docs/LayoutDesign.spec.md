# Layout System Documentation

## Core Layout Principles

### Golden Ratio Foundation (φ = 1.618)
The layout system is built around the Golden Ratio for harmonious proportions:

```css
:root {
  --golden-ratio: 1.618;
  --inverse-golden-ratio: 0.618;
}
```css
Base Spacing Units:
--space-xs: 0.25rem (4px)
--space-sm: 0.5rem (8px)
--space-md: 1rem (16px)
--space-lg: 1.618rem (~26px)
--space-xl: 2.618rem (~42px)

#### Left Navigation Grid Example
This CSS defines a desktop layout with a left navigation bar, header, main content, and footer using grid areas:
```css
.left-nav {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas:
    "nav header"
    "nav main"
    "nav main"
    "nav footer";
}
 
```

#### Right Navigation Grid Example
This CSS defines a desktop layout with a right navigation bar, main content, and footer using grid areas:
```css
.right-nav {
  display: grid;
  grid-template-columns: 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header nav"
    "main nav"
    "footer nav";
}
```

#### Top Navigation Grid Example
This CSS defines a desktop layout with a top navigation bar, main content, and footer using grid areas:
```css
.top-nav {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas:
    "nav"
    "header"
    "main"
    "footer";
}

 
```



#### Mobile Grid (Grid Areas)
```css
.mobile-device {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header"
    "main"
    "footer";
}

.left-nav    { display: none; }
.site-header { grid-area: header; }
.main-component { grid-area: main; }
.site-footer { grid-area: footer; }
```

### 2. Spacing System
```css
Base Spacing Units:
  <site-nav></site-nav>
  <top-nav></top-nav>
- --space-xs: 0.25rem (4px)
- --space-sm: 0.5rem (8px)
- --space-md: 1rem (16px)
- --space-lg: 1.618rem (~26px)
- --space-xl: 2.618rem (~42px)
```

## Layout Patterns

### 1. Navigation Layouts

#### Left Navigation (Grid Areas)
```html
<div class="mobile-device">
  <left-nav></left-nav>
  <site-header></site-header>
  <main-component></main-component>
  <site-footer></site-footer>
</div>
```


#### Top Navigation (Header)
```html
<div class="site-container">
  <top-nav></top-nav>
  <main-component></main-component>
  <site-footer></site-footer>
</div>
```

#### Right Navigation (Right Sidebar Layout)
```html
<div class="site-container">
  <main-component></main-component>
  <right-nav></right-nav>
  <site-footer></site-footer>
</div>
```

#### Left + Top + Right Layout (Three-Region Grid)
```html
<div class="site-container">
  <site-nav></site-nav>
  <site-header></site-header>
  <main-component></main-component>
  <site-sidebar></site-sidebar>
  <site-footer></site-footer>
</div>
```

### 2. Content Layouts

**Content layout** refers to how the main content area of a page is visually organized within the grid. It determines the arrangement of sections, cards, grids, text, images, and other elements inside the main grid area (not the navigation, header, or footer). Content layouts help structure information for clarity, usability, and aesthetics, and can include patterns like grids, cards, split panels, or single-column flows.

#### Grid Layout
```css
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-md);
}
```

#### Card Layout
```css
.content-card {
  padding: var(--space-lg);
  margin: var(--space-md);
  border-radius: 12px;
}
```

## Responsive Design

### 1. Breakpoints
```css
Key Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
```

### 2. Mobile-First Principles
- Stack layouts on mobile
- Expand to grid on larger screens
- Collapsible navigation on mobile
- Touch-friendly spacing

## Layout Components

### 1. Hero Section
```html
<section class="hero-section">
  <div class="hero-content">
    <h1><!-- Title --></h1>
    <p><!-- Description --></p>
    <div class="cta-buttons">
      <!-- Call to action buttons -->
    </div>
  </div>
</section>
```

### 2. Content Sections
```html
<section class="content-section">
  <h2 class="section-title"><!-- Title --></h2>
  <div class="content-grid">
    <!-- Content cards -->
  </div>
</section>
```

## Container System

### 1. Main Container
```css
.site-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-md);
}
```

### 2. Nested Containers
```css
.content-container {
  width: 100%;
  padding: var(--space-lg);
}
```

## Best Practices

### 1. Layout Implementation
- Use CSS Grid for main layouts
- Flexbox for component layouts
- Maintain consistent spacing
- Follow mobile-first approach

### 2. Spacing Guidelines
- Use spacing variables consistently
- Maintain rhythm with Golden Ratio
- Adapt spacing for mobile devices
- Keep consistent padding/margins

### 3. Responsive Considerations
- Test all breakpoints
- Ensure touch targets on mobile
- Maintain readability at all sizes
- Check for layout shifts

## Common Patterns

### 1. Card Grid
```html
<div class="content-grid">
  <article class="content-card">
    <!-- Card content -->
  </article>
</div>
```

### 2. Split Layout
```html
<div class="split-layout">
  <div class="split-content">
    <!-- Left content -->
  </div>
  <div class="split-content">
    <!-- Right content -->
  </div>
</div>
```

## Testing Guidelines

### 1. Responsive Testing
- Test all major breakpoints
- Check common devices
- Verify touch interactions
- Test orientation changes

### 2. Layout Validation
- Check for overflow issues
- Verify spacing consistency
- Test with dynamic content
- Validate accessibility

## Performance Considerations

### 1. Layout Performance
- Minimize layout shifts
- Optimize reflow triggers
- Use content-visibility
- Implement will-change properly

### 2. Mobile Optimization
- Reduce animation complexity
- Optimize touch interactions
- Minimize layout calculations
- Use efficient selectors

## Accessibility Guidelines

### 1. Layout Accessibility
- Logical tab order
- Skip navigation links
- Landmark regions
- Proper heading hierarchy

### 2. Responsive Accessibility
- Maintain readability
- Touch target sizes
- Keyboard navigation
- Focus management
