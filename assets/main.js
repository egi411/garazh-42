// ═══════════ ДАННЫЕ КЛИЕНТА — единственный источник правды на всём сайте ═══════════
// ЗАПОЛНИТЬ ДАННЫМИ КЛИЕНТА. Пустая строка = данных нет: CTA ведут на якорь #contacts,
// прямые ссылки на телефон/мессенджеры скрыты. Выдуманных номеров на странице нет.
const CONTACTS = { phone: "", whatsapp: "", telegram: "", address: "", hours: "" };

// Профили компании в соцсетях и справочниках. Заполненные попадают
// в футер ссылками и в schema.org как sameAs. Пустые не выводятся нигде.
const SOCIALS = { vk: "", telegram: "", youtube: "", dzen: "", yandex: "", twogis: "", avito: "" };

// Реквизиты оператора для privacy.html. Пока пусты — на странице стоит
// честная строка «реквизиты не опубликованы», а не выдуманные ИНН и адрес.
const LEGAL = { entity: "", inn: "", ogrn: "", legalAddress: "", email: "" };

// Гараж 42 — минимум поведения: контакты, шапка, активный пункт, мобильное меню,
// одноразовое появление hero (микроанимация № 1), cookie-уведомление. Библиотек нет.
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

  // ——— 0.1. Соцсети: ссылки в футере + sameAs в разметке ———
  var socialNames = { vk: 'ВКонтакте', telegram: 'Telegram', youtube: 'YouTube', dzen: 'Дзен', yandex: 'Яндекс Карты', twogis: '2ГИС', avito: 'Авито' };
  var socialUrls = [];
  Object.keys(SOCIALS).forEach(function (k) {
    var v = String(SOCIALS[k] || '').trim();
    if (!v) return;
    if (k === 'telegram' && v.charAt(0) === '@') v = 'https://t.me/' + v.slice(1);
    if (!/^https?:/.test(v)) v = 'https://' + v;
    socialUrls.push({ key: k, url: v });
  });
  if (socialUrls.length) {
    each('[data-socials]', function (box) {
      box.hidden = false;
      socialUrls.forEach(function (s) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = s.url; a.rel = 'noopener me'; a.target = '_blank';
        a.textContent = socialNames[s.key] || s.key;
        li.appendChild(a); box.appendChild(li);
      });
    });
  }

  // Разметка: дописываем sameAs и телефон в узел организации, если данные появились
  if (socialUrls.length || tel) {
    each('script[type="application/ld+json"]', function (node) {
      var data;
      try { data = JSON.parse(node.textContent); } catch (e) { return; }
      var graph = data['@graph'];
      if (!graph) return;
      var org = graph.filter(function (n) { return /#organization$/.test(n['@id'] || ''); })[0];
      if (!org) return;
      if (socialUrls.length) org.sameAs = socialUrls.map(function (s) { return s.url; });
      if (tel) org.telephone = tel;
      node.textContent = JSON.stringify(data, null, 2);
    });
  }

  // ——— 0.2. Реквизиты оператора на правовой странице ———
  var legalFilled = 0;
  each('[data-legal]', function (el) {
    var v = String(LEGAL[el.getAttribute('data-legal')] || '').trim();
    var row = el.closest('div');
    if (v) { el.textContent = v; legalFilled++; }
    else if (row) { row.hidden = true; }
  });
  if (legalFilled) each('[data-legal-state="empty"]', function (el) { el.hidden = true; });

  // ——— 1. Микроанимация № 1: появление hero, один раз при загрузке ———
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });

  // ——— 2. Состояние шапки: сентинель 120px, не scroll-слушатель ———
  if (hdr && !hdr.classList.contains('hdr--slim')) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:120px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (e) {
      hdr.classList.toggle('is-stuck', !e[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

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
  if (burger && mmenu && mclose) {
    var openMenu = function () {
      mmenu.hidden = false;
      requestAnimationFrame(function () { mmenu.classList.add('is-open'); });
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-locked');
      mclose.focus();
    };
    var closeMenu = function () {
      mmenu.classList.remove('is-open');
      mmenu.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
      burger.focus();
    };
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
  }

  // ——— 5. Cookie-уведомление ———
  // Выбор хранится 12 месяцев в localStorage; счётчики подключаются только после «Принимаю».
  var ck = document.getElementById('cookie');
  var CK_KEY = 'g42:cookie-consent';
  var CK_TTL = 365 * 24 * 60 * 60 * 1000;

  var readChoice = function () {
    try {
      var v = JSON.parse(localStorage.getItem(CK_KEY) || 'null');
      if (!v || !v.choice || !v.at) return null;
      return (Date.now() - v.at > CK_TTL) ? null : v.choice;
    } catch (e) { return null; }
  };
  var applyChoice = function (choice) {
    window.G42Consent = choice;
    document.documentElement.setAttribute('data-consent', choice);
    document.dispatchEvent(new CustomEvent('g42:consent', { detail: choice }));
    // Счётчики (Метрика/Analytics) подключаются здесь и только при choice === 'all'.
  };
  var showBanner = function () {
    if (!ck) return;
    ck.hidden = false;
    requestAnimationFrame(function () { ck.classList.add('is-shown'); });
  };
  var hideBanner = function () {
    if (!ck) return;
    ck.classList.remove('is-shown');
    setTimeout(function () { ck.hidden = true; }, 320);
  };

  var saved = readChoice();
  if (saved) applyChoice(saved);
  else if (ck) setTimeout(showBanner, 700); // не мешаем первому экрану

  each('[data-cookie]', function (btn) {
    btn.addEventListener('click', function () {
      var choice = btn.getAttribute('data-cookie');
      try { localStorage.setItem(CK_KEY, JSON.stringify({ choice: choice, at: Date.now(), v: 1 })); } catch (e) {}
      applyChoice(choice);
      hideBanner();
    });
  });
  // «Настройки cookie» в футере и в тексте политики — вызвать уведомление заново
  each('[data-cookie-open]', function (btn) {
    btn.addEventListener('click', function () {
      showBanner();
      var first = ck && ck.querySelector('[data-cookie]');
      if (first) first.focus();
    });
  });
})();
