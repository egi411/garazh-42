// Контакты клиента — единственный источник правды на всём сайте.
// ЗАПОЛНИТЬ ДАННЫМИ КЛИЕНТА. Пустая строка = данных нет: CTA ведут на якорь #contacts,
// прямые ссылки на телефон/мессенджеры скрыты. Выдуманных номеров на странице нет.
const CONTACTS = { phone: "", whatsapp: "", telegram: "", address: "", hours: "" };

// Гараж 42 — минимум поведения: контакты, шапка, активный пункт, мобильное меню,
// одноразовое появление hero (микроанимация № 1). Библиотек нет.
(function () {
  'use strict';

  var hdr = document.getElementById('hdr');
  var burger = document.getElementById('burger');
  var mmenu = document.getElementById('mmenu');
  var mclose = document.getElementById('mclose');
  var each = function (sel, fn) { [].forEach.call(document.querySelectorAll(sel), fn); };

  // ——— 0. Контакты из CONTACTS ———
  var tel = String(CONTACTS.phone || '').replace(/[^\d+]/g, '');
  var wa = String(CONTACTS.whatsapp || '').replace(/\D/g, '');
  var tg = String(CONTACTS.telegram || '').replace(/^@|^https?:\/\/t\.me\//, '');
  var href = { phone: tel && 'tel:' + tel, whatsapp: wa && 'https://wa.me/' + wa, telegram: tg && 'https://t.me/' + tg };

  // CTA по странице: есть данные — работают, нет — остаются якорем на блок контактов
  each('[data-cta]', function (a) {
    var h = href[a.getAttribute('data-cta')];
    if (h) a.href = h;
  });
  // Прямые ссылки в блоке контактов: без данных их не показываем вовсе
  each('[data-link]', function (a) {
    var h = href[a.getAttribute('data-link')];
    if (h) { a.href = h; a.hidden = false; }
  });
  // Видимые значения: телефон, адрес, часы
  each('[data-contact]', function (el) {
    var v = CONTACTS[el.getAttribute('data-contact')];
    if (v) { el.textContent = v; el.hidden = false; }
  });
  // Строка состояния в блоке контактов живёт, пока не подключён ни один канал связи
  if (href.phone || href.whatsapp || href.telegram) each('[data-state="empty"]', function (el) { el.hidden = true; });

  // ——— 1. Микроанимация № 1: появление hero, один раз при загрузке ———
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  // ——— 2. Состояние шапки: сентинель 120px, не scroll-слушатель ———
  var sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:120px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(function (e) {
    hdr.classList.toggle('is-stuck', !e[0].isIntersecting);
  }, { threshold: 0 }).observe(sentinel);

  // ——— 3. Активный пункт навигации ———
  var links = {};
  each('.nav__list a', function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var secObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var a = links[en.target.id];
      if (a && en.isIntersecting) {
        for (var k in links) links[k].classList.remove('is-active');
        a.classList.add('is-active');
      }
    });
  }, { rootMargin: '-96px 0px -60% 0px', threshold: 0 });
  for (var id in links) {
    var sec = document.getElementById(id);
    if (sec) secObs.observe(sec);
  }

  // ——— 4. Мобильное меню: полноэкранная панель ———
  function openMenu() {
    mmenu.hidden = false;
    requestAnimationFrame(function () { mmenu.classList.add('is-open'); });
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    mclose.focus();
  }
  function closeMenu() {
    mmenu.classList.remove('is-open');
    mmenu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    burger.focus();
  }
  mmenu.addEventListener('keydown', function (e) { // Tab закольцован внутри панели
    if (e.key !== 'Tab') return;
    var f = mmenu.querySelectorAll('a[href], button'), a = document.activeElement;
    if (e.shiftKey && a === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  burger.addEventListener('click', openMenu);
  mclose.addEventListener('click', closeMenu);
  mmenu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !mmenu.hidden) closeMenu();
  });
})();
