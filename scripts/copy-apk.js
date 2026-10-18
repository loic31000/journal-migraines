// Copie l'APK fabriqué à la racine du projet, sous un nom lisible.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const dest = path.join(root, "Mon-Journal-Migraines.apk");
fs.copyFileSync(src, dest);
console.log(`APK prêt : ${dest} (${(fs.statSync(dest).size / 1048576).toFixed(1)} Mo)`);
