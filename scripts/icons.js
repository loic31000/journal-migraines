// Dessine l'icône et l'écran de démarrage (dossier assets/), ensuite déclinés
// pour Android par « npx @capacitor/assets generate --android ».
// Identité « Ciel intérieur » : ciel aubergine, soleil corail, tête crème, petite étoile.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const out = path.join(__dirname, "..", "assets");
fs.mkdirSync(out, { recursive: true });

const CREAM = "#fff1e8", CORAL = "#ff8a6b";
// Tête de profil + cœur, mêmes tracés que dans l'appli (viewBox 48)
const art = `
  <path d="M17 43v-6.5C12.5 34 10 29.5 10 24.5 10 15.9 16.6 9 25 9c7.6 0 13.5 5.6 13.5 12.6l3.1 5.7c.4.8-.1 1.7-1 1.7h-2.1v4.5c0 1.9-1.5 3.5-3.4 3.5h-4.6V43"
    fill="${CREAM}" fill-opacity=".16" stroke="${CREAM}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M24.5 26.5s-5.2-2.9-5.2-6.3c0-1.7 1.3-3 3-3 1 0 1.8.5 2.2 1.2.4-.7 1.2-1.2 2.2-1.2 1.7 0 3 1.3 3 3 0 3.4-5.2 6.3-5.2 6.3z" fill="${CORAL}"/>`;
// Étoile à quatre branches (viewBox 24), celle qui scintille sur l'accueil
const star = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5z" fill="${CREAM}"/>`;
const defs = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#56324f"/><stop offset=".6" stop-color="#3b2236"/><stop offset="1" stop-color="#2a1425"/></linearGradient>
  <radialGradient id="sun" cx=".8" cy=".18" r=".55"><stop offset="0" stop-color="${CORAL}" stop-opacity=".85"/><stop offset=".45" stop-color="${CORAL}" stop-opacity=".25"/><stop offset="1" stop-color="${CORAL}" stop-opacity="0"/></radialGradient>
</defs>`;
const sky = (w) => `<rect width="${w}" height="${w}" fill="url(#sky)"/><rect width="${w}" height="${w}" fill="url(#sun)"/>`;

// Icône complète (carré, coins arrondis par Android)
const iconOnly = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defs}${sky(1024)}
  <g transform="translate(152 150) scale(15)">${art}</g>${star(720, 190, 5)}</svg>`;
// Icône adaptative : dessin dans la zone sûre (66 % centrale), fond séparé
const fg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(272 268) scale(10)">${art}</g>${star(640, 300, 3.2)}</svg>`;
const back = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defs}${sky(1024)}</svg>`;
// Écran de démarrage : fond de l'appli + médaillon de l'icône
const splash = (paper) => `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">${defs}
  <rect width="2732" height="2732" fill="${paper}"/>
  <clipPath id="m"><circle cx="1366" cy="1366" r="300"/></clipPath>
  <g clip-path="url(#m)"><g transform="translate(1066 1066)"><rect width="600" height="600" fill="url(#sky)"/><rect width="600" height="600" fill="url(#sun)"/></g></g>
  <g transform="translate(1126 1118) scale(10)">${art}</g>${star(1440, 1180, 2.4)}</svg>`;

(async () => {
  const files = { "icon-only.png": iconOnly, "icon-foreground.png": fg, "icon-background.png": back, "splash.png": splash("#f8f1ea"), "splash-dark.png": splash("#120a12") };
  for (const [name, svg] of Object.entries(files)) await sharp(Buffer.from(svg)).png().toFile(path.join(out, name));
  console.log("icônes et écrans de démarrage dessinés dans assets/");
})();
