module.exports = {
    css: {
        extract: false
    },

    configureWebpack: {
        output: {
            filename: 'js/[id].js',
            chunkFilename: 'js/[id].js'
        },
        optimization: {
            splitChunks: false
        }
    },

    productionSourceMap: false,
    filenameHashing: false,

    transpileDependencies: [
        'vuetify'
    ]
}
