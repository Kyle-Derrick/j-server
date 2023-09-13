// const {APP_CONTENT} = require('../constant/ConstVar.js');
// const sharp = require('sharp');
// const echarts = require('echarts');
//
// const DEFAULT_WIDTH = 700;
// const DEFAULT_HEIGHT = 600;
//
// const DEFAULT_MAX_WIDTH = 3840;
// const DEFAULT_MAX_HEIGHT = 2160;
//
// const OPTION_EMPTY_ERROR = 400;
// const ENV_CREATE_ERROR = 500;
// const EVAL_RENDER_ERROR = 400;
//
// const IMG_CONTENT_TYPE = "image/png";
//
// const FUNC_VALUE = "__$func_";
//
// function render({
//                     width = DEFAULT_WIDTH,
//                     height = DEFAULT_HEIGHT,
//                     option,
//                     json = false,
//                     timeout = APP_CONTENT.config.evalTimeout
//                 }, success, failed) {
//     if (!option || !option.trim()) {
//         failed("option cant be empty", OPTION_EMPTY_ERROR);
//         return;
//     }
//     const canvas = createCanvas(width, height)
//     if (json) {
//         try {
//             let chart = echarts.init(canvas)
//             let optionJson = JSON.parse(option);
//             chart.setOption(optionJson);
//             success(canvas.toBuffer(IMG_CONTENT_TYPE))
//             return;
//         } catch (e) {
//             console.debug(`try parse json failed：${option}`, e)
//         }
//     }
//     const script = `
//         render(${option})
//                 `;
//     const canvasRef = APP_CONTENT.vmManager.reference(canvas);
//     // let chart = echarts.init(canvas);
//     // __chart__.setOption(${option});
//     APP_CONTENT.vmManager.evalWithDefaultVm({
//             script,
//             timeout
//         },
//         (context, vmInfo) => {
//             // if (!vmInfo.echarts) {
//             //     throw "echarts 模块未初始化";
//             // }
//             // vmInfo.echarts.instantiateSync(context,
//             //     (specifier, referrer) => vmInfo.vm.compileModuleSync(echarts.toString()));
//             const global = context.global;
//             // global.setSync("__echarts__", vmInfo.echarts.evaluateSync());
//             // global.setSync("__canvas__", canvasRef);
//             global.setSync("render", (option) => {
//                 // let chart = echarts.init(canvas);
//                 // chart.setOption(option);
//             });
//         },
//         () => {
//             success(canvas.toBuffer(IMG_CONTENT_TYPE))
//         },
//         err => {
//             console.error("eval script error：", err);
//             failed(`eval script error: ${err.message}`, EVAL_RENDER_ERROR);
//         },
//         err => {
//             console.error("create env context failed：", err);
//             failed("create env context failed", ENV_CREATE_ERROR);
//         })
// }