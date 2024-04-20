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
	eleventyConfig.addPassthroughCopy('src/assets');

	// Markdown related library
	eleventyConfig.setLibrary("md", markdownIt(options));
	eleventyConfig.addPlugin(EleventyRenderPlugin);

	// Collection
	eleventyConfig.addCollection('projects', (collection) => {
        return collection.getFilteredByGlob('src/project/*.md');
    });
	eleventyConfig.addCollection('blogs', (collection) => {
        return collection.getFilteredByGlob('src/blog/*.md');
    });

	return {
        dir: {
            input: 'src',
        },
    };
};