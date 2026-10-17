/* Hero globe — a dotted sphere on a 2D canvas.
   Land points come from a 256x128 landmass mask packed one bit per pixel and
   decoded synchronously, so there is no image to wait on and nothing to fetch.
   Points are laid out on a Fibonacci sphere, rotated each frame, and drawn
   front hemisphere only, sized and faded by depth. */
(function () {
  "use strict";

  var canvas = document.getElementById("globe");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var MW = 256, MH = 128;
  var MASK = "////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Dj///////6n////////////////////////////////8AAACAAAAgP8AP////////////////////////////8AAAP/gAAAAAAA+gf//////////////////////////wAAAfQAAAAAAAADg////////////////////g//////AAAAQAAAAGYAAAf8H//////////////////4AJ////8AAAAAAAAD4AAP//4AAfn/////////x/////4AB////wAAAAAAAAcAAL///gKAef////////+H/////8zD///+AAAAAAAAHAHH/////8A/AAO//P/+AAM//////+H///wAAAAAIAAcA//////////uAA/gP//z/5//////4f//+AAAAB/8AAB73//////////9/+D////////////w///gAAAAf//mf//f////////////+H////////////D//gAAAAD///f////////////////5////////////4P/4A/AAA/3+P////////////////CAf///////+8T/Af8AD8AAH+f/////////////////4AP////////ghTwA/gAAAAB/n//////////////////wA////////8APwAB8AAAAAP+f///////////////z/gAB/sX/////gA/mAAwAAAAA/4///////////////8OAAABeAD/////AD/8AAAAAAMBPB/////////////+ABwAAABkAH/////gH/wAAAAAAwDcf/////////////gAfAAAAQAAH/////wf/gAAAAADgPB/////////////4AB4AAAAAAAH/////3//wAAAAB3A///////////////8AHAAAAAAAAP/////P//gAAAAHeP///////////////8AYAAAAAAAAf///////8AAAAAB7////////////////wBAAAAAAAAA///////+YAAAAABf///////////////9gAAAAAAAAAB////v//DwAAAAAf/////5//////////0AAAAAAAAAAD///+P/8HAAAAAA/////+B/////////+QAAAAAAAAAAP////v/+AAAAAAB///9nwHf////////wAAAAAAAAAAB////2/9gAAAAAAH/v/ifj9////////+OAAAAAAAAAAH//////AAAAAAAP8nP8AfH/////////w4AAAAAAAAAAf/////8AAAAAAB/wnP3x+P////////4AAAAAAAAAAAA//////AAAAAAAH+CG7//4/////////AYAAAAAAAAAAD/////4AAAAAAAfwARn//j///////wYBgAAAAAAAAAAH/////AAAAAAAA+AmGf//P///////4wMAAAAAAAAAAAP////8AAAAAAAAj/AAF//////////DHwAAAAAAAAAAA/////gAAAAAAAH/8AAH/////////4J8AAAAAAAAAAAA////8AAAAAAAA//8GAf/////////wOAAAAAAAAAAAAB////AAAAAAAAH//8/L//////////gQAAAAAAAAAAAAG//+8AAAAAAAAf//////////////+AAAAAAAAAAAAAAP/8AYAAAAAAAD//////+////////4AAAAAAAAAAAAAAX/gBgAAAAAAA/////9/5////////AAAAAAAAAAAAAAAv+ACAAAAAAAD/////7/wf//////4AAAAAAAAAAAAAADf4AAAAAAAAAf/////v/uB//////IAAAAAAAAAAAAAAE/gBgAAAAAAD//////f/8B/////5gAAAAAAAAAAAAAAB+ADwAAAAAAP/////8//wH//f/+AAAAAAAAAAAAAAAAH4MBgAAAAAA//////7//AH/w/8gAAAAAAAAAAAAAAAAfxwA4AAAAAD//////n/4AP+B/mAAAAAAAAAAAAAAAAAf+ABAAAAAAP//////P/AA/gH/AGAAAAAAAAAAAAAAAAP4AAAAAAAA//////8/wAD8AX+AYAAAAAAAAAAAAAAAAD+AAAAAAAD//////78AAPgAf8BgAAAAAAAAAAAAAAAAD4AAAAAAAP///////AAAeAA/wDAAAAAAAAAAAAAAAAADgAAAAAAA///////gAAB4ACfADAAAAAAAAAAAAAAAAAGD+wAAAAB///////+AADgAI4AQAAAAAAAAAAAAAAAAAP//gAAAAD///////wAANAAhABQAAAAAAAAAAAAAAAAAb//AAAAAH///////AAAMADAAHAAAAAAAAAAAAAAAAAAH//AAAAAP//////4AAAwAGAMMAAAAAAAAAAAAAAAAAAf//gAAAAOw/////gAAAADcB4AAAAAAAAAAAAAAAAAAB///AAAAAAAf///8AAAAAOwPAAAAAAAAAAAAAAAAAAAP//8AAAAAAB////gAAAAAfB8AAAAAAAAAAAAAAAAAAB///4AAAAAAP///4AAAAAA8fzoAAAAAAAAAAAAAAAAAP///4AAAAAA//+/AAAAAABx/MGAAAAAAAAAAAAAAAAA////4AAAAAD//78AAAAAADz7gNgAAAAAAAAAAAAAAAB////+AAAAAH///gAAAAAAPHuO/4AAAAAAAAAAAAAAAP////8AAAAAP//8AAAAAAAYAcA/wAAAAAAAAAAAAAAAf////4AAAAAf//wAAAAAAAcAAA/sAAAAAAAAAAAAAAB/////gAAAAB///AAAAAAAA+AAD+AAAAAAAAAAAAAAAD////+AAAAAH//8AAAAAAAAADADMAAAAAAAAAAAAAAAP////wAAAAAP//4AAAAAAAAAAAAYAAAAAAAAAAAAAAAf///+AAAAAA///gAAAAAAAAAA4QAAAAAAAAAAAAAAAA////4AAAAAH//+DAAAAAAAAAPjAAAAAAAAAAAAAAAAD////gAAAAA///4cAAAAAAAAH+GAAAAAAAAAAAAAAAAH///8AAAAAD///jwAAAAAAAA/88AAAAAAAAAAAAAAAAH///wAAAAAP//4fAAAAAAAAH//wAAAgAAAAAAAAAAAAP///AAAAAAf//B4AAAAAAAA///gAAAAAAAAAAAAAAAA///4AAAAAB//4HgAAAAAAAf///AAAAAAAAAAAAAAAAD///gAAAAAD//gcAAAAAAAD///+AEAAAAAAAAAAAAAAP//8AAAAAAP//BwAAAAAAAf///8AAAAAAAAAAAAAAAA//+AAAAAAA//4HAAAAAAAB////wAAAAAAAAAAAAAAAH//wAAAAAAD//AAAAAAAAAH////gAAAAAAAAAAAAAAAf//AAAAAAAH/4AAAAAAAAAf///+AAAAAAAAAAAAAAAB//4AAAAAAAf/gAAAAAAAAB////4AAAAAAAAAAAAAAAH//AAAAAAAA/8AAAAAAAAAD////gAAAAAAAAAAAAAAAf/4AAAAAAAB/gAAAAAAAAAP///+AAAAAAAAAAAAAAAB//gAAAAAAAH8AAAAAAAAAA/gf/wAAAAAAAAAAAAAAAP/8AAAAAAAAdAAAAAAAAAADgAv/AAAAAAAAAAAAAAAA//AAAAAAAAAAAAAAAAAAAAAAAf4AAQAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAB/gAAgAAAAAAAAAAAAP/AAAAAAAAAAAAAAAAAAAAAAAB4AADgAAAAAAAAAAAB/wAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAHAADAAAAAAAAAAAAAfwAAAAAAAAAAAAAAAAAAAAAAAAYAAcAAAAAAAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAfgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAg/gGB8AAAAAAAAAAAAAAAAAAfgAAAAAAAAAAAAfwAD///////8AAAAAAAAAAAAAAAAB/AAAAAAAAAAAA///8f////////4AAAAAAAAAAAAAAD/4AAAAAAAAPAf///////////////AAAAAAAAAAAAAAP/gAAAAA/////////////////////8AAAAAAAAAD/4D//AAAAA//////////////////////8AAAAABv/3P////4AAAAP//////////////////////wAAAA//////////4AAAH//////////////////////wAAAB///////////+AAH//////////////////////+AMA//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w==";

  // base64 -> bitfield
  var bin = atob(MASK), mask = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) mask[i] = bin.charCodeAt(i);
  function isLand(lat, lon) {
    var x = Math.floor(((lon + 180) / 360) * MW) % MW;
    var y = Math.floor(((90 - lat) / 180) * MH);
    if (y < 0) y = 0; else if (y >= MH) y = MH - 1;
    var idx = y * MW + x;
    return (mask[idx >> 3] & (0x80 >> (idx & 7))) !== 0;
  }

  // Fibonacci sphere, keeping only the samples that land on land
  var SAMPLES = 13000, GOLDEN = Math.PI * (3 - Math.sqrt(5));
  var pts = [];
  for (var s = 0; s < SAMPLES; s++) {
    var y = 1 - (s / (SAMPLES - 1)) * 2;
    var r = Math.sqrt(Math.max(0, 1 - y * y));
    var th = GOLDEN * s;
    var x = Math.cos(th) * r, z = Math.sin(th) * r;
    var lat = Math.asin(y) * 180 / Math.PI;
    var lon = Math.atan2(z, x) * 180 / Math.PI;
    if (isLand(lat, lon)) pts.push(x, y, z);
  }
  var N = pts.length / 3;
  var P = new Float32Array(pts);

  var MARKERS = [
    [51.5074, -0.1278],      // London
    [39.7391, -75.5398]      // Wilmington, Delaware
  ].map(function (m) {
    var la = m[0] * Math.PI / 180, lo = m[1] * Math.PI / 180;
    return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)];
  });

  var THEME = {
    dark:  { dot: "150,190,255", dotMin: 0.16, dotMax: 0.95, rim: "77,124,254",
             rimAlpha: 0.85, fill: "rgba(10,16,34,0.55)", marker: "120,170,255" },
    light: { dot: "40,80,170",   dotMin: 0.13, dotMax: 0.72, rim: "45,91,255",
             rimAlpha: 0.5,  fill: "rgba(226,234,250,0.5)", marker: "20,60,180" }
  };
  var root = document.documentElement;
  /* light is the page default and sets no attribute, so dark has to be the
     explicit case here — testing for "light" painted the dark palette on
     every fresh load */
  function theme() { return root.getAttribute("data-theme") === "dark" ? THEME.dark : THEME.light; }

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var size = 0, R = 0, cx = 0, cy = 0;
  var phi = 4.05, tilt = -0.32, visible = true, raf = null;

  function resize() {
    var w = canvas.clientWidth;
    if (!w) return false;
    size = w;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(w * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = w * 0.40;
    cx = w / 2; cy = w / 2;
    return true;
  }

  function draw() {
    var t = theme();
    ctx.clearRect(0, 0, size, size);

    // sphere body, so the back of the globe reads as solid
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = t.fill;
    ctx.fill();

    var cosP = Math.cos(phi), sinP = Math.sin(phi);
    var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
    var dotSize = Math.max(0.9, R / 150);

    for (var i = 0; i < N; i++) {
      var x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
      // spin about the polar axis, then tilt toward the viewer
      var x1 = x * cosP - z * sinP;
      var z1 = x * sinP + z * cosP;
      var y2 = y * cosT - z1 * sinT;
      var z2 = y * sinT + z1 * cosT;
      if (z2 <= 0.02) continue;                     // back hemisphere
      var depth = z2;                               // 0 at the limb, 1 facing us
      ctx.globalAlpha = t.dotMin + (t.dotMax - t.dotMin) * depth;
      ctx.fillStyle = "rgb(" + t.dot + ")";
      ctx.fillRect(cx + x1 * R - dotSize / 2, cy - y2 * R - dotSize / 2,
                   dotSize * (0.7 + 0.5 * depth), dotSize * (0.7 + 0.5 * depth));
    }
    ctx.globalAlpha = 1;

    // markers
    for (var m = 0; m < MARKERS.length; m++) {
      var mx = MARKERS[m][0], my = MARKERS[m][1], mz = MARKERS[m][2];
      var a1 = mx * cosP - mz * sinP;
      var c1 = mx * sinP + mz * cosP;
      var b2 = my * cosT - c1 * sinT;
      var c2 = my * sinT + c1 * cosT;
      if (c2 <= 0.02) continue;
      var px = cx + a1 * R, py = cy - b2 * R, rr = Math.max(2.4, R / 78);
      var g = ctx.createRadialGradient(px, py, 0, px, py, rr * 3.4);
      g.addColorStop(0, "rgba(" + t.marker + ",0.85)");
      g.addColorStop(1, "rgba(" + t.marker + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, rr * 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgb(" + t.marker + ")";
      ctx.beginPath(); ctx.arc(px, py, rr, 0, Math.PI * 2); ctx.fill();
    }

    // limb light
    var rim = ctx.createRadialGradient(cx, cy, R * 0.86, cx, cy, R * 1.06);
    rim.addColorStop(0, "rgba(" + t.rim + ",0)");
    rim.addColorStop(0.72, "rgba(" + t.rim + "," + (t.rimAlpha * 0.55) + ")");
    rim.addColorStop(0.9, "rgba(" + t.rim + "," + t.rimAlpha + ")");
    rim.addColorStop(1, "rgba(" + t.rim + ",0)");
    ctx.fillStyle = rim;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.06, 0, Math.PI * 2); ctx.fill();
  }

  function frame() {
    if (!reduce) phi += 0.0016;
    draw();
    raf = visible ? requestAnimationFrame(frame) : null;
  }

  function start() {
    if (!resize()) return;
    canvas.style.opacity = "1";
    if (raf === null) raf = requestAnimationFrame(frame);
  }

  start();
  if (!size) addEventListener("load", start);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      if (visible && raf === null) raf = requestAnimationFrame(frame);
    }, { threshold: 0 }).observe(canvas);
  }

  var rt;
  addEventListener("resize", function () {
    if (canvas.clientWidth === size) return;
    clearTimeout(rt);
    rt = setTimeout(function () { resize(); draw(); }, 180);
  }, { passive: true });

  new MutationObserver(function () { draw(); })
    .observe(root, { attributes: true, attributeFilter: ["data-theme"] });
})();
