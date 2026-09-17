Check equipment page - some items still showing without photos. 
1. Read src/templates/data/equipment.json and list all items
2. Run: find src/assets/images/equipment/ -type f to see what images actually exist
3. Remove from equipment.json any items whose image file does not exist in src/assets/images/equipment/
4. Also check equipment.html or equipment.njk template - if items are hardcoded there too, remove ones without photos
5. Run npm run build, commit and push