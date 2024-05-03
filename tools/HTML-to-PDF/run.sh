# source .env
dir="$(dirname "$0")"
. "$dir/.env"

# Code logic

if [ "$1" = "full" ]; then
    TYPE="full"
else
    TYPE="small"
fi

# wkhtmltopdf fonctionne pour une vielle version de JavaScript, il faut donc utiliser des méthodes plus vielle pour le faire fonctionner
# Par exemple, element.remove() ne fonctionne pas, il faut utiliser element.parentNode.removeChild(element)
# Les fonctions fléchés ne fonctionnent pas non plus, il faut utiliser function() {}
docker run surnet/alpine-wkhtmltopdf:$VERSION-$TYPE \
    --debug-javascript \
    --run-script "
        var element = document.getElementById('toggle-menu-header');
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }

        var elements = document.querySelectorAll('.article-image');
        for (var i = 0; i < elements.length; i++) {
            if (elements[i] && elements[i].parentNode) {
                elements[i].parentNode.removeChild(elements[i]);
            }
        }

        elements = document.querySelectorAll('.article-color-block');
        for (i = 0; i < elements.length; i++) {
            elements[i].style.background = 'white !important';
        }
    " \
    $FULL_URL - > $FILE