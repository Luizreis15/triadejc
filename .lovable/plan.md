

## Changes

### `src/pages/member/ProductsShowcase.tsx`

1. **Remove hero buttons** (lines 95-107): Delete the two CTA buttons, the flex container, and the micro-text below them. Keep only the headline, subtitle, and image.

2. **Fix hero image aspect ratio** (line 109-111): Replace `max-h-80` with `aspect-[4/5]` and ensure `object-cover` plus `object-top` so the image displays fully without awkward cropping.

