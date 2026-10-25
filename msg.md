Do these tasks, commit and push to main after all:

TASK 1 — Create individual pages for 3D project visualizations:
Create 4 new HTML pages for each 3D project visualization:
- project-3d-jcm-mpo-trier.html
- project-3d-malaya-ustanovka.html
- project-3d-zernokomlex-90t.html
- project-3d-bulaevo-marat.html

Each page should have:
- Full header and footer (extend base.njk)
- Large Three.js canvas taking up most of the screen (height: 70vh minimum)
- OrbitControls: rotate, zoom, pan
- Auto-rotate that stops when user interacts
- Loading spinner with percentage
- Project title as page heading
- Back button "← Назад к проектам" linking to projects.html
- Lighting: ambient + directional + hemisphere lights

Map pages to GLB files:
- project-3d-jcm-mpo-trier.html → /models/project-jcm-mpo-trier.glb, title: "JCM + МПО + Триер с бункером"
- project-3d-malaya-ustanovka.html → /models/project-malaya-ustanovka.glb, title: "Малая установка"
- project-3d-zernokomlex-90t.html → /models/project-zernokomlex-90t.glb, title: "Зернокомплекс 90 т/ч"
- project-3d-bulaevo-marat.html → /models/project-bulaevo-marat.glb, title: "Булаево Марат"

Add these 4 pages to vite.config.js pages list.

On homepage index.njk in the "3D-визуализации наших проектов" section:
Add a button under each 3D card: "Открыть полноэкранно →" linking to the corresponding page.

TASK 2 — Add photos to projects in projects.json:
Find these projects and update their image field:
- Client "КХ «Али»" or similar → image: "/images/projects/kh-ali.jpg"
- Client "ТОО «ХПП Арна»" → image: "/images/projects/hpp-arna.jpg"
- Client "ТОО «Бетеге У»" → image: "/images/projects/betege-u.jpg"

TASK 3 — Update YouTube links in projects.json:
- Find project with client "ТОО «Агрофирма Жер 888»" and update youtubeUrl to: https://www.youtube.com/watch?v=tHo9Wp2ZvzY
- Find project with client "ТОО «Бетеге У»" and add youtubeUrl: https://www.youtube.com/watch?v=qDahiQyOfHc

Run npm run build, commit and push after all tasks.