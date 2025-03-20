---
title: Maintenir ses dépendances et conteneurs sécurisés et à jour avec Grype et Trivy
filename: Maintenir-ses-dependances-et-conteneurs-securises-et-a-jour-avec-grype-et-trivy
description: "Kompose est un outil facile à prendre en main permettant de transformer un fichier Docker-compose.yml en un ensemble de manifest Kubernetes."
image: "maintenir-ses-dependances-et-conteneurs-securises-et-a-jour-avec-grype-et-trivy.png"
layout: layouts/article.njk
tags: article
date: 2025-03-22
dateText : 22 MARS 2025
subject:
    - CONTENEURS
    - SECURITE
metaKeywords: "Grype, Trivy, safe code, code sécurité, français, Maintenir ses dépendances et conteneurs sécurisés et à jour avec Grype et Trivy"
permalink: "/blog/maintenir-ses-dependances-et-conteneurs-securises-et-a-jour-avec-grype-et-trivy/"

scripts: >
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/components/prism-bash.min.js" integrity="sha512-35RBtvuCKWANuRid6RXP2gYm4D5RMieVL/xbp6KiMXlIqgNrI7XRUh9HurE8lKHW4aRpC0TZU3ZfqG8qmQ35zA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-yaml.min.js" integrity="sha512-6O/PZimM3TD1NN3yrazePA4AbZrPcwt1QCGJrVY7WoHDJROZFc9TlBvIKMe+QfqgcslW4lQeBzNJEJvIMC8WhA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
---

## Table des matières :
- [Introduction](#introduction)  
- [Le choix du scanneur ; Grype ou Trivy](#le-choix-du-scanneur-grype-ou-trivy)  
- [Grype : Simplicité et rapidité](#grype-simplicite-et-rapidite)  
  - [Installation](#installation-grype)  
  - [Utiliser Grype](#utiliser-grype)  
  - [Implémenter Grype dans sa CI/CD](#implementer-grype-dans-sa-ci-cd)  
- [Trivy, le plus ancien, et populaire](#trivy-le-plus-ancien-et-populaire)  
  - [Installation](#installation-trivy)  
  - [Utiliser Trivy](#utiliser-trivy)  
  - [Implémenter Trivy dans sa CI/CD](#implementer-trivy-dans-sa-ci-cd)  
- [Lequel devrais-je choisir ?](#lequel-devrais-je-choisir)  
- [Comment être sûr que mon application est prête ?](#comment-etre-sur-que-mon-application-est-prete)  
- [Conclusion](#conclusion)  


## Introduction {#introduction}

Le développement logiciel tant à se concentrer sur le développement de l’application, réfléchissant comment optimiser et produire le meilleur code source et livrable possible.

Un aspect relégué au second plan est la mise à jour des dépendances de l'application.

Encore plus relégué, si ce n'est même ignoré, est la mise à jour et la sécurité liées aux dépendances de l'environnement conteneurisé de l'application, et ce malgré le fait que la conteneurisation soit une partie intégrante du développement d'applications modernes.

Un conteneur, au-delà d'une application, c'est un mini-environnement avec tout son lot de dépendances, que ce soit Ubuntu, Debian ou Alpine, tous embarquent de nombreux paquets, et tous sont susceptibles d'être une faille exploitable. 

Les enjeux de sécurité sont importants, et pourtant relégués au second plan, ce n'est pas parce qu'une application fonctionne qu'elle est bonne.

C'est le sujet de cet article : Comment assurer la qualité de son conteneur ; ses dépendances applicatives et son environnement conteneurisé, facilement et dans sa CI/CD.

## Le choix du scanneur ; Grype ou Trivy {#le-choix-du-scanneur-grype-ou-trivy}

Pour assurer la qualité des dépendances de notre application et de son environnement, nous aurons besoin d'un scanner capable de comprendre les librairies de notre système et de notre application, et cross-checker si nos dépendances ont des failles, avec la capacité à proposer des solutions.

Plusieurs outils permettent de répondre à cette problématique, certains accès sur l'application elle-même, d'autres sur le système. Grype et Trivy sont tous deux des exemples capables de remplir leurs objectifs.

Bien que je ne vais pas explorer en détail chacun, je vais tout de même faire un tour de chacun d'entre eux pour vous montrer comment ça fonctionne et comment l'intégrer dans votre CI/CD avec Gitlab CI.

## Grype : Simplicité et rapidité {#grype-simplicite-et-rapidite}

Commençons par Grype, la meilleure façon de le décrire, c’est que c’est un outil très simple à mettre en place, et très rapide dans son exécution.

Grype est compatible avec beaucoup d'OS et langages de programmation / gestionnaire de paquets, allant d'OS comme Alpine, Debian, Ubuntu, Red Hat ou les Distroless à des langages de programmation comme Java, Python, Golang, .NET, JavaScript, Rust…

La liste complète des OS et gestionnaires de paquets de langage de programmation avec lesquels il est compatible est [juste ici](https://github.com/anchore/grype?tab=readme-ov-file#features)

### Installation {#installation-grype}

Il est possible de l’installer via Chocolatey, Homebrew, MacPorts ou via une commande curl
```bash
# curl (Linux, MacOS, WSL)
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin

# Chocolatey
choco install grype -y

# Homebrew
brew tap anchore/grype
brew install grype

# MacPorts
sudo port install grype
```

Pour confirmer l'installation de Grype, vous pouvez exécuter la commande `grype version`

```bash
# Commande
grype --version
grype 0.87.0
```

### Utiliser Grype {#utiliser-grype}

Grype est très simple d'utilisation, pour scanner une image, vous utilisez `grype <votre-image>`

```bash
# Scanner une image
grype <image>

# Scanner une image, et crash en cas de faille de sécurité supérieur ou égal à “High”
grype --fail-on high <image>

# Sauvegarder la liste des failles dans un fichier
grype –file <file> <image>

# Obtenir la sortie du scan au format JSON
grype -o json <image>

# Obtenir la sortie du scan au format CycloneDX
grype -o cyclonedx <image>

# Pour ne garder que les failles qui peuvent être fixé
grype --only-fixed <image>

# Et encore plus en faisant grype –help
```

Je vous laisse regarder le reste des options de votre côté.

### Implémenter Grype dans sa CI/CD {#implementer-grype-dans-sa-ci-cd}

Ci-dessous un exemple d’implémentation basique de Grype dans sa CI/CD en utilisant docker-dind avec un projet Golang.

```yaml
default:
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    # Je clone un projet Golang qui servira de code de test
    - apk add curl git
    - git clone https://github.com/mccuskero/go-simple-docker.git
    - cd go-simple-docker
    - docker build -f ./Dockerfile -t golang-simple-project:v1 .

stages:
  - scan

scanner-grype:
  stage: scan
  script:
    - curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
    - grype --version
    - grype --fail-on high golang-simple-project:v1
  script:
    - curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
    - grype --version

    # v1 : Vérifie s'il y a des vulnérabilités
    # Sauvegarde la liste des vulnérabilités dans deux fichiers, et crash s'il trouve une vulnérabilité HIGH ou CRITICAL
    - grype --output cyclonedx=grype-scan-result.cdx --output json=grype-scan-result.json --fail-on high golang-simple-project:v1
    
    # v2 : Print le contenu du scan et vérifie s'il y a des vulnérabilités
    # Si on veut print le résultat avant de crasher la CI/CD en cas de vulnérabilité trouvée
    - grype golang-simple-project:v1
    - grype --output cyclonedx=grype-scan-result.cdx --output json=grype-scan-result.json --fail-on high golang-simple-project:v1
  artifacts:
    paths:
      - grype-scan-result.json
      - grype-scan-result.cdx
```

Vous pouvez consulter la sortie de ce job [juste ici](https://gitlab.com/BastienBYRA/scanner-blog-test/-/jobs/9268763204)

## Trivy, le plus ancien, et populaire {#trivy-le-plus-ancien-et-populaire}

Trivy est, je pense, l'outil le plus connu de cette liste, il offre la possibilité de scanner des images, mais pas uniquement.

Que ce soit une image, un répertoire de code, un cluster Kubernetes, un système de fichier local, des binaires, Trivy est un outil très versatile dans son domaine ; Le scan.

En revanche, je vais ici me concentrer uniquement sur l'aspect "image" de Trivy.

### Installation {#installation-trivy}

Il est possible de l'installer via Homebrew, Nix-env, Docker ou une commande curl
```bash
# curl (Linux, MacOS, WSL)
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sudo sh -s -- -b /usr/local/bin v0.59.1

# Docker
docker pull aquasec/trivy:latest

# Homebrew
brew install trivy

# Nix-env (Communauté)
nix-env --install -A nixpkgs.trivy

# Le reste des procédures spécifiques à l'OS Linux sur le site : https://blog.nashtechglobal.com/installing-trivy-on-different-operating-systems/
```

### Utiliser Trivy {#utiliser-trivy}

Trivy, comme Grype, est très simple d'utilisation. Pour scanner une image, vous utilisez `trivy image <votre-image>` ou `trivy i <votre-image>`

```bash
# Scanner une image
trivy i <image>

# Scanner une image et crasher en cas de faille de sécurité supérieure ou égale à "High"
trivy i --severity HIGH --exit-code 1 <image>

# Sauvegarder la liste des failles dans un fichier
trivy i --output <file> <image>

# Obtenir la sortie du scan au format JSON
trivy i --format json <image>

# Obtenir la sortie du scan au format CycloneDX (Utiliser la sortie CycloneDX désactive le scanner de vulnérabilité par défaut, il faut lui spécifier –scanners vuln)
trivy i --format cyclonedx –scanners vuln <image>

# Pour ne garder que les failles qui peuvent être fixées
trivy i --ignore-unfixed <image>

# Et plus encore en faisant trivy i --help
```

Encore une fois, je vous laisse regarder le reste des options de votre côté.

### Implémenter Trivy dans sa CI/CD {#implementer-trivy-dans-sa-ci-cd}

Ci-dessous un exemple d’implémentation basique de Trivy dans une CI/CD GitLab en utilisant docker-dind avec le même projet Golang.

```yaml
default:
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    # Je clone un projet Golang qui servira de code de test
    - apk add curl git
    - git clone https://github.com/mccuskero/go-simple-docker.git
    - cd go-simple-docker
    - docker build -f ./Dockerfile -t golang-simple-project:v1 .

stages:
  - scan

scanner-trivy:
  stage: scan
  script:
    - curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v0.59.1
    - trivy -v
    # Récupère les failles au format JSON
    - trivy image --format json -o trivy-scan-result.json --list-all-pkgs golang-simple-project:v1

    # Print la liste complète des erreurs sous forme de tableau pour consulter la liste de failles depuis depuis la CI/CD
    - trivy convert --format table trivy-scan-result.json

    # Sauvegarde le fichier au format CycloneDX
    - trivy convert --format cyclonedx --output trivy-scan-result.cdx trivy-scan-result.json

    # Analyse et crash la CI/CD si une faille HIGH ou CRITICAL est trouvé
    - trivy convert --exit-code 1 --severity HIGH trivy-scan-result.json
  artifacts:
    paths:
      - trivy-scan-result.json
      - trivy-scan-result.cdx
```

Vous pouvez consulter la sortie de ce job [juste ici](https://gitlab.com/BastienBYRA/scanner-blog-test/-/jobs/9268763208)

Vous pouvez consulter sur le [site officiel](https://trivy.dev/v0.59/tutorials/integrations/) de Trivy des implémentations plus poussées de celui-ci dans différentes CI/CD (GitHub Actions, GitLab CI, CircleCI…) 

## Lequel devrais-je choisir ? {#lequel-devrais-je-choisir}

Je vous répondrais : “Les deux”.

La réponse n'est pas si déconnante, les deux outils se basent sur des bases de données de CVEs, et bien que l'on pourrait s'attendre à ce que les deux remontent les mêmes erreurs, ce n'est pas le cas.

Il est tout à fait possible que l'un trouve une faille que l'autre n'aurait pas. De la même manière qu'il est tout à fait possible que l'un lève un faux-positif et pas l'autre, avoir deux scanners est une mesure de sûreté pour minimiser les risques de laisser passer une faille.

## Comment être sure de sure que mon applications est prête ? {#comment-etre-sur-que-mon-application-est-prete}

Au fil des années, beaucoup d'outils ont émergé visant à s’assurer que son application est production-ready, ci-dessous quelques outils qui peuvent être intéressants à intégrer dans votre workflow.

- Trivy ; Je l’ai déjà mentionné, mais Trivy ne se limite pas uniquement à l’analyse d’image, vous pouvez l’utiliser pour scanner votre répertoire Git ou le binaire de votre application.
- Opengrep (Version Open-Source de Semgrep) : Analyseur de code statique en fonction de règles de la communauté (Ou règle personnalisée)
- Kics : Analyseur en tout genre, de votre Ansible à votre CI/CD jusqu'à votre Docker, Helm ou Terraform.
- Docker Bench Security : Si vous déployez sur un VPS / une VM, un script permettant de vérifier et remonter des problèmes liés à la configuration Docker de l'host

## Conclusion {#conclusion}

Oserais-je dire qu’une application n’est plus seulement qu’une application, mais un écosystème entier ? Je le ferai, avec la démocratisation des conteneurs une application est packagée dans un mini-environnement, et il est de notre responsabilité de s’assurer que cet environnement soit propre et infaillible.

Il est commun de créer des tests dans son application pour assurer le bon comportement de celui-ci, mais selon les projets, assurer la mise en place de mesures de sécurité ne semble pas l'être, (car considéré comme n'apportant que peu, voire pas de valeur ajoutée dans l'immédiat).

Mais le jour où un problème lié à ce manque de sécurité viendra, il sera probablement trop tard.

Donc je conclurais en disant que ouais, c'est cool de lancer des scans sur ses applications, c'est rapide, relativement efficace, et vraiment pas compliqué à mettre en place.

(Eh bien, le corriger peut l'être, mais au moins vous aurez conscience que oui, il y a un problème, et c’est vraiment ce qui m’importe, avoir conscience des problèmes potentiels.)
