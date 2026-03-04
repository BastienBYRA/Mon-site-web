import {remark} from 'remark'
import remarkToc from 'remark-toc'
import {read} from 'to-vfile'

const file = await remark()
  .use(remarkToc)
  .process(await read('src/content/blog/2024-04-25-Comment-modifier-ou-retirer-le-header-server-de-nginx.md'))

console.error(String(file))