---
title: Sécuriser vos conteneurs avec le Distroless
filename: Securiser-vos-conteneurs-avec-le-distroless
description: "Le distroless est une méthode de sécurisation des conteneurs que j'explore dans cet article, nous allons voir les solutions disponibles pour le mettre en place et la manière de l'utiliser."
image: "securiser-vos-conteneurs-avec-le-distroless-thumbnail.png"
layout: layouts/article.njk
tags: article
date: 2024-10-29
dateText : 29 OCTOBRE 2024
subject:
    - CONTENEURS
    - DISTROLESS
    - SECURITE
metaDescription: "Le distroless est une méthode de sécurisation des conteneurs que j'explore dans cet article, nous allons voir les solutions disponibles pour le mettre en place et la manière de l'utiliser."
metaKeywords: "Conteneurs docker, sécurite, distroless, image distroless, mise en place de containers docker distroless"
metaImage: "../../assets/blog/Securiser-vos-conteneurs-avec-le-distroless/securiser-vos-conteneurs-avec-le-distroless-thumbnail.png"
permalink: "/blog/securiser-vos-conteneurs-avec-le-distroless/"

scripts: >
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js" integrity="sha512-AKaNmg8COK0zEbjTdMHJAPJ0z6VeNqvRvH4/d5M4sHJbQQUToMBtodq4HaV4fa+WV2UTfoperElm66c9/8cKmQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/components/prism-bash.min.js" integrity="sha512-35RBtvuCKWANuRid6RXP2gYm4D5RMieVL/xbp6KiMXlIqgNrI7XRUh9HurE8lKHW4aRpC0TZU3ZfqG8qmQ35zA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-docker.min.js" integrity="sha512-9k3cElbQmGrx87BKL+FCoFtorWth0yIMAvi4CZFv0xRmrL1Bfn6/X2dPJKMQSFibxNgMqo/FKoz/eyAOOKZgOA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
---

## Table des matières
- [Introduction](#introduction)
- [From Scratch](#from-scratch)
- [Les conteneurs Distroless de Google](#les-conteneurs-distroless-de-google)
    - [Exemple](#exemple-google-container)
- [Wolfi : l'OS pour les conteneurs](#wolfi-l-os-pour-les-conteneurs)
- [Conclusion](#conclusion)
- [Liens utiles](#liens-utiles)

## Introduction

Lorsqu'on crée une image Docker, on utilise une image qui servira de base.

Celle-ci peut être :

- une distribution Linux comme Debian, Ubuntu ou Alpine,
- une image contenant le langage de programmation nécessaire à notre projet,
- une image contenant un outil requis pour le projet.

Il existe de nombreuses options, mais l'essentiel à retenir est que toutes les images Docker sont basées sur une autre, et il est probable que cette base soit une distribution Linux ou une image qui en utilise une.

Mais est-il possible de se passer complètement d'une distribution Linux ? Après tout, si le but est de déployer une application ou un service, n’y aurait-il pas des avantages à se détacher de cette base Linux ?

Ne pas utiliser de distribution Linux offrirait plusieurs avantages :

- une surface d'attaque réduite,
- un temps de construction plus rapide,
- un déploiement plus rapide,
- une image plus légère.

Des avantages intéressants, mais est-ce même possible ?

## From Scratch

L'image Debian, par exemple, utilise "Scratch" comme base. C'est l'image la plus minimale possible, dépourvue de tout.

Cette image "vide" n'a généralement qu'une seule fonction : lancer un binaire statique, comme l'exécutable de votre application.

Cependant, cette méthode implique que votre programme ne doit dépendre d'aucune autre ressource : pas de runtime, de bibliothèque ou de dépendance externe. Le programme doit être entièrement autonome et capable d'être compilé en un fichier binaire unique.

Ce n’est généralement pas réaliste, car la plupart des programmes ont besoin de bibliothèques, qu’on le veuille ou non.

> Utiliser scratch, c’est ne pas avoir de shell, pas de système de fichiers... rien.
>
> Vous savez exactement ce que contient votre image : rien. C’est à vous d’ajouter ce dont vous avez besoin.

## Les conteneurs Distroless de Google

Maintenant que nous avons fait ce détour, parlons du sujet principal : les conteneurs **distroless** (sans distribution Linux), comme ceux proposés par Google.

👉 https://github.com/GoogleContainerTools/distroless

Les images “distroless” n’embarquent pas de distribution Linux ni les nombreux paquets qui l’accompagnent, adoptant ainsi de bonnes pratiques pour garantir des images sécurisées et légères.

Elles sont dépourvues de la multitude de paquets qui accompagnent habituellement un OS, et permettent leur utilisation en tant qu’utilisateur non-root.

On trouve des images pour plusieurs langages : Python 3, Java 17, Java 21, Node 20, ainsi que des images plus générales comme static pour les programmes compilés en fichiers binaires uniques (C, Golang, etc.).

Prenons l'exemple de python. Google propose l'image `gcr.io/distroless/python3-debian12`.

> **Note :**
>
> Le distroless (de Google) est basé sur Debian, cependant, il est basé sur une version modifiée de celui-ci, ne conservant que l’essentiel pour exécuter les programmes dans de bonnes conditions.

Le résultat : des images très légères, de l’ordre de 2 Mo, soit quatre fois moins que la taille d’une image Alpine de base, en plus d’avoir une surface d’attaque diminuée.

Le distroless pour faire une analogie, c'est comme le serverless ; Le serverless utilise des serveurs, et le distroless utilise une distro Linux.

L'image Python, par exemple, contient uniquement par défaut :

- la bibliothèque ca-certificates,
- `/etc/passwd` pour l'utilisateur root,
- le répertoire `/tmp`,
- les bibliothèques tzdata, glibc, et libssl,
- Python 3 et ses dépendances.

### Exemple {#exemple-google-container}

Prenons l'exemple d'une application Python Flask, le code de cette application est très simpliste, exposant une route.

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
```

Pour créer une image Distroless, je vais me baser sur [l'exemple fourni par Google.](https://github.com/GoogleContainerTools/distroless/blob/main/examples/python3/Dockerfile)

Ce qui nous donne ceci :

```dockerfile
# Étape 1 : Construction des dépendances et de l'application
FROM python:3.12-slim AS build-env

# Copier les fichiers du projet dans le conteneur
COPY . /app
WORKDIR /app

# Installer les dépendances du projet
RUN pip install .

# Étape 2 : Image Distroless
FROM gcr.io/distroless/python3-debian12

# Copier l'application et les dépendances depuis l'étape de construction
COPY --from=build-env /app /app
COPY --from=build-env /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
WORKDIR /app
ENV PYTHONPATH=/usr/local/lib/python3.12/site-packages

CMD ["main.py"]
```

La structure de fichier de l'application :

```bash
.
├── Dockerfile
├── README.md
├── main.py
├── pyproject.toml
└── uv.lock
```

Je build mon image, et je lance mon conteneur !

```bash
$ docker buildx build --quiet -t mon-container-python-distroless .
sha256:98c5333dc36b1cf3698811b36acaf5dd1fe8d945c7c191b01abfca4228cf8fa4

$ docker run -d -p 80:80 --name py mon-container-python-distroless
a44d954e93215d9cb52beda7a4c84a155d5d741579873e11ee86e5a8119ec3b7

$ docker ps
CONTAINER ID   IMAGE                          COMMAND                 CREATED          STATUS          PORTS                 NAMES
a44d954e9321   mon-container-python-distroless   "/usr/bin/python3.11…"   12 seconds ago   Up 11 seconds   0.0.0.0:80->80/tcp   py
```

Mon conteneur est accessible en ligne depuis mon navigateur, et je n'ai aucun moyen de pénétrer dedans.

```bash
$ docker exec -it py sh
OCI runtime exec failed: exec failed: unable to start container process: exec: "sh": executable file not found in $PATH: unknown

$ docker exec -it py bash
OCI runtime exec failed: exec failed: unable to start container process: exec: "bash": executable file not found in $PATH: unknown
```

Et si on vérifiait le nombre de failles que trouve `docker scout quickview` dans notre image comparée à l’image python3.12-slim ?

```bash
# Python 3.12 slim	
$ docker scout quickview python:3.12-slim
  Target             │ python:3.12-slim │ 0C 0H 1M 28L
  digest             │   311c6c7090a5   │
  Base image         │     debian       │ 0C 0H 1M 23L
  Updated base image │     debian       │ 0C 0H 1M 23L

# Mon application Flask
$ docker scout quickview mon-container-python-distroless
  Target     │ mon-container-python-distroless:latest │ 0C 0H 0M 0L
  digest     │              9b7fb764deb2              │
  Base image │    distroless/static-debian12:latest   │ 0C 0H 0M 0L
```

Juste comme ça, j'ai une image Distroless fonctionnelle, sécurisée et prête à l'emploi.

> **Note** :
>
> Il est important de noter que ces images ne contiennent ni shell, ni gestionnaire de paquets, ce qui peut compliquer le débogage si nécessaire (et cela arrivera inévitablement, loi de Murphy oblige).

## Wolfi : l'OS pour les conteneurs {#wolfi-l-os-pour-les-conteneurs}

Wolfi est un OS conçu pour les conteneurs et le cloud de manière générale. Il vise à produire des images sans vulnérabilité.

👉 https://github.com/wolfi-dev

Wolfi s’inscrit également dans la dynamique distroless. Alors que les conteneurs distroless de Google fournissent des images prêtes à l’emploi pour des cas spécifiques, Wolfi se veut plus général et peut être utilisé quel que soit votre projet.

Il est possible de créer des images avec Wolfi de deux façons :

La méthode standard via l’utilisation d’un Dockerfile, ou avec les outils in-house apko et melange. Wolfi peut aussi créer des images plus classiques, incluant un shell, un gestionnaire de fichiers, etc., c’est notamment le cas quand on crée une image via l’utilisation d’un Dockerfile.

> **Note** :
> 
> Générer une image avec le Dockerfile : https://edu.chainguard.dev/open-source/wolfi/wolfi-with-dockerfiles/ Générer une image avec apko et melange : https://edu.chainguard.dev/open-source/build-tools/apko/getting-started-with-apko/

## Conclusion

Avez-vous besoin de conteneurs distroless ? C'est une question légitime à se poser.

Les distroless offrent un énorme avantage : la sécurité. L'image étant presque vierge, les risques liés aux dépendances inutiles ou aux failles de sécurité sont réduits au minimum, en plus de bloquer l'accès au shell, permettant d'encore plus réduire la surface d'attaque d'un attaquant.

Cependant, l'absence de shell peut être contraignante. Il peut être nécessaire, en fonction de vos besoins, pour exécuter des scripts ou déboguer des conteneurs.

> **Note** : 
>
> Ce n'est pas un problème si vous utilisez Kubernetes version v1.25+, qui permet de créer des conteneurs éphémères permettant de fournir un shell et différents outils à un autre conteneurs.

En fin de compte, c'est à vous de peser le pour et le contre. Alpine et Debian, bien qu'ils embarquent tout ce que l'OS a besoin et plus encore, permettent même une fois le conteneur lancé de pouvoir agir dessus, via l'installation de paquets, le lancement de scripts, la modification de configuration…

Je pense, à titre purement personnel, que le Distroless peut être pratique pour le déploiement en préproduction et production, car normalement quand votre application finit en production, elle est déjà passée par toutes les phases de tests.

Pour les phases de recette, intégration, test… un conteneur plus basique semble être le plus adapté, car ce sont les phases où le débogage est le plus important.

## Liens utiles
- Github Google Distroless : https://github.com/GoogleContainerTools/distroless
- Github Wolfi : https://github.com/wolfi-dev
- Article de Chainguard sur le distroless : https://www.chainguard.dev/unchained/minimal-container-images-towards-a-more-secure-future
- Conférence sur le distroless : https://youtu.be/lviLZFciDv4?si=st4pYmcT7wZ2yG-d
- Plus sur FROM Scratch : https://docs.docker.com/build/building/base-images/