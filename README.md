# Agent de Résumé Automatique des Réunions

Ce projet est un agent automatisé qui traite les enregistrements audio de réunions ou leurs transcriptions pour générer des résumés, analyser le sentiment, reconnaître les interlocuteurs et produire des visualisations.

## Fonctionnalités

- Transcription audio (pour les fichiers audio)
- Génération de résumé
- Analyse de sentiment
- Reconnaissance des interlocuteurs
- Génération de visualisations (graphique de fréquence des mots)
- Export des résultats en format DOCX

## Prérequis

- Node.js (version 14 ou supérieure)
- npm (généralement installé avec Node.js)

## Installation

1. Clonez ce dépôt :
   ```
   git clone https://github.com/votre-nom-utilisateur/agent-resume-reunion.git
   cd agent-resume-reunion
   ```

2. Installez les dépendances :
   ```
   npm install
   ```

3. Configurez les variables d'environnement :
   Copiez le fichier `.env.example` en `.env` et remplissez les valeurs requises :
   ```
   cp .env.example .env
   ```
   Puis éditez le fichier `.env` avec vos clés API et autres configurations.

## Utilisation

Pour traiter un fichier audio ou texte, utilisez la commande suivante :

```
node src/index.js <chemin-du-fichier> [--summary-type <type>]
```

- `<chemin-du-fichier>` : Le chemin vers le fichier audio (.mp3, .wav) ou texte à traiter.
- `--summary-type` : (Optionnel) Le type de résumé à générer. Les options sont 'global' (par défaut) ou 'detaille'.

Exemple :
```
node src/index.js ./reunions/reunion_20230515.mp3 --summary-type detaille
```

## Intégration LangSmith

Ce projet utilise LangSmith pour le traçage et le monitoring des performances. Pour utiliser LangSmith :

1. Assurez-vous d'avoir un compte LangSmith et d'avoir configuré votre clé API dans le fichier `.env`.
2. Les traces seront automatiquement envoyées à LangSmith pour chaque exécution du projet.
3. Vous pouvez visualiser les traces et les métriques de performance dans le tableau de bord LangSmith.

## Dépendances principales

- @langchain/openai : Pour l'interaction avec les modèles GPT
- @napi-rs/canvas : Pour la génération de visualisations
- docx : Pour la création de documents Word
- dotenv : Pour la gestion des variables d'environnement
- langsmith : Pour le traçage et le monitoring des performances

## Contribution

Les contributions à ce projet sont les bienvenues. Veuillez suivre ces étapes pour contribuer :

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
