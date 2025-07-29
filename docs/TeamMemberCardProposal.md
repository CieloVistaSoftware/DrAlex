# Proposal: Team Member Card Web Component

## Overview

Convert the following markup into a reusable web component `<team-member-card>`, encapsulating team member profile display and styling for easy reuse and customization.

## Input Properties (Attributes)

- `name` (string): Team member’s full name.  
  Example: `"Nassereka Suzan"`
- `role` (string): Job title or role.  
  Example: `"Opthalmalic Clinical Officer"`
- `description` (string): Short bio or experience summary.  
  Example: `"Experience Needed Here."`
- `image-src` (string): URL to the team member’s image.  
  Example: `"images/NasserekaSuzan.jpg"`  
  If not provided, a placeholder is shown.
- `image-alt` (string): Alt text for the image.  
  Example: `"Photo of Nassereka Suzan"`
- `image-size` (string, optional): Desired image size, default `"400x400"`.

## Example Usage

```html
<team-member-card
  name="Nassereka Suzan"
  role="Opthalmalic Clinical Officer"
  description="Experience Needed Here."
  image-src=""
  image-alt="Photo of Nassereka Suzan"
  image-size="400x400"
></team-member-card>
```

## Features

- Shows a styled placeholder if `image-src` is empty or missing.
- All content is styled for dark mode by default.
- Layout and styles are encapsulated.

## Benefits

- Consistent appearance for all team members.
- Easy to add, update, or remove team members by changing attributes.
- Can be extended with slots for more customization (e.g., social links).

---

**Sample Markup for Reference:**

```html
<div class="content-card">
  <div
    class="about-profile-image about-profile-placeholder"
    style="width:400px; max-width:100%; height:400px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#222c36; border:2px dashed #4a6a8a; color:#e0e6ed;"
  >
    <span style="width:400px; display:block; text-align:center;"
      >Image Needed</span
    >
    <span
      style="width:400px; display:block; text-align:center; font-size:0.9em; color:#8ca0b3;"
      >Optimal size: 400x400px (JPG or PNG)</span
    >
    <h3 class="card-title">Nassereka Suzan</h3>
    <p class="card-description">
      <strong>Opthalmalic Clinical Officer</strong><br />
      Experience Needed Here.
    </p>
  </div>
</div>
```
