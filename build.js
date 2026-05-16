import { marked } from "marked"
import fs from "fs"
import { gfmHeadingId } from "marked-gfm-heading-id";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

const renderer = {
    heading({ text, depth }) {
        const idMatch = text.match(/\{#([^}]+)\}/)
        let id, cleanText
        if (idMatch) {
            id = idMatch[1]
            cleanText = text.replace(/\s*\{#[^}]+\}/, '')
        } else {
            cleanText = text
            id = text.toLowerCase().replace(/[^\wÀ-ɏ]+/g, '-').replace(/^-|-$/g, '')
        }
        return `<h${depth} id="${id}">${cleanText}</h${depth}>\n`
    }
}
marked.use({ renderer })
marked.use(markedHighlight({
	emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
}))
// marked.use(gfmHeadingId())

// Dossiers
const ARTICLE_FOLDER = "./articles/"
const BUILD_FOLDER = "./build/"
const TEMPLATE_FOLDER = "./src/templates/"
const DEV_ASSETS_FOLDER = "/src/assets/"
const PROD_ASSETS_FOLDER = "/assets/"

// Encodage
const ENCODING = "utf-8"

// Templates
const HEADER_FILE = TEMPLATE_FOLDER + "header.html"
const FOOTER_FILE = TEMPLATE_FOLDER + "footer.html"
const INDEX_FILE = TEMPLATE_FOLDER + "index.html"
const ARTICLE_FILE = TEMPLATE_FOLDER + "article.html"

// Variables
const FRONTMATTER_VARIABLE = ["title", "description", "date", "image", "tags"]

// Environnement
var PRODUCTION = process.env.PRODUCTION ? true : false

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

        // Utilise le bon dossier d'assets
        articleContent = articleContent.replaceAll("{{ blog__assets }}", setAssetsFolder())

        // Converti les fichiers Markdown > HTML
        var articleHTML = marked.parse(articleContent)
        // var articleHTML = marked(articleContent, { headerIds: true })

        // Ajout le contenu et le nom du fichier à l'objet Article
        article.content = articleHTML
        article.filename = articleFilename.replace(".md", ".html").replace(/^\d+-\d+-\d+-/, '')

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
    var parts = articleContent.split(`${variableName}: `)
    if (parts.length < 2) return ''
    return parts[1].split("\n")[0].trim().replace(/^["']|["']$/g, '')
}

const generateIndex = (listArticle) => {
    if (!fs.existsSync(BUILD_FOLDER)) {
        fs.mkdirSync(BUILD_FOLDER)
    }

    const headerContent = fs.readFileSync(HEADER_FILE, { encoding: ENCODING })
    const footerContent = fs.readFileSync(FOOTER_FILE, { encoding: ENCODING })
    let indexContent = fs.readFileSync(INDEX_FILE, { encoding: ENCODING }).replaceAll("{{ blog__assets }}", setAssetsFolder())

    indexContent = indexContent.replace("{{ blog__header_block }}", headerContent)
    indexContent = indexContent.replace("{{ blog__footer_block }}", footerContent)

    const sorted = [...listArticle].sort((a, b) => new Date(b.date) - new Date(a.date))

    const articlesHTML = sorted.map(article => {
        // Utilise le bon dossier d'assets
        var assetsFolder = setAssetsFolder()
        var fullAssetsFolderPath = assetsFolder + "/blog/card/" + article.image

        // Génère le code HTML de la liste des articles
        const coverHTML = article.image
            ? `<img src="${fullAssetsFolderPath}" alt="" loading="lazy" />`
            : ''
        return `<article class="article-preview">
      <a href="/${article.filename}" class="article-preview-link">
        <div class="article-cover">${coverHTML}</div>
        <div class="article-body">
          <div class="article-meta">
            <time datetime="${article.date}">${formatDateShort(article.date)}</time>
            <span class="meta-sep">·</span>
            <div class="tags">${formatTagsHTML(article.tags)}</div>
          </div>
          <h2>${article.title}</h2>
          <p>${article.description}</p>
        </div>
      </a>
    </article>`
    }).join('\n    ')

    indexContent = indexContent.replace("{{ blog__articles_block }}", articlesHTML)
    indexContent = indexContent.replace("{{ blog__article_count_block }}", sorted.length.toString().padStart(2, '0'))

    const featured = sorted[0]
    const featuredImgPath = setAssetsFolder() + "/blog/card/" + featured.image
    const featuredImgHTML = featured.image
        ? `<img class="hero-featured-img" src="${featuredImgPath}" alt="" loading="lazy">`
        : ''
    const featuredHTML = `<a href="./articles/${featured.filename}" class="hero-featured">
      ${featuredImgHTML}
      <div class="hero-featured-body">
        <h2 class="hero-featured-title">${featured.title}</h2>
        <div class="hero-featured-meta">
          <time datetime="${featured.date}">${formatDateShort(featured.date)}</time>
          <span class="meta-sep">·</span>
          <div class="tags">${formatTagsHTML(featured.tags)}</div>
        </div>
        <p class="hero-featured-desc">${featured.description}</p>
      </div>
    </a>`
    indexContent = indexContent.replace("{{ blog__hero_featured_block }}", featuredHTML)

    fs.writeFileSync(BUILD_FOLDER + "index.html", indexContent, { encoding: ENCODING })
}

const mergeFilesArticle = (listArticle) => {
    // Créer le dossier `build`
    if (!fs.existsSync(BUILD_FOLDER)){
        fs.mkdirSync(BUILD_FOLDER);
    }

    const headerContent = fs.readFileSync(HEADER_FILE, { encoding: ENCODING })
    const bottomContent = fs.readFileSync(FOOTER_FILE, { encoding: ENCODING })
    const templateContent = fs.readFileSync(ARTICLE_FILE, { encoding: ENCODING }).replaceAll("{{ blog__assets }}", setAssetsFolder())
        .replace("{{ blog__header_block }}", headerContent)
        .replace("{{ blog__footer_block }}", bottomContent)

    // Assemble les fichiers
    listArticle.forEach(article => {
        const fullFilepath = BUILD_FOLDER + article.filename

        // Utilise le bon dossier d'assets
        var assetsFolder = setAssetsFolder()
        var fullAssetsFolderPath = assetsFolder + "/blog/card/" + article.image

        const imageHTML = article.image
            ? `<img class="article-cover-image" src="${fullAssetsFolderPath}" alt="${article.title}" />`
            : ''

        const articleContent = templateContent
            .replaceAll("{{ article__date_block }}", article.date)
            .replaceAll("{{ article__date_formatted_block }}", formatDate(article.date))
            .replaceAll("{{ article__tags_block }}", article.tags)
            .replaceAll("{{ article__tags_html_block }}", formatTagsHTML(article.tags))
            .replaceAll("{{ article__title_block }}", article.title)
            .replaceAll("{{ article__description_block }}", article.description)
            .replaceAll("{{ article__image_block }}", imageHTML)
            .replaceAll("{{ article__content_block }}", article.content)

        fs.writeFileSync(fullFilepath, articleContent, { encoding: ENCODING })
    })
} 

/**
 * Génère du code HTML pour l'affichage des tags
 * 
 * @param {string} tagsStr 
 * @returns string
 */
const formatTagsHTML = (tagsStr) => {
    return tagsStr.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')
}

const formatDateShort = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const setAssetsFolder = () => {
    // Utilise le bon dossier d'assets
    var assetsFolder = ""
    if (PRODUCTION == false) assetsFolder = DEV_ASSETS_FOLDER
    else assetsFolder = PROD_ASSETS_FOLDER
    return assetsFolder
}

const generateSearchIndex = (listArticle) => {
    const index = listArticle.map(article => ({
        title: article.title,
        description: article.description,
        tags: article.tags,
        url: article.filename
    }))
    fs.writeFileSync(BUILD_FOLDER + "search.json", JSON.stringify(index), { encoding: ENCODING })
}

let listArticle = parseMarkdown()
generateIndex(listArticle)
mergeFilesArticle(listArticle)
generateSearchIndex(listArticle)