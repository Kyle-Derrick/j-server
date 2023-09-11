import {APP_CONTENT} from "../constant/ConstVar.js";
import { createCanvas } from "canvas";
import echarts from "echarts";

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 700;

const OUT_BYTE = "byte";
const OUT_BASE64 = "base64";
const OUT_URL = "url";

const IMG_CONTENT_TYPE = "image/png";

function output(res, out, canvas) {
    switch (out) {
        case OUT_BASE64:
            res.setHeader('Content-Type', IMG_CONTENT_TYPE);
            res.send(canvas.toBuffer(IMG_CONTENT_TYPE));
            break;
        case OUT_URL:
            res.send(canvas.toDataURL());
            break;
        default:
            res.send(canvas.toBuffer(IMG_CONTENT_TYPE).toString("Base64"));
            break;
    }
}

export default {
    render(req, res) {
        const param = req.body;
        const {
            width = DEFAULT_WIDTH,
            height = DEFAULT_HEIGHT,
            option,
            json = false,
            out = OUT_BYTE,
            timeout
        } = param;
        if (!option || !option.trim()) {
            res.status(400).send("option不能为空");
            return;
        }
        const canvas = createCanvas(width, height)
        if (json) {
            try {
                let chart = echarts.init(canvas)
                let optionJson = JSON.parse(option);
                chart.setOption(optionJson);
                output(res, out, canvas);
                return;
            } catch (e) {
                console.debug(`尝试解析为json出错：${option}`, e)
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
                output(res, out, canvas);
            },
            err => {
                console.error("执行脚本报错：", err);
                res.status(400).send(`执行代码处出错${err.message}`);
            },
            err => {
                console.error("无法创建执行脚本上下文环境：", err);
                res.status(500).send("无法创建环境");
            })
    },
}