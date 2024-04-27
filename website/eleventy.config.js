const markdownIt = require("markdown-it");
const { EleventyRenderPlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
	let options = {
		html: true,
		breaks: true,
		linkify: true,
	};

	// File/Folder that should be copied to the build folder _site
	eleventyConfig.addPassthroughCopy('src/styles');
	eleventyConfig.addWatchTarget('src/styles');
	eleventyConfig.addPassthroughCopy('src/assets/blog');
	eleventyConfig.addPassthroughCopy('src/assets/social_network');

	// File/Folder that should be ignored by eleventy
	eleventyConfig.ignores.delete("src/portfolio");

	// Markdown related library
	eleventyConfig.setLibrary("md", markdownIt(options));
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