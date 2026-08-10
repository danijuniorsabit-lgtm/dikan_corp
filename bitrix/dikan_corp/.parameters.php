<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();

// Template-level settings exposed in the admin "Site templates" editor.
// Minimal boilerplate for now — nothing in the ported frontend actually
// branches on a template parameter yet (nav/phone/etc. are still the
// static values from src/templates/data/nav.json). Extend this array as
// real per-site customization needs come up.
$arTemplateParameters = array(
    "SHOW_PHONE_IN_HEADER" => array(
        "PARENT" => "BASE_TEMPLATE",
        "NAME" => "Показывать телефон в шапке сайта",
        "TYPE" => "CHECKBOX",
        "DEFAULT" => "Y",
    ),
);
