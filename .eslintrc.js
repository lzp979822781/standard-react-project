module.exports = {
    parser: "babel-eslint",
    extends: ["airbnb", "prettier", "plugin:compat/recommended"],
    env: {
        browser: true,
        node: true,
        es6: true,
        mocha: true,
        jest: true,
        jasmine: true,
    },
    globals: {
        APP_TYPE: true,
        page: true,
    },
    rules: {
        "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx", ".ts", ".tsx"] }],
        "react/jsx-wrap-multilines": 0,
        "react/prop-types": 0,
        "react/forbid-prop-types": 0,
        "react/jsx-one-expression-per-line": 0,
        "react/jsx-indent": [2, 4, { checkAttributes: true }], // 配置缩进规则，当前为4个空格或者一个Tab键
        "react/jsx-indent-props": [2, 4], // 配置属性的缩进
        "react/jsx-equals-spacing": [2, "always"], // 等号两边是否留空格
        "import/extensions": "off", //取消对文件扩展名的验证
        "import/no-unresolved": [2, { ignore: ["^@/", "^umi/"] }],
        "import/no-extraneous-dependencies": [
            2,
            {
                optionalDependencies: true,
                devDependencies: ["**/tests/**.js", "/mock/**.js", "**/**.test.js"],
            },
        ],
        "react/jsx-curly-spacing": [
            2,
            {
                when: "never",
                spacing: {
                    objectLiterals: "never",
                },
            },
        ], // 花括号两边是否留空格
        "react/jsx-tag-spacing": [
            "error",
            {
                closingSlash: "never",
                beforeClosing: "never",
                afterOpening: "never",
                beforeSelfClosing: "always",
            },
        ], // 设置标签空格
        "jsx-a11y/no-noninteractive-element-interactions": 0,
        "jsx-a11y/click-events-have-key-events": 0,
        "jsx-a11y/no-static-element-interactions": 0,
        "jsx-a11y/anchor-is-valid": 0,
        "linebreak-style": 0,
        "function-paren-newline": 0,
        indent: ["error", 4],
        "space-infix-ops": "error",
        "default-case": "error",
        "object-curly-spacing": "error", // 该规则强制在对象字面量、解构赋值 和 import/export 说明符的花括号中使用一致的空格。 { key: value }与{key: value}
        "no-multi-spaces": "error", // 不添加多余空格
        "no-trailing-spaces": "error", // 不允许在行尾添加尾随空白
        "space-before-blocks": "error", // 设置块之前的间距
        "key-spacing": 2, // 设置object中键冒号值之间的空格
        "comma-spacing": 2, // 设置逗号前后的空格
    },
    settings: {
        polyfills: ["fetch", "promises", "url"],
    },
};
