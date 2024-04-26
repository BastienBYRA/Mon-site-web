---
title: Comment modifier ou retirer le header "Server" de NGINX
filename: Comment-modifier-ou-retirer-le-header-server-de-nginx
description: "NGINX comme d'autre serveur web envoie une entête 'Server' permettant d'identifier la technologie du serveur, ce qui représente une vulnérabilité, nous allons voir comment modifier ou supprime cette entete."
gitHubURL: "https://github.com/olawanlejoel/random-quote-generator"
image: "NGINX.webp"
layout: layouts/article.njk
tags: article
date: 2017-12-01
dateText : 25 AVRIL 2024
subject:
    - TECH
    - NGINX
    - WEB SERVER
---

## Sommaire
    - [Ce qui ne fonctionne pas](#ce-qui-ne-fonctionne-pas)
    - [Comment on fait alors ?](#comment-on-fait-alors)
    - [La solution](#la-solution)
    - [Comment installer les modules NGINX hors du container NGINX](#comment-installer-les-modules-NGINX-hors-du-container-NGINX)
    - [Fichier à modifier pour appliquer les modules dans votre NGINX](#fichier-a-modifier-pour-appliquer-les-modules-dans-votre-NGINX)
<br>

**NGINX**, comme tout serveur web, envoie dans ses requêtes et réponse HTTP des en-têtes, des "headers".

Ces en-têtes sont utiles, car ils permettent de pouvoir faire passer des données nécessaires au serveur ainsi qu'au navigateur (Authorization, Content-Security-Policy, Cache-Control…).

Parmi les différents en-têtes envoyés par le serveur en réponse existe **l’en-tête “server”** qui permet d'identifier le serveur que l'on utilise, dans le cas de NGINX, on reçoit une données sous la forme de **nginx/\<version\>**

![Image mettant en évidence l'entete "Server" envoyé par le serveur NGINX](../../assets/blog/{{ filename }}/NGINX-header-show.png)
<p class="image-related-text">L'entête “server” par défaut de Nginx</p>

Maintenant soyons honnête, vous pourriez vous en foutre, et continuer votre vie, grand bien vous fasse, mais vous pourriez aussi vous dire "Merde, j'ai pas envie que de potentiel attaquant sache quel technologie de serveur web j'utilise !"

Si c'est votre cas, alors vous êtes au bon endroit, ici je vous montre comment modifier ou retirer, cet en-tête.

<!-- ## Ce qui ne fonctionne pas -->
<h2 id="ce-qui-ne-fonctionne-pas">Ce qui ne fonctionne pas</h2>

J'ai passé plusieurs jours dessus, je vais donc prendre le temps de passer sur certaines méthodes que j'ai vu être proposées qui ne fonctionnent pas, voir qui sont complètement catastrophiques.

### Méthode 1 : installer le package "nginx-extras"

Cette méthode est plutôt simple ; Installer le package nginx-extras, et hop, vous avez un NGINX prêt avec tout plein de packages.

Ça marche, oui, vous aurez un NGINX qui tourne avec des modules, dont "header-more" qui permet de modifier ou supprimer des headers que l'on ne pourrait normalement pas, comme l'en-tête “server”.

Vous aurez cependant une ~~bonne~~ mauvaise surprise quand vous verrez que ce package vous fait une réinstallation complète de NGINX, en vous faisant une réinstallation complète utilisant une version daté... (V1.18, on est à la V1.25)

### Méthode 2 : Utiliser la directive "server_tokens off;"

C'est un bon début, cette directive permet de supprimer la version de Nginx dans l’en-tête “Server", cependant il laisse le NGINX dans l'en-tête, next.

### Méthode 3 : Utiliser la directive "proxy_pass_header Server;"

Non.

Le nom de la directive implique que l'on passe un l’en-tête dans nos réponses HTTP, pour rappel, on essaie d’éviter de passer l’en-tête “Server”.

D'après la documentation officielle de NGINX :
"Permits passing otherwise disabled header fields from a proxied server to a client.", next !

### Méthode 4 : Passer la directive "proxy_pass_header: Server"

L'idée est bonne, on passe un en-tête HTTP "server", pour remplacer celui automatiquement généré par notre serveur web. 

Le problème, c'est que dans la pratique ça va rajouter un deuxième en-tête "server"...

<!-- ## Comment fait-on alors ? -->
<h2 id="comment-on-fait-alors">Comment fait-on alors ?</h2>

Je vais ici expliquer la méthode permettant de pouvoir résoudre notre problème sur une vraiment pré-build / compilé de NGINX (Obtenu via installation du paquet nginx, via une image Docker...)

Cette méthode est tout aussi fonctionnelle pour une version non compilée, mais il me semble qu'il existe une seconde méthode demandant de modifier des fichiers avant la compilation du code, à vos risques et péril si vous l'essayez.

<!-- ## La solution -->
<h2 id="la-solution">La solution</h2>

Le [repository Github de NGINX](https://github.com/nginxinc/docker-nginx), dans son [dossier "modules"](https://github.com/nginxinc/docker-nginx/tree/master/modules), fourni deux Dockerfile, une utilisant le gestionnaire de paquet apt (Dockerfile) et une autre utilisant apk (Dockerfile.alpine). Elles permettent de pouvoir installer les modules que l'on veut dans une image NGINX de notre choix.

Laissez moi vous expliquer un peu plus en détails :

Les Dockerfiles vont prendre deux arguments en paramètre  :
- **NGINX_FROM_IMAGE** qui prend le nom d'une image NGINX en paramètre, par exemple : "nginx:1.25" ou “nginxinc/nginx-unprivileged:1.25-alpine”.
- **ENABLED_MODULES** qui prend en paramètre la liste des modules que l'on veut, par exemple : "headers-more lua passenger perl" si on veut ajouter les modules headers-more, lua, passgenger et perl.

À noter que pas tous les modules sont disponibles, vous trouverez la liste des modules dans [les dossiers "debian" ou "alpine" en fonction du Dockerfile utilisé](https://hg.nginx.org/pkg-oss/file/tip).

![Image montrant les modules disponible pour NGINX Alpine](../../assets/blog/{{ filename }}/NGINX-repo-mercurial.png)
<p class="image-related-text">La liste des modules disponible pour NGINX Alpine en version 1.25</p>

En fonction de l'installation de NGINX que l'on veut (Debian / Ubuntu ou Alpine), on va installer le fichier Dockerfile correspondant sur notre machine local. 
- [Dockerfile](https://github.com/nginxinc/docker-nginx/blob/master/modules/Dockerfile) pour Ubuntu / Debian / Distro utilisant l’utilitaire de paquet “apt”
- [Dockerfile.alpine](https://github.com/nginxinc/docker-nginx/blob/master/modules/Dockerfile.alpine) pour Alpine / Distro utilisant l’utilitaire de paquet “apk”

**Pour l'exemple, je vais vous présenter comment ajouter les modules dans un NGINX Alpine, la seule et unique chose qui change entre la version Debian et Alpine et le package manager, dont vous n'avez pas à vous souciez car vous n'aurez pas à modifier les images.**

Une fois que l'on à installer le Dockerfile qui correspond à nos besoins, on va lancer cette commande (réaliser les modifications nécessaire à vos besoins) :
```docker
docker build -f Dockerfile --build-arg ENABLED_MODULES="headers-more" --build-arg NGINX_FROM_IMAGE="nginx:1.25-alpine" -t my-nginx-with-headers-more /path/to/Dockerfile
```
Explication de la commande :
- **docker build**
- **-f Dockerfile** : On précise le nom du fichier Dockerfile qu'il doit utiliser, Dockerfile, Dockerfile.alpine ou un autre nom si vous l'avez modifiez.
- **--build-arg ENABLED_MODULES="headers-more"** : On lui dit les modules que l'on veut, ici on installe uniquement headers-more
- **--build-arg NGINX_FROM_IMAGE="nginx:1.25-alpine"** : **Argument optionnel**, On lui dit l’image NGINX à utilisé, si on ne saisie pas cette argument, alors il utilisera nginx:mainline ou nginx:mainline-alpine en fonction du Dockerfile utilisé
- **-t my-nginx-with-headers-more** : Nom donné à l’image que l’on va créer (le NGINX avec les modules)
- **/path/to/Dockerfile** : Chemin vers le Dockerfile

Exécuter la commande, et à la fin vous aurez une belle image NGINX dans la version voulue avec vos modules.

Vous avez désormais un NGINX presque fonctionnelle, avec le module “headers-more” permettant de pouvoir modifier / supprimer l’en-tête “Server”

Il vous suffit d’ajouter deux lignes dans le fichier /etc/nginx/nginx.conf de votre container pour qu’il supprime l’en-tête.

Mais attendez, j’y reviendrai juste après ! Et pourquoi pas maintenant, certains d’entre vous pourraient se demander ?

Car certaines personnes voudraient peut-être pouvoir installer leurs modules sur un NGINX installé directement sur leur machine, un NGINX installé nativement sur leur host, ou peut-être que certains doivent gérer plusieurs projets utilisant NGINX, et n’ont pas les mêmes besoins de modules.

Quelque soit vos raisons, je vais vous apprendre comment sortir vos modules NGINX de votre container.

<!-- ## Comment installer les modules NGINX hors du container NGINX -->
<h2 id="comment-installer-les-modules-NGINX-hors-du-container-NGINX">Comment installer les modules NGINX hors du container NGINX</h2>

Une question simple, qui je pensais au départ allez être simple, l’histoire de 5 minutes.

NGINX installe ses modules dans le dossier “modules” situé dans /etc/nginx/modules, vous pourriez être tenté de simplement copier ce dossier hors de votre container pour ensuite le copier dans vos autre installation de NGINX

Ca ne va pas fonctionner, dans les faits, vous risquez d’avoir une erreur vous disant que vous avez un problème de version, headers-more vous dira qu’il a besoin d’un NGINX v1.18, et ce alors même que quand il était encore dans le container, il fonctionnait très bien sur un NGINX v1.25

*Note personnel ici, mais dieu sait que si un ingénieur de NGINX était passé à côté de moi à ce moment précis, je l’aurai emmené dans un ring de MMA dans un combat à mort, no items fox only destination finale.*

Pour pouvoir installer les modules hors de l’image, vous allez devoir modifier le Dockerfile fournit par NGINX, vous allez supprimer la dernière partie de celle-ci, celle qui créer le deuxième NGINX (Vous pouvez pas la louper) : 

```
ARG NGINX_FROM_IMAGE=nginx:mainline
FROM ${NGINX_FROM_IMAGE} as builder

ARG ENABLED_MODULES

SHELL ["/bin/bash", "-exo", "pipefail", "-c"]

RUN if [ "$ENABLED_MODULES" = "" ]; then \
        echo "No additional modules enabled, exiting"; \
        exit 1; \
    fi

COPY ./ /modules/

RUN apt-get update \
    && apt-get install -y --no-install-suggests --no-install-recommends \
                patch make wget mercurial devscripts debhelper dpkg-dev \
                quilt lsb-release build-essential libxml2-utils xsltproc \
                equivs git g++ libparse-recdescent-perl \
    && XSLSCRIPT_SHA512="f7194c5198daeab9b3b0c3aebf006922c7df1d345d454bd8474489ff2eb6b4bf8e2ffe442489a45d1aab80da6ecebe0097759a1e12cc26b5f0613d05b7c09ffa *stdin" \
    && wget -O /tmp/xslscript.pl https://hg.nginx.org/xslscript/raw-file/01dc9ba12e1b/xslscript.pl \
    && if [ "$(cat /tmp/xslscript.pl | openssl sha512 -r)" = "$XSLSCRIPT_SHA512" ]; then \
        echo "XSLScript checksum verification succeeded!"; \
        chmod +x /tmp/xslscript.pl; \
        mv /tmp/xslscript.pl /usr/local/bin/; \
    else \
        echo "XSLScript checksum verification failed!"; \
        exit 1; \
    fi \
    && hg clone -r ${NGINX_VERSION}-${PKG_RELEASE%%~*} https://hg.nginx.org/pkg-oss/ \
    && cd pkg-oss \
    && mkdir /tmp/packages \
    && for module in $ENABLED_MODULES; do \
        echo "Building $module for nginx-$NGINX_VERSION"; \
        if [ -d /modules/$module ]; then \
            echo "Building $module from user-supplied sources"; \
            # check if module sources file is there and not empty
            if [ ! -s /modules/$module/source ]; then \
                echo "No source file for $module in modules/$module/source, exiting"; \
                exit 1; \
            fi; \
            # some modules require build dependencies
            if [ -f /modules/$module/build-deps ]; then \
                echo "Installing $module build dependencies"; \
                apt-get update && apt-get install -y --no-install-suggests --no-install-recommends $(cat /modules/$module/build-deps | xargs); \
            fi; \
            # if a module has a build dependency that is not in a distro, provide a
            # shell script to fetch/build/install those
            # note that shared libraries produced as a result of this script will
            # not be copied from the builder image to the main one so build static
            if [ -x /modules/$module/prebuild ]; then \
                echo "Running prebuild script for $module"; \
                /modules/$module/prebuild; \
            fi; \
            /pkg-oss/build_module.sh -v $NGINX_VERSION -f -y -o /tmp/packages -n $module $(cat /modules/$module/source); \
            BUILT_MODULES="$BUILT_MODULES $(echo $module | tr '[A-Z]' '[a-z]' | tr -d '[/_\-\.\t ]')"; \
        elif make -C /pkg-oss/debian list | grep -P "^$module\s+\d" > /dev/null; then \
            echo "Building $module from pkg-oss sources"; \
            cd /pkg-oss/debian; \
            make rules-module-$module BASE_VERSION=$NGINX_VERSION NGINX_VERSION=$NGINX_VERSION; \
            mk-build-deps --install --tool="apt-get -o Debug::pkgProblemResolver=yes --no-install-recommends --yes" debuild-module-$module/nginx-$NGINX_VERSION/debian/control; \
            make module-$module BASE_VERSION=$NGINX_VERSION NGINX_VERSION=$NGINX_VERSION; \
            find ../../ -maxdepth 1 -mindepth 1 -type f -name "*.deb" -exec mv -v {} /tmp/packages/ \;; \
            BUILT_MODULES="$BUILT_MODULES $module"; \
        else \
            echo "Don't know how to build $module module, exiting"; \
            exit 1; \
        fi; \
    done \
    && echo "BUILT_MODULES=\"$BUILT_MODULES\"" > /tmp/packages/modules.env

# ------------------------------------------------------------------------------------------------------------------------------------------------------------
# -------------------------------------------------------------VOUS SUPPRIMER CETTE PARTIE--------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------------------------------------------
FROM ${NGINX_FROM_IMAGE}
RUN --mount=type=bind,target=/tmp/packages/,source=/tmp/packages/,from=builder \
    apt-get update \
    && . /tmp/packages/modules.env \
    && for module in $BUILT_MODULES; do \
           apt-get install --no-install-suggests --no-install-recommends -y /tmp/packages/nginx-module-${module}_${NGINX_VERSION}*.deb; \
       done \
    && rm -rf /var/lib/apt/lists/
# ------------------------------------------------------------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------------------------------------------
# -------------------------------------------------------------VOUS SUPPRIMER CETTE PARTIE--------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------------------------------------------
```

En faisant ça, en lançant la commande évoqué plus haut, l’image créer ne sera plus l’image NGINX clean, mais celle avec tous ses utilitaire, et surtout, celle ayant les fichiers d’installation des modules, dans son /tmp/packages

Supprimer les lignes évoqué plus haut du Dockerfile, créer l’image Docker, et copier le dossier /tmp/packages sur votre host.

Félicitation, vous avez vos fichiers d’installation de modules.

Comment les installer ? Rien de plus simple.

```bash
apt-get install --no-install-suggests --no-install-recommends -y /path/to/tmp/packages/nginx-module-*${NGINX_VERSION}*.deb;
```

Modifier “/path/to/tmp/packages” par le chemin vers lequel vous avez installé le /tmp/packages du container, et hop, ça installe vos modules.

<!-- ## Fichier à modifier pour appliquer les modules dans votre NGINX -->
<h2 id="fichier-a-modifier-pour-appliquer-les-modules-dans-votre-NGINX">Fichier à modifier pour appliquer les modules dans votre NGINX</h2>

Maintenant que l’on est tous au même niveau, il suffit de rajouter deux lignes dans le fichier nginx.conf

(Je prend le fichier nginx.conf par défaut comme exemple) 

```
user nginx;
worker_processes 1;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;
# -----------------------------------------------------------------------------------
# --------------------------- ON IMPORTE NOS MODULES --------------------------------
# -----------------------------------------------------------------------------------
load_module modules/ngx_http_security_headers_module.so;
# -----------------------------------------------------------------------------------
# --------------------------- ON IMPORTE NOS MODULES --------------------------------
# -----------------------------------------------------------------------------------
events {
    . . .
}

http {
# -----------------------------------------------------------------------------------
# -------------- ON DESACTIVE L'AFFICHAGE DE LA VERSION DE NGINX --------------------
# -----------------------------------------------------------------------------------
    server_tokens: off;

# -----------------------------------------------------------------------------------
# ------------------- MODIFIE OU SUPPRIME L'ENETE "Server" --------------------------
# -----------------------------------------------------------------------------------
    # Supprimer l’en-tête “Server”
    more_clear_headers Server;

    # OU

    # Modifier l'en-tête “Server”
    more_set_headers    "Server: my_server";
    . . .
}
```

Ajouter la directive “load_modules” **AVANT** la directive “http” pour importer le module headers-more

Ajouter la directive server_tokens: off pour désactiver les détails de NGINX, et finalement ajouter au choix : 
- **more_clear_headers** : Supprime complètement le header
- **more_set_headers** : Modifie la valeur du header

Et… C’est bon ! Plus de NGINX dans l’en-tête “server” dans vos réponse HTTP.

Tout ça pour ça… Mon dieu… par pitié F5, faites un truc facile à modifier, et je ne parle pas d'une solution demandant d’avoir NGINX Plus !