---
title: Sandboxer son environnement de développement avec Docker
description: "Les attaques supply chain comme Shai-Hulud exploitent la confiance qu'on accorde à nos dépendances. Voici comment isoler son dev dans un conteneur Docker."
image: "Sandboxer-son-environnement-de-développement-avec-Docker.png"
date: 2026-05-25
tags: SECURITE, VULNERABILITE, CONTENEUR, DOCKER
---

## Table des matières :
- [Introduction](#introduction)  
- [Environnement isolé](#environnement-isole)
  - [Conteneur et développement](#conteneur-et-developpement)
    - [Création de l'environnement](#creation-de-l-environnement)
    - [Inclure son code](#inclure-son-code)
    - [Récupérer les dépendances](#recuperer-les-dependances)
    - [Déconnecter le conteneur du monde extérieur](#deconnecter-le-conteneur-du-monde-exterieur)
    - [Durcir le conteneur](#durcir-le-conteneur)
- [Dev Containers](#dev-containers)
- [Isolation et friction](#isolation-et-friction)
- [Conclusion](#conclusion)

## Introduction {#introduction}
Bonjour à vous, cher lecteur,

À l'heure où j'écris ces lignes, une nouvelle (et énième) attaque par la chaîne d'approvisionnement (*Supply Chain Attack*) a touché NPM.

De son petit nom *Mini Shai-Hulud*, elle s'inscrit dans la famille des *Shai-Hulud*, un nom qui pourrait ne pas vous être inconnu.

Pour faire court : cette nouvelle attaque est la troisième de la famille des Shai-Hulud, et toutes visent à injecter du code malveillant dans des dépendances JavaScript / Node.js afin de dérober des informations sur les systèmes informatiques.

Cette nouvelle attaque soulève de nouveau certains problèmes inhérents au fonctionnement de NPM :

- Le manque de vérification sur ce qui est publié sur la registry NPM ;
- Le fonctionnement de la commande `npm install`, qui est capable de lancer du code arbitraire et malveillant.

Contrairement à un langage comme Go, qui se contente d'installer les dépendances sans les exécuter, les dépendances NPM peuvent définir des scripts qui seront exécutés pendant le téléchargement, ce qui permet d'y glisser du code malveillant.

Bien que je sois d'accord avec le second point, qui est dangereux, je ne le suis pas avec le premier, et je pense qu'il révèle quelque chose sur notre façon de faire : Nous faisons confiance sans rien vérifier.

Permettez-moi de vous poser une question, cher lecteur : Vérifiez-vous le code des dépendances que vous importez ? Je pense pouvoir affirmer sans crainte que ce n'est pas le cas de la majorité d'entre vous.

C'est pourtant quelque chose de complètement aberrant ; Pourquoi accorderions-nous notre confiance à du code externe que l'on ne connaît pas, que l'on ne maîtrise pas, et qui n'apporte aucune garantie ?

Quand on y pense, on ne connaît vraiment rien à ce que l'on utilise : L'architecture de nos processeurs, le noyau Linux, SSH, TLS... Sauriez-vous expliquer, non pas théoriquement mais en pratique ce qu'ils font exactement ?

Tout ce sur quoi l'on bâtit nos projets est un château de cartes qui n'attend que d'être soufflé, et qui tient majoritairement sur la bonne volonté de quelques personnes, sur leur temps libre.

Quand on installe des dépendances, on croise simplement les doigts en se disant : "Ça ne peut pas m'arriver, ce serait trop bête, ça n'arrive qu'aux autres, et puis le projet est connu, il doit bien y avoir des sécurités solides !"

D'autres prennent les devants. Pour rester dans l'écosystème JavaScript, cela peut être de passer de NPM à PNPM, qui ne lance pas les scripts `postinstall` des dépendances par défaut, ce qui permet d'éviter bien des problèmes.

D'autres encore, à tort ou à raison, vont rester sur des versions plus anciennes de leurs dépendances et attendre bien sagement que les nouvelles versions soient *battle-tested*. C'est, ironiquement, à la fois une solution qui fonctionne et une qui ferait s'arracher les cheveux à quiconque est soucieux de la sécurité : Après tout, les nouvelles versions existent aussi pour corriger les failles des anciennes.

## Environnement isolé {#environnement-isole}

Je parle beaucoup (enfin, j'écris plutôt), mais n'y a-t-il pas un moyen de mitiger et/ou de diminuer les risques de subir de telles attaques ?

Spoiler : c'est partiellement possible.

Des entreprises comme Socket ou Snyk fondent leur activité là-dessus : Elles fournissent des services de sécurité et sont capables d'identifier rapidement si des paquets contiennent du code malveillant.

Mais cette connaissance, cette sécurité, vient avec un coût qui peut faire exploser les budgets.

Une autre solution, qui ne règle pas le problème, mais qui permet d'en éviter les effets néfastes consiste à simplement ne jamais installer ni exécuter ses dépendances en local.

Plutôt que d'utiliser son OS comme hôte d'un virus potentiel, il vaut peut-être mieux travailler dans un environnement isolé et cloisonné.

Et c'est possible : Une machine virtuelle, un serveur jetable, ou encore un conteneur... les solutions ne manquent pas.

Dans cet article, je voudrais explorer cette dernière piste : L'utilisation d'un conteneur pour développer.

### Conteneur et développement {#conteneur-et-developpement}

#### Création de l'environnement {#creation-de-l-environnement}

La première chose à faire pour développer dans un conteneur est d'en préparer l'environnement. Il faut créer un Dockerfile, qui servira de base à notre nouvel environnement.

Je prend comme exemple un programme Go utilisant un serveur gRPC / Protobuf pour communiquer.

```dockerfile
# Image de base officielle Go (Debian Bookworm)
FROM golang:1.26-bookworm

# Installation du compilateur Protobuf
RUN apt-get update \
    && apt-get install -y protobuf-compiler \

# Création d'un utilisateur non-root (limite les droits du code exécuté)
RUN useradd --create-home --uid 1000 dev
USER dev

WORKDIR /home/dev/app
```

Dans cet exemple, l'environnement de base repose sur l'image officielle Go et installe l'outil `protoc`, nécessaire pour générer le code Go à partir des fichiers Protobuf. On y crée également un utilisateur non-root : si quelque chose tourne mal, le code malveillant s'exécutera avec des droits limités plutôt qu'en `root`.

#### Inclure son code {#inclure-son-code}

L'environnement est désormais prêt ; il faut maintenant y inclure son code.

La méthode la plus simple est de créer un *bind mount* pour monter le répertoire de code dans le conteneur :

```bash
# Construction de l'image
docker build -t go-sandbox .

# Lancement avec un bind mount sur le répertoire courant
docker run --rm -it \
    -v "$(pwd)":/home/dev/app \
    go-sandbox bash
```

Mais je vais chercher la petite bête. Le problème d'un *bind mount*, c'est qu'il s'agit d'un lien direct vers notre répertoire de travail. Si du code malveillant s'exécute dans le conteneur, il peut lire les fichiers voisins, modifier nos fichiers, voire y glisser une porte dérobée, et ces modifications se retrouvent instantanément sur notre machine hôte.

Pour limiter ce risque, on peut utiliser un volume Docker dans lequel on injecte une **copie** du code, que l'on branche ensuite sur le conteneur. Le conteneur ne travaille alors plus directement avec nos fichiers, mais sur une copie isolée :

```bash
# 1. Création du volume
docker volume create code-volume

# 2. Conteneur "copy-code-to-volume" temporaire pour alimenter le volume
docker create --name copy-code-to-volume -v code-volume:/project-code alpine
docker cp ./. copy-code-to-volume:/project-code
docker rm project-code

# 3. Lancement du conteneur de dev branché sur le volume
docker run --rm -it \
    -v code-volume:/home/dev/app \
    go-sandbox bash
```

Cette isolation a néanmoins une contrepartie qu'il est nécéssaire de prendre en compte : Le volume ne contient qu'une *copie à instant donné* du code, figé à l'instant de la copie. 

Il n'existe aucun lien vivant entre le répertoire de travail et le conteneur ; Concrètement, à chaque modification du code, il faut remettre le volume à jour, c'est-à-dire rejouer l'étape 2 (le conteneur "copy-code-to-volume" suivi du `docker cp`) pour que le conteneur prenne en compte les changements. C'est une manipulation manuelle et répétitive, qui rompt la boucle de retour immédiate qu'offrait le *bind mount*.

J'y reviendrai plus loin, dans "Le revers de la médaille".

#### Récupérer les dépendances {#recuperer-les-dependances}

Si, comme moi, vous décidez de vous compliquer la vie en suivant la seconde option, il faut alors prendre en compte le besoin de récupérer les dépendances logicielles (ici, celles de Go) fraîchement installées. Sans elles, notre IDE ne peut pas fournir des fonctionnalités basiques comme la documentation ou l'autocomplétion pour le code issu des dépendances.

Pour cela, il faut copier le contenu du volume sur la machine hôte :

```bash
# Récupération du contenu du volume vers la machine hôte
docker create --name extract-code-container -v code-volume:/project-code alpine
docker cp extract-code-container:/project-code/. ./
docker rm extract-code-container
```

À noter : pour Go, les dépendances téléchargées sont stockées dans le cache des modules plutôt que dans le répertoire du projet. Pour que l'IDE résolve correctement tout le code des dépendances, le plus simple est soit de vendoriser ces dernières avec `go mod vendor` (qui les place dans un dossier `vendor/` à la racine du projet, et donc dans le volume), soit de persister ce cache dans un second volume et de le copier lui aussi sur l'hôte.

Du moment que l'on ne build pas le projet en local, il n'y a aucun risque que du code malveillant présent dans les dépendances s'exécute.

#### Déconnecter le conteneur du monde extérieur {#deconnecter-le-conteneur-du-monde-exterieur}

Bien que ce ne soit pas toujours possible selon les projets, on peut purement et simplement désactiver les fonctionnalités réseau de Docker, faisant alors du conteneur quelque chose de véritablement isolé et cloisonné :

```bash
docker run --rm -it \
    --network none \
    -v code-volume:/home/dev/app \
    go-sandbox bash
```

La majorité des attaques par *Supply Chain* visent à extraire des données confidentielles de la machine qu'elles infectent. En bloquant les connexions réseau, il devient impossible pour le code malveillant d'envoyer les données collectées vers un serveur distant.

Cette approche peut avoir du sens pour un langage comme Go, où l'installation des dépendances ne peut pas déclencher d'attaque, mais où l'exécution du code (et donc des dépendances) le peut.

En revanche, elle est moins adaptée à un projet JavaScript : Ce type d'attaque réside en partie dans les scripts `postinstall`, lancés dès l'installation des dépendances, c'est-à-dire à un moment où le conteneur a *justement* besoin du réseau pour télécharger ces dépendances. Couper totalement le réseau empêcherait donc l'installation elle-même.

Cela ne rend pas la démarche inutile pour autant : Si une faille se trouve dans la dépendance elle-même, et non dans un script `postinstall`, désactiver le réseau l'empêchera d'envoyer des données au lancement de l'application.

Le juste milieu, lorsque couper totalement le réseau n'est pas envisageable, consiste à filtrer le trafic sortant via un firewall : On n'autorise que les connexions vers la *registry* et l'on bloque tout le reste. Un script `postinstall` malveillant pourrait alors toujours installer ses dépendances, mais ne pourrait plus exfiltrer quoi que ce soit vers le serveur de l'attaquant. Le problème cependant est que ça nécéssite de faire des modifications au niveau de la machine hôte pour appliquer ces règles réseaux.

**Note :** `--network none` désactive toutes les interfaces réseaux du conteneur, y compris le loopback. Cela rend impossible l'accès à un serveur de développement local depuis le navigateur de l'hôte (par exemple `localhost:3000`). Cette option ne convient pas à toutes les applications.

#### Durcir le conteneur {#durcir-le-conteneur}

Couper le réseau protège de l'exfiltration, mais ne dit rien de ce que le code malveillant peut faire à l'intérieur du conteneur. Or, par défaut, un conteneur est permissif. Quelques options permettent de resserrer la vis, chacune fermant une porte différente.

**Tourner en utilisateur non-root.** : C'est déjà ce que l'on fait notre Dockerfile avec l'instruction `USER dev`. Beaucoup d'images officielles s'exécutent en `root` par défaut, ce qui signifie que le moindre code lancé hérite des pleins pouvoirs dans le conteneur. Un utilisateur non privilégié limite considérablement ce qu'un attaquant faire.

**Retirer les *capabilities* Linux** avec `--cap-drop ALL`. : Les *capabilities* sont des droits *segmenté* de l'utilisateur root (modifier l'horloge système, changer le owner des fichiers, ignorer les permissions des fichiers, etc...). Un environnement de développement en a rarement besoin ; On les supprime donc toutes, quitte à n'en réajouter qu'une via `--cap-add` si un cas précis l'exige.

**Bloquer l'escalade de privilèges** avec `--security-opt no-new-privileges` : Cette option empêche un processus de gagner de nouveaux droits en cours d'exécution.

**Passer le système de fichiers en lecture seule** avec `--read-only` : Le système de fichier peut être lu, mais plus écrit, ce qui empêche, par exemple, de déposer un binaire malveillant. Comme certains outils ont besoin d'écrire, on peut leur fournir des espaces d'écritures avec `--tmpfs` ou des volumes, qui ne sont pas affectés par le *readonly*. Cette option brille surtout lorsqu'on se contente d'exécuter du code non fiable.

Mises bout à bout, ces options donnent une commande de lancement nettement plus défensive :

```bash
docker run --rm -it \
    --network none \
    --cap-drop ALL \
    --security-opt no-new-privileges \
    --read-only \
    --tmpfs /tmp \
    --tmpfs /writable-path \
    -v code-volume:/home/dev/app \
    go-sandbox bash
```

(L'utilisateur non-root, lui, est déjà appliqué par l'image grâce au `USER dev` du Dockerfile.)

En combinant chaque optionnn on diminue la surface d'attaque exploitable par un attaquant.

## Dev Containers {#dev-containers}

Toute la gymnastique précédente ; Ecrire un Dockerfile, monter le code, récupérer les dépendances, recopier le volume à chaque modification, est précisément ce que les **Dev Containers** cherche à automatiser.

Le principe est simple : Un fichier `devcontainer.json`, versionné avec le projet, décrit l'environnement de développement (image de base, outils à installer, extensions, ports à exposer...). Des outils comme VS Code, IntelliJ, Cursor ou la CLI `devcontainer` se chargent ensuite de construire le conteneur et d'y connecter l'éditeur.

Mais, peut-etre que vous l'avez vu venir, ce confort à un prix ; Dev Container est une *extension* d'éditeur, cette extension est du code tiers, téléchargé depuis une marketplace, qui s'exécute sur l'OS de la machine hôte.

Je doute déjà que vous lisiez le code des dépendances que vous utilisez, mais lisez-vous le code des extensions de votre IDE, lisez-vous les commentaires des nouvelles versions ? Non, probablement pas.

On retombe alors exactement sur le problème qui ouvrait cet article : Nous avons cloisonné nos dépendances logicielles pour ne plus avoir à leur accorder une confiance aveugle... et nous reportons cette même confiance aveugle sur notre outillage, susceptible eux aussi de subir une attaque de *supply chain*, comme l'a récemment prouvé l'extension Nx Console.

## Isolation et friction {#isolation-et-friction}

L'isolation du code apporte de la sécurité, mais avec ça vient aussi avec les frictions que ça engendre au quotidien.

Si vous utilisez la méthode du volume Docker pour faire transiter les données, vous bloquer complètement le fonctionnement du *hot reload* ; Il n'y a plus de feedback immédiat après chaque modification, il faut relancer la copie des fichiers

Le *hot reload*, avec la méthode que je privilégie, le conteneur travaille sur une *copie* du code injectée via `docker cp` : il n'existe donc plus aucune synchronisation en direct entre la machine et le conteneur.

L'option `--network none` n'est pas adapté au application web, il bloque l'accès au conteneur depuis la machine hôte, seul des outils comme `curl` ou `wget` depuis l'intérieur du conteneur peuvent obtenir un retour de l'application.

Le `--read-only` bloque l'écriture dans le conteneur, si on ne prévoie pas des espaces d'écriture, ça peut casser le fonctionenement de l'application.

En bref, chaque option, chaque sécurité, à un prix à payer, il n'y a pas de solution parfaite apportant sécurité et confort.

Il est aussi important de noté que cela ne protège que le poste de travail. Une fois l'application déployée, elle doit bien parler au monde extérieur : Bases de données, service de cache, API tierces... Le réseau est de nouveau ouvert, et si du code malveillant embarqué dans une dépendance s'exécute au *runtime*, la porte de l'exfiltration se rouvre.

(Notez que le vecteur `postinstall`, lui, se déclenche à l'installation : en production, où l'on lance un artefact déjà construit, ce risque-là est généralement derrière nous, c'est l'exécution du code de la dépendance qui demeure le danger.)

Peut-on alors rejouer en production la même logique de cloisonnement ? En partie, oui. On peut n'autoriser que les destinations dont le service a réellement besoin et bloquer tout le reste via un firewall, on peut aussi mettre le système en *read-only*, mais il faut réfléchir à l'impact de ces choix, et être sûr que l'on ne crée pas d'effet de bord.

## Conclusion {#conclusion}

Le point de départ de cet article était sur la confiance aveugle que l'on accorde au code d'autrui, un code inconnu, que l'on ne maîtrise pas, et qui est susceptible d'être compromis à tout moment.

Les attaques de la famille Shai-Hulud ne sont que le rappel le plus récent de cette réalité.

Le conteneur ne supprime pas ce problème, mais il déplace le risque hors de votre machine : Si le problème venait à arriver, alors ce serait un environnement jetable et sans grande valeur qui le subirait, et pas une machine hôte bien plus susceptible de contenir des informations de valeur.

C'est une barrière, mais pas une solution définitive, il mitige le problème, rien de plus.

En fin de compte, il est important de se poser la question, *à qui* et *à qui* accordons-nous notre confiance, et quelle mesure avons-nous en place quand il deviendra une menace.

Un environnement isolé est une première étape, mais seulement l'une parmis tant d'autre.