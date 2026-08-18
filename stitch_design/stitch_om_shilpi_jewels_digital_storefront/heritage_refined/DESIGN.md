---
name: Heritage Refined
colors:
  surface: '#fdf9f2'
  surface-dim: '#dddad3'
  surface-bright: '#fdf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ec'
  surface-container: '#f1ede6'
  surface-container-high: '#ebe8e1'
  surface-container-highest: '#e6e2db'
  on-surface: '#1c1c18'
  on-surface-variant: '#4f4539'
  inverse-surface: '#31302c'
  inverse-on-surface: '#f4f0e9'
  outline: '#817567'
  outline-variant: '#d2c4b4'
  surface-tint: '#7b5818'
  primary: '#7b5818'
  on-primary: '#ffffff'
  primary-container: '#b98f4a'
  on-primary-container: '#412a00'
  inverse-primary: '#eebf75'
  secondary: '#645d56'
  on-secondary: '#ffffff'
  secondary-container: '#ebe1d7'
  on-secondary-container: '#6a635c'
  tertiary: '#665d4e'
  on-tertiary: '#ffffff'
  tertiary-container: '#9f9583'
  on-tertiary-container: '#342e21'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdead'
  primary-fixed-dim: '#eebf75'
  on-primary-fixed: '#281900'
  on-primary-fixed-variant: '#604100'
  secondary-fixed: '#ebe1d7'
  secondary-fixed-dim: '#cec5bc'
  on-secondary-fixed: '#1f1b15'
  on-secondary-fixed-variant: '#4c463f'
  tertiary-fixed: '#ede1cd'
  tertiary-fixed-dim: '#d0c5b2'
  on-tertiary-fixed: '#201b0f'
  on-tertiary-fixed-variant: '#4d4637'
  background: '#fdf9f2'
  on-background: '#1c1c18'
  surface-variant: '#e6e2db'
typography:
  h1:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h1-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h2-mobile:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  meta:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system embodies a premium, modern Indian luxury aesthetic. It balances the heritage of artisanal jewelry with a clean, contemporary shopping experience. The personality is trustworthy, warm, and sophisticated, avoiding gaudy ornamentation in favor of balanced whitespace and editorial-grade typography.

The visual style is **Corporate Modern with Minimalist influences**. It focuses on high-quality product photography set against a warm, tonal palette. UI elements are structured and purposeful, ensuring the jewelry remains the focal point while providing a seamless, high-end commercial feel.

## Colors
The palette is rooted in "Champagne and Charcoal," creating a high-contrast yet warm environment. 

- **Primary (Gold Accent):** A muted, matte gold used intentionally for calls to action, active states, and delicate iconography. 
- **Secondary (Charcoal):** Used for all primary text and structural UI elements to ensure grounded readability.
- **Backgrounds:** Use Ivory for the global page background to maintain a sense of airiness. Use Champagne for section blocks, product cards, and drawers to create soft depth.
- **Borders:** Subtle Beige borders provide structure without creating harsh visual breaks.

## Typography
The typographic scales rely on the interplay between the high-contrast **Playfair Display** (Serif) for storytelling and the functional **Montserrat** (Sans-serif) for utility.

- **Headlines:** Always use Playfair Display. Reserve H1 for hero sections and editorial headers.
- **Body & UI:** Montserrat is used for all functional text. Use the `label-md` style with increased letter spacing for buttons, navigation links, and small category headers to evoke a premium feel.
- **Alignment:** Centralize headings for hero and collection banners; use left-alignment for product descriptions and checkout flows.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop (1280px max-width) and a fluid model on mobile. 

- **Rhythm:** Use an 8px incremental system. Section vertical padding should be generous (48px to 80px) to allow the jewelry pieces "room to breathe."
- **Grid:** A 12-column grid for desktop with 24px gutters.
- **Mobile:** Transition to a 2-column grid for product listings to maximize image size. Side margins should be a minimum of 16px.

## Elevation & Depth
Depth is conveyed primarily through **Tonal Layering** and **Low-contrast Outlines** rather than heavy shadows.

- **Surface Levels:** 
  - Level 0: Ivory (#FAF6EF) - Base background.
  - Level 1: Champagne (#F0E4D0) - Product cards, feature sections.
  - Level 2: White (#FFFFFF) - Modals, tooltips, and floating navigation.
- **Shadows:** Use a single, highly diffused shadow (0px 4px 20px, 5% opacity Charcoal) exclusively for hover states on product cards and primary buttons to indicate interactivity.
- **Outlines:** Use 1px Beige (#E7DCC8) borders for input fields and static cards.

## Shapes
The shape language is refined and conservative. 

- **Corners:** Standard UI components (buttons, inputs, cards) use a **4px to 8px radius**. This "Soft" approach maintains a modern feel without looking overly casual or "bubbly."
- **Product Imagery:** Jewelry images should be contained in either sharp-edged or slightly softened containers (8px) to maintain a professional gallery aesthetic.
- **Icons:** Use thin-stroke (1px to 1.5px) linear icons with slightly rounded caps to match the typography.

## Components
- **Buttons:** 
  - *Primary:* Solid Gold (#B98F4A) with White text. No gradients.
  - *Secondary:* Transparent with a Charcoal border and text.
  - *Text:* All-caps Montserrat, medium weight, with 0.05em letter spacing.
- **Cards:** 
  - Use Champagne (#F0E4D0) as the card background. 
  - Subtle 1px Beige border.
  - No shadow in static state; apply elevation on hover.
- **Inputs:** 
  - 1px Beige border, Ivory background. 
  - Focused state uses a 1px Gold border. 
  - Error states use a 1px Error (#A33B3B) border with Meta-sized error text below.
- **Chips/Badges:** 
  - Used for "New Arrival" or "Certified Gold." 
  - Use thin Charcoal borders with Meta typography.
- **Dividers:** 
  - 1px solid Beige. 
  - For editorial sections, use a short, centered 2px thick Gold divider.
- **Lists:**
  - Standard product metadata (Weight, Purity) should be presented in clean rows with light Beige separators.