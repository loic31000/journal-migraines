// Compile l'APK avec Gradle puis le copie à la racine (Mon-Journal-Migraines.apk).
const { spawnSync } = require("child_process");
const path = require("path");

const android = path.join(__dirname, "..", "android");
const gradlew = path.join(android, process.platform === "win32" ? "gradlew.bat" : "gradlew");
const r = spawnSync(gradlew, ["assembleDebug"], { cwd: android, stdio: "inherit", shell: process.platform === "win32" });
if (r.status !== 0) process.exit(r.status || 1);
require("./copy-apk.js");
