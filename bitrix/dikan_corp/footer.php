<?php 
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();

/**
 * Ported from src/templates/layouts/base.njk (</body> close) +
 * src/templates/components/contacts/cta-banner.njk +
 * src/templates/components/footer/footer.njk.
 *
 * The newsletter form still just posts nowhere useful (matches the
 * source's "no backend yet" state) — see docs/BITRIX-INTEGRATION.md's
 * "Contact/newsletter form backends" open item. Point its handler at a
 * real Bitrix CRM webform when that's decided; don't wire it blind.
 */
?>
    </main>

    <section class="cta-banner">
      <div class="container cta-banner__inner">
        <div class="cta-banner__brand">
          <span class="cta-banner__mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="20" cy="20" r="19" stroke="currentColor" stroke-width="1.4"/>
              <path d="M20 9c3 3 4.5 6.5 4.5 10s-1.5 7-4.5 10c-3-3-4.5-6.5-4.5-10S17 12 20 9Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
              <path d="M20 12.5v14M13.5 20h13" stroke="currentColor" stroke-width="1.1"/>
            </svg>
          </span>
          <p class="cta-banner__text">Мы являемся лидером в своей области</p>
        </div>
        <a class="btn btn--primary" href="/about.html">
          <span>О компании</span>
        </a>
      </div>
    </section>

    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__brand">
          <p class="footer__logo">DIKAN</p>
          <p class="footer__tagline text-secondary">
            Зерноочистительное оборудование, которое окупается за 1 сезон.
          </p>
          <ul class="footer__socials">
            <li>
              <a class="footer__social-link" href="#" aria-label="DIKAN во Facebook">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12.5 6.5H11a1 1 0 0 0-1 1V9h2.5l-.35 2.2H10V17H7.7v-5.8H6V9h1.7V7.2C7.7 5.4 8.7 4.4 10.4 4.4h2.1v2.1Z" fill="currentColor"/>
                </svg>
              </a>
            </li>
            <li>
              <a class="footer__social-link" href="#" aria-label="DIKAN в Twitter">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M16.5 5.3c-.5.2-1 .4-1.6.5a2.8 2.8 0 0 0-4.8 2.5A7.9 7.9 0 0 1 4.3 5a2.8 2.8 0 0 0 .9 3.7c-.5 0-.9-.1-1.3-.3v.1c0 1.4 1 2.5 2.3 2.8-.4.1-.9.1-1.3.1l-.3-.1a2.8 2.8 0 0 0 2.6 1.9 5.6 5.6 0 0 1-4.1 1.1 7.9 7.9 0 0 0 12.1-6.7v-.4c.5-.4 1-.9 1.3-1.4-.5.2-1 .4-1.6.5.6-.3 1-.9 1.2-1.5Z" fill="currentColor"/>
                </svg>
              </a>
            </li>
            <li>
              <a class="footer__social-link" href="#" aria-label="DIKAN на YouTube">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="2.5" y="5.5" width="15" height="9" rx="2.5" stroke="currentColor" stroke-width="1.4"/>
                  <path d="M8.5 8.3v3.4l3-1.7-3-1.7Z" fill="currentColor"/>
                </svg>
              </a>
            </li>
            <li>
              <a class="footer__social-link" href="#" aria-label="DIKAN в Instagram">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3" y="3" width="14" height="14" rx="4" stroke="currentColor" stroke-width="1.4"/>
                  <circle cx="10" cy="10" r="3.2" stroke="currentColor" stroke-width="1.4"/>
                  <circle cx="14" cy="6" r="0.9" fill="currentColor"/>
                </svg>
              </a>
            </li>
          </ul>
        </div>

        <nav class="footer__links" aria-label="Полезные ссылки">
          <p class="footer__heading">Полезные ссылки</p>
          <ul>
            <li><a href="/projects.html">Новые проекты</a></li>
            <li><a href="/services.html">Наши услуги</a></li>
            <li><a href="/products.html">Рекомендации</a></li>
            <li><a href="/about.html">О нас</a></li>
            <li><a href="/finance.html">Связаться с нами</a></li>
          </ul>
        </nav>

        <div class="footer__newsletter">
          <p class="footer__heading">Новостная рассылка</p>
          <p class="text-secondary">
            Подпишитесь на нашу еженедельную рассылку новостей и получайте обновления по электронной
            почте.
          </p>
          <form class="newsletter-form" data-newsletter-form novalidate>
            <label class="visually-hidden" for="newsletter-email">Email</label>
            <input
              id="newsletter-email"
              class="newsletter-form__input"
              type="email"
              name="email"
              placeholder="Enter yor mail here..."
              required
            />
            <button type="submit" class="newsletter-form__submit">GO</button>
          </form>
          <p class="newsletter-form__status text-small" data-newsletter-status role="status" aria-live="polite"></p>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="container footer__bottom-inner">
          <p>Copyright &copy;DIKAN. Все права защищены.</p>
          <div class="footer__legal">
            <a href="#">Правила &amp; Условия</a>
            <a href="#">Политика Конфиденциальности</a>
          </div>
        </div>
      </div>
    </footer>

    <script type="module" src="<?=SITE_TEMPLATE_PATH?>/template.js"></script>
<?php $APPLICATION->ShowHeadString("NEED_JS");?>
<?php $APPLICATION->ShowPanel();?>
</body>
</html>
