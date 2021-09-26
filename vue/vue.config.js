module.exports = {
    css: {
        extract: false
    },
    configureWebpack: {
        output: {
            filename: 'js/[id].js',
            chunkFilename: 'js/[id].js'
        }
    },
    productionSourceMap: false,
    filenameHashing: false
}
