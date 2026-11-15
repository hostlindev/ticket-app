export const css = /* css */ `
:host { all: initial; }
*, *::before, *::after { box-sizing: border-box; }
.root {
  --pxb-accent-100: #e0f2fe; --pxb-accent-400: #38bdf8; --pxb-accent-500: #0ea5e9;
  --pxb-accent-600: #0284c7; --pxb-accent-700: #0369a1; --pxb-shadow: #7dd3fc;
  --pxb-ink: #0f172a; --pxb-ink-soft: #475569; --pxb-line: #e2e8f0; --pxb-bg: #f8fafc;
  font-family: "Nunito", system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 14px; line-height: 1.45; color: var(--pxb-ink);
  position: fixed; z-index: 2147483000; bottom: 20px; right: 20px;
  display: flex; flex-direction: column; align-items: flex-end; gap: 12px;
}
.root.left { right: auto; left: 20px; align-items: flex-start; }
button { font: inherit; cursor: pointer; }
:focus-visible { outline: 3px solid var(--pxb-accent-400); outline-offset: 2px; }

/* ---------- Lanzador ---------- */
.fab {
  position: relative; width: 48px; height: 48px; border-radius: 14px; padding: 0;
  display: grid; place-items: center; color: #fff;
  background: var(--pxb-accent-500); border: 2px solid var(--pxb-accent-700);
  box-shadow: 3px 3px 0 0 var(--pxb-shadow);
  transition: transform .15s ease, box-shadow .15s ease;
  animation: fab-in .6s cubic-bezier(.34,1.56,.64,1) both;
}
.fab:hover { transform: translate(-2px,-2px) rotate(-3deg); box-shadow: 6px 6px 0 0 var(--pxb-shadow); }
.fab:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 0 var(--pxb-shadow); }
.fab .robot { animation: bob 2.4s ease-in-out infinite; }
.fab::after { /* onda de llamada de atención */
  content: ""; position: absolute; inset: -2px; border-radius: 14px;
  border: 2px solid var(--pxb-accent-400); opacity: 0; animation: ring 3s ease-out 2s infinite;
}
.fab .dot {
  position: absolute; top: -6px; right: -6px; width: 16px; height: 16px; border-radius: 50%;
  background: #f43f5e; border: 3px solid #fff; animation: pop .4s 1.2s cubic-bezier(.34,1.56,.64,1) both;
}
.fab[hidden] { display: none; }

.fabwrap { position: relative; }
.tip {
  position: absolute; top: 50%; right: calc(100% + 10px); transform: translate(6px,-50%); white-space: nowrap;
  padding: 6px 10px; font-size: 12px; font-weight: 800; color: #fff; background: var(--pxb-ink);
  border-radius: 8px; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s;
}
.left .tip { right: auto; left: calc(100% + 10px); transform: translate(-6px,-50%); }
.fab:hover ~ .tip, .fab:focus-visible ~ .tip { opacity: 1; transform: translate(0,-50%); }

/* ---------- Globo de saludo ---------- */
.bubble {
  position: relative; max-width: 290px; padding: 14px 34px 14px 14px; text-align: left;
  background: #fff; border: 2px solid var(--pxb-ink); border-radius: 14px;
  box-shadow: 4px 4px 0 0 rgba(15,23,42,.18); cursor: pointer;
  transform-origin: bottom right; animation: pop .45s cubic-bezier(.34,1.56,.64,1) both;
}
.left .bubble { transform-origin: bottom left; }
.bubble::after {
  content: ""; position: absolute; bottom: -9px; right: 26px; width: 14px; height: 14px;
  background: #fff; border-right: 2px solid var(--pxb-ink); border-bottom: 2px solid var(--pxb-ink);
  transform: rotate(45deg);
}
.left .bubble::after { right: auto; left: 26px; }
.bubble b { color: var(--pxb-accent-600); }
.bubble .cta { display: block; margin-top: 8px; font-size: 12px; font-weight: 800; color: var(--pxb-accent-600); }
.bubble .caret { display: inline-block; width: 7px; height: 1em; margin-left: 1px; vertical-align: -2px; background: var(--pxb-accent-500); animation: blink-caret .8s steps(1) infinite; }
.bubble .caret.done { display: none; }
.bubble .x {
  position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border: 0; border-radius: 6px;
  background: transparent; color: var(--pxb-ink-soft); font-size: 18px; line-height: 1;
}
.bubble .x:hover { background: var(--pxb-line); }
.bubble.leaving { animation: pop-out .2s ease-in both; }
.bubble[hidden] { display: none; }

/* ---------- Modal ---------- */
.backdrop {
  /* No modal: sin velo ni bloqueo, la página de atrás sigue usable. */
  display: block; animation: fade .2s ease both; transform-origin: bottom right;
}
.left .backdrop { transform-origin: bottom left; }
.backdrop[hidden] { display: none; }
.dialog {
  width: min(360px, calc(100vw - 28px)); max-height: min(560px, calc(100vh - 40px)); display: flex; flex-direction: column;
  background: #fff; border: 2px solid var(--pxb-ink); border-radius: 18px; overflow: hidden;
  box-shadow: 8px 8px 0 0 rgba(15,23,42,.25); animation: dialog-in .35s cubic-bezier(.34,1.4,.64,1) both;
}
.head {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px; color: #fff;
  background: var(--pxb-accent-600); border-bottom: 2px solid var(--pxb-ink);
}
.head .avatar { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 12px; background: var(--pxb-accent-500); border: 2px solid var(--pxb-accent-700); flex: none; }
.head .avatar .robot { animation: bob 2.4s ease-in-out infinite; }
.head h2 { margin: 0; font-size: 17px; font-weight: 800; }
.head p { margin: 0; font-size: 12.5px; opacity: .9; }
.head .close { margin-left: auto; width: 34px; height: 34px; border-radius: 9px; border: 1px solid rgba(255,255,255,.35); background: rgba(255,255,255,.12); color: #fff; font-size: 20px; line-height: 1; }
.head .close:hover { background: rgba(255,255,255,.25); }
.body { padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.field > label, .field > .lbl { display: block; margin-bottom: 6px; font-weight: 800; font-size: 13px; }
.field .opt { font-weight: 600; color: var(--pxb-ink-soft); }

.types { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.type {
  display: flex; align-items: center; gap: 8px; padding: 9px 10px; text-align: left; font-weight: 700; font-size: 13px;
  border: 2px solid var(--pxb-line); border-radius: 10px; background: #fff; color: var(--pxb-ink);
  transition: border-color .15s, background .15s, transform .15s;
}
.type:hover { border-color: var(--pxb-accent-400); transform: translateY(-1px); }
.type[aria-checked="true"] { border-color: var(--pxb-accent-600); background: var(--pxb-accent-100); color: var(--pxb-accent-700); animation: pop .25s ease both; }
.type .ic { font-size: 18px; }

textarea {
  width: 100%; min-height: 96px; resize: vertical; padding: 10px 12px; font: inherit; color: inherit;
  border: 2px solid var(--pxb-line); border-radius: 10px; background: #fff;
}
textarea:focus { outline: none; border-color: var(--pxb-accent-500); box-shadow: 0 0 0 3px var(--pxb-accent-100); }
.meta { display: flex; justify-content: space-between; margin-top: 4px; font-size: 12px; color: var(--pxb-ink-soft); }

.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 4px; background: var(--pxb-bg); border: 2px solid var(--pxb-line); border-radius: 12px; }
.mode { padding: 8px 4px; border: 0; border-radius: 8px; background: transparent; font-size: 12px; font-weight: 800; color: var(--pxb-ink-soft); display: flex; flex-direction: column; align-items: center; gap: 2px; }
.mode .ic { font-size: 18px; }
.mode[aria-checked="true"] { background: var(--pxb-accent-600); color: #fff; box-shadow: 2px 2px 0 0 var(--pxb-shadow); }
.hint { margin: 8px 0 0; font-size: 12.5px; color: var(--pxb-ink-soft); }
.preview { margin-top: 10px; display: flex; align-items: center; gap: 10px; padding: 8px; border: 2px dashed var(--pxb-line); border-radius: 10px; animation: fade .2s ease both; }
.preview[hidden] { display: none; }
.preview img { width: 64px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid var(--pxb-line); }
.preview .info { flex: 1; min-width: 0; font-size: 12.5px; }
.preview .info b { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.link { border: 0; background: none; padding: 4px 6px; color: var(--pxb-accent-600); font-weight: 800; font-size: 12.5px; text-decoration: underline; }
.file { display: none; }

.privacy { margin: 0; padding: 8px 10px; font-size: 12px; color: var(--pxb-ink-soft); background: var(--pxb-bg); border-radius: 8px; }
.error { margin: 0; padding: 10px 12px; font-size: 13px; font-weight: 700; color: #991b1b; background: #fee2e2; border: 2px solid #fca5a5; border-radius: 10px; animation: shake .35s ease both; }
.error[hidden] { display: none; }

.foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--pxb-line); background: var(--pxb-bg); }
.btn { padding: 10px 16px; border-radius: 10px; font-weight: 800; border: 2px solid var(--pxb-ink); background: #fff; color: var(--pxb-ink); }
.btn.primary { background: var(--pxb-accent-600); border-color: var(--pxb-accent-700); color: #fff; box-shadow: 3px 3px 0 0 var(--pxb-shadow); display: inline-flex; align-items: center; gap: 8px; }
.btn.primary:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 0 var(--pxb-shadow); }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; animation: spin .7s linear infinite; }
.spinner[hidden] { display: none; }

.done { padding: 32px 20px 28px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; }
.done[hidden], .form[hidden] { display: none; }
.done .robot { animation: cheer 1s ease-in-out infinite; }
.done h3 { margin: 4px 0 0; font-size: 18px; }
.done p { margin: 0; color: var(--pxb-ink-soft); }
.done .ticket { font-weight: 800; color: var(--pxb-accent-700); }
.form { display: contents; }

/* ---------- Robot: caminar, saltar, parpadear ---------- */
.robot { image-rendering: pixelated; overflow: visible; --step: 1s; transform-origin: 50% 100%; }
.robot g { transform-box: fill-box; }
.robot .all { transform-origin: 50% 100%; animation: walk-body var(--step) ease-in-out infinite; }
.robot .head { transform-origin: 50% 100%; animation: head-tilt calc(var(--step) * 2) ease-in-out infinite; }
.robot .antenna { transform-origin: 50% 100%; animation: antenna calc(var(--step) * 2) ease-in-out .15s infinite; }
.robot .arm { transform-origin: 50% 8%; }
.robot .armL { animation: swing var(--step) ease-in-out infinite; }
.robot .armR { animation: swing var(--step) ease-in-out calc(var(--step) / -2) infinite; }
.robot .leg { animation: step var(--step) ease-in-out infinite; }
.robot .legR { animation-delay: calc(var(--step) / -2); }
.robot .eyes { transform-origin: 50% 50%; animation: eye-blink 4.5s infinite, eye-look 7s ease-in-out infinite; }
.robot .leds { animation: beacon 1.2s steps(2) infinite; }
.fab .robot { --step: 1.1s; animation: hop 3.6s ease-in-out 1s infinite; }
.fab:hover .robot { --step: .45s; animation: hop 1.2s ease-in-out infinite; }
.wave .armR { animation: swing var(--step) ease-in-out calc(var(--step) / -2) infinite, wave-arm 1.1s ease-in-out .6s 3; }
.done .robot { --step: .5s; animation: cheer 1s ease-in-out infinite; }
.done .arm { animation: arms-up .5s ease-in-out infinite alternate; }
.done .armL { --dir: 1; } .done .armR { --dir: -1; }

@keyframes walk-body { 0%,50%,100% { transform: translateY(0) scale(1.05,.94); } 25%,75% { transform: translateY(-1px) scale(.97,1.04); } }
@keyframes head-tilt { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes antenna { 0%,100% { transform: rotate(10deg) scaleY(1); } 50% { transform: rotate(-10deg) scaleY(.85); } }
@keyframes swing { 0%,100% { transform: rotate(-28deg); } 50% { transform: rotate(28deg); } }
@keyframes step { 0%,50%,100% { transform: translateY(0); } 25% { transform: translateY(-1px); } }
@keyframes hop {
  0%,55%,100% { transform: translateY(0) scale(1); }
  62% { transform: translateY(0) scale(1.12,.84); }
  72% { transform: translateY(-5px) scale(.92,1.12); }
  84% { transform: translateY(0) scale(1.1,.88); }
  92% { transform: translateY(0) scale(.97,1.03); }
}
@keyframes cheer { 0%,100% { transform: translateY(0) scale(1.08,.88); } 40% { transform: translateY(-7px) scale(.92,1.12) rotate(-5deg); } 70% { transform: translateY(-7px) scale(.92,1.12) rotate(5deg); } }
@keyframes arms-up { from { transform: rotate(calc(var(--dir) * 140deg)); } to { transform: rotate(calc(var(--dir) * 165deg)); } }
@keyframes wave-arm { 0%,100% { transform: rotate(150deg); } 30% { transform: rotate(120deg); } 60% { transform: rotate(160deg); } }
@keyframes eye-blink { 0%,92%,100% { scale: 1 1; } 95% { scale: 1 .1; } }
@keyframes eye-look { 0%,30%,100% { translate: 0 0; } 40%,55% { translate: -.5px 0; } 65%,80% { translate: .5px 0; } }
@keyframes fab-in { from { transform: scale(0) rotate(-20deg); } to { transform: none; } }
@keyframes ring { 0% { opacity: .8; transform: scale(1); } 70%,100% { opacity: 0; transform: scale(1.5); } }
@keyframes pop { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: none; } }
@keyframes pop-out { to { opacity: 0; transform: scale(.7) translateY(8px); } }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes dialog-in { from { opacity: 0; transform: translateY(24px) scale(.94); } to { opacity: 1; transform: none; } }
@keyframes beacon { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
@keyframes blink-caret { 50% { opacity: 0; } }
@keyframes shake { 20%,60% { transform: translateX(-5px); } 40%,80% { transform: translateX(5px); } }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 520px) {
  .root { bottom: 14px; right: 14px; }
  .root.left { left: 14px; }
  .types { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition: none !important; }
}
`
