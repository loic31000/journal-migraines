// Compile l'APK de publication (signé, non débogable) avec Gradle puis le copie à la racine (Mon-Journal-Migraines.apk).
const { spawnSync } = require("child_process");
const path = require("path");

const android = path.join(__dirname, "..", "android");
const fs = require("fs");
if (!fs.existsSync(path.join(android, "keystore.properties"))) {
  console.error("android/keystore.properties manquant : impossible de signer l'APK de publication (voir README, « Clé de signature »).");
  process.exit(1);
}
const gradlew = path.join(android, process.platform === "win32" ? "gradlew.bat" : "gradlew");
const r = spawnSync(gradlew, ["assembleRelease"], { cwd: android, stdio: "inherit", shell: process.platform === "win32" });
if (r.status !== 0) process.exit(r.status || 1);
require("./copy-apk.js");
