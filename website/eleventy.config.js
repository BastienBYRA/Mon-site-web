const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require('markdown-it-attrs');
const { EleventyRenderPlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
	let markdownItOptions = {
		html: true,
		breaks: true,
		linkify: true,
	};
	
	let markdownItAnchorOptions = {
		level: [2] // minimum level header -- anchors will only be applied to h2 level headers and below but not h1
	}

	eleventyConfig.setBrowserSyncConfig({
		files: './_site/styles/**/*.css'
	});


	// File/Folder that should be copied to the build folder _site
	eleventyConfig.addPassthroughCopy('src/styles');
	eleventyConfig.addWatchTarget('src/styles');
	eleventyConfig.addPassthroughCopy('src/assets/blog');
	eleventyConfig.addPassthroughCopy('src/assets/social_network');
	eleventyConfig.addPassthroughCopy('src/assets/icons');

	// File/Folder that should be ignored by eleventy
	eleventyConfig.ignores.delete("src/portfolio");

	// Markdown related library
	eleventyConfig.setLibrary("md", markdownIt(markdownItOptions).use(markdownItAnchor, markdownItAnchorOptions).use(markdownItAttrs))
	eleventyConfig.addPlugin(EleventyRenderPlugin);

	// Collection
	eleventyConfig.addCollection('projects', (collection) => {
        return collection.getFilteredByGlob('src/project/*.md');
    });

	return {
        dir: {
            input: 'src',
        },
    };
};