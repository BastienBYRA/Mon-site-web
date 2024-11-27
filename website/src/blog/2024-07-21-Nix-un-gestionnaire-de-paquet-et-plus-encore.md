---
title: "Nix : Un gestionnaire de paquet, et plus encore"
filename: Nix-un-gestionnaire-de-paquet-et-plus-encore
description: "Nix est une CLI permettant de créer des environnements à la volée et de gérer facilement des dépendances. Cet article a pour but de la présenter."
image: "nix-main.png"
layout: layouts/article.njk
tags: article
date: 2024-07-21
dateText : 21 JUILLET 2024
subject:
    - TECH
    - NIX
    - ENVIRONNEMENT
    - GESTIONNAIRE DE PAQUET
metaKeywords: "Tech, Nix, NixOS, Environnement informatique, Gestionnaire de paquet, Devops"
metaImage: "../../assets/blog/Nix-un-gestionnaire-de-paquet-et-plus-encore/nix-main.png"
permalink: /blog/nix-un-gestionnaire-de-paquet-et-plus-encore/

scripts: >
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js" integrity="sha512-7Z9J3l1+EYfeaPKcGXu3MS/7T+w19WtKQY/n+xzmw4hZhJ9tyYmcUS+4QqAlzhicE5LAfMQSF3iFTK9bQdTxXg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/components/prism-bash.min.js" integrity="sha512-35RBtvuCKWANuRid6RXP2gYm4D5RMieVL/xbp6KiMXlIqgNrI7XRUh9HurE8lKHW4aRpC0TZU3ZfqG8qmQ35zA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-makefile.min.js" integrity="sha512-9MXjDxOwWNLJZRSwZRFdc1lvSIxld5c9DeLhySKjTAIEpj8a48Kezdc/hKjUsyD8S+oa3a+5SpuqdcCFodSI3Q==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
---

## Table des matières
- [Introduction](#introduction)
- [C’est quoi Nix](#cest-quoi-nix)
- [Comment installer Nix](#comment-installer-nix)
    - [Linux et WSL2](#linux-et-wsl2)
    - [MacOS](#macos)
- [Exemples : Environnement de développement : NodeJS - Java / Angular](#environnement-de-développement-nodejs-java-angular)
- [NixOS](#nixos)
    - [Installer et configurer des outils](#installer-et-configurer-des-outils)
- [Aquaproj, asdf, mise, devenv…](#aquaproj-asdf-mise-devenv)

## Introduction {#introduction}

Avez-vous déjà eu des problèmes avec des packages ?

Un package qui va installer tout un tas de choses dont on n’a pas la moindre idée de ce que c’est, ou encore un package qui vous installe une vieille version d’un outil (je parle de toi NodeJS !).

Peut-être que vous alternez fréquemment d’OS et que vous vous retrouvez souvent perdus quant à la manière d'installer ce que vous voulez ; noms de packages différents, versions différentes…

Peut-être n’avez-vous besoin de ces packages que pour un court instant, mais vous êtes tête en l’air, et vous les oubliez ?

Je pourrais continuer encore longtemps, mais là où je veux en venir, c’est que ce serait bien d’avoir un gestionnaire de paquets qui permettrait d’installer temporairement des paquets, facilement supprimables, qui fonctionne indépendamment de l'OS, et soyons fou ; Qui permettrait même de créer des environnements (de développement par exemple) pour des équipes de développeurs.

Si certaines de ces choses vous intéressent, je pense que Nix peut vous intéresser.

## C’est quoi Nix {#cest-quoi-nix}

Pour présenter simplement Nix : C’est un gestionnaire de paquets indépendant de l’OS qui permet de configurer la liste des paquets que l’on veut installer sur notre système à partir d’un fichier de configuration. Son but est de permettre de créer des environnements (de développement par exemple) reproductibles, fonctionnels indépendamment de la machine et de l’OS, facilement partageables, avec la possibilité de rollback en cas de problème si un package casse le système.

**TLDR :**
- Si un package installé sur un Ubuntu fonctionne, alors il fonctionnera sur tous les autres OS.
- Si la mise à jour d’un paquet casse le système, on peut rollback facilement.
- Permet de créer des environnements à la volée et de les partager à d'autres personnes.

En bref, Nix c’est ; Fiabilité, reproductibilité, le tout étant déclarative.

## Comment installer Nix {#comment-installer-nix}

L’installation de Nix varie légèrement selon votre système d’exploitation. Voici les instructions pour les principaux OS.

### Linux et WSL2 {#linux-et-wsl2}

Pour installer Nix sur Linux ou WSL2, exécutez la commande suivante dans votre terminal :

Tous les utilisateurs :
```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

Utilisateur courant :
```bash
sh <(curl -L https://nixos.org/nix/install) --no-daemon
```

### MacOS {#macos}

Pour les utilisateurs de Mac, vous n’avez qu’un moyen de l’installer (Tous les utilisateurs de la machine)
```bash
sh <(curl -L https://nixos.org/nix/install)
```

Pour voir l’ensemble des méthodes d’installation ; [https://nixos.org/download](https://nixos.org/download/)

## Exemple : Environnement de développement : NodeJS - Java / Angular {#environnement-de-développement-nodejs-java-angular}

Parlons peu, parlons bien ; Voyons comment installer des packages et créer un environnement de développement et installer divers outils pour configurer son PC ou son serveur.

La liste des packages disponibles est disponible ici : [https://search.nixos.org/packages](https://search.nixos.org/packages)

Prenons un exemple simple : Nous avons une équipe de développement qui travaille sur un projet ayant un Frontend en NodeJS / Angular, un Backend Java 17 / Spring. L'équipe a aussi besoin d'un outil pour interagir avec un S3.

Pour créer cet environnement de développement, on peut utiliser la commande `nix-shell -p` en spécifiant les packages nécessaires à cet environnement.

```bash
nix-shell -p nodejs jdk17 maven rclone
```

Voyons un peu les packages suivants :
- nodejs installe la LTS de Node, NPM, NPX et Corepack
- jdk17 installe le Java Development Kit dans sa version 17
- maven installe la LTS de Maven
- rclone installe la dernière version de Rclone

Il est possible de spécifier des versions ou non pour chaque package, comme je l’ai fait avec le JDK, j’aurais pu ne pas spécifier de version, auquel cas j’aurais installé le JDK 21.

Il y a aussi un second moyen pour créer un environnement, en utilisant une approche déclarative dans laquelle on définit dans un fichier nommé shell.nix ce que l’on veut.

Reprenons l’exemple précédent.

```json
let
  nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/nixos-24.05";
  pkgs = import nixpkgs { config = {}; overlays = []; };
in
  pkgs.mkShellNoCC {
    packages = with pkgs; [
      nodejs
      jdk17
      maven
      rclone
    ];
  }
```

Dans le premier bloc de code, on indique à notre script d’installer la dernière version (24.05) de nixpkgs (Répertoire des paquets de Nix), que l’on importe ensuite dans la variable pkgs. On utilise ensuite la fonction mkShellNoCC pour récupérer les paquets que l’on souhaite.

On lance notre environnement en utilisant la commande `nix-shell shell.nix`

Juste ainsi, nous avons un environnement prêt pour programmer, un environnement très simple, mais fonctionnel, et surtout facile à mettre en place.

## NixOS {#nixos}

Nix permet d’avoir un gestionnaire de paquets qui nous permet d’un coup d'œil de savoir les dépendances du système, pour peu que les dépendances soient toutes installées via Nix.

Peut-être que vous voudriez adopter cette façon de faire sur l’entièreté d’un OS, un OS dans lequel tous les paquets que l’on veut sont déclarés à l’avance, et dans lequel on peut savoir d’un coup d'œil tout ce qu’il y a dedans, pas de place à l’aléatoire.

Si c’est le cas, NixOS est l’un de vos meilleurs paris, la philosophie de Nix, mais appliquée à l'entièreté de la machine.

### Installer et configurer des outils {#installer-et-configurer-des-outils}

On peut aussi utiliser Nix pour installer différents outils : NGINX, Keycloak, NextCloud, Gitlab, LiveBook, Apache, ZSH, Kubernetes... et une multitude d'autres outils.

Prenons l’exemple de NGINX, je veux avec Nix installer la dernière version de NGINX, qui va écouter sur les ports 80 et 443. Je veux qu’il redirige les requêtes du port 80 sur 443 et écoute sur le chemin “/”. En prime, je veux aussi qu’il me génère un certificat SSL valide.

Vous pouvez trouver la documentation des différents outils sur le site officiel de Nix en cherchant l’outil voulu ; Ici NGINX : [https://nixos.wiki/index.php?search=Nginx&title=Special%3ASearch&profile=default&fulltext=1](https://nixos.wiki/index.php?search=Nginx&title=Special%3ASearch&profile=default&fulltext=1)

```json
{ pkgs ? import <nixpkgs> {} }:
{
  services.nginx = {
    enable = true;
    virtualHosts."bastienbyra.fr" = {
      addSSL = true;
      enableACME = true;
      forceSSL = true;
      root = "/website";
    };
  };
  # Permet de récupérer automatiquement un certificat SSL + Envoyer un mail pour renouveler le certificat SSL
  security.acme = {
    acceptTerms = true;
    defaults.email = "youremail@address.com";
    certs = {
      "bastienbyra.fr".email = "youremail@address.com";
    };
  };
}
```

Pour expliquer ce que fait cette configuration NGINX :

```json
services.nginx.enable = true
```

On indique que l’on veut lancer le serveur NGINX

```json
virtualHosts."bastienbyra.fr".addSSL
virtualHosts."bastienbyra.fr".enableACME
virtualHosts."bastienbyra.fr".forceSSL
```

Cette configuration est liée au port 443 et au SSL ;
- virtualHosts."bastienbyra.fr".addSSL indique que l’on veut écouter sur les ports 80 et 443
- virtualHosts."bastienbyra.fr".enableACME permet de générer automatiquement un certificat SSL avec Let’s Encrypt
- virtualHosts."bastienbyra.fr".forceSSL permet de faire une redirection HTTP vers HTTPS

```json
security.acme.acceptTerms = true;
security.acme.defaults.email = "youremail@address.com";
security.acme.certs."bastienbyra.fr".email = "youremail@address.com";
```

Cette configuration est liée au protocole ACME / Let’s Encrypt
- security.acme.acceptTerms permet d’accepter les conditions de service de Let’s Encrypt
- security.acme.defaults.email et security.acme.certs.<email>.email indiquent l’email utilisé pour créer le certificat et envoyer les mails de rappel de renouvellement du certificat

Juste comme ça nous avons un serveur web prêt à déployer un site web au monde entier.

Liste des champs disponibles pour configurer NGINX :
https://search.nixos.org/options?channel=24.05&from=0&size=50&sort=relevance&type=packages&query=services.nginx.

Liste des champs disponibles pour configurer l’ACME :
https://search.nixos.org/options?channel=24.05&from=0&size=50&sort=relevance&type=packages&query=security.acme.

Une liste d’outils avec des exemples de configuration :
https://nixos.org/manual/nixos/stable/#ch-configuration

## Aquaproj, asdf, mise, devenv… {#aquaproj-asdf-mise-devenv}

Nix est un des nombreux gestionnaires de paquets ayant pour but de créer des environnements. Une multitude d’autres projets prennent à bras-le-corps ce problème et proposent leur version ; certains outils s’orientent plus sur l’aspect “dev”, d’autres sur la mise en place complète d’un système, certains proposent des fonctionnalités que d’autres n’ont pas.

Mais en fin de compte, tous permettent de créer des environnements, à la volée ou persistants, à vous de voir lequel semble le mieux satisfaire votre besoin.

Pour mon usage, je ne me soucie pas vraiment de quel outil j’utilise. Nix propose plus de 100 000 paquets et a un site web qui répertorie la liste des paquets qu’il a, ce qui rend la recherche d’un paquet facile. C’est tout ce dont j’ai besoin pour le moment, donc mon choix se porte sur lui.

En fonction de si vous voulez l’utiliser pour créer des environnements sur votre PC, des serveurs, dans une CI/CD ou autre chose, prenez l’outil qui semble le mieux répondre à votre besoin.