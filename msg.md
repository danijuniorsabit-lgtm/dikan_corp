Add background photos to the 3 hero slider slides on the homepage.

The hero slider has 3 slides. Add a full-width background image to each slide with a dark overlay so text stays readable.

SLIDE 1 "Комплексные решения для агробизнеса" (dark navy background):
Background photo: https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80
(golden wheat field at sunset)
Overlay: rgba(13, 27, 46, 0.72)

SLIDE 2 "Мы отделяем зёрна от плевел" (dark olive background):
Background photo: https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1920&q=80
(grain/wheat seeds close up)
Overlay: rgba(30, 40, 10, 0.70)

SLIDE 3 "Зерноочистка, которая окупается за 1 сезон" (dark charcoal background):
Background photo: https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80
(harvesting combine in field)
Overlay: rgba(20, 20, 20, 0.72)

Implementation:
- Find the hero slider component (hero-slider.js or index.njk hero section)
- Each slide div should have: background-image set via inline style or data attribute
- Add CSS: background-size: cover, background-position: center, background-repeat: no-repeat
- The overlay should be a ::before pseudo-element or inner div with position:absolute
- Text content must remain fully visible and readable on top of the overlay
- Keep all existing text, buttons, dots navigation and arrows unchanged
- Run npm run build after