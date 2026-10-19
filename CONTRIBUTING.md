# Contribuer

Merci de vouloir améliorer Mon Journal Migraines. Toute aide est la bienvenue : signaler un bug, proposer une idée, corriger un texte ou du code.

## Signaler un bug ou proposer une idée

Ouvrez une [issue](https://github.com/loic31000/journal-migraines/issues/new/choose) avec le modèle qui convient. Pour un bug, indiquez la version de l'appli (le numéro de la release installée), le modèle du téléphone et la version d'Android, et les étapes pour le reproduire.

**N'envoyez jamais vos notes ni une sauvegarde** : elles contiennent des données de santé. Décrivez le problème avec des données inventées.

Pour une faille de sécurité, ne passez pas par une issue publique : voir [SECURITY.md](SECURITY.md).

## Proposer une modification

1. Forkez le dépôt et créez une branche à partir de `main`.
2. Faites votre modification. L'appli tient dans un seul fichier, `www/index.html`.
3. Lancez les tests : `npm install` puis `npm test`. Tous doivent passer.
4. Ouvrez une *pull request* qui explique ce que vous changez et pourquoi.

## Règles du projet

- **100 % local** : aucune connexion réseau, aucun compte, aucun service tiers. L'appli n'a pas la permission Internet et doit le rester.
- **Accessibilité** : contrastes d'au moins 4,5:1 pour le texte et 3:1 pour les contours, zones à toucher de 44 px, compatible avec le lecteur d'écran TalkBack.
- **Sécurité** : toute donnée saisie ou restaurée affichée dans la page passe par `esc()`.
- **Textes** : en français, au tutoiement, neutres par défaut (sans forme au féminin ou au masculin qui vise la personne), sans tiret long (utiliser « - »). Les formes accordées passent par `G(neutre, féminin, masculin)` et les phrases au ton tendre par `T()` : elles n'apparaissent que si la personne les choisit dans les réglages. Ce qui est enregistré reste la forme neutre.
- **Pas de diagnostic** : l'appli observe, elle ne conclut pas à la place d'un médecin.
