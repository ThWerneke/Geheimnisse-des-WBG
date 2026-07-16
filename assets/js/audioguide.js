/* ==================================================================
   AUDIOGUIDE-MOTOR
   Baut aus dem ROUTE-Objekt der jeweiligen Seite (z.B.
   audioguide-oberpark.html) alle Stationen, QR-Karten und
   Audio-Player. Hier muss normalerweise nichts geändert werden —
   neue Stationen trägt man oben in der HTML-Datei ein.
   ================================================================== */

(function(){
  if (typeof ROUTE === 'undefined'){
    console.error('ROUTE fehlt — bitte in der HTML-Datei definieren.');
    return;
  }

  /* ---------- Stationen + QR-Karten erzeugen ----------
     Die Stationen folgen ohne Zwischenraum direkt aufeinander,
     damit beim Scrollen keine Lücke zwischen den Fotos entsteht. */
  var stationsHost = document.getElementById('stations');
  var qrGrid = document.getElementById('qr-grid');
  /* Merkt sich pro Station eine Stopp-Funktion für ihre Audiospur */
  var audioStopps = [];

  ROUTE.stations.forEach(function(st, i){
    var num = String(i + 1).padStart(2, '0');
    var cap = st.name.toUpperCase();
    var align = (i % 2 === 1) ? ' align-right' : '';

    var section = document.createElement('section');
    section.className = 'station-outer';
    section.id = st.id;
    section.innerHTML =
      '<div class="station-sticky">' +
        '<div class="photo-layer modern-photo">' +
          '<div class="photo-caption modern-caption">' + cap + ' · HEUTE</div>' +
        '</div>' +
        '<div class="old-photo-edge"></div>' +
        '<div class="old-photo-wrap">' +
          '<div class="old-photo-canvas">' +
            '<div class="old-photo">' +
              '<div class="old-stains"></div>' +
            '</div>' +
          '</div>' +
          '<div class="photo-caption old-caption">' + cap + ' · ' + st.year + '</div>' +
        '</div>' +
        '<div class="content-card' + align + '">' +
          '<span class="station-num">Station ' + num + '</span>' +
          '<h2><span class="t-old">' + st.title + '</span><span class="t-new" aria-hidden="true">' + st.title + '</span></h2>' +
          '<p>' + st.text + '</p>' +
          '<div class="audio-player">' +
            '<button class="play-btn" aria-label="Abspielen">▶</button>' +
            '<div class="track"><div class="track-fill"></div></div>' +
            '<span class="time">0:00 / 0:32</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    /* Fehlt ein Bild, zeigt die jeweilige Ebene das Hintergrund-Layout
       der Website (Sepia-Verlauf bzw. Rasterfläche) — der Riss-Effekt
       läuft bei jeder Station. */
    if (st.media.old) section.querySelector('.old-photo').style.backgroundImage = 'url("' + st.media.old + '")';
    if (st.media.modern) section.querySelector('.modern-photo').style.backgroundImage = 'url("' + st.media.modern + '")';

    /* Jede Karte hängt minimal anders schief — wie von Hand aufgeklebt */
    var card = section.querySelector('.content-card');
    card.style.transform = 'rotate(' + ((i % 2 === 0) ? -0.5 : 0.45) + 'deg)';

    stationsHost.appendChild(section);
    audioStopps.push({
      outer: section,
      stopp: initAudioPlayer(section.querySelector('.audio-player'), st.media.audio)
    });

    var qrCard = document.createElement('div');
    qrCard.className = 'qr-card';
    qrCard.innerHTML =
      '<div class="qr-code" data-qr-target="#' + st.id + '"></div>' +
      '<span class="qr-label">' + num + ' · ' + st.name + '</span>';
    qrGrid.appendChild(qrCard);
  });

  /* ---------- QR-Codes (Farben folgen dem aktiven Farbdesign) ---------- */
  /* Die Codes zeigen automatisch auf die Adresse, unter der die Seite
     gerade läuft (z.B. eure GitHub-Pages-Adresse). Nur wenn ROUTE.baseUrl
     gesetzt ist, wird stattdessen diese Adresse verwendet. */
  function renderQRCodes(){
    var css = getComputedStyle(document.body);
    var dark = css.getPropertyValue('--ink').trim() || '#221B12';
    var light = css.getPropertyValue('--chalk').trim() || '#F2EFE6';
    var pageUrl = ROUTE.baseUrl
      ? ROUTE.baseUrl.replace(/\/+$/, '') + '/' + ROUTE.page
      : location.href.split('#')[0];
    document.querySelectorAll('.qr-code').forEach(function(el){
      el.innerHTML = '';
      new QRCode(el, {
        text: pageUrl + el.dataset.qrTarget,
        width: 120, height: 120,
        colorDark: dark, colorLight: light,
        correctLevel: QRCode.CorrectLevel.M
      });
    });
  }
  renderQRCodes();
  document.addEventListener('themechange', renderQRCodes);

  /* ---------- Riss-Effekt ---------- */
  var TEETH = 16, AMP = 2.5, EDGE = 1.7; /* EDGE = wie viel Papierkante hervorschaut (in %) */

  function jaggedEdge(bottomY){
    var pts = [];
    for (var i = TEETH; i >= 0; i--){
      var x = (i / TEETH) * 100;
      var y = bottomY + (i % 2 === 0 ? -AMP : AMP);
      y = Math.max(0, Math.min(100, y));
      pts.push(x.toFixed(2) + '% ' + y.toFixed(2) + '%');
    }
    return pts.join(', ');
  }

  function getProgress(outer){
    var rect = outer.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(1, (-rect.top) / total));
  }

  function updateStation(outer){
    var progress = getProgress(outer);
    var wrap = outer.querySelector('.old-photo-wrap');
    var canvas = outer.querySelector('.old-photo-canvas');
    var edge = outer.querySelector('.old-photo-edge');
    var bottomY = 100 - progress * 100;
    var move = 'translateY(' + (progress * 30).toFixed(1) + 'px) rotate(' + (progress * 2.5).toFixed(2) + 'deg)';

    canvas.style.clipPath = 'polygon(0% 0%, 100% 0%, ' + jaggedEdge(bottomY) + ')';
    canvas.style.transform = move;
    wrap.style.opacity = String(1 - progress * 0.25);

    /* Papierkante: gleiche Form, minimal tiefer — schaut als heller Rand hervor */
    edge.style.clipPath = 'polygon(0% 0%, 100% 0%, ' + jaggedEdge(Math.min(100, bottomY + EDGE)) + ')';
    edge.style.transform = move;
    edge.style.opacity = String(progress < 0.995 ? 1 : 0);

    var oldCaption = outer.querySelector('.old-caption');
    if (oldCaption) oldCaption.style.opacity = String(Math.max(0, 1 - progress * 1.8));

    /* Überschrift: Schreibmaschine → moderne Schrift (kurzes Überblendfenster) */
    var tOld = outer.querySelector('.t-old');
    var tNew = outer.querySelector('.t-new');
    var f = Math.max(0, Math.min(1, (progress - 0.4) * 5));
    tOld.style.opacity = String(1 - f);
    tNew.style.opacity = String(f);
  }

  var stations = document.querySelectorAll('.station-outer');
  var ticking = false;

  function onScroll(){
    if (!ticking){
      requestAnimationFrame(function(){
        stations.forEach(updateStation);
        /* Läuft weiter oben noch eine Audiospur, wird sie gestoppt,
           sobald ihre Station aus dem Bild gescrollt ist */
        audioStopps.forEach(function(a){
          var r = a.outer.getBoundingClientRect();
          if (r.bottom <= 0 || r.top >= window.innerHeight) a.stopp();
        });
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Audio-Player (echt via Cloudinary ODER Demo-Simulation) ---------- */
  function initAudioPlayer(player, audioUrl){
    var btn = player.querySelector('.play-btn');
    var fill = player.querySelector('.track-fill');
    var timeLabel = player.querySelector('.time');

    function format(s){
      var m = Math.floor(s / 60);
      var sec = Math.floor(s % 60).toString().padStart(2, '0');
      return m + ':' + sec;
    }

    if (audioUrl){
      var audio = new Audio(audioUrl);
      audio.preload = 'metadata';
      audio.addEventListener('loadedmetadata', function(){
        timeLabel.textContent = format(0) + ' / ' + format(audio.duration);
      });
      audio.addEventListener('timeupdate', function(){
        fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
        timeLabel.textContent = format(audio.currentTime) + ' / ' + format(audio.duration);
      });
      audio.addEventListener('ended', function(){
        btn.textContent = '▶';
        btn.classList.remove('is-playing');
      });
      audio.addEventListener('error', function(){
        timeLabel.textContent = 'Audio nicht gefunden';
        btn.disabled = true;
        btn.style.opacity = '.4';
      });
      btn.addEventListener('click', function(){
        if (audio.paused){
          audio.play();
          btn.textContent = '❚❚';
          btn.classList.add('is-playing');
        } else {
          audio.pause();
          btn.textContent = '▶';
          btn.classList.remove('is-playing');
        }
      });
      return function stopp(){
        if (!audio.paused){
          audio.pause();
          btn.textContent = '▶';
          btn.classList.remove('is-playing');
        }
      };
    } else {
      var duration = 32, elapsed = 0, playing = false, interval = null;
      btn.addEventListener('click', function(){
        playing = !playing;
        btn.textContent = playing ? '❚❚' : '▶';
        btn.classList.toggle('is-playing', playing);
        if (playing){
          interval = setInterval(function(){
            elapsed += 0.2;
            if (elapsed >= duration){
              elapsed = 0; playing = false;
              btn.textContent = '▶';
              btn.classList.remove('is-playing');
              clearInterval(interval);
            }
            fill.style.width = (elapsed / duration * 100) + '%';
            timeLabel.textContent = format(elapsed) + ' / ' + format(duration);
          }, 200);
        } else {
          clearInterval(interval);
        }
      });
      return function stopp(){
        if (playing){
          playing = false;
          btn.textContent = '▶';
          btn.classList.remove('is-playing');
          clearInterval(interval);
        }
      };
    }
  }

  /* ---------- Direkt-Sprung + Autoplay bei QR-Scan (via #anchor) ---------- */
  window.addEventListener('load', function(){
    if (location.hash){
      var target = document.querySelector(location.hash);
      if (target){
        target.scrollIntoView({ behavior: 'auto' });
        setTimeout(function(){
          var playBtn = target.querySelector('.play-btn');
          if (playBtn) playBtn.click();
        }, 500);
      }
    }
  });

})();
