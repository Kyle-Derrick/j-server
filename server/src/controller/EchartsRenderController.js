const vm = require("vm");
const sharp = require('sharp');

const {APP_CONTENT} = require('../constant/ConstVar.js');
const echarts = require('echarts');

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 700;

const OUT_BYTE = "byte";
const OUT_BASE64 = "base64";
const OUT_SVG = "svg";

const IMG_CONTENT_TYPE = "image/png";

function output(res, out, chart) {
    const svg = chart.renderToSVGString();
    if (out === OUT_SVG) {
        res.send(svg);
        return;
    }
    sharp(Buffer.from(svg))
        .png()
        .toBuffer()
        .then(result => {
            switch (out) {
                case OUT_BASE64:
                    res.setHeader('Content-Type', IMG_CONTENT_TYPE);
                    res.send(result);
                    break;
                default:
                    res.send(result.toString("Base64"));
                    break;
            }
        })
}

let script = {};
APP_CONTENT.config.script.forEach(s => script = {...script, ...require(s)})

module.exports = {
    render(req, res) {
        const param = req.body;
        const {
            width = DEFAULT_WIDTH,
            height = DEFAULT_HEIGHT,
            option,
            json = false,
            out = OUT_BYTE,
            timeout = APP_CONTENT.vmManager.evalTimeout
        } = param;
        if (!option || !option.trim()) {
            res.status(400).send("option can not be empty");
            return;
        }
        // todo:暂时去掉vm执行环境， 后续解决了vm基础功能初始化后再补回来,下同
        let chart = echarts.init(null, null, {
            renderer: "svg",
            ssr: true,
            width: width,
            height: height
        });
        if (json) {
            try {
                let optionJson = JSON.parse(option);
                chart.setOption(optionJson);
                output(res, out, chart);
                return;
            } catch (e) {
                console.debug(`try parse option to json failed：${option}`, e)
            }
        }
        try {
            // todo: vm is not security, but isolated-vm context is not complete, need have a isolated-vm solution
            vm.runInNewContext(`
        const option = ${option};
        chart.setOption(option);`, {...script, chart})
            output(res, out, chart);
        } catch (e) {
            console.error('render echarts faile', e);
            res.status(400).send(`render echarts failed ${e.message}`);
        }
    }
}