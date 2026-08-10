Step 13 - Bitrix integration. Create the template files for /local/templates/dikan_corp/:

1. description.php - template name and description
2. .parameters.php - template parameters  
3. header.php - full site header with Bitrix tags: <?$APPLICATION->ShowHead()?>, <?$APPLICATION->ShowTitle()?>, <?$APPLICATION->ShowHeadString("NEED_STYLES")?>, include CSS/JS assets
4. footer.php - full site footer with <?$APPLICATION->ShowPanel()?>
5. template_styles.css - import compiled CSS from dist/

Use SITE_TEMPLATE_PATH constant for all asset paths.
All HTML from current header.njk and footer.njk should be converted to PHP.
Navigation links should use relative URLs.
Create these files in a new folder: bitrix/dikan_corp/
Run npm run build first to get the latest dist/ files.