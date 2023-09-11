import {APP_CONTENT} from "../constant/ConstVar.js";
import sharp from "sharp";
import echarts from "echarts";

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 600;

const DEFAULT_MAX_WIDTH = 3840;
const DEFAULT_MAX_HEIGHT = 2160;

const OPTION_EMPTY_ERROR = 400;
const ENV_CREATE_ERROR = 500;
const EVAL_RENDER_ERROR = 400;

const IMG_CONTENT_TYPE = "image/png";

const FUNC_VALUE = "__$func_";

function handleOptionInVm(option) {
    let no = 1;
    function handleOption(obj, funcPath, func, contentSet) {
        let hasFunc = false;
        for (const key in obj) {
            const value = obj[key];
            if (contentSet.has(value)) {
                obj[key] = null;
                continue;
            }
            let valueType = typeof value;
            switch (valueType) {
                case "boolean":
                case "number":
                case "string":
                    break;
                case "object":
                    const next = {};
                    if (handleOption(value, next, func, contentSet.add(value))) {
                        funcPath[key] = next;
                        hasFunc = true;
                    }
                    break;
                case "function":
                    const funcName = `${FUNC_VALUE}${no++}`;
                    funcPath[key] = funcName;
                    obj[key] = funcName;
                    func[funcName] = value;
                    hasFunc = true;
                    break;
                default:
                    //symbol bigint
                    console.warn(`the echarts option include ${valueType}`);
                case "undefined":
                    obj[key] = null;
                    break;
            }
        }
        return hasFunc;
    }
    const func = {};
    const funcPath = {};
    handleOption(option, funcPath, func, new Set());
    return {
        option,
        funcPath,
        func
    }
}

function handleOption({option, funcPath}, context) {
    if (!funcPath) {
        return option;
    }
    function handleOption(obj, funcPath) {
        for (const key in funcPath) {
            const value = obj[key];
            if (typeof value === "string") {
                obj[key] = () => {
                    context.evalClosureSync(`${value}.apply($0, $1)`, [option, arguments]);
                }
            } else {
                handleOption(obj[key], value);
            }
        }
        return hasFunc;
    }
    func.forEach((k, v) => {
        const keys = k.split('.');
        let opt = option;
        for (let i = 0; i < keys.length - 1; i++) {
            let key = keys[i];
            opt = opt[key];
        }
        opt[keys[keys.length - 1]] = () => {

        }
    })
    function handleOption(obj, func, path) {
        for (let key in obj) {
            const value = obj[key];
            switch (typeof value) {
                case "boolean":
                case "number":
                case "string":
                    break;
                case "object":
                    handleOption(value, func, path ? `${path}.${key}` : key);
                    break;
                case "function":
                    func[path ? `${path}.${key}` : key] = value;
                    obj[key] = FUNC_VALUE;
                    break;
                default:
                    //symbol bigint
                    console.warn(`the echarts option include ${typeof value}`);
                case "undefined":
                    obj[key] = null;
                    break;
            }
        }
    }
    const func = new Map();
    handleOption(option, func);
    return {
        option,
        func
    }
}

function render({
                    width = DEFAULT_WIDTH,
                    height = DEFAULT_HEIGHT,
                    option,
                    json = false,
                    timeout = APP_CONTENT.config.evalTimeout
                }, success, failed) {
    if (!option || !option.trim()) {
        failed("option cant be empty", OPTION_EMPTY_ERROR);
        return;
    }
    const canvas = createCanvas(width, height)
    if (json) {
        try {
            let chart = echarts.init(canvas)
            let optionJson = JSON.parse(option);
            chart.setOption(optionJson);
            success(canvas.toBuffer(IMG_CONTENT_TYPE))
            return;
        } catch (e) {
            console.debug(`try parse json failed：${option}`, e)
        }
    }
    const script = `
        render(${option})
                `;
    const canvasRef = APP_CONTENT.vmManager.reference(canvas);
    // let chart = echarts.init(canvas);
    // __chart__.setOption(${option});
    APP_CONTENT.vmManager.evalWithDefaultVm({
            script,
            timeout
        },
        (context, vmInfo) => {
            // if (!vmInfo.echarts) {
            //     throw "echarts 模块未初始化";
            // }
            // vmInfo.echarts.instantiateSync(context,
            //     (specifier, referrer) => vmInfo.vm.compileModuleSync(echarts.toString()));
            const global = context.global;
            // global.setSync("__echarts__", vmInfo.echarts.evaluateSync());
            // global.setSync("__canvas__", canvasRef);
            global.setSync("render", (option) => {
                // let chart = echarts.init(canvas);
                // chart.setOption(option);
            });
        },
        () => {
            success(canvas.toBuffer(IMG_CONTENT_TYPE))
        },
        err => {
            console.error("eval script error：", err);
            failed(`eval script error: ${err.message}`, EVAL_RENDER_ERROR);
        },
        err => {
            console.error("create env context failed：", err);
            failed("create env context failed", ENV_CREATE_ERROR);
        })
}