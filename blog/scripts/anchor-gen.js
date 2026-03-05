import {remark} from 'remark'
import remarkToc from 'remark-toc'
import {read} from 'to-vfile'

// Besoin d'ajouter une section "## Contents" en haut du fichier
const file = await remark()
  .use(remarkToc)
  .process(await read('src/content/blog/2025-09-20-Le-fichier-SBOM-Software-Bill-Of-Materials-et-pourquoi-c-est-important.md'))

console.error(String(file))