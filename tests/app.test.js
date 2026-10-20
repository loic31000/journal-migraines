// Tests de la logique de l'appli (stockage local, sauvegardes, partage Android), sans navigateur.
// Lancer : npm test
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "www", "index.html"), "utf8");
const scriptStart = html.lastIndexOf("<script>") + "<script>".length;
const app = html.slice(scriptStart, html.indexOf("</script>", scriptStart))
  .replace(/\}\)\(\);\s*$/, "window.__t={S,monthCounts,chronicFlag,ichd,periodStarts,menstrual,recurrences,set2h,medsAwaiting2h,isWeak,applyPreset,presetCount,T,G,stLabel,symLabel,noPainNow,missedDays,recentMeds,medStatus,takeMed,untakeMed,handleLink,docSummary,rdvFrom,rdvDone,addDocQ,isCrisis,scheduleReminders,readCache,putEntry,removeEntry,restoreText,resetAll,undoQuick,medWarn,medsOf,summarize,endTime,dayDetailHtml,cleanEntry,cleanSettings,writeSnapshot,restoreFromSnapshot,crisisDuration,usualFrom,periodTitle,nextDoses,midasScore,midasGrade,quickCrisis,daysSince,saveFile,renderStats,setMode:m=>{sMode=m},setAnchor:d=>{sAnchor=d}};})();");

// --- Faux écran : chaque élément accepte toutes les opérations ---
const mk = () => {
  const t = function () {};
  return new Proxy(t, {
    get: (o, k) => {
      if (k in o) return o[k];
      if (k === "classList") return { toggle() {}, add() {}, remove() {}, contains() { return false } };
      if (k === "querySelector") return () => mk();
      if (k === "querySelectorAll") return () => [];
      if (k === "dataset") return {};
      if (k === "style") return { setProperty() {} };
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
global.document = { addEventListener() {}, documentElement: { dataset: {} }, getElementById: id => els[id] || (els[id] = mk()), querySelectorAll: () => [], querySelector: () => null, body: { classList: { toggle() {} }, dataset: {} }, createElement: () => mk() };
global.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: k => { delete store[k] } };
global.matchMedia = () => ({ matches: false });
global.navigator = {};
global.FileReader = class { readAsDataURL(b) { b.arrayBuffer().then(a => { this.result = "data:x;base64," + Buffer.from(a).toString("base64"); this.onload() }) } };

// --- Faux téléphone : plugins Capacitor Filesystem + Share ---
const native = { written: [], shared: [], cancelShare: false, scheduled: [], cancelled: 0, actionTypes: null, listeners: {}, files: {} };
function boot(withPhone) {
  els = {};
  global.window = { scrollTo() {}, addEventListener() {}, jspdf: null };
  if (withPhone) window.Capacitor = { isNativePlatform: () => true, Plugins: {
    Filesystem: {
      writeFile: async o => { if (o.directory === "DATA") { native.files[o.path] = o.data; return { uri: "file:///data/" + o.path } } native.written.push(o); return { uri: "file:///cache/" + o.path } },
      readFile: async o => { if (!(o.path in native.files)) throw new Error("File does not exist"); return { data: native.files[o.path] } },
      deleteFile: async o => { delete native.files[o.path] } },
    Share: { share: async o => { if (native.cancelShare) throw new Error("Share canceled"); native.shared.push(o) } },
    App: { addListener() {}, exitApp() {} },
    LocalNotifications: { cancel: async () => { native.cancelled++ }, schedule: async o => { native.scheduled.push(o.notifications); (native.every = native.every || []).push(...o.notifications) },
      checkPermissions: async () => ({ display: "granted" }), requestPermissions: async () => ({ display: "granted" }),
      registerActionTypes: async o => { native.actionTypes = o.types }, addListener: (ev, fn) => { native.listeners[ev] = fn } },
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

  // Plusieurs médicaments dans une journée
  ok(T.medsOf({ med: "Doliprane", medEff: "oui" }).length === 1 && T.medsOf({ meds: [{ name: "A", eff: "" }, { name: "B", eff: "non" }] }).length === 2
    && T.medsOf({ meds: [], med: "Doliprane", medEff: "" })[0].name === "Doliprane" && T.medsOf({ meds: [] }).length === 0, "médicaments : ancien et nouveau format lus");
  const sm = T.summarize([
    { date: "2026-09-01", migraine: true, intensity: 6, zones: [], symptoms: [], meds: [{ name: "Doliprane 1 g", eff: "un peu" }, { name: "Sumatriptan", eff: "oui" }] },
    { date: "2026-09-02", migraine: true, intensity: 4, zones: [], symptoms: [], med: "Doliprane 1 g", medEff: "oui" },
    { date: "2026-09-03", migraine: true, intensity: 3, zones: [], symptoms: [], meds: [] }]);
  ok(sm.medDays === 2 && sm.triDays === 1 && sm.meds["Doliprane 1 g"].n === 2 && sm.meds["Doliprane 1 g"].oui === 1 && sm.meds["Doliprane 1 g"]["un peu"] === 1 && sm.meds["Sumatriptan"].oui === 1,
    "bilan : chaque médicament compté, un jour à deux prises compte une fois");
  await T.restoreText(JSON.stringify({ entries: { "2025-01-05": { date: "2025-01-05", migraine: true, intensity: 5, zones: [], symptoms: [], med: "Ibuprofène", medEff: "oui", updatedAt: 1 } } }));
  ok(T.medsOf(T.S.entries["2025-01-05"])[0].name === "Ibuprofène", "restauration d'une vieille sauvegarde : le médicament est gardé");

  // Heures : fin de crise et détail du jour dans l'ordre
  const e1 = T.endTime("14:30", 2.5), e2 = T.endTime("22:30", 3);
  ok(e1.t === "17:00" && !e1.next && e2.t === "01:30" && e2.next && T.endTime("", 2) === "" && T.endTime("10:00", "") === "", "fin de crise calculée, y compris après minuit");
  const dh = T.dayDetailHtml({ date: "2026-09-10", migraine: true, intensity: 6, start: "14:30", duration: 2, zones: ["Tempes"], symptoms: ["Nausées"],
    meds: [{ name: "Ibuprofène", time: "16:00", eff: "oui" }, { name: "Doliprane", time: "", eff: "" }], breakfast: "café", breakfastTime: "08:00", lunch: "pâtes", lunchTime: "",
    dinner: "soupe", dinnerTime: "19:30", coffee: 2, water: 5, sleep: 6.5, screen: 7, glasses: "oui", stress: "3", period: "non", notes: "Réunion", custom: {} });
  const order = ["08:00", "14:30", "16:00", "16:30", "19:30"].map(h => dh.indexOf(`<time>${h}</time>`));
  ok(order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])), "détail du jour : repas, crise et médicaments rangés par heure");
  ok(["Nausées", "Doliprane", "pâtes", "Cafés ou thés", "Écrans", "Cycle", "Réunion", "Sommeil"].every(x => dh.includes(x)), "détail du jour : toutes les infos sans heure sont aussi affichées");

  // Sécurité : une sauvegarde piégée est remise au propre
  const evil = T.cleanEntry(JSON.parse('{"date":"2026-09-01","migraine":true,"intensity":"<img src=x onerror=alert(1)>","start":"<b>","zones":["Front",{"x":1}],' +
    '"meds":[{"name":"Doliprane","time":"25:99","eff":"<script>"}],"custom":{"ok":"oui","bad id\\"":"x"},"__proto__":{"pwn":1},"inconnu":"<svg>"}'), true);
  ok(evil.intensity === 0 && evil.start === "" && evil.zones.length === 1 && evil.meds[0].time === "" && evil.meds[0].eff === "" && !("inconnu" in evil)
    && Object.keys(evil.custom).join() === "ok" && ({}).pwn === undefined && Object.getPrototypeOf(evil) === Object.prototype, "sauvegarde piégée : champs nettoyés, rien d'inconnu ne passe");
  const good = { date: "2026-09-02", migraine: true, intensity: 6, start: "14:30", duration: 2.5, zones: ["Tempes"], symptoms: ["Nausées"], meds: [{ name: "Ibuprofène", time: "15:00", eff: "oui" }],
    glasses: "oui", breakfast: "café", lunch: "pâtes", dinner: "", breakfastTime: "08:00", lunchTime: "", dinnerTime: "", sleep: 6.5, water: 5, screen: 7, coffee: 2, stress: "3", period: "non", notes: "ok", custom: { q1: "oui" }, updatedAt: 5 };
  ok(JSON.stringify(T.cleanEntry(good, true)) === JSON.stringify(good), "journée normale : rien n'est perdu au nettoyage");
  ok(T.cleanEntry({ date: "pas une date" }) === null && T.cleanEntry(null) === null, "journée sans date valide refusée");
  ok(T.cleanSettings({ custom: [{ id: 'x" onfocus="a', label: "Q", type: "text" }, { id: "q2", label: "Sport ?", type: "bool" }] }).custom.map(q => q.id).join() === "q2", "question perso avec un identifiant piégé refusée");

  // Bilan « En bref » : une phrase simple et des chiffres concrets, seulement avec assez de jours
  const mkDay = (d, o) => Object.assign({ date: d, migraine: false, intensity: 0, zones: [], symptoms: [], updatedAt: 1 }, o);
  T.S.entries = {};
  ["2025-03-03", "2025-03-04", "2025-03-05", "2025-03-06"].forEach(d => T.S.entries[d] = mkDay(d, { migraine: true, intensity: 6, sleep: 5 }));
  ["2025-03-07", "2025-03-08", "2025-03-09", "2025-03-10"].forEach(d => T.S.entries[d] = mkDay(d, { sleep: 8 }));
  T.setMode("month"); T.setAnchor(new Date(2025, 2, 15)); T.renderStats();
  let bref = String(els.statsBody.innerHTML || "");
  ok(bref.includes("Encore 2 jours à noter") && !bref.includes("Tu as plus souvent mal"), "bilan : moins de 10 jours notés, pas de piste mais « Encore 2 jours à noter »");
  T.S.entries = {};
  const lunchM = ["pâtes, chocolat", "pâtes, chocolat", "salade, chocolat", "pâtes, chocolat", "pâtes", "pâtes"];
  ["03", "04", "05", "06", "07", "08"].forEach((n, i) => { const d = "2025-03-" + n; T.S.entries[d] = mkDay(d, { migraine: i < 5, intensity: i < 5 ? 6 : 0, sleep: 5, lunch: lunchM[i],
    start: ["15:00", "16:00", "15:30", "09:00", "14:30", ""][i], meds: i < 5 ? [{ name: "Doliprane", time: ["16:00", "17:00", "16:30", "09:30", "15:30", ""][i], eff: "oui" }] : [] }) });
  ["10", "11", "12", "13", "14", "15"].forEach(n => { const d = "2025-03-" + n; T.S.entries[d] = mkDay(d, { sleep: 8, lunch: "pâtes, salade" }) });
  T.renderStats(); bref = String(els.statsBody.innerHTML || "");
  ok(bref.includes("Tu as plus souvent mal quand tu dors moins de 7 h.") && bref.includes("Mal de tête 5 jours sur 6 dans ce cas, contre aucun jour sur 6 les autres jours.") && bref.includes("Piste encore faible"),
    "bilan : la piste du sommeil dite en phrase simple, avec « 5 jours sur 6 »");
  ok(!/\d+ %/.test(bref), "bilan : plus de pourcentages, des « x sur y »");
  const sm2 = T.summarize(Object.values(T.S.entries));
  ok(sm2.foodsCmp.length === 1 && sm2.foodsCmp[0].t === "chocolat" && sm2.foodsCmp[0].o === 0 && !sm2.foodsCmp.some(x => x.t === "pâtes"),
    "aliments : le chocolat ressort, les pâtes (mangées tous les jours) non");
  ok(bref.includes("Chocolat : seulement les jours de mal"), "aliments : phrase « seulement les jours de mal »");
  ok(sm2.slots.find(x => x.lab === "Après-midi").n === 4 && bref.includes("Tes crises commencent surtout l&#39;après-midi (14 - 18 h)."), "moment des crises : l'après-midi ressort (4 sur 5)");
  ok(bref.includes("En moyenne, tu prends ton médicament <b>54 min</b> après le début de la crise."), "délai moyen de prise du médicament : 54 min");
  ok(bref.includes("a soulagé 5 fois sur 5") && bref.includes("5 / 15 j"), "médicaments : efficacité et jauge vers le seuil d'alerte");
  T.setMode("quarter"); T.renderStats(); bref = String(els.statsBody.innerHTML || "");
  ok(bref.includes("Jours avec médicament, par mois") && bref.includes("dchart weeks") && bref.includes("Semaine par semaine"), "période 3 mois : jauge par mois et graphique semaine par semaine");
  T.setMode("month");

  // Fin de crise : durée d'après l'heure de début, arrondie à la demi-heure
  ok(T.crisisDuration("14:30", 17 * 60 + 10) === 2.5 && T.crisisDuration("14:30", 14 * 60 + 40) === 0.5 && T.crisisDuration("23:00", 60) === 2 && T.crisisDuration("", 600) === "",
    "fin de crise : durée calculée (2,5 h ; 30 min au moins ; passage de minuit)");
  // Crise rapide : notification « Ta crise est-elle finie ? » avec deux actions
  native.scheduled = [];
  await T.quickCrisis(9); await new Promise(r => setTimeout(r, 30));
  const cn = native.scheduled.flat().find(n => n.id === 300);
  ok(cn && cn.actionTypeId === "CRISIS_END" && native.actionTypes && native.actionTypes[0].actions.map(x => x.id).join() === "done,later,med" && Math.abs(cn.schedule.at - Date.now() - 2 * 3600e3) < 60e3,
    "crise rapide : notification de fin dans 2 h, avec « Oui, c'est fini », « Pas encore » et « J'ai pris… »");
  ok(typeof native.listeners.localNotificationActionPerformed === "function", "la réponse à la notification est écoutée");
  await T.undoQuick(T.S.entries[Object.keys(T.S.entries).sort().pop()].date);

  // Journée type : ce qui revient le plus souvent sur les 14 derniers jours
  const ue = {};
  ["2025-04-01", "2025-04-02", "2025-04-03", "2025-04-04"].forEach((d, i) => ue[d] = { date: d, sleep: [7, 7.5, 6, 8][i], water: [5, 6, 5, 4][i], coffee: 2, screen: [4, 5, 4, 6][i], glasses: "oui", breakfast: i < 3 ? "café, tartines" : "thé", lunch: ["pâtes", "salade", "quiche", "riz"][i], breakfastTime: "08:00" });
  const u = T.usualFrom(ue, "2025-04-05");
  ok(u && u.sleep === 7 && u.water === 5 && u.coffee === 2 && u.glasses === "oui" && u.breakfast === "café, tartines" && u.breakfastTime === "08:00" && u.lunch === "",
    "comme d'habitude : médianes et habitudes (un repas qui change chaque jour n'est pas proposé)");
  ok(T.usualFrom({ "2025-04-01": { date: "2025-04-01" } }, "2025-04-05") === null, "comme d'habitude : rien proposé avec moins de 3 jours");

  // Prochaine prise possible
  const dn = new Date(2025, 4, 10, 18, 0), dk = "2025-05-10";
  const nd = T.nextDoses({ [dk]: { date: dk, meds: [{ name: "Doliprane 1 g", time: "15:00", eff: "oui" }, { name: "Ibuprofène", time: "09:00", eff: "" }] } }, { "doliprane 1 g": 6, "ibuprofène": 8 }, dn);
  ok(nd.length === 1 && nd[0].name === "Doliprane 1 g" && nd[0].next.getHours() === 21 && nd[0].next.getMinutes() === 0, "rappel de prise : Doliprane à 15 h + 6 h -> 21 h (l'ibuprofène de 9 h + 8 h est déjà passé)");
  const lateDose = T.nextDoses({ "2025-05-09": { date: "2025-05-09", meds: [{ name: "Doliprane 1 g", time: "23:00" }] } }, { "doliprane 1 g": 6 }, new Date(2025, 4, 10, 1, 0));
  ok(lateDose.length === 1 && lateDose[0].next.getHours() === 5, "rappel de prise : une prise de la veille au soir compte encore");

  // Questionnaire MIDAS
  ok(T.midasScore([2, 3, 0, 4, 2]) === 11 && T.midasGrade(5).g === "I" && T.midasGrade(10).g === "II" && T.midasGrade(11).g === "III" && T.midasGrade(21).g === "IV", "MIDAS : score et grades");
  const cs = T.cleanSettings({ medGaps: { "doliprane": 6, "piège": 7, "x": "<b>" }, midas: [{ date: "2025-01-01", a: [1, 2, 3, 4, 5], score: 999 }, { date: "bad", a: [1] }, { date: "2025-02-01", a: [1, 2, 3, 4, 500] }] });
  ok(JSON.stringify(cs.medGaps) === '{"doliprane":6}' && cs.midas.length === 1 && cs.midas[0].score === 15, "réglages : écarts et questionnaires nettoyés (score recalculé)");

  // Titres de période : une seule règle pour semaine, mois et 3 mois
  const D = (y, m, d) => new Date(y, m - 1, d);
  ok(T.periodTitle(D(2026, 10, 5), D(2026, 10, 11), "week") === "5 - 11 octobre 2026"
    && T.periodTitle(D(2026, 9, 28), D(2026, 10, 4), "week") === "28 sept. - 4 oct. 2026"
    && T.periodTitle(D(2025, 12, 29), D(2026, 1, 4), "week") === "29 déc. 2025 - 4 janv. 2026"
    && T.periodTitle(D(2026, 10, 1), D(2026, 10, 31), "month") === "octobre 2026"
    && T.periodTitle(D(2026, 8, 1), D(2026, 10, 31), "quarter") === "août - octobre 2026"
    && T.periodTitle(D(2025, 11, 1), D(2026, 1, 31), "quarter") === "novembre 2025 - janvier 2026", "titres de période unifiés (mois en toutes lettres, année toujours là)");

  // Échappement : du code piégé dans les champs libres ne produit aucune balise dans le détail du jour
  const trap = `"'><img src=x onerror=alert(1)><script>alert(2)</script>`;
  const dx = T.dayDetailHtml({ date: "2026-09-12", migraine: true, intensity: 6, start: "14:00", duration: 2, zones: [trap], symptoms: [trap],
    meds: [{ name: trap, time: "15:00", eff: "oui" }, { name: trap, time: "", eff: "" }], breakfast: trap, breakfastTime: "08:00", lunch: trap, lunchTime: "", dinner: trap, dinnerTime: "",
    sleep: 7, water: 5, screen: 4, coffee: 1, glasses: "oui", stress: "2", period: "non", notes: trap, custom: {} });
  ok(!/<img|<script/i.test(dx) && (dx.match(/&lt;img/g) || []).length >= 7 && dx.includes("&lt;script&gt;"),
    "détail du jour : notes, repas, médicaments et zones piégés restent du texte échappé");

  // Sauvegarde automatique : copie à chaque changement, retrouvée si l'appli perd ses notes
  const tick = () => new Promise(r => setTimeout(r, 30));
  native.files = {};
  T = boot(true); await tick();
  await T.putEntry({ date: "2025-06-01", migraine: true, intensity: 7, zones: ["Front"], symptoms: [], notes: "orage", updatedAt: 1 });
  await T.putEntry({ date: "2025-06-02", migraine: false, intensity: 0, zones: [], symptoms: [] });
  await T.writeSnapshot(); await tick();
  const snap = JSON.parse(native.files["sauvegarde-auto.json"] || "{}");
  ok(snap.entries && snap.entries["2025-06-01"] && snap.entries["2025-06-01"].notes === "orage" && snap.entries["2025-06-02"], "copie automatique écrite dans le dossier privé à chaque changement");
  // Le téléphone a perdu les notes de l'appli (nouveau téléphone) mais Android a remis le dossier privé
  for (const k of Object.keys(store)) delete store[k];
  T = boot(true); await tick(); await tick();
  ok(T.S.entries["2025-06-01"] && T.S.entries["2025-06-01"].notes === "orage" && T.S.entries["2025-06-02"], "notes perdues : retrouvées toutes seules au démarrage depuis la copie");
  ok(JSON.parse(store["jm-cache-v2"]).entries["2025-06-01"], "notes retrouvées et de nouveau enregistrées dans l'appli");
  // Un jour plus récent dans l'appli n'est jamais remplacé par la copie
  await T.putEntry({ date: "2025-06-01", migraine: true, intensity: 3, zones: [], symptoms: [], notes: "plus récent" });
  native.files["sauvegarde-auto.json"] = JSON.stringify(snap);
  await T.restoreFromSnapshot();
  ok(T.S.entries["2025-06-01"].notes === "plus récent", "la copie ne remplace jamais un jour plus récent");
  // Copie abîmée : on retrouve la copie de la veille
  native.files["sauvegarde-auto.json"] = "{abîmé";
  native.files["sauvegarde-auto-veille.json"] = JSON.stringify({ entries: { "2025-05-30": { date: "2025-05-30", migraine: false, intensity: 0, zones: [], symptoms: [], updatedAt: 5 } } });
  await T.restoreFromSnapshot();
  ok(T.S.entries["2025-05-30"], "copie abîmée : la copie de la veille prend le relais");
  // Tout effacer efface aussi les copies (sinon les notes reviendraient au démarrage)
  await T.resetAll(); await tick();
  const after = JSON.parse(native.files["sauvegarde-auto.json"] || "{}");
  ok(!native.files["sauvegarde-auto-veille.json"] && after.entries && !Object.keys(after.entries).length, "« Tout effacer » efface aussi les copies automatiques");
  T = boot(true); await tick(); await tick();
  ok(!Object.keys(T.S.entries).length, "après « Tout effacer », rien ne revient au démarrage");


  // --- v2.3 ---
  const tk = () => new Promise(r => setTimeout(r, 30));
  const td = ymdL(new Date());
  // Mots et ton : neutre et sobre par défaut, rien de genré ni de tendre tant que ce n'est pas choisi
  T = boot(true); await tk();
  T.S.settings.name = "Camille Martin";
  ok(T.stLabel("4") === "Fort stress" && T.symLabel("Sensible à la lumière") === "Sensible à la lumière" && T.T("remind") === "As-tu noté ta journée ? Même un jour sans mal compte.",
    "par défaut : textes neutres et sobres");
  T.S.settings.gender = "f";
  ok(T.stLabel("3") === "Stressée" && T.stLabel("4") === "Très stressée" && T.symLabel("Sensible au bruit") === "Gênée par le bruit", "au féminin : Stressée, Gênée par le bruit");
  T.S.settings.gender = "m";
  ok(T.stLabel("4") === "Très stressé" && T.symLabel("Sensible à la lumière") === "Gêné par la lumière", "au masculin : Très stressé, Gêné par la lumière");
  T.S.settings.tone = "tendre";
  ok(T.T("remind") === "Coucou Camille, tu as noté ta journée ? Même un jour sans mal compte.", "ton tendre : le rappel salue par le prénom");
  T.S.settings.pet = "mon amour";
  ok(T.T("remind").startsWith("Coucou mon amour,") && T.T("dose", { med: "Doliprane" }) === "Mon amour, tu peux reprendre Doliprane si tu en as besoin."
    && T.T("crisisEnded", { h: "2,5" }) === "Crise de 2,5 h notée. Repose-toi bien, mon amour.", "ton tendre : le petit nom remplace le prénom");
  T.S.settings.pet = ""; T.S.settings.name = "";
  ok(T.T("crisisAsk").startsWith("Ta crise est passée ?") && T.T("savedCalm") === "C'est noté. Belle journée !", "ton tendre sans prénom : phrases correctes");
  const cs2 = T.cleanSettings({ gender: "x", tone: "fou", pet: "a".repeat(90), rdv: { next: "<b>", last: "2026-09-03" }, docQ: [{ id: "d1", t: "Traitement de fond ?", done: 1 }, { id: "bad id", t: "x" }] });
  ok(cs2.gender === "" && cs2.tone === "" && cs2.pet.length === 40 && cs2.rdv.next === "" && cs2.rdv.last === "2026-09-03" && cs2.docQ.length === 1 && cs2.docQ[0].done === false,
    "réglages : accords, ton, petit nom, rendez-vous et questions nettoyés");
  ok(T.cleanEntry({ date: "2026-09-01", migraine: true, symptoms: ["Gênée par la lumière", "Nausées"] }).symptoms.join() === "Sensible à la lumière,Nausées",
    "symptômes notés au féminin (ancienne version) ramenés à la forme neutre");
  T.S.settings.gender = ""; T.S.settings.tone = "";

  // « Pas de mal » en un toucher
  T.S.entries = {};
  ok(await T.noPainNow() && T.S.entries[td].migraine === false && T.S.entries[td].intensity === 0, "« Pas de mal » : journée notée d'un toucher");
  ok(!(await T.noPainNow()), "« Pas de mal » ne remplace pas une journée déjà notée");

  // Jours oubliés : seulement depuis la première note
  const nowD = new Date(2026, 9, 19, 12), K = n => ymdL(new Date(2026, 9, 19 - n));
  ok(T.missedDays({}, nowD).length === 0, "jours oubliés : rien tant qu'aucune note");
  ok(T.missedDays({ [K(3)]: {}, [K(1)]: {} }, nowD).join() === K(2), "jours oubliés : seulement les trous depuis la première note");
  ok(T.missedDays({ [K(10)]: {} }, nowD).length === 6 && T.missedDays({ [K(10)]: {} }, nowD)[0] === K(1), "jours oubliés : les 6 derniers jours, le plus récent d'abord");

  // Médicaments habituels et « J'ai pris »
  const md = { "2026-10-10": { date: "2026-10-10", meds: [{ name: "Ibuprofène 400", time: "10:00" }] }, "2026-10-12": { date: "2026-10-12", meds: [{ name: "Ibuprofène 400", time: "" }, { name: "Sumatriptan", time: "" }] },
    "2026-10-15": { date: "2026-10-15", meds: [{ name: "ibuprofène 400", time: "" }] }, "2026-01-01": { date: "2026-01-01", meds: [{ name: "Vieux", time: "" }] } };
  const rm = T.recentMeds(md, nowD);
  ok(rm.join() === "ibuprofène 400,Sumatriptan", "médicaments habituels : les plus pris d'abord, 90 derniers jours seulement");
  T.S.entries = {}; T.S.settings.medGaps = { "sumatriptan": 6 };
  const at = new Date(); at.setHours(13, 20, 0, 0);
  ok(!(await T.takeMed("Sumatriptan", at)), "« J'ai pris » : refusé s'il n'y a pas de crise notée ce jour");
  await T.putEntry({ date: td, migraine: true, intensity: 8, start: "13:05", duration: "", zones: [], symptoms: [], meds: [], quick: true, quickPrev: null });
  ok(await T.takeMed("Sumatriptan", at), "« J'ai pris » : prise ajoutée à la crise du jour");
  const me = T.S.entries[td];
  ok(me.meds.length === 1 && me.meds[0].name === "Sumatriptan" && me.meds[0].time === "13:20" && me.quick === true, "« J'ai pris » : nom et heure gardés, la crise reste une crise rapide");
  const st1 = T.medStatus("Sumatriptan", new Date(at.getTime() + 3600e3));
  ok(st1.wait && st1.txt === "possible vers 19 h 20", "statut : prochaine prise possible d'après l'écart réglé");
  await T.untakeMed(td, "Sumatriptan", "13:20");
  ok(T.S.entries[td].meds.length === 0, "« Annuler » retire la prise");

  // Liens du widget et des raccourcis
  T.S.entries = {};
  ok(await T.handleLink("journalmigraines://nopain") && T.S.entries[td] && T.S.entries[td].migraine === false, "lien « Pas de mal » : journée notée");
  T.S.entries = {};
  await new Promise(r => setTimeout(r, 5));
  ok(await T.handleLink("journalmigraines://quick?l=6") && T.S.entries[td].migraine === true && T.S.entries[td].intensity === 6 && T.S.entries[td].quick && !T.isCrisis(), "lien crise moyenne : crise rapide notée");
  ok(!(await T.handleLink("journalmigraines://quick?l=6")), "le même lien reçu deux fois de suite n'est traité qu'une fois");
  ok(await T.handleLink("journalmigraines://quick?l=9") && T.S.entries[td].intensity === 9 && T.isCrisis(), "lien crise forte : mode crise");
  ok(!(await T.handleLink("journalmigraines://quick?l=7")) && !(await T.handleLink("https://exemple.fr")) && !(await T.handleLink("journalmigraines://rm?l=1")), "liens inconnus ignorés");

  // Médecin : depuis le dernier rendez-vous, questions à poser
  T.S.entries = { "2026-08-30": { date: "2026-08-30", migraine: true, intensity: 9, meds: [] }, "2026-09-05": { date: "2026-09-05", migraine: true, intensity: 6, meds: [{ name: "Sumatriptan" }] },
    "2026-09-06": { date: "2026-09-06", migraine: true, intensity: 4, meds: [{ name: "Doliprane" }] }, "2026-09-07": { date: "2026-09-07", migraine: false, intensity: 0 } };
  T.S.settings.rdv = { next: "", last: "2026-09-03" };
  const rf = T.rdvFrom(nowD), ds = T.docSummary(T.S.entries, rf.from, "2026-10-19");
  ok(rf.since && rf.from === "2026-09-03" && ds.n === 3 && ds.mig === 2 && ds.avgI === 5 && ds.medDays === 2 && ds.triDays === 1, "médecin : résumé depuis le dernier rendez-vous");
  T.S.settings.rdv = { next: "", last: "" };
  ok(!T.rdvFrom(nowD).since && T.rdvFrom(nowD).from === "2026-08-01", "médecin : sans rendez-vous noté, les 3 derniers mois");
  T.S.settings.docQ = [];
  ok(await T.addDocQ("  Un traitement de fond ?  ") && !(await T.addDocQ("   ")) && T.S.settings.docQ[0].t === "Un traitement de fond ?", "questions pour le médecin : ajout, texte vide refusé");
  T.S.settings.docQ.push({ id: "dz", t: "Lien avec les règles ?", done: true });
  T.S.settings.rdv = { next: td, last: "2026-09-03" };
  ok(await T.rdvDone() && T.S.settings.rdv.last === td && !T.S.settings.rdv.next && T.S.settings.docQ.length === 1, "rendez-vous passé : il devient le dernier, les questions cochées sont rangées");
  T = boot(true); await tk();
  ok(T.S.settings.rdv.last === td && T.S.settings.docQ.length === 1, "rendez-vous et questions gardés à la réouverture");


  // Journée type : notée d'office avec « Ma tête va bien », sans jamais remplacer une réponse donnée
  T.S.entries = {}; T.S.settings.custom = [{ id: "q1", label: "Cachet ?", type: "bool" }, { id: "q2", label: "Note", type: "text" }];
  const cp = T.cleanSettings({ dayPreset: { glasses: "oui", sleep: "7.5", water: 6, coffee: "", stress: "9", breakfast: "café", custom: { q1: "non", q2: "x", "bad id": "oui" } }, presetAuto: "yes" });
  ok(cp.dayPreset.glasses === "oui" && cp.dayPreset.sleep === 7.5 && cp.dayPreset.water === 6 && cp.dayPreset.coffee === "" && cp.dayPreset.stress === "" && cp.dayPreset.breakfast === "café"
    && JSON.stringify(cp.dayPreset.custom) === '{"q1":"non"}' && cp.presetAuto === false, "journée type : valeurs nettoyées");
  T.S.settings.dayPreset = cp.dayPreset; T.S.settings.presetAuto = false;
  ok(T.presetCount() === 5, "journée type : lunettes, sommeil, eau, petit-déjeuner et la question Oui/Non comptés");
  await T.noPainNow();
  const pe = T.S.entries[td];
  ok(pe.migraine === false && pe.glasses === "oui" && pe.sleep === 7.5 && pe.water === 6 && pe.breakfast === "café" && pe.custom.q1 === "non" && pe.coffee === "", "« Ma tête va bien » : la journée type est notée d'office");
  const kept = { date: "2026-10-01", glasses: "non", sleep: 5, water: "", custom: { q1: "oui" } };
  T.applyPreset(kept, false);
  ok(kept.glasses === "non" && kept.sleep === 5 && kept.water === 6 && kept.custom.q1 === "oui", "journée type : ne remplace jamais une réponse déjà donnée");
  T.S.settings.dayPreset = {}; T.S.settings.presetAuto = true; T.S.entries = {};
  ["2026-10-14", "2026-10-15", "2026-10-16"].forEach(d => T.S.entries[d] = { date: d, migraine: false, sleep: 8, water: 4, coffee: 1, screen: 3, glasses: "partiel", custom: {} });
  const ua = { date: "2026-10-17", custom: {} }; T.applyPreset(ua, true);
  ok(ua.sleep === 8 && ua.water === 4 && ua.glasses === "partiel", "journée type : le reste complété d'après les 14 derniers jours si demandé");
  T.S.settings.custom = []; T.S.settings.presetAuto = false;


  // --- v2.4 : bilan plus précis ---
  T.S.entries = {};
  // Jours de mal par mois et seuil de 15 jours, 3 mois terminés de suite
  const fill = (y, m, n, noted) => { for (let d = 1; d <= noted; d++) { const k = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; T.S.entries[k] = { date: k, migraine: d <= n, intensity: d <= n ? 6 : 0, zones: [], symptoms: [], meds: [] } } };
  fill(2026, 7, 16, 28); fill(2026, 8, 15, 30); fill(2026, 9, 18, 30); fill(2026, 10, 3, 10);
  const mcs = T.monthCounts(T.S.entries, new Date(2026, 9, 19), 4);
  ok(mcs.map(x => x.mig).join() === "16,15,18,3" && mcs[1].noted === 30 && mcs[3].cur, "jours de mal par mois : comptés par mois civil, avec les jours notés");
  ok(T.chronicFlag(T.S.entries, new Date(2026, 9, 19)) && T.chronicFlag(T.S.entries, new Date(2026, 9, 19)).length === 3, "15 jours ou plus 3 mois de suite : signalé");
  fill(2026, 8, 14, 30);
  ok(!T.chronicFlag(T.S.entries, new Date(2026, 9, 19)), "un mois à 14 jours : pas de signal");
  T.S.entries = {};

  // Critères ICHD-3 de la migraine
  const base = { date: "2026-09-01", migraine: true, intensity: 7, duration: 6, zones: [], symptoms: [] };
  ok(T.ichd(base).known === false, "crise sans signes notés : non classée");
  ok(T.ichd(Object.assign({}, base, { symptoms: ["Douleur qui bat", "Nausées"] })).typical, "qui bat + forte + nausées, 6 h : signes de la migraine");
  ok(!T.ichd(Object.assign({}, base, { intensity: 3, symptoms: ["Douleur qui bat", "Sensible à la lumière"] })).typical, "lumière sans bruit ni nausées, légère : pas les critères");
  ok(T.ichd(Object.assign({}, base, { intensity: 3, zones: ["Côté gauche"], symptoms: ["Pire en bougeant", "Sensible à la lumière", "Sensible au bruit"] })).typical, "côté gauche + pire en bougeant + lumière et bruit : critères réunis");
  ok(!T.ichd(Object.assign({}, base, { duration: 2, symptoms: ["Douleur qui bat", "Nausées"] })).typical && T.ichd(Object.assign({}, base, { duration: "", symptoms: ["Douleur qui bat", "Vomissements", "Aura avant la douleur"] })).aura,
    "durée de 2 h hors critères ; aura repérée");

  // Fenêtre des règles : J-2 à J+3 autour du 1er jour
  const E = {}, put = (d, o) => E[d] = Object.assign({ date: d, migraine: false, intensity: 0, zones: [], symptoms: [], meds: [] }, o);
  for (let d = 1; d <= 30; d++) put(`2026-09-${String(d).padStart(2, "0")}`, {});
  for (let d = 1; d <= 19; d++) put(`2026-10-${String(d).padStart(2, "0")}`, {});
  for (let d = 1; d <= 31; d++) put(`2026-08-${String(d).padStart(2, "0")}`, {});
  put("2026-08-03", { period: "debut" }); put("2026-08-04", { period: "oui" }); put("2026-08-02", { migraine: true, intensity: 6 });
  put("2026-08-31", { period: "oui" }); put("2026-09-01", { period: "oui", migraine: true, intensity: 7 }); put("2026-08-30", { period: "avant" });
  put("2026-09-28", { period: "debut" }); put("2026-09-20", { migraine: true, intensity: 5 });
  ok(T.periodStarts(E).join() === "2026-08-03,2026-08-31,2026-09-28", "1ers jours des règles : notés, ou déduits du début des jours « Règles »");
  const mn = T.menstrual(E, "2026-10-19", 3);
  ok(mn.cycles.length === 3 && mn.hits === 2 && mn.win.m === 2 && mn.win.n === 18 && mn.out.m === 1, "fenêtre des règles : 2 cycles sur 3 avec crise, jours avec mal dedans et dehors");

  // Récurrence dans les 48 h après un médicament qui a marché
  const R = {};
  R["2026-09-10"] = { date: "2026-09-10", migraine: true, start: "14:00", meds: [{ name: "Sumatriptan", time: "14:30", at2h: "libre" }] };
  R["2026-09-11"] = { date: "2026-09-11", migraine: true, start: "08:00", meds: [] };
  R["2026-09-20"] = { date: "2026-09-20", migraine: true, start: "10:00", meds: [{ name: "Ibuprofène", time: "10:30", at2h: "pareil" }] };
  R["2026-09-21"] = { date: "2026-09-21", migraine: true, start: "09:00", meds: [] };
  R["2026-09-25"] = { date: "2026-09-25", migraine: true, start: "09:00", meds: [{ name: "Sumatriptan", time: "09:15", eff: "oui" }] };
  R["2026-09-27"] = { date: "2026-09-27", migraine: true, start: "20:00", meds: [] };
  const rr = T.recurrences(R, "2026-09-01", "2026-09-30");
  ok(rr.length === 2 && rr.find(x => x.date === "2026-09-10").back === "2026-09-11" && !rr.some(x => x.date === "2026-09-20") && !rr.find(x => x.date === "2026-09-25").back,
    "récurrence : revenue le lendemain comptée ; médicament sans effet ignoré ; reprise après 48 h non comptée");

  // Efficacité 2 h après la prise
  T.S.entries = {};
  const now2 = new Date(), t2 = ymdL(now2), early = new Date(now2.getTime() - 3 * 3600e3), hhmm2 = `${String(early.getHours()).padStart(2, "0")}:${String(early.getMinutes()).padStart(2, "0")}`;
  if (ymdL(early) === t2) {
    T.S.entries[t2] = { date: t2, migraine: true, intensity: 7, start: hhmm2, duration: "", zones: [], symptoms: [], meds: [{ name: "Sumatriptan", time: hhmm2, eff: "" }] };
    ok(T.medsAwaiting2h(T.S.entries, now2).length === 1, "prise d'il y a 3 h sans réponse : en attente de « 2 h après »");
    ok(await T.set2h(t2, "Sumatriptan", hhmm2, "mieux") && T.S.entries[t2].meds[0].at2h === "mieux" && T.S.entries[t2].meds[0].eff === "un peu" && T.medsAwaiting2h(T.S.entries, now2).length === 0,
      "réponse « Mieux » : enregistrée, l'ancienne question déduite, plus rien en attente");
    ok(!(await T.set2h(t2, "Sumatriptan", hhmm2, "bof")), "réponse inconnue refusée");
  } else console.log("(test « 2 h après » sauté : il est moins de 3 h du matin)");
  ok(T.cleanEntry({ date: "2026-09-01", meds: [{ name: "A", time: "10:00", at2h: "libre" }, { name: "B", at2h: "<x>" }] }).meds.map(m => m.at2h || "-").join() === "libre,-", "« 2 h après » : valeur nettoyée");
  const sm3 = T.summarize([{ date: "2026-09-01", migraine: true, intensity: 6, zones: [], symptoms: ["Douleur qui bat", "Nausées"], meds: [{ name: "Suma", at2h: "libre", eff: "oui" }, { name: "Suma", at2h: "pareil", eff: "non" }] }]);
  ok(sm3.meds.Suma.libre === 1 && sm3.meds.Suma.pareil === 1 && sm3.meds.Suma.h2 === 2 && sm3.ichd.typical === 1, "bilan : réponses à 2 h et critères de la migraine comptés");
  ok(T.isWeak(6, 20) && !T.isWeak(8, 9), "piste encore faible sous 8 jours d'un côté");
  ok(T.cleanEntry({ date: "2026-09-01", period: "debut" }).period === "debut", "« 1er jour des règles » gardé");

  // Bilan
  try { T.renderStats(); T.setMode("month"); T.renderStats(); await T.putEntry({ date: "2026-10-14", migraine: true, intensity: 5, zones: [], symptoms: [] }); T.renderStats(); ok(true, "bilan semaine et mois sans erreur") }
  catch (err) { ok(false, "bilan : " + err.message) }

  // Module de notifications 8 : une notification « exacte » ouvrirait l'écran « Alarmes et rappels » à chaque programmation
  ok((native.every || []).length > 0 && native.every.every(n => n.isExactNotification === false),
    `toutes les notifications programmées sont « non exactes » (${(native.every || []).length} vérifiées)`);
  console.log(fails ? `\n${fails} test(s) en échec` : "\nTous les tests passent");
  process.exit(fails ? 1 : 0);
})();
