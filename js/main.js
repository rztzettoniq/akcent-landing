/* =====================================================================
   Рекламное агентство «АКЦЕНТ» — сценарии лендинга
   Мобильное меню, модальное окно обратного звонка, маска телефона
   и клиентская проверка форм.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------ мобильное меню */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* -------------------------------------------- модальное окно ЗЗ */
  var modal = document.getElementById('callback');
  var lastFocused = null;

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var first = modal.querySelector('input');
    if (first) first.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-callback]').forEach(function (b) {
    b.addEventListener('click', openModal);
  });
  if (modal) {
    modal.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', closeModal);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  /* ------------------------------------------------ маска телефона */
  function maskPhone(el) {
    el.addEventListener('input', function () {
      var d = el.value.replace(/\D/g, '');
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d[0] !== '7') d = '7' + d;
      d = d.slice(0, 11);
      var out = '+7';
      if (d.length > 1) out += ' (' + d.slice(1, 4);
      if (d.length >= 5) out += ') ' + d.slice(4, 7);
      if (d.length >= 8) out += '-' + d.slice(7, 9);
      if (d.length >= 10) out += '-' + d.slice(9, 11);
      el.value = out;
    });
    el.addEventListener('focus', function () {
      if (!el.value) el.value = '+7 ';
    });
    el.addEventListener('blur', function () {
      if (el.value.replace(/\D/g, '').length < 2) el.value = '';
    });
  }
  document.querySelectorAll('input[type="tel"]').forEach(maskPhone);

  /* ---------------------------------------------- проверка формы */
  function setError(field, message) {
    var box = field.form.querySelector('[data-err-for="' + (field.id || field.name) + '"]');
    if (box) box.textContent = message || '';
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validate(form) {
    var ok = true;

    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      if (f.type === 'checkbox') {
        if (f.required && !f.checked) {
          setError(f, 'Нужно согласие на обработку данных');
          ok = false;
        } else {
          setError(f, '');
        }
        return;
      }
      if (f.required && !f.value.trim()) {
        setError(f, 'Заполните поле');
        ok = false;
        return;
      }
      if (f.type === 'tel' && f.value && f.value.replace(/\D/g, '').length !== 11) {
        setError(f, 'Введите номер полностью');
        ok = false;
        return;
      }
      if (f.minLength > 0 && f.value.trim().length && f.value.trim().length < f.minLength) {
        setError(f, 'Слишком короткое значение');
        ok = false;
        return;
      }
      setError(f, '');
    });

    if (!ok) {
      var bad = form.querySelector('[aria-invalid="true"]');
      if (bad) bad.focus();
    }
    return ok;
  }

  function wire(formId, okId) {
    var form = document.getElementById(formId);
    var ok = document.getElementById(okId);
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;

      /* Учебный проект: серверная часть не подключена.
         Данные собираются и выводятся в консоль; чтобы включить реальную
         отправку, укажите адрес обработчика в константе ENDPOINT. */
      var ENDPOINT = '';
      var data = Object.fromEntries(new FormData(form).entries());
      console.log('Заявка «АКЦЕНТ»:', data);

      var done = function () {
        form.reset();
        if (ok) {
          ok.hidden = false;
          setTimeout(function () { ok.hidden = true; }, 6000);
        }
        if (form.id === 'cbForm') setTimeout(closeModal, 2500);
      };

      if (ENDPOINT) {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(done).catch(done);
      } else {
        done();
      }
    });

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') setError(e.target, '');
    });
  }

  wire('orderForm', 'formOk');
  wire('cbForm', 'cbOk');

  /* ------------------------------- подсветка активного пункта меню */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.style.color = a.getAttribute('href') === '#' + en.target.id
            ? 'var(--accent)' : '';
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }
})();
