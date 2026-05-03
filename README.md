# Générateur d'Horaires Universitaires

Une application de bureau permettant de générer, visualiser et gérer facilement ses horaires de cours. Conçue pour éviter les conflits d'horaires et optimiser la sélection des cours obligatoires et optionnels.

## Téléchargement et Installation

Aucune installation d'environnement de programmation ou de machine virtuelle Java n'est requise. L'application est livrée sous forme d'exécutable natif.

1. Rendez-vous dans l'onglet **[Releases](../../releases)** situé à droite de la page du dépôt.
2. Téléchargez la version correspondant à votre système d'exploitation :
   * **macOS** : Téléchargez le fichier `GenerateurHoraires-macOS-arm64.dmg`. Double-cliquez et glissez l'application dans votre dossier *Applications*.
   * **Windows** : Téléchargez le fichier `GenerateurHoraires-1.0-x64.exe` et lancez l'installation.
   * **Linux / Ubuntu** : Téléchargez et installez le fichier `generateur-horaires_1.0_arm64.deb`.
3. Lancez l'application.

### MacOS

Si vous recevez un message indiquant que l'application n'a pas pu être ouverte sécuritairement:

1. Aller dans **Réglages** sous **Confidentialité et sécurité**. 
2. Vers le bas de la page, sous **Sécurité**, vous devriez voir le message: "L'élément GenerateurHoraires a été bloqué pour protéger votre Mac". Cliquez sur **Ouvrir quand même**.

## Fonctionnalités principales

* **Saisie des paramètres** : Ajout de cours avec leurs différents groupes (théorie, travaux pratiques) et spécification de leur statut (obligatoire ou optionnel).
* **Génération algorithmique** : Le moteur calcule automatiquement toutes les combinaisons d'horaires valides sans conflit.
* **Visualisation** : Affichage des horaires générés sous forme de calendrier.
* **Sauvegarde de session** : Enregistrement de l'état de travail pour un chargement ultérieur. Les données sont sauvegardées localement de manière sécurisée et isolée.
* **Gestion des données** : Interface intégrée pour la suppression de sessions ou la réinitialisation complète de l'environnement de l'application.

## Architecture et Technologies

Ce projet utilise une architecture hybride, séparant le traitement algorithmique de la présentation visuelle, encapsulée dans une application de bureau.

* **Backend (Java / JavaFX)** : Gère la logique d'affaires, l'algorithme pour la résolution des contraintes d'horaires, et l'accès au système de fichiers local.
* **Frontend (HTML / CSS / JavaScript Vanilla)** : Fournit une interface utilisateur dynamique, affichée au sein d'une `WebView`.
* **Communication inter-processus (DataBridge)** : Une classe Java liée dynamiquement au moteur JavaScript permet une communication bidirectionnelle et asynchrone entre l'interface Web et le contexte d'exécution Java.
* **Gestion d'état (Jackson)** : Sérialisation et désérialisation du modèle de données au format JSON pour les sauvegardes et la transmission inter-contexte.

## Compilation et exécution locale

Instructions destinées aux développeurs souhaitant cloner le code source ou compiler leur propre exécutable.

### Prérequis
* Java JDK (ex: OpenJDK 21 ou ultérieur)

> Le projet inclut le wrapper Maven (`mvnw` / `mvnw.cmd`). Aucune installation locale de Maven n'est nécessaire.

### Instructions pour la compilation

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/v-gagnon/generateur-horaire.git
   cd Generateur-Horaires
   ```

2. **Générer le Fat JAR :**
   Le projet utilise `maven-shade-plugin` pour empaqueter le code source compilé et toutes ses dépendances (incluant les bibliothèques externes et les ressources web) en un unique fichier exécutable.
   ```bash
   # Linux / macOS
   ./mvnw clean package

   # Windows
   mvnw.cmd clean package
   ```

3. **Créer l'exécutable natif (via jpackage) :**
   Il est impératif de cibler la classe `Launcher` plutôt que la classe principale héritant de `Application` afin d'éviter les erreurs d'initialisation des modules JavaFX lors de l'exécution hors module.

   Exemple de commande pour macOS :
   ```bash
   jpackage \
     --type dmg \
     --input target/ \
     --name "GenerateurHoraires" \
     --main-jar schedule-generator-1.0-SNAPSHOT.jar \
     --main-class com.vincentgagnon.horaires.Launcher \
     --icon deploy/logo.icns
   ```
   *(Ajustez l'argument `--type` selon l'environnement de compilation cible : `exe` sous Windows, `deb` sous une distribution Debian/Ubuntu).*

### Instructions pour l'exécution

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/v-gagnon/generateur-horaire.git
   cd Generateur-Horaires
   ```

2. **Exécuter l'application directement (sans créer d'exécutable) :**
   ```bash
   # Linux / macOS
   ./mvnw clean javafx:run

   # Windows
   mvnw.cmd clean javafx:run
   ```

---
Créé par Vincent Gagnon - Étudiant en Mathématiques et Informatique (UdeM)