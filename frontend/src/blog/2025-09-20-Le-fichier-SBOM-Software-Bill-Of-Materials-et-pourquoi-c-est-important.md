---
title: Le fichier SBOM (Software Bill Of Materials) et pourquoi c'est important
filename: Le-fichier-SBOM-Software-Bill-Of-Materials-et-pourquoi-c-est-important
description: "Présentation des SBOM (Software Bill Of Materials) : découvrez ce qu'est un fichier SBOM et son importance dans l'analyse des vulnérabilités, l'identification des licences et la sécurité de vos logiciels"
image: "le-fichier-SBOM-Software-Bill-Of-Materials-et-pourquoi-c-est-important.png"
layout: layouts/article.njk
tags: article
date: 2025-09-20
dateText : 20 SEPTEMBRE 2025
subject:
    - SOFTWARE BILL OF MATERIALS
    - VULNERABILITE
    - SECURITE
    - CVE
metaKeywords: "SBOM, Dependency Check, Dependency Track, safe code, code sécurité, français"
permalink: "/blog/le-fichier-SBOM-Software-Bill-Of-Materials-et-pourquoi-c-est-important/"

scripts: >
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/components/prism-bash.min.js" integrity="sha512-35RBtvuCKWANuRid6RXP2gYm4D5RMieVL/xbp6KiMXlIqgNrI7XRUh9HurE8lKHW4aRpC0TZU3ZfqG8qmQ35zA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
---

## Table des matières :
- [Introduction](#introduction)  
- [Se tenir au courant des vulnérabilités en temps réel](#se-tenir-au-courant-des-vulnérabilites-en-temps-reel)
- [L'enjeu des licences](#l-enjeu-des-licences)
- [Le Cyber Resilience Act](#le-cyber-resilience-act)
- [Format, standard et génération](#format-standard-et-generation)
    - [Les formats de fichier SBOM](#les-formats-de-fichier-sbom)
    - [Comment générer un fichier SBOM](#comment-generer-un-fichier-sbom)
- [Conclusion](#conclusion)  

## Introduction {#introduction}
Un fichier BOM (Bill Of Materials) ou SBOM (**Software** Bill Of Materials) est une représentation **structurée** d'un logiciel, son inventaire.

Ce fichier est composé de plusieurs données utiles à représenter ce qu'est votre logiciel : Dépendance, version, licence, vulnérabilité...

Son objectif est simple : Il est la représentation textuelle de ce qui forme un logiciel.

Aujourd'hui, il y a plusieurs intérêts à générer le SBOM de son logiciel :
1. Ce fichier permet de faire l'état de ce qui compose votre logiciel, notamment les dépendances et les **licences** de chacune d'elles, qu'il est nécessaire de surveiller de peur d'inclure une dépendance **payante** ou d'être forcé de **partager son code**.
2. Il permet aussi, en utilisant une base de données de vulnérabilité (e.g. [NVD](https://nvd.nist.gov/)), de vérifier si les dépendances ont des **vulnérabilités** à leur actif.
3. Combiné avec des outils de scan de vulnérabilité, un fichier SBOM peut être analysé régulièrement contre une base de données de vulnérabilités pour être **informé en continu** si une nouvelle faille affecte le logiciel.
4. Ce fichier **va devenir nécessaire** pour être conforme au niveau européen, comme l'impose le [Cyber Resilience Act (CRA)](https://en.wikipedia.org/wiki/Cyber_Resilience_Act), qui prendra effet à partir du **11 Décembre 2027** *(Les logiciels Open Source non commercial ne sont pas concernés par cette mesure.)*
5. Ce fichier peut être partagé avec des tiers (clients, partenaires, utilisateurs, auditeurs) afin de garantir une **meilleure transparence** et de **renforcer la confiance dans le logiciel livré**.

## Se tenir au courant des vulnérabilités en temps réel {#se-tenir-au-courant-des-vulnérabilites-en-temps-reel}
Un fichier SBOM répertorie l'ensemble des composants d'un logiciel, notamment **son nom** et **sa version**. C'est une force car il devient possible d'utiliser ses informations pour voir si ce composant présente ou non des vulnérabilités **en temps réel**.

Prenons [Trivy](https://trivy.dev/latest/) ou [Dependency Check](https://jeremylong.github.io/DependencyCheck/) par exemple ; Ces deux outils permettent de scanner un logiciel à un instant donné.

Ce sont des outils très utilisés dans des workflows, comme une CI/CD, ils permettent d'assurer la qualité du logiciel, en attestant qu'à l'instant donné, il ne présente pas ou peu de vulnérabilité (ou est dans un état jugé acceptable).

Mais qu'en est-il d'après ? Si le logiciel en question entre dans son cycle de fin de vie, ou en pause, et qu'il n'est plus scanné ? Est-ce qu'on l'ignore ?

Un fichier SBOM permet de résoudre ce problème, non pas par lui-même, mais **à l'aide d'outils d'analyse continue** comme [Dependency-Track](https://dependencytrack.org/) qui consomme des SBOMs.

Si un fichier SBOM contient chaque dépendance et version d'un projet, alors **il devient possible de vérifier auprès d'une base de données de vulnérabilité si le composant présente des failles ou non**, c'est exactement ce que propose [Dependency-Track](https://dependencytrack.org/), en jouant ce rôle de veilleur. Assurant sur une base quotidienne de vérifier si les composants d'un logiciel présentent ou non de nouvelle faille.

Cette démarche nous permet de s'assurer que nos logiciels sont **sains**, et **sécurisés**.

## L'enjeu des licences {#l-enjeu-des-licences}
Aujourd'hui, nos logiciels dépendent de plus en plus d'outils, et **chaque dépendance est un arbre généalogique à lui tout seul**, susceptible de nécessiter plusieurs dizaines d'autres dépendances ayant elles-mêmes besoin d'autres dizaines de composants.

![Image montrant un arbre de dépendance typique d'une dépendance informatique](../../assets/blog/{{ filename }}/dependency-tree-software.png)
<p class="image-related-text">Exemple d'un graphe de dépendance logiciel.</p>

Et chacun de ses outils possède une ou plusieurs licences à leur actif, pouvant être plus ou moins contraignantes.

- La licence LGPL oblige à publier les modifications apportées à la bibliothèque.
- Les licences GPL et AGPL peuvent entraîner le besoin de partager l'intégralité de son code source au public.
- La licence SSPL va plus loin et demande la publication de TOUT ce qui permet l'exécution du logiciel (e.g. Scripts d'automatisation, manifeste Kubernetes...)

Avoir conscience des licences des outils qu'on utilise est essentiel pour savoir comment l'aborder ; Que faire, et quoi ne pas faire.

## Le Cyber Resilience Act {#le-cyber-resilience-act}
Bien que ce ne soit pas le cas aujourd'hui, le [Cyber Resilience Act (CRA)](https://en.wikipedia.org/wiki/Cyber_Resilience_Act) va forcer les entreprises, petites (solo dev) comme grandes (1000+ employés) à devoir **mettre en place des systèmes pour assurer la sécurité de leurs logiciels** durant leur cycle de vie (Software et Hardware).

> **Note :**
>
> Pas tous les logiciels sont concernés par cette mesure, sont exclus : Les SaaS, les logiciels en phase d'Alpha ou Beta, les logiciels Open Source non commerciaux et les logiciels déjà affectés par des régulations en vigueur spécifiques à leur secteur.
>
> *cf. https://cpl.thalesgroup.com/software-monetization/eu-cyber-resilience-act-compliance-guide*

Évaluation des risques de cybersécurité, processus de gestion des vulnérabilités, documentation technique complète, résultats des tests... Énormément de choses sont demandées, et bien que cette mesure soit discutable (notamment pour les petites entreprises / autoentrepreneurs qui ne seront probablement pas en mesure d'avoir tout un système en place pour assurer le bon cycle de vie d'un logiciel dont l'avenir est incertain), elles devront être mises en place.

La génération d'un fichier SBOM avec un outil comme [Dependency-Track](https://dependencytrack.org/) peut répondre à certains problèmes :
- Analyse des composants et identification des vulnérabilités en continu
- Une partie de la documentation technique du logiciel
- Analyse des risques des vulnérabilités à l'aide du système d'*Exploit Prediction Scoring System (EPSS)*

## Format, standard et génération {#format-standard-et-generation}
### Les formats de fichier SBOM {#les-formats-de-fichier-sbom}
Il existe plusieurs formats de fichier SBOM qui se sont développés au fur des années, il y a aujourd'hui deux standards prédominants :
- **CycloneDX**, de l'OWASP (Open Worldwide logiciel Security Project)
- **SPDX (Software Package Data Exchange)**, de la Linux Foundation

Bien que ces deux formats soient considérés comme des standards dans la génération de SBOM et possèdent des capacités similaires, les deux visent à répondre à des besoins différents :

- SPDX était originalement un outil se concentrant principalement sur l'identification et le traçage des licences des dépendances d'un projet afin d'assurer la conformité des logiciels.
- CycloneDX est un outil plus concentré sur l'analyse des dépendances d'un projet à la recherche de vulnérabilités potentielles.

Cela ne veut pas dire que l’un ne peut pas couvrir (au moins en partie) le rôle de l’autre : Aujourd'hui, SPDX est capable d'identifier les dépendances pour permettre la recherche de vulnérabilités, et CycloneDX est capable d'identifier les licenses d'un projet.

Il est considéré que les deux formats sont interchangeables, et des outils comme [cyclonedx-cli](https://github.com/CycloneDX/cyclonedx-cli) permettent de convertir dans un sens comme dans l'autre, même si cela peut entraîner des pertes d'informations.

Cependant, il est important de considérer avec quel logiciel vous travaillez, car certains outils ne prennent qu'un format :
- Les outils orientés **licence / conformité** auront tendance à n'accepter que le format **SPDX** *(e.g. FOSSology)*  
- Les outils orientés **sécurité** auront tendance à n'accepter que le format **CycloneDX** *(e.g. Dependency-Track)*

### Comment générer un fichier SBOM {#comment-generer-un-fichier-sbom}
Aujourd'hui, un certain nombre d'outils existent pour les créer, ils sont faciles à mettre en place, et sont généralement capables de générer le fichier, que ce soit au standard CycloneDX ou SPDX.

Chaque langage possède un ou plusieurs outils à cette fin, que ce soit les projets Maven avec [CycloneDX Maven Plugin](https://github.com/CycloneDX/cyclonedx-maven-plugin), Python avec [CycloneDX-Python](https://github.com/CycloneDX/cyclonedx-python) ou encore JavaScript directement avec [NPM](https://docs.npmjs.com/cli/v9/commands/npm-sbom).

D'autres existent et fonctionnent avec plusieurs langages : [Cdxgen](https://github.com/CycloneDX/cdxgen), [Syft](https://github.com/anchore/syft) ou [Trivy](https://trivy.dev/latest/).

En fonction des outils et des langages, un SBOM peut être généré à partir de diverses sources. Dans le cadre d'un projet Java, un `pom.xml` comme un `*.jar` peuvent être utilisés comme source.

```bash
# Exemple de génération d'un SBOM avec Syft pour un projet Java, avec un .jar
trivy rootfs myapp.jar --format cyclonedx --output myapp-sbom.json

# Exemple de génération d'un SBOM avec Cdxgen pour un projet Java, avec un .jar
cdxgen -t jar -o myapp-sbom.json
```

## Conclusion {#conclusion}
Bien qu’on n’y pense pas toujours, le SBOM est un outil puissant qui permet non seulement de **résoudre de nombreux problèmes, mais aussi d’en anticiper d’autres**.

Il constitue un levier essentiel pour garantir la sécurité de vos logiciels tout en vous protégeant contre les risques liés aux licences. Adopter le SBOM, c’est prendre une longueur d’avance sur la qualité et la conformité de ses solutions.