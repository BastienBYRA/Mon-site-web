---
title: "Les underscores dans les en-têtes HTTP"
filename: Les-underscores-dans-les-en-tetes-http
description: "Un court article sur l'utilisation des underscores dans les en-têtes HTTP"
image: "header-main.png"
date: 2024-09-07
tags: TECH, WEB SERVER
---

## Les underscores dans les en-têtes HTTP

Les en-têtes HTTP sont des choses auxquelles je trouve qu’on ne prête pas particulièrement attention, et ce même malgré leur importance dans notre consommation du Web.

Ce serait un sujet intéressant à aborder dans un article dédié, mais ce n'est pas le cas de cet article.

Je veux parler de quelque chose de plus précis : **les underscores dans les en-têtes HTTP.**

Coupons le suspense court, vous n’en verrez quasiment jamais dans vos requêtes.

C'est quelque chose auquel je n'avais jamais fait attention, mais si vous regardez les en-têtes HTTP que vous envoyez et recevez dans votre navigateur, il y a de fortes chances qu'aucune ne soit composée d'underscore.

Le [RFC 822](https://datatracker.ietf.org/doc/html/rfc822) a standardisé la façon dont sont écrits les en-têtes, leur forme étant désormais un ou plusieurs mots séparés par des tirets *(e.g : Ma-Super-En-Tete)*.

Plus d'informations sur comment écrire une en-tête HTTP dans la section 3.2. HEADER FIELD DEFINITION du [RFC 822](https://datatracker.ietf.org/doc/html/rfc822#section-3.2).

> **Note :**  
>
> Un RFC (Request for comments) est un document qui décrit les aspects, spécifications et / ou normes techniques d'un projet / protocole lié au web.

Revenons à notre sujet : est-il interdit d'utiliser des underscores dans des en-têtes ? D'après le RFC, rien n'interdit leur utilisation dans les en-têtes. Il est donc parfaitement possible d'en utiliser.

Cependant ! Car il y a mais, ce qu'il faut savoir, c'est que certains serveurs web (comme Nginx et Apache) n'acceptent pas les en-têtes avec des underscores par défaut pour des raisons qui leur sont propres. Dans le cas d'Apache et NGINX, ça ne va pas causer de crash du serveur ni remonter d'erreurs, mais elles ne seront pas transférées avec les autres en-têtes.

Les deux serveurs web offrent différentes solutions pour résoudre ce problème : NGINX en [ajoutant un paramètre dans sa configuration](https://nginx.org/en/docs/http/ngx_http_core_module.html#underscores_in_headers) et Apache en [transformant les en-têtes pour remplacer ses underscores par des tirets](https://httpd.apache.org/docs/trunk/env.html#fixheader).

D'autres serveurs web comme Caddy acceptent par défaut les en-têtes avec underscore.

### TL;DR :  
Faites attention aux en-têtes HTTP que vous envoyez et recevez sur votre serveur, ça vous évitera des heures de débogage pour un problème stupide d'underscore 😉

> **Bonus :**  
>
> En lisant rapidement le RFC 822, j’ai voulu tester l'ajout de points d’exclamation (`!`) dans mes en-têtes, et ça fonctionne ! Mais pas les points d’interrogation (`?`)…  
>
> Pourquoi ? Parce qu’il en a été décidé ainsi. Je ne sais pas quoi faire de cette information, donc il est absolument essentiel que je vous la partage pour que vous puissiez vous aussi méditer sur cette question 👍.
