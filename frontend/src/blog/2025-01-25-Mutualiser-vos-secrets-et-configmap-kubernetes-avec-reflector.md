---
title: Centralisez vos Secrets et ConfigMap Kubernetes avec Reflector
filename: Mutualiser-vos-secrets-et-configmap-kubernetes-avec-reflector
description: "Reflector est un outils permettant de dupliquer, synchroniser, et mettre à jour des ConfigMaps et Secrets dans un cluster Kubernetes, dans cet article, nous allons voir comment facilement le mettre en place et l'utiliser."
image: "mutualiser-vos-secrets-et-configmap-kubernetes-avec-reflector.png"
layout: layouts/article.njk
tags: article
date: 2025-01-25
dateText : 25 JANVIER 2025
subject:
    - SECRETS KUBERNETES
    - GESTION DE CONFIGURATION
metaDescription: "Reflector est un outil permettant de dupliquer, synchroniser, et mettre à jour des ConfigMaps et Secrets dans un cluster Kubernetes, dans cet article, nous allons voir comment facilement le mettre en place et l'utiliser."
metaKeywords: "Gestion de configuration Kubernetes, secret kubernetes, configmap kubernetes, Centralisez vos Secrets et ConfigMap Kubernetes avec Reflector"
metaImage: "../../assets/blog/Mutualiser-vos-secrets-et-configmap-kubernetes-avec-reflector/mutualiser-vos-secrets-et-configmap-kubernetes-avec-reflector.png"
permalink: "/blog/centralisez-vos-secrets-et-configmap-kubernetes-avec-reflector/"

scripts: >
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/components/prism-bash.min.js" integrity="sha512-35RBtvuCKWANuRid6RXP2gYm4D5RMieVL/xbp6KiMXlIqgNrI7XRUh9HurE8lKHW4aRpC0TZU3ZfqG8qmQ35zA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-yaml.min.js" integrity="sha512-6O/PZimM3TD1NN3yrazePA4AbZrPcwt1QCGJrVY7WoHDJROZFc9TlBvIKMe+QfqgcslW4lQeBzNJEJvIMC8WhA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
---

## Introduction

*“Un anneau pour les gouverner tous”.*

Eh bien, dans notre cas, ce sera un secret.

Bonjour à vous cher lecteur, avez-vous des secrets identiques à gérer dans plusieurs namespace dans votre cluster Kubernetes ?

Si c'est le cas, alors j'ai une solution pour vous.

## Reflector

[Reflector](https://github.com/emberstack/kubernetes-reflector) est un module Kubernetes ayant une fonction très simple : permettre de copier un Secret ou une ConfigMap dans plusieurs namespaces, et de les mettre à jour automatiquement en cas de changement.

Prenons un exemple simple : j'ai un projet "web-scraper", que je déploie dans trois environnements.

```bash
NAME                STATUS   AGE  
default             Active   1d  
web-scraper-dev     Active   1d  
web-scraper-int     Active   1d  
web-scraper-prod    Active   1d  
```

Imaginons que ces trois projets dépendent d’une API. Pour pouvoir fonctionner, ils auront besoin d’un token, qui sera partagé par tous les environnements.

```yaml
apiVersion: v1  
kind: Secret  
metadata:  
  name: commun-secret  
  namespace: default  
type: Opaque  
data:  
  api-key: dGhpcy1pcy1teS1rZXkK  
```

Une chose que l’on pourrait faire, c’est créer un secret et l’appliquer dans chaque namespace de notre cluster. C'est une méthode simple et efficace, mais si on met à jour le secret, on devra appliquer ce changement manuellement à chaque namespace.

C'est là qu'entre en jeu Reflector.

J’installe Reflector dans mon cluster en utilisant la charte Helm :

```bash
$ helm repo add emberstack https://emberstack.github.io/helm-charts  
$ helm repo update  
$ helm install reflector emberstack/reflector --set rbac.enabled=false  
```

Maintenant que Reflector est mis en place, modifions le secret pour lui dire de se copier dans nos namespaces “web-scraper” :

```yaml
apiVersion: v1  
kind: Secret  
metadata:  
  name: common-secret  
  namespace: default  
  annotations:
    # On ajoute dans annotations les paramètres lié a Reflactor
    reflector.v1.k8s.emberstack.com/reflection-allowed: "true"  
    reflector.v1.k8s.emberstack.com/reflection-auto-enabled: "true"  
    reflector.v1.k8s.emberstack.com/reflection-allowed-namespaces: "web-scraper-dev,web-scraper-int,web-scraper-prod"  
type: Opaque  
data:  
  api-key: dGhpcy1pcy1teS1rZXkK  
```

Voyons ce que fait chaque annotation :
- `reflector.v1.k8s.emberstack.com/reflection-allowed`: `true` indique que l’on autorise ce Secret à être copié dans d’autres namespaces.
- `reflector.v1.k8s.emberstack.com/reflection-auto-enabled`: `true` indique qu’on veut qu’il crée les copies des secrets automatiquement.
- `reflector.v1.k8s.emberstack.com/reflection-allowed-namespaces`: `"web-scraper-dev,web-scraper-int,web-scraper-prod"` indique la liste des namespaces où je l’autorise à se duplquer.

Je peux aussi dire à Reflector de copier et monitorer un secret dans des namespaces en fonction d’un regex. Pour reprendre mon exemple, au lieu d’écrire le nom de chacun de mes namespaces, j’aurais pu faire ça :

```yaml
apiVersion: v1  
kind: Secret  
metadata:  
  name: common-secret  
  namespace: default  
  annotations:  
    reflector.v1.k8s.emberstack.com/reflection-allowed: "true"  
    reflector.v1.k8s.emberstack.com/reflection-auto-enabled: "true"  
    # Beaucoup plus simple ainsi!
    reflector.v1.k8s.emberstack.com/reflection-allowed-namespaces: "web-scraper-[a-zA-Z0-9].*"  
type: Opaque  
data:  
  api-key: dGhpcy1pcy1teS1rZXkK  
```

En appliquant mon secret avec ces nouvelles annotations, je peux constater que mon secret a été dupliqué dans mes namespaces, le rendant accessible à mes applications.

```bash
$ kubectl apply -f common-secret.yml -n default  
$ kubectl get secrets -n web-scraper-dev  
NAME             TYPE    DATA   AGE  
common-secret    Opaque  1      3m19s  

$ kubectl get secrets -n web-scraper-int  
NAME             TYPE    DATA   AGE  
common-secret    Opaque  1      3m22s  

$ kubectl get secrets -n web-scraper-prod  
NAME             TYPE    DATA   AGE  
common-secret    Opaque  1      3m25s  
```

Juste comme ça, j'ai désormais un secret partagé par tous mes environnements, sans avoir eu à l'ajouter à chacun d’entre eux.

Je peux facilement ajouter de nouveaux environnements, et si je venais à modifier mon secret, les changements seraient automatiquement appliqués dans mes environnements !

> **Note :**  
> Je le précise ici, mais les annotations faites au Secret pour permettre sa copie sont exactement les mêmes que celles à faire sur une ConfigMap si on souhaitait copier et appliquer les changements d’une ConfigMap dans plusieurs namespaces.

```yaml
apiVersion: v1  
kind: ConfigMap  
metadata:  
  name: common-configmap  
  namespace: default  
  annotations:  
    reflector.v1.k8s.emberstack.com/reflection-allowed: "true"  
    reflector.v1.k8s.emberstack.com/reflection-auto-enabled: "true"  
    reflector.v1.k8s.emberstack.com/reflection-allowed-namespaces: "web-scraper-[a-zA-Z0-9].*"  
data:  
  my-key: my-value  
```

## TLDR :  
Reflector est un super outil pour copier et appliquer des changements automatiquement à des Secrets et ConfigMap dans un cluster Kubernetes.

Lien vers le projet : [https://github.com/emberstack/kubernetes-reflector](https://github.com/emberstack/kubernetes-reflector)
