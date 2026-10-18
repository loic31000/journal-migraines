// Dessine l'icône et l'écran de démarrage (dossier assets/), ensuite déclinés
// pour Android par « npx @capacitor/assets generate --android ».
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const out = path.join(__dirname, "..", "assets");
fs.mkdirSync(out, { recursive: true });

// Tête de profil + cœur, mêmes tracés que dans l'appli (viewBox 48)
const art = (color) => `
  <path d="M17 43v-6.5C12.5 34 10 29.5 10 24.5 10 15.9 16.6 9 25 9c7.6 0 13.5 5.6 13.5 12.6l3.1 5.7c.4.8-.1 1.7-1 1.7h-2.1v4.5c0 1.9-1.5 3.5-3.4 3.5h-4.6V43"
    fill="${color}" fill-opacity=".22" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M24.5 26.5s-5.2-2.9-5.2-6.3c0-1.7 1.3-3 3-3 1 0 1.8.5 2.2 1.2.4-.7 1.2-1.2 2.2-1.2 1.7 0 3 1.3 3 3 0 3.4-5.2 6.3-5.2 6.3z" fill="${color}"/>`;
const bg = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#f48fb1"/><stop offset=".55" stop-color="#d81b66"/><stop offset="1" stop-color="#9c4fd6"/></linearGradient></defs>`;

// Icône complète (carré, coins arrondis par Android)
const iconOnly = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${bg}
  <rect width="1024" height="1024" fill="url(#g)"/><g transform="translate(152 140) scale(15)">${art("#ffffff")}</g></svg>`;
// Icône adaptative : dessin dans la zone sûre (66 % centrale), fond séparé
const fg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(272 262) scale(10)">${art("#ffffff")}</g></svg>`;
const back = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${bg}<rect width="1024" height="1024" fill="url(#g)"/></svg>`;
// Écran de démarrage : fond de l'appli + médaillon de l'icône
const splash = (paper) => `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">${bg}
  <rect width="2732" height="2732" fill="${paper}"/><circle cx="1366" cy="1366" r="300" fill="url(#g)"/>
  <g transform="translate(1126 1110) scale(10)">${art("#ffffff")}</g></svg>`;

(async () => {
  const files = { "icon-only.png": iconOnly, "icon-foreground.png": fg, "icon-background.png": back, "splash.png": splash("#fff2f6"), "splash-dark.png": splash("#1d0f19") };
  for (const [name, svg] of Object.entries(files)) await sharp(Buffer.from(svg)).png().toFile(path.join(out, name));
  console.log("icônes et écrans de démarrage dessinés dans assets/");
})();
