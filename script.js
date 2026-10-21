/* =====================================================
   NOTRE MARIAGE - script.js
   - CFG : numéro WhatsApp, date/heure, lieu
   - PH : liste des photos (dossier images/)
   - RAIN_MS : durée de la page de pétales (15000 = 15 secondes)
   - Parcours : carte "Ouvrir" -> NOTRE HISTOIRE -> "Bienvenue dans la suite"
                -> pétales -> le site
   ===================================================== */
var CFG={
  whatsapp:"2250777368778", // numéro des mariés, sans + ni espaces (sert de secours)
  notif:"https://script.google.com/macros/s/AKfycbyTVhGMajaND61q3aAAm6R2vBph7ooFWMpUsHpvxzRRydeMWldpHufzNwYJ-jXwJ1Mp/exec",                 // adresse du relais d'envoi automatique (voir GUIDE-GOOGLE-SHEETS.txt)
                            // vide = les réponses passent par WhatsApp (l'invité doit appuyer sur envoyer)
  debut:"2026-12-26T12:30:00Z",      // Abidjan = heure UTC
  fin:"2026-12-26T18:00:00Z",
  lieu:"Espace venus, Yopougon Saguidiba, Abidjan", carte:"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent("Espace Venus Yopougon Abidjan")
};

/* Vidéos de la section "Nos vidéos" */
var VIDEOS=[
  {src:"videos/video1.mp4", titre:""},
  {src:"videos/video2.mp4", titre:""},
  {src:"videos/video3.mp4", titre:""}
];

var PH={1:"images/portrait-1.jpg",2:"images/portraits-serie.jpg",3:"images/couleur-1.jpeg",4:"images/portrait-2.jpeg",5:"images/portrait5.jpeg",6:"images/portrait6.jpeg",7:"images/portrait7.jpeg",8:"images/portrait8.jpeg"};

(function(){
  var $=function(s){return document.querySelector(s)};
  var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};

  $$("img[data-photo]").forEach(function(i){i.src=PH[i.getAttribute("data-photo")]});

  /* écran d'accueil */
  var intro=$("#intro");
  document.body.classList.add("lock");
  try{var q=new URLSearchParams(location.search).get("invite");if(q){var iv=$("#inv");iv.textContent=q;iv.hidden=false;iv.closest(".icard").classList.add("has-guest")}}catch(e){}
  for(var i=0;i<30;i++){var d=document.createElement("span"),z=1+Math.random()*2.5;d.className="sp";
    d.style.cssText="left:"+Math.random()*100+"%;top:"+Math.random()*100+"%;width:"+z+"px;height:"+z+"px;animation-delay:"+(Math.random()*5)+"s;animation-duration:"+(4+Math.random()*4)+"s";
    intro.insertBefore(d,intro.firstChild)}
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var auto=false,pos=0,last=null,SPEED=42,btn=$("#auto"),ico=$("#auto-i");
  var PAUSE='<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',PLAY='<path d="M7 4.500 L19 12 L7 19.500Z"/>';
  function setIco(on){ico.innerHTML=on?PAUSE:PLAY;btn.setAttribute("aria-label",on?"Arrêter le défilement automatique":"Reprendre le défilement automatique")}
  function step(t){
    if(!auto)return;
    if(last===null)last=t;
    pos+=SPEED*(t-last)/1000;last=t;
    var max=document.documentElement.scrollHeight-window.innerHeight;
    if(pos>=max){window.scrollTo(0,max);stop();return}
    window.scrollTo(0,pos);requestAnimationFrame(step);
  }
  function start(){if(auto)return;auto=true;last=null;pos=window.scrollY;setIco(true);requestAnimationFrame(step)}
  function stop(){auto=false;setIco(false)}
  ["wheel","touchstart","keydown","mousedown"].forEach(function(ev){window.addEventListener(ev,function(e){if(auto&&e.target!==btn&&!btn.contains(e.target))stop()},{passive:true})});
  btn.onclick=function(){auto?stop():start()};

  // --- Gestion de la musique de fond ---
  var audio = document.getElementById('bg-music');
  var muted = false;
  var mbtn = $("#mus");
  var mi = $("#mus-i");

  var ON = '<path d="M4 9 H8 L13 5 V19 L8 15 H4 Z"/><path d="M16.500 9 C18 10.500 18 13.500 16.500 15"/><path d="M19 6.500 C22 9.500 22 14.500 19 17.500"/>';
  var OFF = '<path d="M4 9 H8 L13 5 V19 L8 15 H4 Z"/><path d="M17 9.500 L22 14.500 M22 9.500 L17 14.500"/>';

  function mIco() {
    mi.innerHTML = muted ? OFF : ON;
    mbtn.setAttribute("aria-label", muted ? "Activer la musique" : "Couper la musique");
  }
  mIco();

  function startMusic() {
    if (audio) {
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log("Lecture automatique en attente d'interaction utilisateur :", error);
      });
    }
  }

  mbtn.onclick = function() {
    if (!audio) return;
    muted = !muted;
    audio.muted = muted;
    mIco();
  };

  document.addEventListener("visibilitychange", function() {
    if (!audio) return;
    if (document.hidden) {
      audio.pause();
    } else if (!muted && audio.currentTime > 0) {
      audio.play().catch(() => {});
    }
  });

  // ============================================================
  // EFFET SONORE MAGIQUE AU CLIC SUR "OUVRIR"
  // ============================================================
  var sfx = null;
  function sfxCtx() {
    if (sfx) return sfx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { sfx = new AC(); } catch (e) { sfx = null; }
    return sfx;
  }

  function playMagicalSound() {
    if (muted) return;
    var c = sfxCtx(); if (!c) return;
    if (c.state === "suspended") c.resume();
    
    var notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    notes.forEach(function (freq, i) {
      var o = c.createOscillator(), e = c.createGain();
      var t = c.currentTime + 0.1 + (i * 0.18);
      o.type = "sine"; 
      o.frequency.value = freq;
      
      e.gain.setValueAtTime(0.0001, t);
      e.gain.linearRampToValueAtTime(0.12, t + 0.03);
      e.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      
      o.connect(e); 
      e.connect(c.destination); 
      o.start(t); 
      o.stop(t + 2.0);
    });
  }

  // ============================================================
  // DIAPORAMA DES PHOTOS PENDANT L'INTRODUCTION
  // ============================================================
  function startIntroSlideshow() {
    var photoKeys = [1, 2, 4, 7];
    var slidesHtml = '<div class="intro-slideshow">';
    photoKeys.forEach(function(key, index) {
      slidesHtml += '<div class="intro-slide' + (index === 0 ? ' active' : '') + '" style="background-image: url(\'' + PH[key] + '\')"></div>';
    });
    slidesHtml += '</div>';
    intro.insertAdjacentHTML('afterbegin', slidesHtml);

    var slides = $$(".intro-slide");
    var current = 0;
    
    return setInterval(function() {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }, 3500);
  }

  // ============================================================
  // PAGE DE PÉTALES (15 secondes d'introduction)
  // ============================================================
  var RAIN_MS = 15000; 

  var FLEURS = [
    ["#d4af37", "#f1d57a", "#7a4a2b"], // or
    ["#2f8a5a", "#58b588", "#d4af37"], // vert
    ["#ffffff", "#efe6d2", "#d4af37"], // blanc
    ["#7a4a2b", "#a8704a", "#e3c987"]  // marron
  ];
  function flowerSVG(c, n) {
    var s = '<svg viewBox="-24 -24 48 48" aria-hidden="true">', i;
    function petal(len, w, fill, rot) {
      return '<path d="M0 0 C' + (-w) + ' ' + (-len * .3) + ',' + (-w) + ' ' + (-len * .85) + ',0 ' + (-len) +
             ' C' + w + ' ' + (-len * .85) + ',' + w + ' ' + (-len * .3) + ',0 0Z" fill="' + fill +
             '" stroke="rgba(0,0,0,.18)" stroke-width=".5" transform="rotate(' + rot + ')"/>';
    }
    for (i = 0; i < n; i++) s += petal(22, 9, c[0], i * 360 / n);
    for (i = 0; i < n; i++) s += petal(14, 6, c[1], i * 360 / n + 180 / n);
    return s + '<circle r="4" fill="' + c[2] + '"/><circle r="1.6" cx="-1" cy="-1" fill="rgba(255,255,255,.55)"/></svg>';
  }

  function rainOn(L, msInfinite, o) {
    var cols = [["#9a6a43", "#5e3720"], ["#7a4a2b", "#4a2a15"],
                ["#ecd27f", "#b98a22"], ["#d4af37", "#9c7a1c"],
                ["#4aa77a", "#1d6b45"], ["#2f8a5a", "#124a2f"],
                ["#ffffff", "#ece2cc"], ["#fffdf7", "#e6dbc2"]];
    var shapes = ["100% 0 100% 0", "60% 40% 70% 30% / 60% 60% 40% 40%", "0 100% 0 100%"];
    var k = 0;
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function make() {
      if (Math.random() < o.fl) {
        var n = Math.random() < .5 ? 6 : 8, f = FLEURS[Math.floor(Math.random() * 4)];
        var p = document.createElement("span"); p.className = "fl"; p.style.setProperty("--s", rnd(26, 46) + "px");
        p.innerHTML = flowerSVG.call(null, f, n).replace("<svg", '<svg style="animation-duration:' + rnd(3.5, 8) + 's"');
        return p;
      }
      var p = document.createElement("span"), q = document.createElement("i"), c = cols[Math.floor(Math.random() * cols.length)];
      p.className = "pt"; p.style.setProperty("--s", rnd(11, 25) + "px");
      q.style.background = "linear-gradient(135deg," + c[0] + "," + c[1] + ")";
      q.style.borderRadius = shapes[k++ % 3];
      q.style.setProperty("--sw", rnd(0.9, 1.8) + "s");
      q.style.animationDelay = (-Math.random()) + "s";
      p.appendChild(q);
      return p;
    }
    function drop(delay) {
      var p = make();
      p.style.left = rnd(-2, 102) + "vw";
      p.style.setProperty("--drift", rnd(-80, 80) + "px");
      p.style.setProperty("--d", rnd(4, 6.6) + "s");
      p.style.animationDelay = delay + "s";
      p.addEventListener("animationend", function (ev) { if (ev.target === p) p.remove(); });
      L.appendChild(p);
    }
    function fly(side, delay) {
      var W = window.innerWidth, H = window.innerHeight, p = make();
      p.style.animation = "none"; p.style.left = "0"; p.style.top = "0";
      var x0, y0, xm, ym, xe, ye = H + 70;
      if (side === "left")   { x0 = -40;    y0 = rnd(.05, .8) * H; xm = rnd(.2, .65) * W; ym = y0 - rnd(0, .25) * H; }
      if (side === "right")  { x0 = W + 40; y0 = rnd(.05, .8) * H; xm = rnd(.35, .8) * W; ym = y0 - rnd(0, .25) * H; }
      if (side === "bottom") { x0 = rnd(0, 1) * W; y0 = H + 40;    xm = x0 + rnd(-140, 140); ym = rnd(.2, .6) * H; }
      xe = xm + rnd(-110, 110);
      var a = p.animate([
        { transform: "translate3d(" + x0 + "px," + y0 + "px,0)", opacity: 1, offset: 0, easing: "cubic-bezier(.15,.7,.3,1)" },
        { transform: "translate3d(" + xm + "px," + ym + "px,0)", opacity: 1, offset: 0.38, easing: "ease-in" },
        { transform: "translate3d(" + xe + "px," + ye + "px,0)", opacity: 1, offset: 1 }
      ], { duration: rnd(4200, 6400), delay: delay * 1000, fill: "both" });
      a.onfinish = function () { p.remove(); };
      L.appendChild(p);
    }
    var sides = ["left", "right", "bottom"], per = o.per, t0 = Date.now(), i;
    if (o.burst) {
      var burst = window.innerWidth < 600 ? 22 : 34;
      for (i = 0; i < burst; i++) sides.forEach(function (s) { fly(s, rnd(0, 1.4)); });
    }
    for (i = 0; i < 20; i++) drop(rnd(0, 1.2));
    var tick = 0;
    var iv = setInterval(function () {
      if (msInfinite !== true && (Date.now() - t0 > msInfinite - 3800)) { clearInterval(iv); return; }
      for (var j = 0; j < per; j++) drop(0);
      if (tick++ % 2 === 0) fly(sides[Math.floor(Math.random() * 3)], 0);
    }, 240);
  }

  function startRain(ms) {
    var L = $("#rain");
    if (!L) { 
      L = document.createElement("div"); 
      L.id = "rain"; 
      L.setAttribute("aria-hidden", "true"); 
      intro.appendChild(L); 
    }
    rainOn(L, ms, { burst: true, fl: 0, per: window.innerWidth < 600 ? 3 : 5 });
  }

  function bloomShower() {
    var L = $("#bloom");
    if (!L) { L = document.createElement("div"); L.id = "bloom"; L.setAttribute("aria-hidden", "true"); document.body.appendChild(L); }
    rainOn(L, true, { burst: false, fl: 0, per: window.innerWidth < 600 ? 1 : 2 });
  }

  /* ============================================================
     ÉTAPE 1 : clic sur "Ouvrir" -> on arrive d'abord sur NOTRE HISTOIRE
     ============================================================ */
  var story = $("#story");

  function revealStory() {
    var els = $$("#story .sr");
    if (!("IntersectionObserver" in window)) { return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { x.target.classList.toggle("rv-on", x.isIntersecting); });
    }, { root: story, threshold: 0.15 });
    els.forEach(function (el, i) {
      var cls = el.tagName === "H2" ? "rv-blur" : (el.classList.contains("st-highlight") || el.classList.contains("st-go")) ? "rv-zoom" : "rv-up";
      el.style.setProperty("--rd", Math.min(i, 3) * 0.14 + "s");
      el.classList.add("rv", cls);
      io.observe(el);
    });
  }

  $("#open").onclick = function (e) {
    e.currentTarget.disabled = true;
    playMagicalSound();
    startMusic();
    document.body.classList.add("story-on");
    intro.classList.add("rain");
    story.scrollTop = 0;
    story.classList.add("show");
    revealStory();
  };

  /* ============================================================
     ÉTAPE 2 : clic sur "Bienvenue dans la suite" -> pétales, puis le site
     ============================================================ */
  $("#story-next").onclick = function (e) {
    e.currentTarget.disabled = true;
    story.classList.remove("show");

    var slideInterval = startIntroSlideshow();
    var wait = reduce ? 1000 : RAIN_MS;
    if (!reduce) startRain(RAIN_MS);

    setTimeout(function () {
      clearInterval(slideInterval);
      intro.classList.add("out");
      initReveal();
      document.body.classList.add("go");
      document.body.classList.remove("lock");
      window.scrollTo(0, 0);

      setTimeout(function () {
        intro.setAttribute("hidden", "");
        story.setAttribute("hidden", "");
        var R = $("#rain"); if (R) R.innerHTML = "";
      }, 1100);
      setIco(false);
      if (!reduce) { bloomShower(); setTimeout(start, 3200); }
    }, wait);
  };

  /* ----- Section "Nos vidéos" ----- */
  var vwrap=$("#vids");
  function checkVids(){if(vwrap&&!vwrap.children.length){vwrap.hidden=true;var vh=$("#videos-h");if(vh)vh.hidden=true}}
  if(vwrap){
    VIDEOS.forEach(function(v){
      var card=document.createElement("div");card.className="vid";
      var el=document.createElement("video");
      el.controls=true;
      el.muted = true;
      el.setAttribute("playsinline","");
      el.preload="metadata";
      el.src=v.src+"#t=0.5";
      
      el.addEventListener("error",function(){card.remove();checkVids()});
      card.appendChild(el);
      
      if(v.titre){
        var t=document.createElement("div");
        t.className="vt";
        t.textContent=v.titre;
        card.appendChild(t);
      }
      vwrap.appendChild(card);
    });
  }

  document.addEventListener("play",function(e){
    if(!e.target||e.target.tagName!=="VIDEO")return;
    $$("video").forEach(function(o){if(o!==e.target)o.pause()});
  },true);
  function videoDone(e){
    if(!e.target||e.target.tagName!=="VIDEO")return;
    setTimeout(function(){
      if(!musicWasOn||!audio||muted)return;
      if($$("video").some(function(o){return !o.paused&&!o.ended}))return;
      musicWasOn=false;audio.play().catch(function(){});
    },200);
  }
  document.addEventListener("pause",videoDone,true);
  document.addEventListener("ended",videoDone,true);

  /* ----- Animations d'apparition ----- */
  function initReveal(){
    if(!("IntersectionObserver" in window))return;
    var CARD=["rv-flip","rv-left","rv-right","rv-zoom"];
    var io=new IntersectionObserver(function(en){
      en.forEach(function(x){x.target.classList.toggle("rv-on",x.isIntersecting)});
    },{threshold:.1,rootMargin:"0px 0px -4% 0px"});
    function tag(el,cls){
      if(el.classList.contains("rv"))return;
      var p=el.parentNode;p.__rvn=(p.__rvn||0)+1;
      var inCard=p.closest&&p.closest(".card,.gb,.verse");
      var d=Math.min(p.__rvn-1,7)*.1+(inCard?.3:0);
      el.style.setProperty("--rd",d+"s");el.classList.add("rv",cls);io.observe(el);
    }
    function all(sel,fn){$$(sel).forEach(fn)}
    var n=0;
    all(".card,.verse,.gb",function(el){tag(el,CARD[n++%4])});
    all(".env,.gal,.cal,.vid",function(el){tag(el,"rv-zoom")});
    all(".map",function(el){tag(el,"rv-flip")});
    all(".duo .pic",function(el,i){tag(el,i%2?"rv-right":"rv-left")});
    all(".pic",function(el){tag(el,"rv-zoom")});
    all(".names,.kicker,.h,.sub",function(el){tag(el,"rv-blur")});
    all(".parents > div:not(.rule)",function(el,i){tag(el,i%2?"rv-right":"rv-left")});
    all(".two > div",function(el,i){tag(el,i%2?"rv-right":"rv-left")});
    all(".prog li",function(el,i){tag(el,i%2?"rv-right":"rv-left")});
    all(".venue h3,.venue p,.route,.thanks,.announce,.cname,.role,.amp2,.where,.when,.date,.cd-l,.cd,.lnk,.card .btn,.verse blockquote,.verse figcaption,.braid,.card > h2,.card > .t0,.gb h2,.gb input,.gb textarea,.gb .row",function(el){tag(el,"rv-up")});
  }

  /* compte à rebours */
  var T=new Date(CFG.debut);
  function pl(n,u){return n+" "+u+(n>1&&u!=="min"&&u!=="sec"?"s":"")}
  function tick(){
    var s=Math.max(0,Math.floor((T-new Date())/1000));
    $("#cd").textContent=pl(Math.floor(s/86400),"jour")+" "+pl(Math.floor(s%86400/3600),"heure")+" "+Math.floor(s%3600/60)+" min "+s%60+" sec";
  }
  tick();setInterval(tick,1000);

  /* calendrier décembre 2026 */
  var h="",c=1,first=1,days=31;
  for(var r=0;r<6&&c<=days;r++){h+="<tr>";for(var k=0;k<7;k++){
    if((r===0&&k<first)||c>days){h+="<td></td>"}
    else{h+=(c===26)?'<td class="on"><span>26</span></td>':"<td>"+c+"</td>";c++}
  }h+="</tr>"}
  $("#cb").innerHTML=h;

  /* agenda + itinéraire */
  function st(d){return d.toISOString().replace(/[-:]/g,"").replace(/\.\d+/,"")}
  $("#gcal").href="https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent("Mariage d'Anon et Blanche")+"&dates="+st(new Date(CFG.debut))+"/"+st(new Date(CFG.fin))+"&location="+encodeURIComponent(CFG.lieu);
  $("#route").href=CFG.carte;$("#maplink").href=CFG.carte;

  /* galerie 3D : défile seule */
  var sl=$$(".gs"),N=sl.length,cur=0,dots=$("#gd"),holdUntil=0,seen=true;
  sl.forEach(function(_,i){var b=document.createElement("button");b.setAttribute("aria-label","Photo "+(i+1));b.onclick=function(){hold();show(i)};dots.appendChild(b)});
  function show(n){
    cur=((n%N)+N)%N;
    sl.forEach(function(e,i){var d=((i-cur)%N+N)%N;if(d>N/2)d-=N;e.setAttribute("data-pos",d===0?"0":d===1?"1":d===-1?"-1":"far")});
    $$("#gd button").forEach(function(b,i){b.setAttribute("aria-current",i===cur?"true":"false")});
  }
  function hold(){holdUntil=Date.now()+9000}
  show(0);
  $("#gp").onclick=function(){hold();show(cur-1)};$("#gn").onclick=function(){hold();show(cur+1)};
  var x0=null,g=$("#gal");
  g.addEventListener("pointerdown",function(e){x0=e.clientX;hold()});
  g.addEventListener("pointerup",function(e){if(x0===null)return;var dx=e.clientX-x0;x0=null;if(Math.abs(dx)>40)show(cur+(dx<0?1:-1))});
  g.addEventListener("mouseenter",hold);
  if("IntersectionObserver" in window){new IntersectionObserver(function(en){seen=en[0].isIntersecting},{threshold:.3}).observe(g)}
  if(!reduce)setInterval(function(){if(seen&&!document.hidden&&Date.now()>holdUntil)show(cur+1)},3200);

  /* ----- envoi automatique vers les mariés (relais Google Apps Script -> Telegram / e-mail) ----- */
  function envoyer(data){
    if(!CFG.notif)return Promise.resolve(false);
    var ctrl=window.AbortController?new AbortController():null,t=setTimeout(function(){if(ctrl)ctrl.abort()},15000);
    return fetch(CFG.notif,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(data),signal:ctrl?ctrl.signal:undefined})
      .then(function(r){return r.json()})
      .then(function(j){clearTimeout(t);return !!(j&&j.ok)})
      .catch(function(){clearTimeout(t);return false});
  }

  /* confirmer la présence */
  var dlg=$("#dlg"),rf=$("#rf");
  function rsvpReset(){
    rf.classList.remove("done");$("#rdone").hidden=true;
    $(".dlg .s").textContent=CFG.notif?"Votre réponse est transmise directement aux mariés.":"Votre réponse s'ouvre dans WhatsApp, prête à envoyer.";
    $("#rsend").textContent=CFG.notif?"Confirmer":"Envoyer sur WhatsApp";
  }
  $("#open-rsvp").onclick=function(){rsvpReset();dlg.showModal();setTimeout(function(){$("#rn").focus()},30)};
  $("#dx").onclick=function(){dlg.close()};
  $("#rclose").onclick=function(){dlg.close()};
  dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close()});
  rf.addEventListener("submit",function(e){
    e.preventDefault();
    var n=$("#rn").value.trim();
    if(!n){$("#re").hidden=false;$("#rn").focus();return}
    $("#re").hidden=true;
    if($("#rhp").value)return;
    var ok=$("input[name=att]:checked").value==="oui",p=$("#rp").value;
    var m=ok?"Bonjour ! C'est "+n+". Nous serons présents à votre mariage ("+p+" personne"+(p>1?"s":"")+"). Félicitations !"
            :"Bonjour ! C'est "+n+". Nous ne pourrons malheureusement pas être présents à votre mariage. Tous nos vœux de bonheur !";
    function viaWhatsApp(){window.open("https://wa.me/"+CFG.whatsapp+"?text="+encodeURIComponent(m),"_blank","noopener")}
    if(!CFG.notif){viaWhatsApp();dlg.close();return}
    var b=$("#rsend");b.disabled=true;b.textContent="Envoi…";
    envoyer({type:"presence",name:n,attending:ok,guests:parseInt(p,10)}).then(function(sent){
      b.disabled=false;b.textContent="Confirmer";
      if(sent){
        $("#rdone-t").textContent=ok?"Merci "+n+" ! Votre présence est bien enregistrée, nous avons hâte de vous voir. 💚":"Merci "+n+" de nous avoir prévenus. Vous nous manquerez ! 💚";
        rf.classList.add("done");$("#rdone").hidden=false;
      }else{
        viaWhatsApp();dlg.close();
      }
    });
  });

  /* livre d'or : envoi via relais ou WhatsApp comme la présence */
  var K="livre-dor-anon-blanche",W=[],SRV=[];
  try{W=JSON.parse(localStorage.getItem(K)||"[]")}catch(e){W=[]}
  function esc(t){var d=document.createElement("div");d.textContent=t;return d.innerHTML}
  function allWishes(){var seen={},out=[];SRV.concat(W).forEach(function(w){var k=w.n+"|"+w.m;if(!seen[k]){seen[k]=1;out.push(w)}});return out}
  function draw(){var A=allWishes();$("#wl").innerHTML=A.length?A.slice().reverse().map(function(w){return '<div class="wish"><b>'+esc(w.n)+"</b>"+esc(w.m)+"</div>"}).join(""):'<p class="empty" style="margin:16px 0 0">Pas encore de vœux. Soyez le premier !</p>'}
  draw();
  if(CFG.notif){
    fetch(CFG.notif+(CFG.notif.indexOf("?")>-1?"&":"?")+"action=voeux").then(function(r){return r.json()})
      .then(function(j){if(j&&j.ok&&j.voeux){SRV=j.voeux;draw()}}).catch(function(){});
  }
  var lastSend=0;
  $("#gf").addEventListener("submit",function(e){
    e.preventDefault();
    var n=$("#gn1").value.trim(),m=$("#gm").value.trim(),info=$("#gok");
    if(!n||!m){$("#ge").hidden=false;return}
    $("#ge").hidden=true;
    if($("#ghp").value)return;
    if(Date.now()-lastSend<15000){info.textContent="Merci de patienter quelques secondes avant d'envoyer un autre mot.";info.hidden=false;return}
    lastSend=Date.now();
    
    W.push({n:n,m:m});
    try{localStorage.setItem(K,JSON.stringify(W))}catch(x){}
    $("#gm").value="";draw();

    // Message WhatsApp structuré pour le livre d'or
    var livreDOrWhatsapp = "2250709197110"; 
    var textMessage = "✨ *Nouveau message du Livre d'Or* ✨\n\n*De :* " + n + "\n*Message :* " + m;
    function viaWhatsApp(){
      window.open("https://wa.me/" + livreDOrWhatsapp + "?text=" + encodeURIComponent(textMessage), "_blank", "noopener");
    }

    if(!CFG.notif){
      viaWhatsApp();
      info.textContent="Ouverture de WhatsApp pour envoyer votre vœu... 💚";
      info.hidden=false;
      return;
    }

    var b=$("#gsend"),old=b.textContent;b.disabled=true;b.textContent="Envoi…";
    envoyer({type:"voeu",name:n,message:m}).then(function(sent){
      b.disabled=false;b.textContent=old;
      if(sent){
        info.textContent="Merci ! Votre mot a bien été transmis aux mariés. 💚";
        info.hidden=false;
      }else{
        viaWhatsApp(); // Le relais ne répond pas : WhatsApp prend le relais
        info.textContent="Ouverture de WhatsApp pour transmettre votre vœu... 💚";
        info.hidden=false;
      }
    });
  });
})();

/* Gestion de la vidéo dans le carrousel */
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('wedding-video');

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    const observer = new MutationObserver(() => {
      const parentSlide = video.closest('.gs');
      if (parentSlide && parentSlide.getAttribute('data-pos') !== '0') {
        video.pause();
      }
    });

    const parentSlide = video.closest('.gs');
    if (parentSlide) {
      observer.observe(parentSlide, { attributes: true, attributeFilter: ['data-pos'] });
    }
  }
});