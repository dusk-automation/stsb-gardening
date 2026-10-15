/* S.T.S.B Gardening Services: design preview by Dusk. Nothing on this site sends data anywhere. */
(function () {
  'use strict';
  var d = document, r = d.documentElement, W = window;
  W.__stsb = 1;
  var motion = r.classList.contains('motion');
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var small = W.matchMedia('(max-width: 760px)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);

  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* moving between pages through the site's own links skips the intro on the next page */
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/^(https?:|tel:|mailto:|sms:|#)/.test(h) || a.target === '_blank') return;
    try { sessionStorage.setItem('stsb-nav', '1'); } catch (err) {}
  }, true);

  /* ---------- header, menu, call bar ---------- */
  var hdr = $('.hdr'), callbar = $('.callbar'), isHome = d.body.classList.contains('page-home');
  function hdrUpdate() {
    var y = W.scrollY || W.pageYOffset || 0;
    if (hdr) hdr.classList.toggle('solid', y > 30);
    if (callbar) callbar.classList.toggle('show', y > (isHome ? W.innerHeight * 0.55 : 140));
  }

  var mbtn = $('.menu-btn'), mnav = $('#mnav'), lastFocus = null;
  function menu(open) {
    if (!mnav) return;
    mnav.classList.toggle('open', open);
    mnav.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (mbtn) mbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    d.body.classList.toggle('no-scroll', open);
    if (open) { lastFocus = d.activeElement; var f = $('.mnav-close', mnav); if (f) setTimeout(function () { f.focus(); }, 60); }
    else if (lastFocus) { lastFocus.focus(); }
  }
  if (mbtn) mbtn.addEventListener('click', function () { menu(true); });
  if (mnav) {
    $$('.mnav-close', mnav).forEach(function (b) { b.addEventListener('click', function () { menu(false); }); });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
    mnav.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') menu(false);
      if (e.key === 'Tab') {
        var f = $$('a,button', mnav), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- intro: logo grows, then a leaf-shaped window opens onto the page ---------- */
  var intro = $('.intro');
  function ready() { r.classList.add('ready'); }
  if (intro && r.classList.contains('intro-on')) runIntro();
  else { if (intro) intro.parentNode.removeChild(intro); ready(); }

  function runIntro() {
    var fill = $('.im .fill', intro), edge = $('.im .edge', intro);
    var done = false, timers = [];
    var L = [[0, -20], [12, -12], [13, 8], [0, 20], [-13, 8], [-12, -12], [0, -20]];
    var rot = -32 * Math.PI / 180, c = Math.cos(rot), sn = Math.sin(rot);
    var outer = 'M-90 -90H90V90H-90Z';
    function leaf(s) {
      var p = L.map(function (q) { var x = q[0] * s, y = q[1] * s; return (x * c - y * sn).toFixed(3) + ' ' + (x * sn + y * c).toFixed(3); });
      return 'M' + p[0] + 'C' + p[1] + ' ' + p[2] + ' ' + p[3] + 'C' + p[4] + ' ' + p[5] + ' ' + p[6] + 'Z';
    }
    function setS(s) { var lp = leaf(s); fill.setAttribute('d', outer + lp); edge.setAttribute('d', lp); }
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    fill.setAttribute('d', outer);
    // start the animation on the next frame so the starting state is painted first
    timers.push(setTimeout(function () { intro.classList.add('go'); }, 30));
    timers.push(setTimeout(open, 2500));
    function open() {
      if (done) return;
      intro.classList.add('out');
      var dur = 1300, st = 0;
      edge.style.opacity = '1';
      function frame(now) {
        if (done) return;
        if (!st) st = now;
        var t = clamp((now - st) / dur, 0, 1), e = ease(t);
        setS(0.15 + e * 11);
        edge.style.opacity = String(1 - t * t);
        if (t > 0.5) ready();
        if (t < 1) requestAnimationFrame(frame); else finish();
      }
      requestAnimationFrame(frame);
      timers.push(setTimeout(finish, dur + 450)); // backup when the tab is in the background
    }
    function finish() {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      r.classList.remove('intro-on');
      ready();
      if (intro.parentNode) intro.parentNode.removeChild(intro);
      d.removeEventListener('keydown', onKey);
      hdrUpdate();
    }
    function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish(); }
    intro.addEventListener('click', finish);
    d.addEventListener('keydown', onKey);
  }

  /* ---------- home hero: three clips that cross-fade ---------- */
  var hm = $('.hero-media');
  if (hm) (function () {
    var vids = $$('video', hm), btns = $$('.clips button'), clips = $('.clips'), idx = 0, timer = null, DUR = 6000, inView = true;
    function load(v) { if (!v.getAttribute('src')) { v.src = small ? v.getAttribute('data-sm') : v.getAttribute('data-lg'); } }
    function play(v) { var p; try { p = v.play(); } catch (e) {} if (p && p.catch) p.catch(function () {}); }
    if (!motion || saveData) { vids[0].classList.add('on'); if (clips) clips.style.display = 'none'; return; }
    vids.forEach(function (v) { v.muted = true; v.setAttribute('muted', ''); v.playsInline = true; });
    function show(i) {
      idx = i;
      vids.forEach(function (v, k) {
        if (k === i) { load(v); try { v.currentTime = 0; } catch (e) {} play(v); v.classList.remove('on'); void v.offsetWidth; v.classList.add('on'); }
        else if (v.classList.contains('on')) { v.classList.remove('on'); setTimeout(function () { if (!v.classList.contains('on')) v.pause(); }, 1500); }
      });
      btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      load(vids[(i + 1) % vids.length]);
      clearTimeout(timer);
      if (inView) timer = setTimeout(function () { show((idx + 1) % vids.length); }, DUR);
    }
    btns.forEach(function (b, k) { b.addEventListener('click', function () { show(k); }); });
    show(0);
    function pause(p) {
      inView = !p;
      var v = vids[idx];
      if (clips) clips.classList.toggle('paused', p);
      if (p) { clearTimeout(timer); v.pause(); }
      else { play(v); clearTimeout(timer); timer = setTimeout(function () { show((idx + 1) % vids.length); }, DUR / 2); }
    }
    if ('IntersectionObserver' in W) {
      new IntersectionObserver(function (en) { pause(!en[0].isIntersecting); }, { threshold: 0.05 }).observe(hm.parentNode);
    }
    d.addEventListener('visibilitychange', function () { if (d.hidden) pause(true); else if (hm.getBoundingClientRect().bottom > 0) pause(false); });
  })();

  /* ---------- step-by-step quote forms (they send nothing) ---------- */
  $$('[data-stepper]').forEach(function (f) {
    var panels = $$('.st-panel', f), n = panels.length, cur = 0;
    var bar = $('.qq-bar i', f), lab = $('.qq-step', f), back = $('.back', f), next = $('.next', f), send = $('.send', f), done = $('.done', f), nav = $('.st-nav', f), fine = $('.fine', f);
    var sv = (new URLSearchParams(location.search).get('service') || '').replace(/[^a-z-]/g, '');
    if (sv) { var cb = f.querySelector('input[value="' + sv + '"]'); if (cb) cb.checked = true; }
    function go(i, focus) {
      cur = i;
      panels.forEach(function (p, k) { p.hidden = k !== i; });
      if (bar) bar.style.width = ((i + 1) / n * 100) + '%';
      if (lab) lab.textContent = 'Step ' + (i + 1) + ' of ' + n;
      back.hidden = i === 0; next.hidden = i === n - 1; send.hidden = i !== n - 1;
      if (focus) { var h = panels[i].querySelector('legend, .st-h, input'); if (h) { if (!h.hasAttribute('tabindex') && !/INPUT/.test(h.tagName)) h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    }
    function check(i) {
      var p = panels[i], good = true, firstBad = null;
      $$('[data-need]', p).forEach(function (g) {
        var any = $$('input:checked', g).length > 0, ge = $('.grp-err', p);
        if (ge) ge.classList.toggle('show', !any);
        if (!any) { good = false; firstBad = firstBad || g.querySelector('input'); }
      });
      $$('input,select,textarea', p).forEach(function (inp) {
        var fld = inp.closest('.field'); if (!fld) return;
        var v = (inp.value || '').trim(), bad = false;
        if (inp.required && !v) bad = true;
        if (!bad && v && inp.type === 'tel' && !/^(\+?61|0)[2-478]\d{8}$/.test(v.replace(/[\s()-]/g, ''))) bad = true;
        if (!bad && v && inp.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) bad = true;
        fld.classList.toggle('bad', bad);
        inp.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad) { good = false; firstBad = firstBad || inp; }
      });
      if (firstBad) firstBad.focus();
      return good;
    }
    next.addEventListener('click', function () { if (check(cur)) go(cur + 1, true); });
    back.addEventListener('click', function () { go(cur - 1, true); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!check(cur)) return;
      var nm = f.querySelector('[name="fname"]'), first = nm ? nm.value.trim().split(/\s+/)[0] : '';
      panels.forEach(function (p) { p.hidden = true; });
      nav.hidden = true; if (fine) fine.hidden = true;
      if (bar) bar.style.width = '100%';
      if (lab) lab.textContent = 'Done';
      var nmEl = $('[data-name]', done); if (nmEl) nmEl.textContent = first ? ', ' + first : '';
      done.hidden = false; done.focus({ preventScroll: true });
      var top = f.getBoundingClientRect().top;
      if (top < 80) W.scrollBy({ top: top - 100, behavior: motion ? 'smooth' : 'auto' });
    });
    // photo previews stay on the device
    $$('input[type="file"]', f).forEach(function (inp) {
      var th = $('.thumbs', inp.closest('.field') || f);
      inp.addEventListener('change', function () {
        if (!th) return; th.textContent = '';
        Array.prototype.slice.call(inp.files || [], 0, 8).forEach(function (file) {
          if (!/^image\//.test(file.type)) return;
          var im = d.createElement('img'); im.alt = ''; im.src = URL.createObjectURL(file); th.appendChild(im);
        });
      });
    });
    go(0);
  });

  /* ---------- promise: pinned, three lines and three photos ---------- */
  var pr = $('.promise');
  if (pr) (function () {
    var items = $$('.pl li', pr), imgs = $$('.p-frame img', pr), tag = $('.p-frame .tag', pr), cur = -1;
    function set(i) {
      if (i === cur) return; cur = i;
      items.forEach(function (li, k) { li.classList.toggle('on', k === i); li.classList.toggle('past', k < i); });
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      if (tag && imgs[i]) { tag.textContent = imgs[i].getAttribute('data-tag') || ''; tag.classList.toggle('own', imgs[i].hasAttribute('data-own')); }
    }
    if (!motion) { items.forEach(function (li) { li.classList.add('on'); }); return; }
    pr.classList.add('pinned');
    set(0);
    W.__promise = function () {
      var rect = pr.getBoundingClientRect(), h = pr.offsetHeight - W.innerHeight;
      if (rect.bottom < 0 || rect.top > W.innerHeight) return;
      var p = clamp(-rect.top / Math.max(1, h), 0, 0.999);
      set(Math.min(items.length - 1, Math.floor(p * items.length * 1.08)));
    };
  })();

  /* ---------- services stack: covered cards sink back ---------- */
  var svcs = $$('.svc');
  function stackUpdate() {
    for (var k = 0; k < svcs.length - 1; k++) {
      var a = svcs[k], b = svcs[k + 1], ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      if (ra.bottom < -200 || ra.top > W.innerHeight) continue;
      var p = clamp(1 - (rb.top - ra.top) / Math.max(1, ra.height), 0, 1);
      var inn = a.firstElementChild;
      inn.style.transform = p ? 'scale(' + (1 - p * 0.06).toFixed(4) + ')' : '';
      inn.style.setProperty('--dim', (p * 0.4).toFixed(3));
    }
  }

  /* ---------- parallax + sideways text ---------- */
  var px = motion ? $$('[data-px]') : [], slides = motion ? $$('[data-slide]') : [];
  function pxUpdate() {
    var vh = W.innerHeight;
    px.forEach(function (el) {
      var rc = el.getBoundingClientRect();
      if (rc.bottom < -100 || rc.top > vh + 100) return;
      var f = parseFloat(el.getAttribute('data-px')) || 0;
      el.style.transform = 'translate3d(0,' + ((rc.top + rc.height / 2 - vh / 2) * f).toFixed(1) + 'px,0)';
    });
    slides.forEach(function (el) {
      var rc = el.getBoundingClientRect();
      if (rc.bottom < 0 || rc.top > vh) return;
      var p = (vh - rc.top) / (vh + rc.height), dir = el.getAttribute('data-slide') === 'right' ? 1 : -1;
      el.style.transform = 'translate3d(' + (dir * p * 30 - (dir > 0 ? 30 : 0)).toFixed(2) + '%,0,0)';
    });
  }

  /* ---------- one scroll loop ---------- */
  var ticking = false;
  function onScroll() {
    hdrUpdate();
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      hdrUpdate();
      if (W.__promise) W.__promise();
      if (motion) { stackUpdate(); pxUpdate(); }
    });
  }
  W.addEventListener('scroll', onScroll, { passive: true });
  W.addEventListener('resize', onScroll);
  hdrUpdate(); if (W.__promise) W.__promise(); if (motion) { stackUpdate(); pxUpdate(); }

  /* ---------- reveal on scroll ---------- */
  var rv = $$('[data-rv],[data-wipe],.steps');
  if ('IntersectionObserver' in W && motion) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* ---------- reel videos: play while on screen ---------- */
  $$('.phone').forEach(function (ph) {
    var v = $('video', ph), b = $('.play', ph), userPaused = false;
    if (!v) return;
    v.muted = true; v.setAttribute('muted', ''); v.playsInline = true;
    function load() { if (!v.getAttribute('src')) v.src = small ? v.getAttribute('data-sm') : v.getAttribute('data-lg'); }
    function play() { load(); var p = v.play(); if (p && p.catch) p.catch(function () {}); if (b) { b.classList.remove('paused'); b.setAttribute('aria-label', 'Pause video'); } }
    function stop() { v.pause(); if (b) { b.classList.add('paused'); b.setAttribute('aria-label', 'Play video'); } }
    if (b) b.addEventListener('click', function () { if (v.paused) { userPaused = false; play(); } else { userPaused = true; stop(); } });
    if (!motion || saveData) { stop(); return; }
    if ('IntersectionObserver' in W) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!userPaused) play(); } else if (!v.paused) { v.pause(); }
      }, { threshold: 0.35 }).observe(ph);
    } else play();
  });

  /* ---------- lightbox ---------- */
  var groups = $$('[data-lb-group]');
  if (groups.length) (function () {
    var lb = d.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="x" type="button" aria-label="Close"><svg class="ico"><use href="#i-x"/></svg></button>' +
      '<button class="pv" type="button" aria-label="Previous photo"><svg class="ico"><use href="#i-left"/></svg></button>' +
      '<button class="nx" type="button" aria-label="Next photo"><svg class="ico"><use href="#i-right"/></svg></button>';
    d.body.appendChild(lb);
    var img = $('img', lb), cap = $('figcaption', lb), list = [], at = 0, back = null, sx = null;
    function show(i) {
      at = (i + list.length) % list.length;
      var it = list[at];
      img.src = it.getAttribute('data-full'); img.alt = it.getAttribute('data-cap') || '';
      cap.textContent = (it.getAttribute('data-cap') || '') + '  (' + (at + 1) + ' of ' + list.length + ')';
    }
    function open(group, i) { list = $$('[data-lb]', group); back = d.activeElement; show(i); lb.classList.add('open'); d.body.classList.add('no-scroll'); $('.x', lb).focus(); }
    function close() { lb.classList.remove('open'); d.body.classList.remove('no-scroll'); if (back) back.focus(); }
    groups.forEach(function (g) { $$('[data-lb]', g).forEach(function (btn, i) { btn.addEventListener('click', function () { open(g, i); }); }); });
    $('.x', lb).addEventListener('click', close);
    $('.pv', lb).addEventListener('click', function () { show(at - 1); });
    $('.nx', lb).addEventListener('click', function () { show(at + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(at - 1);
      else if (e.key === 'ArrowRight') show(at + 1);
      else if (e.key === 'Tab') {
        var f = $$('button', lb), i = f.indexOf(d.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    lb.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    lb.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1)); });
  })();

  /* ---------- seasons (southern hemisphere) ---------- */
  $$('[data-seasons]').forEach(function (box) {
    var tabs = $$('[role="tab"]', box), panels = $$('[role="tabpanel"]', box), imgs = $$('.s-img img', box), cur = -1;
    var m = new Date().getMonth(), now = m >= 8 && m <= 10 ? 0 : (m === 11 || m <= 1) ? 1 : m <= 4 ? 2 : 3;
    if (tabs[now]) { var b = d.createElement('span'); b.className = 'now'; b.textContent = 'Now'; tabs[now].appendChild(b); }
    function sel(i, focus) {
      if (i === cur) return;
      var prev = cur; cur = i;
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
      imgs.forEach(function (im, k) { im.classList.remove('was'); if (k === prev) im.classList.add('was'); im.classList.toggle('on', k === i); });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { sel(k); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); sel((cur + 1) % tabs.length, true); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); sel((cur - 1 + tabs.length) % tabs.length, true); }
      });
    });
    sel(now);
  });
  /* season rows on the garden care page: mark the current one */
  (function () {
    var rows = $$('[data-season-row]'); if (!rows.length) return;
    var m = new Date().getMonth(), now = m >= 8 && m <= 10 ? 0 : (m === 11 || m <= 1) ? 1 : m <= 4 ? 2 : 3;
    var el = rows[now] && $('.num', rows[now]);
    if (el) { var b = d.createElement('span'); b.className = 'tag own'; b.style.cssText = 'position:static'; b.textContent = 'Now'; el.appendChild(b); }
  })();

  /* ---------- services page: highlight the chip for the section on screen ---------- */
  var sub = $('.subnav');
  if (sub && 'IntersectionObserver' in W) {
    var links = $$('a', sub), ul = $('ul', sub);
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + e.target.id;
          a.classList.toggle('on', on);
          if (on && ul) ul.scrollTo({ left: a.offsetLeft - 20, behavior: motion ? 'smooth' : 'auto' });
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.row[id]').forEach(function (s) { so.observe(s); });
  }
})();
