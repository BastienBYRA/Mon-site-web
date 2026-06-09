---
title: L'IA expose notre dépendance aveugle à l'Open Source
description: "L'IA expose notre dépendance aveugle à l'Open Source : 23 000 failles découvertes par Claude Mythos révèlent une réalité qu'on ne peut plus ignorer."
image: "L-ia-expose-notre-dependance-aveugle-a-l-open-source.png"
date: 2026-06-16
tags: SECURITE, IA, VULNERABILITE
---

## Introduction {#introduction}

L'Open Source est omniprésent dans notre utilisation d'Internet.

90% du web tourne sur Linux. Google Chrome et Brave utilisent Chromium, un projet open source. Firefox est open source. Vos sites préférés utilisent un framework ou une librairie open source dans les coulisses.

L'internet d'aujourd'hui a été façonné par ce modèle de code en source libre, où chacun peut le lire, y contribuer, le copier, l'utiliser et le distribuer à sa sauce.

Pourtant, ce modèle n'est pas sans faille, l'Open Source est basé en partie sur la confiance, et bien que l'on puisse auditer le code source, rares sont ceux qui le font vraiment. La majorité des gens utilisent le résultat du travail des autres en accordant une confiance aveugle.

Depuis quand la confiance est-elle devenue un modèle de sécurité ? Depuis quand espérer pour le meilleur est devenu la marche à suivre ? Jamais, et nous n'avons pas arrêté de le voir.

[Log4Shell](https://www.trendmicro.com/fr_fr/what-is/apache-log4j-vulnerability.html), [Heartbleed](https://www.synetis.com/blog/la-faille-heartbleed/), la [backdoor dans XZ Utils](https://www.akamai.com/fr/blog/security-research/critical-linux-backdoor-xz-utils-discovered-what-to-know) ou les récentes attaques par chaîne d'approvisionnement (*Supply chain*), les exemples ne manquent pas à l'appel ; Un contributeur malveillant, du code vulnérable passé inaperçu ou l'exploitation de failles pour propager des infostealers dans des dépendances bien connues. L'Open Source a montré maintes fois que nous sommes vulnérables.

Entre la multiplication des projets d'envergure, le nombre de personnes utilisant ces outils augmentant toujours plus, les fonds pour soutenir ces projets toujours plus bas, et le manque de contributeurs sur ces projets, je trouve qu'il y a de quoi rire, et pleurer.

L'un des principes du modèle Open Source est que tout le monde peut lire et contribuer aux projets, pourtant personne ne le lit, et personne ne contribue. Les vulnérabilités s'accumulent, et en parallèle, tout le monde évangélise l'Open Source comme la solution.

## L'accélération avec l'IA {#acceleration-ia}

Bien que l'utilisation de l'IA dans les projets Open Source soit toujours [un sujet épineux](https://korben.info/une-bibliotheque-java-a-tente-de-pieger-les-ia-codeuses-pour-quelles-effacent-vos-tests-et-ca-a-failli-marcher.html), elle est partie pour rester, et se démocratiser.

Elle a déjà un impact réel ; Des chercheurs en sécurité utilisent l'IA pour rechercher des failles dans des projets connus comme le noyau Linux, suffisamment pour que [Linus Torvalds s'en plaigne](https://www.it-connect.fr/cest-ingerable-pourquoi-linus-torvalds-tape-du-poing-sur-la-table-face-a-ia/), car la boîte mail de sécurité est polluée de doublons.

Au-delà du noyau Linux, Anthropic, en collaboration avec Mozilla, ont publié [22 failles découvertes](https://korben.info/claude-danthropic-a-trouve-22-failles-dans-firefox-en-deux-semaines.html) dans Firefox avec Claude Opus 4.6, une IA utilisable par tout le monde.

Plus important encore, 14 sont des failles de sévérité HAUTE (*HIGH*), c'est à la fois impressionnant et inquiétant : Ce résultat a pu être atteint sans intervention humaine en autonomie, rapidement, pour des coûts réduits.

L'IA est capable de trouver des failles inconnues, mais aussi de rivaliser avec l'être humain ; Les chercheurs de la Team82 chez Claroty avaient manuellement identifié 5 vulnérabilités CRITIQUES (toutes à 9.8) dans le Zenitel TCIV-3+ (un interphone vidéo IP et SIP déployé dans des zones à haute sécurité), en l'espace de quelques heures.

A posteriori, [Team82 a rejoué ce scénario](https://claroty.com/team82/research/hands-free-what-llm-driven-vulnerability-research-looks-like), cette fois en utilisant l'IA avec un but simple ; Voir si Claude Opus 4.6 est capable d'identifier ces vulnérabilités sans actions de leur part, simplement en lui fournissant les outils et connaissances qu'ils possédaient au départ.

Le résultat : Plusieurs failles trouvées, **en moins de 10 minutes**. C'est absurde, qu'une IA publique et utilisable de tous soit capable de produire une analyse et des résultats d'un logiciel aussi rapidement, en quelques minutes face à une équipe d'experts qui l'a fait en quelques heures.

## Claude Mythos Preview, et le projet Glasswing {#claude-mythos-glasswing}

<div class="article-sub-section">
    <center>
        <img src="https://helios-i.mashable.com/imagery/articles/05dz81qyGPvsqMFvEKZTwPl/hero-image.fill.size_1200x675.v1776116766.jpg" class="article-sub-img" />
        <i>Projet Glasswing : Sécuriser les logiciels critiques à l'ère de l'IA</i>
    </center>
</div>

Il est temps de parler de l'éléphant dans la pièce, **Claude Mythos Preview**.

Ce nouveau modèle, orienté cybersécurité, n'est pas sorti au publique, mais plutôt pour une sélection d'entreprises partenaires comme AWS, Google, Cloudflare, Microsoft ou CrowdStrike, faisant toutes partie du projet *Glasswing*, et les retours n'ont pas tardé.

Anthropic annonçait dans un article que Mythos Preview était capable de trouver, combiner, exploiter des failles et fournir un rapport détaillé avec des PoC.

C'est un des points ressortis à propos de Mythos Preview ; Sa capacité à effectuer ces recherches et attaques, là où les autres IA disponibles sur le marché refusent, et nécessitent de bien formuler sa demande pour réussir à leur faire faire ces tâches, **Mythos est beaucoup plus facile à convaincre, en plus d'être capable d'aller plus loin dans sa démarche**.

Cette capacité a donné des résultats concrets ;
- Cloudflare à pu identifier [2000 failles](https://www.anthropic.com/research/glasswing-initial-update), dont 400 HAUTE et CRITIQUE
- Mozilla est passé de 22 failles avec Claude Opus 4.6 à [271 avec Mythos](https://www.anthropic.com/research/glasswing-initial-update)
- WolfSSL remonte [8 nouvelles failles, que Claude Opus](https://www.wolfssl.com/how-claude-mythos-preview-helped-harden-wolfssl/) n'a pas trouvé, dont [une CRITIQUE](https://www.anthropic.com/research/glasswing-initial-update).
- Une faille zéro-day de plus de 27 ans [identifié dans OpenBSD](https://korben.info/glasswing-anthropic-ia-cybersecurite-zero-day.html)

Le total à l'heure d'aujourd'hui s'élève à **23 019 vulnérabilités**, dont **6 202 de sévérité HAUTE et CRITIQUE**, avec peu de faux positifs.

C'est un nombre absolument terrifiant, car Mythos Preview est la preuve que l'IA est capable de trouver des failles ainsi que les exploiter elle-même. Elle est aujourd'hui utilisé à un usage défensif, mais elle révèle un potentiel d'attaque bien réel, et bien que ces analyses soient faites en ayant accès au code source, ces capacités la rendent dangereuse, pour des outils au code fermé, mais surtout pour des outils au code ouvert.

Bien que les coûts finaux soient difficiles à estimer, les résultats ne laissent aucun doute : Que ce soit en cyberdéfense comme en cyberattaque, Mythos va impacter tout le monde, qu'on le veuille ou non.

Au-delà de Mythos, OpenAI a récemment lancé sa propre version de Mythos et *Glasswing* avec *Daybreak* et son modèle **GPT-5.5-Cyber**. Mais contrairement à *Glasswing*, *Daybreak* se positionne comme ouvert à tous, à condition d'en avoir les fonds et d'en faire la requête.

## Conclusion : La tempête avant le calme {#conclusion}

Bien que cet article commençait "à charge" contre l'Open Source, je suis loin de l'être. L'Open Source est indéniablement une bonne chose, et Internet ne serait certainement pas le même sans.

Cependant, la réalité est que ce modèle rencontre de plus en plus de difficultés à subsister ; **Entre le manque de mainteneurs et de fonds, la survie de ces projets devient plus difficile**.

Je pense que l'IA va aider sur ce point, Claude Opus 4.6 a déjà montré des capacités convaincantes quant à l'analyse de vulnérabilités dans des outils Open Source, et avec Claude Mythos, l'identification des vulnérabilités va s'accélérer.

Mais ça va aussi être un problème, Mythos est aujourd'hui limité à une poignée d'entreprises triées sur le volet, et s'il n'arrive pas à avoir de garde-fous solides, alors, quand il sortira inévitablement au grand public, il risque d'entraîner une vague d'attaques sans précédent.

Là où Mythos est capable d'identifier des failles en termes d'heures, voir minutes, que ce soit les projets Open Source ou les produits commerciaux, combien de temps vont-ils mettre pour corriger ces vulnérabilités ?

À long terme, je pense que l'Open Source va sortir gagnant : L'IA va pouvoir analyser en profondeur les projets et mener à une réduction drastique des surfaces d'attaque, mais la période de transition pendant laquelle l'IA va remonter un nombre incalculable de failles, sans qu'aucun correctif ne soit disponible, sera une période compliquée pour tout le monde.

Entre des corrections en panique, des divulgations chaotiques, et la peur du lendemain quand on apprendra une nouvelle faille critique, ce futur, s'il se réalise vraiment, risque d'être très "drôle" on va dire.

<div class="article-sub-section">
    <center>
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROYnrCVaPH_gdFy9ycjLd78gyKE6-MEKlXwQ&s" alt="Image d'une maison détruite après une tempête" class="article-sub-img" />
        <i>Nouvelle journée, nouvelle faille...</i>
    </center>
</div>