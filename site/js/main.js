/* ---------------------------------------------------------------------------
   Franciska Bothma — online profile
   One file, no dependencies. Everything here is presentation only: the site
   collects nothing, sends nothing and stores nothing except the chosen season.
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Mobile navigation ------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Current page in the nav ------------------------------------------ */
  var here = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.nav__link'), function (link) {
    if (link.getAttribute('href') === here) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    }
  });

  /* --- Grow things in as they arrive ------------------------------------ */
  var growables = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(growables, function (el) { el.classList.add('is-visible'); });
  } else {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        seen.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    Array.prototype.forEach.call(growables, function (el) { seen.observe(el); });
  }

  /* --- Scroll progress, drawn as a vine along the header edge ----------- */
  var growline = document.querySelector('.growline');

  if (growline && !calm) {
    var ticking = false;
    var paint = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? window.scrollY / max : 0;
      growline.style.setProperty('--progress', Math.min(1, Math.max(0, ratio)).toFixed(4));
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(paint);
    }, { passive: true });
    window.addEventListener('resize', paint, { passive: true });
    paint();
  }

  /* --- Seasons ---------------------------------------------------------- */
  var seasonBar = document.querySelector('.seasons');
  var STORE = 'fb-season';

  function setSeason(name) {
    document.body.setAttribute('data-season', name);
    if (seasonBar) {
      Array.prototype.forEach.call(seasonBar.querySelectorAll('.seasons__opt'), function (opt) {
        opt.setAttribute('aria-pressed', opt.dataset.season === name ? 'true' : 'false');
      });
    }
    try { localStorage.setItem(STORE, name); } catch (e) { /* private mode */ }
  }

  var saved = null;
  try { saved = localStorage.getItem(STORE); } catch (e) { saved = null; }
  setSeason(saved || 'spring');

  if (seasonBar) {
    seasonBar.addEventListener('click', function (e) {
      var opt = e.target.closest('.seasons__opt');
      if (opt) setSeason(opt.dataset.season);
    });
  }

  /* --- Skills garden: click a bloom, read what it means ------------------
     The idle text lives in the note's data-idle attribute (kept current by
     i18n.js on language switch) rather than a value captured once here, so
     switching language after a click still resets to the right idle copy. */
  Array.prototype.forEach.call(document.querySelectorAll('.bed'), function (bed) {
    var note = bed.querySelector('.garden-note');
    if (note && !note.hasAttribute('data-idle')) note.setAttribute('data-idle', note.textContent);

    bed.addEventListener('click', function (e) {
      var plant = e.target.closest('.plant');
      if (!plant || !note) return;

      var idle = note.getAttribute('data-idle') || '';
      var already = plant.getAttribute('aria-pressed') === 'true';
      Array.prototype.forEach.call(bed.querySelectorAll('.plant'), function (p) {
        p.setAttribute('aria-pressed', 'false');
      });

      if (already) {
        note.textContent = idle;
      } else {
        plant.setAttribute('aria-pressed', 'true');
        note.textContent = plant.dataset.note || idle;
      }
    });
  });

  /* --- Audio overview: plays only on an explicit click, never on its own -
     The right-language file is resolved at the moment "Play overview" is
     clicked (reading the language the switcher has set), not ahead of time,
     so a later language switch is picked up next time playback starts. */
  var audioBox = document.querySelector('.audio-overview');

  if (audioBox) {
    var audioBtn = audioBox.querySelector('.audio-overview__btn');
    var audioIcon = audioBox.querySelector('.audio-overview__icon');
    var audioPlayLabel = audioBox.querySelector('.audio-overview__label--play');
    var audioPauseLabel = audioBox.querySelector('.audio-overview__label--pause');
    var audioEl = audioBox.querySelector('.audio-overview__player');
    var AUDIO_SRC = {
      en: 'media/audio-overview-en.m4a',
      nl: 'media/audio-overview-nl.m4a',
      af: 'media/audio-overview-af.m4a'
    };
    var loadedLang = null;

    var setPlayingState = function (isPlaying) {
      audioBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
      if (audioPlayLabel) audioPlayLabel.hidden = isPlaying;
      if (audioPauseLabel) audioPauseLabel.hidden = !isPlaying;
      if (audioIcon) audioIcon.innerHTML = isPlaying ? '&#10074;&#10074;' : '&#9654;';
    };

    audioBtn.addEventListener('click', function () {
      if (audioEl.paused) {
        var lang = AUDIO_SRC[document.documentElement.lang] ? document.documentElement.lang : 'en';
        if (loadedLang !== lang) {
          audioEl.src = AUDIO_SRC[lang];
          loadedLang = lang;
        }
        audioEl.hidden = false;
        audioEl.setAttribute('controls', '');
        audioEl.play();
      } else {
        audioEl.pause();
      }
    });

    audioEl.addEventListener('play', function () { setPlayingState(true); });
    audioEl.addEventListener('pause', function () { setPlayingState(false); });
    audioEl.addEventListener('ended', function () {
      audioEl.currentTime = 0;
      setPlayingState(false);
    });
  }

  /* --- Hero video: respect reduced motion -------------------------------- */
  var heroVideo = document.querySelector('.hero__video');

  if (heroVideo && calm) {
    heroVideo.pause();
    heroVideo.removeAttribute('autoplay');
    heroVideo.setAttribute('controls', '');
  }

  /* --- Let a bee land where you point ----------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.flower'), function (flower) {
    flower.addEventListener('mouseenter', function () {
      flower.style.animationDuration = '1.2s';
      window.setTimeout(function () { flower.style.animationDuration = ''; }, 1400);
    });
  });
}());
