// Tests de la logique de l'appli (stockage local, sauvegardes, partage Android), sans navigateur.
// Lancer : npm test
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "www", "index.html"), "utf8");
const app = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1]
  .replace(/\}\)\(\);\s*$/, "window.__t={S,scheduleReminders,readCache,putEntry,removeEntry,restoreText,resetAll,undoQuick,medWarn,daysSince,saveFile,renderStats,setMode:m=>{sMode=m}};})();");

// --- Faux écran : chaque élément accepte toutes les opérations ---
const mk = () => {
  const t = function () {};
  return new Proxy(t, {
    get: (o, k) => {
      if (k in o) return o[k];
      if (k === "classList") return { toggle() {}, add() {}, remove() {}, contains() { return false } };
      if (k === "querySelector") return () => mk();
      if (k === "querySelectorAll") return () => [];
      if (k === "dataset" || k === "style") return {};
      if (k === "value") return o._v ?? "";
      if (k === Symbol.toPrimitive) return () => "";
      return mk();
    },
    set: (o, k, v) => { if (k === "value") o._v = v; else o[k] = v; return true },
    apply: () => mk(),
  });
};
let els = {};
const store = {};
global.document = { addEventListener() {}, documentElement: { dataset: {} }, getElementById: id => els[id] || (els[id] = mk()), querySelectorAll: () => [], querySelector: () => null, body: { classList: { toggle() {} } }, createElement: () => mk() };
global.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: k => { delete store[k] } };
global.matchMedia = () => ({ matches: false });
global.navigator = {};
global.FileReader = class { readAsDataURL(b) { b.arrayBuffer().then(a => { this.result = "data:x;base64," + Buffer.from(a).toString("base64"); this.onload() }) } };

// --- Faux téléphone : plugins Capacitor Filesystem + Share ---
const native = { written: [], shared: [], cancelShare: false, scheduled: [], cancelled: 0 };
function boot(withPhone) {
  els = {};
  global.window = { scrollTo() {}, addEventListener() {}, jspdf: null };
  if (withPhone) window.Capacitor = { isNativePlatform: () => true, Plugins: {
    Filesystem: { writeFile: async o => { native.written.push(o); return { uri: "file:///cache/" + o.path } } },
    Share: { share: async o => { if (native.cancelShare) throw new Error("Share canceled"); native.shared.push(o) } },
    App: { addListener() {}, exitApp() {} },
    LocalNotifications: { cancel: async () => { native.cancelled++ }, schedule: async o => { native.scheduled.push(o.notifications) },
      checkPermissions: async () => ({ display: "granted" }), requestPermissions: async () => ({ display: "granted" }) },
  } };
  eval(app);
  return window.__t;
}

let fails = 0;
const ok = (c, m) => { console.log((c ? "OK   " : "FAIL ") + m); if (!c) fails++ };

(async () => {
  // Ancienne version : reprise une seule fois
  store["journal-migraines-v1"] = JSON.stringify({ entries: { "2026-10-01": { date: "2026-10-01", migraine: true, intensity: 5, zones: [], symptoms: [] } } });
  let T = boot(true);
  ok(T.S.entries["2026-10-01"] && !store["journal-migraines-v1"], "ancienne version reprise une fois, puis clé effacée");
  await T.removeEntry("2026-10-01");
  T = boot(true);
  ok(!T.S.entries["2026-10-01"], "un jour supprimé ne revient pas à la réouverture");

  // Enregistrement durable
  await T.putEntry({ date: "2026-10-10", migraine: true, intensity: 8, zones: [], symptoms: [] });
  T = boot(true);
  ok(T.S.entries["2026-10-10"] && T.S.entries["2026-10-10"].intensity === 8 && T.S.entries["2026-10-10"].updatedAt, "une journée enregistrée est toujours là à la réouverture");

  // Restauration
  await T.restoreText(JSON.stringify({ entries: { "2026-10-10": { date: "2026-10-10", migraine: false, intensity: 0 }, "2026-10-11": { date: "2026-10-11", migraine: true, intensity: 4 } } }));
  ok(T.S.entries["2026-10-10"].intensity === 8, "restauration n'écrase pas un jour plus récent");
  ok(T.S.entries["2026-10-11"] && JSON.parse(store["jm-cache-v2"]).entries["2026-10-11"], "restauration ajoute et enregistre les jours manquants");
  ok(!(await T.restoreText("pas du json")), "texte invalide refusé");

  // Crise rapide retirée
  const prev = { date: "2026-10-12", migraine: false, intensity: 0, zones: [], symptoms: [], lunch: "salade" };
  await T.putEntry(Object.assign({}, prev, { migraine: true, intensity: 9, quick: true, quickPrev: prev }));
  await T.undoQuick("2026-10-12");
  const e = T.S.entries["2026-10-12"];
  ok(e && e.migraine === false && e.lunch === "salade" && !e.quick && !e.quickPrev, "retirer la crise rapide remet la journée d'avant");
  await T.putEntry({ date: "2026-10-13", migraine: true, intensity: 6, zones: [], symptoms: [], quick: true, quickPrev: null });
  await T.undoQuick("2026-10-13");
  ok(!T.S.entries["2026-10-13"], "retirer une crise rapide sur un jour vide supprime le jour");

  // Rappel de sauvegarde
  ok(T.daysSince(undefined) === Infinity && T.daysSince(new Date().toISOString().slice(0, 10)) === 0, "calcul des jours depuis la dernière sauvegarde");

  // Partage Android
  ok(await T.saveFile("a.json", '{"x":1}'), "texte partagé");
  const w1 = native.written.pop(), s1 = native.shared.pop();
  ok(w1.encoding === "utf8" && w1.data === '{"x":1}' && w1.directory === "CACHE" && s1.files[0] === "file:///cache/a.json", "texte écrit en UTF-8 puis envoyé au menu de partage");
  ok(await T.saveFile("r.pdf", new Blob([Buffer.from("PDF!")])), "PDF partagé");
  const w2 = native.written.pop();
  ok(!w2.encoding && Buffer.from(w2.data, "base64").toString() === "PDF!", "PDF écrit en binaire (base64) sans altération");
  native.cancelShare = true;
  ok((await T.saveFile("a.json", "x")) === false, "partage annulé = pas compté comme sauvegarde");
  native.cancelShare = false;

  // Rappel du soir
  const ymdL = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const now = new Date(), today = ymdL(now);
  native.scheduled = []; native.cancelled = 0;
  T.S.settings.reminder = { on: false, time: "21:00" }; await T.scheduleReminders();
  ok(native.cancelled === 1 && native.scheduled.length === 0, "rappel désactivé : rien de programmé");
  const late = now.getHours() < 23 ? `${String(now.getHours() + 1).padStart(2, "0")}:00` : null;
  if (late) {
    delete T.S.entries[today];
    T.S.settings.reminder = { on: true, time: late }; await T.scheduleReminders();
    const l1 = native.scheduled.pop();
    ok(l1.length === 14 && l1.every(n => n.schedule.at.getHours() === +late.slice(0, 2) && n.schedule.at.getMinutes() === 0 && n.schedule.allowWhileIdle),
      "rappel activé : 14 soirs programmés à la bonne heure");
    ok(ymdL(l1[0].schedule.at) === today && l1[0].body.includes("Même un jour sans mal"), "le rappel de ce soir est prévu tant que la journée n'est pas notée");
    await T.putEntry({ date: today, migraine: false, intensity: 0, zones: [], symptoms: [] });
    const l2 = native.scheduled.pop();
    ok(l2.length === 13 && !l2.some(n => ymdL(n.schedule.at) === today), "journée notée : plus de rappel ce soir, les suivants restent");
    await T.removeEntry(today);
  } else console.log("(test du rappel de ce soir sauté : il est plus de 23 h)");

  // Remise à zéro
  await T.resetAll();
  T = boot(true);
  ok(!Object.keys(T.S.entries).length, "remise à zéro : plus rien à la réouverture");

  // Seuils médicaments
  ok(T.medWarn(10, 10, "x").lvl === 2 && T.medWarn(15, 0, "x").lvl === 2 && T.medWarn(10, 0, "x").lvl === 1 && T.medWarn(5, 2, "x") === null, "seuils médicaments");

  // Bilan
  try { T.renderStats(); T.setMode("month"); T.renderStats(); await T.putEntry({ date: "2026-10-14", migraine: true, intensity: 5, zones: [], symptoms: [] }); T.renderStats(); ok(true, "bilan semaine et mois sans erreur") }
  catch (err) { ok(false, "bilan : " + err.message) }

  console.log(fails ? `\n${fails} test(s) en échec` : "\nTous les tests passent");
  process.exit(fails ? 1 : 0);
})();
