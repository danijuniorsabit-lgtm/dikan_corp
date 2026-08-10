<?php 
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();

/**
 * Ported from src/templates/layouts/base.njk (<head> + <body> open) and
 * src/templates/components/header/header.njk. See docs/BITRIX-INTEGRATION.md
 * in the source repo for the full frontend -> Bitrix mapping.
 *
 * DEPLOYMENT NOTE — three folders are fetched at runtime by absolute,
 * site-root-relative URLs baked into the compiled template.js bundle
 * (product-detail.js's `fetch('/data/products.json')`, the header logo
 * `<img src="/images/logo.jpg">`, product-viewer.js's `/models/*.glb`).
 * Those are NOT template assets — SITE_TEMPLATE_PATH doesn't cover them.
 * Copy the source repo's public/data/, public/images/, and public/models/
 * folders to this Bitrix site's actual document root (sibling of /bitrix/,
 * /local/) or these three features (product routing, logo, 3D viewer) will
 * 404 in production even though the template itself loads fine.
 *
 * Nav is a hardcoded array here, ported from src/templates/data/nav.json —
 * see "Things to decide" in docs/BITRIX-INTEGRATION.md for turning this
 * into a real bitrix:menu component instance.
 */

$dikanNavItems = array(
    array("label" => "Главная", "href" => "/index.html"),
    array("label" => "Услуги", "href" => "/services.html"),
    array("label" => "Наши Продукты", "href" => "/products.html"),
    array("label" => "Оборудование", "href" => "/equipment.html"),
    array("label" => "Проекты", "href" => "/projects.html"),
    array("label" => "О компании", "href" => "/about.html"),
);
$dikanPhone = "+7 771 020 01 00";
$dikanPhoneHref = "tel:" . str_replace(" ", "", $dikanPhone);
$dikanCurPage = $APPLICATION->GetCurPage();

// SetTitle()/SetPageProperty("description", ...) are expected to have been
// called already by the page that included this file (standard Bitrix
// order) — mirrors seo.json's per-page title/description in the source.
$dikanSiteUrl = (CMain::IsHTTPS() ? "https://" : "http://") . $_SERVER["HTTP_HOST"];
$dikanCanonicalUrl = $dikanSiteUrl . $dikanCurPage;
$dikanOgTitle = $APPLICATION->GetTitle() ?: "DIKAN";
$dikanOgDescription = htmlspecialcharsbx($APPLICATION->GetProperty("description") ?: "");
?><!doctype html>
<html lang="ru">
<head>
<?php $APPLICATION->ShowHead();?>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?php $APPLICATION->ShowTitle();?></title>
<?php $APPLICATION->ShowMeta("description");?>
    <link rel="canonical" href="<?=htmlspecialcharsbx($dikanCanonicalUrl)?>" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="DIKAN" />
    <meta property="og:title" content="<?=htmlspecialcharsbx($dikanOgTitle)?>" />
    <meta property="og:description" content="<?=$dikanOgDescription?>" />
    <meta property="og:url" content="<?=htmlspecialcharsbx($dikanCanonicalUrl)?>" />
    <meta property="og:image" content="<?=htmlspecialcharsbx($dikanSiteUrl)?>/og-image.png" />
    <meta property="og:locale" content="ru_RU" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="<?=htmlspecialcharsbx($dikanOgTitle)?>" />
    <meta name="twitter:description" content="<?=$dikanOgDescription?>" />
    <meta name="twitter:image" content="<?=htmlspecialcharsbx($dikanSiteUrl)?>/og-image.png" />

    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "DIKAN",
        "url": "<?=$dikanSiteUrl?>",
        "logo": "<?=$dikanSiteUrl?>/favicon.svg",
        "foundingDate": "2005",
        "telephone": "<?=$dikanPhone?>",
        "email": "dikan@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Астана",
          "addressCountry": "KZ"
        },
        "sameAs": []
      }
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Unbounded:wght@500;700;800&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="<?=SITE_TEMPLATE_PATH?>/template_styles.css" />
<?php $APPLICATION->ShowHeadString("NEED_STYLES");?>
<?php $APPLICATION->ShowHeadStrings();?>
</head>
<body>
    <a class="skip-link" href="#main-content">Перейти к основному содержимому</a>

    <header class="header" data-header>
      <div class="container header__inner">
        <a class="header__logo" href="/index.html" aria-label="DIKAN — на главную">
          <img class="header__logo-img" src="/images/logo.jpg" alt="DIKAN" />
        </a>

        <nav class="header__nav" id="primary-navigation" data-header-nav aria-label="Основная навигация">
          <ul class="header__nav-list">
<?php 
foreach ($dikanNavItems as $navItem) {
    $isActive = ($navItem["href"] === $dikanCurPage);
    ?>
            <li class="header__nav-item">
              <a
                class="header__nav-link<?=$isActive ? " is-active" : ""?>"
                href="<?=htmlspecialcharsbx($navItem["href"])?>"
                <?=$isActive ? "aria-current=\"page\"" : ""?>
              ><?=htmlspecialcharsbx($navItem["label"])?></a>
            </li>
<?php 
}
?>
          </ul>
        </nav>

        <div class="header__actions">
          <a class="header__phone" href="<?=htmlspecialcharsbx($dikanPhoneHref)?>">
            <span class="header__icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 3h3.2l1.3 4-2 1.3a10 10 0 0 0 5.2 5.2l1.3-2 4 1.3V16a2 2 0 0 1-2 2C9.6 18 2 10.4 2 5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="header__phone-number"><?=htmlspecialcharsbx($dikanPhone)?></span>
          </a>

          <button
            class="header__icon-btn"
            type="button"
            data-search-toggle
            aria-expanded="false"
            aria-controls="header-search"
          >
            <span class="visually-hidden">Поиск по сайту</span>
            <span class="header__icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
                <path d="m17 17-3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
          </button>

          <button class="header__lang" type="button" aria-label="Язык сайта: русский">RU</button>

          <button
            class="header__burger"
            type="button"
            data-menu-toggle
            aria-expanded="false"
            aria-controls="primary-navigation"
          >
            <span class="visually-hidden">Открыть меню</span>
            <span class="header__icon" data-icon-open aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="header__icon" data-icon-close hidden aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </span>
          </button>
        </div>

        <form class="header__search" id="header-search" data-search-form hidden>
          <label class="visually-hidden" for="header-search-input">Поиск по сайту</label>
          <input
            id="header-search-input"
            class="header__search-input"
            type="search"
            name="q"
            placeholder="Найти технику, услугу…"
            autocomplete="off"
          />
          <button type="submit" class="header__search-submit">
            <span class="visually-hidden">Найти</span>
            <span class="header__icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
                <path d="m17 17-3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </span>
          </button>
        </form>
      </div>
    </header>

    <main id="main-content">
