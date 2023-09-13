const vm = require("vm");
const sharp = require('sharp');

const {APP_CONTENT} = require('../constant/ConstVar.js');
const echarts = require('echarts');
const EchartsComponent = require('../component/EchartsComponent.js');

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 700;

const OUT_BYTE = "byte";
const OUT_BASE64 = "base64";

const IMG_CONTENT_TYPE = "image/png";

function output(res, out, chart) {
    const svg = chart.renderToSVGString();
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
        if (json) {
            try {
                let optionJson = JSON.parse(option);
                let chart = echarts.init(null, null, {
                    renderer: "svg",
                    ssr: true,
                    width: width,
                    height: height
                });
                chart.setOption(optionJson);
                output(res, out, chart);
                return;
            } catch (e) {
                console.debug(`try parse option to json failed：${option}`, e)
            }
        }
        EchartsComponent.render(param,
    image => {
                if (out === OUT_BASE64) {
                    res.send(image.toString('base64'));
                } else {
                    res.send(image);
                }
            },
            (msg, code) => {
                res.status(code).send(msg);
            }
        )
    }
}