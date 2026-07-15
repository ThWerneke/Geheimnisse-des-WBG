/* ==================================================================
   Gemeinsames Verhalten aller Seiten:
   - Design-Rad oben rechts: Klick klappt die Design-Liste aus,
     Hover auf ein Design zeigt es sofort als Live-Demo,
     Klick übernimmt es dauerhaft (wird im Browser gespeichert)
   - Scroll-Hinweis ausblenden, sobald gescrollt wird
   ================================================================== */

(function(){

  /* ---------- Verfügbare Designs ----------
     Neues Design hinzufügen: Farbblock in assets/css/style.css
     anlegen (body[data-theme="..."]) und hier eine Zeile ergänzen. */
  var THEMES = [
    { id: 'wbg',         name: 'WBG',         c1: '#D998A0', c2: '#8C4A52' },
    { id: 'archiv',      name: 'Archiv',      c1: '#9C6F3E', c2: '#2F5C4C' },
    { id: 'fundstueck',  name: 'Fundstück',   c1: '#D4761F', c2: '#5C7A3E' },
    { id: 'nachtklasse', name: 'Nachtklasse', c1: '#B8863B', c2: '#3D4A8C' },
    { id: 'kreide',      name: 'Kreidetafel', c1: '#8FC7A8', c2: '#2E6B4F' },
    { id: 'blaupause',   name: 'Blaupause',   c1: '#8FA8D4', c2: '#2C4A7C' },
    { id: 'kastanie',    name: 'Kastanie',    c1: '#D9A05B', c2: '#8C5A2E' },
    { id: 'schiefer',    name: 'Schiefer',    c1: '#9AA8B5', c2: '#4A5560' }
  ];
  var DEFAULT_THEME = 'wbg';

  /* Gewähltes Design laden (Standard: WBG) */
  var selected = DEFAULT_THEME;
  try {
    var saved = localStorage.getItem('wbg-theme');
    if (saved && THEMES.some(function(t){ return t.id === saved; })) selected = saved;
  } catch(e) {}

  /* Design anwenden (ohne es zu speichern — für die Hover-Demo) */
  function applyTheme(id){
    document.body.dataset.theme = id;
    /* Seiten wie der Audioguide hören darauf und zeichnen z.B. QR-Codes neu */
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: id } }));
  }

  var switcher = document.querySelector('.theme-switcher');
  if (switcher){

    /* Rad-Knopf: alle Designfarben als Farbkreis */
    var wheelColors = THEMES.map(function(t){ return t.c1; });
    wheelColors.push(THEMES[0].c1); /* Kreis schließen */

    switcher.innerHTML =
      '<button class="wheel-btn" style="background:conic-gradient(' + wheelColors.join(',') + ')" ' +
        'aria-label="Design wählen" aria-expanded="false" title="Design wählen"></button>' +
      '<div class="theme-panel">' +
        '<div class="panel-title">Design wählen</div>' +
        THEMES.map(function(t){
          return '<button class="theme-option" data-theme="' + t.id + '">' +
            '<span class="opt-dot" style="background:linear-gradient(135deg,' + t.c1 + ',' + t.c2 + ')"></span>' +
            '<span class="opt-name">' + t.name + '</span>' +
          '</button>';
        }).join('') +
      '</div>';

    var wheelBtn = switcher.querySelector('.wheel-btn');
    var options = switcher.querySelectorAll('.theme-option');

    function markActive(){
      options.forEach(function(o){ o.classList.toggle('active', o.dataset.theme === selected); });
    }
    function setOpen(open){
      switcher.classList.toggle('open', open);
      wheelBtn.setAttribute('aria-expanded', String(open));
    }
    function setTheme(id){
      selected = id;
      try { localStorage.setItem('wbg-theme', id); } catch(e) {}
      markActive();
      applyTheme(id);
    }

    wheelBtn.addEventListener('click', function(){
      var open = !switcher.classList.contains('open');
      setOpen(open);
      if (!open) applyTheme(selected);
    });

    options.forEach(function(o){
      /* Hover / Tastatur-Fokus = Live-Demo des Designs */
      o.addEventListener('mouseenter', function(){ applyTheme(o.dataset.theme); });
      o.addEventListener('focus', function(){ applyTheme(o.dataset.theme); });
      /* Klick = Design dauerhaft übernehmen */
      o.addEventListener('click', function(){
        setTheme(o.dataset.theme);
        setOpen(false);
      });
    });

    /* Maus verlässt das Menü: zurück zum gewählten Design */
    switcher.addEventListener('mouseleave', function(){ applyTheme(selected); });

    /* Klick außerhalb oder Escape: Menü schließen und zurücksetzen */
    document.addEventListener('click', function(e){
      if (switcher.classList.contains('open') && !switcher.contains(e.target)){
        setOpen(false);
        applyTheme(selected);
      }
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && switcher.classList.contains('open')){
        setOpen(false);
        applyTheme(selected);
      }
    });

    markActive();
  }

  /* Gespeichertes bzw. Standard-Design anwenden (auch ohne Rad, z.B. Fallback) */
  if (document.body.dataset.theme !== undefined) applyTheme(selected);

  /* ---------- Sanfte Seitenübergänge ----------
     Moderne Browser überblenden Seitenwechsel selbst (View Transitions,
     siehe style.css). Für alle anderen blenden wir beim Klick auf einen
     internen Link kurz aus, bevor die neue Seite lädt. */
  if (!document.startViewTransition){
    document.addEventListener('click', function(e){
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || a.origin !== location.origin) return;
      if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      /* reine Anker-Sprünge auf derselben Seite nicht ausblenden */
      if (a.pathname === location.pathname && a.search === location.search && a.hash) return;
      e.preventDefault();
      document.body.classList.add('page-leave');
      setTimeout(function(){ location.href = a.href; }, 220);
    });
    /* Zurück-Navigation aus dem Browser-Cache: Seite wieder einblenden */
    window.addEventListener('pageshow', function(){
      document.body.classList.remove('page-leave');
    });
  }

  /* ---------- Riss-Übergang als Seiten-Intro ----------
     Baut für jedes .riss-hero-Element die Ebenen und den
     Scroll-Effekt (gleiche Mechanik wie die Audioguide-Stationen). */
  var rissHeros = document.querySelectorAll('.riss-hero');
  if (rissHeros.length){
    var R_TEETH = 16, R_AMP = 2.5, R_EDGE = 1.7;

    function rissZacken(bottomY){
      var pts = [];
      for (var i = R_TEETH; i >= 0; i--){
        var x = (i / R_TEETH) * 100;
        var y = bottomY + (i % 2 === 0 ? -R_AMP : R_AMP);
        y = Math.max(0, Math.min(100, y));
        pts.push(x.toFixed(2) + '% ' + y.toFixed(2) + '%');
      }
      return pts.join(', ');
    }

    rissHeros.forEach(function(hero){
      if (hero.dataset.alt) hero.querySelector('.riss-alt').style.backgroundImage = 'url("' + hero.dataset.alt + '")';
      if (hero.dataset.neu) hero.querySelector('.riss-neu').style.backgroundImage = 'url("' + hero.dataset.neu + '")';
    });

    function rissUpdate(){
      rissHeros.forEach(function(hero){
        var r = hero.getBoundingClientRect();
        var total = r.height - window.innerHeight;
        var p = total > 0 ? Math.max(0, Math.min(1, (-r.top) / total)) : 0;
        var bY = 100 - p * 100;
        var move = 'translateY(' + (p * 30).toFixed(1) + 'px) rotate(' + (p * 2.5).toFixed(2) + 'deg)';
        var canvas = hero.querySelector('.riss-canvas');
        var kante = hero.querySelector('.riss-kante');
        canvas.style.clipPath = 'polygon(0% 0%, 100% 0%, ' + rissZacken(bY) + ')';
        canvas.style.transform = move;
        kante.style.clipPath = 'polygon(0% 0%, 100% 0%, ' + rissZacken(Math.min(100, bY + R_EDGE)) + ')';
        kante.style.transform = move;
        kante.style.opacity = String(p < 0.995 ? 1 : 0);
      });
    }
    var rissTicking = false;
    function rissScroll(){
      if (!rissTicking){
        requestAnimationFrame(function(){ rissUpdate(); rissTicking = false; });
        rissTicking = true;
      }
    }
    window.addEventListener('scroll', rissScroll, { passive: true });
    window.addEventListener('resize', rissScroll);
    rissUpdate();
  }

  /* ---------- Scroll-Hinweis ---------- */
  var hint = document.querySelector('.scroll-hint');
  if (hint){
    window.addEventListener('scroll', function onFirstScroll(){
      if (window.scrollY > 40){
        hint.classList.add('is-hidden');
        window.removeEventListener('scroll', onFirstScroll);
      }
    }, { passive: true });
  }

})();
