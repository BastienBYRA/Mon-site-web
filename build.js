import { marked } from "marked"
import fs from "fs"

// Dossiers
const ARTICLE_FOLDER = "./articles/"
const BUILD_FOLDER = "./build/"
const TEMPLATE_FOLDER = "./src/templates/"

// Encodage
const ENCODING = "utf-8"

// Templates
const HEADER_FILE = TEMPLATE_FOLDER + "header.html"
const FOOTER_FILE = TEMPLATE_FOLDER + "footer.html"
const INDEX_FILE = TEMPLATE_FOLDER + "index.html"
const ARTICLE_FILE = TEMPLATE_FOLDER + "article.html"

// Variables
const FRONTMATTER_VARIABLE = ["title", "description", "date", "image", "tags"]
class Article {
    constructor(title, description, date, image, tags, content, filename) {
        this.title = title
        this.description = description
        this.date = date
        this.image = image
        this.tags = tags
        this.content = content
        this.filename = filename
    }
}

/**
 * Transforme les fichiers Markdown en fichiers HTML
 * 
 * @returns [string]
 */
const parseMarkdown = () => {
    // Tableau contenant tout les noms des fichiers du dossier `articles`
    var articleFilenames = fs.readdirSync(ARTICLE_FOLDER, { encoding: ENCODING })

    // Array contenant tout les articles
    var listArticle = []

    articleFilenames.forEach(articleFilename => {
        // Initialise l'objet Article
        var article = new Article()

        // Récupère le contenu de l'article
        var articleContent = fs.readFileSync(ARTICLE_FOLDER + articleFilename, { encoding: ENCODING })

        FRONTMATTER_VARIABLE.forEach(variable => {
            article[variable] = extractFrontMatter(articleContent, variable)
        })

        // Supprime le Front-matter
        articleContent = removeFrontMatter(articleContent)

        // Converti les fichiers Markdown > HTML
        var articleHTML = marked.parse(articleContent)

        // Ajout le contenu et le nom du fichier à l'objet Article
        article.content = articleHTML
        article.filename = articleFilename.replace(".md", ".html")

        listArticle.push(article)
    })

    return listArticle
}

/**
 * 
 * Supprime la section Front-matter du début de l'article
 * 
 * @param {string} articleContent 
 * @returns string
 * 
 */
const removeFrontMatter = (articleContent) => {
    // Regex qui supprime tout ce qui se trouve entre deux sections "---"
    // Utilisé pour supprimé les front-matter
    //
    // ^---       => correspond aux --- en début de chaîne
    // [\s\S]*?   => capture tout (y compris les sauts de ligne), en mode non-greedy (?) pour s'arrêter au premier --- de fermeture
    // ---        => le --- de fermeture
    // \n?        => consomme optionnellement le saut de ligne qui suit
    return articleContent.replace(/^---[\s\S]*?---\n?/, "")
}

/**
 * Récupère le contenu de la variable du Frontmatter
 * 
 * @param {string} articleContent 
 */
const extractFrontMatter = (articleContent, variableName) => {
    // Extracte le texte autour de la variable Frontmatter pour récupère sa valeur ainsi que tout le reste de l'article dans le second élément du tableau
    var parts = articleContent.split(`${variableName}: `)

    // Split sur `\n` (newline) pour ne récupérer que la valeur du Frontmatter
    var valueLines = parts[1].split("\n")[0]
    return valueLines
}

// const mergeFilesIndex = (articlesHTML) => {
//     // Créer le dossier `build`
//     if (!fs.existsSync(BUILD_FOLDER)){
//         fs.mkdirSync(BUILD_FOLDER);
//     }

//     const INDEX_PAGE = "./src/templates/index.html"


// }

const mergeFilesArticle = (listArticle) => {
    // Créer le dossier `build`
    if (!fs.existsSync(BUILD_FOLDER)){
        fs.mkdirSync(BUILD_FOLDER);
    }

    const headerContent = fs.readFileSync(HEADER_FILE, { encoding: ENCODING })
    const bottomContent = fs.readFileSync(FOOTER_FILE, { encoding: ENCODING })
    var articleContent = fs.readFileSync(ARTICLE_FILE, { encoding: ENCODING })

    articleContent = articleContent.replace("{{ blog__header_block }}", headerContent)
    articleContent = articleContent.replace("{{ blog__footer_block }}", bottomContent)

    // Assemble les fichiers
    listArticle.forEach(article => {
        const fullFilepath = BUILD_FOLDER + article.filename

        articleContent = articleContent.replaceAll("{{ article__date_block }}", article.date)
        articleContent = articleContent.replaceAll("{{ article__tags_block }}", article.tags)
        articleContent = articleContent.replaceAll("{{ article__title_block }}", article.title)
        articleContent = articleContent.replaceAll("{{ article__description_block }}", article.description)
        articleContent = articleContent.replaceAll("{{ article__content_block }}", article.content)

        fs.writeFileSync(fullFilepath, articleContent, { encoding: ENCODING })
    })
} 

let listArticle = parseMarkdown()
mergeFilesArticle(listArticle)