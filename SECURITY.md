# Sécurité

Mon Journal Migraines garde des données de santé sur le téléphone. Les failles sont prises au sérieux.

## Versions suivies

Seule la [dernière version publiée](https://github.com/loic31000/journal-migraines/releases/latest) reçoit des corrections de sécurité.

## Signaler une faille

Merci de **ne pas ouvrir d'issue publique**. Utilisez le signalement privé de GitHub : onglet **Security** du dépôt, puis **Report a vulnerability**. Seuls les responsables du dépôt verront votre message.

Indiquez si possible :

- la version de l'appli et d'Android ;
- ce que la faille permet (lire des notes, exécuter du code, contourner une protection…) ;
- les étapes pour la reproduire, avec des données inventées.

## Ce qui protège déjà l'appli

- Aucune permission Internet : Android interdit toute connexion à l'appli.
- Données nettoyées à chaque lecture et restauration (types, longueurs, identifiants), texte échappé avant tout affichage.
- Politique de sécurité du contenu (CSP) : rien ne se charge depuis l'extérieur.
- APK de publication signé et non débogable.
- Liens du widget et des raccourcis (`journalmigraines://`) protégés : l'appli génère une clé aléatoire à son premier lancement, gardée dans son espace privé, et ignore tout lien qui n'a pas cette clé. Une autre appli installée ne peut donc pas ajouter d'entrée au journal.
- Fabrication vérifiable : versions des dépendances verrouillées (`package-lock.json`), empreinte de la distribution Gradle contrôlée au téléchargement, actions GitHub épinglées sur une empreinte.
