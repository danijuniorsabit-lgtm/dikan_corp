Do these tasks, commit and push to main after all:

TASK 0 — Update logo to new PNG version:
A new logo file logo.png has been added to src/assets/images/
Replace the current logo in header with the new logo.png:
In header.njk change logo img src to /images/logo.png
Also update favicon to use the new logo:
Copy src/assets/images/logo.png to public/favicon.png
In base.njk head section update favicon links:
<link rel="icon" type="image/png" href="/images/logo.png">
<link rel="apple-touch-icon" href="/images/logo.png">
Remove references to old logo.jpg or logo.svg if they exist.
Run npm run build to verify logo appears correctly.

TASK 1 — Add missing staff photos on about page:
New photos added to src/assets/images/team/:
alinova.jpg — Алинова Зару
bailenov.jpg — Байленов Жанат
baranov.jpg — Баранов Анатолий
iskakov-kayrat.jpg — Искаков Кайрат Калкенович
iskakov-marat.jpg — Искаков Марат
ryspayev.jpg — Рыспаев Ерканат Кабакенович
ten-dinara.jpg — Тен Динара Канатовна

Find the team section in src/templates/components/about/about-section.njk or similar.
Add these 7 new team member cards with their photos.
Use same card style as existing team members.
If position/role is unknown use empty string for now.

TASK 2 — Update homepage "Реализованные объекты" section with 3 real projects:
Replace current 3 project cards on homepage with these real projects:

Project 1:
title: "Семенная линия по производству высококачественных семян кормовых культур"
client: "КазНИИР"
location: "Алматинская обл., Карасайский р-н, п.Алмалыбак"
year: 2026
image: "/images/projects/kazniiir.jpeg"
tag: "Алматинская обл."

Project 2:
title: "Семенная линия. Строительство 3-х бункерного ЗАВ"
client: "ТОО Даниловское"
location: "Акмолинская область, Буландинский район, с.Алтынды"
year: 2026
image: "/images/projects/danilovskoe.jpg"
tag: "Акмолинская обл."

Project 3:
title: "Зерноперерабатывающий комплекс 7-8 т/ч"
client: "Mustona Bustoni MCHJ"
location: "Республика Узбекистан, Ферганская область, Фуркатский район"
year: 2025
image: "/images/projects/uzbekistan-mustoni.jpg"
tag: "Узбекистан"

Update both index.njk homepage section AND src/templates/data/projects.json to include these projects at the top.

TASK 3 — Remove equipment items without photos:
Check which files exist in src/assets/images/equipment/ folder.
In equipment.html remove any cards that reference images not present in that folder.
Only show items with real local image files.

TASK 4 — Fix project count:
Replace "25+ реализованных проектов" with "100+ реализованных проектов" on projects page.

TASK 5 — Remove filter from products page:
Remove category filter tabs from products.html completely.
Show all products in grid without filtering UI.

TASK 6 — Fix FAQ mobile text wrapping:
In _faq.scss or main SCSS add for mobile:
.faq__question, .faq__answer { word-break: break-word; overflow-wrap: break-word; }
FAQ accordion padding on mobile: 12px 16px minimum.
Font-size on mobile: 15px for questions, 14px for answers.

Run npm run build, commit and push after all tasks.