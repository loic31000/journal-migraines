// Copie dans www/vendor tout ce que l'appli chargeait depuis internet (outil PDF, polices),
// pour qu'elle fonctionne sans aucune connexion.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "www", "vendor");
const nm = (...p) => path.join(root, "node_modules", ...p);
fs.mkdirSync(path.join(out, "fonts"), { recursive: true });

fs.copyFileSync(nm("jspdf", "dist", "jspdf.umd.min.js"), path.join(out, "jspdf.umd.min.js"));
fs.copyFileSync(nm("jspdf-autotable", "dist", "jspdf.plugin.autotable.min.js"), path.join(out, "jspdf.plugin.autotable.min.js"));

const faces = [
  ["Fredoka", "fredoka", [500, 600]],
  ["Nunito", "nunito", [400, 600, 700, 800]],
];
let css = "/* Polices intégrées à l'appli (générées par scripts/vendor.js) */\n";
for (const [family, pkg, weights] of faces) {
  for (const w of weights) {
    const file = `${pkg}-latin-${w}-normal.woff2`;
    fs.copyFileSync(nm("@fontsource", pkg, "files", file), path.join(out, "fonts", file));
    css += `@font-face{font-family:"${family}";font-style:normal;font-weight:${w};font-display:swap;src:url("fonts/${file}") format("woff2")}\n`;
  }
}
fs.writeFileSync(path.join(out, "fonts.css"), css);
console.log("vendor : outil PDF et polices copiés dans www/vendor");
