---
title: Migrer de Docker Compose vers Kubernetes avec Kompose
filename: Migrer-de-docker-compose-vers-kubernetes-avec-kompose
description: "Kompose est un outil facile à prendre en main permettant de transformer un fichier Docker-compose.yml en un ensemble de manifest Kubernetes."
image: "migrer-de-docker-compose-vers-kubernetes-avec-kompose.png"
layout: layouts/article.njk
tags: article
date: 2025-02-22
dateText : 22 FEVRIER 2025
subject:
    - DOCKER
    - TRANSITION TECHNOLOGIQUE
metaKeywords: "Docker, Docker-compose, Docker-compose.yml, Kompose, transition docker à kubernetes, migration docker vers kubernetes"
permalink: "/blog/migrer-de-docker-compose-vers-kubernetes-avec-kompose/"

scripts: >
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/components/prism-bash.min.js" integrity="sha512-35RBtvuCKWANuRid6RXP2gYm4D5RMieVL/xbp6KiMXlIqgNrI7XRUh9HurE8lKHW4aRpC0TZU3ZfqG8qmQ35zA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-yaml.min.js" integrity="sha512-6O/PZimM3TD1NN3yrazePA4AbZrPcwt1QCGJrVY7WoHDJROZFc9TlBvIKMe+QfqgcslW4lQeBzNJEJvIMC8WhA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
---

## Table des matières
- [Introduction](#introduction)
- [Kompose](#kompose)
- [Labels, un moyen d’aller plus loin dans la configuration de vos sorties Kubernetes](#labels-un-moyen-daller-plus-loin-dans-la-configuration-de-vos-sorties-kubernetes)
- [Conclusion](#conclusion)

## Introduction {#introduction}
Je suis de ceux persuadés qu’un bon fichier Docker-compose est suffisant pour un bon nombre de situations, mais là n’est pas la question.

Avez-vous déjà eu le besoin de convertir une infra Docker-compose vers une infra Kubernetes ?

Peut-être bien que oui, ou peut-être bien que non ? Pour être franc, je ne sais pas, et vous noterez assez intelligemment que vous ne pouvez pas me le dire non plus, considérant que vous êtes en train de lire un article, n’ayant aucune section commentaire.

Mais ! Mais, mais, mais.

Saviez-vous qu’il existe un outil pour convertir un fichier docker-compose.yml en plusieurs fichiers Kubernetes ?

Si vous ne le saviez pas, alors permettez-moi de vous présenter un outil qui s'appelle [Kompose](https://kompose.io/), qui permet de transformer un fichier Docker-compose en fichiers Kubernetes (Deployment, Service, PV, PVC...).

## Kompose {#kompose}

Kompose est un outil simple : il convertit un fichier `docker-compose.yml` en son équivalent Kubernetes

Prenons un exemple, ici le fichier Docker Compose que l’on va utiliser dans le cadre de ce tutoriel :

```yaml
version: '3.8'
services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000" 
    environment:
      - GF_SECURITY_ADMIN_USER=admin 
      - GF_SECURITY_ADMIN_PASSWORD=admin 
    volumes:
      - grafana_data:/var/lib/grafana 
    depends_on:
      - prometheus

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090" 
    volumes:
      - prometheus_data:/etc/prometheus
    command:
      - --config.file=/etc/prometheus/prometheus.yml
configs:
  prometheus_config:
    file: ./prometheus.yml

volumes:
  grafana_data:
  prometheus_data:
```

Le Docker Compose suivant va :
- Déployer un Prometheus et un Grafana
- Exposer les deux applications
- Définir des variables d’environnement
- Créer des volumes
- Utiliser un fichier local pour la configuration de Prometheus

Utilisons Kompose pour le convertir en fichier Kubernetes.

```bash
kompose convert -f docker-compose.yml
```

Vous aurez des logs qui devraient ressembler à ça :

```bash
INFO Kubernetes file "grafana-service.yaml" created
INFO Kubernetes file "prometheus-service.yaml" created
INFO Kubernetes file "grafana-deployment.yaml" created
INFO Kubernetes file "grafana-data-persistentvolumeclaim.yaml" created
INFO Kubernetes file "prometheus-config-configmap.yaml" created
INFO Kubernetes file "prometheus-deployment.yaml" created
INFO Kubernetes file "prometheus-data-persistentvolumeclaim.yaml" created
```

De ce que l’on peut lire dans les logs, plusieurs fichiers ont été créés, si on passe en détail tout ça :
- Deux Deployments pour lancer les applications
- Deux Services pour exposer les applications au cluster
- Deux PVC pour stocker nos données
- Et finalement une ConfigMap pour contenir le contenu du fichier `prometheus.yml` que nous lui passons dans le Docker Compose.

Ainsi, avec l’exécution d’une commande, nous avons déjà une base de fichiers Kubernetes plutôt solide.

Kompose n’est cependant pas un outil magique, par exemple, toutes les applications seront converties en `Deployment`. Si on veut qu’il génère des `DaemonSet` à la place, il faut le lui spécifier via la CLI de Kompose.

Voici une liste d'exemples de commandes pour contrôler la sortie de Kompose.

```bash
# Convertir les applications en DaemonSet au lieu de Deployment
kompose convert --controller daemonSet

# Définir le namespace “monitoring” pour chaque fichier Kubernetes
kompose convert --namespace monitoring

# Définir le nombre de replicas des applications à 3
kompose convert --replicas 3
```

Bref, ce n’est pas l’outil qui va faire tout votre travail, mais il peut faciliter et accélérer une bonne partie du travail, ce qui est déjà très bien, je trouve !

Vous pouvez voir l’ensemble des paramètres en faisant la commande ```kompose convert --help```.

## Labels, un moyen d’aller plus loin dans la configuration de vos sorties Kubernetes {#labels-un-moyen-daller-plus-loin-dans-la-configuration-de-vos-sorties-kubernetes}

Il est aussi possible de spécifier des données relatives à Kubernetes directement dans le fichier docker-compose.yml en leur ajoutant des **labels**.

Reprenons notre Grafana.

```yaml
services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
```

Ici notre "liste de course" :
- Je veux générer un Ingress, je le veux accessible au nom de domaine "grafana.bastienbyra.fr"
- Je veux qu’il utilise mon Ingress NGINX
- Je veux que mon application soit un StatefulSet
- Je veux activer l’autoscaling de Grafana quand il dépasse 1Gi de RAM

```yaml
services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    # Les labels pour Kubernetes !
    labels:
      kompose.service.expose: grafana.bastienbyra.fr
      kompose.service.expose.ingress-class-name: nginx
      kompose.controller.type: statefulset
      kompose.hpa.memory: 1Gi
```

## Conclusion {#conclusion}

Ainsi, lors de notre prochaine exécution de `kompose`, nos fichiers Kubernetes appliqueront les différents données définis dans la section `label`.

Plus d’info sur leur documentation ([https://kompose.io/user-guide/#cli-modifications](https://kompose.io/user-guide/#cli-modifications)), l’outil est vraiment flexible 👍

Ci-dessous la procédure d'installation du binaire Kompose ;
```bash
# Linux
curl -L https://github.com/kubernetes/kompose/releases/download/v1.35.0/kompose-linux-amd64 -o kompose

# Linux ARM64
curl -L https://github.com/kubernetes/kompose/releases/download/v1.35.0/kompose-linux-arm64 -o kompose

# macOS
curl -L https://github.com/kubernetes/kompose/releases/download/v1.35.0/kompose-darwin-amd64 -o kompose

# macOS ARM64
curl -L https://github.com/kubernetes/kompose/releases/download/v1.35.0/kompose-darwin-arm64 -o kompose

chmod +x kompose
sudo mv ./kompose /usr/local/bin/kompose
```

Le reste des procédures disponible sur [leur site](https://kompose.io/installation/) (Docker, CentOS, Windows, Go)

Ça peut être un moyen rapide de transformer une infrastructure utilisée par des développeurs (Docker-compose) en infrastructure pour des tests/prod sur Kubernetes.

Ça peut aussi servir quand on a la flemme de convertir un Docker compose de 10+ services en fichiers Kubernetes 😉