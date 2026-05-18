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

// Domaine
const DOMAIN = "https://bastienbyra.fr"

// Templates
const HEADER_FILE = TEMPLATE_FOLDER + "header.html"
const FOOTER_FILE = TEMPLATE_FOLDER + "footer.html"
const INDEX_FILE = TEMPLATE_FOLDER + "index.html"
const ARTICLE_FILE = TEMPLATE_FOLDER + "article.html"
const ARTICLE_CARD_FILE = TEMPLATE_FOLDER + "article-card.html"
const HERO_FEATURED_FILE = TEMPLATE_FOLDER + "hero-featured.html"
const RELATED_ARTICLES_FILE = TEMPLATE_FOLDER + "related-articles.html"
const BACK_BUTTON_FILE = TEMPLATE_FOLDER + "back-button.html"

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

    const cardTemplate = fs.readFileSync(ARTICLE_CARD_FILE, { encoding: ENCODING })

    const articlesHTML = sorted.map(article => {
        var assetsFolder = setAssetsFolder()
        var fullAssetsFolderPath = assetsFolder + "/blog/card/" + article.image
        const coverHTML = article.image
            ? `<img src="${fullAssetsFolderPath}" alt="" loading="lazy" />`
            : ''
        return cardTemplate
            .replaceAll("{{ card__filename }}", article.filename)
            .replaceAll("{{ card__cover }}", coverHTML)
            .replaceAll("{{ card__date }}", article.date)
            .replaceAll("{{ card__date_formatted }}", formatDateShort(article.date))
            .replaceAll("{{ card__tags }}", formatTagsHTML(article.tags))
            .replaceAll("{{ card__title }}", article.title)
            .replaceAll("{{ card__description }}", article.description)
    }).join('\n    ')

    indexContent = indexContent.replace("{{ blog__articles_block }}", articlesHTML)
    indexContent = indexContent.replace("{{ blog__article_count_block }}", sorted.length.toString().padStart(2, '0'))

    const featured = sorted[0]
    const featuredTemplate = fs.readFileSync(HERO_FEATURED_FILE, { encoding: ENCODING })
    const featuredImgPath = setAssetsFolder() + "/blog/card/" + featured.image
    const featuredImgHTML = featured.image
        ? `<img class="hero-featured-img" src="${featuredImgPath}" alt="" loading="lazy">`
        : ''
    const featuredHTML = featuredTemplate
        .replaceAll("{{ featured__filename }}", featured.filename)
        .replaceAll("{{ featured__image }}", featuredImgHTML)
        .replaceAll("{{ featured__title }}", featured.title)
        .replaceAll("{{ featured__date }}", featured.date)
        .replaceAll("{{ featured__date_formatted }}", formatDateShort(featured.date))
        .replaceAll("{{ featured__tags }}", formatTagsHTML(featured.tags))
        .replaceAll("{{ featured__description }}", featured.description)
    indexContent = indexContent.replace("{{ blog__hero_featured_block }}", featuredHTML)

    fs.writeFileSync(BUILD_FOLDER + "index.html", indexContent, { encoding: ENCODING })
}

const generateRelatedArticlesHTML = (article, allArticles, cardTemplate, relatedTemplate, backBtnTemplate) => {
    const currentTags = article.tags.split(',').map(t => t.trim().toLowerCase())

    const related = allArticles
        .filter(a => a.filename !== article.filename)
        .filter(a => {
            const aTags = a.tags.split(',').map(t => t.trim().toLowerCase())
            return aTags.some(tag => currentTags.includes(tag))
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)

    if (related.length === 0) return backBtnTemplate

    const assetsFolder = setAssetsFolder()

    const cardsHTML = related.map(a => {
        const fullAssetsFolderPath = assetsFolder + "/blog/card/" + a.image
        const coverHTML = a.image ? `<img src="${fullAssetsFolderPath}" alt="" loading="lazy" />` : ''
        return cardTemplate
            .replaceAll("{{ card__filename }}", a.filename)
            .replaceAll("{{ card__cover }}", coverHTML)
            .replaceAll("{{ card__date }}", a.date)
            .replaceAll("{{ card__date_formatted }}", formatDateShort(a.date))
            .replaceAll("{{ card__tags }}", formatTagsHTML(a.tags))
            .replaceAll("{{ card__title }}", a.title)
            .replaceAll("{{ card__description }}", a.description)
    }).join('\n    ')

    return relatedTemplate.replaceAll("{{ related__cards }}", cardsHTML)
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
    const cardTemplate = fs.readFileSync(ARTICLE_CARD_FILE, { encoding: ENCODING })
    const relatedTemplate = fs.readFileSync(RELATED_ARTICLES_FILE, { encoding: ENCODING })
    const backBtnTemplate = fs.readFileSync(BACK_BUTTON_FILE, { encoding: ENCODING })

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
            .replaceAll("{{ article__schema_block }}", generateArticleSchema(article))
            .replaceAll("{{ article__related_block }}", generateRelatedArticlesHTML(article, listArticle, cardTemplate, relatedTemplate, backBtnTemplate))

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

const generateArticleSchema = (article) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.description,
        "datePublished": article.date,
        "url": `${DOMAIN}/${article.filename}`,
        "author": {
            "@type": "Person",
            "name": "Bastien BYRA",
            "url": DOMAIN
        },
        "publisher": {
            "@type": "Person",
            "name": "Bastien BYRA",
            "url": DOMAIN
        }
    }
    if (article.image) schema.image = `${DOMAIN}/assets/blog/card/${article.image}`
    if (article.tags) schema.keywords = article.tags.split(',').map(t => t.trim()).join(', ')
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
}

const generateRSS = (listArticle) => {
    const sorted = [...listArticle].sort((a, b) => new Date(b.date) - new Date(a.date))

    const items = sorted.map(article => {
        const pubDate = new Date(article.date + 'T00:00:00Z').toUTCString()
        return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${DOMAIN}/${article.filename}</link>
      <description><![CDATA[${article.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid>${DOMAIN}/${article.filename}</guid>
    </item>`
    }).join('\n')

    const content = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog de Bastien</title>
    <link>${DOMAIN}</link>
    <description>Articles techniques sur le DevOps, le web et la sécurité.</description>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${DOMAIN}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

    fs.writeFileSync(BUILD_FOLDER + "feed.xml", content, { encoding: ENCODING })
}

const generateRobotsTxt = () => {
    const content = `User-agent: *
Allow: /
Disallow: /search.json

Sitemap: ${DOMAIN}/sitemap.xml
`
    fs.writeFileSync(BUILD_FOLDER + "robots.txt", content, { encoding: ENCODING })
}

const generateSitemap = (listArticle) => {
    const sorted = [...listArticle].sort((a, b) => new Date(b.date) - new Date(a.date))

    const articleUrls = sorted.map(article => `  <url>
    <loc>${DOMAIN}/${article.filename}</loc>
    <lastmod>${article.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')

    const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
${articleUrls}
</urlset>`

    fs.writeFileSync(BUILD_FOLDER + "sitemap.xml", content, { encoding: ENCODING })
}

const generateSecurityTxt = () => {
    const wellKnownDir = BUILD_FOLDER + ".well-known/"
    if (!fs.existsSync(wellKnownDir)) {
        fs.mkdirSync(wellKnownDir)
    }
    const content = `Contact: mailto:neitsabast@gmail.com
Expires: 2027-05-18T00:00:00.000Z
Preferred-Languages: fr, en
`
    fs.writeFileSync(wellKnownDir + "security.txt", content, { encoding: ENCODING })
}

let listArticle = parseMarkdown()
generateIndex(listArticle)
mergeFilesArticle(listArticle)
generateSearchIndex(listArticle)
generateRobotsTxt()
generateSitemap(listArticle)
generateSecurityTxt()
generateRSS(listArticle)