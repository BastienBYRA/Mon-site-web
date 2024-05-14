---
title: Make(file) et DevOps
filename: make-et-devops
description: "TODO"
image: "TODO.webp"
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
---

# Make(file) dans le processus de développement logiciel

## Présentation

Un Makefile est un fichier utilisé dans le développement de logiciels pour spécifier les étapes nécessaires à la compilation et à la construction du projet, associé à la commande GNU make, il avait été créé dans les années 70 pour automatiser le processus de compilation des projets C et C++.

Un Makefile est composé de cibles, ces cibles sont composé de une à plusieurs commandes, chaque cible peut avoir aucun à plusieurs prérequis qui seront exécuté avant celle de la cible.

La structure d'un fichier Makefile est simple :

Cible: prérequis
    commande 1
    commande 2
    …


## Exemple 1 : Créer un fichier, le remplir et le supprimer

Prenons un exemple simple, créons un fichier Makefile vide, auquel on va ajouter deux cibles; 
“create” qui aura pour rôle de créer le fichier “file”, auquel on va ajouter le texte “Quel beau fichier” dedans.
“delete” qui va supprimer le fichier “file”

create:
    touch file
    echo "Quel beau fichier" > file

delete:
    rm -f file


Pour exécuter “create”, on utilise la commande “make create”, et pour exécuter “delete” on exécute “make delete”

Note : Par défaut, le Makefile écrit les instructions de la cible.

# On exécute la cible create permettant de créer un fichier “file”, et de lui ajouter du contenu
bast@DESKTOP-97VIG3H:~$ make create
touch file
echo "Quel beau fichier" > file

bast@DESKTOP-97VIG3H:~$ ls
Makefile  file

bast@DESKTOP-97VIG3H:~$ cat file
Quel beau fichier

# On éxécute la cible delete permettant de supprimer le fichier “file”
bast@DESKTOP-97VIG3H:~$ make delete
rm -f file

bast@DESKTOP-97VIG3H:~$ ls
Makefile


## Variables

Et si on complexifie un peu cette exemple, en ajoutant une variable, qui représentera le nom du fichier

FILENAME=file

create:
    touch $(FILENAME)

delete:
    rm -f $(FILENAME)


Le résultat reste le même, mais on peut maintenant facilement changer le fichier que l’on créer ou supprime

Il y a plusieurs façon de modifier le contenu de la variable

### Passer une nouvelles valeurs

On peut passer une valeur quand on exécute la cible : make create FILENAME=”second file”

### Variable d’environnement

On peut utiliser une variable d’environnement, il faudra cependant ne pas définir la variable dans le Makefile

create:
    touch $(FILENAME)

delete:
    rm -f $(FILENAME)


FILENAME=”second file” make create

### Variable référencé

Une variable peut en référencé une autre, et ainsi de suite, prenons l’exemple suivant

FULLNAME="$(FULL) :D"
FULL="$(FIRSTNAME) $(LASTNAME)"
FIRSTNAME="Bastien"
LASTNAME="BYRA"

echo:
        echo $(FULLNAME)


Nous avons deux variables, FIRSTNAME et LASTNAME qui sont défini

FULL est une variable qui concatène les deux, donnant le résultat “Bastien BYRA”

FULLNAME est une variable qui ajoute un smiley à la fin, donnant le résultat “Bastien BYRA :D”

bast@DESKTOP-97VIG3H:~$ make echo
echo """Bastien" "BYRA"" :D"
Bastien BYRA :D


### Fichier de variable d’environnement

Pour finir, on peut aussi utiliser les variables d’un fichier d’environnement (.env) en l’incluant dans le Makefile

bast@DESKTOP-97VIG3H:~$ cat .env
FULLNAME=SOMEONE

bast@DESKTOP-97VIG3H:~$ cat Makefile
FULLNAME="$(FULL) :D"
FULL="$(FIRSTNAME) $(LASTNAME)"
FIRSTNAME="Bastien"
LASTNAME="BYRA"

include .env

echo:
        echo $(FULLNAME)

bast@DESKTOP-97VIG3H:~$ make echo
echo SOMEONE
SOMEONE


Note : La valeur FULLNAME de mon fichier d’environnement à override la valeur FULLNAME défini dans mon Makefile, mais c’est uniquement le cas car j’ai mis la directive “include” après la définition de ma variable FULLNAME, si j’ajoute la directive “include” au début de mon fichier, la valeur de FULLNAME sera “Bastien BYRA :D”

## Cacher des instructions spécifique

Par défaut, un Makefile va écrire les instruction exécutée au fur et à mesure de son exécution, on peut le voir à l’appel de notre commande “echo $(FULLNAME)” qui renvoi echo """Bastien" "BYRA"" :D"

Pour éviter ça, on peut ajouter le caractère “@” devant la ligne dont on ne veut pas afficher l’instruction

echo:
        @echo $(FULLNAME)


Quand on exécute “make echo”

bast@DESKTOP-97VIG3H:~$ make echo
Bastien BYRA :D


## Les variables et cibles spéciales

Les fichiers Makefile ont un ensemble de varialbes spéciales https://www.gnu.org/software/make/manual/html_node/Special-Variables.html et cibles spéciales prédéfini trouvable ici : https://www.gnu.org/software/make/manual/html_node/Special-Targets.html

Elles sont toutes définies de la même manière : .<NOM_EN_MAJUSCULE>

Parmis les différentes cibles spéciales existantes, une est essentiel à savoir

### Cible .PHONY

Pour comprendre le but de .PHONY, il faut remettre en contexte le but du Makefile : à l’origine le Makefile était fait pour la automatiser la compilation de projet (en C par exemple), les cibles pouvait porter le même nom que le fichier qu’il compile, et il faisait office de check pour lui.

Si un fichier du même nom que la cible existe, alors la commande ne s’exécute pas, car tout est jugé comme étant en ordre, pour montrer concrètement, prenons l’exemple de “create”

Si nous n’avons pas de fichier nommé ‘create” à la racine du projet, il n’y aura aucun problème d’exécution de la cible

bast@DESKTOP-97VIG3H:~$ cat Makefile
create:
        @touch $(FILENAME)

bast@DESKTOP-97VIG3H:~$ make create FILENAME="create"
bast@DESKTOP-97VIG3H:~$ ls
Makefile  create


Nous avons créer un fichier “create”, maintenant refaisons exactement la même commande

bast@DESKTOP-97VIG3H:~$ make create FILENAME="create"
make: 'create' is up to date.


C’est problématique ça, car ça nous empêche de pouvoir exécuter notre cible “create”, comment résoudre ce problème ?

Pour ce faire, on utilise la cible spéciale “.PHONY” qui permet d’indiquer que la cible ne doit pas se soucier qu’il y est un fichier du même nom dans le répertoire.

Je vais ajouter les cibles “create” et “delete” dans ma cible .PHONY, il y a deux moyens de le faire.

.PHONY: create delete


ou

.PHONY: create
create:
    touch $(FILENAME)

.PHONY: delete
delete:
    rm -f $(FILENAME)


## Autre cible spéciales (et variable spéciales)

Il y a quelques autres cibles spéciales (ainsi que des variables spéciales) qui peuvent valoir le détour.

.DEFAULT_GOAL : Par défaut, si on exécute “make” sans spécifier de cible, la première cible est exécuté, .DEFAULT_GOAL permet de dire quelle est la cible à lancer si aucune cible est indiqué.
.SILENT : Par défaut, les cibles renvoie des résultats, un “docker pull” ou “docker build” renvoie beaucoup de ligne, .SILENT permet de dire à une ou plusieurs cible de rien envoyé à l’utilisateur

## Exemple 2 : Build, Scan et Push une image Docker

Pour donner un exemple un peu plus concret qui utilise ce que l’on à vu jusque la;

Voici un fichier Makefile, permettant de réaliser les actions suivantes ; 
Build une image Docker 
Run un scan sur l'image Docker, en appelant la fonction de Build au préalable
Push l'image Docker
Run une image Docker, en appelant la fonction de Build au préalable

Le tout en utilisant des variables afin de rendre le fichier plus flexible et portable, ainsi que la cible spéciale .DEFAULT_GOAL.

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


Nous avons un fichier Makefile, qui déclare 4 cibles (build, scan, push, run), deux variables (DOCKERHUB_NAME et IMAGE_NAME) et une “cible spécial” .DEFAULT_GOAL

Note : J’utilise ici .SILENT pour l’exemple, mais ne pas recevoir de retour d’une des cibles ci-dessus peut-être problématique, car alors on saura pas quel problème il y a eu s’il y en à.

Nous avons notre fichier, avec nos tâches, pour les exécuter, il suffit d’appeler la commande make avec le nom de la cible : 

make build va générer une image Docker de notre application selon un Dockerfile spécifié.
make scan va appelé make build, puis exécuter un scan de l’image Docker.
make push va pousser l’image dans la registry Docker.
make run va appelé make build, puis lancer l’image sur la machine local.

## Condition

Les Makefiles permettent de mettre en place des conditions ;

### Egal ou pas égal
ifreq : Vérifie si les deux arguments sont égal

cond:
ifeq ($(BOOL), "True")
        echo "True !"
else
        echo "False D:"
endif


Dans cet exemple, si BOOL est égal à “True”, alors il renvoie “True !”, autrement il renvoie “False D:”

ifneq : Vérifie si deux argument ne sont pas égal

cond:
ifneq ($(BOOL), "True")
        echo "True !"
else
        echo "False D:"
endif


Dans cet exemple, si BOOL est égal à “True”, alors il renvoie “False D:”, autrement il renvoie “True !”

### Vide ou non vide

ifdef : Vérifie si la variable passé en paramètre possède une valeur

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


ifndef : Vérifie si la variable passé en paramètre ne possède pas de valeur

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



## C’est quoi l’avantage d’un Makefile par rapport à un script

C’est une question légitime, et la réponse que je vais vous donner est plutôt simple ; 

Abstraction et uniformisation

Le Makefile permet de faire office d’abstraction, en permettant à nos utilisateurs / équipés de pouvoir exécuter ce qui aurait été normalement plusieurs scripts en utilisant la commande make, on réunit tout notre processus dans un unique fichier.

De plus, ce fichier va permettre d’uniformiser les différents processus pour ceux qui les utilise, prenons le cas de l'exécution du projet ; Que ce soit un projet en Javascript, Java, Python ou Go, le développeur n’aura qu’à faire “make run” pour lancer son projet, indépendamment de la technologie utilisée.

Portabilité

Au lieu de d’avoir une myriade de scripts par projet, vous n’avez qu’un Makefile par projet à entretenir (ou plusieurs Makefile par projet, mais vous aurez toujours moins que de Makefile qu’il n’y aurait eu de script).

Avoir plusieurs scripts peut être nécessaire, notamment si la tâche qu’il exécute est complexe, mais si les scripts sont relativement court et simple, tout réunir dans un seul et unique fichier peut valoir le coup, cela va dépendre de chacun.


## Task(file) et Just(file)

Make, et donc le Makefile par extension, existe depuis maintenant longtemps, plus vieux que moi ! Et comme moi, des gens aiment GNU make et sa proposition.

Le problème de make, c’est qu’il à été créer avec pour but premier la compilation de code C et C++, il est un produit qui répond à une offre, et qui est suffisamment flexible pour en répondre à d’autre, mais qui nous demande de s’adapter pour le faire fonctionner.

Là ou je veux en venir, c’est que différentes solutions ont été créées au fil du temps, partant de make pour proposer quelque chose qui correspond plus à nos besoins, parmi celles-ci se trouve `just` et `task`, deux alternatives populaires de make.

Je n’entre pas en détail dans Task et Just, mais si vous voulez une solution similaire à Make mais qui est pensée pour être plus simple et facile à configurer / utiliser, incluant des fonctionnalités pratique (lecture des .env, pas de .PHONY, pouvoir lister les cibles défini et leurs description…), ils peuvent être une solution alternative, bien que contrairement à make qui est disponible presque partout, il vous faudra les installer au préalable.

Justfile : https://just.systems/man/en/chapter_1.html
Taskfile : https://taskfile.dev/

Note : Just utilise la même syntaxe que Make, là où Task est configuré en utilisant du YAML.

## Pour plus d’informations : 

Site officiel de “make” : https://www.gnu.org/software/make/manual/make.html
GNU make for DevOps engineers : https://alexharv074.github.io/2019/12/26/gnu-make-for-devops-engineers.html
Exemple de Makefile dans le monde réel (GraphQL Python) : https://github.com/graphql-python/graphene/blob/master/docs/Makefile
Exemple de Makefile dans le monde réel (NGINX) : https://hg.nginx.org/pkg-oss/file/tip/Makefile

