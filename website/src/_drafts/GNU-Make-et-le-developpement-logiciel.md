---
title: Make(file) dans le processus de développement logiciel
filename: GNU-Make-et-le-developpement-logiciel
description: "TESTaa"
image: "Makefile-main.png"
layout: layouts/article.njk
tags: article
date: 2099-04-25
dateText : TODO
subject:
    - TECH
    - MAKEFILE
    - DEVOPS
metaDescription: "TODO"
metaKeywords: "TODO"
metaImage: "../../assets/blog/TODO"
# permalink: /test/gnu-make-et-le-developpement-logiciel
---

## [Présentation](#presentation) {#presentation}

Un Makefile est un fichier utilisé dans le développement de logiciels pour spécifier les étapes nécessaires à la compilation et à la construction du projet. Associé à la commande GNU make, il a été créé dans les années 70 pour automatiser le processus de compilation des projets C et C++.

Un Makefile est composé de cibles. Ces cibles sont composées d'une à plusieurs commandes. Chaque cible peut avoir aucun à plusieurs prérequis qui seront exécutés avant celle de la cible.

La structure d'un fichier Makefile est simple :

```makefile
Cible: prérequis
    commande 1
    commande 2
    …
```

## [Exemple 1 : Créer un fichier, le remplir et le supprimer](#exemple-un-creer-un-fichier-le-remplir-et-le-supprimer) {#exemple-un-creer-un-fichier-le-remplir-et-le-supprimer}

Prenons un exemple simple, créons un fichier Makefile vide, auquel on va ajouter deux cibles ;

**create** qui aura pour rôle de créer le fichier "file", auquel on va ajouter le texte "Quel beau fichier" dedans.

**delete** qui va supprimer le fichier “file”.

```makefile
create:
    touch file
    echo "Quel beau fichier" > file

delete:
    rm -f file
```

Pour exécuter "create", on utilise la commande "make create", et pour exécuter "delete", on utilise "make delete".

```bash
# On exécute la cible "create" permettant de créer un fichier "file" et de lui ajouter du contenu.
bast@DESKTOP-97VIG3H:~$ make create
touch file
echo "Quel beau fichier" > file

# On vérifie que le fichier est bien créé, ainsi que son contenu.
bast@DESKTOP-97VIG3H:~$ ls
Makefile  file

bast@DESKTOP-97VIG3H:~$ cat file
Quel beau fichier

# On exécute la cible "delete" permettant de supprimer le fichier "file".
bast@DESKTOP-97VIG3H:~$ make delete
rm -f file

bast@DESKTOP-97VIG3H:~$ ls
Makefile
```

Note : Par défaut, le Makefile écrit les instructions de la cible.

## [Variables](#variables) {#variables}

Et si on complexifie un peu cet exemple, en ajoutant une variable, qui représentera le nom du fichier

```makefile
FILENAME=file

create:
    touch $(FILENAME)

delete:
    rm -f $(FILENAME)
```

Le résultat reste le même, mais on peut maintenant facilement changer le fichier que l'on crée ou supprime.

Il y a plusieurs façons de modifier le contenu de la variable.

### [Passer une nouvelle valeur](#passer-une-nouvelle-valeur) {#passer-une-nouvelle-valeur}

On peut passer une valeur quand on exécute la cible : 

```bash
make create FILENAME=”second file”
```

### [Variable d’environnement](#variable-d-environnement) {#variable-d-environnement}

On peut utiliser une variable d’environnement, il faudra cependant ne pas définir la variable dans le Makefile.

```makefile
create:
    touch $(FILENAME)

delete:
    rm -f $(FILENAME)

FILENAME=”second file” make create
```

### [Variable référencée](#variable-referencee) {#variable-referencee}

Une variable peut en référencer une autre, et ainsi de suite, prenons l’exemple suivant.

```makefile
FULLNAME="$(FULL) :D"
FULL="$(FIRSTNAME) $(LASTNAME)"
FIRSTNAME="Bastien"
LASTNAME="BYRA"

echo:
        echo $(FULLNAME)
```

Nous avons deux variables, FIRSTNAME et LASTNAME qui sont définis, prenant un nom et un prénom.

FULL est une variable qui concatène les deux, donnant le résultat "Bastien BYRA".

FULLNAME est une variable qui ajoute un smiley à la fin, donnant le résultat "Bastien BYRA :D".

```bash
bast@DESKTOP-97VIG3H:~$ make echo
echo """Bastien" "BYRA"" :D"
Bastien BYRA :D
```

### [Fichier de variable d’environnement](#fichier-de-variable-d-environnement) {#fichier-de-variable-d-environnement}

Pour finir, on peut aussi utiliser les variables d’un fichier d'environnement (.env) en l’incluant dans le Makefile avec la directive "include".

```makefile
# Contenu du fichier .env
bast@DESKTOP-97VIG3H:~$ cat .env
FULLNAME=SOMEONE

# Contenu du fichier Makefile
bast@DESKTOP-97VIG3H:~$ cat Makefile
FULLNAME="$(FULL) :D"
FULL="$(FIRSTNAME) $(LASTNAME)"
FIRSTNAME="Bastien"
LASTNAME="BYRA"

include .env

echo:
        echo $(FULLNAME)

# Exécution de la cible "echo"
bast@DESKTOP-97VIG3H:~$ make echo
echo SOMEONE
SOMEONE
```

Note : La valeur FULLNAME de mon fichier d’environnement a surchargé la valeur FULLNAME définie dans mon Makefile, mais c’est uniquement le cas car j’ai mis la directive "include" après la définition de ma variable FULLNAME. Si j’ajoute la directive "include" au début de mon fichier, la valeur de FULLNAME sera “Bastien BYRA :D”.

## [Cacher des instructions spécifiques](#cacher-des-instructions-specifiques) {#cacher-des-instructions-specifiques}

Par défaut, un Makefile va écrire les instructions exécutées au fur et à mesure de son exécution, on peut le voir à l’appel de notre commande "echo $(FULLNAME)" qui renvoie echo """Bastien" "BYRA"" :D".

Pour éviter ça, on peut ajouter le caractère "@" devant la ligne dont on ne veut pas afficher l’instruction.

```makefile
echo:
        @echo $(FULLNAME)
```

Quand on exécute “make echo” :

```bash
bast@DESKTOP-97VIG3H:~$ make echo
Bastien BYRA :D
```

## [Les variables et cibles spéciales](#les-variables-et-cibles-speciales) {#les-variables-et-cibles-speciales}

Les fichiers Makefile ont un ensemble de [variables spéciales](https://www.gnu.org/software/make/manual/html_node/Special-Variables.html) et [cibles spéciales](https://www.gnu.org/software/make/manual/html_node/Special-Targets.html) prédéfinies.

Elles sont toutes définies de la même manière : .<NOM_EN_MAJUSCULE>

Parmi les différentes cibles spéciales existantes, une est essentielle à connaitre.

### [Cible .PHONY](#cible-phony) {#cible-phony}

Pour comprendre le but de .PHONY, il faut remettre en contexte le but du Makefile : à l’origine, le Makefile était fait pour automatiser la compilation de projets (en C, par exemple). Les cibles pouvaient porter le même nom que le fichier qu'elles compilaient, et elles faisaient office de vérification pour le Makefile.

Si un fichier du même nom que la cible existe, alors la commande ne s’exécute pas, car tout est jugé comme étant en ordre. Pour montrer concrètement, prenons l’exemple de "create".

Si nous n’avons pas de fichier nommé ‘create” à la racine du projet, il n’y aura aucun problème d’exécution de la cible.

```bash
# Le contenu de mon Makefile
bast@DESKTOP-97VIG3H:~$ cat Makefile
create:
        @touch $(FILENAME)

# On crée un fichier "create"
bast@DESKTOP-97VIG3H:~$ make create FILENAME="create"

# On constate qu'un fichier "create" existe maintenant
bast@DESKTOP-97VIG3H:~$ ls
Makefile  create
```

Nous avons créé un fichier “create”, maintenant refaisons exactement la même commande.

```bash
bast@DESKTOP-97VIG3H:~$ make create FILENAME="create"
make: 'create' is up to date.
```

C’est problématique car ça nous empêche d'exécuter notre cible “create”. Comment résoudre ce problème ?

Pour ce faire, on utilise la cible spéciale “.PHONY” qui permet d’indiquer que la cible ne doit pas se soucier s'il y a un fichier du même nom dans le répertoire.

Je vais ajouter les cibles “create” et “delete” dans ma cible .PHONY. Il y a deux moyens de le faire.

```makefile
.PHONY: create delete
```

ou

```makefile
.PHONY: create
create:
    touch $(FILENAME)

.PHONY: delete
delete:
    rm -f $(FILENAME)
```

### [Autres cibles spéciales (et variables spéciales))](#autre-cibles-speciales-et-variables-speciales) {#autre-cibles-speciales-et-variables-speciales}

Il y a quelques autres cibles spéciales (ainsi que des variables spéciales) qui peuvent valoir le détour :

- **.DEFAULT_GOAL** : Par défaut, si on exécute “make” sans spécifier de cible, la première cible est exécutée, .DEFAULT_GOAL permet de définir la cible à lancer par défaut si aucune cible n'est indiquée.
- **.SILENT** : Par défaut, les cibles renvoient des résultats. Un “docker pull” ou “docker build” renvoie beaucoup de lignes, .SILENT permet de dire à une ou plusieurs cibles de ne rien envoyer à l'utilisateur.

## [Exemple 2 : Build, Scan et Push une image Docker](#exemple-deux-build-scan-et-push-une-image-docker) {#exemple-deux-build-scan-et-push-une-image-docker}

Pour donner un exemple un peu plus concret qui utilise ce que l’on a vu jusqu'à présent.

Voici un fichier Makefile, permettant de réaliser les actions suivantes  ; 
- **Build** une image Docker 
- **Scan** sur l'image Docker, en appelant la fonction de Build au préalable
- **Push** l'image Docker
- **Run** une image Docker, en appelant la fonction de Build au préalable

Le tout en utilisant des variables afin de rendre le fichier plus flexible et portable, ainsi que la cible spéciale .DEFAULT_GOAL.

```makefile
.DEFAULT_GOAL: run

DOCKERHUB_NAME = mon_nom
IMAGE_NAME = mon_image

build:
    docker build -t $(IMAGE_NAME) .

scan: build
    docker scout quickview $(IMAGE_NAME)

push:
    docker tag $(IMAGE_NAME) $(DOCKERHUB_NAME)/$(IMAGE_NAME):latest
    docker push $(DOCKERHUB_NAME)/$(IMAGE_NAME):latest

run: build
    docker run -d $(IMAGE_NAME)
```

Nous avons un fichier Makefile, qui déclare 4 cibles (build, scan, push, run), deux variables (DOCKERHUB_NAME et IMAGE_NAME) et une “cible spécial” .DEFAULT_GOAL

Nous avons notre fichier, avec nos tâches, pour les exécuter, il suffit d’appeler la commande make avec le nom de la cible : 

**make build** va générer une image Docker de notre application selon un Dockerfile spécifié.
`make scan` va appelé make build, puis exécuter un scan de l’image Docker.
`make push` va pousser l’image dans la registry Docker.
`make run` va appelé make build, puis lancer l’image sur la machine local.

## [Condition](#condition) {#condition}

Les Makefiles permettent de mettre en place des conditions ;

### [Egal ou pas égal](#egal-ou-pas-egal) {#egal-ou-pas-egal}
ifreq : Vérifie si les deux arguments sont égaux

```makefile
cond:
ifeq ($(BOOL), "True")
        echo "True !"
else
        echo "False D:"
endif
```

Dans cet exemple, si BOOL est égal à “True”, alors il renvoie “True !”, autrement il renvoie “False D:”

ifneq : Vérifie si deux arguments ne sont pas égaux.

```makefile
cond:
ifneq ($(BOOL), "True")
        echo "True !"
else
        echo "False D:"
endif
```

Dans cet exemple, si BOOL est égal à “True”, alors il renvoie “False D:”, autrement il renvoie “True !”

### [Vide ou non vide](#vide-ou-non-vide) {#vide-ou-non-vide}

ifdef : Vérifie si la variable passée en paramètre possède une valeur.

```bash
bast@DESKTOP-97VIG3H:~$ cat Makefile
cond:
ifdef VALUE
        @echo $(VALUE)
else
        @echo "La variable est vide !"
endif
bast@DESKTOP-97VIG3H:~$ make cond
La variable est vide !

bast@DESKTOP-97VIG3H:~$ make cond VALUE="Une valeur !"
Une valeur !

bast@DESKTOP-97VIG3H:~$ make cond VALUE=""
La variable est vide !
bast@DESKTOP-97VIG3H:~$ make cond VALUE=" "
La variable est vide !
```

ifndef : Vérifie si la variable passée en paramètre ne possède pas de valeur.

```bash
bast@DESKTOP-97VIG3H:~$ cat Makefile
cond:
ifndef VALUE
        @echo "La variable est vide !"
else
        @echo "La variable n'est pas vide : $(VALUE)"
endif

bast@DESKTOP-97VIG3H:~$ make cond VALUE="  "
La variable est vide !

bast@DESKTOP-97VIG3H:~$ make cond VALUE="  am    i        empty  ?"
La variable n'est pas vide : am    i        empty  ?
```


## [C’est quoi l’avantage d’un Makefile par rapport à un script](#vide-ou-non-vide) {#vide-ou-non-vide}

C’est une question légitime, et la réponse que je vais vous donner est plutôt simple ;

### Abstraction et uniformisation

Le Makefile permet de faire office d’abstraction, en permettant à nos utilisateurs / équipés de pouvoir exécuter ce qui aurait été normalement plusieurs scripts en utilisant la commande make, on réunit tout notre processus dans un unique fichier.

De plus, ce fichier va permettre d’uniformiser les différents processus pour ceux qui les utilise, prenons le cas de l'exécution du projet ; Que ce soit un projet en JavaScript, Java, Python ou Go, le développeur n’aura qu’à faire “make run” pour lancer son projet, indépendamment de la technologie utilisée.

### Portabilité

Au lieu d’avoir une myriade de scripts par projet, vous n’avez qu’un Makefile par projet à entretenir (ou plusieurs Makefile par projet, mais vous aurez toujours moins de Makefiles qu’il n’y aurait eu de scripts).

Avoir plusieurs scripts peut être nécessaire, notamment si la tâche qu’ils exécutent est complexe, mais si les scripts sont relativement courts et simples, tout réunir dans un seul et unique fichier peut valoir le coup, cela va dépendre de chacun.


## Task(file) et Just(file)

Make, et donc le Makefile par extension, existe depuis longtemps, bien plus longtemps que moi ! Et comme moi, des gens aiment GNU make et sa proposition.

Le problème avec make, c’est qu’il a été créé avec pour but premier la compilation de code C et C++. Il est un produit qui répond à un besoin spécifique, mais qui est suffisamment flexible pour répondre à d'autres besoins, bien qu'il demande souvent des adaptations.

Là où je veux en venir, c’est qu'au fil du temps, différentes solutions ont été créées, partant de make pour proposer quelque chose qui correspond plus à nos besoins. Parmi ces alternatives, on trouve **just** et **task**, deux alternatives populaires à make.

Je n’entre pas dans les détails de Task et Just, mais si vous recherchez une solution similaire à Make mais pensée pour être plus simple et facile à configurer/utiliser, incluant des fonctionnalités pratiques (lecture des fichiers .env, pas besoin de spécifier les cibles en .PHONY, possibilité de lister les cibles définies et leur description…), ils peuvent être une alternative intéressante. Cependant, contrairement à make qui est disponible presque partout, il vous faudra les installer au préalable.

- Justfile : https://just.systems/man/en/chapter_1.html
- Taskfile : https://taskfile.dev/

Note : Just utilise la même syntaxe que Make, là où Task est configuré en utilisant du YAML.

## Pour plus d’informations : 

- Site officiel de “make” : [Site officiel de “make”](https://www.gnu.org/software/make/manual/make.html)
- GNU make for DevOps engineers : ["GNU make for DevOps engineers" de Alex Harvey](https://alexharv074.github.io/2019/12/26/gnu-make-for-devops-engineers.html)
- Exemple de Makefile dans le monde réel (GraphQL Python) : [Exemple de Makefile dans le monde réel (GraphQL Python)](https://github.com/graphql-python/graphene/blob/master/docs/Makefile)
- Exemple de Makefile dans le monde réel (NGINX) : [Exemple de Makefile dans le monde réel (NGINX)](https://hg.nginx.org/pkg-oss/file/tip/Makefile)

