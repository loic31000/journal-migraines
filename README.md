<div align="center">

<img src="assets/icon-only.png" alt="Icône de l'appli : une tête de profil avec un cœur, sur fond rose" width="120">

# Mon Journal Migraines

**Un journal des maux de tête pour Android, 100 % local.**
Noter sa journée en quelques touchers, voir le bilan de la semaine et du mois, et préparer un rapport PDF pour le médecin.

**[Télécharger l'APK (dernière version)](https://github.com/loic31000/journal-migraines/releases/latest)**

![Version](https://img.shields.io/badge/version-2.4.1-a92c49)
![Android](https://img.shields.io/badge/Android-7.0%2B%20·%20cible%2014-3DDC84?logo=android&logoColor=white)
![Hors ligne](https://img.shields.io/badge/internet-aucune%20permission-7d4ccc)
![Compte](https://img.shields.io/badge/compte-aucun-7d4ccc)
![Tests](https://img.shields.io/badge/tests-111%20réussis-1f7a5c)
![Licence](https://img.shields.io/badge/licence-MIT-555)

![Capacitor](https://img.shields.io/badge/Capacitor-8.5-119EFF?logo=capacitor&logoColor=white)
![HTML CSS JS](https://img.shields.io/badge/HTML%20·%20CSS%20·%20JavaScript-sans%20framework-f7df1e?logo=javascript&logoColor=black)
![jsPDF](https://img.shields.io/badge/jsPDF-4.2.1-a92c49)
![Node](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)

</div>

---

## Sommaire

- [Captures d'écran](#captures-décran)
- [Pourquoi cette appli](#pourquoi-cette-appli)
- [Fonctionnalités](#fonctionnalités)
- [Vie privée et données](#vie-privée-et-données)
- [Installer sur le téléphone](#installer-sur-le-téléphone)
- [Stack technique](#stack-technique)
- [Fabriquer l'APK](#fabriquer-lapk)
- [Tests](#tests)
- [Organisation du projet](#organisation-du-projet)
- [Publier une nouvelle version](#publier-une-nouvelle-version)
- [Historique des versions](#historique-des-versions)
- [Contribuer](#contribuer)
- [Licence](#licence)
- [Licences tierces](#licences-tierces)
- [Avertissement médical](#avertissement-médical)

## Captures d'écran

<p align="center">
  <img src="docs/captures/accueil.png" alt="Accueil : « Comment va ta tête aujourd'hui ? », le bouton Ma tête va bien, J'ai eu mal, et la crise rapide avec trois têtes (1, 2 ou 3 traits de douleur)" width="200">
  <img src="docs/captures/formulaire.png" alt="Formulaire, étape La crise : le médicament pris, son heure, la question « 2 h après la prise ? », les médicaments habituels à ajouter d'un toucher, et le bouton Enregistrer" width="200">
  <img src="docs/captures/jour.png" alt="Détail d'un jour : la journée heure par heure, puis une liste par thème (où, douleur, autres signes, médicament, repas)" width="200">
  <img src="docs/captures/crise.png" alt="Mode crise : écran noir, temps écoulé depuis le début de la crise, boutons J'ai pris pour les médicaments habituels, Ma crise est finie" width="200">
</p>
<p align="center">
  <img src="docs/captures/bilan.png" alt="Bilan du mois : anneau de synthèse, tendance, force moyenne, puis En bref" width="200">
  <img src="docs/captures/bilan-graphique.png" alt="Bilan : graphique jour par jour en bandes léger, moyen, fort, avec les jours de médicament, puis les jours de mal par mois et la ligne des 15 jours" width="200">
  <img src="docs/captures/bilan-cycle.png" alt="Bilan : autour des règles cycle par cycle, puis les crises qui ont les signes de la migraine" width="200">
</p>
<p align="center">
  <img src="docs/captures/medecin.png" alt="Onglet Médecin : prochain et dernier rendez-vous, résumé depuis le dernier, questions à poser" width="200">
  <img src="docs/captures/reglages.png" alt="Réglages : la journée type notée d'office avec Ma tête va bien" width="200">
  <img src="docs/captures/accueil-nuit.png" alt="Accueil en mode nuit" width="200">
</p>

<sub>Captures réalisées avec des données d'exemple fictives.</sub>

## Pourquoi cette appli

Un médecin a besoin de savoir **à quelle fréquence** surviennent les maux de tête, **avec quelle force**, **quels médicaments** ont été pris, **s'ils ont marché** et **ce qui les déclenche**. Ces informations s'oublient vite : l'appli permet de les noter chaque jour en quelques secondes, et de les retrouver sous forme de bilans et d'un rapport prêt pour le rendez-vous.

Tout reste sur le téléphone : pas de compte, pas de serveur, pas d'abonnement.

## Fonctionnalités

### Noter sa journée
- **Accueil en une question** : « Comment va ta tête aujourd'hui ? ».
  - **Ma tête va bien** note la journée d'un seul toucher, sans formulaire, avec la **journée type** (voir Réglages). *Modifier* ou *Compléter* reste possible juste après.
  - **J'ai eu mal, je raconte** ouvre le formulaire.
  - **Jour oublié** : *Ma semaine* signale le dernier jour pas noté (« Samedi n'est pas noté : le noter »).
- **Crise rapide** : on touche l'icône qui correspond à sa douleur (*Légère*, *Moyenne* ou *Forte* : une tête avec 1, 2 ou 3 traits de douleur). La crise est enregistrée tout de suite avec l'heure, on complète plus tard. *Annuler* et *Retirer cette crise* en cas d'erreur.
- **Mode crise** : *Forte* (ou *Passer en mode crise*) passe l'appli en noir profond, sans animation, avec de gros boutons et l'essentiel :
  - le temps écoulé depuis le début de la crise ;
  - **J'ai pris** : les médicaments habituels se notent d'un toucher, avec l'heure, l'heure de la dernière prise et la prochaine prise possible ;
  - **Ma crise est finie** calcule la durée.
- **Notifications** :
  - « Ta crise est-elle finie ? » 2 h après une crise rapide, avec *Oui, c'est fini*, *Pas encore* (nouveau rappel 1 h plus tard) ou *J'ai pris…* ;
  - **2 h après chaque prise** : « Comment va ta tête ? » avec *Plus de douleur*, *Mieux* ou *Pareil* (la mesure utilisée dans les essais sur la migraine). Si elle est manquée, la question attend sur l'accueil ;
  - prochaine prise possible, d'après l'**écart entre deux prises** réglé pour chaque médicament (notice ou médecin) ;
  - rappel du soir, seulement si la journée n'est pas notée.
- **Widget et raccourcis Android** : le widget « Ma tête aujourd'hui » (*Ma tête va bien*, *Légère*, *Moyenne*, *Forte*) et l'appui long sur l'icône (*Crise forte*, *J'ai pris un médicament*, *Noter ma journée*) notent sans chercher l'appli.
- **Formulaire pas à pas** (4 à 5 écrans courts, avec barre de progression). **Enregistrer** à chaque étape : rien n'oblige à aller au bout.
  - la tête : mal ou pas, force de 1 à 10 ;
  - la crise :
    - d'abord **ce qui a été pris** : les médicaments habituels s'ajoutent d'un toucher avec l'heure, autant que nécessaire, et pour chacun **2 h après la prise : plus de douleur, mieux ou pareil** ;
    - puis heure de début, durée, zones douloureuses ;
    - **comment est la douleur** : d'un seul côté, qui bat, pire en bougeant, aura avant la douleur ;
    - les autres signes, repliés : nausées, vomissements, gêne à la lumière ou au bruit, troubles de la vue, vertiges, grande fatigue ;
  - les repas : petit-déjeuner, midi, soir (avec l'heure si on veut), cafés ou thés, verres d'eau. **Comme d'habitude** remplit les cases vides avec la journée type, puis d'après les 14 derniers jours ;
  - la journée : lunettes, sommeil, écrans, stress, cycle (avec le **1er jour des règles**) ;
  - pour finir : questions perso et notes libres.
- **Questions perso** : ajouter ses propres questions (*Sport aujourd'hui ?*, *Cachet aujourd'hui ?*), en Oui/Non ou réponse écrite. Les Oui/Non sont comparées dans le bilan et peuvent faire partie de la journée type.

### Voir et comprendre
- **Calendrier** coloré : chaque jour est une petite jauge qui se remplit selon la force de la douleur (léger 1/3, moyen 2/3, fort plein). Un toucher ouvre le détail du jour : la journée **heure par heure** (repas, début et fin de crise, chaque prise), puis une liste par thème. À modifier ou supprimer.
- **Bilan de la semaine, du mois ou de 3 mois** :
  - anneau de synthèse et phrase (*« Un mois plutôt calme »*), **tendance** par rapport à la période d'avant, force moyenne, heures de douleur, sommeil moyen ;
  - **En bref** : les pistes les plus nettes en phrases simples (« Tu as plus souvent mal quand tu dors moins de 7 h », « 6 jours sur 6 »). **Piste encore faible** est affiché quand une piste repose sur moins de 8 jours d'un côté ;
  - **jour par jour** : une barre par crise dans sa bande (léger, moyen, fort), un rond pour les jours sans mal de tête, une capsule sous les jours avec médicament, et le décompte par force. Sur 3 mois, une barre par semaine ;
  - **jours de mal par mois** sur 6 mois, avec la ligne des 15 jours et le nombre de jours notés. Alerte si 15 jours ou plus par mois 3 mois de suite (seuil de la céphalée chronique, classification ICHD-3) ;
  - **moment des crises** et **situation par situation** : sommeil, lunettes, stress, eau, écrans, café, cycle et questions perso ;
  - **autour des règles** : crise entre 2 jours avant et 3 jours après le 1er jour des règles, cycle par cycle, et jours avec mal dans cette fenêtre comparés au reste du cycle (migraine menstruelle : au moins 2 cycles sur 3) ;
  - **aliments à surveiller** : seulement ceux qui reviennent nettement plus souvent les jours de mal ;
  - **où et comment** : combien de crises décrites réunissent les **critères ICHD-3 de la migraine** (au moins 2 caractères de la douleur, plus nausées ou gêne à la lumière et au bruit, sur 4 à 72 h), combien avec aura, zones et signes ;
  - **médicaments** : jours de prise face aux seuils d'alerte, efficacité **2 h après la prise**, **récurrence** (douleur revenue dans les 48 h après un médicament qui a marché), délai moyen entre le début de la crise et la prise.
- **Questionnaire MIDAS** (gêne au quotidien sur 3 mois, utilisé par les neurologues) : proposé tous les 3 mois, score, grade et historique dans le bilan et le rapport.
- **Alerte médicaments** sur l'accueil si les prises approchent ou dépassent les seuils de surveillance de l'abus médicamenteux (ICHD-3 : 10 jours par mois pour les triptans, 15 pour les antidouleurs simples).

Le bilan observe, il ne diagnostique pas : chaque critère médical est présenté comme un repère à discuter avec le médecin.

### Pour le médecin
- **Onglet Médecin** : dates du prochain et du dernier rendez-vous, résumé depuis le dernier (jours avec mal, force moyenne, jours de médicament dont triptan), et **questions à poser** notées au fil des jours. *Le rendez-vous a eu lieu* range les questions cochées et fait repartir le résumé de cette date.
- **Rapport PDF**, depuis le dernier rendez-vous, sur 1, 3, 6, 12 mois ou tout l'historique :
  - résumé, crises avec les signes de la migraine (et avec aura), **points d'attention** (15 jours par mois, médicaments) ;
  - mois par mois, jauge des médicaments vers les seuils, efficacité **2 h après la prise**, récurrences, délai de prise ;
  - moment des crises, facteurs observés avec leur **fiabilité**, fenêtre des règles, aliments, MIDAS ;
  - détail de chaque crise, et les questions pas encore cochées à la fin.
- **Tableau** (CSV, s'ouvre dans Excel ou Google Sheets).

### Réglages (roue dentée sur l'accueil)
- **L'appli et toi** : prénom, petit nom, **les mots pour toi** (neutre par défaut, au féminin ou au masculin : « Très stressée », « Gênée par la lumière ») et **le ton** (sobre par défaut, ou tendre : « Coucou mon amour, tu as noté ta journée ? »). Un aperçu montre le rappel du soir. Ce qui est enregistré reste toujours la forme neutre : changer de réglage ne touche ni aux notes ni au bilan.
- **Ma journée type** : lunettes, sommeil, eau, cafés, écrans, stress, cycle, repas et questions Oui/Non notés d'office avec *Ma tête va bien* (et le widget), sans jamais remplacer une réponse déjà donnée. Option : compléter le reste d'après les 14 derniers jours.
- **Rappel du soir** (21 h par défaut, heure réglable), **écart entre deux prises**, **questions perso**.
- **Sauvegarde** :
  - **automatique** : à chaque note, une copie complète (plus celle de la veille) est écrite dans le dossier privé de l'appli. Android l'envoie dans la sauvegarde Google du téléphone, sans que l'appli ait besoin d'Internet. Si l'appli perd ses notes (nouveau téléphone, données effacées), elle les retrouve toute seule au démarrage, sans jamais remplacer un jour plus récent ;
  - **sur Drive** en un fichier, envoyé via le menu de partage Android (Drive, Gmail, WhatsApp…), rappelée sur l'accueil chaque semaine. **Restauration** depuis ce fichier ou un texte collé, sans jamais écraser un jour plus récent.
- **Tout effacer**, protégé par une confirmation à taper.

### Confort et accessibilité
- **Mode nuit** en un toucher, utile quand la lumière fait mal.
- **Bouton retour d'Android** géré : il recule dans l'appli au lieu de la fermer.
- Libellés d'au moins 14 px, contrastes vérifiés (au moins 4,5:1 pour le texte et 3:1 pour les contours des éléments interactifs), zones à toucher de 44 px au moins, compatible avec le lecteur d'écran TalkBack, information jamais portée par la couleur seule, animations coupées si le téléphone le demande.

## Vie privée et données

| | |
|---|---|
| **Où sont les notes ?** | Dans le téléphone, dans l'espace privé de l'appli. Aucun serveur, aucun compte. |
| **Connexion internet** | Aucune : l'appli n'a pas la permission Internet, Android lui interdit toute connexion. |
| **Compte, publicité, statistiques** | Aucun. |
| **Permissions demandées** | Notifications (rappel du soir, fin de crise, 2 h après une prise, prochaine prise), réveil et redémarrage du téléphone (pour que les rappels survivent à un redémarrage). Le widget n'affiche que des boutons : il ne lit aucune note. |
| **Sauvegarde Google du téléphone** | L'appli écrit une copie de ses notes dans son dossier privé à chaque changement. Si la sauvegarde Google est activée (Réglages › Google › Sauvegarde, en général activée par défaut), Android l'envoie chiffrée dans le compte Google, environ une fois par jour (en Wi-Fi, téléphone en charge). Sur un nouveau téléphone, en réinstallant l'appli avec le même compte, les notes reviennent. L'appli elle-même n'envoie rien. |
| **Si le téléphone casse** | Deux protections indépendantes : la sauvegarde Google automatique, et les copies envoyées sur Drive chaque semaine. La seconde marche même si la sauvegarde Google est désactivée. |

> ⚠️ Désinstaller l'appli ou faire « Effacer les données » dans les réglages Android supprime les notes et la copie automatique du téléphone. Seules la sauvegarde Google du téléphone et les copies envoyées sur Drive permettent alors de tout récupérer : faire une sauvegarde sur Drive avant.

## Installer sur le téléphone

1. Sur le téléphone, ouvrir la [page des versions](https://github.com/loic31000/journal-migraines/releases/latest) et télécharger le fichier `journal-migraines-x.y.z.apk` (ou fabriquer l'APK soi-même, voir plus bas).
2. L'ouvrir depuis l'appli **Fichiers**, puis autoriser l'installation pour cette source si Android le demande.
3. **Mise à jour** : installer le nouvel APK par-dessus. Les notes sont conservées.
4. **Vérifier la sauvegarde Google** (une fois) : *Réglages* › *Google* › *Sauvegarde* (selon les téléphones : *Système* › *Sauvegarde*), « Sauvegarde par Google One » activée. C'est elle qui emporte la copie automatique hors du téléphone.
5. **Nouveau téléphone** : se connecter au même compte Google, installer l'APK, ouvrir l'appli. Si Android a remis la copie automatique, l'appli retrouve les notes toute seule au démarrage. Sinon : *Réglages* (roue dentée) › *Remettre une sauvegarde (fichier)* avec la dernière copie envoyée sur Drive.

> **Changement de clé de signature (une seule fois)** : Android refuse d'installer un APK signé avec une autre clé par-dessus l'appli déjà installée. Dans l'ancienne appli : *Mes données* → *Faire une sauvegarde* (l'envoyer sur Drive ou par mail). Désinstaller, installer le nouvel APK, puis *Réglages* (roue dentée) → *Remettre une sauvegarde (fichier)*. Les mises à jour suivantes, signées avec la même clé, s'installent de nouveau par-dessus.

**Version de test** : à chaque push sur une branche autre que `main`, GitHub Actions fabrique un APK de test (onglet *Actions* › *APK de test* › *Artifacts* › `mon-journal-test-apk`). Il s'appelle « Mon Journal (test) » (identifiant `fr.journalmigraines.app.test`) et s'installe **à côté** de la vraie appli, avec ses propres notes : rien n'est touché. Pour y essayer ses vraies notes : *Faire une sauvegarde* dans l'appli, puis *Remettre une sauvegarde (fichier)* dans la version de test.

L'APK n'est pas dans le dépôt : il est joint à chaque [version publiée](https://github.com/loic31000/journal-migraines/releases), ou se fabrique avec `npm run apk` (voir ci-dessous).

## Stack technique

| Couche | Choix | Rôle |
|---|---|---|
| Interface et logique | HTML, CSS, JavaScript, sans framework | Un seul fichier, `www/index.html` |
| Appli Android | [Capacitor](https://capacitorjs.com) 8.5 | Enveloppe la page dans une vraie appli Android |
| Plugins natifs | `@capacitor/app`, `filesystem`, `share`, `local-notifications` | Bouton retour, fichiers, menu de partage, rappel du soir |
| Code natif | Java (`JournalWidget.java`, `LinkGuard.java`), ressources Android | Widget de l'écran d'accueil, raccourcis de l'icône, liens `journalmigraines://` protégés par une clé propre à l'appli |
| Stockage | `localStorage` de la WebView | Privé à l'appli, persistant |
| PDF | jsPDF 4.2.1 + jsPDF-AutoTable 5.0.8 | Rapport pour le médecin, intégré à l'APK |
| Polices | Fraunces (titres, chiffres) et Manrope (texte), via Fontsource | Intégrées à l'APK, aucune requête réseau |
| Icônes | `sharp` + `@capacitor/assets` | Icône adaptative et écrans de démarrage clair et sombre |
| Compilation | Node.js 22 ou plus, Java 21, SDK Android 36, Gradle 8.14 (empreinte vérifiée) | Fabrication de l'APK |
| Tests | Node.js, sans dépendance | Logique de stockage, sauvegardes, partage, rappels |

**Android** : version minimale 7.0 (API 24), avec la WebView Android à jour (Play Store). Cible Android 16 (API 36), affichage bord à bord. Les couleurs de l'interface utilisent `color-mix()`, géré par les WebView depuis 2023 ; Android 5 et 6 ne reçoivent plus ces mises à jour.

## Fabriquer l'APK

### Clé de signature (une seule fois)

L'APK est une version de publication : signée, non débogable. La clé n'est jamais dans le dépôt. Elle se crée une fois :

```powershell
keytool -genkeypair -storetype PKCS12 -keystore "$env:USERPROFILE\.android\journal-migraines-release.jks" -alias journal -keyalg RSA -keysize 4096 -validity 10000 -dname "CN=Mon Journal Migraines"
```

Puis `android/keystore.properties` (ignoré par git) :

```properties
storeFile=C:/Users/<toi>/.android/journal-migraines-release.jks
storePassword=<mot de passe>
keyAlias=journal
keyPassword=<mot de passe>
```

> **Sauvegarder la clé `.jks` et son mot de passe hors du PC** (gestionnaire de mots de passe, clé USB). Sans eux, impossible de publier une mise à jour qui s'installe par-dessus : il faudrait désinstaller l'appli, donc repasser par une sauvegarde.

### Prérequis (une seule fois, sous Windows)

```powershell
winget install Microsoft.OpenJDK.21
```

Puis les outils Android en ligne de commande, installés dans `%LOCALAPPDATA%\Android\Sdk`, avec les paquets `platform-tools`, `platforms;android-36` et `build-tools;35.0.0`. Android Studio n'est pas nécessaire.

### Commandes

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

npm install
npm test        # vérifie la logique
npm run apk     # fabrique Mon-Journal-Migraines.apk (publication, signé) à la racine
```

| Script | Ce qu'il fait |
|---|---|
| `npm run vendor` | Copie l'outil PDF et les polices dans `www/vendor` |
| `npm run sync` | `vendor`, puis copie l'appli dans le projet Android |
| `npm run apk` | `sync`, compilation Gradle, copie de l'APK à la racine |
| `npm test` | Lance les tests |

Pour redessiner l'icône : `node scripts/icons.js` puis `npx @capacitor/assets generate --android`.

## Tests

`npm test` exécute la logique de l'appli dans Node, avec un faux écran et un faux téléphone (fichiers, partage, notifications simulés) :

- une journée enregistrée est toujours là à la réouverture, un jour supprimé ne revient pas ;
- reprise unique des notes de l'ancienne version ;
- restauration sans écraser un jour plus récent, texte invalide refusé ;
- retrait d'une crise rapide (journée d'avant remise telle quelle) ;
- partage Android : texte en UTF-8, PDF intact, partage annulé non compté comme sauvegarde ;
- rappel du soir : 14 soirs programmés à la bonne heure, aucun rappel un soir déjà noté ;
- plusieurs médicaments par jour : ancien et nouveau format lus, chaque prise comptée dans le bilan, vieilles sauvegardes restaurées sans perte ;
- heures : fin de crise calculée (même après minuit), détail du jour rangé par heure et complet ;
- sauvegarde automatique : copie écrite à chaque changement, notes retrouvées au démarrage, jamais au détriment d'un jour plus récent, copie de la veille si la dernière est abîmée, « Tout effacer » efface aussi les copies ;
- remise à zéro, seuils médicaments, bilan semaine, mois et 3 mois ;
- mots et ton : neutre et sobre par défaut, féminin, masculin, tendre avec ou sans petit nom ; symptômes notés au féminin ramenés à la forme neutre ;
- « Ma tête va bien » en un toucher, journée type notée d'office sans remplacer une réponse donnée, jours oubliés ;
- mode crise : médicaments habituels, « J'ai pris » et « Annuler », prochaine prise possible ;
- liens du widget et des raccourcis (liens inconnus ignorés, même lien jamais traité deux fois) ;
- notifications toutes programmées « non exactes » (aucune demande d'autorisation « Alarmes et rappels ») ;
- onglet Médecin : résumé depuis le dernier rendez-vous, questions à poser, rendez-vous passé ;
- bilan précis : jours de mal par mois et seuil des 15 jours, critères ICHD-3 de la migraine, 1ers jours des règles et fenêtre menstruelle, réponses « 2 h après », récurrences dans les 48 h, pistes encore faibles.

Les tests ne remplacent pas un essai sur un vrai téléphone (affichage, menu de partage, notifications).

## Organisation du projet

```
├── www/
│   └── index.html          l'appli (interface et logique)
├── android/                projet Android généré par Capacitor
├── assets/                 icône et écrans de démarrage sources
├── docs/captures/          captures d'écran du README
├── scripts/
│   ├── vendor.js           intègre l'outil PDF et les polices
│   ├── icons.js            dessine l'icône et l'écran de démarrage
│   ├── build-apk.js        compile l'APK avec Gradle
│   └── copy-apk.js         copie l'APK à la racine
├── tests/
│   └── app.test.js         tests de la logique
├── .github/workflows/
│   └── apk-test.yml        APK de test à chaque push sur une branche
├── capacitor.config.json   identité de l'appli et réglages des plugins
├── package.json            dépendances et scripts
├── CONTRIBUTING.md         comment proposer une correction
└── SECURITY.md             signaler une faille
```

## Publier une nouvelle version

1. Augmenter `versionCode` (entier, +1) et `versionName` dans `android/app/build.gradle`, et `version` dans `package.json`. Sans cela, Android ne reconnaît pas la mise à jour.
2. `npm test` puis `npm run apk`.
3. Committer et étiqueter : `git tag -a v2.x -m "…"`.
4. **Toujours signer avec la même clé** (`journal-migraines-release.jks`, voir *Clé de signature*). Une autre clé obligerait à désinstaller l'appli, donc à repasser par une sauvegarde.

> Si vous distribuez votre propre version, changez l'identifiant `appId` dans `capacitor.config.json` (et `applicationId` dans `android/app/build.gradle`) pour qu'elle ne se confonde pas avec une autre installation.

## Historique des versions

| Version | Code | Contenu |
|---|---|---|
| **2.4.1** | 12 | Sécurité et maintenance, sans changement visible : les liens du widget et des raccourcis portent une clé propre à l'appli (une autre appli ne peut plus ajouter d'entrée au journal), passage à Capacitor 8, cible Android 16 (API 36) avec affichage bord à bord, outils de fabrication sans faille connue (`npm audit` : 0), empreinte de Gradle vérifiée, module Google Services inutile retiré. |
| **2.4.0** | 11 | Bilan plus précis : jours de mal par mois et seuil des 15 jours, critères ICHD-3 de la migraine (nouveaux signes : d'un seul côté, qui bat, pire en bougeant, aura, vomissements), 1er jour des règles et fenêtre menstruelle, efficacité 2 h après la prise (notification et question sur l'accueil), récurrences dans les 48 h, pistes « encore faibles » signalées ; tout est repris dans le rapport PDF. Journée type, graphique du bilan par bandes de force. |
| **2.3.0** | 10 | « Pas de mal » en un toucher, jour oublié signalé, *Forte* passe en mode crise, mode crise avec minuteur et *J'ai pris*, *Enregistrer* à chaque étape du formulaire, médicaments habituels en un toucher, onglet **Médecin** (rendez-vous, résumé, questions à poser), **Réglages** (prénom, petit nom, accords, ton), widget et raccourcis Android, action *J'ai pris…* dans la notification, libellés de 14 px minimum, APK de test via GitHub Actions. |
| **2.2.3** | 9 | Salutation de l'accueil sans cœur, captures d'écran mises à jour. |
| **2.2.2** | 8 | Version publique : licences des polices (OFL) jointes à l'APK, Android 7.0 minimum (la WebView d'Android 5 et 6 ne gère plus les couleurs de l'interface), lien de téléchargement dans le README. |
| **2.2.1** | 7 | Correction : le détail d'un jour (et le questionnaire MIDAS) s'ouvre sans flash, le panneau glisse du bas en même temps que le fond s'assombrit. |
| **2.2** | 6 | Sauvegarde automatique (copie à chaque note dans le dossier privé, incluse dans la sauvegarde Google du téléphone, notes retrouvées toutes seules au démarrage) et rappel de copie sur Drive chaque semaine. |
| **2.1** | 5 | Mode crise (appui long sur *Forte*), fin de crise en un toucher et notification, écart entre deux prises avec rappel, *Comme d'habitude*, questionnaire MIDAS, bilan plus fiable (seuils, aliments comparés, moment des crises, jauge médicaments, période 3 mois), rapport PDF aux couleurs de la v2, nouvelle icône et écran de démarrage, accessibilité (zoom 200 %, cibles de 44 px). |
| **2.0** | 4 | Refonte « Ciel intérieur » (aurore qui suit la journée, nouvelles polices, dock d'onglets, animations). Icônes météo pour la crise rapide. Bilan « En bref » en phrases simples. Accueil sans carte une fois la journée notée. Sécurité : données nettoyées à la restauration, CSP, jsPDF 4, APK de publication signé et non débogable. |
| **1.2** | 3 | Plusieurs médicaments dans une même journée, chacun avec son heure et son efficacité. Heure des repas. Détail du jour complet dans le calendrier, avec la journée heure par heure. Correction : les jours de douleur forte redeviennent visibles dans le calendrier. |
| **1.1** | 2 | Rappel du soir en notification, sans rappel si la journée est déjà notée. |
| **1.0** | 1 | Première version Android 100 % locale : journal, crise rapide, calendrier, bilans, rapport PDF, sauvegarde par le menu de partage, alerte médicaments, mode nuit. |

## Contribuer

Les suggestions et corrections sont les bienvenues : ouvrez une [issue](https://github.com/loic31000/journal-migraines/issues/new/choose) pour signaler un problème ou proposer une idée, ou une *pull request* avec vos modifications. Les règles du projet sont dans [CONTRIBUTING.md](CONTRIBUTING.md). Pour une faille de sécurité, voir [SECURITY.md](SECURITY.md).

## Licence

Distribué sous licence [MIT](LICENSE) : libre d'utiliser, modifier et redistribuer, sans garantie.

## Licences tierces

L'APK embarque, sans modification :

| Élément | Licence | Avis |
|---|---|---|
| Polices [Fraunces](https://github.com/undercasetype/Fraunces) et [Manrope](https://github.com/sharanda/manrope) (via Fontsource) | SIL Open Font License 1.1 | Texte joint dans l'APK : `vendor/fonts/OFL-Fraunces.txt` et `vendor/fonts/OFL-Manrope.txt` |
| [jsPDF](https://github.com/parallax/jsPDF) et [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | MIT | En tête de chaque fichier |
| [Capacitor](https://capacitorjs.com) et ses plugins officiels | MIT | Dépendances Android |

## Avertissement médical

Cette appli est un **carnet personnel**. Les pistes du bilan sont des observations, pas un diagnostic, et ne remplacent pas l'avis d'un médecin.

Consulter en urgence (15 ou 112) en cas de mal de tête **brutal et inhabituellement violent**, de **faiblesse d'un côté du corps**, de **difficulté à parler** ou de **fièvre avec raideur de la nuque**.
