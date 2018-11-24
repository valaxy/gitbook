var Promise = require('../utils/promise');
var generatePage = require('./generatePage');

/**
    Output all pages using a generator

    @param {Generator} generator
    @param {Output} output
    @return {Promise<Output>}
*/
function generatePages(generator, output) {
    var pages = output.getPages();
    var logger = output.getLogger();

    // Is generator ignoring assets?
    if (!generator.onPage) {
        return Promise(output);
    }


    var book = output.getBook()
    var watchFile = book.get('watchFile')
    var filterPages = pages
    if (watchFile) {
        filterPages = pages.filter((v, k) => {
            return k == watchFile
        })
        logger.info.ln(`only generate watch file: ${watchFile}`)
    }

    return Promise.reduce(filterPages, function(out, page) {
        var file = page.getFile();

        logger.debug.ln('generate page "' + file.getPath() + '"');

        return generatePage(out, page)
        .then(function(resultPage) {
            return generator.onPage(out, resultPage);
        })
        .fail(function(err) {
            logger.error.ln('error while generating page "' + file.getPath() + '":');
            throw err;
        });
    }, output);
}

module.exports = generatePages;
