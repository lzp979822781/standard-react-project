/*
    数字校验 在rules中配置type为number
    扩展 如果为整型 可以校验个数
        如果为浮点型, 可以校验小数位数
 */
const typesArr = [
    "string",
    "number",
    "boolean",
    "method",
    "regexp",
    "integer",
    "array",
    "object",
    "enum",
    "date",
    "url",
    "hex",
    "email",
];
const tempRules = {
    required: {
        required: true,
        message: "Please fill in the relevant information",
    },
    max(num) {
        return {
            max: num,
            message: "char length beyond limit",
        };
    },
    genType(type) {
        return {
            type,
            message: `The input is not valid ${type}`,
        };
    },
    genNumRule(num) {
        return Object.assign(
            {},
            num === 0
                ? this.genType("number")
                : {
                    pattern: `^\\d{${num}}$`,
                    message: `The bits of the number should be ${num}`,
                }
        );
    },
    factoryGen(key, obj) {
        if (typesArr.includes(key)) return this.genType(key);
        return (
            (typeof this[key] === "object" && this[key]) || this[key](obj[key])
        );
    },
};

/**
 * @param {Object} obj 传入的参数为各种校验规则组成的对象
 * @param {*} num
 */
function genRules(obj) {
    const rules = [];
    // eslint-disable-next-line prefer-rest-params
    /* const tempArr = [].slice.call(arguments);
    for(const [key, value] of tempArr.entries ) {} */
    Object.keys(obj).forEach(key => {
        let rule;
        if (key === "number") {
            rule = tempRules.genNumRule(obj[key]);
        } else {
            rule = obj[key] && (tempRules.factoryGen(key, obj) || {});
        }
        rules.push(rule);
    });

    return { rules };
}

export default genRules;

// 必须包含中文英文数字
// const uniq = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\u4e00-\u9fa5])[a-zA-Z\d\u4e00-\u9fa5]{1,60}$/;
const validateNum = /^[0-9a-zA-Z\u4e00-\u9fa5]{0,60}$/;
function genNumValidate(num) {
    return new RegExp(`^[0-9a-zA-Z\\u4e00-\\u9fa5]{0,${num}}$`);
}

export { validateNum, genNumValidate };
