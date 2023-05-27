module.exports = {
    extends: [
        'plugin:vue/recommended',
        'eslint:recommended',
        '@vue/typescript'
    ],
    rules: {
        "space-before-function-paren": ["error", "never"],
        "indent": ["error", 4],
        "vue/html-indent": ["error", 4],
        "vue/max-attributes-per-line": ["error", {
            "singleline": 8,     
            "multiline": {
                "max": 1,
                "allowFirstLine": false
            }
        }],
        "vue/singleline-html-element-content-newline": "off",
        "no-undef": "off",
        "@typescript-eslint/no-explicit-any": "off"
    }
}