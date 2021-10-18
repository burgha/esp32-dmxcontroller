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
        },
        devServer: {
            disableHostCheck: true
        }
    },

    productionSourceMap: false,
    filenameHashing: false,

    transpileDependencies: [
        'vuetify'
    ]
}
