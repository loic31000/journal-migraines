(function(){
document.documentElement.lang="fr";
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,"0");
const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const addDays=(d,n)=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x};
const mondayOf=d=>addDays(d,-((d.getDay()+6)%7));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const DAYS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const DS=["Lu","Ma","Me","Je","Ve","Sa","Di"];
const MONTHS_S=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const MONTHS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const ZONES=["Front","Tempes","Côté gauche","Côté droit","Derrière les yeux","Nuque","Tout le crâne"];
// Caractères de la douleur et signes associés retenus par la classification internationale des céphalées (ICHD-3)
const PAINK=["D'un seul côté","Douleur qui bat","Pire en bougeant","Aura avant la douleur"];
const SYMPT=["Nausées","Vomissements","Sensible à la lumière","Sensible au bruit","Troubles de la vue","Vertiges","Grande fatigue"];
// Efficacité 2 h après la prise (critère des essais sur la migraine) ; « eff » (ancienne question) en est déduit
const AT2H=[["libre","Plus de douleur"],["mieux","Mieux"],["pareil","Pareil"]],EFF_OF={libre:"oui",mieux:"un peu",pareil:"non"};
const GL={oui:"Toute la journée",partiel:"Un moment",non:"Pas du tout"};
// Mots qui s'accordent (réglage « Les mots pour toi ») : neutre par défaut. Ce qui est enregistré reste toujours la forme neutre.
const stLabel=v=>({"1":"Zen","2":"Un peu","3":G("Stress","Stressée","Stressé"),"4":G("Fort stress","Très stressée","Très stressé")})[v]||"";
const PE={debut:"1er jour des règles",oui:"Règles",avant:"Juste avant",non:"Non"};
const SYM_ALIAS={"Gênée par la lumière":"Sensible à la lumière","Gêné par la lumière":"Sensible à la lumière","Gênée par le bruit":"Sensible au bruit","Gêné par le bruit":"Sensible au bruit"};
const symLabel=v=>v==="Sensible à la lumière"?G(v,"Gênée par la lumière","Gêné par la lumière"):v==="Sensible au bruit"?G(v,"Gênée par le bruit","Gêné par le bruit"):v;
const G=(n,f,m)=>{const g=S.settings.gender;return g==="f"?f:g==="m"?m:n};
const tender=()=>S.settings.tone==="tendre";
const firstName=()=>(S.settings.name||"").trim().split(/\s+/)[0]||"";
const callName=()=>(tender()&&(S.settings.pet||"").trim())||firstName();
const capF=x=>x?x[0].toUpperCase()+x.slice(1):x;
// Les phrases qui changent avec le ton (réglage « Le ton ») : sobre par défaut, tendre sur demande
function T(k,a){
  const n=tender()?callName():"",v=a||{},to=x=>n?`${x}, ${n}`:x,lead=(x,rest)=>n?`${capF(n)}, ${x}${rest}`:capF(x)+rest;
  if(!tender())return{remind:"As-tu noté ta journée ? Même un jour sans mal compte.",
    crisisAsk:"Ta crise est-elle finie ? Un toucher sur « Oui, c'est fini » note sa durée.",
    dose:`Tu peux reprendre ${v.med} si besoin.`,
    crisisMsg:"Écran très sombre et calme. Repose-toi : ta crise est notée, tu compléteras plus tard.",
    crisisEnded:`Crise de ${v.h} h notée. Repose-toi.`,savedPain:"C'est noté. Prends soin de toi.",savedCalm:"C'est noté. Belle journée !",
    full:"Espace plein : télécharge une sauvegarde puis efface de vieilles notes",
    found:`Notes retrouvées : ${v.n} journée${v.n>1?"s":""} remise${v.n>1?"s":""} en place`,
    rmText:"Une notification si tu n'as pas encore noté ta journée. Les jours sans mal comptent aussi : ce sont eux qui rendent le bilan fiable.",
    notesPh:"Météo, bruit, odeurs, émotions, ce que tu veux…",where:"Tes notes restent dans ce téléphone.",
    m2h:`${v.med} pris à ${v.h} : comment va ta tête, 2 h après ?`}[k];
  return{remind:`Coucou${n?" "+n:""}, tu as noté ta journée ? Même un jour sans mal compte.`,
    crisisAsk:lead("ta crise est passée ?"," Un toucher sur « Oui, c'est fini » et je note sa durée."),
    dose:lead(`tu peux reprendre ${v.med}`," si tu en as besoin."),
    crisisMsg:`J'ai baissé la lumière. ${to("Repose-toi")} : ta crise est notée, on complétera plus tard.`,
    crisisEnded:`Crise de ${v.h} h notée. ${to("Repose-toi bien")}.`,savedPain:`C'est noté. ${to("Prends soin de toi")}.`,savedCalm:`C'est noté. ${to("Belle journée")} !`,
    full:lead("le téléphone est plein"," : fais une sauvegarde, puis efface de vieilles notes"),
    found:`J'ai retrouvé tes notes${n?", "+n:""} : ${v.n} journée${v.n>1?"s":""} remise${v.n>1?"s":""} en place`,
    rmText:"Je te fais signe le soir si tu n'as pas encore noté ta journée. Les jours sans mal comptent aussi : ce sont eux qui rendent le bilan fiable.",
    notesPh:"Météo, bruit, odeurs, émotions, tout ce que tu veux me dire…",where:"Tes notes restent dans ce téléphone, rien qu'à toi.",
    m2h:lead("comment va ta tête",` 2 h après ${v.med} (pris à ${v.h}) ?`)}[k];
}
const dayLong=s=>{const d=parse(s);return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`};
const dayFull=s=>{const d=parse(s);return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`};
const painWord=v=>v<=0?"aucune":v<=3?"légère":v<=6?"moyenne":v<=8?"forte":"insupportable";
const pcls=e=>!e?"":!e.migraine?"pn":e.intensity<=3?"pl":e.intensity<=6?"pm":"ph";
const f1=n=>(Math.round(n*10)/10).toLocaleString("fr-FR");
const todayStr=()=>ymd(new Date());

/* =============== STOCKAGE =============== */
// Tout reste dans le téléphone (stockage privé de l'appli). updatedAt = heure de la dernière modification,
// utilisée par la restauration pour ne jamais remplacer un jour plus récent.
const CACHE="jm-cache-v2";
const S={entries:{},settings:{custom:[],name:""}};
// Toute donnée qui entre (stockage, sauvegarde restaurée, texte collé) est remise au propre :
// champs connus seulement, types et longueurs vérifiés. Une sauvegarde piégée ne peut donc rien injecter dans la page.
const TXT=(v,max)=>typeof v==="string"?v.slice(0,max):"";
const HM=v=>typeof v==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v)?v:"";
const NUM=(v,max)=>{if(v===""||v==null)return"";const n=Number(v);return Number.isFinite(n)?Math.min(Math.max(n,0),max):""};
const ONE=(v,list)=>list.includes(v)?v:"";
const ID_RE=/^[A-Za-z0-9_-]{1,40}$/;
const STRS=(a,max,len)=>Array.isArray(a)?a.filter(x=>typeof x==="string"&&x.trim()).slice(0,max).map(x=>x.slice(0,len)):[];
function cleanEntry(e,deep){
  if(!e||typeof e!=="object"||!/^\d{4}-\d{2}-\d{2}$/.test(e.date))return null;
  const o={date:e.date,migraine:e.migraine===true?true:e.migraine===false?false:null,
    intensity:Math.round(NUM(e.intensity,10)||0),start:HM(e.start),duration:NUM(e.duration,72),
    zones:STRS(e.zones,20,60),symptoms:STRS(e.symptoms,20,60).map(x=>SYM_ALIAS[x]||x),
    meds:Array.isArray(e.meds)?e.meds.filter(m=>m&&typeof m.name==="string"&&m.name.trim()).slice(0,20)
      .map(m=>Object.assign({name:m.name.slice(0,80),time:HM(m.time),eff:ONE(m.eff,["oui","un peu","non"])},ONE(m.at2h,["libre","mieux","pareil"])?{at2h:m.at2h}:{})):[],
    glasses:ONE(e.glasses,["oui","partiel","non"]),
    breakfast:TXT(e.breakfast,300),lunch:TXT(e.lunch,300),dinner:TXT(e.dinner,300),
    breakfastTime:HM(e.breakfastTime),lunchTime:HM(e.lunchTime),dinnerTime:HM(e.dinnerTime),
    sleep:NUM(e.sleep,24),water:NUM(e.water,40),screen:NUM(e.screen,24),coffee:NUM(e.coffee,30),
    stress:ONE(e.stress,["1","2","3","4"]),period:ONE(e.period,["debut","oui","avant","non"]),notes:TXT(e.notes,2000),custom:{},
    updatedAt:Number.isFinite(e.updatedAt)?e.updatedAt:0};
  if(typeof e.med==="string"&&e.med.trim()){o.med=e.med.slice(0,80);o.medEff=ONE(e.medEff,["oui","un peu","non"])}
  if(e.custom&&typeof e.custom==="object")Object.keys(e.custom).forEach(k=>{if(ID_RE.test(k)&&typeof e.custom[k]==="string")o.custom[k]=e.custom[k].slice(0,300)});
  if(e.quick===true){o.quick=true;if(deep&&e.quickPrev){const q=cleanEntry(e.quickPrev,false);if(q)o.quickPrev=q}}
  return o;
}
function cleanQuestion(q){return q&&typeof q==="object"&&ID_RE.test(q.id)&&typeof q.label==="string"&&q.label.trim()
  ?{id:q.id,label:q.label.slice(0,80),type:q.type==="bool"?"bool":"text"}:null}
function cleanSettings(st){
  const o=Object.assign({},st&&typeof st==="object"?st:{});
  o.custom=(Array.isArray(o.custom)?o.custom:[]).map(cleanQuestion).filter(Boolean);
  o.name=TXT(o.name,80);o.pet=TXT(o.pet,40);o.gender=ONE(o.gender,["f","m"]);o.tone=ONE(o.tone,["tendre"]);
  const DT=v=>typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v)?v:"",rd=o.rdv&&typeof o.rdv==="object"?o.rdv:{};o.rdv={next:DT(rd.next),last:DT(rd.last)};
  const dp=o.dayPreset&&typeof o.dayPreset==="object"?o.dayPreset:{};
  o.dayPreset={glasses:ONE(dp.glasses,["oui","partiel","non"]),sleep:NUM(dp.sleep,24),water:NUM(dp.water,40),coffee:NUM(dp.coffee,30),screen:NUM(dp.screen,24),
    stress:ONE(dp.stress,["1","2","3","4"]),period:ONE(dp.period,["oui","avant","non"]),breakfast:TXT(dp.breakfast,300),lunch:TXT(dp.lunch,300),dinner:TXT(dp.dinner,300),custom:{}};
  if(dp.custom&&typeof dp.custom==="object")Object.keys(dp.custom).forEach(k=>{if(ID_RE.test(k)&&["oui","non"].includes(dp.custom[k]))o.dayPreset.custom[k]=dp.custom[k]});
  o.presetAuto=o.presetAuto===true;
  o.docQ=(Array.isArray(o.docQ)?o.docQ:[]).filter(q=>q&&ID_RE.test(q.id)&&typeof q.t==="string"&&q.t.trim()).slice(0,50).map(q=>({id:q.id,t:q.t.slice(0,200),done:q.done===true}));
  const mg={};if(o.medGaps&&typeof o.medGaps==="object")Object.keys(o.medGaps).slice(0,40).forEach(k=>{const v=Number(o.medGaps[k]);if(typeof k==="string"&&k.length<=80&&[4,6,8,12,24].includes(v))mg[k]=v});o.medGaps=mg;
  o.midas=(Array.isArray(o.midas)?o.midas:[]).filter(m=>m&&/^\d{4}-\d{2}-\d{2}$/.test(m.date)&&Array.isArray(m.a)&&m.a.length===5&&m.a.every(v=>Number.isInteger(v)&&v>=0&&v<=92))
    .slice(-40).map(m=>({date:m.date,a:m.a.slice(),score:midasScore(m.a)}));
  return o;
}
function readCache(){
  try{const c=JSON.parse(localStorage.getItem(CACHE)||"null");if(c){S.entries={};Object.values(c.entries||{}).forEach(e=>{const x=cleanEntry(e,true);if(x)S.entries[x.date]=x});S.settings=cleanSettings(c.settings)}}catch(e){}
  // Ancienne version : reprise une seule fois, puis la clé est effacée pour ne pas faire revenir des jours supprimés
  try{const old=JSON.parse(localStorage.getItem("journal-migraines-v1")||"null");
    if(old){
      if(old.entries)Object.values(old.entries).forEach(e=>{{const x=e&&!e.demo&&cleanEntry(e,false);if(x&&!S.entries[x.date])S.entries[x.date]=x}});
      if(old.custom&&!S.settings.custom.length)S.settings.custom=cleanSettings({custom:old.custom}).custom;
      if(writeCache())localStorage.removeItem("journal-migraines-v1");
    }}catch(e){}
}
function writeCache(){
  try{localStorage.setItem(CACHE,JSON.stringify({entries:S.entries,settings:S.settings}));return true}
  catch(e){toast(T("full"));return false}
}
const clean=e=>{const o=JSON.parse(JSON.stringify(e));delete o._local;return o};
async function putEntry(e){e.updatedAt=Date.now();delete e._local;S.entries[e.date]=e;writeCache();scheduleReminders();writeSnapshot()}
async function removeEntry(date){delete S.entries[date];writeCache();scheduleReminders();writeSnapshot()}
async function putSettings(){S.settings.updatedAt=Date.now();writeCache();writeSnapshot()}

/* =============== SAUVEGARDE AUTOMATIQUE =============== */
// À chaque changement, une copie complète des notes est écrite dans le dossier privé de l'appli
// (plus une copie de la veille). Android l'inclut dans la sauvegarde Google du téléphone (allowBackup),
// sans permission Internet. Au démarrage, si l'appli a perdu des notes (nouveau téléphone, données effacées),
// elle les retrouve dans cette copie.
const SNAP="sauvegarde-auto.json",SNAP_PREV="sauvegarde-auto-veille.json",SNAP_AT="jm-snap-at",SNAP_DAY="jm-snap-day";
const FSP=()=>{const c=window.Capacitor;return c&&c.isNativePlatform&&c.isNativePlatform()&&c.Plugins&&c.Plugins.Filesystem||null};
const backupData=()=>JSON.stringify({app:"journal-migraines",version:2,savedAt:new Date().toISOString(),settings:S.settings,entries:Object.fromEntries(Object.entries(S.entries).map(([k,e])=>[k,clean(e)]))});
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
let snapBusy=null,snapAgain=false;
function writeSnapshot(){
  const fs=FSP();if(!fs)return Promise.resolve(false);
  if(snapBusy){snapAgain=true;return snapBusy}
  snapBusy=(async()=>{
    try{
      do{snapAgain=false;
        // Une fois par jour, la copie d'hier est mise de côté (si la dernière copie était abîmée)
        if(lsGet(SNAP_DAY)!==todayStr()){try{const old=await fs.readFile({path:SNAP,directory:"DATA",encoding:"utf8"});
          if(old&&old.data&&String(old.data).includes('"entries"'))await fs.writeFile({path:SNAP_PREV,directory:"DATA",data:String(old.data),encoding:"utf8"})}catch(e){}
          lsSet(SNAP_DAY,todayStr())}
        await fs.writeFile({path:SNAP,directory:"DATA",data:backupData(),encoding:"utf8"});
        lsSet(SNAP_AT,new Date().toISOString());
      }while(snapAgain);
      return true;
    }catch(e){return false}finally{snapBusy=null}
  })();
  return snapBusy;
}
async function readSnapshot(path){
  const fs=FSP();if(!fs)return null;
  try{const r=await fs.readFile({path,directory:"DATA",encoding:"utf8"});const o=JSON.parse(String(r.data));return o&&o.entries&&typeof o.entries==="object"?o:null}catch(e){return null}
}
async function deleteSnapshots(){const fs=FSP();if(!fs)return;for(const path of [SNAP,SNAP_PREV])try{await fs.deleteFile({path,directory:"DATA"})}catch(e){}}
// Au démarrage : remettre les journées absentes ou plus récentes dans la copie (jamais au détriment d'un jour plus récent)
async function restoreFromSnapshot(){
  const o=await readSnapshot(SNAP)||await readSnapshot(SNAP_PREV);if(!o)return 0;
  const missing=Object.values(o.entries).filter(e=>e&&e.date&&(!S.entries[e.date]||(e.updatedAt||0)>(S.entries[e.date].updatedAt||0))).length;
  if(!missing)return 0;
  const r=await mergeBackup(o);
  if(r.added){if(tab==="home")renderHome();toast(T("found",{n:r.added}))}
  return r.added;
}
const daysSince=d=>d?Math.floor((parse(todayStr())-parse(d))/864e5):Infinity;
function renderStatus(){
  const el=$("status"),last=S.settings.lastBackup;
  el.classList.add("cloud");el.querySelector("span").textContent="Sur ce téléphone";
  $("whereText").innerHTML=esc(T("where"))+" Personne d'autre n'y a accès et l'appli marche sans internet."
    +"<br><br>Si le téléphone casse ou est perdu, tes notes sont protégées deux fois : par la copie automatique, et par les sauvegardes que tu envoies sur ton Drive. Fais-en une chaque semaine, c'est la protection la plus sûre. "
    +(last?`Dernière sauvegarde envoyée : <b>${esc(dayLong(last))}</b>.`:"<b>Tu n'as encore envoyé aucune sauvegarde.</b>")
    +(FSP()?`<br><br><b>Copie automatique</b> : ${(()=>{const a=lsGet(SNAP_AT);return a?`à jour (${esc(dayLong(ymd(new Date(a))))} à ${hhmm(new Date(a))})`:"en cours"})()}. `
      +"À chaque note, l'appli garde une copie complète dans le téléphone, et Android l'envoie dans la sauvegarde Google si elle est activée (Réglages › Google › Sauvegarde). Sur un nouveau téléphone, tes notes reviennent toutes seules."
      :"<br><br>La copie automatique marche dans l'appli installée sur le téléphone.");
}

/* =============== RAPPEL DU SOIR =============== */
// Notifications programmées dans le téléphone (aucune connexion). On programme les 14 prochains soirs
// sauf ceux déjà notés, et on recalcule à chaque ouverture et à chaque note : pas de rappel inutile.
const LN=()=>{const c=window.Capacitor;return c&&c.isNativePlatform&&c.isNativePlatform()&&c.Plugins&&c.Plugins.LocalNotifications||null};
const RM_DAYS=14,RM_BASE=100;
const hm=t=>t.replace(":"," h ");
async function scheduleReminders(){
  const ln=LN();if(!ln)return;
  try{await ln.cancel({notifications:Array.from({length:RM_DAYS},(_,i)=>({id:RM_BASE+i}))})}catch(e){}
  const r=S.settings.reminder;if(!r||!r.on)return;
  const[hh,mm]=(r.time||"21:00").split(":").map(Number),now=new Date(),list=[];
  for(let i=0;i<RM_DAYS;i++){
    const d=addDays(now,i),at=new Date(d.getFullYear(),d.getMonth(),d.getDate(),hh,mm);
    if(at<=now||S.entries[ymd(d)])continue;
    list.push({id:RM_BASE+i,title:"Mon Journal",body:T("remind"),schedule:{at,allowWhileIdle:true},isExactNotification:false});
  }
  if(list.length)try{await ln.schedule({notifications:list})}catch(e){}
}

/* =============== MODE CRISE, FIN DE CRISE, PRISES =============== */
const CRISIS_KEY="jm-crisis",CRISIS_NOTIF=300,DOSE_BASE=400,DOSE_MAX=20;
const isCrisis=()=>document.documentElement.dataset.crisis==="on";
function setCrisis(on){
  if(on)document.documentElement.dataset.crisis="on";else delete document.documentElement.dataset.crisis;
  try{on?localStorage.setItem(CRISIS_KEY,"1"):localStorage.removeItem(CRISIS_KEY)}catch(e){}
  if(tab==="home")renderHome();
}
try{if(localStorage.getItem(CRISIS_KEY)==="1")document.documentElement.dataset.crisis="on"}catch(e){}
// Durée d'une crise d'après son heure de début et l'heure actuelle, arrondie à la demi-heure (au moins 30 min)
function crisisDuration(start,nowMin){const st=toMin(start);if(st==null)return"";let d=nowMin-st;if(d<0)d+=1440;return Math.max(.5,Math.round(d/30)/2)}
async function endCrisis(date){
  const e=S.entries[date||todayStr()];if(!e||!e.migraine||!e.start)return false;
  const n=new Date(),x=JSON.parse(JSON.stringify(e));x.duration=crisisDuration(e.start,n.getHours()*60+n.getMinutes());
  await putEntry(x);await cancelCrisisCheck();setCrisis(false);renderHome();
  toast(T("crisisEnded",{h:f1(x.duration)}));return true;
}
// Notification « Ta crise est-elle finie ? » 2 h après une crise rapide (puis 1 h après « Pas encore »)
let lnActions=false;
async function registerActions(ln){if(lnActions||!ln.registerActionTypes)return;lnActions=true;
  try{await ln.registerActionTypes({types:[{id:"CRISIS_END",actions:[{id:"done",title:"Oui, c'est fini"},{id:"later",title:"Pas encore"},{id:"med",title:"J'ai pris…"}]},
    {id:"MED_2H",actions:AT2H.map(([id,title])=>({id,title}))}]})}catch(e){}}
// 2 h après chaque prise notée avec son heure : « Comment va ta tête ? » (plus de douleur / mieux / pareil)
const M2H_BASE=600,M2H_MAX=40;
const at2hTime=(date,time)=>{const t=toMin(time);return t==null?null:new Date(parse(date).getTime()+t*6e4+2*3600e3)};
function medsAwaiting2h(entries,now){const out=[];[ymd(addDays(now,-1)),ymd(now)].forEach(d=>{const e=entries[d];if(!e||!e.migraine)return;
  medsOf(e).forEach(m=>{if(m.at2h)return;const at=at2hTime(d,m.time);if(at)out.push({date:d,name:m.name,time:m.time,at})})});return out}
async function schedule2h(){
  const ln=LN();if(!ln)return;
  try{await ln.cancel({notifications:Array.from({length:M2H_MAX},(_,i)=>({id:M2H_BASE+i}))})}catch(e){}
  const now=new Date(),l=medsAwaiting2h(S.entries,now).filter(x=>x.at>now).slice(0,M2H_MAX);if(!l.length)return;
  try{const pm=await ln.checkPermissions();if(pm.display!=="granted")return}catch(e){return}
  await registerActions(ln);
  try{await ln.schedule({notifications:l.map((x,i)=>({id:M2H_BASE+i,title:"Mon Journal",body:T("m2h",{med:x.name,h:hm(x.time)}),actionTypeId:"MED_2H",
    extra:{date:x.date,name:x.name,time:x.time},schedule:{at:x.at,allowWhileIdle:true},isExactNotification:false}))})}catch(e){}
}
async function set2h(date,name,time,v){
  if(!EFF_OF[v])return false;const ex=S.entries[date];if(!ex)return false;
  const e=JSON.parse(JSON.stringify(ex));let done=false;
  e.meds=medsOf(e).map(m=>{if(!done&&m.name===name&&(m.time||"")===(time||"")){done=true;return Object.assign({},m,{at2h:v,eff:EFF_OF[v]})}return m});
  if(!done)return false;delete e.med;delete e.medEff;await putEntry(e);schedule2h();if(tab==="home")renderHome();
  toast(`Noté : ${AT2H.find(x=>x[0]===v)[1].toLowerCase()}, 2 h après ${name}`);return true;
}
async function crisisCheckIn(hours){
  const ln=LN();if(!ln)return;
  try{let pm=await ln.checkPermissions();if(pm.display==="prompt")pm=await ln.requestPermissions();if(pm.display!=="granted")return}catch(e){return}
  await registerActions(ln);
  try{await ln.cancel({notifications:[{id:CRISIS_NOTIF}]})}catch(e){}
  try{await ln.schedule({notifications:[{id:CRISIS_NOTIF,title:"Mon Journal",body:T("crisisAsk"),actionTypeId:"CRISIS_END",
    schedule:{at:new Date(Date.now()+hours*3600e3),allowWhileIdle:true},isExactNotification:false}]})}catch(e){}
}
async function cancelCrisisCheck(){const ln=LN();if(ln)try{await ln.cancel({notifications:[{id:CRISIS_NOTIF}]})}catch(e){}}
// Prochaine prise possible : dernière prise de chaque médicament (aujourd'hui ou hier) + écart réglé
const medKey=n=>String(n||"").trim().toLowerCase();
function nextDoses(entries,gaps,now){
  const out={},t=ymd(now),y=ymd(addDays(now,-1));
  [y,t].forEach(d=>{const e=entries[d];if(!e)return;medsOf(e).forEach(m=>{const g=gaps&&gaps[medKey(m.name)],tm=toMin(m.time);if(!g||tm==null)return;
    const taken=new Date(parse(d).getTime()+tm*6e4),next=new Date(taken.getTime()+g*3600e3);
    const k=medKey(m.name);if(!out[k]||taken>out[k].taken)out[k]={name:m.name,taken,next}})});
  return Object.values(out).filter(x=>x.next>now).sort((a,b)=>a.next-b.next);
}
const hhmm=d=>`${pad(d.getHours())} h ${pad(d.getMinutes())}`;
function renderNextDose(){
  const l=nextDoses(S.entries,S.settings.medGaps,new Date());
  $("nextDose").hidden=!l.length;
  if(l.length)$("nextDoseS").textContent=" "+l.map(x=>`${x.name} pris à ${hhmm(x.taken)} : prochaine prise possible vers ${hhmm(x.next)}${ymd(x.next)!==todayStr()?" (demain)":""}.`).join(" ");
}
async function scheduleDoseReminders(){
  const ln=LN();if(!ln)return;
  try{await ln.cancel({notifications:Array.from({length:DOSE_MAX},(_,i)=>({id:DOSE_BASE+i}))})}catch(e){}
  const l=nextDoses(S.entries,S.settings.medGaps,new Date()).slice(0,DOSE_MAX);if(!l.length)return;
  try{const pm=await ln.checkPermissions();if(pm.display!=="granted")return}catch(e){return}
  try{await ln.schedule({notifications:l.map((x,i)=>({id:DOSE_BASE+i,title:"Mon Journal",body:T("dose",{med:x.name}),schedule:{at:x.next,allowWhileIdle:true},isExactNotification:false}))})}catch(e){}
}
const GAP_OPTS=[[0,"Pas de rappel"],[4,"4 h"],[6,"6 h"],[8,"8 h"],[12,"12 h"],[24,"24 h"]];
function renderGaps(){
  const names=[...new Map(Object.values(S.entries).sort((a,b)=>b.date.localeCompare(a.date)).flatMap(e=>medsOf(e).map(m=>[medKey(m.name),m.name.trim()]))).values()].slice(0,12);
  const g=S.settings.medGaps||{};
  $("gapList").innerHTML=names.length?names.map((n,i)=>`<div class="gaprow"><label for="gap-${i}"><span>${esc(n)}</span></label><select id="gap-${i}" data-med="${esc(medKey(n))}">${GAP_OPTS.map(([v,l])=>`<option value="${v}"${(g[medKey(n)]||0)===v?" selected":""}>${l}</option>`).join("")}</select></div>`).join("")
    :`<p class="muted small">Les médicaments que tu notes apparaîtront ici.</p>`;
}
// Journée type : ce qui revient le plus souvent sur les 14 derniers jours notés avant cette date
function usualFrom(entries,date){
  const past=Object.values(entries).filter(e=>e.date<date).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,14);
  if(past.length<3)return null;
  const med=k=>{const v=past.map(e=>e[k]).filter(x=>x!==""&&x!=null).map(Number).filter(Number.isFinite).sort((a,b)=>a-b);if(v.length<3)return"";const m=v[Math.floor((v.length-1)/2)];return k==="sleep"||k==="screen"?Math.round(m*2)/2:Math.round(m)};
  const mode=(k,min)=>{const c={};past.forEach(e=>{const v=typeof e[k]==="string"?e[k].trim():"";if(v)c[v]=(c[v]||0)+1});const r=Object.entries(c).sort((a,b)=>b[1]-a[1]),b=r[0];return b&&b[1]>=min&&!(r[1]&&r[1][1]===b[1])?b[0]:""}; // égalité = pas d'habitude claire
  const o={sleep:med("sleep"),water:med("water"),coffee:med("coffee"),screen:med("screen"),glasses:mode("glasses",3)};
  ["breakfast","lunch","dinner","breakfastTime","lunchTime","dinnerTime"].forEach(k=>o[k]=mode(k,3));
  return o;
}
// MIDAS (Migraine Disability Assessment) : 5 questions sur les 3 derniers mois, score = total des jours
const MIDAS_Q=["Combien de jours as-tu manqué le travail ou l'école à cause de tes maux de tête ?",
  "Combien de jours ton efficacité au travail ou à l'école a-t-elle été réduite de moitié ou plus (sans compter les jours de la question 1) ?",
  "Combien de jours n'as-tu pas fait tes tâches à la maison à cause de tes maux de tête ?",
  "Combien de jours ton efficacité pour les tâches à la maison a-t-elle été réduite de moitié ou plus (sans compter les jours de la question 3) ?",
  "Combien de jours as-tu manqué des activités en famille, entre amis ou de loisirs ?"];
const midasGrade=sc=>sc<=5?{g:"I",t:"peu ou pas de gêne"}:sc<=10?{g:"II",t:"gêne légère"}:sc<=20?{g:"III",t:"gêne modérée"}:{g:"IV",t:"gêne sévère"};
const midasScore=a=>a.reduce((x,y)=>x+y,0);

/* =============== NAVIGATION =============== */
let tab="home";
function show(t){
  tab=t;
  ["home","cal","stats","doc","data","form"].forEach(v=>$("v-"+v).hidden=v!==t);
  $("tabs").hidden=t==="form";document.body.classList.toggle("in-form",t==="form");
  let inDock=false;
  document.querySelectorAll("#tabs button").forEach((b,i)=>{if(b.dataset.tab===t){inDock=true;b.setAttribute("aria-current","page");$("tabs").firstElementChild.style.setProperty("--i",i)}else b.removeAttribute("aria-current")});
  $("tabs").firstElementChild.classList.toggle("nocur",!inDock); // Réglages : hors du dock
  refresh();window.scrollTo(0,0);
}
document.querySelectorAll("#tabs button").forEach(b=>b.addEventListener("click",()=>show(b.dataset.tab)));
function refresh(){
  if(tab==="home")renderHome();else if(tab==="cal")renderCal();else if(tab==="stats")renderStats();else if(tab==="doc")renderDoc();else if(tab==="data")renderData();
}
let tt,ttDur=2800;
function toastHide(){$("toast").classList.remove("show","act");const b=$("toast").querySelector("button");if(b)b.remove()}
function toast(m,act){const t=$("toast"),old=t.querySelector("button");if(old)old.remove();
  $("toastMsg").innerHTML=esc(m)+(act?`<span class="sr">. Bouton ${esc(act.label)} disponible.</span>`:"");
  t.classList.toggle("act",!!act);
  if(act){const b=document.createElement("button");b.type="button";b.textContent=act.label;b.onclick=()=>{clearTimeout(tt);toastHide();act.run()};t.appendChild(b)}
  ttDur=act?8000:2800;t.classList.add("show");clearTimeout(tt);tt=setTimeout(toastHide,ttDur)}
// Délai en pause tant que le message est touché, survolé ou a le focus
["pointerenter","focusin"].forEach(ev=>$("toast").addEventListener(ev,()=>clearTimeout(tt)));
["pointerleave","focusout"].forEach(ev=>$("toast").addEventListener(ev,()=>{clearTimeout(tt);tt=setTimeout(toastHide,4000)}));

/* =============== ACCUEIL =============== */
function factsHtml(e){
  const f=[];
  if(e.migraine){
    f.push(["Douleur",`${e.intensity}/10 · ${painWord(e.intensity)}`]);
    if(e.duration!=="")f.push(["Durée",`${f1(e.duration)} h`]);
    if(e.zones.length)f.push(["Où",e.zones.join(", "),1]);
    const ms=medsOf(e);
    ms.forEach((m,i)=>f.push([ms.length>1?`Médicament ${i+1}`:"Médicament",(m.time?`${m.time} · `:"")+m.name+(m.eff?` · efficace : ${m.eff}`:""),1]));
  }
  if(e.glasses)f.push(["Lunettes",GL[e.glasses]]);
  if(e.sleep!=="")f.push(["Sommeil",`${f1(e.sleep)} h`]);
  if(e.stress)f.push(["Stress",stLabel(e.stress)]);
  if(e.water!=="")f.push(["Eau",`${e.water} verres`]);
  if(e.lunch)f.push(["À midi",e.lunch,1]);
  (S.settings.custom||[]).forEach(q=>{const v=e.custom&&e.custom[q.id];if(v)f.push([q.label,v==="oui"?"Oui":v==="non"?"Non":v,1])});
  if(e.notes)f.push(["Notes",e.notes,1]);
  return f.map(([k,v,w])=>`<div class="fact${w?" wide":""}"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("");
}
// Heure de fin de crise à partir du début et de la durée (peut passer minuit)
function endTime(start,dur){if(!start||dur===""||dur==null)return"";const[h,m]=start.split(":").map(Number),t=Math.round(h*60+m+(+dur)*60);
  return{t:`${pad(Math.floor(t%1440/60))}:${pad(t%60)}`,next:t>=1440}}
// Tout ce qui est noté pour un jour : d'abord la journée heure par heure, puis le reste par thème
function dayDetailHtml(e){
  const tl=[],sec={crise:[],repas:[],jour:[],perso:[]},effTxt=m=>m.eff?`efficace : ${m.eff}`:"";
  const ms=e.migraine?medsOf(e):[];
  if(e.migraine){
    if(e.start)tl.push([e.start,"Début de la crise",`${e.intensity}/10${e.duration!==""?` · pendant ${f1(e.duration)} h`:""}`]);
    const fin=endTime(e.start,e.duration);if(fin)tl.push([fin.next?"24:00":fin.t,"Fin de la crise",fin.next?`le lendemain à ${fin.t}`:""]);
    if(!e.start){sec.crise.push(["Début","Heure non notée"]);if(e.duration!=="")sec.crise.push(["Durée",`${f1(e.duration)} h`])}
    if(e.zones.length)sec.crise.push(["Où",e.zones.join(", "),1]);
    const pk=(e.symptoms||[]).filter(x=>PAINK.includes(x)),ot=(e.symptoms||[]).filter(x=>!PAINK.includes(x));
    if(pk.length)sec.crise.push(["Douleur",pk.join(", "),1]);
    if(ot.length)sec.crise.push(["Autres signes",ot.map(symLabel).join(", "),1]);
    ms.forEach((m,i)=>{const lab=ms.length>1?`Médicament ${i+1}`:"Médicament";
      if(m.time)tl.push([m.time,m.name,effTxt(m)]);else sec.crise.push([lab,[m.name,effTxt(m)].filter(Boolean).join(" · "),1])});
    if(!ms.length)sec.crise.push(["Médicament","Aucun",1]);
  }
  [["breakfast","Petit-déjeuner"],["lunch","À midi"],["dinner","Le soir"]].forEach(([k,lab])=>{
    if(e[k+"Time"])tl.push([e[k+"Time"],lab,e[k]||""]);else if(e[k])sec.repas.push([lab,e[k],1])});
  if(e.coffee!==""&&e.coffee!=null)sec.repas.push(["Cafés ou thés",String(e.coffee)]);
  if(e.water!==""&&e.water!=null)sec.repas.push(["Eau",`${e.water} verres`]);
  if(e.sleep!==""&&e.sleep!=null)sec.jour.push(["Sommeil",`${f1(e.sleep)} h`]);
  if(e.screen!==""&&e.screen!=null)sec.jour.push(["Écrans",`${f1(e.screen)} h`]);
  if(e.glasses)sec.jour.push(["Lunettes",GL[e.glasses]]);
  if(e.stress)sec.jour.push(["Stress",stLabel(e.stress)]);
  if(e.period)sec.jour.push(["Cycle",PE[e.period]]);
  (S.settings.custom||[]).forEach(q=>{const v=e.custom&&e.custom[q.id];if(v)sec.perso.push([q.label,v==="oui"?"Oui":v==="non"?"Non":v,1])});
  tl.sort((a,b)=>a[0].localeCompare(b[0]));
  const facts=l=>`<div class="facts">${l.map(([k,v,w])=>`<div class="fact${w?" wide":""}">${k?`<b>${esc(k)}</b>`:""}<span>${esc(v)}</span></div>`).join("")}</div>`;
  const block=(t,html)=>`<section class="daysec"><h3>${t}</h3>${html}</section>`;
  return[tl.length?block("Heure par heure",`<ol class="timeline">${tl.map(([h,t,d])=>`<li><time>${h==="24:00"?"Après":esc(h)}</time><span><b>${esc(t)}</b>${d?` · ${esc(d)}`:""}</span></li>`).join("")}</ol>`):"",
    sec.crise.length?block("La crise",facts(sec.crise)):"",sec.repas.length?block("Repas",facts(sec.repas)):"",
    sec.jour.length?block("La journée",facts(sec.jour)):"",sec.perso.length?block("Mes questions",facts(sec.perso)):"",
    e.notes?block("Notes",facts([["",e.notes,1]])):""].join("");
}
function renderHome(){
  const now=new Date(),h=now.getHours(),t=todayStr(),e=S.entries[t];
  $("homeDate").textContent=dayLong(t);
  document.body.dataset.sky=!e?"dawn":e.migraine?"storm":"calm";
  const who=tender()?callName():firstName(),hi=h>=18||h<5?"Bonsoir":"Bonjour";
  $("hello").innerHTML=esc(who?`${hi} ${who}`:hi)+(tender()?'<svg class="heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.4A5.4 5.4 0 0 1 12 6.1a5.4 5.4 0 0 1 9.6 5.5C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg>':"");
  // Une seule entrée tant que la journée n'est pas notée ; ensuite la semaine suffit (un toucher sur le jour le rouvre). La carte du jour ne reste qu'après une crise rapide, à compléter
  $("askCard").hidden=!!e;$("todayCard").hidden=!(e&&e.quick);$("quickCard").hidden=!(e&&!e.migraine);
  if(e){
    $("todayPill").textContent=e.migraine?`Mal ${e.intensity}/10`:"Sans mal de tête";$("todayPill").className="pill "+pcls(e);
    $("todayT").textContent=e.quick?`Crise notée à ${e.start}`:"Aujourd'hui est noté";
    $("editToday").textContent=e.quick?"Compléter ma crise":"Modifier ma journée";$("undoQuick").hidden=!e.quick;
    $("endCrisis").hidden=!(e.quick&&e.migraine&&e.start&&e.duration==="");$("crisisOn").hidden=!(e.quick&&e.migraine)||isCrisis();
    $("todayFacts").innerHTML=factsHtml(e);
  }
  renderMedAlert();renderNextDose();
  $("crisisCard").hidden=!isCrisis();$("crisisEnd").hidden=!(e&&e.migraine&&e.start&&e.duration==="");
  renderCrisis(e);render2h(now);
  $("noPainSub").textContent=presetCount()||S.settings.presetAuto?"Un toucher, avec ta journée type":"Un toucher et la journée est notée";
  const mon=mondayOf(now);let n=0,cnt=0;
  $("weekStrip").innerHTML=Array.from({length:7},(_,i)=>{const d=addDays(mon,i),k=ymd(d),en=S.entries[k];if(en){cnt++;if(en.migraine)n++}
    const fut=d>now&&k!==t;
    const lab=`${dayLong(k)} : ${en?(en.migraine?`mal de tête ${en.intensity} sur 10`:"sans mal de tête"):"pas encore noté"}`;
    return `<button class="wd${k===t?" today":""}" type="button" data-day="${k}" ${fut?"disabled":""} aria-label="${esc(lab)}"><span aria-hidden="true">${DS[i]}</span><span class="c ${pcls(en)}" aria-hidden="true">${d.getDate()}</span></button>`}).join("");
  $("weekCount").textContent=cnt?`${n} jour${n>1?"s":""} avec mal sur ${cnt} noté${cnt>1?"s":""}`:"";
  const miss=missedDays(S.entries,now);$("missedDay").hidden=!miss.length;
  if(miss.length){const d=capF(DAYS[parse(miss[0]).getDay()]);$("missedDay").dataset.day=miss[0];
    $("missedDay").textContent=miss.length>1?`${miss.length} jours pas notés, dont ${d.toLowerCase()} : le noter`:`${d} n'est pas noté : le noter`}
  checkNotice();
}
$("weekStrip").addEventListener("click",ev=>{const b=ev.target.closest("[data-day]");if(!b||b.disabled)return;openForm(b.dataset.day)});
document.querySelectorAll("[data-start]").forEach(b=>b.addEventListener("click",()=>openForm(todayStr(),b.dataset.start)));
$("missedDay").addEventListener("click",()=>{const d=$("missedDay").dataset.day;if(d)openForm(d)});
// Jours pas notés ces 6 derniers jours (jamais avant la toute première note), du plus récent au plus ancien
function missedDays(entries,now){const keys=Object.keys(entries).sort();if(!keys.length)return[];const out=[];
  for(let i=1;i<=6;i++){const k=ymd(addDays(now,-i));if(k<keys[0])break;if(!entries[k])out.push(k)}return out}
// Journée type (Réglages) : ce qui ne change pas d'un jour à l'autre, noté d'office. Ne remplace jamais une réponse déjà donnée.
const PRESET_KEYS=["glasses","sleep","water","coffee","screen","stress","period","breakfast","lunch","dinner"];
const USUAL_KEYS=["sleep","water","coffee","screen","glasses","breakfast","lunch","dinner","breakfastTime","lunchTime","dinnerTime"];
const isSet=v=>v!==""&&v!=null;
function presetCount(){const p=S.settings.dayPreset||{},bq=new Set((S.settings.custom||[]).filter(q=>q.type==="bool").map(q=>q.id));
  return PRESET_KEYS.filter(k=>isSet(p[k])).length+Object.keys(p.custom||{}).filter(k=>bq.has(k)).length}
function applyPreset(e,withUsual){
  const p=S.settings.dayPreset||{};let n=0;e.custom=e.custom||{};
  PRESET_KEYS.forEach(k=>{if(isSet(p[k])&&!isSet(e[k])){e[k]=p[k];n++}});
  (S.settings.custom||[]).filter(q=>q.type==="bool").forEach(q=>{const v=(p.custom||{})[q.id];if(v&&!e.custom[q.id]){e.custom[q.id]=v;n++}});
  if(withUsual&&S.settings.presetAuto){const u=usualFrom(S.entries,e.date);if(u)USUAL_KEYS.forEach(k=>{if(isSet(u[k])&&!isSet(e[k])){e[k]=u[k];n++}})}
  return n;
}
// « Ma tête va bien » : la journée est notée d'un toucher, sans formulaire, avec la journée type. On complète ensuite si on veut.
async function noPainNow(){const t=todayStr();if(S.entries[t])return false;
  const e=blank(t);e.migraine=false;e.intensity=0;const n=applyPreset(e,true);await putEntry(e);renderHome();
  toast(n?`${T("savedCalm")} Journée type ajoutée.`:T("savedCalm"),{label:n?"Modifier":"Compléter",run:()=>openForm(t)});return true}
$("noPain").addEventListener("click",()=>noPainNow());
$("settingsBtn").addEventListener("click",()=>show("data"));
$("editToday").addEventListener("click",()=>openForm(todayStr()));
// Crise rapide : note la crise tout de suite avec l'heure, le reste se complète plus tard
async function quickCrisis(v){
  const t=todayStr(),now=new Date(),ex=S.entries[t];
  const e=ex?JSON.parse(JSON.stringify(ex)):blank(t);
  e.intensity=Math.max(v,ex&&ex.migraine?ex.intensity:0);e.migraine=true;
  if(!e.start)e.start=`${pad(now.getHours())}:${pad(now.getMinutes())}`;
  // On garde la journée d'avant (sans la crise) pour pouvoir la remettre telle quelle
  e.quickPrev=ex&&ex.quick?(ex.quickPrev||null):(ex?clean(ex):null);
  e.quick=true;
  await putEntry(e);renderHome();crisisCheckIn(2);
  toast(`Crise notée à ${e.start}`,{label:"Annuler",run:()=>undoQuick(t)});
}
// « Forte » passe aussi l'écran en mode crise (sombre, sans animation, gros boutons)
document.querySelectorAll("[data-quick]").forEach(b=>b.addEventListener("click",async()=>{const v=+b.dataset.quick;await quickCrisis(v);if(v===9)setCrisis(true)}));
$("endCrisis").addEventListener("click",()=>endCrisis());
$("crisisEnd").addEventListener("click",()=>endCrisis());
$("crisisOff").addEventListener("click",()=>{setCrisis(false);$("hello").focus&&$("themeBtn").focus()});
$("crisisOn").addEventListener("click",()=>{setCrisis(true);$("crisisOff").focus()});
async function undoQuick(date){
  const e=S.entries[date];if(!e||!e.quick)return;
  if(e.quickPrev){const back=JSON.parse(JSON.stringify(e.quickPrev));delete back.quick;delete back.quickPrev;delete back._local;await putEntry(back)}
  else await removeEntry(date);
  cancelCrisisCheck();setCrisis(false);renderHome();toast("Crise retirée");
}
$("undoQuick").addEventListener("click",()=>undoQuick(todayStr()));
// Médicaments pris le plus souvent ces 90 derniers jours (orthographe la plus récente)
function recentMeds(entries,now,max){
  const from=ymd(addDays(now,-90)),c={};
  Object.values(entries).filter(e=>e.date>=from).sort((a,b)=>b.date.localeCompare(a.date)).forEach((e,i)=>medsOf(e).forEach(m=>{const k=medKey(m.name);if(!k)return;
    const o=c[k]=c[k]||{name:m.name.trim(),n:0,last:i};o.n++}));
  return Object.values(c).sort((a,b)=>b.n-a.n||a.last-b.last).slice(0,max||4).map(x=>x.name);
}
// Où en est ce médicament : prochaine prise d'après l'écart réglé, sinon heure de la dernière prise du jour
function medStatus(name,now){
  const k=medKey(name),nd=nextDoses(S.entries,S.settings.medGaps,now).find(x=>medKey(x.name)===k);
  if(nd)return{wait:true,txt:`possible vers ${hhmm(nd.next)}${ymd(nd.next)!==ymd(now)?" (demain)":""}`};
  const t=S.entries[ymd(now)],l=t?medsOf(t).filter(m=>medKey(m.name)===k&&m.time).map(m=>m.time).sort():[];
  return{wait:false,txt:l.length?`pris à ${hm(l[l.length-1])}`:""};
}
// « J'ai pris » : ajoute la prise, avec l'heure, à la crise du jour
async function takeMed(name,now){
  now=now||new Date();const t=ymd(now),ex=S.entries[t];if(!ex||!ex.migraine||!String(name||"").trim())return false;
  const st=medStatus(name,now),time=`${pad(now.getHours())}:${pad(now.getMinutes())}`,e=JSON.parse(JSON.stringify(ex));
  e.meds=medsOf(e).map(m=>Object.assign({name:m.name,time:m.time||"",eff:m.eff||""},m.at2h?{at2h:m.at2h}:{})).concat({name:String(name).trim().slice(0,80),time,eff:""});delete e.med;delete e.medEff;
  await putEntry(e);scheduleDoseReminders();schedule2h();if(tab==="home")renderHome();
  toast(`${name} noté à ${hm(time)}${st.wait?" · avant l'écart conseillé":""}`,{label:"Annuler",run:()=>untakeMed(t,name,time)});return true;
}
async function untakeMed(date,name,time){const ex=S.entries[date];if(!ex)return;const e=JSON.parse(JSON.stringify(ex)),l=medsOf(e);
  const i=l.map((m,j)=>m.name===name&&m.time===time?j:-1).filter(j=>j>=0).pop();if(i==null)return;
  l.splice(i,1);e.meds=l;delete e.med;delete e.medEff;await putEntry(e);scheduleDoseReminders();if(tab==="home")renderHome();toast("Prise retirée")}
let clockT=null;
const sinceMin=(start,now)=>{const st=toMin(start);if(st==null)return null;let d=now.getHours()*60+now.getMinutes()-st;if(d<0)d+=1440;return d};
function paintClock(){const e=S.entries[todayStr()],m=e&&e.migraine&&e.duration===""?sinceMin(e.start,new Date()):null;
  $("crisisClock").hidden=m==null;if(m==null)return;
  $("crisisSince").textContent=`Crise ${e.intensity<=3?"légère":e.intensity<=6?"moyenne":"forte"} · depuis ${hm(e.start)}`;$("crisisTimer").textContent=hmTxt(m)}
function renderCrisis(e){
  $("crisisMsg").textContent=T("crisisMsg");
  const on=isCrisis();clearInterval(clockT);clockT=null;
  if(!on){$("crisisMeds").hidden=true;return}
  paintClock();clockT=setInterval(paintClock,30e3);
  const now=new Date(),ok=e&&e.migraine,l=ok?recentMeds(S.entries,now,4):[];
  $("crisisMeds").hidden=!ok;
  if(ok)$("crisisMedList").innerHTML=l.map(n=>{const st=medStatus(n,now);return `<button type="button" data-take="${esc(n)}"><span>${esc(n)}</span>${st.txt?`<small class="${st.wait?"":"ok"}">${esc(st.txt)}</small>`:""}</button>`}).join("")
    +`<button type="button" data-take=""><span>${l.length?"Un autre médicament…":"Noter un médicament…"}</span></button>`;
}
// Prise de plus de 2 h (et de moins de 12 h) sans réponse : on demande sur l'accueil
function render2h(now){
  const w=medsAwaiting2h(S.entries,now).filter(x=>x.at<=now&&now-x.at<10*3600e3).pop();
  $("m2hCard").hidden=!w;if(!w)return;
  $("m2hS").textContent=`${w.name}, pris à ${hm(w.time)}${w.date!==ymd(now)?" hier":""} : comment va ta tête ?`;
  $("m2hBtns").innerHTML=AT2H.map(([v,l])=>`<button class="btn soft" type="button" data-m2h="${v}">${l}</button>`).join("");
  $("m2hBtns").dataset.k=JSON.stringify([w.date,w.name,w.time]);
}
$("m2hBtns").addEventListener("click",ev=>{const b=ev.target.closest("[data-m2h]");if(!b)return;const[d,n,t]=JSON.parse($("m2hBtns").dataset.k||"[]");set2h(d,n,t,b.dataset.m2h)});
$("crisisMedList").addEventListener("click",ev=>{const b=ev.target.closest("[data-take]");if(!b)return;
  if(b.dataset.take)takeMed(b.dataset.take);else{openForm(todayStr());goStep(1)}});
function renderMedAlert(){
  const from=ymd(addDays(new Date(),-29));
  const ents=Object.values(S.entries).filter(e=>e.date>=from&&e.migraine&&hasMed(e));
  const w=medWarn(ents.length,ents.filter(hasTriptan).length,"sur les 30 derniers jours");
  $("medAlert").hidden=!w;
  if(w){$("medAlertT").textContent=w.t;$("medAlertS").textContent=" "+w.s;$("medAlert").classList.toggle("warn",w.lvl>1)}
}
$("otherDay").addEventListener("click",()=>openForm(todayStr(),null,true));
let noticeAct=null;
function checkNotice(){
  const t=new Date(),dow=t.getDay();let T="",Sx="";
  if(!Object.keys(S.entries).length){$("notice").hidden=true;return}
  if(daysSince(S.settings.lastBackup)>=7){T=S.settings.lastBackup?"Ta sauvegarde de la semaine":"Pense à faire ta première sauvegarde";
    Sx="Un toucher pour en mettre une copie sur ton Drive, en plus de la copie automatique : comme ça, rien ne se perd si le téléphone casse.";noticeAct=()=>"data"}
  else if(Object.keys(S.entries).length>=28&&(!(S.settings.midas||[]).length||daysSince(S.settings.midas[S.settings.midas.length-1].date)>=90)){
    T="Questionnaire de suivi";Sx="2 minutes pour mesurer la gêne de ces 3 derniers mois. Utile pour ton médecin.";noticeAct=()=>{sMode="quarter";sAnchor=t;setTimeout(openMidas,60)}}
  else if(t.getDate()<=3){T=`Ton bilan de ${MONTHS[(t.getMonth()+11)%12]} est prêt`;Sx="Tout le mois en un coup d'œil.";noticeAct=()=>{sMode="month";sAnchor=new Date(t.getFullYear(),t.getMonth()-1,1)}}
  else if(dow===0||dow===6){T="Ton bilan de la semaine est prêt";Sx="Regarde comment s'est passée ta semaine.";noticeAct=()=>{sMode="week";sAnchor=t}}
  else if(dow===1){T="Le bilan de la semaine dernière";Sx="Il est prêt à être consulté.";noticeAct=()=>{sMode="week";sAnchor=addDays(t,-7)}}
  $("notice").hidden=!T;$("noticeT").textContent=T;$("noticeS").textContent=Sx;
}
$("noticeBtn").addEventListener("click",()=>{const to=noticeAct&&noticeAct();show(to||"stats");if(to==="data")setTimeout(()=>$("bkBtn").focus(),50)});

/* =============== FORMULAIRE =============== */
let cur=null,stepIdx=0,returnTab="home";
const STEPS=["head","crisis","meals","day","end"];
const blank=d=>({date:d,migraine:null,intensity:5,start:"",duration:"",zones:[],symptoms:[],meds:[],glasses:"",breakfast:"",lunch:"",dinner:"",breakfastTime:"",lunchTime:"",dinnerTime:"",sleep:"",water:"",screen:"",coffee:"",stress:"",period:"",notes:"",custom:{}});
function chipGroup(id,name,list,lab){$(id).innerHTML=list.map(v=>`<label class="opt"><input type="checkbox" name="${name}" value="${esc(v)}"><span>${esc(lab?lab(v):v)}</span></label>`).join("")}
chipGroup("zones","zones",ZONES);chipGroup("symptoms","symptoms",SYMPT);
document.querySelectorAll("[data-counter]").forEach(c=>{
  const k=c.dataset.counter;
  const nm=((document.getElementById(c.getAttribute("aria-labelledby"))||{}).childNodes||[{textContent:""}])[0].textContent.trim().toLowerCase();
  c.insertAdjacentHTML("beforeend",`<button type="button" data-dec aria-label="Moins : ${esc(nm)}">−</button><output aria-live="polite"></output><button type="button" data-inc aria-label="Plus : ${esc(nm)}">+</button>`);
  // Non renseigné : la valeur par défaut est affichée en gris, et le premier toucher part de celle-ci
  c.addEventListener("click",ev=>{const b=ev.target.closest("button");if(!b||!cur)return;
    const st=+c.dataset.step,mx=+c.dataset.max,v=cur[k]===""?+c.dataset.def:cur[k];
    cur[k]=Math.round((b.hasAttribute("data-inc")?Math.min(mx,v+st):Math.max(0,v-st))*10)/10;formDirty=true;paintCounters()});
});
function paintCounters(){document.querySelectorAll("[data-counter]").forEach(c=>{const v=cur[c.dataset.counter],o=c.querySelector("output"),unset=v==="";
  const val=(unset?f1(+c.dataset.def):f1(v))+c.dataset.unit;
  o.innerHTML=unset?`<span class="sr">Non renseigné, par défaut </span>${esc(val)}<span aria-hidden="true"> ?</span>`:esc(val);o.classList.toggle("unset",unset)})}
// Plusieurs médicaments par jour : meds=[{name,eff}]. Les journées notées avant gardent med/medEff, lus ici sans conversion.
// meds vide + med rempli = vieille journée passée par blank() (restauration) : on garde med.
const medsOf=e=>{const l=Array.isArray(e.meds)?e.meds.filter(m=>m&&m.name):[];return l.length?l:e.med?[{name:e.med,eff:e.medEff||""}]:[]};
const hasMed=e=>medsOf(e).length>0;
const hasTriptan=e=>medsOf(e).some(m=>TRIPTAN.test(m.name));
const EFF_OPTS=[["oui","Oui"],["un peu","Un peu"],["non","Non"]];
function medRowHtml(m,i,total){
  const n=total>1?` ${i+1}`:"";
  return `<div class="medrow" data-eff="${m.at2h?"":esc(m.eff||"")}"><div class="field"><label class="flabel" for="f-med-${i}">Médicament pris${n}</label>
    <div class="medline"><input type="text" id="f-med-${i}" list="medList" placeholder="${i?"Par ex. Ibuprofène 400 mg":"Rien, ou par ex. Doliprane 1 g"}" autocomplete="off" value="${esc(m.name)}">
    ${total>1?`<button class="iconbtn" type="button" data-delmed="${i}" aria-label="Retirer le médicament${n}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`:""}</div></div>
    <div class="field medtime"><label class="flabel" for="f-medt-${i}">Pris à quelle heure ?</label><input type="time" id="f-medt-${i}" value="${esc(m.time||"")}"></div>
    <fieldset><legend>2 h après la prise ?</legend>${!m.at2h&&m.eff?`<p class="hint">Noté avant : a soulagé « ${esc(m.eff)} ».</p>`:""}<div class="opts">${AT2H.map(([v,l])=>`<label class="opt"><input type="radio" name="medEff-${i}" value="${v}"${m.at2h===v?" checked":""}><span>${l}</span></label>`).join("")}</div></fieldset></div>`;
}
function readMedRows(){return[...document.querySelectorAll("#medRows .medrow")].map((r,i)=>{const a=getRadio("medEff-"+i),o={name:$("f-med-"+i).value.trim(),time:$("f-medt-"+i).value,eff:a?EFF_OF[a]:((r.dataset||{}).eff||"")};if(a)o.at2h=a;return o})}
function renderMedRows(list){const l=list.length?list:[{name:"",time:"",eff:""}];$("medRows").innerHTML=l.map((m,i)=>medRowHtml(m,i,l.length)).join("")}
// Les médicaments habituels s'ajoutent d'un toucher (avec l'heure actuelle si c'est aujourd'hui)
function renderMedQuick(){
  const have=new Set(readMedRows().map(m=>medKey(m.name)).filter(Boolean));
  const l=recentMeds(S.entries,new Date(),4).filter(n=>!have.has(medKey(n)));
  $("medQuick").hidden=!l.length;
  $("medQuick").innerHTML=l.map(n=>`<button type="button" data-qmed="${esc(n)}">+ ${esc(n)}</button>`).join("");
}
$("medQuick").addEventListener("click",ev=>{const b=ev.target.closest("[data-qmed]");if(!b||!cur)return;
  const now=new Date(),time=cur.date===todayStr()?`${pad(now.getHours())}:${pad(now.getMinutes())}`:"";
  let l=readMedRows();if(l.length===1&&!l[0].name&&!l[0].time&&!l[0].eff)l=[];
  l.push({name:b.dataset.qmed,time,eff:""});renderMedRows(l);renderMedQuick();formDirty=true;
  toast(`${b.dataset.qmed} ajouté${time?` à ${hm(time)}`:""}`)});
$("addMed").addEventListener("click",()=>{const l=readMedRows();l.push({name:"",time:"",eff:""});renderMedRows(l);formDirty=true;$("f-med-"+(l.length-1)).focus()});
$("medRows").addEventListener("click",ev=>{const b=ev.target.closest("[data-delmed]");if(!b)return;
  const l=readMedRows(),i=+b.dataset.delmed;l.splice(i,1);renderMedRows(l);formDirty=true;$("f-med-"+Math.max(0,i-1)).focus()});
function setRadio(name,val){document.querySelectorAll(`input[name="${name}"]`).forEach(i=>i.checked=i.value===val)}
function getRadio(name){const i=document.querySelector(`input[name="${name}"]:checked`);return i?i.value:""}
function setChecks(name,arr){document.querySelectorAll(`input[name="${name}"]`).forEach(i=>i.checked=arr.includes(i.value))}
function getChecks(name){return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i=>i.value)}
function buildCustom(){
  $("customFields").innerHTML=(S.settings.custom||[]).map(q=>q.type==="bool"
    ?`<fieldset><legend>${esc(q.label)}</legend><div class="opts"><label class="opt"><input type="radio" name="cq-${q.id}" value="oui"><span>Oui</span></label><label class="opt"><input type="radio" name="cq-${q.id}" value="non"><span>Non</span></label></div></fieldset>`
    :`<div class="field"><label class="flabel" for="cq-${q.id}">${esc(q.label)}</label><input type="text" id="cq-${q.id}"></div>`).join("");
}
function loadForm(date,preset){
  const ex=S.entries[date];
  cur=ex?JSON.parse(JSON.stringify(ex)):blank(date);cur.custom=cur.custom||{};
  if(preset==="yes")cur.migraine=true;if(preset==="no")cur.migraine=false;
  $("f-date").value=date;$("formDate").textContent=dayLong(date)+(ex?" · modification":"");
  $("dayText").textContent=date===todayStr()?`Aujourd'hui · ${dayLong(date)}`:dayLong(date);
  setRadio("migraine",cur.migraine===true?"yes":cur.migraine===false?"no":"");
  $("f-int").value=cur.intensity||5;paintPain();
  chipGroup("painKind","symptoms",PAINK);chipGroup("symptoms","symptoms",SYMPT,symLabel);applyWords();
  $("f-start").value=cur.start;setChecks("zones",cur.zones);setChecks("symptoms",cur.symptoms||[]);$("symFold").open=(cur.symptoms||[]).some(x=>SYMPT.includes(x));
  renderMedRows(medsOf(cur));renderMedQuick();
  ["breakfast","lunch","dinner","notes","breakfastTime","lunchTime","dinnerTime"].forEach(k=>$("f-"+k).value=cur[k]||"");
  setRadio("glasses",cur.glasses);setRadio("stress",cur.stress);setRadio("period",cur.period);
  buildCustom();
  (S.settings.custom||[]).forEach(q=>{const v=cur.custom[q.id]||"";if(q.type==="bool")setRadio("cq-"+q.id,v);else{const i=$("cq-"+q.id);if(i)i.value=v}});
  const meds=[...new Set(Object.values(S.entries).flatMap(e=>medsOf(e).map(m=>m.name)))];
  $("medList").innerHTML=meds.map(m=>`<option value="${esc(m)}">`).join("");
  paintCounters();$("painBox").hidden=cur.migraine!==true;
}
function openForm(date,preset,pickDay){
  returnTab=tab==="form"?returnTab:tab;
  loadForm(date,preset);formDirty=false;showQuit(false);$("migErr").hidden=true;$("dateErr").hidden=true;$("f-date").removeAttribute("aria-invalid");
  $("dateField").hidden=!pickDay;$("dayLine").hidden=!!pickDay;
  stepIdx=preset?1:0;
  show("form");goStep(stepIdx,true);
  if(pickDay)setTimeout(()=>$("f-date").focus(),50);
}
$("dayChange").addEventListener("click",()=>{$("dayLine").hidden=true;$("dateField").hidden=false;$("f-date").focus()});
// Confirmation avant de quitter un formulaire déjà commencé
let formDirty=false;
$("form").addEventListener("input",()=>{formDirty=true});
$("form").addEventListener("change",()=>{formDirty=true});
function showQuit(on){$("quitBar").hidden=!on;$("navBar").hidden=on;if(on)$("quitStay").focus()}
function askLeave(){if(formDirty)showQuit(true);else show(returnTab)}
$("quitStay").addEventListener("click",()=>{showQuit(false);$("nextStep").focus()});
$("quitGo").addEventListener("click",()=>{showQuit(false);show(returnTab)});
function paintPain(){const v=+$("f-int").value;$("intNum").textContent=v;$("intWord").textContent=painWord(v);$("f-int").setAttribute("aria-valuetext",`${v} sur 10, ${painWord(v)}`)}
$("f-int").addEventListener("input",()=>{cur.intensity=+$("f-int").value;paintPain()});
document.querySelectorAll('input[name="migraine"]').forEach(i=>i.addEventListener("change",()=>{$("migErr").hidden=true;cur.migraine=i.value==="yes";$("painBox").hidden=!cur.migraine;if(cur.migraine)cur.intensity=+$("f-int").value}));
$("f-date").addEventListener("change",()=>{const d=$("f-date").value;if(!d)return;if(d>todayStr()){$("dateErr").hidden=false;$("f-date").setAttribute("aria-invalid","true");$("f-date").value=cur.date;return}
  $("dateErr").hidden=true;$("f-date").removeAttribute("aria-invalid");
  const mig=cur.migraine;loadForm(d);if(cur.migraine===null&&mig!==null){cur.migraine=mig;setRadio("migraine",mig?"yes":"no");$("painBox").hidden=!mig}});
function visibleSteps(){return STEPS.filter(s=>s!=="crisis"||cur.migraine===true)}
function goStep(i,noFocus){
  const vs=visibleSteps();stepIdx=Math.max(0,Math.min(i,vs.length-1));
  document.querySelectorAll(".step[data-step]").forEach(s=>s.hidden=s.dataset.step!==vs[stepIdx]);
  $("stepLabel").textContent=`Étape ${stepIdx+1} sur ${vs.length}`+(stepIdx?" · la suite est facultative":"");
  $("progressBar").style.width=((stepIdx+1)/vs.length*100)+"%";
  $("prevStep").setAttribute("aria-label",stepIdx===0?"Annuler":"Étape précédente");
  $("nextStep").textContent=stepIdx===vs.length-1?"Enregistrer":"Suivant";
  // « Enregistrer » à chaque étape : rien n'oblige à aller au bout (pendant une crise surtout)
  $("saveNow").hidden=stepIdx===vs.length-1;$("navBar").classList.toggle("three",stepIdx!==vs.length-1);
  window.scrollTo(0,0);
  if(!noFocus){const h=document.querySelector(`.step[data-step="${vs[stepIdx]}"] > h2`);h&&h.focus({preventScroll:true})}
}
function collect(){
  cur.date=$("f-date").value||cur.date;
  cur.start=$("f-start").value;cur.zones=getChecks("zones");cur.symptoms=getChecks("symptoms");
  cur.meds=readMedRows().filter(m=>m.name);delete cur.med;delete cur.medEff;
  ["breakfast","lunch","dinner","notes","breakfastTime","lunchTime","dinnerTime"].forEach(k=>cur[k]=$("f-"+k).value.trim());
  cur.glasses=getRadio("glasses");cur.stress=getRadio("stress");cur.period=getRadio("period");
  (S.settings.custom||[]).forEach(q=>{cur.custom[q.id]=q.type==="bool"?getRadio("cq-"+q.id):(($("cq-"+q.id)||{}).value||"").trim()});
  delete cur.quick;delete cur.quickPrev;
  if(!cur.migraine){cur.intensity=0;cur.zones=[];cur.symptoms=[];cur.start="";cur.duration="";cur.meds=[]}
}
function headMissing(){if(cur.migraine!==null)return false;if(visibleSteps()[stepIdx]!=="head")goStep(0,true);
  $("migErr").hidden=false;const i=document.querySelector('input[name="migraine"]');i&&i.focus();return true}
$("nextStep").addEventListener("click",async()=>{
  const vs=visibleSteps();
  if(vs[stepIdx]==="head"&&headMissing())return;
  if(stepIdx<vs.length-1){goStep(stepIdx+1);return}
  saveForm($("nextStep"));
});
$("saveNow").addEventListener("click",()=>{if(!headMissing())saveForm($("saveNow"))});
async function saveForm(b){
  collect();b.disabled=true;
  await putEntry(JSON.parse(JSON.stringify(cur)));
  if(cur.date===todayStr()&&cur.duration!=="")cancelCrisisCheck();
  scheduleDoseReminders();schedule2h();
  b.disabled=false;
  toast(T(cur.migraine?"savedPain":"savedCalm"));
  if(returnTab==="cal")calSel=cur.date;
  show(returnTab==="form"?"home":returnTab);
}
$("prevStep").addEventListener("click",()=>{if(stepIdx===0)askLeave();else goStep(stepIdx-1)});
$("usualBtn").addEventListener("click",()=>{
  // D'abord la journée type (Réglages), puis les habitudes des 14 derniers jours
  const p=S.settings.dayPreset||{};let n=0;
  ["breakfast","lunch","dinner"].forEach(k=>{const i=$("f-"+k);if(isSet(p[k])&&!i.value.trim()){i.value=p[k];n++}});
  ["sleep","water","coffee","screen"].forEach(k=>{if(isSet(p[k])&&cur[k]===""){cur[k]=p[k];n++}});
  ["glasses","stress","period"].forEach(k=>{if(isSet(p[k])&&!getRadio(k)){setRadio(k,p[k]);n++}});
  (S.settings.custom||[]).filter(q=>q.type==="bool").forEach(q=>{const v=(p.custom||{})[q.id];if(v&&!getRadio("cq-"+q.id)){setRadio("cq-"+q.id,v);n++}});
  const u=usualFrom(S.entries,cur.date);
  if(!u){paintCounters();if(n){formDirty=true;toast("Rempli avec ta journée type : corrige si besoin")}else toast("Note encore quelques jours, ou règle ta journée type dans les Réglages");return}
  ["breakfast","lunch","dinner","breakfastTime","lunchTime","dinnerTime"].forEach(k=>{const i=$("f-"+k);if(u[k]&&!i.value.trim()){i.value=u[k];n++}});
  ["sleep","water","coffee","screen"].forEach(k=>{if(u[k]!==""&&cur[k]===""){cur[k]=u[k];n++}});
  if(u.glasses&&!getRadio("glasses")){setRadio("glasses",u.glasses);n++}
  paintCounters();formDirty=true;
  toast(n?"Rempli d'après tes 14 derniers jours : corrige si besoin":"Tout était déjà rempli");
});
$("closeForm").addEventListener("click",askLeave);

/* =============== CALENDRIER =============== */
let calM=new Date(),calSel=null,delArmed=false;
function renderCal(){
  const y=calM.getFullYear(),m=calM.getMonth(),first=new Date(y,m,1),nd=new Date(y,m+1,0).getDate(),off=(first.getDay()+6)%7,t=todayStr();
  $("calTitle").textContent=`${MONTHS[m]} ${y}`;
  let h=DS.map((d,i)=>`<span class="dn" aria-hidden="true">${d}</span>`).join("")+"<span></span>".repeat(off);
  for(let i=1;i<=nd;i++){const k=ymd(new Date(y,m,i)),e=S.entries[k],fut=k>t;
    const lab=`${dayLong(k)} : ${e?(e.migraine?`mal de tête ${e.intensity} sur 10`:"sans mal de tête"):"rien de noté"}`;
    h+=`<button type="button" data-k="${k}" class="${pcls(e)}${k===t?" today":""}${k===calSel?" sel":""}${fut?" future":""}" ${fut?'disabled':""} aria-label="${esc(lab)}" aria-haspopup="dialog">${i}</button>`}
  $("cal").innerHTML=h;
  $("calNext").disabled=y>new Date().getFullYear()||(y===new Date().getFullYear()&&m>=new Date().getMonth());
  renderDay();
}
// Le détail d'un jour s'ouvre dans un panneau qui monte du bas de l'écran
function renderDay(){
  const c=$("dayCard"),open=!!calSel;delArmed=false;
  c.hidden=!open;$("sheetBg").hidden=!open;
  if(!open){c.innerHTML="";return}
  const e=S.entries[calSel];
  const head=`<div class="grab" aria-hidden="true"></div><div class="rowhead"><h2 id="dayT">${esc(dayLong(calSel))}</h2>
    <button class="iconbtn" type="button" data-act="close" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>`;
  c.innerHTML=!e
    ?`${head}<p class="muted">Rien de noté ce jour-là.</p><button class="btn block" type="button" data-act="edit">Noter ce jour</button>`
    :`${head}<div class="pillrow"><span class="pill ${pcls(e)}">${e.migraine?`Mal ${esc(e.intensity)}/10 · ${painWord(e.intensity)}`:"Sans mal de tête"}</span></div>
      ${dayDetailHtml(e)}
      <div class="duo"><button class="btn danger" type="button" data-act="del">Supprimer</button><button class="btn soft" type="button" data-act="edit">Modifier</button></div>`;
}
function closeDay(){const k=calSel;calSel=null;renderCal();const b=k&&document.querySelector(`#cal [data-k="${k}"]`);b&&b.focus()}
$("cal").addEventListener("click",ev=>{const b=ev.target.closest("[data-k]");if(!b||b.disabled)return;calSel=b.dataset.k;renderCal();
  const x=$("dayCard").querySelector('[data-act="close"]');x&&x.focus()});
$("sheetBg").addEventListener("click",closeDay);
document.addEventListener("keydown",ev=>{
  if(tab==="form"){
    if(!$("quitBar").hidden){
      if(ev.key==="Escape"){ev.preventDefault();showQuit(false);$("nextStep").focus();return}
      if(ev.key==="Tab"){ev.preventDefault();(document.activeElement===$("quitStay")?$("quitGo"):$("quitStay")).focus()}
      return}
    if(ev.key==="Escape"){ev.preventDefault();askLeave()}
    return}
  if(!$("midasCard").hidden){if(ev.key==="Escape")closeMidas();return}
  if(!calSel||tab!=="cal")return;
  if(ev.key==="Escape"){closeDay();return}
  if(ev.key!=="Tab")return;
  const f=[...$("dayCard").querySelectorAll("button:not([disabled])")];if(!f.length)return;
  const a=f[0],z=f[f.length-1];
  if(!$("dayCard").contains(document.activeElement)){ev.preventDefault();a.focus()}
  else if(ev.shiftKey&&document.activeElement===a){ev.preventDefault();z.focus()}
  else if(!ev.shiftKey&&document.activeElement===z){ev.preventDefault();a.focus()}
});
$("dayCard").addEventListener("click",async ev=>{const b=ev.target.closest("[data-act]");if(!b)return;
  if(b.dataset.act==="close")closeDay();
  else if(b.dataset.act==="edit")openForm(calSel);
  else{if(!delArmed){delArmed=true;b.textContent="Oui, supprimer";b.classList.add("armed");return}
    const d=calSel;calSel=null;await removeEntry(d);toast("Journée supprimée");renderCal()}});
$("calPrev").addEventListener("click",()=>{calM=new Date(calM.getFullYear(),calM.getMonth()-1,1);renderCal()});
$("calNext").addEventListener("click",()=>{calM=new Date(calM.getFullYear(),calM.getMonth()+1,1);renderCal()});

/* =============== CALCULS =============== */
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
// Abus médicamenteux (classification internationale ICHD-3) : triptans ≥ 10 j/mois, antidouleurs simples ≥ 15 j/mois
const TRIPTAN=/triptan|relpax|zomig|imigrane?|naramig|almogran|tigreat|maxalt/i;
function medWarn(all,tri,p){
  if(tri>=10)return{lvl:2,t:`Triptan pris ${tri} jours ${p}`,s:"C'est le seuil où un triptan peut lui-même entretenir les maux de tête. Parles-en à ton médecin."};
  if(all>=15)return{lvl:2,t:`Médicament pris ${all} jours ${p}`,s:"C'est le seuil où les antidouleurs peuvent eux-mêmes entretenir les maux de tête. Parles-en à ton médecin."};
  if(all>=10||tri>=8)return{lvl:1,t:`Médicament pris ${all} jours ${p}`,s:"Tu approches du seuil où les antidouleurs peuvent entretenir les maux de tête. À surveiller avec ton médecin."};
  return null;
}
const tokens=s=>String(s||"").toLowerCase().split(/[,;\n+\/]| et | avec /).map(t=>t.trim().replace(/^(du|de la|des|de l'|un|une|le|la|les)\s+/,"")).filter(t=>t.length>2);
function compareGroups(ents,custom){
  const rate=g=>g.length?Math.round(g.filter(e=>e.migraine).length/g.length*100):0;
  const out=[];
  // [libellé court, filtre, « quand … » pour les phrases du bilan]
  const add=(title,ico,defs)=>{const rows=defs.map(([lab,fn,when])=>{const g=ents.filter(fn);return{lab,when,n:g.length,m:g.filter(e=>e.migraine).length,r:rate(g)}}).filter(r=>r.n);if(rows.length===2)out.push({title,ico,rows})};
  add("Lunettes","glasses",[["Portées",e=>e.glasses==="oui"||e.glasses==="partiel","tu portes tes lunettes"],["Pas portées",e=>e.glasses==="non","tu ne les portes pas"]]);
  add("Sommeil","sleep",[["Moins de 7 h",e=>e.sleep!==""&&e.sleep<7,"tu dors moins de 7 h"],["7 h ou plus",e=>e.sleep!==""&&e.sleep>=7,"tu dors 7 h ou plus"]]);
  add("Stress","stress",[["Zen ou un peu",e=>e.stress==="1"||e.stress==="2","ton stress est faible"],["Stress fort",e=>e.stress==="3"||e.stress==="4","ton stress est fort"]]);
  add("Eau","water",[["Moins de 5 verres",e=>e.water!==""&&e.water<5,"tu bois moins de 5 verres d'eau"],["5 verres ou plus",e=>e.water!==""&&e.water>=5,"tu bois 5 verres d'eau ou plus"]]);
  add("Écrans","screen",[["Moins de 6 h",e=>e.screen!==""&&e.screen<6,"tu passes moins de 6 h sur les écrans"],["6 h ou plus",e=>e.screen!==""&&e.screen>=6,"tu passes 6 h ou plus sur les écrans"]]);
  add("Café / thé","cup",[["2 ou moins",e=>e.coffee!==""&&e.coffee<=2,"tu prends 2 cafés ou thés au plus"],["3 ou plus",e=>e.coffee!==""&&e.coffee>=3,"tu prends 3 cafés ou thés ou plus"]]);
  add("Cycle","cycle",[["Règles ou juste avant",e=>e.period==="oui"||e.period==="avant","tu as tes règles ou juste avant"],["Hors règles",e=>e.period==="non","tu n'as pas tes règles"]]);
  (custom||[]).filter(q=>q.type==="bool").forEach(q=>add(q.label,"ask",[["Oui",e=>e.custom&&e.custom[q.id]==="oui",`tu réponds « Oui » à « ${q.label} »`],["Non",e=>e.custom&&e.custom[q.id]==="non",`tu réponds « Non » à « ${q.label} »`]]));
  return out;
}
// Seuils de fiabilité : en dessous, une coïncidence passerait pour une piste. Sous MIN_STRONG jours d'un côté, la piste est dite « encore faible ».
const MIN_DAYS=10,MIN_SIDE=4,MIN_STRONG=8;
const isWeak=(a,b)=>Math.min(a,b)<MIN_STRONG;
const weakTag=`<span class="weak">Piste encore faible : moins de ${MIN_STRONG} jours d'un côté</span>`;
// Jours avec mal de tête par mois civil. À 15 jours ou plus par mois pendant plus de 3 mois, on parle de céphalée chronique (ICHD-3).
const CHRONIC_DAYS=15;
function monthCounts(entries,now,n){const out=[];for(let i=n-1;i>=0;i--){const m0=new Date(now.getFullYear(),now.getMonth()-i,1),m1=new Date(now.getFullYear(),now.getMonth()-i+1,0),a=ymd(m0),b=ymd(m1);
  const es=Object.values(entries).filter(e=>e.date>=a&&e.date<=b);out.push({y:m0.getFullYear(),m:m0.getMonth(),days:m1.getDate(),noted:es.length,mig:es.filter(e=>e.migraine).length,cur:i===0})}return out}
// Les 3 derniers mois terminés à 15 jours ou plus : à signaler au médecin
function chronicFlag(entries,now){const l=monthCounts(entries,now,4).filter(x=>!x.cur);return l.length===3&&l.every(x=>x.mig>=CHRONIC_DAYS)?l:null}
// Critères ICHD-3 de la migraine (sans aura, B à D) pour une crise décrite : au moins 2 caractères de la douleur
// (d'un seul côté, qui bat, moyenne à forte, pire en bougeant) ET nausées/vomissements ou gêne à la lumière ET au bruit, durée 4 à 72 h si notée.
function ichd(e){
  if(!e||!e.migraine)return null;const s=new Set(e.symptoms||[]),z=e.zones||[];
  if(![...PAINK,...SYMPT].some(x=>s.has(x)))return{known:false};
  const side=(z.includes("Côté gauche")!==z.includes("Côté droit"))&&!z.includes("Tout le crâne");
  const C=[s.has(PAINK[0])||side,s.has(PAINK[1]),e.intensity>=4,s.has(PAINK[2])].filter(Boolean).length;
  const D=s.has("Nausées")||s.has("Vomissements")||(s.has("Sensible à la lumière")&&s.has("Sensible au bruit"));
  const dur=e.duration===""||e.duration==null?null:(+e.duration>=4&&+e.duration<=72);
  return{known:true,C,D,dur,typical:C>=2&&D&&dur!==false,aura:s.has(PAINK[3])};
}
// Premier jour de chaque cycle : « 1er jour des règles » noté, sinon le début d'une suite de jours « Règles »
function periodStarts(entries){
  const keys=Object.keys(entries).sort(),deb=keys.filter(k=>entries[k].period==="debut"),out=[...deb];
  keys.forEach(k=>{if(entries[k].period!=="oui")return;const y=entries[ymd(addDays(parse(k),-1))];
    if(y&&(y.period==="oui"||y.period==="debut"))return;if(deb.some(d=>Math.abs(parse(d)-parse(k))<=5*864e5))return;out.push(k)});
  return out.sort();
}
// Migraine menstruelle : crises du 2e jour avant au 3e jour après le 1er jour des règles, dans au moins 2 cycles sur 3 (ICHD-3).
// On compare aussi la part de jours avec mal dans cette fenêtre et en dehors, sur la même période.
function menstrual(entries,to,maxCycles,from){
  const st=periodStarts(entries).filter(k=>k<=to&&(!from||k>=ymd(addDays(parse(from),-3)))).slice(-(maxCycles||3));if(!st.length)return null;
  const win=new Set(),cycles=st.map(k=>{let hit=false;for(let i=-2;i<=3;i++){const d=ymd(addDays(parse(k),i));win.add(d);const e=entries[d];if(e&&e.migraine)hit=true}return{start:k,hit}});
  const f0=ymd(addDays(parse(st[0]),-2)),ents=Object.values(entries).filter(e=>e.date>=f0&&e.date<=to);
  const w=ents.filter(e=>win.has(e.date)),o=ents.filter(e=>!win.has(e.date));
  return{cycles,hits:cycles.filter(c=>c.hit).length,win:{n:w.length,m:w.filter(e=>e.migraine).length},out:{n:o.length,m:o.filter(e=>e.migraine).length}};
}
// Récurrence : après un médicament qui a marché (plus de douleur ou mieux à 2 h ; à défaut « a soulagé »), la douleur revient dans les 48 h
const medWorked=m=>m.at2h?m.at2h!=="pareil":m.eff==="oui"||m.eff==="un peu";
function recurrences(entries,from,to){
  const out=[];Object.values(entries).filter(e=>e.migraine&&e.date>=from&&e.date<=to).forEach(e=>{
    const ok=medsOf(e).filter(medWorked);if(!ok.length)return;
    const t0=parse(e.date).getTime()+((toMin(ok[0].time)??toMin(e.start))??720)*6e4;let back=null;
    for(let i=1;i<=2&&!back;i++){const x=entries[ymd(addDays(parse(e.date),i))];if(x&&x.migraine&&parse(x.date).getTime()+(toMin(x.start)??0)*6e4-t0<=48*3600e3)back=x.date}
    out.push({date:e.date,names:ok.map(m=>m.name.trim()),back});
  });return out;
}
const toMin=t=>{if(!t)return null;const[h,m]=t.split(":").map(Number);return h*60+m};
// Moment de début des crises
const SLOTS=[["Nuit","0 - 5 h",0,300],["Matin","5 - 12 h",300,720],["Midi","12 - 14 h",720,840],["Après-midi","14 - 18 h",840,1080],["Soir","18 - 24 h",1080,1440]];
function summarize(ents){
  const mig=ents.filter(e=>e.migraine),calm=ents.filter(e=>e.migraine===false);
  const meds={};mig.forEach(e=>medsOf(e).forEach(m=>{const k=m.name.trim();const o=meds[k]=meds[k]||{n:0,oui:0,"un peu":0,non:0,libre:0,mieux:0,pareil:0,h2:0};o.n++;if(m.eff)o[m.eff]++;if(m.at2h){o[m.at2h]++;o.h2++}}));
  const count=(arr)=>{const c={};arr.forEach(x=>c[x]=(c[x]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1])};
  // Aliments : fréquence les jours de mal comparée aux autres jours (un aliment mangé tous les jours ne ressort pas)
  const dayFoods=e=>new Set(tokens(e.breakfast).concat(tokens(e.lunch),tokens(e.dinner)));
  const fm={},fc={};mig.forEach(e=>dayFoods(e).forEach(t=>fm[t]=(fm[t]||0)+1));calm.forEach(e=>dayFoods(e).forEach(t=>fc[t]=(fc[t]||0)+1));
  const M=mig.filter(e=>dayFoods(e).size).length,Cn=calm.filter(e=>dayFoods(e).size).length;
  const foodsCmp=ents.length>=MIN_DAYS&&M>=MIN_SIDE&&Cn>=MIN_SIDE?Object.keys(fm).map(t=>({t,m:fm[t],M,o:fc[t]||0,O:Cn})).map(x=>Object.assign(x,{rm:x.m/x.M,ro:x.o/x.O}))
    .filter(x=>x.m>=3&&x.rm-x.ro>=.25&&(x.ro===0||x.rm/x.ro>=1.5)).sort((a,b)=>(b.rm-b.ro)-(a.rm-a.ro)).slice(0,3):[];
  // Heures de début et délai de prise du médicament
  const starts=mig.map(e=>toMin(e.start)).filter(v=>v!=null);
  const slots=SLOTS.map(([lab,range,a,b])=>({lab,range,n:starts.filter(v=>v>=a&&v<b).length}));
  const delays=[];mig.forEach(e=>{const st=toMin(e.start);if(st==null)return;medsOf(e).forEach(m=>{const t=toMin(m.time);if(t==null)return;const d=t-st;if(d>=0&&d<=720)delays.push(d)})});
  // Jour de la semaine
  const wd=Array.from({length:7},(_,i)=>{const g=ents.filter(e=>parse(e.date).getDay()===i);return{i,n:g.length,m:g.filter(e=>e.migraine).length}});
  const ich=mig.map(ichd).filter(x=>x&&x.known);
  return{n:ents.length,mig,avgI:avg(mig.map(e=>e.intensity)),hours:mig.reduce((s,e)=>s+(+e.duration||0),0),
    durs:mig.filter(e=>e.duration!=="").map(e=>+e.duration),sleep:avg(ents.filter(e=>e.sleep!=="").map(e=>+e.sleep)),hasSleep:ents.some(e=>e.sleep!==""),
    meds,medDays:mig.filter(hasMed).length,triDays:mig.filter(hasTriptan).length,zones:count(mig.flatMap(e=>e.zones)),symptoms:count(mig.flatMap(e=>e.symptoms||[])),
    foods:count(mig.flatMap(e=>[...dayFoods(e)])).slice(0,6),foodsCmp,starts,slots,delays,wd,
    ichd:{n:ich.length,typical:ich.filter(x=>x.typical).length,aura:ich.filter(x=>x.aura).length},
    groups:compareGroups(ents,S.settings.custom)};
}
// Pistes fiables : écart net et assez de jours de chaque côté
function reliableFactors(s){
  if(s.n<MIN_DAYS)return[];
  return s.groups.map(g=>{const[a,b]=g.rows,hi=a.r>=b.r?a:b,lo=hi===a?b:a;return{g,hi,lo,gap:hi.r-lo.r}})
    .filter(x=>x.gap>=25&&x.hi.n>=MIN_SIDE&&x.lo.n>=MIN_SIDE).sort((x,y)=>y.gap-x.gap);
}
const hmTxt=min=>{const h=Math.floor(min/60),m=Math.round(min%60);return h?`${h} h${m?" "+String(m).padStart(2,"0"):""}`:`${m} min`};

/* =============== BILAN =============== */
let sMode="week",sAnchor=new Date(),showExample=false;
function exampleEntries(start,days){
  const out={},lunch=["pâtes, fromage","salade, poulet","pizza","sandwich, chocolat","riz, poisson","quiche","burger, frites"];
  for(let i=0;i<days;i++){const d=ymd(addDays(start,i));if(d>todayStr())break;const mig=[1,3,4,8,10,13,17,18,22,26].includes(i);
    out[d]={date:d,migraine:mig,intensity:mig?[6,4,8,5,7,3,6,9,5,7][i%10]:0,duration:mig?[2,4,6,3][i%4]:"",zones:mig?["Tempes"].concat(i%2?["Front"]:[]):[],symptoms:mig?["Sensible à la lumière"]:[],
      med:mig?"Doliprane 1 g":"",medEff:mig?(i%2?"oui":"un peu"):"",glasses:mig?(i%3?"non":"partiel"):"oui",lunch:lunch[i%7]+(mig&&i%2?", chocolat":""),
      sleep:mig?5.5+(i%2):7.5,water:mig?3:6,screen:mig?8:4,coffee:mig?3:1,stress:mig?"3":"1",period:i>=20&&i<=24?"oui":"non",custom:{}}}
  return out;
}
// Icônes des pistes du bilan (24 px, trait)
const TI=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const TICO={
  sleep:TI('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
  glasses:TI('<circle cx="6.5" cy="14" r="3.5"/><circle cx="17.5" cy="14" r="3.5"/><path d="M10 14h4M3 14l1.5-6M21 14l-1.5-6"/>'),
  stress:TI('<path d="M3 12h3l2-5 4 10 2-5h7"/>'),
  water:TI('<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/>'),
  screen:TI('<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M10 18.5h4"/>'),
  cup:TI('<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c0 1 1 1.5 1 2.5M12 3.5c0 1 1 1.5 1 2.5"/>'),
  cycle:TI('<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16"/>'),
  pill:TI('<rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-35 12 12)"/><path d="m9.2 8 5.6 8"/>'),
  storm:'<svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-lv3"/></svg>',
  clock:TI('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  cal:TI('<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  food:TI('<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M16 21V3c-2 1.5-3 4-3 7h3"/>'),
  ask:TI('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.5h.01"/>')};
// Période affichée : semaine, mois, ou 3 mois (ce que demandent les médecins)
function statsPeriod(){
  let start,end;
  if(sMode==="week"){start=mondayOf(sAnchor);end=addDays(start,6)}
  else if(sMode==="month"){start=new Date(sAnchor.getFullYear(),sAnchor.getMonth(),1);end=new Date(sAnchor.getFullYear(),sAnchor.getMonth()+1,0)}
  else{start=new Date(sAnchor.getFullYear(),sAnchor.getMonth()-2,1);end=new Date(sAnchor.getFullYear(),sAnchor.getMonth()+1,0)}
  const days=Math.round((end-start)/864e5)+1;
  return{start,end,days,dates:Array.from({length:days},(_,i)=>ymd(addDays(start,i)))};
}
// Titre de période, même règle pour les trois vues : mois en toutes lettres, année toujours présente.
// « 5 - 11 octobre 2026 » · « octobre 2026 » · « août - octobre 2026 ». Abréviations seulement si une semaine chevauche deux mois.
function periodTitle(start,end,mode){
  const M=d=>MONTHS[d.getMonth()],Y=d=>d.getFullYear(),sameY=Y(start)===Y(end);
  if(mode==="month")return`${M(start)} ${Y(start)}`;
  if(mode==="quarter")return sameY?`${M(start)} - ${M(end)} ${Y(end)}`:`${M(start)} ${Y(start)} - ${M(end)} ${Y(end)}`;
  if(start.getMonth()===end.getMonth()&&sameY)return`${start.getDate()} - ${end.getDate()} ${M(end)} ${Y(end)}`;
  const S=d=>MONTHS_S[d.getMonth()];
  return sameY?`${start.getDate()} ${S(start)} - ${end.getDate()} ${S(end)} ${Y(end)}`:`${start.getDate()} ${S(start)} ${Y(start)} - ${end.getDate()} ${S(end)} ${Y(end)}`;
}
function renderStats(){
  ["week","month","quarter"].forEach(m=>$("m-"+m).setAttribute("aria-pressed",sMode===m));
  const{start,end,days,dates}=statsPeriod(),wk=sMode==="week",qt=sMode==="quarter";
  $("pTitle").textContent=periodTitle(start,end,sMode);
  $("pNext").disabled=ymd(addDays(end,1))>todayStr();
  const real=Object.keys(S.entries).length>0;
  const src=(!real&&showExample)?exampleEntries(start,days):S.entries;
  const ents=dates.map(k=>src[k]).filter(Boolean);
  const body=$("statsBody");
  if(!ents.length){
    body.innerHTML=`<section class="card"><div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 20V11M12 20V5M19 20v-6"/></svg>
      <h2>${real?"Rien de noté sur cette période":"Ton bilan se remplira ici"}</h2>
      <p class="muted">${real?"Change de période avec les flèches, ou note les jours qui manquent.":"Note tes journées quelques jours de suite : tu verras ici la fréquence des maux de tête, leur force et ce qui semble les déclencher."}</p>
      ${real?"":`<button class="btn soft" type="button" id="exBtn">Voir un exemple de bilan</button>`}</div></section>`;
    const x=$("exBtn");if(x)x.onclick=()=>{showExample=true;renderStats()};return;
  }
  const s=summarize(ents);let h="";
  if(!real)h+=`<div class="examplebar"><span>Exemple avec des journées inventées</span><button class="btn soft sm" type="button" id="exOff">Masquer</button></div>`;
  const pl=n=>n>1?"s":"",nm=s.mig.length,ratio=s.n?nm/s.n:0,C=2*Math.PI*46;
  // 1. Résumé : anneau, phrase, comparaison avec la période d'avant
  const mood=!nm?(wk?"Aucun mal de tête cette semaine":qt?"Aucun mal de tête sur ces 3 mois":"Aucun mal de tête ce mois-ci")
    :ratio<.3?(wk?"Une semaine plutôt calme":qt?"Trois mois plutôt calmes":"Un mois plutôt calme")
    :ratio<.6?(wk?"Une semaine un peu chargée":qt?"Trois mois un peu chargés":"Un mois un peu chargé"):(wk?"Une semaine difficile":qt?"Trois mois difficiles":"Un mois difficile");
  const pStart=wk?addDays(start,-7):new Date(start.getFullYear(),start.getMonth()-(qt?3:1),1);
  const prev=[];for(let d=pStart;d<start;d=addDays(d,1)){const e=src[ymd(d)];if(e)prev.push(e)}
  const dm=nm-prev.filter(e=>e.migraine).length,per=wk?"la semaine d'avant":qt?"les 3 mois d'avant":"le mois d'avant";
  const arrow=d=>`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const chip=!prev.length?"":dm>0?`<span class="chip up">${arrow("M8 13V3M3.5 7.5 8 3l4.5 4.5")}${dm} jour${pl(dm)} de plus que ${per}</span>`
    :dm<0?`<span class="chip down">${arrow("M8 3v10M3.5 8.5 8 13l4.5-4.5")}${-dm} jour${pl(-dm)} de moins que ${per}</span>`:`<span class="chip">Autant que ${per}</span>`;
  const stat=(on,v,u,k,off,extra)=>on?`<div class="st"><div class="v">${v}<small>${u}</small></div>${extra||""}<div class="k">${k}</div></div>`:`<div class="st off"><div class="v">-</div><div class="k">${off}</div></div>`;
  const meter=`<div class="meter" aria-hidden="true">${Array.from({length:10},(_,i)=>`<i${i<Math.round(s.avgI)?' class="on"':""}></i>`).join("")}</div>`;
  h+=`<section class="card" aria-label="Résumé de la période">
    <div class="sum">
      <div class="ring" role="img" aria-label="${nm} jour${pl(nm)} avec mal de tête sur ${s.n} noté${pl(s.n)}">
        <svg viewBox="0 0 116 116" aria-hidden="true"><circle class="trk" cx="58" cy="58" r="46"/>${nm?`<circle class="arc" cx="58" cy="58" r="46" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-ratio)).toFixed(1)}"/>`:""}</svg>
        <div class="c" aria-hidden="true"><b>${nm}</b><span>sur ${s.n} noté${pl(s.n)}</span></div>
      </div>
      <div class="sumtxt"><h2>${mood}</h2><p class="muted small">${nm} jour${pl(nm)} avec mal de tête sur ${s.n} jour${pl(s.n)} noté${pl(s.n)}.</p>${chip}</div>
    </div>
    <div class="stats3">
      ${stat(nm,f1(s.avgI),"/10","force moyenne","pas de crise",meter)}
      ${stat(s.durs.length,f1(s.hours)," h","de douleur","durée non notée")}
      ${stat(s.hasSleep,f1(s.sleep)," h","de sommeil / nuit","sommeil non noté")}
    </div></section>`;
  // 2. En bref : la réponse d'abord, dite simplement
  const tips=[],jours=(m,n)=>m===0?`aucun jour sur ${n}`:m===n?`tous les jours (${n} sur ${n})`:`${m} jour${pl(m)} sur ${n}`;
  const mpm=qt?Math.round(s.medDays/3):s.medDays,tpm=qt?Math.round(s.triDays/3):s.triDays;
  const mw=wk?null:medWarn(mpm,tpm,qt?"par mois en moyenne":"ce mois-ci");
  if(mw)tips.push({ico:"pill",warn:mw.lvl>1,t:mw.t+".",d:mw.s});
  else if(wk&&s.medDays>=3)tips.push({ico:"pill",t:`Tu as pris un médicament ${s.medDays} jours cette semaine.`,d:"Parles-en à ton médecin à ta prochaine visite."});
  // 15 jours ou plus par mois, 3 mois de suite : le premier chiffre que demande un neurologue
  const cf=chronicFlag(src,new Date());
  if(cf)tips.unshift({ico:"cal",warn:true,t:`${CHRONIC_DAYS} jours ou plus de mal de tête par mois, 3 mois de suite.`,d:`${cf.map(x=>`${MONTHS[x.m]} : ${x.mig} jours`).join(", ")}. C'est le seuil où un médecin parle de céphalée chronique : parles-en à ton prochain rendez-vous.`});
  const fac=reliableFactors(s).slice(0,3);
  fac.forEach(({g,hi,lo})=>tips.push({ico:g.ico,weak:isWeak(hi.n,lo.n),t:`Tu as plus souvent mal quand ${hi.when}.`,d:`Mal de tête ${jours(hi.m,hi.n)} dans ce cas, contre ${jours(lo.m,lo.n)} les autres jours.`}));
  const mm=wk?null:menstrual(src,ymd(end),qt?6:3);
  if(mm&&mm.cycles.length>=2&&mm.hits>=2&&mm.hits/mm.cycles.length>=2/3)tips.push({ico:"cycle",weak:mm.cycles.length<3||isWeak(mm.win.n,mm.out.n),t:"Tes crises tombent souvent autour des règles.",d:`Une crise entre 2 jours avant et 3 jours après le début des règles : ${mm.hits} cycle${pl(mm.hits)} sur ${mm.cycles.length}.`});
  const rc=recurrences(src,ymd(start),ymd(end)),rcb=rc.filter(x=>x.back).length;
  if(rcb>=2&&rcb/rc.length>=1/3)tips.push({ico:"pill",weak:rc.length<MIN_STRONG,t:"La douleur revient souvent après un médicament qui a marché.",d:`Revenue dans les 48 h ${rcb} fois sur ${rc.length}. À signaler au médecin : cela peut changer le traitement.`});
  const timed=s.starts.length,topSlot=s.slots.reduce((a,b)=>b.n>a.n?b:a);
  if(timed>=3&&topSlot.n/timed>=.5)tips.push({ico:"clock",t:`Tes crises commencent surtout ${topSlot.lab==="Nuit"?"la nuit":topSlot.lab==="Matin"?"le matin":topSlot.lab==="Midi"?"vers midi":topSlot.lab==="Soir"?"le soir":"l'après-midi"} (${topSlot.range}).`,d:`${topSlot.n} crise${pl(topSlot.n)} sur ${timed} dont l'heure est notée.`});
  if(s.n>=21){const others=w=>s.wd.filter(x=>x.i!==w.i&&x.n),rate=x=>x.n?x.m/x.n:0;
    const best=s.wd.filter(x=>x.n>=4&&x.m>=3).map(x=>{const o=others(x),om=o.reduce((a,y)=>a+y.m,0),on=o.reduce((a,y)=>a+y.n,0);return{x,gap:rate(x)-(on?om/on:0),om,on}}).filter(y=>y.gap>=.3).sort((a,b)=>b.gap-a.gap)[0];
    if(best)tips.push({ico:"cal",t:`Tu as plus souvent mal le ${DAYS[best.x.i]}.`,d:`Mal de tête ${jours(best.x.m,best.x.n)} ce jour-là, contre ${jours(best.om,best.on)} les autres jours.`})}
  if(s.mig.length){const w=s.mig.reduce((a,b)=>b.intensity>a.intensity?b:a);tips.push({ico:"storm",t:`Ta crise la plus forte : ${dayLong(w.date)}, ${w.intensity} sur 10.`,d:w.duration!==""?`Elle a duré ${f1(w.duration)} h.`:""})}
  let wait="";
  if(s.n<MIN_DAYS){const left=MIN_DAYS-s.n;wait=`<div class="wait"><p><b>Encore ${left} jour${pl(left)} à noter</b> sur cette période pour voir tes pistes.</p><div class="track" role="img" aria-label="${s.n} jours notés sur ${MIN_DAYS}"><div class="fill" style="width:${s.n/MIN_DAYS*100}%"></div></div></div>`}
  else if(!fac.length)tips.push({ico:"ask",t:"Rien ne ressort encore de tes habitudes.",d:"Continue à noter sommeil, stress, eau et écrans : les pistes apparaîtront ici."});
  h+=`<section class="card"><h2>En bref</h2>${tips.length?`<ul class="tips">${tips.map(x=>`<li class="tip${x.warn?" warn":""}"><span class="tico" aria-hidden="true">${TICO[x.ico]||TICO.ask}</span><div><b>${esc(x.t)}</b>${x.d?`<span>${esc(x.d)}</span>`:""}${x.weak?weakTag:""}</div></li>`).join("")}</ul>`:""}${wait}
    <p class="hint">Ce sont des pistes, pas un diagnostic. Plus tu notes de jours, plus elles sont fiables.</p></section>`;
  // 3. Jour par jour : la force de chaque crise dans sa bande (léger / moyen / fort), les médicaments en dessous.
  // Sur 3 mois : une barre par semaine, le nombre de jours avec mal (fort en bas, puis moyen, puis léger).
  const tday=todayStr(),lv=e=>e.intensity<=3?1:e.intensity<=6?2:3,ti=wk?"":' tabindex="-1"';
  const cnt=[1,2,3].map(l=>s.mig.filter(e=>lv(e)===l).length);
  const tally=`<div class="tally">${nm?`<span>${nm} jour${pl(nm)} avec mal :</span>`:"<span>Aucun jour avec mal</span>"}${[[3,"fort"],[2,"moyen"],[1,"léger"]].filter(([l])=>cnt[l-1]).map(([l,w])=>`<span><i class="sw${l}" aria-hidden="true"></i>${cnt[l-1]} ${w}${pl(cnt[l-1])}</span>`).join("")}${s.medDays?`<span><i class="cap" aria-hidden="true"></i>${s.medDays} avec médicament</span>`:""}</div>`;
  if(qt){
    const weeks=[];for(let d=mondayOf(start);d<=end;d=addDays(d,7)){const w=[];for(let k=0;k<7;k++){const x=addDays(d,k),kk=ymd(x);if(x>=start&&x<=end)w.push(src[kk]||null)}weeks.push({d,w})}
    h+=`<section class="card"><div class="rowhead"><h2>Semaine par semaine</h2></div>${tally}
      <div class="dchart weeks" role="group" aria-label="Jours avec mal de tête, semaine par semaine">
      <div class="yl" aria-hidden="true"><span class="f3" style="align-items:flex-start">7 j</span><span class="f4"></span><span class="f3" style="align-items:flex-end">0</span></div><div class="zones" aria-hidden="true"></div>
      <div class="cols">${weeks.map(({d,w})=>{const m=w.filter(e=>e&&e.migraine),c=[3,2,1].map(l=>m.filter(e=>lv(e)===l).length),n=w.filter(Boolean).length;
        const lab=`Semaine du ${dayLong(ymd(d))} : ${m.length} jour${pl(m.length)} avec mal sur ${n} noté${pl(n)}`;
        return`<div role="img" aria-label="${esc(lab)}">${m.length?`<span class="v">${m.length}</span>`:n?`<div class="ok"></div>`:`<div class="no"></div>`}${m.length?`<div class="stk" style="height:${m.length/7*100}%">${c.map((x,i)=>x?`<i class="b lv${3-i}" style="flex:${x}"></i>`:"").join("")}</div>`:""}</div>`}).join("")}</div>
      <div class="xr" aria-hidden="true">${weeks.map(({d},i)=>`<span>${i%2?"":`${d.getDate()}<small>${MONTHS_S[d.getMonth()]}</small>`}</span>`).join("")}</div></div>
      <div class="dlegend" aria-hidden="true"><span><i class="sw3"></i>fort</span><span><i class="sw2"></i>moyen</span><span><i class="sw1"></i>léger</span><span><i class="ok"></i>semaine sans mal</span><span><i class="no"></i>pas notée</span></div></section>`;
  }else{
    const dense=!wk;
    h+=`<section class="card"><div class="rowhead"><h2>Jour par jour</h2></div>${tally}
      <div class="dchart${dense?" dense":""}" role="group" aria-label="Force du mal de tête jour par jour. Touche un jour pour le voir.">
      <div class="yl" aria-hidden="true"><span class="f4">fort</span><span class="f3">moyen</span><span class="f3">léger</span></div>
      <div class="zones" aria-hidden="true"><i class="z3 f4"></i><i class="z2 f3"></i><i class="z1 f3"></i></div>
      <div class="cols">${dates.map(k=>{const e=src[k],c=k===tday?" now":"";
        if(!e)return`<div class="${c}" aria-hidden="true">${k<=tday?'<div class="no"></div>':""}</div>`;
        const ms=medsOf(e),lab=`${dayLong(k)} : ${e.migraine?`mal de tête ${e.intensity} sur 10`:"sans mal de tête"}${ms.length?`, ${ms.map(m=>m.name).join(", ")}`:""}`;
        return`<button type="button" class="${c}" data-openday="${k}" aria-label="${esc(lab)}"${ti}>${e.migraine?`${wk?`<span class="v">${e.intensity}</span>`:""}<div class="b lv${lv(e)}" style="height:${e.intensity*10}%"></div>`:`<div class="ok"></div>`}</button>`}).join("")}</div>
      <div class="xr" aria-hidden="true">${dates.map((k,i)=>{const d=parse(k);return`<span${k===tday?' class="now"':""}>${wk?`${DS[i]}<small>${d.getDate()}</small>`:(d.getDay()===1||i===0)?d.getDate():""}</span>`}).join("")}</div>
      <div class="mr" aria-hidden="true">${dates.map(k=>{const e=src[k];return`<span>${e&&e.migraine&&hasMed(e)?'<i class="cap"></i>':""}</span>`}).join("")}</div></div>
      <div class="dlegend" aria-hidden="true"><span><i class="ok"></i>sans mal de tête</span><span><i class="no"></i>pas noté</span><span><i class="cap"></i>médicament pris</span>${wk?"":"<span>chiffres : les lundis</span>"}</div></section>`;
  }
  // 3 bis. Jours avec mal de tête par mois, avec le seuil de 15 jours
  if(!wk){const mc=monthCounts(src,end,6).filter(x=>x.noted||x.mig),top=Math.max(20,...mc.map(x=>x.mig));
    if(mc.length)h+=`<section class="card"><div class="rowhead"><h2>Jours de mal par mois</h2></div>
      <p class="hint">À ${CHRONIC_DAYS} jours ou plus par mois, plusieurs mois de suite, un médecin parle de céphalée chronique.</p>
      <div class="mbars" role="img" aria-label="${esc(mc.map(x=>`${MONTHS[x.m]} : ${x.mig} jours avec mal sur ${x.noted} notés`).join(", "))}">
        <div class="line" style="bottom:calc((100% - 8px) * ${(CHRONIC_DAYS/top).toFixed(4)})"><span>${CHRONIC_DAYS} j</span></div>
        ${mc.map(x=>`<div class="mb"><i class="${x.mig>=CHRONIC_DAYS?"hi":""}" style="height:${Math.max(x.mig?3:0,x.mig/top*100)}%"></i></div>`).join("")}</div>
      <div class="mxl" aria-hidden="true">${mc.map(x=>`<span><b class="${x.mig>=CHRONIC_DAYS?"hi":""}">${x.mig} j</b>${MONTHS_S[x.m]}<small>${x.noted}/${x.days} notés</small></span>`).join("")}</div></section>`}
  // 4. Moment des crises
  if(timed)h+=`<section class="card"><h2>Moment des crises</h2><p class="hint">Heure de début des crises dont l'heure est notée (${timed}).</p><div class="cmp">`
    +s.slots.map(x=>`<div class="cmprow"><span>${x.lab} <span class="muted small">${x.range}</span></span><div class="track" aria-hidden="true"><div class="fill" style="width:${x.n/timed*100}%"></div></div><span class="pct">${x.n}</span></div>`).join("")+`</div></section>`;
  // 5. Situation par situation (les situations sans écart net sont repliées)
  const cmpHtml=g=>`<div class="cmp"><h3>${esc(g.title)}</h3>${g.rows.map(r=>`<div class="cmprow"><span>${esc(r.lab)}</span><div class="track" aria-hidden="true"><div class="fill" style="width:${r.r}%"></div></div><span class="pct">${r.m} sur ${r.n}</span></div>`).join("")}${isWeak(g.rows[0].n,g.rows[1].n)?weakTag:""}</div>`;
  const clear=reliableFactors(s).map(x=>x.g),flat=s.groups.filter(g=>!clear.includes(g));
  if(s.groups.length)h+=`<section class="card"><h2>Situation par situation</h2><p class="hint">Pour chaque situation : combien de jours avec mal de tête, sur les jours notés.</p>`
    +(clear.length?clear.map(cmpHtml).join(""):`<p class="muted small">${s.n<MIN_DAYS?"Les pistes apparaîtront à partir de 10 jours notés.":"Aucune situation ne change nettement les choses pour l'instant."}</p>`)
    +(flat.length?`<details class="more"><summary>Voir les autres situations (${flat.length})</summary>${flat.map(cmpHtml).join("")}</details>`:"")+`</section>`;
  // 5 bis. Autour des règles (fenêtre du 2e jour avant au 3e jour après le 1er jour)
  if(mm){const hasDeb=Object.values(src).some(e=>e.period==="debut"),row=(lab,x)=>`<div class="cmprow"><span>${lab}</span><div class="track" aria-hidden="true"><div class="fill" style="width:${x.n?x.m/x.n*100:0}%"></div></div><span class="pct">${x.m} sur ${x.n}</span></div>`;
    h+=`<section class="card"><h2>Autour des règles</h2>
      <p class="insight">Sur tes ${mm.cycles.length} dernier${pl(mm.cycles.length)} cycle${pl(mm.cycles.length)}, crise entre 2 jours avant et 3 jours après le début des règles : <b>${mm.hits} fois sur ${mm.cycles.length}</b>.</p>
      <div class="cmp"><h3>Jours avec mal de tête</h3>${row("Autour des règles",mm.win)}${row("Le reste du cycle",mm.out)}${isWeak(mm.win.n,mm.out.n)?weakTag:""}</div>
      <p class="hint">On parle de migraine menstruelle quand les crises tombent dans cette fenêtre dans au moins 2 cycles sur 3. C'est au médecin de conclure.${hasDeb?"":" Note le « 1er jour des règles » pour plus de précision : ici, il est déduit des jours « Règles »."}</p></section>`}
  // 6. Aliments à surveiller : comparés aux autres jours
  if(s.foods.length){
    const fx=x=>x.o===0?`seulement les jours de mal`:`plus souvent les jours de mal`;
    h+=`<section class="card"><h2>Aliments à surveiller</h2><p class="hint">Un aliment ressort s'il revient nettement plus souvent les jours de mal que les autres jours.</p>`
      +(s.foodsCmp.length?`<ul class="tips">${s.foodsCmp.map(x=>`<li class="tip"><span class="tico" aria-hidden="true">${TICO.food}</span><div><b>${esc(x.t.charAt(0).toUpperCase()+x.t.slice(1))} : ${fx(x)}</b><span>${x.m} jour${pl(x.m)} de mal sur ${x.M}, contre ${x.o} jour${pl(x.o)} sur ${x.O} sans mal.</span>${isWeak(x.M,x.O)?weakTag:""}</div></li>`).join("")}</ul>`
        :`<p class="muted small">${s.n<MIN_DAYS?"Les aliments à surveiller apparaîtront à partir de 10 jours notés.":"Aucun aliment ne ressort pour l'instant."}</p>`)+`</section>`;
  }
  // 7. Où et comment
  const li=a=>a.map(([t,n])=>`<li><span>${esc(t)}</span><span>${n} fois</span></li>`).join("");
  const ic=s.ichd,icHtml=ic.n?`<div class="insight"><b>${ic.typical} crise${pl(ic.typical)} sur ${ic.n}</b> décrite${pl(ic.n)} ${ic.typical>1?"ont":"a"} les signes de la migraine (classification ICHD-3)${ic.aura?`, dont ${ic.aura} avec aura`:""}.</div>
    <p class="hint">Au moins 2 caractères de la douleur (d'un seul côté, qui bat, moyenne à forte, pire en bougeant), plus des nausées ou une gêne à la lumière et au bruit, sur 4 à 72 h. C'est au médecin de conclure.${s.mig.length>ic.n?` ${s.mig.length-ic.n} crise${pl(s.mig.length-ic.n)} sans signes notés.`:""}</p>`:"";
  if(s.zones.length||s.symptoms.length)h+=`<section class="card"><h2>Où et comment</h2>${icHtml}${s.zones.length?`<h3>Zones</h3><ul class="tl">${li(s.zones)}</ul>`:""}${s.symptoms.length?`<h3>Signes</h3><ul class="tl">${li(s.symptoms)}</ul>`:""}</section>`;
  // 8. Médicaments : efficacité de chacun, jauge vers le seuil d'alerte, délai de prise
  const mk=Object.entries(s.meds).sort((a,b)=>b[1].n-a[1].n);
  if(mk.length){
    const gauge=(v,max,lab)=>`<div class="gauge"><div class="gl"><span>${lab}</span><b>${v} / ${max} j</b></div><div class="track" role="img" aria-label="${esc(lab)} : ${v} jours, alerte à ${max}"><div class="fill${v>=max?" over":v>=max*.66?" near":""}" style="width:${Math.min(v/max,1)*100}%"></div></div></div>`;
    h+=`<section class="card"><h2>Médicaments</h2>`
      +(wk?"":`<div class="gauges">${gauge(mpm,15,qt?"Jours avec médicament, par mois":"Jours avec médicament ce mois-ci")}${s.triDays?gauge(tpm,10,qt?"Dont triptan, par mois":"Dont triptan ce mois-ci"):""}<p class="hint">Au-delà, les médicaments peuvent eux-mêmes entretenir les maux de tête.</p></div>`)
      +`<ul class="medl">${mk.map(([k,v])=>{if(v.h2)return`<li><div class="ml"><b>${esc(k)}</b><span>${v.n} prise${pl(v.n)} · 2 h après : plus de douleur ${v.libre} fois sur ${v.h2}, mieux ${v.mieux}, pareil ${v.pareil}${v.n>v.h2?` (${v.n-v.h2} sans réponse)`:""}</span></div><div class="track eff" aria-hidden="true"><div class="fill" style="width:${v.libre/v.h2*100}%"></div><div class="fill soft" style="width:${v.mieux/v.h2*100}%"></div></div></li>`;
        const u=v["un peu"];return`<li><div class="ml"><b>${esc(k)}</b><span>${v.n} prise${pl(v.n)} · a soulagé ${v.oui} fois sur ${v.n}${u?`, un peu ${u} fois`:""}</span></div><div class="track eff" aria-hidden="true"><div class="fill" style="width:${v.oui/v.n*100}%"></div><div class="fill soft" style="width:${u/v.n*100}%"></div></div></li>`}).join("")}</ul>`
      +(rc.length?`<p class="insight">Après un médicament qui a marché, la douleur est revenue dans les 48 h <b>${rcb} fois sur ${rc.length}</b>.</p>`:"")
      +(s.delays.length>=2?`<p class="insight">En moyenne, tu prends ton médicament <b>${hmTxt(avg(s.delays))}</b> après le début de la crise.${avg(s.delays)>=120?" Un médicament pris tôt soulage souvent mieux : à voir avec ton médecin.":""}</p>`:"")+`</section>`;
  }
  // 9. Retentissement : questionnaire MIDAS tous les 3 mois
  const ms=S.settings.midas||[],last=ms[ms.length-1];
  h+=`<section class="card midas"><h2>Gêne au quotidien</h2>`
    +(last?`<div class="score"><b>${last.score}</b><span><strong>${esc(midasGrade(last.score).t)}</strong> (grade ${midasGrade(last.score).g}) · ${esc(dayLong(last.date))}</span></div>`
      +(ms.length>1?`<div class="mhist" role="img" aria-label="Scores MIDAS : ${ms.map(m=>`${dayFull(m.date)} ${m.score}`).join(", ")}">${ms.slice(-8).map(m=>`<i style="height:${Math.max(4,Math.min(m.score,40)/40*100)}%"></i>`).join("")}</div>`:"")
      +`<p class="hint">${daysSince(last.date)>=90?"C'est le moment de refaire le questionnaire.":`Prochain questionnaire dans ${90-daysSince(last.date)} jours.`}</p>`
      :`<p class="muted">Le questionnaire MIDAS mesure en 5 questions combien tes maux de tête t'ont gêné dans ta vie ces 3 derniers mois. Les médecins l'utilisent pour suivre l'évolution.</p>`)
    +`<button class="btn soft block" type="button" id="midasBtn">${last?"Refaire le questionnaire":"Répondre au questionnaire (2 min)"}</button></section>`;
  // 10. Vers le rapport pour le médecin
  h+=`<button class="btn line block" type="button" id="rdvBtn">Préparer mon rendez-vous (rapport PDF)</button>`;
  body.innerHTML=h;
  const off=$("exOff");if(off)off.onclick=()=>{showExample=false;renderStats()};
  $("midasBtn").onclick=openMidas;
  $("rdvBtn").onclick=()=>{const r=$("r-range");if(r){r.value=qt?"3":"1";rangeTouched=true}show("doc");const b=$("pdfBtn");if(b){b.scrollIntoView({block:"center"});b.focus()}};
}
// Questionnaire MIDAS
function openMidas(){
  $("midasForm").innerHTML=MIDAS_Q.map((q,i)=>`<div class="mq"><label for="mq-${i}">${i+1}. ${esc(q)}</label><input type="number" id="mq-${i}" inputmode="numeric" min="0" max="92" step="1" placeholder="0"></div>`).join("");
  $("midasErr").hidden=true;$("midasBg").hidden=false;$("midasCard").hidden=false;$("mq-0").focus();
}
function closeMidas(){$("midasBg").hidden=true;$("midasCard").hidden=true;const b=$("midasBtn");b&&b.focus()}
$("midasX").addEventListener("click",closeMidas);$("midasCancel").addEventListener("click",closeMidas);$("midasBg").addEventListener("click",closeMidas);
$("midasSave").addEventListener("click",async()=>{
  const a=MIDAS_Q.map((_,i)=>{const v=$("mq-"+i).value.trim();return v===""?0:Number(v)});
  if(!a.every(v=>Number.isInteger(v)&&v>=0&&v<=92)){$("midasErr").hidden=false;return}
  const m={date:todayStr(),a,score:midasScore(a)};
  S.settings.midas=(S.settings.midas||[]).filter(x=>x.date!==m.date).concat(m).sort((x,y)=>x.date.localeCompare(y.date));
  await putSettings();closeMidas();renderStats();toast(`Score MIDAS : ${m.score} (${midasGrade(m.score).t})`);
});
// Un toucher sur un jour du graphique l'ouvre dans le calendrier
$("statsBody").addEventListener("click",ev=>{const b=ev.target.closest("[data-openday]");if(!b||!real_())return;const k=b.dataset.openday,d=parse(k);
  calM=new Date(d.getFullYear(),d.getMonth(),1);calSel=k;show("cal");const x=$("dayCard").querySelector('[data-act="close"]');x&&x.focus()});
const real_=()=>Object.keys(S.entries).length>0;
const stepMonths=n=>new Date(sAnchor.getFullYear(),sAnchor.getMonth()+n,1);
$("m-week").addEventListener("click",()=>{sMode="week";renderStats()});
$("m-month").addEventListener("click",()=>{sMode="month";renderStats()});
$("m-quarter").addEventListener("click",()=>{sMode="quarter";renderStats()});
$("pPrev").addEventListener("click",()=>{sAnchor=sMode==="week"?addDays(sAnchor,-7):stepMonths(sMode==="quarter"?-3:-1);renderStats()});
$("pNext").addEventListener("click",()=>{sAnchor=sMode==="week"?addDays(sAnchor,7):stepMonths(sMode==="quarter"?3:1);renderStats()});

/* =============== MES DONNÉES =============== */
$("gapList").addEventListener("change",async ev=>{const sel=ev.target.closest("select[data-med]");if(!sel)return;
  const g=Object.assign({},S.settings.medGaps||{}),v=+sel.value;if(v)g[sel.dataset.med]=v;else delete g[sel.dataset.med];
  S.settings.medGaps=g;await putSettings();scheduleDoseReminders();toast(v?"Rappel de prise enregistré":"Rappel de prise retiré")});
// Textes fixes de la page qui suivent les réglages « Les mots pour toi » et « Le ton »
function applyWords(){
  $("rmText").textContent=T("rmText");$("f-notes").placeholder=T("notesPh");
  document.querySelectorAll('input[name="stress"]').forEach(i=>{const sp=i.nextElementSibling;if(sp)sp.textContent=stLabel(i.value)});
}
function renderProfile(){
  if(document.activeElement!==$("s-pet"))$("s-pet").value=S.settings.pet||"";
  document.querySelectorAll("[data-gender]").forEach(b=>b.setAttribute("aria-pressed",String((S.settings.gender||"")===b.dataset.gender)));
  document.querySelectorAll("[data-tone]").forEach(b=>b.setAttribute("aria-pressed",String((S.settings.tone||"")===b.dataset.tone)));
  $("genderEx").textContent=`Par exemple : « ${stLabel("4")} », « ${symLabel("Sensible à la lumière")} ».`;
  $("tonePreview").textContent=T("remind");
}
async function setProfile(k,v){S.settings[k]=v;await putSettings();renderProfile();renderPreset();applyWords();scheduleReminders()}
document.querySelectorAll("[data-gender]").forEach(b=>b.addEventListener("click",()=>setProfile("gender",b.dataset.gender)));
document.querySelectorAll("[data-tone]").forEach(b=>b.addEventListener("click",()=>setProfile("tone",b.dataset.tone)));
let petT;$("s-pet").addEventListener("input",()=>{clearTimeout(petT);petT=setTimeout(()=>setProfile("pet",$("s-pet").value.trim().slice(0,40)),600)});
$("settingsBack").addEventListener("click",()=>show("home"));
function renderPreset(){
  const p=S.settings.dayPreset||{},o=(v,l)=>({v:String(v),l}),num=(a,b,st,u)=>{const r=[];for(let x=a;x<=b+1e-9;x+=st)r.push(o(x,f1(x)+u));return r};
  const F=[["glasses","Lunettes",[o("oui","Toute la journée"),o("partiel","Un moment"),o("non","Pas du tout")]],
    ["sleep","Sommeil",num(4,11,.5," h")],["water","Verres d'eau",num(0,15,1,"")],["coffee","Cafés ou thés",num(0,10,1,"")],
    ["screen","Écrans",num(0,14,1," h")],["stress","Stress",["1","2","3","4"].map(v=>o(v,stLabel(v)))],["period","Cycle",[o("non","Hors règles"),o("avant","Juste avant"),o("oui","Règles")]]];
  const sel=(id,lab,opts,val,wide)=>`<div class="field${wide?" wide":""}"><label class="flabel" for="${id}">${esc(lab)}</label><select id="${id}"><option value="">-</option>${opts.map(x=>`<option value="${esc(x.v)}"${String(val??"")===x.v?" selected":""}>${esc(x.l)}</option>`).join("")}</select></div>`;
  let h=F.map(([k,l,opts])=>sel("pt-"+k,l,opts,p[k],k==="glasses"||k==="period")).join("");
  h+=(S.settings.custom||[]).filter(q=>q.type==="bool").map(q=>sel("ptq-"+q.id,q.label,[o("oui","Oui"),o("non","Non")],(p.custom||{})[q.id],true)).join("");
  h+=[["breakfast","Petit-déjeuner"],["lunch","À midi"],["dinner","Le soir"]].map(([k,l])=>`<div class="field wide"><label class="flabel" for="pt-${k}">${l}</label><input type="text" id="pt-${k}" maxlength="300" placeholder="- (change d'un jour à l'autre)" value="${esc(p[k]||"")}"></div>`).join("");
  if(!$("presetCard").contains(document.activeElement))$("ptFields").innerHTML=h;
  $("ptAuto").checked=!!S.settings.presetAuto;
  const n=presetCount();$("ptSum").textContent=n?`${n} réponse${n>1?"s":""} notée${n>1?"s":""} d'office avec « Ma tête va bien ».`:"Aucune réponse notée d'office pour l'instant.";
}
let ptT;
async function savePreset(){
  const p={custom:{}};
  PRESET_KEYS.forEach(k=>{const i=$("pt-"+k);const v=i?i.value.trim():"";p[k]=["sleep","water","coffee","screen"].includes(k)&&v!==""?Number(v):v});
  (S.settings.custom||[]).filter(q=>q.type==="bool").forEach(q=>{const i=$("ptq-"+q.id);if(i&&i.value)p.custom[q.id]=i.value});
  S.settings.dayPreset=cleanSettings({dayPreset:p}).dayPreset;await putSettings();
  const n=presetCount();$("ptSum").textContent=n?`${n} réponse${n>1?"s":""} notée${n>1?"s":""} d'office avec « Ma tête va bien ».`:"Aucune réponse notée d'office pour l'instant.";
}
$("ptFields").addEventListener("change",()=>savePreset().then(()=>toast("Journée type enregistrée")));
$("ptFields").addEventListener("input",ev=>{if(ev.target.tagName==="INPUT"){clearTimeout(ptT);ptT=setTimeout(savePreset,700)}});
$("ptAuto").addEventListener("change",async()=>{S.settings.presetAuto=$("ptAuto").checked;await putSettings();renderPreset()});
function renderData(){
  renderGaps();renderProfile();renderPreset();
  renderStatus();
  if(document.activeElement!==$("r-name"))$("r-name").value=S.settings.name||"";
  const rm=S.settings.reminder||{};$("rmOn").checked=!!rm.on;$("rmTime").value=rm.time||"21:00";$("rmTimeF").hidden=!rm.on;
  $("qList").innerHTML=(S.settings.custom||[]).length?S.settings.custom.map(q=>`<div class="qrow"><span>${esc(q.label)}<small>${q.type==="bool"?"Oui / Non":"Réponse écrite"}</small></span><button class="btn danger sm" type="button" data-q="${q.id}">Retirer</button></div>`).join(""):`<p class="hint">Aucune question perso pour l'instant.</p>`;
}
$("rmOn").addEventListener("change",async()=>{
  const on=$("rmOn").checked,ln=LN();$("rmErr").hidden=true;
  if(on){
    if(!ln){$("rmOn").checked=false;toast("Les rappels marchent seulement dans l'appli installée");return}
    let perm=await ln.checkPermissions().catch(()=>({display:"denied"}));
    if(perm.display!=="granted")perm=await ln.requestPermissions().catch(()=>({display:"denied"}));
    if(perm.display!=="granted"){$("rmOn").checked=false;$("rmErr").hidden=false;return}
  }
  S.settings.reminder={on,time:$("rmTime").value||"21:00"};await putSettings();
  $("rmTimeF").hidden=!on;await scheduleReminders();
  toast(on?`Rappel activé chaque soir à ${hm(S.settings.reminder.time)}`:"Rappel désactivé");
});
$("rmTime").addEventListener("change",async()=>{
  const t=$("rmTime").value;if(!t||!(S.settings.reminder||{}).on)return;
  S.settings.reminder.time=t;await putSettings();await scheduleReminders();toast(`Rappel déplacé à ${hm(t)}`);
});
let nameT;$("r-name").addEventListener("input",()=>{clearTimeout(nameT);nameT=setTimeout(()=>{S.settings.name=$("r-name").value.trim();putSettings();renderProfile()},800)});

/* =============== POUR MON MÉDECIN =============== */
// Période « depuis le dernier rendez-vous » (sinon : les 3 derniers mois)
function rdvFrom(now){const r=S.settings.rdv||{},t=ymd(now);return r.last&&r.last<=t?{from:r.last,since:true}:{from:ymd(new Date(now.getFullYear(),now.getMonth()-2,1)),since:false}}
function docSummary(entries,from,to){const ents=Object.values(entries).filter(e=>e.date>=from&&e.date<=to),mig=ents.filter(e=>e.migraine);
  return{n:ents.length,mig:mig.length,avgI:mig.length?avg(mig.map(e=>e.intensity)):null,medDays:mig.filter(hasMed).length,triDays:mig.filter(hasTriptan).length}}
let rangeTouched=false;
function renderDoc(){
  const r=S.settings.rdv||{},now=new Date(),t=ymd(now);
  if(document.activeElement!==$("rdvNext"))$("rdvNext").value=r.next||"";
  if(document.activeElement!==$("rdvLast"))$("rdvLast").value=r.last||"";
  $("rdvLast").max=t;$("rdvNext").min=t;
  $("rdvDone").hidden=!(r.next&&r.next<=t);
  const{from,since}=rdvFrom(now),s=docSummary(S.entries,from,t),pl=(n,w)=>`${n} ${w}${n>1?"s":""}`;
  const dn=r.next&&r.next>t?Math.round((parse(r.next)-parse(t))/864e5):null;
  $("rdvSince").textContent=(since?`Depuis le dernier rendez-vous (${dayLong(from)})`:`Depuis le ${dayLong(from)}`)+` : ${pl(s.n,"jour")} noté${s.n>1?"s":""}.`
    +(dn!=null?` Prochain rendez-vous dans ${pl(dn,"jour")}.`:"");
  $("rdvSum").innerHTML=[[s.mig,"jours avec mal"],[s.avgI==null?"-":f1(s.avgI),"force moyenne"],[s.medDays,s.triDays?`jours de médicament (${s.triDays} de triptan)`:"jours de médicament"]]
    .map(([v,k])=>`<div class="st"><span class="v">${esc(v)}</span><span class="k">${esc(k)}</span></div>`).join("");
  const q=S.settings.docQ||[];
  $("dqList").innerHTML=q.length?q.map(x=>`<div class="docq${x.done?" done":""}"><label><input type="checkbox" data-dq="${x.id}"${x.done?" checked":""}><span>${esc(x.t)}</span></label>`
    +`<button class="iconbtn" type="button" data-dqdel="${x.id}" aria-label="Retirer : ${esc(x.t)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>`).join("")
    :`<p class="hint">Note ici ce que tu veux demander, au fil des jours, pour ne rien oublier le jour J.</p>`;
  $("r-rdv").hidden=!since;if(!since&&$("r-range").value==="rdv")$("r-range").value="3";
  if(since&&!rangeTouched)$("r-range").value="rdv";
}
$("r-range").addEventListener("change",()=>{rangeTouched=true});
async function setRdv(k,v){if(v&&!/^\d{4}-\d{2}-\d{2}$/.test(v))return;if(k==="last"&&v>todayStr()){toast("Le dernier rendez-vous est déjà passé : choisis une date passée");renderDoc();return}
  S.settings.rdv=Object.assign({next:"",last:""},S.settings.rdv,{[k]:v||""});await putSettings();renderDoc()}
$("rdvNext").addEventListener("change",()=>setRdv("next",$("rdvNext").value));
$("rdvLast").addEventListener("change",()=>setRdv("last",$("rdvLast").value));
// Rendez-vous passé : il devient « le dernier », les questions cochées sont rangées
async function rdvDone(){const r=S.settings.rdv||{};if(!r.next)return false;
  S.settings.rdv={next:"",last:r.next<=todayStr()?r.next:todayStr()};S.settings.docQ=(S.settings.docQ||[]).filter(q=>!q.done);rangeTouched=false;
  await putSettings();renderDoc();toast("Rendez-vous noté. Le bilan repart de cette date.");return true}
$("rdvDone").addEventListener("click",rdvDone);
async function addDocQ(t){t=String(t||"").trim().slice(0,200);if(!t)return false;
  S.settings.docQ=(S.settings.docQ||[]).concat({id:"d"+Date.now().toString(36),t,done:false}).slice(-50);await putSettings();renderDoc();return true}
$("dqAdd").addEventListener("click",async()=>{if(await addDocQ($("dqNew").value)){$("dqNew").value="";$("dqNew").focus()}else{toast("Écris d'abord ta question");$("dqNew").focus()}});
$("dqNew").addEventListener("keydown",ev=>{if(ev.key==="Enter"){ev.preventDefault();$("dqAdd").click()}});
$("dqList").addEventListener("change",async ev=>{const i=ev.target.closest("[data-dq]");if(!i)return;
  S.settings.docQ=(S.settings.docQ||[]).map(q=>q.id===i.dataset.dq?Object.assign({},q,{done:i.checked}):q);await putSettings();renderDoc()});
$("dqList").addEventListener("click",async ev=>{const b=ev.target.closest("[data-dqdel]");if(!b)return;
  S.settings.docQ=(S.settings.docQ||[]).filter(q=>q.id!==b.dataset.dqdel);await putSettings();renderDoc();toast("Question retirée");$("dqNew").focus()});
$("q-add").addEventListener("click",()=>{const l=$("q-new").value.trim();if(!l){toast("Écris d'abord ta question");$("q-new").focus();return}
  S.settings.custom=(S.settings.custom||[]).concat({id:"q"+Date.now().toString(36),label:l,type:getRadio("qtype")||"bool"});
  $("q-new").value="";putSettings();renderData();toast("Question ajoutée")});
let qArm=null;
$("qList").addEventListener("click",ev=>{const b=ev.target.closest("[data-q]");if(!b)return;
  if(qArm!==b.dataset.q){qArm=b.dataset.q;b.textContent="Confirmer";return}
  S.settings.custom=S.settings.custom.filter(q=>q.id!==b.dataset.q);qArm=null;putSettings();renderData();toast("Question retirée")});

function periodEntries(){
  const v=$("r-range").value,now=new Date();let from;
  const all=Object.values(S.entries).sort((a,b)=>a.date<b.date?-1:1);
  if(v==="rdv")from=parse(rdvFrom(now).from);
  else if(v==="all")from=all.length?parse(all[0].date):now;
  else from=new Date(now.getFullYear(),now.getMonth()-(+v-1),1);
  const f=ymd(from),t=todayStr();
  return{from:f,to:t,ents:all.filter(e=>e.date>=f&&e.date<=t)};
}
const blobToBase64=b=>new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(",")[1]);r.onerror=ko;r.readAsDataURL(b)});
async function saveFile(filename,data){
  const Cap=window.Capacitor,P=Cap&&Cap.Plugins;
  if(Cap&&Cap.isNativePlatform&&Cap.isNativePlatform()&&P&&P.Filesystem&&P.Share){
    try{
      const bin=data instanceof Blob;
      const w=await P.Filesystem.writeFile(Object.assign({path:filename,directory:"CACHE",data:bin?await blobToBase64(data):data},bin?{}:{encoding:"utf8"}));
      await P.Share.share({title:filename,files:[w.uri],dialogTitle:"Enregistrer ou envoyer le fichier"});
      return true;
    }catch(e){toast(/cancel/i.test(String(e&&e.message))?"Partage annulé":"Le fichier n'a pas pu être partagé");return false}
  }
  // Ouverte dans un navigateur : téléchargement classique
  try{
    // Toujours binaire (PDF compris) : le navigateur enregistre le fichier, il ne l'ouvre jamais
    const url=URL.createObjectURL(new Blob([data],{type:"application/octet-stream"}));
    const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),5000);toast("Fichier téléchargé");return true;
  }catch(e){toast("Le fichier n'a pas pu être enregistré");return false}
}
const L1=s=>String(s??"").replace(/[‘’]/g,"'").replace(/[--]/g,"-").replace(/[^\x20-\x7E\xA0-\xFFŒœ€]/g,"").trim();
$("pdfBtn").addEventListener("click",async()=>{
  const{from,to,ents}=periodEntries();
  if(!ents.length){toast("Aucune journée notée sur cette période");return}
  if(!window.jspdf||!window.jspdf.jsPDF){toast("Le PDF n'a pas pu se préparer");return}
  const b=$("pdfBtn");b.disabled=true;
  try{
    const{jsPDF}=window.jspdf,doc=new jsPDF({unit:"mm",format:"a4"}),s=summarize(ents);
    const ink=[59,34,54],berry=[169,44,73],coral=[236,125,118],paper=[248,241,234],lineC=[232,214,205],W=doc.internal.pageSize.getWidth();
    doc.setFillColor(...ink);doc.rect(0,0,W,30,"F");doc.setFillColor(...coral);doc.rect(0,30,W,1.2,"F");
    doc.setFont("helvetica","bold");doc.setFontSize(18);doc.setTextColor(255,241,232);doc.text("Journal des maux de tête",14,15);
    doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(234,214,224);
    doc.text(L1(`${S.settings.name?S.settings.name+"   ·   ":""}Période : du ${dayFull(from)} au ${dayFull(to)}   ·   Édité le ${dayFull(todayStr())}`),14,23);
    let y=38;
    const title=(t,need)=>{if(y>(need?287-need:260)){doc.addPage();y=18}doc.setFont("helvetica","bold");doc.setFontSize(12);doc.setTextColor(...berry);doc.text(L1(t),14,y);y+=3};
    const table=(head,body,opts)=>{doc.autoTable(Object.assign({startY:y,head:[head.map(L1)],body:body.map(r=>r.map(L1)),theme:"grid",
      styles:{font:"helvetica",fontSize:9,cellPadding:2,textColor:[42,20,37],lineColor:lineC},headStyles:{fillColor:ink,textColor:[255,241,232]},
      alternateRowStyles:{fillColor:paper},margin:{left:14,right:14}},opts||{}));y=doc.lastAutoTable.finalY+9};
    const note=t=>{doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(107,76,96);const l=doc.splitTextToSize(L1(t),W-28);doc.text(l,14,y+3);y+=l.length*4.2+6};
    // Jauge : valeur sur l'échelle 0 → max, seuil marqué
    const gauge=(lab,v,max)=>{const x=14,w=W-28,h=5;doc.setFont("helvetica","bold");doc.setFontSize(9);doc.setTextColor(42,20,37);doc.text(L1(lab),x,y+4);
      doc.text(L1(`${f1(v)} j / mois (seuil ${max})`),x+w,y+4,{align:"right"});y+=6;doc.setFillColor(...paper);doc.roundedRect(x,y,w,h,2,2,"F");
      const c=v>=max?[184,40,58]:v>=max*.66?coral:berry;doc.setFillColor(...c);if(v>0)doc.roundedRect(x,y,Math.max(2,Math.min(v/max,1)*w),h,2,2,"F");y+=h+5};
    const months=Math.max(1,(parse(to)-parse(from))/864e5/30.44);
    title("Résumé");
    table(["Indicateur","Valeur"],[
      ["Jours renseignés",String(s.n)],
      ["Jours avec mal de tête",`${s.mig.length} (${s.n?Math.round(s.mig.length/s.n*100):0} % des jours notés)`],
      ["Fréquence moyenne",`${f1(s.mig.length/months)} jours par mois`],
      ["Intensité moyenne (échelle 0 à 10)",s.mig.length?f1(s.avgI):"-"],
      ["Durée moyenne d'une crise",s.durs.length?`${f1(avg(s.durs))} h`:"-"],
      ["Jours avec prise de médicament",`${s.medDays} (${f1(s.medDays/months)} par mois)`],
      ["dont jours avec triptan",`${s.triDays} (${f1(s.triDays/months)} par mois)`],
      ["Sommeil moyen",s.hasSleep?`${f1(s.sleep)} h`:"-"],
      ["Crises avec les signes de la migraine (ICHD-3)",s.ichd.n?`${s.ichd.typical} sur ${s.ichd.n} décrites${s.ichd.aura?`, dont ${s.ichd.aura} avec aura`:""}`:"signes non notés"]],{columnStyles:{0:{cellWidth:80,fontStyle:"bold"}}});
    const cfp=chronicFlag(S.entries,parse(to));
    const pw=medWarn(Math.round(s.medDays/months),Math.round(s.triDays/months),"par mois en moyenne");
    const att=[];if(cfp)att.push([`${CHRONIC_DAYS} jours ou plus de mal de tête par mois sur les 3 derniers mois terminés (${cfp.map(x=>`${MONTHS[x.m]} ${x.mig} j`).join(", ")}). Seuil de la céphalée chronique (ICHD-3) : 15 jours par mois pendant plus de 3 mois.`]);
    if(pw)att.push([`${pw.t}. Seuils de surveillance de l'abus médicamenteux (ICHD-3) : 10 jours par mois pour les triptans, 15 jours par mois pour les antidouleurs simples.`]);
    if(att.length){title("Points d'attention");table(["À discuter"],att)}
    const byM={};ents.forEach(e=>{const k=e.date.slice(0,7);const o=byM[k]=byM[k]||{n:0,m:0,i:[],med:0};o.n++;if(e.migraine){o.m++;o.i.push(e.intensity);if(hasMed(e))o.med++}});
    if(Object.keys(byM).length>1){title("Mois par mois");table(["Mois","Jours notés","Jours avec mal","Intensité moy.","Jours avec médicament"],
      Object.entries(byM).map(([k,o])=>{const[yy,mm]=k.split("-");return[`${MONTHS[+mm-1]} ${yy}`,String(o.n),o.m>=CHRONIC_DAYS?`${o.m} (15 ou plus)`:String(o.m),o.i.length?f1(avg(o.i)):"-",String(o.med)]}));
      y-=4;note("Jours notés : sans note, un jour n'est compté ni avec ni sans mal de tête.")}
    const mk=Object.entries(s.meds).sort((a,b)=>b[1].n-a[1].n);
    if(mk.length){title("Médicaments",50);y+=3;gauge("Jours avec prise de médicament",s.medDays/months,15);if(s.triDays)gauge("dont jours avec triptan",s.triDays/months,10);
      note("Seuils de surveillance de l'abus médicamenteux (ICHD-3) : 15 jours par mois pour les antidouleurs simples, 10 pour les triptans.");
      table(["Médicament","Prises","2 h après : plus de douleur","Mieux","Pareil","Sans réponse à 2 h"],mk.map(([k,v])=>[k,String(v.n),String(v.libre),String(v.mieux),String(v.pareil),String(v.n-v.h2)]));
      const old=mk.filter(([k,v])=>v.n>v.h2&&(v.oui+v["un peu"]+v.non)>0);
      if(old.length){y-=4;note("Avant le suivi à 2 h, l'efficacité était notée « a soulagé : oui / un peu / non » : "+old.map(([k,v])=>`${k} ${v.oui} / ${v["un peu"]} / ${v.non}`).join(" ; ")+".")}
      const rcp=recurrences(S.entries,from,to);if(rcp.length){y-=4;note(`Récurrence : après un médicament efficace, douleur revenue dans les 48 h ${rcp.filter(x=>x.back).length} fois sur ${rcp.length}.`)}
      if(s.delays.length>=2){y-=4;note(`Délai moyen entre le début de la crise et la prise : ${hmTxt(avg(s.delays))} (sur ${s.delays.length} prises dont l'heure est notée).`)}}
    if(s.starts.length){title("Moment des crises");table(["Début de la crise","Crises","Part"],s.slots.map(x=>[`${x.lab} (${x.range})`,String(x.n),`${Math.round(x.n/s.starts.length*100)} %`]),{columnStyles:{0:{cellWidth:80}}})}
    if(s.groups.length){title("Facteurs observés (jours avec mal de tête sur jours notés)");
      table(["Facteur","Situation","Jours avec mal","Fiabilité"],s.groups.flatMap(g=>g.rows.map((r,i)=>[i?"":g.title,r.lab,`${r.m} sur ${r.n}`,i?"":isWeak(g.rows[0].n,g.rows[1].n)?`faible (moins de ${MIN_STRONG} j d'un côté)`:"suffisante"])));
      if(s.n<MIN_DAYS){y-=4;note("Moins de 10 jours notés : ces chiffres sont encore trop peu nombreux pour en tirer une piste.")}}
    if(s.foodsCmp.length){title("Aliments plus fréquents les jours de mal");table(["Aliment","Jours de mal","Jours sans mal"],s.foodsCmp.map(x=>[x.t,`${x.m} sur ${x.M}`,`${x.o} sur ${x.O}`]))}
    const mids=(S.settings.midas||[]).filter(m=>m.date<=to);
    if(mids.length){title("Retentissement (questionnaire MIDAS, 3 derniers mois)",40);
      table(["Date","Score","Grade","Interprétation"],mids.slice(-8).map(m=>{const g=midasGrade(m.score);return[dayFull(m.date),String(m.score),g.g,g.t]}));
      if(mids.length>1){// Courbe des scores
        const pts=mids.slice(-8),x0=24,w=W-38,h=30,mx=Math.max(21,...pts.map(m=>m.score));if(y>240){doc.addPage();y=18}
        doc.setDrawColor(...lineC);doc.setLineWidth(.3);[0,5,10,20].filter(v=>v<=mx).forEach(v=>{const yy=y+h-v/mx*h;doc.line(x0,yy,x0+w,yy);doc.setFontSize(7);doc.setTextColor(107,76,96);doc.text(String(v),x0-3,yy+1,{align:"right"})});
        doc.setDrawColor(...berry);doc.setLineWidth(.8);const P=pts.map((m,i)=>[x0+(pts.length>1?i/(pts.length-1):0)*w,y+h-m.score/mx*h]);
        for(let i=1;i<P.length;i++)doc.line(P[i-1][0],P[i-1][1],P[i][0],P[i][1]);doc.setFillColor(...berry);P.forEach(([px,py],i)=>{doc.circle(px,py,1.2,"F");doc.setFontSize(7);doc.setTextColor(42,20,37);doc.text(dayFull(pts[i].date).slice(0,5),px,y+h+5,{align:"center"})});
        y+=h+11}
      note("Grades MIDAS : I (0-5) peu ou pas de gêne, II (6-10) gêne légère, III (11-20) gêne modérée, IV (21 et plus) gêne sévère.")}
    const mmp=menstrual(S.entries,to,12,from);
    if(mmp){title("Autour des règles (du 2e jour avant au 3e jour après le 1er jour)");
      table(["Période","Jours avec mal de tête"],[["Autour des règles",`${mmp.win.m} sur ${mmp.win.n}`],["Le reste du cycle",`${mmp.out.m} sur ${mmp.out.n}`]]);
      y-=4;note(`Crise dans cette fenêtre : ${mmp.hits} cycle(s) sur ${mmp.cycles.length} (1ers jours : ${mmp.cycles.map(c=>dayFull(c.start).slice(0,5)).join(", ")}). Migraine menstruelle (ICHD-3) : dans au moins 2 cycles sur 3.`)}
    if(s.zones.length||s.symptoms.length){title("Localisation et signes associés");
      table(["Type","Description","Nombre de crises"],s.zones.map(([t,n])=>["Zone",t,String(n)]).concat(s.symptoms.map(([t,n])=>["Signe",t,String(n)])))}
    if(s.mig.length){title("Détail des jours avec mal de tête");
      table(["Date","Int.","Début","Durée","Zones / signes","Médicament","Lun.","Somm.","Stress","Cycle","Repas de midi","Notes"],
        s.mig.map(e=>[dayFull(e.date),String(e.intensity),e.start||"",e.duration!==""?f1(e.duration)+" h":"",[e.zones.join(", "),(e.symptoms||[]).join(", ")].filter(Boolean).join(" ; "),
          medsOf(e).map(m=>(m.time?m.time+" ":"")+m.name+(m.eff?` (${m.eff})`:"")).join(", "),e.glasses?{oui:"oui",partiel:"partiel",non:"non"}[e.glasses]:"",e.sleep!==""?f1(e.sleep)+" h":"",stLabel(e.stress)||"",PE[e.period]||"",(e.lunchTime&&e.lunch?e.lunchTime+" ":"")+(e.lunch||""),e.notes||""]),
        {styles:{font:"helvetica",fontSize:7,cellPadding:1.5,textColor:[42,20,37],lineColor:lineC},columnStyles:{0:{cellWidth:17},1:{cellWidth:8},2:{cellWidth:10},3:{cellWidth:10}}})}
    const dq=(S.settings.docQ||[]).filter(q=>!q.done);
    if(dq.length){title("Questions à poser");table(["Question"],dq.map(q=>[q.t]))}
    const pages=doc.getNumberOfPages();
    for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(107,76,96);
      doc.text(L1(`Journal personnel, à titre indicatif.   Page ${i} / ${pages}`),14,290)}
    await saveFile(`rapport-migraines-${from}-au-${to}.pdf`,doc.output("blob"));
  }catch(e){toast("Le PDF n'a pas pu être créé")}
  b.disabled=false;
});
$("csvBtn").addEventListener("click",async()=>{
  const{from,to,ents}=periodEntries();if(!ents.length){toast("Aucune journée notée sur cette période");return}
  const cq=S.settings.custom||[];
  const head=["Date","Jour","Mal de tête","Intensité (0-10)","Début","Durée (h)","Zones","Signes","Médicament","Efficacité","Lunettes","Petit-déjeuner","Midi","Soir","Cafés/thés","Verres d'eau","Sommeil (h)","Écrans (h)","Stress","Cycle"].concat(cq.map(q=>q.label),["Notes"]);
  const q=v=>{let t=String(v??"");if(/^[=+\-@\t\r]/.test(t))t="'"+t;return`"${t.replace(/"/g,'""')}"`},n=v=>v===""||v==null?"":String(v).replace(".",",");
  const rows=ents.map(e=>[dayFull(e.date),DAYS[parse(e.date).getDay()],e.migraine?"oui":"non",e.migraine?e.intensity:"",e.start,n(e.duration),e.zones.join(", "),(e.symptoms||[]).join(", "),medsOf(e).map(m=>(m.time?m.time+" ":"")+m.name).join(", "),medsOf(e).length>1?medsOf(e).map(m=>m.eff||"?").join(", "):(medsOf(e)[0]||{}).eff||"",GL[e.glasses]||"",...["breakfast","lunch","dinner"].map(k=>(e[k+"Time"]&&e[k]?e[k+"Time"]+" ":"")+(e[k]||"")),n(e.coffee),n(e.water),n(e.sleep),n(e.screen),stLabel(e.stress)||"",PE[e.period]||""].concat(cq.map(x=>(e.custom||{})[x.id]||""),[e.notes]));
  const csv="﻿"+[head].concat(rows).map(r=>r.map(q).join(";")).join("\r\n");
  await saveFile(`journal-migraines-${from}-au-${to}.csv`,csv);
});
$("bkBtn").addEventListener("click",async()=>{
  const data=backupData();
  const ok=await saveFile(`sauvegarde-journal-migraines-${todayStr()}.json`,data);
  if(ok){S.settings.lastBackup=todayStr();await putSettings();renderStatus();checkNotice()}
  else{const t=$("bkText");t.value=data;t.hidden=false;t.focus();t.select();
    let copied=false;try{await navigator.clipboard.writeText(data);copied=true}catch(e){}
    toast(copied?"Texte copié : colle-le dans un mail à toi-même":"Copie ce texte et envoie-le-toi par mail")}
});
// Ne remplace jamais un jour plus récent : un jour déjà présent n'est remplacé que si la sauvegarde est plus récente
async function restoreText(txt){
  let o=null;try{o=JSON.parse(String(txt||"").trim())}catch(e){}
  if(!o||typeof o!=="object"||!o.entries){toast("Ce n'est pas une sauvegarde du journal");return false}
  toast(`Restauration de ${Object.keys(o.entries).length} journées…`);
  const{added,kept}=await mergeBackup(o);
  toast(kept?`${added} journées remises · ${kept} plus récentes gardées`:`${added} journées remises en place`);renderData();
  return true;
}
async function mergeBackup(o){
  const list=Object.values(o.entries).filter(e=>e&&e.date&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&!e.demo);
  if(o.settings||o.custom){const st=o.settings||{custom:o.custom||[]};
    const ids=new Set((S.settings.custom||[]).map(q=>q.id));cleanSettings({custom:st.custom}).custom.forEach(q=>{if(!ids.has(q.id)){S.settings.custom.push(q);ids.add(q.id)}});
    if(typeof st.name==="string"&&st.name.trim()&&!S.settings.name)S.settings.name=st.name.slice(0,80);
    const cs=cleanSettings(st);
    ["pet","gender","tone"].forEach(k=>{if(cs[k]&&!S.settings[k])S.settings[k]=cs[k]});
    if(!presetCount()&&!S.settings.presetAuto){S.settings.dayPreset=cs.dayPreset;S.settings.presetAuto=cs.presetAuto}
    const rd=S.settings.rdv||{};S.settings.rdv={next:rd.next||cs.rdv.next,last:rd.last||cs.rdv.last};
    const dqIds=new Set((S.settings.docQ||[]).map(q=>q.id));S.settings.docQ=(S.settings.docQ||[]).concat(cs.docQ.filter(q=>!dqIds.has(q.id)));S.settings.medGaps=Object.assign({},cs.medGaps,S.settings.medGaps||{});
    const seen=new Set((S.settings.midas||[]).map(m=>m.date));S.settings.midas=(S.settings.midas||[]).concat(cs.midas.filter(m=>!seen.has(m.date))).sort((a,b)=>a.date.localeCompare(b.date));await putSettings()}
  let added=0,kept=0;
  for(const e of list){
    const ex=S.entries[e.date],ts=e.updatedAt||0;
    if(ex&&ts<=(ex.updatedAt||0)){kept++;continue}
    const x=cleanEntry(e,false);if(!x)continue;delete x.quick;const ts0=e.updatedAt;await putEntry(x);if(ts0)x.updatedAt=ts0;added++;
  }
  if(added)writeCache();
  return{added,kept};
}
$("bkFile").addEventListener("change",ev=>{
  const f=ev.target.files&&ev.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=async()=>{await restoreText(r.result);ev.target.value=""};
  r.readAsText(f);
});
// Remise à zéro : efface toutes les notes et les réglages de ce téléphone
async function resetAll(){
  S.entries={};S.settings={custom:[],name:"",updatedAt:Date.now()};
  writeCache();await deleteSnapshots();await writeSnapshot();renderStatus();await scheduleReminders();
}
const rsClose=()=>{$("rsBox").hidden=true;$("rsInput").value="";$("rsErr").hidden=true;$("rsInput").removeAttribute("aria-invalid");$("rsOpen").setAttribute("aria-expanded","false")};
$("rsOpen").addEventListener("click",()=>{const open=$("rsBox").hidden;$("rsBox").hidden=!open;$("rsOpen").setAttribute("aria-expanded",String(open));if(open)$("rsInput").focus();else rsClose()});
$("rsCancel").addEventListener("click",rsClose);
$("rsGo").addEventListener("click",async()=>{
  if($("rsInput").value.trim().toUpperCase()!=="EFFACER"){$("rsErr").hidden=false;$("rsInput").setAttribute("aria-invalid","true");$("rsInput").focus();return}
  const b=$("rsGo");b.disabled=true;
  await resetAll();
  b.disabled=false;rsClose();toast("Toutes tes notes ont été effacées");show("home");
});
$("bkPasteBtn").addEventListener("click",async()=>{
  const t=$("bkPaste");if(!t.value.trim()){toast("Colle d'abord le texte de ta sauvegarde");t.focus();return}
  if(await restoreText(t.value))t.value="";
});

/* =============== DÉMARRAGE =============== */
const THEME_KEY="jm-theme";
function isDark(){const t=document.documentElement.dataset.theme;return t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches}
function paintTheme(){const d=isDark();$("themeBtn").setAttribute("aria-pressed",String(d));
  $("themeIco").setAttribute("d",d?"M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z":"M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z")}
try{const t=localStorage.getItem(THEME_KEY);if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}
$("themeBtn").addEventListener("click",()=>{const t=isDark()?"light":"dark";document.documentElement.dataset.theme=t;try{localStorage.setItem(THEME_KEY,t)}catch(e){}paintTheme()});
paintTheme();
readCache();applyWords();renderStatus();show("home");scheduleReminders();
restoreFromSnapshot().then(()=>writeSnapshot()).then(()=>renderStatus());
// Bouton retour d'Android : recule dans l'appli au lieu de la fermer d'un coup
const CapApp=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;
if(CapApp)CapApp.addListener("backButton",()=>{
  if(tab==="form"){if(!$("quitBar").hidden){showQuit(false);return}askLeave();return}
  if(tab==="cal"&&calSel){closeDay();return}
  if(tab!=="home"){show("home");return}
  CapApp.exitApp();
});
// Retour dans l'appli (après minuit, ou depuis une notification) : accueil à jour et rappels recalculés
if(CapApp)CapApp.addListener("resume",()=>{scheduleReminders();scheduleDoseReminders();schedule2h();refresh()});
// Liens du widget Android et des raccourcis de l'icône : journalmigraines://quick?l=3|6|9, ://nopain, ://day, ://med
let lastLink={u:"",at:0};
async function handleLink(url){
  const m=/^journalmigraines:\/\/([a-z]+)\/?(?:\?l=(\d))?$/.exec(String(url||""));if(!m)return false;
  if(url===lastLink.u&&Date.now()-lastLink.at<3000)return false;lastLink={u:url,at:Date.now()};
  const a=m[1];
  if(a==="quick"){const v={"3":3,"6":6,"9":9}[m[2]];if(!v)return false;show("home");await quickCrisis(v);if(v===9)setCrisis(true);return true}
  if(a==="nopain"){show("home");if(!(await noPainNow()))toast("Aujourd'hui est déjà noté");return true}
  if(a==="day"){openForm(todayStr());return true}
  if(a==="med"){const e=S.entries[todayStr()];if(e&&e.migraine){show("home");setCrisis(true)}else openForm(todayStr(),"yes");return true}
  return false;
}
if(CapApp&&CapApp.addListener)CapApp.addListener("appUrlOpen",d=>{handleLink(d&&d.url)});
if(CapApp&&CapApp.getLaunchUrl)CapApp.getLaunchUrl().then(r=>{if(r&&r.url)handleLink(r.url)}).catch(()=>{});
// Réponse à « Ta crise est-elle finie ? » et à « 2 h après, comment va ta tête ? »
{const ln=LN();if(ln&&ln.addListener)ln.addListener("localNotificationActionPerformed",a=>{
  const x=a&&a.notification&&a.notification.extra;
  if(a&&a.notification&&a.notification.actionTypeId==="MED_2H"&&x){if(EFF_OF[a.actionId])set2h(x.date,x.name,x.time,a.actionId);else show("home");return}
  if(!a||!a.notification||a.notification.id!==CRISIS_NOTIF)return;
  if(a.actionId==="done")endCrisis();else if(a.actionId==="later")crisisCheckIn(1);else if(a.actionId==="med"){show("home");setCrisis(true)}else{show("home")}})}
})();
