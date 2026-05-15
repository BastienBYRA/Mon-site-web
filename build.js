import { marked } from "marked"
import fs from "fs"

const ARTICLE_FOLDER = "./articles/"
const BUILD_FOLDER = "./build/"
const ENCODING = "utf-8"
const TOP_PAGE = "./src/templates/top.html"
const BOTTOM_PAGE = "./src/templates/bottom.html"

/**
 * Transforme les fichiers Markdown en fichiers HTML
 * 
 * @returns {}
 */
const parseMarkdown = () => {
    // Tableau contenant tout les noms des fichiers du dossier `articles`
    var articleFilenames = fs.readdirSync(ARTICLE_FOLDER, { encoding: ENCODING })

    // Dictionnaire contenant tout les articles au format HTML
    var articlesHTML = {}

    articleFilenames.forEach(article => {
        // Récupère le contenu de l'article
        var articleContent = fs.readFileSync(ARTICLE_FOLDER + article, { encoding: ENCODING })

        // Supprime le Front-matter
        articleContent = removeFrontMatter(articleContent)

        // Converti les fichiers Markdown > HTML
        var articleHTML = marked.parse(articleContent)

        articlesHTML[article.replace(".md", ".html")] = articleHTML
    })

    return articlesHTML
}

/**
 * 
 * @param {string} articleContent 
 * @returns string
 * 
 * Supprime la section Front-matter du début de l'article
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

const mergeFiles = (articlesHTML) => {
    // Créer le dossier `build`
    if (!fs.existsSync(BUILD_FOLDER)){
        fs.mkdirSync(BUILD_FOLDER);
    }

    const topPageContent = fs.readFileSync(TOP_PAGE, { encoding: ENCODING })
    const bottomPageContent = fs.readFileSync(BOTTOM_PAGE, { encoding: ENCODING })

    // Assemble les fichiers
    Object.keys(articlesHTML).forEach(filename => {
        const filepath = BUILD_FOLDER + filename
        const articleContent = articlesHTML[filename]

        fs.writeFileSync(filepath, topPageContent + "\n", { encoding: ENCODING })
        fs.appendFileSync(filepath, articleContent + "\n", { encoding: ENCODING })
        fs.appendFileSync(filepath, bottomPageContent, { encoding: ENCODING })
    });
} 

let articlesHTML = parseMarkdown()
mergeFiles(articlesHTML)