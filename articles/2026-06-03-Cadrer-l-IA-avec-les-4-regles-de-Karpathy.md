---
title: Cadrer l'IA avec les 4 règles de Karpathy
description: "Andrej Karpathy a formulé 4 règles pour que l'IA arrête de déborder : Réflexion, simplicité et précision chirurgicale."
image: "Cadrer-l-IA-avec-les-4-regles-de-Karpathy.png"
date: 2026-06-03
tags: IA, LLM, PROMPT-ENGINEERING, DEVELOPPEMENT
---

## Contexte

Avec l'effervescence continue autour de l'IA, et son utilisation toujours plus poussée dans le contexte personnel comme professionnel, je trouve drôle de se dire que nous avons tous nos propres manières de l'utiliser. Certains aiment ne pas se prendre la tête et donner le minimum de contexte, voire aucun, quand ils ont des demandes. D'autres écrivent des romans pour s'assurer que l'IA a toutes les informations à sa disposition. Certains ne donnent aucun rôle à l'IA, d'autres essaient de lui donner une personnalité, que ce soit un expert dans un domaine, une personnalité froide et directe, ou sympathique et à l'écoute.

À l'époque de sa sortie, ChatGPT était basique : Une simple interface de conversation. Aujourd'hui, ces mêmes IA sont capables de faire des recherches sur internet, de lire des fichiers et des images et même d'interagir avec des outils externes (Suite Office, Figma, Canva, Slack...).

Pourtant, malgré toutes ces nouvelles capacités, un problème récurrent, notamment dans le développement informatique, est le manque de rigueur de l'IA. Que ce soit la suppression de commentaires dans le code, la modification de code adjacent, la complexité inutile ou d'autres débordements, l'IA peut, et va par moments, outrepasser les demandes et aller plus loin que nécessaire.

<div class="article-sub-section">
    <center>
        <img src="{{ blog__assets }}/blog/other/claude_refactoring.jpeg" alt="Claude, au grand coeur, fait du refractoring sans qu'on lui demande, heartwarming" class="article-sub-img" />
        <i>L'IA, quand elle se sent pousser des ailes...</i>
    </center>
</div>

C'est de cette frustration qu'Andrej Karpathy, co-fondateur d'OpenAI, ancien directeur de l'IA chez Tesla, et désormais "Member of Technical Staff" chez Anthropic, a formulé 4 règles. Pour une raison simple : rendre l'IA vraiment utile au quotidien.

## 4 Règles de Karpathy

1. **Réfléchis avant d'écrire** : Ne fais pas d'hypothèse. Sois explicite. En cas de doute, pose des questions, et va toujours au plus simple.

2. **Simplicité avant tout** : Écris strictement le code nécessaire : Pas de fonctionnalités "au cas où", pas d'abstraction inutile. Demande-toi : Est-ce qu'un développeur senior trouverait ça surcompliqué ?

3. **Modification chirurgicale** : Modifie uniquement ce qui est nécessaire, ne touche pas à ce qui fonctionne, suis les conventions en place et mentionne le code inutilisé sans le supprimer pour autant.

4. **Accomplis ta tâche** : Définis des critères de succès clairs, transforme chaque mission en tâche vérifiable.

Ces 4 règles s'intègrent sans effort, que ce soit au début d'une nouvelle conversation ou dans un fichier d'instruction comme CLAUDE.md, AGENTS.md ou .github/copilot-instructions.md. Les communiquer à l'IA change immédiatement la qualité de ses réponses, le tout sans avoir besoin de changer de workflow, simplement en lui fournissant un cadre de travail.

Évidemment, il est possible de modifier ces règles et d'en ajouter de nouvelles ; Que ce soit une règle pour que l'IA génère des fichiers "mémoire" à chaque tâche, réutisable lors de prochaines conversations, une règle pour toujours répondre dans une langue donnée, ou même l'ajout d'un ["make no mistakes" pour les opérations critiques](https://media.licdn.com/dms/image/v2/D4E10AQFRi1-1PEXSow/image-shrink_800/B4EZvC3lPxI8Ag-/0/1768500909507?e=2147483647&v=beta&t=PJ3q2t6kKIPHszc1NAytBDTu9zdOgWLRyAWe0SKsx_g), les règles de Karpathy peuvent servir de base pour définir des règles plus complexes et spécifiques à vos besoins.

<div class="article-sub-section">
    <img src="https://media.licdn.com/dms/image/v2/D4E10AQFRi1-1PEXSow/image-shrink_800/B4EZvC3lPxI8Ag-/0/1768500909507?e=2147483647&v=beta&t=PJ3q2t6kKIPHszc1NAytBDTu9zdOgWLRyAWe0SKsx_g" alt="Claude, ne fait aucune erreur" class="article-sub-img" />
</div>

## Source
* Répertoire GitHub contenant les 4 règles de Karpathy : https://github.com/multica-ai/andrej-karpathy-skills